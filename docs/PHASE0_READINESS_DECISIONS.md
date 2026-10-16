# Phase 0 — Readiness & Decision Documentation

**Type:** Planning / decision documentation. No implementation in this document.
**Status:** **Q1 RESOLVED** · **P1.1 APPROVED** · **Phase 0 READY** · **Agent 1 / P1.2 COMPLETE — ACCEPTED** · **Agent 2 / Relationship Intelligence COMPLETE (implemented, read-only)**.

**Repo:** `whoisdesirtech/widmediaagency` · Branch `main` · HEAD `0d3c608`

This document captures the evidence-based decisions and readiness for **Phase 0** (Sales Agent / reconciler completion) and **Phase 1A** (minimum shared relationship foundation) — per the Five-Agent Architecture Review (verdict: **DEFENSIBLE**).

> **STOP CONDITION:** This document records decisions only. Agent 1 / P1.2 implementation was executed under the separate implementation authorization (now complete); remaining work is review/validation and guarded trigger wiring.

---

## 1. Boundary: Phase 0 vs Phase 1A vs Vertical Rollout

Do not conflate these dimensions.

| Track | Scope |
|---|---|
| **Phase 0** | Sales Agent completion: **P0.x / P1.x**. P1.1 reconciler design **APPROVED** → P1.2 reconciler implementation **COMPLETE** (pure lib + tests + resolved default-agency; guarded trigger deferred per P1.1 §16). |
| **Phase 1A** | **Minimum shared relationship foundation** required for the Media MVP (shared identity primitive + relationship mapping contract). **Deferred.** |
| **Vertical rollout** | Phase 1 = Media · Phase 2 = Auto · Phase 3 = Tax. Auto/Tax remain **deferred** (contract-only) during Media MVP. |

The Sales Agent workstream (Phase 0) is separate from vertical rollout. Agent 1 (CRM/Reconciler) will eventually incorporate the reconciler capabilities established by Phase 0; Phase 1A establishes the shared identity that the shared agents operate on.

---

## 2. DECISION Q1 — Authoritative Reconciliation Source

### 2.1 Candidate sources

| Candidate | Evidence |
|---|---|
| **`Prospect.primaryContactEmail`** | `prisma/schema.prisma` Probe: nullable `String`, **no unique index**. Match key for the P1.1 reconciler (email + agency exact). |
| **`PluginDownloadLead.email`** / **`BookingInquiry.email`** | Public capture routes. Write normalization is inconsistent: plugin-lead `toLowerCase().trim()`, booking `trim()` only. No `prospectId`, no `agencyId`. Pure intake. |
| **`Client.email`** | `@unique` **table-wide**. Created only by authenticated admin/staff via `/api/clients`. **Never auto-derived from leads/Prospects** (no Prospect→Client conversion exists). Delivery/contracting view, not an intake source. |
| **`User.email`** | `@unique`. Authentication / actor identity (employees, contractors, optional client link via `clientId`). Not a lead-reconciliation source. |

### 2.2 Current source of truth

There is **no live reconciler today** (P1.1 is design-only). The de-facto CRM identity is `Prospect.primaryContactEmail` (app-level, not unique). The delivery view uses `Client.email` as a table-wide unique.

### 2.3 Evidence supporting each candidate

- **Prospect** is the only model with both `agencyId` (required) and a contact email, and is the P1.x reconciler's target. It is the best-supported intake→CRM anchor.
- **PluginDownloadLead / BookingInquiry** are unambiguous intake sources (P1.1 §1), but are agency-less and not yet normalized as a joined identity.
- **Client / User** are delivery and auth views, not intake; including them as reconciliation sources conflates identity with delivery.

### 2.4 Recommended authoritative source

`Prospect.primaryContactEmail` (normalized), **scoped by agency** — per `docs/P1.1_LEAD_RECONCILIATION_DESIGN.md`. Reconciler is a pure DI lib taking `(agencyId, lead)`; it fails closed without an explicit agency.

### 2.5 Conflict-resolution behavior

Per P1.1 §5/§6:

| Match | Behavior |
|---|---|
| 1 candidate, non-`lost`/`accepted`-excluded | **link** |
| 1 candidate, `accepted` | **link** |
| 1 candidate, `lost` | **requires_review** (no link, no recreate) |
| ≥2 candidates | **ambiguous** — no link, human review |
| 0 candidates | **create** new Prospect |
| already linked (`prospectId`) | **already_linked** (idempotent) |

### 2.6 Expected reconciler output

`linked | created | already_linked | ambiguous | requires_review | failed` + `AgentEvent.reconcile.*` work-product + null-user `logAudit` events (`agent.reconcile.*`). No new DB constraints.

### 2.7 Uncertainty requiring product-owner confirmation → RESOLVED

