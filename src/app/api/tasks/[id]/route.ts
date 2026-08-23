import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse, canDelete, canUpdateTaskProgress } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor', 'manager', 'reviewer', 'developer', 'intern']);
    if (isNextResponse(user)) return user;

    const task = await prisma.portalTask.findUnique({
      where: { id: params.id },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
        project: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true, email: true } },
        portfolioItem: { select: { id: true, title: true, status: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Interns/contractors can only see their own tasks
    if (['intern', 'contractor'].includes(user.role) && task.assignedUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'manager', 'reviewer', 'developer', 'intern']);
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { title, description, assignedUserId, projectId, status, priority, dueDate, estimatedEffort, actualEffort, deliverable, notes, reviewStatus, reviewerId, completionPercent } = body;

    // Interns can only update status, progress, actualEffort, deliverable, notes
    const isIntern = user.role === 'intern';
    const isDeveloper = user.role === 'developer';

    const updateData: any = {};
    if (!isIntern) {
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (assignedUserId !== undefined) updateData.assignedUserId = assignedUserId || null;
      if (projectId !== undefined) updateData.projectId = projectId || null;
      if (priority !== undefined) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (estimatedEffort !== undefined) updateData.estimatedEffort = estimatedEffort;
    }

    // Status updates allowed for all roles
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedDate = new Date();
      }
    }

    // Progress updates allowed for interns, developers, reviewers
    if (canUpdateTaskProgress(user)) {
      if (actualEffort !== undefined) updateData.actualEffort = actualEffort;
      if (deliverable !== undefined) updateData.deliverable = deliverable;
      if (notes !== undefined) updateData.notes = notes;
      if (completionPercent !== undefined) updateData.completionPercent = completionPercent;
    }

    // Review fields only for reviewer+
    if (['admin', 'staff', 'manager', 'reviewer'].includes(user.role)) {
      if (reviewStatus !== undefined) updateData.reviewStatus = reviewStatus;
      if (reviewerId !== undefined) updateData.reviewerId = reviewerId || null;
    }

    const task = await prisma.portalTask.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
        project: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    if (!canDelete(user)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    await prisma.portalTask.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
