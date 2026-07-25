'use client';

import React, { useEffect, useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

interface ClientData {
  id: string;
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  status: string;
}

export default function ClientAccountPage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; clientId?: string } | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.clientId) {
      fetch(`/api/clients/${u.clientId}`)
        .then(r => r.json())
        .then(data => { setClient(data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">Account Settings</h1>
            <p className="text-muted text-sm mt-1">Manage your profile and preferences</p>
          </div>

          <div className="glass-card p-6 mb-6">
            <h3 className="font-heading font-bold text-dark-800 mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Name</label>
                <input
                  type="text"
                  defaultValue={client?.name || ''}
                  className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Business Name</label>
                <input
                  type="text"
                  defaultValue={client?.businessName || ''}
                  className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Email</label>
                  <input
                    type="email"
                    defaultValue={client?.email || ''}
                    className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    defaultValue={client?.phone || ''}
                    className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  />
                </div>
              </div>
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>

          <div className="glass-card p-6 mb-6">
            <h3 className="font-heading font-bold text-dark-800 mb-4">Security</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <button className="btn-secondary">Update Password</button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-heading font-bold text-dark-800 mb-4">Contact Agency</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <span>📞</span> <span>(305) 555-0100</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>✉️</span> <span>hello@whoisdesir.com</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>🕐</span> <span>Mon–Fri, 9AM–6PM EST</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>🚨</span> <span>Emergency: (305) 555-0199</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
