# High-Touch Book-of-Business Platform — Architecture

**Status:** ARCHITECTURE DESIGN (no schema, infra, or code changes authorized by this document)
**Role:** Shared relationship platform + three modular verticals (Media, Tax & Accounting, Auto & Concierge)
**Companion docs:** `docs/AI_AGENT_ARCHITECTURE.md` (pre-existing, Media-centric — superseded in its agent-section by §13–14 of this document), `docs/TARGET_ARCHITECTURE.md`, `docs/PRODUCT_ARCHITECTURE_AUDIT.md`, `docs/SALES_AGENT_HANDOFF.md`.

> This is an architectural design exercise. It avoids premature schema and infrastructure decisions (§17 Open Questions collects what cannot yet be safely decided).

---

## 1. Core Vision

The platform is a **high-touch customer-relationship and book-of-business system** for a set of related professional-service verticals. The customer relationship is the product; the verticals are service domains that operate on those relationships.

Today's codebase began as a Media creative portal: `Client` is the identity vertex, and it is welded to media operations (`Project`, `Deliverable`, `Invoice`, `Document`, `MessageThread`, Drive folders, `agencyId`). That structure makes Media the de-facto parent. This document reframes it:

- The **shared core owns the customer relationship** — identity, organizations/contacts, CRM/book of business, relationship history, communications, permissions, shared documents/tasks/reminders, relationship scoring and review, referrals, and cross-vertical intelligence.
- **Verticals own their operational domains** — workflows, states, domain data, dashboards, tasks, automation, business rules, integrations, and reporting.
- A customer may participate in **one, two, or all three** verticals. No vertical presumes the customer belongs to it.

**Strategic value of the shared layer:** a durable, portable relationship asset (the "book of business") that survives and compounds independent of any one service line. Referrals become cheap, retention is managed at the relationship level rather than per-service, and customer lifetime value is measured across verticals.

**Strategic value of independence (Future B):** any vertical can be extracted into its own portal or business without rebuilding the relationship model. Vertical extraction must require (a) copying the portable relationship core and (b) leaving vertical operational modules behind — never vice-versa.

---

## 2. Business Architecture

### 2.1 Media (vertical — deviates from today's de-facto parent)
- **Purpose:** brand/content/media production and agency services (projects, deliverables, contracts, campaigns).
- **Customer relationships:** clients with projects and deliverables; prospects entering via plugin-download leads and speaker/booking inquiries.
- **Services/workflows:** proposal→SOW→contract→signature; project→deliverable→review→approve→close; invoicing; contractor delivery.
- **Domain ownership (vertical):** `Project`, `Deliverable`, `SOW`, `AssembledContract`, `TaskReview`, `BrandKit`, `Influencer`/`InfluencerAudit`, `Invoice` (finance is media here today, but should be framed as a vertical concern), media-specific proposal suite.
- **Move to shared:** the customer identity/relationship, communication mesh (`MessageThread`), shared notifications, shared tasks/reminders if cross-vertical.

### 2.2 Tax & Accounting (vertical)
- **Purpose:** tax preparation, bookkeeping, advisory for individuals, households, and businesses.
- **Customer relationships:** individual and business taxpayers; households (multiple persons filing under one relationship).
- **Services/workflows:** engagement→data collection→preparation→review→filing→compliance calendar→advisory.
- **Domain ownership (vertical):** tax engagements, source documents, filing statuses, compliance deadlines, accountant assignments, vertical-specific pricing. Contains financial/tax data that must be **isolated and encrypted** per vertical.

### 2.3 Auto & Concierge (vertical)
- **Purpose:** automotive services (sales/leasing/fleet, detailing, service coordination) plus lifestyle/concierge services for high-touch relationships (appointments, travel, errands, vendor coordination).
- **Customer relationships:** individuals and households; recurring service relationships.
- **Services/workflows:** service request→vendor coordination→fulfillment→accessory/lease lifecycle→concierge task queue.
- **Domain ownership (vertical):** vehicles, service orders, concierge requests, vendor relationships, appointment scheduling.

### 2.4 What is shared vs. vertical (explicit boundary)

| Capability | Owner |
|---|---|
| Customer identity, Organization, Contact, Household | **Shared** |
| CRM / book of business, relationship state | **Shared** |
| Relationship history, interactions, communications | **Shared** |
| Relationship scoring, review, referrals | **Shared** |
| Auth + permission model | **Shared** |
| Shared documents/files, shared tasks/reminders | **Shared** (verify reuse before verticals own them) |
| Customer-facing unified client portal | **Shared shell** (vertical modules render into it) |
| Vertical workflows, states, services, dashboards, automation, integrations, reporting | **Vertical** |
| Vertical-specific sensitive data (tax returns, vehicle records) | **Vertical** (+ security isolation) |

---

## 3. Relationship Model

