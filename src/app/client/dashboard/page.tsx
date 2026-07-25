'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientSidebar from '@/components/ClientSidebar';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  clientId?: string;
}

interface ClientData {
  id: string;
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  googleDriveFolderId?: string;
  googleDriveFolderUrl?: string;
  status: string;
}

export default function ClientDashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
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

  if (!client) return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">🔗</div>
          <div className="font-heading font-bold text-dark-800 mb-1">No Client Profile</div>
          <div className="text-muted text-sm">Your account is not linked to a client profile. Contact your agency admin.</div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl">
              🏢
            </div>
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">{client.name}</h1>
              <p className="text-muted text-sm">{client.businessName || 'Client'} — {client.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-muted text-xs font-semibold mb-1">Media Access</div>
                  <div className="font-heading text-lg font-bold text-dark-800">
                    {client.googleDriveFolderId ? 'Active' : 'Not Configured'}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-miami-pink to-miami-blue-light flex items-center justify-center text-white text-lg">
                  🖼️
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-muted text-xs font-semibold mb-1">Account Status</div>
                  <div className="font-heading text-lg font-bold text-dark-800 capitalize">{client.status}</div>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${client.status === 'active' ? 'from-emerald-500 to-emerald-600' : 'from-gray-400 to-gray-500'} flex items-center justify-center text-white text-lg`}>
                  {client.status === 'active' ? '✓' : '✕'}
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-muted text-xs font-semibold mb-1">Contact</div>
                  <div className="font-heading text-lg font-bold text-dark-800">{client.phone || 'No phone'}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-lg">
                  📞
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {client.googleDriveFolderId ? (
                  <Link href="/client/media" className="btn-primary w-full justify-center text-sm">
                    🖼️ View Media Gallery
                  </Link>
                ) : (
                  <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-semibold">
                    ⚠ No media folder configured. Contact your agency admin to set up media access.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Account Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Name</span>
                  <span className="font-semibold text-dark-800">{client.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Email</span>
                  <span className="font-semibold text-dark-800">{client.email}</span>
                </div>
                {client.businessName && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Business</span>
                    <span className="font-semibold text-dark-800">{client.businessName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
