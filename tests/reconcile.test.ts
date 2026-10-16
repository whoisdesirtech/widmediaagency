import { describe, it, expect, vi } from 'vitest';
import {
  buildProspectDraft,
  classifyMatches,
  normalizeEmail,
  planAgencyLookup,
  reconcileLead,
  ReconcileRaceError,
} from '@/lib/reconcile';
import type { LeadKind, ReconcileInput, ReconcileSeam } from '@/lib/reconcile';

function makeInput(overrides: Partial<ReconcileInput> = {}): ReconcileInput {
  return { leadId: 'lead-1', kind: 'plugin-download', ...overrides };
}

type SeamOverrides = {
  resolveAgency?: ReconcileSeam['resolveAgency'];
  findLead?: ReconcileSeam['findLead'];
  findMatches?: ReconcileSeam['findMatches'];
  createProspect?: ReconcileSeam['createProspect'];
  linkLead?: ReconcileSeam['linkLead'];
};

function makeSeam(overrides: SeamOverrides = {}): ReconcileSeam {
  const defaults = {
    resolveAgency: async () => ({ agencyId: 'ag-1' }) as const,
    findLead: async (input: ReconcileInput) => ({
      id: input.leadId,
      kind: input.kind,
      email: 'ALICE@example.com',
      prospectId: null,
    }),
    findMatches: async () => [],
    createProspect: async () => ({ id: 'prospect-new' }),
    linkLead: async () => ({ count: 1 }),
  };
  return { ...defaults, ...overrides };
}

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Alice@Example.COM  ')).toBe('alice@example.com');
  });
});

describe('buildProspectDraft', () => {
  it('maps plugin-download leads to a named prospect', () => {
    const draft = buildProspectDraft(
      { id: 'l', kind: 'plugin-download', email: 'a@b.com', prospectId: null, firstName: ' Jane ', lastName: ' Doe ' },
      'a@b.com'
    );
    expect(draft).toMatchObject({
      name: 'Jane Doe',
      primaryContactName: 'Jane Doe',
      primaryContactEmail: 'a@b.com',
      source: 'plugin-lead',
      status: 'new',
    });
  });

  it('falls back to a derived name when the plugin lead has no name', () => {
    const draft = buildProspectDraft(
      { id: 'l', kind: 'plugin-download', email: 'sam@x.io', prospectId: null },
      'sam@x.io'
    );
    expect(draft.name).toBe('Lead: sam');
    expect(draft.primaryContactName).toBeNull();
  });

  it('prefers organization over submitter name for booking inquiries', () => {
    const draft = buildProspectDraft(
      { id: 'l', kind: 'booking', email: 'rita@corp.com', prospectId: null, organization: 'Corp', name: 'Rita' },
      'rita@corp.com'
    );
    expect(draft).toMatchObject({
      name: 'Corp',
      primaryContactName: 'Rita',
      primaryContactEmail: 'rita@corp.com',
      source: 'booking-inquiry',
      status: 'new',
    });
  });

  it('falls back to the submitter name for booking inquiries', () => {
    const draft = buildProspectDraft(
      { id: 'l', kind: 'booking', email: 'rita@corp.com', prospectId: null, name: 'Rita' },
      'rita@corp.com'
    );
    expect(draft.name).toBe('Rita');
    expect(draft.primaryContactName).toBe('Rita');
  });

  it('falls back to a derived name when a booking inquiry has no identifiers', () => {
    const draft = buildProspectDraft(
      { id: 'l', kind: 'booking', email: 'rita@corp.com', prospectId: null },
      'rita@corp.com'
    );
    expect(draft.name).toBe('Inquiry: rita');
  });
});

describe('classifyMatches', () => {
  it('creates when there are no candidates', () => {
    expect(classifyMatches([])).toBe('create');
  });

  it('links to a single non-lost candidate', () => {
    expect(classifyMatches([{ id: 'p1', status: 'accepted' }])).toBe('link');
    expect(classifyMatches([{ id: 'p1', status: 'new' }])).toBe('link');
  });

  it('flags a single lost candidate for review', () => {
    expect(classifyMatches([{ id: 'p1', status: 'lost' }])).toBe('requires_review');
  });

  it('flags multiple candidates as ambiguous', () => {
    expect(classifyMatches([{ id: 'p1', status: 'new' }, { id: 'p2', status: 'accepted' }])).toBe('ambiguous');
  });
});

