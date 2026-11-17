'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface PublicQuestion {
  id: string;
  key: string;
  category: string;
  prompt: string;
  options: string[];
  order: number;
}

interface AttemptInfo {
  id: string;
  status: string;
  attemptNumber: number;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  passed: boolean | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  overrideScore: number | null;
  overridePassed: boolean | null;
}

interface PayTierInfo {
  tier: string;
  standardRate: number | null;
  certifiedRate: number | null;
  rateType: string;
}

interface QuizData {
  eligible: boolean;
  quiz: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    passingScore: number;
    timeLimitMins: number | null;
  } | null;
  questions: PublicQuestion[];
  attempt: AttemptInfo | null;
  latestResult: AttemptInfo | null;
  history: AttemptInfo[];
  payTier: PayTierInfo | null;
}

interface GradeAnswer {
  questionId: string;
  selectedIndex: number | null;
  correctIndex: number;
  correct: boolean;
}

interface Grade {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  answers: GradeAnswer[];
}

type Phase = 'intro' | 'quiz' | 'result';

const CATEGORY_LABELS: Record<string, string> = {
  enfold: 'Enfold Theme',
  'wordpress-basics': 'WordPress Fundamentals',
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

export default function WordPressQuizModal({
  autoOpen = false,
  showTrigger = true,
  onCompleted,
}: {
  autoOpen?: boolean;
  showTrigger?: boolean;
  onCompleted?: () => void;
}) {
  const [data, setData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('intro');
  const [activeAttempt, setActiveAttempt] = useState<AttemptInfo | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [payTier, setPayTier] = useState<PayTierInfo | null>(null);
  const autoOpenedRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/training/wordpress-quiz');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || 'Unable to load the certification quiz.');
        return null;
      }
      const body: QuizData = await res.json();
      setData(body);
      setPayTier(body.payTier);
      setError(null);
      return body;
    } catch {
      setError('Unable to load the certification quiz.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoOpen || autoOpenedRef.current || !data) return;
    const isEligible = data.eligible && Boolean(data.quiz);
    const alreadyPassed = data.latestResult?.passed === true || data.latestResult?.overridePassed === true;
    const hasUnsubmittedAttempt = Boolean(data.attempt);
    const neverTaken = !data.latestResult;

    if (isEligible && !alreadyPassed && (hasUnsubmittedAttempt || neverTaken)) {
      autoOpenedRef.current = true;
      setOpen(true);
      setPhase('intro');
    }
  }, [autoOpen, data]);

  const resetQuizState = () => {
    setGrade(null);
    setAnswers({});
    setQuestions([]);
    setActiveAttempt(null);
  };

  const startQuiz = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/training/wordpress-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error || 'Unable to start the quiz.');
        return;
      }
      setActiveAttempt(body.attempt);
      setQuestions(body.questions || []);
      setAnswers({});
      setGrade(null);
      setPhase('quiz');
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const submitQuiz = async () => {
    if (!activeAttempt) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = questions.map((question) => ({
        questionId: question.id,
        selectedIndex: answers[question.id] ?? null,
      }));
      const res = await fetch('/api/training/wordpress-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit', attemptId: activeAttempt.id, answers: payload }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error || 'Unable to submit the quiz.');
        return;
      }
      setGrade(body.grade);
      setPayTier(body.payTier || null);
      setPhase('result');
      await load();
      onCompleted?.();
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setOpen(false);
    resetQuizState();
  };

  const openModal = () => {
    setOpen(true);
    setPhase('intro');
    setGrade(null);
  };

  const answeredCount = questions.filter((question) => answers[question.id] !== undefined).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const latest = data?.latestResult;
  const passed = latest?.overridePassed ?? latest?.passed ?? false;
  const hasResult = Boolean(latest && latest.status !== 'assigned' && latest.status !== 'in_progress');

  if (loading) return null;

  if (!data || !data.eligible) {
    return null;
  }

  return (
    <>
      {showTrigger && (
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-xl gradient-bg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <span>🧩</span>
          <span>
            {data.quiz
              ? hasResult
                ? passed
                  ? 'Certification passed — view result'
                  : 'Retry certification quiz'
                : 'Take certification quiz'
              : 'Certification quiz unavailable'}
          </span>
        </button>
      )}

      {open && data.quiz && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-muted-lighter px-6 py-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-miami-blue-beach">
                  Separate certification quiz
                </div>
                <h2 className="font-heading text-xl font-black text-dark-800">{data.quiz.title}</h2>
                <p className="mt-1 text-xs text-dark-500">
                  {questions.length || data.questions.length} questions · Pass at {data.quiz.passingScore}% ·
                  5 Enfold + 5 WordPress fundamentals
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-2 py-1 text-xl leading-none text-dark-400 transition hover:bg-muted-lighter hover:text-dark-700"
                aria-label="Close quiz"
              >
                ×
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {phase === 'intro' && (
                <div className="space-y-4">
                  <p className="text-sm text-dark-600">{data.quiz.description}</p>
                  <div className="rounded-xl border border-muted-lighter bg-[#F8F9FC] p-4 text-sm text-dark-600">
                    <p className="font-semibold text-dark-800">Before you start</p>
                    <ul className="mt-2 space-y-1.5">
                      <li>• The quiz is graded on the server. Your browser score is never trusted.</li>
                      <li>• Answer all 10 questions. Unanswered questions count as incorrect.</li>
                      <li>• Pass at {data.quiz.passingScore}% to unlock the certified pay tier.</li>
                      <li>• A failed attempt keeps the standard rate. You can retry after reviewing the module.</li>
                      <li>• An admin can review and override a result.</li>
                    </ul>
                  </div>

                  {payTier && (
                    <div className="rounded-xl border border-miami-blue-light/30 bg-miami-blue-beach/5 px-4 py-3 text-sm text-dark-700">
                      Current pay tier: <span className="font-semibold capitalize">{payTier.tier}</span>
                      {payTier.tier === 'certified' && payTier.certifiedRate
                        ? ` · certified rate $${payTier.certifiedRate}`
                        : ''}
                    </div>
                  )}

                  {hasResult && latest && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        passed
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                    >
                      <p className="font-semibold">
                        Last attempt #{latest.attemptNumber}: {latest.overrideScore ?? latest.score}/{latest.maxScore} (
                        {latest.percentage}%) — {passed ? 'Passed' : 'Not passed'}
                      </p>
                      {latest.reviewNotes && <p className="mt-1 whitespace-pre-wrap">{latest.reviewNotes}</p>}
                    </div>
                  )}

                  {data.attempt && (
                    <p className="text-sm text-dark-600">
                      You have an open attempt #{data.attempt.attemptNumber}. Continue where you left off.
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {passed ? (
                      <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startQuiz}
                        disabled={submitting}
                        className="rounded-xl gradient-bg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {submitting ? 'Preparing…' : data.attempt ? 'Resume quiz' : hasResult ? 'Retry quiz' : 'Start quiz'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {phase === 'quiz' && (
                <div className="space-y-5">
                  <div className="sticky top-0 z-10 -mx-6 -mt-5 border-b border-muted-lighter bg-white/95 px-6 py-3 backdrop-blur">
                    <div className="flex items-center justify-between text-xs font-semibold text-dark-500">
                      <span>
                        {answeredCount} of {questions.length} answered
                      </span>
                      <span>Pass at {data.quiz.passingScore}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted-lighter">
                      <div
                        className="h-full rounded-full gradient-bg transition-all"
                        style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {questions.map((question, index) => (
                    <div key={question.id} className="rounded-xl border border-muted-lighter p-4">
                      <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-wide text-miami-blue-beach">
                        <span>Q{index + 1}</span>
                        <span>·</span>
                        <span>{categoryLabel(question.category)}</span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-dark-800">{question.prompt}</p>
                      <div className="mt-3 space-y-2">
                        {question.options.map((option, optionIndex) => {
                          const selected = answers[question.id] === optionIndex;
                          return (
                            <label
                              key={optionIndex}
                              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                                selected
                                  ? 'border-miami-blue-beach bg-miami-blue-beach/5 text-dark-800'
                                  : 'border-muted-lighter bg-white text-dark-600 hover:border-miami-blue-light'
                              }`}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                className="mt-0.5"
                                checked={selected}
                                onChange={() =>
                                  setAnswers((current) => ({ ...current, [question.id]: optionIndex }))
                                }
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-xl border border-muted-lighter px-4 py-2.5 text-sm font-semibold text-dark-600"
                    >
                      Save and close
                    </button>
                    <button
                      type="button"
                      onClick={submitQuiz}
                      disabled={submitting || !allAnswered}
                      className="rounded-xl gradient-bg px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? 'Submitting…' : allAnswered ? 'Submit quiz' : `Answer all ${questions.length} questions`}
                    </button>
                  </div>
                </div>
              )}

              {phase === 'result' && grade && (
                <div className="space-y-4">
                  <div
                    className={`rounded-2xl border p-5 text-center ${
                      grade.passed
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className="text-4xl">{grade.passed ? '🎉' : '📚'}</div>
                    <div className="mt-2 font-heading text-2xl font-black text-dark-800">
                      {grade.score}/{grade.maxScore} · {grade.percentage}%
                    </div>
                    <div className={`mt-1 text-sm font-semibold ${grade.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {grade.passed
                        ? 'Passed — certified pay tier unlocked'
                        : `Not passed — ${data.quiz.passingScore}% required`}
                    </div>
                    <p className="mt-2 text-xs text-dark-500">
                      {grade.passed
                        ? 'Your result was saved. An admin may still review it.'
                        : 'Your result was saved. Review the module and retry when ready. The standard rate applies until you pass.'}
                    </p>
                    {payTier && (
                      <p className="mt-2 text-xs text-dark-600">
                        Current pay tier: <span className="font-semibold capitalize">{payTier.tier}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {questions.map((question, index) => {
                      const graded = grade.answers.find((answer) => answer.questionId === question.id);
                      const correct = graded?.correct ?? false;
                      return (
                        <div
                          key={question.id}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            correct ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/60'
                          }`}
                        >
                          <p className="font-medium text-dark-800">
                            Q{index + 1}. {question.prompt}
                          </p>
                          {!correct && (
                            <p className="mt-1 text-xs text-dark-600">
                              Correct answer: <span className="font-semibold">{question.options[graded?.correctIndex ?? 0]}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-xl gradient-bg px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Done
                    </button>
                    {!grade.passed && (
                      <button
                        type="button"
                        onClick={startQuiz}
                        disabled={submitting}
                        className="rounded-xl border border-muted-lighter px-4 py-2.5 text-sm font-semibold text-dark-600 disabled:opacity-60"
                      >
                        Retry now
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
