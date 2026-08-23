import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireContractor, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: Request, { params }: { params: { taskId: string } }) {
  try {
    const user = await requireContractor();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { status } = body;

    const existing = await prisma.projectTask.findUnique({
      where: { id: params.taskId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (existing.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allowedStatuses = ['in_progress', 'in_review', 'blocked'];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.projectTask.update({
      where: { id: params.taskId },
      data: updateData,
    });

    await logAudit(user, { action: 'projectTask.progress', method: 'PATCH', path: `/api/contractor/tasks/${params.taskId}`, entity: 'ProjectTask', entityId: params.taskId, metadata: { fields: Object.keys(updateData) } });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
