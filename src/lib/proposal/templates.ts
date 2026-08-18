/**
 * HTML, JavaScript, and README templates for the WhoIsDésir® Media Proposal Generator.
 */

export const TEMPLATE_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Photography Proposal — {{AGENCY_NAME}} × {{CLIENT_NAME}} | {{EVENT_TITLE}}</title>
  <meta name="description" content="Professional photography proposal for {{CLIENT_NAME}}'s {{EVENT_TITLE}} on {{EVENT_DATE}}. Visual storytelling and reusable marketing assets by {{AGENCY_NAME}}.">
  <meta name="robots" content="noindex, nofollow">
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- ============================================================
       STICKY HEADER
       ============================================================ -->
  <header class="header" id="header">
    <div class="header__inner">
      <a href="#hero" class="header__brand" aria-label="{{AGENCY_NAME}}">
        <span class="header__brand-icon">📷</span>
        <span>WhoIsDésir®</span>
      </a>

      <nav class="header__nav" aria-label="Proposal sections">
        <a href="#investment" class="header__nav-link">Partnership</a>
        <a href="#deliverables" class="header__nav-link">Deliverables</a>
        <a href="#breakdown" class="header__nav-link">Investment</a>
        <a href="#payment" class="header__nav-link">Terms</a>
      </nav>

      <div class="header__cta">
        {{HEADER_CTA_BLOCK}}
      </div>
    </div>
  </header>

  <!-- ============================================================
       HERO
       ============================================================ -->
  <section class="hero" id="hero">
    <div class="hero__bg">
      <div class="hero__orb hero__orb--pink"></div>
      <div class="hero__orb hero__orb--blue"></div>
      <div class="hero__orb hero__orb--sm"></div>
      <div class="hero__grid-lines"></div>
    </div>

    <div class="container hero__content">
      {{HERO_BADGE_BLOCK}}

      <h1 class="hero__title">
        <span>{{EVENT_TITLE}}</span>
      </h1>

      <p class="hero__subtitle">
        Premium visual storytelling that transforms your grand opening into lasting marketing assets — capturing the energy, community, and culture of {{CLIENT_NAME}}.
      </p>

      <div class="hero__meta">
        <div class="hero__meta-item">
          <span class="hero__meta-icon">📅</span>
          <span>{{EVENT_DATE}}</span>
        </div>
        <div class="hero__meta-item">
          <span class="hero__meta-icon">📍</span>
          <span>{{LOCATION}}</span>
        </div>
        <div class="hero__meta-item">
          <span class="hero__meta-icon">📸</span>
          <span>{{COVERAGE_HOURS}} Coverage</span>
        </div>
        <div class="hero__meta-item">
          <span class="hero__meta-icon">🎉</span>
          <span>Event: {{EVENT_HOURS}}</span>
        </div>
      </div>

      <div class="hero__ctas">
        {{HERO_CTAS_BLOCK}}
      </div>
    </div>

    <div class="hero__scroll-hint" aria-hidden="true">
      <span>Explore Proposal</span>
      <span class="hero__scroll-arrow">↓</span>
    </div>
  </section>

  <!-- ============================================================
       ABOUT WhoIsDésir® Media
       ============================================================ -->
  <section class="section" id="about">
    <div class="container">
      <div class="section__header">
        <span class="section__label">About {{AGENCY_NAME}}</span>
        <h2 class="section__title">More Than a Photographer.<br><span class="gradient-text">Your Creative Partner.</span></h2>
        <p class="section__subtitle">We specialize in empowering minority-owned businesses with visual storytelling that drives real results — not just pretty pictures.</p>
      </div>

      <div class="about__grid">
        <div class="about__content reveal">
          <p>
            {{AGENCY_NAME}} is a <strong>Miami-based creative production team</strong> dedicated to elevating minority-owned businesses through powerful visual storytelling. We don't just show up and shoot — we craft marketing assets you'll use for months and years to come.
          </p>
          <p>
            For your grand opening, we're bringing a <strong>two-photographer production team</strong> traveling from Miami to {{LOCATION}}, ready to capture every moment that matters — from the sizzle of {{SIGNATURE_DISH}} to the roar of key event highlights.
          </p>
          <p>
            This isn't a one-time booking. We see this as the beginning of a <strong>long-term creative partnership</strong> built on shared community values and a commitment to your brand's growth.
          </p>
        </div>

        <div class="about__highlights reveal reveal--delay-2">
          <div class="about__highlight">
            <div class="about__highlight-icon">🤝</div>
            <div>
              <h3 class="about__highlight-title">Minority Business Specialist</h3>
              <p class="about__highlight-text">We understand the unique story and vision of minority-owned businesses. Your narrative matters to us.</p>
            </div>
          </div>
          <div class="about__highlight">
            <div class="about__highlight-icon">🎬</div>
            <div>
              <h3 class="about__highlight-title">Visual Storytelling, Not Just Photos</h3>
              <p class="about__highlight-text">Every image is a reusable marketing asset — designed for social media, press, menus, and promotions.</p>
            </div>
          </div>
          <div class="about__highlight">
            <div class="about__highlight-icon">🔄</div>
            <div>
              <h3 class="about__highlight-title">Long-Term Creative Partnership</h3>
              <p class="about__highlight-text">We want to grow with your brand. This grand opening is just the first chapter of our collaboration.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       PARTNERSHIP INVESTMENT — High Visual Weight
       ============================================================ -->
  <section class="investment section--dark" id="investment">
    <div class="container">
      <div class="section__header">
        <span class="section__label">Preferred Partnership Investment</span>
        <h2 class="section__title">Why This Partnership<br><span class="gradient-text">Is Different</span></h2>
        <p class="section__subtitle">Standard event photographers hand you files and disappear. We deliver a strategic marketing toolkit and build a relationship with your brand.</p>
      </div>

      <div class="investment__cards">
        <div class="investment__card reveal">
          <div class="investment__card-icon">📊</div>
          <h3 class="investment__card-title">Reusable Marketing Assets</h3>
          <p class="investment__card-text">Every photo is professionally edited and optimized for Instagram, Facebook, TikTok, your website, Google Business, press releases, printed materials, and future advertising campaigns. One shoot fuels months of content.</p>
        </div>

        <div class="investment__card reveal reveal--delay-1">
          <div class="investment__card-icon">🏆</div>
          <h3 class="investment__card-title">Brand Visibility & Reach</h3>
          <p class="investment__card-text">{{AGENCY_NAME}}'s community tagging exposes your brand across {{TARGET_REGION}} audiences — connecting {{CLIENT_NAME}} with new customers who champion local businesses.</p>
        </div>

        <div class="investment__card reveal reveal--delay-2">
          <div class="investment__card-icon">💎</div>
          <h3 class="investment__card-title">Introductory Partnership Rate</h3>
          <p class="investment__card-text">We're investing in this relationship with a special introductory rate — 60% off standard pricing — because we believe in what {{CLIENT_NAME}} represents for the community.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       DELIVERABLES — High Visual Weight
       ============================================================ -->
  <section class="section" id="deliverables">
    <div class="container">
      <div class="section__header">
        <span class="section__label">Photography Deliverables & Marketing Value</span>
        <h2 class="section__title">Everything We'll <span class="gradient-text">Capture</span></h2>
        <p class="section__subtitle">Professional coverage during peak event energy, producing a full suite of marketing-ready assets.</p>
      </div>

      <div style="text-align:center;">
        <div class="team-badge reveal">
          <span class="team-badge__icon">👥</span>
          Two-Photographer Team — Lead Photographer + Assistant / Second Camera for Social Media
        </div>
      </div>

      <div class="deliverables__grid">
        {{DELIVERABLES_LIST_HTML}}
      </div>
    </div>
  </section>

  <!-- ============================================================
       COMMERCIAL USAGE LICENSE
       ============================================================ -->
  <section class="section section--alt" id="license">
    <div class="container">
      <div class="section__header">
        <span class="section__label">Commercial Usage License</span>
        <h2 class="section__title">Use Your Photos <span class="gradient-text">Everywhere</span></h2>
        <p class="section__subtitle">Full commercial usage rights included — your images work across every platform and format your business needs.</p>
      </div>

      <div class="license__grid">
        {{LICENSE_LIST_HTML}}
      </div>
    </div>
  </section>

  <!-- ============================================================
       COMMUNITY IMPACT — High Visual Weight
       ============================================================ -->
  <section class="community" id="community">
    <div class="container">
      <div class="section__header">
        <span class="section__label">Community Impact & Visibility</span>
        <h2 class="section__title">Amplifying <span class="gradient-text">{{CLIENT_NAME}}'s Reach</span></h2>
        <p class="section__subtitle">Your brand story reaches far beyond the walls of your venue.</p>
      </div>

      <div class="community__content reveal">
        <p>
          {{AGENCY_NAME}}'s community-visibility tagging connects your brand with audiences across <strong style="color:var(--white);">{{TARGET_REGION}}</strong>. Every tagged post, shared story, and featured image introduces {{CLIENT_NAME}} to new potential customers who value and support local, {{BRAND_SPECIALIZATION}} businesses.
        </p>
      </div>

      <div class="community__stats">
        <div class="community__stat reveal">
          <span class="community__stat-icon">📱</span>
          <h3 class="community__stat-title">Social Media Amplification</h3>
          <p class="community__stat-text">Strategic tagging across {{TARGET_REGION}} audiences</p>
        </div>

        <div class="community__stat reveal reveal--delay-1">
          <span class="community__stat-icon">🇭🇹</span>
          <h3 class="community__stat-title">Cultural Celebration</h3>
          <p class="community__stat-text">Authentic storytelling honoring {{CULTURAL_HERITAGE}} heritage and cuisine</p>
        </div>

        <div class="community__stat reveal reveal--delay-2">
          <span class="community__stat-icon">🏠</span>
          <h3 class="community__stat-title">Local Business Champion</h3>
          <p class="community__stat-text">Positioning {{CLIENT_NAME}} as a community anchor</p>
        </div>

        <div class="community__stat reveal reveal--delay-3">
          <span class="community__stat-icon">🤝</span>
          <h3 class="community__stat-title">Network Effect</h3>
          <p class="community__stat-text">Cross-promotion with {{AGENCY_NAME}}'s community of minority-owned businesses</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       INVESTMENT BREAKDOWN — Interactive Widget
       ============================================================ -->
  <section class="section" id="breakdown">
    <div class="container">
      <div class="section__header">
        <span class="section__label">Investment Breakdown</span>
        <h2 class="section__title">Your <span class="gradient-text">Partnership Rate</span></h2>
        <p class="section__subtitle">We're offering a special introductory rate to invest in this creative partnership.</p>
      </div>

      <div class="breakdown__widget reveal">
        <div class="breakdown__header">
          <h3 class="breakdown__header-title">📸 Photography Investment</h3>
        </div>

        <div class="breakdown__body">
          <div class="breakdown__row breakdown__row--standard">
            <span class="breakdown__label">Standard Event Photography Value</span>
            <span class="breakdown__value" data-animate data-target="{{STANDARD_VALUE}}">\${{STANDARD_VALUE}}</span>
          </div>

          <div class="breakdown__row breakdown__row--discount">
            <span class="breakdown__label">🎉 Introductory Partnership Discount</span>
            <span class="breakdown__value" data-animate data-target="-{{DISCOUNT}}">-\${{DISCOUNT}}</span>
          </div>

          <div class="breakdown__row breakdown__row--total">
            <span class="breakdown__label">Your Investment</span>
            <span class="breakdown__value" data-animate data-target="{{CLIENT_INVESTMENT}}">\${{CLIENT_INVESTMENT}}</span>
          </div>
        </div>

        <div class="breakdown__savings">
          <span class="breakdown__savings-badge">
            🔥 You save \${{DISCOUNT}} — that's 60% off standard pricing
          </span>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       PAYMENT & DELIVERY TERMS
       ============================================================ -->
  <section class="section section--alt" id="payment">
    <div class="container">
      <div class="section__header">
        <span class="section__label">Payment & Delivery</span>
        <h2 class="section__title">Simple <span class="gradient-text">& Transparent</span></h2>
        <p class="section__subtitle">Clear terms, fast delivery, no surprises.</p>
      </div>

      <div class="payment__timeline">
        {{PAYMENT_STEP1_BLOCK}}

        <div class="timeline-item reveal reveal--delay-1">
          <div class="timeline-item__dot">2</div>
          <div class="timeline-item__content">
            <h3 class="timeline-item__title">Remaining Balance</h3>
            <p class="timeline-item__text"><strong>\${{BALANCE_AMOUNT}}</strong> due three business days before the event — by <strong>{{BALANCE_DUE_DATE}}</strong>. Not due on event day.</p>
          </div>
        </div>

        <div class="timeline-item reveal reveal--delay-2">
          <div class="timeline-item__dot">3</div>
          <div class="timeline-item__content">
            <h3 class="timeline-item__title">Professional Editing Begins</h3>
            <p class="timeline-item__text">Editing and curation starts within <strong>one business day</strong> of the event.</p>
          </div>
        </div>

        <div class="timeline-item reveal reveal--delay-3">
          <div class="timeline-item__dot">4</div>
          <div class="timeline-item__content">
            <h3 class="timeline-item__title">Final Gallery Delivered</h3>
            <p class="timeline-item__text">Your curated, high-resolution gallery is delivered within <strong>three business days</strong> via Google Drive, Dropbox, or another agreed platform.</p>
          </div>
        </div>

        <div class="timeline-item reveal reveal--delay-4">
          <div class="timeline-item__dot">5</div>
          <div class="timeline-item__content">
            <h3 class="timeline-item__title">Gallery Download Window</h3>
            <p class="timeline-item__text">Gallery remains accessible and downloadable for <strong>30 days</strong> after delivery.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       PARTNERSHIP HOSPITALITY
       ============================================================ -->
  <section class="section" id="hospitality">
    <div class="container">
      <div class="section__header">
        <span class="section__label">Partnership Hospitality</span>
        <h2 class="section__title">Supporting <span class="gradient-text">Our Team</span></h2>
        <p class="section__subtitle">Our production team travels to {{LOCATION}}. These small courtesies help us deliver our best work for you.</p>
      </div>

      <div class="hospitality__cards">
        {{HOSPITALITY_LIST_HTML}}
      </div>
    </div>
  </section>

  {{DISCOVERY_SECTION_BLOCK}}

  <!-- ============================================================
       PORTFOLIO
       ============================================================ -->
  <section class="section section--alt" id="portfolio">
    <div class="container">
      <div class="section__header">
        <span class="section__label">Our Work</span>
        <h2 class="section__title">Portfolio <span class="gradient-text">Preview</span></h2>
        <p class="section__subtitle">A glimpse of our event and food photography work. See the quality you're investing in.</p>
      </div>

      <!-- Video Highlight Reel -->
      <div class="portfolio__video-wrapper reveal">
        <iframe src="https://www.youtube-nocookie.com/embed/{{YOUTUBE_ID}}" title="{{AGENCY_NAME}} — Highlight Reel" referrerpolicy="no-referrer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
      </div>

      <!-- Photo Portfolio Grid -->
      <div class="portfolio__grid">
        <div class="portfolio__item reveal">
          <span class="portfolio__item-icon">📸</span>
          <span class="portfolio__item-label">[Event Photography Sample]</span>
          <span class="portfolio__item-sublabel">Placeholder — insert relevant event photo</span>
        </div>

        <div class="portfolio__item reveal reveal--delay-1">
          <span class="portfolio__item-icon">🍕</span>
          <span class="portfolio__item-label">[Food Photography Sample]</span>
          <span class="portfolio__item-sublabel">Placeholder — insert food photography</span>
        </div>

        <div class="portfolio__item reveal reveal--delay-2">
          <span class="portfolio__item-icon">🎉</span>
          <span class="portfolio__item-label">[Grand Opening Sample]</span>
          <span class="portfolio__item-sublabel">Placeholder — insert grand opening coverage</span>
        </div>

        <div class="portfolio__item reveal">
          <span class="portfolio__item-icon">🏪</span>
          <span class="portfolio__item-label">[Restaurant Interior Sample]</span>
          <span class="portfolio__item-sublabel">Placeholder — insert interior/venue photo</span>
        </div>

        <div class="portfolio__item reveal reveal--delay-1">
          <span class="portfolio__item-icon">🤝</span>
          <span class="portfolio__item-label">[Community Event Sample]</span>
          <span class="portfolio__item-sublabel">Placeholder — insert community engagement photo</span>
        </div>

        <div class="portfolio__item reveal reveal--delay-2">
          <span class="portfolio__item-icon">🍽️</span>
          <span class="portfolio__item-label">[Food Styling Sample]</span>
          <span class="portfolio__item-sublabel">Placeholder — insert styled food photo</span>
        </div>
      </div>

      <div class="portfolio__link reveal">
        <a href="#" class="btn btn--outline" id="portfolio-link-btn" aria-label="View full portfolio (placeholder link)">
          <span class="btn__icon">🔗</span>
          [View Full Portfolio — Placeholder Link]
        </a>
      </div>
    </div>
  </section>

  <!-- ============================================================
       TESTIMONIALS
       ============================================================ -->
  <section class="section" id="testimonials">
    <div class="container">
      <div class="section__header">
        <span class="section__label">What Our Partners Say</span>
        <h2 class="section__title">Client <span class="gradient-text">Testimonials</span></h2>
        <p class="section__subtitle">Real feedback from businesses we've partnered with.</p>
      </div>

      <div class="testimonials__grid">
        {{TESTIMONIALS_LIST_HTML}}
      </div>
    </div>
  </section>

  <!-- ============================================================
       ACCEPTANCE / CTA FOOTER
       ============================================================ -->
  <section class="cta-footer" id="accept">
    <div class="cta-footer__orb cta-footer__orb--pink"></div>
    <div class="cta-footer__orb cta-footer__orb--blue"></div>

    <div class="container cta-footer__content">
      {{CTA_FOOTER_BLOCK}}
    </div>
  </section>

  <!-- ============================================================
       CONTACT (secondary CTA anchor)
       ============================================================ -->
  <section class="section section--alt" id="contact" style="padding: var(--space-2xl) 0;">
    <div class="container" style="text-align:center; max-width:560px;">
      <h3 style="font-family:var(--font-heading); font-size:1.4rem; font-weight:800; color:var(--gray-900); margin-bottom:var(--space-sm);">Questions About This Proposal?</h3>
      <p style="color:var(--gray-400); margin-bottom:var(--space-lg); font-size:0.95rem;">
        Reach out to {{AGENCY_NAME}} directly. We're happy to discuss any details.
      </p>
      <!-- Contact Email -->
      <a href="mailto:{{CONTACT_EMAIL}}" class="btn btn--outline" id="email-contact-btn">
        <span class="btn__icon">✉️</span>
        Contact {{AGENCY_NAME}}
      </a>
    </div>
  </section>

  <!-- ============================================================
       FOOTER
       ============================================================ -->
  <footer class="footer">
    <div class="container">
      <p class="footer__text">
        © 2026 <a href="#">{{AGENCY_NAME}}</a>. This proposal is confidential and prepared exclusively for {{CLIENT_NAME}}.
      </p>
    </div>
  </footer>

  <!-- ============================================================
       MOBILE STICKY CTA BAR
       ============================================================ -->
  {{MOBILE_CTA_BLOCK}}

  <script src="script.js"></script>
