# Phase 14 — AI DISCOVERY & TARGET PROMPTS

- **Date:** 2026-08-12
- **Repo:** `whoisdesir-media` · **Companion docs:** `PRODUCT_ARCHITECTURE_AUDIT.md`, `TARGET_ARCHITECTURE.md`, `AI_AGENT_ARCHITECTURE.md`, `BUILD_VS_INTEGRATE_MATRIX.md`, `PROPRIETARY_MOAT.md`
- **Verified baseline:** zero AI code in the repo today (no LLM SDKs, no analytics, no agents). All 28 API routes are unauthenticated; NextAuth is dead; `/api/auth/reset-password` returns new passwords in the HTTP response; `/api/signatures` can be spoofed by anyone.

---

## PART 1 — AI DISCOVERY (what to build, and why)

### 1.1 Discovery summary

AI is not a feature you bolt on; it is the **orchestration layer over your proprietary workflow data** (contracts, SOWs, deliverables, invoices, Drive delivery). LLM models are commodity — **integrate**. Agent orchestration over your data is the moat — **build**.

| Agent | Capability (first slice) | ROI | Depends on |
|---|---|---|---|
| **Contract/Ops** (start here) | Draft SOW/addenda from a brief using the existing clause library; assemble contracts; chase signatures; flag compliance expiry | Highest — sits on your strongest feature (contracts/signatures) | Auth hardening · workflow events |
| **Delivery/Task** | Deadline reminders; deliverable-submission chaser; at-risk project alerts | High — reduces manual ops | Deliverable state machine |
| **Finance** | Invoice drafting from approved deliverables; overdue dunning; revenue per project/contractor | High — revenue loop | Stripe · email provider |
| **Sales/Inquiry** | Qualify `BookingInquiry` → book Cal.com slot → draft SOW brief | Medium | Cal.com · email |
| **ClientSuccess** | Project-status summaries for clients; FAQ answers; media-availability replies | Medium | Workflow events |

**Hard dependency:** all five agents are pointless and dangerous until every API route is authenticated and tenant-scoped (Prompt 1–3 below are P0, before any AI prompt).

### 1.2 AI architecture rules (encode in every prompt)

1. **Agents never touch the DB directly** — they call typed tools that wrap your existing API routes.
2. **Human-in-the-loop on writes** — agents create *drafts* and send notifications; humans approve anything that mutates legal/financial/scope data.
3. **Full audit trail** — every tool call logged (who/what/when).
4. **`AIProvider` interface** — OpenAI/Anthropic swappable; never hardcode a vendor in components.
5. **No prompt injection** — client/contractor-supplied text is untrusted data, never instructions.

---

## PART 2 — TARGET PROMPTS (copy-paste into your AI coding agent)

### PROMPT 0 — Context seed (paste first, once per session)

> You are working in the repo at `/Users/jeanfils/Desktop/vibe-coding/Vibe Coding Mastery/whoisdesir-media` — a Next.js 14 (App Router) + TypeScript + Prisma/PostgreSQL vertical SaaS for media agencies. Read `PRODUCT_ARCHITECTURE_AUDIT.md`, `TARGET_ARCHITECTURE.md`, and `AI_AGENT_ARCHITECTURE.md` for context. Follow existing code conventions (server components + client components in `src/app`, API routes in `src/app/api/*`, shared helpers in `src/lib`, data in `src/data`). Do NOT add comments unless asked. After any change, run `npm run typecheck` and `npm run build` and fix everything you broke. Do not add new dependencies unless the prompt explicitly allows it.

---

### PROMPT 1 — Sprint 1 · Harden auth + RBAC (P0, do first)

