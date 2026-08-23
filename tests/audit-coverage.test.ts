import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

const API_DIR = path.resolve(__dirname, '../src/app/api');

const EXEMPT_ROUTES = [
  'auth/[...nextauth]',        // NextAuth handler; signIn event logs via authOptions
  'booking',                   // documented public + rate-limited (unauthenticated)
  'plugin-lead',               // documented public + rate-limited
  'reset-password',            // documented public + rate-limited (auth.reset-password logged post-auth elsewhere)
  'proposal/checkout',         // documented public + rate-limited
  'proposal/download',         // documented public + rate-limited
  'notifications/[id]',        // self-scoped read-state housekeeping (intentional exclusion)
  'notifications/read-all',    // self-scoped read-state housekeeping (intentional exclusion)
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry === 'route.ts') out.push(full);
  }
  return out;
}

function relRoute(file: string): string {
  return path.relative(API_DIR, file).replace(/\/route\.ts$/, '').replace(/\\/g, '/');
}

const MUTATING = /export\s+async\s+function\s+(POST|PATCH|PUT|DELETE)\s*\(/;
const HAS_LOGAUDIT = /logAudit\s*\(/;
const GUARD_RE = /requireAuth\(|requireAdmin|requireStaff|requireContractor|requireClient|requireManagerOrAbove|requireReviewerOrAbove|requireDeveloperOrAbove|requireIntern/;

describe('audit log coverage contract', () => {
  const routes = walk(API_DIR);

  it('discovers the expected number of route files', () => {
    expect(routes.length).toBeGreaterThanOrEqual(53);
  });

  it('every guarded mutating handler calls logAudit (or is explicitly exempt)', () => {
    const violations: string[] = [];
    for (const file of routes) {
      const rel = relRoute(file);
      if (EXEMPT_ROUTES.includes(rel)) continue;
      const src = readFileSync(file, 'utf8');
      if (!MUTATING.test(src)) continue;

      const handlers = src.split(/(?=export async function)/);
      for (const h of handlers) {
        const m = h.match(/export\s+async\s+function\s+(POST|PATCH|PUT|DELETE)\s*\(/);
        if (!m) continue;
        if (!GUARD_RE.test(h)) continue;
        if (!HAS_LOGAUDIT.test(h)) violations.push(`${rel}#${m[1]}`);
      }
    }
    expect(violations, `Mutating handlers missing logAudit:\n  ${violations.join('\n  ')}`).toEqual([]);
  });
});
