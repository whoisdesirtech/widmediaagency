'use client';

import { useState } from 'react';
import { attribution, type Tier } from '@/lib/growth';

export const STAGES = [
  { key: 'new', label: 'New', color: 'text-white/50 border-white/10 bg-white/5' },
  { key: 'contacted', label: 'Contacted', color: 'text-miami-blue-light border-miami-blue-light/30 bg-miami-blue-light/10' },
  { key: 'responded', label: 'Responded', color: 'text-miami-blue-light border-miami-blue-light/30 bg-miami-blue-light/10' },
  { key: 'discovered', label: 'Discovered', color: 'text-amber-300 border-amber-400/30 bg-amber-500/10' },
  { key: 'qualified', label: 'Qualified', color: 'text-amber-300 border-amber-400/30 bg-amber-500/10' },
  { key: 'proposal', label: 'Proposal', color: 'text-miami-pink-soft border-miami-pink/30 bg-miami-pink/10' },
  { key: 'closed_won', label: 'Closed', color: 'text-green-300 border-green-400/30 bg-green-500/10' },
] as const;

export type StageKey = (typeof STAGES)[number]['key'];

export interface PipeLead {
  id: string;
  name: string;
  company: string;
  segment: string;
  owner: string;
  stage: StageKey;
  score: number;
  tier: Tier | '—';
  history: { from: StageKey; to: StageKey; actor: string; day: string }[];
  tags: string[];
}

function stageIdx(k: StageKey) {
  return STAGES.findIndex((s) => s.key === k);
}

const SEED: PipeLead[] = [
  {
    id: 'lead-1',
    name: 'M. Alvarez',
    company: '[Miami boutique hotel group]',
    segment: 'luxury_hospitality',
    owner: 'AE · Désir',
    stage: 'qualified',
    score: 78,
    tier: 'hot',
    tags: ['case-study', 'miami'],
    history: [
      { from: 'new', to: 'contacted', actor: 'AE · Désir', day: 'D0' },
      { from: 'contacted', to: 'responded', actor: 'AE · Désir', day: 'D3' },
      { from: 'responded', to: 'discovered', actor: 'AE · Désir', day: 'D7' },
      { from: 'discovered', to: 'qualified', actor: 'AE · Désir', day: 'D12' },
    ],
  },
  {
    id: 'lead-2',
    name: 'J. Reyes',
    company: '[South FL Media Agency]',
    segment: 'media_agency',
    owner: 'AE · Sasha',
    stage: 'discovered',
    score: 61,
    tier: 'hot',
    tags: ['retainer-fit'],
    history: [
      { from: 'new', to: 'contacted', actor: 'AE · Sasha', day: 'D0' },
      { from: 'contacted', to: 'responded', actor: 'AE · Sasha', day: 'D2' },
      { from: 'responded', to: 'discovered', actor: 'AE · Sasha', day: 'D9' },
    ],
  },
  {
    id: 'lead-3',
    name: 'K. Osei',
    company: '[Corporate lifestyle — advisory firm]',
    segment: 'corporate_lifestyle',
    owner: 'AE · Désir',
    stage: 'proposal',
    score: 86,
    tier: 'sales_ready',
    tags: ['exec-brand'],
    history: [
      { from: 'new', to: 'contacted', actor: 'AE · Désir', day: 'D0' },
      { from: 'contacted', to: 'responded', actor: 'AE · Désir', day: 'D1' },
      { from: 'responded', to: 'discovered', actor: 'AE · Désir', day: 'D4' },
      { from: 'discovered', to: 'qualified', actor: 'AE · Désir', day: 'D8' },
      { from: 'qualified', to: 'proposal', actor: 'AE · Désir', day: 'D14' },
    ],
  },
  {
    id: 'lead-4',
    name: 'T. Nguyen',
    company: '[Hospitality marketing co.]',
    segment: 'luxury_hospitality',
    owner: 'Junior · Cami',
    stage: 'responded',
    score: 24,
    tier: 'engaged',
    tags: ['drip-candidate'],
    history: [
      { from: 'new', to: 'contacted', actor: 'Junior · Cami', day: 'D0' },
      { from: 'contacted', to: 'responded', actor: 'Junior · Cami', day: 'D5' },
    ],
  },
];

