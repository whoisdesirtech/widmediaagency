# MVP and Vertical Rollout Strategy

**Status:** POLICY / STRATEGY (no schema, infra, or code changes authorized by this document)
**Complementary to:** `docs/HIGH_TOUCH_PLATFORM_ARCHITECTURE.md` (target architecture), `docs/SALES_AGENT_HANDOFF.md` (lead-reconciliation / Sales Agent workstream handoff).

> **Two phase dimensions** (do not conflate):
> - **Vertical rollout:** Phase 1 Media → Phase 2 Auto & Concierge → Phase 3 Tax & Accounting (this document).
> - **Sales Agent workstream:** P0.x / P1.x (schema, lead reconciliation) — tracked separately in `docs/SALES_AGENT_HANDOFF.md`.
> Both follow the same handoff→approval→implement→handoff lifecycle.

---

## Core Principle

The platform is architected for **three independent business verticals from the beginning**, but implementation is deliberately phased.

**Architecture ≠ rollout order.**

Media is the first vertical because it is the existing operating business and provides the fastest path to a usable MVP. This does **not** make Media the permanent parent of the platform.

**Rollout sequence:**
1. **Phase 1 — Media MVP:** build the shared relationship foundation together with the Media vertical.
2. **Phase 2 — Auto & Concierge:** add as the second vertical using the shared relationship platform.
3. **Phase 3 — Tax & Accounting:** add last, after the shared platform and first two verticals are proven.

The architecture must remain valid at the end of every phase.

---

## Phase 1 — Media MVP

### Objective
Deliver the first genuinely usable version of the High-Touch Book-of-Business Platform by combining **Shared Relationship Core + Media Vertical**. Operate the existing Media Agency while establishing the reusable platform foundation for future verticals. **Media must be a complete usable vertical, not merely a demonstration module.**

### MVP Shared Capabilities (only those required to operate Media)
- Authentication
- Users and permissions
- Customer/contact identity
- Organization identity
- Relationship/CRM foundation
- Prospect management
- Lead reconciliation
- Relationship ownership
- Book-of-business visibility
- Relationship history
- Communication
- Tasks/reminders
- Notifications
- Audit history
- Basic relationship scoring
- Basic relationship review
- Shared client portal shell

Do **not** build every possible platform capability before Media becomes usable.

### MVP Media Capabilities
- Media leads
- Prospect → client progression
- Client relationships
- Projects
- Deliverables
- Reviews/approvals
- SOW/contracts
- Invoicing
- Client communication
- Contractor/delivery workflows
- Media client portal experience

### MVP Success Condition
The Media Agency can operate its core customer relationships through the new relationship-first platform **without requiring Auto or Tax to exist**.

---

## Phase 2 — Auto & Concierge

Once the Media MVP is operational and the shared relationship layer is validated, introduce **Auto & Concierge** as an independent vertical module.

It **may consume**:
- Shared customer identity / relationship / communication / permissions / relationship history / referrals / relationship intelligence.

It **must NOT** depend on Media's operational tables or workflows.

### Auto objective
Enable a customer who already has a Media relationship to become an Auto/Concierge customer **without creating a second disconnected identity**.

**John Smith → Shared Relationship → Media Relationship → Auto Relationship**

The Auto vertical owns: Vehicles, Service orders, Concierge requests, Appointments, Vendor coordination, Auto-specific workflows, Auto-specific operational data.

---

## Phase 3 — Tax & Accounting

Implemented **last** so the shared relationship model and cross-vertical architecture mature before the most sensitive vertical. Tax adds requirements around:
- Sensitive financial information, tax documents, filing information, compliance deadlines, household relationships
- Data isolation, encryption, strict permissions, regulatory/security considerations

### Tax objective
Add Tax & Accounting as a fully independent vertical using the shared relationship platform while maintaining **strict isolation of sensitive tax data**.

**Shared Relationship → Media → Auto → Tax**, without any vertical becoming dependent on another.

---

## Development Sequence

```text
SHARED FOUNDATION
       │
       ▼
MEDIA MVP
       │
       ▼
VALIDATE PLATFORM
       │
       ▼
AUTO & CONCIERGE
       │
       ▼
VALIDATE CROSS-VERTICAL MODEL
       │
       ▼
TAX & ACCOUNTING
       │
       ▼
FULL HIGH-TOUCH PLATFORM
```

---

## Critical Engineering Rule

**Build for the future, but do not build the future prematurely.**

During Phase 1, create the boundaries necessary for Auto and Tax to be independent later. Do **not** implement Auto or Tax functionality simply because the architecture anticipates them.

### Correct
```text
/shared/relationship
/shared/crm
/shared/auth

/verticals/media
/verticals/auto
/verticals/tax
```
Media is implemented first, while the architectural boundary exists for the other verticals.

### Incorrect
```text
/media
  ├── customer
  ├── relationship
  ├── auto
  └── tax
```
This recreates Media as the parent.

---

## Phase Gates

Each phase has an explicit completion gate. Authorize the next phase **only** when the gate passes and the handoff is updated.

### Gate 1 — Media MVP Complete
- [ ] Shared relationship model works.
- [ ] Media operates independently.
- [ ] Customer identity is **not** Media-owned.
- [ ] Media workflows isolated from the shared core.
- [ ] No Auto-specific assumptions in Media.
- [ ] No Tax-specific assumptions in Media.
- [ ] Handoff/documentation updated.
- [ ] Tests and validation pass.
→ Then authorize Phase 2.

### Gate 2 — Auto Complete
- [ ] Auto operates independently.
- [ ] Auto uses the shared relationship identity.
- [ ] Auto does not depend on Media tables/workflows.
- [ ] Cross-vertical relationship visibility works appropriately.
- [ ] Existing Media functionality remains stable.
- [ ] Handoff/documentation updated.
- [ ] Tests and validation pass.
→ Then authorize Phase 3.

### Gate 3 — Tax Complete
- [ ] Tax operates independently.
- [ ] Sensitive Tax data properly isolated.
- [ ] Tax does not depend on Media or Auto internals.
- [ ] Shared relationship intelligence works without exposing sensitive data.
- [ ] Existing Media and Auto functionality remains stable.
- [ ] Handoff/documentation updated.
- [ ] Tests and validation pass.

---

## MVP Definition

The MVP is **not** *"build all three verticals at a minimal level."*

The MVP is: **"Build one excellent vertical (Media) on top of a reusable relationship platform designed to support three independent verticals."**

This provides a real business product quickly while preventing the MVP from locking the architecture into Media.

---

## Permanent Sequencing Rule

Unless explicitly changed by a future architectural decision:
1. **Media first**
2. **Auto & Concierge second**
3. **Tax & Accounting third**

A developer or AI agent must not begin the next vertical simply because its architecture has been defined. **Each vertical requires an explicit phase authorization.**

---

## Handoff Requirement

Every phase must produce or update a durable handoff before the next phase begins. The handoff must state:
- Current phase
- Completed capabilities
- Current repository state
- Files changed
- Architectural decisions
- Known issues
- Tests/validation
- Remaining work
- Next phase
- **Explicit authorization required for the next phase**

**Media MVP → Handoff → Review/Approval → Auto → Handoff → Review/Approval → Tax**

This sequencing applies equally to human developers, Antigravity IDE, OpenCode, and AI coding agents.
