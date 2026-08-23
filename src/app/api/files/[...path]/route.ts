import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { prisma } from '@/lib/prisma';
import { requireAuth, isNextResponse, forbiddenResponse } from '@/lib/auth';
import { storageBackend, localFilePath } from '@/lib/fileStorage';
import { signUrl } from '@/lib/supabaseStorage';

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
};

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'client', 'contractor']);
    if (isNextResponse(user)) return user;

    const parts = params.path.map((p) => decodeURIComponent(p));
    if (parts.length < 2 || parts.some((p) => !p || p === '.' || p === '..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const [scope, ...rest] = parts;

    // Contractor documents are private to the owning contractor + agency staff.
    if (scope !== 'projects') {
      const isStaff = user.role === 'admin' || user.role === 'staff';
      const isOwner = user.role === 'contractor' && user.contractorId && scope === user.contractorId;
      if (!isStaff && !isOwner) {
        return forbiddenResponse('You do not have access to this file');
      }
    }

    // Client portal users may only reach files attached to their own client record's projects.
    if (user.role === 'client') {
      if (!user.clientId) return forbiddenResponse('No client record linked');
      const projects = await prisma.project.findMany({ where: { clientId: user.clientId }, select: { images: true } });
      const filename = parts.join('/');
      const owns = projects.some((p) => {
        try {
          const imgs = JSON.parse(p.images || '[]');
          return Array.isArray(imgs) && imgs.some((img: any) => typeof img?.url === 'string' && (img.url === `/api/files/${filename}` || img.url.endsWith(`/${filename}`)));
        } catch {
          return false;
        }
      });
      if (!owns) return forbiddenResponse('You do not have access to this file');
    }

    const ext = (rest[rest.length - 1].split('.').pop() || '').toLowerCase();
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

    if (storageBackend() === 'supabase') {
      const signed = await signUrl(parts.join('/'), 60);
      return NextResponse.redirect(signed, 307);
    }

    const buffer = await readFile(localFilePath(parts.join('/')));
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: { 'Content-Type': contentType, 'Cache-Control': 'private, max-age=60' },
    });
  } catch (error: any) {
    console.error('[FILES]', error?.message || error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
