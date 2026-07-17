'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const ROLES = [
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'videography', label: 'Videography', icon: '🎬' },
  { value: 'social-media', label: 'Social Media Manager', icon: '📱' },
  { value: 'designer', label: 'Graphic Designer', icon: '🎨' },
  { value: 'ai-automation', label: 'AI Automation Specialist', icon: '🤖' },
  { value: 'web-designer', label: 'Web Designer', icon: '🌐' },
  { value: 'developer', label: 'Developer', icon: '💻' },
  { value: 'copywriter', label: 'Copywriter', icon: '✍️' },
  { value: 'motion-designer', label: 'Motion Designer', icon: '✨' },
  { value: 'virtual-assistant', label: 'Virtual Assistant', icon: '🗓️' },
  { value: 'marketing-specialist', label: 'Marketing Specialist', icon: '📈' },
  { value: 'podcast-editor', label: 'Podcast Editor', icon: '🎙️' },
];

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','District of Columbia',
];

export default function NewContractorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', businessName: '', role: 'photography', state: 'Florida', country: 'United States',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      router.push(`/contractors/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">Add Contractor</h1>
            <p className="text-muted text-sm mt-1">Create a new contractor record. Only the essential fields are required.</p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Contractor Name *</label>
                <input
                  type="text" value={form.name} required
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  placeholder="Full legal name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Business Name *</label>
                <input
                  type="text" value={form.businessName} required
                  onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  placeholder="Business or LLC name (or 'Individual')"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Role *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r.value} type="button"
                      onClick={() => setForm(f => ({ ...f, role: r.value }))}
                      className={`p-3 rounded-xl border-2 text-left text-xs font-semibold transition-all ${
                        form.role === r.value
                          ? 'border-miami-pink bg-miami-pink/5 text-miami-pink'
                          : 'border-muted-lighter bg-white text-dark-800 hover:border-muted-light'
                      }`}
                    >
                      <span className="text-lg block mb-1">{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">State *</label>
                  <select
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  >
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Country *</label>
                  <input
                    type="text" value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Contractor'}
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
