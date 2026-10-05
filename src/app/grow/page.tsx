'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import QualificationCalculator from '@/components/growth/QualificationCalculator';
import ScoringSimulator from '@/components/growth/ScoringSimulator';
import FunnelBuilder from '@/components/growth/FunnelBuilder';
import FollowUpPlanner from '@/components/growth/FollowUpPlanner';
import PipelineDemo from '@/components/growth/PipelineDemo';

const NAV = [
  { href: '#pipeline', label: 'The Pipeline' },
  { href: '#curriculum', label: 'Curriculum' },
  { href: '#session', label: 'Live Session' },
  { href: '#tools', label: 'Practice' },
  { href: '#services', label: 'Agency' },
  { href: '#rsvp', label: 'RSVP' },
];

const PIPELINE_STAGES = ['Lead', 'Proposal', 'Needs Info', 'Follow-Up', 'Won · Lost', 'Revenue'];

const PIPELINE_METRICS: [string, string][] = [
  ['Total Leads', 'How many opportunities entered the pipeline'],
  ['Proposals Sent', 'How many leads received an offer'],
  ['Needs More Information', "Which prospects aren't ready to move forward"],
  ['Follow-Up 30+', 'Older opportunities requiring continued nurturing'],
  ['Follow-Up 60+', "Long-term prospects that shouldn't be forgotten"],
  ['Won', 'Converted customers'],
  ['Lost', 'Opportunities that did not convert'],
  ['Revenue', 'Financial result of the pipeline'],
];

const FRAMEWORK: [string, string, string][] = [
  ['1', 'Generate', 'Where leads come from: referrals, networking, Google, social media, events, existing customers, partnerships, website and landing pages.'],
  ['2', 'Capture', 'Name, email, phone, business, need/problem, source, and the date they entered the pipeline.'],
  ['3', 'Qualify', 'What does the prospect need? Can you solve it? Are they ready, or do they need more information? Is there a clear next step?'],
  ['4', 'Present', 'Consultation, proposal, offer, pricing, and next steps — a clear ask instead of an open loop.'],
  ['5', 'Nurture', 'The 30+ and 60+ follow-up system. A lead that didn\u2019t respond isn\u2019t a dead lead — it\u2019s a lead at an earlier stage.'],
  ['6', 'Convert', 'Won → revenue → customer onboarding. The pipeline\u2019s output, not an accident.'],
  ['7', 'Analyze', 'Total leads → proposals → won → revenue. Where are prospects getting stuck? How many older leads are being neglected?'],
];

const SESSION_AGENDA: [string, string, string][] = [
  ['0–10', 'Why leads matter', 'The difference between a list of contacts and a working pipeline.'],
  ['10–20', 'Lead generation', 'Every source: referrals, networking, Google, social, events, partnerships.'],
  ['20–30', 'Building the pipeline', 'Stage by stage: lead → proposal → followed up → won or lost.'],
  ['30–40', 'Follow-up and nurturing', 'The 30+ and 60+ system — nothing gets forgotten.'],
  ['40–50', 'Tracking leads and revenue', 'The metrics that answer: where are we stuck, how much is this producing?'],
  ['50–60', 'Live example + Q&A', "Real WhoIsDésir examples, not a generic course. Ask anything."],
];

const PAID_MODULES = [
  'Lead Generation',
  'Lead Capture & Qualification',
  'Proposals & Offers',
  'Lead Nurturing',
  '30/60+ Day Follow-Up',
  'Sales Pipeline Management',
  'Conversion & Revenue',
  'Measuring Performance',
];

const SEGMENTS = [
  {
    title: 'Media Agencies',
    desc: 'Agency founders and marketing directors who need funnel consistency, retained work, and overflow production without buyer churn.',
    tag: 'South FL + national',
  },
  {
    title: 'Luxury Hospitality',
    desc: 'Boutique hotels and groups solving seasonal pipeline, brand consistency across properties, and content velocity.',
    tag: 'Miami in-person',
  },
  {
    title: 'Corporate Lifestyle',
    desc: 'Executive-level brand, media, events, and hospitality services for professional services firms and corporate teams.',
    tag: 'Digital-first',
  },
];

