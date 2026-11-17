# Talent Operations Documentation Suite

**WhoIsDésir® Media Agency**
Version 1.1 (proposal) · 2026-11-07 · Status: awaiting Lead Developer approval

---

## 1. What this suite is

This is a complete, evidence-tagged design for an AI-assisted creative talent operations system covering Photography, Videography, Content & Social, and Design & Creative. It documents what exists today, what is missing, what should be automated, how humans stay in control, and how to build it in approved phases.

It is **documentation only**. No application code, schema, database, deployment, authentication configuration, or Git history was changed.

**Version 1.1 correction:** the automation taxonomy now follows the master assignment exactly. A–K means inquiry intake through exception escalation, not the downstream talent lifecycle. Downstream contract, onboarding, delivery, and performance automations are in the appendix of `03_AUTOMATION_OPPORTUNITY_REPORT.md` and in roadmap Phase 6.

---

## 2. Master deliverable map

The assignment requires 16 deliverables. Each one has a primary document.

| # | Required deliverable | Primary file | Supporting files |
|---|---|---|---|
| 1 | Existing application audit | `01_APPLICATION_AUDIT.md` | `20_CURRENT_FUNCTIONALITY_INVENTORY.md` |
| 2 | Current functionality inventory | `20_CURRENT_FUNCTIONALITY_INVENTORY.md` | `01` §4–6 |
| 3 | Business process documentation | `02_BUSINESS_PROCESS_ANALYSIS.md` | `04_TALENT_JOURNEY_AND_SLA_MAP.md` |
| 4 | Automation opportunity report | `03_AUTOMATION_OPPORTUNITY_REPORT.md` | — |
| 5 | Assistant operations manual | `05_ASSISTANT_OPERATIONS_MANUAL.md` | `15_TALENT_INQUIRY_RESPONSE_LIBRARY.md` |
| 6 | Assistant training curriculum | `19_ASSISTANT_TRAINING_CURRICULUM.md` | `05`, `06` |
| 7 | Webinar presentation and script | `06_WEBINAR_PRESENTATION_AND_SCRIPT.md` | `19` |
| 8 | Talent inquiry response library | `15_TALENT_INQUIRY_RESPONSE_LIBRARY.md` | `05` §5 |
| 9 | Project listing evaluation playbook | `16_PROJECT_LISTING_EVALUATION_PLAYBOOK.md` | `03` E, F |
| 10 | Talent qualification framework | `17_TALENT_QUALIFICATION_FRAMEWORK.md` | `07`, `08` |
| 11 | Talent matching decision framework | `18_TALENT_MATCHING_DECISION_FRAMEWORK.md` | `09`, `12` |
| 12 | Proposed application architecture | `12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` | `22` |
| 13 | Database and integration recommendations | `22_DATABASE_AND_INTEGRATION_RECOMMENDATIONS.md` | `12` |
| 14 | Security and approval policy | `13_SECURITY_AND_APPROVAL_POLICY.md` | — |
| 15 | Phased implementation roadmap | `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md` | — |
| 16 | Testing and acceptance criteria | `21_TESTING_AND_ACCEPTANCE_CRITERIA.md` | `14` §12–13 |

**Supplementary documents** (not separately required by the assignment, but used by the system): `00` index, `04` journey/SLA, `07` sourcing playbook, `08` portfolio rubric, `09` rate card, `10` onboarding/QC, and `11` prompt library.

---

## 3. How to read it

| If you are… | Read in this order |
|---|---|
| The Lead Developer making an approval decision | `01` → `20` → `03` → `12` → `13` → `14` → `21` |
| The operations assistant doing the work | `05` → `04` → `15` → `17` → `18` |
| The person running the webinar | `06` → `19` |
| A new team member learning the standard | `CREATIVE_TALENT_OPERATIONS.md` → `05` → `19` → `17` |
| A security reviewer | `13` → `01` (findings) → `21` §4 |
| An engineer estimating work | `12` → `22` → `14` → `21` |
| Someone evaluating a project listing | `16` → `03` E–F → `18` |
| Someone matching talent to work | `17` → `18` → `09` |

