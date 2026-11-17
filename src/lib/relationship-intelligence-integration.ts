import { prisma } from '@/lib/prisma';
import {
  DEFAULT_THRESHOLDS,
  evaluateMany,
  evaluateRelationship,
} from '@/lib/relationship-intelligence';
import type {
  InteractionEvent,
  RelationshipContext,
  RelationshipIntelligenceThresholds,
  RelationshipMoment,
  RelationshipReport,
} from '@/lib/relationship-intelligence';

export async function evaluateClient(
  clientId: string,
  options: {
    now?: Date;
    thresholds?: RelationshipIntelligenceThresholds;
  } = {}
): Promise<RelationshipReport | null> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      messageThreads: {
        select: {
          messages: {
            select: {
              createdAt: true,
              calendarEventTitle: true,
              calendarEventStartsAt: true,
            },
          },
        },
      },
    },
  });

  if (!client) return null;

  const interactions: InteractionEvent[] = [];
  const moments: RelationshipMoment[] = [];
  for (const thread of client.messageThreads) {
    for (const message of thread.messages) {
      interactions.push({ at: message.createdAt, source: 'message' });
      if (message.calendarEventStartsAt) {
        moments.push({
          at: message.calendarEventStartsAt,
          type: message.calendarEventTitle ?? 'calendar event',
          source: 'message',
        });
      }
    }
  }

  const context: RelationshipContext = {
    id: client.id,
    kind: 'client',
    name: client.name,
    email: client.email,
    status: client.status,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    interactions,
    upcomingMoments: moments,
  };

  return evaluateRelationship(context, options.now ?? new Date(), options.thresholds ?? DEFAULT_THRESHOLDS);
}

export async function evaluateProspect(
  prospectId: string,
  options: {
    now?: Date;
    thresholds?: RelationshipIntelligenceThresholds;
  } = {}
): Promise<RelationshipReport | null> {
  const prospect = await prisma.prospect.findUnique({
    where: { id: prospectId },
    select: {
      id: true,
      name: true,
      primaryContactEmail: true,
      status: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!prospect) return null;

  const context: RelationshipContext = {
    id: prospect.id,
    kind: 'prospect',
    name: prospect.name,
    email: prospect.primaryContactEmail,
    status: prospect.status,
    ownerId: prospect.ownerId,
    createdAt: prospect.createdAt,
    updatedAt: prospect.updatedAt,
    interactions: [],
    upcomingMoments: [],
  };

  return evaluateRelationship(context, options.now ?? new Date(), options.thresholds ?? DEFAULT_THRESHOLDS);
}

export async function bookOfBusiness(
  agencyId: string,
  options: {
    now?: Date;
    thresholds?: RelationshipIntelligenceThresholds;
  } = {}
): Promise<RelationshipReport[]> {
  const [clients, prospects] = await Promise.all([
    prisma.client.findMany({
      where: { agencyId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        messageThreads: {
          select: {
            messages: {
              select: {
                createdAt: true,
                calendarEventTitle: true,
                calendarEventStartsAt: true,
              },
            },
          },
        },
      },
    }),
    prisma.prospect.findMany({
      where: { agencyId },
      select: {
        id: true,
        name: true,
        primaryContactEmail: true,
        status: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    }),
  ]);

  const now = options.now ?? new Date();
  const thresholds = options.thresholds ?? DEFAULT_THRESHOLDS;

  const clientContexts: RelationshipContext[] = clients.map((client) => {
    const interactions: InteractionEvent[] = [];
    const moments: RelationshipMoment[] = [];
    for (const thread of client.messageThreads) {
      for (const message of thread.messages) {
        interactions.push({ at: message.createdAt, source: 'message' });
        if (message.calendarEventStartsAt) {
          moments.push({
            at: message.calendarEventStartsAt,
            type: message.calendarEventTitle ?? 'calendar event',
            source: 'message',
          });
        }
      }
    }
    return {
      id: client.id,
      kind: 'client' as const,
      name: client.name,
      email: client.email,
      status: client.status,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      interactions,
      upcomingMoments: moments,
    };
  });

  const prospectContexts: RelationshipContext[] = prospects.map((prospect) => ({
    id: prospect.id,
    kind: 'prospect' as const,
    name: prospect.name,
    email: prospect.primaryContactEmail,
    status: prospect.status,
    ownerId: prospect.ownerId,
    createdAt: prospect.createdAt,
    updatedAt: prospect.updatedAt,
    interactions: [],
    upcomingMoments: [],
  }));

  return evaluateMany([...clientContexts, ...prospectContexts], now, thresholds);
}