# whoisdesir-media — WhoIsDésir® Media Agency Platform

Next.js (App Router) agency-management platform: contractor onboarding, SOWs, contract assembly/signing, clients, deliverables, invoices, and Google Drive storage.

**Current version: 1.2.0** | **Latest tag: v1.0.0** | **Branch: main**

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit` (use this to verify changes)
- `npm run db:push` — apply schema changes to DB (no migration files used)
- `npm run db:seed` — `tsx prisma/seed.ts`
- `npm run db:studio` — Prisma Studio
- `npm run db:backfill-roles` — migrate single-role contractors to multi-role system
- ESLint is NOT configured (`next lint` opens an interactive setup prompt — do not run it).

## Stack

- Next.js 14 App Router, TypeScript (strict-ish; `any` used in places), Tailwind CSS
- Prisma + PostgreSQL (see `prisma/schema.prisma`, 26 models). Connection via `DATABASE_URL`/`DIRECT_URL` env vars
- NextAuth credentials strategy (`src/app/api/auth/[...nextauth]/route.ts`, options in `src/lib/auth.ts`)
- Google Drive via service account (`src/lib/driveService.ts`), uploads to Drive, not local disk
- GitHub via Octokit PAT (`src/lib/github.ts`), creates training repos from template or empty repos

## Project structure

- `src/app/api/` — all route handlers (37 files); auth pattern is uniform (see below)
- `src/app/<role>/` — portals: `admin`+`dashboard` (admin/staff), `contractor/`, `client/`
- `src/app/<role>s/[id]/` — admin-facing detail pages for a client/contractor
- `src/lib/` — `auth.ts` (session helpers), `audit.ts` (audit logging), `storage.ts` (storage limits), `rateLimit.ts`, `prisma.ts`, `drive.ts`, `driveService.ts`, `proposal-generator.ts`, `role-training-config.ts` (role→lesson mapping)
- `src/components/` — shared UI (Sidebar, ContractorSidebar, ClientSidebar, SignaturePad, StatusBadge, DraftBanner, CsrfProvider)
- `src/middleware.ts` — CSRF double-submit protection (see below)
- `docs/` — project documentation (architecture, version control, release checklist, session handoff, known issues)

## Auth & security conventions (IMPORTANT)

Every API route handler MUST start with a guard. Helpers in `src/lib/auth.ts`:

```ts
const user = await requireAdminOrStaff();   // admin | staff
const user = await requireAdmin();           // admin only
const user = await requireAuth(['admin', 'staff', 'contractor']); // any list
if (isNextResponse(user)) return user;       // always check after a guard
```

Roles: `admin`, `staff`, `contractor`, `client` (column on `User`). The Developer Portal suite (see docs) adds extended staff-side roles: `manager`, `reviewer`, `developer`, `intern` — helpers in `src/lib/auth.ts` (`requireManagerOrAbove`, `canApprove`, etc.). Session user carries `agencyId`, `contractorId`, `clientId` — use these for ownership checks (e.g. contractor may only see/sign their own contracts).

- Shared GET routes are role-scoped: clients/contractors must be forced to their own records (`where.clientId = user.clientId`), never trust query params from them.
- Public by design: `api/booking`, `api/plugin-lead`, `api/auth/reset-password`. All are rate-limited via `src/lib/rateLimit.ts` and reset-password must NEVER return the new password or confirm account existence.
- Uploads are whitelisted: `api/contractors/[id]/upload` allows only fields `taxFormUrl | insuranceProofUrl | licensingProofUrl` and extensions `pdf|jpg|jpeg|png` (10MB). `api/projects/[id]/images` allows `jpg|jpeg|png|webp|gif` (15MB). Do not relax these without adding equivalent checks.
- Contract signing (`api/signatures`): both roles require login; contractor must match the contract's `contractorId`.
- CSRF: `src/middleware.ts` enforces a double-submit cookie (`XSRF-TOKEN` cookie + `X-XSRF-Token` header) on every mutating `/api/*` request, except `/api/auth/*`, `/api/booking`, `/api/plugin-lead`. `CsrfProvider` (in root layout) patches `window.fetch` to attach the header. New client-side fetches need no changes.
- Audit log: use `logAudit(user, { action, method, path, entity, entityId, metadata })` from `src/lib/audit.ts` in every handler that mutates important state (contracts, signatures, settings, agreements, addenda, clients, contractors, SOWs, credential generation). Auth events (signIn/signOut) are logged in `auth.ts`. Never block the request on audit failures.
- Storage limits: contractor uploads are capped per-contractor (`STORAGE_LIMIT_MB`, default 500) by summing `public/uploads/<contractorId>/`. Apply `storageLimitBytes()` + `dirBytes()` to new upload routes.
- Keep every new route handler guarded — this repo is being hardened and regressions are the main risk.

## Multi-role contractor system

Contractors can have multiple approved roles (e.g., developer + photographer). Roles are managed via the `ContractorRole` model (status: pending/approved/rejected). The sidebar dynamically builds navigation from all approved roles. Admin approves role requests on the contractor detail page.

## SOW ↔ Deliverables workflow

Deliverables link to SOWs via `sowId`. The flow: Admin creates SOW → creates Deliverable records (linked via sowId) → Contractor sees SOW + deliverables in "My SOWs" → Contractor updates status (Start → In Progress → Submit) → Admin approves → Client sees approved deliverables.

## Individualized Training System

Training lessons are defined in `TrainingLesson` (slug, steps JSON, requiresGithub flag). Admins assign lessons via `POST /api/admin/training/assign`. Contractors progress through steps via `POST /api/training/progress`. Progress is calculated as `completed steps / total steps * 100`.

### GitHub Training Repositories

Lessons with `requiresGithub: true` can have individual GitHub repositories. Architecture: **GitHub Template Repository + Octokit PAT**.

- **Service**: `src/lib/github.ts` — `createTrainingRepo()`, `generateRepoName()`, `getRepoStatus()`
- **Endpoint**: `POST /api/training/github` (contractor-authenticated, ownership-verified)
- **Model**: `GitHubRepository` — linked to `TrainingAssignment` via `@@unique([assignmentId])`
- **Naming**: `wid-{lesson_slug}-{short_id}` — no personal info exposed
- **Idempotency**: Existing repo returned on repeated clicks; error repos allow retry
- **Auth**: `GITHUB_TOKEN` env var (PAT with `repo` scope), server-side only
- **Template**: `GITHUB_TEMPLATE_OWNER`/`GITHUB_TEMPLATE_REPO` env vars; falls back to empty repo if template not found

Required env vars: `GITHUB_TOKEN`, `GITHUB_ORG` (default: `whoisdesirtech`), `GITHUB_TEMPLATE_OWNER`, `GITHUB_TEMPLATE_REPO`

### Slack Training Integration

Lessons with `requiresSlack: true` can have individual Slack connections. Architecture: **Bot Token + Email Matching**.

- **Service**: `src/lib/slack.ts` — `lookupSlackUser()`, `isSlackConfigured()`, `getWorkspaceUrl()`
- **Endpoint**: `POST /api/training/slack` (contractor-authenticated, ownership-verified)
- **Model**: `SlackConnection` — linked to `TrainingAssignment` via `@@unique([assignmentId])`
- **Verification**: If `SLACK_BOT_TOKEN` is set, auto-verifies via `users.lookupByEmail`; otherwise creates pending connection for admin manual verification
- **Admin verification**: `POST /api/admin/training/slack/verify` — admin can verify or reject
- **Idempotency**: Existing connection returned on repeated clicks; error connections allow retry

Required env vars (optional): `SLACK_BOT_TOKEN` (workspace bot with `users:read` scope), `SLACK_WORKSPACE_URL` (invite link)

### Canonical Lessons

- `contractor-onboarding` (7 steps, no GitHub, no Slack)
- `developer-full` (16 steps, GitHub required)
- `developer-intern` (12 steps, GitHub required)
- `slack-fundamentals` (7 steps, Slack required)
- `secret-key-rotation` (8 steps, no GitHub, no Slack)
- `google-calendar-setup` (10 steps, GitHub required) — wires the messaging Google Calendar integration

## Phase 4A: Task & Review Foundation

### Two task systems (do not conflate)

- `ProjectTask` — contractor-facing work items inside the SOW/deliverable pipeline (Phase 4A/4C below). API: `/api/projects/[id]/tasks`, `/api/contractor/tasks`.
- `PortalTask` — internal team work items for the Developer Portal suite: assigned to platform `User`s, optional portfolio link, review workflow (`reviewStatus`, `reviewerId`). API: `/api/tasks` (ported from PR #2; model renamed from `Task` to avoid the collision).

### New Models

- `ProjectTask` — granular work items within projects. Fields: projectId (FK→Project), contractorId (FK?→Contractor), title, description, status (pending/in_progress/in_review/completed/blocked), priority (low/medium/high/urgent), dueDate, completedAt, sortOrder. Has-many TaskReview.
- `TaskReview` — review history for tasks. Fields: taskId (FK→ProjectTask), reviewerId (FK→User), status (pending/approved/changes_requested/rejected), feedback, timestamps. Multiple reviews per task allowed (review rounds).

### Extended Deliverable

Added fields: `taskId` (FK?→ProjectTask, plain string), `submittedUrl`, `submittedAt`, `attachments` (JSON array), `feedback`, `reviewedBy`, `reviewedAt`. Status now includes `draft`.

### Configuration

- `src/lib/role-training-config.ts` — maps 12 roles to lessons, integrations, and deliverable types
- Use `getRoleConfig()`, `getRequiredIntegrations()`, `getRoleLessons()` helpers
- Use `computeReadiness()` for contractor readiness computation

### Auto-Assignment on Role Approval

When a `ContractorRole` is approved (PATCH `/api/contractors/[id]/roles/[roleId]`), the handler auto-assigns all lessons from `role-training-config.ts` for that role. Uses `@@unique([lessonId, contractorId])` for idempotency.

### Workforce Dashboard

- **API**: `GET /api/admin/workforce` — all contractors with readiness, training, integrations, projects, tasks
- **UI**: `/admin/workforce` — admin-only page with stats cards + filterable contractor table
- **Sidebar**: "Workforce Dashboard" link under admin-only items

### Task Management (Phase 4C)

- **Admin API**: `POST/GET /api/projects/[id]/tasks` — create and list tasks for a project
- **Admin API**: `GET/PATCH/DELETE /api/projects/[id]/tasks/[taskId]` — manage individual tasks
- **Contractor API**: `GET /api/contractor/tasks` — list tasks assigned to contractor
- **Contractor API**: `PATCH /api/contractor/tasks/[taskId]` — update task status (in_progress, in_review, blocked)
- **Admin UI**: `/admin/tasks` — create/assign/manage tasks across all projects
- **Contractor UI**: `/contractor/tasks` — view and update assigned tasks
- **Auto-progress**: When all tasks in a project are completed, project progress updates to 100% and status to "complete"
- **Sidebar**: "Tasks" link in admin sidebar, "My Tasks" link in contractor sidebar

### Deliverable Extensions (Phase 4D)

- **Extended PATCH** (`/api/deliverables/[id]`): contractors can now submit with `submittedUrl`, `attachments` (JSON array of Google Drive URLs), `submittedAt`; admins can set `feedback`, `reviewedBy`, `reviewedAt`
- **New statuses**: `draft` (contractor can set), `rejected` (admin can set)
- **Review workflow**: admin review modal with feedback field — approve, request changes, or reject
- **File upload**: contractors use existing `/api/drive/upload` endpoint, then pass URLs as `attachments` in PATCH body
- **Admin UI**: review modal with feedback textarea, attachments display, submitted URL link, feedback display
- **Contractor UI**: submit modal with URL input + file upload, attachments/feedback display on cards

### Review Automation (Phase 4E)

- **Auto-task advance**: contractor submits deliverable → linked task auto-advances to `in_review`; admin approves → linked task auto-completes; client/admin requests changes → linked task reverts to `in_progress`
- **Auto-project progress**: when a linked task completes, project `progress` recalculates; if 100%, project status auto-sets to `complete`
- **TaskReview records**: every admin review (approve/changes-requested/rejected) on a deliverable with a `taskId` creates a `TaskReview` record for audit trail
- **Notifications**: project completion notification to admin when all tasks done

## Gotchas

- `tsc --noEmit` also type-checks stale generated files under `.next/types/`. If you see errors referencing removed routes (e.g. `api/auth/login`), delete the stale entry (`.next` is gitignored and regenerated).
- `me` endpoint uses `getSession`/`getSessionUser` directly, not `requireAuth`.
- File sizes are capped because route handlers read whole files into memory.

## Before coding

- Read this file (`AGENTS.md`)
- Read `docs/ARCHITECTURE.md` for project structure
- Read `docs/KNOWN_ISSUES.md` for existing problems
- Check `git status` and understand current branch
- Understand the current version (1.2.0)

## During coding

- Make focused changes — avoid unrelated refactors
- Preserve existing functionality
- Never expose secrets, keys, or credentials
- Never modify production configuration without authorization
- Follow existing auth patterns (guard every route handler)
- Use existing components from `src/components/` before creating new ones

## After coding

- Run `npm run typecheck` — must pass
- Run `npm run build` — must pass
- Update documentation if behavior changed
- Update CHANGELOG.md when appropriate (with authorization)
- Report files changed and any unresolved issues

## Version control

AI agents must NOT:
- Bump versions without explicit authorization
- Create Git tags without explicit authorization
- Force-push to any branch
- Delete branches
- Rewrite Git history
- Deploy to production without authorization