The canonical model centers on **organizations and persons**, related to each other and to one-or-more verticals. A customer is a **Relationship** (a durable book-of-business record), not a media `Client` and not a per-vertical record.

| Entity | Definition | Shared/Vertical | Survives vertical extraction? |
|---|---|---|---|
| **Person** | An individual contact (identity). Has emails/phones/handles. | Shared | Yes |
| **Organization** | A company, family/trust, or entity that transacts. | Shared | Yes |
| **Household** | A grouping of Persons (co-subscribers, family) owned for Tax & Auto/Concierge; applicable where multiple people share a relationship. | Shared (grouping) | Yes (generic grouping usable by all verticals) |
| **Relationship** | The canonical, durable customer record: the book-of-business unit. Attaches a primary Person/Organization and a set of vertical memberships. | Shared | Yes |
| **VerticalRelationship** | A Relationship's participation in a specific vertical (e.g., Relationship X is a Tax client, not Media). Carries vertical-specific customer lifecycle state. | Vertically-owned record, keyed to shared Relationship | Survives as reference, extracted with its vertical |
| **Customer** | A Relationship that is active/in good standing in ≥1 vertical. Not a distinct entity — derived state. | Shared (concept) | — |
| **Prospect** | A potential Relationship being pursued, prior to becoming a client. (Pre-existing `Prospect` model + `PluginDownloadLead`/`BookingInquiry`.) | Shared (lead/prospect funnel), with per-vertical source | Yes |
| **Client** | Today's model. Must be **reframed** as a per-vertical or relation-scoped record, not the global identity. | Transition from shared→vertical | Refactor target |
| **Partner** | An external party (referral source, vendor, white-label) — see §7. | Shared | Yes |
| **Referral** | A record connecting a source (person/partner/vertical) to a target Relationship/vertical. | Shared (attribution) | Yes |
| **Interaction / Communication** | Relationship activity: note, email, call, message, meeting. | Shared (`MessageThread`/`Message` today) | Yes |
| **ServiceRelationship** | A specific active service engagement within a vertical (media project, tax engagement, auto service account). | Vertical (references Relationship) | Extracted with vertical |
| **Book of business** | The set of Relationships a human owns, with health/value metrics. Derived—not a table. | Shared | Yes |

**Cardinality rule:** a Relationship has many VerticalRelationships (0..n); a Person/Organization may be linked to many Relationships; a Relationship has one owning human (relationship owner, §5).

**Critical reframe:** today `Client` is both identity and a media tenant record with `agencyId`. Under this model, `Client` (media) becomes a vertical view (Media ServiceRelationship + Relationship), while a new shared `Relationship`/`Person`/`Organization` layer becomes the identity. This is the single biggest migration, deferred to Open Questions (§17).

---

## 4. Relationship Progression

**Unknown → Lead → Prospect → Qualified → Client → Active Relationship → Expanded Relationship → Dormant/Lost**

| Stage | Owner | Notes |
|---|---|---|
| Unknown | Shared | Never stored; pre-identity. |
| **Lead / Prospect** | **Shared** | Captured via public routes (`PluginDownloadLead`, `BookingInquiry`), reconciled to a `Prospect` (per the P1.x reconciler design). Shared because a lead could become any vertical's client. |
| **Qualified** | **Shared** (concept) / vertical signals | Qualification criteria are partly shared (contact valid, decision-maker, needs match) but final qualification intent belongs to the target vertical. |
| **Client** | **VerticalRelationship** | "Client" is vertical-specific: Media client ≠ Tax client. A Relationship becomes a client of a vertical when a vertical relationship is active. |
| **Active Relationship** | **Shared** | The Relationship is healthy; owns ≥1 active ServiceRelationship. |
| **Expanded Relationship** | **Shared** | Penetration increases: more verticals or more services within a vertical. |
| **Dormant / Lost** | **Shared (dormancy/lost at relationship level)** + vertical statuses | Relationship-level dormancy spans verticals; each vertical retains its own operational close states (e.g., a media project can close while the relationship is still a Tax client). |

**Rule:** shared CRM owns the *relationship-level* funnel state and health; verticals own their *engagement-level* states (media `Project.status`, tax filing state, auto order state). A vertical closing its services must **not** force relationship-level "lost," and relationship-level "lost" must not be required to close individual vertical records.

---

## 5. Book-of-Business Strategy

The book of business is a **relationship asset** owned by humans, with relationship intelligence layered on.

