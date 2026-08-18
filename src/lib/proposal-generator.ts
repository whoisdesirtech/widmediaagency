/**
 * Auto-generated proposal templates for the WhoIsDésir® Media Proposal Generator.
 * Contains index.html, styles.css, script.js, and README.md template strings.
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

export const TEMPLATE_STYLES_CSS = `/* ===================================================================
   WhoIsDésir® Media × 1804 Haitian Pizza — Proposal Landing Page
   Design System & Styles
   =================================================================== */

/* --- Google Fonts --- */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap');

/* --- Design Tokens --- */
:root {
  /* Miami Vice Palette */
  --pink:        #ED145A;
  --pink-soft:   #F090C0;
  --blue-light:  #18D8F0;
  --blue-beach:  #22ABC7;
  --blue-bright: #18C0F0;

  /* Neutrals */
  --white:       #FFFFFF;
  --off-white:   #F8F9FC;
  --gray-50:     #F1F3F8;
  --gray-100:    #E2E6EF;
  --gray-200:    #C5CBD9;
  --gray-400:    #8891A5;
  --gray-600:    #4A5168;
  --gray-800:    #1E2233;
  --gray-900:    #12152A;
  --dark:        #0A0D1A;

  /* Gradients */
  --gradient-hero:  linear-gradient(135deg, #0A0D1A 0%, #12152A 50%, #1a1040 100%);
  --gradient-miami: linear-gradient(135deg, var(--pink) 0%, var(--blue-light) 100%);
  --gradient-miami-soft: linear-gradient(135deg, var(--pink-soft) 0%, var(--blue-bright) 100%);
  --gradient-accent: linear-gradient(90deg, var(--pink) 0%, var(--blue-light) 100%);
  --gradient-card: linear-gradient(135deg, rgba(237,20,90,0.06) 0%, rgba(24,216,240,0.06) 100%);

  /* Typography */
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Spacing */
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-4xl: 6rem;

  /* Borders */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm:  0 2px 8px rgba(10,13,26,0.06);
  --shadow-md:  0 4px 20px rgba(10,13,26,0.08);
  --shadow-lg:  0 8px 40px rgba(10,13,26,0.12);
  --shadow-xl:  0 16px 60px rgba(10,13,26,0.16);
  --shadow-glow-pink: 0 0 30px rgba(237,20,90,0.25);
  --shadow-glow-blue: 0 0 30px rgba(24,216,240,0.25);

  /* Transitions */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 200ms;
  --duration-normal: 350ms;
  --duration-slow: 600ms;

  /* Layout */
  --container-max: 1200px;
  --header-height: 72px;
}

/* --- Reset & Base --- */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
  scroll-padding-top: var(--header-height);
}

body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.7;
  color: var(--gray-800);
  background: var(--white);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

ul, ol {
  list-style: none;
}

/* --- Utility Classes --- */
.container {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.gradient-text {
  background: var(--gradient-miami);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.accent-line {
  width: 60px;
  height: 4px;
  background: var(--gradient-accent);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-lg);
}

/* --- Section Base --- */
.section {
  padding: var(--space-3xl) 0;
  position: relative;
}

.section--alt {
  background: var(--off-white);
}

.section--dark {
  background: var(--gradient-hero);
  color: var(--white);
}

.section__header {
  text-align: center;
  margin-bottom: var(--space-3xl);
}

.section__label {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  background: var(--gradient-miami);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-sm);
}

.section--dark .section__label {
  opacity: 0.9;
}

.section__title {
  font-family: var(--font-heading);
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--gray-900);
  margin-bottom: var(--space-md);
}

.section--dark .section__title {
  color: var(--white);
}

.section__subtitle {
  font-size: 1.05rem;
  color: var(--gray-400);
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.7;
}

.section--dark .section__subtitle {
  color: rgba(255,255,255,0.6);
}

/* --- Typography --- */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.2;
}

/* --- Buttons --- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  text-decoration: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.btn--primary {
  padding: 16px 36px;
  background: var(--gradient-miami);
  color: var(--white);
  box-shadow: var(--shadow-glow-pink);
  font-size: 1.05rem;
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 50px rgba(237,20,90,0.35), 0 8px 30px rgba(10,13,26,0.2);
}

.btn--primary:active {
  transform: translateY(0);
}

.btn--secondary {
  padding: 14px 32px;
  background: transparent;
  color: var(--white);
  border: 2px solid rgba(255,255,255,0.3);
}

.btn--secondary:hover {
  border-color: var(--blue-light);
  color: var(--blue-light);
  background: rgba(24,216,240,0.08);
}

.btn--outline {
  padding: 14px 32px;
  background: transparent;
  color: var(--gray-800);
  border: 2px solid var(--gray-100);
}

.btn--outline:hover {
  border-color: var(--blue-beach);
  color: var(--blue-beach);
  background: rgba(34,171,199,0.05);
}

.btn--sm {
  padding: 10px 24px;
  font-size: 0.875rem;
}

.btn__icon {
  font-size: 1.2em;
}

/* Shimmer effect on primary CTA */
.btn--primary::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { left: -100%; }
  50% { left: 120%; }
}

/* --- Glass Card --- */
.glass-card {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.glass-card--dark {
  background: rgba(18,21,42,0.6);
  border-color: rgba(255,255,255,0.08);
}

/* ===================================================================
   HEADER
   =================================================================== */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  z-index: 1000;
  transition: all var(--duration-normal) var(--ease-out);
}

.header--scrolled {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 1px 20px rgba(10,13,26,0.08);
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.header__brand {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--white);
  transition: color var(--duration-normal);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.header--scrolled .header__brand {
  color: var(--gray-900);
}

.header__brand-icon {
  width: 32px;
  height: 32px;
  background: var(--gradient-miami);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: var(--white);
}

.header__nav {
  display: none;
}

.header__cta .btn--primary {
  padding: 10px 24px;
  font-size: 0.85rem;
}

.header--scrolled .btn--secondary {
  color: var(--gray-600);
  border-color: var(--gray-200);
}

.header--scrolled .btn--secondary:hover {
  color: var(--blue-beach);
  border-color: var(--blue-beach);
}

/* ===================================================================
   HERO
   =================================================================== */
.hero {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  position: relative;
  background: var(--gradient-hero);
  overflow: hidden;
  padding-top: var(--header-height);
}

.hero__bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: float 20s ease-in-out infinite;
}

