# Creative Talent Operations

**WhoIsDésir® Media Agency — Operating Policy and System of Record**

| Field | Value |
|---|---|
| Document ID | CTO-000 |
| Version | 1.0 (proposal) |
| Status | Awaiting Lead Developer approval |
| Owner | Creative Talent Operations Lead |
| Approver | Lead Developer / Agency Principal |
| Last verified | 2026-11-06 |
| Repository | `C:\Users\sebas\Desktop\Projects\widmediaagency` |
| Branch at audit | `feat/growth-landing-page` |

> **Change control:** This document describes both the **current state** and the **target state**. Nothing in the target-state sections is authorized for implementation until the Lead Developer approves the roadmap in `docs/talent-operations/14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md`. No application code, database schema, deployment, Firebase/Auth configuration, or Git history may be changed before that approval.

---

## 1. Purpose

This is the durable operating reference for how WhoIsDésir® sources, evaluates, contracts, onboards, staffs, manages, and retains creative talent across four verticals:

1. **Photography**
2. **Videography**
3. **Content & Social**
4. **Design & Creative**

It exists so that a human operations assistant, an AI assistant, or a future engineering team can make consistent decisions without re-deriving policy from chat history. It is written to be usable by a non-engineer while remaining traceable to code.

---

## 2. Evidence convention

Every current-state statement in the audit and reference documents carries one of these labels:

| Label | Meaning |
|---|---|
| `CONFIRMED` | Directly verified in the repository at the cited path and line, or by a deterministic filesystem/git check. |
| `LIKELY` | Strongly implied by code, schema, or documentation, but not exercised end-to-end in this audit. |
| `UNKNOWN` | Not observable from the local repository (for example, deployed environment variables or production data). |
| `PROPOSED` | Target-state design. Not current behavior. Requires approval. |

Paths are relative to the repository root. Line numbers refer to the state of the files on 2026-11-06.

---

## 3. Non-negotiable principles

1. **A human owns every consequential decision.** The assistant may prepare, draft, score, remind, and route. It may not promise employment, set compensation, sign contracts, make a hiring decision, share private data, or validate an unverified project lead.
2. **The database is the system of record; chat is not.** A decision that is not written to the platform (or to the approved fallback log) did not happen.
3. **Reuse before build.** The platform already contains auth, roles, audit logging, rate limiting, SOWs, contracts, signatures, deliverables, training, notifications, Google Drive storage, and a growth-lead pipeline. New paid SaaS is out of scope unless no viable path exists.
4. **Deterministic before generative.** Scoring, routing, reminders, and SLA calculations must work without an LLM. AI is an optional layer behind an adapter, never a dependency for correctness.
5. **Least data, least access, least surprise.** Collect only what a decision needs. Scope every query to the agency and the actor. Prefer aggregated feedback over raw personal data.
6. **Every automated action is reversible or reviewable.** If an automation cannot be undone, it must require human approval before it executes.
7. **Silence is failure.** Every inbound application, assignment, and approval request has an owner, a deadline, and an escalation path.

---

## 4. System of record and truth hierarchy

When sources disagree, resolve in this order:

1. `prisma/schema.prisma` — the data contract.
2. Route handlers under `src/app/api/**/route.ts` — the enforced behavior.
3. `src/lib/*` — shared business rules (lifecycle, auth, scoring, training).
4. This document and `docs/talent-operations/*`.
5. `AGENTS.md` and older `docs/*` files — historical context only.

**Known documentation drift:** `AGENTS.md` states 26 Prisma models and 37 API route files (`AGENTS.md:21`, `AGENTS.md:28`), but the repository contains **41 models** (`prisma/schema.prisma:11-813`) and **62 API route files**. It also states the branch is `main` (`AGENTS.md:5`) and that ESLint is not configured (`AGENTS.md:16`); the checked-out branch is `feat/growth-landing-page`, and `.eslintrc.json` plus an ESLint dependency exist (`package.json:50`, `.eslintrc.json:1-22`). `docs/SESSION_HANDOFF.md:54` says Vitest is configured but empty; four test files now exist under `tests/`. These are `CONFIRMED` discrepancies, not operational failures.

---

## 5. Role taxonomy

### 5.1 Platform roles (authentication)

`admin`, `staff`, `contractor`, `client`, plus extended staff-side roles `manager`, `reviewer`, `developer`, `intern` (`prisma/schema.prisma:33`; `src/lib/auth.ts:147-191`). These control access. They are **not** the same as creative disciplines.

