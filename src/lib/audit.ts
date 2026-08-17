import { prisma } from './prisma';
import { SessionUser } from './auth';

interface AuditEntry {
  action: string;
  method?: string;
  path?: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

// Best-effort logging — never throws, never blocks the request it is called from.
export async function logAudit(user: SessionUser | null, entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        role: user?.role ?? null,
        action: entry.action,
        method: entry.method ?? null,
        path: entry.path ?? null,
        entity: entry.entity ?? null,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      },
    });
  } catch (err) {
    console.error('[AUDIT] Failed to write audit log:', err);
  }
}
