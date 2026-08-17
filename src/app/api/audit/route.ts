import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isNextResponse } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await requireAdmin();
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 500);
    const action = searchParams.get('action');
    const entity = searchParams.get('entity');
    const entityId = searchParams.get('entityId');

    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const rows = logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      userEmail: l.userEmail,
      role: l.role,
      action: l.action,
      method: l.method,
      path: l.path,
      entity: l.entity,
      entityId: l.entityId,
      ip: l.ip,
      metadata: l.metadata ? JSON.parse(l.metadata) : null,
      createdAt: l.createdAt,
    }));

    return NextResponse.json(rows);
  } catch (error) {
    console.error('[AUDIT_READ]', error);
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
