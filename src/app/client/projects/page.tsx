'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientSidebar from '@/components/ClientSidebar';

const PROJECTS = [
  {
    name: 'Website Redesign',
    status: 'in-progress',
    progress: 60,
    icon: '🌐',
    description: 'Complete website overhaul with modern design, improved UX, and mobile-first approach.',
    timeline: [
      { label: 'Discovery', done: true },
      { label: 'Wireframes', done: true },
      { label: 'Homepage Design', done: true },
      { label: 'Development', done: false },
      { label: 'Launch', done: false },
    ],
    deliverables: 12,
    lastUpdate: '2 hours ago',
  },
  {
    name: 'Brand Photoshoot',
    status: 'planning',
    progress: 15,
    icon: '📸',
    description: 'Professional brand photography session for website, social media, and marketing materials.',
    timeline: [
      { label: 'Concept Development', done: true },
      { label: 'Location Scouting', done: false },
      { label: 'Photo Session', done: false },
      { label: 'Editing & Retouching', done: false },
      { label: 'Final Delivery', done: false },
    ],
    deliverables: 8,
    lastUpdate: '1 day ago',
  },
  {
    name: 'Social Media Content',
    status: 'review',
    progress: 85,
    icon: '📱',
    description: 'Monthly social media content package including posts, stories, and reels.',
    timeline: [
      { label: 'Content Strategy', done: true },
      { label: 'Content Creation', done: true },
      { label: 'Review & Revisions', done: true },
      { label: 'Scheduling', done: false },
      { label: 'Publishing', done: false },
    ],
    deliverables: 20,
    lastUpdate: '5 hours ago',
  },
];

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
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    setUser(JSON.parse(stored));
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

          <div className="grid grid-cols-1 gap-4">
            {PROJECTS.map((project) => (
              <div key={project.name} className="glass-card p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProject(selectedProject?.name === project.name ? null : project)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{project.icon}</span>
                    <div>
                      <h3 className="font-heading font-bold text-dark-800">{project.name}</h3>
                      <p className="text-xs text-muted">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status]}`}>
                      {STATUS_LABELS[project.status]}
                    </span>
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
                  <span>Updated {project.lastUpdate}</span>
                </div>

                {selectedProject?.name === project.name && (
                  <div className="mt-4 pt-4 border-t border-muted-lighter">
                    <h4 className="font-heading font-bold text-dark-800 text-sm mb-3">Timeline</h4>
                    <div className="space-y-2">
                      {project.timeline.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-muted-lighter text-muted'}`}>
                            {step.done ? '✓' : i + 1}
                          </div>
                          <span className={`text-sm ${step.done ? 'text-dark-800 font-semibold' : 'text-muted'}`}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link href="/client/deliverables" className="btn-primary text-xs">View Deliverables</Link>
                      <Link href="/client/media" className="btn-secondary text-xs">View Files</Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
