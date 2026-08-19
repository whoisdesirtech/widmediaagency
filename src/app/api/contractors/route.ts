import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { name, businessName, role, state, country } = body;

    if (!name || !businessName || !role || !state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let agency = await prisma.agency.findFirst();
    if (!agency) {
      agency = await prisma.agency.create({
        data: { name: 'WhoIsDésir® Media Agency' },
      });
    }

    const contractor = await prisma.contractor.create({
      data: {
        name,
        businessName,
        role,
        state,
        country: country || 'United States',
        agencyId: agency.id,
      },
    });

    await logAudit(user, { action: 'contractor.create', method: 'POST', path: '/api/contractors', entity: 'Contractor', entityId: contractor.id, metadata: { role } });

    return NextResponse.json(contractor, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create contractor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const contractors = await prisma.contractor.findMany({
      include: { sows: true, _count: { select: { sows: true, assembledContracts: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(contractors);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch contractors' }, { status: 500 });
  }
}
