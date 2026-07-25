'use client';

import React, { useEffect, useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

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

const STATUS_LABELS: Record<string, string> = {
  'planning': '🟢 Planning',
  'in-progress': '🟡 In Progress',
  'review': '🔵 Review',
  'complete': '✅ Complete',
};

export default function ClientProjectsPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.clientId) {
      fetch(`/api/projects?clientId=${u.clientId}`)
        .then(r => r.json())
        .then(data => { setProjects(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">My Projects</h1>
            <p className="text-muted text-sm mt-1">Track progress, timelines, and deliverables for each project</p>
          </div>

          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">📁</div>
              <div className="font-heading font-bold text-dark-800 mb-1">No Projects Yet</div>
              <div className="text-muted text-sm">Your agency will add projects to your portal soon.</div>
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
                      <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status]}`}>
                        {STATUS_LABELS[project.status]}
                      </span>
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
    </div>
  );
}
