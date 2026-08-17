# WhoIsDésir® Media — Product Architecture Audit

**Auditor:** opencode (AI-assisted, read-only audit)
**Date:** 2026-08-12
**Scope:** Phases 1–4 and 10–14 of the 14-phase product audit. Phases 5–9 are covered in
their own companion reports (`COMPETITIVE_LANDSCAPE.md`, `PROPRIETARY_MOAT.md`,
`BUILD_VS_INTEGRATE_MATRIX.md`, `AI_AGENT_ARCHITECTURE.md`, `TARGET_ARCHITECTURE.md`).

> **Method note:** Everything below was verified by reading the repository source code.
> File references are relative to the repo root
> (`/Users/jeanfils/Desktop/vibe-coding/Vibe Coding Mastery/whoisdesir-media`).
> Anything that could not be verified from source is explicitly marked
> **UNKNOWN — REQUIRES VERIFICATION**. No code was modified.

---

## Phase 1 — Codebase Location & Inventory

### Location

- Repo root: `/Users/jeanfils/Desktop/vibe-coding/Vibe Coding Mastery/whoisdesir-media`
- Git remote: `https://github.com/whoisdesirtech/widmediaagency.git` (branch `main`)
- Version: `1.0.0` (tag `v1.0.0` exists; `CHANGELOG.md` tracks it)
- Vercel project: `whoisdesirmediaagency` (`.vercel/project.json`)
- Firebase project: `widmediaagency` (`.firebaserc`), live URL `https://widmediaagency.web.app`

### Tech stack (verified from `package.json`, configs, source)

| Layer | Choice | Evidence |
|---|---|---|
| Framework | Next.js 14.2 (App Router) + React 18.3 + TypeScript 5.4 | `package.json` |
| Styling | Tailwind CSS 3.4 | `tailwind.config.js` |
| ORM / DB | Prisma 5.14 + PostgreSQL (Supabase or Google Cloud SQL) | `prisma/schema.prisma`, `DEPLOY.md` |
| Auth | **Custom, client-side** — `POST /api/auth/login` returns user JSON stored in `localStorage`; NextAuth 4.24 is installed and configured (`src/lib/auth.ts`) but **never used** | `src/app/api/auth/login/route.ts`, `src/app/login/page.tsx`, `src/lib/auth.ts` |
| Password hashing | bcryptjs | `src/app/api/auth/login/route.ts` |
| File upload | Server filesystem (`public/uploads/<contractorId>/`) for onboarding docs; Google Drive API for vendor photo delivery | `src/app/api/contractors/[id]/upload/route.ts`, `src/app/api/drive/upload/route.ts` |
| Google integration | googleapis 174 (Drive service account, shared drives) | `src/lib/driveService.ts` |
| Email | nodemailer 7 (SMTP env vars) — used only for booking + plugin-lead notifications | `src/app/api/booking/route.ts`, `src/app/api/plugin-lead/route.ts` |
| PDF libs | `html2canvas` + `jspdf` installed but **never imported — verified dead deps 2026-08-12** (grep of `src/`); signature capture is a raw HTML5 `<canvas>` (`src/components/SignaturePad.tsx`, `canvas.toDataURL`) stored as base64 PNG | `package.json`, grep of `src/` |

### Repository layout

```
src/app/api/*           28 API route files (~1,592 LOC), all unauthenticated
src/app/<portal>        Admin (/dashboard, /contracts, /clients, /contractors, ...)
                        Client (/client/*, /clients/[id]/*)
                        Contractor (/contractor/*, /onboarding/[id])
                        Marketing (/login, /speaker, /sow-builder, /master-agreement, /addenda)
src/components          Sidebar, ClientSidebar, ContractorSidebar, SignaturePad,
                        DraftBanner, StatusBadge, HtmlRenderer, MediaTile
src/data/clauses.ts     Master-agreement clause content (FIXED_CLAUSES, ADDED_CLAUSES)
src/data/addenda.ts     Role-specific addendum templates (photography, videography, social, ...)
src/lib                 prisma.ts, auth.ts (unused), drive.ts, driveService.ts
prisma/schema.prisma    16 models, PostgreSQL
public/                 Marketing HTML, brand assets, training guides, uploads/
```

---

## Phase 2 — Feature Map (verified)

### Core product positioning
The app brands itself a **"Freelancer Talent Agreement System"** for a creative agency
(WhoIsDésir® Media). Its centerpiece is **contract assembly**: automatically merging a
Master Agreement + role-specific addenda + a Statement of Work into a single plain-text
"FREELANCER TALENT AGREEMENT", signed by both parties via canvas signatures.

### What exists (all verified in source)

