import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const contractorId = searchParams.get('contractorId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (contractorId) where.contractorId = contractorId;

    const submissions = await prisma.wordPressWorkSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contractor: { select: { id: true, name: true, businessName: true, role: true } },
      },
    });

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error('[admin/wordpress-work] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load work submissions' }, { status: 500 });
  }
}
