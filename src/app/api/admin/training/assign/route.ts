import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const { contractorId, lessonId } = await req.json();
    if (!contractorId || !lessonId) {
      return NextResponse.json({ error: 'contractorId and lessonId required' }, { status: 400 });
    }

    // Validate contractor exists
    const contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
    if (!contractor) return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });

    // Validate lesson exists and is active
    const lesson = await prisma.trainingLesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    if (!lesson.isActive) return NextResponse.json({ error: 'Lesson is not active' }, { status: 400 });

    // Prevent duplicate assignment
    const existing = await prisma.trainingAssignment.findUnique({
      where: { lessonId_contractorId: { lessonId, contractorId } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Lesson already assigned to this contractor' }, { status: 409 });
    }

    // Create assignment with initialized step progress
    const lessonSteps = (lesson.steps as Array<{ id: string; title: string; order: number }>) || [];
    const assignment = await prisma.trainingAssignment.create({
      data: {
        lessonId,
        contractorId,
        status: 'assigned',
        steps: {
          create: lessonSteps.map(step => ({
            stepId: step.id,
            status: 'not_started',
          })),
        },
      },
      include: { lesson: true, steps: true },
    });

    // Notify contractor
    if (contractor.userId) {
      await createNotification({
        userId: contractor.userId,
        type: 'training_assigned',
        title: 'New Training Assignment',
        message: `${lesson.title} has been assigned to you.`,
        link: '/contractor/training',
      });
    }

    // Audit log
    await logAudit(user, {
      action: 'training.assign',
      method: 'POST',
      path: '/api/admin/training/assign',
      entity: 'TrainingAssignment',
      entityId: assignment.id,
      metadata: { lessonSlug: lesson.slug, contractorName: contractor.name },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to assign training' }, { status: 500 });
  }
}
