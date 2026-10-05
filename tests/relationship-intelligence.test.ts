import { describe, it, expect } from 'vitest';
import {
  DEFAULT_THRESHOLDS,
  evaluateMany,
  evaluateRelationship,
  sortByPriority,
} from '@/lib/relationship-intelligence';
import type {
  RelationshipContext,
  RelationshipIntelligenceThresholds,
} from '@/lib/relationship-intelligence';

const NOW = new Date('2026-09-02T12:00:00.000Z');
const DAY = 86_400_000;
const daysAgo = (d: number) => new Date(NOW.getTime() - d * DAY);
const daysFromNow = (d: number) => new Date(NOW.getTime() + d * DAY);

function makeClientContext(overrides: Partial<RelationshipContext> = {}): RelationshipContext {
  return {
    id: 'client-1',
    kind: 'client',
    name: 'Acme Client',
    email: 'acme@example.com',
    status: 'active',
    createdAt: daysAgo(120),
    updatedAt: daysAgo(100),
    interactions: [
      { at: daysAgo(100), source: 'message' },
      { at: daysAgo(95), source: 'message' },
      { at: daysAgo(5), source: 'message' },
    ],
    upcomingMoments: [],
    ...overrides,
  };
}

function makeProspectContext(overrides: Partial<RelationshipContext> = {}): RelationshipContext {
  return {
    id: 'prospect-1',
    kind: 'prospect',
    name: 'New Prospect',
    email: 'lead@example.com',
    status: 'new',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(60),
    interactions: [],
    upcomingMoments: [],
    ...overrides,
  };
}

function signalMap(report: ReturnType<typeof evaluateRelationship>) {
  const all: Record<string, boolean> = {
    insufficient_history: false,
    interaction_silence: false,
    dormant: false,
    engagement_trend: false,
    follow_up_overdue: false,
    upcoming_moment: false,
  };
  for (const s of report.signals) all[s.id] = s.triggered;
  return all;
}

describe('evaluateRelationship — client', () => {
  it('evaluates a normally-engaged client as healthy', () => {
    const report = evaluateRelationship(makeClientContext(), NOW);
    expect(report.health).toBe('healthy');
    expect(report.priorityKey).toBe('low');
    expect(report.ageDays).toBe(120);
    expect(signalMap(report)).toMatchObject({
      interaction_silence: false,
      dormant: false,
      engagement_trend: false,
    });
  });

  it('flags interaction silence after the silence window', () => {
    const report = evaluateRelationship(
      makeClientContext({
        createdAt: daysAgo(120),
        updatedAt: daysAgo(100),
        interactions: [{ at: daysAgo(40), source: 'message' }],
      }),
      NOW
    );
    expect(report.health).toBe('attention');
    expect(report.priorityKey).toBe('high');
    expect(report.signals.find((s) => s.id === 'interaction_silence')).toMatchObject({
      triggered: true,
      confidence: 'high',
    });
  });

  it('does not fire silence while an interaction is within the window', () => {
    const report = evaluateRelationship(
      makeClientContext({ interactions: [{ at: daysAgo(29), source: 'message' }] }),
      NOW
    );
    expect(signalMap(report).interaction_silence).toBe(false);
    expect(report.health).toBe('healthy');
  });

  it('treats a silent client with no prior activity as needing attention, not dormant', () => {
    const report = evaluateRelationship(
      makeClientContext({ createdAt: daysAgo(60), updatedAt: daysAgo(2), interactions: [] }),
      NOW
    );
    expect(report.health).toBe('attention');
    expect(signalMap(report)).toMatchObject({ interaction_silence: true, dormant: false });
  });

  it('evaluates a dormant client from silence, old record activity, and age', () => {
    const report = evaluateRelationship(
      makeClientContext({ createdAt: daysAgo(300), updatedAt: daysAgo(200), interactions: [] }),
      NOW
    );
    expect(report.health).toBe('dormant');
    expect(report.priorityKey).toBe('medium');
    const ids = report.signals.map((s) => s.id);
    expect(ids).toContain('interaction_silence');
    expect(ids).toContain('dormant');
  });

  it('never marks a young relationship as stale', () => {
    const report = evaluateRelationship(
      makeClientContext({ createdAt: daysAgo(5), updatedAt: daysAgo(1), interactions: [] }),
      NOW
    );
    expect(report.health).toBe('insufficient_data');
    expect(signalMap(report)).toMatchObject({
      insufficient_history: true,
      interaction_silence: false,
      dormant: false,
    });
    expect(report.explanation.totalInteractions).toBe(0);
  });

  it('keeps a young but actively-engaged client healthy', () => {
    const report = evaluateRelationship(
      makeClientContext({
        createdAt: daysAgo(5),
        updatedAt: daysAgo(1),
        interactions: [{ at: daysAgo(1), source: 'message' }],
      }),
      NOW
    );
    expect(report.health).toBe('healthy');
    expect(signalMap(report).insufficient_history).toBe(false);
  });

  it('flags a down engagement trend', () => {
    const report = evaluateRelationship(
      makeClientContext({
        createdAt: daysAgo(200),
        updatedAt: daysAgo(190),
        interactions: [
          { at: daysAgo(45), source: 'message' },
          { at: daysAgo(40), source: 'message' },
          { at: daysAgo(35), source: 'message' },
        ],
      }),
      NOW
    );
    expect(report.explanation.trend).toBe('down');
    expect(report.health).toBe('attention');
    expect(signalMap(report).engagement_trend).toBe(true);
  });

  it('reports insufficient trend data for short histories', () => {
    const report = evaluateRelationship(
      makeClientContext({ createdAt: daysAgo(10), interactions: [{ at: daysAgo(5), source: 'message' }] }),
      NOW
    );
    expect(report.explanation.trend).toBe('insufficient_data');
    expect(signalMap(report).engagement_trend).toBe(false);
  });

  it('surfaces an upcoming calendar moment as a signal without changing health', () => {
    const report = evaluateRelationship(
      makeClientContext({
        updatedAt: daysAgo(2),
        interactions: [{ at: daysAgo(2), source: 'message' }],
        upcomingMoments: [{ at: daysFromNow(3), type: 'Strategy call', source: 'message' }],
      }),
      NOW
    );
    expect(report.health).toBe('healthy');
    expect(report.explanation.nextMomentAt?.toISOString()).toBe(daysFromNow(3).toISOString());
    expect(report.signals.find((s) => s.id === 'upcoming_moment')).toMatchObject({
      triggered: true,
      confidence: 'high',
    });
  });

  it('ignores moments outside the lookahead window', () => {
    const report = evaluateRelationship(
      makeClientContext({
        interactions: [{ at: daysAgo(1), source: 'message' }],
        upcomingMoments: [{ at: daysFromNow(30), type: 'Annual review', source: 'message' }],
      }),
      NOW
    );
    expect(report.explanation.nextMomentAt).not.toBeNull();
    expect(signalMap(report).upcoming_moment).toBe(false);
  });
});

