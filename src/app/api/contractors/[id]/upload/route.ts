import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAuth, isNextResponse, forbiddenResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { storageLimitBytes, dirBytes } from '@/lib/storage';

const ALLOWED_FIELDS = ['taxFormUrl', 'insuranceProofUrl', 'licensingProofUrl'];
const ALLOWED_EXTS = ['pdf', 'jpg', 'jpeg', 'png'];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;
    if (user.role === 'contractor' && user.contractorId !== params.id) return forbiddenResponse();

    if (params.id.includes('/') || params.id.includes('\\') || params.id.includes('..')) {
      return NextResponse.json({ error: 'Invalid contractor id' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const field = formData.get('field') as string;

    if (!file || !field) {
      return NextResponse.json({ error: 'Missing file or field' }, { status: 400 });
    }

    if (!ALLOWED_FIELDS.includes(field)) {
      return NextResponse.json({ error: 'Invalid upload field' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', params.id);
    await mkdir(uploadDir, { recursive: true });

    const used = await dirBytes(uploadDir);
    const limit = storageLimitBytes();
    if (used + file.size > limit) {
      return NextResponse.json(
        { error: `Storage limit exceeded (max ${Math.round(limit / 1048576)}MB per contractor)` },
        { status: 413 }
      );
    }

    const filename = `${field}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    if (!filepath.startsWith(uploadDir + path.sep)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const url = `/uploads/${params.id}/${filename}`;

    await prisma.contractor.update({
      where: { id: params.id },
      data: { [field]: url },
    });

    await logAudit(user, { action: 'contractor.upload', method: 'POST', path: `/api/contractors/${params.id}/upload`, entity: 'Contractor', entityId: params.id, metadata: { field, size: file.size } });

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
