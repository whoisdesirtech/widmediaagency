# Five-Agent Implementation Plan

**Status:** Phase 0 **READY**. **Agent 1 — CRM/Reconciler — COMPLETE — ACCEPTED**. **Agent 2 — Relationship Intelligence — COMPLETE (implemented)**, awaiting review/validation. Agent 3, Auto, Tax **NOT AUTHORIZED**. This document itself made no code/gas/schema/agent changes.
**Sourcing prompt:** Antigravity IDE + OpenCode — "Create the Five-Agent Implementation Plan."
**Date:** (see git history)
**Product decision record:** Q1 resolved (configured/default Agency is the authoritative reconciliation source for Media MVP); Q8/Q10 approved as architectural direction (implementation deferred to Phase 1A); P1.1 approved for implementation. See §16 + §18.
**Companion docs:**
- `docs/HIGH_TOUCH_PLATFORM_ARCHITECTURE.md` (target architecture: shared core + 3 verticals; 2-shared + 3-vertical agent model)
- `docs/VERTICAL_ROLLOUT_STRATEGY.md` (Phase 1 Media → 2 Auto → 3 Tax; gates; sequencing rule)
- `docs/SALES_AGENT_HANDOFF.md` (Sales Agent workstream handoff — P0.x/P1.x)
- `docs/P1.1_LEAD_RECONCILIATION_DESIGN.md` (lead reconciler design, maps to Agent 1)
- `docs/AI_AGENT_ARCHITECTURE.md` (pre-existing, Media-centric five-agent doc — superseded by this plan, see §9/§20)

---

## 0. Repository State & Discrepancy Findings

### Current state (verified, not assumed)
- `git status --short`: `M prisma/schema.prisma` (the approved P0.2 schema change) plus **untracked docs** (`HIGH_TOUCH_PLATFORM_ARCHITECTURE.md`, `VERTICAL_ROLLOUT_STRATEGY.md`, `SALES_AGENT_HANDOFF.md`, `P1.1_LEAD_RECONCILIATION_DESIGN.md`, `PHASE0_READINESS_DECISIONS.md`) and **three new P1.2 source/test files** (`src/lib/reconcile.ts`, `src/lib/reconcile-integration.ts`, `tests/reconcile.test.ts`). No existing application source modified by any planning/implementation phase.
- **Zero agent runtime exists.** `AgentEvent` model exists in the schema (`prisma/schema.prisma:467`) but no orchestrator, tool layer, or agent code. The only "agent/orchestrator" reference in source is `src/lib/proposal-generator.ts` (business logic, unrelated).
- **Sales Agent workstream (P0/P1) is design-confirmed and part-implemented:** P0.2 (schema) done; P1.1 (reconciler design) **approved** per the product decision record; **P1.2 (Agent 1 CRM/Reconciler) implemented** (`src/lib/reconcile.ts` pure core + `src/lib/reconcile-integration.ts` + `tests/reconcile.test.ts`) and **ACCEPTED**. Trigger wiring deferred per P1.1 §16. **Agent 2 (Relationship Intelligence) implemented** (`src/lib/relationship-intelligence.ts` pure core + `src/lib/relationship-intelligence-integration.ts` read-only adapter + `tests/relationship-intelligence.test.ts`); no trigger wiring, no schema change, read-mostly.
- Existing CRM/relationship surface: `Prospect` (+ `ProspectIntelligence`, `GTMAnalysis`), `PluginDownloadLead`, `BookingInquiry`, `AuditLog`, `Notification`, `RateLimitBucket`, `MessageThread`/`Message`, `User`, `Agency`, `Client` (media-welded). Auth helpers in `src/lib/auth.ts`; audit in `src/lib/audit.ts`; notifications in `src/lib/notifications.ts`; rate limit in `src/lib/rateLimit.ts`. Tests: `tests/*.test.ts` (pure unit style).

### Discrepancies found between documented architecture and implementation (documented, NOT silently resolved)
1. **`Client` is still the media-welded identity.** The architecture targets a shared `Relationship`/`Person`/`Organization` core, but the current `Client` model is binded to media operations (`agencyId`, projects, deliverables, invoices, Drive). The shared-identity refactor is **not started**. (Planned work; flagged in `HIGH_TOUCH_PLATFORM_ARCHITECTURE.md` O1.)
2. **`docs/AI_AGENT_ARCHITECTURE.md` is Media-centric and now conflicts** with the platform's 2-shared + 3-vertical model (its five agents were Sales/Contract-Ops/Delivery/ClientSuccess/Finance — all Media-bound, and it had a Finance agent spanning verticals). This plan supersedes it; see §9.
3. **Prospect → Client progression is not implemented** in the relationship sense; `Prospect` currently has no relation to `Client`. The MVP funnel (§8) requires a defined Prospect→Client handoff that does not exist yet.
4. **Cross-vertical concepts don't exist in schema** (no `Relationship`, `Opportunity`, `Referral`, shared `Person`/`Organization`). They are design-only.
5. **Lead models have no `agencyId`** and public routes lack agency context — the reconciler BLOCKER already documented in `SALES_AGENT_HANDOFF.md` §6 and `P1.1` §15. Still open.

These are **feature/schema gaps for future authorized phases**, not bugs to fix here.

---

## 1. Strategic Context (as given)

Three verticals: **Media, Auto & Concierge, Tax & Accounting.** Architecture ≠ rollout order. Phased implementation: **Media MVP → validate → Auto → validate → Tax.** Media is the first vertical, **not** the permanent parent. The shared relationship layer is the center.

