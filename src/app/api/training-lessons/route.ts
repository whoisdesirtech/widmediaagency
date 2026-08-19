import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const lessons = await prisma.trainingLesson.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, title: true, description: true, targetRole: true, steps: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(lessons);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch training lessons' }, { status: 500 });
  }
}
