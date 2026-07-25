'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';

export default function ContractorsListPage() {
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contractors')
      .then(r => r.json())
      .then(data => { setContractors(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Contractors</h1>
              <p className="text-muted text-sm mt-1">Manage contractor accounts, SOWs, and contracts</p>
            </div>
            <Link href="/contractors/new" className="btn-primary">
              + Add Contractor
            </Link>
          </div>

          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : contractors.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">👥</div>
              <div className="font-heading font-bold text-dark-800 mb-1">No Contractors Yet</div>
              <div className="text-muted text-sm mb-4">Add your first contractor to get started.</div>
              <Link href="/contractors/new" className="btn-primary inline-flex">
                + Add Contractor
              </Link>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="divide-y divide-muted-lighter/50">
                {contractors.map((contractor) => (
                  <Link
                    key={contractor.id}
                    href={`/contractors/${contractor.id}`}
                    className="p-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-miami-blue-light/10 flex items-center justify-center text-miami-blue-light text-sm font-bold">
                        {contractor.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-dark-800">{contractor.name}</div>
                        <div className="text-xs text-muted">{contractor.role} — {contractor.state}, {contractor.country}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-muted text-right">
                        <div>{contractor._count?.sows || 0} SOWs</div>
                        <div>{contractor._count?.assembledContracts || 0} contracts</div>
                      </div>
                      <StatusBadge status={contractor.status} />
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
