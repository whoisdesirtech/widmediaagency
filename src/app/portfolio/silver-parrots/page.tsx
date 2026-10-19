'use client';

import Link from 'next/link';

export default function SilverParrotsShowcase() {
  return (
    <main className="min-h-screen bg-dark-900 text-white selection:bg-purple-500/30 selection:text-white">
      {/* Top Navigation / Breadcrumbs */}
      <nav className="border-b border-white/5 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm">
            <Link
              href="/"
              className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Agency</span>
            </Link>
            <span className="text-white/20">/</span>
            <Link
              href="/portfolio"
              className="text-white/60 hover:text-white transition-colors"
            >
              Portfolio
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-purple-300 font-medium">Silver Parrots®</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portfolio"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all"
            >
              ← Back to Portfolio
            </Link>
            <a
              href="https://docs.google.com/presentation/d/1Vgkf8xiq5nbSfuhtOx9MEqdqZSnCqnDRtirdFlomqFg/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center gap-1 shadow-glow-sm"
            >
              <span>Pitch Deck</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:py-24 border-b border-white/5 overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Brand & Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  EdTech &amp; Learning Marketplace
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  FIU Business Incubation
                </span>
                <span className="text-[11px] font-mono text-white/40 px-2.5 py-0.5 rounded bg-white/5">
                  Elementary K-5 Focus
                </span>
              </div>

              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
                Silver Parrots<span className="text-purple-400">®</span>
              </h1>

              <p className="text-lg sm:text-xl text-purple-200/90 font-medium">
                Alleviating High-Stakes State Assessment Stress Through Curriculum-Aligned Video Learning &amp; Certified Educator Tutoring.
              </p>

              <p className="text-muted text-base leading-relaxed font-body">
                Silver Parrots is an educational technology ecosystem purpose-built for parents and elementary students navigating rigorous Common Core standards and annual state testing. By marrying on-demand instructional media with a vetted marketplace of certified teachers, Silver Parrots transforms test anxiety into foundational mastery.
              </p>

              {/* Status Note on external website */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-purple-500/20 text-xs text-white/70 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse mt-1.5 flex-shrink-0" />
                <div className="space-y-1">
                  <span className="font-semibold text-white">Domain &amp; Platform Status Note:</span>
                  <p>
                    The original standalone domain (<code className="text-purple-300">silverparrots.com</code>) is currently undergoing full system re-architecture. This platform showcase documents the core system architecture, business model, and curriculum roadmap.
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="https://docs.google.com/presentation/d/1Vgkf8xiq5nbSfuhtOx9MEqdqZSnCqnDRtirdFlomqFg/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-glow-sm flex items-center gap-2"
                >
                  <span>Explore Presentation &amp; Pitch Deck</span>
                  <span className="text-xs">↗</span>
                </a>
                <a
                  href="mailto:kiborrero@gmail.com,digitalvurv@gmail.com?subject=Silver%20Parrots%20Platform%20Inquiry"
                  className="px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-semibold text-sm transition-all"
                >
                  Contact Project Leadership →
                </a>
              </div>
            </div>

            {/* Right Column: Logo & Visual Brand Asset */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-purple-500/20 via-cyan-400/20 to-purple-600/30 blur-xl opacity-75" />
                <div className="relative rounded-3xl bg-dark-800/90 border border-white/10 p-8 shadow-2xl flex flex-col items-center text-center">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-white p-4 shadow-lg flex items-center justify-center overflow-hidden mb-6">
                    <img
                      src="/portfolio/silver-parrots-logo.png"
                      alt="Silver Parrots Official Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="font-heading font-black text-2xl text-white tracking-tight">Silver Parrots®</h3>
                  <p className="text-xs font-mono uppercase text-purple-300 mt-1 mb-4">Official Brand Identity &amp; System</p>
                  <div className="grid grid-cols-2 gap-3 w-full text-left text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-white/40 block text-[10px] uppercase font-mono">Founder</span>
                      <span className="text-white font-medium">Katherine Borrero</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-white/40 block text-[10px] uppercase font-mono">Collaboration</span>
                      <span className="text-cyan-300 font-medium">FIU Business</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-white/40 block text-[10px] uppercase font-mono">Curriculum</span>
                      <span className="text-white font-medium">Common Core K-5</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-white/40 block text-[10px] uppercase font-mono">Target Region</span>
                      <span className="text-white font-medium">Florida Public Schools</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Challenge / Problem Solved */}
      <section className="py-20 border-b border-white/5 bg-dark-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 block mb-2 font-mono">
              The Academic Crisis
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
              The Pressure of High-Stakes Elementary State Testing
            </h2>
            <p className="text-muted text-base mt-3 leading-relaxed">
              With the strict accountability metrics of annual state assessments and Common Core standards, parents and elementary school children face an unprecedented retention crisis.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-dark-800 border border-white/5 hover:border-purple-400/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">High Testing Stress</h3>
              <p className="text-xs text-muted leading-relaxed font-body">
                Parents experience severe anxiety over their child’s annual state assessment scores, while children absorb the psychological weight and threat of grade retention.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-800 border border-white/5 hover:border-purple-400/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">Parent Time Squeeze</h3>
              <p className="text-xs text-muted leading-relaxed font-body">
                Demanding work hours, career schedules, and managing multi-child households make it difficult for parents to dedicate daily hours to individual tutoring.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-800 border border-white/5 hover:border-purple-400/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">Pedagogical Gap</h3>
              <p className="text-xs text-muted leading-relaxed font-body">
                Modern Common Core math and reading methodologies differ substantially from traditional methods, forcing parents to re-teach themselves before they can help their children.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-800 border border-white/5 hover:border-purple-400/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-lg mb-4">
                04
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">Resource Overwhelm</h3>
              <p className="text-xs text-muted leading-relaxed font-body">
                Generic online tutoring marketplaces lack curriculum curation, leaving families guessing whether a tutor or worksheet will actually move the needle on state tests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Portal Architecture */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-2 font-mono">
              System Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
              The Dual-Sided Platform Model
            </h2>
            <p className="text-muted text-base mt-3 leading-relaxed">
              Silver Parrots bridges families and certified classroom educators through dedicated, role-specific interfaces.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Parent & Student Portal */}
            <div className="rounded-3xl bg-dark-800 border border-cyan-400/20 p-8 flex flex-col justify-between hover:border-cyan-400/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 font-bold">
                    For Parents &amp; Students
                  </span>
                  <span className="text-xs text-white/40 font-mono">Client Interface</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-3">Curated Mastery Portal</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-6 font-body">
                  A stress-free home learning experience providing on-demand curriculum videos and effortless certified teacher matching.
                </p>

                <ul className="space-y-3.5 mb-8 text-sm text-white/80">
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span><strong>Filtered Tutor Discovery:</strong> Search by subject (Math, Reading, Test Prep, Accelerated Core).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span><strong>Flexible Scheduling:</strong> Book virtual video lessons or physical face-to-face sessions on custom schedules.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span><strong>Curriculum Video Library:</strong> High-yield instructional videos categorized by Common Core standard.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span><strong>Digestible Parent Guides:</strong> Quick articles and home activities to support learning without confusion.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs text-cyan-300 font-mono">
                <span>Outcome: Reduced Stress &amp; Confident Students</span>
              </div>
            </div>

            {/* Certified Educator Portal */}
            <div className="rounded-3xl bg-dark-800 border border-purple-400/20 p-8 flex flex-col justify-between hover:border-purple-400/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-purple-400/10 text-purple-300 border border-purple-400/20 font-bold">
                    For Certified Educators
                  </span>
                  <span className="text-xs text-white/40 font-mono">Teacher Interface</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-3">Educator Hub &amp; Marketplace</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-6 font-body">
                  Empowering verified schoolteachers with flexible income, content publishing tools, and direct family contracting.
                </p>

                <ul className="space-y-3.5 mb-8 text-sm text-white/80">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span><strong>Autonomous Scheduling:</strong> Set custom days, preferred hours, and virtual or in-person radius.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span><strong>Content Contribution:</strong> Author articles, submit practice modules, and publish video lessons.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span><strong>Direct Client Contracting:</strong> Receive parent tutoring bookings without agency middlemen.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span><strong>Verified Credentialing:</strong> State-certified teacher verification guaranteeing top pedagogical quality.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs text-purple-300 font-mono">
                <span>Outcome: Fair Educator Compensation &amp; Impact</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Differentiation */}
      <section className="py-20 border-b border-white/5 bg-dark-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 block mb-2 font-mono">
              Competitive Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
              Why Silver Parrots Outperforms Generic Tutoring
            </h2>
            <p className="text-muted text-base mt-3 leading-relaxed">
              Traditional marketplaces like WyzAnt, Tutor.com, and Care.com are generic directories. Silver Parrots was designed from the ground up for K-5 state testing success.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-mono uppercase text-white/50">
                  <th className="py-4 px-6">Feature / Capability</th>
                  <th className="py-4 px-6 text-purple-300 font-bold bg-purple-500/10 border-x border-purple-500/20">
                    Silver Parrots®
                  </th>
                  <th className="py-4 px-6">Generic Apps (WyzAnt / Care.com)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Target Audience Focus</td>
                  <td className="py-4 px-6 text-purple-200 font-semibold bg-purple-500/5 border-x border-purple-500/20">
                    Elementary (K-5) Foundational Skills
                  </td>
                  <td className="py-4 px-6 text-white/50">Broad (K-12 through College &amp; Adult)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Curriculum Alignment</td>
                  <td className="py-4 px-6 text-purple-200 font-semibold bg-purple-500/5 border-x border-purple-500/20">
                    Direct Common Core &amp; Annual State Testing Mapped
                  </td>
                  <td className="py-4 px-6 text-white/50">Unstructured, subject-only keywords</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Self-Paced Multimedia</td>
                  <td className="py-4 px-6 text-purple-200 font-semibold bg-purple-500/5 border-x border-purple-500/20">
                    Curated teacher-created video tutorials included
                  </td>
                  <td className="py-4 px-6 text-white/50">None (only hourly live sessions)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Parent Empowerment Resources</td>
                  <td className="py-4 px-6 text-purple-200 font-semibold bg-purple-500/5 border-x border-purple-500/20">
                    Digestible coaching articles &amp; home practice kits
                  </td>
                  <td className="py-4 px-6 text-white/50">Rarely provided</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Educator Standards</td>
                  <td className="py-4 px-6 text-purple-200 font-semibold bg-purple-500/5 border-x border-purple-500/20">
                    Certified Public School Teachers &amp; Educators
                  </td>
                  <td className="py-4 px-6 text-white/50">Peer tutors, college students, unvetted</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Leadership & Project Details */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block font-mono">
                Project Leadership &amp; Incubation
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
                Academic Foundation &amp; Development
              </h2>
              <p className="text-muted text-base leading-relaxed font-body">
                Originated under the leadership of Katherine Borrero in partnership with the Florida International University (FIU) Business Department, Silver Parrots represents an evidence-based approach to solving educational friction in South Florida school districts.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 text-cyan-300 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    01
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Parent Discovery &amp; Validation</h4>
                    <p className="text-xs text-muted mt-0.5">Comprehensive surveys of local elementary parents mapping testing stress and Common Core challenges.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 text-cyan-300 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    02
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Certified Teacher Content Recruitment</h4>
                    <p className="text-xs text-muted mt-0.5">Engaging certified classroom teachers across county districts to produce standard-aligned tutorial videos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 text-cyan-300 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    03
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Dual Interface Application</h4>
                    <p className="text-xs text-muted mt-0.5">Building scalable mobile &amp; web experiences connecting families and teachers in virtual or face-to-face environments.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-dark-800 border border-white/5 p-8 space-y-6">
              <h3 className="font-heading font-bold text-xl text-white">Project Information</h3>
              <dl className="divide-y divide-white/5 text-sm">
                <div className="py-3 flex justify-between">
                  <dt className="text-white/50 font-mono text-xs">Project Title</dt>
                  <dd className="text-white font-medium">SilverParrots (Silverparrots.com)</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-white/50 font-mono text-xs">Founder / Leader</dt>
                  <dd className="text-white font-medium">Katherine Borrero</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-white/50 font-mono text-xs">Academic Partner</dt>
                  <dd className="text-cyan-300 font-medium">FIU Business Department</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-white/50 font-mono text-xs">Location</dt>
                  <dd className="text-white font-medium">North Miami Beach, FL</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-white/50 font-mono text-xs">Primary Contact</dt>
                  <dd className="text-purple-300 font-medium">kiborrero@gmail.com</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-white/50 font-mono text-xs">Agency Engineering</dt>
                  <dd className="text-miami-pink font-medium">WhoIsDésir® Media</dd>
                </div>
              </dl>

              <a
                href="https://docs.google.com/presentation/d/1Vgkf8xiq5nbSfuhtOx9MEqdqZSnCqnDRtirdFlomqFg/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-2"
              >
                <span>Open Google Slides Presentation Deck</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA / Return */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-mono uppercase text-purple-400 font-bold tracking-widest block">
            WhoIsDésir® Media Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
            Explore More Ventures &amp; Intelligent Systems
          </h2>
          <p className="text-muted text-base max-w-xl mx-auto">
            From financial AI to creative agency automation and K-5 education, discover our active platforms and technology prototypes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/portfolio"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all"
            >
              Browse All Portfolio Projects →
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/10 text-white/80 font-semibold text-sm transition-all"
            >
              Back to Agency Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
