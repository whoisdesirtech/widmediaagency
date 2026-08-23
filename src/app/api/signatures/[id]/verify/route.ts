import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireAuth, isNextResponse, forbiddenResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const signature = await prisma.signature.findUnique({
      where: { id: params.id },
      include: { contract: { select: { id: true, contractorId: true } } },
    });
    if (!signature) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    if (user.role === 'contractor') {
      if (!user.contractorId || user.contractorId !== signature.contract?.contractorId) {
        return forbiddenResponse('You may only verify signatures on your own contracts');
      }
    }

    if (!signature.signatureHash) {
      return NextResponse.json({
        verified: false,
        verifiable: false,
        reason: 'no_hash_stored',
        signatureId: signature.id,
        contractId: signature.contractId,
        signedAt: signature.signedAt,
      });
    }

    const recomputed = createHash('sha256')
      .update(JSON.stringify({
        contractId: signature.contractId,
        signerRole: signature.signerRole,
        signerName: signature.signerName,
        signerEmail: signature.signerEmail,
        signatureData: signature.signatureData,
        signedAt: signature.signedAt.toISOString(),
      }))
      .digest('hex');

    const verified = recomputed === signature.signatureHash;

    await logAudit(user, {
      action: 'signature.verify',
      method: 'GET',
      path: `/api/signatures/${params.id}/verify`,
      entity: 'Signature',
      entityId: signature.id,
      metadata: { verified, contractId: signature.contractId, signerRole: signature.signerRole },
    });

    return NextResponse.json({
      verified,
      verifiable: true,
      signatureId: signature.id,
      contractId: signature.contractId,
      signerRole: signature.signerRole,
      signerName: signature.signerName,
      signedAt: signature.signedAt,
    });
  } catch (error: any) {
    console.error('[SIGNATURE_VERIFY]', error?.message || error);
    return NextResponse.json({ error: 'Failed to verify signature: ' + (error?.message || 'unknown') }, { status: 500 });
  }
}
