import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse, forbiddenResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

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

    await logAudit(user, { action: 'sow.create', method: 'POST', path: '/api/sows', entity: 'SOW', entityId: sow.id, metadata: { contractorId, rate: parseFloat(rate), rateType } });

    const contractorUser = await prisma.user.findFirst({ where: { contractorId } });
    if (contractorUser) {
      await createNotification({
        userId: contractorUser.id,
        type: 'sow_created',
        title: 'New Statement of Work',
        message: 'A new Statement of Work has been created for you.',
        link: '/contractor/sows',
      });
    }

    return NextResponse.json(sow, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create SOW' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { id, status, deliverables, rate, rateType, paymentSchedule, startDate, endDate, specialEquipment, software } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    if (user.role === 'contractor') {
      const existing = await prisma.sOW.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: 'SOW not found' }, { status: 404 });
      if (existing.contractorId !== user.contractorId) return forbiddenResponse();
      if (status !== undefined || rate !== undefined || rateType !== undefined || paymentSchedule !== undefined || startDate !== undefined) {
        return forbiddenResponse('Contractors may only update deliverable statuses');
      }
    }

    const updateData: any = {};

    if (status) {
      const allowedStatuses = ['draft', 'approved', 'active', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
    }

    if (deliverables !== undefined) updateData.deliverables = deliverables;
    if (rate !== undefined) updateData.rate = parseFloat(rate);
    if (rateType !== undefined) updateData.rateType = rateType;
    if (paymentSchedule !== undefined) updateData.paymentSchedule = paymentSchedule;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate || null;
    if (specialEquipment !== undefined) updateData.specialEquipment = specialEquipment;
    if (software !== undefined) updateData.software = software;

    const sow = await prisma.sOW.update({
      where: { id },
      data: updateData,
    });

    await logAudit(user, { action: 'sow.update', method: 'PATCH', path: '/api/sows', entity: 'SOW', entityId: id, metadata: { changedKeys: Object.keys(updateData) } });

    return NextResponse.json(sow);
  } catch {
    return NextResponse.json({ error: 'Failed to update SOW' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const where = user.role === 'contractor' && user.contractorId
      ? { contractorId: user.contractorId }
      : {};

    const sows = await prisma.sOW.findMany({
      where,
      include: { contractor: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sows);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
