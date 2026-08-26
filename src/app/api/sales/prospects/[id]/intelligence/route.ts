import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    if (!user.agencyId) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 400 });
    }

    const { id } = await params;

    const prospect = await prisma.prospect.findFirst({
      where: { id, agencyId: user.agencyId },
      select: { id: true },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    const intelligence = await prisma.prospectIntelligence.findUnique({
      where: { prospectId: id },
    });

    return NextResponse.json(intelligence || { prospectId: id });
  } catch (error) {
    console.error('Get prospect intelligence error:', error);
    return NextResponse.json({ error: 'Failed to fetch prospect intelligence' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    if (!user.agencyId) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 400 });
    }

    const { id } = await params;
    const body = await req.json();

    const prospect = await prisma.prospect.findFirst({
      where: { id, agencyId: user.agencyId },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    const {
      researchNotes,
      socialProfileData,
      marketFitScore,
      budgetIndicators,
      decisionMakers,
      riskFlags,
      competitiveLandscape,
    } = body;

    const intelligence = await prisma.prospectIntelligence.upsert({
      where: { prospectId: id },
      create: {
        prospectId: id,
        researchNotes: researchNotes || '',
        socialProfileData: socialProfileData || null,
        marketFitScore: marketFitScore ?? null,
        budgetIndicators: budgetIndicators || null,
        decisionMakers: decisionMakers || null,
        riskFlags: riskFlags || null,
        competitiveLandscape: competitiveLandscape || null,
        lastResearchedAt: new Date(),
      },
      update: {
        researchNotes: researchNotes ?? undefined,
        socialProfileData: socialProfileData ?? undefined,
        marketFitScore: marketFitScore ?? undefined,
        budgetIndicators: budgetIndicators ?? undefined,
        decisionMakers: decisionMakers ?? undefined,
        riskFlags: riskFlags ?? undefined,
        competitiveLandscape: competitiveLandscape ?? undefined,
        lastResearchedAt: new Date(),
      },
    });

    await logAudit(user, {
      action: 'prospectIntelligence.update',
      method: 'POST',
      path: `/api/sales/prospects/${id}/intelligence`,
      entity: 'ProspectIntelligence',
      entityId: intelligence.id,
      metadata: { prospectId: id },
    });

    return NextResponse.json(intelligence);
  } catch (error) {
    console.error('Update prospect intelligence error:', error);
    return NextResponse.json({ error: 'Failed to update prospect intelligence' }, { status: 500 });
  }
}