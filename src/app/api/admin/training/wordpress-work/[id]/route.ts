import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

type Params = { params: { id: string } };

const ACTIONS = new Set(['approve', 'changes_requested']);

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const submission = await prisma.wordPressWorkSubmission.findUnique({
      where: { id: params.id },
      include: { contractor: { select: { id: true, name: true, businessName: true, role: true } } },
    });
    if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

    return NextResponse.json({ submission });
  } catch (err) {
    console.error('[admin/wordpress-work/:id] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load submission' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json().catch(() => null);
    const action = body?.action;
    if (typeof action !== 'string' || !ACTIONS.has(action)) {
      return NextResponse.json({ error: 'action must be "approve" or "changes_requested"' }, { status: 400 });
    }

    const submission = await prisma.wordPressWorkSubmission.findUnique({
      where: { id: params.id },
      include: { contractor: { select: { id: true, name: true, userId: true } } },
    });
    if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

    const adminNotes =
      typeof body?.adminNotes === 'string' ? body.adminNotes.trim().slice(0, 4000) : null;

    const status = action === 'approve' ? 'approved' : 'changes_requested';

    const updated = await prisma.wordPressWorkSubmission.update({
      where: { id: submission.id },
      data: {
        status,
        adminNotes,
        reviewedBy: user.email,
        reviewedAt: new Date(),
      },
    });

    await logAudit(user, {
      action: `wordpress_work.${action}`,
      method: 'PATCH',
      path: `/api/admin/training/wordpress-work/${submission.id}`,
      entity: 'WordPressWorkSubmission',
      entityId: submission.id,
      metadata: {
        contractorId: submission.contractorId,
        city: submission.city,
        status,
      },
    });

    if (submission.contractor.userId) {
      await createNotification({
        userId: submission.contractor.userId,
        type: 'training',
        title: action === 'approve' ? 'WordPress work approved' : 'WordPress work needs changes',
        message:
          action === 'approve'
            ? `Your submission for ${submission.city} was approved.`
            : `Your submission for ${submission.city} needs changes. Check the reviewer notes.`,
        link: '/contractor/wordpress-developer',
      }).catch(() => {});
    }

    return NextResponse.json({ submission: updated });
  } catch (err) {
    console.error('[admin/wordpress-work/:id] PATCH failed:', err);
    return NextResponse.json({ error: 'Failed to review submission' }, { status: 500 });
  }
}
