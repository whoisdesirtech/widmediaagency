import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { contractId, signerRole, signerName, signerEmail, signatureData } = await req.json();

    if (!contractId || !signerRole || !signerName || !signatureData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const signature = await prisma.signature.create({
      data: {
        contractId,
        signerRole,
        signerName,
        signerEmail: signerEmail || '',
        signatureData,
      },
    });

    const sigCount = await prisma.signature.count({ where: { contractId } });
    if (sigCount >= 2) {
      await prisma.assembledContract.update({
        where: { id: contractId },
        data: { status: 'active' },
      });
    }

    return NextResponse.json(signature, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 });
  }
}
