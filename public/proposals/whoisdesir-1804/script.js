/* ===================================================================
   WhoIsDésir® Media × 1804 Haitian Pizza — Proposal Landing Page
   JavaScript — Interactivity, Scroll Reveals, Sticky Header
   =================================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------------------
  // Proposal Data Model
  // ---------------------------------------------------------------
  const proposal = {
    eventName: '1804 Haitian Pizza — Grand Opening & FIFA World Cup Showcase',
    eventDate: '2026-07-18',
    coverageHours: '6:00 PM – 8:00 PM',
    eventHours: '4:00 PM – 9:00 PM',
    location: '1804 Haitian Pizza, Pompano Beach, FL',
    standardValue: 375,
    discount: 225,
    clientInvestment: 150,
    depositAmount: 75,
    balanceAmount: 75,
    depositStatus: 'received',
    deliverables: [
      'Grand opening festivities',
      'Customer interactions',
      'Team members',
      'Interior/exterior venue',
      'Signature menu items (including Griot Pizza)',
      'Detailed food photography',
      'World Cup viewing experience',
      'Community engagement',
      'Brand atmosphere',
      'Candid moments'
    ],
    usageRights: [
      'Instagram',
      'Facebook',
      'TikTok',
      'Website',
      'Google Business Profile',
      'Press releases',
      'Printed marketing',
      'Promotional banners',
      'Future advertising'
    ],
    hospitality: [
      'Two complimentary meals for production team',
      'One $50 gift card for a future visit',
      'On-site accommodations supporting production logistics'
    ]
  };

  // ---------------------------------------------------------------
  // Discovery Form Handler — localStorage + Google Sheets
  // ---------------------------------------------------------------
  const STORAGE_KEY = 'whodesir-1804-discovery';
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOHR3o-hxjaoIWaO0Z2ycuXPX4Hi97JaC1vMcRnRggcpzGxirQN7XVisyAfDj84mdu/exec';

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
          const field = form.querySelector(`[name="${name}"]`);
          if (field) field.value = value;
        });
      }
    });
  }

  function showSaveStatus(formKey, message) {
    const statusEl = document.getElementById(`status-${formKey}`);
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

      console.log(`[WhoIsDésir®] Discovery saved — ${formKey}:`, answers);
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
        if (link.getAttribute('href') === `#${id}`) {
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