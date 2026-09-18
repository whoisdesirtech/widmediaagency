# WhoIsDésir® Media — Lead Generation & Nurturing System Specification

**Version:** 1.0.0 (draft specification)
**Status:** Ready for web implementation
**Owner:** WhoIsDésir® Media Growth Organization
**Companion implementation:** `/grow` landing page in this repository; lead capture endpoint `POST /api/growth-lead`.

This document is the complete 25-part system specification for WhoIsDésir® Media's
lead acquisition and client nurturing operation. It converts raw strategy notes into an
implementable operating spec: sourcing, messaging, qualification, scoring, nurturing,
CRM data architecture, attribution, approvals, compliance, and the OpenCode page
specification with five interactive tools.

Confirmed operational values (firm):
- Sales-ready revenue floor: **$1M USD annual agency revenue**
- Minimum spend cutoffs: **$3,000/mo retainer** OR **$10,000 project budget**
- Acquisition cost cap: **$1,500 per closed account**
- Target economics: **3:1 LTV:CAC**
- Partner commission: **10% of initial invoice, 5% for first three billed months**
- Guardrails: **never promise specific outcomes/timelines/guarantees**; on vague input,
  **ask one clarifying question and restate understanding before acting**

---

## Part 1 — Deconstruction of Raw Notes

The source brain dump expresses one operational model: WhoIsDésir Media behaves as both
an agency and an internal growth lab. Every strategy maps to one of five subsystems:

| Raw theme | Decomposed requirement | Spec section |
|---|---|---|
| Inconsistent pipeline | Deterministic outbound + inbound machinery, capacity-gated | 3, 4, 10 |
| Unclear positioning | Sharply-defined ICPs and channel-appropriate scripts | 3, 5 |
| High client churn | Retention/expansion loops and quarterly education drips | 14 |
| No contact→contract system | Canonical CRM pipeline + handoff + approvals | 7, 10, 12, 19 |
| "Verified results" blind spot | Anonymous, non-promising results framework | 20 |

Each raw instruction was classified as **firm requirement** (implement verbatim) or
**placeholder** (confirmed explicitly before build). Differences from the original notes,
if any, are recorded in the confirmation log at the end of this document.

## Part 2 — Operational Deficiency Findings

The source notes describe (and this spec is designed to fix) the following deficiencies:

1. **Pipeline inconsistency** — no fixed qualification thresholds; effort is spent on
   leads below the minimum spend floor.
2. **Positioning drift** — outreach reads differently across channels; no tone rule or
   per-channel script library exists.
3. **Response handling latency** — no SLA on inbound submissions or warm qualification.
4. **Churn by neglect** — no retention loop, expansion triggers, or quarterly education
   drip for bad-timing relationships.
5. **Unstructured handoff** — sales-to-delivery has no checklist; deposits and kickoff
   timing are ad hoc.
6. **Unrepeatable economics** — no CAC cap, no LTV:CAC target, no campaign pause trigger,
   and no cost attribution model.

Each of these has a concrete countermeasure in the parts that follow.

## Part 3 — Target Audience & ICP Definitions

Three segments, each with a qualifying profile. Regional outreach centers on **South
Florida / Miami** (in-person strategy alignment); **national** outreach is fully digital.

**A. Media Agencies**
- Firm revenue **$1M+**, dedicated software/media budget, agency founder or marketing director
  with decision authority within 30 days.
- Pain: inconsistent pipeline, buyer-side churn, no repeatable "contact→contract" motion.
- We sell: growth retainers, media production cadence, white-label overflow.

**B. Luxury Hospitality**
- Boutique hotels, groups, and hospitality marketing firms in South Florida; national
  digital for multi-property groups.
- Pain: seasonal pipeline, brand consistency across properties, content velocity.
- We sell: brand + media + events + hospitality experiences centered on executive-level
  service quality.

