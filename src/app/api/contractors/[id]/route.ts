import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { id: params.id },
      include: { sows: true, assembledContracts: true },
    });
    if (!contractor) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(contractor);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contractor' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const contractor = await prisma.contractor.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(contractor);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contractor' }, { status: 500 });
  }
}
