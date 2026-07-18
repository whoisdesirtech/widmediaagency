import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pass = '';
  for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'No account found with that email' }, { status: 404 });

    const newPassword = generatePassword();
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ email: user.email, newPassword, name: user.name });
  } catch (error: any) {
    console.error('[RESET_PASSWORD]', error?.message || error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