**C. Corporate Lifestyle** *(defined as executive-level services: brand, media, events, hospitality)*
- Professional services firms (legal, financial, advisory) and corporate teams buying
  executive brand, media, and events.
- Pain: unremarkable executive presence, dry content pipelines, event production gaps.
- We sell: executive brand media, event coverage, corporate lifestyle content.

**Service fit** — any request outside supported services is routed to **higher custom
engineering rates** or **outside partner referrals** (see Part 6).

## Part 4 — Lead Sourcing Taxonomy

| Source class | Channel | Lead type | Signal weight |
|---|---|---|---|
| Outbound | Cold email (agency founders / marketing directors) | Contact | +1 |
| Outbound | LinkedIn (message flows) | Contact | +1 |
| Inbound authority | LinkedIn: work breakdowns, case studies, dev notes | Top-of-funnel | +2 |
| Inbound capture | Lead magnets: operational audits, workflow templates, onboarding playbooks | Top-of-funnel | +2 |
| Inbound transport | Multi-stage landing form (`/grow`) | Warm | +3 |
| Referral | Partner agencies / active client referrals | Warm | +3 |
| Network | Miami in-person strategy alignment | Warm | +2 |

Attribution weight (Part 17) is computed across **all** touches, not only the first or last.

## Part 5 — Professional Introduction Scripts Across Channels

**Tone rules (all channels):** short sentences; name the category problem the prospect
admits to; reference a work sample; one specific question; no outcome promises; never
say "I guarantee X"; always include a compliant sender identity and opt-out.

**Email — founder/director cold (5 lines max):**
> Subject: Pipeline inconsistency → who fixes it
> Hi {first},
> Marketing directors at {agency type} tell me the same three things: pipeline is
> lumpy, positioning drifts, and churn eats margin. We just closed a {segment} engagement
> where the fix was a repeatable nurture system, not more ads. Detail here: {case study url}.
> Worth 12 minutes to pressure-test your funnel? — {signer}, WhoIsDésir® Media, {FL address}

**Email — warm inbound (post-form):**
> {first} — you asked about {resource/service}. Two clarifying notes before we book your
> call so the hour is useful: (1) what is the #1 operational bottleneck right now, and
> (2) is a {budget bucket} spend already approved for this quarter? Reply with those and
> I'll send a tailored {audit/template}.

**LinkedIn — connection note:**
> {First}, your {observation about their brand/content} stands out. I deconstruct agency
> pipelines — here's one teardown in your space: {link}. Open to a 15-min scan.

**LinkedIn — follow-up (day 3-5):**
> No agenda beyond usefulness: can I send you the {operational audit/template} we hand
> prospects before any call? Requesting nothing back.

**Phone (warm, follow-up only):**
> Hi {first}, {name} from WhoIsDésir — you downloaded {resource} last week. I have a
> 3-minute answer to {pain point} and a 12-minute version. Which fits your calendar?

**SMS (only after phone contact / explicit reply):**
> {First}, quick one — cancelled calls are fine; here's the {asset} link anyway so the
> context isn't lost: {url}. — {name}

**Networking (Miami in-person):**
> "We fix pipeline inconsistency and churn for {segment} — usually a retention and a lead
> engine, not a campaign spend increase. What's the bottleneck at {their org} right now?"

## Part 6 — Resource Routing Logic

Decision tree applied to every inbound and discovered lead:

1. **Out-of-scope request?** Technical requests outside supported services → higher custom
   engineering rate **or** outside partner referral. No promise, no vague fit.
2. **Below spend cutoff (< $3,000/mo OR < $10,000 project)?** → educational resources
   (drips, templates) or partner referral. Never force-fit.
3. **Meets budget but not authority/timeline?** → educational drip; revisit quarterly.
4. **Vague input?** → ask **one** clarifying question; restate understanding before acting.
5. **Otherwise** → warm qualification, 15-minute SLA, book discovery.

## Part 7 — Multi-Stage Lead Capture Forms (`/grow`)

