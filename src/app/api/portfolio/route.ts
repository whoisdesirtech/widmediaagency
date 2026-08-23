import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { title, description, category, assignedUserId, contributors, status, priority, startDate, technologies, skillsDemonstrated, deliverables, githubRepo, liveUrl, screenshots, documentation, notes, isDemo } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        title,
        description: description || '',
        category: category || 'web-development',
        assignedUserId: assignedUserId || null,
        contributors: JSON.stringify(contributors || []),
        status: status || 'planned',
        priority: priority || 'medium',
        startDate: startDate ? new Date(startDate) : null,
        technologies: JSON.stringify(technologies || []),
        skillsDemonstrated: JSON.stringify(skillsDemonstrated || []),
        deliverables: JSON.stringify(deliverables || []),
        githubRepo: githubRepo || '',
        liveUrl: liveUrl || '',
        screenshots: JSON.stringify(screenshots || []),
        documentation: documentation || '',
        notes: notes || '',
        isDemo: isDemo || false,
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return NextResponse.json(portfolioItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const assignedUserId = searchParams.get('assignedUserId');

    const where: any = {};
    if (user.role === 'contractor') {
      where.assignedUserId = user.id;
    } else {
      if (category) where.category = category;
      if (status) where.status = status;
      if (assignedUserId) where.assignedUserId = assignedUserId;
    }

    const portfolioItems = await prisma.portfolioItem.findMany({
      where,
      include: {
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
        tasks: {
          select: { id: true, title: true, status: true },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(portfolioItems);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch portfolio items' }, { status: 500 });
  }
}
