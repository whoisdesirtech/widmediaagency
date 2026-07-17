import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contractorId, rate, rateType, paymentSchedule, startDate, endDate, specialEquipment, software, deliverables } = body;

    if (!contractorId || !rate || !rateType || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sow = await prisma.sOW.create({
      data: {
        contractorId,
        rate: parseFloat(rate),
        rateType,
        paymentSchedule: paymentSchedule || 'net30',
        startDate,
        endDate: endDate || null,
        specialEquipment: specialEquipment || '',
        software: software || '',
        deliverables: deliverables || '[]',
      },
    });

    return NextResponse.json(sow, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create SOW' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const allowedStatuses = ['draft', 'approved', 'active', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const sow = await prisma.sOW.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(sow);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update SOW' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sows = await prisma.sOW.findMany({
      include: { contractor: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
