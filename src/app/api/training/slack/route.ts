import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireContractor, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { lookupSlackUser, isSlackConfigured, getWorkspaceUrl } from '@/lib/slack';

export async function GET(req: Request) {
  try {
    const user = await requireContractor();
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');
    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId required' }, { status: 400 });
    }

    const assignment = await prisma.trainingAssignment.findUnique({
      where: { id: assignmentId },
      include: { slackConnection: true },
    });
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    if (assignment.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!assignment.slackConnection) {
      return NextResponse.json({ exists: false, configured: isSlackConfigured(), workspaceUrl: getWorkspaceUrl() });
    }

    const conn = assignment.slackConnection;
    return NextResponse.json({
      exists: true,
      id: conn.id,
      slackEmail: conn.slackEmail,
      slackRealName: conn.slackRealName,
      slackDisplayName: conn.slackDisplayName,
      workspaceName: conn.workspaceName,
      status: conn.status,
      verifiedAt: conn.verifiedAt,
      verifiedBy: conn.verifiedBy,
      errorMessage: conn.errorMessage,
      configured: isSlackConfigured(),
      workspaceUrl: getWorkspaceUrl(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch Slack connection' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireContractor();
    if (isNextResponse(user)) return user;

    const { assignmentId, email } = await req.json();
    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId required' }, { status: 400 });
    }

    const assignment = await prisma.trainingAssignment.findUnique({
      where: { id: assignmentId },
      include: { lesson: true, slackConnection: true },
    });
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    if (assignment.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!assignment.lesson.requiresSlack) {
      return NextResponse.json({ error: 'This lesson does not require Slack connection' }, { status: 400 });
    }

    // Return existing connection if already verified/connected (idempotent)
    if (assignment.slackConnection) {
      const conn = assignment.slackConnection;
      if (conn.status === 'verified' || conn.status === 'connected') {
        return NextResponse.json({
          id: conn.id,
          slackEmail: conn.slackEmail,
          slackRealName: conn.slackRealName,
          status: conn.status,
          verifiedAt: conn.verifiedAt,
        });
      }
      // If error, allow retry by deleting the old record
      if (conn.status === 'error') {
        await prisma.slackConnection.delete({ where: { id: conn.id } });
      }
      // If pending, return it as-is (prevent duplicate creation)
      if (conn.status === 'pending') {
        return NextResponse.json({
          id: conn.id,
          slackEmail: conn.slackEmail,
          status: conn.status,
        });
      }
    }

    // Use provided email or fall back to session email
    const slackEmail = email || user.email;
    if (!slackEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // If Slack bot token is configured, verify the user exists in the workspace
    if (isSlackConfigured()) {
      const lookup = await lookupSlackUser(slackEmail);

      // Create the connection record
      const connRecord = await prisma.slackConnection.create({
        data: {
          assignmentId,
          slackEmail,
          status: lookup.success ? 'verified' : 'error',
          slackUserId: lookup.slackUserId,
          slackRealName: lookup.realName,
          slackDisplayName: lookup.displayName,
          workspaceId: lookup.workspaceId,
          verifiedAt: lookup.success ? new Date() : null,
          verifiedBy: lookup.success ? 'auto' : null,
          errorMessage: lookup.success ? null : (lookup.error || 'User not found in Slack workspace'),
        },
      });

      // Audit
      await logAudit(user, {
        action: lookup.success ? 'slack.connection_verified' : 'slack.connection_failed',
        method: 'POST',
        path: '/api/training/slack',
        entity: 'SlackConnection',
        entityId: connRecord.id,
        metadata: { assignmentId, email: slackEmail, autoVerified: lookup.success },
      });

      return NextResponse.json({
        id: connRecord.id,
        slackEmail: connRecord.slackEmail,
        slackRealName: connRecord.slackRealName,
        slackDisplayName: connRecord.slackDisplayName,
        status: connRecord.status,
        verifiedAt: connRecord.verifiedAt,
        errorMessage: connRecord.errorMessage,
      }, { status: lookup.success ? 201 : 400 });
    }

    // No bot token — create pending connection, requires admin verification
    const connRecord = await prisma.slackConnection.create({
      data: {
        assignmentId,
        slackEmail,
        status: 'connected',
      },
    });

    await logAudit(user, {
      action: 'slack.connection_started',
      method: 'POST',
      path: '/api/training/slack',
      entity: 'SlackConnection',
      entityId: connRecord.id,
      metadata: { assignmentId, email: slackEmail, autoVerified: false },
    });

    return NextResponse.json({
      id: connRecord.id,
      slackEmail: connRecord.slackEmail,
      status: connRecord.status,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create Slack connection' }, { status: 500 });
  }
}
