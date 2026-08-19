import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff, isNextResponse } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const body = await req.json();
    const { clientId, invoiceNumber, description, project, amount, status, dueDate, paidDate } = body;

    if (!clientId || !invoiceNumber || !description || amount === undefined) {
      return NextResponse.json({ error: 'Client ID, invoice number, description, and amount are required' }, { status: 400 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        invoiceNumber,
        description,
        project: project || null,
        amount: parseFloat(amount),
        status: status || 'pending',
        dueDate: dueDate || null,
        paidDate: paidDate || null,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAdminOrStaff();
    if (isNextResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invoices);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
