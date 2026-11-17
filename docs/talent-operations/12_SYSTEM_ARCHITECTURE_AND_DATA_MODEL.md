# 12 — System Architecture and Data Model

**Purpose:** Define a reuse-first architecture and the minimum new data model needed for creative talent operations.
**Status:** `PROPOSED`. No schema or code changes are authorized.
**Constraint:** Reuse Next.js 14, Prisma/PostgreSQL, NextAuth, nodemailer, Google Drive, and the existing role/training/deliverable/audit primitives. No new paid infrastructure unless no viable path exists.

---

## 1. Architecture principles

1. **Extend the monolith.** The platform is a single Next.js App Router application with Prisma. A separate service adds cost, auth complexity, and deployment risk.
2. **One database, one source of truth.** Talent, applicants, contractors, SOWs, and deliverables live in the same PostgreSQL database.
3. **Routes are thin; rules live in `src/lib/`.** Follow the existing pattern: route handlers validate and delegate; shared logic lives in libraries (for example `src/lib/deliverable-lifecycle.ts`).
4. **Every route starts with a guard.** `requireAdmin`, `requireAdminOrStaff`, `requireAuth`, or `requireContractor` (`src/lib/auth.ts:119-191`).
5. **Every mutation is audited.** Use `logAudit` (`src/lib/audit.ts:14-31`).
6. **Public routes are rate-limited.** Use `rateLimit` (`src/lib/rateLimit.ts:11-27`) and the CSRF public-path list (`src/middleware.ts:10`).
7. **Deterministic first.** Scoring, routing, reminders, and SLA calculations must work without AI.
8. **AI is an adapter.** Provider-agnostic, behind an env flag, with a deterministic fallback.
9. **No new scheduler until queues prove insufficient.** Start with dashboard queues and manual actions; add Vercel Cron only when a measured need exists (`vercel.json:1-12` currently has no crons).
10. **No local disk for sensitive documents.** Use Google Drive via the existing service account (`src/lib/driveService.ts`).

---

## 2. Current architecture (verified)

```
Browser (React 18 / Next.js App Router)
  │
  ├── CSRF double-submit (src/middleware.ts:4-10,36-47)
  │
  ├── NextAuth JWT session (src/lib/auth.ts:19-86)
  │     └── role + agencyId + contractorId + clientId
  │
  ├── 62 route handlers (src/app/api/**/route.ts)
  │     ├── guard helpers (src/lib/auth.ts:119-191)
  │     ├── rate limit (src/lib/rateLimit.ts:11-27)
  │     ├── audit (src/lib/audit.ts:14-31)
  │     ├── notifications (src/lib/notifications.ts:11-26)
  │     ├── lifecycle (src/lib/deliverable-lifecycle.ts:5-83)
  │     └── role training (src/lib/role-training-config.ts:7-146)
  │
  ├── Prisma 5 → PostgreSQL (prisma/schema.prisma:5-9)
  │
  ├── Google Drive (src/lib/driveService.ts; googleapis)
  ├── GitHub (Octokit; src/lib/github.ts)
  ├── Slack (bot token; src/lib/slack.ts)
  └── SMTP (nodemailer; 4 routes, no shared mailer)
```

### 2.1 Verified integration points

| Concern | Existing implementation | Evidence |
|---|---|---|
| Auth | NextAuth credentials, JWT | `src/lib/auth.ts:19-86` |
| Authorization | Role helpers + capability helpers | `src/lib/auth.ts:119-191` |
| CSRF | Double-submit cookie | `src/middleware.ts:4-10,36-47` |
| Rate limit | DB-backed with memory fallback | `src/lib/rateLimit.ts:11-46` |
| Audit | Best-effort `AuditLog` | `src/lib/audit.ts:14-31` |
| Notifications | DB insert + 30s polling | `src/lib/notifications.ts:11-26`; `src/components/NotificationBell.tsx:35` |
| Contracts | SOW + assembly + signatures | `src/app/api/sows/route.ts`; `src/app/api/contracts/assemble/route.ts:49-102`; `prisma/schema.prisma:104-149` |
| Delivery | 11-state lifecycle | `src/lib/deliverable-lifecycle.ts:5-83` |
| Training | Lessons + progress + GitHub/Slack | `prisma/schema.prisma:513-599` |
| Readiness | `computeReadiness` + workforce API | `src/lib/role-training-config.ts:104-146`; `src/app/api/admin/workforce/route.ts:25-136` |
| Storage | Google Drive service | `src/lib/driveService.ts` |
| Deterministic scoring | Growth qualification/scoring | `src/lib/growth.ts:54-146` |

