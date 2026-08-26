'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface GTMAnalysis {
  id: string;
  strategySummary: string;
  pricingRecommendations: any;
  staffingPlan: any;
  timelineEstimate: any;
  keyRisks: any;
  assumptions: any;
  status: string;
  reviewedBy: { id: string; name: string; email: string } | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Prospect {
  id: string;
  name: string;
  websiteUrl: string | null;
  status: string;
  intelligence: {
    id: string;
    marketFitScore: number | null;
    gtmAnalysis: GTMAnalysis | null;
  } | null;
}

const GTM_STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-white/10 border border-white/20', text: 'text-white/60', label: 'Draft' },
  reviewed: { bg: 'bg-amber-500/10 border border-amber-500/20', text: 'text-amber-400', label: 'Reviewed' },
  approved: { bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400', label: 'Approved' },
};

const JSON_FIELDS = [
  { key: 'pricingRecommendations', label: 'Pricing Recommendations (JSON)', placeholder: '{"tiers": [{"name": "Starter", "price": 2500}], "recommended": "Starter"}' },
  { key: 'staffingPlan', label: 'Staffing Plan (JSON)', placeholder: '{"roles": [{"role": "Videographer", "capacity": "2 days/event"}]}' },
  { key: 'timelineEstimate', label: 'Timeline Estimate (JSON)', placeholder: '{"phases": [{"name": "Discovery", "durationWeeks": 2}]}' },
  { key: 'keyRisks', label: 'Key Risks (JSON)', placeholder: '[{"risk": "...", "mitigation": "..."}]' },
  { key: 'assumptions', label: 'Assumptions (JSON)', placeholder: '["prospect hosts quarterly events", "budget approved by Q3"]' },
];

export default function GTMWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [strategySummary, setStrategySummary] = useState('');
  const [gtmData, setGtmData] = useState<Record<string, any>>({
    pricingRecommendations: {},
    staffingPlan: {},
    timelineEstimate: {},
    keyRisks: [],
    assumptions: [],
  });
  const [status, setStatus] = useState('draft');

  const loadGtm = useCallback(async () => {
    try {
      const res = await fetch(`/api/sales/prospects/${id}`);
      if (!res.ok) {
        if (res.status === 404) router.push('/admin/sales/prospects');
        throw new Error('Failed to fetch');
      }
      const data: Prospect = await res.json();
      setProspect(data);

      const gtm = data.intelligence?.gtmAnalysis;
      if (gtm) {
        setStrategySummary(gtm.strategySummary || '');
        setGtmData({
          pricingRecommendations: gtm.pricingRecommendations || {},
          staffingPlan: gtm.staffingPlan || {},
          timelineEstimate: gtm.timelineEstimate || {},
          keyRisks: gtm.keyRisks || [],
          assumptions: gtm.assumptions || [],
        });
        setStatus(gtm.status || 'draft');
      }
    } catch {
      console.error('Failed to load GTM analysis');
      router.push('/admin/sales/prospects');
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const user = JSON.parse(stored);
    if (user.role !== 'admin' && user.role !== 'staff') { router.push('/login'); return; }
    loadGtm();
  }, [router, loadGtm]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/sales/prospects/${id}/gtm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategySummary, ...gtmData, status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to save');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save GTM analysis');
    }
    setSaving(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setGtmData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-dark">
        <Sidebar />
        <main className="ml-64 flex-1">
          <div className="max-w-4xl mx-auto px-8 py-20 text-center text-white/40">
            Loading GTM workspace...
          </div>
        </main>
      </div>
    );
  }

  if (!prospect) return null;

  const gtmStatusConfig = GTM_STATUS_CONFIG[status] || GTM_STATUS_CONFIG.draft;

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <main className="ml-64 flex-1">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/admin/sales/prospects/${id}`)}
                className="text-white/50 hover:text-white text-sm"
              >
                ← Back to Prospect
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${gtmStatusConfig.bg} ${gtmStatusConfig.text}`}>
                {gtmStatusConfig.label}
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-white focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
              >
                <option value="draft">Draft</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold text-white">GTM Analysis — {prospect.name}</h1>
            <p className="text-white/50 text-sm mt-1">{prospect.websiteUrl || 'No website'}</p>
            {prospect.intelligence?.marketFitScore !== null && prospect.intelligence?.marketFitScore !== undefined && (
              <p className="text-white/40 text-xs mt-1">Market fit score: {prospect.intelligence.marketFitScore}%</p>
            )}
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {!prospect.intelligence && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              This prospect has no intelligence record yet. Create one on the Intelligence tab before saving a GTM analysis.
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Strategy</h2>
                <button
                  onClick={handleSave}
                  disabled={saving || !prospect.intelligence}
                  className="px-4 py-2 text-sm font-medium text-white bg-miami-pink hover:bg-miami-pink/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save GTM Analysis'}
                </button>
              </div>
              <textarea
                value={strategySummary}
                onChange={(e) => setStrategySummary(e.target.value)}
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                placeholder="Summarize the go-to-market strategy for this prospect: positioning, angle, service mix, and why now..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {JSON_FIELDS.map(field => (
                <div key={field.key} className={field.key === 'assumptions' ? 'md:col-span-2' : ''}>
                  <label className="block text-white/70 text-sm font-medium mb-2">{field.label}</label>
                  <textarea
                    value={JSON.stringify(gtmData[field.key] ?? {}, null, 2)}
                    onChange={(e) => {
                      try { handleFieldChange(field.key, JSON.parse(e.target.value)); } catch {}
                    }}
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink font-mono text-sm"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            {prospect.intelligence?.gtmAnalysis?.reviewedBy && (
              <p className="text-white/40 text-xs">
                Last reviewed by {prospect.intelligence.gtmAnalysis.reviewedBy.name} on{' '}
                {new Date(prospect.intelligence.gtmAnalysis.reviewedAt!).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
