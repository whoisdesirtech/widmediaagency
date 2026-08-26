import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const {
      name,
      websiteUrl,
      instagramHandle,
      tiktokHandle,
      linkedinUrl,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,
      industry,
      category,
      source,
      ownerId,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const prospect = await prisma.prospect.create({
      data: {
        agencyId: user.agencyId!,
        name,
        websiteUrl: websiteUrl || null,
        instagramHandle: instagramHandle || null,
        tiktokHandle: tiktokHandle || null,
        linkedinUrl: linkedinUrl || null,
        primaryContactName: primaryContactName || null,
        primaryContactEmail: primaryContactEmail || null,
        primaryContactPhone: primaryContactPhone || null,
        industry: industry || null,
        category: category || null,
        source: source || null,
        ownerId: ownerId || null,
        status: 'new',
      },
      include: { intelligence: true },
    });

    await logAudit(user, {
      action: 'prospect.create',
      method: 'POST',
      path: '/api/sales/prospects',
      entity: 'Prospect',
      entityId: prospect.id,
      metadata: { name, agencyId: user.agencyId },
    });

    return NextResponse.json(prospect, { status: 201 });
  } catch (error: any) {
    console.error('Create prospect error:', error);
    return NextResponse.json({ error: 'Failed to create prospect' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { agencyId: user.agencyId };
    if (status) where.status = status;

    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        include: { intelligence: true, owner: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.prospect.count({ where }),
    ]);

    return NextResponse.json({ prospects, total, page, limit });
  } catch (error) {
    console.error('List prospects error:', error);
    return NextResponse.json({ error: 'Failed to fetch prospects' }, { status: 500 });
  }
}