### 5.2 Creative disciplines (delivery)

The contractor intake UI exposes 12 creative roles (`src/app/contractors/new/page.tsx:7-20`). The training configuration defines **13** role keys, adding `developer-intern` (`src/lib/role-training-config.ts:7-73`). The contract system defines 12 role-specific addenda (`src/data/addenda.ts:21-189`).

| Vertical | Canonical roles | Training key | Addendum |
|---|---|---|---|
| Photography | `photography` | `photography` | Photography Addendum |
| Videography | `videography`, `podcast-editor`, `motion-designer` (shared) | `videography` | Videography Addendum |
| Content & Social | `social-media`, `copywriter`, `marketing-specialist` | `social-media` | Social Media Management Addendum |
| Design & Creative | `designer`, `web-designer`, `motion-designer` | `designer` | Graphic Design Addendum |
| Adjacent technical | `developer`, `developer-intern`, `ai-automation`, `virtual-assistant` | `developer` / `ai-automation` | Developer / AI Automation Addendum |

**Gap:** `developer-intern` exists in training but is not offered in contractor creation (`src/app/contractors/new/page.tsx:7-20`). This is `CONFIRMED` and should be resolved by adding it to the intake list or removing the orphan key.

### 5.3 Seniority and engagement type

The schema does not store seniority, years of experience, or engagement preference on `Contractor` (`prisma/schema.prisma:53-78`). Seniority is therefore `UNKNOWN` at the record level and must be captured in the target design. Engagement type is captured per SOW as `hourly | half-day | full-day | project | monthly-retainer` (`prisma/schema.prisma:109`).

---

## 6. End-to-end lifecycle

```
SOURCE → APPLY → SCREEN → EVALUATE → INTERVIEW → VERIFY → DECIDE
   → CONTRACT → ONBOARD → TRAIN → STAFF → DELIVER → QA
   → PAY → REVIEW → RETAIN / BENCH / OFFBOARD
```

Each stage has an owner, a queue, an SLA, and an approval gate. The detailed map is in `docs/talent-operations/04_TALENT_JOURNEY_AND_SLA_MAP.md`.

A **demand-side** journey runs in parallel and feeds the talent journey:

```
LISTING → VERIFY → QUALIFY → REQUIREMENTS → SHORTLIST → SELECT → OFFER → PROJECT
```

No talent is contacted, and no availability is held, until the requirements are confirmed and a human has reviewed the shortlist. An unverified listing is never presented to talent as an approved project.

The eleven automation areas from the master assignment map to the work as follows: **A** inquiry intake, **B** acknowledgment and information collection, **C** categorization and qualification, **D** portfolio and experience review, **E** project listing discovery, **F** project requirement extraction, **G** talent-to-project matching, **H** follow-up reminders, **I** application status tracking, **J** administrative reporting, **K** exception detection and escalation. Downstream contract, onboarding, delivery, and performance work is specified as L1–L4 in the appendix of `03_AUTOMATION_OPPORTUNITY_REPORT.md`.

### 6.1 Current-state reality

- **Source/Apply:** No public talent application page or API exists. The public pages are the agency site, speaker booking, plugin lead capture, growth landing page, proposal builder, and login (`src/app/**/page.tsx` inventory; `src/middleware.ts:10`). `CONFIRMED`.
- **Screen/Evaluate:** No applicant, skills, portfolio, or scorecard model exists. `PortfolioItem` is an internal developer-portfolio artifact (`prisma/schema.prisma:626-654`), not a talent record. `CONFIRMED`.
- **Interview:** No interview or scheduling model for talent. Messages carry optional calendar event fields (`prisma/schema.prisma:265-269`), but there is no talent interview workflow. `CONFIRMED`.
- **Verify:** Tax form, insurance, and licensing URLs exist on `Contractor` (`prisma/schema.prisma:61-64`), and uploads are whitelisted (`src/app/api/contractors/[id]/upload/route.ts`). There is no verification state machine or expiry tracking. `CONFIRMED`.
- **Decide:** Role approval is admin-only and auto-assigns training (`src/app/api/contractors/[id]/roles/[roleId]/route.ts:28-80`). There is no explicit hiring decision record or rejection reason taxonomy. `CONFIRMED`.
- **Contract:** SOW creation and contract assembly exist (`src/app/api/sows/route.ts:7-48`; `src/app/api/contracts/assemble/route.ts:49-102`). Assembly requires the SOW to be `approved` or `active` (`assemble/route.ts:73-74`). `CONFIRMED`.
- **Onboard/Train:** `contractor-onboarding` is auto-assigned when a login is generated (`src/app/api/contractors/[id]/login/route.ts:85-114`), and role lessons are assigned on role approval (`roles/[roleId]/route.ts:8-26,58-60`). `CONFIRMED`.
- **Staff/Deliver:** `ProjectTask` and `Deliverable` assignment exist (`prisma/schema.prisma:194-215`, `304-336`). There is no availability or capacity check before assignment. `CONFIRMED`.
- **QA:** The deliverable lifecycle enforces role-based transitions and admin-only final approval (`src/lib/deliverable-lifecycle.ts:43-83`). `CONFIRMED`.
- **Pay:** `Invoice` is client-facing (`prisma/schema.prisma:338-351`); contractor payment is described in SOW terms but there is no contractor payout record. `CONFIRMED`.
- **Review/Retain:** There is no talent performance review, reliability score, or bench record. `CONFIRMED`.
- **Demand side (listing → requirements → shortlist):** `GrowthLead`, `Prospect`, and `BookingInquiry` capture demand signals, but there is no opportunity record linking a listing to requirements, a shortlist, or a staffing decision, and `GrowthLead` has no admin GET route (`src/app/api/growth-lead/route.ts` exports POST only). `CONFIRMED`.

