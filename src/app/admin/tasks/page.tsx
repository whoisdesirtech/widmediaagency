'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface Task {
  id: string;
  projectId: string;
  contractorId: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
  project: { id: string; name: string; status: string } | null;
  contractor: { id: string; name: string } | null;
  reviews: { status: string; feedback: string | null }[];
}

interface Project { id: string; name: string; }
interface Contractor { id: string; name: string; businessName: string; }

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Pending' },
  in_progress: { bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700', label: 'In Progress' },
  in_review: { bg: 'bg-purple-50 border border-purple-200', text: 'text-purple-700', label: 'In Review' },
  completed: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', label: 'Completed' },
  blocked: { bg: 'bg-red-50 border border-red-200', text: 'text-red-700', label: 'Blocked' },
};

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Low' },
  medium: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', label: 'Medium' },
  high: { bg: 'bg-orange-50 border border-orange-200', text: 'text-orange-700', label: 'High' },
  urgent: { bg: 'bg-red-50 border border-red-200', text: 'text-red-700', label: 'Urgent' },
};

export default function AdminTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', projectId: '', contractorId: '', priority: 'medium', dueDate: '' });

  const loadData = useCallback(async () => {
    try {
      const [projRes, contRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/contractors'),
      ]);
      const projData = await projRes.json();
      const contData = await contRes.json();
      setProjects(Array.isArray(projData) ? projData : []);
      setContractors(Array.isArray(contData) ? contData : []);

      const allTasks: Task[] = [];
      for (const p of Array.isArray(projData) ? projData : []) {
        try {
          const res = await fetch(`/api/projects/${p.id}/tasks`);
          if (res.ok) {
            const tasksData = await res.json();
            if (Array.isArray(tasksData)) {
              allTasks.push(...tasksData.map((t: Task) => ({
                ...t,
                project: { id: p.id, name: p.name, status: p.status },
              })));
            }
          }
        } catch { /* skip */ }
      }
      setTasks(allTasks);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const user = JSON.parse(stored);
    if (user.role !== 'admin' && user.role !== 'staff') { router.push('/login'); return; }
    loadData();
  }, [router, loadData]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.projectId) return;
    try {
      const res = await fetch(`/api/projects/${form.projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          contractorId: form.contractorId || null,
          priority: form.priority,
          dueDate: form.dueDate || null,
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ title: '', description: '', projectId: '', contractorId: '', priority: 'medium', dueDate: '' });
        loadData();
      }
    } catch { /* ignore */ }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await fetch(`/api/projects/${task.projectId}/tasks/${task.id}`, { method: 'DELETE' });
      loadData();
    } catch { /* ignore */ }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <main className="ml-64 flex-1">
        <div className="max-w-[1200px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">Task Management</h1>
              <p className="text-white/50 text-sm mt-1">Create, assign, and track tasks across all projects</p>
            </div>
            <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 rounded-lg bg-miami-pink text-white text-sm font-medium hover:opacity-90 transition-opacity">
              {showCreate ? 'Cancel' : '+ New Task'}
            </button>
          </div>

          {showCreate && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Create Task</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white/50 text-xs mb-1">Project *</label>
                  <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm">
                    <option value="">Select project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1">Assign to</label>
                  <select value={form.contractorId} onChange={e => setForm(f => ({ ...f, contractorId: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm">
                    <option value="">Unassigned</option>
                    {contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-white/50 text-xs mb-1">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm" placeholder="Task title..." />
              </div>
              <div className="mb-4">
                <label className="block text-white/50 text-xs mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm h-20 resize-none" placeholder="Optional description..." />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white/50 text-xs mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm" />
                </div>
              </div>
              <button onClick={handleCreate} disabled={!form.title.trim() || !form.projectId} className="px-4 py-2 rounded-lg bg-miami-pink text-white text-sm font-medium disabled:opacity-50">
                Create Task
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 mb-6">
            {(['all', 'pending', 'in_progress', 'in_review', 'completed', 'blocked'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-miami-pink text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
                {f !== 'all' && <span className="ml-1 opacity-70">{tasks.filter(t => t.status === f).length}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-white/40">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-white/40">No tasks found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(task => {
                const st = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                const pr = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                return (
                  <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium text-sm">{task.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>{st.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pr.bg} ${pr.text}`}>{pr.label}</span>
                        </div>
                        {task.description && <p className="text-white/40 text-xs mt-1">{task.description}</p>}
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                          {task.project && <span>📁 {task.project.name}</span>}
                          {task.contractor && <span>👤 {task.contractor.name}</span>}
                          {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                          {task.completedAt && <span>✅ {new Date(task.completedAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(task)} className="text-white/20 hover:text-red-400 text-sm ml-4">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
