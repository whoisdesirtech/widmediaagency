# 22 — Database and Integration Recommendations

**Purpose:** Specify the database changes and integration decisions needed for the talent operations system, with the rationale, constraints, migration path, and cost.
**Status:** `PROPOSED`. No schema change is authorized.
**Related:** `12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` (full model sketches), `13_SECURITY_AND_APPROVAL_POLICY.md` (data handling), `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md` (phasing).

---

## 1. Guiding decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | One PostgreSQL database, additive tables | Reuse Prisma, backups, auth, and reporting; no new service |
| D2 | New `Applicant` / `TalentProfile` domain, linked to `Contractor` | Applicants exist before approval; rejected applicants must not pollute contractor records |
| D3 | Do not reuse `PortfolioItem` | It is an internal developer artifact (`prisma/schema.prisma:626-654`) |
| D4 | Do not overload `GrowthLead` / `Prospect` | They are demand-side records; mixing talent fields breaks both |
| D5 | Strings for workflow status, with a shared constants module | Matches the existing codebase; avoids migration churn for new states |
| D6 | JSON only for variable payloads (scores, metadata), not for queryable fields | Queryable data gets columns and indexes |
| D7 | Soft-delete only where audit/contract requires; otherwise anonymize | Preserves obligations without retaining PII |
| D8 | Forward-only migrations after a baseline | The repo currently uses `db push` with no migrations; drift already caused an outage |
| D9 | No scheduler until a queue proves insufficient | `vercel.json` has no crons today; avoid new infrastructure |
| D10 | AI behind an adapter, disabled by default | No AI SDK today; deterministic path must work alone |

---

## 2. New models (summary)

Full field-level sketches are in `12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` §4. This table is the build checklist.

| Model | Purpose | Key relations | Phase |
|---|---|---|---|
| `Applicant` | Pre-decision pipeline record | → assets, reviews, interviews, credentials, references, decisions, events | 1 |
| `ApplicationAsset` | Portfolio sample or document link | → `Applicant` | 1 |
| `ApplicantEvent` | Timeline of status changes and notes | → `Applicant` | 1 |
| `TalentProfile` | Approved talent record | → `Applicant` (1:1 optional), `Contractor` (1:1 optional) | 2–3 |
| `TalentSkill` | Skill and verified level | → `TalentProfile` | 2 |
| `TalentAvailability` | Date-range availability | → `TalentProfile` | 4 |
| `TalentPortfolioItem` | Talent media item with rights status | → `TalentProfile` | 2 |
| `TalentReview` / `TalentReviewScore` | Rubric review and criterion scores | → `Applicant`, reviewer | 2 |
| `TalentInterview` | Interview record and scorecard | → `Applicant` | 2 |
| `TalentCredential` | Document request/verification | → `Applicant`, `Contractor` | 2 |
| `TalentReference` | Reference check | → `Applicant` | 2 |
| `TalentDecision` | Human decision record | → `Applicant` | 2 |
| `TalentQueueItem` | Queue, SLA, escalation | polymorphic entity | 1 |
| `TalentPerformance` | Performance facts | → `TalentProfile`, `Deliverable` | 6 |
| `TalentRate` | Approved rate history | → `TalentProfile` | 6 |
| `RateBand` | Approved rate ranges | — | 6 |
| `RateException` | Approved exception | → `SOW` | 6 |
| `EmailLog` | Delivery log | polymorphic entity | 1 |
| `AutomationRun` | Automation observability | polymorphic entity | 1 |
| `ProjectOpportunity` | Demand-side listing | → `GrowthLead`, `Prospect`, `BookingInquiry` (optional) | 3 |
| `OpportunityRequirement` | Extracted requirement fields | → `ProjectOpportunity`, `SOW` (optional) | 3 |

**Total:** 22 new models. All additive; no existing table altered in Phase 1.

---

## 3. Indexes and constraints

### 3.1 Uniqueness

| Constraint | Why |
|---|---|
| `Applicant.emailNormalized @unique` | Prevent duplicate active pipelines |
| `Applicant.reference @unique` | Public lookup |
| `TalentProfile.applicantId @unique` | One profile per applicant |
| `TalentProfile.contractorId @unique` | One contractor link |
| `TalentSkill @@unique([talentProfileId, skill])` | No duplicate skills |
| `TalentReviewScore @@unique([reviewId, criterion])` | No duplicate criterion scores |
| `RateBand @@unique([role, seniority, rateType, effectiveFrom])` | One band per combination per date |
| `TalentAvailability` overlap check (application-level) | Prevent double-booking |

### 3.2 Indexes