.hero__orb--pink {
  width: 500px;
  height: 500px;
  background: var(--pink);
  top: -10%;
  right: -5%;
  animation-delay: 0s;
}

.hero__orb--blue {
  width: 600px;
  height: 600px;
  background: var(--blue-light);
  bottom: -15%;
  left: -10%;
  animation-delay: -7s;
}

.hero__orb--sm {
  width: 250px;
  height: 250px;
  background: var(--blue-beach);
  top: 40%;
  left: 50%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.hero__grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero__content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: var(--space-2xl) 0;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 8px 20px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  margin-bottom: var(--space-xl);
  backdrop-filter: blur(10px);
  letter-spacing: 0.05em;
}

.hero__badge-dot {
  width: 8px;
  height: 8px;
  background: #4ADE80;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.hero__title {
  font-family: var(--font-heading);
  font-size: clamp(2.2rem, 6vw, 4.5rem);
  font-weight: 900;
  line-height: 1.05;
  color: var(--white);
  margin-bottom: var(--space-lg);
  letter-spacing: -0.02em;
}

.hero__title span {
  display: block;
}

.hero__subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgba(255,255,255,0.55);
  max-width: 620px;
  margin: 0 auto var(--space-md);
  line-height: 1.7;
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-md) var(--space-xl);
  margin-bottom: var(--space-2xl);
}

.hero__meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
  font-weight: 500;
}

.hero__meta-icon {
  font-size: 1.1em;
}

.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-md);
}

.hero__scroll-hint {
  position: absolute;
  bottom: var(--space-xl);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  color: rgba(255,255,255,0.3);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  animation: bounce-down 2s ease-in-out infinite;
}

.hero__scroll-arrow {
  font-size: 1.2rem;
}

@keyframes bounce-down {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}

/* ===================================================================
   ABOUT
   =================================================================== */
.about__grid {
  display: grid;
  gap: var(--space-2xl);
  align-items: center;
}

.about__content p {
  color: var(--gray-600);
  margin-bottom: var(--space-md);
}

.about__content strong {
  color: var(--gray-800);
}

.about__highlights {
  display: grid;
  gap: var(--space-md);
}

.about__highlight {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  background: var(--white);
  border: 1px solid var(--gray-100);
  transition: all var(--duration-normal) var(--ease-out);
}

.about__highlight:hover {
  border-color: transparent;
  box-shadow: var(--shadow-md);
}

.about__highlight-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  background: var(--gradient-card);
}

.about__highlight-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 4px;
}

.about__highlight-text {
  font-size: 0.9rem;
  color: var(--gray-400);
  line-height: 1.6;
}

/* ===================================================================
   PARTNERSHIP INVESTMENT (High Visual Weight)
   =================================================================== */
.investment {
  background: var(--gradient-hero);
  padding: var(--space-4xl) 0;
  position: relative;
  overflow: hidden;
}

.investment::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-accent);
}

.investment__cards {
  display: grid;
  gap: var(--space-lg);
  margin-top: var(--space-2xl);
}

.investment__card {
  padding: var(--space-2xl);
  border-radius: var(--radius-lg);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  transition: all var(--duration-normal) var(--ease-out);
}

.investment__card:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-4px);
}

.investment__card-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: var(--space-lg);
  background: var(--gradient-miami);
  box-shadow: var(--shadow-glow-pink);
}

.investment__card-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: var(--space-sm);
}

.investment__card-text {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.7;
}

/* ===================================================================
   DELIVERABLES (High Visual Weight)
   =================================================================== */
.deliverables__grid {
  display: grid;
  gap: var(--space-md);
}

.deliverable-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-100);
  background: var(--white);
  transition: all var(--duration-normal) var(--ease-out);
}

.deliverable-item:hover {
  border-color: transparent;
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.deliverable-item__icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: var(--gradient-card);
}

.deliverable-item__title {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--gray-800);
  margin-bottom: 2px;
}

.deliverable-item__text {
  font-size: 0.85rem;
  color: var(--gray-400);
  line-height: 1.6;
}

/* Team badge */
.team-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--gradient-card);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray-600);
  margin-bottom: var(--space-2xl);
}

.team-badge__icon {
  font-size: 1.1em;
}

/* ===================================================================
   USAGE LICENSE
   =================================================================== */
.license__grid {
  display: grid;
  gap: var(--space-sm);
}

.license-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-sm);
  background: var(--white);
  border: 1px solid var(--gray-100);
  font-size: 0.95rem;
  color: var(--gray-600);
  transition: all var(--duration-fast);
}

.license-item:hover {
  border-color: var(--blue-beach);
  background: rgba(34,171,199,0.03);
}

.license-item__check {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: var(--gradient-miami);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 0.75rem;
  font-weight: 700;
}

/* ===================================================================
   COMMUNITY IMPACT (High Visual Weight)
   =================================================================== */
.community {
  background: var(--gradient-hero);
  padding: var(--space-4xl) 0;
  position: relative;
  overflow: hidden;
}

.community::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-accent);
}

.community__content {
  text-align: center;
  max-width: 720px;
  margin: 0 auto var(--space-2xl);
}

.community__content p {
  color: rgba(255,255,255,0.6);
  font-size: 1.05rem;
  line-height: 1.8;
}

.community__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
}

.community__stat {
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  border-radius: var(--radius-lg);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
}

.community__stat-icon {
  font-size: 2rem;
  margin-bottom: var(--space-md);
  display: block;
}

.community__stat-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: var(--space-xs);
}

.community__stat-text {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
}

/* ===================================================================
   INVESTMENT BREAKDOWN (Interactive Widget)
   =================================================================== */
.breakdown__widget {
  max-width: 560px;
  margin: 0 auto;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.breakdown__header {
  background: var(--gradient-miami);
  padding: var(--space-xl) var(--space-2xl);
  text-align: center;
}

.breakdown__header-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--white);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.breakdown__body {
  background: var(--white);
  padding: var(--space-2xl);
}

