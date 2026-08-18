import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse, canApprove, canPublish } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'manager', 'reviewer']);
    if (isNextResponse(user)) return user;

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        reviewer: { select: { id: true, name: true, email: true } },
        brandKit: {
          include: {
            influencer: { select: { id: true, name: true, platform: true, username: true } },
            sections: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    if (!canApprove(user)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions to approve reviews' }, { status: 403 });
    }

    const body = await req.json();
    const { status, comments, score } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (comments !== undefined) updateData.comments = JSON.stringify(comments);
    if (score !== undefined) updateData.score = score;

    const review = await prisma.review.update({
      where: { id: params.id },
      data: updateData,
      include: {
        reviewer: { select: { id: true, name: true, email: true } },
        brandKit: {
          select: { id: true, name: true, status: true, completionPercent: true },
        },
      },
    });

    // Only admin/staff/manager can approve (not just reviewer)
    if (status === 'approved' && review.brandKit) {
      if (!canPublish(user)) {
        return NextResponse.json({ error: 'Forbidden: only managers+ can approve brand kits' }, { status: 403 });
      }
      await prisma.brandKit.update({
        where: { id: review.brandKitId },
        data: { status: 'approved', reviewerId: user.id },
      });
    }

    if (status === 'needs-revision' && review.brandKit) {
      await prisma.brandKit.update({
        where: { id: review.brandKitId },
        data: { status: 'in-review' },
      });
    }

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    await prisma.review.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
