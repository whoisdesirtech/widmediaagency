# 03 — Automation Opportunity Report (A–K)

**Purpose:** Define the eleven automation areas named in the master assignment, in the order the business actually operates: inquiry → acknowledgment → qualification → review → opportunity → requirements → matching → follow-up → status → reporting → escalation.
**Rule:** An automation is approved for build only when all seven fields are defined: **Trigger, Inputs, Action, Components, Missing-information behavior, Human approval gate, Failure detection.**
**Status:** All items are `PROPOSED`. None are implemented. Current-state claims cite the repository.

**Evidence labels:** `CONFIRMED` = verified at the cited path and line. `LIKELY` = strongly implied, not exercised. `UNKNOWN` = not observable locally. `PROPOSED` = target state.

---

## 0. Scoring and sequencing

| Area | Name | Impact | Effort | Risk if wrong | Reuse | Phase |
|---|---|---|---|---|---|---|
| A | Talent inquiry intake | 5 | 2 | 4 | 5 | 1 |
| B | Acknowledgment and information collection | 5 | 3 | 4 | 4 | 1 |
| C | Talent categorization and qualification | 5 | 3 | 4 | 4 | 2 |
| D | Portfolio and experience review assistance | 5 | 3 | 4 | 4 | 2 |
| E | Project listing discovery | 4 | 3 | 3 | 3 | 3 |
| F | Project requirement extraction | 4 | 3 | 4 | 4 | 3 |
| G | Talent-to-project matching | 5 | 4 | 4 | 3 | 4 |
| H | Follow-up reminders | 4 | 2 | 3 | 4 | 4 |
| I | Application status tracking | 4 | 2 | 3 | 4 | 2 |
| J | Administrative reporting | 3 | 2 | 2 | 4 | 7 |
| K | Exception detection and management escalation | 5 | 2 | 5 | 4 | 7 |

**Sequencing logic:** A → B → C → D → I creates a trustworthy talent front door and a record of decisions. E → F → G connects real opportunities to qualified people. H keeps both sides from going silent. J and K make the system observable and safe. Downstream contract, onboarding, delivery, and performance work is specified in the appendix; it reuses existing platform flows and is not part of A–K.

**Current-state baseline (all `CONFIRMED` by inspection):**

- No public talent application page or API; no `Applicant`/`Talent` model (`01_APPLICATION_AUDIT.md`).
- No talent-facing email; four routes create their own nodemailer transport and only notify internal addresses.
- No scheduler or cron (`vercel.json:1-12` has no `crons`); no queue model.
- No AI SDK (`package.json:24-38`); one deterministic scoring library exists (`src/lib/growth.ts:54-146`).
- Client-side lead capture exists (`GrowthLead`, `prisma/schema.prisma:453-479`; `Prospect`, `:389-410`) but has no admin GET/UI.
- Project execution exists (`SOW`, `Project`, `Deliverable`) but there is no opportunity or listing model.

---

## A. Talent inquiry intake

### A.1 Trigger

A person expresses interest in working with the agency through any channel: the public form, a referral email, an Instagram/LinkedIn DM, a portfolio-site contact form, or an event conversation entered by staff.

### A.2 Inputs

- Name, email, phone (optional), city, country, timezone
- Primary discipline: Photography, Videography, Content & Social, Design & Creative
- Secondary disciplines, years of experience, seniority
- Portfolio URL, reel URL, LinkedIn URL
- Availability start, weekly capacity, rate expectation and rate type
- Source and source detail
- Consent to store and review the application

### A.3 Action

1. Validate required fields and normalize email (lowercase, trim).
2. Apply the public rate limit and honeypot check.
3. Create an `Applicant` with a non-sequential public reference (`WID-T-YYYY-NNNN`).
4. Record the consent version and timestamp.
5. Deduplicate by normalized email; flag a possible duplicate instead of merging.
6. Create a `TalentQueueItem` of type `application`, owner Ops Lead, due in 2 business days.
7. Emit `ApplicantEvent` `received` and an `AuditLog` row.
8. Notify the Ops Lead in-app.

### A.4 Components

