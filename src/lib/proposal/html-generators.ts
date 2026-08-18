/**
 * HTML fragment generators and default data for the proposal template.
 */

// -----------------------------------------------------------------
// HTML Fragment Generators
// -----------------------------------------------------------------

export function generateDeliverablesHtml(deliverables: { icon: string; title: string; desc: string }[]): string {
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

export function generateLicenseHtml(rights: string[]): string {
  return rights.map((right, index) => {
    const delayClass = index % 2 === 0 ? "" : " reveal--delay-1";
    return `
        <div class="license-item reveal${delayClass}">
          <span class="license-item__check">✓</span>
          <span>${right}</span>
        </div>`;
  }).join("\n");
}

export function generateHospitalityHtml(items: { icon: string; title: string; desc: string }[]): string {
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

export function generateTestimonialsHtml(items: { text: string; author: string; role: string }[]): string {
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
// Default Data Arrays
// -----------------------------------------------------------------

export function getDefaultDeliverables(clientName: string, signatureDish: string) {
  return [
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
}

export const defaultRights = [
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

export const defaultHospitality = [
  { icon: "🍽️", title: "Complimentary Meals", desc: "Two complimentary meals for production team members during the event — so we can stay fueled and focused." },
  { icon: "🎁", title: "Future Visit Gift Card", desc: "One $50 gift card for a future visit — because we'd love to come back as guests and customers too." },
  { icon: "🎯", title: "On-Site Accommodations", desc: "Access to a staging area or supportive on-site accommodations to facilitate smooth production logistics during the event." }
];

export function getDefaultTestimonials(agencyName: string) {
  return [
    { text: `[Client testimonial goes here — Placeholder for a review from a client about ${agencyName}'s work.]`, author: "[Client Name — Placeholder]", role: "[Business Name & Role — Placeholder]" },
    { text: "[Client testimonial goes here — Placeholder for a review from an event client highlighting the quality and professionalism of the production team.]", author: "[Client Name — Placeholder]", role: "[Business Name & Role — Placeholder]" },
    { text: "[Client testimonial goes here — Placeholder for a review from a minority-owned business about the partnership experience and marketing impact.]", author: "[Client Name — Placeholder]", role: "[Business Name & Role — Placeholder]" }
  ];
}
