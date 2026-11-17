import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
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

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Credentials are delivered to the contractor's inbox. They are never returned
 * to the browser, so they cannot leak through browser history, screenshots, or XSS.
 */
async function sendCredentialsEmail(to: string, name: string, password: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"WhoIsDésir® Media" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your WhoIsDésir® Media contractor login',
    text: [
      `Hello ${name},`,
      '',
      'A contractor account has been created for you.',
      '',
      `Email: ${to}`,
      `Temporary password: ${password}`,
      '',
      'Sign in at /login and change your password immediately.',
      'If you did not expect this email, contact the agency.',
      '',
      '— WhoIsDésir® Media Agency',
    ].join('\n'),
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (isNextResponse(admin)) return admin;

    const body = await req.json().catch(() => ({}));
    const rawCustomEmail = body?.email;

    if (rawCustomEmail !== undefined && rawCustomEmail !== null && rawCustomEmail !== '') {
      if (typeof rawCustomEmail !== 'string' || !isValidEmail(rawCustomEmail.trim())) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }
    }

    const customEmail =
      typeof rawCustomEmail === 'string' && rawCustomEmail.trim()
        ? rawCustomEmail.trim().toLowerCase()
        : undefined;

    const contractor = await prisma.contractor.findUnique({ where: { id: params.id } });
    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    if (!smtpConfigured()) {
      return NextResponse.json(
        { error: 'Email delivery is not configured. Credentials were not issued.' },
        { status: 503 }
      );
    }

    // Existing linked account: reset the password and email the new one.
    if (contractor.userId) {
      const existingUser = await prisma.user.findUnique({ where: { id: contractor.userId } });
      if (existingUser) {
        const targetEmail = customEmail || existingUser.email;

        if (targetEmail !== existingUser.email) {
          const emailOwner = await prisma.user.findUnique({ where: { email: targetEmail } });
          if (emailOwner && emailOwner.id !== existingUser.id) {
            return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
          }
        }

        const tempPw = generatePassword();
        const hash = await bcrypt.hash(tempPw, 10);

        try {
          await sendCredentialsEmail(targetEmail, existingUser.name, tempPw);
        } catch {
          return NextResponse.json(
            { error: 'Could not send credentials email. No changes were made.' },
            { status: 502 }
          );
        }

        const updateData: { passwordHash: string; email?: string } = { passwordHash: hash };
        if (customEmail) updateData.email = customEmail;
        await prisma.user.update({ where: { id: existingUser.id }, data: updateData });

        await logAudit(admin, {
          action: 'contractor.login.reset',
          method: 'POST',
          path: `/api/contractors/${params.id}/login`,
          entity: 'Contractor',
          entityId: params.id,
          metadata: { delivery: 'email' },
        });

        return NextResponse.json({
          email: targetEmail,
          name: existingUser.name,
          message: 'Password reset. Credentials emailed to the contractor.',
        });
      }
    }

    const email =
      customEmail ||
      `${contractor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@whodesir.com`;

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

    // Send before persisting so a delivery failure leaves the account untouched.
    try {
      await sendCredentialsEmail(email, contractor.name, tempPassword);
    } catch {
      return NextResponse.json(
        { error: 'Could not send credentials email. No changes were made.' },
        { status: 502 }
      );
    }

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

    await logAudit(admin, {
      action: 'contractor.login.create',
      method: 'POST',
      path: `/api/contractors/${params.id}/login`,
      entity: 'Contractor',
      entityId: params.id,
      metadata: existingByEmail ? { linkedExistingUser: true, delivery: 'email' } : { delivery: 'email' },
    });

    return NextResponse.json({
      email,
      name: contractor.name,
      message: existingByEmail
        ? 'Existing account linked. Credentials emailed to the contractor.'
        : 'Contractor login created. Credentials emailed to the contractor.',
    });
  } catch (err) {
    console.error(`[contractor-login] Failed for contractor ${params.id}:`, err);
    return NextResponse.json({ error: 'Failed to create login' }, { status: 500 });
  }
}
