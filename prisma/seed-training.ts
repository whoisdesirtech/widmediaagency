import { PrismaClient } from '@prisma/client';
import {
  WORDPRESS_QUIZ_QUESTIONS,
  WORDPRESS_QUIZ_SEED,
  validateQuestionBank,
} from '../src/lib/wordpress-quiz';

const prisma = new PrismaClient();

const lessons = [
  {
    slug: 'contractor-onboarding',
    title: 'Contractor Onboarding',
    description: 'Essential onboarding for new contractors — portal, SOW, contracts, Drive, and deliverables.',
    targetRole: 'contractor',
    requiresGithub: false,
    requiresSlack: false,
    steps: [
      { id: 'login', title: 'How to Log In', order: 1 },
      { id: 'portal-overview', title: 'Portal Overview', order: 2 },
      { id: 'sow', title: 'Viewing Your SOW', order: 3 },
      { id: 'documents', title: 'Uploading Documents', order: 4 },
      { id: 'contract', title: 'Reviewing & Signing Contract', order: 5 },
      { id: 'drive', title: 'Google Drive Upload', order: 6 },
      { id: 'deliverables', title: 'Projects & Deliverables', order: 7 },
    ],
  },
  {
    slug: 'developer-full',
    title: 'Full Developer Training',
    description: 'Complete developer training — architecture, auth, API routes, git workflow, and security.',
    targetRole: 'developer',
    requiresGithub: true,
    requiresSlack: false,
    steps: [
      { id: 'welcome-project-overview', title: 'Welcome & Project Overview', order: 1 },
      { id: 'technology-stack', title: 'Technology Stack', order: 2 },
      { id: 'business-architecture', title: 'Business Architecture', order: 3 },
      { id: 'database-schema', title: 'Database Schema', order: 4 },
      { id: 'authentication-authorization', title: 'Authentication & Authorization', order: 5 },
      { id: 'project-structure', title: 'Project Structure', order: 6 },
      { id: 'api-route-reference', title: 'API Route Reference', order: 7 },
      { id: 'git-workflow-commit-standards', title: 'Git Workflow & Commit Standards', order: 8 },
      { id: 'testing', title: 'Testing', order: 9 },
      { id: 'deployment', title: 'Deployment', order: 10 },
      { id: 'google-drive-integration', title: 'Google Drive Integration', order: 11 },
      { id: 'security-rules', title: 'Security Rules', order: 12 },
      { id: 'common-mistakes', title: 'Common Mistakes', order: 13 },
      { id: 'first-task-recommendation', title: 'First Task Recommendation', order: 14 },
      { id: 'developer-golden-rules', title: 'Developer Golden Rules', order: 15 },
      { id: 'final-checklist', title: 'Final Checklist', order: 16 },
    ],
  },
  {
    slug: 'developer-intern',
    title: 'Intern Training',
    description: 'Abbreviated developer training for interns making small features.',
    targetRole: 'intern',
    requiresGithub: true,
    requiresSlack: false,
    steps: [
      { id: 'what-is-this-project', title: 'What Is This Project?', order: 1 },
      { id: 'setup', title: 'Setup (5 minutes)', order: 2 },
      { id: 'git-workflow', title: 'Git Workflow (Follow Exactly)', order: 3 },
      { id: 'auth-guard-rule', title: 'The ONE Rule That Matters', order: 4 },
      { id: 'where-things-are', title: 'Where Things Are', order: 5 },
      { id: 'google-drive-integration', title: 'Google Drive Integration', order: 6 },
      { id: 'what-not-to-touch', title: 'What NOT to Touch', order: 7 },
      { id: 'how-to-test', title: 'How to Test Your Changes', order: 8 },
      { id: 'commit-messages', title: 'How to Write a Commit Message', order: 9 },
      { id: 'how-to-ask-for-help', title: 'How to Ask for Help', order: 10 },
      { id: 'your-first-task', title: 'Your First Task', order: 11 },
      { id: 'quick-reference', title: 'Quick Reference', order: 12 },
    ],
  },
  {
    slug: 'slack-fundamentals',
    title: 'Slack Fundamentals',
    description: 'Learn to use Slack for team communication — workspace, channels, messages, and threads.',
    targetRole: 'contractor',
    requiresGithub: false,
    requiresSlack: true,
    steps: [
      { id: 'join-workspace', title: 'Join the Slack Workspace', order: 1 },
      { id: 'profile', title: 'Complete Your Profile', order: 2 },
      { id: 'channels', title: 'Understand Channels', order: 3 },
      { id: 'post-message', title: 'Post Your First Message', order: 4 },
      { id: 'threads', title: 'Reply to a Thread', order: 5 },
      { id: 'communication', title: 'Slack Communication Best Practices', order: 6 },
      { id: 'verification', title: 'Verify Your Account', order: 7 },
    ],
  },
  {
    slug: 'wordpress-developer',
    title: 'WordPress Developer Training',
    description:
      'Enfold city landing pages, the SOP workflow, responsive embeds, Yoast SEO fields, QA, and delivery.',
    targetRole: 'wordpress-developer',
    requiresGithub: false,
    requiresSlack: false,
    steps: [
      { id: 'role-overview', title: 'Role Overview & Access', order: 1 },
      { id: 'account-access', title: 'Account Access & Login', order: 2 },
      { id: 'content-ai', title: 'Creating Content with AI', order: 3 },
      { id: 'content-spreadsheet', title: 'Adding Content to the Spreadsheet', order: 4 },
      { id: 'duplicate-page', title: 'Duplicating the City Page in Enfold', order: 5 },
      { id: 'add-content', title: 'Adding Content to New Pages Properly', order: 6 },
      { id: 'enfold-headings', title: 'Enfold Headings & Layout Rules', order: 7 },
      { id: 'responsive-video-embeds', title: 'Responsive Video Embeds', order: 8 },
      { id: 'yoast-seo', title: 'Yoast SEO Fields', order: 9 },
      { id: 'visual-qa', title: 'Visual QA — Desktop & Mobile', order: 10 },
      { id: 'delivery-reporting', title: 'Delivery & Reporting', order: 11 },
    ],
  },
];