> **Goal:** make every API route authenticated and role-checked. Today all 28 routes in `src/app/api/**/route.ts` are unauthenticated; auth is a client-side `localStorage['user']` set by `/api/auth/login`. There is a dead NextAuth setup: `src/lib/auth.ts` (imported nowhere) and an empty `src/app/api/auth/[...nextauth]/` directory.
>
> **Scope:**
> 1. Implement a working server-side session. Either wire up NextAuth 4 CredentialsProvider (reusing `src/lib/auth.ts` and `src/lib/prisma.ts`) or introduce a signed HttpOnly cookie session with a `requireAuth(roles)` helper. Keep the existing `User.role` values: `admin | staff | contractor | client`.
> 2. Add a `requireAuth`/`requireRole` guard and apply it to **every** existing API route. Portal mapping: admin/staff → admin, contractor APIs → `contractor` role bound to the logged-in `User.contractorId`, client APIs → `client` role bound to `User.clientId`. Existing unauthenticated entry points that must stay public: `POST /api/auth/login` only.
> 3. Keep the login page flow working but make it call your new session API instead of writing `localStorage['user']`; derive the logged-in role/name server-side.
> 4. Do not break existing client components that read the current user — either keep a lightweight client-side user fetch from `/api/me` or update the components.
>
> **Acceptance criteria:** every route returns 401 without a valid session and 403 on wrong role; `npm run typecheck` passes; `npm run build` passes; login/logout round-trips in the browser; no `localStorage['user']` remains as an auth source.
> **Verify:** `npm run typecheck && npm run build`; manually test login → each portal.

---

### PROMPT 2 — Sprint 1 · Token-based password reset (P0, critical)

> **Goal:** fix `src/app/api/auth/reset-password/route.ts`. Currently it is unauthenticated, resets any user's password, and **returns the new password in the HTTP response** — a full anonymous account-takeover bug. Replace it with a secure flow.
>
> **Scope:**
> 1. `POST /api/auth/reset-password` (public): accept `{ email }`. Do NOT reveal whether the account exists (return the same message either way) to prevent enumeration. Generate a short-lived reset token, store its hash on the User (add a `resetTokenHash` + `resetTokenExpires` field to the `User` model in `prisma/schema.prisma`), and send the reset link by email via an `EmailProvider` helper (see `src/lib` — if no email provider exists yet, use nodemailer exactly like `src/app/api/booking/route.ts` and reuse the SMTP env vars).
> 2. `POST /api/auth/reset-password/confirm` (public): accept `{ token, newPassword }`, verify token hash + expiry, enforce a minimum password strength (≥ 8 chars, mixed), update `passwordHash` (bcrypt), invalidate the token, and expire all existing sessions.
> 3. Never return a password in any response.
>
> **Acceptance criteria:** no route returns a password; no account-enumeration via status codes; token expiry enforced; typecheck + build pass.
> **Verify:** `npm run typecheck && npm run build`.

---

### PROMPT 3 — Sprint 1 · Secure the signatures endpoint (P0, critical)

