'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import WordPressDeveloperTrainingContent, {
  WORDPRESS_NON_NEGOTIABLES,
} from '@/components/WordPressDeveloperTrainingContent';

type Tab = 'module' | 'quizzes' | 'work';

interface ContractorRef {
  id: string;
  name: string;
  businessName: string;
  role: string;
  userId?: string | null;
  payTier?: { tier: string; standardRate: number | null; certifiedRate: number | null } | null;
}

interface AdminAttempt {
  id: string;
  status: string;
  attemptNumber: number;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  passed: boolean | null;
  overrideScore: number | null;
  overridePassed: boolean | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  submittedAt: string | null;
  startedAt: string | null;
  createdAt: string;
  quiz: { id: string; title: string; passingScore: number };
  contractor: ContractorRef;
}

interface QuizQuestion {
  id: string;
  key: string;
  category: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  order: number;
}

interface AttemptDetail extends AdminAttempt {
  answers: Array<{ questionId: string; selectedIndex: number | null }> | null;
  quiz: AdminAttempt['quiz'] & { questions: QuizQuestion[] };
  contractor: ContractorRef;
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
  contractor: ContractorRef;
}

const ATTEMPT_STATUS_STYLES: Record<string, string> = {
  assigned: 'border-gray-200 bg-gray-50 text-gray-600',
  in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
  submitted: 'border-amber-200 bg-amber-50 text-amber-700',
  reviewed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const WORK_STATUS_STYLES: Record<string, string> = {
  submitted: 'border-blue-200 bg-blue-50 text-blue-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  changes_requested: 'border-amber-200 bg-amber-50 text-amber-700',
};

const WORK_STATUS_LABELS: Record<string, string> = {
  submitted: 'Awaiting review',
  approved: 'Approved',
  changes_requested: 'Changes requested',
};

const CATEGORY_LABELS: Record<string, string> = {
  enfold: 'Enfold Theme',
  'wordpress-basics': 'WordPress Fundamentals',
};

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function AdminWordPressDeveloperPage() {
  const [tab, setTab] = useState<Tab>('quizzes');
  const [attempts, setAttempts] = useState<AdminAttempt[]>([]);
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [attemptFilter, setAttemptFilter] = useState('all');
  const [workFilter, setWorkFilter] = useState('all');

  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AttemptDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [overrideScore, setOverrideScore] = useState('');
  const [overridePassed, setOverridePassed] = useState<'' | 'true' | 'false'>('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [standardRate, setStandardRate] = useState('');
  const [certifiedRate, setCertifiedRate] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const [workNotes, setWorkNotes] = useState<Record<string, string>>({});
  const [workAction, setWorkAction] = useState<string | null>(null);
  const [workMessage, setWorkMessage] = useState<string | null>(null);

  const loadAttempts = useCallback(async () => {
    const res = await fetch('/api/admin/training/wordpress-quiz');
    if (res.status === 401 || res.status === 403) {
      setError('Admin or staff access required.');
      return;
    }
    if (!res.ok) {
      setError('Failed to load quiz attempts.');
      return;
    }
    const body = await res.json();
    setAttempts(body.attempts || []);
  }, []);

  const loadSubmissions = useCallback(async () => {
    const res = await fetch('/api/admin/training/wordpress-work');
    if (!res.ok) {
      setError('Failed to load work submissions.');
      return;
    }
    const body = await res.json();
    setSubmissions(body.submissions || []);
  }, []);

  useEffect(() => {
    Promise.all([loadAttempts(), loadSubmissions()])
      .catch(() => setError('Failed to load WordPress developer data.'))
      .finally(() => setLoading(false));
  }, [loadAttempts, loadSubmissions]);

  const openAttempt = async (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setDetailLoading(true);
    setReviewMessage(null);
    try {
      const res = await fetch(`/api/admin/training/wordpress-quiz/${attemptId}`);
      if (!res.ok) {
        setReviewMessage('Failed to load attempt details.');
        return;
      }
      const body = await res.json();
      const attempt: AttemptDetail = body.attempt;
      setDetail(attempt);
      setOverrideScore(attempt.overrideScore !== null ? String(attempt.overrideScore) : '');
      setOverridePassed(
        attempt.overridePassed === null ? '' : attempt.overridePassed ? 'true' : 'false'
      );
      setReviewNotes(attempt.reviewNotes || '');
      setStandardRate(
        attempt.contractor.payTier?.standardRate != null ? String(attempt.contractor.payTier.standardRate) : ''
      );
      setCertifiedRate(
        attempt.contractor.payTier?.certifiedRate != null ? String(attempt.contractor.payTier.certifiedRate) : ''
      );
    } catch {
      setReviewMessage('Failed to load attempt details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeAttempt = () => {
    setSelectedAttemptId(null);
    setDetail(null);
    setReviewMessage(null);
  };

  const saveReview = async () => {
    if (!detail) return;
    setSavingReview(true);
    setReviewMessage(null);
    try {
      const payload: Record<string, unknown> = {
        reviewNotes,
        overrideScore: overrideScore === '' ? null : Number(overrideScore),
        overridePassed: overridePassed === '' ? null : overridePassed === 'true',
        standardRate: standardRate === '' ? null : Number(standardRate),
        certifiedRate: certifiedRate === '' ? null : Number(certifiedRate),
      };
      const res = await fetch(`/api/admin/training/wordpress-quiz/${detail.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReviewMessage(body?.error || 'Failed to save review.');
        return;
      }
      setReviewMessage('Review saved and pay tier updated.');
      await Promise.all([loadAttempts(), openAttempt(detail.id)]);
    } catch {
      setReviewMessage('Failed to save review.');
    } finally {
      setSavingReview(false);
    }
  };

  const reviewWork = async (submissionId: string, action: 'approve' | 'changes_requested') => {
    setWorkAction(`${submissionId}:${action}`);
    setWorkMessage(null);
    try {
      const res = await fetch(`/api/admin/training/wordpress-work/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNotes: workNotes[submissionId] || '' }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setWorkMessage(body?.error || 'Failed to review submission.');
        return;
      }
      setWorkMessage(
        action === 'approve' ? 'Submission approved.' : 'Changes requested and contractor notified.'
      );
      await loadSubmissions();
    } catch {
      setWorkMessage('Failed to review submission.');
    } finally {
      setWorkAction(null);
    }
  };

  const filteredAttempts = useMemo(
    () => (attemptFilter === 'all' ? attempts : attempts.filter((attempt) => attempt.status === attemptFilter)),
    [attempts, attemptFilter]
  );

  const filteredSubmissions = useMemo(
    () => (workFilter === 'all' ? submissions : submissions.filter((submission) => submission.status === workFilter)),
    [submissions, workFilter]
  );

  const answerMap = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const answer of detail?.answers || []) {
      map.set(answer.questionId, answer.selectedIndex);
    }
    return map;
  }, [detail]);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-miami-blue-beach">
              Admin review
            </div>
            <h1 className="font-heading text-2xl font-black text-dark-800">WordPress Developer Program</h1>
            <p className="mt-1 max-w-3xl text-sm text-dark-500">
              Review the module, grade the separate 10-question certification quiz, override results when
              needed, and approve real city-page work.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { id: 'quizzes' as Tab, label: 'Quiz attempts', icon: '🧩' },
              { id: 'work' as Tab, label: 'Practical work', icon: '🛠️' },
              { id: 'module' as Tab, label: 'Training module', icon: '📖' },
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

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-muted">Loading…</div>
          ) : (
            <>
              {tab === 'module' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-muted-lighter bg-white p-5">
                    <h2 className="font-heading text-lg font-bold text-dark-800">What contractors are taught</h2>
                    <p className="mt-1 text-sm text-dark-500">
                      This is the exact module contractors see. The certification quiz is separate and is
                      graded on the server.
                    </p>
                    <ul className="mt-3 grid gap-2 text-xs text-dark-600 sm:grid-cols-2">
                      {WORDPRESS_NON_NEGOTIABLES.map((rule, index) => (
                        <li key={index} className="rounded-lg border border-muted-lighter bg-[#F8F9FC] px-3 py-2">
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <WordPressDeveloperTrainingContent />
                </div>
              )}

              {tab === 'quizzes' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {['all', 'submitted', 'reviewed', 'in_progress', 'assigned'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setAttemptFilter(status)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                          attemptFilter === status
                            ? 'border-miami-blue-beach bg-miami-blue-beach/10 text-dark-800'
                            : 'border-muted-lighter bg-white text-dark-500'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {filteredAttempts.length === 0 ? (
                    <div className="rounded-2xl border border-muted-lighter bg-white p-8 text-center text-sm text-dark-500">
                      No quiz attempts match this filter.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-muted-lighter bg-white">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-[#F8F9FC] text-xs uppercase tracking-wide text-dark-400">
                          <tr>
                            <th className="px-4 py-3">Contractor</th>
                            <th className="px-4 py-3">Attempt</th>
                            <th className="px-4 py-3">Score</th>
                            <th className="px-4 py-3">Result</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Submitted</th>
                            <th className="px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAttempts.map((attempt) => {
                            const effectivePassed = attempt.overridePassed ?? attempt.passed;
                            const effectiveScore = attempt.overrideScore ?? attempt.score;
                            const effectivePercentage =
                              effectiveScore != null && attempt.maxScore
                                ? Math.round((effectiveScore / attempt.maxScore) * 100)
                                : attempt.percentage;
                            return (
                              <tr key={attempt.id} className="border-t border-muted-lighter">
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-dark-800">{attempt.contractor.name}</div>
                                  <div className="text-xs text-dark-400">{attempt.contractor.businessName}</div>
                                </td>
                                <td className="px-4 py-3 text-dark-600">#{attempt.attemptNumber}</td>
                                <td className="px-4 py-3 text-dark-600">
                                  {effectiveScore ?? '—'}/{attempt.maxScore ?? '—'} ({effectivePercentage ?? '—'}%)
                                </td>
                                <td className="px-4 py-3">
                                  {effectivePassed === null || effectivePassed === undefined ? (
                                    <span className="text-xs text-dark-400">Pending</span>
                                  ) : (
                                    <span
                                      className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${
                                        effectivePassed
                                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                          : 'border-amber-200 bg-amber-50 text-amber-700'
                                      }`}
                                    >
                                      {effectivePassed ? 'Passed' : 'Not passed'}
                                    </span>
                                  )}
                                  {attempt.overridePassed !== null && (
                                    <span className="ml-1 text-[0.65rem] text-dark-400">override</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold capitalize ${
                                      ATTEMPT_STATUS_STYLES[attempt.status] || 'border-muted-lighter bg-white text-dark-500'
                                    }`}
                                  >
                                    {attempt.status.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-dark-500">{formatDate(attempt.submittedAt)}</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => openAttempt(attempt.id)}
                                    className="rounded-lg border border-muted-lighter px-3 py-1.5 text-xs font-semibold text-dark-600 hover:border-miami-blue-light"
                                  >
                                    Review
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === 'work' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {['all', 'submitted', 'approved', 'changes_requested'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setWorkFilter(status)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                          workFilter === status
                            ? 'border-miami-blue-beach bg-miami-blue-beach/10 text-dark-800'
                            : 'border-muted-lighter bg-white text-dark-500'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {workMessage && (
                    <div className="rounded-xl border border-muted-lighter bg-white px-4 py-3 text-sm text-dark-600">
                      {workMessage}
                    </div>
                  )}

                  {filteredSubmissions.length === 0 ? (
                    <div className="rounded-2xl border border-muted-lighter bg-white p-8 text-center text-sm text-dark-500">
                      No practical work matches this filter.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredSubmissions.map((submission) => (
                        <div key={submission.id} className="rounded-2xl border border-muted-lighter bg-white p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="font-heading text-base font-bold text-dark-800">
                                {submission.city} · {submission.pageName}
                              </div>
                              <div className="text-xs text-dark-400">
                                {submission.contractor.name} ({submission.contractor.businessName}) ·{' '}
                                {formatDate(submission.createdAt)}
                              </div>
                            </div>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${
                                WORK_STATUS_STYLES[submission.status] || 'border-muted-lighter bg-white text-dark-500'
                              }`}
                            >
                              {WORK_STATUS_LABELS[submission.status] || submission.status}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-3 text-xs">
                            <a href={submission.pageUrl} target="_blank" rel="noreferrer" className="font-semibold text-miami-blue-beach underline">
                              Live page
                            </a>
                            {submission.editUrl && (
                              <a href={submission.editUrl} target="_blank" rel="noreferrer" className="font-semibold text-miami-blue-beach underline">
                                Edit page
                              </a>
                            )}
                          </div>

                          <div className="mt-4 grid gap-2 text-xs text-dark-600 sm:grid-cols-2">
                            <div><span className="font-semibold text-dark-800">SEO title:</span> {submission.seoTitle}</div>
                            <div><span className="font-semibold text-dark-800">Focus keyphrase:</span> {submission.focusKeyphrase}</div>
                            <div><span className="font-semibold text-dark-800">Slug:</span> {submission.slug}</div>
                            <div><span className="font-semibold text-dark-800">Canonical:</span> {submission.canonicalUrl || '—'}</div>
                            <div className="sm:col-span-2"><span className="font-semibold text-dark-800">Meta description:</span> {submission.metaDescription}</div>
                            <div className="sm:col-span-2"><span className="font-semibold text-dark-800">Social:</span> {submission.socialTitle} — {submission.socialDescription}</div>
                            {submission.relatedKeyphrases && (
                              <div className="sm:col-span-2"><span className="font-semibold text-dark-800">Related keyphrases:</span> {submission.relatedKeyphrases}</div>
                            )}
                            {submission.notes && (
                              <div className="sm:col-span-2"><span className="font-semibold text-dark-800">Contractor notes:</span> {submission.notes}</div>
                            )}
                          </div>

                          <div className="mt-4">
                            <label className="mb-1.5 block text-xs font-semibold text-dark-800">Reviewer notes</label>
                            <textarea
                              rows={2}
                              value={workNotes[submission.id] ?? submission.adminNotes ?? ''}
                              onChange={(event) =>
                                setWorkNotes((current) => ({ ...current, [submission.id]: event.target.value }))
                              }
                              placeholder="What passed, what still needs fixing, and any SOP violations."
                              className="w-full rounded-xl border-2 border-muted-lighter bg-white px-3 py-2 text-sm text-dark-800"
                            />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => reviewWork(submission.id, 'approve')}
                              disabled={workAction === `${submission.id}:approve`}
                              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              {workAction === `${submission.id}:approve` ? 'Approving…' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              onClick={() => reviewWork(submission.id, 'changes_requested')}
                              disabled={workAction === `${submission.id}:changes_requested`}
                              className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 disabled:opacity-60"
                            >
                              {workAction === `${submission.id}:changes_requested` ? 'Sending…' : 'Request changes'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {selectedAttemptId && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-muted-lighter px-6 py-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-miami-blue-beach">
                  Quiz attempt review
                </div>
                <h2 className="font-heading text-xl font-black text-dark-800">
                  {detail ? `${detail.contractor.name} · Attempt #${detail.attemptNumber}` : 'Loading…'}
                </h2>
                {detail && (
                  <p className="mt-1 text-xs text-dark-500">
                    {detail.quiz.title} · raw score {detail.score ?? '—'}/{detail.maxScore ?? '—'} (
                    {detail.percentage ?? '—'}%) · pass at {detail.quiz.passingScore}%
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeAttempt}
                className="rounded-lg px-2 py-1 text-xl leading-none text-dark-400 hover:bg-muted-lighter hover:text-dark-700"
                aria-label="Close review"
              >
                ×
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
              {detailLoading || !detail ? (
                <div className="text-sm text-dark-500">Loading attempt…</div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-xl border border-muted-lighter bg-[#F8F9FC] p-4 text-xs text-dark-600">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div><span className="font-semibold text-dark-800">Contractor:</span> {detail.contractor.name}</div>
                      <div><span className="font-semibold text-dark-800">Role:</span> {detail.contractor.role}</div>
                      <div><span className="font-semibold text-dark-800">Status:</span> {detail.status}</div>
                      <div><span className="font-semibold text-dark-800">Submitted:</span> {formatDate(detail.submittedAt)}</div>
                      <div><span className="font-semibold text-dark-800">Reviewed:</span> {formatDate(detail.reviewedAt)}</div>
                      <div><span className="font-semibold text-dark-800">Reviewed by:</span> {detail.reviewedBy || '—'}</div>
                      <div><span className="font-semibold text-dark-800">Current pay tier:</span> {detail.contractor.payTier?.tier || 'standard'}
                        {detail.contractor.payTier?.standardRate != null && (
                          <span className="text-dark-500"> · standard ${detail.contractor.payTier.standardRate}</span>
                        )}
                        {detail.contractor.payTier?.certifiedRate != null && (
                          <span className="text-dark-500"> · certified ${detail.contractor.payTier.certifiedRate}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {detail.quiz.questions.map((question, index) => {
                      const selected = answerMap.get(question.id);
                      const correct = selected === question.correctIndex;
                      return (
                        <div
                          key={question.id}
                          className={`rounded-xl border p-4 ${
                            correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.7rem] font-semibold uppercase tracking-wide">
                            <span className="text-miami-blue-beach">
                              Q{index + 1} · {CATEGORY_LABELS[question.category] || question.category}
                            </span>
                            <span className={correct ? 'text-emerald-700' : 'text-red-700'}>
                              {correct ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-dark-800">{question.prompt}</p>
                          <ul className="mt-2 space-y-1 text-xs text-dark-600">
                            {question.options.map((option, optionIndex) => {
                              const isCorrect = optionIndex === question.correctIndex;
                              const isSelected = optionIndex === selected;
                              return (
                                <li
                                  key={optionIndex}
                                  className={`rounded-lg px-2 py-1 ${
                                    isCorrect
                                      ? 'bg-emerald-100 font-semibold text-emerald-800'
                                      : isSelected
                                        ? 'bg-red-100 text-red-800'
                                        : ''
                                  }`}
                                >
                                  {option}
                                  {isCorrect && ' ✓'}
                                  {isSelected && !isCorrect && ' (selected)'}
                                </li>
                              );
                            })}
                          </ul>
                          {question.explanation && (
                            <p className="mt-2 text-xs text-dark-500">{question.explanation}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {reviewMessage && (
                    <div className="rounded-xl border border-muted-lighter bg-[#F8F9FC] px-4 py-3 text-sm text-dark-600">
                      {reviewMessage}
                    </div>
                  )}

                  <div className="rounded-xl border border-muted-lighter p-4">
                    <h3 className="text-sm font-bold text-dark-800">Override & review</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-dark-800">
                          Override score (0–{detail.maxScore ?? 10})
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={detail.maxScore ?? 10}
                          value={overrideScore}
                          onChange={(event) => setOverrideScore(event.target.value)}
                          placeholder="Leave blank to keep raw score"
                          className="w-full rounded-xl border-2 border-muted-lighter bg-white px-3 py-2 text-sm text-dark-800"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-dark-800">Override result</label>
                        <select
                          value={overridePassed}
                          onChange={(event) => setOverridePassed(event.target.value as '' | 'true' | 'false')}
                          className="w-full rounded-xl border-2 border-muted-lighter bg-white px-3 py-2 text-sm text-dark-800"
                        >
                          <option value="">Keep computed result</option>
                          <option value="true">Force pass</option>
                          <option value="false">Force fail</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-dark-800">
                          Standard rate ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={standardRate}
                          onChange={(event) => setStandardRate(event.target.value)}
                          placeholder="Enter the standard rate"
                          className="w-full rounded-xl border-2 border-muted-lighter bg-white px-3 py-2 text-sm text-dark-800"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-dark-800">
                          Certified rate ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={certifiedRate}
                          onChange={(event) => setCertifiedRate(event.target.value)}
                          placeholder="Auto-suggested as +25% of standard"
                          className="w-full rounded-xl border-2 border-muted-lighter bg-white px-3 py-2 text-sm text-dark-800"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="mb-1.5 block text-xs font-semibold text-dark-800">Reviewer notes</label>
                      <textarea
                        rows={3}
                        value={reviewNotes}
                        onChange={(event) => setReviewNotes(event.target.value)}
                        placeholder="Explain the override or any follow-up needed."
                        className="w-full rounded-xl border-2 border-muted-lighter bg-white px-3 py-2 text-sm text-dark-800"
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={saveReview}
                        disabled={savingReview}
                        className="rounded-xl gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {savingReview ? 'Saving…' : 'Save review & update tier'}
                      </button>
                      <span className="text-xs text-dark-400">
                        Saving marks the attempt reviewed and applies the effective result to the pay tier.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
