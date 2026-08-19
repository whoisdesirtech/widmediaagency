import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireContractor, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createTrainingRepo, generateRepoName } from '@/lib/github';

export async function POST(req: Request) {
  try {
    const user = await requireContractor();
    if (isNextResponse(user)) return user;

    const { assignmentId } = await req.json();
    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId required' }, { status: 400 });
    }

    // Find assignment and verify ownership
    const assignment = await prisma.trainingAssignment.findUnique({
      where: { id: assignmentId },
      include: { lesson: true, githubRepository: true },
    });
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    if (assignment.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify lesson requires GitHub
    if (!assignment.lesson.requiresGithub) {
      return NextResponse.json({ error: 'This lesson does not require a GitHub repository' }, { status: 400 });
    }

    // Return existing repository if already created (idempotent)
    if (assignment.githubRepository) {
      const repo = assignment.githubRepository;
      if (repo.status === 'created' || repo.status === 'active') {
        return NextResponse.json({
          id: repo.id,
          repoName: repo.repoName,
          repoUrl: repo.repoUrl,
          owner: repo.owner,
          defaultBranch: repo.defaultBranch,
          status: repo.status,
        });
      }
      // If status is 'error', allow retry by deleting the old record
      if (repo.status === 'error') {
        await prisma.gitHubRepository.delete({ where: { id: repo.id } });
      }
      // If status is 'creating' or 'pending', return it as-is (prevent duplicate creation)
      if (repo.status === 'creating' || repo.status === 'pending') {
        return NextResponse.json({
          id: repo.id,
          repoName: repo.repoName,
          status: repo.status,
        });
      }
    }

    // Check for concurrent creation (race condition guard)
    const existingCheck = await prisma.gitHubRepository.findUnique({
      where: { assignmentId },
    });
    if (existingCheck) {
      return NextResponse.json({
        id: existingCheck.id,
        repoName: existingCheck.repoName,
        status: existingCheck.status,
      });
    }

    // Create the repository record as 'creating'
    const repoName = generateRepoName(assignment.lesson.slug);
    const repoRecord = await prisma.gitHubRepository.create({
      data: {
        assignmentId,
        repoName,
        repoUrl: '',
        owner: '',
        githubRepositoryId: 0,
        status: 'creating',
      },
    });

    // Audit: creation started
    await logAudit(user, {
      action: 'github.repository_creation_started',
      method: 'POST',
      path: '/api/training/github',
      entity: 'GitHubRepository',
      entityId: repoRecord.id,
      metadata: { assignmentId, lessonSlug: assignment.lesson.slug, repoName },
    });

    // Create the actual GitHub repository
    const result = await createTrainingRepo(repoName, assignment.lesson.title);

    if (!result.success) {
      // Mark as error, allow retry
      await prisma.gitHubRepository.update({
        where: { id: repoRecord.id },
        data: { status: 'error', errorMessage: result.error },
      });

      await logAudit(user, {
        action: 'github.repository_creation_failed',
        method: 'POST',
        path: '/api/training/github',
        entity: 'GitHubRepository',
        entityId: repoRecord.id,
        metadata: { assignmentId, error: result.error },
      });

      return NextResponse.json({ error: 'Failed to create repository', details: result.error }, { status: 500 });
    }

    // Update record with GitHub data
    const updated = await prisma.gitHubRepository.update({
      where: { id: repoRecord.id },
      data: {
        repoName: result.repoName!,
        repoUrl: result.repoUrl!,
        owner: result.owner!,
        githubRepositoryId: result.githubRepositoryId!,
        defaultBranch: result.defaultBranch || 'main',
        status: 'created',
      },
    });

    // Audit: created
    await logAudit(user, {
      action: 'github.repository_created',
      method: 'POST',
      path: '/api/training/github',
      entity: 'GitHubRepository',
      entityId: updated.id,
      metadata: { assignmentId, repoName: result.repoName, repoUrl: result.repoUrl },
    });

    return NextResponse.json({
      id: updated.id,
      repoName: updated.repoName,
      repoUrl: updated.repoUrl,
      owner: updated.owner,
      defaultBranch: updated.defaultBranch,
      status: updated.status,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create repository' }, { status: 500 });
  }
}

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
      include: { githubRepository: true },
    });
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    if (assignment.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!assignment.githubRepository) {
      return NextResponse.json({ exists: false });
    }

    const repo = assignment.githubRepository;
    return NextResponse.json({
      exists: true,
      id: repo.id,
      repoName: repo.repoName,
      repoUrl: repo.repoUrl,
      owner: repo.owner,
      defaultBranch: repo.defaultBranch,
      status: repo.status,
      errorMessage: repo.errorMessage,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch repository' }, { status: 500 });
  }
}
