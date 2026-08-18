'use client';

import React, { useEffect, useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'not-started', label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
  { value: 'assigned', label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { value: 'submitted', label: 'Submitted', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'needs-revision', label: 'Needs Revision', color: 'bg-red-100 text-red-700' },
  { value: 'approved', label: 'Approved', color: 'bg-purple-100 text-purple-700' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

export default function DeveloperTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '', search: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedUserId: '',
    priority: 'medium',
    dueDate: '',
    estimatedEffort: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/portfolio').then(r => r.json()),
      fetch('/api/contractors').then(r => r.json()),
    ]).then(([t, p, u]) => {
      setTasks(Array.isArray(t) ? t : []);
      setProjects(Array.isArray(p) ? p : []);
      setUsers(Array.isArray(u) ? u : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (filter.status && task.status !== filter.status) return false;
    if (filter.priority && task.priority !== filter.priority) return false;
    if (filter.search && !task.title?.toLowerCase().includes(filter.search.toLowerCase()) && !task.description?.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const task = await res.json();
        setTasks(prev => [task, ...prev]);
        setShowCreate(false);
        setForm({ title: '', description: '', projectId: '', assignedUserId: '', priority: 'medium', dueDate: '', estimatedEffort: '' });
      }
    } catch {}
    setSaving(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-black text-gray-900">Tasks</h1>
            <p className="text-gray-500 text-sm mt-1">Track assigned work and deliverables</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">+ New Task</button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            value={filter.search || ''}
            onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm"
          />
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
          <select
            value={filter.priority}
            onChange={(e) => setFilter(f => ({ ...f, priority: e.target.value }))}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm"
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <div className="font-heading font-bold text-gray-900 mb-1">No Tasks Yet</div>
            <div className="text-gray-500 text-sm mb-4">Create your first task to get started.</div>
            <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">+ New Task</button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const statusOpt = STATUS_OPTIONS.find(s => s.value === task.status);
              const priorityOpt = PRIORITY_OPTIONS.find(p => p.value === task.priority);
              return (
                <div key={task.id} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-emerald-500' :
                        task.status === 'in-progress' ? 'bg-amber-500' :
                        task.status === 'needs-revision' ? 'bg-red-500' :
                        'bg-gray-300'
                      }`}></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
                        <p className="text-xs text-gray-500">{task.project?.name || 'No project'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${priorityOpt?.color || 'bg-gray-100 text-gray-700'}`}>
                        {priorityOpt?.label || task.priority}
                      </span>
                      {task.assignedUser && (
                        <span className="text-xs text-gray-500">{task.assignedUser.name}</span>
                      )}
                      <button onClick={() => handleDelete(task.id)} className="px-2 py-1 text-red-500 hover:text-red-700 text-xs">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-gray-900 text-lg">New Task</h3>
                  <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Task Title *</label>
                  <input
                    type="text" value={form.title} required
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    placeholder="e.g. Create brand kit for influencer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    rows={3}
                    placeholder="Task details"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Project</label>
                    <select
                      value={form.projectId}
                      onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    >
                      <option value="">No project</option>
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Assign To</label>
                    <select
                      value={form.assignedUserId}
                      onChange={e => setForm(f => ({ ...f, assignedUserId: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.name || u.email}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Priority</label>
                    <select
                      value={form.priority}
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    >
                      {PRIORITY_OPTIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Due Date</label>
                    <input
                      type="date" value={form.dueDate}
                      onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Est. Effort</label>
                    <input
                      type="text" value={form.estimatedEffort}
                      onChange={e => setForm(f => ({ ...f, estimatedEffort: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm"
                      placeholder="e.g. 2h"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                    {saving ? 'Creating...' : 'Create Task'}
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
