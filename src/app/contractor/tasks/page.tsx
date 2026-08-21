'use client';

import { useState, useEffect, useCallback } from 'react';
import ContractorSidebar from '@/components/ContractorSidebar';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  contractorId?: string;
  contractorRoles?: string[];
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  project: { id: string; name: string; status: string } | null;
  reviews: { status: string; feedback: string | null }[];
}

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

export default function ContractorTasksPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/contractor/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      const res = await fetch(`/api/contractor/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) loadTasks();
    } catch { /* ignore */ }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="flex min-h-screen bg-dark">
      <ContractorSidebar user={user ? { name: user.name, email: user.email } : undefined} contractorRoles={user?.contractorRoles} />
      <main className="ml-64 flex-1">
        <div className="max-w-[1000px] mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-white">My Tasks</h1>
            <p className="text-white/50 text-sm mt-1">
              {activeTasks.length} active · {completedTasks.length} completed
            </p>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {(['all', 'pending', 'in_progress', 'in_review', 'completed', 'blocked'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-miami-pink text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-white/40">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              {filter === 'all' ? 'No tasks assigned to you yet.' : `No ${STATUS_CONFIG[filter]?.label || filter} tasks.`}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(task => {
                const st = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                const pr = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const canStart = task.status === 'pending';
                const canSubmit = task.status === 'in_progress';
                const canRevise = task.status === 'blocked';
                const canMarkBlocked = task.status === 'in_progress';

                return (
                  <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
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
                          {task.dueDate && <span>📅 Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                        {task.reviews.length > 0 && task.reviews[0].feedback && (
                          <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-white/50 text-xs">Latest review: </span>
                            <span className="text-white/70 text-xs">{task.reviews[0].feedback}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {canStart && (
                          <button onClick={() => handleStatusChange(task, 'in_progress')} className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors">
                            Start
                          </button>
                        )}
                        {canSubmit && (
                          <>
                            <button onClick={() => handleStatusChange(task, 'in_review')} className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-colors">
                              Submit for Review
                            </button>
                            <button onClick={() => handleStatusChange(task, 'blocked')} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors">
                              Blocked
                            </button>
                          </>
                        )}
                        {canRevise && (
                          <button onClick={() => handleStatusChange(task, 'in_progress')} className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors">
                            Revise
                          </button>
                        )}
                      </div>
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
