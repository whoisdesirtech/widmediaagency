'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ContractorSidebar from '@/components/ContractorSidebar';
import WordPressDeveloperTrainingContent from '@/components/WordPressDeveloperTrainingContent';
import WordPressQuizModal from '@/components/WordPressQuizModal';

type Tab = 'module' | 'work' | 'certification';

interface UserInfo {
  id?: string;
  name: string;
  email: string;
  contractorId?: string;
  contractorRoles?: string[];
}

interface WorkSubmission {
  id: string;
  city: string;
  pageName: string;
  pageUrl: string;
  editUrl: string | null;
  seoTitle: string;
  focusKeyphrase: string;
  slug: string;
  metaDescription: string;
  relatedKeyphrases: string;
  canonicalUrl: string | null;
  socialTitle: string;
  socialDescription: string;
  notes: string | null;
  status: string;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface QuizSummary {
  eligible: boolean;
  quiz: { title: string; passingScore: number } | null;
  latestResult: {
    attemptNumber: number;
    score: number | null;
    maxScore: number | null;
    percentage: number | null;
    passed: boolean | null;
    overridePassed: boolean | null;
    reviewNotes: string | null;
    status: string;
  } | null;
  payTier: { tier: string; standardRate: number | null; certifiedRate: number | null } | null;
}

const EMPTY_FORM = {
  city: '',
  pageName: '',
  pageUrl: '',
  editUrl: '',
  seoTitle: '',
  focusKeyphrase: '',
  slug: '',
  metaDescription: '',
  relatedKeyphrases: '',
  canonicalUrl: '',
  socialTitle: '',
  socialDescription: '',
  notes: '',
};

const STATUS_STYLES: Record<string, string> = {
  submitted: 'border-blue-200 bg-blue-50 text-blue-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  changes_requested: 'border-amber-200 bg-amber-50 text-amber-700',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted — awaiting review',
  approved: 'Approved',
  changes_requested: 'Changes requested',
};

export default function ContractorWordPressDeveloperPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>('module');
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [quizSummary, setQuizSummary] = useState<QuizSummary | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSubmissions = useCallback(async () => {
    const res = await fetch('/api/training/wordpress-work');
    if (!res.ok) return;
    const body = await res.json();
    setSubmissions(body.submissions || []);
  }, []);