export default function PipelineDemo() {
  const [leads, setLeads] = useState<PipeLead[]>(SEED);
  const [selectedId, setSelectedId] = useState('lead-2');
  const [attrib, setAttrib] = useState({ discovery: true, intermediates: 3, closing: true });

  const advance = (id: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const idx = stageIdx(l.stage);
        if (idx >= STAGES.length - 1) return l;
        const to = STAGES[idx + 1].key as StageKey;
        const actor = l.owner;
        const day = `D${Math.min(60, (l.history.length + 1) * 3)}`;
        return {
          ...l,
          stage: to,
          score: Math.min(100, l.score + 4),
          history: [...l.history, { from: l.stage, to, actor, day }],
        };
      })
    );
  };

  const selected = leads.find((l) => l.id === selectedId) ?? leads[0];
  const credit = attribution(attrib);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-heading font-bold text-xl text-white mb-1">CRM Pipeline Demo</h3>
      <p className="text-sm text-white/40 mb-6">
        Sample accounts (details masked). Advance stages to write StageHistory transitions and read attribution.
      </p>

      <div className="space-y-3 mb-6">
        {leads.map((l) => {
          const stage = STAGES[stageIdx(l.stage)];
          return (
            <div key={l.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-white">{l.name}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${stage.color}`}>{stage.label}</span>
                </div>
                <div className="text-xs text-white/40 truncate">
                  {l.company} · {l.owner} · score {l.score}
                </div>
              </div>
              <button
                onClick={() => advance(l.id)}
                disabled={stageIdx(l.stage) >= STAGES.length - 1}
                className="rounded-lg border border-miami-blue-light/40 px-3 py-1.5 text-xs text-miami-blue-light hover:bg-miami-blue-light/10 disabled:opacity-30 disabled:pointer-events-none shrink-0"
              >
                Advance →
              </button>
              <button
                onClick={() => setSelectedId(l.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs shrink-0 ${
                  selectedId === l.id
                    ? 'border-miami-pink/50 bg-miami-pink/15 text-white'
                    : 'border-white/10 text-white/50 hover:border-white/25'
                }`}
              >
                Details
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-xs text-white/30 uppercase tracking-wide mb-2">StageHistory — {selected.name}</div>
          <div className="space-y-1.5 max-h-44 overflow-auto scrollbar-thin">
            {selected.history.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                <span className="text-white/30">{h.day}</span>
                <span className="text-white/40">{h.from} → <b className="text-white/80">{h.to}</b></span>
                <span className="ml-auto text-white/30">by {h.actor}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-xs text-white/30 uppercase tracking-wide mb-2">Multi-touch attribution (40/20/40)</div>
          <div className="space-y-2">
            {[
              { key: 'discovery' as const, label: 'Discovery' },
              { key: 'intermediates' as const, label: 'Intermediates' },
              { key: 'closing' as const, label: 'Final conversion' },
            ].map((t) => (
              <label key={t.key} className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={t.key === 'intermediates' ? attrib.intermediates > 0 : attrib[t.key] === true}
                  onChange={(e) =>
                    setAttrib((prev) => ({ ...prev, [t.key]: t.key === 'intermediates' ? (e.target.checked ? 2 : 0) : e.target.checked }))
                  }
                  className="accent-miami-blue-light"
                />
                {t.label}
                <span className="ml-auto font-bold text-white">{credit.find((c) => c.name === t.label)?.percent ?? 0}%</span>
              </label>
            ))}
            <div className="h-2 rounded-full bg-white/10 overflow-hidden flex">
              {credit.map((c) => (
                <div key={c.name} className={c.active ? 'gradient-bg' : 'bg-white/5'} style={{ width: `${c.percent}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-white/30">
        Every advance is a status transition — the equivalent of a `StageHistory` row in PostgreSQL. Demo is read-only: no DB writes.
      </p>
    </div>
  );
}