---

## 4. Evidence labels

| Label | Meaning |
|---|---|
| `CONFIRMED` | Verified directly in the repository at the cited path and line, or by a deterministic filesystem/git check. |
| `LIKELY` | Strongly implied but not exercised end-to-end during this audit. |
| `UNKNOWN` | Not observable locally (deployed env vars, production data, vendor configuration). |
| `PROPOSED` | Target-state design; requires approval. Not current behavior. |

Current-state claims always cite `path:line`. Target-state statements are marked `PROPOSED` and generally do not cite current code.

---

## 5. Full file index

| # | File | Type |
|---|---|---|
| 1 | `CREATIVE_TALENT_OPERATIONS.md` (repo root) | Durable policy |
| 2 | `docs/talent-operations/00_README_AND_INDEX.md` | Index and master map |
| 3 | `01_APPLICATION_AUDIT.md` | Audit and findings F-01–F-20 |
| 4 | `02_BUSINESS_PROCESS_ANALYSIS.md` | Process analysis |
| 5 | `03_AUTOMATION_OPPORTUNITY_REPORT.md` | Automations A–K |
| 6 | `04_TALENT_JOURNEY_AND_SLA_MAP.md` | Journey, queues, SLA |
| 7 | `05_ASSISTANT_OPERATIONS_MANUAL.md` | Operating manual |
| 8 | `06_WEBINAR_PRESENTATION_AND_SCRIPT.md` | Webinar and script |
| 9 | `07_TALENT_SOURCING_AND_VETTING_PLAYBOOK.md` | Sourcing playbook |
| 10 | `08_PORTFOLIO_AND_REEL_EVALUATION_FRAMEWORK.md` | Portfolio rubric |
| 11 | `09_RATE_CARD_AND_NEGOTIATION_FRAMEWORK.md` | Rate framework |
| 12 | `10_ONBOARDING_AND_QUALITY_CONTROL_PLAYBOOK.md` | Onboarding and QC |
| 13 | `11_AI_ASSISTANT_PROMPT_LIBRARY.md` | Prompt library |
| 14 | `12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` | Architecture and models |
| 15 | `13_SECURITY_AND_APPROVAL_POLICY.md` | Security and approvals |
| 16 | `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md` | Roadmap and phase gates |
| 17 | `15_TALENT_INQUIRY_RESPONSE_LIBRARY.md` | Response templates |
| 18 | `16_PROJECT_LISTING_EVALUATION_PLAYBOOK.md` | Listing evaluation |
| 19 | `17_TALENT_QUALIFICATION_FRAMEWORK.md` | Qualification |
| 20 | `18_TALENT_MATCHING_DECISION_FRAMEWORK.md` | Matching |
| 21 | `19_ASSISTANT_TRAINING_CURRICULUM.md` | Curriculum and assessment |
| 22 | `20_CURRENT_FUNCTIONALITY_INVENTORY.md` | Inventory |
| 23 | `21_TESTING_AND_ACCEPTANCE_CRITERIA.md` | Testing and acceptance |
| 24 | `22_DATABASE_AND_INTEGRATION_RECOMMENDATIONS.md` | Database and integrations |

**Total:** 24 files — 1 root policy + 23 in `docs/talent-operations/`.

---

## 6. Executive summary

### 6.1 What exists and can be reused

`CONFIRMED`:

