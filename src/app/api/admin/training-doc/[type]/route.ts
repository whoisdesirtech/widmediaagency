import { NextResponse } from 'next/server';
import { requireAdmin, isNextResponse } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { type: string } }
) {
  const user = await requireAdmin();
  if (isNextResponse(user)) return user;

  const { type } = await params;

  if (type !== 'full' && type !== 'intern') {
    return NextResponse.json({ error: 'Invalid type. Must be "full" or "intern".' }, { status: 400 });
  }

  // Generate a simple HTML-to-PDF using a basic approach
  // We'll create a styled HTML page and return it as a downloadable HTML file
  // (jsPDF doesn't support complex layouts well, so we use a print-friendly HTML approach)
  
  const title = type === 'full' 
    ? 'WhoIsDésir® Media — Full Developer Training Document'
    : 'WhoIsDésir® Media — Intern Training Document';

  const html = generateDownloadableHTML(type, title);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="developer-training-${type}.html"`,
    },
  });
}

function generateDownloadableHTML(type: 'full' | 'intern', title: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Base styles for print-friendly document
  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 900px; margin: 0 auto; padding: 40px 20px; }
      h1 { font-size: 28px; margin-bottom: 8px; color: #1a1a2e; }
      h2 { font-size: 22px; margin: 32px 0 12px; color: #1a1a2e; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
      h3 { font-size: 18px; margin: 24px 0 8px; color: #334155; }
      p { margin: 8px 0; color: #475569; }
      code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: 'SF Mono', Monaco, monospace; }
      pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 12px 0; font-size: 13px; line-height: 1.5; }
      pre code { background: none; padding: 0; color: inherit; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      th, td { padding: 8px 12px; text-align: left; border: 1px solid #e2e8f0; font-size: 14px; }
      th { background: #f8fafc; font-weight: 600; color: #334155; }
      td { color: #475569; }
      ul, ol { margin: 8px 0 8px 24px; }
      li { margin: 4px 0; color: #475569; }
      .header { text-align: center; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
      .header p { color: #64748b; font-size: 14px; }
      .tier-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
      .tier-full { background: #dbeafe; color: #1e40af; }
      .tier-intern { background: #d1fae5; color: #065f46; }
      .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; }
      .critical { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; }
      .info { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; }
      @media print { body { padding: 20px; } pre { white-space: pre-wrap; } }
    </style>
  `;

  // Content sections based on type
  const content = type === 'full' ? getFullContent() : getInternContent();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${styles}
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>WhoIsDésir® Media Agency Platform — Creative Business Operations Platform</p>
    <p>Generated: ${timestamp} | Version: 1.2.0</p>
    <span class="tier-badge ${type === 'full' ? 'tier-full' : 'tier-intern'}">${type === 'full' ? 'FULL DEVELOPER' : 'INTERN'} TIER</span>
  </div>
  ${content}
  <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>This document is confidential. Do not share externally.</p>
    <p>WhoIsDésir® Media | https://whoisdesirmediaagency.vercel.app</p>
  </div>
</body>
</html>`;
}

function getFullContent(): string {
  return `
    <h2>1. Project Overview</h2>
    <p><strong>WhoIsDésir® Media Agency Platform</strong> — a "Creative Business Operations Platform" for a media agency.</p>
    <ul>
      <li><strong>Repository:</strong> whoisdesirtech/widmediaagency</li>
      <li><strong>Version:</strong> 1.2.0</li>
      <li><strong>Live site:</strong> https://whoisdesirmediaagency.vercel.app</li>
    </ul>
    <div class="info">
      <strong>What it is:</strong> An agency operations platform managing the full lifecycle: agency → contractors/vendors → clients → projects → contracts → deliverables → media delivery.<br>
      <strong>What it is NOT:</strong> NOT a marketplace (Fiverr/Upwork), NOT a solo freelancer CRM.
    </div>
    <p>Core principles: <em>"Inspect first. Change second."</em> and <em>"Understand the business relationship before changing the technical relationship."</em></p>

    <h2>2. Technology Stack</h2>
    <table>
      <tr><th>Technology</th><th>Purpose</th></tr>
      <tr><td>Next.js 14</td><td>App Router framework</td></tr>
      <tr><td>TypeScript</td><td>Language (strict mode)</td></tr>
      <tr><td>Tailwind CSS</td><td>Styling</td></tr>
      <tr><td>Prisma</td><td>ORM</td></tr>
      <tr><td>PostgreSQL (Supabase)</td><td>Database</td></tr>
      <tr><td>NextAuth.js</td><td>Authentication (credentials strategy)</td></tr>
      <tr><td>Google Drive API</td><td>File storage (service account)</td></tr>
      <tr><td>bcryptjs</td><td>Password hashing</td></tr>
      <tr><td>Vercel</td><td>Deployment</td></tr>
      <tr><td>Vitest</td><td>Testing</td></tr>
      <tr><td>ESLint + Prettier</td><td>Code quality</td></tr>
    </table>

    <h2>3. Business Architecture</h2>
    <pre><code>                         AGENCY
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
   INTERNAL STAFF     CONTRACTORS        CLIENTS
          |                |                |
       Admins           Vendors/         Customers
       Staff            Talent</code></pre>
    <table>
      <tr><th>Role</th><th>Who</th><th>Data They Own</th><th>Permissions</th></tr>
      <tr><td><strong>Admin</strong></td><td>Platform owner</td><td>Everything</td><td>Full CRUD</td></tr>
      <tr><td><strong>Staff</strong></td><td>Internal team</td><td>Same as admin</td><td>Most CRUD, no audit admin</td></tr>
      <tr><td><strong>Contractor</strong></td><td>External talent</td><td>Own SOWs, contracts, deliverables</td><td>Own records only</td></tr>
      <tr><td><strong>Client</strong></td><td>Customers</td><td>Own projects, deliverables, invoices</td><td>Own records only</td></tr>
    </table>

    <h2>4. Database Schema (19 Models)</h2>
    <table>
      <tr><th>Model</th><th>Purpose</th></tr>
      <tr><td>Agency</td><td>Root organization</td></tr>
      <tr><td>User</td><td>Authentication accounts</td></tr>
      <tr><td>Contractor</td><td>External talent/vendor</td></tr>
      <tr><td>ContractorRole</td><td>Multi-role system (pending/approved/rejected)</td></tr>
      <tr><td>Client</td><td>Agency customers</td></tr>
      <tr><td>MasterAgreement</td><td>Template contracts</td></tr>
      <tr><td>Addendum</td><td>Contract addenda templates</td></tr>
      <tr><td>SOW</td><td>Statements of Work</td></tr>
      <tr><td>AssembledContract</td><td>Merged contracts</td></tr>
      <tr><td>Signature</td><td>Contract signatures</td></tr>
      <tr><td>Project</td><td>Client projects</td></tr>
      <tr><td>Deliverable</td><td>Work items</td></tr>
      <tr><td>Invoice</td><td>Billing</td></tr>
      <tr><td>Document</td><td>Client documents</td></tr>
      <tr><td>FileFolder</td><td>Drive folder structure</td></tr>
      <tr><td>Notification</td><td>User notifications</td></tr>
      <tr><td>BookingInquiry</td><td>Public booking form</td></tr>
      <tr><td>PluginDownloadLead</td><td>Amazon plugin leads</td></tr>
      <tr><td>AuditLog</td><td>Security audit trail</td></tr>
    </table>
    <p><strong>Schema management:</strong> Uses <code>prisma db push</code> (no migration files). Run after any schema change.</p>

    <h2>5. Authentication &amp; Authorization</h2>
    <h3>Auth Flow</h3>
    <ol>
      <li>User submits credentials → <code>/api/auth/[...nextauth]</code></li>
      <li>NextAuth validates against User table</li>
      <li>JWT session carries: id, email, name, role, agencyId, contractorId, clientId</li>
      <li>Client-side: login page fetches <code>/api/me</code> → stores in localStorage</li>
      <li>For contractors: also fetches contractor roles → stores <code>contractorRoles[]</code></li>
    </ol>
    <h3>The Auth Guard Pattern (CRITICAL)</h3>
    <div class="critical">
      <strong>Every API route MUST start with an auth guard.</strong> No exceptions.
    </div>
    <pre><code>const user = await requireAdmin();           // admin only
const user = await requireAdminOrStaff();   // admin | staff
const user = await requireAuth(['admin', 'staff', 'contractor']); // any list
if (isNextResponse(user)) return user;       // ALWAYS check this</code></pre>
    <h3>Security Layers</h3>
    <ol>
      <li><strong>CSRF</strong> — double-submit cookie on mutating API routes</li>
      <li><strong>Auth guards</strong> — every route handler starts with role verification</li>
      <li><strong>Rate limiting</strong> — public endpoints protected</li>
      <li><strong>Audit logging</strong> — all state mutations tracked</li>
      <li><strong>Storage limits</strong> — per-contractor upload caps (500MB default)</li>
      <li><strong>File type whitelisting</strong> — uploads restricted by extension and size</li>
    </ol>

    <h2>6. Project Structure</h2>
    <pre><code>src/
├── app/
│   ├── api/           # 22 route handler directories
│   ├── admin/         # Admin portal pages
│   ├── contractor/    # Contractor portal pages
│   ├── client/        # Client portal pages
│   └── ...            # Public pages
├── components/        # 10 shared components
├── lib/               # Shared utilities (auth, audit, drive, etc.)
├── middleware.ts       # CSRF protection
prisma/
├── schema.prisma      # 19 models
├── seed.ts            # Dev seed data
└── seed-test-data.ts  # Test data</code></pre>

    <h2>7. Git Workflow</h2>
    <h3>Branch Naming</h3>
    <ul>
      <li><code>main</code> — production-ready</li>
      <li><code>feat/description</code> — features</li>
      <li><code>fix/description</code> — bug fixes</li>
      <li><code>chore/description</code> — maintenance</li>
    </ul>
    <h3>Commit Format</h3>
    <pre><code>feat: notifications system + lint cleanup
chore: release v1.2.0 — ESLint, tests, decompose
fix: allow contractors to access folders API</code></pre>
    <h3>Required Commands</h3>
    <pre><code>npm run typecheck    # TypeScript check — MUST pass
npm run build        # Production build — MUST pass</code></pre>

    <h2>8. Testing</h2>
    <ul>
      <li><strong>Framework:</strong> Vitest</li>
      <li><strong>Tests in:</strong> <code>tests/</code> directory</li>
      <li><strong>Run:</strong> <code>npm test</code> or <code>npm run test:watch</code></li>
      <li><strong>Current tests:</strong> 2 smoke tests</li>
    </ul>

    <h2>9. Deployment</h2>
    <ul>
      <li><strong>Primary:</strong> Vercel (auto-deploy on push to main)</li>
      <li><strong>Build:</strong> <code>npx prisma generate &amp;&amp; npx next build</code></li>
      <li><strong>API timeout:</strong> 10 seconds</li>
      <li><strong>Database:</strong> Supabase PostgreSQL</li>
    </ul>

    <h2>10. Security Rules</h2>
    <div class="critical">
      <strong>Never:</strong> commit secrets, skip auth guards, trust client query params for ownership, relax file whitelisting, modify production config without approval, deploy untested code.
    </div>
    <p>If you discover a security issue, <strong>report it</strong> rather than attempting to exploit it.</p>

    <h2>11. Common Mistakes</h2>
    <ul>
      <li>Working directly on main (always use branches)</li>
      <li>Committing secrets</li>
      <li>Changing unrelated files</li>
      <li>Skipping typecheck/build</li>
      <li>Ignoring documentation</li>
      <li>Overwriting another developer's work</li>
      <li>Installing unnecessary dependencies</li>
      <li>Making large changes without approval</li>
      <li>Trusting AI-generated code without review</li>
      <li>Deploying untested changes</li>
      <li>Ignoring role permissions</li>
    </ul>

    <h2>12. Developer Golden Rules</h2>
    <ol>
      <li>Read before changing.</li>
      <li>Inspect before assuming.</li>
      <li>Understand the business relationship.</li>
      <li>Understand the data relationship.</li>
      <li>Work in branches.</li>
      <li>Keep changes focused.</li>
      <li>Test your work.</li>
      <li>Review AI-generated code.</li>
      <li>Protect credentials and user data.</li>
      <li>Don't overwrite another developer's work.</li>
      <li>Ask when you're unsure.</li>
      <li>Never claim something works if you haven't tested it.</li>
    </ol>

    <h2>13. First Task</h2>
    <div class="info">
      <strong>Task:</strong> Add a <code>category</code> field to the Notification model.<br>
      <strong>Files:</strong> prisma/schema.prisma, src/lib/notifications.ts, src/app/api/notifications/route.ts<br>
      <strong>Test:</strong> npm run db:push, npm run typecheck, npm run build<br>
      <strong>Why:</strong> Low risk, touches schema + API + lib, teaches the full stack flow.
    </div>

    <h2>14. Final Checklist</h2>
    <ul>
      <li>☐ I understand the task</li>
      <li>☐ I reviewed the relevant documentation</li>
      <li>☐ I understand the business context</li>
      <li>☐ I understand the relevant user roles</li>
      <li>☐ I understand who owns the affected data</li>
      <li>☐ I created a separate branch</li>
      <li>☐ I inspected the existing implementation</li>
      <li>☐ I only changed what was necessary</li>
      <li>☐ I did not commit secrets</li>
      <li>☐ I tested my changes (typecheck + build)</li>
      <li>☐ I reviewed my Git diff</li>
      <li>☐ I wrote a clear commit message</li>
      <li>☐ I pushed my branch</li>
      <li>☐ I created a Pull Request</li>
      <li>☐ I explained what changed</li>
      <li>☐ I explained how I tested it</li>
    </ul>
  `;
}

function getInternContent(): string {
  return `
    <h2>1. What Is This Project?</h2>
    <p><strong>WhoIsDésir® Media Agency Platform</strong> — a "Creative Business Operations Platform" for a media agency. It manages contractors, clients, projects, contracts, deliverables, and media delivery.</p>
    <div class="info">
      <strong>You are NOT building a marketplace.</strong> You are building features for a single agency's internal operations platform.
    </div>
    <ul>
      <li><strong>Live site:</strong> https://whoisdesirmediaagency.vercel.app</li>
      <li><strong>Version:</strong> 1.2.0</li>
    </ul>

    <h2>2. Setup (5 minutes)</h2>
    <pre><code># Clone
git clone https://github.com/whoisdesirtech/widmediaagency.git
cd whoisdesir-media

# Install
npm install

# Environment — ask project owner for .env values
cp .env.example .env

# Run
npm run dev</code></pre>
    <p>Open http://localhost:3000. Login with credentials from the project owner.</p>

    <h2>3. Git Workflow (Follow Exactly)</h2>
    <pre><code>main (production)
  └── feat/your-feature-name (your work)
       └── commit → push → pull request → review → merge</code></pre>
    <div class="critical"><strong>Rules:</strong></div>
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
    <pre><code>feat: add category field to notifications
fix: correct date format in deliverables
chore: update training page content</code></pre>

    <h2>4. The ONE Rule That Matters</h2>
    <div class="critical">
      <strong>Every API route MUST start with an auth guard.</strong>
    </div>
    <pre><code>// ✅ CORRECT:
export async function GET(req: Request) {
  const user = await requireAuth(['admin', 'staff']);
  if (isNextResponse(user)) return user;
  // ... your code
}

// ❌ WRONG — anyone can access:
export async function GET(req: Request) {
  // ... your code (no auth!)
}</code></pre>
    <p>Available guards:</p>
    <ul>
      <li><code>requireAdmin()</code> — admin only</li>
      <li><code>requireAdminOrStaff()</code> — admin or staff</li>
      <li><code>requireAuth(['role1', 'role2'])</code> — any listed role</li>
      <li><code>requireClient()</code> — client only</li>
      <li><code>requireContractor()</code> — contractor only</li>
    </ul>
    <p><strong>ALWAYS check <code>isNextResponse()</code> after the guard.</strong></p>

    <h2>5. Where Things Are</h2>
    <pre><code>src/
├── app/
│   ├── api/           → API routes (backend)
│   ├── admin/         → Admin pages
│   ├── contractor/    → Contractor pages
│   ├── client/        → Client pages
│   └── login/         → Login page
├── components/        → Shared UI components
├── lib/               → Utility code (auth, database, etc.)
└── middleware.ts       → CSRF protection (DON'T TOUCH)</code></pre>

    <h2>6. What NOT to Touch</h2>
    <div class="warning">Unless explicitly told to:</div>
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
    </ul>

    <h2>7. How to Test Your Changes</h2>
    <pre><code># Step 1: Type check (MUST pass)
npm run typecheck

# Step 2: Build (MUST pass)
npm run build

# Step 3: Manual testing
# - Open the page you changed
# - Test the happy path
# - Test edge cases</code></pre>
    <div class="critical">If typecheck or build fails, fix it before pushing.</div>

    <h2>8. How to Write a Commit Message</h2>
    <p><strong>Good:</strong></p>
    <pre><code>feat: add category field to notifications
fix: correct date format in deliverables list
chore: update training page layout</code></pre>
    <p><strong>Bad:</strong></p>
    <pre><code>stuff
changes
fixed
update
WIP</code></pre>
    <p><strong>Format:</strong> <code>type: short description</code></p>
    <p>Types: <code>feat</code> (new feature), <code>fix</code> (bug fix), <code>chore</code> (maintenance), <code>docs</code> (documentation)</p>

    <h2>9. How to Ask for Help</h2>
    <p><strong>Good:</strong></p>
    <div class="info">"I'm trying to add a category field to notifications. I added it to the schema and ran db:push, but the API route returns 400 when I include the new field. I checked the route handler and the field isn't in the validation. Here's the error: [paste error]. I think I need to update the POST handler but I'm not sure about the Prisma syntax."</div>
    <p><strong>Bad:</strong></p>
    <div class="warning">"Notifications don't work"</div>
    <p><strong>Always include:</strong> What you tried, what you expected, what happened, the error, relevant code.</p>

    <h2>10. Your First Task</h2>
    <div class="info">
      <strong>Add a <code>category</code> field to the Notification model.</strong><br>
      <ol>
        <li>Add <code>category String?</code> to Notification in <code>prisma/schema.prisma</code></li>
        <li>Run <code>npm run db:push</code></li>
        <li>Update <code>src/lib/notifications.ts</code> to accept optional <code>category</code></li>
        <li>Update POST handler in <code>src/app/api/notifications/route.ts</code></li>
        <li>Run <code>npm run typecheck</code> and <code>npm run build</code></li>
        <li>Commit: <code>feat: add category field to notifications</code></li>
      </ol>
    </div>

    <h2>11. Quick Reference</h2>
    <table>
      <tr><th>Command</th><th>Purpose</th></tr>
      <tr><td><code>npm run dev</code></td><td>Start dev server</td></tr>
      <tr><td><code>npm run typecheck</code></td><td>TypeScript check</td></tr>
      <tr><td><code>npm run build</code></td><td>Production build</td></tr>
      <tr><td><code>npm run lint</code></td><td>ESLint check</td></tr>
      <tr><td><code>npm run test</code></td><td>Run tests</td></tr>
      <tr><td><code>npm run db:push</code></td><td>Apply schema changes</td></tr>
    </table>
    <h3>Auth Guard Copy-Paste</h3>
    <pre><code>import { requireAuth, isNextResponse } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await requireAuth(['admin', 'staff']);
  if (isNextResponse(user)) return user;
  // your code here
}</code></pre>
  `;
}
