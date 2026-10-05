export type RelationshipKind = 'prospect' | 'client';

export interface InteractionEvent {
  at: Date;
  source: string;
  type?: string;
}

export interface RelationshipMoment {
  at: Date;
  type: string;
  source: string;
}

export interface RelationshipContext {
  id: string;
  kind: RelationshipKind;
  name: string;
  email?: string | null;
  status?: string | null;
  ownerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  interactions: InteractionEvent[];
  upcomingMoments?: RelationshipMoment[];
}

export type SignalConfidence = 'high' | 'medium' | 'low';

export interface SignalEvidence {
  what: string;
  why: string;
  when: Date | null;
  source: string;
}

export type SignalId =
  | 'insufficient_history'
  | 'interaction_silence'
  | 'dormant'
  | 'engagement_trend'
  | 'follow_up_overdue'
  | 'upcoming_moment';

export interface RelationshipSignal {
  id: SignalId;
  label: string;
  triggered: boolean;
  confidence: SignalConfidence;
  evidence: SignalEvidence[];
}

export type HealthStatus = 'insufficient_data' | 'healthy' | 'attention' | 'dormant';
export type TrendDirection = 'up' | 'stable' | 'down' | 'insufficient_data';

export interface RelationshipExplanation {
  evaluatedAt: Date;
  ageDays: number;
  totalInteractions: number;
  lastInteractionAt: Date | null;
  lastRecordActivityAt: Date;
  nextMomentAt: Date | null;
  trend: TrendDirection;
}

export interface RelationshipReport {
  id: string;
  kind: RelationshipKind;
  name: string;
  status: string | null;
  health: HealthStatus;
  priorityKey: PriorityKey;
  ageDays: number;
  signals: RelationshipSignal[];
  explanation: RelationshipExplanation;
}

export type PriorityKey = 'high' | 'medium' | 'low';

export interface RelationshipIntelligenceThresholds {
  silenceWindowDays: number;
  dormantWindowDays: number;
  trendWindowDays: number;
  trendMinDelta: number;
  followUpOverdueDays: number;
  momentLookaheadDays: number;
}

export const DEFAULT_THRESHOLDS: RelationshipIntelligenceThresholds = {
  silenceWindowDays: 30,
  dormantWindowDays: 90,
  trendWindowDays: 30,
  trendMinDelta: 2,
  followUpOverdueDays: 14,
  momentLookaheadDays: 7,
};

const NON_TERMINAL_PROSPECT_STATUSES = ['new', 'researching', 'qualified', 'proposal'];

const DAY_MS = 86_400_000;

function daysBetween(now: Date, then: Date): number {
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / DAY_MS));
}

function evidence(what: string, why: string, when: Date | null, source: string): SignalEvidence {
  return { what, why, when, source };
}

