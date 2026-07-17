import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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
      return NextResponse.json({ id: updated.id, version: updated.version });
    }

    const master = await prisma.masterAgreement.create({
      data: { agencyId: agency.id, clauses: JSON.stringify(clauses) },
    });
    return NextResponse.json({ id: master.id, version: master.version }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { clauses } = await req.json();
    const existing = await prisma.masterAgreement.findFirst({ where: { isActive: true } });
    if (!existing) return NextResponse.json({ error: 'No active agreement' }, { status: 404 });

    const updated = await prisma.masterAgreement.update({
      where: { id: existing.id },
      data: { clauses: JSON.stringify(clauses), version: existing.version + 1 },
    });
    return NextResponse.json({ id: updated.id, version: updated.version });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
