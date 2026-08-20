# AI Handoff — WID Media Agency Platform

**Last updated:** Phase 3 submitted  
**Repository:** https://github.com/whoisdesirtech/widmediaagency  
**Branch:** main  
**Database:** 25 Prisma models (PostgreSQL via Supabase)

---

## Project State

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | **COMPLETE** | Individualized contractor training architecture |
| Phase 2 | **COMPLETE** | Individualized GitHub training repositories |
| Phase 3 | **SUBMITTED** | Individualized Slack training integration |
| Phase 4 | FUTURE | Advanced automation, verification, analytics |

**Do NOT redesign or repeat Phases 1-3. Do NOT start Phase 4.**

---

## Quick Start for Phase 3 Developer

```bash
git clone https://github.com/whoisdesirtech/widmediaagency.git
cd widmediaagency
cp .env.example .env  # populate with actual values
npm install
npm run db:push
npm run dev
```

Before writing code, read `AGENTS.md` and this document. The repository is the source of truth.

---

## Phase 1 Foundation (COMPLETE)

### Training Models

```
TrainingLesson          (canonical lesson definitions)
    ↓
TrainingAssignment      (individualized per-contractor assignments)
    ↓
TrainingStepProgress    (per-step completion tracking)
```

### Current Schema

**TrainingLesson** (`prisma/schema.prisma:302`)
- `id`, `slug` (unique), `title`, `description`, `version`, `targetRole`, `steps` (JSON), `isActive`, `requiresGithub`
- `assignments` → TrainingAssignment[]

**TrainingAssignment** (`prisma/schema.prisma:318`)
- `id`, `lessonId`, `contractorId`, `status`, `assignedAt`, `startedAt`, `completedAt`
- `steps` → TrainingStepProgress[]
- `githubRepository` → GitHubRepository? (Phase 2)
- `@@unique([lessonId, contractorId])`

**TrainingStepProgress** (`prisma/schema.prisma:337`)
- `id`, `assignmentId`, `stepId`, `status` (not_started | in_progress | completed), `completedAt`, `evidence`
- `@@unique([assignmentId, stepId])`

### Canonical Lessons (seeded via `prisma/seed-training.ts`)

| Slug | Role | Steps | requiresGithub |
|------|------|-------|----------------|
| `contractor-onboarding` | contractor | 7 | false |
| `developer-full` | developer | 16 | true |
| `developer-intern` | intern | 12 | true |
| `slack-fundamentals` | contractor | 7 | true |

### Slack Fundamentals Current Steps (placeholder)

```json
[
  { "id": "join-workspace", "order": 1, "title": "Join the Slack Workspace" },
  { "id": "profile", "order": 2, "title": "Complete Your Profile" },
  { "id": "channels", "order": 3, "title": "Understand Channels" },
  { "id": "post-message", "order": 4, "title": "Post Your First Message" },
  { "id": "threads", "order": 5, "title": "Reply to a Thread" },
  { "id": "communication", "order": 6, "title": "Slack Communication Best Practices" },
  { "id": "verification", "order": 7, "title": "Verify Your Account" }
]
```

These are placeholder steps. Phase 3 should convert them into an actual training curriculum with optional Slack verification.

### Phase 1 API Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /api/training/progress` | `requireContractor()` | List contractor's assignments with progress + GitHub status |
| `POST /api/training/progress` | `requireContractor()` | Complete a training step (idempotent) |
| `POST /api/admin/training/assign` | `requireAdminOrStaff()` | Assign a lesson to a contractor |
| `GET /api/admin/training/progress` | `requireAdminOrStaff()` | View all contractor progress (filterable) |
| `GET /api/training-lessons` | `requireAdminOrStaff()` | List active lessons |

### Phase 1 Auto-Assignment

`POST /api/contractors/[id]/login/route.ts` auto-assigns `contractor-onboarding` when a new contractor login is created. Only `contractor-onboarding` is auto-assigned; other lessons require explicit admin assignment.

---

## Phase 2 Implementation (SUBMITTED)

### GitHub Architecture