Three progressive stages (never more than ~4 fields per stage):

1. **Segment** — who are you: Media Agency / Luxury Hospitality / Corporate Lifestyle / Other.
2. **Fit signals** — annual revenue band (≥$1M), monthly marketing spend, decision timeline (≤30 days).
3. **Details + consent** — email, optional message, CAN-SPAM/GDPR consent, submit.

Server-side validation mirrors `src/app/api/growth-lead/route.ts`; rate-limited at
**10 req / hour / client IP** (same policy as `api/booking`).

## Part 8 — BANT & Custom Agency Qualification Rules

A lead is **sales-ready** only when ALL hold:

- **B**udget — dedicated budget for software or media services AND at **$3,000/mo** or **$10,000** minimum.
- **A**uthority — decision authority exists; decision within **30 days**.
- **N**eed — documented operational bottleneck (from discovery questions, Part 21).
- **T**iming — able to commit to a launch timeline in the current quarter.

Below floor → educational or referral (Part 6). Verified in CRM before any proposal
(Part 12). **Discovery call questions:**
1. What is your #1 operational bottleneck right now?
2. What management tools / agencies are you using today?
3. What is current monthly marketing/media spend?
4. What is your quarterly growth target, and what must happen to hit it?

## Part 9 — Behavioral Scoring Mechanics

Points assigned to observable actions (server-side events, stored with the lead):

| Action | Points |
|---|---|
| Discovery call booked | +40 |
| Inbound form submission (warm) | +30 |
| Reply to outreach | +20 |
| Case study downloaded | +15 |
| Operational audit requested | +15 |
| Repeat service-page visit (2+) | +10 |
| Lead magnet download | +10 |
| Service page single visit | +5 |
| Email opened | +2 |

Tiers: **0–19 cold list** · **20–49 engaged** · **50–79 hot** · **80+ sales-ready flag**,
subject to BANT gate (Part 8). Scoring powers the simulator on the page.

## Part 10 — Human vs Automated Nurturing Cadences

**Automated (top-of-funnel):** confirmations, acknowledgement of downloads, value emails,
lead magnet delivery, templates, operational audit invitations.

**Manual (high-value):** research notes, tailored recommendations, personalized video
audits, case study walk-throughs — human-authored for accounts meeting spend floor +
authority.

**21-day multi-step cadence (the canonical pattern):**

| Day | Channel | Content | Mode |
|---|---|---|---|
| 0 | Auto | Entry confirmation + asset delivery | Automated |
| 2 | LinkedIn | Value note / relevant teardown | Automated |
| 4 | Email | Value email + work breakdown | Automated |
| 7 | Email+L | Personalized video audit (12 min) | Manual |
| 10 | LinkedIn | Objection-aware nudge (cost/in-house) | Automated |
| 14 | Email | Case study breakdown | Manual |
| 18 | LinkedIn | Platform update / roundtable invite | Automated |
| 21 | Email | Soft landing: clear ask or park | Automated |

**Objection responses (generic-teams / cheaper competitors):** lead with verifiable
revenue outcomes, technical expertise, and the *hidden* operational costs and quality
risk of generic teams — never disparage, never promise a result.

**Re-engagement:** industry teardowns, platform updates, agency roundtable invites.

**Bad timing:** move to **quarterly educational drips**. **Permanent removal:** no budget
authority, shut down operations, or explicit opt-out.

## Part 11 — Structured Follow-Up Timelines

- Inbound submission or warm qualification → first touch **≤ 15 minutes** (automated).
- Discovery call booked → owning senior AE within **24 hours**.
- Proposal → only after budget/decision-maker/launch-timeline verified in CRM (Part 12).
- No-reply cadence → 21-day sequence above; stalled → re-engagement; a second 21-day
  cycle allowed; then quarterly drip or park.
- No promise of outcome timelines anywhere in the copy (guardrail).

## Part 12 — CRM Pipeline Architecture

