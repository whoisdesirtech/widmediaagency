/**
 * WordPress Developer certification quiz — source of truth for the question bank,
 * grading, and pay-tier rules.
 *
 * The quiz is deliberately separate from the training module. Contractors must
 * complete the module first, then pass this 10-question intermediate quiz to move
 * from the standard pay tier to the certified (higher) pay tier.
 */

export const WORDPRESS_DEVELOPER_ROLE = 'wordpress-developer';
export const WORDPRESS_QUIZ_SLUG = 'wordpress-developer-certification';
export const WORDPRESS_QUIZ_PASSING_SCORE = 80;
export const WORDPRESS_QUIZ_QUESTION_COUNT = 10;

export const CERTIFIED_RATE_MULTIPLIER = 1.25;

export type QuizCategory = 'enfold' | 'wordpress-basics';
export type PayTier = 'standard' | 'certified';

export type QuizQuestionSeed = {
  key: string;
  category: QuizCategory;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  order: number;
  difficulty?: string;
};

export type PublicQuizQuestion = {
  id: string;
  key: string;
  category: string;
  prompt: string;
  options: string[];
  order: number;
};

export type SubmittedAnswer = {
  questionId: string;
  selectedIndex: number | null;
};

export type QuizQuestionLike = {
  id: string;
  key?: string;
  category?: string;
  prompt?: string;
  options: unknown;
  correctIndex: number;
  explanation?: string | null;
  order?: number;
};

export type GradedAnswer = {
  questionId: string;
  selectedIndex: number | null;
  correctIndex: number;
  correct: boolean;
};

export type QuizGrade = {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  answers: GradedAnswer[];
};

export const WORDPRESS_QUIZ_SEED = {
  slug: WORDPRESS_QUIZ_SLUG,
  title: 'WordPress Developer Certification',
  description:
    'Intermediate certification for WordPress developers working in Enfold. 5 Enfold questions and 5 WordPress fundamentals questions. Pass at 80% to unlock the certified pay tier.',
  targetRole: WORDPRESS_DEVELOPER_ROLE,
  passingScore: WORDPRESS_QUIZ_PASSING_SCORE,
  isActive: true,
} as const;

/**
 * Exactly 10 questions: 5 Enfold Theme and 5 WordPress fundamentals.
 * Intermediate difficulty. Sourced from the Dr. Kedner Maxime SOP / workshop
 * (duplicate-page workflow, Enfold headings, responsive embeds, Yoast SEO).
 */
