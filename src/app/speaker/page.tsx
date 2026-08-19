'use client'

import { useState, type FormEvent } from 'react'

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Topics', href: '#topics' },
  { label: 'Past Talks', href: '#past-talks' },
  { label: 'Contact', href: '#contact' },
]

const topics = [
  {
    title: 'AI in Marketing',
    description:
      'How small and mid-size businesses can leverage AI for content creation, audience targeting, campaign optimization, and media production — without a giant budget or engineering team.',
  },
  {
    title: 'AI for Small Business',
    description:
      'Practical AI adoption strategies for entrepreneurs: automation workflows, AI-assisted customer service, intelligent bookkeeping, and tools that actually save time and money.',
  },
  {
    title: 'Practical AI Adoption',
    description:
      'A builder\'s guide to going from AI curiosity to deployed tooling: choosing the right model, avoiding common pitfalls, measuring ROI, and building a culture that embraces AI.',
  },
]

const talks = [
  {
    title: 'Creative Hub AI — Live Demo',
    subtitle: 'AI-Powered Stock Valuation & Market Analysis',
    description:
      'A live walkthrough of Creative Hub AI, an AI-powered tool that analyzes stock data, generates valuations, and provides market insights.',
    tags: ['AI', 'Finance', 'Live Demo'],
    date: '[DATE TBD]',
    featured: true,
  },
  {
    title: 'AI in Marketing: What Actually Works',
    subtitle: 'Industry Panel',
    description:
      'Panel discussion on AI applications in digital marketing — content generation, audience segmentation, and predictive analytics.',
    tags: ['Marketing', 'Panel'],
    date: '2025',
  },
  {
    title: 'Practical AI Workflows for Entrepreneurs',
    subtitle: 'Webinar',
    description:
      'Walked entrepreneurs through AI tools for customer service, content production, bookkeeping, and operations.',
    tags: ['Webinar', 'AI Tools'],
    date: '2025',
  },
  {
    title: 'Building Your Brand with Digital Media',
    subtitle: 'Marketing Workshop',
    description:
      'Workshop on digital media strategy and using AI-assisted tools to scale content production.',
    tags: ['Workshop', 'Content'],
    date: '2024',
  },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/speaker" className="text-lg font-heading font-semibold tracking-wide text-white">
            Désir Fils
          </a>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.href} href={link.href} className="text-sm text-muted hover:text-miami-pink transition-colors">
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="inline-flex items-center px-4 py-2 text-sm font-heading font-bold text-white gradient-bg rounded-full hover:shadow-glow-pink transition-all min-h-[44px]"
            >
              Book Now
            </a>
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-muted hover:text-white hover:bg-dark-800 transition-colors min-h-[44px] min-w-[44px]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-dark-900/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-sm text-muted hover:text-miami-pink transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="block w-full text-center px-4 py-3 text-sm font-heading font-bold text-white gradient-bg rounded-full min-h-[44px] leading-tight"
              onClick={() => setIsOpen(false)}
            >
              Book Now
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  return (
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-900 to-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-miami-pink/10 via-transparent to-transparent" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-miami-blue-light/5 blur-[120px] top-40 -left-40 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-32">
        <div className="mb-8">
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full border-2 border-miami-pink/30 overflow-hidden aspect-square">
            <img src="/speaker-headshot.jpg" alt="Désir Fils" className="w-full h-full object-cover" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black leading-tight mb-6 text-white">
          Désir Fils
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-muted font-body font-light mb-4">
          AI Engineer, Entrepreneur & Keynote Speaker
        </p>

        <p className="text-base sm:text-lg text-muted/60 font-body max-w-2xl mx-auto mb-10">
          Helping small businesses and entrepreneurs navigate AI adoption — from marketing and media production to practical, real-world implementation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:digitalvurv@gmail.com?subject=Speaking+Inquiry&body=Hi+D%C3%A9sir%2C%0A%0AI+came+across+your+speaker+page+and+would+like+to+explore+having+you+speak+at+our+event.%0A%0A%5BEvent+name%2C+date%2C+location%5D%0A%5BAudience+%2F+expected+attendance%5D%0A%5BTalk+topic+you%27d+like%5D%0A%0ABest%2C%0A%5BYour+Name%5D%0A%5BOrganization%5D"
            className="inline-flex items-center px-8 py-4 text-base font-heading font-bold text-white gradient-bg rounded-full hover:shadow-glow-pink transition-all min-h-[52px]"
          >
            Inquire About Speaking
          </a>
          <a
            href="#past-talks"
            className="inline-flex items-center px-8 py-4 text-base font-heading font-semibold text-muted border border-white/10 hover:border-miami-pink/50 rounded-full transition-all min-h-[52px]"
          >
            Watch Past Talks
          </a>
        </div>
      </div>
    </header>
  )
}

