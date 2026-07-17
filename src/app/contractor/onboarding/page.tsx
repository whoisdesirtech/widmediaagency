'use client';

import React, { useState, useEffect } from 'react';
import ContractorSidebar from '@/components/ContractorSidebar';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  contractorId?: string;
}

export default function ContractorOnboardingPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [contractor, setContractor] = useState<any>(null);
  const [taxFormType, setTaxFormType] = useState('W-9');
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleFileUpload = async (field: string, file: File) => {
    if (!contractor) return;
    setUploading(field);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', field);

    try {
      const res = await fetch(`/api/contractors/${contractor.id}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setContractor((c: any) => ({ ...c, [field]: data.url }));
      }
    } catch {}
    setUploading(null);
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
          <div className="font-heading font-bold text-dark-800">No Contractor Profile</div>
          <div className="text-muted text-sm mt-1">Contact your agency admin to complete setup.</div>
        </div>
      </main>
    </div>
  );

  const uploadFields = [
    {
      key: 'taxFormUrl',
      label: 'Tax Form (W-9 / W-8BEN)',
      description: 'Upload your completed W-9 (U.S. residents) or W-8BEN (international contractors)',
      accept: '.pdf,.jpg,.png',
      required: true,
      selector: (
        <select value={taxFormType} onChange={e => setTaxFormType(e.target.value)} className="px-3 py-2 rounded-lg border-2 border-muted-lighter bg-white text-dark-800 text-xs">
          <option value="W-9">W-9 (U.S.)</option>
          <option value="W-8BEN">W-8BEN (International)</option>
          <option value="other">Local Equivalent</option>
        </select>
      ),
    },
    {
      key: 'insuranceProofUrl',
      label: 'Insurance Proof',
      description: 'Required for videographers, drone operators, and on-location roles. General liability insurance certificate.',
      accept: '.pdf,.jpg,.png',
      required: false,
      selector: null,
    },
    {
      key: 'licensingProofUrl',
      label: 'Licensing Proof',
      description: 'Required for drone operators (FAA Part 107 / CAA license) and other specialized roles.',
      accept: '.pdf,.jpg,.png',
      required: false,
      selector: null,
    },
  ];

  const allRequiredUploaded = contractor.taxFormUrl;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">Contractor Onboarding</h1>
            <p className="text-muted text-sm mt-1">Upload your required documentation to get started with WhoIsDésir® Media</p>
          </div>

          {allRequiredUploaded && (
            <div className="mb-6 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold flex items-center gap-2">
              <span className="text-lg">✓</span> All required documents uploaded. Your agency admin will review them shortly.
            </div>
          )}

          {uploadFields.map((field, idx) => {
            const uploaded = contractor[field.key];
            return (
              <div key={field.key} className="glass-card p-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-heading font-bold text-dark-800 text-sm">
                      {field.label}
                      {field.required && <span className="text-miami-pink ml-1">*</span>}
                    </div>
                    <div className="text-muted text-xs">{field.description}</div>
                  </div>
                  {uploaded && <span className="text-emerald-600 text-xs font-semibold">✓ Uploaded</span>}
                </div>
                {idx === 0 && field.selector && <div className="mb-3">{field.selector}</div>}
                <div className="border-2 border-dashed border-muted-lighter rounded-xl p-6 text-center hover:border-miami-pink/30 transition-colors">
                  <input
                    type="file"
                    accept={field.accept}
                    onChange={e => e.target.files?.[0] && handleFileUpload(field.key, e.target.files[0])}
                    className="hidden"
                    id={`upload-${field.key}`}
                  />
                  <label htmlFor={`upload-${field.key}`} className="cursor-pointer">
                    <div className="text-3xl mb-2">📤</div>
                    <div className="text-sm font-semibold text-dark-800">
                      {uploading === field.key ? 'Uploading...' : uploaded ? 'Click to replace' : 'Click or drag to upload'}
                    </div>
                    <div className="text-xs text-muted mt-1">PDF, JPG, or PNG</div>
                  </label>
                </div>
                {uploaded && (
                  <div className="mt-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold">
                    ✓ Document uploaded successfully
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-6 glass-card p-6">
            <h3 className="font-heading font-bold text-dark-800 text-sm mb-3">What happens next?</h3>
            <ol className="space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2"><span className="text-miami-pink font-bold">1.</span> Your agency admin reviews your uploaded documents</li>
              <li className="flex items-start gap-2"><span className="text-miami-pink font-bold">2.</span> A Statement of Work (SOW) is prepared for your role</li>
              <li className="flex items-start gap-2"><span className="text-miami-pink font-bold">3.</span> Your freelancer talent agreement is assembled for signature</li>
              <li className="flex items-start gap-2"><span className="text-miami-pink font-bold">4.</span> You review and sign the agreement in the Contracts tab</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