PostgreSQL-backed CRM (custom Prisma stack, or a standard CRM hub with equivalent fields).

**Canonical stages:** `new → contacted → responded → discovered → qualified →
proposal → negotiation → closed_won` · plus `education_drip`, `referral_out`,
`parked_until_{quarter}`, `dead`.

Rules:
- Centralized records; **mandatory status tagging**; **clear account ownership**;
  **automated email logging**.
- **Duplicate prevention:** contact history check required before any new message.
- Stage transitions write a `StageHistory` row (who, from→to, when, why).
- Webhook failure payloads → dedicated error table + team Slack alert (Part 18).

## Part 13 — Sales-to-Delivery Handoff Protocols

Sales must supply, before handoff: **approved statement of work**, **verified technical
requirements**, **primary contacts**, and **access credentials**.

Then: joint **sales-to-delivery review meeting** → kick-off call scheduled **within 3
business days** of contract signing → initial roadmap delivered **within 5 business days**.
Work begins only after the **initial deposit clears** (Part 19).

## Part 14 — Client Retention & Expansion Loops

- **Retention:** monthly delivery rhythm, bi-weekly pipeline reviews with growth team,
  onboarding playbook reuse (the same playbook sold as a lead magnet).
- **Expansion triggers:** project completion + satisfaction → upsell adjacent services;
  quarterly growth-score review; renewal priced against verified metrics—without promises.
- **Churn guardrail:** exceed 85% staff capacity → pause outbound; inbound leads go to a
  **waitlist with clear delivery timelines**.

## Part 15 — Formal Referral Mechanisms

- **Partner commission:** 10% of the initial invoice value, extended to **5% across the
  first three months** of billed work for multi-month contracts.
- Partner agencies receive declined-but-valid leads (exclusivity and fit exceptions).
- Referral source is tracked as a lead source and counts toward attribution credit.

## Part 16 — Agency Unit Economics Metrics

Tracked per campaign and aggregate:
- Cold response rate, discovery booking rate, qualification %, prospect→client velocity
  (days in stage, days to close).
- **LTV:CAC target 3:1** · **CAC cap $1,500 / closed account** · minimum spend floors
  as above.
- **Pause trigger:** any campaign exceeding target CAC over a rolling **30 days** → paused
  for creative review (this is a hard control).
- Bi-weekly reviews inspect open/reply rate; **monthly retrospective** on closing velocity.

## Part 17 — Multi-Touch Attribution Modeling

Weighted model across all touches (not first/last-touch only):
- **Discovery 40%** · **Intermediate touches 20%** · **Final conversion 40%**.

A lead touched by discovery (40), three intermediates (60 combined), and a closing touch
(40) distributes credit across all contributors; referral and partner sources share the
Discovery bucket when they originated the relationship.

## Part 18 — AI & Automation Task Assignments

| Task | Doer | System |
|---|---|---|
| Inbound confirmation + SLA timer | Automated | `api/growth-lead` + email |
| Top-of-funnel content delivery | Automated | 21-day cadence manager |
| Lead scoring | Automated | scoring service (Part 9) |
| Research notes for high-value accounts | AI-assisted, human-approved | CRM AI note |
| Webhook failure payload capture | Automated | `WebhookErrorLog` + Slack |
| Personalized video audits | Human | Manual (high-value only) |
| Campaign CAC pause trigger | Automated alert | Economics monitor find→ human review |

## Part 19 — Deal Structuring & Approvals

- Team may independently: split payment schedules across milestones, or offer **up to
  10% discount** on upfront retainers.
- Larger custom scope or rate reduction → **executive sign-off required**.
- **50% upfront deposit** before kickoff; remaining payments tied to delivery milestones;
  work starts only after the deposit clears.
- SOCA boundary: sales owns through `closed_won`; delivery owns after deposit clears via
  handoff (Part 13).

## Part 20 — Miami Hospitality Reference Case Study (anonymized framework)

