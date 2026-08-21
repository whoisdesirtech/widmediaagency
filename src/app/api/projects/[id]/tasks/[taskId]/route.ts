import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, requireContractor, isNextResponse } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function GET(req: Request, { params }: { params: { id: string; taskId: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const task = await prisma.projectTask.findFirst({
      where: { id: params.taskId, projectId: params.id },
      include: { reviews: { orderBy: { createdAt: 'desc' } } },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string; taskId: string } }) {
  try {
    const sessionUser = await requireAdminOrStaff();
    const contractorUser = isNextResponse(sessionUser) ? null : null;
    let user = sessionUser;

    if (isNextResponse(user)) {
      const cUser = await requireContractor();
      if (isNextResponse(cUser)) return cUser;
      user = cUser;
    }

    const body = await req.json();
    const { title, description, status, priority, contractorId, dueDate, sortOrder } = body;

    const existing = await prisma.projectTask.findFirst({
      where: { id: params.taskId, projectId: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (user.role === 'contractor') {
      if (existing.contractorId !== user.contractorId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const allowedStatuses = ['in_progress', 'in_review', 'blocked'];
      if (status && !allowedStatuses.includes(status)) {
        return NextResponse.json({ error: 'Contractors can only set status to in_progress, in_review, or blocked' }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'completed') updateData.completedAt = new Date();
      if (existing.status === 'completed' && status !== 'completed') updateData.completedAt = null;
    }
    if (priority !== undefined) updateData.priority = priority;
    if (contractorId !== undefined) updateData.contractorId = contractorId || null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const updated = await prisma.projectTask.update({
      where: { id: params.taskId },
      data: updateData,
    });

    if (status === 'completed' && existing.status !== 'completed') {
      const project = await prisma.project.findUnique({ where: { id: params.id } });
      const totalTasks = await prisma.projectTask.count({ where: { projectId: params.id } });
      const completedTasks = await prisma.projectTask.count({ where: { projectId: params.id, status: 'completed' } });
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      await prisma.project.update({
        where: { id: params.id },
        data: { progress },
      });

      if (progress === 100 && project) {
        await prisma.project.update({
          where: { id: params.id },
          data: { status: 'complete' },
        });
      }
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string; taskId: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const existing = await prisma.projectTask.findFirst({
      where: { id: params.taskId, projectId: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.projectTask.delete({ where: { id: params.taskId } });

    const totalTasks = await prisma.projectTask.count({ where: { projectId: params.id } });
    const completedTasks = await prisma.projectTask.count({ where: { projectId: params.id, status: 'completed' } });
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await prisma.project.update({
      where: { id: params.id },
      data: { progress },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
