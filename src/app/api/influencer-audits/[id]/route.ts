import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const audit = await prisma.influencerAudit.findUnique({
      where: { id: params.id },
      include: {
        influencer: true,
        auditor: { select: { id: true, name: true, email: true } },
        scores: true,
        brandKit: {
          include: {
            sections: true,
          },
        },
      },
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    return NextResponse.json(audit);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audit' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { status, overallScore, profileOptimizationScore, brandIdentityScore, contentQualityScore, contentConsistencyScore, audienceAlignmentScore, engagementScore, discoverabilityScore, professionalReadinessScore, brandPartnershipReadinessScore, findings, recommendations, aiGenerated, aiModel, notes, brandKitId } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (overallScore !== undefined) updateData.overallScore = overallScore;
    if (profileOptimizationScore !== undefined) updateData.profileOptimizationScore = profileOptimizationScore;
    if (brandIdentityScore !== undefined) updateData.brandIdentityScore = brandIdentityScore;
    if (contentQualityScore !== undefined) updateData.contentQualityScore = contentQualityScore;
    if (contentConsistencyScore !== undefined) updateData.contentConsistencyScore = contentConsistencyScore;
    if (audienceAlignmentScore !== undefined) updateData.audienceAlignmentScore = audienceAlignmentScore;
    if (engagementScore !== undefined) updateData.engagementScore = engagementScore;
    if (discoverabilityScore !== undefined) updateData.discoverabilityScore = discoverabilityScore;
    if (professionalReadinessScore !== undefined) updateData.professionalReadinessScore = professionalReadinessScore;
    if (brandPartnershipReadinessScore !== undefined) updateData.brandPartnershipReadinessScore = brandPartnershipReadinessScore;
    if (findings !== undefined) updateData.findings = JSON.stringify(findings);
    if (recommendations !== undefined) updateData.recommendations = JSON.stringify(recommendations);
    if (aiGenerated !== undefined) updateData.aiGenerated = aiGenerated;
    if (aiModel !== undefined) updateData.aiModel = aiModel;
    if (notes !== undefined) updateData.notes = notes;
    if (brandKitId !== undefined) updateData.brandKitId = brandKitId || null;

    const audit = await prisma.influencerAudit.update({
      where: { id: params.id },
      data: updateData,
      include: {
        influencer: { select: { id: true, name: true, platform: true, username: true } },
        auditor: { select: { id: true, name: true, email: true } },
        scores: true,
        brandKit: {
          select: { id: true, status: true, completionPercent: true },
        },
      },
    });

    return NextResponse.json(audit);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update audit' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    await prisma.influencerAudit.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete audit' }, { status: 500 });
  }
}
