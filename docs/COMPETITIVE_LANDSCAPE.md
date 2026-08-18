# COMPETITIVE LANDSCAPE — Agency Operations & Client Portal Software

- **Date:** 2026-08-12
- **Method:** Live web research of current (2026) products, pricing, and positioning for the categories this platform competes in: studio management, client portals, contract/SOW + e-sign workflows, AI workflow automation, and AI sales/operations agents.

---

## 1. DIRECT COMPETITORS — STUDIO/AGENCY MANAGEMENT + CLIENT PORTALS

| Product | Positioning | Pricing (2026, ballpark) | Key strengths | Gaps vs WhoIsDésir's loop | Threat level |
|---|---|---|---|---|---|
| **HoneyBook** | "Clientflow management" for freelancers (photographers, planners, agencies) | ~$19–29/mo (annual, USD); Essential/Growth tiers | Invoicing+payments, contracts (self-serve), scheduling, client portal, CRM-lite, templates | No vertical contractor/SOW model; contracts generic; no Drive media delivery; no vendor onboarding | HIGH — default for small creative businesses |
| **Dubsado** | Admin/client management for freelancers + studios; 3 workflows (client-facing, internal, e-sign) | ~$200/yr (per pricing web search) | Powerful project workflows, e-sign, invoicing, forms, client portal; **workflow automation baked in** | Generic contracts; no contractor sub-portal; no deliverable approval; no Drive integration | HIGH |
| **17hats** | "Run your business" CRM + booking + invoicing + contracts for service businesses | ~$33–49/mo | CRM, booking, forms, invoices, contracts, to-dos, one dashboard | Generic; weak contractor/talent workflows; dated UX | MEDIUM |
| **Moxie** | Freelancer CRM (projects, invoices, expenses, contracts, proposals) | ~$25/mo (annual, per search) | Nice UX, per-project client portal | Freelancer (solo) oriented, not agency-with-vendors | MEDIUM |
| **Studio Ninja** | Photography/video studio management | ~$25–45/mo | Shoot scheduling, galleries, client portal, invoices | Photography-specialist; weaker contract/SOW assembly & contractor management | MEDIUM (photography-adjacent) |
| **Táve** | "Studio manager" for photographers | ~$25–30/mo + per-month overages | Galleries, proofs, scheduling, albums, invoices | No contractor/vendor layer, no SOW assembly | MEDIUM |
| **Pixieset** (Studio Suite / Gallery + Suite) | Photo studio suite: galleries, client galleries, e-comm, CRM, albums | Suite from ~$39/mo (per search) | Best-in-class client galleries & photo delivery, print sales | No contractor/SOW/contract assembly; media-delivery focused | MEDIUM-HIGH on media, LOW elsewhere |
| **StudioBinder** | Pre-production/production PM for video & film | ~$50/mo (per search) | Call sheets, schedules, shot lists, crew management | Film-production niche; no client billing/contracts/SOW | LOW (adjacent) |
| **SuiteDash** | White-label client portal + business back office | ~$35+/mo (per search) | **White-label portals**, file sharing, forms, projects | Generic; no vertical media workflows; enterprise-feel | MEDIUM (white-label threat) |
| **Foyer** | Client portal for agencies (embedded, branded) | Usage-based (per search) | Branded portal widgets you embed in your own app | Portal-only (no contracts/payments/contractor mgmt) | LOW-MEDIUM (portal substitute) |
| **Copilot (Assembly)** | Client portal + project collaboration, AI-flavored for creative agencies | Per-seat (per search) | Clean client portal, SSO, AI summaries | Portal/collaboration only | LOW-MEDIUM |

**Positioning summary:** There is **no dominant player** doing *contract assembly (Master Agreement + SOW + addenda) → dual-party signature → contractor portal → deliverable approval → Drive media delivery → invoice* inside one branded, white-label platform for media agencies. That exact vertical loop is the whitespace.

---

## 2. AI WORKFLOW AUTOMATION (your Phase 7 "integration-first" tooling options)

| Product | Type | Notes |
|---|---|---|
| **n8n** | Self-hostable workflow automation (open source) | Most flexible; can host behind your stack; 500+ integrations; good for glue workflows + agent nodes (AI/LangChain nodes) |
| **Zapier / Make** | No-code SaaS automation | Easiest, per-task pricing; less control/versioning; higher cost at scale |
| **Lindy** | AI agent platform ("AI that does the work") | Prebuilt agent templates, no-code, runs workflows with AI steps |
| **Gumloop** | Drag-and-drop AI workflow platform | Pipeline-style AI automations (ingest → transform → deliver) |
| **Relevance AI** | Build AI agents & teams with tools | "AI workforce" builders; integrates w/ many apps |
| **Dify** | Open-source LLM app platform | RAG, agent workflows, can self-host |
| **Stack AI** | Enterprise workflow + agent builder | Governance/security focus |
| **CrewAI / LangGraph / AutoGen** | Code-first agent frameworks | Use if you BUILD the AI layer in-house (recommended for proprietary orchestration) |

**Recommendation:** Self-host **n8n** (or build the workflow engine in-app) for glue automation; use **CrewAI/LangGraph** for the proprietary AI agents where you control tool-calls against *your* API. Avoid building generic automation — n8n does it better.

---

## 3. AI SALES / OPS AGENTS (reference for the Sales/Inquiry agent in Phase 8)

| Product | Focus | Notes |
|---|---|---|
| **11x (Alice)** | Outbound sales SDR agent | Personalizes cold email, books meetings; strong proof for AI SDR playbooks |
| **Artisan** (Ava) | AI outbound SDR | All-in-one prospecting → email → booking |
| **Conversica** | AI conversation/lead-response for large orgs | Enterprise lead reply/revenue assistant |
| **Regie** | AI sales content + follow-up automation | Sales email sequences |
| **Clara** | AI scheduling assistant | Email-based scheduling (reference for your booking agent) |

**Takeaway:** AI SDR is a proven, crowded space — don't build an outbound SDR from scratch; do build an *inbound* inquiry-→booking→SOW-intake assistant specific to your media workflow (your `/api/booking` + BookingInquiry model is the seed).

---

## 4. THE WHITESPACE (where you can win)

1. **Vertical contract-to-delivery loop** — no generic tool assembles MA+SOW+addenda, gets both parties to sign, auto-creates project+deliverables, and manages approve/deny to media delivery.
2. **Contractor-as-a-first-class-subject** — competitor models treat the freelancer as a contact; yours treats them as an onboarded, compliance-verified, SOW-bound entity. That is your moat.
3. **White-label + embedded** — SuiteDash/Foyer prove demand for white-label; none do it *for media agency operations*.
4. **AI on top of YOUR workflow** — competitors bolt generic AI onto CRMs; your AI agents can act *inside* the contract→delivery loop (draft addenda, chase signatures, flag deliverable delays, remind on invoice).
5. **Media-delivery-native** — combining Drive folders, photos, videos, and deliverable approval in one branded client view (your WD-105 `kind` work is the seed) beats Pixieset's galleries + separate contract chaos.

## 5. WHAT THIS MEANS FOR POSITIONING

- **Don't** position as "yet another studio CRM / HoneyBook clone."
- **Do** position as: **"The agency operating system for media businesses — contracts, vendors, deliverables, and media delivery under one roof, with AI doing the paperwork."** Your landing page (`src/app/page.tsx`) already leans this way; make the contractor/SOW/signature loop the hero.

*Full category pricing figures are ballpark (2026 web search); verify before any business decision.*
