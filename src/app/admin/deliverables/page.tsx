'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'draft': { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
  'approved': { label: 'Approved', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'pending': { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'in-progress': { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'pending-approval': { label: 'Awaiting Approval', color: 'text-miami-pink', bg: 'bg-pink-50 border-pink-200' },
  'changes-requested': { label: 'Changes Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  'rejected': { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

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
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterContractor, setFilterContractor] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [reviewModal, setReviewModal] = useState<{ id: string; name: string; action: 'approve' | 'changes' | 'reject' } | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');

  const [form, setForm] = useState({
    clientId: '',
    contractorId: '',
    sowId: '',
    name: '',
    type: 'document',
    dueDate: '',
    description: '',
  });

  useEffect(() => {
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
      }
    } catch {
      // Intentionally ignored
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deliverable?')) return;
    const res = await fetch(`/api/deliverables/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDeliverables(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/deliverables/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved', feedback: reviewFeedback || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDeliverables(prev => prev.map(d => d.id === id ? updated : d));
    }
    setReviewModal(null);
    setReviewFeedback('');
  };

  const handleRequestChanges = async (id: string) => {
    const res = await fetch(`/api/deliverables/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'changes-requested', feedback: reviewFeedback || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDeliverables(prev => prev.map(d => d.id === id ? updated : d));
    }
    setReviewModal(null);
    setReviewFeedback('');
  };

  const handleReject = async (id: string) => {
    const res = await fetch(`/api/deliverables/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', feedback: reviewFeedback || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDeliverables(prev => prev.map(d => d.id === id ? updated : d));
    }
    setReviewModal(null);
    setReviewFeedback('');
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Deliverables Management</h1>
              <p className="text-muted text-sm mt-1">View, create, and approve deliverables across all contractors and clients</p>
            </div>
            <button onClick={() => setShowCreate(true)} className="btn-primary">+ New Deliverable</button>
          </div>

          <div className="flex gap-3 mb-6">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm font-semibold"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <select
              value={filterContractor}
              onChange={e => setFilterContractor(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm font-semibold"
            >
              <option value="all">All Contractors</option>
              {contractors.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name || c.email}</option>
              ))}
            </select>
            <select
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm font-semibold"
            >
              <option value="all">All Clients</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
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
                const statusCfg = STATUS_CONFIG[d.status] || STATUS_CONFIG['pending'];
                const typeIcon = TYPE_ICONS[d.type] || '📄';
                return (
                  <div key={d.id} className="glass-card p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{typeIcon}</span>
                        <div>
                          <h3 className="font-heading font-bold text-dark-800">{d.name}</h3>
                          <p className="text-xs text-muted">
                            {getClientName(d.clientId)} · {getContractorName(d.contractorId)}
                            {d.dueDate && ` · Due ${d.dueDate}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[0.65rem] font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>

                        {d.status === 'pending-approval' && (
                          <>
                            <button
                              onClick={() => setReviewModal({ id: d.id, name: d.name, action: 'approve' })}
                              className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => setReviewModal({ id: d.id, name: d.name, action: 'changes' })}
                              className="px-3 py-1.5 bg-orange-400 text-white text-xs font-semibold rounded-lg hover:bg-orange-500 transition-colors"
                            >
                              ↻ Request Changes
                            </button>
                            <button
                              onClick={() => setReviewModal({ id: d.id, name: d.name, action: 'reject' })}
                              className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors"
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}

                        {d.status === 'changes-requested' && (
                          <button
                            onClick={() => setReviewModal({ id: d.id, name: d.name, action: 'approve' })}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            ✓ Re-approve
                          </button>
                        )}

                        {d.status === 'approved' && d.approvedAt && (
                          <span className="text-[0.65rem] text-emerald-600 font-semibold">
                            ✓ Approved {new Date(d.approvedAt).toLocaleDateString()}
                          </span>
                        )}

                        <button
                          onClick={() => handleDelete(d.id)}
                          className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {d.description && (
                      <p className="text-xs text-muted mt-2 ml-9">{d.description}</p>
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
                              {atts.map((att: string, i: number) => (
                                <a key={i} href={att} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-0.5 rounded bg-muted-lighter text-[0.6rem] font-semibold text-dark-800 hover:bg-muted transition-colors">
                                  📎 Attachment {i + 1}
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
                <select
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Contractor</label>
                <select
                  value={form.contractorId}
                  onChange={e => setForm(f => ({ ...f, contractorId: e.target.value, sowId: '' }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                >
                  <option value="">No contractor</option>
                  {contractors.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name || c.email}</option>
                  ))}
                </select>
              </div>
              {form.contractorId && (
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">SOW</label>
                  <select
                    value={form.sowId}
                    onChange={e => setForm(f => ({ ...f, sowId: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  >
                    <option value="">No SOW</option>
                    {filteredSows.map((s: any) => (
                      <option key={s.id} value={s.id}>Rate: ${s.rate}/{s.rateType} ({s.startDate})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Name *</label>
                <input
                  type="text" value={form.name} required
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  placeholder="e.g. Logo Design Draft"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  >
                    <option value="document">📄 Document</option>
                    <option value="image">🖼️ Image</option>
                    <option value="video">🎬 Video</option>
                    <option value="design">🎨 Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Due Date</label>
                  <input
                    type="date" value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Description</label>
                <textarea
                  value={form.description} rows={3}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm resize-none"
                  placeholder="Describe the deliverable..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Deliverable'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-muted-lighter">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-dark-800 text-lg">
                  {reviewModal.action === 'approve' ? 'Approve Deliverable' : reviewModal.action === 'reject' ? 'Reject Deliverable' : 'Request Changes'}
                </h3>
                <button onClick={() => { setReviewModal(null); setReviewFeedback(''); }} className="text-muted hover:text-dark-800 text-lg">✕</button>
              </div>
              <p className="text-sm text-muted mt-1">{reviewModal.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Feedback (optional)</label>
                <textarea
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm resize-none"
                  placeholder={reviewModal.action === 'approve' ? 'Any feedback for the contractor...' : reviewModal.action === 'reject' ? 'Why is this being rejected?' : 'What changes are needed?'}
                />
              </div>
              <div className="flex gap-3">
                {reviewModal.action === 'approve' && (
                  <button
                    onClick={() => handleApprove(reviewModal.id)}
                    className="px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    ✓ Approve
                  </button>
                )}
                {reviewModal.action === 'changes' && (
                  <button
                    onClick={() => handleRequestChanges(reviewModal.id)}
                    className="px-4 py-2 bg-orange-400 text-white text-sm font-semibold rounded-lg hover:bg-orange-500 transition-colors"
                  >
                    ↻ Request Changes
                  </button>
                )}
                {reviewModal.action === 'reject' && (
                  <button
                    onClick={() => handleReject(reviewModal.id)}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ✕ Reject
                  </button>
                )}
                <button
                  onClick={() => { setReviewModal(null); setReviewFeedback(''); }}
                  className="px-4 py-2 border-2 border-muted-lighter text-dark-800 text-sm font-semibold rounded-lg hover:bg-muted-lighter/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
