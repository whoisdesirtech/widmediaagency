import path from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { supabaseStorageConfigured, uploadObject, deleteObject } from './supabaseStorage';

const LOCAL_ROOT = path.resolve(process.cwd(), 'public', 'uploads');

export type StorageBackend = 'supabase' | 'local';

export function storageBackend(): StorageBackend {
  return supabaseStorageConfigured() ? 'supabase' : 'local';
}

/**
 * Persist a file under `<scope>/<filename>`.
 * Returns the public-facing URL for the stored file:
 * - supabase: /api/files/<scope>/<filename> (served via auth-guarded signed redirect)
 * - local:    /uploads/<scope>/<filename>  (dev only; static from public/)
 */
export async function saveFile(scope: string, filename: string, buffer: Buffer, contentType: string): Promise<{ backend: StorageBackend; url: string; storagePath: string }> {
  const safeScope = scope.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${safeScope}/${safeName}`;

  if (storageBackend() === 'supabase') {
    await uploadObject(storagePath, buffer, contentType);
    return { backend: 'supabase', url: `/api/files/${storagePath}`, storagePath };
  }

  const dir = path.join(LOCAL_ROOT, safeScope);
  await mkdir(dir, { recursive: true });
  const filepath = path.join(dir, safeName);
  if (!filepath.startsWith(LOCAL_ROOT + path.sep)) {
    throw new Error('Invalid storage path');
  }
  await writeFile(filepath, buffer);
  return { backend: 'local', url: `/uploads/${storagePath}`, storagePath };
}

export async function removeFile(storagePath: string): Promise<void> {
  const normalized = path.posix.normalize(storagePath).replace(/^\/+/, '');
  if (normalized.startsWith('..') || normalized.includes('../')) {
    throw new Error('Invalid storage path');
  }
  if (storageBackend() === 'supabase') {
    await deleteObject(normalized);
    return;
  }
  const filepath = path.join(LOCAL_ROOT, normalized);
  if (!filepath.startsWith(LOCAL_ROOT + path.sep)) {
    throw new Error('Invalid storage path');
  }
  await unlink(filepath).catch(() => undefined);
}

export function localFilePath(storagePath: string): string {
  const normalized = path.posix.normalize(storagePath).replace(/^\/+/, '');
  const filepath = path.join(LOCAL_ROOT, normalized);
  if (!filepath.startsWith(LOCAL_ROOT + path.sep)) {
    throw new Error('Invalid storage path');
  }
  return filepath;
}
