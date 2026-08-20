import { PrismaClient } from '@prisma/client';

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
];

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
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
