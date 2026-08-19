import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { clientId, projectId, contractorId, sowId, name, type, status, dueDate, description, sortOrder } = body;

    if (!clientId || !name) {
      return NextResponse.json({ error: 'Client ID and name are required' }, { status: 400 });
    }

    const deliverable = await prisma.deliverable.create({
      data: {
        clientId,
        projectId: projectId || null,
        contractorId: contractorId || null,
        sowId: sowId || null,
        name,
        type: type || 'document',
        status: status || 'pending',
        dueDate: dueDate || null,
        description: description || '',
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(deliverable, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create deliverable' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(['admin', 'staff', 'client', 'contractor']);
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const contractorId = searchParams.get('contractorId');

    const where: Prisma.DeliverableWhereInput = {};
    if (user.role === 'client' && user.clientId) {
      where.clientId = user.clientId;
    } else if (user.role === 'contractor' && user.contractorId) {
      where.contractorId = user.contractorId;
    } else {
      if (clientId) where.clientId = clientId;
      if (contractorId) where.contractorId = contractorId;
    }

    const deliverables = await prisma.deliverable.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(deliverables);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch deliverables' }, { status: 500 });
  }
}
