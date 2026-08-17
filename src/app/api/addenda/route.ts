import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const user = await requireAdmin();
    if (isNextResponse(user)) return user;

    const addenda = await prisma.addendum.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(addenda.map(a => ({ ...a, fields: JSON.parse(a.fields) })));
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    if (isNextResponse(user)) return user;

    const { roleType, title, fields } = await req.json();
    if (!roleType || !title) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const addendum = await prisma.addendum.create({
      data: { roleType, title, fields: JSON.stringify(fields) },
    });
    await logAudit(user, { action: 'addendum.create', method: 'POST', path: '/api/addenda', entity: 'Addendum', entityId: addendum.id, metadata: { roleType, title } });
    return NextResponse.json({ ...addendum, fields }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