- A guarded Next.js 14 App Router platform with NextAuth credentials auth and role helpers (`package.json:32`; `src/lib/auth.ts:119-191`).
- 41 Prisma models on PostgreSQL (`prisma/schema.prisma:11-813`).
- SOW → contract assembly → signature → deliverable → client acceptance → admin final approval (`src/app/api/sows/route.ts:7-48`; `src/app/api/contracts/assemble/route.ts:49-102`; `src/lib/deliverable-lifecycle.ts:43-83`).
- 12 role-specific contract addenda and 20 master clauses (`src/data/addenda.ts:21-189`; `src/data/clauses.ts:12-167`).
- Multi-role contractor records with admin approval and automatic training assignment (`src/app/api/contractors/[id]/roles/[roleId]/route.ts:28-80`).
- Training lessons, per-step progress, GitHub repo provisioning, and Slack verification (`prisma/schema.prisma:513-599`).
- Workforce readiness dashboard (`src/app/api/admin/workforce/route.ts:25-136`).
- Audit logging, DB-backed rate limiting with memory fallback, CSRF double-submit protection, and notification polling (`src/lib/audit.ts:14-31`; `src/lib/rateLimit.ts:11-27`; `src/middleware.ts:4-10,36-47`; `src/components/NotificationBell.tsx:35`).
- Google Drive storage integration (`src/lib/driveService.ts`).
- Deterministic growth-lead scoring (`src/lib/growth.ts:1-7,54-146`).

### 6.2 What is missing for talent operations

`CONFIRMED` by absence:

- No public talent application page or API; no `/apply`, `/talent`, `/careers`.
- No `Applicant`, `Talent`, `Skill`, `Portfolio`, `Interview`, or `Availability` model. `PortfolioItem` is an internal developer artifact (`prisma/schema.prisma:626-654`).
- No talent-specific fields on `Contractor`: no city/timezone, availability, skills, seniority, rates, reel URL, or sourcing channel (`prisma/schema.prisma:53-78`).
- No applicant scoring rubric, interview scorecard, or decision record.
- No opportunity/listing model that links demand to requirements or a shortlist.
- No automated reminders or scheduled jobs; `vercel.json:1-12` has no `crons`.
- No central email service or applicant acknowledgment. Four routes create their own nodemailer transport and send only to internal addresses.
- No admin UI or GET endpoint for `GrowthLead` (`src/app/api/growth-lead/route.ts` exports POST only).

### 6.3 Recommended direction

`PROPOSED`:

1. Build **talent inquiry intake** (A) and **acknowledgment + information collection** (B) first, reusing the public-route pattern and adding applicant-facing email.
2. Add **categorization and qualification** (C) and **portfolio review** (D) with a deterministic, versioned rubric.
3. Add **project listing discovery** (E) and **requirement extraction** (F), seeded from `GrowthLead`, `Prospect`, and `BookingInquiry` but not overloading them.
4. Add **matching** (G) and **follow-up** (H) with hard eligibility filters and explainable shortlists.
5. Add **status tracking** (I), **reporting** (J), and **exception escalation** (K).
6. Reuse the existing SOW, contract, deliverable, training, notification, and audit primitives for downstream work.
7. Keep AI optional behind an adapter; the deterministic path must work alone.

---

## 7. Scope boundaries

In scope: documentation, process design, rubric design, automation specification, data model proposal, security policy, roadmap, training materials.

Out of scope during this phase: code changes, schema changes, migrations, environment changes, vendor purchases, production deployments, authentication changes, Git commits/pushes.

---

## 8. Repository state at audit

| Item | Value | Evidence |
|---|---|---|
| Branch | `feat/growth-landing-page` | `git branch --show-current` |
| Uncommitted change | `docs/SESSION_HANDOFF.md` (leave untouched) | `git status --short` |
| Version | 1.2.0 | `package.json:3` |
| Prisma models | 41 | `prisma/schema.prisma` |
| API route files | 62 | `src/app/api/**/route.ts` |
| Pages | 65 | `src/app/**/page.tsx` |
| Migrations directory | absent | filesystem + `AGENTS.md:12` |
| Test files | 4 | `tests/*.test.ts` |
| Cron configuration | none | `vercel.json:1-12` |
| AI SDK dependency | none | `package.json:24-38` |

---

## 9. Approval status

All deliverables are complete as proposals. Implementation is paused pending Lead Developer approval of `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md`. See `CREATIVE_TALENT_OPERATIONS.md` §17 for the approval checklist.

**No application code, schema, database, deployment, authentication configuration, or Git history was changed in producing this suite.**
