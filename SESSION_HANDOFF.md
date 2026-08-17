# Session Handoff — WhoIsDésir Media Agency Platform

> Read `AGENTS.md` first for commands, stack details, auth conventions, and
> contribution workflow. This file captures where the project stands so a future
> session can resume quickly.

## Project

- **Name:** WhoIsDésir Media Agency Platform
- **Repo root:** `/Users/jeanfils/Desktop/vibe-coding/Vibe Coding Mastery/whoisdesir-media`
- **Remote:** `whoisdesirtech/widmediaagency` on GitHub
- **Live site:** Vercel (Next.js) — `widmediaagency.vercel.app`
- **Firebase project:** `widmediaagency` (Firestore, Hosting fallback)
- **Database:** Supabase PostgreSQL via Prisma
- **Version:** `1.0.0` (see `CHANGELOG.md`)

## Current State

- **Branch:** `main` (up to date with `origin/main`)
- **Status:** 41 modified files + 23 untracked files — **all uncommitted**
- **Last committed work:** WD-105 shared-drive uploads + deliverable link tiles

## What Was Recently Done (Uncommitted)

A major security-hardening pass was completed but never committed:

1. **NextAuth migration** — replaced old `/api/auth/login` (deleted) with NextAuth
   credentials strategy. Login page updated to use `signIn()` from `next-auth/react`.
2. **CSRF double-submit protection** — `src/middleware.ts` enforces `XSRF-TOKEN` cookie
   + `X-XSRF-Token` header on every mutating `/api/*` request (except auth, booking,
   plugin-lead). `CsrfProvider` in root layout patches `window.fetch`.
3. **Audit logging** — `src/lib/audit.ts` + `AuditLog` Prisma model. Every mutating
   API route now calls `logAudit()`. Auth events (signIn/signOut) logged via NextAuth
   events. Admin viewer at `src/app/admin/audit-log/`.
4. **Rate limiting** — `src/lib/rateLimit.ts` (in-memory bucket). Applied to
   `api/booking`, `api/plugin-lead`, `api/auth/reset-password`.
5. **Storage limits** — `src/lib/storage.ts` caps contractor uploads per-contractor
   (`STORAGE_LIMIT_MB`, default 500 MB).
6. **Auth guards on all API routes** — every handler now starts with `requireAdmin()`,
   `requireAdminOrStaff()`, `requireAuth([...])`, `requireClient()`, or
   `requireContractor()`, followed by `if (isNextResponse(user)) return user`.
7. **Prisma schema** — added `AuditLog` model with indexes on `userId`, `action`,
   `createdAt`.
8. **New untracked files:** `src/middleware.ts`, `src/lib/audit.ts`,
   `src/lib/rateLimit.ts`, `src/lib/storage.ts`, `src/components/CsrfProvider.tsx`,
   `src/app/api/auth/[...nextauth]/`, `src/app/api/me/`, `src/app/admin/audit-log/`,
   `src/app/admin/audit/`, `src/app/api/audit/`, `src/app/portal-guide/`, and
   several architecture/strategy docs.

## Key Docs

- `AGENTS.md` — commands, stack, auth conventions, contribution workflow
- `CHANGELOG.md` — version history (currently `1.0.0`)
- `AI_AGENT_ARCHITECTURE.md` — agent architecture design (untracked)
- `AI_DISCOVERY_AND_TARGET_PROMPTS.md` — discovery prompts (untracked)
- `BUILD_VS_INTEGRATE_MATRIX.md` — build vs integrate decisions (untracked)
- `COMPETITIVE_LANDSCAPE.md` — competitive analysis (untracked)
- `PRODUCT_ARCHITECTURE_AUDIT.md` — product architecture audit (untracked)
- `PROPRIETARY_MOAT.md` — proprietary moat analysis (untracked)
- `TARGET_ARCHITECTURE.md` — target architecture (untracked)
- `DEPLOY.md` — deployment guide (untracked)
- `GOOGLE_DRIVE_SETUP.md` — Google Drive integration setup (untracked)

## Open / Next Steps

- **Commit the security hardening work** — all changes are uncommitted. Stage,
  commit, and push per AGENTS.md convention (feature branch + PR).
- **Run `npm run typecheck`** — verify no type errors after the changes.
- **Client dashboard media count** (`77`) is still hardcoded — planned WD-107.
- **ESLint** is not configured (`next lint` opens interactive setup — do not run).
- **Audit log viewer** pages exist but may need styling/polish.
- **The `me` endpoint** uses `getSession`/`getSessionUser` directly, not
  `requireAuth` — this is intentional, not a regression.

## Quick Commands

```bash
git status
git branch --show-current
git log --oneline -10
npm run typecheck
```


