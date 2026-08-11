import { google, type drive_v3 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

export function driveConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
}

function getDriveClient(): drive_v3.Drive | null {
  if (!driveConfigured()) return null;

  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: SCOPES,
  });

  return google.drive({ version: 'v3', auth });
}

export interface DriveUploadResult {
  id: string;
  name: string;
  webViewLink?: string;
}

export async function uploadFileToFolder(params: {
  folderId: string;
  filename: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<DriveUploadResult> {
  const drive = getDriveClient();
  if (!drive) throw new Error('Google Drive is not configured');

  const res = await drive.files.create({
    requestBody: {
      name: params.filename,
      parents: [params.folderId],
    },
    media: {
      mimeType: params.mimeType,
      body: params.buffer,
    },
    fields: 'id,name,webViewLink',
  });

  if (!res.data.id) throw new Error('Upload failed: no file id returned');

  return {
    id: res.data.id,
    name: res.data.name || params.filename,
    webViewLink: res.data.webViewLink || undefined,
  };
}

export async function createSubfolder(params: { parentId: string; name: string }): Promise<{ id: string; name: string }> {
  const drive = getDriveClient();
  if (!drive) throw new Error('Google Drive is not configured');

  const res = await drive.files.create({
    requestBody: {
      name: params.name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [params.parentId],
    },
    fields: 'id,name',
  });

  if (!res.data.id) throw new Error('Folder creation failed');

  return { id: res.data.id, name: res.data.name || params.name };
}

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string | null;
  size: string | null;
}

export async function listFolderFiles(params: { folderId: string }): Promise<DriveFileInfo[]> {
  const drive = getDriveClient();
  if (!drive) throw new Error('Google Drive is not configured');

  const res = await drive.files.list({
    q: `'${params.folderId}' in parents and trashed = false`,
    orderBy: 'createdTime desc',
    pageSize: 200,
    fields: 'files(id,name,mimeType,webViewLink,size)',
  });

  return (res.data.files || []).map((f) => ({
    id: f.id || '',
    name: f.name || '',
    mimeType: f.mimeType || '',
    webViewLink: f.webViewLink || null,
    size: f.size || null,
  }));
}
