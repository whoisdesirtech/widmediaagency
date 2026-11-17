# 20 — Current Functionality Inventory

**Purpose:** A single, evidence-tagged inventory of what the platform actually contains today, so no recommendation assumes a feature exists or is missing without a citation.
**Status:** `CONFIRMED` snapshot at audit time. This is not a target-state document.
**Method:** Filesystem enumeration plus direct reads. Counts are exact for this checkout.

**Snapshot**

| Item | Count | Source |
|---|---|---|
| Prisma models | 41 | `prisma/schema.prisma` |
| API route files | 62 | `src/app/api/**/route.ts` |
| Pages | 65 | `src/app/**/page.tsx` |
| Test files | 4 | `tests/*.test.ts` |
| Migrations | 0 | `prisma/migrations` absent |
| Cron jobs | 0 | `vercel.json:1-12` |
| AI SDKs | 0 | `package.json:24-38` |

---

## 1. Data models (41)

### 1.1 Agency, identity, and access

| Model | Line | Purpose | Talent relevance |
|---|---|---|---|
| `Agency` | 11 | Tenant record; response-time default | Multi-agency scoping |
| `User` | 28 | Auth identity with role and links | Reviewer/owner identity |
| `Contractor` | 53 | Legal/records entity after approval | Downstream link target; **not** an applicant |
| `ContractorRole` | 500 | Multi-role approval per contractor | Role mapping |
| `AuditLog` | 481 | Technical audit trail | Required for every talent mutation |
| `RateLimitBucket` | 447 | DB-backed rate limiting | Public route protection |

### 1.2 Contracts and agreements

| Model | Line | Purpose |
|---|---|---|
| `MasterAgreement` | 80 | Versioned master terms |
| `Addendum` | 93 | Role-specific clause template |
| `SOW` | 104 | Rate, dates, deliverables JSON, status |
| `AssembledContract` | 123 | Merged master + addendum + SOW |
| `Signature` | 139 | Signer role, data, hash |

### 1.3 Clients and delivery

| Model | Line | Purpose |
|---|---|---|
| `Client` | 151 | Client record |
| `Project` | 173 | Delivery project |
| `ProjectTask` | 194 | Contractor work item |
| `TaskReview` | 217 | Review rounds |
| `Deliverable` | 304 | 11-state delivery lifecycle |
| `Invoice` | 338 | Client-facing invoice |
| `Document` | 353 | Document metadata |
| `FileFolder` | 290 | Drive folder mapping |
| `MessageThread` / `Message` | 232 / 256 | Messaging |
| `Notification` | 276 | In-app notification |

### 1.4 Intake and growth

| Model | Line | Purpose | Talent relevance |
|---|---|---|---|
| `BookingInquiry` | 366 | Event/speaker inquiry (public) | **Not** a talent inquiry |
| `PluginDownloadLead` | 378 | Plugin lead capture | Unrelated |
| `Prospect` | 389 | Client prospecting | Demand-side only |
| `ProspectIntelligence` | 412 | Research notes, fit, risk | Demand-side only |
| `GTMAnalysis` | 429 | Go-to-market analysis | Unrelated |
| `GrowthLead` | 453 | Client lead with budget/score/tier | Demand-side seed for E/F |

### 1.5 Training and developer portal

| Model | Line | Purpose |
|---|---|---|
| `TrainingLesson` | 513 | Lesson definition and steps |
| `TrainingAssignment` | 530 | Per-contractor assignment |
| `TrainingStepProgress` | 550 | Step completion |
| `GitHubRepository` | 564 | Provisioned training repo |
| `SlackConnection` | 581 | Slack verification |
| `PortalTask` | 600 | Internal team task |
| `PortfolioItem` | 626 | **Internal developer** portfolio; not talent media |
| `Influencer` | 656 | Influencer record |
| `InfluencerAudit` | 693 | Influencer audit |
| `AuditScore` | 724 | Audit scoring |
| `BrandKit` | 736 | Brand kit |
| `BrandKitSection` | 789 | Brand kit section |
| `Review` | 802 | Generic review record |

### 1.6 Models that do **not** exist

`CONFIRMED` by enumeration: no `Applicant`, `TalentProfile`, `TalentSkill`, `TalentAvailability`, `TalentPortfolioItem`, `TalentReview`, `TalentInterview`, `TalentCredential`, `TalentReference`, `TalentDecision`, `TalentQueueItem`, `TalentPerformance`, `TalentRate`, `RateBand`, `RateException`, `EmailLog`, `AutomationRun`, `ProjectOpportunity`, `OpportunityRequirement`.

**Implication:** talent operations cannot be run from the current schema without new additive models.

---

## 2. API routes (62)

### 2.1 Public by design

