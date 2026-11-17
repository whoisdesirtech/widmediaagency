# 01 — Application Audit

**Repository:** `C:\Users\sebas\Desktop\Projects\widmediaagency`
**Audit date:** 2026-11-06
**Mode:** Read-only. No code, schema, database, deployment, auth, or Git changes.
**Branch:** `feat/growth-landing-page` (worktree has one pre-existing modification: `docs/SESSION_HANDOFF.md`).
**Auditor:** AI coding agent (Big Pickle), under `AGENTS.md` conventions.

---

## 1. Method

1. Read `AGENTS.md`, `package.json`, and `prisma/schema.prisma` in full.
2. Enumerated every API route and page with the filesystem, not with stale documentation.
3. Read the shared libraries that define behavior: auth, audit, rate limiting, notifications, lifecycle, training, growth scoring, storage.
4. Read representative route handlers for each domain: contractors, roles, SOWs, contracts, deliverables, growth, booking, plugin leads, settings, workforce.
5. Verified environment variable **names** only (never values) in `.env`.
6. Cross-checked `AGENTS.md`, `docs/SESSION_HANDOFF.md`, and older audit docs against code.
7. Recorded every current-state claim as `CONFIRMED`, `LIKELY`, or `UNKNOWN` with a path and line.

Deterministic checks used:

```
git branch --show-current                  -> feat/growth-landing-page
git status --short                         -> M docs/SESSION_HANDOFF.md
Get-ChildItem src/app/api -Recurse -Filter route.ts | Measure  -> 62
Get-ChildItem src/app -Recurse -Filter page.tsx | Measure      -> 65
Test-Path prisma/migrations                                    -> False
Test-Path vercel.json                                          -> True
Select-String prisma/schema.prisma -Pattern '^model '          -> 41
```

---

## 2. Executive verdict

The platform is a **mature agency delivery system** with strong primitives for contracting, training, delivery, and audit. It is **not yet a talent acquisition or talent operations system**. There is no way for a creative to apply, no structured way to evaluate a portfolio, no availability model, no decision log, and no applicant-facing communication.

The fastest safe path is not a new product. It is a **thin talent layer** that reuses the existing auth, contractor, role, training, SOW, contract, deliverable, notification, audit, and Drive components, and adds one new intake surface plus a small number of talent-specific tables.

**Readiness score (proposal):**

| Dimension | Score | Basis |
|---|---|---|
| Identity and access | 4/5 | NextAuth + guards + agency scoping in many routes; some ID routes lack agency scope (see F-06). |
| Talent intake | 0/5 | No applicant surface, model, or acknowledgment. |
| Evaluation | 1/5 | No rubric/scorecard; `PortfolioItem` is internal-only. |
| Contracting | 4/5 | SOW + assembly + signatures + addenda + clauses exist. |
| Onboarding/training | 4/5 | Lessons, auto-assignment, progress, GitHub/Slack integrations exist. |
| Staffing/capacity | 1/5 | Assignment exists; availability/capacity does not. |
| Delivery/QA | 4/5 | Enforced lifecycle with admin-only final approval. |
| Payment | 3/5 | Client invoices exist; contractor payouts do not. |
| Reporting | 1/5 | Workforce readiness only; no funnel/quality metrics. |
| Automation | 1/5 | Notifications and polling only; no scheduler or queue. |
| AI | 1/5 | `aiGenerated`/`aiModel` fields exist; no AI SDK or key. |
| Security posture | 3/5 | Good guards/CSRF/audit; several concrete findings (F-01..F-09). |

---

## 3. Repository facts

