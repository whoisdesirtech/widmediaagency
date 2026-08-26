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
      include: { intelligence: { include: { gtmAnalysis: true } } },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    return NextResponse.json(prospect.intelligence?.gtmAnalysis || null);
  } catch (error) {
    console.error('Get GTM analysis error:', error);
    return NextResponse.json({ error: 'Failed to fetch GTM analysis' }, { status: 500 });
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
      include: { intelligence: true },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    if (!prospect.intelligence) {
      return NextResponse.json({ error: 'Prospect intelligence not found. Create intelligence first.' }, { status: 404 });
    }

    const {
      strategySummary,
      pricingRecommendations,
      staffingPlan,
      timelineEstimate,
      keyRisks,
      assumptions,
      status,
    } = body;

    const gtmAnalysis = await prisma.gTMAnalysis.upsert({
      where: { prospectIntelligenceId: prospect.intelligence.id },
      create: {
        prospectIntelligenceId: prospect.intelligence.id,
        strategySummary: strategySummary || '',
        pricingRecommendations: pricingRecommendations || null,
        staffingPlan: staffingPlan || null,
        timelineEstimate: timelineEstimate || null,
        keyRisks: keyRisks || null,
        assumptions: assumptions || null,
        status: status || 'draft',
      },
      update: {
        strategySummary: strategySummary ?? undefined,
        pricingRecommendations: pricingRecommendations ?? undefined,
        staffingPlan: staffingPlan ?? undefined,
        timelineEstimate: timelineEstimate ?? undefined,
        keyRisks: keyRisks ?? undefined,
        assumptions: assumptions ?? undefined,
        status: status ?? undefined,
      },
    });

    await logAudit(user, {
      action: 'gtmAnalysis.update',
      method: 'POST',
      path: `/api/sales/prospects/${id}/gtm`,
      entity: 'GTMAnalysis',
      entityId: gtmAnalysis.id,
      metadata: { prospectId: id },
    });

    return NextResponse.json(gtmAnalysis);
  } catch (error) {
    console.error('Update GTM analysis error:', error);
    return NextResponse.json({ error: 'Failed to update GTM analysis' }, { status: 500 });
  }
}