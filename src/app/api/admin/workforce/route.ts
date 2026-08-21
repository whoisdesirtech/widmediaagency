import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { getRoleConfig, computeReadiness, type ContractorReadiness } from '@/lib/role-training-config';

type ContractorWithRelations = {
  id: string;
  name: string;
  businessName: string;
  role: string;
  status: string;
  googleDriveFolderId: string | null;
  roles: { role: string; status: string }[];
  trainingAssignments: {
    id: string;
    status: string;
    lesson: { slug: string; requiresGithub: boolean; requiresSlack: boolean };
    steps: { status: string }[];
    githubRepository: { status: string } | null;
    slackConnection: { status: string } | null;
  }[];
  _count: { trainingAssignments: number };
};

export async function GET() {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const contractors = await prisma.contractor.findMany({
      include: {
        roles: { where: { status: 'approved' }, select: { role: true, status: true } },
        trainingAssignments: {
          include: {
            lesson: { select: { slug: true, requiresGithub: true, requiresSlack: true } },
            steps: { select: { status: true } },
            githubRepository: { select: { status: true } },
            slackConnection: { select: { status: true } },
          },
        },
        _count: { select: { trainingAssignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const projects = await prisma.project.findMany({
      where: { contractorId: { not: null } },
      select: { contractorId: true, name: true, status: true },
    });

    const tasks = await prisma.projectTask.findMany({
      where: { contractorId: { not: null }, status: { not: 'completed' } },
      select: { contractorId: true },
    });

    const contractorMap = new Map<string, { project: string | null; activeTasks: number }>();
    for (const p of projects) {
      if (p.contractorId) {
        const existing = contractorMap.get(p.contractorId) || { project: null, activeTasks: 0 };
        if (p.status !== 'complete') existing.project = p.name;
        contractorMap.set(p.contractorId, existing);
      }
    }
    for (const t of tasks) {
      if (t.contractorId) {
        const existing = contractorMap.get(t.contractorId) || { project: null, activeTasks: 0 };
        existing.activeTasks++;
        contractorMap.set(t.contractorId, existing);
      }
    }

    const workforce = (contractors as unknown as ContractorWithRelations[]).map(c => {
      const primaryRole = c.roles[0]?.role ?? c.role;
      const config = getRoleConfig(primaryRole);

      const completedLessonIds = c.trainingAssignments
        .filter(a => a.status === 'completed')
        .map(a => a.lesson.slug);

      const githubVerified = c.trainingAssignments.some(
        a => a.lesson.requiresGithub && a.githubRepository?.status === 'active'
      );
      const slackVerified = c.trainingAssignments.some(
        a => a.lesson.requiresSlack && a.slackConnection?.status === 'verified'
      );

      const workData = contractorMap.get(c.id) || { project: null, activeTasks: 0 };

      const readiness = computeReadiness({
        roleLessons: config?.lessons ?? [],
        completedLessonIds,
        githubVerified,
        slackVerified,
        integrationsRequired: config?.integrations ?? [],
        projectName: workData.project,
        activeTaskCount: workData.activeTasks,
      });

      const totalSteps = c.trainingAssignments.reduce((sum, a) => sum + a.steps.length, 0);
      const completedSteps = c.trainingAssignments.reduce(
        (sum, a) => sum + a.steps.filter(s => s.status === 'completed').length,
        0
      );

      return {
        id: c.id,
        name: c.name,
        businessName: c.businessName,
        role: primaryRole,
        allRoles: c.roles.map(r => r.role),
        status: c.status,
        trainingProgress: readiness.trainingProgress,
        totalSteps,
        completedSteps,
        totalLessons: readiness.totalLessons,
        completedLessons: readiness.completedLessons,
        githubVerified: readiness.integrationsVerified.github,
        slackVerified: readiness.integrationsVerified.slack,
        currentProject: readiness.currentProject,
        activeTasks: readiness.activeTasks,
        readiness: readiness.status,
      };
    });

    const stats = {
      total: workforce.length,
      ready: workforce.filter(c => c.readiness === 'ready').length,
      inTraining: workforce.filter(c => c.readiness === 'in_training').length,
      notStarted: workforce.filter(c => c.readiness === 'not_started').length,
    };

    return NextResponse.json({ workforce, stats });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch workforce data' }, { status: 500 });
  }
}
