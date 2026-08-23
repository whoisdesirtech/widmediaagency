import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeDriveId, driveFolderUrl } from '@/lib/drive';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const data: any = { ...body };
    if ('driveFolderId' in data || 'driveFolderUrl' in data) {
      const cleanId = normalizeDriveId(data.driveFolderId || data.driveFolderUrl);
      if (cleanId !== null) data.driveFolderId = cleanId;
      data.driveFolderUrl = data.driveFolderUrl ? (driveFolderUrl(data.driveFolderUrl) || data.driveFolderUrl.trim()) : (cleanId ? driveFolderUrl(cleanId) : null);
    }
    const folder = await prisma.fileFolder.update({
      where: { id: params.id },
      data,
    });
    await logAudit(user, { action: 'FileFolder.update', method: 'PATCH', path: `/api/folders/${params.id}`, entity: 'FileFolder', entityId: params.id, metadata: { fields: Object.keys(body) } });
    return NextResponse.json(folder);
  } catch {
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    await prisma.fileFolder.delete({ where: { id: params.id } });
    await logAudit(user, { action: 'folder.delete', method: 'DELETE', path: `/api/folders/${params.id}`, entity: 'FileFolder', entityId: params.id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
