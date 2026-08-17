import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const user = await requireAdmin();
    if (isNextResponse(user)) return user;

    const master = await prisma.masterAgreement.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });
    if (!master) return NextResponse.json({});
    return NextResponse.json({
      id: master.id,
      version: master.version,
      effectiveDate: master.effectiveDate,
      clauses: JSON.parse(master.clauses),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    if (isNextResponse(user)) return user;

    const { clauses } = await req.json();
    let agency = await prisma.agency.findFirst();
    if (!agency) {
      agency = await prisma.agency.create({ data: { name: 'WhoIsDésir® Media Agency' } });
    }

    const existing = await prisma.masterAgreement.findFirst({ where: { isActive: true } });
    if (existing) {
      const updated = await prisma.masterAgreement.update({
        where: { id: existing.id },
        data: { clauses: JSON.stringify(clauses), version: existing.version + 1 },
      });
      await logAudit(user, { action: 'master-agreement.update', method: 'POST', path: '/api/master-agreements', entity: 'MasterAgreement', entityId: updated.id, metadata: { version: updated.version } });
      return NextResponse.json({ id: updated.id, version: updated.version });
    }

    const master = await prisma.masterAgreement.create({
      data: { agencyId: agency.id, clauses: JSON.stringify(clauses) },
    });
    await logAudit(user, { action: 'master-agreement.create', method: 'POST', path: '/api/master-agreements', entity: 'MasterAgreement', entityId: master.id, metadata: { version: master.version } });
    return NextResponse.json({ id: master.id, version: master.version }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAdmin();
    if (isNextResponse(user)) return user;

    const { clauses } = await req.json();
    const existing = await prisma.masterAgreement.findFirst({ where: { isActive: true } });
    if (!existing) return NextResponse.json({ error: 'No active agreement' }, { status: 404 });

    const updated = await prisma.masterAgreement.update({
      where: { id: existing.id },
      data: { clauses: JSON.stringify(clauses), version: existing.version + 1 },
    });
    await logAudit(user, { action: 'master-agreement.update', method: 'PUT', path: '/api/master-agreements', entity: 'MasterAgreement', entityId: updated.id, metadata: { version: updated.version } });
    return NextResponse.json({ id: updated.id, version: updated.version });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
