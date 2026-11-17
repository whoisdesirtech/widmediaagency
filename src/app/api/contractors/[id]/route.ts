import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeDriveId, driveFolderUrl } from '@/lib/drive';
import { requireAuth, isNextResponse, forbiddenResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { buildContractorPatch, isSameAgency } from '@/lib/contractor-patch';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;
    if (user.role === 'contractor' && user.contractorId !== params.id) return forbiddenResponse();

    const contractor = await prisma.contractor.findUnique({
      where: { id: params.id },
      include: { sows: true, assembledContracts: true },
    });
    if (!contractor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Cross-agency IDs must behave exactly like missing records.
    if (!isSameAgency(user.agencyId, contractor.agencyId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(contractor);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch contractor' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff']);
    if (isNextResponse(user)) return user;

    const existing = await prisma.contractor.findUnique({
      where: { id: params.id },
      select: { id: true, agencyId: true },
    });
    if (!existing || !isSameAgency(user.agencyId, existing.agencyId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const parsed = buildContractorPatch(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error, fields: parsed.fields }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...parsed.data };

    if (body && typeof body === 'object' && ('googleDriveFolderId' in body || 'googleDriveFolderUrl' in body)) {
      const bodyObj = body as Record<string, unknown>;
      const rawDriveId = typeof bodyObj.googleDriveFolderId === 'string' ? bodyObj.googleDriveFolderId : null;
      const rawDriveUrl = typeof bodyObj.googleDriveFolderUrl === 'string' ? bodyObj.googleDriveFolderUrl : null;

      const cleanId = normalizeDriveId(rawDriveId || rawDriveUrl);
      if (cleanId !== null) data.googleDriveFolderId = cleanId;
      data.googleDriveFolderUrl = rawDriveUrl
        ? driveFolderUrl(rawDriveUrl) || rawDriveUrl.trim()
        : cleanId
          ? driveFolderUrl(cleanId)
          : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    const contractor = await prisma.contractor.update({
      where: { id: params.id },
      data,
    });

    await logAudit(user, {
      action: 'contractor.update',
      method: 'PATCH',
      path: `/api/contractors/${params.id}`,
      entity: 'Contractor',
      entityId: params.id,
      metadata: { changedKeys: Object.keys(data) },
    });

    return NextResponse.json(contractor);
  } catch {
    return NextResponse.json({ error: 'Failed to update contractor' }, { status: 500 });
  }
}
