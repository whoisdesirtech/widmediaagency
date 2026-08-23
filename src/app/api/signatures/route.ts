import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireAuth, isNextResponse, forbiddenResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const { contractId, signerRole, signerName, signerEmail, signatureData } = await req.json();

    if (!contractId || !signerRole || !signerName || !signatureData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contract = await prisma.assembledContract.findUnique({ where: { id: contractId } });
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    let signedUser: any = null;
    if (signerRole === 'agency') {
      const user = await requireAuth(['admin', 'staff']);
      if (isNextResponse(user)) return user;
      signedUser = user;
    } else if (signerRole === 'contractor') {
      const user = await requireAuth(['contractor']);
      if (isNextResponse(user)) return user;
      if (!user.contractorId || user.contractorId !== contract.contractorId) {
        return forbiddenResponse('You may only sign your own contracts');
      }
      signedUser = user;
    } else {
      return NextResponse.json({ error: 'Invalid signer role' }, { status: 400 });
    }

    const signatureHash = createHash('sha256')
      .update(JSON.stringify({ contractId, signerRole, signerName, signerEmail, signatureData, signedAt: new Date().toISOString() }))
      .digest('hex');

    const signature = await prisma.signature.create({
      data: {
        contractId,
        signerRole,
        signerName,
        signerEmail: signerEmail || '',
        signatureData,
        signatureHash,
      },
    });

    const sigCount = await prisma.signature.count({ where: { contractId } });
    const hasAgency = await prisma.signature.findFirst({ where: { contractId, signerRole: 'agency' } });
    const hasContractor = await prisma.signature.findFirst({ where: { contractId, signerRole: 'contractor' } });
    if (hasAgency && hasContractor) {
      await prisma.assembledContract.update({
        where: { id: contractId },
        data: { status: 'active' },
      });
    }

    await logAudit(signedUser, { action: 'signature.create', method: 'POST', path: '/api/signatures', entity: 'Signature', entityId: signature.id, metadata: { contractId, signerRole } });

    return NextResponse.json(signature, { status: 201 });
  } catch (error: any) {
    console.error('[SIGNATURE]', error?.message || error);
    return NextResponse.json({ error: 'Failed to save signature: ' + (error?.message || 'unknown') }, { status: 500 });
  }
}