describe('reconcileLead', () => {
  it('creates a prospect for a lead with no candidates and links atomically', async () => {
    const createProspect = vi.fn(async () => ({ id: 'prospect-new' }));
    const linkLead = vi.fn(async () => ({ count: 1 }));
    const report = await reconcileLead(
      makeSeam({ createProspect, linkLead, findMatches: async () => [] }),
      makeInput()
    );

    expect(report.result).toEqual({ outcome: 'created', prospectId: 'prospect-new' });
    expect(report.events).toHaveLength(1);
    expect(report.events[0]).toMatchObject({ action: 'reconcile.create', status: 'approved', prospectId: 'prospect-new' });
    expect(createProspect).toHaveBeenCalledTimes(1);
    expect(linkLead).toHaveBeenCalledWith({ leadId: 'lead-1', kind: 'plugin-download', prospectId: 'prospect-new' });
  });

  it('returns already_linked without matching when the lead is already linked', async () => {
    const findMatches = vi.fn(async () => [] as never[]);
    const report = await reconcileLead(
      makeSeam({
        findLead: async (input: ReconcileInput) => ({ id: input.leadId, kind: input.kind, email: 'a@b.com', prospectId: 'existing' }),
        findMatches,
      }),
      makeInput()
    );

    expect(report.result).toEqual({ outcome: 'already_linked', prospectId: 'existing' });
    expect(report.events[0]).toMatchObject({ action: 'reconcile.already_linked', status: 'approved' });
    expect(findMatches).not.toHaveBeenCalled();
  });

  it('links a lead to a single accepted candidate', async () => {
    const linkLead = vi.fn(async () => ({ count: 1 }));
    const report = await reconcileLead(
      makeSeam({
        findMatches: async () => [{ id: 'prospect-existing', status: 'accepted' }],
        linkLead,
      }),
      makeInput()
    );

    expect(report.result).toEqual({ outcome: 'linked', prospectId: 'prospect-existing' });
    expect(report.events[0]).toMatchObject({ action: 'reconcile.link', status: 'approved', prospectId: 'prospect-existing' });
    expect(linkLead).toHaveBeenCalledWith({ leadId: 'lead-1', kind: 'plugin-download', prospectId: 'prospect-existing' });
  });

  it('returns already_linked when the link update races a concurrent reconciler', async () => {
    const report = await reconcileLead(
      makeSeam({
        findMatches: async () => [{ id: 'prospect-existing', status: 'accepted' }],
        linkLead: async () => ({ count: 0 }),
      }),
      makeInput()
    );

    expect(report.result).toEqual({ outcome: 'already_linked', prospectId: 'prospect-existing' });
  });

  it('throws ReconcileRaceError when creating a prospect loses the race', async () => {
    const createProspect = vi.fn(async () => ({ id: 'prospect-duplicate' }));
    const seam = makeSeam({ createProspect, linkLead: async () => ({ count: 0 }) });

    await expect(reconcileLead(seam, makeInput())).rejects.toThrow(ReconcileRaceError);
    expect(createProspect).toHaveBeenCalledTimes(1);
  });

  it('flags ambiguous candidates and writes no link', async () => {
    const createProspect = vi.fn(async () => ({ id: 'nope' }));
    const linkLead = vi.fn(async () => ({ count: 1 }));
    const report = await reconcileLead(
      makeSeam({
        findMatches: async () => [{ id: 'p1', status: 'new' }, { id: 'p2', status: 'accepted' }],
        createProspect,
        linkLead,
      }),
      makeInput()
    );

    expect(report.result).toEqual({ outcome: 'ambiguous', candidates: ['p1', 'p2'] });
    expect(report.events[0]).toMatchObject({ action: 'reconcile.conflict', status: 'pending_approval', prospectId: null });
    expect(createProspect).not.toHaveBeenCalled();
    expect(linkLead).not.toHaveBeenCalled();
  });

  it('flags a single lost candidate for review and writes no link', async () => {
    const linkLead = vi.fn(async () => ({ count: 1 }));
    const report = await reconcileLead(
      makeSeam({
        findMatches: async () => [{ id: 'p-lost', status: 'lost' }],
        linkLead,
      }),
      makeInput()
    );

    expect(report.result).toEqual({ outcome: 'requires_review', prospectId: 'p-lost' });
    expect(report.events[0]).toMatchObject({ action: 'reconcile.requires_review', status: 'pending_approval', prospectId: 'p-lost' });
    expect(linkLead).not.toHaveBeenCalled();
  });

  it('fails closed when no agency can be resolved and reads no lead', async () => {
    const findLead = vi.fn(async () => null);
    const report = await reconcileLead(
      makeSeam({ resolveAgency: async () => ({ error: 'No agency configured for reconciliation' }), findLead }),
      makeInput()
    );

    expect(report.result).toEqual({ outcome: 'failed', reason: 'No agency configured for reconciliation' });
    expect(report.events[0]).toMatchObject({ action: 'reconcile.failed', status: 'failed' });
    expect(findLead).not.toHaveBeenCalled();
  });

  it('fails when the lead cannot be found', async () => {
    const report = await reconcileLead(makeSeam({ findLead: async () => null }), makeInput());

    expect(report.result).toEqual({ outcome: 'failed', reason: 'lead not found' });
    expect(report.events[0]).toMatchObject({ action: 'reconcile.failed', status: 'failed' });
  });

  it('fails when the lead has no email', async () => {
    const report = await reconcileLead(
      makeSeam({
        findLead: async (input: ReconcileInput) => ({ id: input.leadId, kind: input.kind, email: '   ', prospectId: null }),
      }),
      makeInput()
    );

    expect(report.result).toEqual({ outcome: 'failed', reason: 'lead has no email' });
  });

  it('matches only within the resolved agency', async () => {
    const findMatches = vi.fn(async () => [{ id: 'p1', status: 'new' }]);
    await reconcileLead(makeSeam({ findMatches }), makeInput());

    expect(findMatches).toHaveBeenCalledWith({ agencyId: 'ag-1', email: 'alice@example.com' });
  });

  it('converges plugin and booking leads with the same email onto the same prospect', async () => {
    const plugin = await reconcileLead(
      makeSeam({
        findLead: async (input: ReconcileInput) => ({
          id: input.leadId,
          kind: input.kind,
          email: 'shared@acme.io',
          prospectId: null,
          firstName: 'Ada',
          lastName: 'Lovelace',
        }),
        findMatches: async () => [],
        createProspect: async () => ({ id: 'p-shared' }),
      }),
      makeInput()
    );
    expect(plugin.result).toEqual({ outcome: 'created', prospectId: 'p-shared' });

    const booking = await reconcileLead(
      makeSeam({
        findLead: async (input: ReconcileInput) => ({
          id: input.leadId,
          kind: input.kind,
          email: 'shared@acme.io',
          prospectId: null,
          organization: 'Acme',
          name: 'Rita',
        }),
        findMatches: async () => [{ id: 'p-shared', status: 'new' }],
      }),
      makeInput({ leadId: 'inq-2', kind: 'booking' })
    );
    expect(booking.result).toEqual({ outcome: 'linked', prospectId: 'p-shared' });
  });

  it('different emails with the same org do not match (no org/domain matching)', async () => {
    const findMatches = vi.fn(async () => []);
    const report = await reconcileLead(
      makeSeam({
        findLead: async (input: ReconcileInput) => ({
          id: input.leadId,
          kind: input.kind,
          email: 'other@acme.io',
          prospectId: null,
          organization: 'Acme',
          name: 'Rita',
        }),
        findMatches,
      }),
      makeInput({ kind: 'booking' })
    );
    expect(report.result).toEqual({ outcome: 'created', prospectId: 'prospect-new' });
    expect(findMatches).toHaveBeenCalledWith({ agencyId: 'ag-1', email: 'other@acme.io' });
  });

  it('propagates a prospect create failure so the transaction rolls back', async () => {
    const seam = makeSeam({
      findMatches: async () => [],
      createProspect: async () => {
        throw new Error('db unavailable');
      },
    });

    await expect(reconcileLead(seam, makeInput())).rejects.toThrow('db unavailable');
  });
});

