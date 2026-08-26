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
      include: {
        intelligence: true,
        owner: { select: { id: true, name: true, email: true } },
        agency: { select: { id: true, name: true } },
      },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    return NextResponse.json(prospect);
  } catch (error) {
    console.error('Get prospect error:', error);
    return NextResponse.json({ error: 'Failed to fetch prospect' }, { status: 500 });
  }
}

export async function PATCH(
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

    const existing = await prisma.prospect.findFirst({
      where: { id, agencyId: user.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    const allowedFields = [
      'name',
      'websiteUrl',
      'instagramHandle',
      'tiktokHandle',
      'linkedinUrl',
      'primaryContactName',
      'primaryContactEmail',
      'primaryContactPhone',
      'industry',
      'category',
      'source',
      'status',
      'ownerId',
    ];

    const data: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field] === '' ? null : body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const prospect = await prisma.prospect.update({
      where: { id },
      data,
      include: { intelligence: true, owner: { select: { id: true, name: true, email: true } } },
    });

    await logAudit(user, {
      action: 'prospect.update',
      method: 'PATCH',
      path: `/api/sales/prospects/${id}`,
      entity: 'Prospect',
      entityId: id,
      metadata: { fields: Object.keys(data) },
    });

    return NextResponse.json(prospect);
  } catch (error) {
    console.error('Update prospect error:', error);
    return NextResponse.json({ error: 'Failed to update prospect' }, { status: 500 });
  }
}