**1. Admin portal** (`src/app/dashboard`, `/contracts`, `/contractors`, `/clients`, `/admin/projects`, `/settings`)
- Dashboard: contractor counts, active SOWs, pending signatures (`src/app/api/dashboard/route.ts`)
- Contractor CRUD + per-contractor onboarding document upload (W-9 / insurance / licensing) → files on server FS (`src/app/api/contractors/*`)
- Client CRUD + per-client "login as" link generator (`src/app/api/clients/[id]/login/route.ts`)
- Client detail sub-pages: projects, folders (Drive), media, documents, deliverables, billing, messages
- Project management: timeline, progress %, deliverables count, images (`src/app/api/projects/*`)
- SOW creation + deliverable editing/approval modal (`src/app/api/sows/route.ts`, `src/app/clients/[id]/deliverables`)
- Contract assembly + dual-party signing (`src/app/api/contracts/assemble/route.ts`, `src/app/api/signatures/route.ts`)
- Master agreement + addenda editors (`src/app/master-agreement`, `src/app/addenda`)
- Agency settings (name, jurisdiction, communication tools, response-time SLAs) (`src/app/api/settings/route.ts`)
- Password reset (admin-reset + "forgot password" self-service) (`src/app/api/auth/reset-password/route.ts`)

**2. Contractor portal** (`src/app/contractor/*`, `/onboarding/[id]`)
- Dashboard, projects, deliverables (approve/deny), contracts (view + sign), onboarding, training
- "Deliver Photos to Client Drive" — vendor uploads photos into the client's shared Google Drive folder (`src/app/contractor/deliverables`, `src/app/api/drive/upload/route.ts`)

**3. Client portal** (`src/app/client/*`)
- Dashboard, projects, deliverables, documents, media gallery (Google Drive embed + open-in-Drive links), billing, training, account
- **Messages page is MOCK DATA** — hardcoded conversation arrays in the component; no `Message` model, no API (`src/app/client/messages/page.tsx`)

**4. Marketing / acquisition**
- Landing page with services/platform/how-it-works (`src/app/page.tsx`)
- Keynote speaker page + booking-inquiry capture (`src/app/speaker/page.tsx`, `src/app/api/booking/route.ts`)
- Amazon Associates plugin lead capture (`src/app/api/plugin-lead/route.ts`, `public/amazon-*.html`)
- Public static training guides (`public/training-guide.html`, `client-training.html`, `contractor-guide.html`, `developer.html`, `gtm-strategy.html`)

### What does NOT exist (gaps, verified by absence)
- **No payments processing** — invoices are manual records (`Invoice` model + billing UI only); no Stripe/PayPal, no card capture
- **No scheduling/booking/calendar** for projects — `BookingInquiry` is a lead form, not scheduling
- **No real messaging** — messages are static mock UI
- **No AI / agentic features** of any kind in this repo
- **No workflow automation engine** — a few "assemble contract" flows are hardcoded, not user-configurable
- **No multi-tenancy enforcement** — `agencyId` exists on several models, but queries use `findFirst()`/global scope and never filter by tenant
- **No server-side authorization** on any of the 28 API routes
- **No audit log, no rate limiting, no CSRF protection, no sessions/cookies**
- **No product analytics / observability (verified 2026-08-12)** — no PostHog/Umami/Plausible/gtag/@vercel/analytics anywhere; only marketing copy words ("analytics") in content
- **No LLM/AI SDKs (verified 2026-08-12)** — only marketing copy; no OpenAI/Anthropic/langchain usage

---

## Phase 3 — Product Classification

| Dimension | Assessment |
|---|---|
| Category | Vertical / niche B2B **agency operations platform** ("freelancer talent agreement system"), not a horizontal CRM or generic project tool |
| Core value prop | Legally-oriented contractor management: master agreement + addenda + SOW assembly, dual-party e-signature, vendor onboarding & compliance docs, client-facing delivery (Drive) |
| Stage | **Prototype / MVP-tier** (v1.0.0) — single-tenant, single-agency assumption, no billing, no auth hardening |
| Deployed targets | Vercel + Firebase App Hosting (`widmediaagency.web.app`) + Firebase Hosting (static) — deployment story is fragmented (see Risks) |
| Build maturity | Functionally impressive for the contract-assembly niche; architecturally **not production-ready** (auth, authorization, tenancy, data protection) |

---

## Phase 4 — Feature Readiness by Category

Legend: ✅ Done and working · ⚠️ Partial / prototype quality · ❌ Absent

