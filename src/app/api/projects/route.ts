import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, name, description, icon, status, progress, timeline, deliverables, sortOrder } = body;

    if (!clientId || !name) {
      return NextResponse.json({ error: 'Client ID and name are required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        clientId,
        name,
        description: description || '',
        icon: icon || '📁',
        status: status || 'planning',
        progress: progress || 0,
        timeline: JSON.stringify(timeline || []),
        deliverables: deliverables || 0,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    const where: any = {};
    if (clientId) where.clientId = clientId;

    const projects = await prisma.project.findMany({
      where,
      include: { client: { select: { name: true, email: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
