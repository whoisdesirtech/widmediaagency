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

export async function POST(req: Request) {
  try {
    if (!(await rateLimit(`reset:${clientKey(req)}`, 5, 15 * 60 * 1000))) return tooManyRequests();

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Burn comparable time so responses don't reveal whether an account exists.
      await bcrypt.hash(generatePassword(), 10);
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const newPassword = generatePassword();
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
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
      } catch (emailErr) {
        console.error('Failed to send reset email:', emailErr);
      }
    } else {
      console.log(`[RESET_PASSWORD] SMTP not configured — new password for ${user.email}: ${newPassword}`);
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error: any) {
    console.error('[RESET_PASSWORD]', error?.message || error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
