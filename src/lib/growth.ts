export const MIN_RETAINER = 3000;
export const MIN_PROJECT = 10000;
export const MIN_REVENUE = 1_000_000;
export const CAC_CAP = 1500;
export const LTV_RATIO_TARGET = 3;
export const SLA_FIRST_TOUCH_MIN = 15;
export const SLA_OWNERSHIP_HOURS = 24;

export type Segment =
  | 'media_agency'
  | 'luxury_hospitality'
  | 'corporate_lifestyle'
  | 'other';

export type Verdict = 'sales_ready' | 'education_drip' | 'referral_out' | 'out_of_scope';
export type Tier = 'cold' | 'engaged' | 'hot' | 'sales_ready';

export const SEGMENT_LABELS: Record<Segment, string> = {
  media_agency: 'Media Agency',
  luxury_hospitality: 'Luxury Hospitality',
  corporate_lifestyle: 'Corporate Lifestyle',
  other: 'Other',
};

const REVENUE_OK = (bucket?: string) => bucket != null && bucket !== '<1M';

export interface QualifyInput {
  segment: Segment;
  annualRevenue?: string;
  monthlySpend?: number;
  projectBudget?: number;
  retainerBudget?: number;
  decisionTimeline?: string;
  hasAuthority?: boolean;
  serviceInterest?: string;
}

export interface QualifyCheck {
  label: string;
  pass: boolean;
}

export interface QualifyResult {
  verdict: Verdict;
  rule: string;
  checked: QualifyCheck[];
}

/**
 * BANT + custom floors (Part 8 of the spec).
 * Sales-ready requires revenue >= $1M AND (retainer >= $3k OR project >= $10k)
 * AND decision authority within 30 days.
 */
export function qualifyLead(input: QualifyInput): QualifyResult {
  const checked: QualifyCheck[] = [
    { label: 'Segment fits a supported ICP', pass: input.segment !== 'other' },
    { label: `Revenue at or above $${(MIN_REVENUE / 1_000_000).toFixed(0)}M`, pass: REVENUE_OK(input.annualRevenue) },
    {
      label: `Budget clears floor ($${MIN_RETAINER.toLocaleString()}/mo retainer or $${MIN_PROJECT.toLocaleString()} project)`,
      pass: (input.retainerBudget ?? 0) >= MIN_RETAINER || (input.projectBudget ?? 0) >= MIN_PROJECT,
    },
    {
      label: 'Decision authority within 30 days',
      pass: input.hasAuthority === true && (input.decisionTimeline === 'immediate' || input.decisionTimeline === '<30days'),
    },
  ];

  const customEngineering =
    input.serviceInterest === 'technical-custom' ||
    input.serviceInterest === 'in-house-build';

  const pass = checked.every((c) => c.pass);

  if (customEngineering) {
    return {
      verdict: 'out_of_scope',
      rule: 'Out-of-scope technical request — route to higher custom engineering rates or an outside partner referral.',
      checked,
    };
  }
  if (pass) {
    return {
      verdict: 'sales_ready',
      rule: 'All floors cleared — assign owner, first touch within 15 minutes.',
      checked,
    };
  }
  if (!REVENUE_OK(input.annualRevenue)) {
    return {
      verdict: 'referral_out',
      rule: 'Below revenue floor — hand off politely to a partner fit; no force-fitting.',
      checked,
    };
  }
  return {
    verdict: 'education_drip',
    rule: 'Budget or timing not there yet — educational resources now, revisit quarterly.',
    checked,
  };
}

/** Behavioral scoring table (Part 9). */
export type ScoreAction =
  | 'discovery_booked'
  | 'form_submission'
  | 'reply'
  | 'case_study'
  | 'audit_request'
  | 'repeat_visits'
  | 'asset_download'
  | 'service_visit'
  | 'email_open';

export const SCORE_POINTS: Record<ScoreAction, number> = {
  discovery_booked: 40,
  form_submission: 30,
  reply: 20,
  case_study: 15,
  audit_request: 15,
  repeat_visits: 10,
  asset_download: 10,
  service_visit: 5,
  email_open: 2,
};