| Route | Method | Notes |
|---|---|---|
| `api/booking` | POST | Rate-limited; nodemailer; HTML interpolation finding F-07 |
| `api/plugin-lead` | POST | Rate-limited; internal email |
| `api/growth-lead` | POST | Rate-limited; consent forced true (F-08); **no GET** |
| `api/auth/reset-password` | POST | Rate-limited; logs plaintext password when SMTP missing (F-01) |
| `api/auth/[...nextauth]` | * | Credentials auth |

### 2.2 Contract and SOW

`api/sows`, `api/contracts`, `api/contracts/assemble`, `api/master-agreements`, `api/addenda`, `api/signatures`, `api/signatures/[id]/verify`.

### 2.3 Contractors and roles

`api/contractors`, `api/contractors/[id]`, `api/contractors/[id]/login`, `api/contractors/[id]/roles`, `api/contractors/[id]/roles/[roleId]`, `api/contractors/[id]/upload`.

`CONFIRMED` findings: mass assignment (F-03), missing agency scope (F-06), plaintext credential to browser (F-02).

### 2.4 Clients and projects

`api/clients`, `api/clients/[id]`, `api/clients/[id]/login`, `api/projects`, `api/projects/[id]`, `api/projects/[id]/images`, `api/projects/[id]/tasks`, `api/projects/[id]/tasks/[taskId]`.

### 2.5 Delivery, invoices, documents

`api/deliverables`, `api/deliverables/[id]`, `api/invoices`, `api/invoices/[id]`, `api/documents`, `api/documents/[id]`, `api/folders`, `api/folders/[id]`, `api/files/[...path]`, `api/drive/upload`.

### 2.6 Training

`api/admin/training/assign`, `api/admin/training/progress`, `api/admin/training/slack/verify`, `api/admin/training-doc/[type]`, `api/admin/workforce`, `api/training/github`, `api/training/progress`, `api/training/slack`, `api/training-lessons`, `api/contractor/tasks`, `api/contractor/tasks/[taskId]`.

### 2.7 Messaging, notifications, settings

`api/messages/threads`, `api/messages/threads/[id]`, `api/notifications`, `api/notifications/[id]`, `api/notifications/read-all`, `api/settings`, `api/me`, `api/dashboard`, `api/audit`.

### 2.8 Sales and proposals

`api/sales/prospects`, `api/sales/prospects/[id]`, `api/sales/prospects/[id]/gtm`, `api/sales/prospects/[id]/intelligence`, `api/proposal/checkout`, `api/proposal/download`.

### 2.9 Talent routes that do **not** exist

No `/api/talent/*`, no `/api/apply`, no applicant admin route, no opportunity route, no matching route.

---

## 3. Pages (65)

### 3.1 Public and shared

`/` (root), `login`, `grow`, `speaker`, `proposal-builder`, `proposal-builder/checkout`, `proposal-builder/success`, `knowledge-base`, `portal-guide`, `training`, `developer`, `settings`, `sow-builder`, `contracts`, `master-agreement`, `addenda`, `onboarding/[id]`.

### 3.2 Admin/staff

`dashboard`, `contractors`, `contractors/new`, `contractors/[id]`, `clients`, `clients/new`, `clients/[id]` (billing, deliverables, documents, folders, media, messages, projects), `admin/projects`, `admin/projects/[id]`, `admin/deliverables`, `admin/tasks`, `admin/workforce`, `admin/developer-training`, `admin/messages`, `admin/audit`, `admin/audit-log`, `admin/sales/prospects` (new, [id], gtm).

### 3.3 Contractor portal

`contractor/dashboard`, `contractor/contracts`, `contractor/sows`, `contractor/projects`, `contractor/deliverables`, `contractor/tasks`, `contractor/training`, `contractor/onboarding`, `contractor/my-roles`, `contractor/messages`, `contractor/developer`.

### 3.4 Client portal

`client/dashboard`, `client/projects`, `client/deliverables`, `client/documents`, `client/media`, `client/messages`, `client/billing`, `client/training`, `client/account`.

### 3.5 Pages that do **not** exist

No `/apply`, `/careers`, `/talent`, `/join`, applicant status page, admin talent queue, listing/opportunity page, or matching page.

---

## 4. Forms

| Form | Path | Writes to | Public |
|---|---|---|---|
| Contractor intake | `src/app/contractors/new/page.tsx` | `Contractor` | No (admin/staff) |
| Client intake | `src/app/clients/new/page.tsx` | `Client` | No |
| SOW builder | `src/app/sow-builder/page.tsx` | `SOW` | No |
| Proposal builder | `src/app/proposal-builder/page.tsx` | Proposal checkout | Public |
| Booking/speaker | `src/app/speaker/page.tsx` | `BookingInquiry` | Public |
| Growth landing | `src/app/grow/page.tsx` | `GrowthLead` | Public |
| Plugin lead | landing component | `PluginDownloadLead` | Public |
| Signatures | `src/components/SignaturePad.tsx` | `Signature` | Auth |
| Messages | portal pages | `Message` | Auth |

