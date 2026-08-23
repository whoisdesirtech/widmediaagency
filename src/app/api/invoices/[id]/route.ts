import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: body,
    });
    await logAudit(user, { action: 'Invoice.update', method: 'PATCH', path: `/api/invoices/${params.id}`, entity: 'Invoice', entityId: params.id, metadata: { fields: Object.keys(body) } });
    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    await prisma.invoice.delete({ where: { id: params.id } });
    await logAudit(user, { action: 'Invoice.delete', method: 'DELETE', path: `/api/invoices/${params.id}`, entity: 'Invoice', entityId: params.id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
