'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';

interface Contractor {
  id: string;
  name: string;
  businessName: string;
  role: string;
  state: string;
  country: string;
  status: string;
  sowCount: number;
  contractCount: number;
}

interface Stats {
  totalContractors: number;
  activeContractors: number;
  totalSows: number;
  pendingContracts: number;
}

export default function DashboardPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [stats, setStats] = useState<Stats>({ totalContractors: 0, activeContractors: 0, totalSows: 0, pendingContracts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => {
        setContractors(data.contractors || []);
        setStats(data.stats || { totalContractors: 0, activeContractors: 0, totalSows: 0, pendingContracts: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Contractors', value: stats.totalContractors, icon: '👥', color: 'from-miami-pink to-miami-blue-light' },
    { label: 'Active', value: stats.activeContractors, icon: '✅', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Active SOWs', value: stats.totalSows, icon: '📝', color: 'from-miami-blue-beach to-miami-blue-bright' },
    { label: 'Pending Signatures', value: stats.pendingContracts, icon: '✍️', color: 'from-amber-500 to-orange-500' },
  ];

  const ROLE_ICONS: Record<string, string> = {
    photography: '📸', videography: '🎬', 'social-media': '📱',
    designer: '🎨', 'ai-automation': '🤖', developer: '💻',
    copywriter: '✍️', 'web-designer': '🌐', 'motion-designer': '✨',
    'virtual-assistant': '🗓️', 'marketing-specialist': '📈', 'podcast-editor': '🎙️',
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Dashboard</h1>
              <p className="text-muted text-sm mt-1">Freelancer Talent Agreement System — WhoIsDésir® Media</p>
            </div>
            <Link href="/contractors/new" className="btn-primary">
              + Add Contractor
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(card => (
              <div key={card.label} className="glass-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-muted text-xs font-semibold mb-1">{card.label}</div>
                    <div className="font-heading text-3xl font-black text-dark-800">{card.value}</div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-lg`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-muted-lighter">
              <h2 className="font-heading font-bold text-dark-800">All Contractors</h2>
            </div>

            {loading ? (
              <div className="p-12 text-center text-muted text-sm">Loading contractors...</div>
            ) : contractors.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">👥</div>
                <div className="font-heading font-bold text-dark-800 mb-1">No contractors yet</div>
                <div className="text-muted text-sm mb-4">Add your first contractor to get started</div>
                <Link href="/contractors/new" className="btn-primary text-sm">+ Add Contractor</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-muted border-b border-muted-lighter">
                      <th className="p-4">Contractor</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Jurisdiction</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">SOWs</th>
                      <th className="p-4">Contracts</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractors.map(c => (
                      <tr key={c.id} className="border-b border-muted-lighter/50 hover:bg-white/50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-dark-800 text-sm">{c.name}</div>
                          <div className="text-muted text-xs">{c.businessName}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span>{ROLE_ICONS[c.role] || '📋'}</span>
                            <span className="capitalize">{c.role.replace(/-/g, ' ')}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted">{c.state}, {c.country}</td>
                        <td className="p-4"><StatusBadge status={c.status} /></td>
                        <td className="p-4 text-sm font-semibold text-dark-800">{c.sowCount}</td>
                        <td className="p-4 text-sm font-semibold text-dark-800">{c.contractCount}</td>
                        <td className="p-4">
                          <Link href={`/contractors/${c.id}`} className="text-miami-pink text-xs font-semibold hover:underline">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
