# Phase 4 Architecture — Role-Based Workforce Training & Project Execution

**Status:** DESIGN ONLY — Do NOT implement  
**Date:** August 2026  
**Depends on:** Phases 1-3 (complete)

---

## 1. Current Architecture Map

### Actual Schema (25 models, PostgreSQL via Supabase)

```
Agency
  ├── User (admin | staff | contractor | client)
  │     ├── Contractor
  │     │     ├── ContractorRole (multi-role: pending | approved | rejected)
  │     │     ├── TrainingAssignment
  │     │     │     ├── TrainingStepProgress
  │     │     │     ├── GitHubRepository
  │     │     │     └── SlackConnection
  │     │     ├── SOW
  │     │     └── AssembledContract
  │     └── Client
  │           ├── Project (clientId, contractorId?)
  │           ├── Deliverable (clientId, projectId?, contractorId?, sowId?)
  │           ├── FileFolder
  │           ├── Invoice
  │           └── Document
  ├── MasterAgreement
  │     └── AssembledContract
  ├── Addendum
  ├── Notification
  ├── AuditLog
  └── ProjectSyncConfig
```

### Training Models (Phases 1-3)

```
TrainingLesson (slug, targetRole, steps JSON, requiresGithub, requiresSlack)
    ↓
TrainingAssignment (lessonId, contractorId, status)
    ├── TrainingStepProgress (stepId, status, evidence)
    ├── GitHubRepository (repoName, repoUrl, status)
    └── SlackConnection (slackEmail, slackUserId, status)
```

### Existing Role System

```
ContractorRole
  - contractorId (FK)
  - role (string: photography | videography | social-media | designer | ai-automation |
         web-designer | developer | copywriter | motion-designer | virtual-assistant |
         marketing-specialist | podcast-editor)
  - status (pending | approved | rejected)
  - @@unique([contractorId, role])
```

12 roles defined in:
- `src/app/api/contractors/[id]/roles/route.ts` (ALLOWED_ROLES)
- `src/app/admin/contractors/[id]/page.tsx` (AVAILABLE_ROLES)
- `src/app/contractor/my-roles/page.tsx` (AVAILABLE_ROLES)

### Existing Project Model

```
Project
  - clientId (FK→Client)
  - contractorId (FK? → Contractor)
  - name, description, icon
  - status: planning | in-progress | review | complete
  - progress (Int 0-100)
  - timeline (JSON array)
  - images (JSON array)
```

### Existing Deliverable Model

```
Deliverable
  - clientId (FK→Client)
  - projectId (FK? → Project)
  - contractorId (FK? → Contractor)
  - sowId (FK? → SOW)
  - name, type (image | video | document | design)
  - status: pending | in-progress | pending-approval | approved | changes-requested
  - dueDate, description, approvedAt
```

### Existing Evidence/Upload Systems

| System | Storage | Purpose |
|--------|---------|---------|
| `POST /api/contractors/[id]/upload` | Local disk (`public/uploads/`) | Tax forms, insurance, licensing |
| `POST /api/drive/upload` | Google Drive | Project files (100MB max) |
| `POST /api/projects/[id]/images` | Local disk | Project images (15MB max) |
| `TrainingStepProgress.evidence` | Text field (unused) | Training step evidence |

---

## 2. Existing Models That Can Be Reused

| Model | Reuse For | Notes |
|-------|-----------|-------|
| `ContractorRole` | Role-based training tracks | Already has role + status workflow |
| `TrainingLesson` | Role-specific lessons | `targetRole` field exists |
| `TrainingAssignment` | Lesson assignment | Already linked to contractor |
| `TrainingStepProgress` | Step completion + evidence | `evidence` field exists (text) |
| `Project` | Work projects | Already has status, progress, contractorId |
| `Deliverable` | Task/deliverable tracking | Already has status workflow, type field |
| `GitHubRepository` | Developer evidence | Already linked to training |
| `SlackConnection` | Communication verification | Already linked to training |
| `Notification` | Work notifications | Already exists |
| `AuditLog` | Audit trail | Already exists |

### What Already Works

- **Role assignment**: `ContractorRole` with approval workflow
- **Training assignment**: `TrainingAssignment` with step tracking
- **Project tracking**: `Project` with status and progress
- **Deliverable tracking**: `Deliverable` with status workflow (pending → in-progress → pending-approval → approved/changes-requested)
- **Integration verification**: GitHub repos + Slack connections per training assignment
- **File upload**: Google Drive integration for project files

### What's Missing

