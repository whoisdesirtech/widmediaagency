'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { DELIVERABLE_STATUS_CONFIG } from '@/lib/deliverable-lifecycle';

const STATUS_CONFIG = DELIVERABLE_STATUS_CONFIG;
const STATUS_KEYS = Object.keys(DELIVERABLE_STATUS_CONFIG);

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

interface Deliverable {
  id: string;
  name: string;
  type: string;
  status: string;
  dueDate: string | null;
  description: string;
  projectId: string | null;
  contractorId: string | null;
}

const TYPE_ICONS: Record<string, string> = { 'image': '🖼️', 'video': '🎬', 'document': '📄', 'design': '🎨' };

export default function AdminClientDeliverablesPage() {
  const params = useParams();
  const id = params?.id as string;
  const [client, setClient] = useState<any>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Deliverable | null>(null);
  const [form, setForm] = useState({ name: '', type: 'document', dueDate: '', description: '', contractorId: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [contractors, setContractors] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients/${id}`).then(r => r.json()),
      fetch(`/api/deliverables?clientId=${id}`).then(r => r.json()),
      fetch(`/api/contractors`).then(r => r.json()),
    ]).then(([c, d, ct]) => {
      setClient(c);
      setDeliverables(Array.isArray(d) ? d : []);
      setContractors(Array.isArray(ct) ? ct : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const getContractorName = (cid: string | null) => {
    if (!cid) return '';
    return contractors.find((c: any) => c.id === cid)?.name || 'Unknown';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: id, name: form.name, type: form.type, dueDate: form.dueDate || undefined, description: form.description, contractorId: form.contractorId || undefined, sortOrder: deliverables.length }),
      });
      if (res.ok) {
        const item = await res.json();
        setDeliverables(prev => [...prev, item]);
        setShowCreate(false);
        setForm({ name: '', type: 'document', dueDate: '', description: '', contractorId: '' });
      }
    } catch {
      // Intentionally ignored
    }
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/deliverables/${editItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, type: form.type, dueDate: form.dueDate || null, description: form.description }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDeliverables(prev => prev.map(d => d.id === updated.id ? updated : d));
        setEditItem(null);
      }
    } catch {
      // Intentionally ignored
    }
    setSaving(false);
  };

  const handleDelete = async (did: string) => {
    if (!confirm('Delete this deliverable?')) return;
    await fetch(`/api/deliverables/${did}`, { method: 'DELETE' });
    setDeliverables(prev => prev.filter(d => d.id !== did));
  };

  const openEdit = (item: Deliverable) => {
    setForm({ name: item.name, type: item.type, dueDate: item.dueDate || '', description: item.description, contractorId: item.contractorId || '' });
    setEditItem(item);
  };

  const filtered = filter === 'all' ? deliverables : deliverables.filter(d => d.status === filter);

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
                <span className="text-dark-800">Deliverables</span>
              </div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Deliverables</h1>
              <p className="text-muted text-sm mt-1">Manage deliverables for {client?.name}</p>
            </div>
            <button onClick={() => { setForm({ name: '', type: 'document', dueDate: '', description: '', contractorId: '' }); setShowCreate(true); }} className="btn-primary">+ Add Deliverable</button>
          </div>

          <div className="flex gap-1 mb-8 border-b border-muted-lighter overflow-x-auto">
            {TABS.map((tab) => {
              const href = `/clients/${id}${tab.href}`;
              const isActive = tab.href === '/deliverables';
              return (
                <Link key={tab.label} href={href} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${isActive ? 'text-miami-pink border-miami-pink' : 'text-muted border-transparent hover:text-dark-800 hover:border-muted-lighter'}`}>
                  <span>{tab.icon}</span>{tab.label}
                </Link>
              );
            })}
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', ...STATUS_KEYS].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filter === f ? 'bg-dark text-white' : 'bg-white border border-muted-lighter text-dark-800 hover:bg-muted-lighter/30'}`}>
                {f === 'all' ? 'All' : STATUS_CONFIG[f].label.replace(/^[^\s]*\s/, '')}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <div className="font-heading font-bold text-dark-800 mb-1">No Deliverables</div>
                <div className="text-muted text-sm mb-4">Add deliverables to track work for this client.</div>
                <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ Add Deliverable</button>
              </div>
            ) : filtered.map((item) => {
              const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
              return (
                <div key={item.id} className="glass-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted-lighter flex items-center justify-center text-lg">
                        {TYPE_ICONS[item.type]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-800 text-sm">{item.name}</h4>
                        <p className="text-xs text-muted">{item.description || 'No description'} {item.dueDate ? `· Due ${item.dueDate}` : ''} {getContractorName(item.contractorId) && `· ${getContractorName(item.contractorId)}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>{status.label}</span>
                      {!['closed', 'cancelled'].includes(item.status) && (
                        <button onClick={() => openEdit(item)} className="px-2 py-1 text-xs text-muted hover:text-dark-800">✏️</button>
                      )}
                      <button onClick={() => handleDelete(item.id)} className="px-2 py-1 text-xs text-red-500 hover:text-red-700">🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {(showCreate || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-muted-lighter">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-dark-800 text-lg">{editItem ? 'Edit Deliverable' : 'New Deliverable'}</h3>
                <button onClick={() => { setShowCreate(false); setEditItem(null); }} className="text-muted hover:text-dark-800 text-lg">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Name *</label>
                <input type="text" value={form.name} required onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g. Homepage Hero Image" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                    <option value="design">Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Due Date</label>
                  <input type="text" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g. Jul 28, 2026" />
                </div>
              </div>
              {!editItem && (
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Assign Contractor</label>
                  <select value={form.contractorId} onChange={e => setForm(f => ({ ...f, contractorId: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                    <option value="">None (starts as draft)</option>
                    {contractors.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-muted-lighter flex gap-3">
              <button onClick={editItem ? handleEdit : handleCreate} disabled={saving || !form.name} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create Deliverable'}
              </button>
              <button onClick={() => { setShowCreate(false); setEditItem(null); }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}