---

## 2. Five-Agent Target Model (refined)

Target: **2 shared agents + 3 vertical agents.** Assignments align with the shared/vertical boundary.

| # | Agent | Domain | Shared/Vertical |
|---|---|---|---|
| 1 | **CRM / Reconciler** | Shared — CRM integrity, reconciliation | Shared |
| 2 | **Relationship Intelligence** | Shared — relationship intelligence & coordination | Shared |
| 3 | **Media Operations** | Media | Vertical |
| 4 | **Auto & Concierge** | Auto/Concierge | Vertical |
| 5 | **Tax & Accounting** | Tax/Accounting | Vertical |

Refinement versus the sourcing prompt: these match the architecture doc, with one approved change from the architecture review — **Agent 2 is named "Relationship Intelligence Agent"** (not "Relationship / Concierge"). This prevents confusion with the **Auto & Concierge vertical (Agent 4)**. "Concierge" refers exclusively to the Auto & Concierge vertical's service domain; Agent 2 coordinates the relationship (intelligence, scoring, progression, review, cross-vertical context) and does **not** perform concierge service execution. See §6 responsibility matrix for the explicit split.

---

## 3. Capability Classification (NOW / FOUNDATION / PHASE 2 / PHASE 3 / FUTURE)

| Capability | Classification | Notes |
|---|---|---|
| Shared auth (existing) | **NOW** (reuse) | Already present |
| Shared user/permissions (existing) | **NOW** (reuse) | Extend roles as needed |
| Customer/contact + Organization identity (Relationship core) | **FOUNDATION** | Minimal shared core now; full refactor later |
| CRM / Prospect management (existing) | **NOW** (reuse) | Already present |
| Lead reconciliation (Agent 1) | **FOUNDATION** | Requires P1.x reconciler first |
| Relationship ownership | **NOW** | Owner map on Prospect/Relationship |
| Book-of-business visibility | **FOUNDATION** | Derived views |
| Relationship history / interaction log | **FOUNDATION** | Minimal log now |
| Communication (MessageThread) | **NOW** (reuse) | Already present |
| Tasks / reminders | **FOUNDATION** | Shared task/reminder minimal now |
| Notifications (existing) | **NOW** (reuse) | Already present |
| Audit history (existing) | **NOW** (reuse) | Already present |
| Relationship scoring | **FOUNDATION** | Basic shared score for Media |
| Relationship review | **FOUNDATION** | Minimal queue for Media |
| Shared client portal shell | **FOUNDATION** | Shell + Media module |
| Media vertical (projects/deliverables/SOW/contracts/invoicing) | **NOW** | Existing, to be bundled as Media module |
| Auto vertical | **PHASE 2** | Deferred |
| Tax vertical (incl. sensitive-data isolation, households) | **PHASE 3** | Deferred |
| Cross-vertical opportunities / referrals (shared) | **FOUNDATION** (referral record) / **FUTURE** (full opportunity engine) | Minimal referral now; opportunity detection later |

---

## 4. Agent 1 — CRM / Reconciler Agent

- **Identity:** CRM/Reconciler Agent · Shared · Human owner: sales/admin lead.
- **Purpose:** Guard CRM integrity; reconcile leads→Prospects→Relationships; dedupe; surface ambiguity; relationship hygiene.
- **Responsibilities (owns):** lead capture intake, reconcile (per P1.1 design: email+agency exact match), create/link Prospects, dedupe/merge (human-approved), flag ambiguity, relationship identity hygiene.
- **Non-responsibilities (must NOT own):** relationship *value/coordination* (Agent 2), any vertical operational workflow (Agents 3–5), client-facing relationship communication decisions (Agent 2 + human), scoring methodology (Agent 2 + shared), creating/recommending vertical service work.
- **Inputs:** `PluginDownloadLead`, `BookingInquiry`, `Prospect`, candidate Relationship/Prospect matches, agency context.
- **Outputs:** reconciliation results (`linked|created|already_linked|ambiguous|failed`), hygiene flags, `AgentEvent.reconcile.*`, audit entries.
- **Read permissions:** shared identity, leads, Prospect, CRM records (agency-scoped).
- **Write permissions:** create/update Prospect; link leads (`prospectId`); create shared Relationship stubs; write `AgentEvent`; audit. **No** writes to vertical tables.
- **Human approval:** any ambiguity resolution/merge; any attach where >1 candidate; any lost/reconnect decision; deleting/merging records.
- **Tools (future):** `reconcileLead`, `reconcileAllUnlinked`, `listDuplicates`, `mergeCandidates`, `updateProspect`, `resolveAmbiguity`. (Not implemented.)
- **Dependencies:** shared auth/permissions, `AgentEvent`, `AuditLog`, agency config (reconciler BLOCKER). 
- **Events (consume/emit; only if a minimal event mechanism is justified — currently none exists):** consume `lead.created`; emit `relationship.created`, `reconcile.ambiguous`, `reconcile.failed`. This is the one place a minimal event/pub-sub may be justified in Media MVP (see §15).

---

## 5. Agent 2 — Relationship Intelligence Agent

