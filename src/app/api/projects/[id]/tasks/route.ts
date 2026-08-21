import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const tasks = await prisma.projectTask.findMany({
      where: { projectId: params.id },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        reviews: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { title, description, contractorId, priority, dueDate, sortOrder } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const task = await prisma.projectTask.create({
      data: {
        projectId: params.id,
        title: title.trim(),
        description: description?.trim() || '',
        contractorId: contractorId || null,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        sortOrder: sortOrder ?? 0,
      },
    });

    if (contractorId) {
      const contractorUser = await prisma.user.findFirst({ where: { contractorId } });
      if (contractorUser) {
        await createNotification({
          userId: contractorUser.id,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned a new task "${title}" in project "${project.name}".`,
          link: '/contractor/tasks',
        });
      }
    }

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