export const SCORE_LABELS: Record<ScoreAction, string> = {
  discovery_booked: 'Discovery call booked',
  form_submission: 'Inbound form submission',
  reply: 'Replied to outreach',
  case_study: 'Downloaded a case study',
  audit_request: 'Requested an operational audit',
  repeat_visits: 'Visited a service page (2+)',
  asset_download: 'Downloaded a lead magnet',
  service_visit: 'Visited a service page',
  email_open: 'Opened an email',
};

export function scoreLead(actions: ScoreAction[]): { score: number; tier: Tier } {
  const score = actions.reduce((sum, a) => sum + (SCORE_POINTS[a] ?? 0), 0);
  return { score, tier: tierFor(score) };
}

export function tierFor(score: number): Tier {
  if (score >= 80) return 'sales_ready';
  if (score >= 50) return 'hot';
  if (score >= 20) return 'engaged';
  return 'cold';
}

/** Multi-touch attribution: discovery 40% / intermediates 20% / closing 40% (Part 17). */
export interface AttributionInput {
  discovery: boolean;
  intermediates: number;
  closing: boolean;
}

export function attribution(input: AttributionInput) {
  const buckets = [
    { name: 'Discovery', share: 0.4, present: input.discovery },
    { name: 'Intermediates', share: 0.2, present: input.intermediates > 0 },
    { name: 'Final conversion', share: 0.4, present: input.closing },
  ];
  const total = buckets.reduce((s, b) => s + (b.present ? b.share : 0), 0);
  if (total <= 0) {
    return buckets.map((b) => ({ name: b.name, percent: 0, active: b.present }));
  }
  return buckets.map((b) => ({
    name: b.name,
    percent: b.present ? Math.round((b.share / total) * 100) : 0,
    active: b.present,
  }));
}

/** Funnel math for the funnel builder tool. Seeded volume per stage. */
export interface FunnelStage {
  name: string;
  rate: number; // conversion rate into the next stage, 0..1
}

export interface FunnelProjection {
  stage: string;
  count: number;
}

export function projectFunnel(seed: number, stages: FunnelStage[]): FunnelProjection[] {
  const out: FunnelProjection[] = [{ stage: 'Contacts', count: Math.round(seed) }];
  let current = seed;
  for (const s of stages) {
    current = current * s.rate;
    out.push({ stage: s.name, count: Math.round(current) });
  }
  return out;
}

export function cacFor(spend: number, closed: number): number {
  return closed > 0 ? spend / closed : 0;
}

export function ltvRatio(ltv: number, cac: number): number {
  return cac > 0 ? ltv / cac : 0;
}

/** Canonical 21-day follow-up cadence (Part 10). */
export interface CadenceStep {
  day: number;
  channel: 'Email' | 'LinkedIn' | 'Phone' | 'Video audit' | 'SMS' | 'Roundtable';
  content: string;
  mode: 'auto' | 'manual';
}

export const CADENCE: CadenceStep[] = [
  { day: 0, channel: 'Email', content: 'Entry confirmation + deliver the requested asset', mode: 'auto' },
  { day: 2, channel: 'LinkedIn', content: 'Value note or relevant industry teardown', mode: 'auto' },
  { day: 4, channel: 'Email', content: 'Value email + work breakdown', mode: 'auto' },
  { day: 7, channel: 'Video audit', content: 'Personalized 12-minute video audit (high-value accounts)', mode: 'manual' },
  { day: 10, channel: 'LinkedIn', content: 'Objection-aware nudge (cheap competitor / in-house cost)', mode: 'auto' },
  { day: 14, channel: 'Email', content: 'Case study breakdown', mode: 'manual' },
  { day: 18, channel: 'Roundtable', content: 'Platform update or agency roundtable invite', mode: 'auto' },
  { day: 21, channel: 'Email', content: 'Soft landing: clear ask, or park to quarterly drip', mode: 'auto' },
];

/** Re-engagement / parking branches used by the follow-up planner. */
export interface Branch {
  trigger: string;
  action: string;
}

export const BRANCHES: Branch[] = [
  { trigger: 'Reply but stalled', action: 'Industry teardown, platform update, roundtable invite' },
  { trigger: 'Bad timing', action: 'Quarterly educational drip, revisit each quarter' },
  { trigger: 'No budget authority / shut down / opt-out', action: 'Permanent removal — delete and respect opt-out' },
];