| Book-of-business dimension | Definition | Shared/Vertical |
|---|---|---|
| **Relationship ownership** | Each Relationship has a primary relationship owner (human) + optional per-vertical owners. | Shared (owner map), vertical owner refs |
| **Customer lifetime value (CLV)** | Aggregated value across current/past services. | Shared (aggregation from vertical value events) |
| **Services held** | Count/type of active ServiceRelationships per vertical. | Shared view; vertical data |
| **Vertical penetration** | # of verticals a Relationship has / potential for expansion. | Shared |
| **Relationship health** | Composite score (see §11). | Shared |
| **Expansion opportunities** | Detected cross-vertical / cross-service upsell. | Shared detection; vertical execution |
| **Retention / dormancy** | At-risk or declining relationships. | Shared |
| **Referral opportunities** | People/orgs likely to refer, or referred-in leads. | Shared |
| **Relationship concentration** | Reliance on a small # of high-value relationships (risk). | Shared |
| **Cross-vertical opportunities** | Signals that a relationship in vertical A fits vertical B. | Shared (nameless signal → vertical B works it) |

The book of business is **derived** (computed views/metrics over shared relationship + vertical service data), not a single vertical's table. This makes it portable and independent of vertical internals.

---

## 6. Internal Partnering

Internal partnering lets verticals benefit from shared relationships **without coupling to each other's workflows.** The pattern: a shared, **nameless opportunity** is detected by the platform and offered to a target vertical; the target vertical owns whether/how to act.

**Mechanism — Cross-vertical opportunity record (shared):**
- Producer vertical emits `VerticalOpportunity { relationshipId, sourceVertical, targetVertical, type, signal, status }` — **no** source-vertical schema leakage.
- The target vertical's staff/agents see it in their domain; acting means creating a vertical lead/engagement, which then links back to the shared Relationship.

**Examples mapped to the rule:**
| Scenario | Enabling shared mechanism (platform-owned) | Target vertical owns action |
|---|---|---|
| Media client → Tax & Accounting customer | Cross-vertical signal on Relationship | Tax creates engagement |
| Tax customer needs Media services | Cross-vertical signal | Media creates lead |
| Auto customer referred to another vertical | Referral/opportunity record | Target vertical accepts |
| Customer in multiple verticals | Shared Relationship shows all memberships, coordination notes | Each vertical operates independently |

**Guardrail:** internal partnering NEVER reads another vertical's operational tables. It reads only the shared, purpose-built opportunity record and the relationship's shared identity/context. This directly satisfies: *"Internal referrals must not require one vertical to understand or own another vertical's operational workflow."*

---

## 7. External Partnering

External partners participate via a **shared, de-coupled partner layer** — never by connecting to internal schemas.

| External partner type | Interface | Shared/vertical |
|---|---|---|
| **Referral partner** | Submits a lead via a public/partner submit path, tagged with partner attribution. | Shared (Partner + Referral records) |
| **Vendor / service provider** | Receives/pushes work via a controlled integration boundary (vertical-specific). | Vertical (who the vendor serves) but referenceable at shared if cross-vertical |
| **Strategic partner** | Contractual relationship with defined scopes; ports a subset of shared relationship data under permission. | Shared (agreement) |
| **White-label** | Reseller of a vertical's service under their brand → tenant/branding configuration for the portal. | Shared branding/tenant config + vertical execution |

**Attribution:** `Referral { id, sourcePartnerId?, sourcePersonId?, sourceVertical?, targetRelationshipId?, targetVertical?, status, revenueAttribution }, `partner attribution is stored on the shared record so revenue attribution survives vertical reorganization.

**Rule:** a partner's interface is an explicit integration boundary (API/port), not direct DB access. Partners authenticate and are permission-scoped; white-label is a branding/tenant overlay, not a schema fork.

---

## 8. Landing Page UX

The public experience presents the **platform**, with verticals as discoverable service lines — not Media as the parent.

- **Platform positioning:** the landing page leads with the relationship-value proposition ("your trusted partner across media, tax, and automotive"), with vertical cards for discovery.
- **Shared brand vs. vertical branding:** one platform brand at top level; each vertical has a distinct identity sub-brand and its own landing section. Branding is **configurable** (§16) so a vertical can later become an independent portal under its own URL/brand.
- **Lead capture:** a single platform lead path plus per-vertical capture paths (today: `PluginDownloadLead`, `BookingInquiry`). All funnel into the shared lead/Prospect pipeline tagged by source vertical.
- **Routing:** a captured lead is reconciled (P1.x design) and routed to the relevant vertical's pipeline. If vertical intent is ambiguous → shared prospect held for human routing on the sales agent.
- **Returning customers / relationship recognition:** identity resolves to a shared Relationship; the landing page shows "welcome back" and known service context, and surfaces cross-vertical invitations (e.g., "You have a Tax engagement — see your Auto concierge benefits") without leaking other vertical's private data.
- **Future independence:** each vertical's public surface is a self-contained module so it can be re-hosted under its own domain without rework.

---

## 9. Client Portal

The authenticated client experience is a **shared shell with vertical modules** — one login, one relationship view, vertical experiences rendered into it.

