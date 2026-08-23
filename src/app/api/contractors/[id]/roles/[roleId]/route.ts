import { NextResponse } from 'next/server';
import { requireAdmin, isNextResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';
import { getRoleLessons } from '@/lib/role-training-config';

async function autoAssignLessons(contractorId: string, role: string) {
  const lessonSlugs = getRoleLessons(role);
  if (!lessonSlugs.length) return;

  const lessons = await prisma.trainingLesson.findMany({
    where: { slug: { in: lessonSlugs }, isActive: true },
  });

  for (const lesson of lessons) {
    const existing = await prisma.trainingAssignment.findFirst({
      where: { lessonId: lesson.id, contractorId },
    });
    if (!existing) {
      await prisma.trainingAssignment.create({
        data: { lessonId: lesson.id, contractorId, status: 'assigned' },
      });
    }
  }
}

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

    if (status === 'approved') {
      await autoAssignLessons(id, existing.role);
    }

    const contractorUser = await prisma.user.findFirst({ where: { contractorId: id } });
    if (contractorUser) {
      await createNotification({
        userId: contractorUser.id,
        type: status === 'approved' ? 'role_approved' : 'role_rejected',
        title: status === 'approved' ? 'Role Approved' : 'Role Rejected',
        message: status === 'approved'
          ? `Your role "${existing.role}" has been approved. Training lessons have been assigned.`
          : `Your role "${existing.role}" has been rejected.`,
        link: '/contractor/dashboard',
      });
    }

    await logAudit(user, { action: `contractorRole.${status}`, method: 'PATCH', path: `/api/contractors/${id}/roles/${roleId}`, entity: 'ContractorRole', entityId: roleId, metadata: { contractorId: id, role: existing.role } });
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
    await logAudit(user, { action: 'contractorRole.remove', method: 'DELETE', path: `/api/contractors/${id}/roles/${roleId}`, entity: 'ContractorRole', entityId: roleId, metadata: { contractorId: id, role: existing.role } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
