'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [audit, setAudit] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editScores, setEditScores] = useState(false);
  const [scoreForm, setScoreForm] = useState({
    profileOptimizationScore: 0,
    brandIdentityScore: 0,
    contentQualityScore: 0,
    contentConsistencyScore: 0,
    audienceAlignmentScore: 0,
    engagementScore: 0,
    discoverabilityScore: 0,
    professionalReadinessScore: 0,
    brandPartnershipReadinessScore: 0,
  });

  useEffect(() => {
    fetch(`/api/influencer-audits/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setAudit(data);
        setScores(data.scores || []);
        setScoreForm({
          profileOptimizationScore: data.profileOptimizationScore || 0,
          brandIdentityScore: data.brandIdentityScore || 0,
          contentQualityScore: data.contentQualityScore || 0,
          contentConsistencyScore: data.contentConsistencyScore || 0,
          audienceAlignmentScore: data.audienceAlignmentScore || 0,
          engagementScore: data.engagementScore || 0,
          discoverabilityScore: data.discoverabilityScore || 0,
          professionalReadinessScore: data.professionalReadinessScore || 0,
          brandPartnershipReadinessScore: data.brandPartnershipReadinessScore || 0,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/influencer-audits/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAudit(updated);
      }
    } catch {}
    setUpdating(false);
  };

  const handleSaveScores = async () => {
    setUpdating(true);
    try {
      const overallScore = Math.round(
        (scoreForm.profileOptimizationScore +
         scoreForm.brandIdentityScore +
         scoreForm.contentQualityScore +
         scoreForm.contentConsistencyScore +
         scoreForm.audienceAlignmentScore +
         scoreForm.engagementScore +
         scoreForm.discoverabilityScore +
         scoreForm.professionalReadinessScore +
         scoreForm.brandPartnershipReadinessScore) / 9
      );

      const res = await fetch(`/api/influencer-audits/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scoreForm, overallScore }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAudit(updated);
        setEditScores(false);
      }
    } catch {}
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">📊</div>
        <div className="font-heading font-bold text-gray-900">Audit Not Found</div>
        <Link href="/developer/audits" className="text-pink-600 text-sm mt-2 inline-block">← Back to Audits</Link>
      </div>
    );
  }

  const grade = scoreToGrade(audit.overallScore);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/developer/audits" className="text-gray-400 hover:text-gray-600 text-sm">← Audits</Link>

        {/* Header */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div>
            <h1 className="font-heading text-2xl font-black text-gray-900">{audit.influencer?.name}</h1>
            <p className="text-sm text-gray-500">{audit.influencer?.platform} · Audited by {audit.auditor?.name || 'System'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{audit.status}</span>
            {audit.status === 'draft' && (
              <>
                <button onClick={() => handleStatusUpdate('approved')} disabled={updating}
                  className="btn-secondary border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
                  Approve
                </button>
                <button onClick={() => handleStatusUpdate('rejected')} disabled={updating}
                  className="btn-secondary border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        {/* Overall Score */}
        <div className="glass-card p-8 text-center mb-6">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Overall Score</div>
          <div className={`inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br ${GRADE_COLORS[grade] || 'from-gray-400 to-gray-600 text-white'} text-5xl font-black mb-3`}>
            {grade}
          </div>
          <div className="text-4xl font-heading font-black text-gray-900">{audit.overallScore}<span className="text-xl text-gray-400">/100</span></div>
          {audit.notes && <p className="text-sm text-gray-500 mt-3 max-w-xl mx-auto">{audit.notes}</p>}
        </div>

        {/* Score Breakdown */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-gray-900">Score Breakdown</h3>
          <button onClick={() => setEditScores(!editScores)} className="text-sm text-pink-600 hover:text-pink-700">
            {editScores ? 'Cancel' : 'Edit Scores'}
          </button>
        </div>

        {editScores ? (
          <div className="glass-card p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'profileOptimizationScore', label: 'Profile Optimization' },
                { key: 'brandIdentityScore', label: 'Brand Identity' },
                { key: 'contentQualityScore', label: 'Content Quality' },
                { key: 'contentConsistencyScore', label: 'Content Consistency' },
                { key: 'audienceAlignmentScore', label: 'Audience Alignment' },
                { key: 'engagementScore', label: 'Engagement' },
                { key: 'discoverabilityScore', label: 'Discoverability' },
                { key: 'professionalReadinessScore', label: 'Professional Readiness' },
                { key: 'brandPartnershipReadinessScore', label: 'Brand Partnership Readiness' },
              ].map(item => (
                <div key={item.key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{item.label}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={(scoreForm as any)[item.key]}
                    onChange={e => setScoreForm({ ...scoreForm, [item.key]: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={handleSaveScores} disabled={updating} className="btn-primary text-sm disabled:opacity-50">
                {updating ? 'Saving...' : 'Save Scores'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Profile Optimization', score: audit.profileOptimizationScore },
              { label: 'Brand Identity', score: audit.brandIdentityScore },
              { label: 'Content Quality', score: audit.contentQualityScore },
              { label: 'Content Consistency', score: audit.contentConsistencyScore },
              { label: 'Audience Alignment', score: audit.audienceAlignmentScore },
              { label: 'Engagement', score: audit.engagementScore },
              { label: 'Discoverability', score: audit.discoverabilityScore },
              { label: 'Professional Readiness', score: audit.professionalReadinessScore },
              { label: 'Brand Partnership Readiness', score: audit.brandPartnershipReadinessScore },
            ].map((item, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  <span className="text-2xl font-heading font-black text-gray-900">{item.score}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full" style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Module Scores */}
        {scores.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="font-heading font-bold text-gray-900">Detailed Module Scores</h3>
            {scores.map((score: any, i: number) => {
              let breakdown: Record<string, number> = {};
              let recs: string[] = [];
              try { breakdown = JSON.parse(score.evidence || '{}'); } catch {}
              try { recs = JSON.parse(score.recommendation || '[]'); } catch {}

              return (
                <div key={i} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-heading font-bold text-sm text-gray-900">{score.category}</h4>
                    <span className="text-xl font-heading font-black text-gray-900">{score.score}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full" style={{ width: `${score.score}%` }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">Breakdown</div>
                      <div className="space-y-0.5">
                        {Object.entries(breakdown).map(([key, val], j) => (
                          <div key={j} className="flex justify-between text-xs">
                            <span className="text-gray-600">{key}</span>
                            <span className="font-semibold text-gray-700">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      {recs.length > 0 && (
                        <div className="text-xs text-amber-600 space-y-0.5">
                          <div className="font-semibold text-amber-600 mb-1">Recommendations</div>
                          {recs.map((r: string, j: number) => <div key={j}>→ {r}</div>)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Methodology */}
        {audit.findings && (
          <div className="glass-card p-5">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Methodology</h3>
            <p className="text-xs text-gray-500">{audit.findings}</p>
          </div>
        )}
      </div>
    </div>
  );
}