- **Approach:** GitHub Template Repository + Octokit PAT
- **Package:** `@octokit/rest` (installed)
- **Service:** `src/lib/github.ts`
- **Endpoint:** `POST /api/training/github` + `GET /api/training/github`

### GitHubRepository Model (`prisma/schema.prisma:351`)

```prisma
model GitHubRepository {
  id                   String             @id @default(uuid())
  assignmentId         String
  assignment           TrainingAssignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  repoName             String
  repoUrl              String
  owner                String
  githubRepositoryId   Int
  defaultBranch        String             @default("main")
  status               String             @default("pending") // pending | creating | created | active | error | archived
  errorMessage         String?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  @@unique([assignmentId])
}
```

### GitHub Service (`src/lib/github.ts`)

- `createTrainingRepo(repoName, lessonTitle)` — creates from template or empty repo
- `generateRepoName(lessonSlug)` — `wid-{slug}-{short_id}` naming
- `getRepoStatus(owner, repoName)` — checks if repo exists
- Fallback: if template repo not found, creates empty private repo with `auto_init: true`

### GitHub API Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/training/github` | `requireContractor()` | Create GitHub repo for assignment (idempotent) |
| `GET /api/training/github?assignmentId=` | `requireContractor()` | Check repo status |

### Required Environment Variables (Phase 2)

- `GITHUB_TOKEN` — PAT with `repo` scope
- `GITHUB_ORG` — default: `whoisdesirtech`
- `GITHUB_TEMPLATE_OWNER` — default: `GITHUB_ORG`
- `GITHUB_TEMPLATE_REPO` — default: `training-template`

### Key Phase 2 Patterns (reuse for Phase 3)

- Idempotency: check for existing record before creating
- Race condition guard: double-check after initial check
- Error retry: delete error records, allow re-creation
- Audit events: `github.repository_creation_started`, `github.repository_created`, `github.repository_creation_failed`
- Ownership: `assignment.contractorId === user.contractorId` verified server-side

---

## Existing Infrastructure (reuse for Phase 3)

### Authentication (`src/lib/auth.ts`)

```ts
const user = await requireContractor();     // contractor only
const user = await requireAdminOrStaff();   // admin | staff
const user = await requireAdmin();          // admin only
if (isNextResponse(user)) return user;      // always check
```

Session user carries: `id`, `email`, `name`, `role`, `agencyId`, `contractorId`, `clientId`.

### Notifications (`src/lib/notifications.ts`)

```ts
await createNotification({ userId, type, title, message, link });
await createNotificationForUsers(userIds, type, title, message, link);
await getUnreadCount(userId);
```

### Audit Log (`src/lib/audit.ts`)

```ts
await logAudit(user, { action, method, path, entity, entityId, metadata });
```

Never log: tokens, secrets, OAuth credentials. Never block on audit failure.

### NotificationBell Component

`src/components/NotificationBell.tsx` — 30s polling, already in `ContractorSidebar`.

---

## Existing Slack Support: IMPLEMENTED (Phase 3)

**Slack integration is now built.** Bot token + email matching approach.

### Architecture Decision

- **Approach:** Bot Token + Email Matching (not OAuth)
- **Service:** `src/lib/slack.ts` — `lookupSlackUser()`, `isSlackConfigured()`, `getWorkspaceUrl()`
- **Verification:** If `SLACK_BOT_TOKEN` is set, auto-verifies via `users.lookupByEmail`; otherwise creates pending connection for admin manual verification
- **No OAuth redirect needed** — simpler UX, no webhook infrastructure

### SlackConnection Model (`prisma/schema.prisma:370`)

```prisma
model SlackConnection {
  id               String             @id @default(uuid())
  assignmentId     String
  assignment       TrainingAssignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  slackUserId      String?
  slackEmail       String
  slackRealName    String?
  slackDisplayName String?
  workspaceId      String?
  workspaceName    String?
  status           String             @default("pending") // pending | connected | verified | error
  verifiedAt       DateTime?
  verifiedBy       String?            // manual | auto
  errorMessage     String?
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  @@unique([assignmentId])
}
```

