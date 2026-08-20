# AI Handoff — WID Media Agency Platform

**Last updated:** Phase 2 submitted  
**Repository:** https://github.com/whoisdesirtech/widmediaagency  
**Branch:** main  
**Database:** 23 Prisma models (PostgreSQL via Supabase)

---

## Project State

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | **COMPLETE** | Individualized contractor training architecture |
| Phase 2 | **SUBMITTED** | Individualized GitHub training repositories |
| Phase 3 | **NEXT** | Individualized Slack training integration |
| Phase 4 | FUTURE | Advanced automation, verification, analytics |

**Do NOT redesign or repeat Phases 1-2. Do NOT start Phase 4.**

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

## Existing Slack Support: NONE

**Zero Slack integration exists.** No packages, no env vars, no API calls, no SDK.

All "Slack" references are textual: seed data strings (`['Slack', 'Email', 'ClickUp']`), UI labels, and the `slack-fundamentals` training lesson placeholder.

---

## Phase 3 Objective

Build an individualized Slack training system.

### Desired Flow

```
Contractor logs in
    ↓
Sees Slack Fundamentals assignment
    ↓
Opens Slack lesson
    ↓
Learns organization's Slack workflow
    ↓
Connects their Slack identity (or manually verifies)
    ↓
Completes Slack-specific training steps
    ↓
Portal records progress
    ↓
Admin can see Slack training status
```

### Architectural Principle

```
TrainingAssignment
       ├── GitHubRepository   (Phase 2)
       └── SlackConnection    (Phase 3)
```

NOT: `Contractor → SlackConnection`. The Slack connection belongs to the assignment, not the contractor directly. This allows multiple future training lessons to each have their own Slack verification.

---

## Phase 3 Design Decisions (TO BE MADE BY IMPLEMENTER)

The following are **recommendations, not mandates**. The implementer must inspect the repository and make their own decisions.

### Slack Connection Model (recommended)

```prisma
model SlackConnection {
  id             String             @id @default(uuid())
  assignmentId   String
  assignment     TrainingAssignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  slackUserId    String?
  slackEmail     String?
  workspaceId    String?
  workspaceName  String?
  teamId         String?
  status         String             @default("pending") // pending | connected | verified | error
  verifiedAt     DateTime?
  verifiedBy     String?            // how it was verified
  errorMessage   String?
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt
  @@unique([assignmentId])
}
```

**Note:** The implementer should evaluate whether additional fields are needed based on the actual Slack authentication approach chosen.

### Slack Authentication Approach (options)

The implementer must determine the appropriate approach:

1. **Slack OAuth** — Contractor clicks "Connect Slack", redirected to Slack, authorizes app, callback stores identity. Requires `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SLACK_SIGNING_SECRET`.

2. **Admin-installed Slack App** — Workspace-level bot. Contractor's Slack identity verified via email matching or manual admin verification. Simpler but less automated.

3. **Manual verification** — Contractor submits Slack profile info, admin verifies manually. No Slack API needed but no automation.

**The implementer should choose based on:** whether a Slack workspace exists for the org, whether OAuth is feasible, and the desired level of automation.

### Slack Verification (options)

1. **Identity verification** — Confirm contractor's Slack account matches their portal email
2. **Channel membership** — Verify contractor joined required channels
3. **Activity verification** — Verify contractor posted messages, replied in threads
4. **Manual admin verification** — Admin marks as verified

**Recommendation:** Start with identity verification. Activity verification is Phase 4 territory.

### Required Environment Variables (by name only, actual values not needed)

Depending on chosen approach:
- `SLACK_CLIENT_ID` — if using OAuth
- `SLACK_CLIENT_SECRET` — if using OAuth
- `SLACK_SIGNING_SECRET` — if using OAuth/webhooks
- `SLACK_BOT_TOKEN` — if using bot API for verification
- `SLACK_WORKSPACE_URL` — workspace invite link for training content

---

