'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  'planned': 'bg-gray-100 text-gray-700',
  'assigned': 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  'review': 'bg-indigo-100 text-indigo-700',
  'completed': 'bg-emerald-100 text-emerald-700',
  'archived': 'bg-gray-100 text-gray-500',
};

const CATEGORY_ICONS: Record<string, string> = {
  'web-development': '🌐',
  'ai-agent': '🤖',
  'automation': '⚙️',
  'seo': '🔍',
  'social-media': '📱',
  'brand-kit': '🎨',
  'influencer-audit': '📊',
  'media-production': '🎬',
  'data': '📈',
  'marketing': '📣',
  'internal-tool': '🛠️',
};

export default function DeveloperPortfolioPage() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [view, setView] = useState<'overview' | 'workload'>('overview');

  useEffect(() => {
    Promise.all([
      fetch('/api/portfolio').then(r => r.json()),
      fetch('/api/tasks').then(r => r.json()),
    ]).then(([p, t]) => {
      setPortfolio(Array.isArray(p) ? p : []);
      setTasks(Array.isArray(t) ? t : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Get unique people from tasks
  const people = useMemo(() => {
    const map = new Map<string, { id: string; name: string; role: string }>();
    tasks.forEach((t: any) => {
      if (t.assignedUser && !map.has(t.assignedUser.id)) {
        map.set(t.assignedUser.id, t.assignedUser);
      }
    });
    return Array.from(map.values());
  }, [tasks]);

  // Filtered data
  const filteredPortfolio = useMemo(() => {
    return portfolio.filter(item => {
      if (search && !item.title?.toLowerCase().includes(search.toLowerCase()) && !item.description?.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      if (personFilter && item.assignedUserId !== personFilter) return false;
      return true;
    });
  }, [portfolio, search, statusFilter, categoryFilter, personFilter]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (search && !task.title?.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && task.status !== statusFilter) return false;
      if (personFilter && task.assignedUserId !== personFilter) return false;
      return true;
    });
  }, [tasks, search, statusFilter, personFilter]);

  // Workload per person
  const workload = useMemo(() => {
    const map = new Map<string, { user: any; tasks: any[]; completed: number; active: number; total: number }>();
    tasks.forEach((t: any) => {
      if (!t.assignedUser) return;
      const uid = t.assignedUser.id;
      if (!map.has(uid)) {
        map.set(uid, { user: t.assignedUser, tasks: [], completed: 0, active: 0, total: 0 });
      }
      const entry = map.get(uid)!;
      entry.tasks.push(t);
      entry.total++;
      if (t.status === 'completed' || t.status === 'approved') entry.completed++;
      else entry.active++;
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [tasks]);

  const stats = {
    totalProjects: portfolio.length,
    activeProjects: portfolio.filter((i: any) => i.status === 'in-progress').length,
    completedProjects: portfolio.filter((i: any) => i.status === 'completed').length,
    projectsInReview: portfolio.filter((i: any) => i.status === 'review').length,
    openTasks: tasks.filter((t: any) => !['completed', 'approved'].includes(t.status)).length,
    completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-black text-gray-900">Developer Portfolio</h1>
            <p className="text-gray-500 text-sm mt-1">Track projects, tasks, and completed work across the agency</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('overview')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${view === 'overview' ? 'bg-pink-50 text-pink-700' : 'text-gray-500 hover:bg-gray-50'}`}>Overview</button>
            <button onClick={() => setView('workload')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${view === 'workload' ? 'bg-pink-50 text-pink-700' : 'text-gray-500 hover:bg-gray-50'}`}>Team Workload</button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search projects, tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm"
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm">
              <option value="">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm">
              <option value="">All Categories</option>
              {Object.keys(CATEGORY_ICONS).map(c => (
                <option key={c} value={c}>{c.replace('-', ' ')}</option>
              ))}
            </select>
            <select value={personFilter} onChange={e => setPersonFilter(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm">
              <option value="">All People</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: stats.totalProjects, color: 'text-gray-900' },
            { label: 'Active', value: stats.activeProjects, color: 'text-amber-600' },
            { label: 'Completed', value: stats.completedProjects, color: 'text-emerald-600' },
            { label: 'In Review', value: stats.projectsInReview, color: 'text-indigo-600' },
            { label: 'Open Tasks', value: stats.openTasks, color: 'text-blue-600' },
            { label: 'Tasks Done', value: stats.completedTasks, color: 'text-emerald-600' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4">
              <div className={`font-heading font-black text-2xl ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {view === 'overview' ? (
          <>
            {/* Portfolio Items */}
            <div className="mb-8">
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Portfolio Items ({filteredPortfolio.length})</h2>
              {filteredPortfolio.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <div className="text-4xl mb-3">📁</div>
                  <div className="font-heading font-bold text-gray-900 mb-1">No Portfolio Items</div>
                  <div className="text-gray-500 text-sm">Try adjusting your filters.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPortfolio.map((item) => (
                    <Link key={item.id} href={`/developer/portfolio/${item.id}`} className="glass-card p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{CATEGORY_ICONS[item.category] || '📁'}</span>
                        <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700'}`}>
                          {item.status}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description || 'No description'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{item.category?.replace('-', ' ')}</span>
                        {item.assignedUser && (
                          <span className="text-xs text-gray-500">by {item.assignedUser.name}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks */}
            <div>
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Tasks ({filteredTasks.length})</h2>
              {filteredTasks.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <div className="font-heading font-bold text-gray-900 mb-1">No Tasks</div>
                  <div className="text-gray-500 text-sm">Try adjusting your filters.</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.slice(0, 10).map((task) => (
                    <div key={task.id} className="glass-card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-emerald-500' :
                          task.status === 'in-progress' ? 'bg-amber-500' :
                          task.status === 'needs-revision' ? 'bg-red-500' :
                          'bg-gray-300'
                        }`}></div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
                          <p className="text-xs text-gray-500">{task.project?.name || 'No project'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{task.priority}</span>
                        {task.assignedUser && (
                          <span className="text-xs text-gray-500">{task.assignedUser.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Team Workload View */
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Team Workload — What is everyone working on?</h2>
            {workload.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">👥</div>
                <div className="font-heading font-bold text-gray-900 mb-1">No Assignments Yet</div>
                <div className="text-gray-500 text-sm">Tasks will appear here once assigned to team members.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {workload.map(({ user, tasks: userTasks, completed, active, total }) => (
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
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">{total} total</span>
                        <span className="text-emerald-600 font-semibold">{completed} done</span>
                        <span className="text-amber-600 font-semibold">{active} active</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }} />
                    </div>
                    <div className="space-y-1.5">
                      {userTasks.slice(0, 5).map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              task.status === 'completed' ? 'bg-emerald-500' :
                              task.status === 'in-progress' ? 'bg-amber-500' :
                              'bg-gray-300'
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