---

## 7. Human-in-the-loop authority matrix

The assistant may act autonomously only in the left column. Everything in the right column requires a named human.

| Assistant may do autonomously | Human approval required |
|---|---|
| Acknowledge receipt of an application with an approved template | Promise or imply employment, engagement, or a specific volume of work |
| Create a draft applicant record and dedupe by email | Advance an applicant to "approved talent" |
| Compute a deterministic portfolio score from a rubric | Override a failed portfolio score |
| Schedule an interview within published availability | Make a hiring or rejection decision |
| Send reminders for missing documents | Accept a rate, retainer, or payment term |
| Assemble a draft SOW from approved rate rules | Send or sign a contract |
| Assign approved training lessons | Waive a required training or compliance step |
| Route a deliverable to the correct reviewer | Grant final approval or close a deliverable |
| Flag a late deliverable and notify the owner | Cancel a deliverable or reassign a contractor |
| Draft a performance summary from recorded facts | Issue a rate change, warning, or termination |
| Share a portfolio link that the talent marked public | Share private data, IDs, tax forms, or client-confidential material |
| Log a project lead as unverified | Treat an unverified lead as a confirmed engagement |

**Hard stops:** compensation, contracts, hiring decisions, private-data sharing, and unverified project leads. These five categories may never be executed by an automation, regardless of confidence.

---

## 8. Data classification

| Class | Examples | Storage rule | Sharing rule |
|---|---|---|---|
| Public | Published reel, public portfolio URL, role title | May be indexed | Share freely with consent |
| Internal | Applicant score, interview notes, availability | Platform DB only | Ops team only |
| Confidential | Rates, contract terms, client feedback | Platform DB; audit every read of exported data | Need-to-know; never in chat |
| Restricted | Tax IDs, tax forms, insurance, licensing, government ID, bank details | Encrypted storage / Drive restricted folder; never in AI prompts | Owner + Principal only; legal basis required |

The current schema stores tax form and licensing **URLs**, not the documents themselves (`prisma/schema.prisma:61-64`). Document contents live in Google Drive via the service account (`src/lib/driveService.ts`). `UNKNOWN`: bucket-level encryption, retention, and access logging in the deployed Drive/Supabase environment.

---

## 9. Automation governance

The assistant operates on **queues**, not on an inbox. Each queue item has:

- a stable ID,
- an owner,
- a due timestamp,
- a state,
- an evidence link,
- an escalation target.

Automations A–K are specified in `docs/talent-operations/03_AUTOMATION_OPPORTUNITY_REPORT.md`. Every automation must define: trigger, inputs, action, reused components, fallback, human approval gate, and failure detection. An automation without all seven is not approved for build.

**Kill switch:** every automation reads a single `TALENT_AUTOMATION_ENABLED` flag (proposed). When false, the system falls back to queue-only manual mode. The flag must be changeable without a deploy.

---

## 10. AI assistant rules

