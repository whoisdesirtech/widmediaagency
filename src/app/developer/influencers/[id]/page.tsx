'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const PLATFORM_COLORS: Record<string, string> = {
  'instagram': 'bg-pink-100 text-pink-700',
  'tiktok': 'bg-gray-900 text-white',
  'youtube': 'bg-red-100 text-red-700',
  'twitter': 'bg-blue-100 text-blue-700',
  'linkedin': 'bg-blue-100 text-blue-700',
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { value: 'in-audit', label: 'In Audit', color: 'bg-amber-100 text-amber-700' },
  { value: 'audited', label: 'Audited', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-500' },
];

export default function InfluencerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [influencer, setInfluencer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/influencers/${params.id}`)
      .then(r => r.json())
      .then(data => { setInfluencer(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Delete this influencer?')) return;
    const res = await fetch(`/api/influencers/${params.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/developer/influencers');
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

  if (!influencer || influencer.error) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">👤</div>
        <div className="font-heading font-bold text-gray-900">Influencer Not Found</div>
        <Link href="/developer/influencers" className="text-pink-600 text-sm mt-2 inline-block">← Back to Influencers</Link>
      </div>
    );
  }

  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let recommendations: string[] = [];
  let categories: string[] = [];
  try { strengths = JSON.parse(influencer.strengths || '[]'); } catch {}
  try { weaknesses = JSON.parse(influencer.weaknesses || '[]'); } catch {}
  try { recommendations = JSON.parse(influencer.recommendations || '[]'); } catch {}
  try { categories = JSON.parse(influencer.contentCategories || '[]'); } catch {}

  const statusOpt = STATUS_OPTIONS.find(s => s.value === influencer.status);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/developer/influencers" className="text-gray-400 hover:text-gray-600 text-sm">← Influencers</Link>

        {/* Header */}
        <div className="flex items-start justify-between mt-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-cyan-400 flex items-center justify-center text-white font-heading font-bold text-xl">
              {influencer.name?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="font-heading text-2xl font-black text-gray-900">{influencer.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[influencer.platform] || 'bg-gray-100 text-gray-700'}`}>
                  {influencer.platform}
                </span>
                {influencer.username && <span className="text-sm text-gray-500">@{influencer.username}</span>}
                {statusOpt && <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusOpt.color}`}>{statusOpt.label}</span>}
              </div>
            </div>
          </div>
          <button onClick={handleDelete} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="text-xs text-gray-500">Followers</div>
            <div className="text-lg font-heading font-black text-gray-900">{influencer.followerCount?.toLocaleString() || 'Unknown'}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-gray-500">Engagement Rate</div>
            <div className="text-lg font-heading font-black text-gray-900">{influencer.engagementRate || 'Unknown'}%</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-gray-500">Overall Score</div>
            <div className="text-lg font-heading font-black text-gray-900">{influencer.overallScore || 'N/A'}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-gray-500">Posting Frequency</div>
            <div className="text-lg font-heading font-black text-gray-900 text-sm">{influencer.postingFrequency || 'Unknown'}</div>
          </div>
        </div>

        {/* Niche & Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {influencer.niche && (
            <div className="glass-card p-5">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Niche</h3>
              <p className="text-sm text-gray-600">{influencer.niche}</p>
            </div>
          )}
          {influencer.audienceDescription && (
            <div className="glass-card p-5">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Audience Description</h3>
              <p className="text-sm text-gray-600">{influencer.audienceDescription}</p>
            </div>
          )}
        </div>

        {/* Content Categories */}
        {categories.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Content Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((c: string, i: number) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Audit Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Visual Identity', value: influencer.visualIdentity },
            { label: 'Bio Quality', value: influencer.bioQuality },
            { label: 'Profile Optimization', value: influencer.profileOptimization },
            { label: 'Content Consistency', value: influencer.contentConsistency },
            { label: 'Brand Consistency', value: influencer.brandConsistency },
            { label: 'Audience Alignment', value: influencer.audienceAlignment },
            { label: 'Growth Opportunities', value: influencer.growthOpportunities },
          ].filter(f => f.value).map((field, i) => (
            <div key={i} className="glass-card p-4">
              <div className="text-xs text-gray-500 mb-1">{field.label}</div>
              <p className="text-sm text-gray-700">{field.value}</p>
            </div>
          ))}
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Strengths</h3>
            <div className="space-y-1">
              {strengths.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-emerald-500 mt-0.5">✓</span> {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Weaknesses</h3>
            <div className="space-y-1">
              {weaknesses.map((w: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-400 mt-0.5">✕</span> {w}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Recommendations</h3>
            <div className="space-y-1">
              {recommendations.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-pink-500 mt-0.5">→</span> {r}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Audits */}
        {influencer.audits && influencer.audits.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Audits ({influencer.audits.length})</h3>
            <div className="space-y-2">
              {influencer.audits.map((audit: any) => (
                <Link key={audit.id} href={`/developer/audits/${audit.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{new Date(audit.auditDate || audit.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-500 ml-2">{audit.status}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{audit.overallScore}/100</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Brand Kits */}
        {influencer.brandKits && influencer.brandKits.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Brand Kits ({influencer.brandKits.length})</h3>
            <div className="space-y-2">
              {influencer.brandKits.map((bk: any) => (
                <Link key={bk.id} href={`/developer/brand-kits/${bk.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: bk.primaryColor }}></div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: bk.accentColor }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{bk.name || 'Untitled'}</span>
                  </div>
                  <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${
                    bk.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    bk.status === 'in-review' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{bk.status}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
          Created {new Date(influencer.createdAt).toLocaleDateString()}
          {influencer.isDemo && <span className="ml-2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">DEMO</span>}
        </div>
      </div>
    </div>
  );
}