---

## 3. Target architecture

```
                         ┌──────────────────────────────┐
                         │  Public talent application    │
                         │  /apply (new)                 │
                         └──────────────┬───────────────┘
                                        │ POST /api/talent/apply
                                        ▼
┌────────────────────────────────────────────────────────────────────┐
│ Next.js App Router (existing)                                       │
│                                                                    │
│  Applicant routes ──► ApplicantService ──► Prisma                  │
│  Review routes    ──► RubricService    ──► Prisma                  │
│  Decision routes  ──► DecisionService  ──► Prisma + Audit          │
│  Staffing routes  ──► MatchingService  ──► Prisma                  │
│  Queue routes     ──► QueueService     ──► Prisma                  │
│                                                                    │
│  Shared: auth guards, rateLimit, logAudit, notifications,          │
│          mailer adapter, drive adapter, AI adapter (optional)      │
└───────────────┬───────────────────────────────┬────────────────────┘
                │                               │
                ▼                               ▼
        PostgreSQL (Prisma)                Google Drive
        existing + new tables              portfolios, documents
                │
                ▼
        Optional: Vercel Cron ──► /api/internal/talent/jobs
        (only after queues prove insufficient)
```

### 3.1 Component responsibilities

| Component | Responsibility | Reuse |
|---|---|---|
| `/apply` page | Public form, validation, consent | New UI, existing design system |
| `POST /api/talent/apply` | Validate, rate-limit, create applicant, notify, acknowledge | Booking/growth-lead pattern |
| `ApplicantService` | Dedupe, triage, status transitions | New, uses Prisma |
| `RubricService` | Deterministic scoring, evidence completeness | New, patterned on `growth.ts` |
| `DecisionService` | Packet assembly, approval record | New, uses `logAudit` |
| `MatchingService` | Eligibility, availability, ranking | New, reads existing tables |
| `QueueService` | Queue items, SLA clocks, escalation | New |
| `Mailer` | One transport, templates, retries, logs | New abstraction over nodemailer |
| `AiAdapter` | Optional drafting | New, env-gated |
| Existing contractor/SOW/contract/deliverable flows | Downstream execution | Reuse unchanged |

---

## 4. Proposed data model

All models are `PROPOSED`. Names are suggestions and must be reviewed against Prisma conventions and the existing schema.

### 4.1 Applicant and application

```prisma
model Applicant {
  id                String   @id @default(uuid())
  reference         String   @unique          // public reference, e.g. WID-T-2026-0001
  firstName         String
  lastName          String
  email             String
  emailNormalized   String   @unique
  phone             String?
  city              String?
  country           String   @default("United States")
  timezone          String?
  primaryRole       String
  vertical          String                      // photography | videography | content_social | design
  secondaryRoles    String   @default("[]")     // JSON array
  yearsExperience   Int?
  seniority         String?                     // junior | mid | senior | lead
  portfolioUrl      String?
  reelUrl           String?
  linkedinUrl       String?
  availabilityStart DateTime?
  weeklyCapacity    String?
  rateExpectation   Float?
  rateType          String?
  engagementPref    String?
  source            String?
  sourceDetail      String?
  consent           Boolean  @default(false)
  consentAt         DateTime?
  retentionUntil    DateTime?
  status            String   @default("received")
  // received | acknowledged | triage_passed | triage_hold | in_review
  // reviewed | interview_scheduled | interviewed | verification
  // decision_pending | advanced | held | declined | withdrawn
  // duplicate | ineligible | archived
  duplicateOfId     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  assets            ApplicationAsset[]
  reviews           TalentReview[]
  interviews        TalentInterview[]
  credentials       TalentCredential[]
  references        TalentReference[]
  decisions         TalentDecision[]
  events            ApplicantEvent[]

  @@index([status])
  @@index([vertical])
  @@index([createdAt])
}

model ApplicationAsset {
  id          String   @id @default(uuid())
  applicantId String
  applicant   Applicant @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  type        String   // image | video | document | link
  url         String
  driveFileId String?
  label       String?
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
}

model ApplicantEvent {
  id          String   @id @default(uuid())
  applicantId String
  applicant   Applicant @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  type        String   // status_change | note | email | document | score
  fromStatus  String?
  toStatus    String?
  actorUserId String?
  metadata    String   @default("{}")
  createdAt   DateTime @default(now())

  @@index([applicantId, createdAt])
}
```

