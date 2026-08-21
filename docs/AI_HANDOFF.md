# AI Handoff — WID Media Agency Platform

**Last updated:** Phase 4A complete  
**Repository:** https://github.com/whoisdesirtech/widmediaagency  
**Branch:** main  
**Database:** 26 Prisma models (PostgreSQL via Supabase)

---

## Project State

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | **COMPLETE** | Individualized contractor training architecture |
| Phase 2 | **COMPLETE** | Individualized GitHub training repositories |
| Phase 3 | **COMPLETE** | Individualized Slack training integration |
| Phase 4A | **COMPLETE** | Task & review foundation (ProjectTask, TaskReview, Deliverable extensions, role config) |
| Phase 4B | **COMPLETE** | Role-based auto-assignment, readiness computation, workforce dashboard |
| Phase 4C | **COMPLETE** | Task management API + UI (admin create/assign, contractor view/update) |
| Phase 4D | **COMPLETE** | Deliverable extensions: submittedUrl, attachments (Google Drive), review feedback, draft/rejected statuses |
| Phase 4E | **COMPLETE** | Review automation: auto-task advance, auto-project progress, TaskReview records, project completion notification |

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

| Slug | Role | Steps | requiresGithub | requiresSlack |
|------|------|-------|----------------|---------------|
| `contractor-onboarding` | contractor | 7 | false | false |
| `developer-full` | developer | 16 | true | false |
| `developer-intern` | intern | 12 | true | false |
| `slack-fundamentals` | contractor | 7 | false | true |

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

## Phase 4A Implementation (COMPLETE)

### New Models

**ProjectTask** (`prisma/schema.prisma:183`)
```prisma
model ProjectTask {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  contractorId  String?
  contractor    Contractor? @relation(fields: [contractorId], references: [id])
  title         String
  description   String    @default("")
  status        String    @default("pending") // pending | in_progress | in_review | completed | blocked
  priority      String    @default("medium") // low | medium | high | urgent
  dueDate       DateTime?
  completedAt   DateTime?
  sortOrder     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  reviews       TaskReview[]
  @@index([projectId])
  @@index([contractorId])
  @@index([status])
}
```

**TaskReview** (`prisma/schema.prisma:205`)
```prisma
model TaskReview {
  id          String    @id @default(uuid())
  taskId      String
  task        ProjectTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  reviewerId  String
  reviewer    User      @relation(fields: [reviewerId], references: [id])
  status      String    @default("pending") // pending | approved | changes_requested | rejected
  feedback    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  @@index([taskId])
  @@index([reviewerId])
}
```

### Extended Deliverable

Added fields:
- `taskId` (String?) — FK to ProjectTask
- `submittedUrl` (String?) — URL to submitted file
- `submittedAt` (DateTime?) — when submitted
- `attachments` (String, default "[]") — JSON array of {url, name, type, uploadedAt}
- `feedback` (String?) — review feedback
- `reviewedBy` (String?) — reviewer userId
- `reviewedAt` (DateTime?) — when reviewed

Status now includes `draft`: `draft | pending | in-progress | pending-approval | approved | changes-requested`

### Role Training Config

`src/lib/role-training-config.ts` — maps 12 roles to:
- `lessons`: lesson slugs to auto-assign
- `integrations`: ['github', 'slack'] or ['slack']
- `deliverableTypes`: ['code', 'document', 'design', etc.]

Helpers: `getRoleConfig()`, `getRequiredIntegrations()`, `getRoleLessons()`

### Database Changes

- `prisma db push` — additive only, no data loss
- All new fields nullable or with defaults
- Existing projects, deliverables, training assignments preserved

---

## Phase 4B Implementation (COMPLETE)

### Auto-Assignment on Role Approval

When a `ContractorRole` is approved via PATCH `/api/contractors/[id]/roles/[roleId]`, the handler now calls `autoAssignLessons()` which:
1. Looks up the role in `role-training-config.ts`
2. Finds all active lessons matching the role's lesson slugs
3. Creates `TrainingAssignment` records (idempotent via `@@unique`)

### Readiness Computation

`computeReadiness()` in `src/lib/role-training-config.ts` returns:
- `trained`: boolean (all lessons complete + all integrations verified)
- `trainingProgress`: 0-100%
- `integrationsVerified`: { github, slack }
- `currentProject`: string | null
- `activeTasks`: number
- `status`: 'ready' | 'in_training' | 'not_started'

