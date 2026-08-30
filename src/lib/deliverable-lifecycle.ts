import { Deliverable } from '@prisma/client';

export type DeliverableRole = 'admin' | 'staff' | 'contractor' | 'client';

export const DELIVERABLE_STATES = [
  'draft',
  'assigned',
  'accepted',
  'declined',
  'in-progress',
  'pending-approval',
  'changes-requested',
  'client-accepted',
  'approved',
  'closed',
  'cancelled',
] as const;

export type DeliverableState = (typeof DELIVERABLE_STATES)[number];

export const TERMINAL_STATES: DeliverableState[] = ['closed', 'cancelled'];

export const DELIVERABLE_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'draft': { label: '📝 Draft', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
  'assigned': { label: '📨 Assigned', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  'accepted': { label: '👍 Accepted', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  'declined': { label: '🙅 Declined', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  'in-progress': { label: '🔄 In Progress', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'pending-approval': { label: '🔔 Pending Your Review', color: 'text-miami-pink', bg: 'bg-pink-50 border-pink-200' },
  'changes-requested': { label: '📝 Changes Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  'client-accepted': { label: '✅ Client Accepted', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'approved': { label: '🏁 Final Approval', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  'closed': { label: '🔒 Closed', color: 'text-dark', bg: 'bg-dark-50 border-dark' },
  'cancelled': { label: '🚫 Cancelled', color: 'text-red-800', bg: 'bg-red-50 border-red-200' },
};

interface TransitionRule {
  to: DeliverableState;
  roles: DeliverableRole[];
  precondition: (d: Deliverable, body: Record<string, unknown>) => { ok: true } | { ok: false; reason: string };
}

const TR: Record<string, TransitionRule[]> = {
  draft: [
    { to: 'assigned', roles: ['admin', 'staff'], precondition: needContractor },
    { to: 'cancelled', roles: ['admin', 'staff'], precondition: always },
  ],
  assigned: [
    { to: 'accepted', roles: ['contractor'], precondition: always },
    { to: 'declined', roles: ['contractor'], precondition: always },
    { to: 'assigned', roles: ['admin', 'staff'], precondition: differentContractor },
    { to: 'cancelled', roles: ['admin', 'staff'], precondition: always },
  ],
  declined: [
    { to: 'assigned', roles: ['admin', 'staff'], precondition: differentContractor },
    { to: 'cancelled', roles: ['admin', 'staff'], precondition: always },
  ],
  accepted: [
    { to: 'in-progress', roles: ['contractor'], precondition: always },
    { to: 'cancelled', roles: ['admin', 'staff'], precondition: always },
  ],
  'in-progress': [
    { to: 'pending-approval', roles: ['contractor'], precondition: hasSubmissionAssets },
    { to: 'cancelled', roles: ['admin', 'staff'], precondition: always },
  ],
  'pending-approval': [
    { to: 'client-accepted', roles: ['client'], precondition: always },
    { to: 'changes-requested', roles: ['client'], precondition: always },
    { to: 'cancelled', roles: ['admin', 'staff'], precondition: always },
  ],
  'changes-requested': [
    { to: 'in-progress', roles: ['contractor'], precondition: always },
    { to: 'cancelled', roles: ['admin', 'staff'], precondition: always },
  ],
  'client-accepted': [
    { to: 'approved', roles: ['admin'], precondition: always },
    { to: 'in-progress', roles: ['admin'], precondition: requiresReason },
    { to: 'cancelled', roles: ['admin', 'staff'], precondition: always },
  ],
  approved: [{ to: 'closed', roles: ['admin'], precondition: always }],
  closed: [],
  cancelled: [],
};

function always(): { ok: true } {
  return { ok: true };
}

function needContractor(d: Deliverable, body: Record<string, unknown>): { ok: true } | { ok: false; reason: string } {
  return body.contractorId ? { ok: true } : { ok: false, reason: 'A contractor must be provided to assign this deliverable' };
}

function differentContractor(d: Deliverable, body: Record<string, unknown>): { ok: true } | { ok: false; reason: string } {
  if (!body.contractorId) return { ok: false, reason: 'A contractor must be provided to reassign this deliverable' };
  if (body.contractorId === d.contractorId) return { ok: false, reason: 'Reassignment requires a different contractor' };
  return { ok: true };
}

function requiresReason(d: Deliverable, body: Record<string, unknown>): { ok: true } | { ok: false; reason: string } {
  return typeof body.reason === 'string' && body.reason.trim().length > 0
    ? { ok: true }
    : { ok: false, reason: 'A reason is required for this action' };
}

function hasSubmissionAssets(d: Deliverable, body: Record<string, unknown>): { ok: true } | { ok: false; reason: string } {
  const hasUrl = typeof body.submittedUrl === 'string' && body.submittedUrl.trim().length > 0;
  let hasAttachment = false;
  if (body.attachments !== undefined) {
    const raw = typeof body.attachments === 'string' ? body.attachments : JSON.stringify(body.attachments);
    try {
      const parsed = JSON.parse(raw);
      hasAttachment = Array.isArray(parsed) && parsed.length > 0;
    } catch {
      hasAttachment = typeof body.attachments === 'string' && body.attachments.trim().length > 0;
    }
  }
  if (hasUrl || hasAttachment) return { ok: true };
  return { ok: false, reason: 'A submission URL or at least one attachment is required to submit' };
}

export function resolveTransition(
  role: DeliverableRole,
  currentStatus: string,
  nextStatus: string,
  d: Deliverable,
  body: Record<string, unknown>
): { ok: true; rule: TransitionRule } | { ok: false; reason: string } {
  const rules = TR[currentStatus];
  if (!rules) return { ok: false, reason: `No transitions are defined from "${currentStatus}"` };
  const rule = rules.find((r) => r.to === nextStatus && r.roles.includes(role));
  if (!rule) return { ok: false, reason: `Transition "${currentStatus}" → "${nextStatus}" is not allowed for your role` };
  const pre = rule.precondition(d, body);
  if (!pre.ok) return pre;
  return { ok: true, rule };
}

export function isTerminal(status: string): boolean {
  return (TERMINAL_STATES as string[]).includes(status);
}

export function normalizeAttachments(attachments: unknown): string {
  if (typeof attachments === 'string') return attachments;
  return JSON.stringify(attachments ?? []);
}

export function statusLabel(status: string): string {
  return DELIVERABLE_STATUS_CONFIG[status]?.label ?? status;
}