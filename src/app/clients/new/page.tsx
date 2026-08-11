'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    googleDriveFolderId: '',
    googleDriveFolderUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      router.push(`/clients/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">Add Client</h1>
            <p className="text-muted text-sm mt-1">Create a new client account with media folder access.</p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Client Name *</label>
                <input
                  type="text" value={form.name} required
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  placeholder="Full name or business name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Business Name</label>
                <input
                  type="text" value={form.businessName}
                  onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  placeholder="Company name (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Email *</label>
                  <input
                    type="email" value={form.email} required
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Phone</label>
                  <input
                    type="tel" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="border-t border-muted-lighter pt-6">
                <h3 className="font-heading font-bold text-dark-800 mb-1">Google Drive Media Folder</h3>
                <p className="text-muted text-xs mb-4">Link a Google Drive folder so this client can view and download their media.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark-800 mb-1.5">Folder ID</label>
                    <input
                      type="text" value={form.googleDriveFolderId}
                      onChange={e => setForm(f => ({ ...f, googleDriveFolderId: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm font-mono"
                      placeholder="e.g. 1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
                    />
                    <p className="text-[0.65rem] text-muted mt-1">
                      Paste the folder ID or full link — e.g. drive.google.com/drive/folders/<strong>FOLDER_ID</strong> — we clean it automatically.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-800 mb-1.5">Shareable Folder URL (fallback)</label>
                    <input
                      type="url" value={form.googleDriveFolderUrl}
                      onChange={e => setForm(f => ({ ...f, googleDriveFolderUrl: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                      placeholder="https://drive.google.com/drive/folders/..."
                    />
                    <p className="text-[0.65rem] text-muted mt-1">
                      Used if the embedded viewer is unavailable. Paste the full shareable link.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Client'}
                </button>
                <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
