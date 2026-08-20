import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const { connectionId, action } = await req.json();
    if (!connectionId || !action) {
      return NextResponse.json({ error: 'connectionId and action required' }, { status: 400 });
    }

    if (!['verify', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be verify or reject' }, { status: 400 });
    }

    const connection = await prisma.slackConnection.findUnique({
      where: { id: connectionId },
      include: { assignment: { include: { contractor: true } } },
    });
    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const newStatus = action === 'verify' ? 'verified' : 'error';
    const updated = await prisma.slackConnection.update({
      where: { id: connectionId },
      data: {
        status: newStatus,
        verifiedAt: action === 'verify' ? new Date() : null,
        verifiedBy: action === 'verify' ? 'manual' : null,
        errorMessage: action === 'reject' ? 'Rejected by admin' : null,
      },
    });

    await logAudit(user, {
      action: action === 'verify' ? 'slack.verification_completed' : 'slack.verification_failed',
      method: 'POST',
      path: '/api/admin/training/slack/verify',
      entity: 'SlackConnection',
      entityId: connectionId,
      metadata: {
        assignmentId: connection.assignmentId,
        contractorId: connection.assignment.contractorId,
        action,
      },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      verifiedAt: updated.verifiedAt,
      verifiedBy: updated.verifiedBy,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update Slack connection' }, { status: 500 });
  }
}
