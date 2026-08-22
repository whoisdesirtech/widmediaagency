import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pw = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) pw += chars[bytes[i] % chars.length];
  return pw;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (isNextResponse(admin)) return admin;

    const body = await req.json().catch(() => ({}));
    const customEmail = body?.email;

    const contractor = await prisma.contractor.findUnique({ where: { id: params.id } });
    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    if (contractor.userId) {
      const existingUser = await prisma.user.findUnique({ where: { id: contractor.userId } });
      if (existingUser) {
        const tempPw = generatePassword();
        const hash = await bcrypt.hash(tempPw, 10);
        const updateData: any = { passwordHash: hash };
        if (customEmail) updateData.email = customEmail;
        await prisma.user.update({ where: { id: existingUser.id }, data: updateData });
        await logAudit(admin, { action: 'contractor.login.reset', method: 'POST', path: `/api/contractors/${params.id}/login`, entity: 'Contractor', entityId: params.id });
        return NextResponse.json({
          email: customEmail || existingUser.email,
          password: tempPw,
          name: existingUser.name,
          message: 'Password reset. New credentials generated.',
        });
      }
    }

    const email = customEmail || `${contractor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@whodesir.com`;

    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail && existingByEmail.role !== 'contractor') {
      return NextResponse.json({ error: 'Email is already used by a non-contractor account' }, { status: 409 });
    }
    if (existingByEmail && existingByEmail.agencyId && existingByEmail.agencyId !== contractor.agencyId) {
      return NextResponse.json({ error: 'Email is already used in another agency' }, { status: 409 });
    }
    if (existingByEmail && existingByEmail.contractorId && existingByEmail.contractorId !== contractor.id) {
      return NextResponse.json({ error: 'Email is already linked to another contractor' }, { status: 409 });
    }

    const tempPassword = generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = existingByEmail
      ? await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { passwordHash, contractorId: contractor.id },
        })
      : await prisma.user.create({
          data: {
            email,
            passwordHash,
            name: contractor.name,
            role: 'contractor',
            agencyId: contractor.agencyId,
            contractorId: contractor.id,
          },
        });

    await prisma.contractor.update({
      where: { id: contractor.id },
      data: { userId: user.id },
    });

    // Auto-assign contractor-onboarding lesson
    const onboardingLesson = await prisma.trainingLesson.findUnique({ where: { slug: 'contractor-onboarding' } });
    if (onboardingLesson && onboardingLesson.isActive) {
      const existingAssignment = await prisma.trainingAssignment.findUnique({
        where: { lessonId_contractorId: { lessonId: onboardingLesson.id, contractorId: contractor.id } },
      });
      if (!existingAssignment) {
        const lessonSteps = (onboardingLesson.steps as Array<{ id: string; title: string; order: number }>) || [];
        const assignment = await prisma.trainingAssignment.create({
          data: {
            lessonId: onboardingLesson.id,
            contractorId: contractor.id,
            steps: { create: lessonSteps.map(step => ({ stepId: step.id, status: 'not_started' })) },
          },
        });
        await createNotification({
          userId: user.id,
          type: 'training_assigned',
          title: 'New Training Assignment',
          message: `${onboardingLesson.title} has been assigned to you.`,
          link: '/contractor/training',
        });
        await logAudit(admin, {
          action: 'training.assign', method: 'POST',
          path: `/api/contractors/${params.id}/login`,
          entity: 'TrainingAssignment', entityId: assignment.id,
          metadata: { lessonSlug: 'contractor-onboarding', autoAssigned: true },
        });
      }
    }

    await logAudit(admin, { action: 'contractor.login.create', method: 'POST', path: `/api/contractors/${params.id}/login`, entity: 'Contractor', entityId: params.id, metadata: existingByEmail ? { linkedExistingUser: true } : undefined });

    return NextResponse.json({
      email,
      password: tempPassword,
      name: contractor.name,
      message: existingByEmail ? 'Existing account linked. New credentials generated.' : 'Contractor login created.',
    });
  } catch (err) {
    console.error(`[contractor-login] Failed for contractor ${params.id}:`, err);
    return NextResponse.json({ error: 'Failed to create login' }, { status: 500 });
  }
}
