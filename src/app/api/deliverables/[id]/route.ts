import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

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

      if (body.status === 'pending-approval') {
        const clientUser = await prisma.user.findFirst({ where: { clientId: deliverable.clientId } });
        const adminUsers = await prisma.user.findMany({ where: { role: 'admin' } });
        const notifyUserIds = [clientUser?.id, ...adminUsers.map(u => u.id)].filter((u): u is string => !!u);
        if (notifyUserIds.length > 0) {
          await Promise.all(notifyUserIds.map(uid =>
            createNotification({
              userId: uid,
              type: 'deliverable_status',
              title: 'Deliverable Pending Approval',
              message: `"${deliverable.name}" has been submitted for your review.`,
              link: '/admin/deliverables',
            })
          ));
        }
      }

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

        const contractorUser = await prisma.user.findFirst({ where: { contractorId: deliverable.contractorId } });
        const adminUsers = await prisma.user.findMany({ where: { role: 'admin' } });
        const notifyUserIds = [contractorUser?.id, ...adminUsers.map(u => u.id)].filter((u): u is string => !!u);
        if (notifyUserIds.length > 0) {
          await Promise.all(notifyUserIds.map(uid =>
            createNotification({
              userId: uid,
              type: 'deliverable_status',
              title: 'Changes Requested',
              message: `Changes have been requested for "${deliverable.name}".`,
              link: '/contractor/deliverables',
            })
          ));
        }

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

    if (body.status === 'approved') {
      const contractorUser = await prisma.user.findFirst({ where: { contractorId: deliverable.contractorId } });
      if (contractorUser) {
        await createNotification({
          userId: contractorUser.id,
          type: 'deliverable_status',
          title: 'Deliverable Approved',
          message: `"${deliverable.name}" has been approved.`,
          link: '/contractor/deliverables',
        });
      }
    }

    return NextResponse.json(deliverable);
  } catch {
    return NextResponse.json({ error: 'Failed to update deliverable' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    await prisma.deliverable.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete deliverable' }, { status: 500 });
  }
}