.breakdown__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--gray-50);
  transition: all var(--duration-normal) var(--ease-out);
}

.breakdown__row:last-child {
  border-bottom: none;
}

.breakdown__row--discount {
  color: #10B981;
}

.breakdown__row--total {
  border-top: 2px solid var(--gray-900);
  border-bottom: none;
  padding-top: var(--space-lg);
  margin-top: var(--space-sm);
}

.breakdown__label {
  font-size: 1rem;
  color: var(--gray-600);
  font-weight: 500;
}

.breakdown__row--discount .breakdown__label {
  color: #10B981;
}

.breakdown__row--total .breakdown__label {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--gray-900);
}

.breakdown__value {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
}

.breakdown__row--standard .breakdown__value {
  text-decoration: line-through;
  opacity: 0.5;
  color: var(--gray-400);
}

.breakdown__row--discount .breakdown__value {
  color: #10B981;
  font-weight: 700;
}

.breakdown__row--total .breakdown__value {
  font-size: 2rem;
  font-weight: 900;
  background: var(--gradient-miami);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.breakdown__savings {
  text-align: center;
  padding: var(--space-md) var(--space-2xl) var(--space-2xl);
  background: var(--white);
}

.breakdown__savings-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.15);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
  color: #10B981;
}

/* Animated counters for breakdown */
.breakdown__value[data-animate] {
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.6s var(--ease-out);
}

.breakdown__value[data-animate].visible {
  opacity: 1;
  transform: translateY(0);
}

.breakdown__row--standard .breakdown__value[data-animate].visible {
  opacity: 0.5;
}

/* ===================================================================
   PAYMENT & DELIVERY
   =================================================================== */
.payment__timeline {
  position: relative;
  max-width: 700px;
  margin: 0 auto;
}

.payment__timeline::before {
  content: '';
  position: absolute;
  left: 23px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--gray-100);
}

.timeline-item {
  display: flex;
  gap: var(--space-lg);
  padding-bottom: var(--space-2xl);
  position: relative;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item__dot {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--white);
  background: var(--gradient-miami);
  z-index: 1;
  box-shadow: 0 0 0 6px var(--off-white);
}

.timeline-item__content {
  padding-top: var(--space-sm);
}

.timeline-item__title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 4px;
}

.timeline-item__text {
  font-size: 0.9rem;
  color: var(--gray-400);
  line-height: 1.6;
}

.timeline-item__highlight {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
  padding: 4px 14px;
  background: rgba(237,20,90,0.06);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--pink);
}

/* ===================================================================
   HOSPITALITY
   =================================================================== */
.hospitality__cards {
  display: grid;
  gap: var(--space-lg);
}

.hospitality__card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-lg);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-100);
  background: var(--white);
  transition: all var(--duration-normal) var(--ease-out);
}

.hospitality__card:hover {
  border-color: transparent;
  box-shadow: var(--shadow-md);
}

.hospitality__card-icon {
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  background: var(--gradient-card);
}

.hospitality__card-title {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1rem;
  color: var(--gray-800);
  margin-bottom: 4px;
}

.hospitality__card-text {
  font-size: 0.9rem;
  color: var(--gray-400);
  line-height: 1.6;
}

/* ===================================================================
   PORTFOLIO
   =================================================================== */
.portfolio__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.portfolio__item {
  aspect-ratio: 4/3;
  border-radius: var(--radius-lg);
  background: var(--gray-50);
  border: 2px dashed var(--gray-200);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-xl);
  text-align: center;
  transition: all var(--duration-normal) var(--ease-out);
}

.portfolio__item:hover {
  border-color: var(--blue-beach);
  background: rgba(34,171,199,0.03);
}

.portfolio__item-icon {
  font-size: 2rem;
  opacity: 0.4;
}

.portfolio__item-label {
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--gray-400);
}

.portfolio__item-sublabel {
  font-size: 0.8rem;
  color: var(--gray-200);
}

/* Video placeholder & actual video wrapper */
.portfolio__video {
  aspect-ratio: 16/9;
  border-radius: var(--radius-lg);
  background: var(--gray-50);
  border: 2px dashed var(--gray-200);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  margin-bottom: var(--space-2xl);
}

.portfolio__video-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--gradient-miami);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--white);
  box-shadow: var(--shadow-glow-pink);
}

.portfolio__video-label {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--gray-400);
  font-size: 0.95rem;
}

.portfolio__video-sublabel {
  font-size: 0.8rem;
  color: var(--gray-200);
}

.portfolio__video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-2xl);
  box-shadow: var(--shadow-lg);
}

.portfolio__video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.portfolio__item--filled {
  border: none;
  padding: 0;
  overflow: hidden;
}

.portfolio__item--filled img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-normal) var(--ease-out);
}

.portfolio__item--filled:hover img {
  transform: scale(1.05);
}

.portfolio__link {
  text-align: center;
}

/* ===================================================================
   TESTIMONIALS
   =================================================================== */
.testimonials__grid {
  display: grid;
  gap: var(--space-lg);
}

.testimonial-card {
  padding: var(--space-2xl);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--gray-200);
  background: var(--white);
  text-align: center;
}

.testimonial-card__quote-icon {
  font-size: 2rem;
  color: var(--gray-200);
  margin-bottom: var(--space-md);
}

.testimonial-card__text {
  font-style: italic;
  font-size: 1.05rem;
  color: var(--gray-400);
  margin-bottom: var(--space-lg);
  line-height: 1.7;
}

.testimonial-card__author {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--gray-400);
}

.testimonial-card__role {
  font-size: 0.8rem;
  color: var(--gray-200);
}

/* ===================================================================
   CTA / ACCEPTANCE FOOTER
   =================================================================== */
.cta-footer {
  background: var(--gradient-hero);
  padding: var(--space-4xl) 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-footer__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.12;
}

.cta-footer__orb--pink {
  width: 400px;
  height: 400px;
  background: var(--pink);
  bottom: -20%;
  left: -10%;
}

.cta-footer__orb--blue {
  width: 350px;
  height: 350px;
  background: var(--blue-light);
  top: -15%;
  right: -5%;
}

.cta-footer__content {
  position: relative;
  z-index: 1;
}

