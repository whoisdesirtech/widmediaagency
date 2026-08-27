import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const MESSAGE_ROLES = ['admin', 'staff', 'client', 'contractor'];

function unreadCountFor(
  messages: { senderType: string; createdAt: Date }[],
  lastReadAt: Date | null,
  viewerType: string
): number {
  if (!lastReadAt) return messages.filter((m) => m.senderType !== viewerType).length;
  return messages.filter(
    (m) => m.senderType !== viewerType && m.createdAt > lastReadAt
  ).length;
}

export async function GET() {
  try {
    const user = await requireAuth(MESSAGE_ROLES);
    if (isNextResponse(user)) return user;

    if (user.role === 'client') {
      if (!user.clientId) return NextResponse.json({ error: 'Client not found' }, { status: 400 });
      const threads = await prisma.messageThread.findMany({
        where: { clientId: user.clientId },
        include: {
          client: { select: { id: true, name: true } },
          contractor: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { lastMessageAt: 'desc' },
      });
      return NextResponse.json(threads);
    }

    if (user.role === 'contractor') {
      if (!user.contractorId) return NextResponse.json({ error: 'Contractor not found' }, { status: 400 });
      const threads = await prisma.messageThread.findMany({
        where: { contractorId: user.contractorId },
        include: {
          client: { select: { id: true, name: true } },
          contractor: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { lastMessageAt: 'desc' },
      });
      return NextResponse.json(threads);
    }

    if (!user.agencyId) return NextResponse.json({ error: 'Agency not found' }, { status: 400 });
    const threads = await prisma.messageThread.findMany({
      where: { agencyId: user.agencyId },
      include: {
        client: { select: { id: true, name: true } },
        contractor: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
    return NextResponse.json(threads);
  } catch (error) {
    console.error('List threads error:', error);
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['admin', 'staff']);
    if (isNextResponse(user)) return user;

    if (!user.agencyId) return NextResponse.json({ error: 'Agency not found' }, { status: 400 });

    const body = await req.json();
    const { clientId, contractorId, projectId, title, body: firstMessage } = body;

    if (!clientId || !title) {
      return NextResponse.json({ error: 'clientId and title are required' }, { status: 400 });
    }

    const client = await prisma.client.findFirst({ where: { id: clientId, agencyId: user.agencyId } });
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    if (contractorId) {
      const contractor = await prisma.contractor.findFirst({
        where: { id: contractorId, agencyId: user.agencyId },
      });
      if (!contractor) return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    if (projectId) {
      const project = await prisma.project.findFirst({ where: { id: projectId, clientId } });
      if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const thread = await prisma.messageThread.create({
      data: {
        agencyId: user.agencyId,
        clientId,
        contractorId: contractorId || null,
        projectId: projectId || null,
        title,
        messages: firstMessage
          ? {
              create: {
                senderUserId: user.id,
                senderType: 'admin',
                senderName: user.name,
                body: firstMessage,
              },
            }
          : undefined,
      },
      include: { client: { select: { id: true, name: true } } },
    });

    await logAudit(user, {
      action: 'thread.create',
      method: 'POST',
      path: '/api/messages/threads',
      entity: 'MessageThread',
      entityId: thread.id,
      metadata: { clientId, contractorId: contractorId || null, title },
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Create thread error:', error);
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
  }
}