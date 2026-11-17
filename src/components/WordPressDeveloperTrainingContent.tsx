'use client';

import React from 'react';

type Section = {
  id: string;
  title: string;
  intro?: string;
  points?: string[];
  callout?: string;
};

const SECTIONS: Section[] = [
  {
    id: 'role-overview',
    title: '1. Role Overview & Access',
    intro:
      'You build and maintain local SEO landing pages for WhoIsDésir Media Agency in WordPress using the Enfold theme and Yoast SEO. The city changes. The agency remains the brand. Client projects demonstrate the work.',
    points: [
      'WhoIsDésir Media Agency is always the business being marketed. Never turn a city page into a client biography or campaign page.',
      'The target city is always the primary geographic SEO focus. Use Broward County and South Florida naturally where relevant.',
      'Featured clients (for example, Kedner Maxime) are portfolio proof. Introduce them as previous clients and never imply their work was filmed in the target city.',
      'Access is granted through authorized WordPress and Google permissions. Never ask for or share a master Google or WordPress password.',
      'Do not change unrelated site settings, plugins, themes, or another client’s content.',
    ],
    callout: 'If you cannot verify a local fact or agency claim, identify the information gap instead of inventing content.',
  },
  {
    id: 'account-access',
    title: '2. Account Access & Login',
    intro:
      'Every contractor receives their own account through the agency. Access is delegated, individual, and revocable.',
    points: [
      'Log in at the WordPress admin URL provided by your manager. Use your own credentials only.',
      'Confirm you can open Pages, edit the assigned page, and preview changes before starting.',
      'If you need access, request it through your manager. Do not reuse another contractor’s login.',
      'Report suspicious access or unexpected account changes immediately.',
    ],
  },
  {
    id: 'content-ai',
    title: '3. Creating Content with AI',
    intro:
      'Use the approved SEO prompt and template to draft city content. AI is a drafting assistant — you are responsible for accuracy and originality.',
    points: [
      'Feed the AI the approved SEO template, the target city, the verified agency services, and the supplied video descriptions or transcripts.',
      'Keep the required page sections: city introduction, agency services, why businesses need professional content, featured client project, local city SEO, local business opportunities, why choose WhoIsDésir, FAQ, and a strong CTA.',
      'Use only verified services: short-form video content, video editing, custom graphics, content scripting, content strategy, and social media-ready creative.',
      'Do not invent prices, guarantees, offices, clients, testimonials, awards, or production results.',
      'Rewrite AI output in natural language. Remove repetition and keyword stuffing before publishing.',
    ],
    callout: 'Primary CTA: “Work With WhoIsDésir Media Agency.” Secondary CTA: “View Our Work.” Official site: https://whoisdesir.com/',
  },
  {
    id: 'content-spreadsheet',
    title: '4. Adding Content to the Spreadsheet',
    intro:
      'The SEO spreadsheet is the handoff record for each city. It keeps copy, Yoast metadata, and status in one place.',
    points: [
      'Open the approved SEO spreadsheet and select the correct city tab or row. Never overwrite another city’s work.',
      'Paste the page name, SEO title, focus keyphrase, slug, meta description, related keyphrases, canonical URL, social title, and social description into the correct columns.',
      'Add the target city, county, primary SEO objective, and featured client.',
      'Record the page status and any open questions so the next person can pick up the work.',
      'Save and confirm the values persisted before moving on.',
    ],
  },
  {
    id: 'duplicate-page',
    title: '5. Duplicating the City Page in Enfold',
    intro:
      'New city pages start from the approved main landing page so the brand layout and verified sections stay consistent.',
    points: [
      'Duplicate the approved main landing page — not another city page that may already contain errors.',
      'Rename the duplicate with the WordPress Page Name for the target city. Keep the page name separate from the H1.',
      'Set a unique, SEO-friendly URL slug, for example /plantation-florida-media-agency/.',
      'Replace the placeholder city, headings, copy, metadata, and internal links. Do not leave another city’s name anywhere on the page.',
      'Check the featured image, SEO fields, and any embedded media carried over by the duplicate.',
    ],
    callout: 'Duplicating is a layout starting point, not permission to publish near-identical pages. Every city page needs genuinely original local content.',
  },
  {
    id: 'add-content',
    title: '6. Adding Content to New Pages Properly',
    intro:
      'Paste content into the correct Enfold elements and keep the existing layout, spacing, and responsive behaviour intact.',
    points: [
      'Use the existing Enfold layout elements and content sections. Do not restructure the page or add new builder plugins.',
      'Paste headings into heading elements, paragraphs into text elements, and lists into list elements — never into a single text block.',
      'Replace all placeholder text, lorem ipsum, sample testimonials, and stock claims.',
      'Keep the agency’s verified services and CTA wording consistent across pages.',
      'Update internal links to real, published URLs only. Cross-link relevant Broward County city pages when they exist.',
    ],
  },
  {
    id: 'enfold-headings',
    title: '7. Enfold Headings & Layout Rules',
    intro:
      'Search engines and screen readers rely on a clean heading outline. Enfold makes it easy to break it if heading tags are chosen by appearance only.',
    points: [
      'Provide the WordPress Page Name separately from the H1. The page name drives the WordPress page title; the H1 is the on-page headline.',
      'Use exactly one H1 per page.',
      'Use H2 for major sections and H3 only for subsections nested under an H2.',
      'Do not choose a heading level because it looks smaller or larger. Style with Enfold typography settings instead.',
      'Keep headings descriptive, local where appropriate, and free of keyword stuffing.',
    ],
    callout: 'Reference outline: H1 “Media Agency in [City], FL: Video Production & Content Creation” → H2 services → H3 service items → H2 local business → H2 client project → H2 city guide → H2 FAQ → H2 CTA.',
  },
  {
    id: 'responsive-video-embeds',
    title: '8. Responsive Video Embeds',
    intro:
      'Campaign and portfolio videos must play correctly on desktop, tablet, and mobile without breaking the layout.',
    points: [
      'Use the YouTube Share → Embed code and paste it into the designated embed container.',
      'Use a responsive container: 16:9 for horizontal video and 9:16 for vertical video where the design supports portrait presentation.',
      'Set the iframe to 100% width with height auto or a padding-based aspect-ratio wrapper. Do not hard-code fixed pixel dimensions without checking the actual layout.',
      'Preserve existing website margins and spacing. Prevent horizontal scrolling.',
      'Confirm every supplied video is present, loads, and plays.',
    ],
  },
  {
    id: 'yoast-seo',
    title: '9. Yoast SEO Fields',
    intro:
      'Every delivery includes the complete Yoast package. The fields below are not optional.',
    points: [
      'Page Name — the WordPress page title, separate from the H1.',
      'SEO Title — concise, city + service + brand.',
      'Focus Keyphrase — the primary media-agency + city phrase. Do not use the featured client’s name as the primary keyphrase.',
      'URL Slug — short, unique, and city-specific.',
      'Meta Description — concise, accurate, and written for a business owner.',
      'Related Keyphrases — supporting local and service phrases.',
      'Canonical URL recommendation — the preferred URL for the page.',
      'Social Sharing Title and Social Sharing Description — ready for Facebook, Instagram, and other shares.',
    ],
    callout: 'Never claim a physical office in the target city. Never imply a featured video was filmed there unless it was verified.',
  },
  {
    id: 'visual-qa',
    title: '10. Visual QA — Desktop & Mobile',
    intro:
      'Do not publish or hand off a page you have not tested at desktop and mobile sizes.',
    points: [
      'Desktop: test in Chrome at a standard desktop viewport. Check video playback, navigation, heading hierarchy, spacing, and links.',
      'Mobile: test iPhone-sized and Android-sized viewports. Check responsive video scaling, text alignment, margins, and playback.',
      'Confirm there is no horizontal scrolling and no element overflows the viewport.',
      'Click every internal link and CTA. Confirm they reach real, published destinations.',
      'Test any form or inquiry path and confirm the submission reaches the agency.',
      'Record broken embeds, layout problems, or playback errors and send them back for correction before delivery.',
    ],
  },
  {
    id: 'delivery-reporting',
    title: '11. Delivery & Reporting',
    intro:
      'Deliver the work in the required order so the reviewer can grade it without guessing.',
    points: [
      'Section 1: Page information — page name, target city, county, primary SEO objective, featured client.',
      'Section 2: Yoast SEO settings — a complete copy-and-paste table.',
      'Section 3: Enfold heading structure — the full H1/H2/H3 outline.',
      'Section 4: Complete landing page — publication-ready content.',
      'Section 5: Video SEO — titles, descriptions, thumbnail filenames, alt text, and placement.',
      'Section 6: City research — verified local facts, business districts, keywords, nearby cities, and sources.',
      'Section 7: Internal linking — agency pages and other city landing pages.',
      'Section 8: CTA and advertising readiness — wording, placement, and paid-social considerations.',
      'Section 9: Publishing checklist — a short checklist for the web team.',
      'Submit the live page URL, the WordPress edit URL, screenshots, and any outstanding issues in the practical work form below.',
    ],
  },
];

