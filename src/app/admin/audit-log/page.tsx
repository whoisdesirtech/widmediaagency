'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface LogRow {
  id: string;
  userId: string | null;
  userEmail: string | null;
  role: string | null;
  action: string;
  method: string | null;
  path: string | null;
  entity: string | null;
  entityId: string | null;
  ip: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export default function AdminAuditLogPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/audit?limit=300');
      if (!res.ok) throw new Error('Failed to load audit log');
      setLogs(await res.json());
    } catch (e: any) {
      setError(e?.message || 'Failed to load audit log');
    }
    setLoading(false);
  };

  useEffect(() => {
    const stored: any = (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || 'null');
      } catch {
        return null;
      }
    })();
    if (!stored || stored.role !== 'admin') {
      router.replace('/login');
      return;
    }
    load();
  }, [router]);

  const actions = useMemo(() => Array.from(new Set(logs.map((l) => l.action))).sort(), [logs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => {
      if (actionFilter && l.action !== actionFilter) return false;
      if (!q) return true;
      return [l.userEmail, l.action, l.entity, l.entityId, l.path, l.ip]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q));
    });
  }, [logs, query, actionFilter]);

  const formatMeta = (m: Record<string, unknown> | null) => {
    if (!m || Object.keys(m).length === 0) return '—';
    return JSON.stringify(m);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Audit Log</h1>
              <p className="text-muted text-sm mt-1">Who did what, when — admin only.</p>
            </div>
            <button onClick={load} disabled={loading} className="btn-secondary text-sm disabled:opacity-50">
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search user, action, entity, IP..."
              className="px-3 py-2 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-xs flex-1 min-w-[220px]"
            />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-xs"
            >
              <option value="">All actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-muted text-sm">Loading audit log...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-muted text-sm">No audit entries found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted border-b border-muted-lighter">
                      <th className="p-3 font-semibold">Time</th>
                      <th className="p-3 font-semibold">User</th>
                      <th className="p-3 font-semibold">Role</th>
                      <th className="p-3 font-semibold">Action</th>
                      <th className="p-3 font-semibold">Entity</th>
                      <th className="p-3 font-semibold">Metadata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l) => (
                      <tr key={l.id} className="border-b border-muted-lighter/40 align-top hover:bg-white/50">
                        <td className="p-3 whitespace-nowrap text-muted">
                          {new Date(l.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-dark-800">{l.userEmail || '—'}</div>
                          <div className="text-[0.6rem] text-muted font-mono">{l.path || ''}</div>
                        </td>
                        <td className="p-3">{l.role || '—'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-miami-pink/10 text-miami-pink font-semibold">
                            {l.action}
                          </span>
                        </td>
                        <td className="p-3">
                          {l.entity ? (
                            <div>
                              <div className="font-semibold text-dark-800">{l.entity}</div>
                              <div className="font-mono text-[0.6rem] text-muted">{l.entityId}</div>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="p-3 font-mono text-[0.65rem] text-muted break-all">
                          {formatMeta(l.metadata)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
