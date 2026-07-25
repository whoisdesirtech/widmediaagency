import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, name, icon, driveFolderId, driveFolderUrl, sortOrder } = body;

    if (!clientId || !name) {
      return NextResponse.json({ error: 'Client ID and name are required' }, { status: 400 });
    }

    const folder = await prisma.fileFolder.create({
      data: {
        clientId,
        name,
        icon: icon || '📁',
        driveFolderId: driveFolderId || null,
        driveFolderUrl: driveFolderUrl || null,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const folders = await prisma.fileFolder.findMany({
      where: { clientId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}
