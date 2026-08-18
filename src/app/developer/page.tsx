'use client';

import Link from 'next/link';

const TECH_STACK = [
  { icon: '⚡', name: 'Next.js 14', desc: 'App Router, Server Components, API Routes', color: 'from-white/10 to-white/5' },
  { icon: '🔷', name: 'TypeScript', desc: 'Strict typing across 16+ database models', color: 'from-blue-500/10 to-blue-500/5' },
  { icon: '🎨', name: 'Tailwind CSS', desc: 'Utility-first styling with custom design tokens', color: 'from-cyan-500/10 to-cyan-500/5' },
  { icon: '🗄️', name: 'PostgreSQL', desc: 'Supabase-hosted, Prisma ORM with 16 models', color: 'from-indigo-500/10 to-indigo-500/5' },
  { icon: '🔐', name: 'NextAuth.js', desc: 'Credentials strategy, session management, CSRF protection', color: 'from-green-500/10 to-green-500/5' },
  { icon: '☁️', name: 'Google Drive API', desc: 'Service account auth, folder management, file uploads', color: 'from-amber-500/10 to-amber-500/5' },
  { icon: '🚀', name: 'Vercel', desc: 'Zero-config deploys, edge functions, env management', color: 'from-purple-500/10 to-purple-500/5' },
  { icon: '📊', name: 'Prisma', desc: 'Type-safe DB client, schema migrations, studio', color: 'from-gray-500/10 to-gray-500/5' },
];

const ARCHITECTURE = [
  { title: 'Client Portals', items: ['Admin Dashboard', 'Vendor Portal', 'Client Portal'], icon: '👥', desc: 'Role-based access with separate sidebars, dashboards, and feature sets per role.' },
  { title: 'Contract Engine', items: ['Master Agreement', 'Role Addenda', 'SOW Assembly', 'Digital Signatures'], icon: '📋', desc: 'Auto-assemble contracts from templates, merge SOWs, collect electronic signatures with status tracking.' },
  { title: 'Vendor Onboarding', items: ['W-9 / W-8BEN Upload', 'Insurance Proof', 'Licensing Docs', 'Status Dashboard'], icon: '📄', desc: 'Self-serve document uploads with 10MB limits, status tracking, and admin review.' },
  { title: 'Google Drive Integration', items: ['Service Account Auth', 'Folder Linking', 'Vendor Uploads', 'Client Media Gallery'], icon: '☁️', desc: 'Shared Drive integration for seamless file delivery between vendors, clients, and admins.' },
];

const API_ROUTES = [
  { method: 'POST', path: '/api/auth/[...nextauth]', desc: 'NextAuth session management', auth: false },
  { method: 'GET', path: '/api/me', desc: 'Current session user info', auth: true },
  { method: 'GET', path: '/api/dashboard', desc: 'Admin dashboard stats', auth: 'admin' },
  { method: 'GET', path: '/api/clients', desc: 'List all clients', auth: 'admin' },
  { method: 'POST', path: '/api/clients', desc: 'Create a new client', auth: 'admin' },
  { method: 'PATCH', path: '/api/clients/[id]', desc: 'Update client details + Drive folder', auth: 'admin' },
  { method: 'GET', path: '/api/contractors', desc: 'List all contractors', auth: 'admin' },
  { method: 'POST', path: '/api/contractors', desc: 'Create a new contractor', auth: 'admin' },
  { method: 'GET', path: '/api/projects', desc: 'List projects (role-scoped)', auth: 'any' },
  { method: 'POST', path: '/api/projects', desc: 'Create a project', auth: 'admin' },
  { method: 'GET', path: '/api/folders', desc: 'List Drive folders for a client', auth: 'any' },
  { method: 'POST', path: '/api/folders', desc: 'Create a Drive folder link', auth: 'admin' },
  { method: 'POST', path: '/api/drive/upload', desc: 'Upload files to Google Drive', auth: 'any' },
  { method: 'GET', path: '/api/audit', desc: 'Audit log entries', auth: 'admin' },
];

