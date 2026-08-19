import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { requireAuth, isNextResponse, forbiddenResponse } from '@/lib/auth';

const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    const filePath = params.path.join('/');
    
    if (filePath.includes('..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (user.role === 'contractor') {
      const parts = filePath.split('/');
      if (parts[0] !== user.contractorId) {
        return forbiddenResponse('You may only access your own uploads');
      }
    }

    const fullPath = path.join(UPLOADS_DIR, filePath);
    
    if (!fullPath.startsWith(UPLOADS_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const buffer = await readFile(fullPath);
    
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    console.error('[UPLOADS]', error?.message || error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
