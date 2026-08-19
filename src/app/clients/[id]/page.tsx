'use client';

import React, { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import { normalizeDriveId } from '@/lib/drive';

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

export default function ClientDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const id = params?.id as string;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loginCredentials, setLoginCredentials] = useState<any>(null);
  const [generatingLogin, setGeneratingLogin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(data => { setClient(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleGenerateLogin = async () => {
    setGeneratingLogin(true);
    try {
      const res = await fetch(`/api/clients/${id}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) setLoginCredentials(data);
    } catch {
      // Intentionally ignored
    }
    setGeneratingLogin(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setClient((c: any) => ({ ...c, status: newStatus }));
  };

  const startEditing = () => {
    setEditForm({
      name: client.name,
      businessName: client.businessName || '',
      email: client.email,
      phone: client.phone || '',
      googleDriveFolderId: client.googleDriveFolderId || '',
      googleDriveFolderUrl: client.googleDriveFolderUrl || '',
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setClient(updated);
        setEditing(false);
      }
    } catch {
      // Intentionally ignored
    }
    setSaving(false);
  };

  if (loading) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main></div>;
  if (!client) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Client not found</div></main></div>;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl">
                🏢
              </div>
              <div>
                <h1 className="font-heading text-2xl font-black text-dark-800">{client.name}</h1>
                <p className="text-muted text-sm">{client.businessName || 'Client'} — {client.email}</p>
              </div>
            </div>
            <StatusBadge status={client.status} />
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-8 border-b border-muted-lighter overflow-x-auto">
            {TABS.map((tab) => {
              const href = `/clients/${id}${tab.href}`;
              const isActive = tab.href === '' ? pathname === `/clients/${id}` : pathname === `/clients/${id}${tab.href}`;
              return (
                <Link
                  key={tab.label}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? 'text-miami-pink border-miami-pink'
                      : 'text-muted border-transparent hover:text-dark-800 hover:border-muted-lighter'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Overview Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-5">
              <div className="text-xs font-semibold text-muted mb-2">Email</div>
              <div className="text-sm font-semibold text-dark-800">{client.email}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-xs font-semibold text-muted mb-2">Phone</div>
              <div className="text-sm font-semibold text-dark-800">{client.phone || 'Not provided'}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-xs font-semibold text-muted mb-2">Media Folder</div>
              <div className="text-sm font-semibold text-dark-800">
                {client.googleDriveFolderId ? '✓ Linked' : '⚠ Not linked'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Client Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Name</span>
                  <span className="font-semibold text-dark-800">{client.name}</span>
                </div>
                {client.businessName && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Business</span>
                    <span className="font-semibold text-dark-800">{client.businessName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Email</span>
                  <span className="font-semibold text-dark-800">{client.email}</span>
                </div>
                {client.googleDriveFolderId && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Folder ID</span>
                    <span className="font-mono text-xs text-dark-800 truncate max-w-[200px]">{normalizeDriveId(client.googleDriveFolderId)}</span>
                  </div>
                )}
              </div>
              <button onClick={startEditing} className="btn-secondary w-full justify-center text-sm mt-4">
                ✏️ Edit Client
              </button>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {loginCredentials && (
                  <div className="p-4 bg-miami-pink/5 border border-miami-pink/20 rounded-xl mb-3">
                    <div className="text-xs font-bold text-miami-pink mb-2">Client Login Credentials</div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-muted">Email:</span> <span className="font-mono font-semibold text-dark-800">{loginCredentials.email}</span></div>
                      <div><span className="text-muted">Password:</span> <span className="font-mono font-semibold text-dark-800">{loginCredentials.password}</span></div>
                    </div>
                    <p className="text-[0.65rem] text-muted mt-2">Share these credentials with the client.</p>
                  </div>
                )}
                <button onClick={handleGenerateLogin} disabled={generatingLogin} className="btn-primary w-full justify-center text-sm disabled:opacity-50">
                  {generatingLogin ? 'Generating...' : loginCredentials ? '🔄 Reset Password' : '🔑 Generate Client Login'}
                </button>
                <button
                  onClick={() => handleStatusChange(client.status === 'active' ? 'inactive' : 'active')}
                  className={`w-full text-center text-sm font-semibold px-5 py-2.5 rounded-full border transition-all ${
                    client.status === 'active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {client.status === 'active' ? 'Deactivate Client' : 'Activate Client'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-muted-lighter">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-dark-800 text-lg">Edit Client</h3>
                <button onClick={() => setEditing(false)} className="text-muted hover:text-dark-800 text-lg">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Business Name</label>
                <input type="text" value={editForm.businessName} onChange={e => setEditForm((f: any) => ({ ...f, businessName: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm((f: any) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Phone</label>
                <input type="tel" value={editForm.phone} onChange={e => setEditForm((f: any) => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
              </div>
              <div className="border-t border-muted-lighter pt-4">
                <h4 className="font-heading font-bold text-dark-800 text-sm mb-3">Google Drive Media Folder</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-dark-800 mb-1.5">Folder ID</label>
                    <input type="text" value={editForm.googleDriveFolderId} onChange={e => setEditForm((f: any) => ({ ...f, googleDriveFolderId: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark-800 mb-1.5">Shareable Folder URL</label>
                    <input type="url" value={editForm.googleDriveFolderUrl} onChange={e => setEditForm((f: any) => ({ ...f, googleDriveFolderUrl: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-muted-lighter flex gap-3">
              <button onClick={saveEdit} disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
