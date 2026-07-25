'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

const TABS = [
  { label: 'Overview', href: '', icon: '🏢' },
  { label: 'Projects', href: '/projects', icon: '📁' },
  { label: 'Deliverables', href: '/deliverables', icon: '📋' },
  { label: 'Media Gallery', href: '/media', icon: '🖼️' },
  { label: 'Messages', href: '/messages', icon: '💬' },
  { label: 'Billing', href: '/billing', icon: '💰' },
  { label: 'Documents', href: '/documents', icon: '📄' },
  { label: 'Folders', href: '/folders', icon: '📂' },
];

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  fileUrl: string | null;
  date: string | null;
}

const TYPE_ICONS: Record<string, string> = {
  'contract': '📄', 'nda': '🔒', 'proposal': '📋', 'change-order': '📝', 'document': '🎨',
};

const TYPE_LABELS: Record<string, string> = {
  'contract': 'Contract', 'nda': 'NDA', 'proposal': 'Proposal', 'change-order': 'Change Order', 'document': 'Document',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'signed': { label: '✅ Signed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'pending': { label: '⏳ Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'available': { label: '📄 Available', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
};

export default function AdminClientDocumentsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [client, setClient] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [form, setForm] = useState({ name: '', type: 'document', status: 'available', fileUrl: '', date: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients/${id}`).then(r => r.json()),
      fetch(`/api/documents?clientId=${id}`).then(r => r.json()),
    ]).then(([c, d]) => {
      setClient(c);
      setDocuments(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: id, ...form, fileUrl: form.fileUrl || null, date: form.date || null }),
      });
      if (res.ok) {
        const doc = await res.json();
        setDocuments(prev => [doc, ...prev]);
        setShowCreate(false);
        setForm({ name: '', type: 'document', status: 'available', fileUrl: '', date: '' });
      }
    } catch {}
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editDoc) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/documents/${editDoc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fileUrl: form.fileUrl || null, date: form.date || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d));
        setEditDoc(null);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (did: string) => {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/documents/${did}`, { method: 'DELETE' });
    setDocuments(prev => prev.filter(d => d.id !== did));
  };

  const openEdit = (doc: Document) => {
    setForm({ name: doc.name, type: doc.type, status: doc.status, fileUrl: doc.fileUrl || '', date: doc.date || '' });
    setEditDoc(doc);
  };

  const categories = ['all', 'contract', 'nda', 'proposal', 'change-order', 'document'];
  const filtered = filter === 'all' ? documents : documents.filter(d => d.type === filter);

  if (loading) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main></div>;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted mb-2">
                <Link href="/clients" className="hover:text-dark-800">Clients</Link>
                <span>→</span>
                <Link href={`/clients/${id}`} className="hover:text-dark-800">{client?.name}</Link>
                <span>→</span>
                <span className="text-dark-800">Documents</span>
              </div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Documents</h1>
              <p className="text-muted text-sm mt-1">Manage contracts, NDAs, and proposals for {client?.name}</p>
            </div>
            <button onClick={() => { setForm({ name: '', type: 'document', status: 'available', fileUrl: '', date: '' }); setShowCreate(true); }} className="btn-primary">+ Add Document</button>
          </div>

          <div className="flex gap-1 mb-8 border-b border-muted-lighter overflow-x-auto">
            {TABS.map((tab) => {
              const href = `/clients/${id}${tab.href}`;
              const isActive = tab.href === '/documents';
              return (
                <Link key={tab.label} href={href} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${isActive ? 'text-miami-pink border-miami-pink' : 'text-muted border-transparent hover:text-dark-800 hover:border-muted-lighter'}`}>
                  <span>{tab.icon}</span>{tab.label}
                </Link>
              );
            })}
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filter === cat ? 'bg-dark text-white' : 'bg-white border border-muted-lighter text-dark-800 hover:bg-muted-lighter/30'}`}>
                {cat === 'all' ? 'All' : TYPE_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">📄</div>
                <div className="font-heading font-bold text-dark-800 mb-1">No Documents</div>
                <div className="text-muted text-sm mb-4">Add contracts, NDAs, and proposals for this client.</div>
                <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ Add Document</button>
              </div>
            ) : filtered.map((doc) => {
              const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG['available'];
              return (
                <div key={doc.id} className="glass-card p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted-lighter flex items-center justify-center text-lg">
                      {TYPE_ICONS[doc.type]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-800 text-sm">{doc.name}</h4>
                      <p className="text-xs text-muted">{TYPE_LABELS[doc.type] || doc.type} · {doc.date || 'No date'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>{status.label}</span>
                    <button onClick={() => openEdit(doc)} className="px-2 py-1 text-xs text-muted hover:text-dark-800">✏️</button>
                    <button onClick={() => handleDelete(doc.id)} className="px-2 py-1 text-xs text-red-500 hover:text-red-700">🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {(showCreate || editDoc) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-muted-lighter">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-dark-800 text-lg">{editDoc ? 'Edit Document' : 'New Document'}</h3>
                <button onClick={() => { setShowCreate(false); setEditDoc(null); }} className="text-muted hover:text-dark-800 text-lg">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Document Name *</label>
                <input type="text" value={form.name} required onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g. Service Agreement" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                    <option value="contract">Contract</option>
                    <option value="nda">NDA</option>
                    <option value="proposal">Proposal</option>
                    <option value="change-order">Change Order</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                    <option value="available">Available</option>
                    <option value="signed">Signed</option>
                    <option value="pending">Pending Signature</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Date</label>
                <input type="text" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g. Jul 15, 2026" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">File URL (optional)</label>
                <input type="url" value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="https://..." />
              </div>
            </div>
            <div className="p-6 border-t border-muted-lighter flex gap-3">
              <button onClick={editDoc ? handleEdit : handleCreate} disabled={saving || !form.name} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : editDoc ? 'Save Changes' : 'Create Document'}
              </button>
              <button onClick={() => { setShowCreate(false); setEditDoc(null); }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
