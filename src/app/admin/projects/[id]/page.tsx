'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', icon: '🟢' },
  { value: 'in-progress', label: 'In Progress', icon: '🟡' },
  { value: 'review', label: 'Review', icon: '🔵' },
  { value: 'complete', label: 'Complete', icon: '✅' },
];

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [project, setProject] = useState<any>(null);
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then(r => r.json()),
      fetch('/api/contractors').then(r => r.json()),
    ]).then(([data, co]) => {
      setProject(data);
      setContractors(Array.isArray(co) ? co : []);
      setForm({
        name: data.name,
        description: data.description || '',
        icon: data.icon || '📁',
        status: data.status,
        progress: data.progress,
        timeline: JSON.parse(data.timeline || '[]'),
        deliverables: data.deliverables || 0,
        contractorId: data.contractorId || '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
      }
    } catch {}
    setSaving(false);
  };

  const addTimelineStep = () => {
    setForm((f: any) => ({
      ...f,
      timeline: [...f.timeline, { label: '', done: false }],
    }));
  };

  const removeTimelineStep = (index: number) => {
    setForm((f: any) => ({
      ...f,
      timeline: f.timeline.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateTimelineStep = (index: number, field: string, value: any) => {
    setForm((f: any) => ({
      ...f,
      timeline: f.timeline.map((s: any, i: number) => i === index ? { ...s, [field]: value } : s),
    }));
  };

  if (loading) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main></div>;
  if (!project) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Project not found</div></main></div>;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{form.icon}</span>
              <div>
                <h1 className="font-heading text-2xl font-black text-dark-800">Edit Project</h1>
                <p className="text-muted text-sm">{project.client?.name}</p>
              </div>
            </div>
            <button onClick={() => router.back()} className="btn-secondary">← Back</button>
          </div>

          <div className="glass-card p-6 mb-6">
            <h3 className="font-heading font-bold text-dark-800 mb-4">Project Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Icon</label>
                  <input type="text" value={form.icon} onChange={e => setForm((f: any) => ({ ...f, icon: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm text-center" />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Progress %</label>
                  <input type="number" min="0" max="100" value={form.progress} onChange={e => setForm((f: any) => ({ ...f, progress: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Deliverables Count</label>
                  <input type="number" min="0" value={form.deliverables} onChange={e => setForm((f: any) => ({ ...f, deliverables: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Assign Contractor</label>
                <select value={form.contractorId} onChange={e => setForm((f: any) => ({ ...f, contractorId: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                  <option value="">No contractor (unassigned)</option>
                  {contractors.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name || c.email}</option>
                  ))}
                </select>
                <p className="text-[0.65rem] text-muted mt-1">Contractors can only see projects assigned to them.</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-dark-800">Timeline Steps</h3>
              <button onClick={addTimelineStep} className="text-miami-pink text-xs font-semibold hover:underline">+ Add Step</button>
            </div>
            <div className="space-y-2">
              {form.timeline?.map((step: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={step.done}
                    onChange={e => updateTimelineStep(i, 'done', e.target.checked)}
                    className="w-4 h-4 rounded border-muted-lighter text-miami-pink focus:ring-miami-pink"
                  />
                  <input
                    type="text"
                    value={step.label}
                    onChange={e => updateTimelineStep(i, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                    placeholder="Step name"
                  />
                  <button onClick={() => removeTimelineStep(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </main>
    </div>
  );
}
