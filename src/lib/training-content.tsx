'use client';

export default function FullDeveloperTraining() {
  return (
    <div className="max-w-none">
      {/* ─── 1. Welcome & Project Overview ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">1</span>
          <h2 className="font-heading text-2xl font-bold text-white">Welcome &amp; Project Overview</h2>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 mb-6">
          <h3 className="font-heading text-lg font-bold text-white mb-2">WhoIsDésir® Media Agency Platform</h3>
          <p className="text-sm text-white/50 mb-1">Creative Business Operations Platform</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/[0.04] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-white/30 mb-1">Repository</p>
              <p className="text-sm text-miami-blue-light font-mono">whoisdesirtech/widmediaagency</p>
            </div>
            <div className="bg-white/[0.04] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-white/30 mb-1">Version</p>
              <p className="text-sm text-miami-blue-light font-mono">1.2.0</p>
            </div>
            <div className="bg-white/[0.04] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-white/30 mb-1">Live Site</p>
              <p className="text-sm text-miami-blue-light font-mono break-all">whoisdesirmediaagency.vercel.app</p>
            </div>
            <div className="bg-white/[0.04] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-white/30 mb-1">Framework</p>
              <p className="text-sm text-miami-blue-light font-mono">Next.js 14</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h3 className="font-heading font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-green-500/15 text-green-400 flex items-center justify-center text-xs">✓</span>
              What It Is
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              An agency operations platform managing the full lifecycle from <span className="text-white/70">agency</span> → <span className="text-white/70">contractors/vendors</span> → <span className="text-white/70">clients</span> → <span className="text-white/70">projects</span> → <span className="text-white/70">contracts</span> → <span className="text-white/70">deliverables</span> → <span className="text-white/70">media delivery</span>.
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h3 className="font-heading font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-red-500/15 text-red-400 flex items-center justify-center text-xs">✗</span>
              What It Is NOT
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              <span className="text-white/70">NOT</span> a marketplace (like Fiverr/Upwork), <span className="text-white/70">NOT</span> a solo freelancer CRM. This is a closed agency operations platform.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-miami-pink/10 to-miami-blue-light/10 border border-white/5 rounded-2xl p-6">
          <h3 className="font-heading font-bold text-white mb-2">Core Principle</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            <span className="text-miami-pink font-semibold">&quot;Inspect first. Change second.&quot;</span> Understand the business relationship before changing the technical relationship. Every change touches real people — contractors, clients, and their data.
          </p>
        </div>
      </section>

      {/* ─── 2. Technology Stack ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">2</span>
          <h2 className="font-heading text-2xl font-bold text-white">Technology Stack</h2>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Technology</th>
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Next.js 14', 'App Router framework'],
                ['TypeScript', 'Language (strict mode)'],
                ['Tailwind CSS', 'Styling'],
                ['Prisma', 'ORM'],
                ['PostgreSQL (Supabase)', 'Database'],
                ['NextAuth.js', 'Authentication (credentials strategy)'],
                ['Google Drive API', 'File storage (service account)'],
                ['bcryptjs', 'Password hashing'],
                ['Vercel', 'Deployment'],
                ['Vitest', 'Testing'],
                ['ESLint + Prettier', 'Code quality'],
                ['jsPDF + html2canvas', 'PDF generation'],
              ].map(([tech, purpose], i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3">
                    <span className="text-sm text-miami-blue-light font-mono">{tech}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-white/50">{purpose}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── 3. Business Architecture ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">3</span>
          <h2 className="font-heading text-2xl font-bold text-white">Business Architecture</h2>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 mb-6">
          <h3 className="font-heading font-bold text-white mb-4">Architecture Diagram</h3>
          <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto text-white/70 leading-relaxed">
{`                         AGENCY
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
   INTERNAL STAFF     CONTRACTORS        CLIENTS
          |                |                |
       Admins           Vendors/         Customers
       Staff            Talent`}
          </pre>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Role</th>
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Who</th>
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Data They Own</th>
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Admin', 'Platform owner', 'Everything', 'Full CRUD'],
                ['Staff', 'Internal team', 'Same as admin', 'Most CRUD, no audit admin'],
                ['Contractor', 'External talent', 'Own SOWs, contracts, deliverables', 'Own records only'],
                ['Client', 'Customers', 'Own projects, deliverables, invoices', 'Own records only'],
              ].map(([role, who, data, perms], i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3">
                    <span className={`text-sm font-semibold ${
                      role === 'Admin' ? 'text-miami-pink' :
                      role === 'Staff' ? 'text-blue-400' :
                      role === 'Contractor' ? 'text-miami-blue-light' :
                      'text-green-400'
                    }`}>{role}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-white/50">{who}</td>
                  <td className="px-6 py-3 text-sm text-white/50">{data}</td>
                  <td className="px-6 py-3 text-sm text-white/50">{perms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <h3 className="font-heading font-bold text-white mb-4">Key Relationships</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Agency → Contractor (1:many)',
              'Agency → Client (1:many)',
              'Contractor → SOW (1:many)',
              'Client → Project (1:many)',
              'SOW → Deliverable (1:many via sowId)',
              'Contractor → Deliverable (1:many via contractorId)',
            ].map((rel, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-miami-blue-light" />
                <span className="text-sm text-white/60 font-mono">{rel}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. Database Schema ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">4</span>
          <h2 className="font-heading text-2xl font-bold text-white">Database Schema</h2>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Model</th>
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Agency', 'Root organization'],
                ['User', 'Authentication accounts'],
                ['Contractor', 'External talent/vendor'],
                ['ContractorRole', 'Multi-role system (pending/approved/rejected)'],
                ['Client', 'Agency customers'],
                ['MasterAgreement', 'Template contracts'],
                ['Addendum', 'Contract addenda templates'],
                ['SOW', 'Statements of Work'],
                ['AssembledContract', 'Merged contracts'],
                ['Signature', 'Contract signatures'],
                ['Project', 'Client projects'],
                ['Deliverable', 'Work items'],
                ['Invoice', 'Billing'],
                ['Document', 'Client documents'],
                ['FileFolder', 'Drive folder structure'],
                ['Notification', 'User notifications'],
                ['BookingInquiry', 'Public booking form'],
                ['PluginDownloadLead', 'Amazon plugin leads'],
                ['AuditLog', 'Security audit trail'],
              ].map(([model, purpose], i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3">
                    <span className="text-sm text-miami-blue-light font-mono">{model}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-white/50">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <h3 className="font-heading font-bold text-white mb-3">Schema Management</h3>
          <p className="text-sm text-white/50 mb-3">
            Uses <code className="bg-white/5 px-2 py-0.5 rounded text-miami-blue-light text-xs">prisma db push</code> — no migration files. Run after any schema change.
          </p>
          <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto text-white/70">
{`# Apply schema changes
npm run db:push

# Open Prisma Studio to explore data
npm run db:studio

# Seed development data
npm run db:seed`}
          </pre>
        </div>
      </section>

      {/* ─── 5. Authentication & Authorization ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">5</span>
          <h2 className="font-heading text-2xl font-bold text-white">Authentication &amp; Authorization</h2>
        </div>

        {/* Auth Flow */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 mb-6">
          <h3 className="font-heading font-bold text-white mb-4">Auth Flow</h3>
          <div className="space-y-4">
            {[
              { step: '1', text: 'User submits credentials → /api/auth/[...nextauth]' },
              { step: '2', text: 'NextAuth validates against User table' },
              { step: '3', text: 'JWT session carries: id, email, name, role, agencyId, contractorId, clientId' },
              { step: '4', text: 'Client-side: login page fetches /api/me → stores in localStorage' },
              { step: '5', text: 'For contractors: also fetches contractor roles → stores contractorRoles[]' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-miami-pink to-miami-blue-light flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {step}
                </span>
                <p className="text-sm text-white/60 leading-relaxed pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Auth Guard Pattern */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 mb-6">
          <h3 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-miami-pink/15 text-miami-pink flex items-center justify-center text-xs">!</span>
            The Auth Guard Pattern (CRITICAL)
          </h3>
          <p className="text-sm text-white/50 mb-4">
            Every API route MUST start with one of these:
          </p>
          <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto text-white/70 leading-relaxed">
{`const user = await requireAdmin();           // admin only
const user = await requireAdminOrStaff();   // admin | staff
const user = await requireAuth(['admin', 'staff', 'contractor']); // any list
const user = await requireClient();         // client only
const user = await requireContractor();     // contractor only
if (isNextResponse(user)) return user;       // ALWAYS check this`}
          </pre>
        </div>

        {/* Role-Based Access Patterns */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="font-heading font-bold text-white">Role-Based Access Patterns</h3>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Route</th>
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">GET</th>
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">POST / PATCH / DELETE</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['/api/contractors/*', 'admin, staff, contractor (own)', 'admin, staff'],
                ['/api/contractors/*/roles', 'admin, staff, contractor (own)', 'contractor (own, creates pending)'],
                ['/api/clients/*', 'admin, staff', 'admin, staff'],
                ['/api/deliverables', 'all (role-scoped)', 'all (role-scoped)'],
                ['/api/sows/*', 'admin, staff, contractor (own)', 'admin, staff'],
                ['/api/signatures', 'admin, staff, contractor (own contract)', 'admin, staff, contractor (own contract)'],
                ['/api/booking', 'public (rate-limited)', 'public (rate-limited)'],
                ['/api/auth/reset-password', 'public (rate-limited)', 'public (rate-limited)'],
              ].map(([route, get, write], i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3 text-sm text-miami-blue-light font-mono">{route}</td>
                  <td className="px-6 py-3 text-sm text-white/50">{get}</td>
                  <td className="px-6 py-3 text-sm text-white/50">{write}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Security Layers */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8">
          <h3 className="font-heading font-bold text-white mb-4">Security Layers (6 Total)</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { num: '1', title: 'CSRF', desc: 'Double-submit cookie on mutating API routes' },
              { num: '2', title: 'Auth guards', desc: 'Every route handler starts with role verification' },
              { num: '3', title: 'Rate limiting', desc: 'Public endpoints protected (in-memory bucket)' },
              { num: '4', title: 'Audit logging', desc: 'All state mutations tracked' },
              { num: '5', title: 'Storage limits', desc: 'Per-contractor upload caps (500MB default)' },
              { num: '6', title: 'File type whitelisting', desc: 'Uploads restricted by extension and size' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex items-start gap-3 bg-white/[0.04] border border-white/5 rounded-xl p-4">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-miami-pink to-miami-blue-light flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {num}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. Project Structure ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">6</span>
          <h2 className="font-heading text-2xl font-bold text-white">Project Structure</h2>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8">
          <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto text-white/70 leading-relaxed">
{`src/
├── app/
│   ├── api/              # 22 route handler directories
│   ├── admin/            # Admin portal (contractors, deliverables, projects, audit)
│   ├── contractor/       # Contractor portal (dashboard, projects, SOWs, deliverables, roles, contracts, training)
│   ├── client/           # Client portal (dashboard, projects, deliverables, media, documents, billing)
│   └── ...               # Public pages (landing, login, knowledge-base, training)
├── components/           # 10 shared components
│   ├── Sidebar.tsx
│   ├── ContractorSidebar.tsx
│   ├── ClientSidebar.tsx
│   ├── NotificationBell.tsx
│   ├── SignaturePad.tsx
│   ├── StatusBadge.tsx
│   ├── DraftBanner.tsx
│   ├── CsrfProvider.tsx
│   ├── HtmlRenderer.tsx
│   └── MediaTile.tsx
├── lib/                  # Shared utilities
│   ├── auth.ts           # Session helpers, role guards, NextAuth config
│   ├── audit.ts          # Audit logging (best-effort, never blocks)
│   ├── rateLimit.ts      # In-memory rate limiting
│   ├── storage.ts        # Upload storage limits
│   ├── prisma.ts         # Prisma client singleton
│   ├── drive.ts          # Google Drive URL normalization
│   ├── driveService.ts   # Google Drive API (service account)
│   ├── notifications.ts  # Notification creation helpers
│   └── proposal/         # Decomposed proposal modules
├── middleware.ts          # CSRF double-submit protection
└── types/                # TypeScript type definitions

prisma/
├── schema.prisma         # 19 models
├── seed.ts               # Dev seed data
├── seed-test-data.ts     # Test data (multi-role contractor)
└── backfill-roles.ts     # Migration script`}
          </pre>
        </div>
      </section>

      {/* ─── 7. API Route Reference ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">7</span>
          <h2 className="font-heading text-2xl font-bold text-white">API Route Reference</h2>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Directory</th>
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Purpose</th>
                <th className="text-left text-xs font-semibold text-white/50 px-6 py-3 uppercase tracking-wider">Auth</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['auth/', 'NextAuth + reset-password', 'Public (rate-limited)'],
                ['contractors/', 'CRUD + roles + upload', 'Admin/staff; contractor (own)'],
                ['clients/', 'CRUD + login', 'Admin/staff'],
                ['deliverables/', 'CRUD with role-scoped access', 'All roles (scoped)'],
                ['sows/', 'CRUD with contractor scoping', 'Admin/staff; contractor (own)'],
                ['projects/', 'CRUD + images', 'Admin/staff; contractor (assigned)'],
                ['contracts/', 'Assembly + signing', 'Admin/staff; contractor (own)'],
                ['signatures', 'Contract signing', 'Admin/staff; contractor (own contract)'],
                ['notifications/', 'CRUD + read-all', 'All authenticated (scoped)'],
                ['audit/', 'Audit log feed', 'Admin/staff'],
                ['documents/', 'Client documents', 'Admin/staff'],
                ['invoices/', 'Client invoices', 'Admin/staff'],
                ['folders/', 'Drive folder management', 'Admin/staff; client (own)'],
                ['drive/upload', 'Google Drive upload', 'Admin/staff'],
                ['settings', 'Agency settings', 'Admin/staff'],
                ['master-agreements', 'Agreement templates', 'Admin/staff'],
                ['addenda', 'Addenda templates', 'Admin/staff'],
                ['me', 'Current user info', 'Any authenticated'],
                ['booking', 'Public booking form', 'Public (rate-limited)'],
                ['plugin-lead', 'Amazon plugin leads', 'Public (rate-limited)'],
                ['dashboard', 'Dashboard data', 'Admin/staff'],
                ['proposal/', 'Proposal checkout + download', 'Mixed'],
              ].map(([dir, purpose, auth], i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3 text-sm text-miami-blue-light font-mono">{dir}</td>
                  <td className="px-6 py-3 text-sm text-white/50">{purpose}</td>
                  <td className="px-6 py-3 text-sm text-white/50">{auth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── 8. Git Workflow & Commit Standards ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">8</span>
          <h2 className="font-heading text-2xl font-bold text-white">Git Workflow &amp; Commit Standards</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h3 className="font-heading font-bold text-white mb-4">Branch Naming</h3>
            <div className="space-y-3">
              {[
                ['main', 'Production-ready'],
                ['feat/description', 'Features'],
                ['fix/description', 'Bug fixes'],
                ['chore/description', 'Maintenance'],
              ].map(([branch, desc]) => (
                <div key={branch} className="flex items-center gap-3">
                  <code className="text-sm text-miami-blue-light font-mono bg-white/5 px-2 py-0.5 rounded">{branch}</code>
                  <span className="text-sm text-white/40">— {desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h3 className="font-heading font-bold text-white mb-4">Commit Format</h3>
            <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto text-white/70 leading-relaxed">
{`feat: notifications system + lint cleanup
chore: release v1.2.0 — ESLint, tests, decompose
fix: allow contractors to access folders API
docs: update CHANGELOG with v1.2.0 entry`}
            </pre>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h3 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-red-500/15 text-red-400 flex items-center justify-center text-xs">!</span>
              Required Before Committing
            </h3>
            <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto text-white/70 leading-relaxed">
{`npm run typecheck    # TypeScript check — MUST pass
npm run build        # Production build — MUST pass`}
            </pre>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h3 className="font-heading font-bold text-white mb-4">Optional</h3>
            <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto text-white/70 leading-relaxed">
{`npm run lint         # ESLint (warnings acceptable)
npm run test         # Vitest
npm run format       # Prettier`}
            </pre>
          </div>
        </div>
      </section>

      {/* ─── 9. Testing ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">9</span>
          <h2 className="font-heading text-2xl font-bold text-white">Testing</h2>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-24 shrink-0">Framework</span>
                <span className="text-sm text-miami-blue-light font-mono">Vitest</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-24 shrink-0">Config</span>
                <span className="text-sm text-miami-blue-light font-mono">vitest.config.ts</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-24 shrink-0">Tests in</span>
                <span className="text-sm text-miami-blue-light font-mono">tests/ directory</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-24 shrink-0">Run</span>
                <span className="text-sm text-miami-blue-light font-mono">npm test</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/50 mb-2">Current tests:</p>
              <ul className="space-y-1">
                <li className="text-sm text-white/40 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  api-smoke.test.ts
                </li>
                <li className="text-sm text-white/40 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  contractor-roles.test.ts
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-sm text-amber-300/80">
              <span className="font-semibold">Gap:</span> No unit, integration, or end-to-end tests yet. All 2 tests are smoke-level. Consider adding tests for auth guards, role scoping, and contract assembly logic.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 10. Deployment ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">10</span>
          <h2 className="font-heading text-2xl font-bold text-white">Deployment</h2>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white/[0.04] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-white/30 mb-1">Primary Platform</p>
                <p className="text-sm text-white font-semibold">Vercel</p>
                <p className="text-xs text-white/40 mt-1">Auto-deploy on push to main</p>
              </div>
              <div className="bg-white/[0.04] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-white/30 mb-1">Database</p>
                <p className="text-sm text-white font-semibold">Supabase PostgreSQL</p>
                <p className="text-xs text-white/40 mt-1">Schema via prisma db push (no migration files)</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/[0.04] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-white/30 mb-1">Build Command</p>
                <pre className="text-sm text-miami-blue-light font-mono mt-1">npx prisma generate &amp;&amp; npx next build</pre>
              </div>
              <div className="bg-white/[0.04] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-white/30 mb-1">Secondary Target</p>
                <p className="text-sm text-white font-semibold">Firebase (widmediaagency)</p>
                <p className="text-xs text-white/40 mt-1">Secondary deployment target</p>
              </div>
              <div className="bg-white/[0.04] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-white/30 mb-1">API Timeout</p>
                <p className="text-sm text-white font-semibold">10 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. Security Rules ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">11</span>
          <h2 className="font-heading text-2xl font-bold text-white">Security Rules</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-500/[0.05] border border-red-500/10 rounded-2xl p-8">
            <h3 className="font-heading font-bold text-red-400 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-red-500/15 text-red-400 flex items-center justify-center text-xs">✕</span>
              Never Do
            </h3>
            <ul className="space-y-3">
              {[
                'Never commit secrets, API keys, passwords, or credentials',
                'Never expose user data across role boundaries',
                'Never skip auth guards on API routes',
                'Never trust query params from clients/contractors for ownership checks',
                'Never relax file type whitelisting without adding equivalent checks',
                'Never modify production configuration without authorization',
                'Never deploy untested code',
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <span className="text-sm text-white/50">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-500/[0.05] border border-green-500/10 rounded-2xl p-8">
            <h3 className="font-heading font-bold text-green-400 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-green-500/15 text-green-400 flex items-center justify-center text-xs">✓</span>
              If You Discover a Security Issue
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Report it rather than attempting to exploit it. Document the vulnerability, the affected endpoint, and the potential impact. Do not attempt to access data belonging to other users.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 12. Common Mistakes ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">12</span>
          <h2 className="font-heading text-2xl font-bold text-white">Common Mistakes</h2>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Working directly on main (always use branches)',
              'Committing secrets',
              'Changing unrelated files',
              'Skipping typecheck/build',
              'Ignoring documentation',
              'Overwriting another developer\'s work',
              'Installing unnecessary dependencies',
              'Making large changes without approval',
              'Trusting AI-generated code without review',
              'Deploying untested changes',
              'Ignoring role permissions',
              'Exposing client/contractor information',
            ].map((mistake, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3">
                <span className="w-5 h-5 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-white/50">{mistake}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 13. First Task Recommendation ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">13</span>
          <h2 className="font-heading text-2xl font-bold text-white">First Task Recommendation</h2>
        </div>

        <div className="bg-gradient-to-r from-miami-pink/10 to-miami-blue-light/10 border border-white/5 rounded-2xl p-8">
          <h3 className="font-heading font-bold text-white mb-2">
            Add a new field to the Notification model
          </h3>
          <p className="text-sm text-white/50 mb-4">
            Add <code className="bg-white/5 px-2 py-0.5 rounded text-miami-blue-light text-xs">category: String?</code> to the Notification model.
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Files Involved</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'prisma/schema.prisma',
                  'src/app/api/notifications/route.ts',
                  'src/components/NotificationBell.tsx',
                ].map((file) => (
                  <code key={file} className="text-xs bg-white/5 border border-white/10 text-miami-blue-light px-3 py-1 rounded-full font-mono">
                    {file}
                  </code>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Expected Result</p>
              <p className="text-sm text-white/50">New optional field appears in notifications, filterable by category.</p>
            </div>

            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">How to Test</p>
              <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto text-white/70">
{`npm run db:push
npm run typecheck
npm run build`}
              </pre>
            </div>

            <div className="bg-white/[0.04] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Why This Task</p>
              <p className="text-sm text-white/50">
                Low risk, touches schema + API + UI, teaches the full stack flow. You will practice modifying the database schema, updating the API route, and rendering the new field in the UI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 14. Developer Golden Rules ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">14</span>
          <h2 className="font-heading text-2xl font-bold text-white">Developer Golden Rules</h2>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8">
          <div className="space-y-3">
            {[
              'Read before changing.',
              'Inspect before assuming.',
              'Understand the business relationship.',
              'Understand the data relationship.',
              'Work in branches.',
              'Keep changes focused.',
              'Test your work.',
              'Review AI-generated code.',
              'Protect credentials and user data.',
              'Don\'t overwrite another developer\'s work.',
              'Ask when you\'re unsure.',
              'Never claim something works if you haven\'t tested it.',
            ].map((rule, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/[0.04] border border-white/5 rounded-xl px-5 py-3">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-miami-pink to-miami-blue-light flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-white/60">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 15. Final Checklist ─── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">15</span>
          <h2 className="font-heading text-2xl font-bold text-white">Final Checklist</h2>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8">
          <p className="text-sm text-white/40 mb-6">Complete this checklist before submitting any Pull Request.</p>
          <div className="space-y-2">
            {[
              'I understand the task',
              'I reviewed the relevant documentation',
              'I understand the business context',
              'I understand the relevant user roles',
              'I understand who owns the affected data',
              'I created a separate branch',
              'I inspected the existing implementation',
              'I only changed what was necessary',
              'I did not commit secrets',
              'I tested my changes (typecheck + build)',
              'I reviewed my Git diff',
              'I wrote a clear commit message',
              'I pushed my branch',
              'I created a Pull Request',
              'I explained what changed',
              'I explained how I tested it',
              'I disclosed known problems',
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-xl px-5 py-3 cursor-pointer hover:bg-white/[0.06] transition-colors">
                <span className="w-5 h-5 rounded-md border-2 border-white/10 flex items-center justify-center shrink-0">
                  <span className="w-2.5 h-2.5 rounded-sm bg-white/5" />
                </span>
                <span className="text-sm text-white/60">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
