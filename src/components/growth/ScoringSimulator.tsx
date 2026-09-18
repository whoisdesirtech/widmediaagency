'use client';

import { useState } from 'react';
import {
  SCORE_POINTS,
  SCORE_LABELS,
  scoreLead,
  tierFor,
  type ScoreAction,
  type Tier,
} from '@/lib/growth';

const ACTIONS = Object.keys(SCORE_POINTS) as ScoreAction[];

const TIER_STYLES: Record<Tier, { label: string; cls: string }> = {
  cold: { label: 'Cold list', cls: 'text-white/50 border-white/10 bg-white/5' },
  engaged: { label: 'Engaged', cls: 'text-miami-blue-light border-miami-blue-light/30 bg-miami-blue-light/10' },
  hot: { label: 'Hot', cls: 'text-amber-300 border-amber-400/30 bg-amber-500/10' },
  sales_ready: { label: 'Sales-ready', cls: 'text-green-300 border-green-400/30 bg-green-500/10' },
};

const THRESHOLDS = [20, 50, 80];

export default function ScoringSimulator() {
  const [actions, setActions] = useState<ScoreAction[]>(['form_submission']);
  const { score, tier } = scoreLead(actions);

  const toggle = (a: ScoreAction) =>
    setActions((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const pct = Math.min(100, Math.round((score / 100) * 100));

  const nextJump = ACTIONS.filter((a) => !actions.includes(a))
    .map((a) => ({ action: a, toScore: score + SCORE_POINTS[a], toTier: tierFor(score + SCORE_POINTS[a]) }))
    .filter((j) => j.toTier !== tier)
    .sort((x, y) => x.toScore - y.toScore)[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-heading font-bold text-xl text-white mb-1">Behavioral Scoring Simulator</h3>
      <p className="text-sm text-white/40 mb-6">
        Toggle observable actions to see score, tier, and the single action that pushes the lead into the next tier.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {ACTIONS.map((a) => {
          const on = actions.includes(a);
          return (
            <button
              key={a}
              onClick={() => toggle(a)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                on
                  ? 'border-miami-blue-light/50 bg-miami-blue-light/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/25'
              }`}
            >
              +{SCORE_POINTS[a]} {SCORE_LABELS[a]}
            </button>
          );
        })}
      </div>

      <div className="mb-2 flex items-end justify-between">
        <div className="font-heading font-black text-4xl gradient-text">{score}</div>
        <div className={`rounded-full border px-4 py-1.5 text-sm font-bold ${TIER_STYLES[tier].cls}`}>
          {TIER_STYLES[tier].label}
        </div>
      </div>

      <div className="relative h-3 rounded-full bg-white/10 mb-1">
        <div className="absolute inset-y-0 left-0 rounded-full gradient-bg transition-all duration-300" style={{ width: `${pct}%` }} />
        {THRESHOLDS.map((t) => (
          <div key={t} className="absolute inset-y-0 w-px bg-white/30" style={{ left: `${t}%` }} />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-white/30 mb-6">
        <span>0 cold</span>
        <span>50 hot</span>
        <span>80 sales-ready</span>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
        {nextJump ? (
          <p className="text-white/60">
            Closest next-tier move:{' '}
            <span className="text-miami-blue-light font-semibold">+{SCORE_POINTS[nextJump.action]} </span>
            {SCORE_LABELS[nextJump.action]} → <span className="font-semibold text-white">{score + SCORE_POINTS[nextJump.action]} pts</span>{' '}
            ({tierFor(score + SCORE_POINTS[nextJump.action])})
          </p>
        ) : (
          <p className="text-white/40">Score is maxed for current toggles, or no single action crosses a threshold.</p>
        )}
      </div>

      <p className="mt-4 text-xs text-white/30">
        Scoring feeds the CRM auto-flag. Sales-ready tier still requires the full BANT gate before proposal.
      </p>
    </div>
  );
}