> **Goal:** fix `src/app/api/signatures/route.ts`. Today anyone can POST arbitrary `{ contractId, signerRole, signerName, signatureData }`, no contract or identity verification happens, and the saved signature increments the count that activates a contract.
>
> **Scope:**
> 1. Require an authenticated session (Prompt 1's `requireAuth`).
> 2. Validate: the `AssembledContract` exists and is in a signable status; `signerRole` matches the caller (agency/admin-staff for `agency`, the `Contractor` bound to the logged-in user for `contractor`); `signerName`/`signerEmail` are taken from the authenticated User, not the request body.
> 3. Persist extra audit fields: `signedByUserId`, `ip` (if feasible), `userAgent`, and an `ISO` timestamp; never accept client-supplied timestamps.
> 4. Add a zod validation schema for the request body.
>
> **Acceptance criteria:** unauthenticated → 401; wrong signer role → 403; unknown contract → 404; only the activation-count logic you already have runs after valid dual-party signatures.
> **Verify:** `npm run typecheck && npm run build`.

---

### PROMPT 4 — Sprint 2 · Multi-tenancy / `agencyId` scoping

> **Goal:** enforce tenant isolation. Models already carry `agencyId` but every query ignores it (e.g., `prisma.agency.findFirst()` in `src/app/api/settings/route.ts` and `src/app/api/dashboard/route.ts`).
>
> **Scope:**
> 1. Add a tenant context: derive the active `agencyId` from the authenticated user's `agencyId` in `requireAuth` and expose it (e.g., a `getAgencyId()` helper or request-scoped context) so API routes never guess it.
> 2. Audit every Prisma query in `src/app/api/**` and scope reads/writes to the current `agencyId` (models that have the FK). Backfill the single seed agency so existing data keeps working.
> 3. Add a `where: { agencyId }` default by wrapping the Prisma client (`src/lib/prisma.ts`) with a scoped proxy, or update each route — prefer the wrapping approach to make future routes safe by default.
> 4. Keep an escape hatch for system-level operations (email verification, password reset) that must not be tenant-scoped.
>
> **Acceptance criteria:** a user from agency A cannot read or write agency B rows (verify by test or manual DB check); typecheck + build pass.
> **Verify:** `npm run typecheck && npm run build`.

---

### PROMPT 5 — Sprint 2 · Stripe payments on invoices

> **Goal:** make invoices payable. There is an `Invoice` model and CRUD (`src/app/api/invoices/**`) but no payment processing.
>
> **Scope:**
> 1. Add `stripe` dependency (allowed). Create `src/lib/providers/PaymentProvider.ts` (interface: `createPaymentLink(invoice)`, `getPaymentStatus(id)`, `handleWebhook(payload)`).
> 2. On invoice creation/approval, generate a Stripe Payment Link or Checkout Session; store `stripePaymentIntentId`/`stripeCheckoutId` on the `Invoice` model.
> 3. Add `POST /api/webhooks/stripe` (public, signature-verified via `stripe.webhooks.constructEvent`) that marks invoices paid and emits an `invoice.paid` event.
> 4. Surface the pay link on the client billing page and admin invoice view; show payment status.
>
> **Acceptance criteria:** test-mode payment flow completes end-to-end; webhook signature verified; invoice status transitions unpaid → paid only via verified webhook; typecheck + build pass.
> **Verify:** `npm run typecheck && npm run build`; manual test in Stripe test mode.

---

### PROMPT 6 — Sprint 2 · Email provider + transactional templates

> **Goal:** replace the two ad-hoc nodemailer call sites with a single provider and send real transactional email.
>
> **Scope:**
> 1. Create `src/lib/providers/EmailProvider.ts` with `send(to, templateId, vars)`; implement with nodemailer now (env `SMTP_*`) but keep the interface swap-ready for Resend/Postmark.
> 2. Templates needed: signature-request, contract-signed confirmation, deliverable-approved/denied, deliverable-due reminder, invoice-due, invoice-paid, password-reset link (Prompt 2).
> 3. Refactor `src/app/api/booking/route.ts` and `src/app/api/plugin-lead/route.ts` to use it. Remove the hardcoded `digitalvurv@gmail.com` recipient — move to env `ORGANIZER_EMAIL`/`OWNER_EMAIL` with a default.
> 4. Never fail a request on email errors; log and continue (matches current best-effort behavior).
>
> **Acceptance criteria:** all send paths go through one provider; no duplicate nodemailer imports outside it; typecheck + build pass.
> **Verify:** `npm run typecheck && npm run build`.

---

### PROMPT 7 — Sprint 3 · Contract-to-project automation (workflow engine v1)

> **Goal:** when a contract becomes active (both parties signed), automatically create the Project + default Deliverables + a Drive folder structure. This is the first piece of the domain workflow engine (the moat).
>
> **Scope:**
> 1. Add a lightweight event table or in-app event dispatch: when `/api/signatures` activates a contract, emit `contract.signed`.
> 2. Add a handler that, on `contract.signed`, creates a `Project` (title, client from contract, timeline defaults) and clones the SOW's deliverable list into `Deliverable` rows, and creates the per-client Google Drive folders if they don't exist (reuse `src/lib/driveService.ts`).
> 3. Idempotent: rerunning the handler must not create duplicates.
> 4. Log every automation run to a new `AutomationLog` model (event, target ids, status, error).
>
> **Acceptance criteria:** signing the final signature in the contractor portal creates the project + deliverables + folders in one flow; rerun-safe; visible in the admin projects list; typecheck + build pass.
> **Verify:** `npm run typecheck && npm run build`; manual dual-sign test.

---

### PROMPT 8 — Sprint 3 · Contract/Ops AI agent (first agent — the flagship)

> **Goal:** an AI assistant that drafts SOWs/addenda from a short brief using the existing clause library (`src/data/clauses.ts`, `src/data/addenda.ts`) and past contracts, then assembles a contract for human approval.
>
> **Scope:**
> 1. Add `AIProvider` (`src/lib/providers/AIProvider.ts`) with `complete(system, user, opts)`; implement with the OpenAI or Anthropic SDK (add the dependency — allowed here); keep it swappable. Use env `OPENAI_API_KEY`/`ANTHROPIC_API_KEY`.
> 2. Create `src/app/api/ai/draft-sow/route.ts` (authenticated, admin/staff): input `{ projectBrief, clientId?, addendumIds? }`; the provider assembles a draft SOW (title, scope, deliverables with deliverables array matching the `SOW` shape) grounded in the clause library text. **Return a draft; do NOT persist.**
> 3. Create `src/app/api/ai/assemble-contract/route.ts`: takes an approved SOW id + addenda ids, calls the existing assemble logic, and returns a draft `AssembledContract` in `draft` status for admin confirmation before it becomes active.
> 4. Audit log every AI call (`AutomationLog` or new `AiAuditLog`): prompt fingerprint, model, latency, outcome. Human approval is required before any write to the SOW/contract tables.
>
> **Acceptance criteria:** admin pastes a brief → gets a structured draft SOW in the existing SOW form → approves → contract assembles via existing flow; no DB mutation before approval; audit rows written; typecheck + build pass.
> **Verify:** `npm run typecheck && npm run build`; manual test with a real API key.

---

### PROMPT 9 — Sprint 3 · Deliverable approval state machine

> **Goal:** formalize deliverable lifecycle and notify the right people on each transition.
>
> **Scope:**
> 1. Add a `status` enum to `Deliverable`: `pending → submitted → approved | needs_revisions → resubmitted → approved` (keep existing approve/deny endpoints working, mapping into these states).
> 2. Emit events on transitions (`deliverable.submitted`, `deliverable.approved`, `deliverable.rejected`) and send email via `EmailProvider` (Prompt 6): client/staff on submission, contractor on approval/revision request.
> 3. Add `revisionRequestNote` and `approvedById`/timestamps to the model.
>
> **Acceptance criteria:** transitions are enforced (no jumping states), notifications fire, existing approve/deny UI still works; typecheck + build pass.
> **Verify:** `npm run typecheck && npm run build`.

---

### PROMPT 10 — Sprint 3 · Cal.com scheduling on inquiries

> **Goal:** let speaker/social inquiries book a real time. Today `/api/booking` just stores a `BookingInquiry` and emails best-effort.
>
> **Scope:**
> 1. Add `cal.com` SDK (dependency allowed) with `src/lib/providers/CalendarProvider.ts` (`createBooking`, `getAvailability`).
> 2. In the booking flow: after an inquiry is saved, check availability and return one or more suggested slots to the client; on selection create the booking and store `calBookingUid` + `scheduledAt` on `BookingInquiry`.
> 3. Keep the fallback behavior when Cal.com env vars are unset (form-only, current behavior).
>
> **Acceptance criteria:** with env set, an inquiry can book a real slot that appears in your Cal.com calendar; without env, current behavior unchanged; typecheck + build pass.
> **Verify:** `npm run typecheck && npm run build`.

---

### PROMPT 11 — Sprint 4 · White-label theming

> **Goal:** per-tenant branding so each agency can put its own logo/colors/domain on the portals.
>
> **Scope:**
> 1. Add a `Brand` config to the `Agency` model (JSON: `logoUrl`, `primaryColor`, `accentColor`, `font`, `faviconUrl`, `portalDomain?`) with a settings editor under `/settings`.
> 2. Apply brand tokens as CSS variables in the root layout so all portals inherit them; use them in the sidebars, buttons, login page, and client media gallery.
> 3. Guard the settings editor behind admin role (Prompt 1).
>
> **Acceptance criteria:** changing brand settings in the UI restyles the whole app immediately (no reload of tokens); defaults match current look; typecheck + build pass.
> **Verify:** `npm run typecheck && npm run build`.

---

### PROMPT 12 — Sprint 4 · Reporting

> **Goal:** revenue + ops reporting to prove the workflow engine works.
>
> **Scope:**
> 1. New `src/app/api/reports/overview/route.ts` (admin): revenue per project and per contractor (sum of paid invoices, joined to project/contractor), deliverable on-time %, contracts signed/active counts, vendor compliance expiry list.
> 2. A read-only `/reports` admin page with the four views (reuse existing UI patterns/sidebar).
> 3. Only counts from authenticated, tenant-scoped queries (Prompts 1 & 4).
>
> **Acceptance criteria:** numbers match a manual SQL check for the seed data; page renders in admin; typecheck + build pass.
> **Verify:** `npm run typecheck && npm run build`.

---

### PROMPT 13 — Maintenance · Dead code & mock pages

> **Goal:** clean up verified dead code and stop presenting mock features as real.
>
> **Scope:**
> 1. Remove unused deps `html2canvas`, `jspdf` from `package.json` (verified never imported; signature capture uses a raw canvas) and the empty `src/app/api/auth/[...nextauth]/` directory; keep `next-auth` only if Prompt 1 chose it, otherwise remove.
> 2. Replace the hardcoded media count `77` in `src/app/client/dashboard/page.tsx` with a real count from the API.
> 3. Mock pages (`src/app/client/messages/page.tsx`, billing, documents, deliverables if static): either wire to real APIs/models or add a visible "Coming soon" state — do not ship fake data as real.
> 4. Delete conflicting root artifacts if unreferenced: `dev.db`, `firebase.json`, `apphosting.yaml`, `docker-compose.yml`, `supabase-init.sql` (confirm with owner before deleting — ask if unsure).
>
> **Acceptance criteria:** no unused-deep imports of removed libs; no hardcoded counts; mock pages clearly labeled; typecheck + build pass.
> **Verify:** `npm run typecheck && npm run build`.

---

### PROMPT 14 — Quality · Tests for the contract/signature pipeline

> **Goal:** add tests around the most important and now-secure flow.
>
> **Scope:**
> 1. Add a test runner (allow `vitest` dependency) and a test script `npm test`.
> 2. Unit/integration tests: contract assembly (`src/app/api/contracts/assemble/route.ts`), signature validation rules from Prompt 3 (wrong role rejected, unknown contract 404, activation on both parties), token-based password reset (Prompt 2) expiry + enumeration-safe behavior, and tenant scoping (Prompt 4) cross-agency 404/403.
> 3. Mock `prisma` with a test DB (SQLite or `prisma migrate` against a test Postgres) — prefer whatever is least disruptive to the existing `db:push` workflow.
>
> **Acceptance criteria:** `npm test` runs green; the security-critical paths (Prompt 3, 2, 4) have coverage; typecheck + build still pass.
> **Verify:** `npm test && npm run typecheck && npm run build`.

---

## PART 3 — SEQUENCING CHEAT-SHEET

```
SPRINT 1 (P0 security)   → PROMPTS 1, 2, 3  (+ 13 for cleanup)
SPRINT 2 (revenue/trust) → PROMPTS 4, 5, 6
SPRINT 3 (differentiation)→ PROMPTS 7, 9, 8  (workflow → states → AI flagship)
                           PROMPT 10 (scheduling, parallel)
SPRINT 4 (scale)         → PROMPTS 11, 12, 14 (theming, reporting, tests)
```

**Rule:** do not start Sprint 2+ until Prompt 1–3 land — every agent/tool call depends on authenticated, tenant-scoped APIs.
