import Link from 'next/link';

const LOGIN_STEPS = [
  { num: '1', label: 'Open the platform', desc: 'Go to whoisdesir.com and click “Login” in the top-right corner.' },
  { num: '2', label: 'Enter your email', desc: 'Use the email address your temporary credentials were sent to.' },
  { num: '3', label: 'Enter your password', desc: 'Your temporary password was provided to you separately. Never share it.' },
  { num: '4', label: 'Change your password', desc: 'After your first login, update your password to something only you know.' },
];

const ROLES = [
  {
    id: 'vendors',
    icon: '🧑‍💻',
    badge: 'Vendors',
    badgeColor: 'text-miami-blue-light',
    badgeBg: 'bg-miami-blue-light/10',
    border: 'hover:border-miami-blue-light/40',
    glow: 'bg-miami-blue-light/8',
    title: 'Contractor / Vendor Portal',
    intro: 'Onboard, accept work orders, sign contracts, and deliver files — all in one place.',
    steps: [
      { title: 'Complete your onboarding', desc: 'Log in and finish your onboarding checklist: upload your W-9, insurance certificate, and any required licensing documents.' },
      { title: 'Review & accept SOWs', desc: 'When the agency sends you a Statement of Work, review the scope, rates, and deliverables, then accept it in your portal.' },
      { title: 'Sign contracts electronically', desc: 'Once your agreement is assembled, review it and sign digitally — no printing or scanning required.' },
      { title: 'Upload deliverables', desc: 'As projects progress, submit your deliverables and media directly to the project in your portal.' },
      { title: 'Access training', desc: 'Complete any assigned training materials to stay ready for upcoming work.' },
    ],
  },
  {
    id: 'clients',
    icon: '🤝',
    badge: 'Clients',
    badgeColor: 'text-miami-pink-soft',
    badgeBg: 'bg-miami-pink/10',
    border: 'hover:border-miami-pink/40',
    glow: 'bg-miami-pink/8',
    title: 'Client Portal',
    intro: 'Follow your projects, review agreements, and access your deliverables and media.',
    steps: [
      { title: 'Log in to your dashboard', desc: 'Sign in and land on your Client Dashboard, where your active projects and their status are shown.' },
      { title: 'Review & sign agreements', desc: 'When a contract or agreement is sent to you, review it and sign it electronically right from your portal.' },
      { title: 'Track your projects', desc: 'Follow project updates and milestones so you always know where things stand.' },
      { title: 'Access deliverables & media', desc: 'Download your final deliverables, media, and shared documents from the project files.' },
      { title: 'Manage billing', desc: 'View invoices and update your billing and payment information in your account.' },
    ],
  },
  {
    id: 'admins',
    icon: '🛡️',
    badge: 'Admins & Staff',
    badgeColor: 'text-green-400',
    badgeBg: 'bg-green-400/10',
    border: 'hover:border-green-400/40',
    glow: 'bg-green-400/6',
    title: 'Agency Dashboard',
    intro: 'Manage vendors and clients, assemble contracts, and keep the agency moving.',
    steps: [
      { title: 'Log in to the agency dashboard', desc: 'Sign in with your admin or staff account to access the full agency dashboard.' },
      { title: 'Manage vendors & clients', desc: 'Add and manage contractors (vendors) and clients, and keep their details up to date.' },
      { title: 'Create SOWs & assemble contracts', desc: 'Build Statements of Work, attach role-specific addenda, and auto-assemble complete agreements.' },
      { title: 'Track onboarding & signatures', desc: 'Monitor vendor onboarding status and signature progress from draft to fully executed.' },
      { title: 'Review the audit log', desc: 'Periodically review the audit log to monitor account activity and keep the platform secure.' },
    ],
  },
];

export default function PortalGuidePage() {
  return (
    <div className="min-h-screen bg-dark text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-heading font-black text-sm">W</div>
            <span className="font-heading font-bold text-sm text-white">WhoIsDésir<span className="text-miami-pink">®</span> Media</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">Back to Home</Link>
            <Link href="/login" className="btn-primary text-sm px-5 py-2.5">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-miami-pink/10 blur-[120px] -top-40 -right-40" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-miami-blue-light/8 blur-[100px] bottom-0 -left-40" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-xs font-semibold text-miami-blue-light uppercase tracking-widest mb-4 block">Portal Guide</span>
          <h1 className="font-heading font-black text-4xl md:text-6xl leading-[1.05] mb-6">
            How to Access Your <span className="gradient-text">Portal</span>
          </h1>
          <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
            Everything you need to log in and get started — choose your role below for your specific instructions.
            Your temporary credentials were sent to you separately and are never shown on this page.
          </p>
        </div>
      </section>

      {/* LOGIN STEPS */}
      <section className="px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card !bg-dark-900/80 !border-white/10 p-8 md:p-10">
            <h2 className="font-heading font-bold text-xl text-white mb-6">Logging in — everyone</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LOGIN_STEPS.map((s) => (
                <div key={s.num}>
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-heading font-black text-sm mb-3">
                    {s.num}
                  </div>
                  <div className="font-heading font-semibold text-white text-sm mb-1">{s.label}</div>
                  <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROLE SECTIONS */}
      <section className="py-16 px-6 space-y-10">
        <div className="max-w-6xl mx-auto space-y-10">
          {ROLES.map((role) => (
            <div
              key={role.id}
              className={`relative bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-12 transition-all duration-300 ${role.border}`}
            >
              <div className={`absolute w-[400px] h-[400px] rounded-full blur-[120px] -top-32 -right-24 pointer-events-none ${role.glow}`} />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl">{role.icon}</span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${role.badgeBg} ${role.badgeColor}`}>
                    {role.badge}
                  </span>
                </div>
                <h2 className="font-heading font-black text-2xl md:text-3xl text-white mb-2">{role.title}</h2>
                <p className="text-white/40 text-sm mb-8 max-w-2xl">{role.intro}</p>

                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  {role.steps.map((step, i) => (
                    <div key={step.title} className="flex gap-4">
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/60 text-xs font-heading font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-heading font-semibold text-white mb-1">{step.title}</div>
                        <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HELP */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-black text-3xl md:text-4xl text-white mb-6">Need help?</h2>
          <p className="text-white/40 text-lg mb-8 leading-relaxed">
            If you forgot your password, use the “Forgot password?” link on the login page — a reset link will be sent to
            your email. If you still can’t get in, contact the agency for assistance.
          </p>
          <Link href="/login" className="btn-primary text-lg px-10 py-4">
            Go to Login
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white font-heading font-black text-[10px]">W</div>
            <span className="text-sm text-white/30">WhoIsDésir<span className="text-miami-pink/60">®</span> Media</span>
          </div>
          <div className="text-xs text-white/20">
            <Link href="/" className="hover:text-white/40 transition-colors">Home</Link>
            <span className="mx-3">·</span>
            <Link href="/portal-guide" className="hover:text-white/40 transition-colors">Portal Guide</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
