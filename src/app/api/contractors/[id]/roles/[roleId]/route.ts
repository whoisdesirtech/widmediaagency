import { NextResponse } from 'next/server';
import { requireAdmin, isNextResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export async function PATCH(req: Request, { params }: { params: { id: string; roleId: string } }) {
  try {
    const user = await requireAdmin();
    if (isNextResponse(user)) return user;

    const { id, roleId } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be "approved" or "rejected"' }, { status: 400 });
    }

    const existing = await prisma.contractorRole.findFirst({
      where: { id: roleId, contractorId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const updated = await prisma.contractorRole.update({
      where: { id: roleId },
      data: {
        status,
        approvedAt: status === 'approved' ? new Date() : null,
        approvedBy: status === 'approved' ? user.id : null,
      },
    });

    const contractorUser = await prisma.user.findFirst({ where: { contractorId: id } });
    if (contractorUser) {
      await createNotification({
        userId: contractorUser.id,
        type: status === 'approved' ? 'role_approved' : 'role_rejected',
        title: status === 'approved' ? 'Role Approved' : 'Role Rejected',
        message: status === 'approved'
          ? `Your role "${existing.role}" has been approved.`
          : `Your role "${existing.role}" has been rejected.`,
        link: '/contractor/dashboard',
      });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string; roleId: string } }) {
  try {
    const user = await requireAdmin();
    if (isNextResponse(user)) return user;

    const { id, roleId } = await params;

    const existing = await prisma.contractorRole.findFirst({
      where: { id: roleId, contractorId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (existing.status === 'approved') {
      const approvedCount = await prisma.contractorRole.count({
        where: { contractorId: id, status: 'approved' },
      });

      if (approvedCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last approved role' }, { status: 400 });
      }
    }

    await prisma.contractorRole.delete({ where: { id: roleId } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
