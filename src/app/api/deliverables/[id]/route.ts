import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isNextResponse } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';
import { resolveTransition, normalizeAttachments, isTerminal } from '@/lib/deliverable-lifecycle';

const EDITABLE_FIELDS = ['name', 'description', 'type', 'dueDate', 'sortOrder', 'taskId', 'feedback', 'submittedUrl', 'submittedAt', 'attachments'];

function auditAction(from: string, to: string): string {
  const map: Record<string, string> = {
    assigned: 'deliverable.assign',
    accepted: 'deliverable.acceptAssignment',
    declined: 'deliverable.declineAssignment',
    'in-progress': from === 'changes-requested' ? 'deliverable.revise' : from === 'client-accepted' ? 'deliverable.reopen' : 'deliverable.start',
    'pending-approval': 'deliverable.submit',
    'changes-requested': 'deliverable.requestChanges',
    'client-accepted': 'deliverable.clientAccept',
    approved: 'deliverable.finalApprove',
    closed: 'deliverable.close',
    cancelled: 'deliverable.cancel',
  };
  return map[to] || 'deliverable.statusChange';
}

async function notifyAdmins(prismaClient: typeof prisma, title: string, message: string, link: string, actingUserId?: string | null) {
  const admins = await prismaClient.user.findMany({ where: { role: 'admin' } });
  const ids = admins.map((u) => u.id).filter((id) => id !== actingUserId);
  return createNotificationForUsersSafe(ids, title, message, link);
}

