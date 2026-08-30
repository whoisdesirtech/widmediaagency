import { describe, it, expect } from 'vitest';
import {
  resolveTransition,
  isTerminal,
  statusLabel,
  DELIVERABLE_STATUS_CONFIG,
  DELIVERABLE_STATES,
} from '@/lib/deliverable-lifecycle';

const d = (overrides: Record<string, unknown> = {}) =>
  ({ id: 'd1', contractorId: 'c1', clientId: 'cl1', status: 'draft', ...overrides }) as never;

describe('deliverable lifecycle — happy path', () => {
  it('allows admin/staff to assign a draft with a contractor', () => {
    expect(resolveTransition('admin', 'draft', 'assigned', d(), { contractorId: 'c1' }).ok).toBe(true);
    expect(resolveTransition('staff', 'draft', 'assigned', d(), { contractorId: 'c1' }).ok).toBe(true);
  });

  it('allows the assigned contractor to accept or decline', () => {
    expect(resolveTransition('contractor', 'assigned', 'accepted', d(), {}).ok).toBe(true);
    expect(resolveTransition('contractor', 'assigned', 'declined', d(), {}).ok).toBe(true);
  });

  it('allows a contractor to start work once accepted, and to revise after changes', () => {
    expect(resolveTransition('contractor', 'accepted', 'in-progress', d(), {}).ok).toBe(true);
    expect(resolveTransition('contractor', 'changes-requested', 'in-progress', d(), {}).ok).toBe(true);
  });

  it('allows a contractor to submit with a URL or an attachment', () => {
    expect(resolveTransition('contractor', 'in-progress', 'pending-approval', d(), { submittedUrl: 'https://x.dev' }).ok).toBe(true);
    expect(resolveTransition('contractor', 'in-progress', 'pending-approval', d(), { attachments: ['https://x.dev/a.png'] }).ok).toBe(true);
  });

  it('allows the client to accept or request changes from pending-approval', () => {
    expect(resolveTransition('client', 'pending-approval', 'client-accepted', d(), {}).ok).toBe(true);
    expect(resolveTransition('client', 'pending-approval', 'changes-requested', d(), {}).ok).toBe(true);
  });

  it('allows only admin final approval and closure after client acceptance', () => {
    expect(resolveTransition('admin', 'client-accepted', 'approved', d(), {}).ok).toBe(true);
    expect(resolveTransition('admin', 'approved', 'closed', d(), {}).ok).toBe(true);
  });
});

describe('deliverable lifecycle — role authorization', () => {
  it('blocks a contractor from final approval (admin-only)', () => {
    expect(resolveTransition('contractor', 'client-accepted', 'approved', d(), {}).ok).toBe(false);
  });

  it('blocks staff from final approval (admin-only)', () => {
    expect(resolveTransition('staff', 'client-accepted', 'approved', d(), {}).ok).toBe(false);
  });

  it('blocks staff from closing', () => {
    expect(resolveTransition('staff', 'approved', 'closed', d(), {}).ok).toBe(false);
  });

  it('blocks the client from approving (only admin can)', () => {
    expect(resolveTransition('client', 'pending-approval', 'approved', d(), {}).ok).toBe(false);
  });

  it('blocks the client from starting work', () => {
    expect(resolveTransition('client', 'accepted', 'in-progress', d(), {}).ok).toBe(false);
  });

  it('blocks the contractor from accepting an unassigned draft they were never given', () => {
    expect(resolveTransition('contractor', 'draft', 'accepted', d(), {}).ok).toBe(false);
  });

  it('blocks a contractor from jumping straight to submission', () => {
    expect(resolveTransition('contractor', 'accepted', 'pending-approval', d(), {}).ok).toBe(false);
  });
});

describe('deliverable lifecycle — invalid transitions', () => {
  it('blocks skipping steps (draft → in-progress)', () => {
    expect(resolveTransition('admin', 'draft', 'in-progress', d(), {}).ok).toBe(false);
  });

  it('blocks admin final approval before client acceptance', () => {
    expect(resolveTransition('admin', 'pending-approval', 'approved', d(), {}).ok).toBe(false);
  });

  it('blocks terminal states from transitioning', () => {
    expect(resolveTransition('admin', 'closed', 'approved', d(), {}).ok).toBe(false);
    expect(resolveTransition('admin', 'cancelled', 'assigned', d(), {}).ok).toBe(false);
  });

  it('rejects unknown status targets', () => {
    expect(resolveTransition('admin', 'draft', 'pending', d(), {}).ok).toBe(false);
  });
});

describe('deliverable lifecycle — preconditions', () => {
  it('requires a contractor to assign', () => {
    const r = resolveTransition('admin', 'draft', 'assigned', d(), {});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('contractor');
  });

  it('requires a different contractor to reassign', () => {
    expect(resolveTransition('admin', 'assigned', 'assigned', d({ contractorId: 'c1' }), { contractorId: 'c1' }).ok).toBe(false);
    expect(resolveTransition('admin', 'assigned', 'assigned', d({ contractorId: 'c1' }), { contractorId: 'c2' }).ok).toBe(true);
  });

  it('requires a submission URL or attachment to submit', () => {
    expect(resolveTransition('contractor', 'in-progress', 'pending-approval', d(), {}).ok).toBe(false);
  });

  it('requires a reason to reopen an accepted deliverable', () => {
    const r = resolveTransition('admin', 'client-accepted', 'in-progress', d(), {});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('reason');
    expect(resolveTransition('admin', 'client-accepted', 'in-progress', d(), { reason: 'post-acceptance issue' }).ok).toBe(true);
  });
});

describe('deliverable lifecycle — admin cancel guard rails', () => {
  it('allows cancel from pre-approval states', () => {
    expect(resolveTransition('staff', 'pending-approval', 'cancelled', d(), {}).ok).toBe(true);
    expect(resolveTransition('staff', 'changes-requested', 'cancelled', d(), {}).ok).toBe(true);
  });

  it('blocks cancelling an already-cancelled deliverable', () => {
    expect(resolveTransition('staff', 'cancelled', 'cancelled', d(), {}).ok).toBe(false);
  });
});

describe('deliverable lifecycle — labels and terminals', () => {
  it('has a config entry for every declared state', () => {
    for (const s of DELIVERABLE_STATES) {
      expect(DELIVERABLE_STATUS_CONFIG[s]).toBeDefined();
      expect(statusLabel(s)).toBeTruthy();
    }
  });

  it('treats closed and cancelled as terminal', () => {
    expect(isTerminal('closed')).toBe(true);
    expect(isTerminal('cancelled')).toBe(true);
    expect(isTerminal('approved')).toBe(false);
    expect(isTerminal('pending-approval')).toBe(false);
  });
});