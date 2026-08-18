'use client';

import Link from 'next/link';

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-pink-500/5 blur-[120px] -top-40 -right-40" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-400/5 blur-[100px] bottom-0 -left-40" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs text-gray-500 font-medium">Developer Portal</span>
          </div>
          <h1 className="font-heading font-black text-4xl md:text-6xl text-gray-900 leading-[0.95] mb-6">
            <span className="text-gray-900">Welcome to</span><br />
            <span className="gradient-text">WhoIsDésir</span><br />
            <span className="text-gray-900">Developer Portal</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track projects, manage tasks, conduct influencer audits, and create brand kits — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/developer/portfolio" className="btn-primary text-base px-8 py-3.5">
              View Portfolio
            </Link>
            <Link href="/developer/projects" className="btn-secondary text-base px-8 py-3.5">
              Browse Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📁', title: 'Developer Portfolio', desc: 'Showcase completed work and track project progress', href: '/developer/portfolio' },
              { icon: '🚀', title: 'Projects', desc: 'Manage agency projects with timelines and deliverables', href: '/developer/projects' },
              { icon: '✅', title: 'Task Tracking', desc: 'Assign and track work for team members and interns', href: '/developer/tasks' },
              { icon: '👤', title: 'Influencer Management', desc: 'Track influencer profiles and audit status', href: '/developer/influencers' },
              { icon: '📊', title: 'Influencer Audits', desc: 'Conduct comprehensive influencer assessments', href: '/developer/audits' },
              { icon: '🎨', title: 'Brand Kits', desc: 'Create reusable Social Media Brand Kit templates', href: '/developer/brand-kits' },
            ].map((feature) => (
              <Link key={feature.href} href={feature.href} className="glass-card p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white font-heading font-black text-[10px]">W</div>
            <span className="text-sm text-gray-500">WhoIsDésir<span className="text-pink-500/60">®</span> Media</span>
          </div>
          <div className="text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <span className="mx-2">·</span>
            <Link href="/login" className="hover:text-gray-600 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
