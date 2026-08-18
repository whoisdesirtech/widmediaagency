import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const influencer = await prisma.influencer.findUnique({
      where: { id: params.id },
      include: {
        audits: {
          include: {
            scores: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        brandKits: {
          include: {
            sections: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 });
    }

    return NextResponse.json(influencer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch influencer' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { name, creatorName, platform, username, profileUrl, niche, audienceDescription, followerCount, engagementRate, contentCategories, postingFrequency, visualIdentity, bioQuality, profileOptimization, contentConsistency, brandConsistency, audienceAlignment, growthOpportunities, strengths, weaknesses, recommendations, overallScore, auditDate, auditorId, status, isDemo } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (creatorName !== undefined) updateData.creatorName = creatorName;
    if (platform !== undefined) updateData.platform = platform;
    if (username !== undefined) updateData.username = username;
    if (profileUrl !== undefined) updateData.profileUrl = profileUrl;
    if (niche !== undefined) updateData.niche = niche;
    if (audienceDescription !== undefined) updateData.audienceDescription = audienceDescription;
    if (followerCount !== undefined) updateData.followerCount = followerCount;
    if (engagementRate !== undefined) updateData.engagementRate = engagementRate;
    if (contentCategories !== undefined) updateData.contentCategories = JSON.stringify(contentCategories);
    if (postingFrequency !== undefined) updateData.postingFrequency = postingFrequency;
    if (visualIdentity !== undefined) updateData.visualIdentity = visualIdentity;
    if (bioQuality !== undefined) updateData.bioQuality = bioQuality;
    if (profileOptimization !== undefined) updateData.profileOptimization = profileOptimization;
    if (contentConsistency !== undefined) updateData.contentConsistency = contentConsistency;
    if (brandConsistency !== undefined) updateData.brandConsistency = brandConsistency;
    if (audienceAlignment !== undefined) updateData.audienceAlignment = audienceAlignment;
    if (growthOpportunities !== undefined) updateData.growthOpportunities = growthOpportunities;
    if (strengths !== undefined) updateData.strengths = JSON.stringify(strengths);
    if (weaknesses !== undefined) updateData.weaknesses = JSON.stringify(weaknesses);
    if (recommendations !== undefined) updateData.recommendations = JSON.stringify(recommendations);
    if (overallScore !== undefined) updateData.overallScore = overallScore;
    if (auditDate !== undefined) updateData.auditDate = auditDate ? new Date(auditDate) : null;
    if (auditorId !== undefined) updateData.auditorId = auditorId || null;
    if (status !== undefined) updateData.status = status;
    if (isDemo !== undefined) updateData.isDemo = isDemo;

    const influencer = await prisma.influencer.update({
      where: { id: params.id },
      data: updateData,
      include: {
        audits: {
          select: { id: true, overallScore: true, status: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        brandKits: {
          select: { id: true, status: true, completionPercent: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json(influencer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update influencer' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    await prisma.influencer.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete influencer' }, { status: 500 });
  }
}