</body>
</html>
`;

export const TEMPLATE_SCRIPT_JS = `/* ===================================================================
   WhoIsDésir® Media × {{CLIENT_NAME}} — Proposal Landing Page
   JavaScript — Interactivity, Scroll Reveals, Sticky Header
   =================================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------------------
  // Proposal Data Model
  // ---------------------------------------------------------------
  const proposal = {{PROPOSAL_JSON}};

  // ---------------------------------------------------------------
  // Discovery Form Handler — localStorage + Google Sheets
  // ---------------------------------------------------------------
  const STORAGE_KEY = '{{STORAGE_KEY}}';
  const SCRIPT_URL = '{{GOOGLE_SCRIPT_URL}}';

  function loadDiscoveryData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveDiscoveryData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.warn('[WhoIsDésir®] Could not save to localStorage');
    }
  }

  function populateFormFromStorage() {
    const data = loadDiscoveryData();
    document.querySelectorAll('.discovery__form').forEach((form) => {
      const formKey = form.dataset.form;
      if (data[formKey]) {
        Object.entries(data[formKey]).forEach(([name, value]) => {
          const field = form.querySelector(\`[name="\${name}"]\`);
          if (field) field.value = value;
        });
      }
    });
  }

  function showSaveStatus(formKey, message) {
    const statusEl = document.getElementById(\`status-\${formKey}\`);
    if (!statusEl) return;
    statusEl.textContent = message || '✓ Saved';
    statusEl.classList.add('show');
    setTimeout(() => statusEl.classList.remove('show'), 3000);
  }

  document.querySelectorAll('.discovery__form').forEach((form) => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formKey = this.dataset.form;
      const answers = {};

      new FormData(this).forEach((value, name) => {
        answers[name] = value;
      });

      // Save to localStorage as backup
      const data = loadDiscoveryData();
      data[formKey] = answers;
      saveDiscoveryData(data);

      // POST to Google Sheets
      if (SCRIPT_URL) {
        try {
          await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ form: formKey, answers })
          });
          showSaveStatus(formKey, '✓ Submitted to spreadsheet');
        } catch (err) {
          showSaveStatus(formKey, '✓ Saved locally (offline)');
        }
      } else {
        showSaveStatus(formKey, '✓ Saved locally (no spreadsheet integration)');
      }

      console.log(\`[WhoIsDésir®] Discovery saved — \${formKey}:\`, answers);
    });
  });

  populateFormFromStorage();

  // ---------------------------------------------------------------
  // Sticky Header with scroll detection
  // ---------------------------------------------------------------
  const header = document.getElementById('header');
  let lastScrollY = 0;

  function handleHeaderScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  // ---------------------------------------------------------------
  // Mobile Sticky CTA Bar
  // ---------------------------------------------------------------
  const mobileCta = document.getElementById('mobile-cta');
  const heroSection = document.getElementById('hero');

  function handleMobileCta() {
    if (!mobileCta || !heroSection) return;

    const heroBottom = heroSection.getBoundingClientRect().bottom;

    if (heroBottom < 0) {
      mobileCta.classList.add('mobile-cta--visible');
      mobileCta.setAttribute('aria-hidden', 'false');
    } else {
      mobileCta.classList.remove('mobile-cta--visible');
      mobileCta.setAttribute('aria-hidden', 'true');
    }
  }

  window.addEventListener('scroll', handleMobileCta, { passive: true });

  // ---------------------------------------------------------------
  // Scroll Reveal (IntersectionObserver)
  // ---------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  // ---------------------------------------------------------------
  // Investment Breakdown Animation
  // ---------------------------------------------------------------
  const breakdownValues = document.querySelectorAll('.breakdown__value[data-animate]');

  if ('IntersectionObserver' in window && breakdownValues.length > 0) {
    const breakdownObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            breakdownValues.forEach((val, index) => {
              setTimeout(() => {
                val.classList.add('visible');
              }, index * 300);
            });
            breakdownObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3
      }
    );

    const breakdownWidget = document.querySelector('.breakdown__widget');
    if (breakdownWidget) {
      breakdownObserver.observe(breakdownWidget);
    }
  } else {
    breakdownValues.forEach((val) => val.classList.add('visible'));
  }

  // ---------------------------------------------------------------
  // Active Nav Link Highlighting
  // ---------------------------------------------------------------
  const navLinks = document.querySelectorAll('.header__nav-link');
  const sections = document.querySelectorAll('section[id]');

  function highlightActiveNav() {
    const scrollY = window.scrollY + 100;

    sections.forEach((section) => {
      const top = section.offsetTop - 100;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      navLinks.forEach((link) => {
        if (link.getAttribute('href') === \`#\${id}\`) {
          if (scrollY >= top && scrollY < bottom) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        }
      });
    });
  }

  window.addEventListener('scroll', highlightActiveNav, { passive: true });

  // ---------------------------------------------------------------
  // Smooth Scroll for Anchor Links
  // ---------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---------------------------------------------------------------
  // CTA Click Handlers (Accept & Contact)
  // ---------------------------------------------------------------
  const acceptButtons = document.querySelectorAll(
    '#header-accept-btn, #hero-accept-btn, #accept-btn, #mobile-accept-btn'
  );

  acceptButtons.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      if (href === '#discovery') {
        e.preventDefault();

        console.log('[WhoIsDésir® Proposal] Navigating to discovery form');
        console.log('[WhoIsDésir® Proposal] Deposit status:', proposal.depositStatus);

        const discoverySection = document.getElementById('discovery');
        if (discoverySection) {
          discoverySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ---------------------------------------------------------------
  // Initial calls
  // ---------------------------------------------------------------
  handleHeaderScroll();
  handleMobileCta();
  highlightActiveNav();
})();
`;

export const TEMPLATE_README_MD = `# WhoIsDésir® Media × {{CLIENT_NAME}} Proposal Landing Page

This is a single-page, responsive landing page presenting {{AGENCY_NAME}}'s photography proposal for {{CLIENT_NAME}}'s {{EVENT_TITLE}}.

---

## 🚀 Deploying to Firebase Hosting

Firebase Hosting provides fast, secure hosting with a free SSL certificate and a global CDN.

### Step 1: Install Firebase CLI
If you don't have the Firebase CLI installed globally, you can run it on-demand using \`npx\`, or install it via npm:
\`\`\`bash
npm install -g firebase-tools
\`\`\`

### Step 2: Initialize Firebase in This Directory
Initialize a Firebase project at the root of this generated proposal directory:
\`\`\`bash
firebase login
firebase init hosting
\`\`\`
**During setup, choose these options:**
1. **Associate directory:** Select an existing Firebase project or create a new one.
2. **Public directory:** Type \`.\` (or \`public\` if you have placed your HTML/CSS/JS in a separate folder).
3. **Configure as a single-page app?** Yes (rewrites all URLs to \`/index.html\`).
4. **Set up automatic builds and deploys with GitHub?** No (unless you want CI/CD).
5. **File index.html already exists. Overwrite?** **No** (Crucial: do not overwrite your proposal page!).

### Step 3: Test Locally
To test the site with Firebase's local emulator:
\`\`\`bash
firebase emulators:start --only hosting
# Or use npx:
npx -y firebase-tools@latest emulators:start --only hosting
\`\`\`
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

### Step 4: Deploy Live
To deploy the proposal live:
\`\`\`bash
firebase deploy --only hosting
# Or use npx:
npx -y firebase-tools@latest deploy --only hosting
\`\`\`

---

## 🔒 Security & Code Auditing

When expanding functionality (like adding database writes, user authentication, or handling contracts), you should complete regular audits of your code and configurations.

### 1. Website Audit (Performance, Accessibility, SEO)
Before sending the proposal link to the client, run an audit using Google Lighthouse (available in Chrome DevTools under the **Lighthouse** tab):
* **Accessibility (a11y):** Verify tap target sizes (minimum \`44px\`), high-contrast text ratios, and \`aria-label\` tags on interactive buttons.
* **LCP (Largest Contentful Paint):** Ensure the hero section images load quickly (use \`fetchpriority="high"\` on the main banner or logo if applicable).

### 2. Firebase Security Rules Audit
If you upgrade this web app to write form submissions directly to **Firestore** or upload hospitality briefs to **Cloud Storage** (instead of using the Google Sheet webhook), you must write and audit security rules.

#### Mandatory Rules Audit Checklist:
1. **The Update Bypass:** Ensure a user cannot create a document with low privileges and then update it to a higher role (e.g. set \`isAdmin\` to true).
2. **Authority Source Check:** Never rely on user-provided field values for validation (e.g., trust \`request.auth.uid\` instead of \`request.resource.data.userId\`).
3. **Storage Abuse Limits:** Enforce maximum lengths on string text fields (e.g., \`text.size() < 500\`) and array size limits to prevent Resource Exhaustion (DoS).
4. **Type Safety:** Explicitly validate data types in Firestore rules:
   \`\`\`javascript
   allow create: if request.resource.data.email is string
                 && request.resource.data.acceptedAt is timestamp;
   \`\`\`
5. **Ownership Check:** Always ensure that identity-level checks match document ownership before granting update/delete privileges:
   \`\`\`javascript
   allow update, delete: if resource.data.uid == request.auth.uid;
   \`\`\`
`;