| Gap | Impact | Priority |
|-----|--------|----------|
| No Task model (work items within projects) | Can't track granular work | HIGH |
| No role-to-training-track mapping | Manual assignment only | HIGH |
| No deliverable file attachments | Can't attach files to deliverables | HIGH |
| No review/QA model | Can't track who reviewed what | MEDIUM |
| No evidence upload for deliverables | Training steps have text-only evidence | MEDIUM |
| No project-contract linking | Projects disconnected from SOWs | LOW |
| No role-specific integration config | GitHub/Slack are per-assignment, not per-role | LOW |

---

## 3. Proposed Role Architecture

### Decision: Extend ContractorRole, Don't Replace

The existing `ContractorRole` model is sufficient. No new `TrainingTrack` model needed.

**Why:** `TrainingLesson.targetRole` already maps lessons to roles. The missing piece is automatic assignment based on role, not a new data model.

### Role → Training Mapping (Configuration, Not Schema)

```
Role: developer
  Training:
    - developer-full (16 steps, GitHub required)
    - slack-fundamentals (7 steps, Slack required)
  Integrations: GitHub, Slack
  Deliverable Types: code, document

Role: designer
  Training:
    - designer-fundamentals (N steps)
    - brand-guidelines (N steps)
    - social-media-design (N steps)
    - exporting-assets (N steps)
  Integrations: Slack
  Deliverable Types: design, image

Role: videographer
  Training:
    - video-fundamentals (N steps)
    - short-form-editing (N steps)
    - export-best-practices (N steps)
  Integrations: Slack
  Deliverable Types: video, image

Role: qa-tester
  Training:
    - testing-fundamentals (N steps)
    - bug-reporting (N steps)
    - regression-testing (N steps)
  Integrations: Slack
  Deliverable Types: document, image

Role: copywriter
  Training:
    - copywriting-fundamentals (N steps)
    - brand-voice (N steps)
  Integrations: Slack
  Deliverable Types: document

Role: social-media
  Training:
    - social-media-fundamentals (N steps)
    - content-calendar (N steps)
  Integrations: Slack
  Deliverable Types: image, video, document
```

### Implementation Approach

Add a `RoleTrainingConfig` JSON field to a config model or a JSON file. NOT a new Prisma model — this is configuration, not data.

```ts
// src/lib/role-training-config.ts
export const ROLE_TRAINING: Record<string, {
  lessons: string[];        // lesson slugs to auto-assign
  integrations: string[];   // ['github', 'slack']
  deliverableTypes: string[];
}> = {
  developer: {
    lessons: ['developer-full', 'slack-fundamentals'],
    integrations: ['github', 'slack'],
    deliverableTypes: ['code', 'document'],
  },
  designer: {
    lessons: ['designer-fundamentals', 'brand-guidelines'],
    integrations: ['slack'],
    deliverableTypes: ['design', 'image'],
  },
  // ...
};
```

---

## 4. Proposed Training Architecture

### Current Flow (Phases 1-3)

```
Admin manually assigns TrainingLesson
    ↓
TrainingAssignment created
    ↓
Contractor completes steps
    ↓
GitHubRepository / SlackConnection created (if required)
    ↓
Completion tracked
```

### Proposed Flow (Phase 4)

```
Contractor assigned a role (ContractorRole approved)
    ↓
Role training config checked
    ↓
Training lessons auto-assigned based on role
    ↓
Contractor completes training
    ↓
Integrations verified (GitHub/Slack)
    ↓
Contractor marked as "trained" for that role
    ↓
Admin can assign projects/tasks
```

### New Concept: Contractor Readiness

Not a new model. A computed field derived from:

```ts
function getContractorReadiness(contractorId: string): {
  trained: boolean;
  trainingProgress: number;
  integrationsVerified: { github: boolean; slack: boolean };
  currentProject: string | null;
  activeTasks: number;
} {
  // Check: all role-required lessons completed
  // Check: all role-required integrations verified
  // Check: current project assignment
  // Check: active task count
}
```

---

## 5. Proposed Project/Task Architecture

### Decision: Add Task Model, Extend Project

The existing `Project` model handles project-level tracking. What's missing is granular work items.