- **Identity:** Relationship Intelligence Agent · Shared · Human owner: relationship/customer-success lead.
- **Purpose:** Relationship intelligence, progression, proactive relationship management, and high-touch coordination across the book of business.
- **Responsibilities (owns):** relationship state/progression (shared funnel), relationship scoring inputs, relationship review queue, follow-up recommendations, relationship history curation, book-of-business health, proactive relationship moments (renewal, lifecycle), cross-vertical coordination proposals.
- **Non-responsibilities (must NOT own):** CRM reconciliation/identity hygiene (Agent 1), any vertical operational workflow (Agents 3–5), final client communication sending of consequential messages (human), Media project execution (Agent 3/Human), tax/auto data (Agents 4–5).
- **Inputs:** shared Relationship/CRM state, Prospect/relationship events, interactions, scoring signals, upcoming moments, referral signals.
- **Outputs:** relationship scores/trends, review queue items, follow-up tasks, relationship progression suggestions, coordination proposals to vertical agents/humans.
- **Read permissions:** shared relationship + CRM + scoring + referrals + interaction history; consent-level aggregation of vertical value events (no raw vertical tables).
- **Write permissions:** shared interactions/notes, shared tasks/reminders, scoring snapshots, review queue, draft communications. **No** writes to vertical operational tables.
- **Human approval:** any consequential client-facing action, relationship owner/classification changes, activating cross-vertical engagements.
- **Tools (future):** `computeScore`, `createReview`, `createFollowUpTask`, `draftRelationshipMessage`, `listAtRisk`, `proposeOpportunity`. (Not implemented.)
- **Dependencies:** Agent 1 (clean identity), shared scoring, shared tasks/notifications, consent aggregation of vertical value events.
- **Events:** consume `relationship.created`, `reconcile.*`, vertical `moment` (value/deadline) events; emit `review.created`, `opportunity.proposed`, `followup.created`.

**Shared-vs-infra guardrail:** Agent 2 uses shared scoring/review/tasks infrastructure but does **not own** that infrastructure. Scoring, review queue, and tasks are shared platform capabilities; Agent 2 is a *consumer/curator*, not their permanent owner.

---

## 6. Agent 3 — Media Operations Agent

- **Identity:** Media Operations Agent · Vertical (Media) · Human owner: media operations/account lead.
- **Purpose:** run Media operational workflows (projects, deliverables, SOW/contracts, invoicing, contractor delivery).
- **Responsibilities (owns):** media lead→progression, project/deliverable tracking, SOW/contract drafting, approval routing, invoicing support, contractor coordination, media booking/speaker intake.
- **Non-responsibilities (must NOT own):** CRM identity/reconciliation (Agent 1), relationship-level health/scoring (Agent 2), Auto/Tax workflows (Agents 4–5), cross-vertical table reads.
- **Inputs:** Media leads, Prospect (Media vertical relationship), shared relationship context, vertical Media tables (`Project`, `Deliverable`, `SOW`, `AssembledContract`, `Invoice`, `ProspectIntelligence`, `GTMAnalysis`, `BrandKit`, `Influencer*`).
- **Outputs:** drafts (SOW, invoice, proposals), reminders, status summaries, approval-ready deliverables, media follow-ups, `AgentEvent` for media work.
- **Read permissions:** Media vertical tables + shared relationship context for Media-scoped relationships.
- **Write permissions:** Media vertical records (draft/status updates), Media `AgentEvent`, audit. Draft/recommend writes autonomous; consequential writes gated.
- **Human approval:** final pricing/SOW/invoice send, approve deliverables, sign-off, any financial/legal write, any media client scope change.
- **Tools (future):** `draftSow`, `draftInvoice`, `trackDeliverable`, `notifyApproval`, `chaseDeliverable`, `summarizeProject`. (Not implemented.)
- **Dependencies:** shared auth/permissions/communication, Agent 1 (clean Media leads/prospects), Agent 2 (relationship context), shared audit/notifications.
- **Events:** consume `relationship.created` (Media-scoped), `lead.created`; emit `media.moment` (value/deliverable/deadline) events consumed for scoring.

---

## 7. Agents 4 & 5 — Auto & Tax (contracts only, PHASE 2 / PHASE 3)

**Agent 4 — Auto & Concierge Agent (Vertical, PHASE 2).** Purpose: run Auto/Concierge workflows. Future responsibilities: vehicles, service orders, concierge requests, appointments, vendor coordination, auto-specific data. Shared capabilities used: identity, relationship, communication, permissions, history, referrals, scoring. Vertical-owned: Auto tables. Interface to shared: relationship-scoped `Relationship` + nameless `Opportunity`; must **never** depend on Media or Tax tables. Security: customer vehicle/order data protected; vendor coordination via controlled port. Must be validated against Gate 2 (`VERTICAL_ROLLOUT_STRATEGY.md`).

**Agent 5 — Tax & Accounting Agent (Vertical, PHASE 3).** Purpose: run Tax workflows with strict sensitive-data isolation. Future responsibilities: engagements, data collection, prep pipeline, compliance calendar, filings, households. Shared capabilities used: identity, relationship, communication, permissions, history, referrals (with consent), scoring (consent-aggregated value only). Vertical-owned: Tax tables incl. sensitive financial/tax documents (encryption, strict ACL). **Never** depends on Media or Auto internals. Security: strict data isolation/encryption; shared intelligence must work **without exposing** sensitive tax data (aggregate/consent only). Must be validated against Gate 3.

**Peer rule (all three verticals):** Media ≠ parent of Auto; Media ≠ parent of Tax; Auto ≠ parent of Tax; Tax ≠ parent of Media. All peers connected through the shared relationship platform — never through each other.

