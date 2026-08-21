import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireContractor, isNextResponse } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireContractor();
    if (isNextResponse(user)) return user;

    const tasks = await prisma.projectTask.findMany({
      where: { contractorId: user.contractorId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        reviews: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const projectIds = [...new Set(tasks.map(t => t.projectId))];
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true, status: true, clientId: true },
    });

    const projectMap = new Map(projects.map(p => [p.id, p]));

    const enriched = tasks.map(t => ({
      ...t,
      project: projectMap.get(t.projectId) || null,
    }));

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
