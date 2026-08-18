import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const { id } = await params;
    const body = await req.json();

    if (user.role === 'contractor') {
      const existing = await prisma.deliverable.findUnique({ where: { id } });
      if (!existing || existing.contractorId !== user.contractorId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      const allowedStatuses = ['in-progress', 'pending-approval'];
      if (!body.status || !allowedStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Contractors can only submit deliverables for approval' }, { status: 400 });
      }
      const deliverable = await prisma.deliverable.update({
        where: { id },
        data: { status: body.status },
      });
      return NextResponse.json(deliverable);
    }

    const data: any = { ...body };
    if (body.status === 'approved' && !body.approvedAt) {
      data.approvedAt = new Date();
    }
    const deliverable = await prisma.deliverable.update({
      where: { id },
      data,
    });
    return NextResponse.json(deliverable);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update deliverable' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    await prisma.deliverable.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete deliverable' }, { status: 500 });
  }
}
