'use client';

import React, { useEffect, useState } from 'react';
import ContractorSidebar from '@/components/ContractorSidebar';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  contractorId?: string;
}

interface Deliverable {
  id: string;
  name: string;
  type: string;
  status: string;
  dueDate: string | null;
  description: string;
  projectId: string | null;
  clientId: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'approved': { label: '✅ Approved', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'pending': { label: '⏳ Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'in-progress': { label: '🔄 In Progress', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'pending-approval': { label: '🔔 Awaiting Approval', color: 'text-miami-pink', bg: 'bg-pink-50 border-pink-200' },
  'changes-requested': { label: '📝 Changes Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
};

const TYPE_ICONS: Record<string, string> = { 'image': '🖼️', 'video': '🎬', 'document': '📄', 'design': '🎨' };

export default function ContractorDeliverablesPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.contractorId) {
      fetch(`/api/deliverables?contractorId=${u.contractorId}`)
        .then(r => r.json())
        .then(data => { setDeliverables(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/deliverables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setDeliverables(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
      }
    } catch {}
    setUpdatingId(null);
  };

  const filtered = filter === 'all' ? deliverables : deliverables.filter(d => d.status === filter);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">My Deliverables</h1>
            <p className="text-muted text-sm mt-1">Track and update your assigned deliverables</p>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'pending', 'in-progress', 'pending-approval', 'approved'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filter === f ? 'bg-dark text-white' : 'bg-white border border-muted-lighter text-dark-800 hover:bg-muted-lighter/30'}`}>
                {f === 'all' ? 'All' : f === 'pending-approval' ? 'Awaiting Approval' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-muted">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <div className="font-heading font-bold text-dark-800 mb-1">No Deliverables</div>
                <div className="text-muted text-sm">No deliverables have been assigned to you yet.</div>
              </div>
            ) : filtered.map((item) => {
              const status = STATUS_CONFIG[item.status] || STATUS_CONFIG['pending'];
              return (
                <div key={item.id} className="glass-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted-lighter flex items-center justify-center text-lg">
                        {TYPE_ICONS[item.type]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-800 text-sm">{item.name}</h4>
                        <p className="text-xs text-muted">{item.description || 'No description'} {item.dueDate ? `· Due ${item.dueDate}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      {item.status !== 'approved' && (
                        <div className="flex gap-1.5">
                          {item.status === 'pending' && (
                            <button onClick={() => handleStatusChange(item.id, 'in-progress')} disabled={updatingId === item.id} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                              Start
                            </button>
                          )}
                          {item.status === 'in-progress' && (
                            <button onClick={() => handleStatusChange(item.id, 'pending-approval')} disabled={updatingId === item.id} className="px-3 py-1.5 bg-miami-pink text-white text-xs font-semibold rounded-lg hover:bg-miami-pink/80 transition-colors disabled:opacity-50">
                              Submit
                            </button>
                          )}
                          {item.status === 'changes-requested' && (
                            <button onClick={() => handleStatusChange(item.id, 'in-progress')} disabled={updatingId === item.id} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                              Revise
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
