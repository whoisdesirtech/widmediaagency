export type LeadKind = 'plugin-download' | 'booking';

export interface ReconcileInput {
  leadId: string;
  kind: LeadKind;
}

export interface LeadRecord {
  id: string;
  kind: LeadKind;
  email: string | null;
  prospectId: string | null;
  firstName?: string | null;
  lastName?: string | null;
  organization?: string | null;
  name?: string | null;
}

export interface ProspectRecord {
  id: string;
  status: string;
}

export interface ProspectDraft {
  name: string;
  primaryContactName: string | null;
  primaryContactEmail: string;
  primaryContactPhone: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  linkedinUrl: string | null;
  industry: string | null;
  category: string | null;
  source: string;
  status: 'new';
  ownerId: string | null;
}

export type ReconcileResult =
  | { outcome: 'linked'; prospectId: string }
  | { outcome: 'created'; prospectId: string }
  | { outcome: 'already_linked'; prospectId: string }
  | { outcome: 'ambiguous'; candidates: string[] }
  | { outcome: 'requires_review'; prospectId: string }
  | { outcome: 'failed'; reason: string };

export type ReconcileAction =
  | 'reconcile.create'
  | 'reconcile.link'
  | 'reconcile.conflict'
  | 'reconcile.requires_review'
  | 'reconcile.failed'
  | 'reconcile.already_linked';

export type ReconcileEventStatus = 'approved' | 'pending_approval' | 'failed';

export interface ReconcileEvent {
  action: ReconcileAction;
  status: ReconcileEventStatus;
  prospectId: string | null;
  metadata: Record<string, unknown>;
}

export interface ReconcileReport {
  result: ReconcileResult;
  events: ReconcileEvent[];
}

