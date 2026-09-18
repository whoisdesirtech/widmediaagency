'use client';

import { useState } from 'react';
import {
  projectFunnel,
  cacFor,
  ltvRatio,
  CAC_CAP,
  LTV_RATIO_TARGET,
  type FunnelStage,
} from '@/lib/growth';

export default function FunnelBuilder() {
  const [seed, setSeed] = useState(1000);
  const [spendTotal, setSpendTotal] = useState(12000);
  const [ltv, setLtv] = useState(12000);
  const [rates, setRates] = useState<FunnelStage[]>([
    { name: 'Responded', rate: 0.18 },
    { name: 'Qualified', rate: 0.45 },
    { name: 'Proposal', rate: 0.6 },
    { name: 'Closed', rate: 0.4 },
  ]);

  const updateRate = (i: number, rate: number) =>
    setRates((prev) => prev.map((s, idx) => (idx === i ? { ...s, rate } : s)));

  const projection = projectFunnel(seed, rates);
  const closed = projection[projection.length - 1].count;
  const cac = cacFor(spendTotal, closed);
  const ratio = ltvRatio(ltv, cac);
  const overCap = cac > 0 && cac > CAC_CAP;
  const belowTarget = cac > 0 && ratio < LTV_RATIO_TARGET;
  const max = projection[0].count;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-heading font-bold text-xl text-white mb-1">Funnel Builder</h3>
      <p className="text-sm text-white/40 mb-6">
        Model a contact base through your conversion rates and watch CAC, LTV:CAC, and the $1,500 pause trigger.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Contacts seeded', value: seed, set: setSeed, min: 100, max: 20000, step: 100 },
          { label: 'Total acquisition spend ($)', value: spendTotal, set: setSpendTotal, min: 1000, max: 60000, step: 500 },
          { label: 'Avg client LTV ($)', value: ltv, set: setLtv, min: 3000, max: 60000, step: 500 },
        ].map((s) => (
          <label key={s.label} className="block">
            <span className="text-xs text-white/50">{s.label}: <b className="text-white">{s.value.toLocaleString()}</b></span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              className="w-full accent-miami-blue-light"
            />
          </label>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        {rates.map((stage, i) => (
          <label key={stage.name} className="block">
            <span className="text-xs text-white/50">
              {stage.name} conversion: <b className="text-miami-blue-light">{Math.round(stage.rate * 100)}%</b>
            </span>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={Math.round(stage.rate * 100)}
              onChange={(e) => updateRate(i, Number(e.target.value) / 100)}
              className="w-full accent-miami-pink"
            />
          </label>
        ))}
      </div>

      <div className="space-y-2 mb-6">
        {projection.map((p) => (
          <div key={p.stage} className="flex items-center gap-3">
            <div className="w-24 text-xs text-white/50 text-right shrink-0">{p.stage}</div>
            <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-lg ${p.stage === 'Closed' ? 'gradient-bg' : 'bg-miami-blue-light/40'}`}
                style={{ width: `${Math.max(2, (p.count / max) * 100)}%` }}
              />
            </div>
            <div className="w-16 text-xs text-white/70 font-semibold">{p.count}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className={`rounded-xl border px-4 py-3 ${overCap ? 'border-miami-pink/40 bg-miami-pink/10' : 'border-white/10 bg-white/[0.02]'}`}>
          <div className="text-xs text-white/50">Cost per acquisition</div>
          <div className={`font-heading font-black text-2xl ${overCap ? 'text-miami-pink-soft' : 'text-white'}`}>
            ${cac.toLocaleString()}
          </div>
          <div className="text-xs text-white/40">Cap: ${CAC_CAP.toLocaleString()}</div>
          {overCap && (
            <div className="mt-2 text-xs text-miami-pink-soft font-semibold">
              ⏸ Campaign exceeds CAC cap — pause for creative review (30-day rule).
            </div>
          )}
        </div>
        <div className={`rounded-xl border px-4 py-3 ${belowTarget ? 'border-amber-400/40 bg-amber-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
          <div className="text-xs text-white/50">LTV:CAC</div>
          <div className={`font-heading font-black text-2xl ${belowTarget ? 'text-amber-300' : 'text-white'}`}>
            {cac > 0 ? ratio.toFixed(1) : '—'}
          </div>
          <div className="text-xs text-white/40">Target: {LTV_RATIO_TARGET}:1</div>
        </div>
      </div>
    </div>
  );
}