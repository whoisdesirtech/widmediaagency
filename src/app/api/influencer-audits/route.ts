import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { influencerId, auditorId, status, overallScore, profileOptimizationScore, brandIdentityScore, contentQualityScore, contentConsistencyScore, audienceAlignmentScore, engagementScore, discoverabilityScore, professionalReadinessScore, brandPartnershipReadinessScore, findings, recommendations, aiGenerated, aiModel, notes, isDemo } = body;

    if (!influencerId) {
      return NextResponse.json({ error: 'Influencer ID is required' }, { status: 400 });
    }

    const audit = await prisma.influencerAudit.create({
      data: {
        influencerId,
        auditorId: auditorId || user.id,
        status: status || 'in-progress',
        overallScore: overallScore || 0,
        profileOptimizationScore: profileOptimizationScore || 0,
        brandIdentityScore: brandIdentityScore || 0,
        contentQualityScore: contentQualityScore || 0,
        contentConsistencyScore: contentConsistencyScore || 0,
        audienceAlignmentScore: audienceAlignmentScore || 0,
        engagementScore: engagementScore || 0,
        discoverabilityScore: discoverabilityScore || 0,
        professionalReadinessScore: professionalReadinessScore || 0,
        brandPartnershipReadinessScore: brandPartnershipReadinessScore || 0,
        findings: JSON.stringify(findings || []),
        recommendations: JSON.stringify(recommendations || []),
        aiGenerated: aiGenerated || false,
        aiModel: aiModel || '',
        notes: notes || '',
        isDemo: isDemo || false,
      },
      include: {
        influencer: { select: { id: true, name: true, platform: true, username: true } },
        auditor: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(audit, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const influencerId = searchParams.get('influencerId');
    const status = searchParams.get('status');
    const auditorId = searchParams.get('auditorId');

    const where: any = {};
    if (influencerId) where.influencerId = influencerId;
    if (status) where.status = status;
    if (auditorId) where.auditorId = auditorId;

    const audits = await prisma.influencerAudit.findMany({
      where,
      include: {
        influencer: { select: { id: true, name: true, platform: true, username: true, niche: true } },
        auditor: { select: { id: true, name: true, email: true } },
        scores: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(audits);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
  }
}