### 4.2 Talent profile (after promotion)

```prisma
model TalentProfile {
  id              String   @id @default(uuid())
  applicantId     String?  @unique
  contractorId    String?  @unique
  headline        String?
  bio             String   @default("")
  city            String?
  timezone        String?
  travelRadiusMi  Int?
  remoteOk        Boolean  @default(true)
  seniority       String?
  rateDefault     Float?
  rateType        String?
  currency        String   @default("USD")
  status          String   @default("approved_talent")
  // applicant | approved_talent | onboarding | ready | active | bench | alumni | offboarded
  reliabilityScore Float   @default(0)
  qualityScore    Float   @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  skills          TalentSkill[]
  availability    TalentAvailability[]
  portfolio       TalentPortfolioItem[]
  performance     TalentPerformance[]
  rateHistory     TalentRate[]

  @@index([status])
  @@index([city])
}

model TalentSkill {
  id              String   @id @default(uuid())
  talentProfileId String
  talentProfile   TalentProfile @relation(fields: [talentProfileId], references: [id], onDelete: Cascade)
  skill           String
  level           Int      @default(3)   // 1-5
  verified        Boolean  @default(false)
  verifiedBy      String?
  evidenceUrl     String?

  @@unique([talentProfileId, skill])
}

model TalentAvailability {
  id              String   @id @default(uuid())
  talentProfileId String
  talentProfile   TalentProfile @relation(fields: [talentProfileId], references: [id], onDelete: Cascade)
  startDate       DateTime
  endDate         DateTime
  status          String   @default("available") // available | tentative | booked | blocked
  note            String?
  createdAt       DateTime @default(now())

  @@index([talentProfileId, startDate])
}

model TalentPortfolioItem {
  id              String   @id @default(uuid())
  talentProfileId String
  talentProfile   TalentProfile @relation(fields: [talentProfileId], references: [id], onDelete: Cascade)
  title           String
  type            String   // image | video | case_study | design | post
  url             String
  thumbnailUrl    String?
  roleOnPiece     String?
  clientName      String?   // only if rights allow
  year            Int?
  rightsStatus    String   @default("unknown") // public | client_approved | private | unknown
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())

  @@index([talentProfileId])
}
```

**Important:** do **not** reuse `PortfolioItem`. It is an internal developer-portfolio artifact keyed to a platform `User` and `PortalTask` (`prisma/schema.prisma:626-654`). Overloading it would conflate two domains.

### 4.3 Review, interview, verification, decision