1. **No invented facts.** If a field is empty, say "not recorded" and open a task. Never infer a rate, availability, or credential.
2. **No commitments.** Never write "we'd love to hire you", "your rate is approved", "the contract is signed", or "the project is confirmed" unless a human recorded that decision.
3. **Cite the record.** Every summary links to the applicant, contractor, SOW, or deliverable ID it came from.
4. **Separate observation from judgment.** "Reel is 48 seconds; brief asked for 30–60" is observation. "Strong candidate" is judgment and must be attributed to a rubric or a human.
5. **Escalate ambiguity.** A missing document is a task. A conflict between sources is an escalation, not a guess.
6. **Protect restricted data.** Never paste tax forms, IDs, bank details, or client-confidential briefs into a model prompt. Use the field-level redaction list in `13_SECURITY_AND_APPROVAL_POLICY.md`.
7. **Draft, don't send.** Outbound email to talent or clients is drafted for human review until the template and sender are explicitly approved.

The full prompt library is `docs/talent-operations/11_AI_ASSISTANT_PROMPT_LIBRARY.md`.

---

## 11. Service levels

| Event | First response | Decision | Escalate after |
|---|---|---|---|
| New talent application | 2 business days | 7 business days | 3 business days with no owner |
| Portfolio review requested | 3 business days | 5 business days | 2 days past due |
| Interview request | 2 business days | 5 business days | 1 day past proposed slot |
| Document request (tax/insurance/licensing) | same day | 5 business days | 2 days before contract assembly |
| Contract assembly request | 1 business day | 2 business days | 1 day past due |
| Deliverable assignment | same day | — | 4 hours before start |
| Deliverable review | 2 business days | 3 business days | 1 day past due |
| Revision request | 1 business day | per SOW | 2 days past due |
| Payment question | 1 business day | 3 business days | 5 days past due |
| Offboarding request | 2 business days | 5 business days | 1 day past due |

The agency default response time is stored in `Agency.responseTimeDefault` with a default of "24 business hours" (`prisma/schema.prisma:16-17`), but it is not currently applied to talent workflows. `CONFIRMED`.

---

## 12. Operating cadence

| Cadence | Ritual | Output |
|---|---|---|
| Daily (15 min) | Queue stand-up: new applications, overdue reviews, at-risk deliverables | Owner assigned to every red item |
| Weekly (45 min) | Talent pipeline review: applicants, interviews, decisions, bench | Decisions recorded; no silent aging |
| Weekly (30 min) | Delivery risk review: late deliverables, revision loops, client blockers | Recovery plan per red deliverable |
| Bi-weekly (30 min) | Rate and margin review | Approved rate changes only |
| Monthly (60 min) | Roster health: utilization, reliability, retention risk | Bench/offboard list |
| Quarterly | Policy review: rubric calibration, SLA performance, automation failures | Updated policy version |

---

## 13. Key performance indicators

| KPI | Definition | Initial target |
|---|---|---|
| Time to first response | Application received → first human/approved-template reply | ≤ 2 business days |
| Time to decision | Application received → approve/reject/hold recorded | ≤ 7 business days |
| Application completion rate | Submitted / started | ≥ 70% |
| Portfolio pass rate | Meets rubric threshold / reviewed | Tracked, not targeted |
| Interview-to-approval rate | Approved / interviewed | Tracked |
| Contract assembly time | SOW approved → contract ready | ≤ 2 business days |
| Onboarding completion | Hired → training 100% + documents verified | ≤ 10 business days |
| Assignment fill rate | Assignments filled within SLA / requested | ≥ 90% |
| On-time delivery | Deliverables submitted by due date | ≥ 90% |
| First-pass approval | Approved without revision / submitted | ≥ 70% |
| Revision loops | Average revision rounds per deliverable | ≤ 1.5 |
| Talent retention | Active at 90 days / hired | ≥ 80% |
| Automation failure rate | Runs ending in fallback / total runs | < 2% |
| Data incidents | Confirmed restricted-data exposures | 0 |

No analytics infrastructure exists to compute these automatically today. `CONFIRMED` by absence of any reporting model or scheduled job; `vercel.json:1-12` contains no cron configuration, and the only polling is the client-side notification bell every 30 seconds (`src/components/NotificationBell.tsx:35`).

---

## 14. Decision records required

Every consequential decision must be recorded with:

- decision type (advance, hold, reject, approve role, approve rate, assemble contract, assign, final-approve, offboard),
- actor (human user ID),
- timestamp,
- evidence (portfolio score, interview notes, document IDs),
- reason code,
- next action and owner.

