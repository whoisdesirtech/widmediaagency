'use client';

import React, { useEffect, useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

const DOCUMENTS = [
  { name: 'Service Agreement', type: 'contract', date: 'Jun 15, 2026', status: 'signed', icon: '📄' },
  { name: 'NDA — Brand Photography', type: 'nda', date: 'Jun 20, 2026', status: 'signed', icon: '🔒' },
  { name: 'Website Redesign Proposal', type: 'proposal', date: 'Jun 10, 2026', status: 'signed', icon: '📋' },
  { name: 'Change Order #1 — Additional Pages', type: 'change-order', date: 'Jul 5, 2026', status: 'pending', icon: '📝' },
  { name: 'Social Media Strategy Deck', type: 'proposal', date: 'Jun 25, 2026', status: 'signed', icon: '📋' },
  { name: 'Brand Guidelines v2', type: 'document', date: 'Jul 10, 2026', status: 'available', icon: '🎨' },
];

const TYPE_LABELS: Record<string, string> = {
  'contract': 'Contract',
  'nda': 'NDA',
  'proposal': 'Proposal',
  'change-order': 'Change Order',
  'document': 'Document',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'signed': { label: '✅ Signed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'pending': { label: '⏳ Pending Signature', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'available': { label: '📄 Available', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
};

export default function ClientDocumentsPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    setUser(JSON.parse(stored));
  }, []);

  const categories = ['all', 'contract', 'nda', 'proposal', 'change-order', 'document'];
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? DOCUMENTS : DOCUMENTS.filter(d => d.type === filter);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">Documents</h1>
            <p className="text-muted text-sm mt-1">Signed agreements, NDAs, proposals, and change orders — everything stored forever</p>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  filter === cat
                    ? 'bg-dark text-white'
                    : 'bg-white border border-muted-lighter text-dark-800 hover:bg-muted-lighter/30'
                }`}
              >
                {cat === 'all' ? 'All' : TYPE_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((doc, i) => {
              const status = STATUS_CONFIG[doc.status];
              return (
                <div key={i} className="glass-card p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted-lighter flex items-center justify-center text-lg">
                      {doc.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-800 text-sm">{doc.name}</h4>
                      <p className="text-xs text-muted">{TYPE_LABELS[doc.type]} · {doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                    <button className="px-3 py-1.5 bg-white border border-muted-lighter text-dark-800 text-xs font-semibold rounded-lg hover:bg-muted-lighter/30 transition-colors">
                      📥 Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
