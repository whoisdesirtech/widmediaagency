# Proposal Creator Suite — Architecture

Status: **In progress** (Phases 1–2 shipped). Companion to `ARCHITECTURE.md` § "Proposal Creator Suite — Cross-Project Context" (stage split, entity mapping, integration principles).

## What This Is

A pre-sales system covering prospect research, go-to-market analysis, strategy, AI-assisted proposal generation, and client acceptance. Lives under `Sales` in the admin portal (`Sales → Prospects`). Built phase-by-phase inside this repo, reusing its auth, audit, multi-tenancy, and DB patterns.

## MVP Boundary (DECIDED 2026-08-24)

**In scope:** prospect intake → intelligence → GTM analysis → strategy → proposal build → client-facing proposal + acceptance → manual conversion.

**Explicitly out of scope for MVP:**

| Concern | Decision |
|---|---|
| Payment processing | Cash App link only — no payment integration |
| Prospect → Client conversion | Manual "Convert" button — no automated pipeline |
| Formal contracting | Stays with `MasterAgreement`/`Addendum`/`SOW` stack |
| Post-deposit onboarding docs | Repurposed existing `proposal-generator.ts` (Stage 7, later) |

## Seven-Stage Plan & Status

| # | Stage | Status | Ships |
|---|---|---|---|
| 1 | Prospect Foundation | ✅ Shipped (commit `d720ae3`) | Prospect + ProspectIntelligence models, staff UI, CRUD/intelligence API |
| 2 | GTM Analysis | ✅ Shipped (commit `d720ae3`) | GTMAnalysis model, GTM workspace UI, upsert API |
| 3 | Strategy Builder | ⏳ Next | Strategy artifacts derived from Intelligence + GTM |
| 4 | Proposal Builder | ⏳ Planned | Proposal generation from strategy inputs |
| 5 | Client Acceptance | ⏳ Planned | Client-facing proposal pages + accept/decline flow |
| 6 | Manual Conversion | ⏳ Planned | Staff-triggered Prospect → Client link/convert |
| 7 | Onboarding Docs | ⏳ Later | Existing `proposal-generator.ts` repurposed post-deposit |

## Data Model (as built)

```
Agency 1─* Prospect *─1 User ("ProspectOwner", optional owner)
                │
                1
                │
        ProspectIntelligence (1:1)
                │
                1
                │
          GTMAnalysis (1:1) *─1 User ("GTMReviewedBy", optional reviewer)
```

### Models

**`Prospect`** — pre-sales organization record.
- Scoping: `agencyId` FK→Agency (required), `ownerId` FK→User (nullable)
- Identity: `name`, `websiteUrl`, `instagramHandle`, `tiktokHandle`, `linkedinUrl`
- Contact: `primaryContactName`, `primaryContactEmail`, `primaryContactPhone`
- Classification: `industry`, `category`, `source`
- Pipeline: `status` — `new | researching | qualified | proposal | accepted | lost`

**`ProspectIntelligence`** — research payload (1:1 via unique `prospectId`, cascade delete).
- `researchNotes` (text), `marketFitScore` (Float 0–100), `lastResearchedAt`
- Flexible JSON: `socialProfileData`, `budgetIndicators`, `decisionMakers`, `riskFlags`, `competitiveLandscape`
- Reverse relation: `gtmAnalysis`

**`GTMAnalysis`** — go-to-market recommendation (1:1 via unique `prospectIntelligenceId`, cascade delete).
- `strategySummary` (text)
- Flexible JSON: `pricingRecommendations`, `staffingPlan`, `timelineEstimate`, `keyRisks`, `assumptions`
- Review workflow: `status` — `draft | reviewed | approved`; `reviewedById`/`reviewedAt`
- Prisma accessor note: model name yields `prisma.gTMAnalysis` (unusual casing)

### Reuse decision (recorded 2026-08-24)

Existing `Influencer`/`InfluencerAudit`/`AuditScore` models were reviewed and **not reused**: they are domain-coupled to creator evaluation (per-platform handles, influencer scoring categories). Prospect intelligence needs organizational research (budget signals, decision makers, competitive landscape). Patterns were reused instead: `agencyId` scoping, staff-only guards, audit logging, JSON-field flexibility.

## API Inventory

All routes: staff-only, agency-scoped, CSRF-protected, audit-logged mutations.

| Route | Methods | Purpose |
|---|---|---|
| `/api/sales/prospects` | POST, GET | Create prospect; paginated list w/ status filter |
| `/api/sales/prospects/[id]` | GET, PATCH | View (incl. intelligence + owner); whitelist-field update |
| `/api/sales/prospects/[id]/intelligence` | GET, POST | Fetch; upsert research payload |
| `/api/sales/prospects/[id]/gtm` | GET, POST | Fetch (null if none); upsert analysis (requires intelligence record) |

## UI Inventory

| Page | Purpose |
|---|---|
| `/admin/sales/prospects` | List: status filters, pagination, score preview |
| `/admin/sales/prospects/new` | Intake form (name required, rest optional) |
| `/admin/sales/prospects/[id]` | Detail: Overview + Intelligence tabs; GTM Workspace button; status dropdown |
| `/admin/sales/prospects/[id]/gtm` | GTM workspace: strategy summary, 5 JSON editors, review-status dropdown |

## Security Model

- **Auth:** every handler starts with `requireAdminOrStaff()` + `isNextResponse(user)` check
- **Tenancy:** all lookups filter `agencyId = user.agencyId`; handlers 400 if user has no agency; cross-agency access returns 404
- **Audit:** mutations log via `logAudit()` — actions: `prospect.create`, `prospect.update`, `prospectIntelligence.update`, `gtmAnalysis.update`
- **CSRF:** covered by middleware double-submit cookie (no exemptions added)
- **Regression guard:** `tests/audit-coverage.test.ts` contract test covers new routes

## Verification History

Per-phase gates (all passing at ship time): `prisma validate` → `db push` (additive, prod verified via `information_schema`) → live relational smoke test (create/read/cascade-delete, cleaned up) → `tsc --noEmit` → `next build` → vitest 10/10 → push → prod deploy returns 401 unauthenticated on new endpoints.

## Remaining Roadmap

1. **Phase 3 — Strategy Builder:** derive strategy artifacts from Intelligence + GTM; new model or extension of GTM payload.
2. **Phase 4 — Proposal Builder:** generate proposals from strategy inputs; versioned proposal records.
3. **Phase 5 — Client Acceptance:** public/client-facing proposal pages (follow `/public/proposals/{slug}/` separation principle), accept/decline capture.
4. **Phase 6 — Manual Conversion:** staff-only Convert action linking Prospect → Client (+ Lead chain per `ARCHITECTURE.md` entity mapping).
5. **Phase 7 — Onboarding Docs:** repurpose `proposal-generator.ts` for post-deposit light engagement docs.

Open design decisions deferred to their phases: Organization promote-vs-new (integration blocker noted in `ARCHITECTURE.md`), proposal persistence/versioning model, acceptance identity model (anonymous token vs client login).
