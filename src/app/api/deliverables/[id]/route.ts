import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor', 'client']);
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

    if (user.role === 'client') {
      const existing = await prisma.deliverable.findUnique({ where: { id } });
      if (!existing || existing.clientId !== user.clientId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      if (body.status === 'changes-requested' && existing.status === 'pending-approval') {
        const deliverable = await prisma.deliverable.update({
          where: { id },
          data: { status: 'changes-requested' },
        });
        return NextResponse.json(deliverable);
      }
      return NextResponse.json({ error: 'Clients can only request changes on pending-approval deliverables' }, { status: 400 });
    }

    const data: Prisma.DeliverableUpdateInput = { ...body };
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
