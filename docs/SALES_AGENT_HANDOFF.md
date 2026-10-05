# Sales Agent — Worker Handoff Brief

**Purpose:** Handoff context for a new AI worker (or developer) taking over the Sales Agent / Agent Dashboard program, per the Antigravity + OpenCode Development SOP (handoff-first rule). A new worker must be able to take over from **this document alone**, without private conversation history.

**WHY:** The agency needs a reliable way to connect inbound leads (plugin downloads, booking inquiries) to its CRM (`Prospect`), and later an agent runtime + dashboard that operate on those prospects. This program builds that in phased increments, each phase separately scoped and approved. Read `AGENTS.md` and `docs/P1.1_LEAD_RECONCILIATION_DESIGN.md` in addition to this brief.

**Repo:** `whoisdesirtech/widmediaagency` · Branch `main` · HEAD `0d3c608`

---

## 1. Where We Are in the Program

| Phase | Name | Status |
|-------|------|--------|
| P0.1 | Schema Inspection & Migration Plan | **COMPLETE** |
| P0.2 | Approved Schema Implementation | **COMPLETE** |
| P1.1 | Lead Reconciliation Design (inspection-only) | **COMPLETE — APPROVED** |
| P1.2 | Lead Reconciler implementation | **COMPLETE — ACCEPTED** |

- **P1.1 is approved** (per the Antigravity product-owner decision record) and **P1.2 is implemented and accepted**: the CRM/Reconciler (Agent 1) core now exists (`src/lib/reconcile.ts` pure DI core, `src/lib/reconcile-integration.ts` Prisma wiring, `tests/reconcile.test.ts`). **Agent 2 (Relationship Intelligence) is implemented separately (read-only, no schema change, no trigger)** — see `docs/FIVE_AGENT_IMPLEMENTATION_PLAN.md`. Agent 3, Auto, Tax are **NOT authorized**.
- **The full P1.1 design report is in `docs/P1.1_LEAD_RECONCILIATION_DESIGN.md`.** It is the authoritative record, more detailed than the summary in §5 below. Read it before implementing P1.2.

## 2. Hard Scope Rules (applies to all phases)

- **During any design/inspection phase: DO NOT modify any files.** This program is strictly phased; each phase prompt explicitly authorizes what it may touch and says otherwise STOP.
- Do NOT modify: lead routes (`/api/plugin-lead`, `/api/booking`), sales prospect routes, Prisma schema (outside authorized phases), migrations, API routes, UI, agent runtime, AI/LLM integration, Firebase, Google Sheets, deployment, auth, notifications, or the existing audit implementation.
- Do NOT install packages, commit, deploy, or touch the production database. Development `db:push` only, and only in implementation phases that authorize it.
- If you hit a problem requiring out-of-scope work: **STOP and report** — do not fix opportunistically.

## 3. Current Repository State (verified)

- `git status --short` shows: `M prisma/schema.prisma` (the P0.2 schema change) plus untracked docs and **three new P1.2 source/test files**: `src/lib/reconcile.ts`, `src/lib/reconcile-integration.ts`, `tests/reconcile.test.ts`. No existing application source is modified.
- P0.2 validation: `prisma validate` passed · `typecheck` (tsc --noEmit) passed · Vitest suite passes · dev DB in sync. **No production DB changes.**
- P1.2 validation: `npm run typecheck` passed · `npm test` passed (62 tests, 5 files) · no new dependencies, no schema change.

