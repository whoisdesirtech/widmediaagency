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
        return NextResponse.json({
          email: customEmail || existingUser.email,
          password: tempPw,
          name: existingUser.name,
          message: 'Password reset. New credentials generated.',
        });
      }
    }

    const email = customEmail || `${contractor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@whodesir.com`;
    const tempPassword = generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
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

    return NextResponse.json({
      email,
      password: tempPassword,
      name: contractor.name,
      message: 'Contractor login created.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create login' }, { status: 500 });
  }
}
