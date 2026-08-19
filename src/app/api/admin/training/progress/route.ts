import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const contractorId = searchParams.get('contractorId');

    const where: Record<string, unknown> = {};
    if (contractorId) where.contractorId = contractorId;

    const assignments = await prisma.trainingAssignment.findMany({
      where,
      include: {
        lesson: true,
        contractor: { select: { id: true, name: true, businessName: true } },
        steps: true,
        githubRepository: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = assignments.map(a => {
      const steps = (a.lesson.steps as Array<{ id: string; title: string; order: number }>) || [];
      const totalSteps = steps.length;
      const completedSteps = a.steps.filter(s => s.status === 'completed').length;
      const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      return {
        id: a.id,
        status: a.status,
        assignedAt: a.assignedAt,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        progress,
        completedSteps,
        totalSteps,
        contractor: a.contractor,
        lesson: {
          id: a.lesson.id,
          slug: a.lesson.slug,
          title: a.lesson.title,
          targetRole: a.lesson.targetRole,
          requiresGithub: a.lesson.requiresGithub,
        },
        steps: a.steps.map(s => ({
          stepId: s.stepId,
          status: s.status,
          completedAt: s.completedAt,
        })),
        githubRepository: a.githubRepository ? {
          repoName: a.githubRepository.repoName,
          repoUrl: a.githubRepository.repoUrl,
          status: a.githubRepository.status,
        } : null,
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch training progress' }, { status: 500 });
  }
}
