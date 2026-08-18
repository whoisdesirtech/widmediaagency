/**
 * Proposal Generator — Main orchestrator.
 * Composes templates, styles, and HTML fragments into a complete proposal.
 */

import { ProposalData, GeneratedProposal } from "./proposal/types";
import { TEMPLATE_STYLES_CSS } from "./proposal/styles";
import { TEMPLATE_INDEX_HTML, TEMPLATE_SCRIPT_JS, TEMPLATE_README_MD } from "./proposal/templates";
import {
  generateDeliverablesHtml,
  generateLicenseHtml,
  generateHospitalityHtml,
  generateTestimonialsHtml,
  getDefaultDeliverables,
  defaultRights,
  defaultHospitality,
  getDefaultTestimonials,
} from "./proposal/html-generators";

export type { ProposalData, GeneratedProposal };

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
  const deliverablesHtml = generateDeliverablesHtml(
    data.deliverables || getDefaultDeliverables(clientName, signatureDish)
  );
  const licenseHtml = generateLicenseHtml(data.rights || defaultRights);
  const hospitalityHtml = generateHospitalityHtml(data.hospitality || defaultHospitality);
  const testimonialsHtml = generateTestimonialsHtml(
    data.testimonials || getDefaultTestimonials(agencyName)
  );

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
    deliverables: (data.deliverables || getDefaultDeliverables(clientName, signatureDish)).map(d => d.title),
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
