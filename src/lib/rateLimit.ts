import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Sliding-window rate limit backed by the shared database so limits hold
 * across serverless instances. Falls back to in-memory counters if the
 * database is unavailable.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const resetAt = new Date(Date.now() + windowMs);

  try {
    const rows = await prisma.$queryRaw<Array<{ count: number }>>`
      INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= NOW() THEN ${resetAt} ELSE "RateLimitBucket"."resetAt" END
      RETURNING "count"`;
    return (rows[0]?.count ?? 1) <= limit;
  } catch (error) {
    console.error('[RATE_LIMIT] db backend unavailable, using memory fallback:', error instanceof Error ? error.message : error);
    return memoryRateLimit(key, limit, windowMs);
  }
}

function memoryRateLimit(key: string, limit: number, windowMs: number): boolean {
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