async function seedWordPressQuiz() {
  const errors = validateQuestionBank(WORDPRESS_QUIZ_QUESTIONS);
  if (errors.length > 0) {
    throw new Error(`WordPress quiz question bank is invalid:\n  - ${errors.join('\n  - ')}`);
  }

  const quiz = await prisma.trainingQuiz.upsert({
    where: { slug: WORDPRESS_QUIZ_SEED.slug },
    update: {
      title: WORDPRESS_QUIZ_SEED.title,
      description: WORDPRESS_QUIZ_SEED.description,
      targetRole: WORDPRESS_QUIZ_SEED.targetRole,
      passingScore: WORDPRESS_QUIZ_SEED.passingScore,
      isActive: WORDPRESS_QUIZ_SEED.isActive,
    },
    create: {
      slug: WORDPRESS_QUIZ_SEED.slug,
      title: WORDPRESS_QUIZ_SEED.title,
      description: WORDPRESS_QUIZ_SEED.description,
      targetRole: WORDPRESS_QUIZ_SEED.targetRole,
      passingScore: WORDPRESS_QUIZ_SEED.passingScore,
      isActive: WORDPRESS_QUIZ_SEED.isActive,
    },
  });

  let createdQuestions = 0;
  let updatedQuestions = 0;

  for (const question of WORDPRESS_QUIZ_QUESTIONS) {
    const existing = await prisma.quizQuestion.findUnique({
      where: { quizId_key: { quizId: quiz.id, key: question.key } },
    });

    const data = {
      category: question.category,
      prompt: question.prompt,
      options: question.options,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      difficulty: question.difficulty ?? 'intermediate',
      order: question.order,
      isActive: true,
    };

    if (existing) {
      await prisma.quizQuestion.update({ where: { id: existing.id }, data });
      updatedQuestions++;
    } else {
      await prisma.quizQuestion.create({
        data: {
          ...data,
          quizId: quiz.id,
          key: question.key,
        },
      });
      createdQuestions++;
    }
  }

  const enfold = WORDPRESS_QUIZ_QUESTIONS.filter((q) => q.category === 'enfold').length;
  const basics = WORDPRESS_QUIZ_QUESTIONS.filter((q) => q.category === 'wordpress-basics').length;

  console.log(
    `\nWordPress certification quiz: ${createdQuestions} questions created, ${updatedQuestions} updated (${enfold} Enfold, ${basics} WordPress basics, pass ${WORDPRESS_QUIZ_SEED.passingScore}%)`
  );
}

async function main() {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const lesson of lessons) {
    const existing = await prisma.trainingLesson.findUnique({ where: { slug: lesson.slug } });
    if (existing) {
      // Update requiresGithub and requiresSlack if changed
      const updates: { requiresGithub?: boolean; requiresSlack?: boolean } = {};
      if (existing.requiresGithub !== lesson.requiresGithub) updates.requiresGithub = lesson.requiresGithub;
      if ('requiresSlack' in lesson && existing.requiresSlack !== (lesson as { requiresSlack?: boolean }).requiresSlack) {
        updates.requiresSlack = (lesson as { requiresSlack: boolean }).requiresSlack;
      }
      if (Object.keys(updates).length > 0) {
        await prisma.trainingLesson.update({
          where: { slug: lesson.slug },
          data: updates,
        });
        updated++;
      } else {
        skipped++;
      }
      continue;
    }
    await prisma.trainingLesson.create({ data: lesson });
    created++;
  }

  console.log(`\nTraining lessons: ${created} created, ${updated} updated, ${skipped} unchanged`);
  console.log('Canonical lessons:');
  for (const l of lessons) {
    console.log(`  - ${l.slug} (${l.steps.length} steps, requiresGithub: ${l.requiresGithub}, requiresSlack: ${(l as { requiresSlack?: boolean }).requiresSlack || false})`);
  }

  await seedWordPressQuiz();
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