- New `/apply` page using the existing design system.
- New `POST /api/talent/apply` route, modeled on `src/app/api/booking/route.ts` and `src/app/api/growth-lead/route.ts` (validation + DB write + internal notification).
- Existing `rateLimit` (`src/lib/rateLimit.ts:11-27`), `logAudit` (`src/lib/audit.ts:14-31`), `createNotification` (`src/lib/notifications.ts:11-26`).
- Prisma `Applicant`, `ApplicationAsset`, `ApplicantEvent`, `TalentQueueItem` (`12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` §4).
- CSRF: add the route to the deliberate public list only if a token cannot be supplied (`src/middleware.ts:10`).

### A.5 Missing-information behavior

- Required field missing: reject with a typed field error; do not create a partial record.
- Portfolio/reel missing: accept the application but mark `evidenceIncomplete = true` and open a "request samples" task.
- Email undeliverable: keep the record, mark `emailStatus = bounced`, and open a manual contact task.
- Duplicate suspected: create the record with `status = duplicate` and link `duplicateOfId`; a human merges.

### A.6 Human approval gate

None to create a record. The assistant may not promise review timing beyond the published SLA, and may not imply selection.

### A.7 Failure detection

- Route 5xx rate > 1% over 15 minutes.
- Applications created without an `ApplicantEvent` (integrity query).
- Queue items with no owner or no due date.
- Submission spike beyond the rate-limit threshold.

---

## B. Automated acknowledgment and information collection

### B.1 Trigger

`Applicant` created, or an application moved to `triage_hold` because evidence is missing.

### B.2 Inputs

- Applicant reference, first name, discipline, submitted links
- Approved template ID and version
- Missing-field list from triage
- Sender identity and monitored reply-to

### B.3 Action

1. Send an acknowledgment within minutes: reference, what happens next, realistic timeline, how to add missing material, how to withdraw.
2. Record `EmailLog` with template ID and status.
3. Move the applicant to `acknowledged` and write an event.
4. If information is missing, send a single consolidated request listing exactly what is needed (no drip of one email per field).
5. Schedule one follow-up at 5 business days; stop on response or withdrawal.
6. On receipt, attach assets, update completeness, and return the item to the queue.

### B.4 Components

- New `src/lib/email/` adapter: one transport, typed templates, `EmailLog`, retry with backoff (`12_...md` §9).
- Existing nodemailer dependency; replace four ad-hoc transports over time.
- `ApplicationAsset` for uploads, Google Drive via `src/lib/driveService.ts`.
- `TalentQueueItem` for the missing-info task.

### B.5 Missing-information behavior

- SMTP unavailable: queue the email as `draft`/`failed`, keep the applicant in `received`, surface a visible failed-send queue. Never log the message body or any secret.
- No reply after two attempts: mark `no_response`, notify Ops Lead, do not auto-decline.
- Partial upload: accept what arrived, list what is still missing, keep one open task.

### B.6 Human approval gate

The acknowledgment and missing-information templates are approved once by the Lead Developer, then may send automatically. Any new template, tone change, or commitment language requires re-approval. Decline, advance, rate, and contract messages are **not** in this automation.

### B.7 Failure detection

- `EmailLog` failures > 5% over 1 hour.
- Applicant `acknowledged` with no `EmailLog` row.
- Open information requests older than 5 business days.
- Bounce rate spike.

---

## C. Talent categorization and qualification

### C.1 Trigger

Application acknowledged and evidence complete enough to evaluate, or a staff member creates a talent record from a referral.

### C.2 Inputs

- Declared discipline, secondary disciplines, seniority, years of experience
- Portfolio and reel evidence
- Location, timezone, travel radius, remote preference
- Availability and capacity
- Rate expectation
- Verification status (identity, references, documents)
- Qualification criteria per vertical (`17_TALENT_QUALIFICATION_FRAMEWORK.md`)

### C.3 Action

1. Normalize discipline to the four service categories and a controlled skill list.
2. Assign seniority from evidence, not self-description alone; record confidence.
3. Run hard gates: portfolio reachable, role match, geography eligibility, consent, no disqualifier.
4. Compute a deterministic qualification band: `qualified`, `qualified_with_gaps`, `not_yet`, `ineligible`.
5. Record `TalentReview` with evidence notes and a recommendation (`advance`, `hold`, `decline`).
6. Route to portfolio review (D) when the band is not `ineligible`.
7. Open a queue item for any missing gate evidence.

### C.4 Components

- New `src/lib/talent/qualification.ts`, patterned on the deterministic scoring in `src/lib/growth.ts:54-146`.
- Prisma `TalentReview`, `TalentReviewScore`, `TalentSkill`.
- Existing `ContractorRole` taxonomy (`prisma/schema.prisma:500-511`) and 13 role keys (`src/lib/role-training-config.ts:7-73`) as the downstream mapping.
- Admin queue UI.

