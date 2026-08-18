# whoisdesir-media — WhoIsDésir® Media Agency Platform

Next.js (App Router) agency-management platform: contractor onboarding, SOWs, contract assembly/signing, clients, deliverables, invoices, Google Drive storage, developer portfolio, influencer audits, audit agent (AI scoring), and social media brand kits.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit` (use this to verify changes)
- `npm run db:push` — apply schema changes to DB (no migration files used)
- `npm run db:seed` — `tsx prisma/seed.ts`
- `npm run db:studio` — Prisma Studio
- ESLint is NOT configured (`next lint` opens an interactive setup prompt — do not run it).

## Stack

- Next.js 14 App Router, TypeScript (strict-ish; `any` used in places), Tailwind CSS
- Prisma + PostgreSQL (see `prisma/schema.prisma`, 25 models). Connection via `DATABASE_URL`/`DIRECT_URL` env vars
- NextAuth credentials strategy (`src/app/api/auth/[...nextauth]/route.ts`, options in `src/lib/auth.ts`)
- Google Drive via service account (`src/lib/driveService.ts`), uploads to Drive, not local disk

## Project structure

- `src/app/api/` — all route handlers; auth pattern is uniform (see below)
- `src/app/api/tasks/` — task CRUD (admin/staff)
- `src/app/api/portfolio/` — portfolio item CRUD (admin/staff)
- `src/app/api/influencers/` — influencer CRUD (admin/staff)
- `src/app/api/influencer-audits/` — audit CRUD + status updates
- `src/app/api/audit-agent/` — POST to run AI scoring agent on an influencer
- `src/app/api/brand-kits/` — brand kit CRUD + section management
- `src/app/api/reviews/` — review CRUD (admin/staff approval workflow)
- `src/app/<role>/` — portals: `admin`+`dashboard` (admin/staff), `contractor/`, `client/`
- `src/app/<role>s/[id]/` — admin-facing detail pages for a client/contractor
- `src/app/developer/` — developer portal (portfolio, projects, tasks, influencers, audits, audit agent, brand kits)
- `src/lib/audit-agent/` — modular AI scoring framework (brand identity, visual identity, content strategy, social presence, market position)
- `src/lib/` — `auth.ts` (session helpers), `audit.ts` (audit logging), `storage.ts` (storage limits), `rateLimit.ts`, `prisma.ts`, `drive.ts`, `driveService.ts`
- `src/components/` — shared UI (Sidebar, ContractorSidebar, SignaturePad, StatusBadge, DraftBanner)
- `src/middleware.ts` — CSRF double-submit protection (see below)
- `src/app/admin/audit-log/` — admin-only audit log viewer (feed: `GET /api/audit`, admin only)

## Auth & security conventions (IMPORTANT)

Every API route handler MUST start with a guard. Helpers in `src/lib/auth.ts`:

```ts
const user = await requireAdminOrStaff();   // admin | staff
const user = await requireAdmin();           // admin only
const user = await requireAuth(['admin', 'staff', 'contractor']); // any list
const user = await requireManagerOrAbove();  // admin | staff | manager
const user = await requireReviewerOrAbove(); // admin | staff | manager | reviewer
const user = await requireDeveloperOrAbove(); // admin | staff | manager | reviewer | developer
if (isNextResponse(user)) return user;       // always check after a guard

// Permission checkers
canDelete(user)        // admin | staff | manager
canApprove(user)       // admin | staff | manager | reviewer
canPublish(user)       // admin | staff | manager
canModifyConfig(user)  // admin only
```

Roles: `admin`, `staff`, `contractor`, `client`, `manager`, `reviewer`, `developer`, `intern` (column on `User`). Session user carries `agencyId`, `contractorId`, `clientId` — use these for ownership checks (e.g. contractor may only see/sign their own contracts).

- Shared GET routes are role-scoped: clients/contractors must be forced to their own records (`where.clientId = user.clientId`), never trust query params from them.
- Public by design: `api/booking`, `api/plugin-lead`, `api/auth/reset-password`. All are rate-limited via `src/lib/rateLimit.ts` and reset-password must NEVER return the new password or confirm account existence.
- Uploads are whitelisted: `api/contractors/[id]/upload` allows only fields `taxFormUrl | insuranceProofUrl | licensingProofUrl` and extensions `pdf|jpg|jpeg|png` (10MB). `api/projects/[id]/images` allows `jpg|jpeg|png|webp|gif` (15MB). Do not relax these without adding equivalent checks.
- Contract signing (`api/signatures`): both roles require login; contractor must match the contract's `contractorId`.
- CSRF: `src/middleware.ts` enforces a double-submit cookie (`XSRF-TOKEN` cookie + `X-XSRF-Token` header) on every mutating `/api/*` request, except `/api/auth/*`, `/api/booking`, `/api/plugin-lead`. `CsrfProvider` (in root layout) patches `window.fetch` to attach the header. New client-side fetches need no changes.
- Audit log: use `logAudit(user, { action, method, path, entity, entityId, metadata })` from `src/lib/audit.ts` in every handler that mutates important state (contracts, signatures, settings, agreements, addenda, clients, contractors, SOWs, credential generation). Auth events (signIn/signOut) are logged in `auth.ts`. Never block the request on audit failures.
- Storage limits: contractor uploads are capped per-contractor (`STORAGE_LIMIT_MB`, default 500) by summing `public/uploads/<contractorId>/`. Apply `storageLimitBytes()` + `dirBytes()` to new upload routes.
- Keep every new route handler guarded — this repo is being hardened and regressions are the main risk.

## Gotchas

- `tsc --noEmit` also type-checks stale generated files under `.next/types/`. If you see errors referencing removed routes (e.g. `api/auth/login`), delete the stale entry (`.next` is gitignored and regenerated).
- `me` endpoint uses `getSession`/`getSessionUser` directly, not `requireAuth`.
- File sizes are capped because route handlers read whole files into memory.
