'use client';

import React, { useEffect, useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

interface Deliverable {
  id: string;
  name: string;
  type: string;
  status: string;
  dueDate: string | null;
  description: string;
  projectId: string | null;
  contractorId: string | null;
  clientId: string;
  sowId: string | null;
  approvedAt: string | null;
}

interface Contractor {
  id: string;
  name: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'approved': { label: '✅ Approved', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'in-progress': { label: '🔄 In Progress', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'pending-approval': { label: '🔔 Awaiting Admin Approval', color: 'text-miami-pink', bg: 'bg-pink-50 border-pink-200' },
  'changes-requested': { label: '📝 Changes Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  'pending': { label: '⏳ Not Started', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
};

const TYPE_ICONS: Record<string, string> = {
  'image': '🖼️',
  'video': '🎬',
  'document': '📄',
  'design': '🎨',
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'pending-approval', label: 'Pending Approval' },
  { key: 'changes-requested', label: 'Changes Requested' },
];

export default function ClientDeliverablesPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [contractors, setContractors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [delRes, conRes] = await Promise.all([
          fetch('/api/deliverables'),
          fetch('/api/contractors'),
        ]);

        if (delRes.ok) {
          const data = await delRes.json();
          setDeliverables(data.deliverables ?? data);
        }

        if (conRes.ok) {
          const data = await conRes.json();
          const list: Contractor[] = data.contractors ?? data;
          const map: Record<string, string> = {};
          list.forEach((c) => { map[c.id] = c.name; });
          setContractors(map);
        }
      } catch {
        // silently handle errors
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filtered = filter === 'all'
    ? deliverables
    : deliverables.filter((d) => d.status === filter);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">Deliverables</h1>
            <p className="text-muted text-sm mt-1">Review completed work from your agency</p>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  filter === opt.key
                    ? 'bg-dark text-white'
                    : 'bg-white border border-muted-lighter text-dark-800 hover:bg-muted-lighter/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="glass-card p-12 text-center">
              <p className="text-muted text-sm">Loading deliverables...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-muted text-sm">No deliverables found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => {
                const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG['pending'];
                const contractorName = item.contractorId ? contractors[item.contractorId] : null;

                return (
                  <div key={item.id} className="glass-card p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted-lighter flex items-center justify-center text-lg">
                          {TYPE_ICONS[item.type] ?? '📦'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-dark-800 text-sm">{item.name}</h4>
                          <p className="text-xs text-muted">
                            {item.description && <span>{item.description} · </span>}
                            {contractorName && <span>{contractorName} · </span>}
                            {item.dueDate ? `Due ${new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'No due date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.approvedAt && item.status === 'approved' && (
                          <span className="text-[0.65rem] text-muted">
                            Approved {new Date(item.approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
