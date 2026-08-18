'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Influencer {
  id: string;
  name: string;
  platform: string;
  username?: string;
  followers?: number;
  engagementRate?: number;
  niche?: string;
}

interface ModuleResult {
  module: string;
  score: number;
  weight: number;
  breakdown: Record<string, number>;
  notes: string[];
  recommendations: string[];
}

interface AuditResult {
  overallScore: number;
  grade: string;
  modules: ModuleResult[];
  summary: string;
  dataCompleteness?: {
    availableFields: string[];
    missingFields: string[];
    percentComplete: number;
    warnings: string[];
  };
  disclaimers?: string[];
}

const GRADE_COLORS: Record<string, string> = {
  'A+': 'from-emerald-400 to-emerald-600 text-white',
  'A': 'from-emerald-400 to-emerald-500 text-white',
  'B+': 'from-cyan-400 to-cyan-600 text-white',
  'B': 'from-cyan-400 to-cyan-500 text-white',
  'C+': 'from-amber-400 to-amber-500 text-white',
  'C': 'from-amber-400 to-amber-600 text-white',
  'D': 'from-orange-400 to-orange-600 text-white',
  'F': 'from-red-400 to-red-600 text-white',
};

export default function AuditAgentPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/influencers')
      .then(r => r.json())
      .then(data => setInfluencers(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch('/api/influencer-audits?limit=10')
      .then(r => r.json())
      .then(data => setHistory(Array.isArray(data) ? data : data.audits || []))
      .catch(() => {});
  }, []);

  const handleRunAudit = async () => {
    if (!selectedId) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/audit-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ influencerId: selectedId }),
      });
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
        // Refresh history
        const updated = await fetch('/api/influencer-audits?limit=10').then(r => r.json());
        setHistory(Array.isArray(updated) ? updated : updated.audits || []);
      }
    } catch {}
    setRunning(false);
  };

  const selectedInfluencer = influencers.find(i => i.id === selectedId);

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-heading text-2xl font-black text-gray-900 mb-1">Audit Agent</h1>
        <p className="text-sm text-gray-500 mb-6">AI-powered modular scoring framework</p>

        {/* Run Audit Section */}
        <div className="glass-card p-6 mb-6">
          <h3 className="font-heading font-bold text-gray-900 mb-3">Run Audit</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Influencer</label>
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
              >
                <option value="">Choose an influencer...</option>
                {influencers.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.platform}) — @{i.username || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRunAudit}
              disabled={!selectedId || running}
              className="btn-primary disabled:opacity-50"
            >
              {running ? 'Running...' : 'Run Audit'}
            </button>
          </div>
          {selectedInfluencer && (
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span>Followers: <strong className="text-gray-700">{selectedInfluencer.followers?.toLocaleString() || 'N/A'}</strong></span>
              <span>Engagement: <strong className="text-gray-700">{selectedInfluencer.engagementRate || 'N/A'}%</strong></span>
              <span>Niche: <strong className="text-gray-700">{selectedInfluencer.niche || 'N/A'}</strong></span>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="glass-card p-6 text-center">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Overall Score</div>
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${GRADE_COLORS[result.grade] || 'from-gray-400 to-gray-600 text-white'} text-4xl font-black mb-2`}>
                {result.grade}
              </div>
              <div className="text-3xl font-heading font-black text-gray-900">{result.overallScore}<span className="text-lg text-gray-400">/100</span></div>
              <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">{result.summary}</p>
            </div>

            {/* Human Review Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-amber-500 text-lg mt-0.5">⚠</span>
                <div>
                  <div className="text-sm font-semibold text-amber-800">Requires Human Review</div>
                  <div className="text-xs text-amber-700 mt-1">This audit is an algorithmic assessment. Scores must be reviewed by a human before being published or shared with clients.</div>
                </div>
              </div>
            </div>

            {/* Disclaimers */}
            {result.disclaimers && result.disclaimers.length > 0 && (
              <div className="glass-card p-4 mb-4">
                <div className="text-xs font-semibold text-gray-500 mb-2">Disclaimers</div>
                <div className="space-y-1">
                  {result.disclaimers.map((d: string, i: number) => (
                    <div key={i} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Completeness */}
            {result.dataCompleteness && (
              <div className="glass-card p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">Data Completeness</span>
                  <span className="text-sm font-bold text-gray-700">{result.dataCompleteness.percentComplete}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full" style={{ width: `${result.dataCompleteness.percentComplete}%` }} />
                </div>
                {result.dataCompleteness.warnings && result.dataCompleteness.warnings.length > 0 && (
                  <div className="space-y-0.5 mt-2">
                    {result.dataCompleteness.warnings.map((w: string, i: number) => (
                      <div key={i} className="text-xs text-amber-600">⚠ {w}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Module Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.modules.map((mod, i) => (
                <div key={i} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-heading font-bold text-sm text-gray-900">{mod.module}</h4>
                    <span className="text-2xl font-heading font-black text-gray-900">{mod.score}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full" style={{ width: `${mod.score}%` }} />
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-1 mb-3">
                    {Object.entries(mod.breakdown).map(([key, val], j) => (
                      <div key={j} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-semibold text-gray-700">{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {mod.notes.length > 0 && (
                    <div className="text-xs text-gray-500 space-y-0.5">
                      {mod.notes.map((n, j) => <div key={j}>💡 {n}</div>)}
                    </div>
                  )}

                  {/* Recommendations */}
                  {mod.recommendations.length > 0 && (
                    <div className="text-xs text-amber-600 space-y-0.5 mt-2">
                      {mod.recommendations.map((r, j) => <div key={j}>→ {r}</div>)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* All Recommendations Summary */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-gray-900 mb-3">All Recommendations</h3>
              <div className="space-y-2">
                {result.modules.flatMap(m => m.recommendations).map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-0.5">⚠</span>
                    <span className="text-gray-700">{rec}</span>
                  </div>
                ))}
                {result.modules.flatMap(m => m.recommendations).length === 0 && (
                  <div className="text-sm text-emerald-600">All checks passed — no critical issues.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Audit History */}
        <div className="glass-card p-6 mt-6">
          <h3 className="font-heading font-bold text-gray-900 mb-3">Recent Audits</h3>
          {history.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-6">No audits yet. Run your first audit above.</div>
          ) : (
            <div className="space-y-2">
              {history.map((audit: any, i: number) => (
                <Link
                  key={i}
                  href={`/developer/audits/${audit.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{audit.influencer?.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{audit.influencer?.platform}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-700">{audit.overallScore}/100</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{audit.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