---

## 8. Responsibility Matrix (unambiguous ownership)

| Capability | Agent 1 (CRM) | Agent 2 (Relationship) | Agent 3 (Media) | Agent 4 (Auto) | Agent 5 (Tax) | Human |
|---|---|---|---|---|---|---|
| Lead reconciliation | **OWN** | — | consumes | consumes | consumes | approves ambiguity |
| Customer identity | **OWN** (hygiene) | owns value/opinion | uses | uses | uses | approves merge |
| CRM updates | **OWN** | proposes | — | — | — | approves consequential |
| Relationship scoring | feeds signals | **OWN** | emits value | emits value | emits value (consent) | reviews |
| Relationship history | writes hygiene | **OWN** (curation) | logs media interactions | logs auto | logs tax | — |
| Follow-up recommendations | — | **OWN** | — | — | — | approves send |
| Client communication | — | **OWN** (draft/triage) | drafts media comms | drafts auto | drafts tax | approves consequential |
| Media projects | — | — | **OWN** | — | — | approves scope |
| Media deliverables | — | — | **OWN** | — | — | approves |
| Media approvals | — | — | **OWN** (route) | — | — | final approve |
| Auto service requests | — | — | — | **OWN** | — | commits vendors |
| Auto appointments | — | — | — | **OWN** | — | — |
| Concierge requests | — | — | — | **OWN** | — | commits |
| Tax documents | — | — | — | — | **OWN** | release only w/ approval |
| Tax deadlines | — | — | — | — | **OWN** | filing approval |
| Financial/tax-sensitive info | — | — | — | — | **OWN** | strictly gated |
| Cross-vertical opportunities | detects identity | **OWN** (propose) | accepts | accepts | accepts | approves engagement |
| Referrals | records | **OWN** (attribute) | emits/accepts | emits/accepts | emits/accepts | approves |
| Relationship reviews | — | **OWN** (build queue) | inputs | inputs | inputs | decides |

**Concierge disambiguation:** "Concierge" (lifestyle service execution) belongs to the **Auto & Concierge vertical (Agent 4)**; the shared **Agent 2** only coordinates the *relationship* (renewals, moments, cross-vertical) and does not perform concierge service work.

---

## 9. Existing Sales Agent Work (map, don't restart)

- **P0.x/P1.x = Sales Agent workstream** (lead reconciliation, schema). This is **not** restarted or renamed by this plan; it feeds Agent 1.
- **Maps to Agent 1:** the reconciler design (P1.1) *is* Agent 1's core capability. P0.2 already added `AgentEvent`, `Prospect.prospectId` links, `ProspectIntelligence` approval fields — all Agent-1 infrastructure.
- **Remains separate:** the CRM API surface (`/api/sales/prospects/*`), audit, notifications, and the lead routes are shared platform/CRM capabilities, not "Agent 1 the agent." Agent 1 is the future runtime that calls them via tools.
- **Must complete before five-agent build:** P1.1 approval → P1.2 reconciler implementation → reconciled lead→Prospect pipeline. The five-agent system builds **on** this; it cannot run Agent 1 without the reconciler.
- **Recommendation (no code):** keep the P0/P1 naming for the workstream; when Agent 1 runtime is built, it consumes the reconciler as a library/typed tool. Do not rename existing routes/models at this stage; incorporate them later. Documented, not acted on.

**Supersession:** `docs/AI_AGENT_ARCHITECTURE.md` proposed Media-centric agents + a cross-vertical Finance agent. This plan replaces that with the 2-shared + 3-vertical model. A dedicated "deprecate old agent doc" decision is flagged in §20/Conversation Context (mirrors `HIGH_TOUCH_...` O12).

---

## 10. Media MVP (first milestone, in detail)

**Minimum system for:** Lead → Prospect → Client → Active Media Relationship → Book of Business → Relationship Management.

| Stage | Primary owner | Agent participation | Autonomous? |
|---|---|---|---|
| Lead capture | Shared routes | Agent 1 (intake) | autonomous |
| Lead reconciliation | Agent 1 | reconciles → Prospect/Relationship | autonomous; ambiguity→human |
| Prospect → qualified | Agent 1 + Agent 2 | qualification signals | recommend; human decides |
| Prospect → Client (Media) | Agent 3 + Human | Agent 3 creates Media relationship | human approval |
| Active Media Relationship | Agent 3 | run projects/deliverables/contracts | auto for drafts/reminders; human approves |
| Book of Business | Agent 2 | scoring, visibility, review | auto compute; human reviews |
| Relationship Management | Agent 2 + Human | proactive moments, follow-ups | recommend; human acts |

**Flow:** CRM/Reconciler (Agent 1) → Relationship Intelligence (Agent 2) → Media Operations (Agent 3) → Human. **Not every step autonomous.**

---

## 11. Agent Communication Model (conceptual, minimal)

- Prefer **read shared state + deterministic handoff** over agent-to-agent chatter.
- Recommendations/create tasks/request assistance are **coordination artifacts** (tasks, review items, opportunities) — no point-to-point agent loops.
- Escalation to a human via tasks/review queue, not agent-to-agent messages.
- Cross-vertical handoffs go through the shared relationship layer + nameless `Opportunity`/`Referral` (Agent 2 coordinates) — never direct vertical-to-vertical calls.
- **No event-driven architecture is invented now**; the only warranted minimal event is lead→reconcile triggering (and even that can be a sweep). See §18 open question.