async function createNotificationForUsersSafe(ids: string[], title: string, message: string, link: string) {
  if (ids.length === 0) return;
  await prisma.notification.createMany({
    data: ids.map((userId) => ({ userId, type: 'deliverable_status', title, message, link })),
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor', 'client']);
    if (isNextResponse(user)) return user;

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.deliverable.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });

    if (user.role === 'contractor' && existing.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (user.role === 'client' && existing.clientId !== user.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if ((user.role === 'admin' || user.role === 'staff') && user.agencyId) {
      const client = await prisma.client.findUnique({ where: { id: existing.clientId } });
      if (client && client.agencyId !== user.agencyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const terminalState = isTerminal(existing.status);
    if (terminalState) {
      return NextResponse.json({ error: 'This deliverable is closed or cancelled and can no longer be changed' }, { status: 409 });
    }

    // Admin/staff field-only edit (no status change requested)
    if (body.status === undefined) {
      if (user.role === 'admin' || user.role === 'staff') {
        const updateData: Record<string, unknown> = {};
        for (const f of EDITABLE_FIELDS) {
          if (body[f] !== undefined) {
            if (f === 'submittedAt') updateData.submittedAt = body.submittedAt ? new Date(body.submittedAt) : null;
            else if (f === 'attachments') updateData.attachments = normalizeAttachments(body.attachments);
            else updateData[f] = body[f];
          }
        }
        if (Object.keys(updateData).length > 0) {
          const updated = await prisma.deliverable.update({ where: { id }, data: updateData });
          await logAudit(user, { action: 'deliverable.update', method: 'PATCH', path: `/api/deliverables/${id}`, entity: 'Deliverable', entityId: id, metadata: { fields: Object.keys(updateData) } });
          return NextResponse.json(updated);
        }
      }
      return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
    }

    // Resolve the requested transition
    let toStatus = body.status;
    let rejectionAction: string | null = null;
    if (toStatus === 'rejected') {
      if (user.role !== 'admin' && user.role !== 'staff') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      toStatus = 'cancelled';
      rejectionAction = 'rejected';
    }

    const resolved = resolveTransition(user.role as 'admin' | 'staff' | 'contractor' | 'client', existing.status, toStatus, existing as never, body);
    if (!resolved.ok) return NextResponse.json({ error: resolved.reason }, { status: 409 });

    const updateData: Record<string, unknown> = { status: toStatus };
    const reason = typeof body.reason === 'string' && body.reason.trim() ? body.reason.trim() : typeof body.feedback === 'string' && body.feedback.trim() ? body.feedback.trim() : null;

    // Decision timestamps + transition fields
    if (toStatus === 'assigned') {
      updateData.contractorId = body.contractorId;
      updateData.assignedAt = new Date();
    }
    if (toStatus === 'accepted') updateData.contractorAcceptedAt = new Date();
    if (toStatus === 'declined') {
      updateData.contractorDeclinedAt = new Date();
      if (typeof body.reason === 'string') updateData.declineReason = body.reason;
    }
    if (toStatus === 'pending-approval') {
      if (body.submittedUrl !== undefined) updateData.submittedUrl = body.submittedUrl;
      if (body.attachments !== undefined) updateData.attachments = normalizeAttachments(body.attachments);
      updateData.submittedAt = body.submittedAt ? new Date(body.submittedAt) : new Date();
    }
    if (toStatus === 'changes-requested') {
      if (body.feedback !== undefined) updateData.feedback = body.feedback;
      updateData.revisionCount = (existing.revisionCount || 0) + 1;
    }
    if (toStatus === 'client-accepted' && body.feedback !== undefined) updateData.feedback = body.feedback;
    if (toStatus === 'client-accepted') updateData.clientAcceptedAt = new Date();
    if (toStatus === 'approved') {
      updateData.finalApprovedAt = new Date();
      updateData.approvedAt = new Date();
      updateData.reviewedBy = user.id;
      updateData.reviewedAt = new Date();
    }
    if (toStatus === 'closed') {
      updateData.closedAt = new Date();
      updateData.closedBy = user.id;
    }

    const deliverable = await prisma.deliverable.update({ where: { id }, data: updateData });

    const contractorUser = deliverable.contractorId ? await prisma.user.findFirst({ where: { contractorId: deliverable.contractorId } }) : null;
    const clientUser = await prisma.user.findFirst({ where: { clientId: deliverable.clientId } });
    const adminUsers = await prisma.user.findMany({ where: { role: 'admin' } });
    const mailto = { name: deliverable.name };

    // Notifications
    if (toStatus === 'assigned' && contractorUser) {
      await createNotification({ userId: contractorUser.id, type: 'deliverable_status', title: 'New Deliverable Assignment', message: `"${deliverable.name}" has been assigned to you. Please accept or decline.`, link: '/contractor/deliverables' });
    }
    if (toStatus === 'accepted') {
      await notifyAdmins(prisma, 'Contractor Accepted Assignment', `${contractorUser?.name || 'Contractor'} accepted "${deliverable.name}".`, '/admin/deliverables', user.id);
    }
    if (toStatus === 'declined') {
      await notifyAdmins(prisma, 'Contractor Declined Assignment', `${contractorUser?.name || 'Contractor'} declined "${deliverable.name}".${reason ? ` Reason: ${reason}` : ''}`, '/admin/deliverables', user.id);
    }
    if (toStatus === 'pending-approval') {
      const ids: string[] = [];
      if (clientUser?.id) ids.push(clientUser.id);
      ids.push(...adminUsers.map((a) => a.id));
      await createNotificationForUsersSafe(ids, 'Deliverable Pending Client Review', `"${deliverable.name}" has been submitted for client review.`, '/client/deliverables');
    }
    if (toStatus === 'changes-requested') {
      const ids: string[] = [];
      if (contractorUser?.id) ids.push(contractorUser.id);
      ids.push(...adminUsers.map((a) => a.id));
      await createNotificationForUsersSafe(ids, 'Changes Requested', `Changes have been requested for "${deliverable.name}".${reason ? ` Feedback: ${reason}` : ''}`, '/contractor/deliverables');
    }
    if (toStatus === 'client-accepted') {
      const ids: string[] = [];
      if (contractorUser?.id) ids.push(contractorUser.id);
      ids.push(...adminUsers.map((a) => a.id));
      await createNotificationForUsersSafe(ids, 'Deliverable Accepted by Client', `"${deliverable.name}" has been accepted by the client. Next step: final approval.${reason ? ` Note: ${reason}` : ''}`, '/admin/deliverables');
    }
    if (toStatus === 'approved') {
      const ids: string[] = [];
      if (clientUser?.id) ids.push(clientUser.id);
      if (contractorUser?.id) ids.push(contractorUser.id);
      await createNotificationForUsersSafe(ids, 'Deliverable Final Approved', `"${deliverable.name}" has received final approval and will be closed.`, '/client/deliverables');
    }
    if (toStatus === 'closed') {
      const ids: string[] = [];
      if (clientUser?.id) ids.push(clientUser.id);
      if (contractorUser?.id) ids.push(contractorUser.id);
      await createNotificationForUsersSafe(ids, 'Deliverable Closed', `"${deliverable.name}" has been closed for all parties.${reason ? ` Note: ${reason}` : ''}`, '/client/deliverables');
    }
    if (toStatus === 'cancelled' && contractorUser) {
      await createNotification({ userId: contractorUser.id, type: 'deliverable_status', title: rejectionAction === 'rejected' ? 'Deliverable Rejected' : 'Deliverable Cancelled', message: `"${deliverable.name}" has been ${rejectionAction === 'rejected' ? 'rejected' : 'cancelled'}.${reason ? ` Reason: ${reason}` : ''}`, link: '/contractor/deliverables' });
    }

    // Task integration (existing Phase 4D/4E behavior)
    if (deliverable.taskId) {
      const task = await prisma.projectTask.findUnique({ where: { id: deliverable.taskId } });

      if (toStatus === 'pending-approval' && task && task.status === 'in_progress') {
        await prisma.projectTask.update({ where: { id: task.id }, data: { status: 'in_review' } });
      }

      if ((toStatus === 'changes-requested') && task && task.status === 'in_review') {
        await prisma.projectTask.update({ where: { id: task.id }, data: { status: 'in_progress' } });
      }

      if (toStatus === 'approved' && task) {
        if (task.status !== 'completed') {
          await prisma.projectTask.update({ where: { id: task.id }, data: { status: 'completed', completedAt: new Date() } });
          const totalTasks = await prisma.projectTask.count({ where: { projectId: task.projectId } });
          const completedTasks = await prisma.projectTask.count({ where: { projectId: task.projectId, status: 'completed' } });
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          const project = await prisma.project.findUnique({ where: { id: task.projectId } });
          await prisma.project.update({ where: { id: task.projectId }, data: { progress, ...(progress === 100 ? { status: 'complete' } : {}) } });
          if (progress === 100 && project) {
            await createNotification({ userId: user.id, type: 'project_status', title: 'Project Complete', message: `All tasks in "${project.name}" have been completed.`, link: `/admin/projects/${project.id}` });
          }
        }
      }

      const reviewStatusMap: Record<string, string | null> = {
        approved: 'approved',
        'changes-requested': 'changes_requested',
      };
      const reviewStatus = toStatus === 'cancelled' && rejectionAction === 'rejected' ? 'rejected' : reviewStatusMap[toStatus] || null;
      if (reviewStatus) {
        await prisma.taskReview.create({
          data: { taskId: deliverable.taskId, reviewerId: user.id, status: reviewStatus, feedback: reason },
        });
      }
    }

    await logAudit(user, {
      action: rejectionAction === 'rejected' ? 'deliverable.reject' : auditAction(existing.status, toStatus),
      method: 'PATCH',
      path: `/api/deliverables/${id}`,
      entity: 'Deliverable',
      entityId: id,
      metadata: { fromStatus: existing.status, toStatus, reason, contractorId: deliverable.contractorId },
    });

    return NextResponse.json(deliverable);
  } catch (err) {
    console.error('Failed to update deliverable', err);
    return NextResponse.json({ error: 'Failed to update deliverable' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff']);
    if (isNextResponse(user)) return user;

    const { id } = await params;
    const existing = await prisma.deliverable.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    if (user.agencyId) {
      const client = await prisma.client.findUnique({ where: { id: existing.clientId } });
      if (client && client.agencyId !== user.agencyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    await prisma.deliverable.delete({ where: { id } });
    await logAudit(user, { action: 'deliverable.delete', method: 'DELETE', path: `/api/deliverables/${id}`, entity: 'Deliverable', entityId: id, metadata: { name: existing.name } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete deliverable' }, { status: 500 });
  }
}