```prisma
model TalentReview {
  id            String   @id @default(uuid())
  applicantId   String
  applicant     Applicant @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  reviewerId    String
  vertical      String
  rubricVersion String
  weightedScore Float?
  band          String?
  evidenceCompleteness Int @default(0)
  confidence    String   @default("low")
  summary       String   @default("")
  recommendation String  @default("hold") // advance | hold | decline
  overrideReason String?
  createdAt     DateTime @default(now())

  scores        TalentReviewScore[]

  @@index([applicantId])
  @@index([reviewerId])
}

model TalentReviewScore {
  id            String   @id @default(uuid())
  reviewId      String
  review        TalentReview @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  criterion     String
  score         Int?
  weight        Int
  evidenceNote  String   @default("")
  evidenceUrl   String?

  @@unique([reviewId, criterion])
}

model TalentInterview {
  id            String   @id @default(uuid())
  applicantId   String
  applicant     Applicant @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  interviewerId String
  type          String   // portfolio | technical | culture | final
  scheduledAt   DateTime?
  timezone      String?
  calendarEventId String?
  meetingUrl    String?
  status        String   @default("proposed")
  // proposed | scheduled | completed | no_show | cancelled
  scorecard     String   @default("{}")
  notes         String   @default("")
  createdAt     DateTime @default(now())

  @@index([applicantId])
  @@index([scheduledAt])
}

model TalentCredential {
  id            String   @id @default(uuid())
  applicantId   String?
  applicant     Applicant? @relation(fields: [applicantId], references: [id])
  contractorId  String?
  type          String   // tax | insurance | license | right_to_work | other
  label         String
  driveFileId   String?
  status        String   @default("requested")
  // requested | received | verified | rejected | expired | waived
  requestedAt   DateTime?
  receivedAt    DateTime?
  verifiedAt    DateTime?
  verifiedBy    String?
  expiresAt     DateTime?
  notes         String   @default("")

  @@index([contractorId])
  @@index([expiresAt])
}

model TalentReference {
  id            String   @id @default(uuid())
  applicantId   String
  applicant     Applicant @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  name          String
  relationship  String
  contact       String
  status        String   @default("pending") // pending | contacted | completed | unable
  responses     String   @default("{}")
  summary       String   @default("")
  verifiedAt    DateTime?
  createdAt     DateTime @default(now())
}

model TalentDecision {
  id            String   @id @default(uuid())
  applicantId   String
  applicant     Applicant @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  decision      String   // advance | hold | decline
  reasonCode    String
  reasonNote    String   @default("")
  decidedBy     String   // human user id, required
  decidedAt     DateTime @default(now())
  evidence      String   @default("{}")
  nextAction    String?
  nextOwnerId   String?
  nextDueAt     DateTime?

  @@index([applicantId])
}
```

### 4.4 Operations, performance, rate

```prisma
model TalentQueueItem {
  id            String   @id @default(uuid())
  type          String   // application | review | interview | verification | decision |
                          // contract | onboarding | staffing | delivery | payment | performance
  entityType    String
  entityId      String
  ownerUserId   String?
  priority      String   @default("medium")
  status        String   @default("open") // open | in_progress | blocked | done | cancelled
  dueAt         DateTime?
  slaHours      Int?
  escalatedAt   DateTime?
  notes         String   @default("")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([status, dueAt])
  @@index([ownerUserId])
}

model TalentPerformance {
  id              String   @id @default(uuid())
  talentProfileId String
  talentProfile   TalentProfile @relation(fields: [talentProfileId], references: [id], onDelete: Cascade)
  projectId       String?
  deliverableId   String?
  quality         Int?
  timeliness      Int?
  communication   Int?
  compliance      Int?
  clientSat       Int?
  dataPoints      Int      @default(0)
  confidence      String   @default("insufficient_data")
  summary         String   @default("")
  createdAt       DateTime @default(now())

  @@index([talentProfileId])
}

model TalentRate {
  id              String   @id @default(uuid())
  talentProfileId String
  talentProfile   TalentProfile @relation(fields: [talentProfileId], references: [id], onDelete: Cascade)
  rate            Float
  rateType        String
  currency        String   @default("USD")
  approvedBy      String
  effectiveFrom   DateTime
  effectiveTo     DateTime?
  reason          String   @default("")

  @@index([talentProfileId, effectiveFrom])
}

model RateBand {
  id            String   @id @default(uuid())
  role          String
  seniority     String
  rateType      String
  minAmount     Float
  maxAmount     Float
  currency      String   @default("USD")
  effectiveFrom DateTime
  effectiveTo   DateTime?
  approvedBy    String

  @@unique([role, seniority, rateType, effectiveFrom])
}

model RateException {
  id            String   @id @default(uuid())
  sowId         String
  requestedBy   String
  approvedBy    String?
  reason        String
  marginPct     Float?
  status        String   @default("pending") // pending | approved | rejected
  createdAt     DateTime @default(now())
}
```

### 4.5 Email and automation observability

