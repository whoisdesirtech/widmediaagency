import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { clientId, contractorId, name, description, icon, status, progress, timeline, deliverables, images, sortOrder } = body;

    if (!clientId || !name) {
      return NextResponse.json({ error: 'Client ID and name are required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        clientId,
        contractorId: contractorId || null,
        name,
        description: description || '',
        icon: icon || '📁',
        status: status || 'planning',
        progress: progress || 0,
        timeline: JSON.stringify(timeline || []),
        deliverables: deliverables || 0,
        images: JSON.stringify(images || []),
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(['admin', 'staff', 'client', 'contractor']);
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const contractorId = searchParams.get('contractorId');

    const where: any = {};
    if (user.role === 'client') {
      where.clientId = user.clientId;
    } else if (user.role === 'contractor') {
      where.contractorId = user.contractorId;
    } else {
      if (clientId) where.clientId = clientId;
      if (contractorId) where.contractorId = contractorId;
    }

    const projects = await prisma.project.findMany({
      where,
      include: { client: { select: { id: true, name: true, email: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
