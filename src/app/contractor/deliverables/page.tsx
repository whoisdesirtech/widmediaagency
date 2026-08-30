'use client';

import React, { useEffect, useState } from 'react';
import ContractorSidebar from '@/components/ContractorSidebar';
import { DELIVERABLE_STATUS_CONFIG } from '@/lib/deliverable-lifecycle';

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
  finalApprovedAt: string | null;
  submittedUrl: string | null;
  submittedAt: string | null;
  attachments: string | null;
  feedback: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  declineReason: string | null;
  revisionCount: number;
}

interface Client {
  id: string;
  name: string;
}

const TYPE_ICONS: Record<string, string> = { 'image': '🖼️', 'video': '🎬', 'document': '📄', 'design': '🎨' };

const FILTERS = ['all', 'assigned', 'accepted', 'in-progress', 'pending-approval', 'changes-requested', 'client-accepted', 'approved', 'closed', 'declined', 'cancelled'];

export default function ContractorDeliverablesPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [clientMap, setClientMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [submitModal, setSubmitModal] = useState<{ id: string; name: string } | null>(null);
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitFiles, setSubmitFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [declineModal, setDeclineModal] = useState<{ id: string; name: string } | null>(null);
  const [declineReason, setDeclineReason] = useState('');

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

  const applyDeliverable = (id: string, updater: (d: Deliverable) => Deliverable) => {
    setDeliverables(prev => prev.map(d => d.id === id ? updater(d) : d));
  };

  const handleTransition = async (id: string, status: string, extra: Record<string, unknown> = {}) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/deliverables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      });
      if (res.ok) {
        const updated = await res.json();
        applyDeliverable(id, () => updated);
        showToast(`Status updated to ${DELIVERABLE_STATUS_CONFIG[status]?.label || status}`, 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Action failed. Please try again.', 'error');
      }
    } catch {
      showToast('Action failed. Please try again.', 'error');
    }
    setUpdatingId(null);
  };

  const handleDecline = async () => {
    if (!declineModal) return;
    await handleTransition(declineModal.id, 'declined', declineReason ? { reason: declineReason } : {});
    setDeclineModal(null);
    setDeclineReason('');
  };

  const handleSubmitWithFiles = async () => {
    if (!submitModal) return;
    setSubmitting(true);
    try {
      let attachments: string[] = [];

      if (submitFiles.length > 0) {
        const stored = localStorage.getItem('user');
        const u = stored ? JSON.parse(stored) : null;
        if (!u?.contractorId) {
          showToast('Session expired. Please log in again.', 'error');
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        submitFiles.forEach(f => formData.append('files', f));
        formData.append('folderId', u.contractorId);

        const uploadRes = await fetch('/api/drive/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          showToast(err.error || 'File upload failed', 'error');
          setSubmitting(false);
          return;
        }
        const uploadData = await uploadRes.json();
        attachments = (uploadData.files || []).map((f: { webViewLink?: string }) => f.webViewLink).filter(Boolean);
      }

      if (!submitUrl && attachments.length === 0) {
        showToast('Add a submission URL or attach at least one file before submitting.', 'error');
        setSubmitting(false);
        return;
      }

      const patchData: Record<string, unknown> = { status: 'pending-approval' };
      if (submitUrl) patchData.submittedUrl = submitUrl;
      if (attachments.length > 0) patchData.attachments = attachments;
      patchData.submittedAt = new Date().toISOString();

      const res = await fetch(`/api/deliverables/${submitModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      });
      if (res.ok) {
        const updated = await res.json();
        applyDeliverable(submitModal.id, () => updated);
        showToast('Deliverable submitted for client review', 'success');
        setSubmitModal(null);
        setSubmitUrl('');
        setSubmitFiles([]);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to submit deliverable', 'error');
      }
    } catch {
      showToast('Failed to submit deliverable', 'error');
    }
    setSubmitting(false);
  };

  const filtered = filter === 'all' ? deliverables : deliverables.filter(d => d.status === filter);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} contractorRoles={user?.contractorRoles} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">My Deliverables</h1>
            <p className="text-muted text-sm mt-1">Accept assignments, track progress, and submit your work</p>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filter === f ? 'bg-dark text-white' : 'bg-white border border-muted-lighter text-dark-800 hover:bg-muted-lighter/30'}`}>
                {f === 'all' ? 'All' : DELIVERABLE_STATUS_CONFIG[f]?.label.replace(/^[^\s]*\s/, '') || f}
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
                  {filter === 'all' ? 'No Deliverables' : `No ${DELIVERABLE_STATUS_CONFIG[filter]?.label || filter} Deliverables`}
                </div>
                <div className="text-muted text-sm">
                  {filter === 'all'
                    ? 'No deliverables have been assigned to you yet.'
                    : `You have no deliverables with "${filter}" status.`}
                </div>
              </div>
            ) : filtered.map((item) => {
              const status = DELIVERABLE_STATUS_CONFIG[item.status] || DELIVERABLE_STATUS_CONFIG.draft;
              const terminal = ['closed', 'cancelled'].includes(item.status);
              return (
                <div key={item.id} className="glass-card p-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
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
                          {item.revisionCount > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[0.6rem] font-semibold">
                              {item.revisionCount} revision{item.revisionCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted">{item.description || 'No description'} {item.dueDate ? `· Due ${item.dueDate}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      {!terminal && (
                        <div className="flex gap-1.5">
                          {item.status === 'assigned' && (
                            <>
                              <button onClick={() => handleTransition(item.id, 'accepted')} disabled={updatingId === item.id} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50">
                                ✓ Accept
                              </button>
                              <button onClick={() => setDeclineModal({ id: item.id, name: item.name })} disabled={updatingId === item.id} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                                ✕ Decline
                              </button>
                            </>
                          )}
                          {item.status === 'accepted' && (
                            <button onClick={() => handleTransition(item.id, 'in-progress')} disabled={updatingId === item.id} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                              Start
                            </button>
                          )}
                          {item.status === 'in-progress' && (
                            <button onClick={() => { setSubmitModal({ id: item.id, name: item.name }); setSubmitUrl(item.submittedUrl || ''); }} disabled={updatingId === item.id} className="px-3 py-1.5 bg-miami-pink text-white text-xs font-semibold rounded-lg hover:bg-miami-pink/80 transition-colors disabled:opacity-50">
                              Submit
                            </button>
                          )}
                          {item.status === 'changes-requested' && (
                            <button onClick={() => { setSubmitModal({ id: item.id, name: item.name }); setSubmitUrl(item.submittedUrl || ''); }} disabled={updatingId === item.id} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                              Revise
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {item.declineReason && (
                    <div className="mt-2 ml-14 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-[0.65rem] font-semibold text-red-700 mb-0.5">Decline Reason</p>
                      <p className="text-xs text-red-800">{item.declineReason}</p>
                    </div>
                  )}
                  {item.submittedUrl && (
                    <div className="mt-2 ml-14">
                      <a href={item.submittedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-miami-pink font-semibold hover:underline">
                        View Submitted Work ↗
                      </a>
                    </div>
                  )}
                  {item.attachments && (() => {
                    try {
                      const atts = typeof item.attachments === 'string' ? JSON.parse(item.attachments) : item.attachments;
                      if (Array.isArray(atts) && atts.length > 0) {
                        return (
                          <div className="mt-2 ml-14 flex flex-wrap gap-1.5">
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
                  {item.feedback && (
                    <div className="mt-2 ml-14 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-[0.65rem] font-semibold text-amber-700 mb-0.5">Review Feedback</p>
                      <p className="text-xs text-amber-800">{item.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-muted-lighter">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-dark-800 text-lg">Submit Deliverable</h3>
                <button onClick={() => { setSubmitModal(null); setSubmitUrl(''); setSubmitFiles([]); }} className="text-muted hover:text-dark-800 text-lg">✕</button>
              </div>
              <p className="text-sm text-muted mt-1">{submitModal.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Submission URL (optional)</label>
                <input
                  type="url"
                  value={submitUrl}
                  onChange={e => setSubmitUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  placeholder="https://figma.com/... or https://docs.google.com/..."
                />
                <p className="text-[0.65rem] text-muted mt-1">Link to Figma, Google Docs, Canva, or any other tool</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">File Attachments (optional)</label>
                <input
                  type="file"
                  multiple
                  onChange={e => setSubmitFiles(Array.from(e.target.files || []))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-dark file:text-white file:cursor-pointer hover:file:bg-dark-700"
                />
                <p className="text-[0.65rem] text-muted mt-1">Upload files to Google Drive (max 100MB each)</p>
              </div>
              <p className="text-[0.65rem] text-muted">At least one of the above is required to submit.</p>
              {submitFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {submitFiles.map((f, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-muted-lighter text-[0.6rem] font-semibold text-dark-800">
                      📎 {f.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmitWithFiles}
                  disabled={submitting}
                  className="px-4 py-2 bg-miami-pink text-white text-sm font-semibold rounded-lg hover:bg-miami-pink/80 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit for Client Review'}
                </button>
                <button
                  onClick={() => { setSubmitModal(null); setSubmitUrl(''); setSubmitFiles([]); }}
                  className="px-4 py-2 border-2 border-muted-lighter text-dark-800 text-sm font-semibold rounded-lg hover:bg-muted-lighter/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {declineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="font-heading font-bold text-dark-800 text-lg mb-1">Decline Assignment</h3>
            <p className="text-sm text-muted mb-4">{declineModal.name}</p>
            <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm resize-none mb-4" placeholder="Reason (optional)" />
            <div className="flex gap-3">
              <button onClick={handleDecline} disabled={updatingId === declineModal.id} className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                Confirm Decline
              </button>
              <button onClick={() => { setDeclineModal(null); setDeclineReason(''); }} className="btn-secondary">Cancel</button>
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