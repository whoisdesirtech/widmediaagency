'use client';

import { useState } from 'react';
import { qualifyLead, SEGMENT_LABELS, type QualifyInput } from '@/lib/growth';

const inputCls =
  'w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm focus:border-miami-pink outline-none';

const VERDICT_STYLES: Record<string, { label: string; cls: string; icon: string }> = {
  sales_ready: { label: 'Sales-ready', cls: 'bg-green-500/10 border-green-400/30 text-green-300', icon: '✓' },
  education_drip: { label: 'Education drip', cls: 'bg-miami-blue-light/10 border-miami-blue-light/30 text-miami-blue-light', icon: '↻' },
  referral_out: { label: 'Partner referral', cls: 'bg-amber-500/10 border-amber-400/30 text-amber-300', icon: '→' },
  out_of_scope: { label: 'Out of scope', cls: 'bg-miami-pink/10 border-miami-pink/30 text-miami-pink-soft', icon: '!' },
};

export default function QualificationCalculator() {
  const [input, setInput] = useState<QualifyInput>({
    segment: 'media_agency',
    annualRevenue: '1M-5M',
    retainerBudget: 0,
    projectBudget: 10000,
    decisionTimeline: '<30days',
    hasAuthority: true,
    serviceInterest: 'retainer',
  });

  const set = <K extends keyof QualifyInput>(key: K, value: QualifyInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const result = qualifyLead(input);
  const style = VERDICT_STYLES[result.verdict];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-heading font-bold text-xl text-white mb-1">Qualification Calculator</h3>
      <p className="text-sm text-white/40 mb-6">
        BANT + agency floors. Sales-ready = $1M+ revenue AND $3k/mo or $10k project AND authority within 30 days.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-xs text-white/50 mb-1" htmlFor="q-segment">
          Segment
        </label>
        <select
          id="q-segment"
          className={inputCls}
          value={input.segment}
          onChange={(e) => set('segment', e.target.value as QualifyInput['segment'])}
        >
          {Object.entries(SEGMENT_LABELS).map(([v, l]) => (
            <option key={v} value={v} className="bg-dark-800">
              {l}
            </option>
          ))}
        </select>

        <label className="block text-xs text-white/50 mb-1" htmlFor="q-revenue">
          Annual revenue
        </label>
        <select
          id="q-revenue"
          className={inputCls}
          value={input.annualRevenue}
          onChange={(e) => set('annualRevenue', e.target.value)}
        >
          <option value="<1M" className="bg-dark-800">
            Under $1M
          </option>
          <option value="1M-5M" className="bg-dark-800">
            $1M – $5M
          </option>
          <option value="5M-20M" className="bg-dark-800">
            $5M – $20M
          </option>
          <option value="20M+" className="bg-dark-800">
            $20M+
          </option>
        </select>

        <label className="block text-xs text-white/50 mb-1" htmlFor="q-retainer">
          Retainer budget ($/mo, 0 if none)
        </label>
        <input
          id="q-retainer"
          type="number"
          min={0}
          step={500}
          className={inputCls}
          value={input.retainerBudget ?? 0}
          onChange={(e) => set('retainerBudget', Number(e.target.value))}
        />

        <label className="block text-xs text-white/50 mb-1" htmlFor="q-project">
          Project budget ($, 0 if none)
        </label>
        <input
          id="q-project"
          type="number"
          min={0}
          step={1000}
          className={inputCls}
          value={input.projectBudget ?? 0}
          onChange={(e) => set('projectBudget', Number(e.target.value))}
        />

        <label className="block text-xs text-white/50 mb-1" htmlFor="q-timeline">
          Decision timeline
        </label>
        <select
          id="q-timeline"
          className={inputCls}
          value={input.decisionTimeline}
          onChange={(e) => set('decisionTimeline', e.target.value)}
        >
          <option value="immediate" className="bg-dark-800">
            Immediate
          </option>
          <option value="<30days" className="bg-dark-800">
            Within 30 days
          </option>
          <option value="30-90days" className="bg-dark-800">
            30–90 days
          </option>
          <option value="90days+" className="bg-dark-800">
            90+ days
          </option>
        </select>

        <label className="block text-xs text-white/50 mb-1" htmlFor="q-service">
          Service interest
        </label>
        <select
          id="q-service"
          className={inputCls}
          value={input.serviceInterest}
          onChange={(e) => set('serviceInterest', e.target.value)}
        >
          <option value="retainer" className="bg-dark-800">
            Ongoing retainer
          </option>
          <option value="project" className="bg-dark-800">
            One-time project
          </option>
          <option value="audit" className="bg-dark-800">
            Operational audit
          </option>
          <option value="technical-custom" className="bg-dark-800">
            Custom technical build
          </option>
        </select>

        <label className="flex items-center gap-2 text-sm text-white/60 sm:col-span-2 cursor-pointer">
          <input
            type="checkbox"
            checked={input.hasAuthority === true}
            onChange={(e) => set('hasAuthority', e.target.checked)}
            className="accent-miami-blue-light"
          />
          We have decision authority to move within 30 days
        </label>
      </div>

      <div className={`mt-6 rounded-xl border px-5 py-4 ${style.cls}`}>
        <div className="font-heading font-bold text-lg flex items-center gap-2">
          <span>{style.icon}</span> {style.label}
        </div>
        <p className="text-sm opacity-90 mt-1">{result.rule}</p>
      </div>

      <div className="mt-4 space-y-2">
        {result.checked.map((c) => (
          <div key={c.label} className="flex items-start gap-2 text-sm">
            <span className={c.pass ? 'text-green-400' : 'text-miami-pink'}>{c.pass ? '✓' : '✗'}</span>
            <span className="text-white/60">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}