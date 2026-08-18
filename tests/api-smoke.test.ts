import { describe, it, expect } from 'vitest';

describe('Core imports', () => {
  it('should import prisma client', async () => {
    const { prisma } = await import('@/lib/prisma');
    expect(prisma).toBeDefined();
  });

  it('should import auth helpers', async () => {
    const auth = await import('@/lib/auth');
    expect(auth.requireAdmin).toBeDefined();
    expect(auth.requireAuth).toBeDefined();
    expect(auth.isNextResponse).toBeDefined();
  });

  it('should import rate limiter', async () => {
    const rateLimit = await import('@/lib/rateLimit');
    expect(rateLimit.rateLimit).toBeDefined();
  });

  it('should import audit logger', async () => {
    const { logAudit } = await import('@/lib/audit');
    expect(logAudit).toBeDefined();
  });
});

describe('Prisma schema', () => {
  it('should have expected models', async () => {
    const { PrismaClient } = await import('@prisma/client');
    const p = new PrismaClient();
    const models = Object.keys(p).filter(k => typeof (p as any)[k] === 'object' && (p as any)[k].findMany);
    expect(models).toContain('contractor');
    expect(models).toContain('client');
    expect(models).toContain('deliverable');
    expect(models).toContain('sOW');
    expect(models).toContain('contractorRole');
    await p.$disconnect();
  });
});