---

## 12. Human-in-the-Loop Model

Humans retain ownership of **consequential relationship decisions**: customer-facing commitments, financial decisions (pricing, invoices, fees), sensitive-data actions (tax filing, releasing tax data), approval of deliverables/scope, relationship classification/owner changes, ambiguity/merge resolutions, high-impact operational actions (vendor/order commitments). Agents handle intelligence and coordination (reconciliation, scoring, drafts, reminders, review building) with read=draft=routine autonomy.

---

## 13. Implementation Roadmap

- **Phase 0 — Preparation:** P1.1 **approved**; Q1 **resolved** (configured/default Agency authoritative for public-lead reconciliation); **Agent 1 / P1.2 reconciler implemented** (pure core + Prisma wiring + tests; trigger wiring deferred per P1.1 §16). Awaiting review/validation before Agent 2.
- **Phase 1A — Shared Foundation:** minimal shared identity/Relationship core + relationship history + shared tasks/reminders + basic scoring + review queue + portal shell; reuse existing auth/audit/notifications/communication.
- **Phase 1B — Agent 1 (CRM/Reconciler):** runtime + typed reconcile tool (wraps P1.x reconciler), AgentEvent, audit, ambiguity handling.
- **Phase 1C — Agent 2 (Relationship Intelligence):** scoring, review queue, follow-up, proactive moments, cross-vertical proposal (media-only now).
- **Phase 1D — Agent 3 (Media Operations):** media tool surface (SOW/invoice/deliverable/contractor), Media module boundary.
- **Phase 1E — Media MVP Validation:** Gate 1 (below) — Media independent, identity not Media-owned, no Auto/Tax assumptions.
- **Phase 2 — Auto (Agent 4):** Gate 2 before Tax begins.
- **Phase 2 Validation.**
- **Phase 3 — Tax (Agent 5):** Gate 3; sensitive-data isolation.

### Media MVP Phase Gate (Gate 1 — from `VERTICAL_ROLLOUT_STRATEGY.md`, expanded)
The gate verifies:
- [ ] Customer identity is **not** Media-owned (shared `Person`/`Organization`/`Relationship` primitive in place; `Client` is a Media view, not the platform identity).
- [ ] Shared-platform modules do **not** import Media-specific logic or tables.
- [ ] **Agent 1** owns reconciliation / identity hygiene.
- [ ] **Agent 2 (Relationship Intelligence)** owns relationship intelligence, scoring, progression, review, and cross-vertical context.
- [ ] **Agent 3** owns Media operations.
- [ ] Auto (Agent 4) and Tax (Agent 5) remain **deferred** (contracts only — no operational implementation).
- [ ] Shared relationship scoring depends only on consented value signals, **not** raw Media tables.
- [ ] The existing Sales Agent workstream (`P0.x / P1.x`) remains **intact** and separate.
- [ ] Handoff/documentation updated; tests and validation pass.

---

## 14. Acceptance Criteria (testable)

- **Shared foundation:** shared Relationship/Person/Org create+read with auth; relationship history record write+read; shared task/reminder CRUD; scoring computed from defined signals; audit entry on every write; no shared file imports vertical-specific logic (enforced by lint/test).
- **Agent 1:** reconciler produces exactly the documented result set (`linked|created|already_linked|ambiguous|failed`); idempotency test (run twice → one link); ambiguity → no link + review item; 100% actions audited; agency-scoped.
- **Agent 2:** score composition matches spec; review queue populated on at-risk/dormant/moment triggers; follow-up task created on recommendation; no write to vertical tables (enforced).
- **Agent 3:** Media-specific tool drafts (SOW/invoice) produce reviewable output; approval gate blocks consequential writes; Media status transitions per rollout; no Auto/Tax tables referenced.
- **Media MVP:** a real lead → reconciled → Prospect → approved Media relationship → project/deliverable lifecycle completes; book-of-business view shows the relationship; Gate-1 checkboxes all pass.
- **Agent 4 (Phase 2):** Auto operates independently; uses shared identity; no Media-table dependency (tested).
- **Agent 5 (Phase 3):** Tax operates independently; sensitive data isolated (encryption + ACL test); shared intelligence uses only consent-aggregated data.
- **Cross-cutting:** every agent action logged (`AuditLog` + `AgentEvent`); no vertical imports another vertical; no shared core imports a vertical.

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Media becomes accidental parent | Maintain `verticals/media` not `media/*`; shared core never imports Media; Gate 1 "identity not Media-owned" |
| Agent responsibility overlap | Responsibility matrix (§8) + non-responsibilities; tests enforce module boundaries |
| Shared core becomes dumping ground | Guardrail: shared only if genuinely reusable; audit before assigning; reject vertical logic in shared |
| Premature abstraction | YAGNI; build only Media-required shared capabilities; FOUNDATION = boundary, not full API |
| Premature microservices | Modular monolith first; extraction designed, not deployed |
| Excessive agent autonomy | Approval gate on consequential writes; read/draft autonomous only |
| Cross-vertical data leakage | Verticals never read each other's tables; nameless Opportunity; consent aggregation |
| Tax data exposure | Sensitive isolation/encryption from Tax design day one; shared uses aggregate only (Gate 3) |
| Duplicate customer identities | Agent 1 reconciler + dedupe with human-approved merge; idempotency tests |
| CRM corruption | Reconciler idempotent, ambiguous→human, write-audited; P1.1 design already guards these |
| Agent-to-agent loops | Deterministic handoffs via shared coordination artifacts; no point-to-point chatter |
| Overbuilding before MVP validation | Chip order: Phase 0 → 1A..1E with Gate 1 before Auto; don't build Auto/Tax now |

