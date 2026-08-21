'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface ContractorWorkforce {
  id: string;
  name: string;
  businessName: string;
  role: string;
  allRoles: string[];
  status: string;
  trainingProgress: number;
  totalSteps: number;
  completedSteps: number;
  totalLessons: number;
  completedLessons: number;
  githubVerified: boolean;
  slackVerified: boolean;
  currentProject: string | null;
  activeTasks: number;
  readiness: 'ready' | 'in_training' | 'not_started';
}

interface WorkforceStats {
  total: number;
  ready: number;
  inTraining: number;
  notStarted: number;
}

const READINESS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  ready: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', label: 'Ready' },
  in_training: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', label: 'In Training' },
  not_started: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Not Started' },
};

const ROLE_LABELS: Record<string, string> = {
  photography: 'Photography',
  videography: 'Videography',
  'social-media': 'Social Media',
  designer: 'Designer',
  'ai-automation': 'AI Automation',
  'web-designer': 'Web Designer',
  developer: 'Developer',
  copywriter: 'Copywriter',
  'motion-designer': 'Motion Designer',
  'virtual-assistant': 'Virtual Assistant',
  'marketing-specialist': 'Marketing Specialist',
  'podcast-editor': 'Podcast Editor',
};

export default function WorkforcePage() {
  const router = useRouter();
  const [workforce, setWorkforce] = useState<ContractorWorkforce[]>([]);
  const [stats, setStats] = useState<WorkforceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ready' | 'in_training' | 'not_started'>('all');

  const loadWorkforce = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/workforce');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setWorkforce(data.workforce);
      setStats(data.stats);
    } catch {
      console.error('Failed to load workforce data');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const user = JSON.parse(stored);
    if (user.role !== 'admin' && user.role !== 'staff') { router.push('/login'); return; }
    loadWorkforce();
  }, [router, loadWorkforce]);

  const filtered = filter === 'all' ? workforce : workforce.filter(c => c.readiness === filter);

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <main className="ml-64 flex-1">
        <div className="max-w-[1200px] mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-white">Workforce Dashboard</h1>
            <p className="text-white/50 text-sm mt-1">Contractor readiness, training progress, and project assignments</p>
          </div>

          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Total Contractors</div>
                <div className="text-white text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                <div className="text-emerald-400 text-xs uppercase tracking-wide mb-1">Ready for Work</div>
                <div className="text-emerald-400 text-2xl font-bold">{stats.ready}</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                <div className="text-amber-400 text-xs uppercase tracking-wide mb-1">In Training</div>
                <div className="text-amber-400 text-2xl font-bold">{stats.inTraining}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Not Started</div>
                <div className="text-white text-2xl font-bold">{stats.notStarted}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-6">
            {(['all', 'ready', 'in_training', 'not_started'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-miami-pink text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                {f === 'all' ? 'All' : f === 'in_training' ? 'In Training' : f === 'not_started' ? 'Not Started' : 'Ready'}
                {f !== 'all' && stats && (
                  <span className="ml-1.5 text-xs opacity-70">
                    {f === 'ready' ? stats.ready : f === 'in_training' ? stats.inTraining : stats.notStarted}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-white/40">Loading workforce data...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              {filter === 'all' ? 'No contractors found.' : `No contractors with status "${READINESS_CONFIG[filter]?.label}".`}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Contractor</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Role</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Training</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Integrations</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Project</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Tasks</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium text-xs uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => {
                      const readiness = READINESS_CONFIG[c.readiness];
                      return (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-5 py-4">
                            <div className="text-white font-medium">{c.name}</div>
                            <div className="text-white/40 text-xs">{c.businessName}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1">
                              {c.allRoles.map(r => (
                                <span key={r} className="px-2 py-0.5 bg-white/10 rounded text-white/70 text-xs">
                                  {ROLE_LABELS[r] || r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    c.trainingProgress === 100 ? 'bg-emerald-500' : c.trainingProgress > 0 ? 'bg-amber-500' : 'bg-white/20'
                                  }`}
                                  style={{ width: `${c.trainingProgress}%` }}
                                />
                              </div>
                              <span className="text-white/50 text-xs">
                                {c.completedLessons}/{c.totalLessons} lessons
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              <span className={`text-xs ${c.githubVerified ? 'text-emerald-400' : 'text-white/30'}`}>
                                GH {c.githubVerified ? '✓' : '—'}
                              </span>
                              <span className={`text-xs ${c.slackVerified ? 'text-emerald-400' : 'text-white/30'}`}>
                                SL {c.slackVerified ? '✓' : '—'}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-white/60 text-xs">
                            {c.currentProject || '—'}
                          </td>
                          <td className="px-5 py-4 text-white/60 text-xs">
                            {c.activeTasks > 0 ? `${c.activeTasks} active` : '—'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${readiness.bg} ${readiness.text}`}>
                              {readiness.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
