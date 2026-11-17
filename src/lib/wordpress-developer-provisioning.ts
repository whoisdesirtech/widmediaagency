import { prisma } from './prisma';
import { createNotification } from './notifications';
import {
  hasWordPressDeveloperRole,
  WORDPRESS_DEVELOPER_ROLE,
  WORDPRESS_QUIZ_SLUG,
} from './wordpress-quiz';

export const WORDPRESS_DEVELOPER_LESSON_SLUG = 'wordpress-developer';

type ProvisionResult = {
  eligible: boolean;
  lessonAssigned: boolean;
  attemptAssigned: boolean;
  attemptId: string | null;
};

/**
 * Idempotently provisions the WordPress Developer training module and the
 * separate certification quiz for a contractor.
 *
 * Called when a login is created for a WordPress developer and when the
 * `wordpress-developer` role is approved. Safe to call repeatedly.
 */
export async function ensureWordPressDeveloperProvisioning(
  contractorId: string,
  options: { notifyUserId?: string | null; assignedBy?: string } = {}
): Promise<ProvisionResult> {
  const contractor = await prisma.contractor.findUnique({
    where: { id: contractorId },
    select: {
      id: true,
      role: true,
      userId: true,
      roles: { select: { role: true, status: true } },
    },
  });

  if (!contractor) {
    return { eligible: false, lessonAssigned: false, attemptAssigned: false, attemptId: null };
  }

  const approvedRoles = contractor.roles
    .filter((role) => role.status === 'approved')
    .map((role) => role.role);

  const eligible = hasWordPressDeveloperRole(contractor.role, approvedRoles);
  if (!eligible) {
    return { eligible: false, lessonAssigned: false, attemptAssigned: false, attemptId: null };
  }

  // 1. Training module assignment (with step rows so progress can be tracked).
  let lessonAssigned = false;
  const lesson = await prisma.trainingLesson.findUnique({
    where: { slug: WORDPRESS_DEVELOPER_LESSON_SLUG },
  });

  if (lesson && lesson.isActive) {
    const existingAssignment = await prisma.trainingAssignment.findUnique({
      where: { lessonId_contractorId: { lessonId: lesson.id, contractorId } },
      include: { steps: true },
    });

    if (!existingAssignment) {
      const lessonSteps = (lesson.steps as Array<{ id: string; title: string; order: number }>) || [];
      await prisma.trainingAssignment.create({
        data: {
          lessonId: lesson.id,
          contractorId,
          status: 'assigned',
          steps: { create: lessonSteps.map((step) => ({ stepId: step.id, status: 'not_started' })) },
        },
      });
      lessonAssigned = true;
    }
  }

  // 2. Separate certification quiz attempt.
  let attemptAssigned = false;
  let attemptId: string | null = null;

  const quiz = await prisma.trainingQuiz.findUnique({ where: { slug: WORDPRESS_QUIZ_SLUG } });
  if (quiz && quiz.isActive) {
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: { quizId: quiz.id, contractorId },
      orderBy: { attemptNumber: 'desc' },
    });

    if (existingAttempt) {
      attemptId = existingAttempt.id;
    } else {
      const created = await prisma.quizAttempt.create({
        data: {
          quizId: quiz.id,
          contractorId,
          attemptNumber: 1,
          status: 'assigned',
        },
      });
      attemptId = created.id;
      attemptAssigned = true;
    }
  }

  // 3. One notification covering both pieces, only when something new was assigned.
  const notifyUserId = options.notifyUserId ?? contractor.userId ?? null;
  if (notifyUserId && (lessonAssigned || attemptAssigned)) {
    const messageParts: string[] = [];
    if (lessonAssigned) messageParts.push('the WordPress Developer training module');
    if (attemptAssigned) messageParts.push('the separate certification quiz');
    await createNotification({
      userId: notifyUserId,
      type: 'training_assigned',
      title: 'WordPress Developer training assigned',
      message: `You have been assigned ${messageParts.join(' and ')}. Pass the quiz at 80% to unlock the certified pay tier.`,
      link: '/contractor/wordpress-developer',
    }).catch(() => {});
  }

  return { eligible, lessonAssigned, attemptAssigned, attemptId };
}
