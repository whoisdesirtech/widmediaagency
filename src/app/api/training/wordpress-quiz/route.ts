import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireContractor, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';
import {
  gradeQuiz,
  hasWordPressDeveloperRole,
  suggestCertifiedRate,
  toPublicQuestions,
  type SubmittedAnswer,
  WORDPRESS_QUIZ_SLUG,
} from '@/lib/wordpress-quiz';

const ELIGIBILITY_MESSAGE = 'This certification is only available to WordPress developers.';

async function loadEligibility(contractorId: string) {
  const contractor = await prisma.contractor.findUnique({
    where: { id: contractorId },
    select: {
      id: true,
      name: true,
      role: true,
      userId: true,
      roles: { select: { role: true, status: true } },
      payTier: true,
    },
  });

  if (!contractor) return null;

  const approvedRoles = contractor.roles
    .filter((role) => role.status === 'approved')
    .map((role) => role.role);

  return {
    contractor,
    eligible: hasWordPressDeveloperRole(contractor.role, approvedRoles),
  };
}

function serializeAttempt(attempt: {
  id: string;
  status: string;
  attemptNumber: number;
  assignedAt: Date;
  startedAt: Date | null;
  submittedAt: Date | null;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  passed: boolean | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  overrideScore: number | null;
  overridePassed: boolean | null;
}) {
  return {
    id: attempt.id,
    status: attempt.status,
    attemptNumber: attempt.attemptNumber,
    assignedAt: attempt.assignedAt,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    score: attempt.score,
    maxScore: attempt.maxScore,
    percentage: attempt.percentage,
    passed: attempt.passed,
    reviewedAt: attempt.reviewedAt,
    reviewedBy: attempt.reviewedBy,
    reviewNotes: attempt.reviewNotes,
    overrideScore: attempt.overrideScore,
    overridePassed: attempt.overridePassed,
  };
}

