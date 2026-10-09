'use client';

import { useState } from 'react';
import Link from 'next/link';

type Category = 'all' | 'ai-software' | 'creative-media' | 'hospitality';

interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'ai-software' | 'creative-media' | 'hospitality';
  categoryLabel: string;
  status: string;
  statusColor: string;
  badge: string;
  image?: string;
  imageAlt?: string;
  description: string;
  problemSolved: string;
  highlights: string[];
  technologies: string[];
  primaryLink?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  secondaryLink?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
}

const PROJECTS: Project[] = [
  {
    id: 'magnitax',
    title: 'Magnitax®',
    subtitle: 'AI-Augmented Tax & Financial Services Portal',
    category: 'ai-software',
    categoryLabel: 'AI & Software Platform',
    status: 'Active Prototype & Strategy',
    statusColor: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    badge: 'Financial AI',
    image: '/portfolio/magnitax-preview.png',
    imageAlt: 'Magnitax Gold Theme Portal Interface Mockup',
    description:
      'A luxury, AI-augmented tax and financial intelligence platform designed to eliminate traditional tax filing bottlenecks for clients, preparers, and reviewers.',
    problemSolved:
      'Solves friction in manual document collection, slow tax season review cycles, and fragmented communication between clients and certified preparers.',
    highlights: [
      'Automated client document intake and intelligent W-2 / 1099 extraction',
      'Real-time return status pipeline and self-service document vault',
      'Role-based multi-tier portal for clients, staff preparers, and senior reviewers',
      'Sleek executive gold-and-navy theme with bank-grade data security',
    ],
    technologies: ['Next.js', 'Firebase / Firestore', 'Cloud Functions', 'Tailwind CSS', 'Document AI', 'TypeScript'],
    primaryLink: {
      label: 'Explore Architecture & Strategy',
      href: '/speaker#contact',
    },
  },
  {
    id: 'creative-hub-ai',
    title: 'Creative Hub AI',
    subtitle: 'AI-Powered Stock Valuation & Market Analysis Engine',
    category: 'ai-software',
    categoryLabel: 'AI & Software Platform',
    status: 'Interactive Demo & Case Study',
    statusColor: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
    badge: 'FinTech Intelligence',
    description:
      'A quantitative financial intelligence engine providing automated discounted cash flow valuations, multi-factor market sensitivity analysis, and narrative synthesis.',
    problemSolved:
      'Enables non-institutional investors and founders to perform institutional-grade valuation models in seconds rather than hours of spreadsheet work.',
    highlights: [
      'Live automated valuation using multi-factor financial inputs',
      'Real-time scenario sensitivity analysis and risk flag detection',
      'Natural language summary explaining valuation drivers in plain English',
      'Live demonstration showcased at investor and entrepreneur workshops',
    ],
    technologies: ['Python', 'Machine Learning', 'Next.js', 'Chart.js', 'Financial Modeling', 'REST API'],
    primaryLink: {
      label: 'Read Demo Case Study →',
      href: '/articles/creative-hub-ai-live-demo.html',
    },
  },
  {
    id: 'silver-parrots',
    title: 'Silver Parrots®',
    subtitle: 'AI-Integrated Luxury Hospitality & Concierge Operations',
    category: 'hospitality',
    categoryLabel: 'Hospitality & Operations',
    status: 'Venture in Development',
    statusColor: 'bg-purple-400/10 text-purple-300 border-purple-400/30',
    badge: 'Hospitality Tech',
    description:
      'An intelligent guest experience and automated concierge platform powering boutique hospitality, private dining reservations, and curated lifestyle services.',
    problemSolved:
      'Bridging the gap between 24/7 guest demand and boutique hospitality staffing with personalized, context-aware automated concierge responses.',
    highlights: [
      '24/7 VIP guest messaging with automated dining & excursion reservations',
      'Seamless multi-channel dispatch across WhatsApp, SMS, and web concierge',
      'Persistent guest profile preferences and tailored itinerary synthesis',
      'Operations dashboard for instant staff handoffs on complex requests',
    ],
    technologies: ['Next.js', 'Automation APIs', 'Webhook Routing', 'Multi-Channel Comms', 'Tailwind CSS'],
    primaryLink: {
      label: 'Inquire About Hospitality Partnership →',
      href: 'mailto:digitalvurv@gmail.com?subject=Silver%20Parrots%20Partnership%20Inquiry',
      isExternal: true,
    },
  },
  {
    id: 'whoisdesir-media-platform',
    title: 'WhoIsDésir® Media Platform',
    subtitle: 'Creative Business Operations & Legal Agreement OS',
    category: 'ai-software',
    categoryLabel: 'AI & Software Platform',
    status: 'Live Production Platform',
    statusColor: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
    badge: 'Agency SaaS',
    description:
      'The comprehensive operating system behind WhoIsDésir® Media: orchestrating vendor onboarding, multi-role agreements, digital signatures, deliverable pipelines, and Google Drive integrations.',
    problemSolved:
      'Eliminates the chaotic back-and-forth of hiring creative freelancers by combining legal contract assembly, SOWs, digital signing, and asset delivery into one single system.',
    highlights: [
      'Automated contract assembly: Master Agreements + 12 role addenda + custom SOWs',
      'SHA-256 tamper-evident digital signature engine with IP verification',
      'Self-service contractor document onboarding (W-9, COI, Licensing)',
      'Automated Google Drive shared client folder provisioning and delivery pipelines',
    ],
    technologies: ['Next.js 14 App Router', 'TypeScript', 'Prisma', 'PostgreSQL (Supabase)', 'NextAuth', 'Google Drive API', 'Vercel'],
    primaryLink: {
      label: 'View Developer Documentation →',
      href: '/developer',
    },
    secondaryLink: {
      label: 'Portal Guide',
      href: '/portal-guide',
    },
  },
  {
    id: 'whoisdesir-1804',
    title: '1804 Haitian Pizza Grand Opening',
    subtitle: 'Cultural Media Production & Commercial Event Showcase',
    category: 'creative-media',
    categoryLabel: 'Creative Media Production',
    status: 'Completed Client Production',
    statusColor: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
    badge: 'Commercial Media',
    image: '/proposals/whoisdesir-1804/photos/Food Photography Sample 1.jpg',
    imageAlt: '1804 Haitian Pizza Gourmet Culinary Photography',
    description:
      'End-to-end commercial event photography and culinary branding for the Pompano Beach Grand Opening & FIFA World Cup Showcase, delivering reusable brand marketing assets.',
    problemSolved:
      'Capturing authentic cultural cuisine, high-energy community attendance, and commercial-grade food styling to position 1804 as a regional cultural anchor.',
    highlights: [
      'Complete culinary photo suite: food styling, dish close-ups, and oven action shots',
      'Grand opening event coverage: ribbon cutting, guests, and community champions',
      'Interior venue architectural photography for press and social media',
      '60+ edited commercial assets delivered with comprehensive usage licensing',
    ],
    technologies: ['Commercial Photography', 'Food Styling', 'Post-Production', 'Digital Asset Delivery'],
    primaryLink: {
      label: 'View Full Client Proposal & Showcase →',
      href: '/proposals/whoisdesir-1804',
    },
  },
  {
    id: 'growth-masterclass',
    title: 'Lead Gen & Nurturing Masterclass',
    subtitle: 'Florida CIE-Gated Growth Pipeline Architecture',
    category: 'ai-software',
    categoryLabel: 'AI & Software Platform',
    status: 'Live Production Route',
    statusColor: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
    badge: 'Growth Architecture',
    description:
      'An educational and client-acquisition masterclass landing system complete with 5 interactive financial simulators and compliance guardrails.',
    problemSolved:
      'Converts cold prospects into educated, high-conviction agency clients by proving the mathematics of client acquisition before sales outreach begins.',
    highlights: [
      '5 embedded interactive tools: Qualification Calculator, Scoring Simulator, Pipeline Demo',
      'Follow-Up Planner with multi-channel cadence mapping (Email, SMS, Retargeting)',
      'Florida CIE-gated roadmap: transparent transition from free masterclass to paid coaching',
      'Real-time lead capture endpoint with automated qualification scoring',
    ],
    technologies: ['Next.js 14 App Router', 'React Interactive Tools', 'Prisma GrowthLead', 'Tailwind CSS'],
    primaryLink: {
      label: 'Explore Growth Masterclass →',
      href: '/grow',
    },
  },
];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<Category>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = activeTab === 'all'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === activeTab);

  return (
    <div className="min-h-screen bg-dark text-white selection:bg-miami-pink selection:text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-heading font-black text-sm">W</div>
            <span className="font-heading font-bold text-sm text-white">WhoIsDésir<span className="text-miami-pink">®</span> Media</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">Home</Link>
            <Link href="/#services" className="text-sm text-white/50 hover:text-white transition-colors">Services</Link>
            <Link href="/#platform" className="text-sm text-white/50 hover:text-white transition-colors">Platform</Link>
            <Link href="/portfolio" className="text-sm text-miami-pink font-semibold transition-colors">Portfolio</Link>
            <Link href="/grow" className="text-sm text-white/50 hover:text-white transition-colors">Growth System</Link>
            <Link href="/speaker" className="text-sm text-white/50 hover:text-white transition-colors">Speaker</Link>
            <Link href="/developer" className="text-sm text-white/50 hover:text-white transition-colors">Developer</Link>
          </div>
          <Link href="/login" className="btn-primary text-sm px-5 py-2.5">
            Login
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-miami-pink/10 blur-[130px] -top-32 -right-32" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-miami-blue-light/10 blur-[120px] bottom-0 -left-40" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-miami-pink animate-pulse" />
            <span className="text-xs text-white/70 font-medium tracking-wide uppercase">Proprietary Ventures & Case Studies</span>
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
            <span className="text-white">Products, Platforms &amp;</span><br />
            <span className="gradient-text">Creative Production</span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-3xl mx-auto mb-10 leading-relaxed font-body">
            Explore active technology products, AI tools, commercial productions, and operating systems built and engineered by{' '}
            <strong className="text-white font-semibold">WhoIsDésir®</strong> across financial intelligence, hospitality, and media operations.
          </p>

          {/* METRIC STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-white/5">
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-center">
              <div className="font-heading font-black text-2xl sm:text-3xl gradient-text mb-1">5+</div>
              <div className="text-xs text-white/40">Core Ventures &amp; Products</div>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-center">
              <div className="font-heading font-black text-2xl sm:text-3xl gradient-text mb-1">100%</div>
              <div className="text-xs text-white/40">Tamper-Evident Signatures</div>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-center">
              <div className="font-heading font-black text-2xl sm:text-3xl gradient-text mb-1">60+</div>
              <div className="text-xs text-white/40">Production Asset Library</div>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-center">
              <div className="font-heading font-black text-2xl sm:text-3xl gradient-text mb-1">24/7</div>
              <div className="text-xs text-white/40">Automated Concierge Ops</div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER TABS */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/5 max-w-fit mx-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'all'
                  ? 'gradient-bg text-white shadow-glow-pink'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              All Works ({PROJECTS.length})
            </button>
            <button
              onClick={() => setActiveTab('ai-software')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'ai-software'
                  ? 'gradient-bg text-white shadow-glow-pink'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              AI &amp; Software ({PROJECTS.filter((p) => p.category === 'ai-software').length})
            </button>
            <button
              onClick={() => setActiveTab('creative-media')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'creative-media'
                  ? 'gradient-bg text-white shadow-glow-pink'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Creative Media ({PROJECTS.filter((p) => p.category === 'creative-media').length})
            </button>
            <button
              onClick={() => setActiveTab('hospitality')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'hospitality'
                  ? 'gradient-bg text-white shadow-glow-pink'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Hospitality Tech ({PROJECTS.filter((p) => p.category === 'hospitality').length})
            </button>
          </div>
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
            >
              {/* IMAGE / VISUAL BANNER */}
              {project.image ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40 border-b border-white/5">
                  <img
                    src={project.image}
                    alt={project.imageAlt || project.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-dark/80 backdrop-blur-md border border-white/10 text-white">
                      {project.badge}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[16/9] w-full p-6 flex flex-col justify-between bg-gradient-to-br from-white/[0.04] to-transparent border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-miami-blue-light">
                      {project.badge}
                    </span>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${project.statusColor}`}>
                      {project.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl mb-1">
                      {project.category === 'hospitality' ? '🦜' : project.id === 'creative-hub-ai' ? '📈' : '⚡'}
                    </div>
                    <div className="font-heading font-black text-xl text-white">{project.title}</div>
                  </div>
                </div>
              )}

              {/* CARD BODY */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-miami-pink uppercase tracking-wider">
                    {project.categoryLabel}
                  </span>
                  {project.image && (
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${project.statusColor}`}>
                      {project.status}
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-black text-2xl text-white mb-2 group-hover:text-miami-pink transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs font-medium text-white/40 mb-4">{project.subtitle}</p>

                <p className="text-sm text-white/60 leading-relaxed mb-5 font-body">
                  {project.description}
                </p>

                {/* HIGHLIGHTS */}
                <div className="mb-6 space-y-2 flex-1">
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Key Highlights</div>
                  {project.highlights.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-white/70">
                      <span className="text-miami-blue-light mt-0.5">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* TECH STACK BADGES */}
                <div className="pt-4 border-t border-white/5 mb-6">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white/[0.03] text-white/60 border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-3 pt-2">
                  {project.primaryLink && (
                    <Link
                      href={project.primaryLink.href}
                      target={project.primaryLink.isExternal ? '_blank' : undefined}
                      rel={project.primaryLink.isExternal ? 'noopener noreferrer' : undefined}
                      className="btn-primary text-xs flex-1 text-center py-2.5 px-4"
                    >
                      {project.primaryLink.label}
                    </Link>
                  )}
                  {project.secondaryLink && (
                    <Link
                      href={project.secondaryLink.href}
                      className="btn-secondary text-xs py-2.5 px-3 border-white/10 hover:border-white/30 text-white/70 hover:text-white"
                    >
                      {project.secondaryLink.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold text-miami-pink uppercase tracking-widest mb-3 block">
            Collaborate With Us
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-white mb-6">
            Building something ambitious in AI, Media, or Hospitality?
          </h2>
          <p className="text-base text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-body">
            Whether you need custom software engineering, commercial media production, or keynote speaking on practical AI adoption, we are ready to build.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/speaker#contact" className="btn-primary text-sm px-8 py-3.5">
              Book a Consultation →
            </Link>
            <Link href="/grow" className="btn-secondary text-sm px-8 py-3.5 border-white/10 hover:border-white/25 text-white">
              Explore Masterclass &amp; Growth Tools
            </Link>
            <Link href="/developer" className="btn-secondary text-sm px-8 py-3.5 border-white/10 hover:border-white/25 text-white/70 hover:text-white">
              Platform Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-6 bg-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white font-heading font-black text-xs">W</div>
            <span className="text-sm text-white/40">WhoIsDésir<span className="text-miami-pink/70">®</span> Media</span>
            <span className="text-xs text-white/30">v1.2.0</span>
          </div>
          <div className="text-xs text-white/20">
            Creative Business Operations &amp; Venture Suite. All trademarks property of their respective owners.
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>·</span>
            <Link href="/portfolio" className="text-white hover:text-miami-pink transition-colors">Portfolio</Link>
            <span>·</span>
            <Link href="/grow" className="hover:text-white transition-colors">Growth</Link>
            <span>·</span>
            <Link href="/speaker" className="hover:text-white transition-colors">Speaker</Link>
            <span>·</span>
            <Link href="/developer" className="hover:text-white transition-colors">Developer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
