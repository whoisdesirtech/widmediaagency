import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { clientId, name, type, status, fileUrl, date } = body;

    if (!clientId || !name) {
      return NextResponse.json({ error: 'Client ID and name are required' }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        clientId,
        name,
        type: type || 'document',
        status: status || 'available',
        fileUrl: fileUrl || null,
        date: date || null,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const documents = await prisma.document.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
