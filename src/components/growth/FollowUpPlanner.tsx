'use client';

import { useState } from 'react';
import { CADENCE, BRANCHES, type CadenceStep } from '@/lib/growth';

const CHANNEL_ICONS: Record<CadenceStep['channel'], string> = {
  Email: '✉️',
  LinkedIn: '🗂',
  Phone: '📞',
  'Video audit': '🎥',
  SMS: '💬',
  Roundtable: '🤝',
};

export default function FollowUpPlanner() {
  const [enabled, setEnabled] = useState<boolean[]>(() => CADENCE.map(() => true));
  const [manualOnly, setManualOnly] = useState(false);
  const [addBranches, setAddBranches] = useState(true);

  const toggle = (i: number) =>
    setEnabled((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const steps = CADENCE.filter((_, i) => enabled[i]).filter((s) => !manualOnly || s.mode === 'manual');
  const autoCount = steps.filter((s) => s.mode === 'auto').length;
  const manualCount = steps.length - autoCount;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-heading font-bold text-xl text-white mb-1">Follow-Up Planner</h3>
      <p className="text-sm text-white/40 mb-6">
        The canonical 21-day nurture sequence. Toggle touches on/off, isolate manual steps, and see SLA gates.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setManualOnly((v) => !v)}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
            manualOnly ? 'border-miami-blue-light/50 bg-miami-blue-light/15 text-white' : 'border-white/10 bg-white/5 text-white/50'
          }`}
        >
          Manual touches only ({manualCount})
        </button>
        <button
          onClick={() => setAddBranches((v) => !v)}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
            addBranches ? 'border-miami-pink/50 bg-miami-pink/15 text-white' : 'border-white/10 bg-white/5 text-white/50'
          }`}
        >
          {addBranches ? 'Show exit branches' : 'Hide exit branches'}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1 text-green-300">
          SLA: first touch ≤ 15 min
        </span>
        <span className="rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1 text-green-300">
          Owner assigned ≤ 24 h after discovery
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/50">
          Auto steps ({autoCount})
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/50">
          Manual, high-value ({manualCount})
        </span>
      </div>

      <div className="space-y-2">
        {steps.map((s) => (
          <div
            key={`${s.day}-${s.channel}-${s.content}`}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              s.mode === 'manual' ? 'border-miami-pink/25 bg-miami-pink/[0.04]' : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            <div className="w-10 text-center shrink-0">
              <div className="font-heading font-black text-lg text-white">D{s.day}</div>
              <div className="text-[9px] text-white/30 uppercase">Day</div>
            </div>
            <div className="text-lg shrink-0" title={s.channel}>
              {CHANNEL_ICONS[s.channel]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/80 leading-snug">{s.content}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{s.channel}</div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                s.mode === 'manual'
                  ? 'bg-miami-pink/15 text-miami-pink-soft'
                  : 'bg-miami-blue-light/15 text-miami-blue-light'
              }`}
            >
              {s.mode === 'manual' ? 'MANUAL' : 'AUTO'}
            </span>
            <button
              onClick={() => toggle(CADENCE.indexOf(s))}
              className={`shrink-0 w-6 h-6 rounded-md border text-xs transition-colors ${
                enabled[CADENCE.indexOf(s)]
                  ? 'border-green-400/40 bg-green-500/10 text-green-300'
                  : 'border-white/15 text-white/30'
              }`}
              title="Toggle touch"
            >
              ✓
            </button>
          </div>
        ))}
      </div>

      {addBranches && (
        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          {BRANCHES.map((b) => (
            <div key={b.trigger} className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="text-xs text-white/30 uppercase tracking-wide mb-1">↳ {b.trigger}</div>
              <div className="text-sm text-white/70">{b.action}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}