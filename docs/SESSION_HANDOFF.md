# Session Handoff — WhoIsDésir Media Agency Platform

> Read `AGENTS.md` first for commands, stack details, auth conventions, and
> contribution workflow. This file captures where the project stands so a future
> session can resume quickly.

## Project

- **Name:** WhoIsDésir Media Agency Platform ("Creative Business Operations Platform")
- **Repo root (this machine):** `C:\Users\sebas\widmediaagency`
- **Upstream remote:** `origin` → `whoisdesirtech/widmediaagency` (no write access from `sebasa2510`)
- **Fork remote:** `fork` → `sebasa2510/widmediaagency` (pushes go here; PRs target upstream)
- **Live site:** Vercel (Next.js) — `widmediaagency.vercel.app`
- **Database:** Supabase PostgreSQL (`db.utxrhhmiqbpvqqjqhzhq.supabase.co`) via Prisma, `db:push` workflow (no migrations directory)
- **Version:** `1.2.0` (see `CHANGELOG.md`)

## Current State (as of 2026-08-21)

- **Branch:** `fix/contractor-login-error-logging` (local + pushed to fork)
- **Open PR:** [#3 — "fix: improve contractor login generation error handling"](https://github.com/whoisdesirtech/widmediaagency/pull/3) — single-file change to `src/app/api/contractors/[id]/login/route.ts`, QA'd, awaiting review/merge. Do not stack new work on this branch.
- **Working tree:** clean except this handoff doc (uncommitted intentionally).
- **main:** at `954ad8c`, up to date with `origin/main`. Nothing pushed directly to main.
- **Database:** schema fully in sync with `prisma/schema.prisma`. Training lessons seeded. No further DB work pending.

## What This Session Did

1. **Diagnosed the contractor-login 500** (`POST /api/contractors/[id]/login`). Root cause was NOT code: the Supabase DB was out of sync with the Prisma schema (missing `Contractor.googleDriveFolderId/Url` columns and ~9 tables incl. all training/notification models). Every Contractor query threw before reaching business logic; the bare `catch` hid the error.
2. **Why the drift existed:** a diverged branch (`fix/security-hardening-round2`, commit `3e0d5be` — brand kits, influencer audits, portfolio items) had its schema pushed to Supabase previously; current main's schema never was. DB was a hybrid of two app versions.
3. **DB remediation:** exported 10 rows from 6 orphaned tables (BrandKit, BrandKitSection, Influencer, InfluencerAudit, PortfolioItem, Task) to JSON backups, then `prisma db push --accept-data-loss`. Schema now additive-complete and verified against live queries.
   - Backups live OUTSIDE the repo: `C:\Users\sebas\AppData\Local\Temp\opencode\db-backup-2026-08-21\` — only copy of that data; do not delete casually.
4. **Code fix (PR #3):** `route.ts` catch block now logs `[contractor-login] Failed for contractor {id}` with the full error server-side instead of swallowing it.
5. **Data remediation:** ran idempotent `npx tsx prisma/seed-training.ts` (4 canonical lessons were missing entirely), then assigned `contractor-onboarding` to the real contractor via `POST /api/admin/training/assign` (201, 7 steps, notification, audit).
6. **Full QA pass:** typecheck/lint/build green; end-to-end tests with real sessions — admin login, login generation (create + reset paths), 404 on nonexistent contractor, CSRF enforcement verified independently with curl (403/403/200/403), contractor auth + authorization boundaries (403 on admin-only APIs, own-record scoping works).

## Known Issues / Gotchas (current)

- **Local build OOM:** `npm run build` exhausts Node's default heap on this machine. Use `NODE_OPTIONS=--max-old-space-size=6144 npm run build`. Environment constraint, not code.
- **Aset Visions password is a QA-generated value nobody knows** (each reset rotates it). Issue real credentials via the admin "Reset Password" button when onboarding the contractor.
- **Diverged branch unmerged:** `fix/security-hardening-round2` (+ backup `backup/local-main-diverged-601d827`) contains brand kits / influencer audits / portfolio features that exist nowhere in main's schema. Needs a deliberate reconcile-or-drop decision.
- **Debug console.logs on main:** commits `128e6bc` (error display — keep) and `954ad8c` ("debug:" logging in `admin/contractors/[id]/page.tsx` lines ~182–198 — strip in a follow-up).
- **Stale docs:** `AGENTS.md` claims ESLint is unconfigured (false — `.eslintrc.json` exists, lint runs clean); `KNOWN_ISSUES.md` predates v1.2.0 (monolith already decomposed, ESLint exists).
- **`prisma/seed.ts` is non-idempotent** (plain `create`s — re-run fails on unique emails). `seed-training.ts` IS idempotent.
- **Dev-only warmup race:** seconds after cold `next dev` start, 1–2 requests can be served before middleware compiles (CSRF check missed). Production builds compile middleware upfront. Low severity.
- **No migrations discipline:** project relies on `db:push`; today's outage shows the risk. See roadmap.

## Open / Next Steps — "The Last 20%" (hardening roadmap)

Product features are ~85–90% complete; engineering hardening is the gap (~50%). Priority order:

1. **Merge or close PR #3**, strip debug console.logs from `page.tsx`.
2. **Reconcile the diverged branch** — decide which features (brand kits etc.) are canon; port schema + code deliberately or drop the branch.
3. **Adopt Prisma migrations** (`prisma migrate diff` baseline from current DB) so schema changes are reviewable and repeatable across environments.
4. **Make `seed.ts` idempotent** (upserts) and document seeding as part of env setup.
5. **Real test coverage** — vitest is configured but empty. Start with API-route integration tests for auth guards, CSRF middleware, and the contractor/client login endpoints.
6. **CI pipeline** — typecheck + lint + build (+ tests once they exist) on every PR; this would have caught the schema-drift class of failure.
7. **Type-safety pass** — ~238 `any` annotations remain; prioritize API routes and lib files.
8. **Docs refresh** — AGENTS.md lint note, KNOWN_ISSUES.md, hardcoded values (client dashboard media count `77`, WD-107).
9. **Fix local build memory** (NODE_OPTIONS in scripts or docs) if local builds matter.

## Quick Commands

```bash
git status
git branch --show-current
git log --oneline -10
npm run typecheck
npm run lint
$env:NODE_OPTIONS='--max-old-space-size=6144'; npm run build   # local builds need the heap bump
npx tsx prisma/seed-training.ts                                 # idempotent lesson seed
```
