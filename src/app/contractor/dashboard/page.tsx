'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ContractorSidebar from '@/components/ContractorSidebar';
import StatusBadge from '@/components/StatusBadge';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  contractorId?: string;
}

interface ContractorData {
  id: string;
  name: string;
  businessName: string;
  role: string;
  state: string;
  country: string;
  status: string;
  taxFormUrl?: string;
  insuranceProofUrl?: string;
  licensingProofUrl?: string;
  sows: any[];
  assembledContracts: any[];
}

export default function ContractorDashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [contractor, setContractor] = useState<ContractorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingDeliverable, setUpdatingDeliverable] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.contractorId) {
      fetch(`/api/contractors/${u.contractorId}`)
        .then(r => r.json())
        .then(data => { setContractor(data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleDeliverableStatus = async (sowId: string, deliverables: any[], index: number, newStatus: string) => {
    setUpdatingDeliverable(`${sowId}-${index}`);
    const updated = deliverables.map((d: any, i: number) => {
      const text = typeof d === 'string' ? d : d.text;
      const status = typeof d === 'object' ? d.status : 'pending';
      if (i === index) return { text, status: newStatus };
      return { text, status };
    });
    try {
      await fetch('/api/sows', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sowId, deliverables: JSON.stringify(updated) }),
      });
      setContractor((c: any) => ({
        ...c,
        sows: c.sows.map((s: any) => s.id === sowId ? { ...s, deliverables: JSON.stringify(updated) } : s),
      }));
    } catch {}
    setUpdatingDeliverable(null);
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main>
    </div>
  );

  if (!contractor) return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">🔗</div>
          <div className="font-heading font-bold text-dark-800 mb-1">No Contractor Profile</div>
          <div className="text-muted text-sm">Your account is not linked to a contractor profile. Contact your agency admin.</div>
        </div>
      </main>
    </div>
  );

  const ROLE_ICONS: Record<string, string> = {
    photography: '📸', videography: '🎬', 'social-media': '📱',
    designer: '🎨', 'ai-automation': '🤖', developer: '💻',
    copywriter: '✍️', 'web-designer': '🌐', 'motion-designer': '✨',
    'virtual-assistant': '🗓️', 'marketing-specialist': '📈', 'podcast-editor': '🎙️',
  };

  const pendingContracts = contractor.assembledContracts?.filter((c: any) => c.status === 'pending_signatures') || [];
  const activeContracts = contractor.assembledContracts?.filter((c: any) => c.status === 'active') || [];
  const pendingDocs = !contractor.taxFormUrl;

  const statCards = [
    { label: 'Active Contracts', value: activeContracts.length, icon: '✅', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending Signatures', value: pendingContracts.length, icon: '✍️', color: 'from-amber-500 to-orange-500' },
    { label: 'Statements of Work', value: contractor.sows?.length || 0, icon: '📝', color: 'from-miami-blue-beach to-miami-blue-bright' },
    { label: 'Documents Needed', value: pendingDocs ? 1 : 0, icon: '📄', color: pendingDocs ? 'from-miami-pink to-miami-blue-light' : 'from-gray-400 to-gray-500' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl">
              {ROLE_ICONS[contractor.role] || '📋'}
            </div>
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">{contractor.name}</h1>
              <p className="text-muted text-sm">{contractor.businessName} — <span className="capitalize">{contractor.role.replace(/-/g, ' ')}</span></p>
            </div>
            <div className="ml-auto"><StatusBadge status={contractor.status} /></div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Onboarding Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Tax Form (W-9/W-8BEN)</span>
                  <span className={`font-semibold ${contractor.taxFormUrl ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {contractor.taxFormUrl ? '✓ Uploaded' : '⚠ Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Insurance Proof</span>
                  <span className={`font-semibold ${contractor.insuranceProofUrl ? 'text-emerald-600' : 'text-muted'}`}>
                    {contractor.insuranceProofUrl ? '✓ Uploaded' : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Licensing Proof</span>
                  <span className={`font-semibold ${contractor.licensingProofUrl ? 'text-emerald-600' : 'text-muted'}`}>
                    {contractor.licensingProofUrl ? '✓ Uploaded' : 'N/A'}
                  </span>
                </div>
              </div>
              {pendingDocs && (
                <Link href="/contractor/onboarding" className="btn-primary w-full justify-center text-sm mt-4">
                  Complete Onboarding →
                </Link>
              )}
            </div>

            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/contractor/contracts" className="btn-secondary w-full justify-center text-sm">
                  📑 View My Contracts
                </Link>
                <Link href="/contractor/onboarding" className="btn-secondary w-full justify-center text-sm">
                  📄 Upload Documents
                </Link>
              </div>
            </div>
          </div>

          {pendingContracts.length > 0 && (
            <div className="glass-card overflow-hidden mb-6">
              <div className="p-5 border-b border-muted-lighter">
                <h3 className="font-heading font-bold text-dark-800">Contracts Awaiting Your Signature</h3>
              </div>
              <div className="divide-y divide-muted-lighter/50">
                {pendingContracts.map((c: any) => (
                  <Link key={c.id} href="/contractor/contracts" className="p-4 flex items-center justify-between hover:bg-white/50 transition-colors">
                    <div>
                      <div className="text-sm font-semibold text-dark-800">{c.contractor?.name || 'Contract'}</div>
                      <div className="text-xs text-muted">Assembled {new Date(c.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className="text-miami-pink text-xs font-semibold">Review & Sign →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {contractor.sows?.length > 0 && (
            <div className="glass-card overflow-hidden mb-6">
              <div className="p-5 border-b border-muted-lighter">
                <h3 className="font-heading font-bold text-dark-800">My Statements of Work</h3>
                <p className="text-muted text-xs mt-1">Your SOW must be approved before your contract is assembled</p>
              </div>
              <div className="divide-y divide-muted-lighter/50">
                {contractor.sows.map((sow: any) => {
                  const deliverables = JSON.parse(sow.deliverables || '[]');
                  return (
                    <div key={sow.id} className="p-4 hover:bg-white/50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm font-semibold text-dark-800">{sow.rateType} — ${sow.rate}</div>
                          <div className="text-xs text-muted">Started {sow.startDate} · {sow.paymentSchedule}</div>
                        </div>
                        <StatusBadge status={sow.status} />
                      </div>
                      {deliverables.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-semibold text-dark-800">Deliverables:</div>
                          {deliverables.map((d: any, i: number) => {
                            const text = typeof d === 'string' ? d : d.text;
                            const status = typeof d === 'object' ? d.status : 'pending';
                            const isUpdating = updatingDeliverable === `${sow.id}-${i}`;
                            return (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                  status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                                  status === 'denied' ? 'bg-red-100 text-red-600' :
                                  'bg-muted-lighter text-muted'
                                }`}>
                                  {status === 'approved' ? '✓' : status === 'denied' ? '✕' : '○'}
                                </span>
                                <span className={`${status === 'denied' ? 'line-through text-muted' : 'text-dark-800'}`}>{text}</span>
                                {sow.status !== 'completed' && sow.status !== 'cancelled' && (
                                  <div className="flex gap-1 ml-auto">
                                    <button
                                      disabled={isUpdating || status === 'approved'}
                                      onClick={() => handleDeliverableStatus(sow.id, deliverables, i, 'approved')}
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                        status === 'approved'
                                          ? 'bg-emerald-100 text-emerald-600'
                                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                      }`}
                                    >Approve</button>
                                    <button
                                      disabled={isUpdating || status === 'denied'}
                                      onClick={() => handleDeliverableStatus(sow.id, deliverables, i, 'denied')}
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                        status === 'denied'
                                          ? 'bg-red-100 text-red-600'
                                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                                      }`}
                                    >Deny</button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {sow.status === 'draft' && (
                        <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                          ⏳ Your agency is reviewing this SOW. Your contract will be generated once it&apos;s approved.
                        </div>
                      )}
                      {sow.status === 'approved' && (
                        <div className="mt-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">
                          ✓ SOW approved. Your contract is being prepared.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {contractor.sows?.length === 0 && (
            <div className="glass-card p-8 text-center mb-6">
              <div className="text-4xl mb-3">📝</div>
              <div className="font-heading font-bold text-dark-800 mb-1">No SOW Yet</div>
              <div className="text-muted text-sm">Your agency admin will create your Statement of Work. Check back soon.</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
