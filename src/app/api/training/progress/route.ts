import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireContractor, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const user = await requireContractor();
    if (isNextResponse(user)) return user;

    const { assignmentId, stepId } = await req.json();
    if (!assignmentId || !stepId) {
      return NextResponse.json({ error: 'assignmentId and stepId required' }, { status: 400 });
    }

    // Verify assignment belongs to this contractor
    const assignment = await prisma.trainingAssignment.findUnique({
      where: { id: assignmentId },
      include: { lesson: true, steps: true },
    });
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    if (assignment.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify stepId is valid for this lesson
    const lessonSteps = (assignment.lesson.steps as Array<{ id: string; title: string; order: number }>) || [];
    const stepDef = lessonSteps.find(s => s.id === stepId);
    if (!stepDef) {
      return NextResponse.json({ error: 'Invalid stepId for this lesson' }, { status: 400 });
    }

    // Find or create step progress
    let stepProgress = assignment.steps.find(s => s.stepId === stepId);
    if (!stepProgress) {
      stepProgress = await prisma.trainingStepProgress.create({
        data: { assignmentId, stepId, status: 'completed', completedAt: new Date() },
      });
    } else if (stepProgress.status !== 'completed') {
      stepProgress = await prisma.trainingStepProgress.update({
        where: { id: stepProgress.id },
        data: { status: 'completed', completedAt: new Date() },
      });
    }

    // Recalculate assignment status
    const allSteps = await prisma.trainingStepProgress.findMany({
      where: { assignmentId },
    });
    const totalSteps = lessonSteps.length;
    const completedCount = allSteps.filter(s => s.status === 'completed').length;

    let newStatus = assignment.status;
    let startedAt = assignment.startedAt;
    let completedAt = assignment.completedAt;

    if (assignment.status === 'assigned' && completedCount > 0) {
      newStatus = 'in_progress';
      startedAt = new Date();
    }
    if (completedCount === totalSteps && totalSteps > 0) {
      newStatus = 'completed';
      completedAt = new Date();
    }

    await prisma.trainingAssignment.update({
      where: { id: assignmentId },
      data: { status: newStatus, startedAt, completedAt },
    });

    // Audit log
    await logAudit(user, {
      action: newStatus === 'completed' ? 'training.complete' : 'training.step_complete',
      method: 'POST',
      path: '/api/training/progress',
      entity: 'TrainingAssignment',
      entityId: assignmentId,
      metadata: { stepId, completedCount, totalSteps, status: newStatus },
    });

    return NextResponse.json({
      stepProgress,
      assignment: { status: newStatus, startedAt, completedAt },
      progress: { completed: completedCount, total: totalSteps },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
