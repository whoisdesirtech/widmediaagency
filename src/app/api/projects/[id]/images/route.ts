import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];
    const projectName = formData.get('projectName') as string || 'project';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const existingImages = JSON.parse(project.images || '[]');
    const newImages = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split('.').pop() || 'jpg';
      const safeName = projectName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const filename = `${safeName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filepath = path.join(process.cwd(), 'public', 'uploads', 'projects', filename);

      await writeFile(filepath, buffer);

      newImages.push({
        url: `/uploads/projects/${filename}`,
        name: file.name,
        uploadedAt: new Date().toISOString(),
      });
    }

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: { images: JSON.stringify([...existingImages, ...newImages]) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const images = JSON.parse(project.images || '[]');
    const filtered = images.filter((img: any) => img.url !== imageUrl);

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: { images: JSON.stringify(filtered) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