  const loadQuizSummary = useCallback(async () => {
    const res = await fetch('/api/training/wordpress-quiz');
    if (!res.ok) return;
    const body = await res.json();
    setQuizSummary(body);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      window.location.href = '/login';
      return;
    }
    const parsed: UserInfo = JSON.parse(stored);
    setUser(parsed);
    setRoles(parsed.contractorRoles || []);

    Promise.all([loadSubmissions(), loadQuizSummary()])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadSubmissions, loadQuizSummary]);

  const update = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const res = await fetch('/api/training/wordpress-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(body?.error || 'Failed to submit practical work.');
        return;
      }
      const city = form.city;
      setForm(EMPTY_FORM);
      setFormSuccess(`Submission for ${city} saved. An admin will review it.`);
      await loadSubmissions();
    } catch {
      setFormError('Failed to submit practical work.');
    } finally {
      setSaving(false);
    }
  };

  const passed =
    quizSummary?.latestResult?.overridePassed === true || quizSummary?.latestResult?.passed === true;
  const tier = quizSummary?.payTier?.tier;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FC]">
        <ContractorSidebar user={user || undefined} contractorRoles={roles} />
        <main className="flex-1 ml-64 p-8">
          <div className="text-muted">Loading WordPress training…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} contractorRoles={roles} />
      <main className="flex-1 ml-64 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-miami-blue-beach">
                WordPress Developer
              </div>
              <h1 className="font-heading text-2xl font-black text-dark-800">WordPress Developer Training</h1>
              <p className="mt-1 max-w-2xl text-sm text-dark-500">
                Complete the Enfold module, submit real city-page work, and pass the separate 10-question
                certification quiz.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                  tier === 'certified'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-muted-lighter bg-white text-dark-600'
                }`}
              >
                {tier === 'certified' ? 'Certified pay tier' : 'Standard pay tier'}
              </span>
              {quizSummary?.quiz && (
                <span className="text-xs text-dark-400">
                  Pass at {quizSummary.quiz.passingScore}% · 10 questions
                </span>
              )}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { id: 'module' as Tab, label: 'Training module', icon: '📖' },
              { id: 'work' as Tab, label: 'Practical work', icon: '🛠️' },
              { id: 'certification' as Tab, label: 'Certification quiz', icon: '🧩' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  tab === item.id
                    ? 'border-miami-blue-beach bg-miami-blue-beach/10 text-dark-800'
                    : 'border-muted-lighter bg-white text-dark-500 hover:border-miami-blue-light'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <WordPressQuizModal autoOpen showTrigger={false} onCompleted={loadQuizSummary} />
          </div>

          {tab === 'module' && <WordPressDeveloperTrainingContent />}

          {tab === 'work' && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-muted-lighter bg-white p-6">
                <h2 className="font-heading text-lg font-bold text-dark-800">Submit a completed city page</h2>
                <p className="mt-1 text-sm text-dark-500">
                  Submit the live URL, the edit URL, and the complete Yoast metadata. The reviewer grades the
                  real page against the SOP.
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  {formError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {formSuccess}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        ['city', 'Target city *', 'Plantation'],
                        ['pageName', 'WordPress page name *', 'Media Agency in Plantation, FL'],
                        ['pageUrl', 'Live page URL *', 'https://whoisdesir.com/plantation-florida-media-agency/'],
                        ['editUrl', 'WordPress edit URL', 'https://whoisdesir.com/wp-admin/post.php?post=14589&action=edit'],
                        ['seoTitle', 'SEO title *', 'Media Agency in Plantation, FL | WhoIsDésir'],
                        ['focusKeyphrase', 'Focus keyphrase *', 'media agency Plantation FL'],
                        ['slug', 'URL slug *', 'plantation-florida-media-agency'],
                        ['relatedKeyphrases', 'Related keyphrases', 'video production Plantation, content creation Broward'],
                        ['canonicalUrl', 'Canonical URL', 'https://whoisdesir.com/plantation-florida-media-agency/'],
                        ['socialTitle', 'Social sharing title *', 'Media Agency in Plantation, FL'],
                        ['socialDescription', 'Social sharing description *', 'Video production and content creation for Plantation businesses.'],
                      ] as Array<[keyof typeof EMPTY_FORM, string, string]>
                    ).map(([field, label, placeholder]) => (
                      <div key={field} className={field === 'socialDescription' ? 'sm:col-span-2' : ''}>
                        <label className="mb-1.5 block text-xs font-semibold text-dark-800">{label}</label>
                        <input
                          value={form[field]}
                          onChange={(event) => update(field, event.target.value)}
                          placeholder={placeholder}
                          className="w-full rounded-xl border-2 border-muted-lighter bg-white px-3 py-2.5 text-sm text-dark-800"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-dark-800">
                      Meta description *
                    </label>
                    <textarea
                      value={form.metaDescription}
                      onChange={(event) => update('metaDescription', event.target.value)}
                      rows={3}
                      placeholder="Concise, accurate description for search results."
                      className="w-full rounded-xl border-2 border-muted-lighter bg-white px-3 py-2.5 text-sm text-dark-800"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-dark-800">Notes for the reviewer</label>
                    <textarea
                      value={form.notes}
                      onChange={(event) => update('notes', event.target.value)}
                      rows={3}
                      placeholder="Anything the reviewer should know: outstanding issues, QA evidence, links to screenshots."
                      className="w-full rounded-xl border-2 border-muted-lighter bg-white px-3 py-2.5 text-sm text-dark-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl gradient-bg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? 'Submitting…' : 'Submit practical work'}
                  </button>
                </form>
              </section>

              <section className="rounded-2xl border border-muted-lighter bg-white p-6">
                <h2 className="font-heading text-lg font-bold text-dark-800">Your submissions</h2>
                {submissions.length === 0 ? (
                  <p className="mt-2 text-sm text-dark-500">No practical work submitted yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {submissions.map((submission) => (
                      <div key={submission.id} className="rounded-xl border border-muted-lighter p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-dark-800">
                              {submission.city} · {submission.pageName}
                            </p>
                            <p className="text-xs text-dark-400">{new Date(submission.createdAt).toLocaleString()}</p>
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${
                              STATUS_STYLES[submission.status] || 'border-muted-lighter bg-white text-dark-500'
                            }`}
                          >
                            {STATUS_LABELS[submission.status] || submission.status}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                          <a href={submission.pageUrl} target="_blank" rel="noreferrer" className="font-semibold text-miami-blue-beach underline">
                            Live page
                          </a>
                          {submission.editUrl && (
                            <a href={submission.editUrl} target="_blank" rel="noreferrer" className="font-semibold text-miami-blue-beach underline">
                              Edit page
                            </a>
                          )}
                        </div>
                        <dl className="mt-3 grid gap-2 text-xs text-dark-600 sm:grid-cols-2">
                          <div><dt className="font-semibold text-dark-800">SEO title</dt><dd>{submission.seoTitle}</dd></div>
                          <div><dt className="font-semibold text-dark-800">Focus keyphrase</dt><dd>{submission.focusKeyphrase}</dd></div>
                          <div><dt className="font-semibold text-dark-800">Slug</dt><dd>{submission.slug}</dd></div>
                          <div><dt className="font-semibold text-dark-800">Canonical</dt><dd>{submission.canonicalUrl || '—'}</dd></div>
                        </dl>
                        {submission.adminNotes && (
                          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            <span className="font-semibold">Reviewer notes: </span>
                            {submission.adminNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {tab === 'certification' && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-muted-lighter bg-white p-6">
                <h2 className="font-heading text-lg font-bold text-dark-800">WordPress certification quiz</h2>
                <p className="mt-1 text-sm text-dark-500">
                  This quiz is separate from the training module. It contains exactly 10 intermediate
                  questions — 5 Enfold Theme and 5 WordPress fundamentals. It is graded on the server.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-muted-lighter bg-[#F8F9FC] p-4">
                    <p className="text-xs text-dark-400">Passing score</p>
                    <p className="font-heading text-lg font-black text-dark-800">
                      {quizSummary?.quiz?.passingScore ?? 80}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-muted-lighter bg-[#F8F9FC] p-4">
                    <p className="text-xs text-dark-400">Current pay tier</p>
                    <p className="font-heading text-lg font-black capitalize text-dark-800">
                      {tier === 'certified' ? 'Certified' : 'Standard'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-muted-lighter bg-[#F8F9FC] p-4">
                    <p className="text-xs text-dark-400">Result</p>
                    <p className={`font-heading text-lg font-black ${passed ? 'text-emerald-600' : 'text-dark-800'}`}>
                      {passed ? 'Passed' : quizSummary?.latestResult ? 'Not passed' : 'Not taken'}
                    </p>
                  </div>
                </div>

                {quizSummary?.latestResult && (
                  <div className="mt-4 rounded-xl border border-muted-lighter p-4 text-sm text-dark-600">
                    <p className="font-semibold text-dark-800">
                      Attempt #{quizSummary.latestResult.attemptNumber}: {quizSummary.latestResult.score}/
                      {quizSummary.latestResult.maxScore} ({quizSummary.latestResult.percentage}%)
                    </p>
                    {quizSummary.latestResult.reviewNotes && (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-amber-800">
                        Reviewer notes: {quizSummary.latestResult.reviewNotes}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-5">
                  <WordPressQuizModal showTrigger onCompleted={loadQuizSummary} />
                </div>

                <p className="mt-4 text-xs text-dark-500">
                  Passing upgrades you to the certified pay tier. Failing keeps the standard rate until you
                  pass. An admin reviews and can override any result.
                </p>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
