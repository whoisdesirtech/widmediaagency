'use client';

import Link from 'next/link';

const SERVICES = [
  { icon: '📸', title: 'Photography', desc: 'Event, brand, product, and editorial photography with licensed professionals.' },
  { icon: '🎬', title: 'Videography', desc: 'Commercial production, social content, documentaries, and post-production.' },
  { icon: '📱', title: 'Content & Social', desc: 'Social media strategy, content creation, community management, and analytics.' },
  { icon: '🎨', title: 'Design & Creative', desc: 'Brand identity, UI/UX, motion graphics, print, and digital design.' },
];

const PLATFORM_FEATURES = [
  { icon: '📋', title: 'Contract Assembly', desc: 'Automatically merge your Master Agreement, role-specific addenda, and SOW into one cohesive legal document.' },
  { icon: '✍️', title: 'Digital Signatures', desc: 'Both parties sign electronically. Real-time status tracking from draft to fully executed agreement.' },
  { icon: '📄', title: 'Vendor Onboarding', desc: 'Contractors self-serve document uploads — W-9, insurance, licensing — with status dashboards for your team.' },
];

const STEPS = [
  { num: '1', label: 'Add Vendor', desc: 'Register contractor details' },
  { num: '2', label: 'Create SOW', desc: 'Define rates & deliverables' },
  { num: '3', label: 'Assemble', desc: 'Auto-generate contract' },
  { num: '4', label: 'Sign', desc: 'Both parties sign digitally' },
];

export default function LandingPage() {
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
            <a href="#services" className="text-sm text-white/50 hover:text-white transition-colors">Services</a>
            <a href="#platform" className="text-sm text-white/50 hover:text-white transition-colors">Platform</a>
            <a href="#about" className="text-sm text-white/50 hover:text-white transition-colors">About</a>
          </div>
          <Link href="/login" className="btn-primary text-sm px-5 py-2.5">
            Login
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-miami-pink/10 blur-[120px] -top-40 -right-40" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-miami-blue-light/8 blur-[100px] bottom-0 -left-40" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/60 font-medium">The Creative Agency Platform</span>
          </div>
          <h1 className="font-heading font-black text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6">
            <span className="text-white">Manage Your</span><br />
            <span className="gradient-text">Freelance Agreements</span><br />
            <span className="text-white">In One Place</span>
          </h1>
          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
            A modular talent agreement system built for creative agencies. Onboard vendors, assemble contracts, collect signatures — all from a single platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="btn-primary text-base px-8 py-3.5">
              Get Started
            </Link>
            <a href="#platform" className="btn-secondary border-white/10 text-white/70 hover:border-white/30 hover:text-white text-base px-8 py-3.5">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '14', label: 'Vendor Roles' },
            { value: '20', label: 'Legal Clauses' },
            { value: '12', label: 'Role Addenda' },
            { value: '12', label: 'Onboarding Phases' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading font-black text-3xl md:text-4xl gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-miami-pink uppercase tracking-widest mb-3 block">What We Do</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Creative Services</h2>
            <p className="text-white/40 max-w-lg mx-auto">End-to-end creative production powered by a curated network of specialized freelancers.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="group bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-heading font-bold text-lg text-white mb-2">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM */}
      <section id="platform" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-miami-blue-light uppercase tracking-widest mb-3 block">The Platform</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">SaaS-Powered Agreement Management</h2>
            <p className="text-white/40 max-w-lg mx-auto">From draft to execution — automate the legal and administrative side of hiring freelancers.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLATFORM_FEATURES.map((f) => (
              <div key={f.title} className="relative bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-2xl mb-5">{f.icon}</div>
                <h3 className="font-heading font-bold text-xl text-white mb-3">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-miami-pink-soft uppercase tracking-widest mb-3 block">How It Works</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Four Steps to a Signed Agreement</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white font-heading font-black text-xl mx-auto mb-4">
                  {step.num}
                </div>
                <div className="font-heading font-bold text-white text-base mb-1">{step.label}</div>
                <div className="text-xs text-white/40">{step.desc}</div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <div className="hidden md:flex items-center gap-3 text-white/20 text-sm">
              <span className="w-16 h-px bg-white/10" />
              <span>Automated pipeline from onboarding to execution</span>
              <span className="w-16 h-px bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold text-miami-blue-light uppercase tracking-widest mb-3 block">Who We Are</span>
          <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-6">Built for Creative Agencies</h2>
          <p className="text-white/40 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            WhoIsDésir® Media is a creative agency platform that combines talent management with legal automation. We handle the agreements so you can focus on the work.
          </p>
          <div className="inline-flex items-center gap-2 bg-miami-pink/10 border border-miami-pink/20 rounded-full px-5 py-2">
            <span className="text-sm text-miami-pink-soft font-semibold">Florida, United States</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-6">
            Ready to streamline your<br />freelance agreements?
          </h2>
          <p className="text-white/40 mb-10 text-lg">
            Log in to access your agency dashboard, manage vendors, and assemble contracts.
          </p>
          <Link href="/login" className="btn-primary text-lg px-10 py-4">
            Login to Dashboard
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
            Freelancer Talent Agreement System. All contracts are drafts until reviewed by a licensed attorney.
          </div>
        </div>
      </footer>
    </div>
  );
}
