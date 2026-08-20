'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import FullDeveloperTraining from '@/lib/training-content';
import InternTraining from '@/lib/training-content-intern';

type Tab = 'full' | 'intern' | 'quick' | 'progress';

interface ContractorInfo { id: string; name: string; businessName: string | null; }
interface ProgressAssignment {
  id: string;
  status: string;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  contractor: ContractorInfo;
  lesson: { id: string; slug: string; title: string; targetRole: string; requiresGithub: boolean; requiresSlack: boolean };
  steps: { stepId: string; status: string; completedAt: string | null }[];
  githubRepository: { repoName: string; repoUrl: string; status: string } | null;
  slackConnection: { slackEmail: string; slackRealName: string | null; status: string; verifiedAt: string | null } | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  assigned: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Not Started' },
  in_progress: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', label: 'In Progress' },
  completed: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', label: 'Completed' },
};

export default function DeveloperTrainingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('full');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const user = JSON.parse(stored);
    if (user.role !== 'admin' && user.role !== 'staff') { router.push('/login'); }
  }, [router]);

  const handleDownload = async (type: 'full' | 'intern') => {
    setDownloading(type);
    try {
      const res = await fetch(`/api/admin/training-doc/${type}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `developer-training-${type}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download PDF. Please try again.');
    }
    setDownloading(null);
  };

  const tabs: { key: Tab; label: string; description: string }[] = [
    { key: 'full', label: 'Full Developer Training', description: 'Complete documentation for senior/contractor developers' },
    { key: 'intern', label: 'Intern Training', description: 'Abbreviated guide for interns making small features' },
    { key: 'quick', label: 'Quick Reference', description: 'Auth patterns, commands, and gotchas — one page' },
    { key: 'progress', label: 'Contractor Progress', description: 'View all contractor training assignments and progress' },
  ];

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <main className="ml-64 flex-1">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold text-white mb-1">Developer Training Document</h1>
                <p className="text-sm text-white/50">
                  Choose a tier based on the developer&apos;s role and experience level
                </p>
              </div>
              {activeTab !== 'progress' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload('full')}
                    disabled={downloading === 'full'}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors disabled:opacity-50"
                  >
                    {downloading === 'full' ? 'Generating...' : '📥 Download Full PDF'}
                  </button>
                  <button
                    onClick={() => handleDownload('intern')}
                    disabled={downloading === 'intern'}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors disabled:opacity-50"
                  >
                    {downloading === 'intern' ? 'Generating...' : '📥 Download Intern PDF'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'gradient-bg text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab descriptions */}
          <div className="mb-6 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
            <p className="text-sm text-white/60">
              {tabs.find(t => t.key === activeTab)?.description}
            </p>
            {activeTab === 'intern' && (
              <p className="text-sm text-white/40 mt-2">
                Send this document directly to interns — they receive it as a file, not through the app.
              </p>
            )}
          </div>

          {/* Content */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
            {activeTab === 'full' && <FullDeveloperTraining />}
            {activeTab === 'intern' && <InternTraining />}
            {activeTab === 'quick' && <QuickReference />}
            {activeTab === 'progress' && <ContractorProgress />}
          </div>
        </div>
      </main>
    </div>
  );
}

function ContractorProgress() {
  const [assignments, setAssignments] = useState<ProgressAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterContractor, setFilterContractor] = useState<string>('');
  const [lessons, setLessons] = useState<{ id: string; slug: string; title: string }[]>([]);
  const [contractors, setContractors] = useState<ContractorInfo[]>([]);
  const [assignContractorId, setAssignContractorId] = useState('');
  const [assignLessonId, setAssignLessonId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadData = useCallback(() => {
    const url = filterContractor ? `/api/admin/training/progress?contractorId=${filterContractor}` : '/api/admin/training/progress';
    fetch(url)
      .then(r => r.json())
      .then(data => { setAssignments(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filterContractor]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    Promise.all([
      fetch('/api/training-lessons').then(r => r.json()),
      fetch('/api/contractors').then(r => r.json()),
    ]).then(([lessonsData, contractorsData]) => {
      if (Array.isArray(lessonsData)) setLessons(lessonsData);
      if (Array.isArray(contractorsData)) setContractors(contractorsData);
    }).catch(() => {});
  }, []);

  const handleAssign = async () => {
    if (!assignContractorId || !assignLessonId) return;
    setAssigning(true);
    try {
      const res = await fetch('/api/admin/training/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorId: assignContractorId, lessonId: assignLessonId }),
      });
      if (res.ok) {
        setAssignContractorId('');
        setAssignLessonId('');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to assign training');
      }
    } catch { alert('Failed to assign training'); }
    setAssigning(false);
  };

  return (
    <div className="space-y-8">
      {/* Assign New Training */}
      <section>
        <h3 className="font-heading text-lg font-bold text-white mb-4">Assign Training</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-white/50 mb-1">Contractor</label>
            <select
              value={assignContractorId}
              onChange={e => setAssignContractorId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">Select contractor...</option>
              {contractors.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.businessName ? ` (${c.businessName})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-white/50 mb-1">Lesson</label>
            <select
              value={assignLessonId}
              onChange={e => setAssignLessonId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">Select lesson...</option>
              {lessons.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAssign}
            disabled={assigning || !assignContractorId || !assignLessonId}
            className="px-5 py-2 gradient-bg text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {assigning ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </section>

      {/* Filter */}
      <div>
        <label className="block text-xs text-white/50 mb-1">Filter by contractor</label>
        <select
          value={filterContractor}
          onChange={e => setFilterContractor(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All contractors</option>
          {contractors.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Progress Table */}
      {loading ? (
        <p className="text-sm text-white/50">Loading...</p>
      ) : assignments.length === 0 ? (
        <p className="text-sm text-white/50">No training assignments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-3 text-white/70">Contractor</th>
                <th className="text-left py-3 px-3 text-white/70">Lesson</th>
                <th className="text-left py-3 px-3 text-white/70">Status</th>
                <th className="text-left py-3 px-3 text-white/70">Progress</th>
                <th className="text-left py-3 px-3 text-white/70">GitHub</th>
                <th className="text-left py-3 px-3 text-white/70">Slack</th>
                <th className="text-left py-3 px-3 text-white/70">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => {
                const style = STATUS_STYLES[a.status] || STATUS_STYLES.assigned;
                return (
                  <tr key={a.id} className="border-b border-white/5">
                    <td className="py-3 px-3 text-white/90 font-medium">{a.contractor.name}</td>
                    <td className="py-3 px-3 text-white/70">{a.lesson.title}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div className="h-2 rounded-full bg-miami-pink" style={{ width: `${a.progress}%` }} />
                        </div>
                        <span className="text-white/60 text-xs">{a.completedSteps}/{a.totalSteps}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {a.lesson.requiresGithub ? (
                        a.githubRepository ? (
                          a.githubRepository.status === 'created' || a.githubRepository.status === 'active' ? (
                            <a href={a.githubRepository.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-miami-blue-light hover:underline">
                              {a.githubRepository.repoName}
                            </a>
                          ) : a.githubRepository.status === 'error' ? (
                            <span className="text-xs text-red-400">Error</span>
                          ) : a.githubRepository.status === 'creating' ? (
                            <span className="text-xs text-blue-400">Creating...</span>
                          ) : (
                            <span className="text-xs text-white/40">{a.githubRepository.status}</span>
                          )
                        ) : (
                          <span className="text-xs text-white/40">Not Created</span>
                        )
                      ) : (
                        <span className="text-xs text-white/30">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {a.lesson.requiresSlack ? (
                        a.slackConnection ? (
                          a.slackConnection.status === 'verified' ? (
                            <span className="text-xs text-emerald-400">{a.slackConnection.slackRealName || a.slackConnection.slackEmail}</span>
                          ) : a.slackConnection.status === 'connected' ? (
                            <span className="text-xs text-blue-400">Pending</span>
                          ) : a.slackConnection.status === 'error' ? (
                            <span className="text-xs text-red-400">Error</span>
                          ) : (
                            <span className="text-xs text-white/40">{a.slackConnection.status}</span>
                          )
                        ) : (
                          <span className="text-xs text-white/40">Not Connected</span>
                        )
                      ) : (
                        <span className="text-xs text-white/30">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-white/50 text-xs">{new Date(a.assignedAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuickReference() {
  return (
    <div className="space-y-8">
      {/* Commands */}
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Commands Cheat Sheet</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-white/70">Command</th>
                <th className="text-left py-2 px-3 text-white/70">Purpose</th>
                <th className="text-left py-2 px-3 text-white/70">Must Pass?</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              <tr className="border-b border-white/5"><td className="py-2 px-3 font-mono text-xs">npm run dev</td><td className="py-2 px-3">Start dev server</td><td className="py-2 px-3">—</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3 font-mono text-xs">npm run typecheck</td><td className="py-2 px-3">TypeScript check</td><td className="py-2 px-3 text-miami-pink font-bold">YES</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3 font-mono text-xs">npm run build</td><td className="py-2 px-3">Production build</td><td className="py-2 px-3 text-miami-pink font-bold">YES</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3 font-mono text-xs">npm run lint</td><td className="py-2 px-3">ESLint check</td><td className="py-2 px-3 text-yellow-400">Warnings OK</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3 font-mono text-xs">npm run test</td><td className="py-2 px-3">Vitest tests</td><td className="py-2 px-3">—</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3 font-mono text-xs">npm run db:push</td><td className="py-2 px-3">Apply schema changes</td><td className="py-2 px-3">After schema edit</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Auth Guard */}
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Auth Guard — Copy &amp; Paste</h2>
        <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400 overflow-x-auto">
          <pre>{`import { requireAuth, isNextResponse } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await requireAuth(['admin', 'staff']);
  if (isNextResponse(user)) return user;
  // your code here
}`}</pre>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
            <span className="text-white/50">Admin only:</span>{' '}
            <code className="text-miami-pink">requireAdmin()</code>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
            <span className="text-white/50">Admin or Staff:</span>{' '}
            <code className="text-miami-pink">requireAdminOrStaff()</code>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
            <span className="text-white/50">Client only:</span>{' '}
            <code className="text-miami-pink">requireClient()</code>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
            <span className="text-white/50">Contractor only:</span>{' '}
            <code className="text-miami-pink">requireContractor()</code>
          </div>
        </div>
      </section>

      {/* Role Permissions */}
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Role Permissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-white/70">Role</th>
                <th className="text-left py-2 px-3 text-white/70">Can Access</th>
                <th className="text-left py-2 px-3 text-white/70">Cannot Access</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              <tr className="border-b border-white/5"><td className="py-2 px-3 font-bold">Admin</td><td className="py-2 px-3">Everything</td><td className="py-2 px-3">—</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3 font-bold">Staff</td><td className="py-2 px-3">Most things</td><td className="py-2 px-3">Audit admin</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3 font-bold">Contractor</td><td className="py-2 px-3">Own records only</td><td className="py-2 px-3">Other contractors, admin pages</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3 font-bold">Client</td><td className="py-2 px-3">Own records only</td><td className="py-2 px-3">Other clients, admin pages</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Google Drive Folder Assignment */}
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Google Drive Folder Assignment</h2>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 mb-4">
          <p className="text-sm text-white/60 mb-4">
            Admins assign Google Drive folders to contractors and clients. This is where project files are uploaded.
          </p>
          <div className="space-y-3 text-sm text-white/70">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span>Go to <strong className="text-white/90">Admin → Contractors</strong> (or Clients) → click a record</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span>Paste the Google Drive folder URL into the <strong className="text-white/90">&quot;Google Drive Folder&quot;</strong> section</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span>Click <strong className="text-white/90">&quot;Save Folder&quot;</strong> — the URL is normalized to a folder ID automatically</span>
            </div>
          </div>
          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-300/80">
              <strong>Prerequisite:</strong> Share the folder with <code className="bg-white/5 px-1 rounded text-[10px]">widmedia-drive-upload@whoisdesir-media.iam.gserviceaccount.com</code> as Editor before assigning it.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
            <span className="text-white/50">Contractor uploads go to:</span>{' '}
            <code className="text-miami-pink">Contractor.googleDriveFolderId</code> (or client&apos;s)
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
            <span className="text-white/50">Client uploads go to:</span>{' '}
            <code className="text-miami-pink">Client.googleDriveFolderId</code>
          </div>
        </div>
      </section>

      {/* Gotchas */}
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Gotchas</h2>
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex items-start gap-2"><span className="text-miami-pink mt-0.5">⚠</span> Never trust query params from clients/contractors for ownership checks — use <code className="text-miami-pink">user.clientId</code> or <code className="text-miami-pink">user.contractorId</code></li>
          <li className="flex items-start gap-2"><span className="text-miami-pink mt-0.5">⚠</span> If <code className="text-miami-pink">typecheck</code> errors reference removed routes, delete <code className="text-miami-pink">.next/</code> and re-run</li>
          <li className="flex items-start gap-2"><span className="text-miami-pink mt-0.5">⚠</span> The <code className="text-miami-pink">me</code> endpoint uses <code className="text-miami-pink">getSession</code> directly, not <code className="text-miami-pink">requireAuth</code> — this is intentional</li>
          <li className="flex items-start gap-2"><span className="text-miami-pink mt-0.5">⚠</span> File uploads read entire files into memory — don&apos;t upload huge files</li>
          <li className="flex items-start gap-2"><span className="text-miami-pink mt-0.5">⚠</span> Rate limiting is in-memory — resets on serverless cold starts</li>
        </ul>
      </section>

      {/* Branch Naming */}
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Branch Naming</h2>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
            <code className="text-miami-blue-light">feat/feature-name</code>
            <p className="text-white/40 mt-1">New features</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
            <code className="text-miami-blue-light">fix/bug-description</code>
            <p className="text-white/40 mt-1">Bug fixes</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
            <code className="text-miami-blue-light">chore/task-description</code>
            <p className="text-white/40 mt-1">Maintenance</p>
          </div>
        </div>
      </section>

      {/* PR Checklist */}
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">PR Checklist</h2>
        <ul className="space-y-1 text-sm text-white/70">
          <li>☐ typecheck passes</li>
          <li>☐ build passes</li>
          <li>☐ Only changed what was necessary</li>
          <li>☐ No secrets committed</li>
          <li>☐ Auth guard on every new API route</li>
          <li>☐ Clear commit message</li>
          <li>☐ Explained what changed and how it was tested</li>
        </ul>
      </section>
    </div>
  );
}