```prisma
model EmailLog {
  id            String   @id @default(uuid())
  toAddress     String
  template      String
  subject       String
  status        String   // queued | sent | failed | bounced
  providerId    String?
  error         String?
  relatedType   String?
  relatedId     String?
  createdAt     DateTime @default(now())

  @@index([status, createdAt])
  @@index([relatedType, relatedId])
}

model AutomationRun {
  id            String   @id @default(uuid())
  automation    String   // A..K
  mode          String   // preview | live
  status        String   // started | succeeded | failed | fallback
  entityType    String?
  entityId      String?
  fallbackReason String?
  durationMs    Int?
  createdAt     DateTime @default(now())

  @@index([automation, createdAt])
  @@index([status])
}
```

### 4.6 Demand side: opportunities and requirements

These connect a real client need to the talent pool. They are **not** replacements for `GrowthLead`, `Prospect`, or `BookingInquiry`; each is an optional link.

```prisma
model ProjectOpportunity {
  id                String   @id @default(uuid())
  agencyId          String
  agency            Agency   @relation(fields: [agencyId], references: [id])
  source            String   // inbound | referral | rfp | marketplace | growth_lead | prospect | booking_inquiry | repeat_client
  sourceDetail      String?
  rawText           String?  // original message or listing text
  buyerName         String?
  buyerRole         String?
  buyerCompany      String?
  buyerEmail        String?
  buyerVerified     Boolean  @default(false)
  serviceCategory   String?  // photography | videography | content_social | design_creative
  budgetMin         Int?
  budgetMax         Int?
  budgetCurrency    String?  @default("USD")
  budgetVerified    Boolean  @default(false)
  timelineStart     DateTime?
  timelineEnd       DateTime?
  location          String?
  remote            Boolean?
  rightsSummary     String?
  scores            Json?    // ten dimensions with evidence
  weightedScore     Float?
  band              String   @default("unverified") // unverified | qualify | pursue | hold | decline
  riskLevel         String?  // low | medium | high
  missingInformation Json?
  redFlags          Json?
  ownerUserId       String?
  responseDeadline  DateTime?
  growthLeadId      String?
  prospectId        String?
  bookingInquiryId  String?
  requirement       OpportunityRequirement?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([band, responseDeadline])
  @@index([agencyId, createdAt])
}

model OpportunityRequirement {
  id              String   @id @default(uuid())
  opportunityId   String   @unique
  opportunity     ProjectOpportunity @relation(fields: [opportunityId], references: [id])
  serviceCategory String
  roles           Json     // required roles and counts
  skills          Json     // required skills and levels
  startDate       DateTime?
  endDate         DateTime?
  location        String?
  remote          Boolean?
  crewSize        Int?
  deliverables    Json?
  rights          String?
  budgetBand      String?
  paymentTerms    String?
  revisionRounds  Int?
  confidentiality String?
  fieldStatus     Json     // per field: confirmed | inferred | missing
  sourceQuotes    Json?    // quote per confirmed field
  conflicts       Json?
  confirmedBy     String?
  confirmedAt     DateTime?
  sowId           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Rules:**

- A field marked `confirmed` must carry a source quote and a human confirmation event.
- `band` may not be `pursue` while `buyerVerified`, budget, or scope is missing (`16_PROJECT_LISTING_EVALUATION_PLAYBOOK.md` §2.1).
- Matching reads only opportunities with `band = pursue` and a `confirmed` requirement set.
- Neither model stores talent PII; they are demand-side only.

---

## 5. Relationship to existing models

```
Applicant ──(advance)──► TalentProfile ──(link)──► Contractor
   │                          │                        │
   │                          ├── TalentSkill           ├── ContractorRole
   │                          ├── TalentAvailability    ├── SOW
   │                          ├── TalentPortfolioItem   ├── AssembledContract
   │                          ├── TalentRate            ├── TrainingAssignment
   │                          └── TalentPerformance     └── Deliverable
   │
   ├── TalentReview
   ├── TalentInterview
   ├── TalentCredential
   ├── TalentReference
   └── TalentDecision

ProjectOpportunity ──1:1──► OpportunityRequirement
   ├──(optional)──► GrowthLead
   ├──(optional)──► Prospect
   ├──(optional)──► BookingInquiry
   └──(won)──────► SOW ──► Client / Project
