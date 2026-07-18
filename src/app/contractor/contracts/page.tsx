'use client';

import React, { useState, useEffect } from 'react';
import ContractorSidebar from '@/components/ContractorSidebar';
import DraftBanner from '@/components/DraftBanner';
import SignaturePad from '@/components/SignaturePad';
import StatusBadge from '@/components/StatusBadge';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  contractorId?: string;
}

export default function ContractorContractsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.contractorId) {
      fetch(`/api/contractors/${u.contractorId}`)
        .then(r => r.json())
        .then(data => {
          setContracts(data.assembledContracts || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSign = async (contractId: string, signatureData: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId,
          signerRole: 'contractor',
          signerName: user.name,
          signerEmail: user.email,
          signatureData,
        }),
      });
      if (res.ok) {
        const stored = localStorage.getItem('user');
        const u = JSON.parse(stored || '{}');
        if (u.contractorId) {
          const refreshed = await fetch(`/api/contractors/${u.contractorId}`).then(r => r.json());
          setContracts(refreshed.assembledContracts || []);
          setSelectedContract((prev: any) => {
            if (!prev) return null;
            return refreshed.assembledContracts?.find((c: any) => c.id === prev.id) || null;
          });
        }
      }
    } catch {}
  };

  const hasContractorSigned = (contract: any) => {
    return contract.signatures?.some((s: any) => s.signerRole === 'contractor');
  };

  const hasAgencySigned = (contract: any) => {
    return contract.signatures?.some((s: any) => s.signerRole === 'agency');
  };

  const handleExportHTML = (contract: any) => {
    const content = contract.mergedContent || 'No content assembled';
    const html = `
      <!DOCTYPE html><html><head><style>
        body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#1E2233;line-height:1.6;font-size:12px}
        .draft-banner{background:#FEF3C7;border:2px solid #F59E0B;border-radius:8px;padding:12px 16px;margin-bottom:24px}
        .draft-banner strong{color:#92400E;font-size:11px}
        h1{font-size:18px;color:#0A0D1A;border-bottom:2px solid #ED145A;padding-bottom:8px;margin-bottom:16px}
        h2{font-size:14px;color:#12152A;margin-top:20px;margin-bottom:8px}
        .clause{margin-bottom:16px;padding:12px;border:1px solid #E2E6EF;border-radius:8px}
        .signature-block{margin-top:40px;display:flex;justify-content:space-between;gap:40px}
        .sig-box{flex:1;border-top:2px solid #1E2233;padding-top:8px}
        .sig-label{font-size:10px;color:#8891A5;margin-bottom:4px}
      </style></head><body>
        <div class="draft-banner"><strong>WORKING DRAFT -- Not a Binding Agreement. Must be reviewed by a licensed attorney before signing.</strong></div>
        <h1>Freelancer Talent Agreement -- WhoIsDésir® Media</h1>
        ${content.split('\n').map((line: string) => {
          if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
          if (line.match(/^\d+\./)) return `<div class="clause">${line}</div>`;
          return `<p>${line}</p>`;
        }).join('\n')}
        <div class="signature-block">
          <div class="sig-box"><div class="sig-label">Agency Representative</div><br><br></div>
          <div class="sig-box"><div class="sig-label">Contractor</div><br><br></div>
        </div>
      </body></html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-${contract.id.slice(0, 8)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8"><div className="text-muted">Loading contracts...</div></main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">My Contracts</h1>
            <p className="text-muted text-sm mt-1">Review and sign your freelancer talent agreements.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="glass-card divide-y divide-muted-lighter/50">
                <div className="p-4">
                  <h3 className="font-heading font-bold text-dark-800 text-sm">Contracts ({contracts.length})</h3>
                </div>
                {contracts.length === 0 ? (
                  <div className="p-4 text-muted text-xs">No contracts yet. Your agency admin will assemble them.</div>
                ) : (
                  contracts.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedContract(c)}
                      className={`w-full p-4 text-left hover:bg-white/50 transition-colors ${selectedContract?.id === c.id ? 'bg-miami-pink/5' : ''}`}
                    >
                      <div className="text-xs font-semibold text-dark-800">Agreement</div>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={c.status} />
                        <span className="text-[0.6rem] text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedContract ? (
                <div className="space-y-4">
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-heading font-bold text-dark-800">Contract Preview</h2>
                        <p className="text-muted text-xs mt-0.5">Review the full agreement before signing</p>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge status={selectedContract.status} />
                        <button onClick={() => handleExportHTML(selectedContract)} className="btn-secondary text-xs">📥 Download</button>
                      </div>
                    </div>
                    <DraftBanner />
                    <div className="prose prose-xs max-w-none text-dark-800/80 text-xs leading-relaxed whitespace-pre-line">
                      {selectedContract.mergedContent || 'No content assembled.'}
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-heading font-bold text-dark-800 text-sm mb-4">Your Signature</h3>
                    {selectedContract.status === 'active' ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold text-center">
                        ✓ This contract has been fully signed by both parties and is active.
                      </div>
                    ) : hasContractorSigned(selectedContract) ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm font-semibold text-center">
                        ✓ You have signed this contract. {hasAgencySigned(selectedContract) ? 'Both parties have signed — the contract is now active.' : 'Waiting for the agency representative to sign.'}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${hasAgencySigned(selectedContract) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {hasAgencySigned(selectedContract) ? '✓' : '○'} Agency
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            ○ You
                          </div>
                        </div>
                        <SignaturePad
                          onSign={(data) => handleSign(selectedContract.id, data)}
                          signerName={user?.name || 'Contractor'}
                          signerRole="contractor"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <div className="text-4xl mb-3">📑</div>
                  <div className="font-heading font-bold text-dark-800">Select a contract to preview</div>
                  <div className="text-muted text-sm mt-1">Choose from the left panel to review and sign</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