### Files changed so far (this program)
- **P0.2 — `prisma/schema.prisma` (only)** : added `AgentEvent` model (+3 indexes), `Prospect` reverse relations (`agentEvents`, `pluginDownloadLeads`, `bookingInquiries`), nullable `prospectId` + `@@index([prospectId])`/`@@index([email])` on `PluginDownloadLead` and `BookingInquiry`, and `status`/`reviewedById`/`reviewedAt` + `@@index([status])` on `ProspectIntelligence` (with `IntelligenceReviewedBy` User relation).
- **P1.2 — `src/lib/reconcile.ts` (new):** pure, dependency-injected reconciler (`normalizeEmail`, `buildProspectDraft`, `classifyMatches`, `reconcileLead`, `planAgencyLookup`, `ReconcileRaceError`) — no Prisma import, fully unit-tested.
- **P1.2 — `src/lib/reconcile-integration.ts` (new):** Prisma wiring — deterministic default-agency resolution (env `DEFAULT_AGENCY_ID` override, else sole agency, else fail-closed), interactive `$transaction` via a `ReconcileSeam`, AgentEvent + AuditLog persistence, and entry points `reconcilePluginLead(leadId)` / `reconcileBookingInquiry(id)`.
- **P1.2 — `tests/reconcile.test.ts` (new):** 22 assertions covering normalization, draft mapping (both lead kinds), classification, create/link/already-linked paths, ambiguous, requires-review, agency fail-closed, race rollback (`ReconcileRaceError`), booking sourcing, and agency-plan branches.
- **Docs (this program):** `docs/SALES_AGENT_HANDOFF.md`, `docs/P1.1_LEAD_RECONCILIATION_DESIGN.md`, `docs/FIVE_AGENT_IMPLEMENTATION_PLAN.md`, `docs/PHASE0_READINESS_DECISIONS.md` (untracked, not committed).
- No API routes, lead handlers, auth, notifications, or the existing audit implementation have been modified.

### OUT OF SCOPE (this program / all phases)
- Lead routes (`/api/plugin-lead`, `/api/booking`), sales prospect routes, migrations, API routes, UI, agent runtime, AI/LLM integration, Firebase, Google Sheets, deployment, auth, notifications, and the existing audit implementation.
- Installing packages, committing, deploying, or touching the production database (development `db:push` only, and only in implementation phases that authorize it).

## 4. Files to Read Before Doing Anything

- `prisma/schema.prisma` — focus: `Prospect`, `PluginDownloadLead`, `BookingInquiry`, `ProspectIntelligence`, `GTMAnalysis`, `AgentEvent`, `Agency`, `User`, `AuditLog`, `RateLimitBucket`, `Notification`
- `src/app/api/plugin-lead/route.ts`, `src/app/api/booking/route.ts` — public lead capture (inspection of reconciler integration points)
- `src/app/api/sales/prospects/route.ts`, `[id]/route.ts`, `[id]/intelligence/route.ts`, `[id]/gtm/route.ts` — CRM create/update + agency-scoped auth pattern
- `src/lib/auth.ts`, `src/lib/audit.ts`, `src/lib/notifications.ts`, `src/lib/rateLimit.ts` — auth guards, audit logging, notifications, rate limiting conventions
- `tests/` + `vitest.config.ts` — test style is **pure unit tests on lib functions** (`deliverable-lifecycle.test.ts` is the pattern); the reconciler is implemented as a pure, dependency-injected lib (`src/lib/reconcile.ts`) with a Prisma adapter (`src/lib/reconcile-integration.ts`) and `tests/reconcile.test.ts`
- `AGENTS.md` (mandatory), `docs/KNOWN_ISSUES.md`

## 5. Key Decisions Already Made (do not relitigate)

These come from the approved P0.2 implementation and the P1.1 design. Carry them forward.

- **Match key = normalized email + agency. Exact match only. No fuzzy / organization / domain matching.**
- **Email normalization:** trim → lowercase. Normalize BOTH the lead email and the stored `Prospect.primaryContactEmail` at query time (stored prospect emails are unnormalized; also note `plugin-lead` lowercases at write time but `booking` does not).
- **Scenario results:** `0` matches → create new Prospect; `1` match → link (unless `lost`, see below); `≥2` matches → **`ambiguous` — never auto-link**.
- **`lost` single match → `requires_review` (no write).** **`accepted` single match → link.** Other single-match states → link.
- **Idempotency:** rely on the existing nullable `lead.prospectId`. If already set → return `already_linked`. Guard concurrent creation with a conditional `updateMany({ where: { id, prospectId: null }, data: { prospectId } })` inside a **Prisma `$transaction`**; `count === 0` → roll back and return `already_linked`. **No new DB constraints** (unique-on-email is incorrect and P0 forbade constraints on `prospectId`).
- **New Prospect creation mapping:** `name`/`primaryContactName` = derived from lead name(s); `primaryContactEmail` = normalized email; `source` = `"plugin-lead"` or `"booking-inquiry"` (both safe — `Prospect.source` is a free-form string displayed with a `—` fallback, no enum/filter dependency); `status` = `"new"`; `ownerId` = `null` (no default owner assignment rule exists in the app — do not invent one).
- **Audit:** use `src/lib/audit.ts` `logAudit`, passing `null` as the user (no session in public/background reconcile). Events: `agent.reconcile.create | link | conflict | requires_review | failed` (optionally `already_linked`).
- **Notifications:** staff notification **only on `ambiguous`** events (operational value). Skip on create and on generic failure.
- **Public route integration (recommended): Option B — reconcile after insert, from a separate trigger (cron/sweep/admin endpoint / future Agent Runtime), NOT inside the public request.** There is **no queue/background infra** in this repo (verified) — do not introduce one.

