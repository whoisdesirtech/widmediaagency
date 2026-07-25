'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientSidebar from '@/components/ClientSidebar';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  clientId?: string;
}

interface ClientData {
  id: string;
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  googleDriveFolderId?: string;
  googleDriveFolderUrl?: string;
  status: string;
}

const MOCK_PROJECTS = [
  { name: 'Website Redesign', status: 'in-progress', progress: 60, icon: '🌐' },
  { name: 'Brand Photoshoot', status: 'planning', progress: 15, icon: '📸' },
  { name: 'Social Media Content', status: 'review', progress: 85, icon: '📱' },
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

const FOLDERS = [
  { name: 'Photography', icon: '📸', count: 24 },
  { name: 'Videos', icon: '🎬', count: 8 },
  { name: 'Website Files', icon: '🌐', count: 12 },
  { name: 'Logos', icon: '🎨', count: 6 },
  { name: 'Brand Assets', icon: '✨', count: 15 },
  { name: 'Documents', icon: '📁', count: 9 },
  { name: 'Contracts', icon: '📄', count: 3 },
];

const TIMELINE = [
  { label: 'Upcoming Shoot', date: 'Jul 28, 2026', icon: '📸', color: 'bg-miami-pink' },
  { label: 'Editing Phase', date: 'Aug 2, 2026', icon: '🎬', color: 'bg-miami-blue-light' },
  { label: 'Website Launch', date: 'Aug 15, 2026', icon: '🌐', color: 'bg-emerald-500' },
  { label: 'Content Delivery', date: 'Aug 20, 2026', icon: '📦', color: 'bg-amber-500' },
];

export default function ClientDashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.clientId) {
      fetch(`/api/clients/${u.clientId}`)
        .then(r => r.json())
        .then(data => { setClient(data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main>
    </div>
  );

  if (!client) return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">🔗</div>
          <div className="font-heading font-bold text-dark-800 mb-1">No Client Profile</div>
          <div className="text-muted text-sm">Your account is not linked to a client profile. Contact your agency admin.</div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">

          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-black text-dark-800">Welcome back, {client.name} 👋</h1>
            <p className="text-muted text-sm mt-1">Here&apos;s what&apos;s happening with your projects today.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-muted text-xs font-semibold mb-1">Active Projects</div>
                  <div className="font-heading text-3xl font-black text-dark-800">3</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-miami-pink to-miami-blue-light flex items-center justify-center text-white text-lg">📁</div>
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-muted text-xs font-semibold mb-1">Pending Approvals</div>
                  <div className="font-heading text-3xl font-black text-dark-800">2</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-lg">⏳</div>
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-muted text-xs font-semibold mb-1">Media Files</div>
                  <div className="font-heading text-3xl font-black text-dark-800">77</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-lg">🖼️</div>
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-muted text-xs font-semibold mb-1">Messages</div>
                  <div className="font-heading text-3xl font-black text-dark-800">4</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-lg">💬</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Current Projects */}
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-dark-800">Current Projects</h3>
                <Link href="/client/projects" className="text-miami-pink text-xs font-semibold hover:underline">View All →</Link>
              </div>
              <div className="space-y-4">
                {MOCK_PROJECTS.map((project) => (
                  <Link key={project.name} href="/client/projects" className="block p-4 rounded-xl border border-muted-lighter hover:border-miami-pink/30 hover:bg-miami-pink/[0.02] transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{project.icon}</span>
                        <span className="font-semibold text-dark-800 text-sm">{project.name}</span>
                      </div>
                      <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status]}`}>
                        {STATUS_LABELS[project.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted-lighter rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-miami-pink to-miami-blue-light rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-dark-800">{project.progress}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Timeline</h3>
              <div className="space-y-4">
                {TIMELINE.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-white text-sm flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-dark-800">{item.label}</div>
                      <div className="text-xs text-muted">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Folders */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-dark-800">Files</h3>
                <Link href="/client/media" className="text-miami-pink text-xs font-semibold hover:underline">Open Gallery →</Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FOLDERS.map((folder) => (
                  <div key={folder.name} className="flex items-center gap-3 p-3 rounded-xl border border-muted-lighter hover:bg-white/80 transition-colors cursor-pointer">
                    <span className="text-lg">{folder.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-dark-800 truncate">{folder.name}</div>
                      <div className="text-[0.65rem] text-muted">{folder.count} files</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Approvals */}
              <div className="glass-card p-6">
                <h3 className="font-heading font-bold text-dark-800 mb-4">Approvals</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-muted-lighter">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-dark-800">Homepage Hero Image</span>
                      <span className="text-[0.65rem] text-muted">Website Redesign</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors">Approve</button>
                      <button className="px-3 py-1.5 bg-white border border-muted-lighter text-dark-800 text-xs font-semibold rounded-lg hover:bg-muted-lighter/30 transition-colors">Request Changes</button>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-muted-lighter">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-dark-800">Logo Concepts (v2)</span>
                      <span className="text-[0.65rem] text-muted">Brand Photoshoot</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors">Approve</button>
                      <button className="px-3 py-1.5 bg-white border border-muted-lighter text-dark-800 text-xs font-semibold rounded-lg hover:bg-muted-lighter/30 transition-colors">Request Changes</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="glass-card p-6">
                <h3 className="font-heading font-bold text-dark-800 mb-3">Contact Agency</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted">
                    <span>📞</span> <span>(305) 555-0100</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <span>✉️</span> <span>hello@whoisdesir.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <span>🕐</span> <span>Mon–Fri, 9AM–6PM EST</span>
                  </div>
                </div>
                <button className="btn-primary w-full justify-center text-sm mt-4">
                  📅 Book a Meeting
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