### C.5 Missing-information behavior

- Missing years of experience: infer nothing; mark `unknown` and lower confidence.
- Unreachable portfolio: `qualified_with_gaps`, request a working link.
- Ambiguous discipline: assign the declared primary, flag for human confirmation.
- Conflicting seniority claims: hold for review; never silently upgrade.

### C.6 Human approval gate

Categorization is advisory. A human confirms the primary discipline and seniority before the applicant advances. The band is a recommendation; only an admin records a final decision.

### C.7 Failure detection

- Band distribution drift week over week.
- Reviews without evidence notes.
- Applicants in `in_review` beyond the SLA.
- Role keys not present in the approved taxonomy.

---

## D. Portfolio and experience review assistance

### D.1 Trigger

Qualification band is `qualified` or `qualified_with_gaps`, or a reviewer requests a re-score.

### D.2 Inputs

- Portfolio assets, reel, case studies, public links
- Role on each piece and whether ownership is clear
- Client names only where rights permit
- Rubric version and weights per vertical (`08_PORTFOLIO_AND_REEL_EVALUATION_FRAMEWORK.md`)
- Brief or role context, when the review is for a specific opportunity

### D.3 Action

1. Verify each link resolves and each asset matches the claimed role.
2. Score criteria deterministically: craft, range, relevance, evidence of ownership, presentation, reliability signals.
3. Compute a weighted score, band, and evidence completeness percentage.
4. Write criterion-level notes with links; no unsupported adjectives.
5. Recommend `advance`, `hold`, or `decline`; never write the decision.
6. Route to a second reviewer when the score is within the disagreement band.
7. Ask for accessible samples when the portfolio is behind a login.

### D.4 Components

- `src/lib/talent/rubric.ts` and versioned rubric config.
- `TalentReview` / `TalentReviewScore`; `ApplicationAsset`.
- Optional AI drafting behind `TALENT_AI_ENABLED`; deterministic path is authoritative (`11_AI_ASSISTANT_PROMPT_LIBRARY.md`).
- Drive for sample storage; no local disk.

### D.5 Missing-information behavior

- Broken link: request a replacement; do not score the missing piece.
- Unclear ownership: cap the ownership criterion and note it.
- Rights unknown: exclude the piece from client-facing sharing.
- No reel for a video role: `qualified_with_gaps`; request one.

### D.6 Human approval gate

A reviewer signs the score. Overrides require a written reason. The assistant may not advance, reject, or contact the candidate about the outcome.

### D.7 Failure detection

- Score variance above the calibration threshold.
- Reviews completed in under the minimum review time.
- Missing evidence notes.
- Rubric version mismatch across reviewers.

---

## E. Project listing discovery

### E.1 Trigger

A new opportunity appears: inbound client inquiry, referral, RFP, partner message, marketplace listing, or a recurring scan of approved sources.

### E.2 Inputs

- Source channel and URL or message
- Client or buyer identity and contact
- Stated scope, deliverables, dates, location, budget signal
- Rights and usage expectations
- Response deadline
- Prior relationship and payment history

### E.3 Action

1. Capture the listing as a `ProjectOpportunity` with source, raw text, and a verification state.
2. Normalize: service category, deliverables, timeline, location/remote, budget range, decision date.
3. Run the listing evaluation playbook (`16_PROJECT_LISTING_EVALUATION_PLAYBOOK.md`): legitimacy, budget authority, scope clarity, rights, timeline, fit, risk.
4. Score and route: `pursue`, `qualify`, `hold`, `decline`, or `unverified`.
5. Create a queue item for the owner with a response deadline.
6. Never present an unverified listing to talent as an approved agency project.

### E.4 Components

- Existing `GrowthLead` (`prisma/schema.prisma:453-479`) and `Prospect` (`:389-410`) as the client-side seed; do not overload them with talent fields.
- New `ProjectOpportunity` and `OpportunitySource` models.
- Manual paste form first; no scraping and no automated outreach without approval.
- Existing notification and audit primitives.

### E.5 Missing-information behavior

- No budget: mark `budget_unknown`; require qualification before matching.
- No named client: `unverified`; do not match or promise work.
- Vague scope: request a written brief; keep in `qualify`.
- Expired deadline: close with a reason; do not recycle silently.

