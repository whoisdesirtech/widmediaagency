import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { sectionType, title, content, sortOrder } = body;

    if (!sectionType || !title) {
      return NextResponse.json({ error: 'Section type and title are required' }, { status: 400 });
    }

    const section = await prisma.brandKitSection.create({
      data: {
        brandKitId: params.id,
        sectionType,
        title,
        content: JSON.stringify(content || {}),
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const sections = await prisma.brandKitSection.findMany({
      where: { brandKitId: params.id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}
