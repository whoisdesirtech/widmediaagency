'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { DELIVERABLE_STATUS_CONFIG, TERMINAL_STATES } from '@/lib/deliverable-lifecycle';

const TERMINAL: string[] = [...(TERMINAL_STATES as string[])];

const TYPE_ICONS: Record<string, string> = {
  image: '🖼️',
  video: '🎬',
  document: '📄',
  design: '🎨',
};

export default function AdminDeliverablesPage() {
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [sows, setSows] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterContractor, setFilterContractor] = useState('all');
  const [filterClient, setFilterClient] = useState('all');

  const [assignModal, setAssignModal] = useState<{ id: string; name: string; contractorId: string } | null>(null);
  const [cancelModal, setCancelModal] = useState<{ id: string; name: string } | null>(null);
  const [finalModal, setFinalModal] = useState<{ id: string; name: string } | null>(null);
  const [modalFeedback, setModalFeedback] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    clientId: '',
    contractorId: '',
    sowId: '',
    name: '',
    type: 'document',
    dueDate: '',
    description: '',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setMe(JSON.parse(stored)); } catch { /* ignore */ }
    }
    Promise.all([
      fetch('/api/deliverables').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/contractors').then(r => r.json()),
      fetch('/api/sows').then(r => r.json()),
    ]).then(([d, c, co, s]) => {
      setDeliverables(Array.isArray(d) ? d : []);
      setClients(Array.isArray(c) ? c : []);
      setContractors(Array.isArray(co) ? co : []);
      setSows(Array.isArray(s) ? s : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (form.contractorId) {
      fetch(`/api/sows`)
        .then(r => r.json())
        .then(s => setSows(Array.isArray(s) ? s : []));
    }
  }, [form.contractorId]);

  const filteredSows = useMemo(() => {
    if (!form.contractorId) return [];
    return sows.filter((s: any) => s.contractorId === form.contractorId);
  }, [sows, form.contractorId]);

  const filteredDeliverables = useMemo(() => {
    return deliverables.filter((d: any) => {
      if (filterStatus !== 'all' && d.status !== filterStatus) return false;
      if (filterContractor !== 'all' && d.contractorId !== filterContractor) return false;
      if (filterClient !== 'all' && d.clientId !== filterClient) return false;
      return true;
    });
  }, [deliverables, filterStatus, filterContractor, filterClient]);

  const getClientName = (clientId: string) => clients.find((c: any) => c.id === clientId)?.name || 'Unknown Client';
  const getContractorName = (contractorId: string) => {
    if (!contractorId) return 'Unassigned';
    return contractors.find((c: any) => c.id === contractorId)?.name || contractors.find((c: any) => c.id === contractorId)?.email || 'Unknown';
  };
  const isAdmin = me?.role === 'admin';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: form.clientId,
          contractorId: form.contractorId || undefined,
          sowId: form.sowId || undefined,
          name: form.name,
          type: form.type,
          dueDate: form.dueDate || undefined,
          description: form.description,
        }),
      });
      if (res.ok) {
        const deliverable = await res.json();
        setDeliverables(prev => [...prev, deliverable]);
        setShowCreate(false);
        setForm({ clientId: '', contractorId: '', sowId: '', name: '', type: 'document', dueDate: '', description: '' });
        showToast(form.contractorId ? 'Deliverable created and assigned' : 'Deliverable created', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create deliverable', 'error');
      }
    } catch {
      showToast('Failed to create deliverable', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deliverable?')) return;
    const res = await fetch(`/api/deliverables/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDeliverables(prev => prev.filter(d => d.id !== id));
      showToast('Deliverable deleted', 'success');
    }
  };

  const doAssign = async () => {
    if (!assignModal) return;
    setSaving(true);
    const res = await fetch(`/api/deliverables/${assignModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'assigned', contractorId: assignModal.contractorId }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDeliverables(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast('Contractor assigned', 'success');
    } else {
      const err = await res.json();
      showToast(err.error || 'Assignment failed', 'error');
    }
    setAssignModal(null);
    setSaving(false);
  };

  const doCancel = async () => {
    if (!cancelModal) return;
    setSaving(true);
    const res = await fetch(`/api/deliverables/${cancelModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled', reason: modalFeedback || undefined }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDeliverables(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast('Deliverable cancelled', 'success');
    } else {
      const err = await res.json();
      showToast(err.error || 'Cancel failed', 'error');
    }
    setCancelModal(null);
    setModalFeedback('');
    setSaving(false);
  };

  const doFinalApprove = async () => {
    if (!finalModal) return;
    setSaving(true);
    const res = await fetch(`/api/deliverables/${finalModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved', feedback: modalFeedback || undefined }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDeliverables(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast('Final approval recorded', 'success');
    } else {
      const err = await res.json();
      showToast(err.error || 'Final approval failed', 'error');
    }
    setFinalModal(null);
    setModalFeedback('');
    setSaving(false);
  };

  const doClose = async (id: string) => {
    setSaving(true);
    const res = await fetch(`/api/deliverables/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDeliverables(prev => prev.map(d => d.id === id ? updated : d));
      showToast('Deliverable closed', 'success');
    } else {
      const err = await res.json();
      showToast(err.error || 'Close failed', 'error');
    }
    setSaving(false);
  };

  const canAssign = (d: any) => ['draft', 'assigned', 'declined'].includes(d.status);
  const canCancel = (d: any) => !TERMINAL.includes(d.status) && d.status !== 'approved';

  const statusKeys = Object.keys(DELIVERABLE_STATUS_CONFIG);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Deliverables Management</h1>
              <p className="text-muted text-sm mt-1">Create, assign, review, and close deliverables across all contractors and clients</p>
            </div>
            <button onClick={() => setShowCreate(true)} className="btn-primary">+ New Deliverable</button>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm font-semibold">
              <option value="all">All Statuses</option>
              {statusKeys.map(k => <option key={k} value={k}>{DELIVERABLE_STATUS_CONFIG[k].label}</option>)}
            </select>
            <select value={filterContractor} onChange={e => setFilterContractor(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm font-semibold">
              <option value="all">All Contractors</option>
              {contractors.map((c: any) => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
            </select>
            <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm font-semibold">
              <option value="all">All Clients</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : filteredDeliverables.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <div className="font-heading font-bold text-dark-800 mb-1">
                {deliverables.length === 0 ? 'No Deliverables Yet' : 'No Matching Deliverables'}
              </div>
              <div className="text-muted text-sm mb-4">
                {deliverables.length === 0 ? 'Create your first deliverable to get started.' : 'Try adjusting your filters.'}
              </div>
              {deliverables.length === 0 && (
                <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ New Deliverable</button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDeliverables.map((d) => {
                const statusCfg = DELIVERABLE_STATUS_CONFIG[d.status] || DELIVERABLE_STATUS_CONFIG.draft;
                const typeIcon = TYPE_ICONS[d.type] || '📄';
                return (
                  <div key={d.id} className="glass-card p-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{typeIcon}</span>
                        <div>
                          <h3 className="font-heading font-bold text-dark-800">{d.name}</h3>
                          <p className="text-xs text-muted">
                            {getClientName(d.clientId)} · {getContractorName(d.contractorId)}
                            {d.dueDate && ` · Due ${d.dueDate}`}
                            {d.revisionCount > 0 && ` · ${d.revisionCount} revision${d.revisionCount > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[0.65rem] font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>

                        {canAssign(d) && (
                          <>
                            <button onClick={() => setAssignModal({ id: d.id, name: d.name, contractorId: d.contractorId || '' })} className="px-3 py-1.5 bg-indigo-500 text-white text-xs font-semibold rounded-lg hover:bg-indigo-600 transition-colors">
                              {d.status === 'assigned' || d.status === 'declined' ? 'Reassign' : 'Assign'}
                            </button>
                          </>
                        )}

                        {d.status === 'client-accepted' && isAdmin && (
                          <button onClick={() => setFinalModal({ id: d.id, name: d.name })} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                            ✓ Final Approval
                          </button>
                        )}
                        {d.status === 'approved' && isAdmin && (
                          <button onClick={() => doClose(d.id)} disabled={saving} className="px-3 py-1.5 bg-dark text-white text-xs font-semibold rounded-lg hover:bg-dark-700 transition-colors disabled:opacity-50">
                            🔒 Close
                          </button>
                        )}

                        {canCancel(d) && (
                          <button onClick={() => setCancelModal({ id: d.id, name: d.name })} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                            Cancel
                          </button>
                        )}

                        {!TERMINAL.includes(d.status) && (
                          <button onClick={() => handleDelete(d.id)} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                            Delete
                          </button>
                        )}

                        {d.status === 'approved' && d.finalApprovedAt && (
                          <span className="text-[0.65rem] text-purple-600 font-semibold">
                            ✓ Approved {new Date(d.finalApprovedAt).toLocaleDateString()}
                          </span>
                        )}
                        {d.status === 'closed' && d.closedAt && (
                          <span className="text-[0.65rem] text-dark-800 font-semibold">
                            Closed {new Date(d.closedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {d.description && <p className="text-xs text-muted mt-2 ml-9">{d.description}</p>}
                    {d.declineReason && (
                      <div className="mt-2 ml-9 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-[0.65rem] font-semibold text-red-700 mb-0.5">Decline Reason</p>
                        <p className="text-xs text-red-800">{d.declineReason}</p>
                      </div>
                    )}
                    {d.submittedUrl && (
                      <div className="mt-2 ml-9">
                        <a href={d.submittedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-miami-pink font-semibold hover:underline">
                          View Submitted Work ↗
                        </a>
                      </div>
                    )}
                    {d.attachments && (() => {
                      try {
                        const atts = typeof d.attachments === 'string' ? JSON.parse(d.attachments) : d.attachments;
                        if (Array.isArray(atts) && atts.length > 0) {
                          return (
                            <div className="mt-2 ml-9 flex flex-wrap gap-1.5">
                              {atts.map((att: any, i: number) => (
                                <a key={i} href={typeof att === 'string' ? att : att?.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-0.5 rounded bg-muted-lighter text-[0.6rem] font-semibold text-dark-800 hover:bg-muted transition-colors">
                                  📎 {typeof att === 'string' ? `Attachment ${i + 1}` : (att.name || `Attachment ${i + 1}`)}
                                </a>
                              ))}
                            </div>
                          );
                        }
                      } catch { return null; }
                      return null;
                    })()}
                    {d.feedback && (
                      <div className="mt-2 ml-9 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-[0.65rem] font-semibold text-amber-700 mb-0.5">Review Feedback</p>
                        <p className="text-xs text-amber-800">{d.feedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-muted-lighter">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-dark-800 text-lg">New Deliverable</h3>
                <button onClick={() => setShowCreate(false)} className="text-muted hover:text-dark-800 text-lg">✕</button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Client *</label>
                <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" required>
                  <option value="">Select a client</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Contractor (assign now?)</label>
                <select value={form.contractorId} onChange={e => setForm(f => ({ ...f, contractorId: e.target.value, sowId: '' }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                  <option value="">Leave unassigned (draft)</option>
                  {contractors.map((c: any) => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
                </select>
                <p className="text-[0.65rem] text-muted mt-1">With a contractor selected, the deliverable starts as Assigned and they are notified. Otherwise it starts as Draft and you assign later.</p>
              </div>
              {form.contractorId && (
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">SOW</label>
                  <select value={form.sowId} onChange={e => setForm(f => ({ ...f, sowId: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                    <option value="">No SOW</option>
                    {filteredSows.map((s: any) => <option key={s.id} value={s.id}>Rate: ${s.rate}/{s.rateType} ({s.startDate})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Name *</label>
                <input type="text" value={form.name} required onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g. Logo Design Draft" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                    <option value="document">📄 Document</option>
                    <option value="image">🖼️ Image</option>
                    <option value="video">🎬 Video</option>
                    <option value="design">🎨 Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Description</label>
                <textarea value={form.description} rows={3} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm resize-none" placeholder="Describe the deliverable..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Creating...' : 'Create Deliverable'}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="font-heading font-bold text-dark-800 text-lg mb-1">Assign Contractor</h3>
            <p className="text-sm text-muted mb-4">{assignModal.name}</p>
            <select value={assignModal.contractorId} onChange={e => setAssignModal(m => m ? { ...m, contractorId: e.target.value } : m)} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm mb-4">
              <option value="">Select a contractor</option>
              {contractors.map((c: any) => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={doAssign} disabled={saving || !assignModal.contractorId} className="btn-primary disabled:opacity-50">{saving ? 'Assigning...' : 'Assign'}</button>
              <button onClick={() => setAssignModal(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="font-heading font-bold text-dark-800 text-lg mb-1">Cancel Deliverable</h3>
            <p className="text-sm text-muted mb-4">{cancelModal.name}</p>
            <textarea value={modalFeedback} onChange={e => setModalFeedback(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm resize-none mb-4" placeholder="Reason (optional)" />
            <div className="flex gap-3">
              <button onClick={doCancel} disabled={saving} className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">{saving ? 'Cancelling...' : 'Cancel Deliverable'}</button>
              <button onClick={() => { setCancelModal(null); setModalFeedback(''); }} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {finalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="font-heading font-bold text-dark-800 text-lg mb-1">Final Approval</h3>
            <p className="text-sm text-muted mb-4">The client has accepted &quot;{finalModal.name}&quot;. Record the agency&apos;s final operational approval.</p>
            <textarea value={modalFeedback} onChange={e => setModalFeedback(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm resize-none mb-4" placeholder="Notes (optional)" />
            <div className="flex gap-3">
              <button onClick={doFinalApprove} disabled={saving} className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">{saving ? 'Approving...' : '✓ Final Approval'}</button>
              <button onClick={() => { setFinalModal(null); setModalFeedback(''); }} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

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