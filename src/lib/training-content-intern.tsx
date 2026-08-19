'use client';

export default function InternTraining() {
  return (
    <div className="prose prose-invert max-w-none">
      {/* 1. What Is This Project? */}
      <h2>1. What Is This Project?</h2>
      <p>
        <strong>WhoIsDésir® Media Agency Platform</strong> — a &quot;Creative Business Operations Platform&quot;
        for a media agency. It manages contractors, clients, projects, contracts, deliverables, and media delivery.
      </p>
      <p>
        <strong>You are NOT building a marketplace.</strong> You are building features for a single agency&apos;s
        internal operations platform.
      </p>
      <p>
        <strong>Live site:</strong> https://whoisdesirmediaagency.vercel.app
        <br />
        <strong>Version:</strong> 1.2.0
      </p>

      {/* 2. Setup */}
      <h2>2. Setup (5 minutes)</h2>
      <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`# Clone
git clone https://github.com/whoisdesirtech/widmediaagency.git
cd whoisdesir-media

# Install
npm install

# Environment
cp .env.example .env   # Ask project owner for actual values

# Run
npm run dev`}
      </pre>
      <p>
        Open http://localhost:3000. Login with credentials provided by the project owner.
      </p>
      <p>
        <strong>Need help?</strong> Ask the project owner for:
      </p>
      <ul>
        <li>.env file contents (database URL, NextAuth secret, Google Drive keys)</li>
        <li>Login credentials for testing</li>
      </ul>

      {/* 3. Git Workflow */}
      <h2>3. Git Workflow (Follow Exactly)</h2>
      <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`main (production)
  └── feat/your-feature-name (your work)
       └── commit → push → pull request → review → merge`}
      </pre>
      <p><strong>Rules:</strong></p>
      <ol>
        <li>NEVER work directly on <code>main</code></li>
        <li>Create a branch: <code>git checkout -b feat/description</code></li>
        <li>Make your changes</li>
        <li>Commit with a clear message</li>
        <li>Push: <code>git push origin feat/description</code></li>
        <li>Create a Pull Request on GitHub</li>
        <li>Wait for review before merging</li>
      </ol>
      <p><strong>Commit messages:</strong></p>
      <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`feat: add category field to notifications
fix: correct date format in deliverables
chore: update training page content`}
      </pre>

      {/* 4. The ONE Rule That Matters */}
      <h2>4. The ONE Rule That Matters</h2>
      <p><strong>Every API route MUST start with an auth guard.</strong></p>
      <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`// ✅ CORRECT — every route handler starts like this:
export async function GET(req: Request) {
  const user = await requireAuth(['admin', 'staff']);
  if (isNextResponse(user)) return user;
  // ... your code
}

// ❌ WRONG — missing auth guard:
export async function GET(req: Request) {
  // ... your code (anyone can access this!)
}`}
      </pre>
      <p><strong>Available guards:</strong></p>
      <ul>
        <li><code>requireAdmin()</code> — admin only</li>
        <li><code>requireAdminOrStaff()</code> — admin or staff</li>
        <li><code>requireAuth([&apos;role1&apos;, &apos;role2&apos;])</code> — any listed role</li>
        <li><code>requireClient()</code> — client only</li>
        <li><code>requireContractor()</code> — contractor only</li>
      </ul>
      <p><strong>ALWAYS check <code>isNextResponse()</code> after the guard.</strong></p>

      {/* 5. Where Things Are */}
      <h2>5. Where Things Are</h2>
      <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`src/
├── app/
│   ├── api/           → API routes (backend)
│   ├── admin/         → Admin pages
│   ├── contractor/    → Contractor pages
│   ├── client/        → Client pages
│   └── login/         → Login page
├── components/        → Shared UI components
├── lib/               → Utility code (auth, database, etc.)
└── middleware.ts       → CSRF protection (DON'T TOUCH)`}
      </pre>
      <p><strong>Key files:</strong></p>
      <ul>
        <li><code>src/lib/auth.ts</code> — Auth helpers (read this first)</li>
        <li><code>src/components/Sidebar.tsx</code> — Admin navigation</li>
        <li><code>src/components/ContractorSidebar.tsx</code> — Contractor navigation</li>
        <li><code>prisma/schema.prisma</code> — Database models</li>
        <li><code>AGENTS.md</code> — Full project instructions</li>
      </ul>

      {/* 6. Google Drive Integration */}
      <h2>6. Google Drive Integration</h2>
      <p>
        The platform uses <strong>Google Drive</strong> for file storage. Files are uploaded via a service account, not stored locally.
      </p>
      <p>
        <strong>How it works:</strong>
      </p>
      <ul>
        <li>Admin assigns a Google Drive folder to each contractor/client (paste the folder URL on their detail page)</li>
        <li>When a contractor uploads project files, they go directly to that assigned Drive folder</li>
        <li>The service account email (<code>widmedia-drive-upload@whoisdesir-media.iam.gserviceaccount.com</code>) must have <code>Editor</code> access to the folder</li>
      </ul>
      <p><strong>Key files:</strong></p>
      <ul>
        <li><code>src/lib/driveService.ts</code> — Drive API calls (upload, list, create folders)</li>
        <li><code>src/lib/drive.ts</code> — URL normalization helpers</li>
        <li><code>src/app/api/drive/upload/route.ts</code> — Upload endpoint</li>
        <li><code>src/app/contractor/projects/page.tsx</code> — Contractor upload UI</li>
      </ul>
      <p><strong>Do NOT modify:</strong> <code>src/lib/driveService.ts</code> without approval — it handles the Drive API integration.</p>

      {/* 7. What NOT to Touch */}
      <h2>6. What NOT to Touch</h2>
      <p>Unless explicitly told to:</p>
      <ul>
        <li>❌ <code>src/middleware.ts</code> — CSRF protection</li>
        <li>❌ <code>src/lib/auth.ts</code> — Authentication system</li>
        <li>❌ <code>src/lib/audit.ts</code> — Audit logging</li>
        <li>❌ <code>src/lib/rateLimit.ts</code> — Rate limiting</li>
        <li>❌ <code>src/lib/driveService.ts</code> — Google Drive integration</li>
        <li>❌ <code>prisma/schema.prisma</code> — Database schema (without approval)</li>
        <li>❌ <code>next.config.js</code> — Build configuration</li>
        <li>❌ <code>vercel.json</code> — Deployment configuration</li>
        <li>❌ <code>.env</code> files — Environment variables</li>
        <li>❌ Any file with secrets or credentials</li>
      </ul>
      <p><strong>When in doubt, ask before changing.</strong></p>

      {/* 8. How to Test Your Changes */}
      <h2>8. How to Test Your Changes</h2>
      <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`# Step 1: Type check (MUST pass)
npm run typecheck

# Step 2: Build (MUST pass)
npm run build

# Step 3: Run lint (warnings are OK, errors are not)
npm run lint

# Step 4: Manual testing
# - Open the page you changed
# - Test the happy path
# - Test edge cases
# - Check different user roles if applicable`}
      </pre>
      <p><strong>If typecheck or build fails, fix it before pushing.</strong></p>

      {/* 9. How to Write a Commit Message */}
      <h2>9. How to Write a Commit Message</h2>
      <p><strong>Good:</strong></p>
      <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`feat: add category field to notifications
fix: correct date format in deliverables list
chore: update training page layout`}
      </pre>
      <p><strong>Bad:</strong></p>
      <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`stuff
changes
fixed
update
WIP
asdfasdf`}
      </pre>
      <p>
        <strong>Format:</strong> <code>type: short description</code>
      </p>
      <p>
        Types: <code>feat</code> (new feature), <code>fix</code> (bug fix), <code>chore</code> (maintenance), <code>docs</code> (documentation)
      </p>

      {/* 10. How to Ask for Help */}
      <h2>10. How to Ask for Help</h2>
      <p><strong>Good:</strong></p>
      <blockquote>
        &quot;I&apos;m trying to add a category field to notifications. I added it to the schema and ran
        db:push, but the API route returns 400 when I include the new field. I checked the route
        handler and the field isn&apos;t in the validation. Here&apos;s the error: [paste error]. I think I
        need to update the POST handler but I&apos;m not sure about the Prisma syntax.&quot;
      </blockquote>
      <p><strong>Bad:</strong></p>
      <blockquote>&quot;Notifications don&apos;t work&quot;</blockquote>
      <p><strong>Always include:</strong></p>
      <ol>
        <li>What you were trying to do</li>
        <li>What you expected</li>
        <li>What actually happened</li>
        <li>What you already tried</li>
        <li>The exact error message</li>
        <li>Relevant code snippets</li>
      </ol>

      {/* 11. Your First Task */}
      <h2>11. Your First Task</h2>
      <p><strong>Add a <code>category</code> field to the Notification model.</strong></p>
      <ol>
        <li>Add <code>category String?</code> to the Notification model in <code>prisma/schema.prisma</code></li>
        <li>Run <code>npm run db:push</code></li>
        <li>Update <code>src/lib/notifications.ts</code> to accept an optional <code>category</code> parameter</li>
        <li>Update the POST handler in <code>src/app/api/notifications/route.ts</code> to accept <code>category</code></li>
        <li>Run <code>npm run typecheck</code> and <code>npm run build</code></li>
        <li>Commit: <code>feat: add category field to notifications</code></li>
      </ol>
      <p><strong>Why this task:</strong></p>
      <ul>
        <li>Low risk (additive change)</li>
        <li>Touches schema + API + lib</li>
        <li>Teaches the full stack flow</li>
        <li>Easy to verify</li>
        <li>Won&apos;t break anything</li>
      </ul>

      {/* 12. Quick Reference */}
      <h2>12. Quick Reference</h2>
      <h3>Commands</h3>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>npm run dev</code></td><td>Start dev server</td></tr>
          <tr><td><code>npm run typecheck</code></td><td>TypeScript check</td></tr>
          <tr><td><code>npm run build</code></td><td>Production build</td></tr>
          <tr><td><code>npm run lint</code></td><td>ESLint check</td></tr>
          <tr><td><code>npm run test</code></td><td>Run tests</td></tr>
          <tr><td><code>npm run db:push</code></td><td>Apply schema changes</td></tr>
        </tbody>
      </table>

      <h3>Auth Guard Copy-Paste</h3>
      <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`import { requireAuth, isNextResponse } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await requireAuth(['admin', 'staff']);
  if (isNextResponse(user)) return user;
  // your code here
}`}
      </pre>

      <h3>Branch Naming</h3>
      <table>
        <thead>
          <tr>
            <th>Prefix</th>
            <th>Use For</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>feat/</code></td><td>New features</td></tr>
          <tr><td><code>fix/</code></td><td>Bug fixes</td></tr>
          <tr><td><code>chore/</code></td><td>Maintenance</td></tr>
        </tbody>
      </table>
    </div>
  );
}
