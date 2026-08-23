import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';

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
      const allowedStatuses = ['draft', 'in-progress', 'pending-approval'];
      if (!body.status || !allowedStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Contractors can only set status to draft, in-progress, or pending-approval' }, { status: 400 });
      }
      const updateData: Record<string, unknown> = { status: body.status };
      if (body.submittedUrl !== undefined) updateData.submittedUrl = body.submittedUrl;
      if (body.submittedAt !== undefined) updateData.submittedAt = body.submittedAt ? new Date(body.submittedAt) : null;
      if (body.attachments !== undefined) updateData.attachments = typeof body.attachments === 'string' ? body.attachments : JSON.stringify(body.attachments);

      const deliverable = await prisma.deliverable.update({
        where: { id },
        data: updateData,
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

        if (deliverable.taskId) {
          const task = await prisma.projectTask.findUnique({ where: { id: deliverable.taskId } });
          if (task && task.status === 'in_progress') {
            await prisma.projectTask.update({
              where: { id: deliverable.taskId },
              data: { status: 'in_review' },
            });
          }
        }
      }

      await logAudit(user, { action: 'deliverable.submit', method: 'PATCH', path: `/api/deliverables/${params.id}`, entity: 'Deliverable', entityId: params.id, metadata: { status: deliverable.status } });
      return NextResponse.json(deliverable);
    }
    if (user.role === 'client') {
      const existing = await prisma.deliverable.findUnique({ where: { id } });
      if (!existing || existing.clientId !== user.clientId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      if (body.status === 'changes-requested' && existing.status === 'pending-approval') {
        const updateData: Record<string, unknown> = { status: 'changes-requested' };
        if (body.feedback !== undefined) updateData.feedback = body.feedback;

        const deliverable = await prisma.deliverable.update({
          where: { id },
          data: updateData,
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
              message: `Changes have been requested for "${deliverable.name}".${body.feedback ? ` Feedback: ${body.feedback}` : ''}`,
              link: '/contractor/deliverables',
            })
          ));
        }

        if (deliverable.taskId) {
          const task = await prisma.projectTask.findUnique({ where: { id: deliverable.taskId } });
          if (task && task.status === 'in_review') {
            await prisma.projectTask.update({
              where: { id: deliverable.taskId },
              data: { status: 'in_progress' },
            });
          }
        }

        await logAudit(user, { action: 'deliverable.requestChanges', method: 'PATCH', path: `/api/deliverables/${params.id}`, entity: 'Deliverable', entityId: params.id, metadata: { feedback: body.feedback || null } });
        return NextResponse.json(deliverable);
      }
      return NextResponse.json({ error: 'Clients can only request changes on pending-approval deliverables' }, { status: 400 });
    }

    const data: Prisma.DeliverableUpdateInput = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.taskId !== undefined) data.taskId = body.taskId;
    if (body.submittedUrl !== undefined) data.submittedUrl = body.submittedUrl;
    if (body.submittedAt !== undefined) data.submittedAt = body.submittedAt ? new Date(body.submittedAt) : null;
    if (body.attachments !== undefined) data.attachments = typeof body.attachments === 'string' ? body.attachments : JSON.stringify(body.attachments);
    if (body.feedback !== undefined) data.feedback = body.feedback;
    if (body.reviewedBy !== undefined) data.reviewedBy = body.reviewedBy;
    if (body.reviewedAt !== undefined) data.reviewedAt = body.reviewedAt ? new Date(body.reviewedAt) : null;

    if (body.status === 'approved' && !body.approvedAt) {
      data.approvedAt = new Date();
      if (!data.reviewedBy) data.reviewedBy = user.id;
      if (!data.reviewedAt) data.reviewedAt = new Date();
    }
    if (body.status === 'changes-requested' || body.status === 'rejected') {
      if (!data.reviewedBy) data.reviewedBy = user.id;
      if (!data.reviewedAt) data.reviewedAt = new Date();
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
          message: `"${deliverable.name}" has been approved.${body.feedback ? ` Feedback: ${body.feedback}` : ''}`,
          link: '/contractor/deliverables',
        });
      }

      if (deliverable.taskId) {
        const task = await prisma.projectTask.findUnique({ where: { id: deliverable.taskId } });
        if (task && task.status !== 'completed') {
          await prisma.projectTask.update({
            where: { id: deliverable.taskId },
            data: { status: 'completed', completedAt: new Date() },
          });

          const totalTasks = await prisma.projectTask.count({ where: { projectId: task.projectId } });
          const completedTasks = await prisma.projectTask.count({ where: { projectId: task.projectId, status: 'completed' } });
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          const project = await prisma.project.findUnique({ where: { id: task.projectId } });

          await prisma.project.update({
            where: { id: task.projectId },
            data: { progress, ...(progress === 100 ? { status: 'complete' } : {}) },
          });

          if (progress === 100 && project) {
            await createNotification({
              userId: user.id,
              type: 'project_status',
              title: 'Project Complete',
              message: `All tasks in "${project.name}" have been completed.`,
              link: `/admin/projects/${project.id}`,
            });
          }
        }
      }
    }

    if (body.status === 'changes-requested' || body.status === 'rejected') {
      const contractorUser = await prisma.user.findFirst({ where: { contractorId: deliverable.contractorId } });
      if (contractorUser) {
        await createNotification({
          userId: contractorUser.id,
          type: 'deliverable_status',
          title: body.status === 'rejected' ? 'Deliverable Rejected' : 'Changes Requested',
          message: `Changes have been requested for "${deliverable.name}".${body.feedback ? ` Feedback: ${body.feedback}` : ''}`,
          link: '/contractor/deliverables',
        });
      }
    }

    if (deliverable.taskId && (body.status === 'approved' || body.status === 'changes-requested' || body.status === 'rejected')) {
      const reviewStatusMap: Record<string, string> = {
        'approved': 'approved',
        'changes-requested': 'changes_requested',
        'rejected': 'rejected',
      };
      await prisma.taskReview.create({
        data: {
          taskId: deliverable.taskId,
          reviewerId: user.id,
          status: reviewStatusMap[body.status] || 'pending',
          feedback: body.feedback || null,
        },
      });
    }

    await logAudit(user, { action: 'deliverable.update', method: 'PATCH', path: `/api/deliverables/${params.id}`, entity: 'Deliverable', entityId: params.id, metadata: { status: data.status as string | undefined } });
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
    await logAudit(user, { action: 'deliverable.delete', method: 'DELETE', path: `/api/deliverables/${params.id}`, entity: 'Deliverable', entityId: params.id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete deliverable' }, { status: 500 });
  }
}