## 6. Q1 — Approved Agency Source (formerly the carry-forward blocker)

**RESOLVED (approved product decision):** The **configured/default `Agency`** is the authoritative agency context for **public-lead reconciliation in the Media MVP**.

- `PluginDownloadLead` and `BookingInquiry` public leads are reconciled **within the resolved configured/default Agency**.
- **Do NOT add `agencyId`** to those public lead models as part of Agent 1. Future explicit multi-agency attribution remains architecturally possible.
- Agency resolution must be **deterministic**. **Do NOT infer** agency identity from SMTP sender names, free-form text, arbitrary metadata, user assumptions, or ambiguous signals.
- **Fail closed:** if the configured/default `Agency` cannot be resolved, reconciliation must **fail safely and surface the error** — never silently attach a lead to an arbitrary Agency.
- Existing evidence for the default-agency pattern: `src/app/api/clients/route.ts` get-or-creates a default `Agency` (`name: 'WhoIsDésir® Media Agency'`).
- P1.2 must resolve and use one explicit default `Agency`; this is now directed, not open.

## 7. Known Issues / Notes (carry forward)

- **Pre-existing (unrelated, do not fix):** contractor-notification `findFirst` duplicate-user bug documented in `docs/KNOWN_ISSUES.md`.
- **Cosmetic, unrelated:** `plugin-lead` route writes `version` default `1.2.0` while the schema default is `1.1.0`.
- **Email inconsistency (reconciler must absorb):** `plugin-lead` lowercases email at write time; `booking` only trims. Normalize both sides at query time; no backfill.
- No queue / cron / background-job infrastructure exists in the repo.

## 8. Conventions to Follow

- Guard every route handler with an auth helper from `src/lib/auth.ts` (e.g. `requireAdminOrStaff()` + `isNextResponse` check).
- Never trust query params / inputs from public (client/contractor) context; scope every query by `agencyId`/owner.
- Casing/whitespace: normalize at the reconciler boundary.
- No secrets, keys, or credentials ever exposed; env vars referenced by name only.
- Follow the repo's pure-function test style for any reconciler logic; run `npm run typecheck` and the test suite when implementing.

## 9. Approval & Next Step

**Current gate: P1.1 COMPLETE — APPROVED. P1.2 — COMPLETE — ACCEPTED (Agent 1 CRM/Reconciler implemented).**

P1.2 implemented per the approved P1.1 design: pure reconciler core (`src/lib/reconcile.ts`), deterministic fail-closed default-agency resolution (Q1), atomic create/link under `$transaction` with conditional link (idempotency + race rollback), AgentEvent + AuditLog persistence, and callable entry points `reconcilePluginLead` / `reconcileBookingInquiry`. **Trigger wiring (cron/sweep/admin endpoint) is intentionally deferred** per P1.1 §16 ("or defer trigger wiring") — the library is callable but nothing invokes it in production yet.

**Authorized now:** review and validate Agent 1 against P1.1 §13/pending scope before any further work.
**NOT authorized:** Agents 2–5 and future vertical implementation (Auto, Tax).

**Test plan reference:** the full scenario→test mapping (16 scenarios) is in `docs/P1.1_LEAD_RECONCILIATION_DESIGN.md` §13.
