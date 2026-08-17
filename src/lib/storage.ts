import { readdir, stat } from 'fs/promises';
import path from 'path';

export function storageLimitBytes(): number {
  const mb = parseInt(process.env.STORAGE_LIMIT_MB || '500', 10);
  return (Number.isFinite(mb) && mb > 0 ? mb : 500) * 1024 * 1024;
}

export async function dirBytes(dir: string): Promise<number> {
  let total = 0;
  try {
    const entries = await readdir(dir);
    for (const entry of entries) {
      const p = path.join(dir, entry);
      const s = await stat(p);
      if (s.isDirectory()) total += await dirBytes(p);
      else total += s.size;
    }
  } catch {
    // directory may not exist yet — that's 0 bytes used
  }
  return total;
}
