'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function OnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [contractor, setContractor] = useState<any>(null);
  const [taxFormType, setTaxFormType] = useState('W-9');
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/contractors/${id}`).then(r => r.json()).then(setContractor).catch(() => {});
  }, [id]);

  const handleFileUpload = async (field: string, file: File) => {
    setUploading(field);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', field);

    try {
      const res = await fetch(`/api/contractors/${id}/upload`, {
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

  if (!contractor) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main></div>;

  const uploadFields = [
    {
      key: 'taxFormUrl',
      label: 'Tax Form',
      description: 'Upload W-9 (domestic) or W-8BEN (international)',
      accept: '.pdf,.jpg,.png',
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
      description: 'Required for videographers, drone operators, and on-location roles',
      accept: '.pdf,.jpg,.png',
      selector: null,
    },
    {
      key: 'licensingProofUrl',
      label: 'Licensing Proof',
      description: 'Required for drone operators (FAA/CAA license)',
      accept: '.pdf,.jpg,.png',
      selector: null,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">Contractor Onboarding</h1>
            <p className="text-muted text-sm mt-1">{contractor.name} — Upload required documentation</p>
          </div>

          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white text-lg">📄</div>
              <div>
                <div className="font-heading font-bold text-dark-800 text-sm">Tax Form Upload</div>
                <div className="text-muted text-xs">Select form type and upload the completed document</div>
              </div>
            </div>
            <div className="mb-3">{uploadFields[0].selector}</div>
            <div className="border-2 border-dashed border-muted-lighter rounded-xl p-6 text-center hover:border-miami-pink/30 transition-colors">
              <input
                type="file"
                accept={uploadFields[0].accept}
                onChange={e => e.target.files?.[0] && handleFileUpload(uploadFields[0].key, e.target.files[0])}
                className="hidden"
                id="tax-upload"
              />
              <label htmlFor="tax-upload" className="cursor-pointer">
                <div className="text-3xl mb-2">📤</div>
                <div className="text-sm font-semibold text-dark-800">
                  {uploading === uploadFields[0].key ? 'Uploading...' : 'Click or drag to upload'}
                </div>
                <div className="text-xs text-muted mt-1">PDF, JPG, or PNG</div>
              </label>
            </div>
            {contractor.taxFormUrl && (
              <div className="mt-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold">
                ✓ Tax form uploaded
              </div>
            )}
          </div>

          {uploadFields.slice(1).map(field => (
            <div key={field.key} className="glass-card p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-heading font-bold text-dark-800 text-sm">{field.label}</div>
                  <div className="text-muted text-xs">{field.description}</div>
                </div>
                {contractor[field.key] && <span className="text-emerald-600 text-xs font-semibold">✓ Uploaded</span>}
              </div>
              <div className="border-2 border-dashed border-muted-lighter rounded-xl p-6 text-center hover:border-miami-pink/30 transition-colors">
                <input
                  type="file" accept={field.accept}
                  onChange={e => e.target.files?.[0] && handleFileUpload(field.key, e.target.files[0])}
                  className="hidden" id={`upload-${field.key}`}
                />
                <label htmlFor={`upload-${field.key}`} className="cursor-pointer">
                  <div className="text-2xl mb-1">📤</div>
                  <div className="text-xs font-semibold text-dark-800">
                    {uploading === field.key ? 'Uploading...' : 'Click to upload'}
                  </div>
                </label>
              </div>
            </div>
          ))}

          <div className="mt-6">
            <button onClick={() => router.back()} className="btn-secondary">← Back to Contractor</button>
          </div>
        </div>
      </main>
    </div>
  );
}