> **RESOLVED (approved product decision):** the **configured/default `Agency`** is the authoritative agency context for **Media MVP public-lead reconciliation** (option (a) below).

The agency source for public leads is implicit in the repository (not machine-readable today):
- Lead models (`PluginDownloadLead`, `BookingInquiry`) have **no `agencyId`**; public routes have **no session**.
- The only agency-ish signals are implicit: a single hardcoded SMTP recipient `digitalvurv@gmail.com`, and a **default `Agency` singleton** auto-created in `/api/clients` (`findFirst` then create `name: 'WhoIsDésir® Media Agency'`).

**Approved decision:** the reconciler resolves the configured/default `Agency` **deterministically** and **fails closed** (refuses to act, surfaces an error) if it cannot be resolved. No `agencyId` is added to public lead models for Agent 1. Future explicit multi-agency attribution remains architecturally possible. Do **not** infer agency from SMTP sender names, free-form text, ambiguous metadata, or user assumptions.

---

## 3. DECISION Q8/Q10 — Shared Identity Primitive

### 3.1 Person

A natural person, distinct from how they engage with the platform. Today implicit across `Prospect.primaryContactName`, `Client.name`, `User.name`, lead firstName/lastName. **No `Person` model exists.**

### 3.2 Organization

A business/entity. Loose today: `Client.businessName`, `Prospect.websiteUrl/industry`, lead `organization`. **No `Organization` model exists.**

### 3.3 Relationship

The **shared platform identity primitive** connecting a Person/Organization to the platform and to one-or-more verticals. Owns lifecycle/status, consent, relationship-value signals, and score. **Does not exist today.** Vertical models attach to it as views. This is the entity that makes Media → Auto → Tax peers, not Media-owned.

### 3.4 Existing Client

Media's current customer hub. Evidence: `agencyId` (required), `userId?` (optional auth link), `email` `@unique` (implicit identity key), commissioned to projects/deliverables/invoices/messageThreads. Created by authenticated staff only. **Maps to `Relationship` + a `MediaRelationship` vertical view.** Media identity columns (email/name/businessName) migrate up to Person/Organization/Relationship; Media operational records stay on the Media view. **Media must not remain the platform identity.**

### 3.5 Existing Prospect

The **sales / intake phase** of a Relationship: `agencyId` required, nullable `ownerId`, status, P0.2 lead reverse-relations. Conceptually a pre/non-client Relationship (opportunity in pipeline). Not a separate identity — a state over the same relationship.

### 3.6 User

**Authentication / actor identity**, distinct from customer identity. `User.email` unique; optional `clientId`/`contractorId` relate it to customer roles. Not the customer identity primitive.

### 3.7 Critical schema evidence

- `Client.email` is **table-wide unique**; `Prospect.primaryContactEmail` is nullable/un-unique.
- There is **no existing shared identity record** a `Client` and a `Prospect` can both reference. That shared `Relationship` must be introduced; the mapping is conceptual (no migration).
- This is exactly what the identity guardrail protects against: Media's `Client` is currently (by schema default) the nearest thing to platform identity.

---

## 4. Client → Relationship Mapping Contract

```
Existing Client  ──(is)──▶ Person / Organization  ──(has)──▶ Relationship ──(is-a)──▶ Media Relationship
    (Media-only)           (shared identity)               (platform primitive)       (Media vertical view)
```

- **Person/Organization** — shared factual identity (names, emails, org, handles, industry).
- **Relationship** — "this person/org has a relationship with the platform"; owns status, consent, relationship-value signals, score; the hub multiple verticals attach to (nameless by default, explicit on consent).
- **Media Relationship** — Media-facing view retaining Media operational fields (googleDrive, projects, deliverables, invoices, messageThreads).

### 4.1 What the repository supports

`Client.email` (unique) is the closest thing to a relationship key today; `Client.userId` links an auth `User` to a client; `Prospect.primaryContactEmail` is the sales-side email.

### 4.2 Exact decision still required

The **shared canonical identity join key does not exist**: `Client.email` is unique but `Prospect`/leads are not normalized to a shared key, and there is no `Relationship` record both derive from. Decisions required: (1) introduce `Relationship` as the canonical identity; (2) define the single canonical email/identifier that links a `Client` and a `Prospect` to one `Relationship`; (3) whether `Person` is seeded from `User` (Q8) or independent. **Contract only — do not migrate.**

---

## 5. Media MVP Constraint

```
Shared Relationship Foundation
             │
       ┌─────┴─────┐
       │           │
 CRM/Reconciler  Relationship
    Agent        Intelligence
       │           │
       └─────┬─────┘
             ▼
      Media Operations
             │
             ▼
         MEDIA MVP
```

