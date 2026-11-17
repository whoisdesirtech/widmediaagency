import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { WORDPRESS_QUIZ_SLUG } from '@/lib/wordpress-quiz';

export async function GET(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const contractorId = searchParams.get('contractorId');

    // Only the WordPress certification quiz belongs on this screen.
    const where: Record<string, unknown> = { quiz: { slug: WORDPRESS_QUIZ_SLUG } };
    if (status) where.status = status;
    if (contractorId) where.contractorId = contractorId;

    const attempts = await prisma.quizAttempt.findMany({
      where,
      orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        quiz: { select: { id: true, slug: true, title: true, passingScore: true } },
        contractor: {
          select: {
            id: true,
            name: true,
            businessName: true,
            role: true,
            payTier: { select: { tier: true, standardRate: true, certifiedRate: true } },
          },
        },
      },
    });

    return NextResponse.json({ attempts });
  } catch (err) {
    console.error('[admin/wordpress-quiz] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load quiz attempts' }, { status: 500 });
  }
}
