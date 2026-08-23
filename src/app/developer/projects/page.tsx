'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', color: 'bg-blue-100 text-blue-700' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { value: 'review', label: 'Review', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'complete', label: 'Complete', color: 'bg-emerald-100 text-emerald-700' },
];

const CATEGORY_OPTIONS = [
  { value: 'web-development', label: 'Web Development', icon: '🌐' },
  { value: 'ai-agent', label: 'AI Agent', icon: '🤖' },
  { value: 'automation', label: 'Automation', icon: '⚙️' },
  { value: 'seo', label: 'SEO', icon: '🔍' },
  { value: 'social-media', label: 'Social Media', icon: '📱' },
  { value: 'brand-kit', label: 'Brand Kit', icon: '🎨' },
  { value: 'influencer-audit', label: 'Influencer Audit', icon: '📊' },
  { value: 'media-production', label: 'Media Production', icon: '🎬' },
  { value: 'data', label: 'Data', icon: '📈' },
  { value: 'marketing', label: 'Marketing', icon: '📣' },
  { value: 'internal-tool', label: 'Internal Tool', icon: '🛠️' },
];

export default function DeveloperProjectsPage() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', status: '' });
  const [view, setView] = useState<'projects' | 'workload'>('projects');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'web-development',
    status: 'planned',
    priority: 'medium',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.category) params.set('category', filter.category);
    if (filter.status) params.set('status', filter.status);
    
    Promise.all([
      fetch(`/api/portfolio?${params.toString()}`).then(r => r.json()),
      fetch('/api/tasks').then(r => r.json()),
    ]).then(([portfolioData, tasksData]) => {
      setPortfolio(Array.isArray(portfolioData) ? portfolioData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filter]);

  const workload = useMemo(() => {
    const map = new Map<string, { user: any; projects: any[]; tasks: any[]; completed: number; active: number; total: number }>();
    portfolio.forEach((p: any) => {
      if (!p.assignedUser) return;
      const uid = p.assignedUser.id;
      if (!map.has(uid)) {
        map.set(uid, { user: p.assignedUser, projects: [], tasks: [], completed: 0, active: 0, total: 0 });
      }
      const entry = map.get(uid)!;
      entry.projects.push(p);
      entry.total++;
      if (p.status === 'complete') entry.completed++;
      else entry.active++;
    });
    tasks.forEach((t: any) => {
      if (!t.assignedUser) return;
      const uid = t.assignedUser.id;
      if (!map.has(uid)) {
        map.set(uid, { user: t.assignedUser, projects: [], tasks: [], completed: 0, active: 0, total: 0 });
      }
      const entry = map.get(uid)!;
      entry.tasks.push(t);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [portfolio, tasks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const item = await res.json();
        setPortfolio(prev => [item, ...prev]);
        setShowCreate(false);
        setForm({ title: '', description: '', category: 'web-development', status: 'planned', priority: 'medium' });
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
    setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-black text-gray-900">Projects</h1>
            <p className="text-gray-500 text-sm mt-1">Manage agency projects and track progress</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">+ New Project</button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          <button onClick={() => setView('projects')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${view === 'projects' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Projects</button>
          <button onClick={() => setView('workload')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${view === 'workload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Team Workload</button>
        </div>

        {view === 'projects' ? (<>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={filter.category}
            onChange={(e) => setFilter(f => ({ ...f, category: e.target.value }))}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : portfolio.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">📁</div>
            <div className="font-heading font-bold text-gray-900 mb-1">No Projects Yet</div>
            <div className="text-gray-500 text-sm mb-4">Create your first project to get started.</div>
            <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ New Project</button>
          </div>
        ) : (
          <div className="space-y-3">
            {portfolio.map((item) => {
              const statusOpt = STATUS_OPTIONS.find(s => s.value === item.status);
              const categoryOpt = CATEGORY_OPTIONS.find(c => c.value === item.category);
              return (
                <div key={item.id} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{categoryOpt?.icon || '📁'}</span>
                      <div>
                        <h3 className="font-heading font-bold text-gray-900">{item.title}</h3>
                        <p className="text-xs text-gray-500">{item.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusOpt?.color || 'bg-gray-100 text-gray-700'}`}>
                        {statusOpt?.label || item.status}
                      </span>
                      <Link href={`/developer/portfolio/${item.id}`} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        View
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full" style={{ width: `${item.completionPercent || 0}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{item.completionPercent || 0}%</span>
                    {item.assignedUser && (
                      <span className="text-xs text-gray-500">by {item.assignedUser.name}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>
        ) : (
          /* Team Workload View */
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Team Workload — What is everyone working on?</h2>
            {workload.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">👥</div>
                <div className="font-heading font-bold text-gray-900 mb-1">No Assignments Yet</div>
                <div className="text-gray-500 text-sm">Tasks and projects will appear here once assigned.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {workload.map(({ user, projects: userProjects, tasks: userTasks }) => (
                  <div key={user.id} className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-cyan-400 flex items-center justify-center text-white font-heading font-bold text-sm">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-gray-900">{user.name}</h3>
                          <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                        </div>
                      </div>
                    </div>
                    {userProjects.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-gray-500 mb-2">Projects ({userProjects.length})</div>
                        <div className="space-y-1.5">
                          {userProjects.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between text-xs py-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  p.status === 'complete' ? 'bg-emerald-500' :
                                  p.status === 'in-progress' ? 'bg-amber-500' : 'bg-gray-300'
                                }`}></div>
                                <span className="text-gray-700">{p.title}</span>
                              </div>
                              <span className="text-gray-400">{p.completionPercent || 0}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {userTasks.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-2">Tasks ({userTasks.length})</div>
                        <div className="space-y-1.5">
                          {userTasks.slice(0, 5).map((task: any) => (
                            <div key={task.id} className="flex items-center justify-between text-xs py-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  task.status === 'completed' ? 'bg-emerald-500' :
                                  task.status === 'in-progress' ? 'bg-amber-500' : 'bg-gray-300'
                                }`}></div>
                                <span className="text-gray-700">{task.title}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-semibold ${
                                task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>{task.status}</span>
                            </div>
                          ))}
                          {userTasks.length > 5 && (
                            <div className="text-xs text-gray-400">+{userTasks.length - 5} more tasks</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-gray-900 text-lg">New Project</h3>
                  <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Project Name *</label>
                  <input
                    type="text" value={form.title} required
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    placeholder="e.g. Website Redesign"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    rows={3}
                    placeholder="Brief project description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    >
                      {CATEGORY_OPTIONS.map(c => (
                        <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Priority</label>
                    <select
                      value={form.priority}
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
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
    </div>
  );
}
