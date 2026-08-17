# TARGET ARCHITECTURE — Product Ideas, Positioning & Final Architecture

- **Date:** 2026-08-12
- **Scope:** Phases 7 (integration-first), 12 (final architecture), 9 (20 product ideas), 10 (positioning).

---

## PHASE 9 — 20 PRODUCT IDEAS (ranked by moat × feasibility)

### Tier A — Build now (proprietary, protects the loop)

| # | Idea | Why it wins | Status in code |
|---|---|---|---|
| 1 | **Contract/Ops AI agent** — draft SOW/addenda from a brief, assemble contract, chase signatures | Sits on your strongest existing feature (contracts/signatures); "AI does the paperwork" story | Agent 2 in AI_AGENT_ARCHITECTURE.md |
| 2 | **Contract-to-project automation** — on `contract.signed`, auto-create project + deliverables + Drive folders | Removes the biggest manual step; proves the workflow engine | Parts exist (contracts, projects, folders) but disconnected |
| 3 | **Vendor onboarding & compliance center** — insurance/license expiry, per-state tax forms, re-verification reminders | The "impossible to copy quickly" vertical layer | `Contractor` proofs exist; no expiry engine |
| 4 | **Deliverable approval state machine** — pending→submitted→approved/revised with notifications | Core ops loop; drives client trust | `Deliverable` approve/deny exists; formalize + notify |
| 5 | **White-label theming** — per-tenant logo/colors/domain | What white-label customers see; switching cost | None today |
| 6 | **Media-delivery client experience** — photos+videos+folders in one branded gallery with approval | Builds on WD-105 `kind` work; the Pixieset+HoneyBook gap | Partial (client media page + folder kinds) |
| 7 | **Webhooks/API for partners** — signed events (contract.signed, deliverable.approved, invoice.paid) | Enables embedding + ecosystem | None today |

### Tier B — Build next (compound data/moat)

| # | Idea | Notes |
|---|---|---|
| 8 | SOW/addenda **template library** (versioned, shareable) | Feeds AI drafting; data moat |
| 9 | **Reporting** — revenue per project/contractor, utilization, on-time delivery | Needs the workflow engine events first |
| 10 | Client **status hub** (real-time project timeline for clients) | Replaces mock dashboard card (`77`) |
| 11 | Invoice → **Stripe payment link + auto-reconcile** | Integrate Stripe; Finance agent on top |
| 12 | **Inquiry → booking → SOW intake** pipeline with Cal.com | Sales agent seed; `/api/booking` already exists |
| 13 | Contractor **availability & scheduling** to projects | Integrate Cal.com per contractor |
| 14 | **Audit trail / activity feed** across contracts, deliverables, invoices | Trust layer; agent audit reuse |

### Tier C — Explore later / optional

| # | Idea | Notes |
|---|---|---|
| 15 | Multi-brand media agency multi-org console | Needs multi-tenancy first |
| 16 | Photo/video **deliverable signing-off from client phone** (mobile PWA) | Nice; later |
| 17 | Print/album e-commerce for clients | Pixieset territory; only if vertical fit |
| 18 | Affiliate/partner marketplace of SOW templates | Distraction until Template Library is real |
| 19 | AI media-upload tagging/curation | Bleeding edge; later |
| 20 | API embeddable portal widgets (like Foyer) | After core is solid |

---

## PHASE 10 — POSITIONING

**Positioning statement:**
> **For owner-operated media agencies that hire freelance photographers/videographers,** WhoIsDésir is **the agency operating system** that runs the whole engagement — **contracts, vendors, deliverables, and media delivery under one branded roof** — unlike HoneyBook/Dubsado (generic CRMs) or Pixieset (galleries only), because **it treats the freelancer as a first-class, compliance-verified partner and lets AI do the paperwork.**

**Alternative (customer-facing, concise):**
> "Contracts. Vendors. Deliverables. Media. One branded loop for media agencies — with AI doing the paperwork."

**Messages by audience:**
- **Agency owners:** "Stop stitching HoneyBook + Google Drive + Dubsado together. Run contract-to-delivery in one place; your clients see your brand, not your tools."
- **Contractors:** "One clean portal: sign your SOW, upload deliverables, get paid — no chasing emails."
- **Clients:** "See your media, approve deliverables, track the shoot — under the studio's brand."

**Positioning do's / don'ts:**
- ✅ Lead with the **contractor + contract loop** (the whitespace).
- ✅ Lead with **white-label** (your brand, our rails).
- ✅ Lead with **AI that does paperwork** (draft SOW, chase signatures, flag delays).
- ❌ Don't compete on "CRM" or "invoicing" breadth — you lose that fight.
- ❌ Don't mention security gaps (fix them, then market "bank-grade").

---

## PHASE 7 + 12 — INTEGRATION-FIRST TARGET ARCHITECTURE