describe('evaluateRelationship — prospect', () => {
  it('expects follow-up on a stale non-terminal prospect', () => {
    const report = evaluateRelationship(
      makeProspectContext({ createdAt: daysAgo(40), updatedAt: daysAgo(20) }),
      NOW
    );
    expect(report.health).toBe('attention');
    expect(report.priorityKey).toBe('high');
    expect(report.signals.find((s) => s.id === 'follow_up_overdue')).toMatchObject({
      triggered: true,
      confidence: 'high',
    });
  });

  it('treats an up-to-date prospect as healthy', () => {
    const report = evaluateRelationship(
      makeProspectContext({ createdAt: daysAgo(40), updatedAt: daysAgo(3) }),
      NOW
    );
    expect(report.health).toBe('healthy');
    expect(signalMap(report).follow_up_overdue).toBe(false);
  });

  it('boundary: 14 days since record update triggers follow-up, 13 does not', () => {
    const at14 = evaluateRelationship(
      makeProspectContext({ createdAt: daysAgo(40), updatedAt: daysAgo(14) }),
      NOW
    );
    const at13 = evaluateRelationship(
      makeProspectContext({ createdAt: daysAgo(40), updatedAt: daysAgo(13) }),
      NOW
    );
    expect(signalMap(at14).follow_up_overdue).toBe(true);
    expect(signalMap(at13).follow_up_overdue).toBe(false);
  });

  it('does not require follow-up on accepted or lost prospects', () => {
    for (const status of ['accepted', 'lost']) {
      const report = evaluateRelationship(
        makeProspectContext({ status, createdAt: daysAgo(60), updatedAt: daysAgo(45) }),
        NOW
      );
      expect(report.health).toBe('healthy');
      expect(signalMap(report).follow_up_overdue).toBe(false);
    }
  });

  it('evaluates a dormant prospect that reached full maturity', () => {
    const report = evaluateRelationship(
      makeProspectContext({ status: 'lost', createdAt: daysAgo(300), updatedAt: daysAgo(200) }),
      NOW
    );
    expect(report.health).toBe('dormant');
    expect(signalMap(report).dormant).toBe(true);
  });

  it('reports insufficient data for a very young prospect', () => {
    const report = evaluateRelationship(
      makeProspectContext({ createdAt: daysAgo(2), updatedAt: daysAgo(2) }),
      NOW
    );
    expect(report.health).toBe('insufficient_data');
    expect(report.priorityKey).toBe('low');
  });
});

