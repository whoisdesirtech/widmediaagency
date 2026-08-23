import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { name, creatorName, platform, username, profileUrl, niche, audienceDescription, followerCount, engagementRate, contentCategories, postingFrequency, isDemo } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const influencer = await prisma.influencer.create({
      data: {
        name,
        creatorName: creatorName || '',
        platform: platform || 'instagram',
        username: username || '',
        profileUrl: profileUrl || '',
        niche: niche || '',
        audienceDescription: audienceDescription || '',
        followerCount: followerCount || 0,
        engagementRate: engagementRate || 0,
        contentCategories: JSON.stringify(contentCategories || []),
        postingFrequency: postingFrequency || '',
        isDemo: isDemo || false,
      },
    });

    return NextResponse.json(influencer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create influencer' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const niche = searchParams.get('niche');

    const where: any = {};
    if (platform) where.platform = platform;
    if (status) where.status = status;
    if (niche) where.niche = { contains: niche, mode: 'insensitive' };

    const influencers = await prisma.influencer.findMany({
      where,
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
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(influencers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch influencers' }, { status: 500 });
  }
}
