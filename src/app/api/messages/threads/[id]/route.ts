import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createCalendarEvent } from '@/lib/calendarService';

const MESSAGE_ROLES = ['admin', 'staff', 'client', 'contractor'];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(MESSAGE_ROLES);
    if (isNextResponse(user)) return user;

    const { id } = await params;

    const scoped = await prisma.messageThread.findFirst({
      where: {
        id,
        ...(user.role === 'client'
          ? { clientId: user.clientId || undefined }
          : user.role === 'contractor'
            ? { contractorId: user.contractorId || undefined }
            : { agencyId: user.agencyId || undefined }),
      },
      include: {
        client: { select: { id: true, name: true } },
        contractor: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!scoped) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

    if (user.role === 'client') {
      await prisma.messageThread.update({ where: { id }, data: { lastReadByClientAt: new Date() } });
    } else if (user.role === 'contractor') {
      await prisma.messageThread.update({ where: { id }, data: { lastReadByContractorAt: new Date() } });
    } else {
      await prisma.messageThread.update({ where: { id }, data: { lastReadByAdminAt: new Date() } });
    }

    return NextResponse.json(scoped);
  } catch (error) {
    console.error('Get thread error:', error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(MESSAGE_ROLES);
    if (isNextResponse(user)) return user;

    const { id } = await params;
    const body = await req.json();
    const { body: text, calendar } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    const scoped = await prisma.messageThread.findFirst({
      where: {
        id,
        ...(user.role === 'client'
          ? { clientId: user.clientId || undefined }
          : user.role === 'contractor'
            ? { contractorId: user.contractorId || undefined }
            : { agencyId: user.agencyId || undefined }),
      },
    });

    if (!scoped) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

    const senderType = user.role === 'client' || user.role === 'contractor' ? user.role : 'admin';

    let eventResult: Awaited<ReturnType<typeof createCalendarEvent>> = {
      created: false,
      eventId: null,
      url: null,
    };
    if (calendar?.startsAt) {
      eventResult = await createCalendarEvent({
        title: calendar.title || `Meeting: ${scoped.title}`,
        description: text,
        startsAt: new Date(calendar.startsAt),
        endsAt: new Date(calendar.endsAt || calendar.startsAt),
      });
    }

    const message = await prisma.message.create({
      data: {
        threadId: id,
        senderUserId: user.id,
        senderType,
        senderName: user.name,
        body: text,
        calendarEventTitle: calendar?.title || (eventResult.created ? `Meeting: ${scoped.title}` : null),
        calendarEventStartsAt: calendar?.startsAt ? new Date(calendar.startsAt) : null,
        calendarEventEndsAt: calendar?.endsAt ? new Date(calendar.endsAt) : null,
        calendarEventUrl: eventResult.url,
        googleCalendarEventId: eventResult.eventId,
      },
    });

    const threadUpdate: Record<string, Date | string> = { lastMessageAt: new Date() };
    if (user.role === 'client') threadUpdate.lastReadByClientAt = new Date();
    else if (user.role === 'contractor') threadUpdate.lastReadByContractorAt = new Date();
    else threadUpdate.lastReadByAdminAt = new Date();
    await prisma.messageThread.update({ where: { id }, data: threadUpdate });

    await logAudit(user, {
      action: 'message.send',
      method: 'POST',
      path: `/api/messages/threads/${id}`,
      entity: 'Message',
      entityId: message.id,
      metadata: { threadId: id, senderType, calendarCreated: eventResult.created },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}