### Principles
1. **Integrate commodity, build the loop.** Auth, payments, e-sign, email, calendar, storage, analytics, LLMs = providers. Workflow engine, multi-tenancy, vendor compliance, white-label, AI orchestration = in-house.
2. **Provider interfaces (hexagonal).** Every external system behind a typed interface so you can swap vendors without touching domain code.
3. **Everything authenticated + scoped.** After Phase 1 hardening, every request carries a session + `agencyId`; every query is tenant-scoped.
4. **Events first.** Domain changes emit events; agents, notifications, and webhooks consume them — never tight-coupled RPC.
5. **Keep the working stuff.** Google Drive integration, contract assembly, portals, WD-105 media kinds — keep and build around.

### Target stack diagram

```
                 ┌─────────────────────────  CLIENT LAYER  ─────────────────────────┐
                 │  Next.js 14 (keep) · admin / client / contractor / org portals    │
                 │  White-label theme provider · client media gallery (Drive-based)  │
                 └───────────────┬───────────────────────────┬─────────────────────┘
                                 │ authenticated (session)   │
              ┌──────────────────▼───────────┐      ┌────────▼────────────────────┐
              │   API GATEWAY (hardened)     │      │   AI ORCHESTRATOR (agents)  │
              │  requireAuth(role) · zod ·   │◄────►│   5 agents · approval gate   │
              │  rate limit · tenant ctx     │      │   typed tool layer · audit  │
              └──────────────────┬───────────┘      └────────────┬───────────────┘
                                 │                               │
                 ┌──────────────▼─────────────────────────────── ▼───────────────┐
                 │                 DOMAIN ENGINE (BUILD — moat)                  │
                 │  workflow/state machine · events · template library ·          │
                 │  vendor compliance · deliverable states · white-label config   │
                 │  Prisma core models (keep + agencyId scoping)                  │
                 └──────────┬────────────┬──────────────┬──────────────┬─────────┘
                            │            │              │              │
            ┌───────────────▼───┐ ┌──────▼─────┐ ┌──────▼──────┐ ┌─────▼──────────┐
            │ PROVIDER LAYER    │ │ EmailProvider│ │StorageProvider│ │ E-SignProvider│
            │ SignatureProvider │ │ Resend      │ │ Google Drive  │ │ DocuSign/DS   │
            │ PaymentProvider   │ │ Postmark    │ │ (default) + S3│ │ keep dual-party│
            │ CalendarProvider  │ │ + templates │ └──────────────┘ └───────────────┘
            │ AuthProvider      │ │
            │ AIProvider        │
            └───────────────────┘
```

### Provider interfaces to create (with current-reality notes)

| Interface | Current reality | Target integration | Swap cost |
|---|---|---|---|
| `AuthProvider` | `localStorage['user']`, dead NextAuth | Auth.js (self-host) or Clerk; keep roles | Low — interface now, swap behind it |
| `SignatureProvider` | Custom pad (html2canvas/jspdf) | DocuSign / Dropbox Sign (keep dual-party flow) | Medium — flow is yours, capture is theirs |
| `PaymentProvider` | None | Stripe (Checkout / Payment Links) | n/a — greenfield |
| `EmailProvider` | nodemailer (2 call sites) | Resend/Postmark + templates | Low — 2 call sites |
| `CalendarProvider` | None | Cal.com/Calendly | n/a |
| `StorageProvider` | Local disk + Drive service account | Drive (keep) / S3 | Medium — add abstraction, keep Drive default |
| `AIProvider` | None | OpenAI/Anthropic | n/a — agents built on top |
| `AnalyticsProvider` | None | PostHog (product) + Sentry (errors) | n/a |

### Migration order (safe, incremental)
1. **Harden auth** — session middleware + role checks on all routes (no schema change).
2. **Introduce `agencyId` scoping** — tenant context in Prisma client wrapper; backfill seed agency.
3. **Provider interfaces** — create `lib/providers/*` stubs; move existing call sites (nodemailer, Drive, auth) behind them.
4. **Events/queue** — add a lightweight event table or `POST /api/events` + worker; start with `contract.signed`, `deliverable.submitted`.
5. **Workflow engine** — automations on events (contract→project auto-create).
6. **Agents** — per AI_AGENT_ARCHITECTURE.md, starting with Contract/Ops.
7. **White-label + org onboarding** — enable multiple agencies safely (multi-tenant flag).

### Non-functional targets
- **Security:** all routes authenticated + zod-validated; secrets only in env/Vercel; no PII in logs; files not under `public/`.
- **Testing:** contract/signature pipeline, authz, tenant isolation; CI on PR.
- **Observability:** Sentry + PostHog + agent audit log.
- **Compliance:** e-sign audit trail from provider; invoice/payment records from Stripe.
- **Performance:** keep Next.js + Prisma; add indexes on `agencyId` + status columns; later, edge caching for public/media routes.

---

## VERDICT

The current app is the **working prototype of the loop** (contracts + signatures + contractor portal + Drive delivery) that competitors don't have. The fastest path to a defensible vertical SaaS: **hardening + multi-tenancy + provider interfaces in Q1–Q2, then the workflow engine and the Contract/Ops AI agent in Q3, then white-label + remaining agents in Q4.** Integrate everything else.
