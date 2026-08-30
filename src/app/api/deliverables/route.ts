import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { clientId, projectId, contractorId, sowId, name, type, status, dueDate, description, sortOrder, taskId } = body;

    if (!clientId || !name) {
      return NextResponse.json({ error: 'Client ID and name are required' }, { status: 400 });
    }

    const assigned = !!contractorId;
    const deliverable = await prisma.deliverable.create({
      data: {
        clientId,
        projectId: projectId || null,
        contractorId: contractorId || null,
        sowId: sowId || null,
        taskId: taskId || null,
        name,
        type: type || 'document',
        status: assigned ? 'assigned' : 'draft',
        dueDate: dueDate || null,
        description: description || '',
        sortOrder: sortOrder || 0,
        ...(assigned ? { assignedAt: new Date() } : {}),
      },
    });

    if (assigned) {
      const contractorUser = await prisma.user.findFirst({ where: { contractorId } });
      if (contractorUser) {
        await createNotification({ userId: contractorUser.id, type: 'deliverable_status', title: 'New Deliverable Assignment', message: `"${name}" has been assigned to you. Please accept or decline.`, link: '/contractor/deliverables' });
      }
    }

    await logAudit(user, { action: assigned ? 'deliverable.assign' : 'deliverable.create', method: 'POST', path: '/api/deliverables', entity: 'Deliverable', entityId: deliverable.id, metadata: { name, clientId, contractorId: contractorId || null, toStatus: deliverable.status } });
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
      if (user.agencyId) {
        where.client = { agencyId: user.agencyId };
      }
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