---

## 16. Open Questions

| # | Question | Why it matters | Recommended direction | Owner | Blocks Phase 1? |
|---|---|---|---|---|---|
| Q1 | How is the reconciler's **agency / authoritative source** resolved (lead models have no `agencyId`)? | Agent 1 cannot act agency-safely without it. | **APPROVED: configured/default Agency is the authoritative agency context for public-lead reconciliation** (MVP decision; no `agencyId` added to leads as part of Agent 1; future multi-agency still permitted). See "Q1 clarification" below. | Product Owner | **RESOLVED** (was **YES**; now cleared) |
| Q2 | Reframe `Client` → shared `Relationship` + vertical view now or incremental? | Identity is the foundation; wrong call breaks extraction | Incremental: introduce Relationship, migrate Client to Media view over Media MVP | Architecture | Partial (FOUNDATION identity can be minimal; full refactor can be phased) |
| Q3 | Minimal event mechanism (lead→reconcile) or sweep? | Avoids inventing infra | Start with a sweep/idempotent route; add events only if justified | Architecture | No (can use sweep) |
| Q4 | Does the shared task/reminder system reuse `PortalTask` or introduce a shared `Task`? | Guardrail 6 (genuinely reusable) | Audit `PortalTask`; likely reuse/extend rather than fork | Engineering | No (FOUNDATION) |
| Q5 | Cross-vertical `Opportunity` record granularity + consent model? | Referrals/coordination core | Nameless default; explicit on consent | Product | No (FOUNDATION referral record only; full engine FUTURE) |
| Q6 | Is the old `docs/AI_AGENT_ARCHITECTURE.md` (Media-centric + Finance agent) formally deprecated? | Avoids confusion/conflict | **Approved — treat as historical/superseded; do not delete or rewrite unless authorized.** | Architecture | No |
| Q7 | Household — first-class shared entity now or with Tax? | Needed by Tax/Auto only | Introduce with Tax (Phase 3) unless Media MVP needs it | Architecture/Product | No |
| Q8 | Which existing model is the shared `Person` seed (from `User`?) vs. new `Person`? | Identity foundation | New shared `Person`/`Organization`; migrate references | Engineering | Partial |
| Q9 | Basic relationship scoring formula (which signals + weights) for Media MVP? | Gate-1 "relationship model works" | Ship a v1 with documented weights; refine later | Product/Eng | No (FOUNDATION, must reach v1 for Gate 1) |
| Q10 | **Shared Identity Primitive** — how do `Person`, `Organization`, `Relationship`, existing `Client`, existing `User`, and existing `Prospect` relate? | **Customer identity must belong to the shared relationship platform, not Media.** Deciding the primitive and the `Client`→`Relationship` mapping is the foundation for extraction and for the shared core. | **APPROVED as architectural direction** (Person/Organization/Relationship is the long-term shared identity primitive). **IMPLEMENTATION DEFERRED to Phase 1A** — not built as part of this Agent 1 authorization unless required by approved P1.1 implementation. | Product Owner | Partial (FOUNDATION identity primitive + mapping contract needed for Phase 1A) |

### Q1 clarification — authoritative agency source (APPROVED DECISION)
**Product decision (recorded):** For the Media MVP, **the configured/default Agency is the authoritative agency context for public-lead reconciliation.** Do **not** add an `agencyId` to public lead models as part of Agent 1, unless later requirements demonstrate multi-agency public-lead attribution is necessary. The architecture still permits a future explicit agency relationship; this is an MVP decision, not a statement that the platform can never support multiple agencies.

- **Required behavior:** Public leads entering the Media MVP are reconciled against the explicitly configured/default Agency. The agency is resolved deterministically. The reconciler must **not** infer agency identity from SMTP sender names, free-form text, user assumptions, or ambiguous metadata.
- **Fail-closed rule:** If the configured/default Agency **cannot be resolved, fail safely and surface the error** — never silently reconcile into an arbitrary Agency.
- **Source(s) being reconciled:** `PluginDownloadLead` and `BookingInquiry` (public capture routes), reconciled to `Prospect`.
- **Authoritative match key:** `primaryContactEmail` on `Prospect` normalized via the P1.1 reconciler rules; agency context scoped by the resolved default `Agency`.
- **How conflicts resolve:** email+agency exact match; `≥2` matches → `ambiguous` → human review (never auto-attach); single `lost` → `requires_review`; per P1.1 design.
- **What the reconciler produces:** `linked | created | already_linked | ambiguous | requires_review | failed` + `AgentEvent.reconcile.*` + audit.
- **Existing evidence supporting the default-agency pattern:** the clients API already get-or-creates a default `Agency` (`name: 'WhoIsDésir® Media Agency'`) via `findFirst` then `create` (`src/app/api/clients/route.ts`).

> **Status change:** Previously recorded as *"Recommendation (not a decision)... do not silently pick."* — **superseded by this approved product decision.**

### Identity guardrail (applies to Q8/Q10 and all phases)
> **The shared Person / Organization / Relationship model is the platform identity primitive. Media's Client model must not become the de facto platform identity.**