```

**Why a separate `TalentProfile` instead of extending `Contractor`?**

- `Contractor` is a legal/records entity created only after approval (`prisma/schema.prisma:53-78`). Applicants must exist before that.
- Rejected applicants should not become contractors.
- Availability, skills, portfolio, and rate history are talent-domain concepts that would bloat the contractor record and complicate every contractor query.
- The link is one-to-one and optional, so the existing contractor flows remain unchanged.

**Alternative considered:** add fields to `Contractor` and create contractors at application time. Rejected because it pollutes the contractor list, breaks the "invited/active/terminated" semantics, and makes reporting harder.

---

## 6. API design

### 6.1 Public

| Method | Route | Purpose | Guard |
|---|---|---|---|
| `POST` | `/api/talent/apply` | Submit application | rate limit + CSRF public list |
| `GET` | `/api/talent/apply/status?ref=` | Check status by reference + email | rate limit, no enumeration |
| `POST` | `/api/talent/withdraw` | Withdraw application | rate limit + reference |

**Security:** status lookup requires **both** reference and email; return a generic response for mismatches. Never expose a sequential ID.

### 6.2 Admin/staff

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/admin/talent/applicants` | List/filter applicants |
| `GET` | `/api/admin/talent/applicants/[id]` | Detail + timeline |
| `PATCH` | `/api/admin/talent/applicants/[id]` | Update status/notes (whitelisted fields) |
| `POST` | `/api/admin/talent/applicants/[id]/review` | Record rubric review |
| `POST` | `/api/admin/talent/applicants/[id]/interview` | Schedule interview |
| `POST` | `/api/admin/talent/applicants/[id]/credential` | Request/verify credential |
| `POST` | `/api/admin/talent/applicants/[id]/reference` | Record reference |
| `POST` | `/api/admin/talent/applicants/[id]/decision` | Record human decision (approval required) |
| `POST` | `/api/admin/talent/applicants/[id]/promote` | Create `TalentProfile` + draft `Contractor` |
| `GET` | `/api/admin/talent/queue` | Queue with SLA |
| `GET` | `/api/admin/talent/analytics` | Funnel and quality metrics |
| `GET` | `/api/admin/talent/opportunities` | List/filter opportunities by band and deadline |
| `POST` | `/api/admin/talent/opportunities` | Capture a listing manually |
| `GET` | `/api/admin/talent/opportunities/[id]` | Detail, scores, red flags |
| `PATCH` | `/api/admin/talent/opportunities/[id]` | Verify buyer, set band (whitelisted fields) |
| `POST` | `/api/admin/talent/opportunities/[id]/requirements` | Extract/save requirements with source quotes |
| `POST` | `/api/admin/talent/opportunities/[id]/requirements/confirm` | Human confirms the requirement set |
| `POST` | `/api/admin/talent/opportunities/[id]/shortlist` | Generate a shortlist (system) |
| `POST` | `/api/admin/talent/opportunities/[id]/assign` | Human selects talent (no auto-contact) |

### 6.3 Internal jobs (only if needed)

| Method | Route | Purpose | Protection |
|---|---|---|---|
| `POST` | `/api/internal/talent/jobs` | Run SLA scans/reminders | `CRON_SECRET` header + admin session in preview |

**Do not add this route until a queue cannot meet the need.** `vercel.json:1-12` currently has no cron configuration.

### 6.4 Route conventions

- Validate with explicit allowlists, not `...body` (see finding F-03).
- Scope every query by `agencyId` where the model has it.
- Return typed error codes, not raw exception messages.
- Use `logAudit` on every state change.
- Use `createNotification` for in-app alerts.
- Use the mailer adapter for outbound email.

---

## 7. State machines

### 7.1 Applicant

```
received
  → acknowledged
  → triage_passed | triage_hold | ineligible | duplicate
  → in_review
  → reviewed
  → interview_scheduled | no_response
  → interviewed
  → verification
  → decision_pending
  → advanced | held | declined | withdrawn
  → archived
```

Rules:

