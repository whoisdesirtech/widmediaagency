'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
];

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-gray-100 text-gray-700' },
  { value: 'in-audit', label: 'In Audit', color: 'bg-blue-100 text-blue-700' },
  { value: 'audit-completed', label: 'Audit Done', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'brand-kit-pending', label: 'Brand Kit Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'brand-kit-completed', label: 'Brand Kit Done', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-500' },
];

export default function DeveloperInfluencersPage() {
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ platform: '', status: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    creatorName: '',
    platform: 'instagram',
    username: '',
    profileUrl: '',
    niche: '',
    audienceDescription: '',
    followerCount: 0,
    engagementRate: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.platform) params.set('platform', filter.platform);
    if (filter.status) params.set('status', filter.status);
    
    fetch(`/api/influencers?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setInfluencers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const influencer = await res.json();
        setInfluencers(prev => [influencer, ...prev]);
        setShowCreate(false);
        setForm({ name: '', creatorName: '', platform: 'instagram', username: '', profileUrl: '', niche: '', audienceDescription: '', followerCount: 0, engagementRate: 0 });
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this influencer?')) return;
    await fetch(`/api/influencers/${id}`, { method: 'DELETE' });
    setInfluencers(prev => prev.filter(i => i.id !== id));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-black text-gray-900">Influencers</h1>
            <p className="text-gray-500 text-sm mt-1">Manage influencer profiles and track audit status</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">+ Add Influencer</button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={filter.platform}
            onChange={(e) => setFilter(f => ({ ...f, platform: e.target.value }))}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm"
          >
            <option value="">All Platforms</option>
            {PLATFORM_OPTIONS.map(p => (
              <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
            ))}
          </select>
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

        {/* Influencers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-12 bg-gray-200 rounded-full w-12 mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : influencers.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">👤</div>
            <div className="font-heading font-bold text-gray-900 mb-1">No Influencers Yet</div>
            <div className="text-gray-500 text-sm mb-4">Add your first influencer to get started.</div>
            <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ Add Influencer</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencers.map((influencer) => {
              const platformOpt = PLATFORM_OPTIONS.find(p => p.value === influencer.platform);
              const statusOpt = STATUS_OPTIONS.find(s => s.value === influencer.status);
              const latestAudit = influencer.audits?.[0];
              const latestBrandKit = influencer.brandKits?.[0];
              return (
                <div key={influencer.id} className="glass-card p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-cyan-400 flex items-center justify-center text-white font-heading font-bold">
                        {influencer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-gray-900">{influencer.name}</h3>
                        <p className="text-xs text-gray-500">{platformOpt?.icon} @{influencer.username || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusOpt?.color || 'bg-gray-100 text-gray-700'}`}>
                      {statusOpt?.label || influencer.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="font-heading font-bold text-sm text-gray-900">{formatNumber(influencer.followerCount)}</div>
                      <div className="text-[0.6rem] text-gray-500">Followers</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="font-heading font-bold text-sm text-gray-900">{influencer.engagementRate}%</div>
                      <div className="text-[0.6rem] text-gray-500">Engagement</div>
                    </div>
                  </div>

                  {influencer.niche && (
                    <div className="text-xs text-gray-500 mb-3">Niche: {influencer.niche}</div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {latestAudit && (
                        <span className="text-[0.6rem] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          Audit: {Math.round(latestAudit.overallScore)}%
                        </span>
                      )}
                      {latestBrandKit && (
                        <span className="text-[0.6rem] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Brand Kit: {latestBrandKit.completionPercent}%
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/developer/influencers/${influencer.id}`} className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900">
                        View
                      </Link>
                      <button onClick={() => handleDelete(influencer.id)} className="px-2 py-1 text-xs text-red-500 hover:text-red-700">
                        Delete
                      </button>
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
                  <h3 className="font-heading font-bold text-gray-900 text-lg">Add Influencer</h3>
                  <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name *</label>
                    <input
                      type="text" value={form.name} required
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                      placeholder="Influencer name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Creator Name</label>
                    <input
                      type="text" value={form.creatorName}
                      onChange={e => setForm(f => ({ ...f, creatorName: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                      placeholder="Brand/creator name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Platform</label>
                    <select
                      value={form.platform}
                      onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    >
                      {PLATFORM_OPTIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Username</label>
                    <input
                      type="text" value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                      placeholder="@username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Profile URL</label>
                  <input
                    type="url" value={form.profileUrl}
                    onChange={e => setForm(f => ({ ...f, profileUrl: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Niche</label>
                  <input
                    type="text" value={form.niche}
                    onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    placeholder="e.g. Fashion, Tech, Lifestyle"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Followers</label>
                    <input
                      type="number" value={form.followerCount || ''}
                      onChange={e => setForm(f => ({ ...f, followerCount: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Engagement Rate %</label>
                    <input
                      type="number" step="0.1" value={form.engagementRate || ''}
                      onChange={e => setForm(f => ({ ...f, engagementRate: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                      placeholder="0.0"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                    {saving ? 'Adding...' : 'Add Influencer'}
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
