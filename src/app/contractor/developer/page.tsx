'use client';

import React, { useEffect, useState } from 'react';
import ContractorSidebar from '@/components/ContractorSidebar';
import HtmlRenderer from '@/components/HtmlRenderer';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  contractorId?: string;
  contractorRole?: string;
  contractorRoles?: string[];
}

const QUICK_LINKS = [
  { label: 'GitHub Repo', url: 'https://github.com/whoisdesirtech/widmediaagency', icon: '🐙', desc: 'Clone, push, and manage code' },
  { label: 'Vercel Dashboard', url: 'https://vercel.com', icon: '🚀', desc: 'Deploy previews and production' },
  { label: 'Supabase Dashboard', url: 'https://supabase.com', icon: '🗄️', desc: 'Database and SQL editor' },
  { label: 'Knowledge Base', url: '/knowledge-base', icon: '📚', desc: 'Public docs and lessons' },
  { label: 'Developer Docs', url: '/developer', icon: '💻', desc: 'Tech stack and API reference' },
];

const ENV_VARS = [
  { name: 'DATABASE_URL', desc: 'PostgreSQL connection string (Supabase)', required: true },
  { name: 'DIRECT_URL', desc: 'Direct DB connection (bypasses connection pooler)', required: true },
  { name: 'NEXTAUTH_SECRET', desc: 'Random string for session encryption', required: true },
  { name: 'NEXTAUTH_URL', desc: 'Base URL (http://localhost:3000 for dev)', required: true },
  { name: 'GOOGLE_SERVICE_ACCOUNT_EMAIL', desc: 'Service account email for Drive API', required: false },
  { name: 'GOOGLE_PRIVATE_KEY', desc: 'Service account private key (with \\n escapes)', required: false },
];

const WORKFLOW = [
  { step: '1', title: 'Pull latest main', cmd: 'git pull origin main', desc: 'Always start with the latest code' },
  { step: '2', title: 'Create feature branch', cmd: 'git checkout -b feat/your-feature-name', desc: 'Never work directly on main' },
  { step: '3', title: 'Make your changes', cmd: 'npm run dev', desc: 'Local dev server on localhost:3000' },
  { step: '4', title: 'Typecheck', cmd: 'npm run typecheck', desc: 'Must pass before committing' },
  { step: '5', title: 'Commit & push', cmd: 'git add . && git commit -m "feat: description" && git push origin feat/your-feature-name', desc: 'Conventional commit messages' },
  { step: '6', title: 'Open PR', cmd: 'gh pr create', desc: 'PR → review → merge to main' },
];

export default function DeveloperWorkspacePage() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    setUser(JSON.parse(stored));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} contractorRoles={user?.contractorRoles} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-dark mb-1">💻 Developer Workspace</h1>
            <p className="text-sm text-muted">Resources, setup guides, and workflow for vibe coding contributors</p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="glass-card p-4 text-center hover:shadow-md transition-shadow group"
              >
                <div className="text-2xl mb-2">{link.icon}</div>
                <div className="font-heading font-bold text-dark-800 text-sm mb-0.5">{link.label}</div>
                <div className="text-[0.65rem] text-muted">{link.desc}</div>
              </a>
            ))}
          </div>

          <div className="space-y-8">
            {/* Workflow */}
            <section className="rounded-2xl border border-muted-lighter bg-white p-6">
              <h2 className="font-heading text-lg font-bold text-dark mb-4">Git Workflow</h2>
              <div className="space-y-3">
                {WORKFLOW.map((w) => (
                  <div key={w.step} className="flex items-start gap-4 p-3 rounded-xl bg-[#F8F9FC]">
                    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{w.step}</div>
                    <div className="flex-1">
                      <div className="font-heading font-bold text-dark-800 text-sm">{w.title}</div>
                      <div className="text-xs text-muted mb-1">{w.desc}</div>
                      <code className="text-xs bg-dark text-miami-blue-light px-3 py-1 rounded-lg font-mono inline-block">{w.cmd}</code>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Environment Variables */}
            <section className="rounded-2xl border border-muted-lighter bg-white p-6">
              <h2 className="font-heading text-lg font-bold text-dark mb-2">Environment Variables</h2>
              <p className="text-xs text-muted mb-4">Copy <code className="bg-[#F8F9FC] px-1.5 py-0.5 rounded">.env.example</code> to <code className="bg-[#F8F9FC] px-1.5 py-0.5 rounded">.env</code> and fill in values.</p>
              <div className="space-y-2">
                {ENV_VARS.map((v) => (
                  <div key={v.name} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F9FC]">
                    <code className="text-xs font-mono font-bold text-dark-800 min-w-[200px]">{v.name}</code>
                    <span className="text-xs text-muted flex-1">{v.desc}</span>
                    {v.required ? (
                      <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-miami-pink/10 text-miami-pink">Required</span>
                    ) : (
                      <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-white/50 text-muted">Optional</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Dev Guide */}
            <section className="rounded-2xl border border-muted-lighter bg-white overflow-hidden">
              <div className="p-6 border-b border-muted-lighter">
                <h2 className="font-heading text-lg font-bold text-dark">Full Developer Guide</h2>
                <p className="text-xs text-muted mt-1">Complete onboarding, setup instructions, and contribution guidelines</p>
              </div>
              <HtmlRenderer src="/developer-training.html" />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