export function evaluateRelationship(
  context: RelationshipContext,
  now: Date,
  thresholds: RelationshipIntelligenceThresholds = DEFAULT_THRESHOLDS
): RelationshipReport {
  const ageDays = daysBetween(now, context.createdAt);
  const interactions = [...context.interactions].sort((a, b) => a.at.getTime() - b.at.getTime());
  const lastInteractionAt = interactions.length > 0 ? interactions[interactions.length - 1].at : null;
  const lastRecordActivityAt = lastInteractionAt
    ? new Date(Math.max(lastInteractionAt.getTime(), context.updatedAt.getTime()))
    : context.updatedAt;
  const moments = (context.upcomingMoments ?? [])
    .filter((m) => m.at.getTime() >= now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime());
  const nextMomentAt = moments.length > 0 ? moments[0].at : null;

  const silenced =
    lastInteractionAt === null ||
    daysBetween(now, lastInteractionAt) >= thresholds.silenceWindowDays;

  const dormant =
    (lastInteractionAt === null || daysBetween(now, lastInteractionAt) >= thresholds.dormantWindowDays) &&
    daysBetween(now, context.updatedAt) >= thresholds.dormantWindowDays &&
    satisfied(thresholds.dormantWindowDays, ageDays);

  const trendWindowMs = thresholds.trendWindowDays * DAY_MS;
  const currentCutoff = new Date(now.getTime() - trendWindowMs);
  const previousCutoff = new Date(now.getTime() - 2 * trendWindowMs);
  let currentCount = 0;
  let previousCount = 0;
  for (const event of interactions) {
    const t = event.at.getTime();
    if (t >= currentCutoff.getTime()) currentCount += 1;
    else if (t >= previousCutoff.getTime()) previousCount += 1;
  }

  let trend: TrendDirection;
  let trendConfidence: SignalConfidence;
  if (ageDays < 2 * thresholds.trendWindowDays || currentCount + previousCount === 0) {
    trend = 'insufficient_data';
    trendConfidence = 'medium';
  } else {
    trendConfidence = 'high';
    const delta = currentCount - previousCount;
    if (delta >= thresholds.trendMinDelta) trend = 'up';
    else if (delta <= -thresholds.trendMinDelta) trend = 'down';
    else trend = 'stable';
  }

  const signals: RelationshipSignal[] = [];

  const insufficientHistory =
    interactions.length === 0 && ageDays < thresholds.silenceWindowDays;

  if (insufficientHistory) {
    signals.push({
      id: 'insufficient_history',
      label: 'Insufficient history',
      triggered: true,
      confidence: 'medium',
      evidence: [
        evidence(
          `Relationship is ${ageDays} days old with no recorded interactions`,
          'Not enough observed history to judge engagement or recency',
          context.createdAt,
          'relationship'
        ),
      ],
    });
  }

  if (silenced && !insufficientHistory) {
    const daysSilent =
      lastInteractionAt !== null ? daysBetween(now, lastInteractionAt) : ageDays;
    signals.push({
      id: 'interaction_silence',
      label: 'No recent interaction',
      triggered: true,
      confidence: satisfied(thresholds.silenceWindowDays, ageDays) ? 'high' : 'medium',
      evidence: [
        evidence(
          lastInteractionAt !== null
            ? `Last interaction was ${daysSilent} days ago`
            : `No interactions recorded over the ${ageDays}-day life of the relationship`,
          'Relationship engagement has not been observed within the silence window',
          lastInteractionAt ?? context.updatedAt,
          lastInteractionAt !== null ? 'interaction' : 'record-activity'
        ),
      ],
    });
  }

  if (dormant) {
    signals.push({
      id: 'dormant',
      label: 'Dormant relationship',
      triggered: true,
      confidence: 'high',
      evidence: [
        evidence(
          `No interaction for at least ${thresholds.dormantWindowDays} days and no record activity since ${context.updatedAt.toISOString()}`,
          'Relationship exceeded the dormancy threshold for engagement and record activity',
          context.updatedAt,
          'record-activity'
        ),
      ],
    });
  }

  signals.push({
    id: 'engagement_trend',
    label: 'Interaction trend',
    triggered: trend === 'down',
    confidence: trendConfidence,
    evidence: [
      evidence(
        `Interactions: ${currentCount} in the last ${thresholds.trendWindowDays} days vs ${previousCount} in the prior period`,
        trend === 'down'
          ? 'Recent interaction volume declined relative to the prior period'
          : trend === 'up'
            ? 'Recent interaction volume increased relative to the prior period'
            : trend === 'stable'
              ? 'Interaction volume is consistent with the prior period'
              : 'Not enough history to compare interaction volume fairly',
        lastInteractionAt,
        'interaction'
      ),
    ],
  });

  const isProspect = context.kind === 'prospect';
  const statusValue = context.status ?? null;
  const followUpOverdue =
    isProspect &&
    statusValue !== null &&
    NON_TERMINAL_PROSPECT_STATUSES.includes(statusValue) &&
    daysBetween(now, context.updatedAt) >= thresholds.followUpOverdueDays;

  if (followUpOverdue) {
    signals.push({
      id: 'follow_up_overdue',
      label: 'Unresolved prospect follow-up',
      triggered: true,
      confidence: 'high',
      evidence: [
        evidence(
          `Prospect in "${statusValue}" state for ${daysBetween(now, context.updatedAt)} days`,
          'A non-terminal prospect has received no status or record update within the follow-up window',
          context.updatedAt,
          'prospect'
        ),
      ],
    });
  }

  const upcoming = moments.find(
    (m) => m.at.getTime() - now.getTime() <= thresholds.momentLookaheadDays * DAY_MS
  );
  if (upcoming) {
    signals.push({
      id: 'upcoming_moment',
      label: 'Upcoming relationship moment',
      triggered: true,
      confidence: 'high',
      evidence: [
        evidence(
          `"${upcoming.type}" occurs in ${daysBetween(upcoming.at, now)} days`,
          'A scheduled moment on the relationship falls within the lookahead window',
          upcoming.at,
          upcoming.source
        ),
      ],
    });
  }

  let health: HealthStatus;
  if (isProspect) {
    if (followUpOverdue) health = 'attention';
    else if (dormant) health = 'dormant';
    else if (insufficientHistory) health = 'insufficient_data';
    else health = 'healthy';
  } else if (dormant) {
    health = 'dormant';
  } else if (insufficientHistory) {
    health = 'insufficient_data';
  } else if (silenced) {
    health = 'attention';
  } else if (trend === 'down') {
    health = 'attention';
  } else {
    health = 'healthy';
  }

  const priorityKey: PriorityKey = health === 'attention' ? 'high' : health === 'dormant' ? 'medium' : 'low';

  return {
    id: context.id,
    kind: context.kind,
    name: context.name,
    status: context.status ?? null,
    health,
    priorityKey,
    ageDays,
    signals,
    explanation: {
      evaluatedAt: now,
      ageDays,
      totalInteractions: interactions.length,
      lastInteractionAt,
      lastRecordActivityAt,
      nextMomentAt,
      trend,
    },
  };
}

function satisfied(thresholdDays: number, ageDays: number): boolean {
  return ageDays >= thresholdDays;
}

export interface OrderedEntry {
  priorityKey: PriorityKey;
  lastRecordActivityMs: number;
  id: string;
  report: RelationshipReport;
}

const PRIORITY_RANK: Record<PriorityKey, number> = { high: 3, medium: 2, low: 1 };

export function sortByPriority(entries: OrderedEntry[]): OrderedEntry[] {
  const sorted = [...entries];
  sorted.sort((a, b) => {
    const byPriority = PRIORITY_RANK[b.priorityKey] - PRIORITY_RANK[a.priorityKey];
    if (byPriority !== 0) return byPriority;
    const byRecency = b.lastRecordActivityMs - a.lastRecordActivityMs;
    if (byRecency !== 0) return byRecency;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return sorted;
}

export function evaluateMany(
  contexts: RelationshipContext[],
  now: Date,
  thresholds: RelationshipIntelligenceThresholds = DEFAULT_THRESHOLDS
): RelationshipReport[] {
  const ordered: OrderedEntry[] = contexts.map((context) => {
    const report = evaluateRelationship(context, now, thresholds);
    return {
      priorityKey: report.priorityKey,
      lastRecordActivityMs: report.explanation.lastRecordActivityAt.getTime(),
      id: report.id,
      report,
    };
  });

  return sortByPriority(ordered).map((entry) => entry.report);
}