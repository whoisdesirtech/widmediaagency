import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isNextResponse, forbiddenResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

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
    return NextResponse.json(contractor);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contractor' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff']);
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const contractor = await prisma.contractor.update({
      where: { id: params.id },
      data: body,
    });
    await logAudit(user, { action: 'contractor.update', method: 'PATCH', path: `/api/contractors/${params.id}`, entity: 'Contractor', entityId: params.id, metadata: { changedKeys: Object.keys(body) } });
    return NextResponse.json(contractor);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contractor' }, { status: 500 });
  }
}
