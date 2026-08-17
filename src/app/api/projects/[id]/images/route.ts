import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';

const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_SIZE = 15 * 1024 * 1024;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

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

    const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', 'projects');

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: 'File too large (max 15MB)' }, { status: 400 });
      }

      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeName = projectName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const filename = `${safeName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      if (!filepath.startsWith(uploadDir + path.sep)) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }

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
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

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
