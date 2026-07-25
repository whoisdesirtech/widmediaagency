import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, businessName, email, phone, googleDriveFolderId, googleDriveFolderUrl } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    let agency = await prisma.agency.findFirst();
    if (!agency) {
      agency = await prisma.agency.create({
        data: { name: 'WhoIsDésir® Media Agency' },
      });
    }

    const client = await prisma.client.create({
      data: {
        name,
        businessName: businessName || null,
        email,
        phone: phone || null,
        googleDriveFolderId: googleDriveFolderId || null,
        googleDriveFolderUrl: googleDriveFolderUrl || null,
        agencyId: agency.id,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'A client with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}
