'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';

export default function ContractorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [contractor, setContractor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loginCredentials, setLoginCredentials] = useState<any>(null);
  const [generatingLogin, setGeneratingLogin] = useState(false);
  const [contractorEmail, setContractorEmail] = useState('');
  const [resetResult, setResetResult] = useState<any>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch(`/api/contractors/${id}`)
      .then(r => r.json())
      .then(data => { setContractor(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    await fetch(`/api/contractors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setContractor((c: any) => ({ ...c, status: newStatus }));
  };

  const handleGenerateLogin = async () => {
    setGeneratingLogin(true);
    try {
      const res = await fetch(`/api/contractors/${id}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contractorEmail || undefined }),
      });
      const data = await res.json();
      if (res.ok) setLoginCredentials(data);
    } catch {}
    setGeneratingLogin(false);
  };

  const handleResetPassword = async () => {
    if (!contractorEmail) return;
    setResetting(true);
    setResetResult(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contractorEmail }),
      });
      const data = await res.json();
      if (res.ok) setResetResult(data);
    } catch {}
    setResetting(false);
  };

  if (loading) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main></div>;
  if (!contractor) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Contractor not found</div></main></div>;

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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl">
                {ROLE_ICONS[contractor.role] || '📋'}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-black text-dark-800">{contractor.name}</h1>
                <p className="text-muted text-sm">{contractor.businessName} — <span className="capitalize">{contractor.role.replace(/-/g, ' ')}</span></p>
              </div>
            </div>
            <StatusBadge status={contractor.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-5">
              <div className="text-xs font-semibold text-muted mb-2">Jurisdiction</div>
              <div className="text-sm font-semibold text-dark-800">{contractor.state}, {contractor.country}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-xs font-semibold text-muted mb-2">Active SOWs</div>
              <div className="text-sm font-semibold text-dark-800">{contractor.sows?.length || 0}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-xs font-semibold text-muted mb-2">Assembled Contracts</div>
              <div className="text-sm font-semibold text-dark-800">{contractor.assembledContracts?.length || 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Tax & Compliance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Tax Form (W-9/W-8BEN)</span>
                  <span className={`font-semibold ${contractor.taxFormUrl ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {contractor.taxFormUrl ? '✓ Uploaded' : 'Pending'}
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
            </div>

            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {loginCredentials && (
                  <div className="p-4 bg-miami-pink/5 border border-miami-pink/20 rounded-xl mb-3">
                    <div className="text-xs font-bold text-miami-pink mb-2">Contractor Login Credentials</div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-muted">Email:</span> <span className="font-mono font-semibold text-dark-800">{loginCredentials.email}</span></div>
                      <div><span className="text-muted">Password:</span> <span className="font-mono font-semibold text-dark-800">{loginCredentials.password}</span></div>
                    </div>
                    <p className="text-[0.65rem] text-muted mt-2">Share these credentials with the contractor. They can log in at /login.</p>
                  </div>
                )}
                {resetResult && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-3">
                    <div className="text-xs font-bold text-blue-700 mb-2">Password Reset — {resetResult.name}</div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-muted">Email:</span> <span className="font-mono font-semibold text-dark-800">{resetResult.email}</span></div>
                      <div><span className="text-muted">New Password:</span> <span className="font-mono font-semibold text-dark-800">{resetResult.newPassword}</span></div>
                    </div>
                    <p className="text-[0.65rem] text-muted mt-2">Share this new password securely with the contractor.</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Contractor Email</label>
                  <input
                    type="email"
                    value={contractorEmail}
                    onChange={e => setContractorEmail(e.target.value)}
                    placeholder="contractor@gmail.com"
                    className="w-full px-3 py-2 rounded-lg border-2 border-muted-lighter bg-white text-dark-800 text-xs"
                  />
                </div>
                <button
                  onClick={handleGenerateLogin}
                  disabled={generatingLogin}
                  className="btn-primary w-full justify-center text-sm disabled:opacity-50"
                >
                  {generatingLogin ? 'Generating...' : loginCredentials ? '🔄 Reset Password' : '🔑 Generate Contractor Login'}
                </button>
                {contractorEmail && (
                  <button
                    onClick={handleResetPassword}
                    disabled={resetting}
                    className="btn-secondary w-full justify-center text-sm disabled:opacity-50"
                  >
                    {resetting ? 'Resetting...' : '🔐 Reset Password for This Email'}
                  </button>
                )}
                <Link href={`/onboarding/${contractor.id}`} className="btn-secondary w-full justify-center text-sm">
                  📄 Contractor Onboarding
                </Link>
                <Link href={`/sow-builder?contractorId=${contractor.id}`} className="btn-secondary w-full justify-center text-sm">
                  📝 Create SOW
                </Link>
                <button
                  onClick={() => handleStatusChange(contractor.status === 'active' ? 'terminated' : 'active')}
                  className={`w-full text-center text-sm font-semibold px-5 py-2.5 rounded-full border transition-all ${
                    contractor.status === 'active'
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {contractor.status === 'active' ? 'Terminate Contractor' : 'Activate Contractor'}
                </button>
              </div>
            </div>
          </div>

          {contractor.sows?.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b border-muted-lighter">
                <h3 className="font-heading font-bold text-dark-800">Statements of Work</h3>
                <p className="text-muted text-xs mt-1">SOW must be approved before a contract can be assembled</p>
              </div>
              <div className="divide-y divide-muted-lighter/50">
                {contractor.sows.map((sow: any) => (
                  <div key={sow.id} className="p-4 flex items-center justify-between hover:bg-white/50">
                    <div>
                      <div className="text-sm font-semibold text-dark-800">{sow.rateType} — ${sow.rate}</div>
                      <div className="text-xs text-muted">Started {sow.startDate} · {sow.paymentSchedule}</div>
                      {sow.deliverables && JSON.parse(sow.deliverables || '[]').length > 0 && (
                        <div className="text-xs text-muted mt-1">
                          {JSON.parse(sow.deliverables).length} deliverable(s)
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={sow.status} />
                      {sow.status === 'draft' && (
                        <button
                          onClick={async () => {
                            await fetch('/api/sows', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: sow.id, status: 'approved' }),
                            });
                            setContractor((c: any) => ({
                              ...c,
                              sows: c.sows.map((s: any) => s.id === sow.id ? { ...s, status: 'approved' } : s),
                            }));
                          }}
                          className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {sow.status === 'approved' && (
                        <button
                          onClick={async () => {
                            await fetch('/api/sows', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: sow.id, status: 'active' }),
                            });
                            setContractor((c: any) => ({
                              ...c,
                              sows: c.sows.map((s: any) => s.id === sow.id ? { ...s, status: 'active' } : s),
                            }));
                          }}
                          className="px-3 py-1.5 bg-miami-pink text-white text-xs font-semibold rounded-lg hover:bg-miami-pink/80 transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