> **No shared-platform module may require Media-specific tables or Media operational logic.**

### Shared scoring guardrail
> **Shared relationship scoring must not directly depend on raw vertical tables.** Shared relationship intelligence consumes appropriately defined/consented relationship value signals rather than becoming dependent on Media-specific implementation details. Implementation deferred.

### Q8/Q10 identity contract — APPROVED DIRECTION vs IMPLEMENTATION STATUS
**APPROVED ARCHITECTURAL DIRECTION:** Person / Organization / Relationship is the long-term shared identity primitive.

```text
Person / Organization
        ↓
Relationship
        ↓
Vertical Relationship(s)
        ↓
Media / Auto / Tax
```

- `User`, `Prospect`, `Client` are existing application concepts that must eventually map into this shared relationship model.
- **Critical rule:** Media `Client` is **not** the permanent platform-wide identity primitive. New shared-platform architecture must **not** assume `Customer = Media Client`. During the MVP the existing `Client` may continue to exist where necessary.

**IMPLEMENTATION STATUS:** The full shared identity implementation remains **Phase 1A** and is **not** being built as part of this Agent 1 authorization unless specifically required by the approved P1.1 implementation. (P1.1 targets `Prospect` within the existing model; it does not require a `Person`/`Organization`/`Relationship` refactor.)

### CLIENT → RELATIONSHIP MAPPING (boundary only — no migration)
For the Media MVP, **do not** attempt a complete platform-wide identity migration unless required by existing functionality. Establish the architectural boundary only:

```text
Existing Media Client
        ↓
Identity / Relationship mapping boundary
        ↓
Future shared Person / Organization / Relationship model
```

- **Goal:** preserve the existing Media system **while preventing it from becoming the permanent architecture**.
- **Explicitly NOT done:** no speculative migration; no renaming of the existing data model to satisfy the future architecture.

---

## 17. Future Vertical Extraction (planning only)

If Media, Auto, or Tax became an independent portal/business:
- **Remains shared (copied with the extracted vertical):** Relationship/Person/Organization identity, CRM/book-of-business, relationship history, scoring, referrals, permissions/auth, tenant/branding config. These are portable because the shared core never imports verticals.
- **Moves with the vertical:** that vertical's tables, services, tools, dashboards, integrations, and per-vertical branding.
- **APIs/contracts required:** the vertical's typed-tool/service surface and a defined port to the shared relationship core; a nameless `Opportunity`/`Referral` contract; consent-aggregated value events for scoring.
- **Portable data:** shared relationship + the one vertical's entities; no cross-vertical FKs.
- **Dependencies to avoid:** vertical→vertical imports, shared→vertical imports, universal workflow engine, any vertical presuming membership.
- **Extraction difficulty factors:** any accidental Media-welding of identity (the current `Client` model) — which is exactly why the shared-identity primitive (Q10, identity guardrail) is the key de-risking move.

---

## 18. Conversation Context (durable handoff)

**Architecture review: PASSED** (verdict: **DEFENSIBLE**, no major rework required).

- **Platform vision:** High-Touch Book-of-Business platform; the relationship layer is the shared center; Media is a vertical, **not** the permanent parent.
- **Three verticals + rollout order:** Media MVP first (Phase 1), Auto & Concierge second (Phase 2), Tax & Accounting third (Phase 3). **Media is first because it is the MVP, not because Media is the permanent parent architecture.** All three are peers through the shared relationship platform.
- **Shared relationship layer:** identity, CRM/book of business, history, communication, tasks/reminders, notifications, audit, scoring, review, referrals, cross-vertical context. Verticals own their operational domains only.
- **Five-agent model (current):**
  - Agent 1 — CRM/Reconciler (shared)
  - Agent 2 — **Relationship Intelligence** (shared) — owns relationship intelligence, scoring, progression, review, cross-vertical context, proactive recommendations, and relationship coordination. Does **not** perform concierge service execution.
  - Agent 3 — Media Operations (vertical)
  - Agent 4 — Auto & Concierge (vertical, Phase 2) — owns Auto/Concierge operational workflows and **concierge service execution**
  - Agent 5 — Tax & Accounting (vertical, Phase 3)
  - Boundary: **"Concierge" refers to the Auto & Concierge vertical (Agent 4), not the shared relationship agent (Agent 2).**
- **Legacy agent architecture:** `docs/AI_AGENT_ARCHITECTURE.md` is **historical/superseded** — not active five-agent guidance. The current architecture is **2 Shared Agents + 3 Vertical Agents**. Do not delete or rewrite the legacy doc unless authorized.
- **Current Sales Agent workstream (P0.x / P1.x):** P0.2 schema done; **P1.1 reconciler design — APPROVED** (per product decision record); **P1.2 reconciler — IMPLEMENTED** (`src/lib/reconcile.ts`, `src/lib/reconcile-integration.ts`, `tests/reconcile.test.ts`; typecheck + 62 Vitest tests pass; no schema change). **Kept separate from vertical rollout (Phase 1/2/3).** Agent 1 will incorporate the CRM/Reconciler capabilities established by this workstream.
- **Product decision record (approved):**
  - **Q1 resolved** — configured/default Agency is the authoritative agency context for public-lead reconciliation (MVP decision; no `agencyId` added to leads in Agent 1; future multi-agency permitted).
  - **Q8/Q10 approved as architectural direction** (Person/Organization/Relationship = long-term shared identity primitive); **implementation deferred to Phase 1A**, not built in this Agent 1 authorization.
  - **P1.1 approved** for implementation (scoped to CRM/Reconciler per the P1.1 design + P1.2 follow-on). **P1.2 implemented** — pending review/validation.