| Index | Why |
|---|---|
| `Applicant(status)`, `(vertical)`, `(createdAt)` | Queue and funnel queries |
| `ApplicantEvent(applicantId, createdAt)` | Timeline |
| `TalentQueueItem(status, dueAt)` | SLA scan |
| `TalentQueueItem(ownerUserId)` | My queue |
| `TalentAvailability(talentProfileId, startDate)` | Matching |
| `TalentInterview(scheduledAt)` | Calendar |
| `TalentCredential(expiresAt)` | Expiry scan |
| `EmailLog(status, createdAt)` | Failure monitoring |
| `AutomationRun(automation, createdAt)` | Fallback rate |
| `ProjectOpportunity(band, responseDeadline)` | Listing queue |
| `TalentDecision(applicantId)` | Decision history |

### 3.3 Referential behavior

- Child records cascade on applicant delete only where the record has no legal/audit value.
- `TalentDecision`, `AuditLog`, and `Signature` do not cascade; anonymize instead.
- `TalentProfile.contractorId` uses `onDelete: SetNull` so contractor archival does not delete talent history.

---

## 4. Status vocabularies

Keep status as `String` with a single exported constants module, matching existing patterns (`src/lib/deliverable-lifecycle.ts`). Do not scatter literals.

| Domain | States |
|---|---|
| Applicant | `received`, `acknowledged`, `triage_passed`, `triage_hold`, `in_review`, `reviewed`, `interview_scheduled`, `interviewed`, `verification`, `decision_pending`, `advanced`, `held`, `declined`, `withdrawn`, `duplicate`, `ineligible`, `archived` |
| Talent | `applicant`, `approved_talent`, `onboarding`, `ready`, `active`, `bench`, `alumni`, `offboarded` |
| Queue | `open`, `in_progress`, `blocked`, `done`, `cancelled` |
| Opportunity | `unverified`, `qualify`, `pursue`, `hold`, `decline`, `won`, `lost` |
| Credential | `requested`, `received`, `verified`, `rejected`, `expired`, `waived` |
| Decision | `advance`, `hold`, `decline` |

**Rule:** transitions are enforced in one module, not in each route. Tests cover every allowed and forbidden transition.

---

## 5. Migration strategy

`CONFIRMED`: the project has no `prisma/migrations` directory and uses `db push` (`AGENTS.md:12`). `docs/SESSION_HANDOFF.md:27-31` documents a schema-drift incident that broke contractor login.

### 5.1 Baseline

1. Freeze schema changes.
2. Run `prisma migrate diff` from the live database to the current schema to produce a baseline.
3. Review the baseline for destructive statements; remove them.
4. Apply the baseline in staging; verify with a schema comparison.
5. Adopt `prisma migrate deploy` for all future changes.

### 5.2 Phase 1 migration

- Additive `CREATE TABLE` and indexes only.
- No `ALTER` on `Contractor`, `SOW`, `Deliverable`, `User`, or auth tables.
- Add nullable `talentProfileId` to nothing existing; link from the new side.
- Run in a transaction where the database supports it.
- Verify row counts and foreign keys after apply.

### 5.3 Rollback

- Additive tables can remain unused; disable the feature flag.
- If a migration must be reversed, restore from the pre-migration backup; do not hand-edit production.
- Test the rollback in staging before production.

### 5.4 Data backfill

- None in Phase 1. Applicants are new.
- `TalentProfile` is created only on promotion.
- Existing contractors are not migrated into talent profiles automatically; link only when a human confirms.

---

## 6. Integration recommendations

### 6.1 Email

| Option | Decision |
|---|---|
| Keep four ad-hoc nodemailer transports | Rejected: no log, no templates, no retry, inconsistent branding |
| New shared adapter over nodemailer | **Recommended**: one transport, typed templates, `EmailLog`, retry, reply-to |
| Paid transactional email vendor | Not needed at current volume; revisit only if deliverability fails |

