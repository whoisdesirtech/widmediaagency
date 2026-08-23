import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const brandKit = await prisma.brandKit.findUnique({
      where: { id: params.id },
      include: {
        influencer: true,
        reviewer: { select: { id: true, name: true, email: true } },
        sections: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!brandKit) {
      return NextResponse.json({ error: 'Brand kit not found' }, { status: 404 });
    }

    return NextResponse.json(brandKit);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch brand kit' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { name, tagline, mission, positioning, niche, targetAudience, brandPersonality, primaryColor, secondaryColor, accentColor, backgroundColor, textColor, headingFont, bodyFont, logoUsage, photographyDirection, graphicStyle, iconography, instagramBio, tiktokBio, youtubeDescription, linkedinDescription, usernameStrategy, profileImageGuidance, coverBannerGuidance, ctaStrategy, contentPillars, voice, tone, vocabulary, captionStyle, hookStyle, ctaStyle, storytellingApproach, visualContentDirection, brandConsistencyRules, status, completionPercent, reviewerId, reviewNotes, isDemo } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (mission !== undefined) updateData.mission = mission;
    if (positioning !== undefined) updateData.positioning = positioning;
    if (niche !== undefined) updateData.niche = niche;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (brandPersonality !== undefined) updateData.brandPersonality = brandPersonality;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
    if (accentColor !== undefined) updateData.accentColor = accentColor;
    if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor;
    if (textColor !== undefined) updateData.textColor = textColor;
    if (headingFont !== undefined) updateData.headingFont = headingFont;
    if (bodyFont !== undefined) updateData.bodyFont = bodyFont;
    if (logoUsage !== undefined) updateData.logoUsage = logoUsage;
    if (photographyDirection !== undefined) updateData.photographyDirection = photographyDirection;
    if (graphicStyle !== undefined) updateData.graphicStyle = graphicStyle;
    if (iconography !== undefined) updateData.iconography = iconography;
    if (instagramBio !== undefined) updateData.instagramBio = instagramBio;
    if (tiktokBio !== undefined) updateData.tiktokBio = tiktokBio;
    if (youtubeDescription !== undefined) updateData.youtubeDescription = youtubeDescription;
    if (linkedinDescription !== undefined) updateData.linkedinDescription = linkedinDescription;
    if (usernameStrategy !== undefined) updateData.usernameStrategy = usernameStrategy;
    if (profileImageGuidance !== undefined) updateData.profileImageGuidance = profileImageGuidance;
    if (coverBannerGuidance !== undefined) updateData.coverBannerGuidance = coverBannerGuidance;
    if (ctaStrategy !== undefined) updateData.ctaStrategy = ctaStrategy;
    if (contentPillars !== undefined) updateData.contentPillars = JSON.stringify(contentPillars);
    if (voice !== undefined) updateData.voice = voice;
    if (tone !== undefined) updateData.tone = tone;
    if (vocabulary !== undefined) updateData.vocabulary = vocabulary;
    if (captionStyle !== undefined) updateData.captionStyle = captionStyle;
    if (hookStyle !== undefined) updateData.hookStyle = hookStyle;
    if (ctaStyle !== undefined) updateData.ctaStyle = ctaStyle;
    if (storytellingApproach !== undefined) updateData.storytellingApproach = storytellingApproach;
    if (visualContentDirection !== undefined) updateData.visualContentDirection = visualContentDirection;
    if (brandConsistencyRules !== undefined) updateData.brandConsistencyRules = brandConsistencyRules;
    if (status !== undefined) updateData.status = status;
    if (completionPercent !== undefined) updateData.completionPercent = completionPercent;
    if (reviewerId !== undefined) updateData.reviewerId = reviewerId || null;
    if (reviewNotes !== undefined) updateData.reviewNotes = reviewNotes;
    if (isDemo !== undefined) updateData.isDemo = isDemo;

    const brandKit = await prisma.brandKit.update({
      where: { id: params.id },
      data: updateData,
      include: {
        influencer: { select: { id: true, name: true, platform: true, username: true } },
        reviewer: { select: { id: true, name: true, email: true } },
        sections: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json(brandKit);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update brand kit' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    await prisma.brandKit.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete brand kit' }, { status: 500 });
  }
}