**Client:** Boutique Miami hotel group (3 properties) — *identity masked until real
permission is granted.*

- **Challenge:** seasonal demand spikes, inconsistent brand content across properties,
  no repeatable acquisition motion.
- **Engagement:** 6-month media + growth retainer; operational audit; content cadence;
  nurture system for group-sales prospects.
- **What we did (verifiable mechanics only):** branded content system, monthly lead-gen
  media drops, executive-level hospitality brand assets, cross-property consistency playbook.
- **Results (MASKED placeholders to be filled with verified data):**
  - Revenue growth: **+[__]%** · Lead volume: **[__]×** · Media production: **[__] assets/mo**
  - Enterprise testimonial: *"[quoted only after sign-off]"*
- All public claims must come from signed-off, verified figures. Until then the page
  renders the frame with visible [MASKED] markers — no invented numbers.

## Part 21 — System Flow Map

```
Sourcing ──► Capture (form/assets) ──► Routing (Part 6)
   ▲                                        │
   │                                    Score (Part 9)
   │                                        ▼
   └── referral ──── Classic qualification (BANT + floors)
                                        │
                below floor ──► education_drip / referral_out
                    sales-ready ──► 15-min SLA touch ──► discovery (24h owner)
                                        │
                            qualified in CRM ──► proposal (gated)
                                        │
                          negotiation ──► closed_won ──► deposit 50%
                                        │
                        sales→delivery handoff ──► kickoff ≤3d ──► roadmap ≤5d
                                        │
                        retention/expansion loops + attribution + CAC monitor
```

## Part 22 — OpenCode Page Information Architecture (`/grow`)

1. Nav — system, services, case study, results, tools, contact; CTA "Book discovery"
2. Hero — positioning + CTAs (qualification calculator / discovery)
3. Segment strip — three ICP cards
4. Deficiency → system narrative
5. Services & minimums
6. Miami case study (masked)
7. Verified results framework (masked)
8. 21-day cadence explainer
9. Outreach scripts (tabbed, 5 channels)
10. Tools gallery — five interactive tools
11. Guardrails & compliance (CAN-SPAM/GDPR, opt-out, address, no-promise disclosure)
12. Lead capture form (multi-stage) + 15-min SLA note
13. Footer

## Part 23 — Interactive Tool Specifications (Core)

**Qualification Calculator** — unputs: segment, annual revenue, monthly spend, project
budget, authority timeline → verdict: `sales-ready` (BANT + floors), `education_drip`,
`referral`, `out_of_scope`. Displays the rule that fired.

**Scoring Simulator** — toggle behavioral actions (Part 9 table) → live score, tier,
sales-ready flag, and effective BANT status. Readout shows which single action pushes a
lead over a threshold.

## Part 24 — Interactive Tool Specifications (Process)

**Funnel Builder** — sliders per stage (contacted→closed conversion) → waterfall volumes
from a seeded contact base; live CAC per closed account vs **$1,500 cap**; implied
LTV:CAC vs **3:1**; auto "pause for creative review" banner when CAC exceeds cap 30d.

**Follow-Up Planner** — pick channel mix + manual/auto per day → renders the 21-day
sequence with SLA banners (15-min first touch, 24h ownership); auto-inserts removal /
drip branches.

## Part 25 — Interactive Tool Specification (Demonstrator)

**Pipeline Demo** — sample accounts (masked) move through canonical stages; each advance
writes a `StageHistory` line (from→to, actor); attribution bar breaks down 40/20/40 credit
across touches; status tags and ownership shown per card. Read-only simulation, no DB.

---

## Appendices

### A. Prisma models (field-level, database)

