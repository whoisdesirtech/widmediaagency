'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';

export default function ClientsListPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(data => { setClients(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Clients</h1>
              <p className="text-muted text-sm mt-1">Manage client accounts and media folder access</p>
            </div>
            <Link href="/clients/new" className="btn-primary">
              + Add Client
            </Link>
          </div>

          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : clients.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">🏢</div>
              <div className="font-heading font-bold text-dark-800 mb-1">No Clients Yet</div>
              <div className="text-muted text-sm mb-4">Add your first client to get started.</div>
              <Link href="/clients/new" className="btn-primary inline-flex">
                + Add Client
              </Link>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="divide-y divide-muted-lighter/50">
                {clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="p-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-miami-pink/10 flex items-center justify-center text-miami-pink text-sm font-bold">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-dark-800">{client.name}</div>
                        <div className="text-xs text-muted">{client.email}{client.businessName ? ` — ${client.businessName}` : ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-muted">
                        {client.googleDriveFolderId ? '🖼️ Media linked' : '⚠ No media'}
                      </div>
                      <StatusBadge status={client.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