- `advanced` requires a `TalentDecision` with `decidedBy`.
- `declined` requires a reason code.
- `held` requires a next action and due date.
- `archived` requires retention check.

### 7.2 Talent

```
approved_talent → onboarding → ready → active → bench → alumni → offboarded
```

Rules:

- `ready` requires training 100% + integrations verified + documents valid.
- `active` requires an accepted assignment and an active contract.
- `offboarded` requires the offboarding checklist.

### 7.3 Queue item

```
open → in_progress → done
  ├── blocked → in_progress
  └── cancelled
```

Rules:

- Every item has an owner and a due date.
- Escalation is a timestamp, not a new status.
- Closing requires a note.

### 7.4 Opportunity

```
unverified
  → qualify
  → pursue
  → staffing
  → won | lost

qualify → hold → qualify
qualify | pursue → decline
```

Rules:

- Only `pursue` may enter `staffing`.
- `staffing` requires a human-confirmed requirement set.
- `won` requires a signed SOW; no automation sets `won`.
- `decline` and `lost` require a reason and close the queue item.

---

## 8. Storage design

### 8.1 Folders

```
Agency Drive root/
  Contractors/
    {contractorId}/
      Contracts/
      Documents/
      Deliverables/
  Talent/
    {applicantId}/
      Application/
      Portfolio/
      Verification/        ← restricted
  Clients/
    {clientId}/
```

### 8.2 Rules

- Application samples may live in `Talent/{id}/Portfolio` with public-readable links only if the candidate consented.
- Verification documents go to `Talent/{id}/Verification` with restricted access.
- Never place restricted documents in a public folder.
- Store Drive file IDs in the database, not full URLs with tokens.
- Reuse `driveService.ts` and the existing upload whitelist/size caps.

`CONFIRMED`: the current upload route whitelists contractor document fields and extensions (`src/app/api/contractors/[id]/upload/route.ts`). Extend the same pattern; do not relax it.

---

## 9. Email architecture

`CONFIRMED`: today, four route files each create a nodemailer transport and there is no shared template or delivery log (`booking:3,38-58`; `plugin-lead:3,47-57`; `growth-lead:3,125-142`; `reset-password:3,35-49`).

`PROPOSED`:

```
src/lib/email/
  transport.ts      // one nodemailer transport from env
  templates/        // typed templates (application_received, hold, decline, ...)
  send.ts           // send + log + retry policy
  types.ts
```

Requirements:

- One transport, lazily created.
- Template registry with versioned IDs.
- `EmailLog` row for every send.
- Retry with backoff (max 3), then queue for manual resend.
- No restricted data in email bodies.
- Reply-to a monitored mailbox.
- Bounce handling (at minimum, log the failure).

---

## 10. AI adapter

```
src/lib/ai/
  adapter.ts        // interface: complete(prompt, schema) -> result
  providers/        // optional provider implementations
  redact.ts         // block restricted fields
  registry.ts       // prompt versions
  guard.ts          // kill switch, cost cap, timeout
```

Interface:

```ts
export interface AiAdapter {
  enabled(): boolean;
  complete<T>(input: {
    promptId: string;
    system: string;
    user: string;
    schema: unknown;
    maxTokens?: number;
  }): Promise<{ ok: true; data: T; model: string } | { ok: false; reason: string }>;
}
```

Rules:

- `enabled()` reads `TALENT_AI_ENABLED`.
- If disabled or failing, callers use the deterministic fallback.
- Redaction runs before the provider call.
- Log `AutomationRun` with `automation` and `fallbackReason`.
- No provider key in client code.

---

## 11. Non-functional requirements

| Requirement | Target |
|---|---|
| Application submit latency | p95 < 1.5s excluding file upload |
| Admin list latency | p95 < 800ms for 10k applicants |
| Availability | 99.5% monthly |
| Data durability | PostgreSQL backups per existing provider |
| Audit coverage | 100% of state-changing talent routes |
| Authorization | 100% of routes guarded |
| Rate limits | Public apply: 5/hour/IP; status: 20/hour/IP |
| Accessibility | WCAG 2.1 AA for `/apply` |
| Mobile | Application usable on a 375px viewport |
| Retention | Configurable per consent; default 12 months |
| Observability | Every automation run logged with status |