.cta-footer__title {
  font-family: var(--font-heading);
  font-size: clamp(1.75rem, 4vw, 3rem);
  font-weight: 900;
  color: var(--white);
  margin-bottom: var(--space-md);
  line-height: 1.1;
}

.cta-footer__subtitle {
  font-size: 1.05rem;
  color: rgba(255,255,255,0.5);
  max-width: 550px;
  margin: 0 auto var(--space-2xl);
}

.cta-footer__buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-2xl);
}

.cta-footer__details {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-xl);
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
}

.cta-footer__detail {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

/* ===================================================================
   SITE FOOTER
   =================================================================== */
.footer {
  background: var(--dark);
  padding: var(--space-xl) 0;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.footer__text {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.3);
}

.footer__text a {
  color: rgba(255,255,255,0.5);
  transition: color var(--duration-fast);
}

.footer__text a:hover {
  color: var(--blue-light);
}

/* ===================================================================
   MOBILE STICKY CTA BAR
   =================================================================== */
.mobile-cta {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding: var(--space-md) var(--space-lg);
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 -4px 20px rgba(10,13,26,0.1);
  transform: translateY(100%);
  transition: transform var(--duration-normal) var(--ease-out);
}

.mobile-cta--visible {
  transform: translateY(0);
}

.mobile-cta .btn {
  width: 100%;
  min-height: 52px;
}

/* ===================================================================
   SCROLL REVEAL ANIMATIONS
   =================================================================== */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s var(--ease-out), transform 0.8s var(--ease-out);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

.reveal--delay-1 { transition-delay: 100ms; }
.reveal--delay-2 { transition-delay: 200ms; }
.reveal--delay-3 { transition-delay: 300ms; }
.reveal--delay-4 { transition-delay: 400ms; }
.reveal--delay-5 { transition-delay: 500ms; }

/* ===================================================================
   RESPONSIVE — TABLET (640px+)
   =================================================================== */
@media (min-width: 640px) {
  .header__nav {
    display: flex;
    align-items: center;
    gap: var(--space-xl);
  }

  .header__nav-link {
    font-size: 0.85rem;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
    transition: color var(--duration-fast);
    position: relative;
  }

  .header--scrolled .header__nav-link {
    color: var(--gray-400);
  }

  .header__nav-link:hover {
    color: var(--white);
  }

  .header--scrolled .header__nav-link:hover {
    color: var(--gray-800);
  }

  .header__nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--gradient-accent);
    border-radius: var(--radius-full);
  }

  .about__grid {
    grid-template-columns: 1fr 1fr;
  }

  .investment__cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .deliverables__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .license__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hospitality__cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .testimonials__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ===================================================================
   RESPONSIVE — DESKTOP (1024px+)
   =================================================================== */
@media (min-width: 1024px) {
  .section {
    padding: var(--space-4xl) 0;
  }

  .hero__title {
    font-size: 4.5rem;
  }

  .deliverables__grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .testimonials__grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .portfolio__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ===================================================================
   RESPONSIVE — MOBILE (<640px)
   =================================================================== */
@media (max-width: 639px) {
  :root {
    --header-height: 60px;
  }

  .header__nav {
    display: none;
  }

  .hero {
    min-height: 100dvh;
    padding-bottom: var(--space-4xl);
  }

  .hero__ctas {
    flex-direction: column;
    align-items: stretch;
    padding: 0 var(--space-md);
  }

  .hero__meta {
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .mobile-cta {
    display: block;
  }

  body {
    padding-bottom: 80px;
  }

  .investment__cards {
    grid-template-columns: 1fr;
  }

  .hospitality__cards {
    grid-template-columns: 1fr;
  }

  .community__stats {
    grid-template-columns: 1fr;
  }

  .cta-footer__buttons {
    flex-direction: column;
    align-items: stretch;
    padding: 0 var(--space-md);
  }

  .cta-footer__details {
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .breakdown__body {
    padding: var(--space-lg);
  }

  .breakdown__row--total .breakdown__value {
    font-size: 1.6rem;
  }

  .portfolio__grid {
    grid-template-columns: 1fr;
  }

  .discovery__card-header {
    flex-direction: column;
    text-align: center;
    padding: var(--space-xl);
  }

  .discovery__form {
    padding: var(--space-xl);
  }

  .discovery__actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
}

/* ===================================================================
   DEPOSIT CONFIRMED STATES
   =================================================================== */
.hero__badge--confirmed {
  background: rgba(16,185,129,0.1);
  border-color: rgba(16,185,129,0.3);
  color: #4ADE80;
}

.hero__badge-check {
  width: 18px;
  height: 18px;
  background: #10B981;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 0.65rem;
  font-weight: 700;
}

.btn--confirmed {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 0 0 30px rgba(16,185,129,0.25);
}

.btn--confirmed:hover {
  box-shadow: 0 0 50px rgba(16,185,129,0.35), 0 8px 30px rgba(10,13,26,0.2);
}

.btn--confirmed::after {
  animation: none;
}

.timeline-item--completed {
  opacity: 1;
}

.timeline-item__dot--completed {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 0 0 0 6px var(--off-white), 0 0 20px rgba(16,185,129,0.3);
}

.timeline-item__status {
  display: inline-block;
  padding: 2px 10px;
  background: rgba(16,185,129,0.1);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  color: #10B981;
  margin-left: var(--space-sm);
}

.timeline-item__highlight--completed {
  background: rgba(16,185,129,0.08);
  color: #10B981;
}

/* ===================================================================
   DISCOVERY QUESTIONS
   =================================================================== */
.discovery__wrapper {
  display: grid;
  gap: var(--space-2xl);
  max-width: 900px;
  margin: 0 auto;
}

.discovery__card {
  background: var(--white);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-100);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--ease-out);
}

.discovery__card:hover {
  box-shadow: var(--shadow-lg);
}

.discovery__card-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl) var(--space-2xl);
  background: var(--gradient-card);
  border-bottom: 1px solid var(--gray-100);
}

.discovery__card-icon {
  width: 56px;
  height: 56px;
  min-width: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: var(--gradient-miami);
  box-shadow: var(--shadow-glow-pink);
}