### Workforce Dashboard

**API**: `GET /api/admin/workforce` (admin/staff only)
- Returns all contractors with computed readiness data
- Includes: roles, training progress, step counts, integration status, project assignments, active task counts
- Stats: total/ready/inTraining/notStarted

**UI**: `/admin/workforce`
- Stats cards at top (4-card grid)
- Filter tabs: All, Ready, In Training, Not Started
- Table columns: Contractor, Role, Training (progress bar), Integrations (GH/SL), Project, Tasks, Status

**Sidebar**: "Workforce Dashboard" link added to ADMIN_ONLY_ITEMS

### New Files
- `src/app/api/admin/workforce/route.ts` — workforce data API
- `src/app/admin/workforce/page.tsx` — workforce dashboard UI

### Modified Files
- `src/app/api/contractors/[id]/roles/[roleId]/route.ts` — added auto-assign hook
- `src/lib/role-training-config.ts` — added `computeReadiness()` and `ContractorReadiness` type
- `src/components/Sidebar.tsx` — added workforce link

---

## Phase 4C Implementation (COMPLETE)

### Task Management API

**Admin endpoints** (requireAdminOrStaff):
- `POST /api/projects/[id]/tasks` — create task (title, description, contractorId, priority, dueDate)
- `GET /api/projects/[id]/tasks` — list tasks for project
- `GET/PATCH/DELETE /api/projects/[id]/tasks/[taskId]` — manage individual tasks

**Contractor endpoints** (requireContractor):
- `GET /api/contractor/tasks` — list tasks assigned to contractor (with project info)
- `PATCH /api/contractor/tasks/[taskId]` — update status (in_progress, in_review, blocked only)

### Task Status Workflow

```
pending → in_progress → in_review → completed
                         ↓
                      blocked → in_progress (revise)
```

Admins can set any status. Contractors can only set: in_progress, in_review, blocked.

### Auto-Project Progress

When a task is marked `completed`, the project's `progress` field is recalculated as `completedTasks / totalTasks * 100`. If progress reaches 100%, project status auto-sets to `complete`.

### Notifications

- Task assignment sends notification to contractor: "New Task Assigned"

### New Files
- `src/app/api/projects/[id]/tasks/route.ts` — task CRUD (list + create)
- `src/app/api/projects/[id]/tasks/[taskId]/route.ts` — task detail/update/delete
- `src/app/api/contractor/tasks/route.ts` — contractor task list
- `src/app/api/contractor/tasks/[taskId]/route.ts` — contractor task status update
- `src/app/admin/tasks/page.tsx` — admin task management UI
- `src/app/contractor/tasks/page.tsx` — contractor tasks UI

### Modified Files
- `src/components/Sidebar.tsx` — added "Tasks" link
- `src/components/ContractorSidebar.tsx` — added "My Tasks" link

---

## Phase 4D Implementation (COMPLETE)

### Deliverable Extended PATCH

**New fields** (admin can set):
- `submittedUrl` — link to external work (Figma, Google Docs, etc.)
- `submittedAt` — timestamp of submission
- `attachments` — JSON array of Google Drive URLs
- `feedback` — admin review feedback text
- `reviewedBy` — user ID of reviewer (auto-set on approve/reject)
- `reviewedAt` — timestamp of review (auto-set on approve/reject)

**New statuses**:
- `draft` — contractor can set (work in progress, not yet started)
- `rejected` — admin can set (deliverable rejected entirely)

### Contractor Submit Workflow

1. Contractor clicks "Submit" or "Revise" → opens submit modal
2. Contractor can paste a URL (Figma, Google Docs, Canva, etc.)
3. Contractor can upload files via existing `/api/drive/upload` → files go to Google Drive
4. On submit: PATCH deliverable with `status: pending-approval`, `submittedUrl`, `attachments`, `submittedAt`
5. Notifications sent to client + admins

### Admin Review Workflow

1. Admin sees deliverable with status `pending-approval`
2. Admin clicks Approve, Request Changes, or Reject → opens review modal
3. Admin can optionally add feedback text
4. On action: PATCH deliverable with new status, `feedback`, `reviewedBy`, `reviewedAt`
5. Notifications sent to contractor

