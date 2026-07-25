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

interface Folder {
  id: string;
  name: string;
  icon: string;
  driveFolderId: string | null;
  driveFolderUrl: string | null;
}

const ICON_OPTIONS = ['📸', '🎬', '🌐', '🎨', '✨', '📁', '📄', '🎵', '📊', '🔧', '💡', '📦'];

export default function AdminClientMediaPage() {
  const params = useParams();
  const id = params?.id as string;
  const [client, setClient] = useState<any>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editFolder, setEditFolder] = useState<Folder | null>(null);
  const [form, setForm] = useState({ name: '', icon: '📁', driveFolderId: '', driveFolderUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients/${id}`).then(r => r.json()),
      fetch(`/api/folders?clientId=${id}`).then(r => r.json()),
    ]).then(([c, f]) => {
      setClient(c);
      setFolders(Array.isArray(f) ? f : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: id, ...form, sortOrder: folders.length }),
      });
      if (res.ok) {
        const folder = await res.json();
        setFolders(prev => [...prev, folder]);
        setShowCreate(false);
        setForm({ name: '', icon: '📁', driveFolderId: '', driveFolderUrl: '' });
      }
    } catch {}
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editFolder) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/folders/${editFolder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setFolders(prev => prev.map(f => f.id === updated.id ? updated : f));
        setEditFolder(null);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (fid: string) => {
    if (!confirm('Delete this folder?')) return;
    await fetch(`/api/folders/${fid}`, { method: 'DELETE' });
    setFolders(prev => prev.filter(f => f.id !== fid));
  };

  const openEdit = (folder: Folder) => {
    setForm({ name: folder.name, icon: folder.icon, driveFolderId: folder.driveFolderId || '', driveFolderUrl: folder.driveFolderUrl || '' });
    setEditFolder(folder);
  };

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
                <span className="text-dark-800">Media Gallery</span>
              </div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Media Gallery</h1>
              <p className="text-muted text-sm mt-1">Manage {client?.name}&apos;s media folders and Google Drive links</p>
            </div>
            <button onClick={() => { setForm({ name: '', icon: '📁', driveFolderId: '', driveFolderUrl: '' }); setShowCreate(true); }} className="btn-primary">+ Add Folder</button>
          </div>

          <div className="flex gap-1 mb-8 border-b border-muted-lighter overflow-x-auto">
            {TABS.map((tab) => {
              const href = `/clients/${id}${tab.href}`;
              const isActive = tab.href === '/media';
              return (
                <Link key={tab.label} href={href} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${isActive ? 'text-miami-pink border-miami-pink' : 'text-muted border-transparent hover:text-dark-800 hover:border-muted-lighter'}`}>
                  <span>{tab.icon}</span>{tab.label}
                </Link>
              );
            })}
          </div>

          {folders.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">📂</div>
              <div className="font-heading font-bold text-dark-800 mb-1">No Folders Yet</div>
              <div className="text-muted text-sm mb-4">Add folders to organize this client&apos;s media files.</div>
              <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ Add Folder</button>
            </div>
          ) : (
            <div className="space-y-3">
              {folders.map((folder) => (
                <div key={folder.id} className="glass-card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{folder.icon}</span>
                    <div>
                      <h3 className="font-heading font-bold text-dark-800">{folder.name}</h3>
                      <p className="text-xs text-muted">
                        {folder.driveFolderId ? <span className="text-emerald-600">✓ Google Drive connected</span> : <span className="text-amber-600">⚠ No Drive folder set</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(folder)} className="px-3 py-1.5 bg-white border border-muted-lighter text-dark-800 text-xs font-semibold rounded-lg hover:bg-muted-lighter/30 transition-colors">✏️ Edit</button>
                    <button onClick={() => handleDelete(folder.id)} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {(showCreate || editFolder) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-muted-lighter">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-dark-800 text-lg">{editFolder ? 'Edit Folder' : 'New Folder'}</h3>
                <button onClick={() => { setShowCreate(false); setEditFolder(null); }} className="text-muted hover:text-dark-800 text-lg">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Folder Name *</label>
                <input type="text" value={form.name} required onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g. Photography" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${form.icon === icon ? 'border-miami-pink bg-miami-pink/5' : 'border-muted-lighter hover:border-muted-light'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Google Drive Folder ID</label>
                <input type="text" value={form.driveFolderId} onChange={e => setForm(f => ({ ...f, driveFolderId: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm font-mono" placeholder="e.g. 1aBcDeFgHiJkLmNoPqRsTuVwXyZ" />
                <p className="text-[0.65rem] text-muted mt-1">From: drive.google.com/drive/folders/<strong>FOLDER_ID</strong></p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Shareable URL (fallback)</label>
                <input type="url" value={form.driveFolderUrl} onChange={e => setForm(f => ({ ...f, driveFolderUrl: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="https://drive.google.com/drive/folders/..." />
              </div>
            </div>
            <div className="p-6 border-t border-muted-lighter flex gap-3">
              <button onClick={editFolder ? handleEdit : handleCreate} disabled={saving || !form.name} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : editFolder ? 'Save Changes' : 'Create Folder'}
              </button>
              <button onClick={() => { setShowCreate(false); setEditFolder(null); }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