---

## 12. Migration and rollout

`CONFIRMED`: the project uses `prisma db push` and has no migrations directory (`AGENTS.md:12`; `prisma/migrations` absent). `docs/SESSION_HANDOFF.md:27-31` documents a prior schema-drift incident.

`PROPOSED` rollout:

1. **Baseline the database.** Use `prisma migrate diff` to create a baseline migration from the current database, then adopt `prisma migrate` for all new changes. Do not run `db push` against production after the baseline.
2. **Add tables in an additive migration.** No destructive changes to existing tables in Phase 1.
3. **Backfill nothing initially.** Applicants are new. `TalentProfile` is created on promotion.
4. **Feature-flag the new UI.** `TALENT_OPS_ENABLED` hides `/apply` and admin routes until approved.
5. **Seed synthetic data** for dry runs. No real applicant data in test environments.
6. **Rollback:** additive tables can be left unused; disable the flag; no existing flow depends on them.

**Do not** alter `Contractor`, `SOW`, `Deliverable`, or auth tables in Phase 1. Add nullable relations only when needed.

---

## 13. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Schema drift | Data loss / runtime errors | Baseline migrations; no `db push` in prod |
| Public form abuse | Spam, cost | Rate limit, honeypot, email verification, moderation |
| PII in Drive | Leak | Restricted folders; least-privilege service account |
| AI hallucination | Bad decisions | Deterministic rubric; human review; evidence citations |
| Duplicate applicants | Bad data | Unique normalized email + human merge |
| Queue overload | SLA failure | Capacity planning; escalation; prioritization |
| Overbuilding | Cost/time | Phase 1 is intake + review + decision only |
| Vendor lock-in | Cost | Provider-agnostic adapter; deterministic fallback |
| Auth regression | Security | Reuse guards; add route tests |
| Mass assignment | Security | Allowlist fields (fix F-03 pattern) |

---

## 14. Build vs reuse matrix

| Need | Build | Reuse | Decision |
|---|---|---|---|
| Applicant form | Yes | Design system | Build thin |
| Auth | No | NextAuth | Reuse |
| Role checks | No | `auth.ts` | Reuse |
| Audit | No | `logAudit` | Reuse |
| Notifications | No | `createNotification` | Reuse |
| Email transport | Adapter | nodemailer | Abstract |
| File storage | No | Drive service | Reuse |
| Rubric scoring | Yes | `growth.ts` pattern | Build deterministic |
| Contracts | No | SOW + assembly + signatures | Reuse |
| Training | No | Lessons + readiness | Reuse |
| Delivery QA | Extend | Lifecycle | Extend |
| Availability | Yes | — | Build |
| Opportunity capture | Yes | `GrowthLead` / `Prospect` / `BookingInquiry` as links | Build thin, link only |
| Requirement extraction | Yes | `SOW` as downstream target | Build deterministic |
| Matching | Yes | Existing assignment flow | Build deterministic |
| Analytics | Yes | SQL/Prisma | Build minimal |
| Scheduler | Delay | Vercel Cron later | Defer |
| AI | Adapter | — | Optional, later |

---

## 15. Architecture decision records (proposed)

| ADR | Decision | Rationale |
|---|---|---|
| ADR-001 | Extend the monolith; no new service | Cost, auth, deployment simplicity |
| ADR-002 | Separate `Applicant`/`TalentProfile` from `Contractor` | Correct lifecycle and reporting |
| ADR-003 | Do not reuse `PortfolioItem` | It is an internal developer artifact |
| ADR-004 | Deterministic rubric before AI | Fairness, reproducibility, cost |
| ADR-005 | Queue-first, scheduler-later | Avoid new infra until measured |
| ADR-006 | One email adapter | Consistency and observability |
| ADR-007 | Additive migrations only in Phase 1 | Safety |
| ADR-008 | Human approval records are mandatory | Accountability |
| ADR-009 | Demand-side opportunities are a separate model linked to existing leads | Avoid overloading `GrowthLead` / `Prospect`; keeps talent and sales data clean |
