import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id: params.id },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
        tasks: {
          include: {
            assignedUser: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!portfolioItem) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
    }

    return NextResponse.json(portfolioItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch portfolio item' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { title, description, category, assignedUserId, contributors, status, priority, startDate, completionDate, technologies, skillsDemonstrated, deliverables, githubRepo, liveUrl, screenshots, documentation, relatedTaskIds, relatedAuditIds, relatedBrandKitIds, completionPercent, notes, isDemo } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (assignedUserId !== undefined) updateData.assignedUserId = assignedUserId || null;
    if (contributors !== undefined) updateData.contributors = JSON.stringify(contributors);
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (completionDate !== undefined) updateData.completionDate = completionDate ? new Date(completionDate) : null;
    if (technologies !== undefined) updateData.technologies = JSON.stringify(technologies);
    if (skillsDemonstrated !== undefined) updateData.skillsDemonstrated = JSON.stringify(skillsDemonstrated);
    if (deliverables !== undefined) updateData.deliverables = JSON.stringify(deliverables);
    if (githubRepo !== undefined) updateData.githubRepo = githubRepo;
    if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
    if (screenshots !== undefined) updateData.screenshots = JSON.stringify(screenshots);
    if (documentation !== undefined) updateData.documentation = documentation;
    if (relatedTaskIds !== undefined) updateData.relatedTaskIds = JSON.stringify(relatedTaskIds);
    if (relatedAuditIds !== undefined) updateData.relatedAuditIds = JSON.stringify(relatedAuditIds);
    if (relatedBrandKitIds !== undefined) updateData.relatedBrandKitIds = JSON.stringify(relatedBrandKitIds);
    if (completionPercent !== undefined) updateData.completionPercent = completionPercent;
    if (notes !== undefined) updateData.notes = notes;
    if (isDemo !== undefined) updateData.isDemo = isDemo;

    const portfolioItem = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
        tasks: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    return NextResponse.json(portfolioItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    await prisma.portfolioItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
  }
}