## Phase 3 API Routes (recommended)

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /api/training/slack` | `requireContractor()` | Get Slack connection status for assignment |
| `POST /api/training/slack/connect` | `requireContractor()` | Initiate Slack OAuth or record connection |
| `GET /api/training/slack/callback` | none (OAuth callback) | Handle Slack OAuth redirect |
| `POST /api/training/slack/verify` | `requireAdminOrStaff()` | Admin manually verifies Slack identity |

**Note:** These are recommendations. The implementer should design routes based on the chosen authentication approach. Not all routes may be needed.

---

## Phase 3 UI Changes (recommended)

### Contractor Training Page (`/contractor/training`)

For Slack Fundamentals assignments, add a Slack Connection section:

```
Slack Fundamentals
3/7 complete

Slack Connection:
Not Connected

[Connect Slack]
```

After connection:

```
Slack Connection:
Connected
Workspace: WID Media Agency
Identity: wilmer@company.com

[Verified ✓]
```

### Admin Progress Table (`/admin/developer-training` → Contractor Progress)

Add columns:

```
| Contractor | Lesson | Progress | GitHub | Slack |
| Wilmer     | Slack Fundamentals | 3/7 | Ready | Connected |
```

---

## Security Requirements

- Contractor identity from `requireContractor()` — never trust browser
- `assignment.contractorId === user.contractorId` verified before any Slack operation
- Cross-contractor access returns 403
- Slack OAuth state parameter validated (if OAuth used)
- Slack webhook signatures validated (if webhooks used)
- No Slack tokens exposed to client-side
- No Slack secrets in URLs, localStorage, or React state
- No raw tokens stored in database unless encrypted

---

## Audit Events (naming convention from Phase 2)

```
slack.connection_started
slack.connection_completed
slack.connection_failed
slack.verification_completed
slack.verification_failed
```

---

## Testing Checklist

- [ ] Contractor can connect Slack identity
- [ ] Connection belongs to their TrainingAssignment
- [ ] Cross-contractor access returns 403
- [ ] Duplicate connection attempts are idempotent
- [ ] Slack identity verification works (or manual fallback)
- [ ] TrainingStepProgress updates correctly
- [ ] Notifications fire on connection events
- [ ] AuditLog records Slack events
- [ ] Admin can see Slack status in progress table
- [ ] Contractor UI shows Slack connection status
- [ ] Phase 1 training still works (regression)
- [ ] Phase 2 GitHub still works (regression)
- [ ] `prisma validate` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes

---

## Phase 3 Completion Criteria

Phase 3 is complete only when:

1. Contractor can securely connect their Slack identity
2. Connection belongs to their TrainingAssignment
3. Cross-contractor access is prevented
4. Slack identity can be verified (automated or manual)
5. TrainingStepProgress remains the canonical progress system
6. Notifications work
7. AuditLog works
8. Admin can see Slack training status
9. Contractor UI works
10. Existing Phase 1+2 functionality continues working
11. Production build passes

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
| `prisma/schema.prisma` | All 23 models including training + GitHub |
| `prisma/seed-training.ts` | Canonical lesson definitions |
| `src/lib/auth.ts` | Session helpers, `requireContractor()`, `requireAdminOrStaff()` |
| `src/lib/audit.ts` | `logAudit()` — best-effort audit logging |
| `src/lib/notifications.ts` | `createNotification()` — notification creation |
| `src/lib/github.ts` | GitHub service (Octokit PAT, template repos) |
| `src/app/api/training/progress/route.ts` | Contractor training progress GET + step completion POST |
| `src/app/api/training/github/route.ts` | GitHub repo creation + status check |
| `src/app/api/admin/training/assign/route.ts` | Admin lesson assignment |
| `src/app/api/admin/training/progress/route.ts` | Admin progress view |
| `src/app/contractor/training/page.tsx` | Contractor training UI |
| `src/app/admin/developer-training/page.tsx` | Admin training UI with progress tab |
| `src/components/ContractorSidebar.tsx` | Contractor sidebar with NotificationBell |
| `src/components/NotificationBell.tsx` | Notification bell component (30s polling) |
| `AGENTS.md` | Project conventions and architecture |
| `CHANGELOG.md` | Version history |