### New Model: ProjectTask

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

  deliverables  TaskDeliverable[]
  reviews       TaskReview[]
}
```

### New Model: TaskDeliverable

Links deliverables to specific tasks (not just projects).

```prisma
model TaskDeliverable {
  id            String    @id @default(uuid())
  taskId        String
  task          ProjectTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  deliverableId String
  deliverable   Deliverable @relation(fields: [deliverableId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())

  @@unique([taskId, deliverableId])
}
```

### New Model: TaskReview

Generic review model for any entity.

```prisma
model TaskReview {
  id            String    @id @default(uuid())
  taskId        String
  task          ProjectTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  reviewerId    String
  reviewer      User      @relation(fields: [reviewerId], references: [id])
  status        String    @default("pending") // pending | approved | changes_requested | rejected
  feedback      String?
  reviewedAt    DateTime?
  createdAt     DateTime  @default(now())
}
```

### Why Not Extend Deliverable?

The existing `Deliverable` model is client-facing (linked to `clientId`). Tasks are internal work items. Keeping them separate avoids conflating client deliverables with internal tasks.

---

## 6. Proposed Deliverable/Evidence Architecture

### Decision: Extend Existing Deliverable, Add File Attachments

The existing `Deliverable` model already has a status workflow. What's missing is file attachments.

### Extend Deliverable

Add fields to existing `Deliverable`:

```prisma
model Deliverable {
  // ... existing fields ...
  submittedUrl   String?    // URL to submitted file (Google Drive link)
  submittedAt    DateTime?  // when submitted for review
  feedback       String?    // review feedback
  reviewedBy     String?    // reviewer userId
  reviewedAt     DateTime?  // when reviewed
}
```

### New Model: DeliverableAttachment

File attachments for deliverables.

```prisma
model DeliverableAttachment {
  id            String    @id @default(uuid())
  deliverableId String
  deliverable   Deliverable @relation(fields: [deliverableId], references: [id], onDelete: Cascade)
  fileName      String
  fileType      String    // pdf | png | jpg | mp4 | ai | svg | fig | etc.
  fileSize      Int       // bytes
  driveFileId   String?   // Google Drive file ID
  driveFileUrl  String?   // Google Drive URL
  uploadedBy    String
  uploader      User      @relation(fields: [uploadedBy], references: [id])
  uploadedAt    DateTime  @default(now())

  @@index([deliverableId])
}
```

### Evidence Sources (Unified)

| Source | How | Model |
|--------|-----|-------|
| GitHub | PR link, commit SHA | `GitHubRepository` (already exists) |
| Slack | Message link, channel | `SlackConnection` (already exists) |
| Google Drive | File URL | `DeliverableAttachment.driveFileUrl` |
| Upload | Local file | `DeliverableAttachment` |
| Manual | Text description | `Deliverable.feedback` |
| Screenshot | Image URL | `DeliverableAttachment` |

---

## 7. Proposed Review/QA Architecture

### Decision: Extend Existing Status Workflow

The existing `Deliverable.status` workflow is sufficient. What's missing is review attribution.

### Extend Existing Models

**Deliverable** — add review fields:
```prisma
  submittedUrl   String?
  submittedAt    DateTime?
  feedback       String?
  reviewedBy     String?
  reviewedAt     DateTime?
```

**TaskReview** (new) — for task-level reviews:
- Links a reviewer to a task
- Tracks approval status and feedback
- Supports multiple reviewers per task

### Review Roles

| Reviewer Type | Can Review | Access |
|---------------|-----------|--------|
| Admin | Everything | Full access |
| Staff | Everything except admin settings | Full access |
| Creative Director | Design, video, content deliverables | Role-scoped |
| QA Lead | QA deliverables, code deliverables | Role-scoped |
| Project Manager | Task completion, project status | Project-scoped |

### Review Status Workflow

```
pending → in_review → approved
                     → changes_requested → in_review (loop)
                     → rejected
```

---

## 8. Integration Architecture

### Decision: Role-Based Integration Configuration

Integrations (GitHub, Slack) are not per-assignment — they're per-role. But the existing `GitHubRepository` and `SlackConnection` models are linked to `TrainingAssignment`.

### Approach: Keep Existing, Add Role Config

The existing integration models stay as-is. The role training config determines which integrations are required.

```
Role: developer
  Requires: GitHub ✓, Slack ✓
  Auto-assigns: developer-full (requiresGithub), slack-fundamentals (requiresSlack)

Role: designer
  Requires: Slack ✓
  Does NOT require: GitHub
  Auto-assigns: designer-fundamentals (requiresGithub=false, requiresSlack=true)
```

### Integration Verification Status

Computed from existing models:

```ts
function getIntegrationStatus(contractorId: string): {
  github: { required: boolean; verified: boolean; repoUrl?: string };
  slack: { required: boolean; verified: boolean; email?: string };
} {
  // Check: which lessons require which integrations
  // Check: GitHubRepository status for assignments with requiresGithub
  // Check: SlackConnection status for assignments with requiresSlack
}
```

---

## 9. Admin Dashboard Architecture

### Conceptual Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  WORKFORCE DASHBOARD                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Contractor Overview                                              │   │
│  ├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤   │
│  │ Name     │ Role     │ Training │ Project  │ Tasks    │ Status   │   │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤   │
│  │ Felipe   │ Developer│ 80%      │ Resort   │ 4/6      │ Active   │   │
│  │ Aset     │ Designer │ 60%      │ Campaign │ 5/8      │ Active   │   │
│  │ Wilmer   │ Developer│ 45%      │ —        │ —        │ Training │   │
│  │ Carlos   │ QA       │ 90%      │ App v2   │ 3/4      │ Active   │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Per-Contractor Detail                                            │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │  Felipe (Developer)                                               │   │
│  │  ├── Training: 80% (13/16 steps)                                 │   │
│  │  ├── GitHub: Active (repo: wid-dev-abc123)                       │   │
│  │  ├── Slack: Verified (felipe@company.com)                        │   │
│  │  ├── Project: Resort Website (in-progress)                       │   │
│  │  ├── Tasks: 4/6 completed, 2 in progress                         │   │
│  │  ├── Deliverables: 3/4 approved, 1 pending review                │   │
│  │  └── Readiness: READY FOR CLIENT WORK                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Per-Contractor Detail                                            │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │  Aset (Graphic Designer)                                         │   │
│  │  ├── Training: 60% (3/5 lessons)                                 │   │
│  │  ├── GitHub: N/A (role doesn't require)                          │   │
│  │  ├── Slack: Verified (aset@company.com)                          │   │
│  │  ├── Project: Social Campaign (in-progress)                      │   │
│  │  ├── Tasks: 5/8 completed, 3 in progress                         │   │
│  │  ├── Deliverables: 6/8 approved, 2 pending review                │   │
│  │  └── Readiness: IN TRAINING (2 lessons remaining)                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Dashboard Data Sources

| Metric | Source | Computation |
|--------|--------|-------------|
| Role | `ContractorRole` | Primary approved role |
| Training % | `TrainingAssignment` + `TrainingStepProgress` | Completed steps / total steps |
| Project | `Project` | Current project assigned to contractor |
| Tasks | `ProjectTask` | Completed / total for current project |
| GitHub | `GitHubRepository` | Status check for github-required lessons |
| Slack | `SlackConnection` | Status check for slack-required lessons |
| Deliverables | `Deliverable` | Approved / total for current project |
| Readiness | Computed | All training complete + all integrations verified |

---

## 10. Automation Opportunities

### Automated (No Human Intervention)

| Action | Trigger | Implementation |
|--------|---------|----------------|
| Auto-assign role training | `ContractorRole` approved | Hook on status change |
| Auto-assign onboarding | New contractor login | Already implemented |
| Auto-create GitHub repo | Training lesson requires GitHub | Already implemented |
| Auto-verify Slack | Bot token configured | Already implemented |
| Auto-set project progress | Task completion % | Computed from tasks |
| Auto-notify on deliverable status change | Status update | Already implemented |

### Manual (Human Decision)

| Action | Who | When |
|--------|-----|------|
| Assign project to contractor | Admin | After training complete |
| Create tasks within project | Admin/PM | Project planning phase |
| Review/approve deliverables | Admin/Staff/Creative Director | After submission |
| Assign reviewers | Admin/PM | When task enters review |
| Approve contractor role | Admin | After role request |

### AI-Assisted (Suggested, Not Executed)

| Action | Input | Output |
|--------|-------|--------|
| Training content generation | Role + lesson topic | Draft lesson steps |
| Deliverable quality check | Submitted file | Quality score + suggestions |
| Task priority suggestion | Project deadlines + workload | Priority recommendation |
| Readiness assessment | Training + project + task data | Readiness score |

---

## 11. AI-Assisted Opportunities

| Domain | AI Use | Safety Level |
|--------|--------|-------------|
| Training | Generate lesson explanations from codebase | Low risk |
| QA | Automated code review suggestions | Medium risk |
| Design | Asset quality analysis | Low risk |
| Video | Transcript/caption verification | Low risk |
| Project Mgmt | Task priority and deadline suggestions | Low risk |
| Content | Copy editing, grammar check | Low risk |

**原则:** AI suggests, human decides. Never auto-approve based on AI.

---

## 12. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| Role escalation | Only admin can approve roles |
| Task reassignment | Only admin/PM can reassign tasks |
| Deliverable approval | Role-scoped reviewers |
| File upload | Same limits as existing (10MB contractor, 100MB Drive) |
| Integration tokens | Server-side only, never exposed to client |
| Cross-contractor data | `contractorId` enforced on all queries |

---

## 13. Migration Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking existing training flow | HIGH | Additive changes only, no field removals |
| Breaking existing project flow | HIGH | Extend Project, don't replace |
| Breaking existing deliverable flow | HIGH | Add fields to Deliverable, don't restructure |
| Performance on dashboard queries | MEDIUM | Add indexes on foreign keys |
| Data migration for existing projects | LOW | New fields are optional with defaults |

---

## 14. Recommended Implementation Order

### Phase 4A: Foundation (Low Risk)

1. Add `ProjectTask` model
2. Add `TaskDeliverable` model (links tasks to deliverables)
3. Add `TaskReview` model
4. Add `role-training-config.ts` (JSON config, no schema change)
5. Extend `Deliverable` with review fields (`submittedUrl`, `feedback`, `reviewedBy`, `reviewedAt`)
6. Add `DeliverableAttachment` model
7. Run `prisma db push`
8. Typecheck + build

### Phase 4B: Role-Based Training (Medium Risk)

1. Implement auto-assign on `ContractorRole` approval
2. Create role-specific lesson content (designer, QA, video, etc.)
3. Update training UI to show role context
4. Add "Readiness" computation
5. Typecheck + build

### Phase 4C: Project/Task Execution (Medium Risk)

1. Create task management UI (admin creates tasks, contractor sees tasks)
2. Implement task status workflow
3. Link deliverables to tasks
4. Add task assignment (admin assigns contractor to task)
5. Typecheck + build

### Phase 4D: Deliverables/Evidence/Review (Medium Risk)

1. Implement file attachment upload (reuse Google Drive)
2. Add review workflow UI
3. Implement reviewer assignment
4. Add evidence display on deliverables
5. Typecheck + build

### Phase 4E: Automation/Analytics (Low Risk)

1. Implement auto-assign on role approval
2. Build workforce dashboard
3. Add progress computation
4. Add readiness indicators
5. Typecheck + build

---

## 15. DATABASE_DESIGN.md Reconciliation

The existing `docs/DATABASE_DESIGN.md` identifies 14 critical issues and 7 missing modules. Here's what's relevant to Phase 4:

### Critical Blockers for Phase 4

| Issue | Relevant? | Action |
|-------|-----------|--------|
| #5 AuditLog/Notification agency scoping | Yes | Add `agencyId` to both (future) |
| #8 Contractor onboarding step tracking | No | Not needed for Phase 4 |

### Not Blockers for Phase 4

| Issue | Why Not |
|-------|---------|
| #1 Client portal token | Client-side, not training |
| #2 Proposal module data | Business ops, not training |
| #3 Proposal versioning | Business ops |
| #4 Feedback embedding | Client feedback |
| #6 Contract signing | Legal ops |
| #7 MilestoneDeliverable | Existing system works |
| #9 BusinessGoal relation | Business ops |
| #10 Document embedding | Document system |
| #11 Notification polling | UI optimization |
| #12 Feedback search | Client feedback |
| #13 Proposal currentVersion | Dead field |
| #14 ContractorPortal session | Auth system |

### Missing Modules Relevant to Phase 4

| Module | Relevant? | Phase 4 Approach |
|--------|-----------|-----------------|
| Project Management | YES | Extend existing Project + add Task |
| Invoice & Payment | No | Separate workstream |
| Communication | Partial | ActivityFeed useful but not critical |
| File & Media | Partial | DeliverableAttachment covers deliverable files |
| Analytics | Partial | Dashboard computation, not full analytics |
| Email & Notifications | No | Separate workstream |
| Calendar | No | Separate workstream |

---

## Summary

Phase 4 transforms the training system into a workforce management system by:

1. **Adding Task model** — granular work items within projects
2. **Adding role-training config** — automatic lesson assignment based on role
3. **Extending Deliverable** — file attachments and review tracking
4. **Adding review model** — who reviewed what, when
5. **Building dashboard** — workforce readiness at a glance

**Total new models: 4** (ProjectTask, TaskDeliverable, TaskReview, DeliverableAttachment)  
**Extended models: 1** (Deliverable — review fields)  
**Configuration: 1** (role-training-config.ts)  
**Schema changes: Minimal** — additive only, no breaking changes