export interface ReconcileSeam {
  resolveAgency(): Promise<{ agencyId: string } | { error: string }>;
  findLead(input: ReconcileInput): Promise<LeadRecord | null>;
  findMatches(params: { agencyId: string; email: string }): Promise<ProspectRecord[]>;
  createProspect(params: { agencyId: string; draft: ProspectDraft }): Promise<{ id: string }>;
  linkLead(params: { leadId: string; kind: LeadKind; prospectId: string }): Promise<{ count: number }>;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function emailLocalPart(email: string): string {
  return email.split('@')[0] || email;
}

function fullName(parts: Array<string | null | undefined>): string {
  return parts
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

export function buildProspectDraft(lead: LeadRecord, email: string): ProspectDraft {
  if (lead.kind === 'plugin-download') {
    const name = fullName([lead.firstName, lead.lastName]);
    return {
      name: name || `Lead: ${emailLocalPart(email)}`,
      primaryContactName: name || null,
      primaryContactEmail: email,
      primaryContactPhone: null,
      websiteUrl: null,
      instagramHandle: null,
      tiktokHandle: null,
      linkedinUrl: null,
      industry: null,
      category: null,
      source: 'plugin-lead',
      status: 'new',
      ownerId: null,
    };
  }

  const org = (lead.organization ?? '').trim() || null;
  const submitter = (lead.name ?? '').trim() || null;
  return {
    name: org || submitter || `Inquiry: ${emailLocalPart(email)}`,
    primaryContactName: submitter || org,
    primaryContactEmail: email,
    primaryContactPhone: null,
    websiteUrl: null,
    instagramHandle: null,
    tiktokHandle: null,
    linkedinUrl: null,
    industry: null,
    category: null,
    source: 'booking-inquiry',
    status: 'new',
    ownerId: null,
  };
}

export function classifyMatches(matches: ProspectRecord[]): 'create' | 'link' | 'ambiguous' | 'requires_review' {
  if (matches.length === 0) return 'create';
  if (matches.length >= 2) return 'ambiguous';
  return matches[0].status === 'lost' ? 'requires_review' : 'link';
}

export class ReconcileRaceError extends Error {
  constructor() {
    super('Reconciliation race: lead was linked concurrently; the created duplicate was rolled back');
    this.name = 'ReconcileRaceError';
  }
}

function makeEvent(
  action: ReconcileAction,
  status: ReconcileEventStatus,
  prospectId: string | null,
  metadata: Record<string, unknown>
): ReconcileEvent {
  return { action, status, prospectId, metadata };
}

export async function reconcileLead(seam: ReconcileSeam, input: ReconcileInput): Promise<ReconcileReport> {
  const agency = await seam.resolveAgency();
  if ('error' in agency) {
    return {
      result: { outcome: 'failed', reason: agency.error },
      events: [makeEvent('reconcile.failed', 'failed', null, { reason: agency.error, leadId: input.leadId, kind: input.kind })],
    };
  }
  const { agencyId } = agency;

  const lead = await seam.findLead(input);
  if (!lead) {
    return {
      result: { outcome: 'failed', reason: 'lead not found' },
      events: [makeEvent('reconcile.failed', 'failed', null, { leadId: input.leadId, kind: input.kind })],
    };
  }

  const normalized = lead.email === null || lead.email.trim() === '' ? null : normalizeEmail(lead.email);
  if (!normalized) {
    return {
      result: { outcome: 'failed', reason: 'lead has no email' },
      events: [makeEvent('reconcile.failed', 'failed', null, { leadId: input.leadId, kind: input.kind })],
    };
  }

  if (lead.prospectId) {
    return {
      result: { outcome: 'already_linked', prospectId: lead.prospectId },
      events: [makeEvent('reconcile.already_linked', 'approved', lead.prospectId, { leadId: input.leadId, kind: input.kind })],
    };
  }

  const matches = await seam.findMatches({ agencyId, email: normalized });
  const decision = classifyMatches(matches);

  if (decision === 'ambiguous') {
    const candidates = matches.map((m) => m.id);
    return {
      result: { outcome: 'ambiguous', candidates },
      events: [makeEvent('reconcile.conflict', 'pending_approval', null, { leadId: input.leadId, kind: input.kind, candidates, email: normalized })],
    };
  }

  if (decision === 'requires_review') {
    const prospect = matches[0];
    return {
      result: { outcome: 'requires_review', prospectId: prospect.id },
      events: [makeEvent('reconcile.requires_review', 'pending_approval', prospect.id, { leadId: input.leadId, kind: input.kind, prospectStatus: prospect.status })],
    };
  }

  if (decision === 'create') {
    const draft = buildProspectDraft(lead, normalized);
    const created = await seam.createProspect({ agencyId, draft });
    const link = await seam.linkLead({ leadId: input.leadId, kind: input.kind, prospectId: created.id });
    if (link.count === 0) {
      throw new ReconcileRaceError();
    }
    return {
      result: { outcome: 'created', prospectId: created.id },
      events: [makeEvent('reconcile.create', 'approved', created.id, { leadId: input.leadId, kind: input.kind, source: draft.source })],
    };
  }

  const target = matches[0];
  const link = await seam.linkLead({ leadId: input.leadId, kind: input.kind, prospectId: target.id });
  if (link.count === 0) {
    return {
      result: { outcome: 'already_linked', prospectId: target.id },
      events: [makeEvent('reconcile.already_linked', 'approved', target.id, { leadId: input.leadId, kind: input.kind })],
    };
  }
  return {
    result: { outcome: 'linked', prospectId: target.id },
    events: [makeEvent('reconcile.link', 'approved', target.id, { leadId: input.leadId, kind: input.kind, prospectStatus: target.status })],
  };
}

export interface AgencyQueryInput {
  configuredId: string | null;
  configuredExists: boolean;
  totalCount: number;
}

export type AgencyQueryPlan =
  | { status: 'ok'; fetch: 'by-id' | 'first' }
  | { status: 'error'; message: string };

export function planAgencyLookup(input: AgencyQueryInput): AgencyQueryPlan {
  if (input.configuredId) {
    if (!input.configuredExists) return { status: 'error', message: 'Configured default agency not found' };
    return { status: 'ok', fetch: 'by-id' };
  }
  if (input.totalCount === 0) return { status: 'error', message: 'No agency configured for reconciliation' };
  if (input.totalCount > 1) return { status: 'error', message: 'Multiple agencies exist; set DEFAULT_AGENCY_ID to disambiguate' };
  return { status: 'ok', fetch: 'first' };
}