- **Current phase:** Phase 0 **READY**. **Agent 1 — CRM/Reconciler — COMPLETE — ACCEPTED**. **Agent 2 — Relationship Intelligence — COMPLETE (implemented)**; review/validation pending. Agent 3, Auto, Tax **NOT AUTHORIZED**.
- **Authorized:** Agent 1 (CRM/Reconciler) per approved P1.1 design. Documentation updates.
- **Not authorized:** Agent 2 (Relationship Intelligence), Agent 3 (Media Operations), Auto, Tax, general platform refactoring, full Person/Organization/Relationship migration.
- **Open questions pending:** Q2/Q3/Q4/Q5/Q7/Q9 are phased or non-blocking; Q8/Q10 implementation status remains Phase 1A (not blocking Agent 1 or Phase 0).
- **Next recommended action:** review and validate Agent 1 (CRM/Reconciler, P1.2) — typecheck + test suite + regression — then STOP for review before Agent 2.

---

## 19. Final Review (per sourcing prompt)

1. **Contradictions with existing architecture docs:** The old `docs/AI_AGENT_ARCHITECTURE.md` conflicts (Media-centric + Finance agent); flagged for deprecation (Q6). Otherwise consistent with `HIGH_TOUCH_PLATFORM_ARCHITECTURE.md` and `VERTICAL_ROLLOUT_STRATEGY.md`.
2. **Accidental Media-centric assumptions reviewed:** identity, shared core, and agreement all treat Media as a vertical; no `media/*` nesting; no "every customer is a media customer" assumption.
3. **Premature implementation reviewed:** Auto/Tax are contract-only; no infra/events invented beyond a sweep; no premature microservices.
4. **Media-first without Auto/Tax:** verified — Media MVP uses only shared foundation + Media module.
5. **Auto/Tax extraction later:** verified — shared core portable; no vertical→vertical deps; extraction walkthrough in §17.
6. **Contradictions/unresolved decisions reported:** Q1 is **resolved** (see §16). Q8/Q10 implementation remains Phase 1A (not blocking Agent 1/Phase 0); Q2, Q3–Q7, Q9 are phased or non-blocking.

---

## Files Inspected
- `AGENTS.md` (workspace + repo), `docs/HIGH_TOUCH_PLATFORM_ARCHITECTURE.md`, `docs/VERTICAL_ROLLOUT_STRATEGY.md`, `docs/SALES_AGENT_HANDOFF.md`, `docs/P1.1_LEAD_RECONCILIATION_DESIGN.md`, `docs/AI_AGENT_ARCHITECTURE.md`
- `prisma/schema.prisma` (Prospect, PluginDownloadLead, BookingInquiry, AgentEvent, Client, MessageThread, User, Agency, AuditLog, Notification, RateLimitBucket, ProspectIntelligence, GTMAnalysis)
- `src/app/api/sales/prospects/route.ts`, `[id]/route.ts`, `[id]/intelligence/route.ts`, `[id]/gtm/route.ts`, `src/app/api/plugin-lead/route.ts`, `src/app/api/booking/route.ts`
- `src/lib/auth.ts`, `audit.ts`, `notifications.ts`, `rateLimit.ts`, `tests/*.test.ts`, `vitest.config.ts`

## Planning Document Created
`docs/FIVE_AGENT_IMPLEMENTATION_PLAN.md`

## Key Architectural Decisions Captured
2-shared + 3-vertical agent model; CRM/Reconciler = Agent 1 (builds on P1.x); **Relationship Intelligence = Agent 2** (not "Relationship/Concierge"); Media/Auto/Tax = Agents 3/4/5; strict shared↔vertical boundary + responsibility matrix; nameless cross-vertical coordination; shared identity primitive + `Client`→`Relationship` guardrail; shared scoring on consented signals only; Media-first MVP; Auto/Tax contracts only; no premature infra.

## Contradictions Found
Old `docs/AI_AGENT_ARCHITECTURE.md` (Media-centric + cross-vertical Finance agent) conflicts with the platform model — **treated as historical/superseded** (Q6). `Client` model still media-welded vs. shared-identity target (Q10/identity guardrail).

## Blockers
**Resolved:** **Q1** (authoritative reconciliation source) and **P1.1** (approval) are now recorded as decided. **Q8/Q10 (shared identity primitive + `Client`→`Relationship` mapping)** remain **Phase 1A** (deferred, non-blocking for Agent 1).

## Recommended Next Step
**Agent 1 / P1.2 CRM-Reconciler is COMPLETE — ACCEPTED** (`src/lib/reconcile.ts`, `src/lib/reconcile-integration.ts`, `tests/reconcile.test.ts`; typecheck + full Vitest suite pass; trigger wiring deferred per P1.1 §16). **Agent 2 / Relationship Intelligence is COMPLETE (implemented, read-mostly, no schema change, no trigger)** — awaiting review/validation. Phase 1A (shared identity foundation) follows as a separate architectural responsibility.

**STOPPED per the planning-only instruction for the planning phase. The later separate P1.2 authorization was executed (implementation complete). Agent 2 was implemented under a separate authorization (read-only relationship intelligence). No further agents started (Agent 3/4/5, Auto, Tax remain NOT AUTHORIZED).**
