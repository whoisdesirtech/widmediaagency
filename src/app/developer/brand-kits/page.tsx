'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  { value: 'in-review', label: 'In Review', color: 'bg-amber-100 text-amber-700' },
  { value: 'approved', label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'published', label: 'Published', color: 'bg-purple-100 text-purple-700' },
];

export default function DeveloperBrandKitsPage() {
  const [brandKits, setBrandKits] = useState<any[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    influencerId: '',
    name: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    
    Promise.all([
      fetch(`/api/brand-kits?${params.toString()}`).then(r => r.json()),
      fetch('/api/influencers').then(r => r.json()),
    ]).then(([b, i]) => {
      setBrandKits(Array.isArray(b) ? b : []);
      setInfluencers(Array.isArray(i) ? i : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/brand-kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const brandKit = await res.json();
        setBrandKits(prev => [brandKit, ...prev]);
        setShowCreate(false);
        setForm({ influencerId: '', name: '' });
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand kit?')) return;
    await fetch(`/api/brand-kits/${id}`, { method: 'DELETE' });
    setBrandKits(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-black text-gray-900">Brand Kits</h1>
            <p className="text-gray-500 text-sm mt-1">Create and manage Social Media Brand Kits for influencers</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">+ New Brand Kit</button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search brand kits..."
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

        {/* Brand Kits Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : brandKits.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">🎨</div>
            <div className="font-heading font-bold text-gray-900 mb-1">No Brand Kits Yet</div>
            <div className="text-gray-500 text-sm mb-4">Create your first brand kit to get started.</div>
            <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ New Brand Kit</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandKits.filter(bk => {
              if (filter.search && !bk.name?.toLowerCase().includes(filter.search.toLowerCase()) && !bk.influencer?.name?.toLowerCase().includes(filter.search.toLowerCase()) && !bk.niche?.toLowerCase().includes(filter.search.toLowerCase())) return false;
              return true;
            }).map((brandKit) => {
              const statusOpt = STATUS_OPTIONS.find(s => s.value === brandKit.status);
              const completedSections = brandKit.sections?.filter((s: any) => s.isCompleted).length || 0;
              const totalSections = brandKit.sections?.length || 0;
              return (
                <div key={brandKit.id} className="glass-card overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Color Preview */}
                  <div className="h-20 flex">
                    <div className="flex-1" style={{ backgroundColor: brandKit.primaryColor }}></div>
                    <div className="flex-1" style={{ backgroundColor: brandKit.secondaryColor }}></div>
                    <div className="flex-1" style={{ backgroundColor: brandKit.accentColor }}></div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-heading font-bold text-gray-900">{brandKit.name || 'Untitled Brand Kit'}</h3>
                        <p className="text-xs text-gray-500">
                          {brandKit.influencer?.name || 'Unknown'} · {brandKit.influencer?.platform}
                        </p>
                      </div>
                      <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusOpt?.color || 'bg-gray-100 text-gray-700'}`}>
                        {statusOpt?.label || brandKit.status}
                      </span>
                    </div>

                    {brandKit.tagline && (
                      <p className="text-xs text-gray-600 italic mb-3">&quot;{brandKit.tagline}&quot;</p>
                    )}

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[0.6rem] text-gray-500">Sections Completed</span>
                        <span className="text-[0.6rem] font-semibold text-gray-700">{completedSections}/{totalSections}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full"
                          style={{ width: `${totalSections > 0 ? (completedSections / totalSections) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Fonts Preview */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[0.6rem] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {brandKit.headingFont}
                      </span>
                      <span className="text-[0.6rem] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {brandKit.bodyFont}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(brandKit.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <Link href={`/developer/brand-kits/${brandKit.id}`} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(brandKit.id)} className="px-2 py-1.5 text-red-500 hover:text-red-700 text-xs">
                          ✕
                        </button>
                      </div>
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
                  <h3 className="font-heading font-bold text-gray-900 text-lg">New Brand Kit</h3>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Brand Kit Name</label>
                  <input
                    type="text" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    placeholder="e.g. Instagram Brand Identity"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                    {saving ? 'Creating...' : 'Create Brand Kit'}
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
