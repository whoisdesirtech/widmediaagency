'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', color: 'bg-blue-100 text-blue-700', icon: '🟢' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700', icon: '🟡' },
  { value: 'review', label: 'Review', color: 'bg-indigo-100 text-indigo-700', icon: '🔵' },
  { value: 'complete', label: 'Complete', color: 'bg-emerald-100 text-emerald-700', icon: '✅' },
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ clientId: '', name: '', description: '', icon: '📁', status: 'planning', progress: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([p, c]) => {
      setProjects(Array.isArray(p) ? p : []);
      setClients(Array.isArray(c) ? c : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          timeline: [
            { label: 'Discovery', done: false },
            { label: 'Design', done: false },
            { label: 'Development', done: false },
            { label: 'Review', done: false },
            { label: 'Launch', done: false },
          ],
        }),
      });
      if (res.ok) {
        const project = await res.json();
        setProjects(prev => [...prev, project]);
        setShowCreate(false);
        setForm({ clientId: '', name: '', description: '', icon: '📁', status: 'planning', progress: 0 });
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Projects</h1>
              <p className="text-muted text-sm mt-1">Manage client projects, timelines, and progress</p>
            </div>
            <button onClick={() => setShowCreate(true)} className="btn-primary">+ New Project</button>
          </div>

          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">📁</div>
              <div className="font-heading font-bold text-dark-800 mb-1">No Projects Yet</div>
              <div className="text-muted text-sm mb-4">Create your first project to get started.</div>
              <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ New Project</button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const statusOpt = STATUS_OPTIONS.find(s => s.value === project.status);
                return (
                  <div key={project.id} className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{project.icon}</span>
                        <div>
                          <h3 className="font-heading font-bold text-dark-800">{project.name}</h3>
                          <p className="text-xs text-muted">{project.client?.name} · {project.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={project.status}
                          onChange={(e) => handleStatusChange(project.id, e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-muted-lighter bg-white text-xs font-semibold text-dark-800"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                          ))}
                        </select>
                        <Link href={`/admin/projects/${project.id}`} className="px-3 py-1.5 bg-white border border-muted-lighter text-dark-800 text-xs font-semibold rounded-lg hover:bg-muted-lighter/30 transition-colors">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(project.id)} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted-lighter rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-miami-pink to-miami-blue-light rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-dark-800">{project.progress}%</span>
                      <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusOpt?.color}`}>{statusOpt?.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-muted-lighter">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-dark-800 text-lg">New Project</h3>
                <button onClick={() => setShowCreate(false)} className="text-muted hover:text-dark-800 text-lg">✕</button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Client *</label>
                <select
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Project Name *</label>
                <input
                  type="text" value={form.name} required
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Description</label>
                <input
                  type="text" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  placeholder="Brief project description"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Icon</label>
                  <input
                    type="text" value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Progress %</label>
                  <input
                    type="number" min="0" max="100" value={form.progress}
                    onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