```prisma
model GrowthLead {
  id               String   @id @default(uuid())
  accountId        String?
  firstName        String
  lastName         String?
  email            String
  company          String?
  segment          String   // media_agency | luxury_hospitality | corporate_lifestyle | other
  channel          String   // outbound_email | linkedin | inbound_form | referral | network | asset_download
  revenueBucket    String?  // <1M | 1M-5M | 5M-20M | 20M+
  monthlySpend     Int?
  projectBudget    Int?
  decisionTimeline String?  // <30days | 30-90days | 90days+
  serviceInterest  String?
  message          String?
  score            Int      @default(0)
  tier             String   @default("cold")  // cold | engaged | hot | sales_ready
  status           String   @default("new")
  ownerId          String?
  lastTouchAt      DateTime?
  consent          Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  histories        StageHistory[]
}

model Account {
  id                  String   @id @default(uuid())
  name                String
  industry            String   // media_agency | luxury_hospitality | corporate_lifestyle | other
  annualRevenue       Int?
  primaryContactName  String?
  primaryContactEmail String?
  decisionMakerRole   String?
  currentTools        String   @default("[]")  // JSON array
  marketingSpend      Int?
  quarterlyTarget     String?
  exclusivityAgreement Boolean @default(false)
  status              String   @default("new")
  ownerId             String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  leads               GrowthLead[]
}

model StageHistory {
  id        String     @id @default(uuid())
  leadId    String
  lead      GrowthLead @relation(fields: [leadId], references: [id], onDelete: Cascade)
  fromStage String?
  toStage   String
  actorId   String?
  reason    String?
  createdAt DateTime   @default(now())
  @@index([leadId])
}

model EmailLog {
  id        String   @id @default(uuid())
  leadId    String?
  recipient String
  subject   String?
  campaign  String?
  status    String   // queued | sent | opened | clicked | bounced | opted_out
  sentAt    DateTime @default(now())
}

model WebhookErrorLog {
  id             String  @id @default(uuid())
  source         String
  method         String?
  path           String?
  requestBody    Json?
  statusCode     Int?
  errorMessage   String?
  slackAlerted   Boolean @default(false)
  createdAt      DateTime @default(now())
}

model Campaign {
  id                  String   @id @default(uuid())
  name                String
  segment             String?
  status              String   @default("active") // active | paused_review | archived
  totalSpendCents     Int      @default(0)
  closedAccounts      Int      @default(0)
  cacCents            Int?
  pauseTriggeredAt    DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

`GrowthLead`, `Account`, and `StageHistory` satisfy the "Leads, Accounts, and
StageHistories" requirement. The MVP landing page ships `GrowthLead` only; run
`npm run db:push` before first live use, and `npx prisma generate` after schema edits.

### B. Attribution formula implementation

```
credit(channel) = (discovery? 0.4 : 0) + (sum of intermediate touches) * 0.20
                 + (closing touch? 0.4 : 0)
```

### C. Confirmation log (assumptions made explicit)

| Item | Resolution |
|---|---|
| Never promise outcomes/timelines/guarantees | Confirmed firm |
| Ask one clarifying question + restate on vague input | Confirmed firm |
| Annual revenue floor | $1M+ (user-confirmed) |
| CAC cap $1,500; $3,000/mo; $10,000 project | Firm (user-confirmed) |
| Case study / verified results | Anonymized framework with [MASKED] markers |
| Audience "corporate lifestyle" | Defined as executive-level brand/media/events/hospitality |
| Deliverable | Landing page (`/grow` in this Next.js repo) + this spec doc |
| Existing infra | Do not rebuild platform landing, portals, or public/api patterns |

### D. Phased delta plan

- **Phase 1 (this doc):** conceptual framework, definitions, thresholds, channel scripts.
- **Phase 2 (this doc):** CRM data models, stage logic, attribution formulas, handoff.
- **Phase 3 (implemented in repo):** OpenCode page spec + `/grow` page + five tools +
  `api/growth-lead` endpoint + `GrowthLead` model.

### E. Changelog note

Version bump and `CHANGELOG.md` update are intentionally **not** performed (per repo
rules this requires explicit authorization).