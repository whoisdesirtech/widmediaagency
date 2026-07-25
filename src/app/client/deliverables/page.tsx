'use client';

import React, { useEffect, useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

const DELIVERABLES = [
  { name: 'Homepage Hero Image', project: 'Website Redesign', status: 'pending', type: 'image', dueDate: 'Jul 28, 2026' },
  { name: 'About Us Page Copy', project: 'Website Redesign', status: 'approved', type: 'document', dueDate: 'Jul 25, 2026' },
  { name: 'Brand Portrait Set (10 photos)', project: 'Brand Photoshoot', status: 'in-progress', type: 'image', dueDate: 'Aug 2, 2026' },
  { name: 'Instagram Reel — Product Launch', project: 'Social Media Content', status: 'pending', type: 'video', dueDate: 'Jul 30, 2026' },
  { name: 'Logo Concepts (3 options)', project: 'Brand Photoshoot', status: 'pending-approval', type: 'design', dueDate: 'Jul 26, 2026' },
  { name: 'Monthly Analytics Report', project: 'Social Media Content', status: 'approved', type: 'document', dueDate: 'Jul 20, 2026' },
  { name: 'Social Media Content Calendar', project: 'Social Media Content', status: 'approved', type: 'document', dueDate: 'Jul 18, 2026' },
  { name: 'Website Mockup — Mobile', project: 'Website Redesign', status: 'approved', type: 'design', dueDate: 'Jul 22, 2026' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'approved': { label: '✅ Approved', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'pending': { label: '⏳ In Progress', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'in-progress': { label: '🔄 In Progress', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'pending-approval': { label: '🔔 Awaiting Approval', color: 'text-miami-pink', bg: 'bg-pink-50 border-pink-200' },
  'changes-requested': { label: '📝 Changes Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
};

const TYPE_ICONS: Record<string, string> = {
  'image': '🖼️',
  'video': '🎬',
  'document': '📄',
  'design': '🎨',
};

export default function ClientDeliverablesPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    setUser(JSON.parse(stored));
  }, []);

  const filtered = filter === 'all' ? DELIVERABLES : DELIVERABLES.filter(d => d.status === filter);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">Deliverables</h1>
            <p className="text-muted text-sm mt-1">Review and approve work from your agency</p>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'pending-approval', 'pending', 'approved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-dark text-white'
                    : 'bg-white border border-muted-lighter text-dark-800 hover:bg-muted-lighter/30'
                }`}
              >
                {f === 'all' ? 'All' : f === 'pending-approval' ? 'Awaiting Approval' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((item, i) => {
              const status = STATUS_CONFIG[item.status];
              return (
                <div key={i} className="glass-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted-lighter flex items-center justify-center text-lg">
                        {TYPE_ICONS[item.type]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-800 text-sm">{item.name}</h4>
                        <p className="text-xs text-muted">{item.project} · Due {item.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      {item.status === 'pending-approval' && (
                        <div className="flex gap-1.5">
                          <button className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors">Approve</button>
                          <button className="px-3 py-1.5 bg-white border border-muted-lighter text-dark-800 text-xs font-semibold rounded-lg hover:bg-muted-lighter/30 transition-colors">Request Changes</button>
                        </div>
                      )}
                    </div>
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