### E.6 Human approval gate

A human confirms the listing is real and the agency is authorized to pursue it before any talent is contacted. The assistant may research and draft, not commit.

### E.7 Failure detection

- Listings older than the response deadline with no owner action.
- Opportunities marked `pursue` without a verified client identity.
- Duplicate listings from multiple sources.
- Source channels with a high decline rate.

---

## F. Project requirement extraction

### F.1 Trigger

An opportunity is marked `qualify` or `pursue`, or a client sends a brief that must become a scope.

### F.2 Inputs

- Client message, brief, RFP, or call notes
- Service category and deliverables
- Dates, duration, location, travel
- Crew size and roles
- Equipment, software, licensing, rights
- Budget and payment terms
- Approval and revision expectations
- Confidentiality constraints

### F.3 Action

1. Extract structured fields into a requirements record with a source quote for each field.
2. Mark each field `confirmed`, `inferred`, or `missing`; never invent a value.
3. Identify conflicts (two dates, two budgets, incompatible rights).
4. Produce a draft scope summary and a list of questions for the client.
5. Map required roles and skills to the talent taxonomy.
6. Hand the confirmed requirements to SOW assembly; keep the draft clearly marked.

### F.4 Components

- New `OpportunityRequirement` model and `src/lib/talent/requirements.ts`.
- Deterministic extraction rules first; optional AI extraction behind the adapter.
- Existing `SOW` fields (`prisma/schema.prisma:104-121`) as the downstream target.
- `src/lib/proposal-generator.ts` as a pattern for document assembly.

### F.5 Missing-information behavior

- Missing budget: block rate discussion; request it.
- Missing dates: block availability hold; request it.
- Ambiguous deliverable count: ask; do not assume a number.
- Conflicting terms: escalate to the owner with both quotes.

### F.6 Human approval gate

A human confirms the extracted requirements before a SOW is assembled or a rate is discussed. Budget, rate, and contract terms are hard stops.

### F.7 Failure detection

- Requirements with no source quote.
- Fields marked `confirmed` without a human confirmation event.
- SOW created from an unconfirmed requirement set.
- Extraction confidence below threshold.

---

## G. Talent-to-project matching

### G.1 Trigger

Requirements confirmed and the opportunity is authorized to staff, or a staffing request is created for an existing project.

### G.2 Inputs

- Required roles, skills, seniority, location, dates, budget band
- Talent skills, verified level, availability, rate band, compliance status
- Reliability and quality history with sample size
- Conflicts: existing bookings, client restrictions, right-to-work
- Matching weights and eligibility rules (`18_TALENT_MATCHING_DECISION_FRAMEWORK.md`)

### G.3 Action

1. Apply hard eligibility filters: role, skill, availability, location/timezone, compliance, conflict.
2. Score eligible talent on skill match, relevant experience, reliability, quality, and utilization balance.
3. Produce a ranked shortlist with a reason and evidence per candidate.
4. Mark `insufficient_data` where history is thin; never rank it as proven.
5. Draft an internal recommendation memo.
6. Create a staffing queue item; a human selects and offers.

### G.4 Components

- New `src/lib/talent/matching.ts` and weights config.
- `TalentProfile`, `TalentSkill`, `TalentAvailability`, `TalentPerformance`, `TalentRate`.
- Existing assignment flow (`Deliverable` assignment; `src/lib/deliverable-lifecycle.ts`).
- Existing notification primitives.

### G.5 Missing-information behavior

- No availability: exclude from the shortlist; request an update.
- No rate band: exclude from budget-sensitive matches.
- No performance history: include with `insufficient_data` and a clear label.
- No eligible talent: return an empty shortlist with a "source talent" task; do not lower the bar silently.

### G.6 Human approval gate

The assistant recommends; a human assigns. No offer, rate, or start date is communicated by an automation. The selected talent must have a confirmed slot and an approved rate.

### G.7 Failure detection

- Shortlists with no eligible candidates.
- Assignments that create availability conflicts.
- Overrides without reasons.
- Match-to-offer conversion tracked but never optimized at the expense of eligibility.

---

## H. Follow-up reminders

### H.1 Trigger

An open item passes a threshold: applicant not acknowledged, information missing, interview not scheduled, client question unanswered, listing deadline near, talent availability stale, or decision pending.

### H.2 Inputs

