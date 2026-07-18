'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import DraftBanner from '@/components/DraftBanner';
import SignaturePad from '@/components/SignaturePad';
import StatusBadge from '@/components/StatusBadge';

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assembling, setAssembling] = useState(false);
  const [assembleError, setAssembleError] = useState('');
  const [signError, setSignError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/contracts').then(r => r.json()),
      fetch('/api/contractors').then(r => r.json()),
    ]).then(([c, co]) => {
      setContracts(c);
      setContractors(co);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAssemble = async (contractorId: string) => {
    setAssembling(true);
    setAssembleError('');
    try {
      const res = await fetch('/api/contracts/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorId }),
      });
      const data = await res.json();
      if (res.ok) {
        setContracts(prev => [data, ...prev]);
        setSelectedContract(data);
      } else {
        setAssembleError(data.error || 'Failed to assemble contract');
      }
    } catch {}
    setAssembling(false);
  };

  const handleSign = async (contractId: string, signerRole: string, signerName: string, signatureData: string) => {
    setSignError('');
    try {
      const res = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, signerRole, signerName, signerEmail: 'admin@whodesir.com', signatureData }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = await fetch('/api/contracts').then(r => r.json());
        setContracts(updated);
        setSelectedContract((prev: any) => updated.find((c: any) => c.id === prev?.id) || prev);
      } else {
        setSignError(data.error || 'Failed to save signature');
      }
    } catch (e: any) {
      setSignError('Network error: ' + (e?.message || 'unknown'));
    }
  };

  const handleExportPDF = (contract: any) => {
    const content = contract.mergedContent || 'No content assembled';
    const html = `
      <!DOCTYPE html><html><head><style>
        body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#1E2233;line-height:1.6;font-size:12px}
        .draft-banner{background:#FEF3C7;border:2px solid #F59E0B;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:flex;align-items:center;gap:8px}
        .draft-banner strong{color:#92400E;font-size:11px}
        h1{font-size:18px;color:#0A0D1A;border-bottom:2px solid #ED145A;padding-bottom:8px;margin-bottom:16px}
        h2{font-size:14px;color:#12152A;margin-top:20px;margin-bottom:8px}
        .clause{margin-bottom:16px;padding:12px;border:1px solid #E2E6EF;border-radius:8px}
        .clause-number{background:#0A0D1A;color:white;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;font-size:10px;font-weight:700;margin-right:8px}
        .signature-block{margin-top:40px;display:flex;justify-content:space-between;gap:40px}
        .sig-box{flex:1;border-top:2px solid #1E2233;padding-top:8px}
        .sig-label{font-size:10px;color:#8891A5;margin-bottom:4px}
      </style></head><body>
        <div class="draft-banner"><strong>⚖ WORKING DRAFT — Not a Binding Agreement. Must be reviewed by a licensed attorney before signing. IP assignment, indemnity, and worker-classification clauses carry real legal risk.</strong></div>
        <h1>Freelancer Talent Agreement — WhoIsDésir® Media</h1>
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

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Assembled Contracts</h1>
              <p className="text-muted text-sm mt-1">Merge master agreement + addenda + SOW into reviewable documents.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              <div className="glass-card p-4">
                <h3 className="font-heading font-bold text-dark-800 text-sm mb-3">Assemble New Contract</h3>
                <p className="text-muted text-xs mb-3">Contractor&apos;s SOW must be approved before assembly.</p>
                <select id="contractor-select" className="w-full px-3 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-xs mb-3">
                  <option value="">Select contractor...</option>
                  {contractors.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {assembleError && (
                  <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs font-semibold mb-3">
                    {assembleError}
                  </div>
                )}
                <button
                  onClick={() => {
                    const sel = document.getElementById('contractor-select') as HTMLSelectElement;
                    if (sel.value) handleAssemble(sel.value);
                  }}
                  disabled={assembling}
                  className="btn-primary w-full justify-center text-sm disabled:opacity-50"
                >
                  {assembling ? 'Assembling...' : 'Assemble Contract'}
                </button>
              </div>

              <div className="glass-card divide-y divide-muted-lighter/50">
                <div className="p-4">
                  <h3 className="font-heading font-bold text-dark-800 text-sm">Contracts ({contracts.length})</h3>
                </div>
                {loading ? (
                  <div className="p-4 text-muted text-xs">Loading...</div>
                ) : contracts.length === 0 ? (
                  <div className="p-4 text-muted text-xs">No contracts yet</div>
                ) : (
                  contracts.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedContract(c)}
                      className={`w-full p-4 text-left hover:bg-white/50 transition-colors ${selectedContract?.id === c.id ? 'bg-miami-pink/5' : ''}`}
                    >
                      <div className="text-xs font-semibold text-dark-800">{c.contractor?.name || 'Unknown'}</div>
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
                        <p className="text-muted text-xs mt-0.5">Merged from master agreement + addenda + SOW</p>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge status={selectedContract.status} />
                        <button onClick={() => handleExportPDF(selectedContract)} className="btn-secondary text-xs">📥 Export</button>
                      </div>
                    </div>
                    <DraftBanner />
                    <div className="prose prose-xs max-w-none text-dark-800/80 text-xs leading-relaxed whitespace-pre-line">
                      {selectedContract.mergedContent || 'No content assembled. Click "Assemble Contract" to generate.'}
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-heading font-bold text-dark-800 text-sm mb-4">Signatures</h3>
                    {signError && (
                      <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold mb-4">
                        {signError}
                      </div>
                    )}
                    {selectedContract.status === 'active' ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold text-center">
                        ✓ This contract has been fully signed by both parties and is active.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          {(() => {
                            const agencySigned = selectedContract.signatures?.some((s: any) => s.signerRole === 'agency');
                            const contractorSigned = selectedContract.signatures?.some((s: any) => s.signerRole === 'contractor');
                            return (
                              <>
                                <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${agencySigned ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                  {agencySigned ? '✓' : '○'} Agency
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${contractorSigned ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                  {contractorSigned ? '✓' : '○'} Contractor
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <SignaturePad
                          onSign={(data) => handleSign(selectedContract.id, 'agency', 'Agency Admin', data)}
                          signerName="Agency Representative"
                          signerRole="agency"
                        />
                        {!selectedContract.signatures?.some((s: any) => s.signerRole === 'contractor') && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs">
                            The contractor will sign from their own portal. Once both parties sign, the contract becomes active.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <div className="text-4xl mb-3">📑</div>
                  <div className="font-heading font-bold text-dark-800">Select a contract to preview</div>
                  <div className="text-muted text-sm mt-1">Or assemble a new one from the left panel</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
