import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pass = '';
  for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

const GENERIC_MESSAGE = 'If an account exists for that email, a new password has been sent.';
const UNAVAILABLE_MESSAGE = 'Password reset is temporarily unavailable.';

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function POST(req: Request) {
  try {
    if (!(await rateLimit(`reset:${clientKey(req)}`, 5, 15 * 60 * 1000))) return tooManyRequests();

    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // A reset is only useful if the new password can be delivered. Refuse before
    // changing anything when mail is unavailable, so no account is locked out and
    // no secret ever has to be logged or returned to the caller.
    if (!smtpConfigured()) {
      console.warn('[RESET_PASSWORD] SMTP is not configured; password reset is unavailable.');
      return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Burn comparable time so responses don't reveal whether an account exists.
      await bcrypt.hash(generatePassword(), 10);
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const newPassword = generatePassword();
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const previousHash = user.passwordHash;

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: `"WhoIsDésir® Media" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Your password has been reset',
        text: `Hello ${user.name},\n\nYour password has been reset.\n\nNew password: ${newPassword}\n\nPlease sign in and change it.\n\n— WhoIsDésir® Media Agency`,
      });
    } catch {
      // Roll back so the account keeps a password the owner actually knows.
      await prisma.user
        .update({ where: { id: user.id }, data: { passwordHash: previousHash } })
        .catch(() => undefined);
      console.error('[RESET_PASSWORD] Failed to send reset email for user', user.id);
      // Same generic response as the unknown-account path to avoid enumeration.
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('[RESET_PASSWORD]', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