- Queue item type, owner, due date, last touch
- Contact channel and consent
- Approved reminder template
- Escalation target

### H.3 Action

1. Generate a reminder task for the owner, not a blind email to the candidate.
2. Send a candidate-facing nudge only for approved cases (missing information, interview scheduling, status request) and only once per threshold.
4. Escalate to the next owner when the item is 1 business day past due.
5. Stop all reminders on response, withdrawal, decision, or closure.
6. Record every attempt in `ApplicantEvent` / `EmailLog`.

### H.4 Components

- `TalentQueueItem` with `dueAt`, `slaHours`, `escalatedAt`.
- Dashboard queue and in-app notifications; manual "run scan" action first.
- Vercel Cron only after a measured need (`vercel.json:1-12` has no crons today).
- Existing `createNotification`.

### H.5 Missing-information behavior

- No owner: assign the Ops Lead by default and flag the gap.
- No due date: compute from the SLA table (`04_TALENT_JOURNEY_AND_SLA_MAP.md`).
- No contact consent: internal task only; no outbound message.

### H.6 Human approval gate

Internal reminders need no approval. Candidate-facing reminders use approved templates. No reminder may contain a decision, rate, or commitment.

### H.7 Failure detection

- Items past due with no escalation.
- Duplicate reminders to the same person in 24 hours.
- Reminder volume per owner above a healthy threshold.
- Queue items closed without a note.

---

## I. Application status tracking

### I.1 Trigger

An applicant requests status, or the internal timeline is viewed by staff.

### I.2 Inputs

- Public reference and email (both required)
- Current status, last event, next step, owner
- Consent and retention state

### I.3 Action

1. Verify reference + email; return an identical generic response for any mismatch.
2. Show a plain-language status: received, in review, interview, verification, decision, closed.
3. Show what happens next and the expected date, without promising an outcome.
4. Offer a "withdraw" action.
5. Record the lookup and any message in the timeline.

### I.4 Components

- New `GET /api/talent/apply/status` and a minimal status page.
- `ApplicantEvent` timeline.
- `rateLimit` (20/hour/IP) and enumeration-safe responses.
- No new account system; no password.

### I.5 Missing-information behavior

- Wrong email: same generic response; no hint that the reference exists.
- Unknown reference: same generic response.
- Status stale: show the recorded status and open an internal task; never guess.

### I.6 Human approval gate

None for reading status. Any outbound explanation of a decision must come from the recorded decision and an approved template.

### I.7 Failure detection

- Status page error rate.
- Enumeration attempts (many references from one IP).
- Lookups for applicants whose consent was withdrawn.
- Timeline gaps between status and event.

---

## J. Administrative reporting

### J.1 Trigger

Weekly operations review, monthly roster review, quarterly policy review, or an ad hoc request.

### J.2 Inputs

- Application volume, source, completion rate
- Time to first response and time to decision
- Qualification and portfolio pass rates
- Interview-to-advance rate
- Listing volume, pursuit rate, match fill rate
- On-time delivery, first-pass approval, revision loops
- Automation run status and fallback rate

### J.3 Action

1. Run deterministic queries against the operational tables.
2. Produce a one-page weekly report: volume, SLA breaches, bottlenecks, exceptions.
3. Produce a monthly roster report: utilization, bench, reliability, retention risk.
4. Flag data-quality gaps (missing owners, missing dates, unknown fields).
5. Store the report snapshot and link the query used.

### J.4 Components

- Prisma aggregate queries and SQL views; no new BI vendor.
- Existing admin dashboard patterns (`src/app/api/admin/workforce/route.ts:25-136`).
- Scheduled only after the manual report is used twice.

### J.5 Missing-information behavior

- Missing history: show `insufficient_data`, not zero.
- Missing timestamps: exclude from SLA math and list the gap.
- Conflicting counts: show the source query and reconcile before publishing.

### J.6 Human approval gate

Reports are internal. Any external publication or client-facing metric requires approval. Reports must not contain Restricted data.

### J.7 Failure detection

- Report generation failure.
- Metrics that move more than a defined threshold without an explained cause.
- Reports with missing source links.
- Stale snapshots presented as current.

---

## K. Exception detection and management escalation

### K.1 Trigger

A rule fires continuously or on scan: SLA breach, missing document, stale listing, no-match, conflicting data, hard-stop attempt, duplicate identity, rate exception, capacity conflict, or repeated automation failure.