| Fact | Value | Evidence | Label |
|---|---|---|---|
| Framework | Next.js 14 App Router, React 18, TypeScript | `package.json:32-33` | `CONFIRMED` |
| Styling | Tailwind CSS | `package.json:59` | `CONFIRMED` |
| ORM / DB | Prisma 5 + PostgreSQL | `package.json:25-26`, `prisma/schema.prisma:5-9` | `CONFIRMED` |
| Auth | NextAuth credentials, JWT sessions | `src/lib/auth.ts:19,27,45-86` | `CONFIRMED` |
| Email | nodemailer, per-route transports | `package.json:34`; four route files (see §9) | `CONFIRMED` |
| Storage | Google Drive via service account | `src/lib/driveService.ts`; `googleapis` at `package.json:28` | `CONFIRMED` |
| GitHub | Octokit PAT for training repos | `@octokit/rest` dependency; `src/lib/github.ts` | `CONFIRMED` |
| Slack | Bot token + email matching | `src/lib/slack.ts`; `prisma/schema.prisma:581-599` | `CONFIRMED` |
| Tests | Vitest, 4 files | `package.json:60`, `vitest.config.ts`, `tests/*.test.ts` | `CONFIRMED` |
| Lint | ESLint config present | `.eslintrc.json:1-22`, `package.json:50` | `CONFIRMED` |
| Prisma models | 41 | `prisma/schema.prisma:11-813` | `CONFIRMED` |
| API route files | 62 | `src/app/api/**/route.ts` | `CONFIRMED` |
| Pages | 65 | `src/app/**/page.tsx` | `CONFIRMED` |
| Migrations | none; `db push` workflow | `prisma/migrations` absent; `AGENTS.md:12` | `CONFIRMED` |
| Scheduler | none | `vercel.json:1-12` has no `crons`; no queue dependency | `CONFIRMED` |
| AI SDK | none | `package.json:24-38`; grep found no `openai`/`anthropic`/`ai` SDK | `CONFIRMED` |
| Local env keys | `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | `.env` key names only | `CONFIRMED` |
| Deployed env keys | SMTP, Drive, GitHub, Slack, AI | Not observable locally | `UNKNOWN` |

---

## 4. Data model inventory (41 models)

Grouped for readability. All line ranges refer to `prisma/schema.prisma`.

### 4.1 Agency and identity

| Model | Lines | Notes |
|---|---|---|
| `Agency` | 11-26 | Name, jurisdiction, communication tools, two response-time strings. No rate card, capacity, or branding fields. |
| `User` | 28-51 | Email, password hash, role string, optional agency/contractor/client links. |
| `Contractor` | 53-78 | Name, business name, role, state, country, status, tax/insurance/licensing URLs, Drive folder, agency, user. **No skills, rates, availability, city, timezone, portfolio, or seniority.** |
| `Client` | 151-171 | Client profile and Drive folder. |
| `RateLimitBucket` | 447-451 | DB-backed rate-limit counter. |
| `AuditLog` | 481-498 | Technical audit trail. |

### 4.2 Contracting

| Model | Lines | Notes |
|---|---|---|
| `MasterAgreement` | 80-91 | Versioned clause JSON. |
| `Addendum` | 93-102 | Role-specific field definitions + rendered template. |
| `SOW` | 104-121 | Rate, rate type, payment schedule, dates, equipment, software, deliverables JSON, addendum IDs, status. |
| `AssembledContract` | 123-137 | Merged master + SOW + addenda, status, signatures. |
| `Signature` | 139-149 | Signer role/name/email, base64 signature, optional hash. |

### 4.3 Delivery

| Model | Lines | Notes |
|---|---|---|
| `Project` | 173-192 | Client project, optional contractor, status, progress, timeline JSON. |
| `ProjectTask` | 194-215 | Contractor-facing task with status/priority/due date. |
| `TaskReview` | 217-230 | Review rounds for tasks. |
| `MessageThread` / `Message` | 232-274 | Threads with optional calendar event fields. |
| `Notification` | 276-288 | In-app notification. |
| `FileFolder` | 290-302 | Drive folder mapping. |
| `Deliverable` | 304-336 | Full lifecycle timestamps, submission URL/attachments, revision count. |
| `Invoice` | 338-351 | Client invoice. No contractor payout model. |
| `Document` | 353-364 | Client document metadata. |

### 4.4 Inbound and growth

| Model | Lines | Notes |
|---|---|---|
| `BookingInquiry` | 366-376 | Speaker/event inquiry. Not talent. |
| `PluginDownloadLead` | 378-387 | Plugin lead. Not talent. |
| `Prospect` | 389-410 | Sales prospect. |
| `ProspectIntelligence` | 412-427 | Research JSON. |
| `GTMAnalysis` | 429-445 | Go-to-market analysis. |
| `GrowthLead` | 453-479 | Client lead with score/tier/status/consent. Not talent. |

### 4.5 Roles and training

| Model | Lines | Notes |
|---|---|---|
| `ContractorRole` | 500-511 | Multi-role with pending/approved/rejected; unique per contractor+role. |
| `TrainingLesson` | 513-528 | Slug, steps JSON, GitHub/Slack flags. |
| `TrainingAssignment` | 530-548 | Per contractor+lesson; unique. |
| `TrainingStepProgress` | 550-562 | Per step; unique per assignment+step. |
| `GitHubRepository` | 564-579 | One per assignment. |
| `SlackConnection` | 581-599 | One per assignment. |

### 4.6 Developer portal

| Model | Lines | Notes |
|---|---|---|
| `PortalTask` | 600-624 | Internal team task. |
| `PortfolioItem` | 626-654 | **Internal developer portfolio** (default category `web-development`, `assignedUserId`, GitHub/live URL/screenshots). Not a talent reel. |
| `Influencer` | 656-691 | Creator audit subject. |
| `InfluencerAudit` | 693-722 | Audit scores and AI flags. |
| `AuditScore` | 724-734 | Per-category score. |
| `BrandKit` | 736-787 | Brand kit. |
| `BrandKitSection` | 789-800 | Section content. |
| `Review` | 802-813 | Brand kit review. |

### 4.7 Model-level conclusion

`CONFIRMED`: There is **no** `Applicant`, `Talent`, `TalentProfile`, `Skill`, `TalentSkill`, `PortfolioAsset`, `Showreel`, `Interview`, `Scorecard`, `Availability`, `RateCard`, `TalentSource`, `TalentDecision`, or `TalentReview` model. `PortfolioItem` cannot substitute because it is keyed to a platform `User` and internal `PortalTask`, not to an applicant or contractor (`prisma/schema.prisma:626-654`).

---

## 5. API inventory (62 route files)

### 5.1 Domains

| Domain | Representative routes | Guard |
|---|---|---|
| Auth | `api/auth/[...nextauth]`, `api/auth/reset-password` | NextAuth / public+rate-limit |
| Contractors | `api/contractors`, `[id]`, `[id]/login`, `[id]/roles`, `[id]/upload` | `requireAdminOrStaff` / `requireAdmin` |
| Contracts | `api/contracts`, `api/contracts/assemble`, `api/sows`, `api/addenda`, `api/master-agreements` | admin/staff or signed-in |
| Clients | `api/clients`, `[id]`, `[id]/login` | `requireAdminOrStaff` |
| Projects | `api/projects`, `[id]`, `[id]/tasks`, `[id]/images` | `requireAuth` + role logic |
| Deliverables | `api/deliverables`, `[id]` | `requireAuth` + lifecycle |
| Invoices/documents | `api/invoices`, `api/documents` | `requireAdminOrStaff` |
| Messaging | `api/messages/threads`, `[id]` | `requireAuth` |
| Notifications | `api/notifications`, `[id]`, `read-all` | `requireAuth` |
| Training | `api/training/*`, `api/admin/training/*`, `api/training-lessons` | contractor/admin |
| Growth | `api/growth-lead` (POST only) | public + rate-limit |
| Sales | `api/sales/prospects/*` | `requireAdminOrStaff` |
| Public tools | `api/booking`, `api/plugin-lead`, `api/proposal/*` | rate-limit only |
| Settings | `api/settings` | `requireAdmin` |
| Work force | `api/admin/workforce` | `requireAdminOrStaff` |
| Files | `api/files/[...path]`, `api/drive/upload` | `requireAuth` |

### 5.2 Guard coverage

`CONFIRMED`: Every state-changing business route inspected starts with a guard helper from `src/lib/auth.ts` (`requireAdmin`, `requireAdminOrStaff`, `requireAuth`, `requireContractor`). The public exceptions are `booking`, `plugin-lead`, `growth-lead`, `auth/*`, and the stateless `proposal/*` tools (`src/middleware.ts:10`; route files).

`CONFIRMED`: `api/growth-lead/route.ts` exports only `POST` (`src/app/api/growth-lead/route.ts:61`). There is no authenticated `GET` or `PATCH`, and no admin page for growth leads in the 65-page inventory. Growth leads can only be read directly from the database today.

### 5.3 Public route behavior

| Route | Writes | Notifies | Acknowledges submitter | Evidence |
|---|---|---|---|---|
| `POST /api/booking` | `BookingInquiry` | Organizer only (`digitalvurv@gmail.com`) | No | `src/app/api/booking/route.ts:6,26-58` |
| `POST /api/plugin-lead` | `PluginDownloadLead` | Owner only | No | `src/app/api/plugin-lead/route.ts:24-57` |
| `POST /api/growth-lead` | `GrowthLead` | `NOTIFY_EMAIL` only | No | `src/app/api/growth-lead/route.ts:96-142` |
| `POST /api/proposal/download` | none (stateless ZIP) | none | n/a | `src/app/api/proposal/download/route.ts:6-57` |
| `POST /api/proposal/checkout` | none (simulation) | none | n/a | `src/app/api/proposal/checkout/route.ts:4-28` |

`CONFIRMED`: There is **no acknowledgment email to any submitter** on any public route. All SMTP calls target internal addresses.

---

## 6. Page inventory (65 pages)

`CONFIRMED` groups:

- **Public:** `/`, `/login`, `/speaker`, `/grow`, `/proposal-builder`, `/proposal-builder/checkout`, `/proposal-builder/success`, `/portal-guide`, `/knowledge-base`.
- **Admin/staff:** `/dashboard`, `/admin/workforce`, `/admin/deliverables`, `/admin/tasks`, `/admin/projects`, `/admin/projects/[id]`, `/admin/messages`, `/admin/audit`, `/admin/audit-log`, `/admin/contractors/[id]`, `/admin/sales/prospects/*`, `/admin/developer-training`.
- **Contractor:** `/contractor/dashboard`, `/contractor/onboarding`, `/contractor/training`, `/contractor/my-roles`, `/contractor/sows`, `/contractor/deliverables`, `/contractor/tasks`, `/contractor/projects`, `/contractor/messages`, `/contractor/contracts`, `/contractor/developer`.
- **Client:** `/client/dashboard`, `/client/projects`, `/client/deliverables`, `/client/documents`, `/client/billing`, `/client/media`, `/client/messages`, `/client/training`, `/client/account`.
- **Admin detail mirrors:** `/clients/[id]/*`, `/clients`, `/clients/new`, `/contractors`, `/contractors/new`, `/contractors/[id]`, `/contracts`, `/sow-builder`, `/master-agreement`, `/addenda`, `/settings`, `/training`, `/developer`, `/onboarding/[id]`.

`CONFIRMED`: There is **no** `/apply`, `/careers`, `/talent`, `/join`, `/creators`, `/castings`, or talent-facing application page. `PortfolioItem` has no public page.

---

## 7. Auth, access, and audit

### 7.1 Authentication

`CONFIRMED`:

- Credentials provider, JWT strategy (`src/lib/auth.ts:19,27,45`).
- Session carries `id`, `role`, `agencyId`, `contractorId`, `clientId` (`src/lib/auth.ts:78-86,97-108`).
- Role list includes `admin`, `staff`, `contractor`, `client`, `manager`, `reviewer`, `developer`, `intern` (`prisma/schema.prisma:33`).
- Guard helpers and capability helpers (`src/lib/auth.ts:119-191`).

### 7.2 CSRF

`CONFIRMED`: Double-submit cookie `XSRF-TOKEN` + `x-xsrf-token` header on mutating `/api/*` requests (`src/middleware.ts:4-5,36-47`). Public exceptions: `/api/booking`, `/api/plugin-lead`, `/api/growth-lead`, `/api/auth/` (`src/middleware.ts:10`). Matcher excludes static assets (`src/middleware.ts:54`).

### 7.3 Rate limiting

`CONFIRMED`: DB-backed atomic upsert into `RateLimitBucket`, with in-memory fallback if the DB is unavailable (`src/lib/rateLimit.ts:11-27,29-46`). Key is derived from `x-forwarded-for` / `x-real-ip` (`src/lib/rateLimit.ts:48-52`).

`LIKELY`: The memory fallback is per-instance, so limits are weaker during a database outage in a multi-instance deployment. This is acceptable as a fallback but should be documented as degraded mode.

### 7.4 Audit logging

`CONFIRMED`: `logAudit` writes to `AuditLog` best-effort and never throws (`src/lib/audit.ts:14-31`). It is used by contractor create/update, role changes, SOW create, contract assembly, settings, and login provisioning.

`CONFIRMED`: Not every mutation calls `logAudit`. Examples: `api/contractors/[id]/roles/route.ts` (role request creation) and some deliverable transitions rely on lifecycle code. Coverage is good but not uniform.

### 7.5 Agency scoping

`CONFIRMED`: `GET /api/contractors` scopes by `user.agencyId` (`src/app/api/contractors/route.ts:49-52`). `GET/PATCH /api/contractors/[id]` does **not** compare the record's `agencyId` to the session's `agencyId` (`src/app/api/contractors/[id]/route.ts:13-16,36-39`). An authenticated admin/staff user from another agency could read or update a contractor by ID if they obtained the ID. This is finding **F-06**.

---

## 8. Talent-relevant capability analysis

| Capability | Current state | Evidence | Gap severity |
|---|---|---|---|
| Public application | Absent | page inventory; no API route | Critical |
| Applicant record | Absent | model list | Critical |
| Duplicate detection | Absent | no unique applicant email model | High |
| Portfolio upload | Absent for talent | `PortfolioItem` is internal, `prisma/schema.prisma:626-654` | Critical |
| Reel/video URL | Absent on contractor | `prisma/schema.prisma:53-78` | Critical |
| Skills taxonomy | Absent | no skill model | High |
| Seniority | Absent | no field | High |
| Rate history | Absent at talent level; per SOW only | `prisma/schema.prisma:104-121` | High |
| Availability/capacity | Absent | no model; assignment does not check | Critical |
| Location/timezone | Only `state` + `country` | `prisma/schema.prisma:58-59` | High |
| Sourcing channel | Absent for talent | no field; `GrowthLead.source` is client-only, `prisma/schema.prisma:461` | Medium |
| Interview scheduling | Absent for talent | message calendar fields only, `prisma/schema.prisma:265-269` | High |
| Scorecard/rubric | Absent | no model or library | Critical |
| Decision log | Technical audit only | `AuditLog`, `prisma/schema.prisma:481-498` | High |
| Applicant acknowledgment | Absent | four email routes target internal only | Critical |
| Status notifications to talent | In-app only after account exists | `src/lib/notifications.ts:11-26` | High |
| Document verification state | URLs only, no state/expiry | `prisma/schema.prisma:61-64` | High |
| Compliance/right-to-work | Absent | no field | High |
| Performance/reliability | Absent | no model | High |
| Bench/offboarding | Absent | no model | Medium |
| Reporting/funnel | Absent | workforce readiness only, `src/app/api/admin/workforce/route.ts:125-130` | High |

---

## 9. Email inventory

`CONFIRMED`: Four files import and configure nodemailer independently. There is no shared mailer, template registry, retry policy, or delivery log.

| File | Lines | Recipient | Purpose |
|---|---|---|---|
| `src/app/api/booking/route.ts` | 3,38-58 | `ORGANIZER_EMAIL` (`digitalvurv@gmail.com`, line 6) | Internal booking notice |
| `src/app/api/plugin-lead/route.ts` | 3,47-57 | `OWNER_EMAIL` | Internal plugin lead notice |
| `src/app/api/growth-lead/route.ts` | 3,125-142 | `NOTIFY_EMAIL` | Internal growth lead notice |
| `src/app/api/auth/reset-password/route.ts` | 3,35-49 | The user | Password reset |

`CONFIRMED`: If SMTP is not configured, `growth-lead` silently skips email (`route.ts:125`), `booking` logs and skips (`route.ts:56-58`), `plugin-lead` skips, and `reset-password` **logs the new plaintext password to the server console** (`reset-password/route.ts:53-55`). That last behavior is finding **F-01**.

---

## 10. Automation and AI inventory

| Capability | State | Evidence |
|---|---|---|
| Background jobs | None | no queue dependency; `vercel.json:1-12` |
| Cron | None | `vercel.json` has no `crons` |
| Event bus | None | no pub/sub code |
| In-app notifications | Yes, DB + 30s polling | `src/lib/notifications.ts:11-26`; `src/components/NotificationBell.tsx:34-35` |
| Email automation | Fire-and-forget, no retries | four nodemailer routes |
| AI SDK | None | `package.json:24-38` |
| AI fields | `aiGenerated`, `aiModel` on audit/brand-kit models only | `prisma/schema.prisma:711-712` |
| AI keys locally | Absent | `.env` keys are DB/NextAuth only |
| Prompt/response logging | None | no model |
| Human approval primitives | Lifecycle role checks, admin-only final approval | `src/lib/deliverable-lifecycle.ts:43-83` |

`UNKNOWN`: Whether `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `SMTP_*`, `GOOGLE_*`, `GITHUB_*`, or `SLACK_*` are configured in the deployed Vercel environment. They are absent locally.

---

## 11. Documentation drift register

| Doc claim | Actual | Evidence | Impact |
|---|---|---|---|
| 26 Prisma models | 41 | `AGENTS.md:21` vs `prisma/schema.prisma:11-813` | Misleads estimation and onboarding |
| 37 API route files | 62 | `AGENTS.md:28` vs filesystem | Understates surface area and security review scope |
| Branch `main` | `feat/growth-landing-page` | `AGENTS.md:5` vs `git branch` | Agents may base work on the wrong branch assumptions |
| "ESLint is NOT configured" | `.eslintrc.json` + eslint dep exist | `AGENTS.md:16` vs `.eslintrc.json:1-22`, `package.json:50` | Agents may skip lint |
| "no migration files used" | Still true | `AGENTS.md:12`, `prisma/migrations` absent | Accurate, but risky; see roadmap |
| "Vitest configured but empty" | 4 test files exist | `docs/SESSION_HANDOFF.md:54` vs `tests/*.test.ts` | Understates test coverage |
| 12 roles | 13 training keys | `src/lib/role-training-config.ts:7-73` | `developer-intern` orphan |
| "All APIs unauthenticated" (older audit) | Guards are broadly present | `docs/PRODUCT_ARCHITECTURE_AUDIT.md` vs route scan | Outdated risk model |

---

## 12. Findings register

Severity: **Critical** = blocks talent operations or causes data loss; **High** = security/compliance or major workflow gap; **Medium** = operational friction; **Low** = hygiene.

| ID | Severity | Finding | Evidence | Impact |
|---|---|---|---|---|
| F-01 | High | Password reset logs plaintext password when SMTP unconfigured | `src/app/api/auth/reset-password/route.ts:53-55` | Credential leakage via server logs |
| F-02 | High | Contractor login returns plaintext temporary password to the admin browser | `src/app/api/contractors/[id]/login/route.ts:39-44,118-123` | Credential exposure in browser history, screenshots, XSS |
| F-03 | High | Contractor PATCH mass-assigns the entire request body | `src/app/api/contractors/[id]/route.ts:29-39` | Admin/staff can overwrite `userId`, `agencyId`, `status`, or any column |
| F-04 | High | No public talent application or applicant model | page/model inventory | Cannot operate the core objective |
| F-05 | High | No applicant acknowledgment or talent-facing email | email inventory | Applicants receive silence; reputational harm |
| F-06 | Medium | Contractor GET/PATCH by ID lacks agency scoping | `src/app/api/contractors/[id]/route.ts:13-16,36-39` | Cross-agency access if ID is known |
| F-07 | Medium | Booking HTML interpolates user input without escaping | `src/app/api/booking/route.ts:67-82` | HTML injection into internal email |
| F-08 | Medium | Growth lead consent is forced `true` regardless of input | `src/app/api/growth-lead/route.ts:55-57,115` | Inaccurate consent record; compliance risk |
| F-09 | Medium | In-memory rate-limit fallback is per-instance | `src/lib/rateLimit.ts:23-26,29-46` | Weaker protection during DB outage |
| F-10 | Medium | No scheduler, queue, or retry for follow-ups | `vercel.json:1-12`; package deps | Manual follow-up only; SLA breaches invisible |
| F-11 | Medium | No availability/capacity model before assignment | `prisma/schema.prisma:194-215,304-336` | Double-booking and missed deadlines |
| F-12 | Medium | `developer-intern` training key is not offered at intake | `src/lib/role-training-config.ts:13-17` vs `src/app/contractors/new/page.tsx:7-20` | Inconsistent role taxonomy |
| F-13 | Medium | SOW status vocabulary is inconsistent | `prisma/schema.prisma:117` vs `src/app/api/contracts/assemble/route.ts:73-74` | Assembly can reject an SOW the schema considers valid |
| F-14 | Low | Proposal routes return raw `error.message` | `src/app/api/proposal/download/route.ts:50-54`; `checkout/route.ts:21-26` | Minor information disclosure |
| F-15 | Low | No centralized email template or delivery log | four nodemailer routes | No observability, inconsistent branding |
| F-16 | Low | `PortfolioItem` category defaults to `web-development` | `prisma/schema.prisma:630` | Confirms it is a developer artifact, not talent media |
| F-17 | Low | Docs claim 12 roles; 13 exist | `role-training-config.ts:7-73` | Onboarding confusion |
| F-18 | Low | No decision reason taxonomy | no model | Hard to calibrate rejections or audit bias |
| F-19 | Low | No contractor payout record | `prisma/schema.prisma:338-351` | Reconciliation is manual |
| F-20 | Low | No funnel/quality analytics | `src/app/api/admin/workforce/route.ts:125-130` | Cannot measure improvement |

---

## 13. Reuse inventory (what not to rebuild)

| Need | Reuse | Evidence |
|---|---|---|
| Authentication | NextAuth + `requireAuth` helpers | `src/lib/auth.ts:19-191` |
| Role checks | `requireAdmin`, `requireAdminOrStaff`, `requireContractor`, capability helpers | `src/lib/auth.ts:129-191` |
| Audit trail | `logAudit` + `AuditLog` | `src/lib/audit.ts:14-31`; `prisma/schema.prisma:481-498` |
| Rate limiting | DB-backed `rateLimit` | `src/lib/rateLimit.ts:11-27` |
| CSRF | Middleware double-submit | `src/middleware.ts:4-10,36-47` |
| In-app notifications | `createNotification` + `Notification` | `src/lib/notifications.ts:11-26`; `prisma/schema.prisma:276-288` |
| Contract templates | 20 clauses + 12 role addenda | `src/data/clauses.ts:12-167`; `src/data/addenda.ts:21-189` |
| SOW lifecycle | `SOW` model + API | `prisma/schema.prisma:104-121`; `src/app/api/sows/route.ts` |
| Contract assembly | `contracts/assemble` + `AssembledContract` | `src/app/api/contracts/assemble/route.ts:49-102` |
| Signatures | `Signature` model + API | `prisma/schema.prisma:139-149`; `src/app/api/signatures/route.ts` |
| Delivery state machine | `deliverable-lifecycle.ts` | `src/lib/deliverable-lifecycle.ts:5-83` |
| Training | Lessons, assignments, progress, GitHub, Slack | `prisma/schema.prisma:513-599`; `src/lib/role-training-config.ts` |
| Readiness | `computeReadiness` + workforce API | `src/lib/role-training-config.ts:104-146`; `src/app/api/admin/workforce/route.ts:25-136` |
| Drive storage | `driveService.ts` + upload routes | `src/lib/driveService.ts`; `src/app/api/drive/upload/route.ts` |
| Deterministic scoring | `growth.ts` patterns | `src/lib/growth.ts:54-146,211-228` |
| Dashboard patterns | Existing admin contractor/workforce pages | `src/app/admin/workforce/page.tsx`; `src/app/contractors/page.tsx` |

---

## 14. Unknowns and assumptions

| Item | Status | How to resolve |
|---|---|---|
| Deployed SMTP configuration | `UNKNOWN` | Check Vercel env vars with owner |
| Deployed Google Drive credentials and folder structure | `UNKNOWN` | Check service account + Drive root |
| Deployed GitHub/Slack integration status | `UNKNOWN` | Check `GITHUB_*`, `SLACK_*` env |
| Whether any AI provider key exists in production | `UNKNOWN` | Check Vercel env |
| Actual applicant volume and sourcing channels | `UNKNOWN` | No intake exists; must be established |
| Current rate ranges by role and market | `UNKNOWN` | Owner interview; see rate framework |
| Legal review status of contract templates | `UNKNOWN` | `src/data/clauses.ts` contains attorney-review notes (e.g. line 31); confirm with counsel |
| Production data quality (duplicates, missing docs) | `UNKNOWN` | Read-only DB query with owner approval |
| Whether `db push` has drifted from schema | `LIKELY` risk | `docs/SESSION_HANDOFF.md:27-31` documents a prior drift incident |

---

## 15. Audit conclusion

The platform should be extended, not replaced. The highest-leverage sequence is:

1. Fix the credential-handling findings (F-01, F-02) and the mass-assignment issue (F-03) before adding any new public surface.
2. Add a public talent application with an applicant acknowledgment, reusing the public-route pattern.
3. Add talent profile, portfolio, skills, availability, and rate tables linked to `Contractor`.
4. Add a deterministic rubric, interview scorecard, and decision log.
5. Add queue-driven operations before scheduled automation.
6. Add AI drafting behind an adapter only after the manual process is measurable.

See `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md` for phasing and acceptance criteria.
