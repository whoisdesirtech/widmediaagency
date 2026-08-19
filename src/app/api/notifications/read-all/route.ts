import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isNextResponse } from '@/lib/auth';

export async function POST() {
  try {
    const user = await requireAuth();
    if (isNextResponse(user)) return user;

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}
