import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeDriveId, driveFolderUrl } from '@/lib/drive';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data: any = { ...body };
    if ('driveFolderId' in data || 'driveFolderUrl' in data) {
      const cleanId = normalizeDriveId(data.driveFolderId || data.driveFolderUrl);
      if (cleanId !== null) data.driveFolderId = cleanId;
      data.driveFolderUrl = data.driveFolderUrl ? (driveFolderUrl(data.driveFolderUrl) || data.driveFolderUrl.trim()) : (cleanId ? driveFolderUrl(cleanId) : null);
    }
    const folder = await prisma.fileFolder.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(folder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.fileFolder.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