`CONFIRMED`: no form collects a talent profile, portfolio, availability, or rate expectation.

---

## 5. Email and notifications

| Route | Transport | Recipient | Template |
|---|---|---|---|
| `api/booking` | nodemailer per route | Internal | Inline HTML |
| `api/growth-lead` | nodemailer per route | Internal | Inline HTML |
| `api/plugin-lead` | nodemailer per route | Internal | Inline HTML |
| `api/auth/reset-password` | nodemailer per route | User | Inline text/HTML |

`CONFIRMED`: no shared transport, no template registry, no `EmailLog`, no applicant-facing email, no retry.

Notifications are DB rows polled every 30 seconds by `src/components/NotificationBell.tsx:35`.

---

## 6. Authentication and authorization

- NextAuth credentials, JWT session (`src/lib/auth.ts:19-86`).
- Session fields: role, agencyId, contractorId, clientId.
- Guards: `requireAdmin`, `requireAdminOrStaff`, `requireAuth`, role helpers (`src/lib/auth.ts:119-191`).
- CSRF double-submit (`src/middleware.ts:4-10,36-47`).
- Rate limiting (`src/lib/rateLimit.ts:11-46`).
- Audit (`src/lib/audit.ts:14-31`).
- `CONFIRMED` gaps: F-01, F-02, F-03, F-06.

---

## 7. Background jobs and scheduling

`CONFIRMED`: none. `vercel.json:1-12` has no `crons`. No worker, queue, or job table. All work is request-driven or manual.

---

## 8. AI integrations

`CONFIRMED`: none. No SDK in `package.json:24-38`. The only deterministic scoring is `src/lib/growth.ts:54-146` (growth-lead qualification), which is a useful pattern but not an AI integration.

---

## 9. Storage and integrations

| Integration | Implementation | Notes |
|---|---|---|
| Google Drive | `src/lib/driveService.ts`; service account | Uploads go to Drive, not local disk |
| GitHub | `src/lib/github.ts`; Octokit PAT | Training repos |
| Slack | `src/lib/slack.ts`; bot token | Training verification |
| SMTP | nodemailer | Per-route transports |
| Database | Prisma → PostgreSQL | `DATABASE_URL` / `DIRECT_URL` |
| Hosting | Vercel | No cron configured |

---

## 10. Tests and quality gates

- 4 Vitest files under `tests/`.
- `npm run typecheck` (`tsc --noEmit`).
- `npm run build`.
- ESLint config exists (`.eslintrc.json`), contrary to the stale `AGENTS.md` claim.
- No end-to-end suite, no route-level auth tests, no accessibility tests.

`CONFIRMED`: `docs/SESSION_HANDOFF.md:54` claims Vitest is empty; four tests now exist.

---

## 11. Documentation

| File | State |
|---|---|
| `AGENTS.md` | Stale: says 26 models / 37 routes / branch main / no ESLint |
| `docs/ARCHITECTURE.md` | Present |
| `docs/KNOWN_ISSUES.md` | Present |
| `docs/SESSION_HANDOFF.md` | Present; uncommitted; partially stale |
| `docs/AI_HANDOFF.md` | Present; stops at Phase 4A |
| `CREATIVE_TALENT_OPERATIONS.md` | New proposal |
| `docs/talent-operations/` | New proposal suite |

---

## 12. Configuration

| Item | State |
|---|---|
| `vercel.json` | Present; no crons |
| `.env` (local) | Only `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |
| Production env | `UNKNOWN` |
| Migrations | None; `db push` workflow |
| Feature flags | None observed |
| Branch | `feat/growth-landing-page` |
| Version | 1.2.0 |

---

## 13. What exists vs what the talent system needs

| Need | Exists | Reuse or build |
|---|---|---|
| Auth and roles | Yes | Reuse |
| Audit | Yes | Reuse |
| Rate limit | Yes | Reuse |
| Notifications | Yes | Reuse |
| Email transport | Partial (4 ad-hoc) | Abstract |
| File storage | Yes (Drive) | Reuse |
| Applicant model | No | Build |
| Talent profile | No | Build |
| Portfolio rubric | No | Build |
| Interview/decision records | No | Build |
| Opportunity/listing model | No | Build |
| Requirement extraction | No | Build |
| Matching | No | Build |
| Queue/SLA | No | Build |
| Scheduler | No | Defer; manual first |
| AI | No | Optional adapter |
| Reporting | Partial (workforce) | Extend |

---

## 14. Inventory confidence

- Model, route, and page counts: `CONFIRMED` by enumeration.
- Field-level behavior: `CONFIRMED` where cited; otherwise `LIKELY`.
- Production configuration, data volume, and vendor settings: `UNKNOWN`.
- This inventory is a point-in-time snapshot; re-run the enumeration before relying on counts after any merge.

**End of inventory.**