function About() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-dark-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold text-miami-blue-light uppercase tracking-widest mb-3 block">About</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white mb-2">
              Désir Fils
            </h2>
            <p className="text-miami-pink-soft font-body text-sm mb-8">
              Founder, WhoIsDésir®
            </p>
            <div className="space-y-4 text-muted font-body leading-relaxed">
              <p>
                Désir Fils is an AI engineer and entrepreneur building at the intersection of
                artificial intelligence, media, and hospitality. As the founder of an AI-powered
                media and hospitality company, he applies machine learning and automation across
                media production, marketing, business operations, and guest experiences.
              </p>
              <p>
                His portfolio includes <strong className="text-white">Magnitax®</strong> (AI-augmented
                tax and financial services), <strong className="text-white">Silver Parrots®</strong>
                (hospitality and concierge), the <strong className="text-white">WhoIsDésir®</strong>{' '}
                Media Agency, and the Creative Hub AI demo — an AI-powered stock valuation and
                market analysis tool that demonstrates practical AI application in finance.
              </p>
              <p>
                Désir speaks on AI in marketing, AI for small business, and practical AI adoption —
                sharing what he&apos;s learned building real products, not just theory. His talks are
                grounded in hands-on experience: training models, deploying AI tools, and using
                AI to drive measurable outcomes for real clients.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] bg-dark-800 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center p-8">
              <img src="/speaker-logo.png" alt="WhoIsDésir® Logo" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Topics() {
  return (
    <section id="topics" className="py-20 sm:py-28 bg-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-miami-pink uppercase tracking-widest mb-3 block">Keynotes</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white mb-4">
            Keynote Topics
          </h2>
          <p className="text-muted font-body max-w-2xl mx-auto">
            Each talk is tailored to the audience — part demo, part strategy session,
            and entirely grounded in real-world AI building.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {topics.map(topic => (
            <div
              key={topic.title}
              className="group p-6 sm:p-8 rounded-3xl bg-dark-900 border border-white/5 hover:border-miami-pink/30 transition-all duration-300"
            >
              <h3 className="text-xl font-heading font-bold text-white mb-3">
                {topic.title}
              </h3>
              <p className="text-muted font-body text-sm leading-relaxed">
                {topic.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PastTalks() {
  return (
    <section id="past-talks" className="py-20 sm:py-28 bg-dark-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-miami-blue-light uppercase tracking-widest mb-3 block">Experience</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white mb-4">
            Past Talks
          </h2>
          <p className="text-muted font-body max-w-2xl mx-auto">
            Featured keynotes, panels, and workshops. The Creative Hub AI demo is the headline
            AI talk; adjacent experience rounds out the record.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="aspect-video bg-dark-800 rounded-3xl border border-white/5 overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/XXhvNM6MDUU"
              title="Désir Fils Talk Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="aspect-video bg-dark-800 rounded-3xl border border-white/5 overflow-hidden">
            <img src="/speaker-event-photo.png" alt="Event photo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {talks.map(talk => (
            <div
              key={talk.title}
              className="p-5 rounded-2xl bg-dark-800/50 border border-white/5 hover:border-miami-pink/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-muted/50 font-mono">{talk.date}</span>
                {talk.featured && (
                  <span className="text-[10px] uppercase tracking-wider text-miami-pink font-semibold px-2 py-0.5 rounded-full border border-miami-pink/30">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="text-base font-heading font-bold text-white mb-1">
                {talk.title}
              </h3>
              <p className="text-xs text-muted/60 mb-2">{talk.subtitle}</p>
              <p className="text-xs text-muted/70 leading-relaxed mb-3">
                {talk.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {talk.tags.map(tag => (
                  <span key={tag} className="text-[10px] text-muted bg-dark-700 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [eventName, setEventName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const nameError = touched.name && !name.trim()
  const emailError = touched.email && (!email.trim() || !emailRegex.test(email))
  const messageError = touched.message && !message.trim()
  const isValid = name.trim() && email.trim() && emailRegex.test(email) && message.trim()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (!isValid) return

    setStatus('submitting')
    setError('')

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim() || null,
          eventName: eventName.trim() || null,
          message: message.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }
      setStatus('success')
    } catch {
      setError('Something went wrong. Please try again or email us directly.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <section id="contact" className="py-20 sm:py-28 bg-dark">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white mb-4">
            Message Sent
          </h2>
          <p className="text-muted font-body mb-8">
            Thanks for reaching out. I&apos;ll follow up within 1–2 business days.
          </p>
          <button
            type="button"
            onClick={() => { setStatus('idle'); setName(''); setEmail(''); setOrganization(''); setEventName(''); setMessage(''); setTouched({}) }}
            className="inline-flex items-center px-6 py-3 text-sm font-heading font-bold text-white gradient-bg rounded-full min-h-[44px]"
          >
            Send Another Message
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-20 sm:py-28 bg-dark">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-miami-pink uppercase tracking-widest mb-3 block">Booking</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white mb-4">
            Book Désir for Your Event
          </h2>
          <p className="text-muted font-body max-w-xl mx-auto">
            Interested in having Désir speak at your conference, corporate event, or workshop?
            Fill out the form below and we&apos;ll be in touch.
          </p>
          <p className="text-xs text-muted/50 mt-3">
            Or email directly:{' '}
            <a href="mailto:digitalvurv@gmail.com" className="text-miami-pink hover:text-miami-pink-soft underline">
              digitalvurv@gmail.com
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto" noValidate>
          <div className="space-y-5">
            <div>
              <label htmlFor="speaker-name" className="block text-sm font-medium text-muted-light mb-1.5">
                Name <span className="text-miami-pink">*</span>
              </label>
              <input
                id="speaker-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white placeholder-muted/40 focus:outline-none focus:border-miami-pink/50 focus:ring-1 focus:ring-miami-pink/20 transition-colors min-h-[44px]"
                placeholder="Your name"
              />
              {nameError && <p className="mt-1 text-xs text-red-400">Name is required</p>}
            </div>

            <div>
              <label htmlFor="speaker-email" className="block text-sm font-medium text-muted-light mb-1.5">
                Email <span className="text-miami-pink">*</span>
              </label>
              <input
                id="speaker-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white placeholder-muted/40 focus:outline-none focus:border-miami-pink/50 focus:ring-1 focus:ring-miami-pink/20 transition-colors min-h-[44px]"
                placeholder="you@example.com"
              />
              {emailError && touched.email && !email.trim() && <p className="mt-1 text-xs text-red-400">Email is required</p>}
              {emailError && touched.email && email.trim() && !emailRegex.test(email) && <p className="mt-1 text-xs text-red-400">Enter a valid email address</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-muted-light mb-1.5">
                  Organization
                </label>
                <input
                  id="organization"
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white placeholder-muted/40 focus:outline-none focus:border-miami-pink/50 focus:ring-1 focus:ring-miami-pink/20 transition-colors min-h-[44px]"
                  placeholder="Company or org"
                />
              </div>
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-muted-light mb-1.5">
                  Event Name
                </label>
                <input
                  id="eventName"
                  type="text"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white placeholder-muted/40 focus:outline-none focus:border-miami-pink/50 focus:ring-1 focus:ring-miami-pink/20 transition-colors min-h-[44px]"
                  placeholder="Event name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-muted-light mb-1.5">
                Message <span className="text-miami-pink">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, message: true }))}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white placeholder-muted/40 focus:outline-none focus:border-miami-pink/50 focus:ring-1 focus:ring-miami-pink/20 transition-colors resize-y min-h-[44px]"
                placeholder="Tell me about your event and what you're looking for..."
              />
              {messageError && <p className="mt-1 text-xs text-red-400">Message is required</p>}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full sm:w-auto px-8 py-4 text-base font-heading font-bold text-white gradient-bg rounded-full hover:shadow-glow-pink disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[52px]"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm font-heading font-semibold text-white">
              Désir Fils
            </p>
            <p className="text-xs text-muted/50 mt-1">
              AI Engineer, Entrepreneur & Keynote Speaker
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://whoisdesir.com" target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-miami-pink transition-colors">
              whoisdesir.com
            </a>
            <a href="https://whoisdesir.com/about" target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-miami-pink transition-colors">
              About
            </a>
            <a href="mailto:digitalvurv@gmail.com" className="text-xs text-muted hover:text-miami-pink transition-colors">
              Contact
            </a>
          </div>
          <p className="text-[10px] text-muted/30">
            &copy; {new Date().getFullYear()} Désir Fils. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function SpeakerPage() {
  return (
    <div className="min-h-screen bg-dark text-white overflow-hidden">
      <Navbar />
      <Hero />
      <About />
      <Topics />
      <PastTalks />
      <Contact />
      <Footer />
    </div>
  )
}