export const WORDPRESS_QUIZ_QUESTIONS: QuizQuestionSeed[] = [
  // --- Enfold Theme (5) ---
  {
    key: 'enfold-heading-hierarchy',
    category: 'enfold',
    prompt:
      'Which heading structure matches the SOP for an Enfold city landing page?',
    options: [
      'Use several H1 headings, one for each service section.',
      'Use one H1 for the page, H2 headings for major sections, and H3 headings nested under the related H2.',
      'Put the H1 in the sidebar and use H2 for the page title.',
      'Make every heading an H1 so search engines see every topic.',
    ],
    correctIndex: 1,
    explanation:
      'The SOP requires one H1 and a logical hierarchy of H2 and H3 headings. The WordPress Page Name is provided separately from the H1.',
    order: 1,
  },
  {
    key: 'enfold-duplicate-page-uniqueness',
    category: 'enfold',
    prompt:
      'You duplicate the main WhoIsDésir landing page for Plantation, Sunrise, and Tamarac. What must change on each duplicate?',
    options: [
      'Only the city name in the H1.',
      'Only the URL slug and featured image.',
      'The local introduction, business context, FAQs, headings, Yoast metadata, and internal links so the page is genuinely unique.',
      'Nothing. Search engines automatically treat duplicated pages as separate city pages.',
    ],
    correctIndex: 2,
    explanation:
      'Each city page must serve a distinct local purpose. Swapping only the city name is doorway-page behaviour and is explicitly prohibited in the SOP.',
    order: 2,
  },
  {
    key: 'enfold-responsive-video-embed',
    category: 'enfold',
    prompt:
      'Which embed setup matches the SOP for a horizontal campaign video in Enfold?',
    options: [
      'A fixed 1920px-wide iframe so it always looks sharp.',
      'A responsive container using a 16:9 aspect ratio with a 100%-width iframe.',
      'A 9:16 container forced to full width on desktop.',
      'An iframe with scrolling enabled and a fixed pixel height.',
    ],
    correctIndex: 1,
    explanation:
      'Use responsive 16:9 containers for horizontal video and 9:16 for vertical video. Preserve margins, prevent horizontal scrolling, and let the player resize.',
    order: 3,
  },
  {
    key: 'enfold-pre-publish-qa',
    category: 'enfold',
    prompt:
      'Before publishing a duplicated Enfold page, which quality-assurance check is required?',
    options: [
      'Check the page only in the WordPress preview at desktop size.',
      'Test desktop, tablet, and iPhone/Android-sized viewports; confirm no horizontal scrolling, preserved margins, and working video playback.',
      'Disable responsive mode so the layout stays fixed.',
      'Publish first and ask the client to test it afterwards.',
    ],
    correctIndex: 1,
    explanation:
      'The SOP requires desktop and mobile QA, including Chrome desktop, iPhone-sized and Android-sized viewports, responsive video scaling, text alignment, margins, and playback.',
    order: 4,
  },
  {
    key: 'enfold-page-name-vs-h1',
    category: 'enfold',
    prompt:
      'How should the WordPress Page Name be handled relative to the H1 on an Enfold page?',
    options: [
      'Paste the page name into the H1 exactly as written.',
      'Provide the page name separately from the H1; the H1 is the on-page headline.',
      'Let the page name replace the H1 in Enfold.',
      'Use the page name only as the Yoast meta description.',
    ],
    correctIndex: 1,
    explanation:
      'The SOP says to always provide the WordPress Page Name separately from the H1. The H1 is the visitor-facing headline, while the page name drives the WordPress page title and administration.',
    order: 5,
  },

  // --- WordPress fundamentals (5) ---
  {
    key: 'wp-slug-controls',
    category: 'wordpress-basics',
    prompt: 'What does the WordPress slug control?',
    options: [
      'The page URL path/permalink.',
      'The page H1 heading.',
      'The Yoast focus keyphrase.',
      'The order of pages in the navigation menu.',
    ],
    correctIndex: 0,
    explanation:
      'The slug is the URL-friendly version of the page name and forms the permalink path, for example /plantation-florida-media-agency/.',
    order: 6,
  },
  {
    key: 'wp-yoast-fields-location',
    category: 'wordpress-basics',
    prompt:
      'Where do you edit the Yoast SEO title and meta description for a page?',
    options: [
      'In the WordPress Media Library.',
      'In the Yoast SEO meta box/panel while editing the page.',
      'In Settings → Permissions.',
      'Only in the Enfold theme options panel.',
    ],
    correctIndex: 1,
    explanation:
      'The Yoast SEO meta box (or sidebar panel in the block editor) is where you set the SEO title, meta description, focus keyphrase, canonical URL, and social sharing fields.',
    order: 7,
  },
  {
    key: 'wp-canonical-url',
    category: 'wordpress-basics',
    prompt: 'What is the purpose of a canonical URL?',
    options: [
      'It forces every visitor to log in before viewing the page.',
      'It tells search engines which URL is the preferred version when duplicate or similar URLs exist.',
      'It sets the page featured image automatically.',
      'It redirects every visitor to the homepage.',
    ],
    correctIndex: 1,
    explanation:
      'A canonical URL signals the preferred version of a page to search engines, which helps consolidate ranking signals when similar or duplicate URLs exist.',
    order: 8,
  },
  {
    key: 'wp-pages-vs-posts',
    category: 'wordpress-basics',
    prompt: 'Which statement about WordPress pages and posts is correct?',
    options: [
      'Pages are for chronological blog entries; posts are for static landing pages.',
      'Pages are hierarchical and static, making them suitable for landing pages; posts are chronological and suitable for blog content.',
      'Pages cannot use Yoast metadata, but posts can.',
      'Posts cannot be duplicated, but pages can.',
    ],
    correctIndex: 1,
    explanation:
      'Pages are static and hierarchical, which is why city landing pages belong on pages. Posts are ordered chronologically and are used for blog or news content.',
    order: 9,
  },
  {
    key: 'wp-image-alt-text',
    category: 'wordpress-basics',
    prompt: 'Why is image alt text important in WordPress?',
    options: [
      'It controls the image file size.',
      'It describes the image for accessibility and image SEO.',
      'It sets the image publish date.',
      'It replaces the need for a meta description.',
    ],
    correctIndex: 1,
    explanation:
      'Alt text describes the image for screen readers and search engines. The SOP also requires descriptive filenames and alt text for video thumbnails and images.',
    order: 10,
  },
];

