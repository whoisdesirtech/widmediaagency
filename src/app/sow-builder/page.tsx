'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const RATE_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'half-day', label: 'Half Day' },
  { value: 'full-day', label: 'Full Day' },
  { value: 'project', label: 'Project Based' },
  { value: 'monthly-retainer', label: 'Monthly Retainer' },
];

const PAYMENT_SCHEDULES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'net15', label: 'Net 15' },
  { value: 'net30', label: 'Net 30' },
];

function SOWBuilderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContractor = searchParams.get('contractorId') || '';

  const [contractors, setContractors] = useState<any[]>([]);
  const [form, setForm] = useState({
    contractorId: preselectedContractor,
    rate: '',
    rateType: 'hourly',
    paymentSchedule: 'net30',
    startDate: '',
    endDate: '',
    specialEquipment: '',
    software: '',
    deliverables: [''],
    attachedAddendumIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/contractors').then(r => r.json()).then(setContractors).catch(() => {});
  }, []);

  const addDeliverable = () => setForm(f => ({ ...f, deliverables: [...f.deliverables, ''] }));
  const updateDeliverable = (i: number, val: string) => {
    setForm(f => ({ ...f, deliverables: f.deliverables.map((d, idx) => idx === i ? val : d) }));
  };
  const removeDeliverable = (i: number) => {
    setForm(f => ({ ...f, deliverables: f.deliverables.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/sows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          rate: parseFloat(form.rate),
          deliverables: JSON.stringify(form.deliverables.filter(d => d.trim()).map(d => ({ text: d.trim(), status: 'pending' }))),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      router.push(`/contractors/${form.contractorId}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">SOW Builder</h1>
            <p className="text-muted text-sm mt-1">Create a Statement of Work with project-specific variable fields.</p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Contractor *</label>
                <select
                  value={form.contractorId} required
                  onChange={e => setForm(f => ({ ...f, contractorId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                >
                  <option value="">Select contractor...</option>
                  {contractors.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.role.replace(/-/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Rate Type *</label>
                  <select value={form.rateType} onChange={e => setForm(f => ({ ...f, rateType: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                    {RATE_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Rate ($) *</label>
                  <input type="number" step="0.01" value={form.rate} required onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Payment Schedule *</label>
                  <select value={form.paymentSchedule} onChange={e => setForm(f => ({ ...f, paymentSchedule: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                    {PAYMENT_SCHEDULES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Start Date *</label>
                  <input type="date" value={form.startDate} required onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Special Equipment</label>
                  <input type="text" value={form.specialEquipment} onChange={e => setForm(f => ({ ...f, specialEquipment: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g., Drone, Studio lights" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Software Used</label>
                  <input type="text" value={form.software} onChange={e => setForm(f => ({ ...f, software: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g., Adobe Premiere, Figma" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Deliverables *</label>
                <div className="space-y-2">
                  {form.deliverables.map((d, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={d} onChange={e => updateDeliverable(i, e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder={`Deliverable ${i + 1}`} />
                      {form.deliverables.length > 1 && (
                        <button type="button" onClick={() => removeDeliverable(i)} className="px-3 text-red-400 hover:text-red-600 text-sm">✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addDeliverable} className="mt-2 text-miami-pink text-xs font-semibold hover:underline">+ Add Deliverable</button>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create SOW'}
                </button>
                <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SOWBuilderPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-muted">Loading...</div></div>}>
      <SOWBuilderForm />
    </Suspense>
  );
}