const SECURITY = [
  { title: 'CSRF Double-Submit', desc: 'XSRF-TOKEN cookie + X-XSRF-Token header on every mutating API request.', icon: '🛡️' },
  { title: 'Role-Based Access', desc: 'Four roles (admin, staff, contractor, client) with per-route guards.', icon: '🔑' },
  { title: 'Audit Logging', desc: 'Every mutation logged with user, action, method, path, and metadata.', icon: '📝' },
  { title: 'Rate Limiting', desc: 'In-memory rate limiter on public endpoints (booking, plugin-lead, reset-password).', icon: '⏱️' },
  { title: 'File Upload Whitelisting', desc: 'Strict file type and size limits per upload route (10MB docs, 15MB images, 100MB Drive).', icon: '📎' },
  { title: 'Session Security', desc: 'NextAuth credentials strategy with httpOnly cookies and secure session tokens.', icon: '🔒' },
];

const DB_MODELS = [
  { name: 'Agency', fields: 'id, name, jurisdiction, comms tools', relations: 'users, contractors, clients, master agreements' },
  { name: 'User', fields: 'id, email, password, role, agency', relations: 'agency, contractor, client' },
  { name: 'Contractor', fields: 'id, name, role, status, tax/insurance/licensing docs', relations: 'agency, SOWs, assembled contracts' },
  { name: 'Client', fields: 'id, name, email, Drive folder ID', relations: 'agency, projects, folders, documents' },
  { name: 'Project', fields: 'id, name, status, progress, timeline, images', relations: 'client, contractor' },
  { name: 'SOW', fields: 'id, rate type, rate, payment schedule', relations: 'contractor, agency' },
  { name: 'AssembledContract', fields: 'id, HTML content, status', relations: 'contractor, agency, signatures' },
  { name: 'FileFolder', fields: 'id, name, Drive folder ID', relations: 'client' },
  { name: 'AuditLog', fields: 'id, action, method, path, entity, metadata', relations: 'agency' },
];

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-dark text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-heading font-black text-sm">W</div>
            <span className="font-heading font-bold text-sm text-white">WhoIsDésir<span className="text-miami-pink">®</span> Media</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#stack" className="text-sm text-white/50 hover:text-white transition-colors">Tech Stack</a>
            <a href="#architecture" className="text-sm text-white/50 hover:text-white transition-colors">Architecture</a>
            <a href="#api" className="text-sm text-white/50 hover:text-white transition-colors">API</a>
            <a href="#security" className="text-sm text-white/50 hover:text-white transition-colors">Security</a>
            <a href="#database" className="text-sm text-white/50 hover:text-white transition-colors">Database</a>
          </div>
          <Link href="/login" className="btn-primary text-sm px-5 py-2.5">
            Login
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-miami-blue-light/10 blur-[120px] -top-40 -right-40" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-miami-pink/8 blur-[100px] bottom-0 -left-40" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-miami-blue-light animate-pulse" />
            <span className="text-xs text-white/60 font-medium">Developer Documentation</span>
          </div>
          <h1 className="font-heading font-black text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6">
            <span className="text-white">Build With</span><br />
            <span className="gradient-text">WhoIsDésir</span><br />
            <span className="text-white">Media Platform</span>
          </h1>
          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
            A full-stack SaaS platform for creative agency management. Next.js 14, PostgreSQL, Google Drive integration, and enterprise-grade security — all open for inspection.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#stack" className="btn-primary text-base px-8 py-3.5">
              Explore the Stack
            </a>
            <a href="#api" className="btn-secondary border-white/10 text-white/70 hover:border-white/30 hover:text-white text-base px-8 py-3.5">
              View API Routes
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
          {[
            { value: '16+', label: 'DB Models' },
            { value: '14+', label: 'API Routes' },
            { value: '4', label: 'User Roles' },
            { value: '6', label: 'Security Layers' },
            { value: '3', label: 'Portals' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading font-black text-3xl md:text-4xl gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section id="stack" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-miami-blue-light uppercase tracking-widest mb-3 block">Tech Stack</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Built With Modern Tools</h2>
            <p className="text-white/40 max-w-lg mx-auto">Every layer of the stack is chosen for performance, type safety, and developer experience.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECH_STACK.map((t) => (
              <div key={t.name} className={`group bg-gradient-to-br ${t.color} border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300`}>
                <div className="text-3xl mb-3">{t.icon}</div>
                <h3 className="font-heading font-bold text-base text-white mb-1">{t.name}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-miami-pink uppercase tracking-widest mb-3 block">Architecture</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Platform Architecture</h2>
            <p className="text-white/40 max-w-lg mx-auto">Four core systems working together to power the agency workflow.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {ARCHITECTURE.map((a) => (
              <div key={a.title} className="relative bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{a.icon}</span>
                  <h3 className="font-heading font-bold text-xl text-white">{a.title}</h3>
                </div>
                <p className="text-sm text-white/40 leading-relaxed mb-4">{a.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {a.items.map((item) => (
                    <span key={item} className="text-xs bg-white/5 border border-white/10 text-white/60 px-3 py-1 rounded-full">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API ROUTES */}
      <section id="api" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-miami-blue-light uppercase tracking-widest mb-3 block">API Reference</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">RESTful API Routes</h2>
            <p className="text-white/40 max-w-lg mx-auto">Every route is guarded. Auth pattern: <code className="bg-white/5 px-2 py-0.5 rounded text-miami-blue-light text-xs">requireAdmin()</code> or <code className="bg-white/5 px-2 py-0.5 rounded text-miami-blue-light text-xs">requireAuth()</code>.</p>
          </div>
          <div className="space-y-2">
            {API_ROUTES.map((r, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-xl px-5 py-3 hover:bg-white/[0.06] transition-colors">
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded ${
                  r.method === 'GET' ? 'bg-green-500/15 text-green-400' :
                  r.method === 'POST' ? 'bg-blue-500/15 text-blue-400' :
                  r.method === 'PATCH' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-red-500/15 text-red-400'
                }`}>{r.method}</span>
                <code className="text-sm text-white/70 font-mono flex-1">{r.path}</code>
                <span className="text-xs text-white/30 hidden md:block">{r.desc}</span>
                {r.auth && (
                  <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${
                    r.auth === 'admin' ? 'bg-miami-pink/15 text-miami-pink' :
                    r.auth === 'any' ? 'bg-miami-blue-light/15 text-miami-blue-light' :
                    'bg-white/10 text-white/50'
                  }`}>{r.auth === true ? 'auth' : r.auth}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-miami-pink uppercase tracking-widest mb-3 block">Security</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Enterprise-Grade Security</h2>
            <p className="text-white/40 max-w-lg mx-auto">Six layers of protection applied across every endpoint and data flow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY.map((s) => (
              <div key={s.title} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-heading font-bold text-base text-white mb-2">{s.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DATABASE */}
      <section id="database" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-miami-blue-light uppercase tracking-widest mb-3 block">Database</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Prisma Schema — 16 Models</h2>
            <p className="text-white/40 max-w-lg mx-auto">PostgreSQL via Supabase, type-safe queries via Prisma ORM. Run <code className="bg-white/5 px-2 py-0.5 rounded text-miami-blue-light text-xs">npx prisma studio</code> to explore.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {DB_MODELS.map((m) => (
              <div key={m.name} className="bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4 hover:bg-white/[0.06] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-bold text-sm text-white">{m.name}</span>
                </div>
                <p className="text-xs text-white/30 mb-1">{m.fields}</p>
                <p className="text-[0.65rem] text-white/20">→ {m.relations}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-4 text-xs text-white/30">
              <span>Schema: <code className="text-miami-blue-light">prisma/schema.prisma</code></span>
              <span>·</span>
              <span>Migrate: <code className="text-miami-blue-light">npm run db:push</code></span>
              <span>·</span>
              <span>Seed: <code className="text-miami-blue-light">npm run db:seed</code></span>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT STRUCTURE */}
      <section className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-miami-pink uppercase tracking-widest mb-3 block">Project Structure</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Codebase Organization</h2>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 font-mono text-sm">
            <div className="space-y-1 text-white/50">
              <div><span className="text-miami-blue-light">src/</span></div>
              <div className="pl-4"><span className="text-miami-pink">app/</span></div>
              <div className="pl-8"><span className="text-white/70">api/</span> <span className="text-white/30">— route handlers (auth, clients, contractors, projects, drive, audit)</span></div>
              <div className="pl-8"><span className="text-white/70">admin/</span> <span className="text-white/30">— admin dashboard, projects, clients, contractors, training</span></div>
              <div className="pl-8"><span className="text-white/70">contractor/</span> <span className="text-white/30">— vendor portal (projects, contracts, onboarding, training)</span></div>
              <div className="pl-8"><span className="text-white/70">client/</span> <span className="text-white/30">— client portal (dashboard, media, documents, training)</span></div>
              <div className="pl-8"><span className="text-white/70">knowledge-base/</span> <span className="text-white/30">— public knowledge base (no auth)</span></div>
              <div className="pl-4"><span className="text-miami-pink">lib/</span> <span className="text-white/30">— auth.ts, audit.ts, prisma.ts, drive.ts, driveService.ts, storage.ts, rateLimit.ts</span></div>
              <div className="pl-4"><span className="text-miami-pink">components/</span> <span className="text-white/30">— Sidebar, ContractorSidebar, ClientSidebar, SignaturePad, MediaTile, HtmlRenderer</span></div>
              <div className="pl-4"><span className="text-miami-pink">middleware.ts</span> <span className="text-white/30">— CSRF double-submit protection</span></div>
              <div><span className="text-miami-blue-light">prisma/</span></div>
              <div className="pl-4"><span className="text-white/70">schema.prisma</span> <span className="text-white/30">— 16 models, PostgreSQL</span></div>
              <div className="pl-4"><span className="text-white/70">seed.ts</span> <span className="text-white/30">— dev data seeder</span></div>
              <div><span className="text-miami-blue-light">public/</span></div>
              <div className="pl-4"><span className="text-white/70">*.html</span> <span className="text-white/30">— training guides, knowledge base, admin setup docs</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-6">
            Ready to explore?
          </h2>
          <p className="text-white/40 mb-10 text-lg">
            Clone the repo, set up your environment, and start building.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="btn-primary text-base px-8 py-3.5">
              Login to Dashboard
            </Link>
            <Link href="/portal-guide" className="btn-secondary border-white/10 text-white/70 hover:border-white/30 hover:text-white text-base px-8 py-3.5">
              Portal Guide
            </Link>
          </div>
          <div className="mt-8 inline-flex items-center gap-4 text-xs text-white/20">
            <span>Repo: <code className="text-white/40">whoisdesirtech/widmediaagency</code></span>
            <span>·</span>
            <span>Stack: Next.js 14 · TypeScript · Prisma · PostgreSQL</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white font-heading font-black text-[10px]">W</div>
            <span className="text-sm text-white/30">WhoIsDésir<span className="text-miami-pink/60">®</span> Media</span>
            <span className="text-xs text-white/30">v1.1.0</span>
          </div>
          <div className="text-xs text-white/20">
            Developer Documentation — Public Access
          </div>
          <div className="text-xs text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span className="mx-2">·</span>
            <Link href="/portal-guide" className="hover:text-white/60 transition-colors">Portal Guide</Link>
            <span className="mx-2">·</span>
            <Link href="/knowledge-base" className="hover:text-white/60 transition-colors">Knowledge Base</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