const DEFICIENCIES = [
  { problem: 'Inconsistent pipeline', fix: 'Fixed qualification floors, 15-min inbound SLA, 24-h ownership' },
  { problem: 'Unclear positioning', fix: 'Channel-by-channel scripts with one tone rule' },
  { problem: 'High client churn', fix: 'Retention + expansion loops, quarterly educational drips' },
  { problem: 'No contact→contract system', fix: 'Canonical CRM stages, gated proposals, deposit-first handoff' },
];

const SERVICES = [
  { title: 'Growth Retainer', detail: 'Monthly lead + media engine', floor: '$3,000/mo minimum' },
  { title: 'Production Project', detail: 'Brand, media, events, deliverables', floor: '$10,000 minimum' },
  { title: 'Operational Audit', detail: 'Free funnel + positioning audit', floor: 'Lead magnet, no obligation' },
  { title: 'Custom Technical Build', detail: 'Out-of-scope engineering', floor: 'Higher custom rates / partner referral' },
];

const RESULTS = [
  { metric: '+[__]%', label: 'Documented revenue growth', note: '[signed-off client figure]' },
  { metric: '[__]×', label: 'Lead volume increase', note: '[signed-off client figure]' },
  { metric: '[__]/mo', label: 'Media production benchmark', note: '[verified per-engagement]' },
  { metric: '[__]', label: 'Enterprise testimonial', note: '[quoted after written approval]' },
];