### K.2 Inputs

- Rule ID, severity, entity, evidence link
- Owner and escalation target
- Prior exceptions for the same entity
- Policy reference (`13_SECURITY_AND_APPROVAL_POLICY.md`)

### K.3 Action

1. Create or update an exception record with severity S1–S4.
2. Assign the correct owner and due date.
3. Notify the owner; escalate one level when overdue.
4. Block the downstream action when the exception is a hard stop.
5. Require a resolution note and a prevention note to close.
6. Feed recurring exceptions into the weekly review.

### K.4 Components

- `TalentQueueItem` with `priority`, `blocked` status, `escalatedAt`.
- `AutomationRun` for failure tracking.
- Existing `createNotification` and `logAudit`.
- Incident procedure in `13_SECURITY_AND_APPROVAL_POLICY.md` §8.

### K.5 Missing-information behavior

- No owner: route to the Ops Lead and flag the configuration gap.
- No evidence: keep open; do not close on assertion.
- Unknown severity: default to S3 and review.

### K.6 Human approval gate

Only a human closes an S1/S2 exception and any exception tied to a hard stop. The assistant may detect, group, notify, and recommend.

### K.7 Failure detection

- Exception created without an owner or due date.
- S1/S2 open beyond the response target.
- Repeated exceptions for the same root cause.
- Hard-stop attempts that were not blocked.

---

## 4. Cross-automation controls

| Control | Rule |
|---|---|
| Kill switch | Every automation reads `TALENT_AUTOMATION_ENABLED`; false = queue-only manual mode, changeable without a deploy. |
| Idempotency | Every create/send/scan uses a stable key so retries do not duplicate records or messages. |
| Audit | Every state change writes a typed record and an `AuditLog` row; failures never block the request but are alerted. |
| PII redaction | Prompts and logs exclude the Restricted fields listed in `13_SECURITY_AND_APPROVAL_POLICY.md` §6.2. |
| Human gates | The five hard stops are enforced in code, not only in policy. |
| Fallback | Every automation has a deterministic path that works with AI disabled and email unavailable. |
| Observability | Every run writes `AutomationRun` with automation, mode, status, fallback reason, duration. |
| Cost | No new paid vendor without a reuse analysis; AI has per-run and per-day caps. |

---

## 5. Build order recommendation

1. **A + B** — intake and acknowledgment. This removes the loudest failure (candidate silence) and creates the data everything else needs.
2. **I** — status tracking. Cheap, and it removes repeat "any update?" messages.
3. **C + D** — qualification and portfolio review. Makes decisions consistent and evidence-based.
4. **E + F** — listing discovery and requirement extraction. Connects demand to the talent pipeline.
5. **G + H** — matching and follow-up. Produces shortlists and prevents stalls.
6. **J + K** — reporting and exceptions. Makes the system observable and safe to scale.
7. **Appendix automations** — contract, onboarding, delivery, performance. Reuse existing flows; do not rebuild them.

---

## Appendix — Downstream lifecycle automations (not A–K)

These were previously labeled A–K in an earlier draft. They remain valid, but they operate **after** a human decision and are not part of the master assignment's eleven areas. They are specified in the roadmap and reuse existing platform primitives.

| ID | Automation | Reuses | Approval gate |
|---|---|---|---|
| L1 | Contract and SOW prefill, assembly, signature tracking | `SOW`, `AssembledContract`, `Signature`, `src/app/api/contracts/assemble/route.ts` | Admin sends; human signs |
| L2 | Onboarding and training orchestration | `TrainingAssignment`, `src/lib/role-training-config.ts`, `computeReadiness` | Admin activates access |
| L3 | Delivery QA, revision routing, deadline escalation | `src/lib/deliverable-lifecycle.ts`, `Deliverable`, `TaskReview` | Admin final approval only |
| L4 | Performance, rate review, retention, offboarding | `TalentPerformance`, `TalentRate`, `RateBand` | Admin approves rates and exits |

Full phase detail: `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md`. Security rules: `13_SECURITY_AND_APPROVAL_POLICY.md`.

---

## 6. What this report does not claim

- It does not claim any automation exists today.
- It does not claim the agency has a project-listing source; E starts with manual capture and approved channels.
- It does not claim AI is required; every area has a deterministic path.
- It does not authorize implementation. Build starts only after Lead Developer approval of the roadmap.
