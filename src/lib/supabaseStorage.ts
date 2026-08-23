const BUCKET = 'uploads';

export function supabaseStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    ...extra,
  };
}

function baseUrl(): string {
  return `${process.env.SUPABASE_URL}/storage/v1`;
}

export async function ensureBucket(): Promise<void> {
  const res = await fetch(`${baseUrl()}/bucket`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name: BUCKET, public: false }),
  });
  // 409 = bucket already exists; 200 = created here
  if (!res.ok && res.status !== 409) {
    throw new Error(`Failed to ensure storage bucket (${res.status})`);
  }
}

export async function uploadObject(path: string, buffer: Buffer, contentType: string): Promise<void> {
  await ensureBucket();
  const res = await fetch(`${baseUrl()}/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': contentType }),
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    throw new Error(`Storage upload failed (${res.status})`);
  }
}

export async function deleteObject(path: string): Promise<void> {
  const res = await fetch(`${baseUrl()}/object/${BUCKET}/${path}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Storage delete failed (${res.status})`);
  }
}

export async function signUrl(path: string, expiresInSeconds = 60): Promise<string> {
  const res = await fetch(`${baseUrl()}/object/sign/${BUCKET}/${path}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ expiresIn: expiresInSeconds }),
  });
  if (!res.ok) {
    throw new Error(`Storage sign failed (${res.status})`);
  }
  const data = (await res.json()) as { signedURL?: string };
  if (!data.signedURL) {
    throw new Error('Storage sign returned no URL');
  }
  return `${baseUrl()}${data.signedURL}`;
}
