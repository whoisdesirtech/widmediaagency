'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface Prospect {
  id: string;
  name: string;
  websiteUrl: string | null;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  linkedinUrl: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  primaryContactPhone: string | null;
  industry: string | null;
  category: string | null;
  source: string | null;
  status: string;
  ownerId: string | null;
  owner: { id: string; name: string; email: string } | null;
  agency: { id: string; name: string } | null;
  intelligence: {
    id: string;
    researchNotes: string;
    socialProfileData: any;
    marketFitScore: number | null;
    budgetIndicators: any;
    decisionMakers: any;
    riskFlags: any;
    competitiveLandscape: any;
    lastResearchedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-blue-500/10 border border-blue-500/20', text: 'text-blue-400', label: 'New' },
  researching: { bg: 'bg-amber-500/10 border border-amber-500/20', text: 'text-amber-400', label: 'Researching' },
  qualified: { bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400', label: 'Qualified' },
  proposal: { bg: 'bg-violet-500/10 border border-violet-500/20', text: 'text-violet-400', label: 'Proposal' },
  accepted: { bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400', label: 'Accepted' },
  lost: { bg: 'bg-red-500/10 border border-red-500/20', text: 'text-red-400', label: 'Lost' },
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'researching', label: 'Researching' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'lost', label: 'Lost' },
];

export default function ProspectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'intelligence'>('overview');

  const [editStatus, setEditStatus] = useState(prospect?.status || 'new');
  const [editNotes, setEditNotes] = useState('');
  const [intelligenceData, setIntelligenceData] = useState({
    researchNotes: '',
    socialProfileData: {},
    marketFitScore: null,
    budgetIndicators: {},
    decisionMakers: {},
    riskFlags: {},
    competitiveLandscape: {},
  });
  const [savingIntel, setSavingIntel] = useState(false);

  const loadProspect = useCallback(async () => {
    try {
      const res = await fetch(`/api/sales/prospects/${id}`);
      if (!res.ok) {
        if (res.status === 404) router.push('/admin/sales/prospects');
        throw new Error('Failed to fetch');
      }
      const data = await res.json();
      setProspect(data);
      if (data.intelligence) {
        setEditNotes(data.intelligence.researchNotes || '');
        setIntelligenceData({
          researchNotes: data.intelligence.researchNotes || '',
          socialProfileData: data.intelligence.socialProfileData || {},
          marketFitScore: data.intelligence.marketFitScore,
          budgetIndicators: data.intelligence.budgetIndicators || {},
          decisionMakers: data.intelligence.decisionMakers || {},
          riskFlags: data.intelligence.riskFlags || {},
          competitiveLandscape: data.intelligence.competitiveLandscape || {},
        });
      }
    } catch {
      console.error('Failed to load prospect');
      router.push('/admin/sales/prospects');
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const user = JSON.parse(stored);
    if (user.role !== 'admin' && user.role !== 'staff') { router.push('/login'); return; }
    loadProspect();
  }, [router, loadProspect]);

  const handleStatusChange = async (newStatus: string) => {
    setEditStatus(newStatus);
    try {
      await fetch(`/api/sales/prospects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setProspect(prev => prev ? { ...prev, status: newStatus } : null);
    } catch {
      console.error('Failed to update status');
    }
  };

  const handleIntelligenceSave = async () => {
    setSavingIntel(true);
    try {
      const payload = {
        researchNotes: editNotes,
        socialProfileData: intelligenceData.socialProfileData,
        marketFitScore: intelligenceData.marketFitScore,
        budgetIndicators: intelligenceData.budgetIndicators,
        decisionMakers: intelligenceData.decisionMakers,
        riskFlags: intelligenceData.riskFlags,
        competitiveLandscape: intelligenceData.competitiveLandscape,
      };

      const res = await fetch(`/api/sales/prospects/${id}/intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');

      setProspect(prev => prev ? {
        ...prev,
        intelligence: { ...prev.intelligence!, ...payload, updatedAt: new Date().toISOString() }
      } : null);
    } catch (err) {
      console.error('Failed to save intelligence:', err);
    }
    setSavingIntel(false);
  };

  const handleIntelChange = (field: string, value: any) => {
    setIntelligenceData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-dark">
        <Sidebar />
        <main className="ml-64 flex-1">
          <div className="max-w-4xl mx-auto px-8 py-8 text-center text-white/40 py-20">
            Loading prospect...
          </div>
        </main>
      </div>
    );
  }

  if (!prospect) return null;

  const statusConfig = STATUS_CONFIG[prospect.status] || { bg: 'bg-white/10', text: 'text-white/60', label: prospect.status };

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <main className="ml-64 flex-1">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-white/50 hover:text-white text-sm"
              >
                ← Back
              </button>
              <div>
                <h1 className="font-heading text-2xl font-bold text-white">{prospect.name}</h1>
                <p className="text-white/50 text-sm">{prospect.websiteUrl || 'No website'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/admin/sales/prospects/${id}/gtm`)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                GTM Workspace
              </button>
              <select
                value={editStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-white focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink ${STATUS_CONFIG[editStatus]?.bg || ''}`}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            {(['overview', 'intelligence'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-miami-pink text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                {tab === 'overview' ? 'Overview' : 'Intelligence'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4">Prospect Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Name</label>
                    <p className="text-white font-medium">{prospect.name}</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Status</label>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[prospect.status]?.bg || 'bg-white/10'} ${STATUS_CONFIG[prospect.status]?.text || 'text-white/60'}`}>
                      {prospect.status.charAt(0).toUpperCase() + prospect.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Website</label>
                    <p className="text-white/70">{prospect.websiteUrl || <span className="text-white/30">—</span>}</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Source</label>
                    <p className="text-white/70">{prospect.source || <span className="text-white/30">—</span>}</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Industry</label>
                    <p className="text-white/70">{prospect.industry || <span className="text-white/30">—</span>}</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Category</label>
                    <p className="text-white/70">{prospect.category || <span className="text-white/30">—</span>}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4">Primary Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Name</label>
                    <p className="text-white/70">{prospect.primaryContactName || <span className="text-white/30">—</span>}</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Email</label>
                    <p className="text-white/70">{prospect.primaryContactEmail || <span className="text-white/30">—</span>}</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Phone</label>
                    <p className="text-white/70">{prospect.primaryContactPhone || <span className="text-white/30">—</span>}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4">Social Profiles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Instagram</label>
                    <p className="text-white/70">{prospect.instagramHandle ? `@${prospect.instagramHandle}` : <span className="text-white/30">—</span>}</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">TikTok</label>
                    <p className="text-white/70">{prospect.tiktokHandle ? `@${prospect.tiktokHandle}` : <span className="text-white/30">—</span>}</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">LinkedIn</label>
                    <p className="text-white/70">{prospect.linkedinUrl || <span className="text-white/30">—</span>}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4">Assignment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Owner</label>
                    <p className="text-white/70">{prospect.owner?.name || <span className="text-white/30">Unassigned</span>}</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Agency</label>
                    <p className="text-white/70">{prospect.agency?.name || <span className="text-white/30">—</span>}</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Created</label>
                    <p className="text-white/70">{new Date(prospect.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wide mb-1">Last Updated</label>
                    <p className="text-white/70">{new Date(prospect.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">Intelligence & Research</h2>
                  <button
                    onClick={handleIntelligenceSave}
                    disabled={savingIntel}
                    className="px-4 py-2 text-sm font-medium text-white bg-miami-pink hover:bg-miami-pink/90 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {savingIntel ? 'Saving...' : 'Save Intelligence'}
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Research Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={8}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                      placeholder="Record research findings, observations, meeting notes, and key insights..."
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Market Fit Score</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={intelligenceData.marketFitScore || 0}
                        onChange={(e) => handleIntelChange('marketFitScore', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none accent-miami-pink"
                      />
                      <span className="text-white font-mono text-lg w-12">
                        {intelligenceData.marketFitScore !== null ? `${intelligenceData.marketFitScore}%` : 'Not set'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Social Profile Data (JSON)</label>
                      <textarea
                        value={JSON.stringify(intelligenceData.socialProfileData, null, 2)}
                        onChange={(e) => {
                          try { handleIntelChange('socialProfileData', JSON.parse(e.target.value)); } catch {}
                        }}
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink font-mono text-sm"
                        placeholder='{"followers": 10000, "engagement": 3.5, "themes": ["events", "lifestyle"]}'
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Budget Indicators (JSON)</label>
                      <textarea
                        value={JSON.stringify(intelligenceData.budgetIndicators, null, 2)}
                        onChange={(e) => {
                          try { handleIntelChange('budgetIndicators', JSON.parse(e.target.value)); } catch {}
                        }}
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink font-mono text-sm"
                        placeholder='{"eventHistory": ["event1", "event2"], "sponsorships": ["brand1"]}'
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Decision Makers (JSON)</label>
                      <textarea
                        value={JSON.stringify(intelligenceData.decisionMakers, null, 2)}
                        onChange={(e) => {
                          try { handleIntelChange('decisionMakers', JSON.parse(e.target.value)); } catch {}
                        }}
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink font-mono text-sm"
                        placeholder='[{"name": "John Doe", "title": "CMO", "email": "john@company.com"}]'
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Risk Flags (JSON)</label>
                      <textarea
                        value={JSON.stringify(intelligenceData.riskFlags, null, 2)}
                        onChange={(e) => {
                          try { handleIntelChange('riskFlags', JSON.parse(e.target.value)); } catch {}
                        }}
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink font-mono text-sm"
                        placeholder='["budget uncertainty", "competitor relationship"]'
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Competitive Landscape (JSON)</label>
                      <textarea
                        value={JSON.stringify(intelligenceData.competitiveLandscape, null, 2)}
                        onChange={(e) => {
                          try { handleIntelChange('competitiveLandscape', JSON.parse(e.target.value)); } catch {}
                        }}
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink font-mono text-sm"
                        placeholder='[{"competitor": "Agency X", "strength": "price", "weakness": "portfolio"}]'
                      />
                    </div>
                  </div>
                </div>

                {prospect.intelligence?.lastResearchedAt && (
                  <p className="mt-4 text-white/40 text-xs">
                    Last researched: {new Date(prospect.intelligence.lastResearchedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}