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
  clientId: string;
  sowId: string | null;
}

interface SOW {
  id: string;
  title: string;
  rateType: string;
  rate: number;
  status: string;
  startDate: string;
  endDate: string | null;
  deliverables: string;
  contractorId: string;
  clientId: string;
}

const SOW_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  'draft': { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
  'approved': { label: 'Approved', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'active': { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'completed': { label: 'Completed', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'cancelled': { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

const DEL_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  'approved': { label: 'Approved', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'pending': { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'in-progress': { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'pending-approval': { label: 'Awaiting Approval', color: 'text-miami-pink', bg: 'bg-pink-50 border-pink-200' },
  'changes-requested': { label: 'Changes Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
};

const TYPE_ICONS: Record<string, string> = { image: '🖼️', video: '🎬', document: '📄', design: '🎨' };

const RATE_LABELS: Record<string, string> = {
  'hourly': '/hr',
  'half-day': '/half-day',
  'full-day': '/day',
  'project': 'flat',
  'monthly-retainer': '/mo',
};

export default function ContractorSOWsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sows, setSows] = useState<SOW[]>([]);
  const [allDeliverables, setAllDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.contractorId) {
      Promise.all([
        fetch('/api/sows').then(r => r.json()),
        fetch(`/api/deliverables?contractorId=${u.contractorId}`).then(r => r.json()),
      ]).then(([sowsData, delsData]) => {
        setSows(Array.isArray(sowsData) ? sowsData : []);
        setAllDeliverables(Array.isArray(delsData) ? delsData : []);
        setLoading(false);
      }).catch(() => setLoading(false));
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
        setAllDeliverables(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
      }
    } catch {}
    setUpdatingId(null);
  };

  const parseSOWDeliverables = (json: string): { text: string; status?: string }[] => {
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getLinkedDeliverables = (sowId: string): Deliverable[] => {
    return allDeliverables.filter(d => d.sowId === sowId);
  };

  const formatRate = (rate: number, rateType: string): string => {
    const label = RATE_LABELS[rateType] || rateType;
    return `$${rate.toLocaleString()}${label}`;
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} contractorRoles={user?.contractorRoles} />
      <main className="flex-1 ml-64 p-8"><div className="text-muted">Loading statements of work...</div></main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} contractorRoles={user?.contractorRoles} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">My Statements of Work</h1>
            <p className="text-muted text-sm mt-1">View your assigned SOWs and update deliverable progress</p>
          </div>

          <div className="space-y-6">
            {sows.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">📄</div>
                <div className="font-heading font-bold text-dark-800 mb-1">No Statements of Work</div>
                <div className="text-muted text-sm">No Statements of Work have been assigned to you yet.</div>
              </div>
            ) : sows.map((sow) => {
              const sowStatus = SOW_STATUS[sow.status] || SOW_STATUS['draft'];
              const linkedDeliverables = getLinkedDeliverables(sow.id);
              const scopeItems = parseSOWDeliverables(sow.deliverables);

              return (
                <div key={sow.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-dark-800 text-lg">{sow.title}</h3>
                      <p className="text-sm text-muted mt-0.5">
                        {formatRate(sow.rate, sow.rateType)}
                      </p>
                    </div>
                    <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border ${sowStatus.bg} ${sowStatus.color}`}>
                      {sowStatus.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted mb-4">
                    <span>{new Date(sow.startDate).toLocaleDateString()} — {sow.endDate ? new Date(sow.endDate).toLocaleDateString() : 'Ongoing'}</span>
                  </div>

                  {scopeItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-dark-800 mb-2 uppercase tracking-wider">SOW Scope</h4>
                      <div className="space-y-1.5">
                        {scopeItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-dark-800/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-lighter flex-shrink-0" />
                            {item.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-muted-lighter/50 pt-4">
                    <h4 className="text-xs font-semibold text-dark-800 mb-3 uppercase tracking-wider">Deliverables</h4>
                    {linkedDeliverables.length === 0 ? (
                      <p className="text-xs text-muted italic">No deliverables have been created for this SOW yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {linkedDeliverables.map((del) => {
                          const delStatus = DEL_STATUS[del.status] || DEL_STATUS['pending'];
                          return (
                            <div key={del.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-muted-lighter/30">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted-lighter flex items-center justify-center text-sm">
                                  {TYPE_ICONS[del.type] || '📄'}
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-dark-800">{del.name}</div>
                                  {del.dueDate && <div className="text-[0.65rem] text-muted">Due {del.dueDate}</div>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full border ${delStatus.bg} ${delStatus.color}`}>
                                  {delStatus.label}
                                </span>
                                {del.status !== 'approved' && (
                                  <div className="flex gap-1">
                                    {del.status === 'pending' && (
                                      <button onClick={() => handleStatusChange(del.id, 'in-progress')} disabled={updatingId === del.id} className="px-2.5 py-1 bg-blue-500 text-white text-[0.6rem] font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                                        Start
                                      </button>
                                    )}
                                    {del.status === 'in-progress' && (
                                      <button onClick={() => handleStatusChange(del.id, 'pending-approval')} disabled={updatingId === del.id} className="px-2.5 py-1 bg-miami-pink text-white text-[0.6rem] font-semibold rounded-lg hover:bg-miami-pink/80 transition-colors disabled:opacity-50">
                                        Submit
                                      </button>
                                    )}
                                    {del.status === 'changes-requested' && (
                                      <button onClick={() => handleStatusChange(del.id, 'in-progress')} disabled={updatingId === del.id} className="px-2.5 py-1 bg-blue-500 text-white text-[0.6rem] font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                                        Revise
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
