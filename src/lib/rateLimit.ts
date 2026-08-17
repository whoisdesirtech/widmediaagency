import { NextResponse } from 'next/server';

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (buckets.size > 1000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= limit;
}

export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  const ip = (fwd ? fwd.split(',')[0].trim() : null) || req.headers.get('x-real-ip') || 'unknown';
  return ip;
}

export function tooManyRequests(): NextResponse {
  return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
}
