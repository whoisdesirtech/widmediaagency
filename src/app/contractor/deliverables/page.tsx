'use client';

import React, { useEffect, useState } from 'react';
import ContractorSidebar from '@/components/ContractorSidebar';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  contractorId?: string;
  clientId?: string;
  contractorRole?: string;
  contractorRoles?: string[];
}

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

interface Client {
  id: string;
  name: string;
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
  const [clientMap, setClientMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (!u.contractorId) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`/api/deliverables?contractorId=${u.contractorId}`).then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ])
      .then(([deliverablesData, clientsData]) => {
        setDeliverables(Array.isArray(deliverablesData) ? deliverablesData : []);
        const map: Record<string, string> = {};
        if (Array.isArray(clientsData)) {
          clientsData.forEach((c: Client) => { map[c.id] = c.name; });
        }
        setClientMap(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        showToast(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`, 'success');
      } else {
        showToast('Failed to update status. Please try again.', 'error');
      }
    } catch {
      showToast('Failed to update status. Please try again.', 'error');
    }
    setUpdatingId(null);
  };

  const filtered = filter === 'all' ? deliverables : deliverables.filter(d => d.status === filter);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} contractorRoles={user?.contractorRoles} />
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
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">⏳</div>
                <div className="font-heading font-bold text-dark-800 mb-1">Loading Deliverables...</div>
                <div className="text-muted text-sm">Fetching your assignments.</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <div className="font-heading font-bold text-dark-800 mb-1">
                  {filter === 'all' ? 'No Deliverables' : `No ${STATUS_CONFIG[filter]?.label || filter} Deliverables`}
                </div>
                <div className="text-muted text-sm">
                  {filter === 'all'
                    ? 'No deliverables have been assigned to you yet.'
                    : `You have no deliverables with "${filter}" status.`}
                </div>
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
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span>{clientMap[item.clientId] || 'Unknown Client'}</span>
                          {item.sowId && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[0.6rem] font-semibold">
                              SOW
                            </span>
                          )}
                        </div>
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

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-semibold transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}
    </div>
  );
}
