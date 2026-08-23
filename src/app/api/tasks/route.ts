import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse, canDelete, canUpdateTaskProgress } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { title, description, assignedUserId, projectId, status, priority, dueDate, estimatedEffort, notes } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await prisma.portalTask.create({
      data: {
        title,
        description: description || '',
        assignedUserId: assignedUserId || null,
        projectId: projectId || null,
        status: status || 'not-started',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedEffort: estimatedEffort || '',
        notes: notes || '',
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor', 'manager', 'reviewer', 'developer', 'intern']);
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const assignedUserId = searchParams.get('assignedUserId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    // Role-based scoping
    if (['intern', 'contractor'].includes(user.role)) {
      where.assignedUserId = user.id;
    } else {
      if (projectId) where.projectId = projectId;
      if (assignedUserId) where.assignedUserId = assignedUserId;
      if (status) where.status = status;
    }

    // Text search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.portalTask.findMany({
      where,
      include: {
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
        project: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true, email: true } },
      },
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
