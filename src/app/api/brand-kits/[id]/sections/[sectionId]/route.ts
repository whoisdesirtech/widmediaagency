import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string; sectionId: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { title, content, isCompleted, sortOrder } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = JSON.stringify(content);
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const section = await prisma.brandKitSection.update({
      where: { id: params.sectionId },
      data: updateData,
    });

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string; sectionId: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    await prisma.brandKitSection.delete({ where: { id: params.sectionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}
