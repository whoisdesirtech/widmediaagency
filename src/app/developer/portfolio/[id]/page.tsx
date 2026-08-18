'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  'web-development': '🌐', 'ai-agent': '🤖', 'automation': '⚙️', 'seo': '🔍',
  'social-media': '📱', 'brand-kit': '🎨', 'influencer-audit': '📊',
  'media-production': '🎬', 'data': '📈', 'marketing': '📣', 'internal-tool': '🛠️',
};

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/portfolio/${params.id}`).then(r => r.json()),
      fetch(`/api/tasks?projectId=${params.id}`).then(r => r.json()),
    ]).then(([p, t]) => {
      setItem(p);
      setTasks(Array.isArray(t) ? t : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Delete this portfolio item?')) return;
    const res = await fetch(`/api/portfolio/${params.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/developer/portfolio');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!item || item.error) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">📁</div>
        <div className="font-heading font-bold text-gray-900">Portfolio Item Not Found</div>
        <Link href="/developer/portfolio" className="text-pink-600 text-sm mt-2 inline-block">← Back to Portfolio</Link>
      </div>
    );
  }

  let technologies: string[] = [];
  let skills: string[] = [];
  let deliverables: string[] = [];
  try { technologies = JSON.parse(item.technologies || '[]'); } catch {}
  try { skills = JSON.parse(item.skillsDemonstrated || '[]'); } catch {}
  try { deliverables = JSON.parse(item.deliverables || '[]'); } catch {}

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/developer/portfolio" className="text-gray-400 hover:text-gray-600 text-sm">← Portfolio</Link>

        {/* Header */}
        <div className="flex items-start justify-between mt-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{CATEGORY_ICONS[item.category] || '📁'}</span>
            <div>
              <h1 className="font-heading text-2xl font-black text-gray-900">{item.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700'}`}>
                  {item.status}
                </span>
                <span className="text-xs text-gray-500">{item.category?.replace('-', ' ')}</span>
                {item.assignedUser && <span className="text-xs text-gray-500">by {item.assignedUser.name}</span>}
              </div>
            </div>
          </div>
          <button onClick={handleDelete} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
        </div>

        {/* Completion */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Completion</span>
            <span className="text-sm font-bold text-gray-900">{item.completionPercent || 0}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full" style={{ width: `${item.completionPercent || 0}%` }} />
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="glass-card p-6 mb-6">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        )}

        {/* Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {item.startDate && (
            <div className="glass-card p-4">
              <div className="text-xs text-gray-500">Start Date</div>
              <div className="text-sm font-semibold text-gray-900">{new Date(item.startDate).toLocaleDateString()}</div>
            </div>
          )}
          {item.completionDate && (
            <div className="glass-card p-4">
              <div className="text-xs text-gray-500">Completed</div>
              <div className="text-sm font-semibold text-gray-900">{new Date(item.completionDate).toLocaleDateString()}</div>
            </div>
          )}
          <div className="glass-card p-4">
            <div className="text-xs text-gray-500">Priority</div>
            <div className="text-sm font-semibold text-gray-900 capitalize">{item.priority}</div>
          </div>
          {item.githubRepo && (
            <div className="glass-card p-4">
              <div className="text-xs text-gray-500">GitHub</div>
              <a href={item.githubRepo} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-600 hover:underline truncate block">{item.githubRepo}</a>
            </div>
          )}
          {item.liveUrl && (
            <div className="glass-card p-4">
              <div className="text-xs text-gray-500">Live URL</div>
              <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-600 hover:underline truncate block">{item.liveUrl}</a>
            </div>
          )}
        </div>

        {/* Technologies */}
        {technologies.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {technologies.map((t: string, i: number) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Skills Demonstrated</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s: string, i: number) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Deliverables */}
        {deliverables.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Deliverables</h3>
            <div className="space-y-1">
              {deliverables.map((d: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-cyan-500">•</span> {d}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Tasks */}
        {tasks.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Related Tasks ({tasks.length})</h3>
            <div className="space-y-2">
              {tasks.map((task: any) => (
                <Link key={task.id} href={`/developer/tasks`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-900">{task.title}</span>
                  </div>
                  <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${
                    task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{task.status}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="glass-card p-5">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
