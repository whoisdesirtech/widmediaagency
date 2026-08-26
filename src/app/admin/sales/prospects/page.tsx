'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  intelligence: { marketFitScore: number | null } | null;
  createdAt: string;
  updatedAt: string;
}

interface ProspectStats {
  total: number;
  new: number;
  researching: number;
  qualified: number;
  proposal: number;
  accepted: number;
  lost: number;
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

export default function ProspectsPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const loadProspects = useCallback(async () => {
    try {
      const res = await fetch(`/api/sales/prospects?page=${page}&limit=20${filter !== 'all' ? `&status=${filter}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProspects(data.prospects);
      setTotalPages(Math.ceil(data.total / 20));
    } catch {
      console.error('Failed to load prospects data');
    }
    setLoading(false);
  }, [page, filter]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/sales/prospects?limit=1');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      // We'll compute stats from the first page fetch, or fetch separately
    } catch {
      console.error('Failed to load stats');
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const user = JSON.parse(stored);
    if (user.role !== 'admin' && user.role !== 'staff') { router.push('/login'); return; }
    loadProspects();
    loadStats();
  }, [router, loadProspects, loadStats]);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <main className="ml-64 flex-1">
        <div className="max-w-[1200px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">Prospect Intelligence</h1>
              <p className="text-white/50 text-sm mt-1">Manage prospects, track research, and qualify leads</p>
            </div>
            <button
              onClick={() => router.push('/admin/sales/prospects/new')}
              className="bg-miami-pink hover:bg-miami-pink/90 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              + New Prospect
            </button>
          </div>

          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {(['all', 'new', 'researching', 'qualified', 'proposal', 'accepted', 'lost'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-miami-pink text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-white/40">Loading prospects...</div>
          ) : prospects.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              {filter === 'all' ? 'No prospects found. Create your first prospect to get started.' : `No prospects with status "${filter}".`}
              <br />
              <button
                onClick={() => router.push('/admin/sales/prospects/new')}
                className="mt-4 text-miami-pink hover:underline text-sm"
              >
                Create a prospect
              </button>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Prospect</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Contact</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Industry</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Source</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Score</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Updated</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospects.map(p => {
                      const statusConfig = STATUS_CONFIG[p.status] || { bg: 'bg-white/10', text: 'text-white/60', label: p.status };
                      return (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => router.push(`/admin/sales/prospects/${p.id}`)}>
                          <td className="px-5 py-4">
                            <div className="text-white font-medium">{p.name}</div>
                            {p.websiteUrl && (
                              <div className="text-white/40 text-xs truncate max-w-xs">{p.websiteUrl}</div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {p.primaryContactName && <div className="text-white text-xs">{p.primaryContactName}</div>}
                            {p.primaryContactEmail && <div className="text-white/40 text-xs">{p.primaryContactEmail}</div>}
                            {p.instagramHandle && <div className="text-white/40 text-xs">IG: @{p.instagramHandle}</div>}
                          </td>
                          <td className="px-5 py-4 text-white/60 text-xs">
                            {p.industry || p.category || '—'}
                          </td>
                          <td className="px-5 py-4 text-white/60 text-xs">
                            {p.source || '—'}
                          </td>
                          <td className="px-5 py-4">
                            {p.intelligence?.marketFitScore !== null && p.intelligence?.marketFitScore !== undefined ? (
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-miami-pink transition-all" style={{ width: `${p.intelligence.marketFitScore}%` }} />
                                </div>
                                <span className="text-white/70 text-xs">{Math.round(p.intelligence.marketFitScore)}%</span>
                              </div>
                            ) : (
                              <span className="text-white/30 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/10 text-white/70`}>
                              {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-white/40 text-xs">
                            {new Date(p.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push(`/admin/sales/prospects/${p.id}`); }}
                              className="text-white/50 hover:text-miami-pink text-sm"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
                  <span className="text-white/50 text-sm">Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}