describe('planAgencyLookup', () => {
  it('uses the configured agency id when it exists', () => {
    expect(planAgencyLookup({ configuredId: 'ag-x', configuredExists: true, totalCount: 3 })).toEqual({
      status: 'ok',
      fetch: 'by-id',
    });
  });

  it('fails closed when the configured agency id is missing', () => {
    expect(planAgencyLookup({ configuredId: 'ag-x', configuredExists: false, totalCount: 3 })).toEqual({
      status: 'error',
      message: 'Configured default agency not found',
    });
  });

  it('fails closed when no agency exists', () => {
    expect(planAgencyLookup({ configuredId: null, configuredExists: false, totalCount: 0 })).toEqual({
      status: 'error',
      message: 'No agency configured for reconciliation',
    });
  });

  it('uses the sole agency when exactly one exists', () => {
    expect(planAgencyLookup({ configuredId: null, configuredExists: false, totalCount: 1 })).toEqual({
      status: 'ok',
      fetch: 'first',
    });
  });

  it('fails closed when multiple agencies exist without configuration', () => {
    expect(planAgencyLookup({ configuredId: null, configuredExists: false, totalCount: 2 })).toEqual({
      status: 'error',
      message: expect.stringContaining('DEFAULT_AGENCY_ID'),
    });
    expect(planAgencyLookup({ configuredId: null, configuredExists: false, totalCount: 2 }).status).toBe('error');
  });
});

describe('reconcileLead booking kind', () => {
  it('creates a booking-inquiry-sourced prospect', async () => {
    const findLead = vi.fn(async (input: ReconcileInput) => ({
      id: input.leadId,
      kind: 'booking' as LeadKind,
      email: 'rita@corp.com',
      prospectId: null,
      organization: 'Corp',
      name: 'Rita',
    }));
    const createProspect = vi.fn(async () => ({ id: 'prospect-booked' }));
    const linkLead = vi.fn(async () => ({ count: 1 }));
    const report = await reconcileLead(
      makeSeam({ findLead, createProspect, linkLead }),
      makeInput({ leadId: 'inq-1', kind: 'booking' })
    );

    expect(report.result).toEqual({ outcome: 'created', prospectId: 'prospect-booked' });
    expect(createProspect).toHaveBeenCalledWith({
      agencyId: 'ag-1',
      draft: expect.objectContaining({ source: 'booking-inquiry', status: 'new', primaryContactEmail: 'rita@corp.com' }),
    });
    expect(linkLead).toHaveBeenCalledWith({ leadId: 'inq-1', kind: 'booking', prospectId: 'prospect-booked' });
  });
});