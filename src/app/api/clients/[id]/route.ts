import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeDriveId, driveFolderUrl } from '@/lib/drive';
import { requireAuth, requireAdminOrStaff, isNextResponse, forbiddenResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'client']);
    if (isNextResponse(user)) return user;
    if (user.role === 'client' && user.clientId !== params.id) return forbiddenResponse();

    const client = await prisma.client.findUnique({
      where: { id: params.id },
    });
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const data: any = { ...body };
    if ('googleDriveFolderId' in data || 'googleDriveFolderUrl' in data) {
      const cleanId = normalizeDriveId(data.googleDriveFolderId || data.googleDriveFolderUrl);
      if (cleanId !== null) data.googleDriveFolderId = cleanId;
      data.googleDriveFolderUrl = data.googleDriveFolderUrl ? (driveFolderUrl(data.googleDriveFolderUrl) || data.googleDriveFolderUrl.trim()) : (cleanId ? driveFolderUrl(cleanId) : null);
    }
    const client = await prisma.client.update({
      where: { id: params.id },
      data,
    });
    await logAudit(user, { action: 'client.update', method: 'PATCH', path: `/api/clients/${params.id}`, entity: 'Client', entityId: params.id, metadata: { changedKeys: Object.keys(data) } });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}
