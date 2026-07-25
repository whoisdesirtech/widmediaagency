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

interface Invoice {
  id: string;
  invoiceNumber: string;
  description: string;
  project: string | null;
  amount: number;
  status: string;
  dueDate: string | null;
  paidDate: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'paid': { label: 'Paid', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'pending': { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'upcoming': { label: 'Upcoming', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'overdue': { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

export default function AdminClientBillingPage() {
  const params = useParams();
  const id = params?.id as string;
  const [client, setClient] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState({ invoiceNumber: '', description: '', project: '', amount: '', status: 'pending', dueDate: '', paidDate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients/${id}`).then(r => r.json()),
      fetch(`/api/invoices?clientId=${id}`).then(r => r.json()),
    ]).then(([c, inv]) => {
      setClient(c);
      setInvoices(Array.isArray(inv) ? inv : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: id, ...form, amount: parseFloat(form.amount) || 0 }),
      });
      if (res.ok) {
        const invoice = await res.json();
        setInvoices(prev => [invoice, ...prev]);
        setShowCreate(false);
        setForm({ invoiceNumber: '', description: '', project: '', amount: '', status: 'pending', dueDate: '', paidDate: '' });
      }
    } catch {}
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editInvoice) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/invoices/${editInvoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) || 0 }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
        setEditInvoice(null);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (iid: string) => {
    if (!confirm('Delete this invoice?')) return;
    await fetch(`/api/invoices/${iid}`, { method: 'DELETE' });
    setInvoices(prev => prev.filter(i => i.id !== iid));
  };

  const openEdit = (invoice: Invoice) => {
    setForm({ invoiceNumber: invoice.invoiceNumber, description: invoice.description, project: invoice.project || '', amount: invoice.amount.toString(), status: invoice.status, dueDate: invoice.dueDate || '', paidDate: invoice.paidDate || '' });
    setEditInvoice(invoice);
  };

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

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
                <span className="text-dark-800">Billing</span>
              </div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Billing</h1>
              <p className="text-muted text-sm mt-1">Manage invoices for {client?.name}</p>
            </div>
            <button onClick={() => { setForm({ invoiceNumber: '', description: '', project: '', amount: '', status: 'pending', dueDate: '', paidDate: '' }); setShowCreate(true); }} className="btn-primary">+ New Invoice</button>
          </div>

          <div className="flex gap-1 mb-8 border-b border-muted-lighter overflow-x-auto">
            {TABS.map((tab) => {
              const href = `/clients/${id}${tab.href}`;
              const isActive = tab.href === '/billing';
              return (
                <Link key={tab.label} href={href} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${isActive ? 'text-miami-pink border-miami-pink' : 'text-muted border-transparent hover:text-dark-800 hover:border-muted-lighter'}`}>
                  <span>{tab.icon}</span>{tab.label}
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-5">
              <div className="text-muted text-xs font-semibold mb-1">Total Paid</div>
              <div className="font-heading text-2xl font-black text-emerald-600">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-muted text-xs font-semibold mb-1">Pending</div>
              <div className="font-heading text-2xl font-black text-amber-600">${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-muted text-xs font-semibold mb-1">Total Invoices</div>
              <div className="font-heading text-2xl font-black text-dark-800">{invoices.length}</div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-muted-lighter">
              <h3 className="font-heading font-bold text-dark-800">Invoices</h3>
            </div>
            {invoices.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">💰</div>
                <div className="font-heading font-bold text-dark-800 mb-1">No Invoices</div>
                <div className="text-muted text-sm mb-4">Create invoices for this client.</div>
                <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ New Invoice</button>
              </div>
            ) : (
              <div className="divide-y divide-muted-lighter/50">
                {invoices.map((invoice) => {
                  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG['pending'];
                  return (
                    <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-white/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted-lighter flex items-center justify-center text-sm font-bold text-dark-800">
                          {invoice.invoiceNumber.split('-')[1] || invoice.invoiceNumber}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-dark-800">{invoice.description}</div>
                          <div className="text-xs text-muted">{invoice.project || 'General'} · {invoice.dueDate || 'No date'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-heading font-bold text-dark-800">${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>{status.label}</span>
                        <button onClick={() => openEdit(invoice)} className="px-2 py-1 text-xs text-muted hover:text-dark-800">✏️</button>
                        <button onClick={() => handleDelete(invoice.id)} className="px-2 py-1 text-xs text-red-500 hover:text-red-700">🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {(showCreate || editInvoice) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-muted-lighter">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-dark-800 text-lg">{editInvoice ? 'Edit Invoice' : 'New Invoice'}</h3>
                <button onClick={() => { setShowCreate(false); setEditInvoice(null); }} className="text-muted hover:text-dark-800 text-lg">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Invoice # *</label>
                  <input type="text" value={form.invoiceNumber} required onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g. INV-005" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Amount ($) *</label>
                  <input type="number" step="0.01" min="0" value={form.amount} required onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Description *</label>
                <input type="text" value={form.description} required onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g. Phase 1 — Discovery & Wireframes" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Project</label>
                <input type="text" value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g. Website Redesign" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Due Date</label>
                  <input type="text" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="Aug 1, 2026" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Paid Date</label>
                  <input type="text" value={form.paidDate} onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="Jul 15, 2026" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-muted-lighter flex gap-3">
              <button onClick={editInvoice ? handleEdit : handleCreate} disabled={saving || !form.invoiceNumber || !form.description || !form.amount} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : editInvoice ? 'Save Changes' : 'Create Invoice'}
              </button>
              <button onClick={() => { setShowCreate(false); setEditInvoice(null); }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