export const WORDPRESS_NON_NEGOTIABLES = [
  'WhoIsDésir Media Agency is always the business being marketed.',
  'The target city is always the primary geographic SEO focus.',
  'Featured clients are portfolio examples, not the subject of the page.',
  'Do not create doorway pages that differ only by city name.',
  'Do not invent clients, testimonials, offices, results, prices, or locations.',
  'Do not claim the agency filmed in a city without verification.',
  'Every city page must contain original, useful local content.',
  'Use natural language and avoid keyword stuffing.',
  'One H1, a logical H2/H3 hierarchy, and complete Yoast metadata.',
];

export default function WordPressDeveloperTrainingContent() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-miami-blue-light/30 bg-gradient-to-br from-miami-blue-beach/10 to-white p-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧩</span>
          <div>
            <h2 className="font-heading text-xl font-black text-dark-800">WordPress Developer SOP</h2>
            <p className="text-sm text-dark-500">
              Enfold city landing pages, SEO content, Yoast metadata, responsive QA, and delivery.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-dark-600">
          This module is the workshop. The certification quiz is separate and is graded on the server.
          Passing the quiz at 80% unlocks the certified pay tier. Failing keeps the standard rate until you pass.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.id} className="rounded-2xl border border-muted-lighter bg-white p-6">
          <h3 className="font-heading text-lg font-bold text-dark-800">{section.title}</h3>
          {section.intro && <p className="mt-2 text-sm text-dark-600">{section.intro}</p>}
          {section.points && (
            <ul className="mt-4 space-y-2">
              {section.points.map((point, index) => (
                <li key={index} className="flex gap-2 text-sm text-dark-600">
                  <span className="mt-0.5 text-miami-blue-beach">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
          {section.callout && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {section.callout}
            </div>
          )}
        </section>
      ))}

      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h3 className="font-heading text-lg font-bold text-red-800">Non-Negotiable Rules</h3>
        <ul className="mt-4 space-y-2">
          {WORDPRESS_NON_NEGOTIABLES.map((rule, index) => (
            <li key={index} className="flex gap-2 text-sm text-red-800">
              <span className="mt-0.5">✕</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
