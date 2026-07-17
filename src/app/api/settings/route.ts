import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let agency = await prisma.agency.findFirst();
    if (!agency) {
      agency = await prisma.agency.create({
        data: { name: 'WhoIsDésir® Media Agency' },
      });
    }
    return NextResponse.json({
      name: agency.name,
      homeJurisdiction: agency.homeJurisdiction,
      communicationTools: JSON.parse(agency.communicationTools || '[]'),
      responseTimeDefault: agency.responseTimeDefault,
      urgentResponseTime: agency.urgentResponseTime,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    let agency = await prisma.agency.findFirst();
    if (!agency) {
      agency = await prisma.agency.create({ data: { name: 'WhoIsDésir® Media Agency' } });
    }

    const updated = await prisma.agency.update({
      where: { id: agency.id },
      data: {
        name: body.name || agency.name,
        homeJurisdiction: body.homeJurisdiction || agency.homeJurisdiction,
        communicationTools: JSON.stringify(body.communicationTools || []),
        responseTimeDefault: body.responseTimeDefault || agency.responseTimeDefault,
        urgentResponseTime: body.urgentResponseTime || agency.urgentResponseTime,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
