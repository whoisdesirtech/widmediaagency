import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';
import { computePayTier, suggestCertifiedRate } from '@/lib/wordpress-quiz';

type Params = { params: { attemptId: string } };

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
        quiz: {
          include: {
            questions: { orderBy: { order: 'asc' } },
          },
        },
        contractor: {
          select: {
            id: true,
            name: true,
            businessName: true,
            role: true,
            userId: true,
            payTier: true,
          },
        },
      },
    });

    if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });

    return NextResponse.json({ attempt });
  } catch (err) {
    console.error('[admin/wordpress-quiz/:id] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load attempt' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
        quiz: { select: { id: true, passingScore: true, title: true } },
        contractor: { select: { id: true, name: true, userId: true } },
      },
    });
    if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });

    const hasOverrideScore = Object.prototype.hasOwnProperty.call(body, 'overrideScore');
    const hasOverridePassed = Object.prototype.hasOwnProperty.call(body, 'overridePassed');

    let overrideScore: number | null = attempt.overrideScore;
    let overridePassed: boolean | null = attempt.overridePassed;

    // `percentage` always stays the raw, server-computed value. Overrides are
    // recorded separately so the original result is never destroyed.
    if (hasOverrideScore) {
      const raw = body.overrideScore;
      if (raw === null || raw === '') {
        overrideScore = null;
        if (!hasOverridePassed) overridePassed = null;
      } else {
        const numeric = Number(raw);
        const maxScore = attempt.maxScore ?? 0;
        if (!Number.isFinite(numeric) || numeric < 0 || (maxScore > 0 && numeric > maxScore)) {
          return NextResponse.json(
            { error: `overrideScore must be between 0 and ${maxScore || 'the maximum score'}` },
            { status: 400 }
          );
        }
        overrideScore = Math.round(numeric);
        if (!hasOverridePassed && maxScore > 0) {
          const overriddenPercentage = Math.round((overrideScore / maxScore) * 100);
          overridePassed = overriddenPercentage >= attempt.quiz.passingScore;
        }
      }
    }

    if (hasOverridePassed) {
      const raw = body.overridePassed;
      if (raw === null || raw === '') {
        overridePassed = null;
      } else if (typeof raw === 'boolean') {
        overridePassed = raw;
      } else {
        return NextResponse.json({ error: 'overridePassed must be a boolean or null' }, { status: 400 });
      }
    }

    const reviewNotes =
      Object.prototype.hasOwnProperty.call(body, 'reviewNotes')
        ? typeof body.reviewNotes === 'string'
          ? body.reviewNotes.trim().slice(0, 4000)
          : null
        : attempt.reviewNotes;

    const effectivePassed = overridePassed ?? attempt.passed ?? false;

    const existingTier = await prisma.contractorPayTier.findUnique({
      where: { contractorId: attempt.contractorId },
    });

    // Rates are optional inputs on the review form. Admins can set either rate
    // directly; a missing certified rate is suggested from the standard rate.
    const hasStandardRate = Object.prototype.hasOwnProperty.call(body, 'standardRate');
    const hasCertifiedRate = Object.prototype.hasOwnProperty.call(body, 'certifiedRate');

    const parseRate = (value: unknown): number | null | 'invalid' => {
      if (value === null || value === '') return null;
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric < 0) return 'invalid';
      return Math.round(numeric * 100) / 100;
    };

    let standardRate = existingTier?.standardRate ?? null;
    let certifiedRate = existingTier?.certifiedRate ?? null;

    if (hasStandardRate) {
      const parsed = parseRate(body.standardRate);
      if (parsed === 'invalid') {
        return NextResponse.json({ error: 'standardRate must be a non-negative number or null' }, { status: 400 });
      }
      standardRate = parsed;
    }

    if (hasCertifiedRate) {
      const parsed = parseRate(body.certifiedRate);
      if (parsed === 'invalid') {
        return NextResponse.json({ error: 'certifiedRate must be a non-negative number or null' }, { status: 400 });
      }
      certifiedRate = parsed;
    }

    if (!hasCertifiedRate && certifiedRate === null) {
      certifiedRate = suggestCertifiedRate(standardRate);
    }

    const updated = await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'reviewed',
        reviewedAt: new Date(),
        reviewedBy: user.email,
        reviewNotes: reviewNotes ?? null,
        overrideScore,
        overridePassed,
      },
    });

    const tier = computePayTier(effectivePassed);
    const payTier = await prisma.contractorPayTier.upsert({
      where: { contractorId: attempt.contractorId },
      create: {
        contractorId: attempt.contractorId,
        tier,
        standardRate,
        certifiedRate,
        source: 'manual',
        quizAttemptId: updated.id,
        updatedBy: user.email,
        notes: `Set by ${user.email} on admin review.`,
      },
      update: {
        tier,
        standardRate,
        certifiedRate,
        source: 'manual',
        quizAttemptId: updated.id,
        updatedBy: user.email,
        notes: `Set by ${user.email} on admin review.`,
      },
    });

    await logAudit(user, {
      action: 'wordpress_quiz.reviewed',
      method: 'PATCH',
      path: `/api/admin/training/wordpress-quiz/${attempt.id}`,
      entity: 'QuizAttempt',
      entityId: attempt.id,
      metadata: {
        contractorId: attempt.contractorId,
        overrideScore,
        overridePassed,
        effectivePassed,
        payTier: payTier.tier,
        previousTier: existingTier?.tier ?? null,
      },
    });

    if (attempt.contractor.userId) {
      await createNotification({
        userId: attempt.contractor.userId,
        type: 'training',
        title: 'WordPress certification reviewed',
        message: effectivePassed
          ? 'Your certification was reviewed and approved. You are on the certified pay tier.'
          : 'Your certification was reviewed. The standard pay tier currently applies. Check the reviewer notes for details.',
        link: '/contractor/wordpress-developer',
      }).catch(() => {});
    }

    return NextResponse.json({ attempt: updated, payTier });
  } catch (err) {
    console.error('[admin/wordpress-quiz/:id] PATCH failed:', err);
    return NextResponse.json({ error: 'Failed to review attempt' }, { status: 500 });
  }
}