export async function GET() {
  try {
    const user = await requireContractor();
    if (isNextResponse(user)) return user;

    const contractorId = user.contractorId;
    if (!contractorId) {
      return NextResponse.json({ error: 'No contractor profile linked to this account' }, { status: 400 });
    }

    const eligibility = await loadEligibility(contractorId);
    if (!eligibility) return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });

    const quiz = await prisma.trainingQuiz.findUnique({
      where: { slug: WORDPRESS_QUIZ_SLUG },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({
        eligible: eligibility.eligible,
        quiz: null,
        questions: [],
        attempt: null,
        history: [],
        payTier: eligibility.contractor.payTier ?? null,
      });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: quiz.id, contractorId },
      orderBy: { attemptNumber: 'desc' },
    });

    // The open attempt is the most recent one that has not been submitted yet.
    const openAttempt = attempts.find((attempt) => attempt.status === 'assigned' || attempt.status === 'in_progress');
    const latest = attempts[0];

    return NextResponse.json({
      eligible: eligibility.eligible,
      quiz: {
        id: quiz.id,
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.passingScore,
        timeLimitMins: quiz.timeLimitMins,
      },
      questions: toPublicQuestions(quiz.questions),
      attempt: openAttempt ? serializeAttempt(openAttempt) : null,
      latestResult: latest ? serializeAttempt(latest) : null,
      history: attempts.map(serializeAttempt),
      payTier: eligibility.contractor.payTier ?? null,
    });
  } catch (err) {
    console.error('[wordpress-quiz] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load certification quiz' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireContractor();
    if (isNextResponse(user)) return user;

    const contractorId = user.contractorId;
    if (!contractorId) {
      return NextResponse.json({ error: 'No contractor profile linked to this account' }, { status: 400 });
    }

    const eligibility = await loadEligibility(contractorId);
    if (!eligibility) return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    if (!eligibility.eligible) {
      return NextResponse.json({ error: ELIGIBILITY_MESSAGE }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const action = body?.action;

    const quiz = await prisma.trainingQuiz.findUnique({
      where: { slug: WORDPRESS_QUIZ_SLUG },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!quiz || !quiz.isActive) {
      return NextResponse.json({ error: 'Certification quiz is not available' }, { status: 404 });
    }

    if (action === 'start') {
      const openAttempt = await prisma.quizAttempt.findFirst({
        where: {
          quizId: quiz.id,
          contractorId,
          status: { in: ['assigned', 'in_progress'] },
        },
        orderBy: { attemptNumber: 'desc' },
      });

      if (openAttempt) {
        const started = openAttempt.status === 'assigned'
          ? await prisma.quizAttempt.update({
              where: { id: openAttempt.id },
              data: { status: 'in_progress', startedAt: new Date() },
            })
          : openAttempt;

        return NextResponse.json({
          attempt: serializeAttempt(started),
          questions: toPublicQuestions(quiz.questions),
          passingScore: quiz.passingScore,
        });
      }

      const attemptCount = await prisma.quizAttempt.count({ where: { quizId: quiz.id, contractorId } });
      const created = await prisma.quizAttempt.create({
        data: {
          quizId: quiz.id,
          contractorId,
          attemptNumber: attemptCount + 1,
          status: 'in_progress',
          startedAt: new Date(),
        },
      });

      await logAudit(user, {
        action: 'wordpress_quiz.started',
        method: 'POST',
        path: '/api/training/wordpress-quiz',
        entity: 'QuizAttempt',
        entityId: created.id,
        metadata: { quizId: quiz.id, attemptNumber: created.attemptNumber },
      });

      return NextResponse.json({
        attempt: serializeAttempt(created),
        questions: toPublicQuestions(quiz.questions),
        passingScore: quiz.passingScore,
      }, { status: 201 });
    }

    if (action === 'submit') {
      const attemptId = body?.attemptId;
      const rawAnswers = body?.answers;

      if (!attemptId || typeof attemptId !== 'string') {
        return NextResponse.json({ error: 'attemptId required' }, { status: 400 });
      }
      if (!Array.isArray(rawAnswers)) {
        return NextResponse.json({ error: 'answers must be an array' }, { status: 400 });
      }

      const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
      if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
      if (attempt.contractorId !== contractorId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (attempt.quizId !== quiz.id) {
        return NextResponse.json({ error: 'Attempt does not belong to this quiz' }, { status: 400 });
      }
      if (attempt.status === 'submitted' || attempt.status === 'reviewed') {
        return NextResponse.json({ error: 'This attempt has already been submitted' }, { status: 409 });
      }

      const answers: SubmittedAnswer[] = rawAnswers
        .filter((answer: unknown): answer is SubmittedAnswer => {
          return Boolean(answer) && typeof (answer as SubmittedAnswer).questionId === 'string';
        })
        .map((answer: SubmittedAnswer) => ({
          questionId: answer.questionId,
          selectedIndex:
            typeof answer.selectedIndex === 'number' && Number.isInteger(answer.selectedIndex)
              ? answer.selectedIndex
              : null,
        }));

      const grade = gradeQuiz(quiz.questions, answers, quiz.passingScore);
      const submittedAt = new Date();

      const updated = await prisma.quizAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'submitted',
          answers,
          score: grade.score,
          maxScore: grade.maxScore,
          percentage: grade.percentage,
          passed: grade.passed,
          submittedAt,
        },
      });

      // Keep the strongest outcome: passing always upgrades, failing never downgrades
      // a tier the contractor already earned.
      const existingTier = eligibility.contractor.payTier;
      const nextTier = grade.passed ? 'certified' : existingTier?.tier === 'certified' ? 'certified' : 'standard';
      const standardRate = existingTier?.standardRate ?? null;

      const payTier = await prisma.contractorPayTier.upsert({
        where: { contractorId },
        create: {
          contractorId,
          tier: nextTier,
          standardRate,
          certifiedRate: existingTier?.certifiedRate ?? suggestCertifiedRate(standardRate),
          rateType: existingTier?.rateType ?? 'project',
          source: 'quiz',
          quizAttemptId: updated.id,
          effectiveAt: grade.passed ? submittedAt : new Date(),
          notes: grade.passed
            ? `Certified via quiz attempt #${updated.attemptNumber} (${grade.percentage}%).`
            : `Quiz attempt #${updated.attemptNumber} scored ${grade.percentage}%; standard rate applies.`,
        },
        update: {
          tier: nextTier,
          source: grade.passed ? 'quiz' : existingTier?.source ?? 'default',
          quizAttemptId: grade.passed ? updated.id : existingTier?.quizAttemptId ?? null,
          certifiedRate: existingTier?.certifiedRate ?? suggestCertifiedRate(standardRate),
          effectiveAt: grade.passed ? submittedAt : existingTier?.effectiveAt ?? new Date(),
          notes: grade.passed
            ? `Certified via quiz attempt #${updated.attemptNumber} (${grade.percentage}%).`
            : existingTier?.notes ?? `Quiz attempt #${updated.attemptNumber} scored ${grade.percentage}%; standard rate applies.`,
        },
      });

      await logAudit(user, {
        action: 'wordpress_quiz.submitted',
        method: 'POST',
        path: '/api/training/wordpress-quiz',
        entity: 'QuizAttempt',
        entityId: updated.id,
        metadata: {
          quizId: quiz.id,
          attemptNumber: updated.attemptNumber,
          score: grade.score,
          maxScore: grade.maxScore,
          percentage: grade.percentage,
          passed: grade.passed,
          payTier: payTier.tier,
        },
      });

      if (eligibility.contractor.userId) {
        await createNotification({
          userId: eligibility.contractor.userId,
          type: 'training',
          title: grade.passed
            ? 'WordPress certification passed 🎉'
            : 'WordPress certification result',
          message: grade.passed
            ? `You scored ${grade.percentage}% and moved to the certified pay tier.`
            : `You scored ${grade.percentage}%. The passing score is ${quiz.passingScore}%. You can review the module and try again.`,
          link: '/contractor/wordpress-developer',
        }).catch(() => {});
      }

      return NextResponse.json({
        attempt: serializeAttempt(updated),
        grade,
        payTier,
      });
    }

    return NextResponse.json({ error: 'action must be "start" or "submit"' }, { status: 400 });
  } catch (err) {
    console.error('[wordpress-quiz] POST failed:', err);
    return NextResponse.json({ error: 'Failed to process certification quiz' }, { status: 500 });
  }
}
