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
  { key: 'profileOptimizationScore', label: 'Profile' },
  { key: 'brandIdentityScore', label: 'Brand' },
  { key: 'contentQualityScore', label: 'Content' },
  { key: 'engagementScore', label: 'Engagement' },
  { key: 'professionalReadinessScore', label: 'Professional' },
];

export default function AuditPortfolioPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '' });
  const [selectedAudit, setSelectedAudit] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    
    fetch(`/api/influencer-audits?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setAudits(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const completedAudits = audits.filter(a => ['completed', 'approved'].includes(a.status));

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/developer/audits" className="text-gray-400 hover:text-gray-600">← Back to Audits</Link>
          </div>
          <h1 className="font-heading text-2xl font-black text-gray-900">Influencer Audit Portfolio</h1>
          <p className="text-gray-500 text-sm mt-1">Showcase of completed influencer audits and brand kit deliverables</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Audits', value: audits.length, color: 'text-gray-900' },
            { label: 'Completed', value: completedAudits.length, color: 'text-emerald-600' },
            { label: 'Avg Score', value: completedAudits.length > 0 ? Math.round(completedAudits.reduce((a, b) => a + b.overallScore, 0) / completedAudits.length) + '%' : 'N/A', color: 'text-blue-600' },
            { label: 'Brand Kits', value: completedAudits.filter(a => a.brandKit).length, color: 'text-pink-600' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4">
              <div className={`font-heading font-black text-2xl ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
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

        {/* Portfolio Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-xl"></div>
                <div className="p-5">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : completedAudits.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">📊</div>
            <div className="font-heading font-bold text-gray-900 mb-1">No Completed Audits Yet</div>
            <div className="text-gray-500 text-sm mb-4">Completed audits will appear here as a portfolio showcase.</div>
            <Link href="/developer/audits" className="btn-primary inline-flex">+ Start New Audit</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedAudits.map((audit) => {
              const statusOpt = STATUS_OPTIONS.find(s => s.value === audit.status);
              return (
                <div key={audit.id} className="glass-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedAudit(audit)}>
                  {/* Score Header */}
                  <div className={`h-32 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 relative`}>
                    <div className="text-center">
                      <div className={`font-heading font-black text-5xl ${getScoreColor(audit.overallScore)}`}>
                        {Math.round(audit.overallScore)}
                      </div>
                      <div className="text-white/60 text-sm">Overall Score</div>
                    </div>
                    {audit.brandKit && (
                      <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                        🎨 Brand Kit
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Influencer Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-cyan-400 flex items-center justify-center text-white font-heading font-bold text-sm">
                        {audit.influencer?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-gray-900">{audit.influencer?.name || 'Unknown'}</h3>
                        <p className="text-xs text-gray-500">{audit.influencer?.platform} · @{audit.influencer?.username || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Mini Score Grid */}
                    <div className="grid grid-cols-5 gap-1 mb-4">
                      {SCORE_CATEGORIES.map(cat => (
                        <div key={cat.key} className="text-center">
                          <div className={`text-xs font-bold ${getScoreColor(audit[cat.key] || 0)}`}>
                            {Math.round(audit[cat.key] || 0)}
                          </div>
                          <div className="text-[0.5rem] text-gray-500">{cat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Status & Date */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusOpt?.color || 'bg-gray-100 text-gray-700'}`}>
                        {statusOpt?.label || audit.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(audit.auditDate || audit.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Case Study Modal */}
        {selectedAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-gray-900 text-lg">Audit Case Study</h3>
                  <button onClick={() => setSelectedAudit(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Influencer Overview */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-cyan-400 flex items-center justify-center text-white font-heading font-bold text-xl">
                    {selectedAudit.influencer?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-gray-900">{selectedAudit.influencer?.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedAudit.influencer?.platform} · @{selectedAudit.influencer?.username}
                      {selectedAudit.influencer?.niche && ` · ${selectedAudit.influencer.niche}`}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className={`font-heading font-black text-4xl ${getScoreColor(selectedAudit.overallScore)}`}>
                      {Math.round(selectedAudit.overallScore)}%
                    </div>
                    <div className="text-xs text-gray-500">Overall Score</div>
                  </div>
                </div>

                {/* Scorecard */}
                <div className="mb-6">
                  <h3 className="font-heading font-bold text-gray-900 mb-3">Scorecard</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {SCORE_CATEGORIES.map(cat => (
                      <div key={cat.key} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-700">{cat.label}</span>
                          <span className={`font-heading font-bold ${getScoreColor(selectedAudit[cat.key] || 0)}`}>
                            {Math.round(selectedAudit[cat.key] || 0)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${getScoreBg(selectedAudit[cat.key] || 0)} rounded-full`} style={{ width: `${selectedAudit[cat.key] || 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Findings */}
                {selectedAudit.findings && (() => {
                  const findings = typeof selectedAudit.findings === 'string' ? JSON.parse(selectedAudit.findings) : selectedAudit.findings;
                  return findings.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-heading font-bold text-gray-900 mb-3">Key Findings</h3>
                      <div className="space-y-2">
                        {findings.map((finding: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-cyan-500 mt-0.5">•</span>
                            <span>{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Recommendations */}
                {selectedAudit.recommendations && (() => {
                  const recs = typeof selectedAudit.recommendations === 'string' ? JSON.parse(selectedAudit.recommendations) : selectedAudit.recommendations;
                  return recs.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-heading font-bold text-gray-900 mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        {recs.map((rec: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-pink-500 mt-0.5">→</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Brand Kit Preview */}
                {selectedAudit.brandKit && (
                  <div className="mb-6">
                    <h3 className="font-heading font-bold text-gray-900 mb-3">Brand Kit</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex gap-1">
                          <div className="w-8 h-8 rounded" style={{ backgroundColor: selectedAudit.brandKit.primaryColor }}></div>
                          <div className="w-8 h-8 rounded" style={{ backgroundColor: selectedAudit.brandKit.secondaryColor }}></div>
                          <div className="w-8 h-8 rounded" style={{ backgroundColor: selectedAudit.brandKit.accentColor }}></div>
                        </div>
                        <div>
                          <div className="font-heading font-bold text-sm text-gray-900">{selectedAudit.brandKit.name || 'Brand Kit'}</div>
                          <div className="text-xs text-gray-500">{selectedAudit.brandKit.completionPercent}% complete</div>
                        </div>
                      </div>
                      {selectedAudit.brandKit.tagline && (
                        <p className="text-sm text-gray-600 italic">"{selectedAudit.brandKit.tagline}"</p>
                      )}
                      {/* Brand Kit Sections */}
                      {selectedAudit.brandKit.sections && selectedAudit.brandKit.sections.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedAudit.brandKit.sections.map((section: any) => (
                            <span key={section.id} className={`text-xs px-2 py-0.5 rounded-full ${section.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                              {section.sectionType.replace(/-/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Before/After Strategy */}
                <div className="mb-6">
                  <h3 className="font-heading font-bold text-gray-900 mb-3">Before / After Strategy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <h4 className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wider">Before Audit</h4>
                      <ul className="space-y-1.5 text-sm text-gray-700">
                        <li className="flex items-start gap-2"><span className="text-red-400">✕</span> Inconsistent brand identity across platforms</li>
                        <li className="flex items-start gap-2"><span className="text-red-400">✕</span> No defined content pillars or posting strategy</li>
                        <li className="flex items-start gap-2"><span className="text-red-400">✕</span> Low engagement due to unfocused content</li>
                        <li className="flex items-start gap-2"><span className="text-red-400">✕</span> Missing professional positioning</li>
                      </ul>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <h4 className="text-xs font-semibold text-emerald-700 mb-2 uppercase tracking-wider">After Audit</h4>
                      <ul className="space-y-1.5 text-sm text-gray-700">
                        <li className="flex items-start gap-2"><span className="text-emerald-500">✓</span> Cohesive visual identity with defined palette</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-500">✓</span> Strategic content pillars driving engagement</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-500">✓</span> Professional brand positioning for partnerships</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-500">✓</span> Consistent brand voice and tone guidelines</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Final Deliverables */}
                <div className="mb-6">
                  <h3 className="font-heading font-bold text-gray-900 mb-3">Final Deliverables</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Brand Audit Report', icon: '📊', done: selectedAudit.overallScore > 0 },
                      { label: 'Brand Kit', icon: '🎨', done: !!selectedAudit.brandKit },
                      { label: 'Strategy Deck', icon: '📑', done: selectedAudit.status === 'approved' },
                      { label: 'Content Calendar', icon: '📅', done: false },
                    ].map((item, i) => (
                      <div key={i} className={`rounded-xl p-3 text-center ${item.done ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50 border border-gray-100'}`}>
                        <div className="text-2xl mb-1">{item.icon}</div>
                        <div className="text-xs font-semibold text-gray-700">{item.label}</div>
                        <div className={`text-xs mt-1 ${item.done ? 'text-emerald-600' : 'text-gray-400'}`}>{item.done ? 'Completed' : 'Pending'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Info */}
                <div className="text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <span>Audited by {selectedAudit.auditor?.name || 'Unknown'} · </span>
                  <span>{new Date(selectedAudit.auditDate || selectedAudit.createdAt).toLocaleDateString()}</span>
                  {selectedAudit.aiGenerated && <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">AI Generated</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
