import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FIXED_CLAUSES, ADDED_CLAUSES } from '@/data/clauses';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const contracts = await prisma.assembledContract.findMany({
      include: { contractor: true, master: true, sow: true, signatures: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(contracts);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const { contractorId, masterId, sowId, addendumIds } = await req.json();
    const contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
    if (!contractor) return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });

    let master = await prisma.masterAgreement.findFirst({ where: { isActive: true } });
    if (!master) {
      let agency = await prisma.agency.findFirst();
      if (!agency) agency = await prisma.agency.create({ data: { name: 'WhoIsDésir® Media Agency' } });
      master = await prisma.masterAgreement.create({
        data: { agencyId: agency.id, clauses: JSON.stringify([...FIXED_CLAUSES, ...ADDED_CLAUSES]) },
      });
    }

    const contract = await prisma.assembledContract.create({
      data: {
        contractorId,
        masterId: masterId || master.id,
        sowId: sowId || null,
        addendumIds: JSON.stringify(addendumIds || []),
      },
    });

    await logAudit(user, { action: 'contract.create', method: 'POST', path: '/api/contracts', entity: 'AssembledContract', entityId: contract.id, metadata: { contractorId } });

    return NextResponse.json(contract, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
