import { Prisma } from '@prisma/client';
import { logAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import {
  planAgencyLookup,
  reconcileLead,
  ReconcileRaceError,
} from '@/lib/reconcile';
import type {
  LeadKind,
  LeadRecord,
  ProspectRecord,
  ReconcileEvent,
  ReconcileInput,
  ReconcileReport,
  ReconcileResult,
  ReconcileSeam,
} from '@/lib/reconcile';

const DEFAULT_AGENCY_ID = process.env.DEFAULT_AGENCY_ID || null;

async function resolveDefaultAgency(): Promise<{ agencyId: string } | { error: string }> {
  let configuredExists = false;
  if (DEFAULT_AGENCY_ID) {
    const found = await prisma.agency.findUnique({
      where: { id: DEFAULT_AGENCY_ID },
      select: { id: true },
    });
    configuredExists = found !== null;
  }

  const totalCount = await prisma.agency.count();
  const plan = planAgencyLookup({ configuredId: DEFAULT_AGENCY_ID, configuredExists, totalCount });
  if (plan.status === 'error') return { error: plan.message };

  if (plan.fetch === 'by-id') {
    const agency = await prisma.agency.findUnique({
      where: { id: DEFAULT_AGENCY_ID as string },
      select: { id: true },
    });
    return agency ? { agencyId: agency.id } : { error: 'Configured default agency not found' };
  }

  const first = await prisma.agency.findFirst({ select: { id: true } });
  return first ? { agencyId: first.id } : { error: 'No agency configured for reconciliation' };
}

interface LeadSelection {
  id: string;
  email: string | null;
  prospectId: string | null;
  firstName?: string | null;
  lastName?: string | null;
  organization?: string | null;
  name?: string | null;
}

function proxySeam(tx: Prisma.TransactionClient, agencyId: string): ReconcileSeam {
  return {
    resolveAgency: async () => ({ agencyId }),
    findLead: async (input: ReconcileInput): Promise<LeadRecord | null> => {
      if (input.kind === 'plugin-download') {
        const lead = (await tx.pluginDownloadLead.findUnique({
          where: { id: input.leadId },
          select: { id: true, firstName: true, lastName: true, email: true, prospectId: true },
        })) as LeadSelection | null;
        return lead ? ({ ...lead, kind: 'plugin-download' } as LeadRecord) : null;
      }
      const lead = (await tx.bookingInquiry.findUnique({
        where: { id: input.leadId },
        select: { id: true, name: true, organization: true, email: true, prospectId: true },
      })) as LeadSelection | null;
      return lead ? ({ ...lead, kind: 'booking' } as LeadRecord) : null;
    },
    findMatches: async (params: { agencyId: string; email: string }): Promise<ProspectRecord[]> => {
      const matches = await tx.prospect.findMany({
        where: { agencyId: params.agencyId, primaryContactEmail: { equals: params.email, mode: 'insensitive' } },
        select: { id: true, status: true },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      });
      return matches;
    },
    createProspect: async (params: { agencyId: string; draft: import('@/lib/reconcile').ProspectDraft }) => {
      const created = await tx.prospect.create({ data: { ...params.draft, agencyId: params.agencyId }, select: { id: true } });
      return { id: created.id };
    },
    linkLead: async (params: { leadId: string; kind: LeadKind; prospectId: string }) => {
      if (params.kind === 'plugin-download') {
        const res = await tx.pluginDownloadLead.updateMany({
          where: { id: params.leadId, prospectId: null },
          data: { prospectId: params.prospectId },
        });
        return { count: res.count };
      }
      const res = await tx.bookingInquiry.updateMany({
        where: { id: params.leadId, prospectId: null },
        data: { prospectId: params.prospectId },
      });
      return { count: res.count };
    },
  };
}

function failedEvent(input: ReconcileInput, reason: string, error?: string): ReconcileEvent {
  return {
    action: 'reconcile.failed',
    status: 'failed',
    prospectId: null,
    metadata: { leadId: input.leadId, kind: input.kind, reason, ...(error ? { error } : {}) },
  };
}

function eventForResult(result: ReconcileResult, input: ReconcileInput): ReconcileEvent {
  switch (result.outcome) {
    case 'already_linked':
      return {
        action: 'reconcile.already_linked',
        status: 'approved',
        prospectId: result.prospectId,
        metadata: { leadId: input.leadId, kind: input.kind },
      };
    default:
      return failedEvent(input, 'unexpected reconciliation result');
  }
}

async function persistReport(input: ReconcileInput, report: ReconcileReport): Promise<void> {
  for (const event of report.events) {
    try {
      await prisma.agentEvent.create({
        data: {
          agent: 'reconciler',
          action: `agent.${event.action}`,
          status: event.status,
          prospectId: event.prospectId,
          inputSnapshot: { leadId: input.leadId, kind: input.kind } as Prisma.InputJsonValue,
          output: event.metadata as Prisma.InputJsonValue,
          errorMsg:
            event.action === 'reconcile.failed' && typeof event.metadata.reason === 'string'
              ? event.metadata.reason
              : null,
        },
      });
    } catch (err) {
      console.error('[RECONCILE] failed to persist AgentEvent:', err);
    }

    await logAudit(null, {
      action: `agent.${event.action}`,
      method: 'AGENT',
      path: `/agent/reconcile/${input.kind}`,
      entity: 'Prospect',
      entityId: event.prospectId ?? undefined,
      metadata: event.metadata,
    });
  }
}

async function readLeadProspectId(input: ReconcileInput): Promise<string | null> {
  if (input.kind === 'plugin-download') {
    const lead = await prisma.pluginDownloadLead.findUnique({
      where: { id: input.leadId },
      select: { prospectId: true },
    });
    return lead?.prospectId ?? null;
  }
  const lead = await prisma.bookingInquiry.findUnique({
    where: { id: input.leadId },
    select: { prospectId: true },
  });
  return lead?.prospectId ?? null;
}

export async function reconcileLeadWithPrisma(input: ReconcileInput): Promise<ReconcileResult> {
  const agency = await resolveDefaultAgency();
  if ('error' in agency) {
    const report: ReconcileReport = {
      result: { outcome: 'failed', reason: agency.error },
      events: [failedEvent(input, agency.error)],
    };
    await persistReport(input, report);
    return report.result;
  }

  try {
    const report = await prisma.$transaction(async (tx) => {
      return reconcileLead(proxySeam(tx, agency.agencyId), input);
    });
    await persistReport(input, report);
    return report.result;
  } catch (err) {
    if (err instanceof ReconcileRaceError) {
      const prospectId = await readLeadProspectId(input);
      const result: ReconcileResult =
        prospectId !== null
          ? { outcome: 'already_linked', prospectId }
          : { outcome: 'failed', reason: 'race rollback; lead not linked' };
      await persistReport(input, { result, events: [eventForResult(result, input)] });
      return result;
    }

    const reason = err instanceof Error ? err.message : 'unexpected reconciliation error';
    const report: ReconcileReport = {
      result: { outcome: 'failed', reason },
      events: [failedEvent(input, reason)],
    };
    await persistReport(input, report);
    return report.result;
  }
}

export async function reconcilePluginLead(pluginLeadId: string): Promise<ReconcileResult> {
  return reconcileLeadWithPrisma({ leadId: pluginLeadId, kind: 'plugin-download' });
}

export async function reconcileBookingInquiry(bookingInquiryId: string): Promise<ReconcileResult> {
  return reconcileLeadWithPrisma({ leadId: bookingInquiryId, kind: 'booking' });
}