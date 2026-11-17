import { describe, it, expect } from 'vitest';
import {
  CERTIFIED_RATE_MULTIPLIER,
  WORDPRESS_QUIZ_QUESTIONS,
  WORDPRESS_QUIZ_QUESTION_COUNT,
  asStringArray,
  computePayTier,
  gradeQuiz,
  hasWordPressDeveloperRole,
  suggestCertifiedRate,
  toPublicQuestions,
  validateQuestionBank,
  type QuizQuestionSeed,
} from '@/lib/wordpress-quiz';

function seededQuestions() {
  return WORDPRESS_QUIZ_QUESTIONS.map((question, index) => ({
    id: `q-${index + 1}`,
    key: question.key,
    category: question.category,
    prompt: question.prompt,
    options: question.options,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    order: question.order,
  }));
}

describe('WordPress certification question bank', () => {
  it('is valid and exactly 10 questions', () => {
    expect(validateQuestionBank(WORDPRESS_QUIZ_QUESTIONS)).toEqual([]);
    expect(WORDPRESS_QUIZ_QUESTIONS).toHaveLength(WORDPRESS_QUIZ_QUESTION_COUNT);
    expect(WORDPRESS_QUIZ_QUESTION_COUNT).toBe(10);
  });

  it('has 5 Enfold and 5 WordPress fundamentals questions', () => {
    expect(WORDPRESS_QUIZ_QUESTIONS.filter((q) => q.category === 'enfold')).toHaveLength(5);
    expect(WORDPRESS_QUIZ_QUESTIONS.filter((q) => q.category === 'wordpress-basics')).toHaveLength(5);
  });

  it('has unique keys and valid answers', () => {
    const keys = new Set(WORDPRESS_QUIZ_QUESTIONS.map((q) => q.key));
    expect(keys.size).toBe(WORDPRESS_QUIZ_QUESTIONS.length);
    for (const question of WORDPRESS_QUIZ_QUESTIONS) {
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(question.options.length);
      expect(question.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('flags an invalid bank', () => {
    const broken: QuizQuestionSeed[] = [
      {
        key: 'only-one',
        category: 'enfold',
        prompt: '',
        options: ['A'],
        correctIndex: 5,
        explanation: '',
        order: 1,
      },
    ];
    const errors = validateQuestionBank(broken);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.join(' ')).toMatch(/Expected exactly 10/);
    expect(errors.join(' ')).toMatch(/invalid correctIndex/);
  });
});

describe('toPublicQuestions', () => {
  it('never leaks the answer key or explanations', () => {
    const publicQuestions = toPublicQuestions(seededQuestions());
    expect(publicQuestions).toHaveLength(10);
    for (const question of publicQuestions) {
      expect(question).not.toHaveProperty('correctIndex');
      expect(question).not.toHaveProperty('explanation');
      expect(Array.isArray(question.options)).toBe(true);
    }
  });
});

describe('gradeQuiz', () => {
  it('passes at 80% or higher', () => {
    const questions = seededQuestions();
    const answers = questions.slice(0, 8).map((question) => ({
      questionId: question.id,
      selectedIndex: question.correctIndex,
    }));

    const grade = gradeQuiz(questions, answers, 80);
    expect(grade.score).toBe(8);
    expect(grade.maxScore).toBe(10);
    expect(grade.percentage).toBe(80);
    expect(grade.passed).toBe(true);
  });

  it('fails below 80%', () => {
    const questions = seededQuestions();
    const answers = questions.slice(0, 7).map((question) => ({
      questionId: question.id,
      selectedIndex: question.correctIndex,
    }));

    const grade = gradeQuiz(questions, answers, 80);
    expect(grade.score).toBe(7);
    expect(grade.percentage).toBe(70);
    expect(grade.passed).toBe(false);
  });

  it('counts unanswered and out-of-range selections as incorrect', () => {
    const questions = seededQuestions();
    const answers = [
      { questionId: questions[0].id, selectedIndex: questions[0].correctIndex },
      { questionId: questions[1].id, selectedIndex: 999 },
      { questionId: 'unknown-question', selectedIndex: 0 },
    ];

    const grade = gradeQuiz(questions, answers, 80);
    expect(grade.score).toBe(1);
    expect(grade.answers.find((a) => a.questionId === questions[1].id)?.correct).toBe(false);
    expect(grade.answers.find((a) => a.questionId === questions[1].id)?.selectedIndex).toBeNull();
  });

  it('ignores a browser-supplied score entirely', () => {
    const questions = seededQuestions();
    const grade = gradeQuiz(questions, [], 80);
    expect(grade.score).toBe(0);
    expect(grade.percentage).toBe(0);
    expect(grade.passed).toBe(false);
  });
});

describe('pay tier helpers', () => {
  it('maps pass/fail to the certified/standard tier', () => {
    expect(computePayTier(true)).toBe('certified');
    expect(computePayTier(false)).toBe('standard');
    expect(computePayTier(null)).toBe('standard');
    expect(computePayTier(undefined)).toBe('standard');
  });

  it('suggests a certified rate with the multiplier', () => {
    expect(suggestCertifiedRate(40)).toBe(Math.round(40 * CERTIFIED_RATE_MULTIPLIER * 100) / 100);
    expect(suggestCertifiedRate(0)).toBe(0);
    expect(suggestCertifiedRate(null)).toBeNull();
    expect(suggestCertifiedRate(undefined)).toBeNull();
    expect(suggestCertifiedRate(Number.NaN)).toBeNull();
  });
});

describe('eligibility helpers', () => {
  it('accepts the role as primary or approved', () => {
    expect(hasWordPressDeveloperRole('wordpress-developer', [])).toBe(true);
    expect(hasWordPressDeveloperRole('developer', ['wordpress-developer'])).toBe(true);
    expect(hasWordPressDeveloperRole('developer', ['designer'])).toBe(false);
    expect(hasWordPressDeveloperRole(null, [])).toBe(false);
  });
});

describe('asStringArray', () => {
  it('keeps only strings', () => {
    expect(asStringArray(['a', 1, null, 'b'])).toEqual(['a', 'b']);
    expect(asStringArray('not-an-array')).toEqual([]);
    expect(asStringArray(null)).toEqual([]);
  });
});