**Env:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_REPLY_TO`.
**Rule:** no Restricted data in bodies; log metadata only.

### 6.2 File storage

| Option | Decision |
|---|---|
| Local disk | Rejected: existing flows use Drive; no durable local storage |
| Google Drive via service account | **Recommended**: already integrated (`src/lib/driveService.ts`) |
| New object store (S3/Supabase Storage) | Not needed; avoid a second permission model |

**Folders:** `Talent/{applicantId}/Application`, `/Portfolio`, `/Verification` (restricted).
**Rule:** store file IDs, not tokenized URLs.

### 6.3 Calendar

| Option | Decision |
|---|---|
| Manual scheduling | Acceptable for Phase 2 |
| Existing Google Calendar integration | Reuse if already configured for the agency; `UNKNOWN` current scope |
| New calendar vendor | Rejected |

**Rule:** store the event ID and timezone; do not claim a slot is booked until the provider confirms.

### 6.4 AI

| Option | Decision |
|---|---|
| No AI | Valid; all automations have deterministic paths |
| Provider-agnostic adapter, disabled by default | **Recommended when approved** |
| Provider SDK embedded in routes | Rejected: lock-in and leakage risk |

**Env:** `TALENT_AI_ENABLED`, `TALENT_AI_PROVIDER`, `TALENT_AI_API_KEY`, `TALENT_AI_MODEL`, `TALENT_AI_DAILY_COST_CAP`.
**Rule:** redaction before send; schema validation; fallback on failure.

### 6.5 Scheduler

| Option | Decision |
|---|---|
| Vercel Cron | Defer until a queue proves insufficient; then a single protected job route |
| External worker | Rejected: new infrastructure and cost |
| Manual "run scan" button | **Start here**; same code path as the future cron |

**Env (later):** `CRON_SECRET`.

### 6.6 Auth

| Option | Decision |
|---|---|
| Existing NextAuth + role guards | **Reuse**; no new identity provider |
| Separate talent login | Not needed; applicants use reference + email status lookup |
| Firebase or social login | Out of scope; do not change |

---

## 7. Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Existing | Prisma connection |
| `DIRECT_URL` | Existing | Migrations |
| `NEXTAUTH_SECRET` | Existing | Session signing |
| `NEXTAUTH_URL` | Existing | Auth callbacks |
| `TALENT_OPS_ENABLED` | New | Public and admin talent surface |
| `TALENT_AUTOMATION_ENABLED` | New | All automations; false = manual |
| `TALENT_AI_ENABLED` | New | AI adapter |
| `TALENT_EMAIL_ENABLED` | New | Outbound talent email |
| `SMTP_*` | Existing/unknown | Email transport |
| `GOOGLE_*` | Existing/unknown | Drive service account |
| `CRON_SECRET` | Later | Protected job route |

**Rule:** never expose these to the client bundle; document them in `.env.example` when added.

---

## 8. Cost analysis

| Item | Current | Phase 1 | Phase 2–6 | Phase 7 |
|---|---|---|---|---|
| Database | Existing Supabase | No change | More rows; monitor plan | No change |
| Hosting | Existing Vercel | No change | No change | No change |
| Email | Existing SMTP | Same provider | Same | Same |
| Storage | Existing Drive | More files | More files | No change |
| Scheduler | None | None (manual) | Vercel Cron (included) | Included |
| AI | None | None | None | Per-token; capped |
| New vendors | 0 | 0 | 0 | 0–1 (AI, optional) |

**Conclusion:** the system can ship with **zero new paid infrastructure**. The only optional cost is AI usage, and it is capped and disableable.

---

## 9. Alternatives considered and rejected

| Alternative | Why rejected |
|---|---|
| Separate microservice for talent | New deploy, auth, and cost for a small team |
| ATS SaaS | Recurring cost; duplicates existing contracts and training |
| Extending `Contractor` for applicants | Pollutes legal records; rejected applicants become contractors |
| Reusing `PortfolioItem` | Wrong domain; would conflate developer and talent media |
| Scraping marketplaces | Terms, reliability, and legal risk |
| Auto-assignment | Removes the human gate the business requires |
| Event-sourced rewrite | Overkill; the current schema is adequate |
| Adding Firebase auth | Not needed; NextAuth already works; explicitly out of scope |

---

## 10. Backup and recovery

- Take a full database backup before the baseline migration and before Phase 1 apply.
- Verify restore in staging, not only that a backup file exists.
- Keep the pre-migration schema snapshot.
- Document the restore owner and target recovery time.
- `UNKNOWN`: current provider backup retention and point-in-time recovery; confirm with the Lead Developer.

---

## 11. Data-quality rules

| Rule | Enforcement |
|---|---|
| Email normalized | Write path |
| Reference format | Generator + unique constraint |
| No orphan queue items | Foreign key + nightly integrity query |
| No decision without actor | Application-level check + test |
| No rate outside band without exception | Application-level check |
| No availability overlap | Transaction + check |
| No Restricted field in `EmailLog` / `AutomationRun` | Redaction test |

---

## 12. Build checklist

- [ ] Baseline migration created and reviewed.
- [ ] Additive migration applied in staging.
- [ ] Constraints and indexes verified.
- [ ] Constants module for every status vocabulary.
- [ ] Transition tests for every state machine.
- [ ] Email adapter with `EmailLog`.
- [ ] Drive folders with restricted access.
- [ ] Feature flags documented in `.env.example`.
- [ ] Backup and restore verified.
- [ ] No change to existing tables in Phase 1.
- [ ] Cost confirmed at zero new vendors.

**End of recommendations.**
