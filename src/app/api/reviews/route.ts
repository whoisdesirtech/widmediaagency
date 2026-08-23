import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { brandKitId, status, comments, score } = body;

    if (!brandKitId) {
      return NextResponse.json({ error: 'Brand Kit ID is required' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        brandKitId,
        reviewerId: user.id,
        status: status || 'pending',
        comments: JSON.stringify(comments || []),
        score: score || null,
      },
      include: {
        reviewer: { select: { id: true, name: true, email: true } },
        brandKit: { select: { id: true, name: true, status: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(['admin', 'staff']);
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const brandKitId = searchParams.get('brandKitId');
    const status = searchParams.get('status');

    const where: any = {};
    if (brandKitId) where.brandKitId = brandKitId;
    if (status) where.status = status;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: { select: { id: true, name: true, email: true } },
        brandKit: {
          select: {
            id: true,
            name: true,
            status: true,
            completionPercent: true,
            influencer: { select: { id: true, name: true, platform: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
