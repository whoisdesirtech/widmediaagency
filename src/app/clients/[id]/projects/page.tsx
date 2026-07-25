'use client';

import React, { useEffect, useState, useRef } from 'react';
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

interface ProjectImage {
  url: string;
  name: string;
  uploadedAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: string;
  progress: number;
  timeline: string;
  deliverables: number;
  images: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '📁', status: 'planning', progress: 0, deliverables: 0, contractorId: '' });
  const [saving, setSaving] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [contractors, setContractors] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients/${id}`).then(r => r.json()),
      fetch(`/api/projects?clientId=${id}`).then(r => r.json()),
      fetch(`/api/contractors`).then(r => r.json()),
    ]).then(([c, p, ct]) => {
      setClient(c);
      setProjects(Array.isArray(p) ? p : []);
      setContractors(Array.isArray(ct) ? ct : []);
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
        body: JSON.stringify({ clientId: id, ...form, timeline: '[]', images: '[]', sortOrder: projects.length }),
      });
      if (res.ok) {
        const project = await res.json();
        setProjects(prev => [...prev, project]);
        setShowCreate(false);
        setForm({ name: '', description: '', icon: '📁', status: 'planning', progress: 0, deliverables: 0, contractorId: '' });
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
    setForm({ name: project.name, description: project.description, icon: project.icon, status: project.status, progress: project.progress, deliverables: project.deliverables, contractorId: (project as any).contractorId || '' });
    setEditProject(project);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProject) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    formData.append('projectName', selectedProject.name);

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/images`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        setSelectedProject(updated);
      }
    } catch {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!selectedProject || !confirm('Delete this image?')) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/images?url=${encodeURIComponent(imageUrl)}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = await res.json();
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        setSelectedProject(updated);
      }
    } catch {}
  };

  const getProjectImages = (project: Project): ProjectImage[] => {
    try { return JSON.parse(project.images || '[]'); } catch { return []; }
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
              <p className="text-muted text-sm mt-1">Manage {client?.name}&apos;s projects and images</p>
            </div>
            <button onClick={() => { setForm({ name: '', description: '', icon: '📁', status: 'planning', progress: 0, deliverables: 0, contractorId: '' }); setShowCreate(true); }} className="btn-primary">+ New Project</button>
          </div>

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
                const images = getProjectImages(project);
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
                        <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status]}`}>{project.status}</span>
                        {images.length > 0 && <span className="text-[0.65rem] text-muted">🖼️ {images.length}</span>}
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

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-muted-lighter space-y-4" onClick={(e) => e.stopPropagation()}>
                        {timeline.length > 0 && (
                          <div>
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

                        {/* Image Upload Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-heading font-bold text-dark-800 text-sm">Project Images</h4>
                            <div>
                              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-3 py-1.5 bg-miami-pink text-white text-xs font-semibold rounded-lg hover:bg-miami-pink/80 transition-colors disabled:opacity-50">
                                {uploading ? 'Uploading...' : '+ Upload Images'}
                              </button>
                            </div>
                          </div>

                          {images.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {images.map((img, i) => (
                                <div key={i} className="relative group rounded-xl overflow-hidden border border-muted-lighter">
                                  <img src={img.url} alt={img.name} className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setPreviewImage(img.url)} />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                    <p className="text-white text-[0.6rem] truncate">{img.name}</p>
                                  </div>
                                  <button onClick={() => handleDeleteImage(img.url)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">✕</button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 border-2 border-dashed border-muted-lighter rounded-xl">
                              <div className="text-2xl mb-2">🖼️</div>
                              <p className="text-xs text-muted">No images yet. Click &quot;Upload Images&quot; to add photos to this project.</p>
                            </div>
                          )}
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl" />
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg flex items-center justify-center hover:bg-white/30">✕</button>
        </div>
      )}

      {/* Create/Edit Modal */}
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
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Assign Contractor</label>
                <select value={form.contractorId} onChange={e => setForm(f => ({ ...f, contractorId: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm">
                  <option value="">None</option>
                  {contractors.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
                  ))}
                </select>
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