| Category | Status | Evidence / Notes |
|---|---|---|
| Admin Portal | ✅ | Dashboard, CRUD, settings, password reset. No RBAC beyond client-side role string. |
| Client Portal | ⚠️ | Real dashboards/deliverables/drive/billing views; **messages are mock**; media count hardcoded (`77`, flagged WD-107 in CHANGELOG). |
| Vendor/Photographer Portal | ✅ | Contractor dashboard, onboarding uploads, deliverable approval, contract signing, Drive photo delivery. |
| CRM | ⚠️ | Client + contractor records exist; **no pipeline/lead tracking, no CRM workflows, no activity timeline, no tags/segments**. Plugin + booking leads land in DB but have **no admin UI** (`PluginDownloadLead`, `BookingInquiry` models have no list/management pages). |
| Projects | ⚠️ | Timeline/progress/deliverables/images exist; **no task breakdown, no milestones, no Gantt, no assignment timelines, no client-visible effort tracking**. |
| Scheduling | ❌ | None (no calendar, no booking of project work). |
| Payments | ❌ | Invoice *records* only; no processing, no links, no dunning. |
| Communication | ⚠️ | Email only via SMTP for booking/plugin notifications; **no transactional emails** (e.g., password reset returns the password in the HTTP response instead of emailing it), **no in-app messaging** (mock). |
| AI / Agentic AI | ❌ | None in this repo. |
| Workflow Automation | ❌ | Hardcoded contract-assembly pipeline; no configurable automations, no webhooks. |

---

## Phase 10 — Cost & Effort Estimation

Assumptions: build on the existing Next.js/Prisma codebase; small team (1 senior + 1 mid);
figures are engineering-effort estimates (person-weeks) plus tooling costs.

| Capability | Effort | Notes |
|---|---|---|
| Harden auth + authorization (real sessions, route guards, per-portal RBAC) | 1–2 wk | Security-critical, unblocks everything |
| Multi-tenancy enforcement (agency-scoped queries) | 1–2 wk | Mostly query changes |
| Stripe Connect / embedded billing + dunning | 3–4 wk | Contracts as service-first |
| Real messaging (in-app + email threads) | 2–3 wk | Or integrate Intercom/Crisp |
| Scheduling (booking + calendar for project work) | 2–3 wk | Or integrate Calendly via embed |
| AI/agentic layer (see `AI_AGENT_ARCHITECTURE.md`) | 6–12 wk | Phased |
| Configurable workflow automations + webhooks | 3–5 wk | Or integrate Zapier/Make |
| CRM: lead pipeline UI for booking/plugin leads + client lifecycle | 2–3 wk | Reuses existing models |
| Production infra (CI/CD unification, observability, backups, staging) | 1–2 wk | |
| PDF/legal export (e-sign-compliant, audit trail) | 2–4 wk | Or integrate DocuSign/Hellosign |
| **Total (approx.)** | **~5–6 months** for full scope | Core hardening ~2 months |

Tooling (monthly, approximate): Vercel Pro (~$20), Supabase Pro (~$25), Resend (~$0–20),
Stripe (~2.9% + $0.30/txn), LLM APIs (variable), Sentry (~$0–29). **UNKNOWN — REQUIRES VERIFICATION** for exact current pricing.

---

## Phase 11 — 90-Day Execution Roadmap

**Days 1–30 — Security & foundation (do not skip)**
1. Replace client-side localStorage auth with real server sessions (use the existing NextAuth setup or a cookie session) — `src/lib/auth.ts` already exists and is unused; wire it up.
2. Add server-side authorization to all 28 API routes (portal-scoped RBAC).
3. Scope every query to `agencyId`; enforce tenant isolation.
4. Fix `reset-password` to email a reset link/token instead of returning the password in the response.
5. Unify deployment to ONE target (recommend Vercel + Supabase; deprecate Firebase App Hosting/Cloud SQL path to avoid drift).

**Days 31–60 — Revenue + trust**
6. Stripe integration (invoices → payable links, webhooks, dunning).
7. Real transactional email (Resend/SES) for resets, notifications, invoices.
8. Replace mock messaging with a minimal Message model (or integrate a chat vendor).
9. CRM surface: admin pages for `BookingInquiry` + `PluginDownloadLead` with statuses.

**Days 61–90 — Differentiation**
10. First AI/agentic slice (see `AI_AGENT_ARCHITECTURE.md` Step 1): contract QA assistant + automated deliverable status updates.
11. Configurable automation layer (or Zapier/Make integration).
12. PDF export + e-sign audit trail (build or integrate DocuSign).
13. Observability: Sentry + structured logging + backup policy.

---

## Phase 12 — Risk Assessment

| # | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| R1 | **All API routes are unauthenticated** — anyone who knows the endpoints can read/write clients, contractors, contracts, invoices, signatures | Critical | High (already shipped) | Real sessions + RBAC (Day 1–30); do not market until done |
| R2 | Password reset returns plaintext password in HTTP response (no ownership verification, no email) — **verified 2026-08-12**: `src/app/api/auth/reset-password/route.ts` is unauthenticated, accepts any `email`, generates a 12-char password, bcrypt-hashes it, and returns `{ email, newPassword, name }` to the caller → **full anonymous account takeover** (and user enumeration via 404 vs success) | Critical | High | Token-based reset flow (email a reset link; never return the password) |
| R3 | Onboarding document uploads write to `public/uploads` (world-readable, wiped on serverless redeploy) | High | High | Object storage (S3/R2/Supabase Storage) with private access |
| R4 | Single-tenant assumption; no tenant filtering → cross-client data exposure if scaled | High | Medium | Enforce `agencyId` scoping |
| R5 | Fragmented deployment (Vercel + Firebase App Hosting + Firebase Hosting + Cloud SQL vs Supabase) creates config drift and deploy ambiguity | Medium | High | Pick one stack |
| R6 | Legal content is plain text with "ATTORNEY REVIEW NOTE" placeholders; unsigned-by-default workflows assume validity | Medium | High | Lawyer review before public launch; disclaimers |
| R7 | No audit trail for signature tampering/verification (base64 PNG only) | Medium | Medium | Hash + timestamp + immutable log, or certified e-sign vendor |
| R7b | **Verified 2026-08-12:** `/api/signatures` is unauthenticated and unvalidated — accepts arbitrary `contractId` + `signatureData` (raw `canvas.toDataURL` PNG), never verifies the contract exists or the signer's identity, and increments the signature count that triggers contract activation → **signature spoofing / activation bypass** | Critical | High | Authenticate caller, verify signer role matches user, check contract state, record audit fields |
| R8 | Unused deps (next-auth, html2canvas, jspdf) signal half-finished features | Low | Medium | Remove or complete |
| R9 | Mock "messages" and hardcoded media count undercut demo credibility | Low | High | Replace or label clearly |
| R10 | `amazon-*.html`/plugin co-located in repo but CHANGELOG claims it's separate — confusing repo hygiene | Low | Medium | Split repo or reconcile docs |

---

## Phase 13 — KPIs & Success Metrics

**Activation & trust**
- Time-to-first-contract for a new vendor < 15 min (from invite → signed contract)
- % vendors completing onboarding (W-9/insurance/licensing) within 7 days
- Contract assembly success rate (no manual edits) > 90%

**Revenue**
- % of invoices paid online (Stripe) vs manual; days-sales-outstanding trend
- Lead-to-client conversion for `BookingInquiry` + `PluginDownloadLead` (now unmanaged)
- Monthly agency ARR / per-client revenue

**Product/engineering**
- API auth coverage 100% (routes behind auth)
- No R1/R2 class security findings in pen test
- Uptime ≥ 99.9%; P95 API latency < 300 ms
- Tenant isolation test suite passes for all portals

**AI/agentic (post-Step 1)**
- Contract QA: % of contracts whose first draft passes agent review without human edit
- Deliverable status accuracy (agent auto-updates) ≥ 95%
- Hours saved/week vs manual ops (target ≥ 8 h/week at MVP)

---

## Phase 14 — Final Recommendation (Short- & Long-Term)

### Short-term (0–6 months) — "Fix, then sell"
1. **Make it secure first.** The product differentiator (contract assembly) is genuinely
   good and defensible, but the current auth/authorization state is disqualifying for any
   real client-facing use. Harden auth + RBAC + tenancy before any growth spend.
2. **Add the revenue loop** (Stripe + email) so the platform can pay for itself.
3. **Ship one AI capability** (contract QA + deliverable status automation) to own the
   "agency OS" narrative before it becomes commoditized.
4. Keep build-vs-integrate pragmatic: **buy** messaging, scheduling, e-sign (or DocuSign),
   and automation glue (Zapier/Make); **build** only the contract-assembly + AI layer.

### Long-term (6–18 months)
5. Evolve from "Freelancer Talent Agreement System" → **"Creative Agency Operating System"**
   where the assembly engine + agentic layer become the moat and portals become the
   delivery surface. Do NOT pivot to horizontal CRM — win the vertical.
6. Productize multi-tenancy and offer the platform to other agencies as SaaS (leverage
   the fact that `Agency` is already a root model), or keep single-tenant if the strategy
   is to stay an internal tool — make this decision explicitly.
7. Maintain strict scope discipline: features that are not the moat must be integrated,
   not built.

**Bottom line:** This is a well-scoped, unusually coherent MVP for the niche it targets.
It is not yet production-ready (security + data-integrity gaps) and has zero AI/agentic
capability today. The correct sequence is: **harden → monetize → differentiate with AI**.