export function isWordPressDeveloperRole(role: string | null | undefined): boolean {
  return role === WORDPRESS_DEVELOPER_ROLE;
}

export function hasWordPressDeveloperRole(
  primaryRole: string | null | undefined,
  approvedRoles: Array<string | null | undefined> = []
): boolean {
  if (isWordPressDeveloperRole(primaryRole)) return true;
  return approvedRoles.some((role) => isWordPressDeveloperRole(role));
}

export function quizCategoryLabel(category: string): string {
  if (category === 'enfold') return 'Enfold Theme';
  if (category === 'wordpress-basics') return 'WordPress Fundamentals';
  return category;
}

export function payTierLabel(tier: string | null | undefined): string {
  return tier === 'certified' ? 'Certified (higher rate)' : 'Standard rate';
}

export function computePayTier(passed: boolean | null | undefined): PayTier {
  return passed ? 'certified' : 'standard';
}

export function suggestCertifiedRate(standardRate: number | null | undefined): number | null {
  if (standardRate === null || standardRate === undefined || !Number.isFinite(standardRate)) {
    return null;
  }
  return Math.round(standardRate * CERTIFIED_RATE_MULTIPLIER * 100) / 100;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

/**
 * Strips the answer key and explanation before sending questions to a contractor.
 */
export function toPublicQuestions(questions: QuizQuestionLike[]): PublicQuizQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    key: question.key || question.id,
    category: question.category || 'wordpress-basics',
    prompt: question.prompt || '',
    options: asStringArray(question.options),
    order: question.order ?? 0,
  }));
}

function normalizeAnswer(answer: SubmittedAnswer): SubmittedAnswer {
  const selected =
    typeof answer.selectedIndex === 'number' && Number.isInteger(answer.selectedIndex)
      ? answer.selectedIndex
      : null;
  return { questionId: answer.questionId, selectedIndex: selected };
}

/**
 * Grades a submission on the server. Never trust a score sent by the browser.
 * Unanswered or out-of-range selections count as incorrect.
 */
export function gradeQuiz(
  questions: QuizQuestionLike[],
  submittedAnswers: SubmittedAnswer[],
  passingScore: number = WORDPRESS_QUIZ_PASSING_SCORE
): QuizGrade {
  const answerMap = new Map<string, SubmittedAnswer>();
  for (const raw of submittedAnswers) {
    if (!raw || typeof raw.questionId !== 'string') continue;
    answerMap.set(raw.questionId, normalizeAnswer(raw));
  }

  const gradedAnswers: GradedAnswer[] = questions.map((question) => {
    const options = asStringArray(question.options);
    const selected = answerMap.get(question.id)?.selectedIndex ?? null;
    const inRange = selected !== null && selected >= 0 && selected < options.length;
    return {
      questionId: question.id,
      selectedIndex: inRange ? selected : null,
      correctIndex: question.correctIndex,
      correct: inRange && selected === question.correctIndex,
    };
  });

  const maxScore = questions.length;
  const score = gradedAnswers.filter((answer) => answer.correct).length;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return {
    score,
    maxScore,
    percentage,
    passed: maxScore > 0 && percentage >= passingScore,
    answers: gradedAnswers,
  };
}

export function validateQuestionBank(questions: QuizQuestionSeed[]): string[] {
  const errors: string[] = [];
  const keys = new Set<string>();

  if (questions.length !== WORDPRESS_QUIZ_QUESTION_COUNT) {
    errors.push(`Expected exactly ${WORDPRESS_QUIZ_QUESTION_COUNT} questions, found ${questions.length}.`);
  }

  const enfoldCount = questions.filter((question) => question.category === 'enfold').length;
  const basicsCount = questions.filter((question) => question.category === 'wordpress-basics').length;
  if (enfoldCount !== 5) errors.push(`Expected 5 Enfold questions, found ${enfoldCount}.`);
  if (basicsCount !== 5) errors.push(`Expected 5 WordPress fundamentals questions, found ${basicsCount}.`);

  for (const question of questions) {
    if (keys.has(question.key)) errors.push(`Duplicate question key: ${question.key}`);
    keys.add(question.key);

    if (question.options.length < 2) {
      errors.push(`Question ${question.key} needs at least two options.`);
    }
    if (
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.options.length
    ) {
      errors.push(`Question ${question.key} has an invalid correctIndex.`);
    }
    if (!question.prompt.trim()) errors.push(`Question ${question.key} is missing a prompt.`);
    if (!question.explanation.trim()) errors.push(`Question ${question.key} is missing an explanation.`);
  }

  return errors;
}
