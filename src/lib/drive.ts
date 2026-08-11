const FOLDER_URL_RE = /\/drive\/folders\/([\w-]+)/;
const FILE_URL_RE = /\/file\/d\/([\w-]+)/;
const OPEN_ID_RE = /[?&]id=([\w-]+)/;
const BARE_ID_RE = /^([\w-]{8,})/;

export function normalizeDriveId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  const urlMatch = value.match(FOLDER_URL_RE) || value.match(FILE_URL_RE);
  if (urlMatch) return urlMatch[1];

  const openIdMatch = value.match(OPEN_ID_RE);
  if (openIdMatch) return openIdMatch[1];

  const bareMatch = value.match(BARE_ID_RE);
  if (bareMatch) return bareMatch[1];

  return null;
}

export function driveFolderUrl(input: string | null | undefined): string | null {
  const id = normalizeDriveId(input);
  return id ? `https://drive.google.com/drive/folders/${id}` : null;
}

export function driveFolderEmbedUrl(input: string | null | undefined): string | null {
  const id = normalizeDriveId(input);
  return id ? `https://drive.google.com/embeddedfolderview?id=${id}#grid` : null;
}

export function driveFileUrl(input: string | null | undefined): string | null {
  const id = normalizeDriveId(input);
  return id ? `https://drive.google.com/file/d/${id}/view` : null;
}

export function driveFilePreviewUrl(input: string | null | undefined): string | null {
  const id = normalizeDriveId(input);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

export function driveFileDirectUrl(input: string | null | undefined): string | null {
  const id = normalizeDriveId(input);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : null;
}
