'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

const TABS = [
  { label: 'Overview', href: '', icon: '🏢' },
  { label: 'Projects', href: '/projects', icon: '📁' },
  { label: 'Deliverables', href: '/deliverables', icon: '📋' },
  { label: 'Media Gallery', href: '/media', icon: '🖼️' },
  { label: 'Messages', href: '/messages', icon: '💬' },
  { label: 'Billing', href: '/billing', icon: '💰' },
  { label: 'Documents', href: '/documents', icon: '📄' },
  { label: 'Folders', href: '/folders', icon: '📂' },
];

interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: string;
  progress: number;
  timeline: string;
  deliverables: number;
}

const STATUS_COLORS: Record<string, string> = {
  'planning': 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  'review': 'bg-indigo-100 text-indigo-700',
  'complete': 'bg-emerald-100 text-emerald-700',
};

const ICON_OPTIONS = ['📸', '🎬', '🌐', '🎨', '✨', '📱', '📦', '🔧', '💡', '🎵'];

export default function AdminClientProjectsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '📁', status: 'planning', progress: 0, deliverables: 0 });
  const [saving, setSaving] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients/${id}`).then(r => r.json()),
      fetch(`/api/projects?clientId=${id}`).then(r => r.json()),
    ]).then(([c, p]) => {
      setClient(c);
      setProjects(Array.isArray(p) ? p : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: id, ...form, timeline: '[]', sortOrder: projects.length }),
      });
      if (res.ok) {
        const project = await res.json();
        setProjects(prev => [...prev, project]);
        setShowCreate(false);
        setForm({ name: '', description: '', icon: '📁', status: 'planning', progress: 0, deliverables: 0 });
      }
    } catch {}
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editProject) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${editProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        setEditProject(null);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (pid: string) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects/${pid}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== pid));
  };

  const openEdit = (project: Project) => {
    setForm({ name: project.name, description: project.description, icon: project.icon, status: project.status, progress: project.progress, deliverables: project.deliverables });
    setEditProject(project);
  };

  if (loading) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main></div>;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted mb-2">
                <Link href="/clients" className="hover:text-dark-800">Clients</Link>
                <span>→</span>
                <Link href={`/clients/${id}`} className="hover:text-dark-800">{client?.name}</Link>
                <span>→</span>
                <span className="text-dark-800">Projects</span>
              </div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Projects</h1>
              <p className="text-muted text-sm mt-1">Manage {client?.name}&apos;s projects</p>
            </div>
            <button onClick={() => { setForm({ name: '', description: '', icon: '📁', status: 'planning', progress: 0, deliverables: 0 }); setShowCreate(true); }} className="btn-primary">+ New Project</button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-8 border-b border-muted-lighter overflow-x-auto">
            {TABS.map((tab) => {
              const href = `/clients/${id}${tab.href}`;
              const isActive = tab.href === '/projects';
              return (
                <Link key={tab.label} href={href} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${isActive ? 'text-miami-pink border-miami-pink' : 'text-muted border-transparent hover:text-dark-800 hover:border-muted-lighter'}`}>
                  <span>{tab.icon}</span>{tab.label}
                </Link>
              );
            })}
          </div>

          {projects.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">📁</div>
              <div className="font-heading font-bold text-dark-800 mb-1">No Projects Yet</div>
              <div className="text-muted text-sm mb-4">Create the first project for this client.</div>
              <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ New Project</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => {
                const timeline = JSON.parse(project.timeline || '[]');
                const isExpanded = selectedProject?.id === project.id;
                return (
                  <div key={project.id} className="glass-card p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProject(isExpanded ? null : project)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{project.icon}</span>
                        <div>
                          <h3 className="font-heading font-bold text-dark-800">{project.name}</h3>
                          <p className="text-xs text-muted">{project.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status]}`}>
                          {project.status}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(project); }} className="px-2 py-1 text-xs text-muted hover:text-dark-800">✏️</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} className="px-2 py-1 text-xs text-red-500 hover:text-red-700">🗑️</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-2 bg-muted-lighter rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-miami-pink to-miami-blue-light rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-dark-800">{project.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>{project.deliverables} deliverables</span>
                    </div>
                    {isExpanded && timeline.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-muted-lighter">
                        <h4 className="font-heading font-bold text-dark-800 text-sm mb-3">Timeline</h4>
                        <div className="space-y-2">
                          {timeline.map((step: any, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-muted-lighter text-muted'}`}>
                                {step.done ? '✓' : i + 1}
                              </div>
                              <span className={`text-sm ${step.done ? 'text-dark-800 font-semibold' : 'text-muted'}`}>{step.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {(showCreate || editProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-muted-lighter">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-dark-800 text-lg">{editProject ? 'Edit Project' : 'New Project'}</h3>
                <button onClick={() => { setShowCreate(false); setEditProject(null); }} className="text-muted hover:text-dark-800 text-lg">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Project Name *</label>
                <input type="text" value={form.name} required onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" placeholder="e.g. Website Redesign" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" rows={3} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${form.icon === icon ? 'border-miami-pink bg-miami-pink/5' : 'border-muted-lighter hover:border-muted-light'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Progress (%)</label>
                  <input type="number" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Deliverables Count</label>
                <input type="number" min="0" value={form.deliverables} onChange={e => setForm(f => ({ ...f, deliverables: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
              </div>
            </div>
            <div className="p-6 border-t border-muted-lighter flex gap-3">
              <button onClick={editProject ? handleEdit : handleCreate} disabled={saving || !form.name} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : editProject ? 'Save Changes' : 'Create Project'}
              </button>
              <button onClick={() => { setShowCreate(false); setEditProject(null); }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