### Files Modified
- `src/app/api/deliverables/[id]/route.ts` — extended PATCH handler for all new fields
- `src/app/api/deliverables/route.ts` — POST now accepts `taskId`
- `src/app/admin/deliverables/page.tsx` — review modal, attachments display, feedback display, draft/rejected statuses
- `src/app/contractor/deliverables/page.tsx` — submit modal with URL + file upload, attachments/feedback display

---

## Phase 4E Implementation (COMPLETE)

### Auto-Task Advance

When a deliverable is linked to a task via `taskId`, status changes auto-advance the task:

| Deliverable Action | Task Status Change |
|---|---|
| Contractor submits (`pending-approval`) | `in_progress` → `in_review` |
| Admin approves | any → `completed` |
| Client/admin requests changes | `in_review` → `in_progress` |

### Auto-Project Progress

When a linked task completes:
1. Count total tasks and completed tasks for the project
2. Recalculate `progress = Math.round((completed / total) * 100)`
3. If progress reaches 100%, set project status to `complete`
4. Send project completion notification to admin

### TaskReview Records

Every admin review action on a deliverable with a `taskId` creates a `TaskReview` record:
- `taskId` — the linked task
- `reviewerId` — the reviewing user
- `status` — `approved`, `changes_requested`, or `rejected`
- `feedback` — optional feedback text
- `createdAt` — timestamp

### Files Modified
- `src/app/api/deliverables/[id]/route.ts` — added auto-task advance, auto-project progress, TaskReview creation

---

## Phase 4 Complete

All Phase 4A-4E are now **COMPLETE**. Summary:

| Phase | Status | Features |
|-------|--------|----------|
| 4A | ✅ | ProjectTask + TaskReview models, Deliverable extensions, role-training-config.ts |
| 4B | ✅ | Auto-assignment on role approval, readiness computation, workforce dashboard |
| 4C | ✅ | Task CRUD API + UI (admin create/assign, contractor view/update) |
| 4D | ✅ | Deliverable extensions: submittedUrl, attachments, review feedback, draft/rejected |
| 4E | ✅ | Review automation: auto-task advance, auto-project progress, TaskReview records |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | All 26 models including training + GitHub + Slack + ProjectTask + TaskReview |
| `prisma/seed-training.ts` | Canonical lesson definitions |
| `src/lib/auth.ts` | Session helpers, `requireContractor()`, `requireAdminOrStaff()` |
| `src/lib/audit.ts` | `logAudit()` — best-effort audit logging |
| `src/lib/notifications.ts` | `createNotification()` — notification creation |
| `src/lib/github.ts` | GitHub service (Octokit PAT, template repos) |
| `src/lib/slack.ts` | Slack service (Bot Token, email lookup) |
| `src/lib/role-training-config.ts` | Role → lesson mapping (12 roles) |
| `src/app/api/training/progress/route.ts` | Contractor training progress GET + step completion POST |
| `src/app/api/training/github/route.ts` | GitHub repo creation + status check |
| `src/app/api/training/slack/route.ts` | Slack connection GET + POST |
| `src/app/api/admin/training/assign/route.ts` | Admin lesson assignment |
| `src/app/api/admin/training/progress/route.ts` | Admin progress view |
| `src/app/api/admin/training/slack/verify/route.ts` | Admin Slack verify/reject |
| `src/app/api/admin/workforce/route.ts` | Workforce dashboard data API |
| `src/app/api/projects/[id]/tasks/route.ts` | Task list + create |
| `src/app/api/projects/[id]/tasks/[taskId]/route.ts` | Task detail/update/delete |
| `src/app/api/contractor/tasks/route.ts` | Contractor task list |
| `src/app/api/contractor/tasks/[taskId]/route.ts` | Contractor task status update |
| `src/app/contractor/training/page.tsx` | Contractor training UI |
| `src/app/admin/developer-training/page.tsx` | Admin training UI with progress tab |
| `src/app/admin/workforce/page.tsx` | Workforce dashboard UI |
| `src/app/admin/tasks/page.tsx` | Admin task management UI |
| `src/app/contractor/tasks/page.tsx` | Contractor tasks UI |
| `src/components/ContractorSidebar.tsx` | Contractor sidebar with NotificationBell |
| `src/components/NotificationBell.tsx` | Notification bell component (30s polling) |
| `AGENTS.md` | Project conventions and architecture |
| `CHANGELOG.md` | Version history |
