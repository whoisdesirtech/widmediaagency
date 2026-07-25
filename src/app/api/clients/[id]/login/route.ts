import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pw = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) pw += chars[bytes[i] % chars.length];
  return pw;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const customEmail = body?.email;

    const client = await prisma.client.findUnique({ where: { id: params.id } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (client.userId) {
      const existingUser = await prisma.user.findUnique({ where: { id: client.userId } });
      if (existingUser) {
        const tempPw = generatePassword();
        const hash = await bcrypt.hash(tempPw, 10);
        const updateData: any = { passwordHash: hash };
        if (customEmail) updateData.email = customEmail;
        await prisma.user.update({ where: { id: existingUser.id }, data: updateData });
        return NextResponse.json({
          email: customEmail || existingUser.email,
          password: tempPw,
          name: existingUser.name,
          message: 'Password reset. New credentials generated.',
        });
      }
    }

    const email = customEmail || client.email;
    const tempPassword = generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: client.name,
        role: 'client',
        agencyId: client.agencyId,
        clientId: client.id,
      },
    });

    await prisma.client.update({
      where: { id: client.id },
      data: { userId: user.id },
    });

    return NextResponse.json({
      email,
      password: tempPassword,
      name: client.name,
      message: 'Client login created.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create login' }, { status: 500 });
  }
}
