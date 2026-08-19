'use client';

import ContractorSidebar from '@/components/ContractorSidebar';
import HtmlRenderer from '@/components/HtmlRenderer';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface StepDef { id: string; title: string; order: number; }
interface StepProgress { id: string; stepId: string; status: string; completedAt: string | null; }
interface GitHubRepo { id: string; repoName: string; repoUrl: string; status: string; defaultBranch: string; errorMessage: string | null; }
interface Assignment {
  id: string;
  status: string;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  lesson: { id: string; slug: string; title: string; description: string | null; targetRole: string; steps: StepDef[]; requiresGithub: boolean };
  steps: StepProgress[];
  githubRepository: GitHubRepo | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  assigned: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Not Started' },
  in_progress: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', label: 'In Progress' },
  completed: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', label: 'Completed' },
};

const GH_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Not Created' },
  creating: { bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700', label: 'Creating...' },
  created: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', label: 'Ready' },
  active: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', label: 'Ready' },
  error: { bg: 'bg-red-50 border border-red-200', text: 'text-red-700', label: 'Error' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Archived' },
};

export default function ContractorTrainingPage() {
  const [user, setUser] = useState<{ name: string; email: string; contractorRole?: string; contractorRoles?: string[] } | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completingStep, setCompletingStep] = useState<string | null>(null);
  const [creatingRepo, setCreatingRepo] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const loadAssignments = useCallback(() => {
    fetch('/api/training/progress')
      .then(r => r.json())
      .then(data => { setAssignments(Array.isArray(data) ? data : []); setAssignmentsLoading(false); })
      .catch(() => setAssignmentsLoading(false));
  }, []);

  useEffect(() => { loadAssignments(); }, [loadAssignments]);

  const handleCompleteStep = async (assignmentId: string, stepId: string) => {
    setCompletingStep(`${assignmentId}-${stepId}`);
    try {
      const res = await fetch('/api/training/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, stepId }),
      });
      if (res.ok) loadAssignments();
    } catch { /* ignored */ }
    setCompletingStep(null);
  };

  const handleCreateRepo = async (assignmentId: string) => {
    setCreatingRepo(assignmentId);
    try {
      const res = await fetch('/api/training/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId }),
      });
      if (res.ok) loadAssignments();
      else {
        const err = await res.json();
        alert(err.error || 'Failed to create repository');
      }
    } catch { alert('Failed to create repository'); }
    setCreatingRepo(null);
  };

  const isDeveloper = user?.contractorRoles?.includes('developer');

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} contractorRoles={user?.contractorRoles} />
      <main className="ml-64 flex-1">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-dark mb-1">Training &amp; Guides</h1>
            <p className="text-sm text-muted">Your onboarding guide, portal walkthrough, and vendor phases</p>
          </div>

          {/* Your Training Assignments */}
          <div className="mb-8">
            <h2 className="font-heading text-lg font-bold text-dark mb-4">Your Training</h2>
            {assignmentsLoading ? (
              <div className="glass-card p-6 text-muted text-sm">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="glass-card p-6 text-muted text-sm">No training assigned yet. Your admin will assign training modules.</div>
            ) : (
              <div className="space-y-4">
                {assignments.map(a => {
                  const isExpanded = expandedId === a.id;
                  const style = STATUS_STYLES[a.status] || STATUS_STYLES.assigned;
                  const lessonSteps = a.lesson.steps || [];
                  const ghStatus = a.githubRepository ? GH_STATUS[a.githubRepository.status] || GH_STATUS.pending : null;
                  const isCreating = creatingRepo === a.id;

                  return (
                    <div key={a.id} className="glass-card overflow-hidden">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : a.id)}
                        className="w-full p-5 flex items-center justify-between hover:bg-white/50 transition-colors text-left"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-heading font-bold text-dark">{a.lesson.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                              {style.label}
                            </span>
                            {a.lesson.requiresGithub && ghStatus && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ghStatus.bg} ${ghStatus.text}`}>
                                GH: {ghStatus.label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted">
                            <span>{a.completedSteps} / {a.totalSteps} complete</span>
                            <span>{a.progress}%</span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${a.status === 'completed' ? 'bg-emerald-500' : 'bg-miami-pink'}`}
                              style={{ width: `${a.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="ml-4 text-muted text-lg">{isExpanded ? '▲' : '▼'}</span>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-muted-lighter p-5">
                          {a.lesson.description && (
                            <p className="text-sm text-muted mb-4">{a.lesson.description}</p>
                          )}

                          {/* GitHub Repository Section */}
                          {a.lesson.requiresGithub && (
                            <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-muted-lighter">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-bold text-dark">GitHub Training Repository</h4>
                                  {a.githubRepository ? (
                                    <div className="mt-1">
                                      {a.githubRepository.status === 'created' || a.githubRepository.status === 'active' ? (
                                        <a
                                          href={a.githubRepository.repoUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-miami-blue-light hover:underline font-medium"
                                        >
                                          {a.githubRepository.repoName} →
                                        </a>
                                      ) : a.githubRepository.status === 'error' ? (
                                        <p className="text-xs text-red-600 mt-1">{a.githubRepository.errorMessage || 'Creation failed. You can retry.'}</p>
                                      ) : a.githubRepository.status === 'creating' ? (
                                        <p className="text-xs text-blue-600 mt-1">Repository is being created...</p>
                                      ) : null}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted mt-1">Not created yet</p>
                                  )}
                                </div>
                                <div>
                                  {!a.githubRepository || a.githubRepository.status === 'error' ? (
                                    <button
                                      onClick={() => handleCreateRepo(a.id)}
                                      disabled={isCreating}
                                      className="px-4 py-2 bg-miami-blue-light text-white text-xs font-semibold rounded-lg hover:bg-miami-blue-light/80 transition-colors disabled:opacity-50"
                                    >
                                      {isCreating ? 'Creating...' : 'Create Training Repository'}
                                    </button>
                                  ) : a.githubRepository.status === 'created' || a.githubRepository.status === 'active' ? (
                                    <a
                                      href={a.githubRepository.repoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-4 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors inline-block"
                                    >
                                      Open GitHub Repository
                                    </a>
                                  ) : a.githubRepository.status === 'creating' ? (
                                    <span className="px-4 py-2 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg inline-block">Creating...</span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Training Steps */}
                          <div className="space-y-2">
                            {lessonSteps.sort((x, y) => x.order - y.order).map(step => {
                              const sp = a.steps.find(s => s.stepId === step.id);
                              const completed = sp?.status === 'completed';
                              const isCompleting = completingStep === `${a.id}-${step.id}`;
                              return (
                                <div key={step.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${completed ? 'bg-emerald-50' : 'bg-white border border-muted-lighter'}`}>
                                  <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${completed ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                      {completed ? '✓' : step.order}
                                    </span>
                                    <span className={`text-sm ${completed ? 'text-emerald-700 font-semibold' : 'text-dark'}`}>{step.title}</span>
                                  </div>
                                  {!completed && a.status !== 'completed' && (
                                    <button
                                      onClick={() => handleCompleteStep(a.id, step.id)}
                                      disabled={isCompleting}
                                      className="px-3 py-1.5 bg-miami-pink text-white text-xs font-semibold rounded-lg hover:bg-miami-pink/80 transition-colors disabled:opacity-50"
                                    >
                                      {isCompleting ? '...' : 'Mark Complete'}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Existing static training content */}
          <div className="mb-8 rounded-2xl border border-miami-blue-light/20 bg-miami-blue-light/5 p-6">
            <h2 className="font-heading text-base font-bold text-dark mb-2">📚 Knowledge Base</h2>
            <p className="text-sm text-muted mb-3">Looking for quick lessons on how to use the portal, upload deliverables, or deliver to Google Drive? Our Knowledge Base has step-by-step guides — available to everyone, even without logging in.</p>
            <Link href="/knowledge-base" className="inline-flex items-center gap-2 text-sm font-semibold text-miami-blue-light hover:underline">
              Open Knowledge Base →
            </Link>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="font-heading text-lg font-bold text-dark mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">1</span>
                Vendor Portal Guide
              </h2>
              <div className="rounded-2xl overflow-hidden border border-muted-lighter bg-white">
                <HtmlRenderer src="/vendor-training.html" />
              </div>
            </section>

            <section>
              <h2 className="font-heading text-lg font-bold text-dark mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">2</span>
                Your Contractor Guide
              </h2>
              <div className="rounded-2xl overflow-hidden border border-muted-lighter bg-white">
                <HtmlRenderer src="/contractor-guide.html" />
              </div>
            </section>

            <section>
              <h2 className="font-heading text-lg font-bold text-dark mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">3</span>
                Vendor Onboarding &amp; Payment Phases
              </h2>
              <div className="rounded-2xl overflow-hidden border border-muted-lighter bg-white">
                <HtmlRenderer src="/vendor-phases.html" />
              </div>
            </section>

            {isDeveloper && (
              <section>
                <h2 className="font-heading text-lg font-bold text-dark mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">4</span>
                  Developer Guide
                </h2>
                <div className="rounded-2xl overflow-hidden border border-muted-lighter bg-white">
                  <HtmlRenderer src="/developer-training.html" />
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