Agents 4 (Auto) and 5 (Tax) remain **deferred** (contract-only). Do not implement Auto or Tax. The shared foundation must not depend on Media-specific operational logic (covers `HIGH_TOUCH_PLATFORM_ARCHITECTURE.md` + five-agent review guardrails).

---

## 6. Phase 1A Minimum Foundation

| Bucket | Items |
|---|---|
| **Required Now** | Shared `Person`/`Organization`/`Relationship` identity primitive; canonical relationship identity key; `Client`→Relationship mapping contract (identity columns lifted off Media; Media keeps operational fields); relationship consent + value-signal contract (enough to reach Gate 1 "relationship model works"). |
| **Foundation Only** | Relationship lifecycle/status/consent/score. Cross-vertical coordination contract (nameless, consented). Audit + notification reuse. No Auto/Tax infrastructure. No Media operational logic in shared modules. |
| **Deferred** | Full Agent 2 scoring engine; reconciler moved into the shared runtime; Auto (Agent 4) + Tax (Agent 5) implementation; household model; queue/cron/event infra; organization matching. |

---

## 7. Readiness

### Phase 0 — READY: **READY**

- **Q1 resolved** (configured/default `Agency` is the authoritative agency context for Media MVP public-lead reconciliation; deterministic; fail-closed).
- **P1.1 approved** — Agent 1 / P1.2 (CRM/Reconciler implementation) is **COMPLETE — ACCEPTED** (per the approved P1.1 design; validated via typecheck + full test suite; trigger wiring deferred per P1.1 §16).
- **Agent 2 (Relationship Intelligence)** is **COMPLETE (implemented)** — read-only relationship intelligence over Prospect + Client record fields + MessageThread/Message interactions (`src/lib/relationship-intelligence.ts` pure core, `src/lib/relationship-intelligence-integration.ts` adapter, `tests/relationship-intelligence.test.ts`); no schema change, no trigger wiring, no LLM.

### Phase 1A — READY: **BLOCKED** (deferred — non-blocking for Agent 1)

- **Q8/Q10 — shared identity primitive** is approved as **architectural direction** but **implementation is deferred to Phase 1A** (not built in this Agent 1 authorization).
- **Canonical identity join key** and `Person` seed source remain open (Phase 1A foundation).
- **Gate 1 prerequisite:** shared scoring value-signal contract (must not depend on raw Media tables).
- These do **not** block Agent 1 (P1.1 targets `Prospect` within the existing model).

---

## 8. Remaining Product Decisions

1. **Q1 — RESOLVED.** Configured/default `Agency` is authoritative for Media MVP public-lead reconciliation; deterministic + fail-closed; no `agencyId` added to leads for Agent 1.
2. **Q8/Q10 — architectural direction APPROVED** (Person/Organization/Relationship = long-term shared identity primitive); **implementation deferred to Phase 1A**. Canonical `Client`↔`Prospect` join key + `Person` seed source to be defined in Phase 1A (not blocking Agent 1).
3. **Canonical identity join key** — to be defined in Phase 1A.
4. **Shared scoring value-signal contract** (first version) — needed for Gate 1; must avoid dependency on raw Media tables.
5. **P1.1 — APPROVED.** Agent 1 / P1.2 reconciler implementation is **COMPLETE** (implemented per the approved P1.1 design).

---

## 9. Recommended Next Step

1. **Q1 resolved** (configured/default Agency authoritative for Media MVP public-lead reconciliation) and **P1.1 approved** — decisions recorded.
2. **Next (done) step: Agent 1 / P1.2 CRM-Reconciler** implemented per the approved P1.1 design (pure lib + tests + resolved default-agency + audits) and **ACCEPTED**. Remaining: guarded trigger wiring. **Agent 2 (Relationship Intelligence) implemented** (read-only, no trigger, no schema change).
3. Phase 1A (shared identity foundation: Person/Organization/Relationship, canonical join key, scoring value-signal contract) remains a **Phase 1A** responsibility and must not be conflated with Agent 1.

**STOP (this doc):** documentation/decision recording only. Begin Agent 1 / P1.2 only under the separate implementation authorization.

---

## Companion docs
- `docs/FIVE_AGENT_IMPLEMENTATION_PLAN.md` — five-agent plan (architecture review PASSED; Phase 0 READY, Agent 1 AUTHORIZED)
- `docs/HIGH_TOUCH_PLATFORM_ARCHITECTURE.md` — platform architecture (shared core + 3 verticals)
- `docs/VERTICAL_ROLLOUT_STRATEGY.md` — rollout gates
- `docs/P1.1_LEAD_RECONCILIATION_DESIGN.md` — reconciler design (COMPLETE — APPROVED)
- `docs/SALES_AGENT_HANDOFF.md` — Sales Agent workstream handoff