- **Shared account/identity:** one credential → one Relationship → multiple VerticalRelationships. (Refactor of today's `Client`+`user`+messaging.)
- **Customer dashboard:** relationship summary, health, services held across verticals, owner contact, upcoming relationship moments.
- **Communication:** shared `MessageThread`/`Message` mesh is the single inbox (already exists; generalize from client↔admin↔contractor to any relationship participant).
- **Relationship history / interactions:** shared record — notes, calls, emails, referrals — visible for the relationship (with per-vertical permission gating).
- **Documents / tasks / reminders:** shared document store and shared task/reminder list where cross-vertical; vertical-specific documents/tasks live in their modules but surface into the shared list under permission.
- **Services + vertical-specific experiences:** each vertical module renders its own workflow UI (media projects; tax engagements; auto/concierge orders) inside the shell.
- **Cross-vertical navigation:** one sidebar with vertical sections; switched per Relationship member's memberships.
- **Permissions:** relationship-level permission model (owner, members, vertical staff) enforced centrally; verticals define their own role rules within the shared auth frame (§16).

**Rule:** the client sees a **unified relationship** where appropriate, without forcing unrelated vertical workflows into a common UI. Vertical modules are embedded, not merged.

---

## 10. CRM / Data Model (conceptual — not a schema)

### Shared / Core entities (survive extraction)
`Identity` · `Person` · `Organization` · `Household` · `Relationship` · `RelationshipMember` · `VerticalRelationship` · `ContactMethod` · `Interaction` · `Communication / Message / MessageThread` (generalized) · `Document` / `File` (shared store) · `Task` / `Reminder` (shared) · `Note` · `RelationshipScore` (snapshot) · `Review` (relationship review) · `Referral` · `Partner` · `Opportunity` (cross-vertical) · `Notification` · `AuditLog` · `AgentEvent` · `Permission/Role` on relationship · `Tenant/Branding` config.

### Media entities (extract with Media)
`Project` · `Deliverable` · `ProjectTask` · `TaskReview` · `SOW` · `MasterAgreement` / `Addendum` / `AssembledContract` / `Signature` · `BrandKit` / `BrandKitSection` · `Influencer` / `InfluencerAudit` / `AuditScore` · media `Client` (reframed as Media ServiceRelationship view) · `PluginDownloadLead` (media source) · `BookingInquiry` (media/speaker source).

### Tax & Accounting entities (extract with Tax)
`TaxEngagement` · `TaxDocument` (sensitive) · `FilingStatus` / `ComplianceTask` / `FilingDeadline` · `AccountantAssignment` · `TaxClient` profile · vertical pricing/reporting.

### Auto & Concierge entities (extract with Auto)
`Vehicle` / `VehicleAccount` · `ServiceOrder` · `ConciergeRequest` / `ConciergeTask` · `VendorAssignment` · `Appointment` · `AutoClient` profile.

| Entity group | Ownership | Purpose | Survives extraction? |
|---|---|---|---|
| Relationship core | Shared | Identity + book of business | **Yes** (copied with any extracted vertical) |
| People/Org/Contacts | Shared | Identity | Yes |
| Communications/Interactions | Shared | Relationship history | Yes |
| Referral/Partner/Opportunity | Shared | Relationship network | Yes |
| Media domain | Vertical (Media) | Media ops | Media extracted only |
| Tax domain | Vertical (Tax) | Tax ops | Tax extracted only |
| Auto/Concierge domain | Vertical (Auto) | Auto ops | Auto extracted only |

**Rule:** vertical entities reference the shared `Relationship` (not each other). No vertical entity is required by another vertical. Extraction = grab shared core + one vertical's entities.

---

## 11. Relationship Scoring

Two layers, clearly separated:

### 11.1 Shared relationship score (platform-owned, portable)
A composite over signals that are vertical-agnostic:
- **Engagement recency/frequency** (interactions, logins, message activity)
- **Value** (aggregate revenue across verticals)
- **Number of services** (across verticals)
- **Relationship duration**
- **Responsiveness** (reply latency to outreach)
- **Satisfaction signals** (approvals, feedback, review outcomes, churn-adjacent events)
- **Referral activity** (referred in/out)
- **Cross-vertical breadth** (# verticals)
- **Expansion potential** (structural fit signals)
- **Risk/dormancy** (declining engagement, overdue, missed moments)

Output: `RelationshipScore { composite, sub-scores, trend, computedAt }` — a **snapshot**, not stored continuously (computed on a schedule / on key events). Used by §12 reviews and the relationship agents.

### 11.2 Vertical-specific scores (vertical-owned)
Each vertical adds its own scoring (e.g., Tax compliance risk; Media delivery risk; Auto service frequency) computed from vertical data. These never override the shared score; they surface inside vertical dashboards.

**Boundary:** the shared score reads only shared signals + (consented, aggregated) vertical value events. Verticals never read each other's private scoring.

---

## 12. Relationship Review

A recurring, human-led review cadence surfaced as a **shared review queue** plus **vertical queues**.

**Triggered when:**
- At-risk relationships (shared score dip, dormancy) → queue to relationship owner.
- Growth opportunities (cross-vertical signal, expansion potential) → offered to the target vertical's queue.
- Dormant customers (no active service, low engagement) → owner decides revive/lost.
- Upcoming relationship moments (contract renewal, tax deadline, vehicle service) → reminder to owner.
- Cross-vertical / referral opportunities → routed to the right vertical.
- High-value relationships → periodic owner review regardless of score.

**Mechanics:** a `Review` record scoped to a Relationship (or vertical relationship); assigned to a human; has status/outcome/actions. Review output can (with human approval) create follow-up tasks or agent actions. **Humans retain ownership** of high-value and consequential decisions.

---

## 13. Five-Agent System (shared vs. vertical — deliberate)

Following the guardrail *"determine which responsibilities should be shared-platform responsibilities and which should be vertical-specific"*, the five agents are assigned by **operating domain**, not arbitrary media workflow labels. The pre-existing `AI_AGENT_ARCHITECTURE.md` five agents are **Media-bound** (Sales/Contract-Ops/Delivery/ClientSuccess/Finance). This design dissolves those into:

- **Shared agents (relationship/CRM layer):**
  1. **Relationship (Concierge) Agent** — owns the shared relationship record, communications, reminders, relationship review prep, and cross-vertical opportunity detection/naming. Shared.
  2. **CRM / Reconciler Agent** — lead capture, reconciliation, dedupe/ambiguity, relationship hygiene. Shared (built on the P1.x reconciler design).
- **Vertical agents (one per vertical, operating in vertical domain only):**
  3. **Vertical Operations Agent — Media**
  4. **Vertical Operations Agent — Tax & Accounting**
  5. **Vertical Operations Agent — Auto & Concierge**

This yields exactly five (2 shared + 3 vertical) while honoring *"agents augment, humans own."* The old Finance agent's responsibilities fold into the relevant vertical ops agent (e.g., Media billing) — but **not** a shared finance agent, since finance is per-vertical.

---

## 14. Agent Responsibilities

**Common posture for all agents:** read = autonomous; draft/recommend = autonomous; consequential writes = require human approval (the existing "ready vs. approval" policy from `AI_AGENT_ARCHITECTURE.md`). Agents call **typed tools** wrapping authenticated APIs/DB ports; never direct DB. All actions logged to `AuditLog` + `AgentEvent`.

### Agent 1 — Relationship (Concierge) Agent — **Shared**
- Role: steward the shared relationship and book-of-business; coordinate; surface opportunities.
- Reads: shared Relationship, Person/Org, interactions, MessageThreads, RelationshipScore, shared Tasks/Reminders, Referrals, cross-vertical Opportunity (nameless signals).
- Writes: shared Interactions/Notes, shared Tasks/Reminders, RelationshipScore recompute, draft relationship communications.
- Recommends: relationship health flags, expansion/referral candidates, review queue entries.
- Human approval: consequential client communications, any change to relationship ownership/health classification, creating vertical leads from cross-vertical signals.
- Domain: shared. Communicates with: CRM agent (hygiene), the target vertical ops agent (nameless opportunity handoff).

### Agent 2 — CRM / Reconciler Agent — **Shared**
- Role: lead→Relationship reconciliation, dedupe, ambiguity handling, CRM hygiene (per P1.x reconciler design).
- Reads: leads (`PluginDownloadLead`, `BookingInquiry`), `Prospect`, shared Relationships, candidate matches.
- Writes: create/link Prospects and Relationships per reconciler rules; write `AgentEvent.reconcile.*`; flag ambiguity.
- Recommends: ambiguous/`lost` cases for human review; consolidation candidates.
- Human approval: any merge/dedupe that resolves ambiguity, any attachment where multiple candidates exist (never silently).
- Domain: shared. Communicates with: Relationship agent (new relationship created), the routing vertical.

### Agent 3 — Vertical Operations Agent: Media — **Vertical (Media)**
- Role: run media engagements: project/deliverable tracking, contract/SOW drafting, invoicing, contractor coordination.
- Reads: vertical Media tables (`Project`, `Deliverable`, `SOW`, `AssembledContract`, `Invoice`), shared relationship context.
- Writes: drafts (SOW, invoice), reminders, status summaries, follow-ups.
- Recommends: at-risk delivery, approval-ready deliverables, billing actions.
- Human approval: final pricing/SOW/invoice send, approve deliverables, any financial/legal write.
- Domain: Media only. Communicates with: Relationship agent (shared context), CRM agent (media lead intake).

### Agent 4 — Vertical Operations Agent: Tax & Accounting — **Vertical (Tax)**
- Role: run tax engagements: engagement, data collection, prep pipeline, compliance calendar, filing coordination.
- Reads: vertical Tax tables (engagements, source documents, deadlines), shared relationship identity/context.
- Writes: draft communications, compliance reminders, prep-task lists, engagement status.
- Recommends: filing readiness, at-risk deadlines, document requests, advisory opportunities.
- Human approval: filing, any release of tax data, pricing/scope changes, anything touching sensitive tax records.
- Domain: Tax only (sensitive-data isolation). Communicates with: Relationship agent; CRM agent on intake.

### Agent 5 — Vertical Operations Agent: Auto & Concierge — **Vertical (Auto)**
- Role: run auto/concierge engagements: service orders, vendor coordination, appointments, concierge tasks.
- Reads: vertical Auto tables (`Vehicle`, `ServiceOrder`, `ConciergeRequest`, `Vendor`), shared relationship context.
- Writes: draft service reminders, concierge task drafts, appointment prep, vendor communication drafts.
- Recommends: service timing, vendor selection suggestions, concierge fulfillment plans.
- Human approval: committing to vendors/orders, any contract/cost commitment, customer-facing commitments.
- Domain: Auto only. Communicates with: Relationship agent; CRM agent on intake.

**Cross-agent rule:** vertical agents (3–5) never read one another's tables; they exchange only through the shared Relationship agent / nameless Opportunity records. This preserves future extraction.

---

## 15. Automation / Workflows

Separate platform-level (shared) from vertical-level; name the trigger/action/owner. No queues/infra introduced unless justified.

### Platform-level (shared)
| Workflow | Trigger | Action | Owner |
|---|---|---|---|
| Lead capture | Public lead POST | Store lead, optional SMTP | CRM agent / route |
| Lead reconciliation | Lead created / sweep | Reconcile (P1.x), link/create Relationship | CRM agent |
| CRM updates | Relationship events | Update score, status, history | Relationship agent |
| Relationship reminders | Calendar/moment events | Notify owner / client | Relationship agent |
| Referral routing | Referral created | Attribute → offer to target vertical | Shared |
| Cross-vertical opportunity detection | Shared signals on Relationship | Create nameless Opportunity → target vertical | Relationship agent |
| Client communications | Relationship events | Draft/triage message, human-approve consequential | Relationship agent |
| Follow-up | Response deadlines | Remind owner; escalate | Relationship agent |
| Relationship review | Schedule / score trigger | Build review queue for humans | Relationship agent |

### Vertical-level (e.g., Media)
| Workflow | Trigger | Action | Owner |
|---|---|---|---|
| Proposal→SOW→Contract | Qualification | Draft→human approve→assemble/sign | Vertical ops agent (Media) |
| Deliverable lifecycle | Status changes | Follow-up, review, approve | Vertical ops agent (Media) |
| Invoicing | Deliverable approved | Draft→human approve→send | Vertical ops agent (Media) |
| Tax engagement | Lead→Tax | Data collection→prep→filing (human) | Vertical ops agent (Tax) |
| Compliance calendar | Deadline events | Reminders; escalate at-risk | Vertical ops agent (Tax) |
| Auto service order | Request | Vendor coordinate→fulfill (human commit) | Vertical ops agent (Auto) |

**Rule:** vertical workflows are encapsulated under the vertical module's service boundary (typed tools). Platform workflows only touch shared data. Nothing assumes queues/LLMs yet.

---

## 16. Technical Architecture

A **modular monolith with explicit domain boundaries** initially — not premature microservices (guardrail 8). Boundaries are enforced at the module/service layer so extraction remains possible without a full rebuild.

- **Domain boundaries:** shared (`relationship`) + three vertical modules (`media`, `tax`, `auto`). Each vertical module owns its tables, services, and typed tool surface.
- **Shared services:** identity/auth, relationship/CRM, communication, documents, notifications, audit, relationship scoring, referrals/opportunities, permissions.
- **Vertical modules:** `media/`, `tax/`, `auto/` — expose a narrow internal API (services + typed tools) consumed by agents and portal modules.
- **APIs:** internal module boundaries are service/port interfaces; public routes stay rate-limited + auth-scoped. Agents call typed tools wrapping these (never raw DB).
- **Authentication:** one NextAuth identity for all (already present). Extend to Relationship members; verticals reuse shared auth.
- **Authorization:** shared permission model (relationship role + vertical role), enforced at module boundary. Vertical private data gated by vertical permission.
- **Data ownership:** each vertical's tables are exclusively owned by its module; shared tables by the core; no cross-vertical FK/tables. Extraction-safe.
- **Event boundaries:** domain events (e.g., `relationship.created`, `vertical.moment`, `opportunity.detected`) published on a shared event bus so verticals and agents react by subscription, not direct coupling.
- **Communication:** generalized `MessageThread` handles any participant (relationship member, staff, partner, vendor) rather than only client↔admin↔contractor.
- **Auditability:** `AuditLog` for all writes + `AgentEvent` for agent work products. Every agent action traced.
- **Agent access:** agents are permission-scoped API clients with typed tools + human-approval gates; no privileged DB bypass.
- **Integration boundaries:** verticals integrate with external systems (vendor, tax software) behind their module; partners/white-label use controlled ports (§7).
- **Multi-tenancy:** `Agency` (existing) continues as the tenant; `Tenant`/branding config holds per-tenant and per-vertical branding for white-label/independent portals.
- **Future independent deployment:** each vertical module is a deployable unit (its services + tables); shared core is a deployable library/service the vertical imports. Extraction copies the shared core + one vertical.
- **Data portability:** because verticals only touch shared relationships by reference and value events are consented aggregations, exporting a vertical = copying shared core + vertical entities (portable, no cross-vertical deps).
- **Branding/tenant configuration:** vertical sub-brand, domain, and theming are config, so Media→Tax independent portal is rehosting, not rearchitecting.

### Coupling to AVOID
- No vertical table references another vertical's table.
- No vertical imports another vertical's service.
- Shared core must not import vertical-specific logic (no `if (vertical==='media')` in shared).
- No vertical pre-supposes the customer is a member (every membership optional).
- No universal "workflow engine" that forces verticals into one state machine.
- No agent reads another vertical's tables; no finance agent spanning verticals.

### Extraction scenario (how it works)
To extract **Tax & Accounting** into its own business: copy the shared relationship core (`Relationship`/`Person`/`Organization`/`Interaction`/`Communication`/`Referral`/`Role`/`Auth`), bring the `tax` module (services + tables) and its tenant/branding config; leave `media` and `auto` behind. No other vertical requires Tax tables, so nothing breaks. This is possible **because** boundaries were enforced from the start.

---

## 17. Open Questions

| # | Question | Why it matters | Options | Recommended direction | Decision required |
|---|---|---|---|---|---|
| O1 | Reframe `Client` → shared Relationship + vertical client view, or keep `Client` and add Relationship? | Identity is today welded to Media. Wrong call breaks extraction. | (a) Full refactor to shared Relationship; (b) introduce Relationship, migrate Client to vertical view; (c) keep Client, overlay Relationship | (b) incremental; (c) only if risk low | Migration strategy + sequencing |
| O2 | How do we identify a Relationship's cross-vertical opportunity without a vertical reading another's data? | Prevents coupling; enables referrals. | Nameless Opportunity record; shared relationship-context fields; human review | Nameless Opportunity + shared context only | Granularity of the Opportunity record |
| O3 | Where do documents/files live — truly shared, or per-vertical with shared index? | Tax/vehicle data sensitivity vs. cross-vertical convenience. | One shared store w/ ACL; per-vertical stores + shared index | Shared index + per-vertical sensitive stores (Tax/auto private) | Storage ownership + encryption boundary |
| O4 | Is `Agency` the right tenant granularity, or do we need household/relationship-level scoping for Tax/Auto? | Households span verticals; tenant = current agency. | Keep Agency as tenant + add relationship scope; add household tenant | Keep Agency tenant; add Household as shared grouping | Tenant model finalization |
| O5 | Which existing structures are genuinely shared vs. vertical? (MessageThread, Notification, PortalTask, Task/Reminder) | Guardrail 6: shared must be genuinely reusable. | Audit each before assigning | Assign shared only if reuse confirmed; else vertical | Per-capability audit outcome |
| O6 | What are the vertical value events used for shared scoring/CLV (consented aggregation)? | Shared score needs value without reading vertical tables. | Emit `value`/`service` events to shared; aggregate from them | Consented value-event feed | Event schema + consent model |
| O7 | When do we adopt the "nameless" cross-vertical signal vs. vertical A proposing to vertical B explicitly? | Affects privacy and coupling. | Fully nameless; attributed-with-consent; explicit referral only | Nameless default; explicit on consent | Signal privacy policy |
| O8 | Sensitive-data isolation for Tax now or later? | Highest-risk vertical data. | Isolate from day one; defer to integration | Design isolation boundary now; fully enforce at Tax implementation | Isolation architecture + timeline |
| O9 | Does a "Household" become a first-class shared entity now, or later? | Needed by Tax/Auto; not needed by Media. | First-class now; later; vertical-profile only | Introduce as shared grouping, low cost | Timing/priority |
| O10 | Which vertical is built first (pilot the shared layer with)? | Shared layer needs a proving vertical; affects sequencing. | Media (existing data); Tax; Auto | Pilot with Media (existing) using new shared core, then Tax | Pilot vertical + sequencing |
| O11 | How do the shared agents run before the vertical agents exist / vice versa? | Rollout dependency. | Build shared agents first; build per-vertical when ready | Shared Relationship + CRM agents first (these run the P1.x reconciler) | Agent rollout order |
| O12 | Is the old Media-centric five-agent design fully deprecated? | Known conflict with new model. | Deprecate; reuse Finance/Delivery concepts as vertical ops | Deprecate; fold into vertical ops agents | Explicit sunset decision |

---

## 18. Conversation Context (durable handoff)

**Scope:** Architecture design only. **No schema, no infra, no code changes** authorized by this document or the sourcing prompt. The existing repo state is unchanged beyond the already-approved P0.2 schema diff (`M prisma/schema.prisma`).

**Assumptions:**
- Three verticals: Media, Tax & Accounting, Auto & Concierge. Shared relationship layer is the center; Media is **not** the permanent parent.
- Customer may belong to 0..n verticals; no vertical presumes membership.
- Current codebase is Media-centric and single-tenant-per-`Agency`; this doc is the target architecture, not current reality.
- HTTP-level multi-tenant `Agency` remains; households are a shared grouping to be introduced (O9).
- Human ownership of high-value relationships is central; agents augment.

**Decisions already made:**
- Angle of attack: shared relationship core + 3 vertical modules, modular within a single app initially (no premature microservices).
- Identity reframe target: `Client` becomes a vertical view; shared `Relationship`/`Person`/`Organization` becomes identity (O1 sequencing TBD).
- Five agents re-scoped to 2 shared (Relationship, CRM) + 3 vertical-ops. Old Media-centric agent doc superseded (O12).
- Cross-vertical partnering via nameless Opportunity + shared referral attribution; verticals never read each other's tables.
- Relationship state shared at relationship level; vertical states separate; "lost" in one vertical ≠ lost relationship.

**Constraints:**
- Agents call typed tools wrapping authenticated APIs/DB ports; human-approval gate on consequential writes; full audit (`AuditLog`+`AgentEvent`).
- No new infrastructure, queues, LLM SDKs, or integrations unless justified — none are justified by this design yet.
- Guardrails 1–12 in the sourcing prompt are binding engineering rules (§"Architectural Principles").

**Unresolved / open:** the 12 questions in §17 — most importantly O1 (Client refactor), O2 (opportunity record granularity), O8 (Tax sensitivity), O10 (pilot vertical), O12 (old agent deprecation).

**Next worker should:** read this doc + `docs/SALES_AGENT_HANDOFF.md` + `docs/AI_AGENT_ARCHITECTURE.md`; decide O1/O10 (identity refactor + pilot vertical) and O12 (deprecate old agents) before any implementation; keep the shared/vertical boundary explicit in every schema and service decision. Await explicit authorization before any code change.

---

## Recommended Target Architecture

A **modular monolith, relationship-first**: a shared platform core owning customer identity, the CRM/book of business, relationship history/scoring/review, communication, documents, notifications, referrals, permissions, and audit — with three vertical modules (Media, Tax & Accounting, Auto & Concierge) that each own their operational workflows, states, data, dashboards, and integrations behind a narrow typed-tool service boundary. Agents run as permission-scoped clients over those tools with human approval on consequential writes; the shared core hosts the Relationship + CRM agents, and each vertical hosts its own operations agent. Domain events keep verticals coordinated without coupling, and the shared core is a portable library so any vertical can be extracted into an independent portal by copying the shared core plus that vertical's module — without rebuilding the relationship model.

## Architectural Principles (permanent engineering rules)
1. Media is a vertical, never the platform's permanent parent.
2. The relationship/customer layer is the shared center.
3. Verticals own their operational domains exclusively.
4. Customers may participate in one, two, or all three verticals.
5. No vertical requires another vertical's internal schema or workflow.
6. Shared capabilities must be genuinely reusable; audit before assigning something as shared.
7. Avoid generic abstractions that erase meaningful domain differences.
8. No premature microservices; modular boundaries inside a single app first.
9. Vertical extraction must be designed into every domain ownership and interface decision.
10. Human relationship ownership remains central to the high-touch model.
11. AI agents augment relationship management; they never silently own consequential customer decisions.
12. No unjustified infrastructure, schema, integration, or implementation detail.
13. Verticals never read each other's tables; inter-vertical cooperation uses nameless Opportunity + shared referral attribution.
14. Relationship-level state is shared; vertical lifecycle states are separate; closing one vertical service never forces relationship "lost."
15. Every agent action is logged and human-gated where consequential.

## Immediate Next Decisions (before implementation)
1. **O1 — Identity refactor:** adopt Relationship as shared identity and migrate `Client` to a Media vertical view (sequence/migration strategy).
2. **O10 — Pilot vertical:** confirm Media as the proving vertical for the shared core.
3. **O12 — Agent deprecation:** formally sunset the Media-centric five-agent doc in favor of the 2-shared + 3-vertical model.
4. **O8 — Tax sensitivity:** decide the isolation/encryption boundary to carry forward for Tax data.
5. **O2 — Opportunity granularity:** define the cross-vertical Opportunity record fields/consent before building referrals/agents.
