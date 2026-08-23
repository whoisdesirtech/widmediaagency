import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const document = await prisma.document.update({
      where: { id: params.id },
      data: body,
    });
    await logAudit(user, { action: 'Document.update', method: 'PATCH', path: `/api/documents/${params.id}`, entity: 'Document', entityId: params.id, metadata: { fields: Object.keys(body) } });
    return NextResponse.json(document);
  } catch {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    await prisma.document.delete({ where: { id: params.id } });
    await logAudit(user, { action: 'Document.delete', method: 'DELETE', path: `/api/documents/${params.id}`, entity: 'Document', entityId: params.id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