.discovery__card-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 2px;
}

.discovery__card-subtitle {
  font-size: 0.9rem;
  color: var(--gray-400);
}

.discovery__form {
  padding: var(--space-2xl);
}

.discovery__field {
  margin-bottom: var(--space-xl);
}

.discovery__field:last-of-type {
  margin-bottom: var(--space-2xl);
}

.discovery__label {
  display: block;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--gray-800);
  margin-bottom: var(--space-sm);
}

.discovery__textarea {
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  border: 2px solid var(--gray-100);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--gray-800);
  background: var(--off-white);
  resize: vertical;
  transition: all var(--duration-fast);
  line-height: 1.6;
}

.discovery__textarea::placeholder {
  color: var(--gray-200);
}

.discovery__textarea:focus {
  outline: none;
  border-color: var(--blue-beach);
  background: var(--white);
  box-shadow: 0 0 0 4px rgba(34,171,199,0.1);
}

.discovery__actions {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--gray-50);
}

.discovery__save-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: #10B981;
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.discovery__save-status.show {
  opacity: 1;
}

/* ===================================================================
   PRINT STYLES
   =================================================================== */
@media print {
  .header,
  .mobile-cta,
  .hero__scroll-hint,
  .btn--primary::after {
    display: none !important;
  }

  .hero {
    min-height: auto;
    padding: var(--space-2xl) 0;
  }

  .section {
    padding: var(--space-xl) 0;
  }

  body {
    padding-bottom: 0;
  }
}
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

// -----------------------------------------------------------------
// Interfaces & Dynamic HTML Generation
// -----------------------------------------------------------------

export interface ProposalData {
  agencyName?: string;
  clientName: string;
  eventTitle: string;
  eventDate: string;
  location: string;
  coverageHours?: string;
  eventHours?: string;
  email?: string;
  cashAppLink?: string;
  youtubeId?: string;
  standardValue?: number;
  discount?: number;
  clientInvestment?: number;
  depositAmount?: number;
  balanceAmount?: number;
  balanceDueDate?: string;
  signatureDish?: string;
  brandSpecialization?: string;
  targetRegion?: string;
  culturalHeritage?: string;
  status?: "pending" | "confirmed";
  hostName?: string;
  googleScriptUrl?: string;
  deliverables?: { icon: string; title: string; desc: string }[];
  rights?: string[];
  hospitality?: { icon: string; title: string; desc: string }[];
  testimonials?: { text: string; author: string; role: string }[];
}

export interface GeneratedProposal {
  html: string;
  css: string;
  js: string;
  readme: string;
}

function generateDeliverablesHtml(deliverables: { icon: string; title: string; desc: string }[]): string {
  return deliverables.map((item, index) => {
    const delayClass = index % 3 === 0 ? "" : ` reveal--delay-${index % 3}`;
    return `
        <div class="deliverable-item reveal${delayClass}">
          <div class="deliverable-item__icon">${item.icon}</div>
          <div>
            <h3 class="deliverable-item__title">${item.title}</h3>
            <p class="deliverable-item__text">${item.desc}</p>
          </div>
        </div>`;
  }).join("\n");
}

function generateLicenseHtml(rights: string[]): string {
  return rights.map((right, index) => {
    const delayClass = index % 2 === 0 ? "" : " reveal--delay-1";
    return `
        <div class="license-item reveal${delayClass}">
          <span class="license-item__check">✓</span>
          <span>${right}</span>
        </div>`;
  }).join("\n");
}

function generateHospitalityHtml(items: { icon: string; title: string; desc: string }[]): string {
  return items.map((item, index) => {
    const delayClass = index % 3 === 0 ? "" : ` reveal--delay-${index % 3}`;
    return `
        <div class="hospitality__card reveal${delayClass}">
          <div class="hospitality__card-icon">${item.icon}</div>
          <div>
            <h3 class="hospitality__card-title">${item.title}</h3>
            <p class="hospitality__card-text">${item.desc}</p>
          </div>
        </div>`;
  }).join("\n");
}

function generateTestimonialsHtml(items: { text: string; author: string; role: string }[]): string {
  return items.map((item, index) => {
    const delayClass = index % 3 === 0 ? "" : ` reveal--delay-${index % 3}`;
    return `
        <div class="testimonial-card reveal${delayClass}">
          <div class="testimonial-card__quote-icon">❝</div>
          <p class="testimonial-card__text">${item.text}</p>
          <p class="testimonial-card__author">${item.author}</p>
          <p class="testimonial-card__role">${item.role}</p>
        </div>`;
  }).join("\n");
}

// -----------------------------------------------------------------
// Proposal Compiler
// -----------------------------------------------------------------