describe('evaluateMany ordering', () => {
  it('is deterministic and idempotent across repeated evaluation', () => {
    const contexts = [
      makeClientContext({ id: 'c-1', updatedAt: daysAgo(2), interactions: [{ at: daysAgo(2), source: 'message' }] }),
      makeProspectContext({ id: 'p-1', updatedAt: daysAgo(30) }),
      makeClientContext({ id: 'c-2', createdAt: daysAgo(300), updatedAt: daysAgo(250), interactions: [] }),
    ];
    const first = evaluateMany(contexts, NOW);
    const second = evaluateMany(contexts, NOW);
    expect(second.map((r) => r.id)).toEqual(first.map((r) => r.id));
    expect(second).toEqual(first);
  });

  it('orders attention and dormant above healthy, ties by recency then id', () => {
    const active = makeClientContext({ id: 'c-active', updatedAt: daysAgo(2), interactions: [{ at: daysAgo(2), source: 'message' }] });
    const needFollowUp = makeProspectContext({ id: 'p-followup', updatedAt: daysAgo(20) });
    const dormant = makeClientContext({ id: 'c-dormant', createdAt: daysAgo(300), updatedAt: daysAgo(250), interactions: [] });

    const ids = evaluateMany([dormant, active, needFollowUp], NOW).map((r) => r.id);
    expect(ids).toContain('p-followup');
    expect(ids).toContain('c-dormant');
    expect(ids[0]).toBe('p-followup');
    expect(ids[1]).toBe('c-dormant');
    expect(ids[2]).toBe('c-active');
  });

  it('sorts ties by recency of last record activity, then id', () => {
    const a = evaluateMany(
      [
        makeClientContext({ id: 'a', status: 'inactive', createdAt: daysAgo(400), updatedAt: daysAgo(40), interactions: [] }),
        makeClientContext({ id: 'b', status: 'inactive', createdAt: daysAgo(400), updatedAt: daysAgo(100), interactions: [] }),
      ],
      NOW
    ).map((r) => r.id);
    expect(a).toEqual(['a', 'b']);
  });

  it('returns an empty list for no relationships', () => {
    expect(evaluateMany([], NOW)).toEqual([]);
  });

  it('exposes a stable priority sort helper', () => {
    const entries = [
      { priorityKey: 'low' as const, lastRecordActivityMs: daysAgo(3).getTime(), id: 'x', report: null as unknown as never },
      { priorityKey: 'high' as const, lastRecordActivityMs: daysAgo(1).getTime(), id: 'y', report: null as unknown as never },
      { priorityKey: 'medium' as const, lastRecordActivityMs: daysAgo(2).getTime(), id: 'z', report: null as unknown as never },
    ];
    const order = sortByPriority(entries).map((e) => e.id);
    expect(order).toEqual(['y', 'z', 'x']);
  });
});

describe('confidence and evidence', () => {
  it('explains every triggered signal with evidence fields', () => {
    const report = evaluateRelationship(
      makeClientContext({
        createdAt: daysAgo(300),
        updatedAt: daysAgo(200),
        interactions: [],
        upcomingMoments: [{ at: daysFromNow(2), type: 'Kickoff', source: 'message' }],
      }),
      NOW
    );
    for (const signal of report.signals.filter((s) => s.triggered)) {
      expect(signal.evidence.length).toBeGreaterThan(0);
      for (const piece of signal.evidence) {
        expect(piece.what).toBeTruthy();
        expect(piece.why).toBeTruthy();
        expect(piece.source).toBeTruthy();
      }
    }
    expect(report.explanation.evaluatedAt).toEqual(NOW);
    expect(report.explanation.lastRecordActivityAt.getTime()).toBeGreaterThanOrEqual(
      report.explanation.lastInteractionAt?.getTime() ?? 0
    );
  });

  it('carries low-confidence trend when history is thin but directional', () => {
    const report = evaluateRelationship(
      makeProspectContext({ createdAt: daysAgo(60), updatedAt: daysAgo(3), interactions: [] }),
      NOW
    );
    const trend = report.signals.find((s) => s.id === 'engagement_trend');
    expect(trend?.confidence).toBe('medium');
    expect(trend?.triggered).toBe(false);
  });

  it('honors overridden thresholds', () => {
    const tight: RelationshipIntelligenceThresholds = { ...DEFAULT_THRESHOLDS, silenceWindowDays: 14 };
    const report = evaluateRelationship(
      makeClientContext({ createdAt: daysAgo(60), updatedAt: daysAgo(50), interactions: [{ at: daysAgo(20), source: 'message' }] }),
      NOW,
      tight
    );
    expect(report.health).toBe('attention');
    expect(signalMap(report).interaction_silence).toBe(true);
  });

  it('is idempotent: evaluating the same context twice yields identical reports', () => {
    const context = makeClientContext({
      createdAt: daysAgo(300),
      updatedAt: daysAgo(200),
      interactions: [{ at: daysAgo(50), source: 'message' }],
      upcomingMoments: [{ at: daysFromNow(1), type: 'Call', source: 'message' }],
    });
    expect(evaluateRelationship(context, NOW)).toEqual(evaluateRelationship(context, NOW));
  });
});