`AuditLog` already records actor, action, entity, and metadata (`src/lib/audit.ts:14-31`; `prisma/schema.prisma:481-498`), but it is a technical audit trail, not a decision log. The target design adds a typed decision record; see `12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md`.

---

## 15. Change control

1. Any change to this policy requires a new version and a changelog entry.
2. Any schema or route change requires Lead Developer approval and the acceptance criteria in `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md`.
3. No automation may be enabled in production before a dry run against seeded data and a documented kill-switch test.
4. No new paid vendor may be introduced without a written reuse analysis showing that the existing stack cannot meet the need.

---

## 16. Document index

The master assignment requires 16 deliverables. The map from each required deliverable to its primary document is in `docs/talent-operations/00_README_AND_INDEX.md` §2.

| # | Document | Purpose |
|---|---|---|
| 1 | `CREATIVE_TALENT_OPERATIONS.md` (this file) | Durable policy and system of record |
| 2 | `docs/talent-operations/00_README_AND_INDEX.md` | Suite index, master deliverable map, reading order |
| 3 | `01_APPLICATION_AUDIT.md` | Evidence-tagged current-state audit and findings F-01–F-20 |
| 4 | `02_BUSINESS_PROCESS_ANALYSIS.md` | Current vs target workflows by vertical |
| 5 | `03_AUTOMATION_OPPORTUNITY_REPORT.md` | Automations A–K with seven required fields each |
| 6 | `04_TALENT_JOURNEY_AND_SLA_MAP.md` | Stage, owner, SLA, escalation map |
| 7 | `05_ASSISTANT_OPERATIONS_MANUAL.md` | Operating manual and daily routine |
| 8 | `06_WEBINAR_PRESENTATION_AND_SCRIPT.md` | Verbatim webinar script and slide plan |
| 9 | `07_TALENT_SOURCING_AND_VETTING_PLAYBOOK.md` | Sourcing, screening, verification |
| 10 | `08_PORTFOLIO_AND_REEL_EVALUATION_FRAMEWORK.md` | Rubric and scoring method |
| 11 | `09_RATE_CARD_AND_NEGOTIATION_FRAMEWORK.md` | Rate logic and negotiation guardrails |
| 12 | `10_ONBOARDING_AND_QUALITY_CONTROL_PLAYBOOK.md` | Onboarding, QA, revision, offboarding |
| 13 | `11_AI_ASSISTANT_PROMPT_LIBRARY.md` | Approved prompts and output schemas |
| 14 | `12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` | Reuse-first architecture and proposed schema |
| 15 | `13_SECURITY_AND_APPROVAL_POLICY.md` | Data handling, access, approval gates |
| 16 | `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md` | Phases, files, risks, tests, acceptance |
| 17 | `15_TALENT_INQUIRY_RESPONSE_LIBRARY.md` | Approved inquiry and status templates |
| 18 | `16_PROJECT_LISTING_EVALUATION_PLAYBOOK.md` | Opportunity scoring, verification, red flags |
| 19 | `17_TALENT_QUALIFICATION_FRAMEWORK.md` | Four gates, bands, confidence, disqualifiers |
| 20 | `18_TALENT_MATCHING_DECISION_FRAMEWORK.md` | Eligibility, ranking, shortlists, overrides |
| 21 | `19_ASSISTANT_TRAINING_CURRICULUM.md` | Ten modules, scenarios, assessment, certification |
| 22 | `20_CURRENT_FUNCTIONALITY_INVENTORY.md` | Models, routes, pages, forms, jobs, AI, tests |
| 23 | `21_TESTING_AND_ACCEPTANCE_CRITERIA.md` | Test strategy, matrix, acceptance, sign-off |
| 24 | `22_DATABASE_AND_INTEGRATION_RECOMMENDATIONS.md` | Schema additions, indexes, integrations, cost |

---

## 17. Approval block

This document is complete as a **proposal**. Implementation is intentionally paused.

- [ ] Lead Developer has read the audit and roadmap.
- [ ] Lead Developer approves the target architecture and data model.
- [ ] Lead Developer approves Phase 1 scope and acceptance criteria.
- [ ] A named human owner is assigned to each automation A–K.
- [ ] A dry-run dataset and rollback plan are approved.

**Approval record:** Phase 0 only was approved on 2026-11-07 by the Lead Developer (repo owner, in-session). Questions 1–10 in `docs/talent-operations/14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md` §16 and Phases 1–8 remain deferred.

**Do not begin application code, schema, or deployment changes beyond the approved Phase 0 scope until every box above is checked.**
