import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { influencerId, name, tagline, mission, positioning, niche, targetAudience, brandPersonality, primaryColor, secondaryColor, accentColor, backgroundColor, textColor, headingFont, bodyFont, voice, tone, isDemo } = body;

    if (!influencerId) {
      return NextResponse.json({ error: 'Influencer ID is required' }, { status: 400 });
    }

    const brandKit = await prisma.brandKit.create({
      data: {
        influencerId,
        name: name || '',
        tagline: tagline || '',
        mission: mission || '',
        positioning: positioning || '',
        niche: niche || '',
        targetAudience: targetAudience || '',
        brandPersonality: brandPersonality || '',
        primaryColor: primaryColor || '#000000',
        secondaryColor: secondaryColor || '#FFFFFF',
        accentColor: accentColor || '#ED145A',
        backgroundColor: backgroundColor || '#FFFFFF',
        textColor: textColor || '#1E2233',
        headingFont: headingFont || 'Outfit',
        bodyFont: bodyFont || 'Inter',
        voice: voice || '',
        tone: tone || '',
        isDemo: isDemo || false,
      },
      include: {
        influencer: { select: { id: true, name: true, platform: true, username: true } },
      },
    });

    return NextResponse.json(brandKit, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create brand kit' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor', 'manager', 'reviewer', 'developer', 'intern']);
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const influencerId = searchParams.get('influencerId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (influencerId) where.influencerId = influencerId;
    if (status) where.status = status;

    // Interns can only see approved/published brand kits
    if (user.role === 'intern') {
      where.status = { in: ['approved', 'published'] };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { niche: { contains: search, mode: 'insensitive' } },
      ];
    }

    const brandKits = await prisma.brandKit.findMany({
      where,
      include: {
        influencer: { select: { id: true, name: true, platform: true, username: true } },
        reviewer: { select: { id: true, name: true, email: true } },
        sections: {
          select: { id: true, sectionType: true, isCompleted: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(brandKits);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch brand kits' }, { status: 500 });
  }
}
