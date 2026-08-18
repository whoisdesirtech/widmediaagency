'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_OPTIONS = [
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: 'Completed', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'under-review', label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
  { value: 'approved', label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
];

const SCORE_CATEGORIES = [
  { key: 'profileOptimizationScore', label: 'Profile Optimization' },
  { key: 'brandIdentityScore', label: 'Brand Identity' },
  { key: 'contentQualityScore', label: 'Content Quality' },
  { key: 'contentConsistencyScore', label: 'Content Consistency' },
  { key: 'audienceAlignmentScore', label: 'Audience Alignment' },
  { key: 'engagementScore', label: 'Engagement' },
  { key: 'discoverabilityScore', label: 'Discoverability' },
  { key: 'professionalReadinessScore', label: 'Professional Readiness' },
  { key: 'brandPartnershipReadinessScore', label: 'Brand Partnership Readiness' },
];

export default function DeveloperAuditsPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    influencerId: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    
    Promise.all([
      fetch(`/api/influencer-audits?${params.toString()}`).then(r => r.json()),
      fetch('/api/influencers').then(r => r.json()),
    ]).then(([a, i]) => {
      setAudits(Array.isArray(a) ? a : []);
      setInfluencers(Array.isArray(i) ? i : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/influencer-audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const audit = await res.json();
        setAudits(prev => [audit, ...prev]);
        setShowCreate(false);
        setForm({ influencerId: '', notes: '' });
      }
    } catch {}
    setSaving(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-black text-gray-900">Influencer Audits</h1>
            <p className="text-gray-500 text-sm mt-1">Track and manage influencer audit assessments</p>
          </div>
          <div className="flex gap-3">
            <Link href="/developer/audits/portfolio" className="btn-secondary">📊 Audit Portfolio</Link>
            <button onClick={() => setShowCreate(true)} className="btn-primary">+ New Audit</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search audits..."
            value={filter.search || ''}
            onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Audits List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : audits.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">📊</div>
            <div className="font-heading font-bold text-gray-900 mb-1">No Audits Yet</div>
            <div className="text-gray-500 text-sm mb-4">Create your first influencer audit to get started.</div>
            <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ New Audit</button>
          </div>
        ) : (
          <div className="space-y-4">
            {audits.filter(a => {
              if (filter.search && !a.influencer?.name?.toLowerCase().includes(filter.search.toLowerCase()) && !a.influencer?.username?.toLowerCase().includes(filter.search.toLowerCase())) return false;
              return true;
            }).map((audit) => {
              const statusOpt = STATUS_OPTIONS.find(s => s.value === audit.status);
              return (
                <div key={audit.id} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-cyan-400 flex items-center justify-center text-white font-heading font-bold text-sm">
                        {audit.influentner?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-gray-900">{audit.influencer?.name || 'Unknown'}</h3>
                        <p className="text-xs text-gray-500">
                          {audit.influencer?.platform} · @{audit.influencer?.username || 'N/A'}
                          {audit.auditor && ` · by ${audit.auditor.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`font-heading font-black text-2xl ${getScoreColor(audit.overallScore)}`}>
                          {Math.round(audit.overallScore)}%
                        </div>
                        <div className="text-[0.6rem] text-gray-500">Overall Score</div>
                      </div>
                      <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusOpt?.color || 'bg-gray-100 text-gray-700'}`}>
                        {statusOpt?.label || audit.status}
                      </span>
                    </div>
                  </div>

                  {/* Score Grid */}
                  <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mb-4">
                    {SCORE_CATEGORIES.map(cat => (
                      <div key={cat.key} className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className={`font-heading font-bold text-sm ${getScoreColor(audit[cat.key] || 0)}`}>
                          {Math.round(audit[cat.key] || 0)}
                        </div>
                        <div className="text-[0.5rem] text-gray-500 leading-tight">{cat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {audit.aiGenerated && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mr-2">AI Generated</span>
                      )}
                      {new Date(audit.auditDate || audit.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/developer/audits/${audit.id}`} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        View Details
                      </Link>
                      {audit.brandKit && (
                        <Link href={`/developer/brand-kits/${audit.brandKit.id}`} className="px-3 py-1.5 bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold rounded-lg hover:bg-pink-100 transition-colors">
                          View Brand Kit
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-gray-900 text-lg">New Audit</h3>
                  <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Influencer *</label>
                  <select
                    value={form.influencerId} required
                    onChange={e => setForm(f => ({ ...f, influencerId: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                  >
                    <option value="">Select an influencer</option>
                    {influencers.map((inf: any) => (
                      <option key={inf.id} value={inf.id}>{inf.name} ({inf.platform})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    rows={3}
                    placeholder="Any initial notes about this audit"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                    {saving ? 'Creating...' : 'Create Audit'}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
