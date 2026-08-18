import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { runAuditPipeline } from '@/lib/audit-agent/modules';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { influencerId } = body;

    if (!influencerId) {
      return NextResponse.json({ error: 'Influencer ID is required' }, { status: 400 });
    }

    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
      include: {
        brandKits: { orderBy: { createdAt: 'desc' }, take: 1, include: { sections: true } },
        audits: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 });
    }

    const pipelineResult = runAuditPipeline({
      influencerName: influencer.name,
      platform: influencer.platform,
      username: influencer.username || undefined,
      niche: influencer.niche || undefined,
      followers: influencer.followerCount || undefined,
      engagementRate: influencer.engagementRate || undefined,
      brandKit: influencer.brandKits[0] || null,
    });

    const auditResult = pipelineResult.auditResult;

    const methodology = JSON.stringify({
      modules: auditResult.modules.map(m => ({
        module: m.module,
        score: m.score,
        weight: m.weight,
        breakdown: m.breakdown,
        notes: m.notes,
        recommendations: m.recommendations,
      })),
      disclaimers: auditResult.disclaimers,
      dataCompleteness: auditResult.dataCompleteness,
    });

    const audit = await prisma.influencerAudit.create({
      data: {
        influencerId: influencer.id,
        auditorId: user.id,
        overallScore: auditResult.overallScore,
        contentQualityScore: auditResult.modules.find(m => m.module === 'Content Strategy')?.score || 0,
        contentConsistencyScore: auditResult.modules.find(m => m.module === 'Visual Identity')?.score || 0,
        audienceAlignmentScore: auditResult.modules.find(m => m.module === 'Social Media Presence')?.score || 0,
        brandIdentityScore: auditResult.modules.find(m => m.module === 'Brand Identity')?.score || 0,
        discoverabilityScore: auditResult.modules.find(m => m.module === 'Market Position')?.score || 0,
        engagementScore: auditResult.modules.find(m => m.module === 'Social Media Presence')?.score || 0,
        notes: auditResult.summary,
        findings: methodology,
        aiGenerated: true,
        aiModel: 'audit-agent-v1',
        status: 'draft',
      },
      include: {
        influencer: { select: { id: true, name: true, platform: true } },
        auditor: { select: { id: true, name: true, email: true } },
      },
    });

    for (const mod of auditResult.modules) {
      await prisma.auditScore.create({
        data: {
          auditId: audit.id,
          category: mod.module,
          score: mod.score,
          weight: mod.weight,
          evidence: JSON.stringify(mod.breakdown),
          recommendation: JSON.stringify(mod.recommendations),
        },
      });
    }

    return NextResponse.json({ audit, result: auditResult, pipeline: pipelineResult.stages, readyForReview: pipelineResult.readyForReview }, { status: 201 });
  } catch (error) {
    console.error('Audit run failed:', error);
    return NextResponse.json({ error: 'Failed to run audit' }, { status: 500 });
  }
}