export function generateProposal(data: ProposalData): GeneratedProposal {
  const agencyName = data.agencyName || "WhoIsDésir® Media";
  const clientName = data.clientName;
  const eventTitle = data.eventTitle;
  const eventDate = data.eventDate;
  const location = data.location;
  const coverageHours = data.coverageHours || "6:00 – 8:00 PM";
  const eventHours = data.eventHours || "4:00 – 9:00 PM";
  const email = data.email || "digitalvurv@gmail.com";
  const cashAppLink = data.cashAppLink || "https://cash.app/$DesirDigital";
  const youtubeId = data.youtubeId || "XXhvNM6MDUU";
  const standardValue = data.standardValue !== undefined ? data.standardValue : 375;
  const discount = data.discount !== undefined ? data.discount : 225;
  const clientInvestment = data.clientInvestment !== undefined ? data.clientInvestment : 150;
  const depositAmount = data.depositAmount !== undefined ? data.depositAmount : 75;
  const balanceAmount = data.balanceAmount !== undefined ? data.balanceAmount : 75;
  const balanceDueDate = data.balanceDueDate || "July 15, 2026";
  const signatureDish = data.signatureDish || "Griot Pizza";
  const brandSpecialization = data.brandSpecialization || "Haitian-owned";
  const targetRegion = data.targetRegion || "Miami-Dade and Broward";
  const culturalHeritage = data.culturalHeritage || "Haitian";
  const status = data.status || "pending";
  const googleScriptUrl = data.googleScriptUrl || "";
  const hostName = data.hostName || "Running Club";

  // Build blocks based on status
  let heroBadge = "";
  let headerCta = "";
  let heroCtas = "";
  let paymentStep1 = "";
  let ctaFooter = "";
  let mobileCta = "";
  let discoverySection = "";

  if (status === "pending") {
    heroBadge = `
      <div class="hero__badge">
        <span class="hero__badge-dot"></span>
        Photography Proposal — Prepared for ${clientName}
      </div>`;
    headerCta = `
        <a href="#accept" class="btn btn--primary btn--sm" id="header-accept-btn">
          Accept Proposal
        </a>`;
    heroCtas = `
        <a href="#accept" class="btn btn--primary" id="hero-accept-btn">
          <span class="btn__icon">✨</span>
          Accept Proposal & Pay Deposit — $${depositAmount}
        </a>
        <a href="mailto:${email}" class="btn btn--secondary" id="hero-contact-btn">
          Have Questions? Let's Talk
        </a>`;
    paymentStep1 = `
        <div class="timeline-item reveal">
          <div class="timeline-item__dot">1</div>
          <div class="timeline-item__content">
            <h3 class="timeline-item__title">50% Booking Deposit</h3>
            <p class="timeline-item__text"><strong>$${depositAmount}</strong> due upon acceptance of this proposal. Secures your date and production team.</p>
            <span class="timeline-item__highlight">⚡ Due Today on Acceptance</span>
          </div>
        </div>`;
    ctaFooter = `
      <h2 class="cta-footer__title">
        Ready to Capture<br>
        <span class="gradient-text">Your Event?</span>
      </h2>
      <p class="cta-footer__subtitle">
        Secure your date with a $${depositAmount} deposit. Let's create something extraordinary together.
      </p>
      <div class="cta-footer__buttons">
        <a href="${cashAppLink}" target="_blank" rel="noopener noreferrer" class="btn btn--primary" id="accept-btn" aria-label="Accept proposal and pay $${depositAmount} deposit">
          <span class="btn__icon">✨</span>
          Accept Proposal & Pay $${depositAmount} Deposit
        </a>
        <a href="mailto:${email}" class="btn btn--secondary" id="contact-btn" aria-label="Contact ${agencyName} with questions">
          Have Questions? Contact Us
        </a>
      </div>
      <div class="cta-footer__details">
        <span class="cta-footer__detail">
          <span>🔒</span> Secure Payment
        </span>
        <span class="cta-footer__detail">
          <span>📅</span> ${eventDate}
        </span>
        <span class="cta-footer__detail">
          <span>📸</span> ${coverageHours}
        </span>
        <span class="cta-footer__detail">
          <span>📍</span> ${location}
        </span>
      </div>`;
    mobileCta = `
  <div class="mobile-cta" id="mobile-cta" aria-hidden="true">
    <a href="#accept" class="btn btn--primary" id="mobile-accept-btn">
      <span class="btn__icon">✨</span>
      Accept & Pay $${depositAmount} Deposit
    </a>
  </div>`;
  } else {
    heroBadge = `
      <div class="hero__badge hero__badge--confirmed">
        <span class="hero__badge-check">✓</span>
        Deposit Received — Proposal Confirmed
      </div>`;
    headerCta = `
        <a href="#discovery" class="btn btn--primary btn--sm btn--confirmed" id="header-accept-btn">
          ✓ Deposit Received
        </a>`;
    heroCtas = `
        <a href="#discovery" class="btn btn--primary btn--confirmed" id="hero-accept-btn">
          <span class="btn__icon">✓</span>
          Deposit Received — Complete Discovery Form
        </a>
        <a href="mailto:${email}" class="btn btn--secondary" id="hero-contact-btn">
          Have Questions? Let's Talk
        </a>`;
    paymentStep1 = `
        <div class="timeline-item timeline-item--completed reveal">
          <div class="timeline-item__dot timeline-item__dot--completed">✓</div>
          <div class="timeline-item__content">
            <h3 class="timeline-item__title">50% Booking Deposit <span class="timeline-item__status">Received</span></h3>
            <p class="timeline-item__text"><strong>$${depositAmount}</strong> received. Your date and production team are secured.</p>
            <span class="timeline-item__highlight timeline-item__highlight--completed">✓ Deposit Confirmed</span>
          </div>
        </div>`;
    ctaFooter = `
      <h2 class="cta-footer__title">
        Deposit Received!<br>
        <span class="gradient-text">Next: Complete Your Discovery Form</span>
      </h2>
      <p class="cta-footer__subtitle">
        Thank you for your $${depositAmount} deposit. Please complete the discovery questions below so we can deliver exactly what you need.
      </p>
      <div class="cta-footer__buttons">
        <a href="#discovery" class="btn btn--primary btn--confirmed" id="accept-btn">
          <span class="btn__icon">✓</span>
          Complete Discovery Form
        </a>
        <a href="mailto:${email}" class="btn btn--secondary" id="contact-btn" aria-label="Contact ${agencyName} with questions">
          Have Questions? Contact Us
        </a>
      </div>
      <div class="cta-footer__details">
        <span class="cta-footer__detail">
          <span>🔒</span> Secure Payment
        </span>
        <span class="cta-footer__detail">
          <span>📅</span> ${eventDate}
        </span>
        <span class="cta-footer__detail">
          <span>📸</span> ${coverageHours}
        </span>
        <span class="cta-footer__detail">
          <span>📍</span> ${location}
        </span>
      </div>`;
    mobileCta = `
  <div class="mobile-cta" id="mobile-cta" aria-hidden="true">
    <a href="#discovery" class="btn btn--primary btn--confirmed" id="mobile-accept-btn">
      <span class="btn__icon">✓</span>
      Complete Discovery Form
    </a>
  </div>`;
    discoverySection = `
  <section class="section section--alt" id="discovery">
    <div class="container">
      <div class="section__header">
        <span class="section__label">Discovery Questions</span>
        <h2 class="section__title">Help Us Tell <span class="gradient-text">Your Story</span></h2>
        <p class="section__subtitle">Please answer these questions so we can capture your event exactly how you envision it.</p>
      </div>
      <div class="discovery__wrapper">
        <div class="discovery__card reveal">
          <div class="discovery__card-header">
            <div class="discovery__card-icon">🏃</div>
            <div>
              <h3 class="discovery__card-title">${hostName} — Event Host</h3>
              <p class="discovery__card-subtitle">Tell us about your event and vision</p>
            </div>
          </div>
          <form class="discovery__form" id="discovery-form-host" data-form="event-host">
            <div class="discovery__field">
              <label class="discovery__label" for="rc-why">Why are you hosting this event?</label>
              <textarea class="discovery__textarea" id="rc-why" name="why_hosting" rows="3" placeholder="What inspired this event? What's the story behind it?"></textarea>
            </div>
            <div class="discovery__field">
              <label class="discovery__label" for="rc-goal">What is the goal of the event?</label>
              <textarea class="discovery__textarea" id="rc-goal" name="event_goal" rows="3" placeholder="What do you hope to achieve? Fundraising, awareness, community building?"></textarea>
            </div>
            <div class="discovery__field">
              <label class="discovery__label" for="rc-audience">Who is the target audience?</label>
              <textarea class="discovery__textarea" id="rc-audience" name="target_audience" rows="3" placeholder="Describe your ideal attendee — age, interests, community"></textarea>
            </div>
            <div class="discovery__field">
              <label class="discovery__label" for="rc-feeling">What feeling should attendees leave with?</label>
              <textarea class="discovery__textarea" id="rc-feeling" name="attendee_feeling" rows="3" placeholder="Inspired? Energized? Connected? What's the takeaway emotion?"></textarea>
            </div>
            <div class="discovery__field">
              <label class="discovery__label" for="rc-action">What action should viewers take after watching?</label>
              <textarea class="discovery__textarea" id="rc-action" name="viewer_action" rows="3" placeholder="Join the club? Follow on social media? Visit ${clientName}? Share the post?"></textarea>
            </div>
            <div class="discovery__field">
              <label class="discovery__label" for="rc-moments">What moments are must-capture?</label>
              <textarea class="discovery__textarea" id="rc-moments" name="must_capture" rows="3" placeholder="Ribbon cutting, group photo, key people, specific activities?"></textarea>
            </div>
            <div class="discovery__field">
              <label class="discovery__label" for="rc-usage">Where will the content be used?</label>
              <textarea class="discovery__textarea" id="rc-usage" name="content_usage" rows="3" placeholder="Instagram, Facebook, website, flyers, press releases?"></textarea>
            </div>
            <div class="discovery__field">
              <label class="discovery__label" for="rc-partner">Why partner with ${clientName}?</label>
              <textarea class="discovery__textarea" id="rc-partner" name="why_partner" rows="3" placeholder="What makes this partnership meaningful for your club?"></textarea>
            </div>
            <div class="discovery__actions">
              <button type="submit" class="btn btn--primary">
                <span class="btn__icon">💾</span>
                Save Responses
              </button>
              <span class="discovery__save-status" id="status-event-host"></span>
            </div>
          </form>
        </div>
        <div class="discovery__card reveal reveal--delay-1">
          <div class="discovery__card-header">
            <div class="discovery__card-icon">🍕</div>
            <div>
              <h3 class="discovery__card-title">${clientName} — Venue Partner</h3>
              <p class="discovery__card-subtitle">Tell us about your brand and what you want highlighted</p>
            </div>
          </div>
          <form class="discovery__form" id="discovery-form-venue" data-form="venue-partner">
            <div class="discovery__field">
              <label class="discovery__label" for="piza-club">Why partner with the ${hostName}?</label>
              <textarea class="discovery__textarea" id="piza-club" name="why_partner_host" rows="3" placeholder="What does this partnership mean for your brand?"></textarea>
            </div>
            <div class="discovery__field">
              <label class="discovery__label" for="piza-menu">What menu items should be featured?</label>
              <textarea class="discovery__textarea" id="piza-menu" name="featured_menu" rows="3" placeholder="Signature dishes, new items, specials? List the must-photograph items"></textarea>
            </div>
            <div class="discovery__field">
              <label class="discovery__label" for="piza-people">Are there key people to feature?</label>
              <textarea class="discovery__textarea" id="piza-people" name="key_people" rows="3" placeholder="Owner, chef, staff members? Anyone who should be highlighted?"></textarea>
            </div>
            <div class="discovery__field">
              <label class="discovery__label" for="piza-branding">Any branding or sponsor requirements?</label>
              <textarea class="discovery__textarea" id="piza-branding" name="branding_requirements" rows="3" placeholder="Logos, signage, sponsor placement, brand guidelines?"></textarea>
            </div>
            <div class="discovery__field">
              <label class="discovery__label" for="piza-visual">Any visual moments you want highlighted?</label>
              <textarea class="discovery__textarea" id="piza-visual" name="visual_highlights" rows="3" placeholder="Specific angles, lighting, décor, atmosphere you want captured?"></textarea>
            </div>
            <div class="discovery__actions">
              <button type="submit" class="btn btn--primary">
                <span class="btn__icon">💾</span>
                Save Responses
              </button>
              <span class="discovery__save-status" id="status-venue-partner"></span>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>`;
  }

  // Render lists or use defaults
  const defaultDeliverables = [
    { icon: "🎊", title: "Grand Opening Festivities", desc: "Ribbon cutting, first customers, celebration energy, and milestone moments." },
    { icon: "👋", title: "Customer Interactions", desc: `Genuine moments of guests experiencing ${clientName} for the first time.` },
    { icon: "👨‍🍳", title: "Team Members", desc: "Your staff in action — the faces and passion behind the brand." },
    { icon: "🏪", title: "Interior & Exterior Venue", desc: "Architectural and design shots for Google Business, Yelp, and marketing materials." },
    { icon: "🍕", title: "Signature Menu Items", desc: `Mouthwatering photography of ${signatureDish} and your signature dishes, styled for maximum visual impact.` },
    { icon: "🍽️", title: "Detailed Food Photography", desc: "Close-up, editorial-quality food shots ideal for menus, ads, and social posts." },
    { icon: "📺", title: "Event Highlights & Viewing Experience", desc: "Capturing the excitement — fans, reactions, screens, and the core showcase experience." },
    { icon: "🌍", title: "Community Engagement", desc: `Moments that showcase ${clientName} as a community hub — neighbors, families, and supporters coming together.` },
    { icon: "✨", title: "Brand Atmosphere & Candid Moments", desc: "The vibe, décor, lighting, and spontaneous moments that make your brand authentic and memorable." }
  ];
  
  const defaultRights = [
    "Instagram posts, stories, and reels",
    "Facebook page and advertising",
    "TikTok content",
    "Website and landing pages",
    "Google Business Profile",
    "Press releases and media kits",
    "Printed marketing materials",
    "Promotional banners and signage",
    "Future advertising campaigns"
  ];

  const defaultHospitality = [
    { icon: "🍽️", title: "Complimentary Meals", desc: "Two complimentary meals for production team members during the event — so we can stay fueled and focused." },
    { icon: "🎁", title: "Future Visit Gift Card", desc: "One $50 gift card for a future visit — because we'd love to come back as guests and customers too." },
    { icon: "🎯", title: "On-Site Accommodations", desc: "Access to a staging area or supportive on-site accommodations to facilitate smooth production logistics during the event." }
  ];

  const defaultTestimonials = [
    { text: `[Client testimonial goes here — Placeholder for a review from a client about ${agencyName}'s work.]`, author: "[Client Name — Placeholder]", role: "[Business Name & Role — Placeholder]" },
    { text: "[Client testimonial goes here — Placeholder for a review from an event client highlighting the quality and professionalism of the production team.]", author: "[Client Name — Placeholder]", role: "[Business Name & Role — Placeholder]" },
    { text: "[Client testimonial goes here — Placeholder for a review from a minority-owned business about the partnership experience and marketing impact.]", author: "[Client Name — Placeholder]", role: "[Business Name & Role — Placeholder]" }
  ];

  const deliverablesHtml = generateDeliverablesHtml(data.deliverables || defaultDeliverables);
  const licenseHtml = generateLicenseHtml(data.rights || defaultRights);
  const hospitalityHtml = generateHospitalityHtml(data.hospitality || defaultHospitality);
  const testimonialsHtml = generateTestimonialsHtml(data.testimonials || defaultTestimonials);

  // Generate HTML by replacing all placeholders
  let html = TEMPLATE_INDEX_HTML;
  const replacements: Record<string, string> = {
    "{{AGENCY_NAME}}": agencyName,
    "{{CLIENT_NAME}}": clientName,
    "{{EVENT_TITLE}}": eventTitle,
    "{{EVENT_DATE}}": eventDate,
    "{{LOCATION}}": location,
    "{{COVERAGE_HOURS}}": coverageHours,
    "{{EVENT_HOURS}}": eventHours,
    "{{CONTACT_EMAIL}}": email,
    "{{CASH_APP_LINK}}": cashAppLink,
    "{{STANDARD_VALUE}}": standardValue.toString(),
    "{{DISCOUNT}}": discount.toString(),
    "{{CLIENT_INVESTMENT}}": clientInvestment.toString(),
    "{{DEPOSIT_AMOUNT}}": depositAmount.toString(),
    "{{BALANCE_AMOUNT}}": balanceAmount.toString(),
    "{{BALANCE_DUE_DATE}}": balanceDueDate,
    "{{YOUTUBE_ID}}": youtubeId,
    "{{SIGNATURE_DISH}}": signatureDish,
    "{{BRAND_SPECIALIZATION}}": brandSpecialization,
    "{{TARGET_REGION}}": targetRegion,
    "{{CULTURAL_HERITAGE}}": culturalHeritage,
    "{{HEADER_CTA_BLOCK}}": headerCta,
    "{{HERO_BADGE_BLOCK}}": heroBadge,
    "{{HERO_CTAS_BLOCK}}": heroCtas,
    "{{PAYMENT_STEP1_BLOCK}}": paymentStep1,
    "{{CTA_FOOTER_BLOCK}}": ctaFooter,
    "{{MOBILE_CTA_BLOCK}}": mobileCta,
    "{{DISCOVERY_SECTION_BLOCK}}": discoverySection,
    "{{DELIVERABLES_LIST_HTML}}": deliverablesHtml,
    "{{LICENSE_LIST_HTML}}": licenseHtml,
    "{{HOSPITALITY_LIST_HTML}}": hospitalityHtml,
    "{{TESTIMONIALS_LIST_HTML}}": testimonialsHtml
  };

  for (const [key, val] of Object.entries(replacements)) {
    html = html.split(key).join(val);
  }

  // Generate CSS (copy of base style)
  const css = TEMPLATE_STYLES_CSS;

  // Generate JS
  let js = TEMPLATE_SCRIPT_JS;
  const proposalData = {
    eventName: `${clientName} — ${eventTitle}`,
    eventDate: eventDate,
    coverageHours: coverageHours,
    eventHours: eventHours,
    location: `${clientName}, ${location}`,
    standardValue: standardValue,
    discount: discount,
    clientInvestment: clientInvestment,
    depositAmount: depositAmount,
    balanceAmount: balanceAmount,
    depositStatus: status,
    deliverables: (data.deliverables || defaultDeliverables).map(d => d.title),
    usageRights: data.rights || defaultRights,
    hospitality: (data.hospitality || defaultHospitality).map(h => h.title)
  };

  const storageKey = `whoisdesir-${clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-discovery`;

  js = js.replace("{{CLIENT_NAME}}", clientName);
  js = js.replace("{{PROPOSAL_JSON}}", JSON.stringify(proposalData, null, 2));
  js = js.replace("{{STORAGE_KEY}}", storageKey);
  js = js.replace("{{GOOGLE_SCRIPT_URL}}", googleScriptUrl);

  // Generate README
  let readme = TEMPLATE_README_MD;
  const readmeReplacements: Record<string, string> = {
    "{{CLIENT_NAME}}": clientName,
    "{{EVENT_TITLE}}": eventTitle,
    "{{EVENT_DATE}}": eventDate,
    "{{AGENCY_NAME}}": agencyName,
  };
  for (const [key, val] of Object.entries(readmeReplacements)) {
    readme = readme.split(key).join(val);
  }

  return { html, css, js, readme };
}