const SCRIPTS = [
  {
    id: 'email',
    name: 'Email',
    tone: 'Short sentences · name the category problem · one sample · one question · compliant sender + opt-out.',
    blocks: [
      ['Subject', 'Pipeline inconsistency → who fixes it'],
      [
        'Body',
        'Hi {first}, marketing directors at {segment} tell me the same three things: pipeline is lumpy, positioning drifts, and churn eats margin. The fix was a repeatable nurture system, not more ads. Worth a 12-minute pressure test of your funnel? — {signer}, WhoIsDésir® Media',
      ],
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    tone: 'Refer to their visible work · attach a teardown · ask for nothing · re-nudge on day 3–5.',
    blocks: [
      ['Connection note', '{First}, your {observation about their content} stands out. I deconstruct agency pipelines — here is one teardown in your space: {link}. Open to a 15-minute scan.'],
      ['Day 3–5 re-nudge', 'No agenda beyond usefulness: can I send the {audit/template} we hand prospects before any call? Requesting nothing back.'],
    ],
  },
  {
    id: 'phone',
    name: 'Phone',
    tone: 'Warm leads only · reference the asset · give a 3-minute and a 12-minute option.',
    blocks: [
      ['Script', 'Hi {first}, {name} from WhoIsDésir. You downloaded {resource} last week. I have a 3-minute answer to {pain point} and a 12-minute version. Which fits your calendar?'],
    ],
  },
  {
    id: 'sms',
    name: 'SMS',
    tone: 'Only after phone contact or an explicit reply · short · keep the value link.',
    blocks: [
      ['Text', '{First}, quick one — cancelled calls are fine; here is the {asset} anyway so context is not lost: {url}. — {name}'],
    ],
  },
  {
    id: 'network',
    name: 'Networking',
    tone: 'Miami in-person · diagnose, do not pitch · one question at the end.',
    blocks: [
      ['In-room opener', 'We fix pipeline inconsistency and churn for {segment} — usually a retention and a lead engine, not a campaign spend increase. What is the bottleneck at {their org} right now?'],
    ],
  },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="text-xs font-semibold text-miami-pink uppercase tracking-widest mb-3 block">{children}</span>;
}

export default function GrowPage() {
  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-heading font-black text-sm">W</div>
            <span className="font-heading font-bold text-sm text-white">
              WhoIsDésir<span className="text-miami-pink">®</span> Media
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-6">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-sm text-white/50 hover:text-white transition-colors">
                {n.label}
              </a>
            ))}
          </div>
          <a href="#rsvp" className="btn-primary text-sm px-5 py-2.5">
            Reserve a seat
          </a>
        </div>
      </nav>

      {/* HERO — MASTERCLASS */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-miami-pink/10 blur-[130px] -top-40 -right-40" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-miami-blue-light/10 blur-[110px] bottom-0 -left-40" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/60 font-medium">Free masterclass · Live on Google Meet · 60 minutes</span>
          </div>
          <h1 className="font-heading font-black text-4xl md:text-7xl leading-[1.02] mb-6">
            <span className="text-white">Lead Generation &amp; </span>
            <br />
            <span className="text-white">Lead Nurturing </span>
            <span className="gradient-text">Masterclass</span>
          </h1>
          <p className="text-lg text-white/40 max-w-2xl mx-auto mb-8 leading-relaxed">
            A free live training from <b className="text-white">WhoIsDésir® Media</b> — the agency that runs this system for
            media, hospitality, and corporate-lifestyle clients. You learn the whole pipeline: generate, capture, qualify,
            present, nurture, convert, and analyze. Practical and introductory. Real examples, not a generic course.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#rsvp" className="btn-primary text-base px-8 py-3.5">
              Reserve a free seat
            </a>
            <a href="#pipeline" className="btn-secondary border-white/10 text-white/70 hover:border-white/30 hover:text-white text-base px-8 py-3.5">
              See the pipeline model
            </a>
          </div>
          <p className="mt-6 text-xs text-white/30">
            No outcome promises, ever. This is the operating system behind our verified [MASKED] client results — learn it before you hire it.
          </p>
        </div>
      </section>

      {/* PIPELINE */}
      <section id="pipeline" className="border-y border-white/5 bg-white/[0.02] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow>The core model</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">
              A lead isn&rsquo;t dead because they didn&rsquo;t buy immediately
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Leads are a pipeline, not a list of contacts. Every opportunity is always at some stage — the question is what
              it needs next.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <span
                  className={`rounded-xl border px-4 py-2 text-sm font-heading font-bold ${
                    i === PIPELINE_STAGES.length - 1
                      ? 'border-miami-pink/40 bg-miami-pink/10 text-white'
                      : i === 0
                        ? 'border-miami-blue-light/40 bg-miami-blue-light/10 text-white'
                        : 'border-white/10 bg-white/[0.03] text-white/70'
                  }`}
                >
                  {stage}
                </span>
                {i < PIPELINE_STAGES.length - 1 && <span className="text-white/25">→</span>}
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {PIPELINE_METRICS.map(([metric, lesson]) => (
              <div key={metric} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <div className="font-heading font-bold text-miami-blue-light whitespace-nowrap">{metric}</div>
                <span className="text-white/20 mt-2">→</span>
                <p className="text-sm text-white/60 leading-relaxed">{lesson}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-miami-pink/20 bg-white/[0.02] p-6 md:p-8">
            <p className="text-white/40 text-sm mb-3">
              Instead of: <span className="text-white/70 italic">&ldquo;They didn&rsquo;t respond, so I guess they&rsquo;re not interested.&rdquo;</span>
            </p>
            <p className="text-white/90 text-lg font-heading font-bold">
              You learn: <span className="gradient-text">&ldquo;What stage is this lead in, what information are they missing, and what is the next appropriate follow-up?&rdquo;</span>
            </p>
          </div>
        </div>
      </section>

      {/* FRAMEWORK */}
      <section id="curriculum" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Eyebrow>Masterclass framework</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Seven steps from stranger to revenue</h2>
            <p className="text-white/40 max-w-lg mx-auto">
              The whole course is one loop you can run for any business — the same stages we run at the agency.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FRAMEWORK.map(([n, title, desc]) => (
              <div key={n} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-heading font-black shrink-0">{n}</div>
                <div>
                  <h3 className="font-heading font-bold text-white mb-1">{title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREE SESSION */}
      <section id="session" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow>Free · Live · 60 minutes</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Lead Generation &amp; Lead Nurturing Fundamentals</h2>
            <p className="text-white/40 max-w-xl mx-auto">
              A practical, introductory Google Meet session with real WhoIsDésir examples. No sales pitch — just the system.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden mb-12">
            {SESSION_AGENDA.map(([time, title, desc], i) => (
              <div key={time} className={`flex items-start gap-5 p-6 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                <div className="font-heading font-black text-white/30 text-sm whitespace-nowrap">{time} min</div>
                <div>
                  <h3 className="font-heading font-bold text-white">{title}</h3>
                  <p className="text-sm text-white/40">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div id="rsvp" className="max-w-2xl mx-auto">
            <MasterclassRsvpForm />
          </div>
        </div>
      </section>

      {/* PAID ROADMAP */}
      <section id="roadmap" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Eyebrow>What&rsquo;s next</Eyebrow>
            <div className="inline-flex items-center gap-2 rounded-full border border-miami-blue-light/30 bg-miami-blue-light/10 px-4 py-1.5 text-xs text-miami-blue-light font-medium mb-6">
              Roadmap · Requires Florida CIE approval
            </div>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">The Certified Masterclass</h2>
            <p className="text-white/40 max-w-xl mx-auto">
              The free session is the full practical path today. Once Florida CIE approval allows a structured curriculum with
              assessment and certification, this page becomes the door to it. We won&rsquo;t sell that tier before it&rsquo;s legal.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
            {PAID_MODULES.map((m) => (
              <div key={m} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-white/70 font-heading font-bold">
                {m}
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6 md:p-8">
            <p className="text-sm text-white/50 leading-relaxed">
              <b className="text-white">Then assessment, not just video:</b> students receive 20 fictional leads and must
              correctly place them into the pipeline — total leads → proposal → needs info → follow-up 30+ → follow-up 60+ →
              won/lost — then calculate the resulting revenue.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-heading font-bold">
              {['LEARN', 'PRACTICE', 'ASSESS', 'CERTIFY'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="rounded-full border border-miami-pink/30 bg-miami-pink/10 px-3 py-1 text-miami-pink">{s}</span>
                  {i < 3 && <span className="text-white/25">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow>Learn → practice</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Practice what you learn</h2>
            <p className="text-white/40 max-w-xl mx-auto">
              The same calculators and pipeline demos the masterclass is built on. Run your own numbers — no email required.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <QualificationCalculator />
            <ScoringSimulator />
            <div className="lg:col-span-2">
              <FunnelBuilder />
            </div>
            <div className="lg:col-span-2">
              <FollowUpPlanner />
            </div>
            <div className="lg:col-span-2">
              <PipelineDemo />
            </div>
          </div>
        </div>
      </section>

      {/* SEGMENTS */}
      <section id="who" className="border-y border-white/5 bg-white/[0.02] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow>Built from a live agency</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-white">We teach what the agency runs daily</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SEGMENTS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-bold text-lg text-white">{s.title}</h3>
                  <span className="rounded-full border border-miami-blue-light/30 bg-miami-blue-light/10 px-3 py-1 text-[10px] text-miami-blue-light">
                    {s.tag}
                  </span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SYSTEM */}
      <section id="system" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Eyebrow>The system</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">We fixed our own pipeline before we sell yours</h2>
            <p className="text-white/40 max-w-lg mx-auto">
              The four failure modes of agency growth — and the countermeasures built into this operating system.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {DEFICIENCIES.map((d) => (
              <div key={d.problem} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-heading font-black shrink-0">→</div>
                <div>
                  <h3 className="font-heading font-bold text-white mb-1">{d.problem}</h3>
                  <p className="text-sm text-white/40">{d.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Eyebrow>When you&rsquo;re past learning</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Agency services with honest floors</h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Engagements below our minimum spend get educational resources or partner referrals — never force-fitted.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <h3 className="font-heading font-bold text-white mb-1">{s.title}</h3>
                <p className="text-sm text-white/40 mb-4">{s.detail}</p>
                <div className="text-xs text-miami-blue-light font-semibold">{s.floor}</div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-white/30">
            Partner referrals earn 10% of the initial invoice, extended to 5% across the first three billed months of multi-month contracts.
          </p>
        </div>
      </section>

      {/* CASE STUDY */}
      <section id="case-study" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow>Reference case</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">Miami hospitality group</h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Anonymized until figures and testimonial are signed off. Structure is real; numbers are masked by default.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8 md:p-10">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xs text-white/30 uppercase tracking-wide mb-2">Challenge</h3>
                <p className="text-sm text-white/70">
                  Seasonal demand spikes, inconsistent brand content across three properties, and no repeatable group-sales acquisition motion.
                </p>
              </div>
              <div>
                <h3 className="text-xs text-white/30 uppercase tracking-wide mb-2">Engagement</h3>
                <p className="text-sm text-white/70">
                  6-month media + growth retainer: operational audit, content cadence, brand assets, and a nurture system for group-sales prospects.
                </p>
              </div>
              <div>
                <h3 className="text-xs text-white/30 uppercase tracking-wide mb-2">Result</h3>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>Revenue growth: +[__]%</li>
                  <li>Lead volume: [__]×</li>
                  <li>Assets: [__] per month</li>
                </ul>
                <p className="text-xs text-white/30 mt-2">[MASKED — awaiting client sign-off]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section id="results" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow>Verified results framework</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-white mb-4">Every claim auditable</h2>
            <p className="text-white/40 max-w-lg mx-auto">
              We publish only signed-off, verifiable outcomes. Until then the framework is shown so you can see exactly what gets measured.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {RESULTS.map((r) => (
              <div key={r.label} className="text-center rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <div className="font-heading font-black text-3xl md:text-4xl gradient-text mb-1">{r.metric}</div>
                <div className="text-sm text-white/70">{r.label}</div>
                <div className="text-[10px] text-white/30 mt-2">{r.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CADENCE */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow>Nurture engine</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">The 21-day cadence</h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Multi-channel by design: automated top-of-funnel beats, manual high-value touches on accounts that matter.
            </p>
          </div>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              ['0–4', 'Confirm + asset', 'Automated Email + LinkedIn + value email'],
              ['7', 'Video audit', 'Manual · 12-minute personalized audit'],
              ['10–18', 'Objection nudges', 'Cost/in-house rebuttals + teardowns + roundtables'],
              ['21', 'Ask or park', 'Clear ask → proposal, or quarterly drip'],
            ].map(([t, title, desc]) => (
              <div key={t} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <div className="font-heading font-black text-2xl gradient-text mb-2">D{t}</div>
                <h3 className="font-heading font-bold text-sm text-white mb-1">{title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCRIPTS */}
      <section id="scripts" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow>Field playbook</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-white mb-4">Scripts across every channel</h2>
            <p className="text-white/40 max-w-lg mx-auto">
              One tone rule everywhere: short, diagnostic, one sample, one question, one opt-out that always works.
            </p>
          </div>
          <ScriptsPlaybook />
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow>Guardrails</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-white mb-4">Compliance is a feature</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'CAN-SPAM + GDPR: explicit opt-out in every message, one-click honored',
              'Verified business contact data, real company identification, physical address disclosed',
              'Active-client exclusivity checks before discovery; conflicts are referred, not fought',
              'No outcome, timeline, or revenue guarantees — ever',
            ].map((c) => (
              <div key={c} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-sm text-white/60">
                <span className="text-miami-pink mt-0.5">✓</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT — AGENCY */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Eyebrow>After the masterclass</Eyebrow>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white mb-4">When you need the machine itself</h2>
            <p className="text-white/40">
              Book an agency engagement against the floors, or stay on the educational drip. Inbound answers within{' '}
              <b className="text-white">15 minutes</b>; your senior account executive takes ownership within{' '}
              <b className="text-white">24 hours</b> of the discovery call.
            </p>
          </div>
          <GrowthLeadForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white font-heading font-black text-[10px]">W</div>
            <span className="text-sm text-white/30">
              WhoIsDésir<span className="text-miami-pink/60">®</span> Media
            </span>
          </div>
          <div className="text-xs text-white/20">
            WhoIsDésir® Media · Florida, United States · Physical address disclosed in email footers per CAN-SPAM.
            No outcome guarantees. Unsubscribe at any time.
          </div>
          <div className="text-xs text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">
              Platform
            </Link>
            <span className="mx-2">·</span>
            <Link href="/portal-guide" className="hover:text-white/60 transition-colors">
              Portal Guide
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Scripts playbook (tabbed) ---------- */
function ScriptsPlaybook() {
  const [active, setActive] = useState('email');
  const script = SCRIPTS.find((s) => s.id === active)!;
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {SCRIPTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              active === s.id ? 'border-miami-pink/50 bg-miami-pink/15 text-white' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/25'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h3 className="font-heading font-bold text-lg text-miami-blue-light mb-2">{script.name} · tone</h3>
        <p className="text-sm text-white/60 mb-5">{script.tone}</p>
        <div className="space-y-4">
          {script.blocks.map(([label, copy]) => (
            <div key={label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-[10px] text-white/30 uppercase tracking-wide mb-1">{label}</div>
              <p className="text-sm text-white/75 leading-relaxed">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Masterclass RSVP ---------- */
function MasterclassRsvpForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    consent: false,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.consent) {
      setError('Consent is required — one click, honored forever.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/growth-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          company: form.company,
          message: form.message,
          segment: 'other',
          serviceInterest: 'masterclass',
          source: 'masterclass-landing',
          consent: form.consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 text-center">
        <div className="font-heading font-black text-3xl gradient-text mb-4">Seat reserved — welcome in</div>
        <p className="text-white/50 mb-6">
          Your calendar invite with the Google Meet link is on the way to the inbox you entered. We keep the room practical:
          60 minutes, real examples, and a working pipeline you can start using the same day.
        </p>
        <button
          onClick={() => {
            setDone(false);
            setForm({ ...form, firstName: '', lastName: '', email: '', phone: '', company: '', message: '', consent: false });
          }}
          className="btn-secondary border-white/10 text-white/70 hover:border-white/30 hover:text-white"
        >
          Register another seat
        </button>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm focus:border-miami-pink outline-none';

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
      <div className="text-center mb-6">
        <h3 className="font-heading font-black text-2xl text-white">Reserve your free seat</h3>
        <p className="text-sm text-white/40 mt-2">Live on Google Meet · 60 minutes · first-name, no-pitch culture</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input required className={inputCls} placeholder="First name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
        <input className={inputCls} placeholder="Last name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
        <input required type="email" className={inputCls} placeholder="Work email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        <input type="tel" className={inputCls} placeholder="Phone (optional, for the reminder)"
          value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        <input className={`${inputCls} sm:col-span-2`} placeholder="Business (optional)" value={form.company} onChange={(e) => set('company', e.target.value)} />
      </div>
      <label className="block text-xs text-white/50 mt-4">
        What&rsquo;s your #1 demand-generating blocker right now? (optional)
        <input className={`${inputCls} mt-1`} placeholder="e.g. no repeatable referral source, old follow-ups go cold…"
          value={form.message} onChange={(e) => set('message', e.target.value)} />
      </label>
      <label className="flex items-start gap-2 text-sm text-white/60 cursor-pointer mt-5">
        <input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} className="accent-miami-pink mt-0.5" />
        <span>
          I consent to receive the session invite and relevant follow-up. CAN-SPAM/GDPR compliant: one-click opt-out, real
          company identification, and our physical Florida address on every message.
        </span>
      </label>
      {error && <div className="mt-4 rounded-lg border border-miami-pink/40 bg-miami-pink/10 px-4 py-2 text-sm text-miami-pink-soft">{error}</div>}
      <button type="submit" disabled={busy} className="btn-primary w-full mt-6 disabled:opacity-50">
        {busy ? 'Reserving…' : 'Reserve a free seat'}
      </button>
      <p className="text-center text-[10px] text-white/20 mt-3">
        No outcome promises. We teach the pipeline; results stay [MASKED] until signed off — exactly what the session teaches you to do too.
      </p>
    </form>
  );
}

/* ---------- Multi-stage agency lead capture form ---------- */
const SEGMENT_ID = ['media_agency', 'luxury_hospitality', 'corporate_lifestyle', 'other'] as const;

function GrowthLeadForm() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { verdict: string }>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    segment: 'media_agency',
    annualRevenue: '1M-5M',
    monthlySpend: '',
    retainerBudget: '',
    projectBudget: '',
    decisionTimeline: '<30days',
    authority: true,
    serviceInterest: 'retainer',
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    message: '',
    consent: false,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.consent) {
      setError('Consent is required — one click, honored forever.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/growth-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          monthlySpend: form.monthlySpend ? Number(form.monthlySpend) : undefined,
          retainerBudget: form.retainerBudget ? Number(form.retainerBudget) : undefined,
          projectBudget: form.projectBudget ? Number(form.projectBudget) : undefined,
          hasAuthority: form.authority,
          consent: form.consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setDone({ verdict: data.verdict });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="font-heading font-black text-3xl gradient-text mb-4">Received — thank you</div>
        <p className="text-white/50 mb-6">
          Routing decision: <b className="text-white">{done.verdict.replaceAll('_', ' ')}</b>. First touch lands within 15 minutes;
          if it does not qualify, you get the education drip or a clean partner referral — no hard pitching.
        </p>
        <button
          onClick={() => {
            setDone(null);
            setStep(0);
          }}
          className="btn-secondary border-white/10 text-white/70 hover:border-white/30 hover:text-white"
        >
          Submit another fit
        </button>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm focus:border-miami-pink outline-none';

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
      <div className="flex items-center gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'gradient-bg' : 'bg-white/10'}`} />
        ))}
        <span className="text-xs text-white/30 ml-3">Step {step + 1} of 3</span>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-xl text-white">Who are you?</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {SEGMENT_ID.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set('segment', s)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  form.segment === s ? 'border-miami-pink/50 bg-miami-pink/10 text-white' : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25'
                }`}
              >
                {s.replaceAll('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => setStep(1)} className="btn-primary">
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-xl text-white">Fit signals</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-xs text-white/50">
              Annual revenue
              <select className={inputCls} value={form.annualRevenue} onChange={(e) => set('annualRevenue', e.target.value)}>
                <option value="<1M" className="bg-dark-800">Under $1M</option>
                <option value="1M-5M" className="bg-dark-800">$1M – $5M</option>
                <option value="5M-20M" className="bg-dark-800">$5M – $20M</option>
                <option value="20M+" className="bg-dark-800">$20M+</option>
              </select>
            </label>
            <label className="block text-xs text-white/50">
              Current monthly marketing/media spend ($)
              <input type="number" min={0} className={inputCls} value={form.monthlySpend} onChange={(e) => set('monthlySpend', e.target.value)} placeholder="e.g. 10000" />
            </label>
            <label className="block text-xs text-white/50">
              Retainer budget ($/mo)
              <input type="number" min={0} className={inputCls} value={form.retainerBudget} onChange={(e) => set('retainerBudget', e.target.value)} placeholder="e.g. 5000" />
            </label>
            <label className="block text-xs text-white/50">
              Project budget ($)
              <input type="number" min={0} className={inputCls} value={form.projectBudget} onChange={(e) => set('projectBudget', e.target.value)} placeholder="e.g. 15000" />
            </label>
            <label className="block text-xs text-white/50">
              Decision timeline
              <select className={inputCls} value={form.decisionTimeline} onChange={(e) => set('decisionTimeline', e.target.value)}>
                <option value="immediate" className="bg-dark-800">Immediate</option>
                <option value="<30days" className="bg-dark-800">Within 30 days</option>
                <option value="30-90days" className="bg-dark-800">30–90 days</option>
                <option value="90days+" className="bg-dark-800">90+ days</option>
              </select>
            </label>
            <label className="block text-xs text-white/50">
              Service interest
              <select className={inputCls} value={form.serviceInterest} onChange={(e) => set('serviceInterest', e.target.value)}>
                <option value="retainer" className="bg-dark-800">Ongoing retainer</option>
                <option value="project" className="bg-dark-800">One-time project</option>
                <option value="audit" className="bg-dark-800">Operational audit</option>
                <option value="technical-custom" className="bg-dark-800">Custom technical build</option>
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
            <input type="checkbox" checked={form.authority} onChange={(e) => set('authority', e.target.checked)} className="accent-miami-blue-light" />
            I can move within the timeline above
          </label>
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(0)} className="btn-secondary border-white/10 text-white/70 hover:border-white/30 hover:text-white">
              Back
            </button>
            <button type="button" onClick={() => setStep(2)} className="btn-primary">
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-xl text-white">Contact + consent</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input required className={inputCls} placeholder="First name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
            <input className={inputCls} placeholder="Last name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
            <input className={inputCls} placeholder="Company" value={form.company} onChange={(e) => set('company', e.target.value)} />
            <input required type="email" className={inputCls} placeholder="Work email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <textarea
            className={`${inputCls} h-24`}
            placeholder="Optional: describe the operational bottleneck — one sentence is enough (we'll ask one clarifying question before acting)."
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
          />
          <label className="flex items-start gap-2 text-sm text-white/60 cursor-pointer">
            <input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} className="accent-miami-pink mt-0.5" />
            <span>
              I consent to be contacted about this inquiry. CAN-SPAM/GDPR compliant: one-click opt-out, company identification, and our physical Florida
              address appear in every message.
            </span>
          </label>
          {error && <div className="rounded-lg border border-miami-pink/40 bg-miami-pink/10 px-4 py-2 text-sm text-miami-pink-soft">{error}</div>}
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary border-white/10 text-white/70 hover:border-white/30 hover:text-white">
              Back
            </button>
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
              {busy ? 'Submitting…' : 'Submit fit'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}