### Slack Service (`src/lib/slack.ts`)

- `lookupSlackUser(email)` — calls Slack `users.lookupByEmail` API
- `isSlackConfigured()` — checks if `SLACK_BOT_TOKEN` is set
- `getWorkspaceUrl()` — returns `SLACK_WORKSPACE_URL`

### Slack API Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /api/training/slack?assignmentId=` | `requireContractor()` | Get Slack connection status |
| `POST /api/training/slack` | `requireContractor()` | Connect Slack identity (auto-verify or pending) |
| `POST /api/admin/training/slack/verify` | `requireAdminOrStaff()` | Admin manual verify/reject |

### Required Environment Variables (Phase 3)

- `SLACK_BOT_TOKEN` — workspace bot with `users:read` scope (optional; without it, falls back to manual admin verification)
- `SLACK_WORKSPACE_URL` — workspace invite link for training content

---

## Phase 3 Implementation (SUBMITTED)

### Implemented Flow

```
Contractor opens Slack Fundamentals assignment
    ↓
Clicks "Connect Slack"
    ↓
System verifies email via Slack API (if bot token configured)
    ↓
If auto-verified → status: "verified"
If no bot token → status: "connected" → awaits admin verification
    ↓
Admin can verify/reject via POST /api/admin/training/slack/verify
    ↓
Progress tracked via TrainingStepProgress (same as other lessons)
```

### Contractor UI Changes

- Slack status badge in assignment header (next to GitHub badge)
- Slack Connection section in expanded assignment view
- "Connect Slack" button (purple, Slack-branded)
- Status display: Not Connected → Pending Verification → Verified ✓
- Error states with retry capability

### Admin UI Changes

- Slack column in contractor progress table
- Shows: Not Connected / Pending / Verified with name
- Manual verify/reject via API

### Audit Events

```
slack.connection_started — contractor initiated connection
slack.connection_verified — auto-verified via Slack API
slack.connection_failed — Slack API lookup failed
slack.verification_completed — admin manually verified
slack.verification_failed — admin rejected
```

### Key Patterns (consistent with Phase 2)

- Idempotency: existing connection returned on repeated clicks
- Error retry: delete error records, allow re-creation
- Ownership: `assignment.contractorId === user.contractorId` verified server-side
- Audit logging on all state changes

---

## Phase 4 (FUTURE — do not implement)

Phase 4 may include:
- Advanced Slack activity verification (channel membership, message counts)
- Automated training completion based on Slack evidence
- Contractor scoring and analytics
- AI-graded training assessments
- Broader integration automation

Do not implement Phase 4 unless explicitly approved.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | All 25 models including training + GitHub + Slack |
| `prisma/seed-training.ts` | Canonical lesson definitions |
| `src/lib/auth.ts` | Session helpers, `requireContractor()`, `requireAdminOrStaff()` |
| `src/lib/audit.ts` | `logAudit()` — best-effort audit logging |
| `src/lib/notifications.ts` | `createNotification()` — notification creation |
| `src/lib/github.ts` | GitHub service (Octokit PAT, template repos) |
| `src/lib/slack.ts` | Slack service (Bot Token, email lookup) |
| `src/app/api/training/progress/route.ts` | Contractor training progress GET + step completion POST |
| `src/app/api/training/github/route.ts` | GitHub repo creation + status check |
| `src/app/api/training/slack/route.ts` | Slack connection GET + POST |
| `src/app/api/admin/training/assign/route.ts` | Admin lesson assignment |
| `src/app/api/admin/training/progress/route.ts` | Admin progress view |
| `src/app/api/admin/training/slack/verify/route.ts` | Admin Slack verify/reject |
| `src/app/contractor/training/page.tsx` | Contractor training UI |
| `src/app/admin/developer-training/page.tsx` | Admin training UI with progress tab |
| `src/components/ContractorSidebar.tsx` | Contractor sidebar with NotificationBell |
| `src/components/NotificationBell.tsx` | Notification bell component (30s polling) |
| `AGENTS.md` | Project conventions and architecture |
| `CHANGELOG.md` | Version history |
