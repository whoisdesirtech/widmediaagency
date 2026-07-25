'use client';

import React, { useEffect, useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

const INVOICES = [
  { id: 'INV-001', date: 'Jul 1, 2026', amount: '$2,500.00', status: 'paid', project: 'Website Redesign', description: 'Phase 1 — Discovery & Wireframes' },
  { id: 'INV-002', date: 'Jul 15, 2026', amount: '$1,800.00', status: 'paid', project: 'Social Media Content', description: 'July Content Package' },
  { id: 'INV-003', date: 'Aug 1, 2026', amount: '$3,200.00', status: 'pending', project: 'Website Redesign', description: 'Phase 2 — Design & Development' },
  { id: 'INV-004', date: 'Aug 15, 2026', amount: '$1,200.00', status: 'upcoming', project: 'Brand Photoshoot', description: 'Photo Session & Editing' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'paid': { label: 'Paid', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'pending': { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'upcoming': { label: 'Upcoming', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'overdue': { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

export default function ClientBillingPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    setUser(JSON.parse(stored));
  }, []);

  const totalPaid = '$4,300.00';
  const totalPending = '$3,200.00';

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">Billing</h1>
            <p className="text-muted text-sm mt-1">View invoices, make payments, and track your billing history</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-5">
              <div className="text-muted text-xs font-semibold mb-1">Total Paid</div>
              <div className="font-heading text-2xl font-black text-emerald-600">{totalPaid}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-muted text-xs font-semibold mb-1">Pending</div>
              <div className="font-heading text-2xl font-black text-amber-600">{totalPending}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-muted text-xs font-semibold mb-1">Next Payment</div>
              <div className="font-heading text-2xl font-black text-dark-800">Aug 1</div>
              <div className="text-xs text-muted">INV-003</div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-muted-lighter">
              <h3 className="font-heading font-bold text-dark-800">Invoices</h3>
            </div>
            <div className="divide-y divide-muted-lighter/50">
              {INVOICES.map((invoice) => {
                const status = STATUS_CONFIG[invoice.status];
                return (
                  <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-white/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted-lighter flex items-center justify-center text-sm font-bold text-dark-800">
                        {invoice.id.split('-')[1]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-dark-800">{invoice.description}</div>
                        <div className="text-xs text-muted">{invoice.project} · {invoice.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-heading font-bold text-dark-800">{invoice.amount}</span>
                      <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      {invoice.status === 'pending' && (
                        <button className="px-4 py-1.5 bg-miami-pink text-white text-xs font-semibold rounded-lg hover:bg-miami-pink/80 transition-colors">
                          Pay Now
                        </button>
                      )}
                      <button className="px-3 py-1.5 bg-white border border-muted-lighter text-dark-800 text-xs font-semibold rounded-lg hover:bg-muted-lighter/30 transition-colors">
                        📥 Receipt
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
