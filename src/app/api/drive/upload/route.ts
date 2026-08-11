import { NextResponse } from 'next/server';
import { normalizeDriveId } from '@/lib/drive';
import { uploadFileToFolder, driveConfigured } from '@/lib/driveService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!driveConfigured()) {
      return NextResponse.json(
        { error: 'Google Drive is not configured yet. Ask your admin to set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const folderId = normalizeDriveId(formData.get('folderId') as string);
    const files = formData.getAll('files') as File[];

    if (!folderId) {
      return NextResponse.json({ error: 'A valid Google Drive folder is required' }, { status: 400 });
    }
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploaded = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const result = await uploadFileToFolder({
        folderId,
        filename: file.name,
        buffer: Buffer.from(bytes),
        mimeType: file.type || 'application/octet-stream',
      });
      uploaded.push(result);
    }

    return NextResponse.json({ files: uploaded });
  } catch (error: any) {
    const message = error?.message || 'Failed to upload to Google Drive';
    const status = /permission|Forbidden|insufficient|not shared/i.test(message) ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
