import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, projectId, name, type, status, dueDate, description, sortOrder } = body;

    if (!clientId || !name) {
      return NextResponse.json({ error: 'Client ID and name are required' }, { status: 400 });
    }

    const deliverable = await prisma.deliverable.create({
      data: {
        clientId,
        projectId: projectId || null,
        name,
        type: type || 'document',
        status: status || 'pending',
        dueDate: dueDate || null,
        description: description || '',
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(deliverable, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create deliverable' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const deliverables = await prisma.deliverable.findMany({
      where: { clientId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(deliverables);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deliverables' }, { status: 500 });
  }
}
