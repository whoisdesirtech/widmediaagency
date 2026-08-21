# Database Design - Vibe Coding Mastery

## Table of Contents
- [Current ERD](#current-erd)
- [Critical Issues (14)](#critical-issues)
- [Missing Modules (7)](#missing-modules)
- [Revised ERD](#revised-erd)
- [Migration Strategy](#migration-strategy)

---

## Current ERD

The database uses SQLite (via Prisma) with 30 models across 7 business domains. All models are in a single file: `prisma/schema.prisma` (~865 lines).

### Entity Relationship Diagram (Current State)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    VIBE CODING MASTERY - CURRENT DATABASE ERD                                │
│                                    (30 models across 7 domains)                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          AUTHENTICATION & USERS                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  ┌──────────┐        ┌──────────────┐        ┌──────────────────┐                                           │
│  │  Agency   │1────*│    User       │1────*│  Contractor      │                                           │
│  │──────────│        │──────────────│        │──────────────────│                                           │
│  │ id (PK)  │        │ id (PK)      │        │ id (PK)          │                                           │
│  │ name     │        │ email (UQ)   │        │ userId (FK→User) │←── UNIQUE (bare FK)                       │
│  │ slug (UQ)│        │ name         │        │ businessName     │                                           │
│  │ domain   │        │ role (enum)  │        │ specialty        │                                           │
│  │ logoUrl  │        │ agencyId(FK) │        │ hourlyRate       │                                           │
│  │ plan     │        │ isActive     │        │ portfolioUrl     │                                           │
│  └──────────┘        └──────────────┘        │ status           │                                           │
│                          │                   │ onboardingStep   │                                           │
│                          │1                  │ userId (UQ)      │                                           │
│                          │                   └──────────────────┘                                           │
│                          │                        │                                                         │
│                          │                        │1                                                        │
│                          │                   ┌────┴──────────────────────┐                                  │
│                          │                   │                           │                                  │
│                          │              ┌────▼──────────┐        ┌─────▼────────────┐                      │
│                          │              │ ContractorRole│        │  ContractorPortal │                      │
│                          │              │──────────────│        │  (session store)  │                      │
│                          │              │ id (PK)      │        │──────────────────│                      │
│                          │              │ contractorId │        │ contractorId(FK) │                      │
│                          │              │ role (enum)  │        │ email            │                      │
│                          │              │ assignedAt   │        │ lastLoginAt      │                      │
│                          │              │ assignedBy   │        │ onboardedAt      │                      │
│                          │              │ isActive     │        │ driveFolderId    │                      │
│                          │              └──────────────┘        └──────────────────┘                      │
│                          │                                                                                  │
│                          │1                                                                                 │
│                   ┌──────┴──────────────┐                                                                  │
│                   │      Client          │                                                                  │
│                   │─────────────────────│                                                                  │
│                   │ id (PK)             │                                                                  │
│                   │ agencyId (FK→Agency)│                                                                  │
│                   │ userId (FK→User)    │←── UNIQUE                                                        │
│                   │ companyName         │                                                                  │
│                   │ industry            │                                                                  │
│                   │ companySize         │                                                                  │
│                   │ budget              │                                                                  │
│                   │ timeline            │                                                                  │
│                   │ contactPerson       │                                                                  │
│                   │ contactEmail        │                                                                  │
│                   │ status              │                                                                  │
│                   │ onboardedAt         │                                                                  │
│                   │ driveFolderId       │                                                                  │
│                   │ portalToken         │                                                                  │
│                   └─────────────────────┘                                                                  │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          CLIENT FEEDBACK                                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐                            │
│  │   FeedbackBoard   │1────*│   FeedbackItem    │1────*│  FeedbackResponse │                            │
│  │──────────────────│         │──────────────────│         │──────────────────│                            │
│  │ id (PK)          │         │ id (PK)          │         │ id (PK)          │                            │
│  │ clientId (FK→Clnt)│         │ boardId (FK→Board)│         │ itemId (FK→Item) │                            │
│  │ agencyId(FK→Agnc)│         │ clientId(FK→Clnt)│         │ authorId(FK→User)│                            │
│  │ title            │         │ title            │         │ content          │                            │
│  │ description      │         │ category         │         │ parentId (self)  │←── threaded replies        │
│  │ status           │         │ status           │         └──────────────────┘                            │
│  └──────────────────┘         │ priority         │                                                         │
│                               │ assignedTo(FK→U)│                                                         │
│                               │ dueDate          │                                                         │
│                               │ attachments ([]) │←── JSON array of objects                                │
│                               │ embedding        │←── vector(1536)                                         │
│                               │ aiSummary        │←── UNIQUE                                               │
│                               │ aiSuggested      │                                                         │
│                               │ aiSource (enum)  │←── 'website'|'meeting'|'email'|'slack'|'other'         │
│                               │ sourceUrl        │                                                         │
│                               └──────────────────┘                                                         │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          BUSINESS OPERATIONS                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐                            │
│  │   BusinessPlan    │1────*│   BusinessGoal    │1────*│  BusinessMilestone│                            │
│  │──────────────────│         │──────────────────│         │──────────────────│                            │
│  │ id (PK)          │         │ id (PK)          │         │ id (PK)          │                            │
│  │ clientId (FK→Clnt)│         │ planId (FK→Plan) │         │ goalId (FK→Goal) │                            │
│  │ agencyId(FK→Agnc)│         │ title            │         │ title            │                            │
│  │ planType         │         │ description      │         │ description      │                            │
│  │ period           │         │ category         │         │ dueDate          │                            │
│  │ status           │         │ priority         │         │ completedAt      │                            │
│  │ goalsData        │         │ status           │         └──────────────────┘                            │
│  │ financialsData   │         │ targetValue      │                                                         │
│  │ embedding        │         │ currentValue     │                                                         │
│  │ aiSummary        │         │ unit             │                                                         │
│  └──────────────────┘         └──────────────────┘                                                         │
│                                                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐                            │
│  │    Proposal       │1────*│ ProposalModule   │*────1│ ProposalModuleDef │                            │
│  │──────────────────│         │──────────────────│         │──────────────────│                            │
│  │ id (PK)          │         │ id (PK)          │         │ id (PK)          │                            │
│  │ clientId (FK→Clnt)│         │ proposalId       │         │ slug (UQ)        │                            │
│  │ agencyId(FK→Agnc)│         │ moduleDefId(FK)  │         │ name             │                            │
│  │ templateId (FK)  │         │ sortOrder        │         │ description      │                            │
│  │ status           │         │ data (JSON)      │         │ category         │                            │
│  │ version          │         │ isCustom         │         │ configSchema     │                            │
│  │ totalAmount      │         │ content          │         │ isActive         │                            │
│  │ currency         │         │ aiSummary        │         └──────────────────┘                            │
│  │ sentAt           │         └──────────────────┘                                                         │
│  │ acceptedAt       │                                                                                      │
│  │ rejectedAt       │         ┌──────────────────┐         ┌──────────────────┐                            │
│  │ embedding        │         │ ProposalTemplate │1────*│ TemplateModule   │                            │
│  │ aiSummary        │         │──────────────────│         │──────────────────│                            │
│  └──────────────────┘         │ id (PK)          │         │ id (PK)          │                            │
│                               │ name             │         │ templateId(FK)   │                            │
│                               │ description      │         │ moduleDefId(FK)  │                            │
│                               │ isDefault        │         │ sortOrder        │                            │
│                               │ status           │         │ isDefault        │                            │
│                               │ version          │         │ defaultData      │                            │
│                               │ createdBy (FK→U) │         └──────────────────┘                            │
│                               │ embedding        │                                                         │
│                               │ aiSummary        │                                                         │
│                               └──────────────────┘                                                         │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          TRAINING                                                            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐                            │
│  │  TrainingLesson   │1────*│ TrainingAssignment│1────*│ TrainingStepProg │                            │
│  │──────────────────│         │──────────────────│         │──────────────────│                            │
│  │ id (PK)          │         │ id (PK)          │         │ id (PK)          │                            │
│  │ slug (UQ)        │         │ lessonId (FK)    │         │ assignmentId(FK) │                            │
│  │ title            │         │ contractorId(FK) │         │ stepId           │                            │
│  │ description      │         │ status           │         │ status           │                            │
│  │ version          │         │ assignedAt       │         │ completedAt      │                            │
│  │ targetRole       │         │ startedAt        │         │ evidence         │                            │
│  │ steps (JSON)     │         │ completedAt      │         └──────────────────┘                            │
│  │ isActive         │         │ UQ(lessonId,     │                                                         │
│  │ requiresGithub   │         │    contractorId) │                                                         │
│  └──────────────────┘         └────────┬─────────┘                                                         │
│                                        │                                                                   │
│                               ┌────────┼────────┐                                                          │
│                               │        │        │                                                          │
│                          ┌────▼───┐    │   ┌────▼───────────────┐                                         │
│                          │GitHub  │    │   │ SlackConnection     │                                         │
│                          │Repo    │    │   │───────────────────│                                         │
│                          │────────│    │   │ id (PK)           │                                         │
│                          │id (PK) │    │   │ assignmentId (FK) │←── UNIQUE                                │
│                          │assignId│    │   │ slackUserId       │                                         │
│                          │repoName│    │   │ slackEmail        │                                         │
│                          │repoUrl │    │   │ status            │                                         │
│                          │owner   │    │   │ verifiedAt        │                                         │
│                          │status  │    │   │ verifiedBy        │                                         │
│                          │UQ(aId) │    │   └───────────────────┘                                         │
│                          └────────┘    │                                                                   │
│                                        │1                                                                  │
│                               ┌────────▼──────────────┐                                                   │
│                               │   SOW                  │                                                   │
│                               │──────────────────────│                                                   │
│                               │ id (PK)               │                                                   │
│                               │ assignmentId (FK)     │←── UNIQUE                                         │
│                               │ amount                │                                                   │
│                               │ currency              │                                                   │
│                               │ paymentTerms          │                                                   │
│                               │ scope                 │                                                   │
│                               │ status                │                                                   │
│                               │ signedAt              │                                                   │
│                               │ signedBy              │                                                   │
│                               │ issuedAt              │                                                   │
│                               │ dueDate               │                                                   │
│                               │ embedding             │                                                   │
│                               │ aiSummary             │                                                   │
│                               └───────────────────────┘                                                   │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          DELIVERABLES                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐                            │
│  │    Deliverable    │1────*│   Milestone       │1────*│  MilestoneDeliver │                            │
│  │──────────────────│         │──────────────────│         │──────────────────│                            │
│  │ id (PK)          │         │ id (PK)          │         │ id (PK)          │                            │
│  │ assignmentId(FK) │         │ deliverableId(FK)│         │ milestoneId (FK) │                            │
│  │ milestoneId(FK)  │         │ title            │         │ deliverableId(FK)│←── UNIQUE (aId + dId)       │
│  │ title            │         │ description      │         │ status           │                            │
│  │ description      │         │ dueDate          │         │ submittedAt      │                            │
│  │ status           │         │ completedAt      │         │ submittedUrl     │                            │
│  │ dueDate          │         │ status           │         │ feedback         │                            │
│  │ completedAt      │         │ completionRate   │         │ completedAt      │                            │
│  │ priority         │         │ assignedTo       │         │ completedUrl     │                            │
│  │ progress         │         │ approvedBy       │         │ approvedBy       │                            │
│  │ submittedUrl     │         │ approvedAt       │         │ approvedAt       │                            │
│  │ embedding        │         │ notes            │         └──────────────────┘                            │
│  │ aiSummary        │         │ embedding        │                                                         │
│  └──────────────────┘         │ aiSummary        │                                                         │
│                               └──────────────────┘                                                         │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          DOCUMENTS (Markdown)                                                │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐                            │
│  │   Document        │1────*│   DocumentVersion │1────*│  DocumentTag      │                            │
│  │──────────────────│         │──────────────────│         │──────────────────│                            │
│  │ id (PK)          │         │ id (PK)          │         │ id (PK)          │                            │
│  │ clientId (FK→Clnt)│         │ documentId (FK)  │         │ documentId (FK)  │                            │
│  │ agencyId(FK→Agnc)│         │ versionNumber    │         │ tag              │                            │
│  │ title            │         │ content (MD)     │         │ UQ(docId, tag)   │                            │
│  │ slug (UQ)        │         │ contentHtml      │         └──────────────────┘                            │
│  │ category         │         │ authorId (FK→U)  │                                                         │
│  │ folderPath       │         │ commitMessage   │         ┌──────────────────┐                            │
│  │ status           │         │ createdAt        │         │ DocumentPermission│                            │
│  │ currentVersion   │         └──────────────────┘         │──────────────────│                            │
│  │ embedding        │                                      │ id (PK)          │                            │
│  │ aiSummary        │                                      │ documentId (FK)  │                            │
│  │ aiSummaryMd      │                                      │ userId (FK→User) │                            │
│  └──────────────────┘                                      │ permission       │←── 'view'|'edit'|'admin'  │
│                                                            │ grantedBy (FK→U) │                            │
│                                                            └──────────────────┘                            │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          INTEGRATIONS                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐                            │
│  │  ProjectSyncConfig│1────*│   AuditLog        │         │    Notification  │                            │
│  │──────────────────│         │──────────────────│         │──────────────────│                            │
│  │ id (PK)          │         │ id (PK)          │         │ id (PK)          │                            │
│  │ agencyId(FK→Agnc)│         │ userId (FK→User) │         │ userId (FK→User) │                            │
│  │ provider         │         │ action           │         │ type             │                            │
│  │ config           │         │ entity           │         │ title            │                            │
│  │ lastSyncAt       │         │ entityId         │         │ message          │                            │
│  │ status           │         │ method           │         │ link             │                            │
│  └──────────────────┘         │ path             │         │ isRead           │                            │
│                               │ ipAddress        │         │ createdAt        │                            │
│                               │ userAgent        │         └──────────────────┘                            │
│                               │ metadata         │                                                         │
│                               │ createdAt        │                                                         │
│                               └──────────────────┘                                                         │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Current Statistics

| Domain | Models | Foreign Keys | Relations |
|--------|--------|-------------|-----------|
| Auth & Users | 6 | 5 | User→Agency, Client→User, Client→Agency, Contractor→User, ContractorRole→Contractor, ContractorPortal→Contractor |
| Client Feedback | 3 | 5 | Board→Client, Board→Agency, Item→Board, Item→Client, Response→Item |
| Business Operations | 5 | 8 | Plan→Client, Plan→Agency, Goal→Plan, Milestone→Goal, Proposal→Client, Proposal→Agency, ProposalModule→Proposal, ProposalModule→ModuleDef |
| Training | 5 | 6 | Lesson→Assignment, Assignment→Contractor, StepProgress→Assignment, GitHubRepo→Assignment, SlackConn→Assignment, SOW→Assignment |
| Deliverables | 3 | 7 | Milestone→Deliverable, Deliverable→Assignment, Deliverable→Milestone, MilestoneDeliver→Milestone, MilestoneDeliver→Deliverable |
| Documents | 4 | 6 | Doc→Client, Doc→Agency, Version→Doc, Version→User, Tag→Doc, Permission→Doc |
| Integrations | 4 | 4 | SyncConfig→Agency, AuditLog→User, Notification→User |
| **Total** | **30** | **41** | |

---

## Critical Issues

### 1. Client Portal Token Collision

**Problem:** `Client.portalToken` is `String? @unique`. When `generateClientToken()` creates a token but `createClientWithLogin()` first creates a portal, there's a window where the token doesn't exist yet. The real issue: `POST /api/client-portal/login` verifies via `client.portalToken === token`, but `generateClientToken()` is the ONLY path that creates tokens. If the database is seeded with `createClientWithLogin()` (which creates a ClientPortal but no Client), the Client row gets a token via `generateClientToken()` after the fact. This creates a race condition during onboarding.

**Fix:** Ensure token generation is atomic with client creation. In `createClientWithLogin()`, generate the token immediately after creating the Client row. Remove `generateClientToken()` as a separate API endpoint and inline the logic.

---

### 2. Proposal Module Data Blobs

**Problem:** `ProposalModule.data` stores JSON blobs with business data (scope text, budget line items, team allocations). This data is not queryable or joinable. `ProposalModule.content` is the same data as text. Both `data` and `content` exist on the same model, creating confusion about which is canonical.

**Fix:** Make `content` the canonical field (it's what the UI reads). Remove `data` field in next major migration, or rename `data` → `rawJson` to clarify its role. For now, ensure all writes go to `content` and `data` is only used for backward compatibility reads.

---

### 3. Proposal Version Bumps via Atomic Counter

**Problem:** `Proposal` has `version Int @default(1)` bumped atomically in `db.proposal.update({ data: { version: { increment: 1 } } })`. This creates new `ProposalModule` rows but never archives old ones. There's no `ProposalVersion` model to track what changed between versions. The `Proposal.currentVersion` field is never used (it's always 1).

**Fix:** Add `ProposalVersion` model to track version history. When a version is bumped, create a `ProposalVersion` snapshot. Keep `ProposalVersion.versionNumber` as the authoritative version number, and `Proposal.version` as a denormalized counter for quick reads.

---

### 4. FeedbackItem Embedding Set on Every Save

**Problem:** The `feedback.create()` in `/api/feedback/items` sets `embedding` to a random vector `[0.1, 0.2, ...]` instead of calling `generateEmbedding()` for real semantic search. The embedding is always the same placeholder, making vector search useless.

**Fix:** Call `generateEmbedding(item.content)` to produce a real embedding. Store the raw content separately for reconstruction. Add error handling so embedding failure doesn't block item creation.

---

### 5. AuditLog and Notification Missing Agency Scoping

**Problem:** `AuditLog` and `Notification` both have `userId` FK but no `agencyId`. In a multi-tenant setup, querying "all audit logs for this agency" requires joining through `User.agencyId`. This is a performance and security concern — a query leak could expose cross-agency data.

**Fix:** Add `agencyId String?` to both `AuditLog` and `Notification`. Populate it from the session user's agency when creating entries. Add index on `agencyId` for fast filtered queries.

---

### 6. Contract Signing Flow Uses Hardcoded User ID

**Problem:** The contract signing route uses `params.id` (which is the User ID from the URL), not the Contractor ID from the session. The `SOW.signedBy` field stores `user.id`, but `SOW.contractorId` references `Contractor.id`. This creates a mismatch: `SOW.signedBy = "user-uuid"` while `SOW.contractorId = "contractor-uuid"`. There's no way to join from `SOW.signedBy` to the User who signed it without a separate lookup.

**Fix:** When signing, set `SOW.signedBy` to `contractor.userId` (the User ID of the contractor who signed). This allows joining `SOW → User` via `signedBy` directly.

---

### 7. Duplicate MilestoneDeliverable Handling

**Problem:** `MilestoneDeliverable` has `@@unique([assignmentId, deliverableId])` to prevent duplicates, but the insert uses `createMany` with `skipDuplicates: true`. If two requests arrive simultaneously, one succeeds silently while the other gets a duplicate key error that returns 400 to the user.

**Fix:** Use `upsert` instead of `createMany` with `skipDuplicates`. Or catch the unique constraint error and return a success response (idempotent behavior).

---

### 8. Contractor Onboarding Step Tracking

**Problem:** `Contractor.onboardingStep` is `Int @default(0)` incremented manually. There's no model tracking which step was completed or what data was entered at each step. If the contractor navigates away, they can't resume from where they left off. The step data is lost.

**Fix:** Add `ContractorOnboardingStep` model to track completed steps with their data. Use a JSON field for step-specific data (business info, specialties, portfolio URLs).

---

### 9. BusinessGoal Has No Relation to BusinessPlan

**Problem:** `BusinessGoal` has `planId String` but no Prisma relation to `BusinessPlan`. The schema only has `BusinessPlan.goals BusinessGoal[]`. This means `BusinessGoal` can reference a non-existent plan, and there's no cascading delete or referential integrity.

**Fix:** Add `plan BusinessPlan @relation(fields: [planId], references: [id], onDelete: Cascade)` to `BusinessGoal`. This ensures referential integrity and cascading deletes.

---

### 10. Document Embedding AI Summary Not Stored

**Problem:** `Document` has `embedding vector(1536)` and `aiSummary String?` and `aiSummaryMd String?`, but the document creation flow in `POST /api/documents` only stores the title and slug. The embedding is set to a random placeholder, and `aiSummary`/`aiSummaryMd` are never populated.

**Fix:** After document creation, call `generateEmbedding()` on the title + description to produce a real embedding. Store the AI summary in `aiSummary` and `aiSummaryMd`. Do this asynchronously so the API response is fast.

---

### 11. Notification Polling Is Inefficient

**Problem:** The `NotificationBell` component polls `GET /api/notifications?unreadOnly=true` every 30 seconds via `setInterval`. This creates a new database query on every poll, even when nothing has changed. There's no ETag or conditional request support.

**Fix:** Add `lastCheckedAt` to the notification query. Only return notifications created after `lastCheckedAt`. Use HTTP `If-Modified-Since` or ETag headers to avoid sending unchanged data.

---

### 12. FeedbackItem Embedding Is Not Used for Search

**Problem:** `FeedbackItem` has `embedding vector(1536)` and `aiSummary String? @unique`, but the `GET /api/feedback/items` endpoint only supports filtering by category/status/priority — not semantic search. The embedding field is dead weight.

**Fix:** Add a `search` query parameter to `GET /api/feedback/items` that performs cosine similarity search against the embedding. Return results ranked by relevance.

---

### 13. Proposal `currentVersion` Field Is Dead

**Problem:** `Proposal` has `currentVersion Int @default(1)` but it's never updated. The actual version is tracked by `version`. This creates confusion about which field is authoritative.

**Fix:** Remove `currentVersion` from the schema in next major migration. For now, ensure all reads use `version` and ignore `currentVersion`.

---

### 14. ContractorPortal Session Store Is Incomplete

**Problem:** `ContractorPortal` stores `email`, `lastLoginAt`, `onboardedAt`, `driveFolderId` — but not the session token, IP address, or user agent. There's no way to track active sessions or detect suspicious activity.

**Fix:** Add `sessionToken String?`, `ipAddress String?`, `userAgent String?` to `ContractorPortal`. Update the login route to store these values. Add a `sessionExpiresAt` field for automatic session expiry.

---

## Missing Modules

### 1. Project Management

**Current State:** No project model exists. Contractors are assigned tasks via `TrainingAssignment` but there's no concept of a "project" that groups multiple tasks, deliverables, and milestones under a single entity.

**Required Tables:**
- `Project` — id, clientId, agencyId, title, description, status, startDate, endDate, budget, embedding, aiSummary
- `ProjectMember` — id, projectId, userId, role, assignedAt
- `ProjectTask` — id, projectId, title, description, status, priority, assignedTo, dueDate, embedding, aiSummary
- `ProjectComment` — id, taskId, authorId, content, createdAt

**Relations:**
- Project → Client (1:N)
- Project → Agency (1:N)
- ProjectMember → Project (N:1)
- ProjectMember → User (N:1)
- ProjectTask → Project (N:1)
- ProjectTask → User (N:1)
- ProjectComment → ProjectTask (N:1)
- ProjectComment → User (N:1)

---

### 2. Invoice & Payment Tracking

**Current State:** `SOW` stores `amount` and `currency` but there's no invoicing, payment tracking, or financial reporting. The `Proposal.totalAmount` is proposal-only and doesn't connect to actual payments.

**Required Tables:**
- `Invoice` — id, clientId, agencyId, sowId, amount, currency, status, dueDate, paidAt, paidAmount, invoiceNumber, embedding, aiSummary
- `InvoiceLineItem` — id, invoiceId, description, quantity, unitPrice, amount
- `Payment` — id, invoiceId, amount, currency, paymentMethod, reference, processedAt
- `Expense` — id, projectId, category, amount, description, receiptUrl, recordedBy, recordedAt

**Relations:**
- Invoice → SOW (N:1)
- Invoice → Client (N:1)
- Invoice → Agency (N:1)
- InvoiceLineItem → Invoice (N:1)
- Payment → Invoice (N:1)
- Expense → Project (N:1)
- Expense → User (N:1)

---

### 3. Communication & Activity Feed

**Current State:** `Notification` is a simple model with no context about what triggered it. `AuditLog` tracks entity changes but not user interactions. There's no unified activity feed showing all actions across the platform.

**Required Tables:**
- `ActivityFeed` — id, agencyId, userId, action, entityType, entityId, metadata (JSON), createdAt
- `Comment` — id, entityType, entityId, authorId, content, parentId (self-referential), createdAt
- `Mention` — id, commentId, userId, createdAt

**Relations:**
- ActivityFeed → User (N:1)
- ActivityFeed → Agency (N:1)
- Comment → User (N:1)
- Comment → Comment (self-referential for threads)
- Mention → Comment (N:1)
- Mention → User (N:1)

---

### 4. File & Media Management

**Current State:** Files are stored in Google Drive with `driveFolderId` references. There's no local file tracking, version control, or media library. `ProposalModule.content` can contain file references but they're just strings.

**Required Tables:**
- `File` — id, agencyId, clientId, projectId, name, mimeType, size, driveFileId, driveFolderId, path, uploadedBy, embedding, aiSummary
- `FileVersion` — id, fileId, versionNumber, driveFileId, uploadedBy, uploadedAt, changeDescription
- `FileShare` — id, fileId, userId, permission, sharedBy, sharedAt
- `MediaLibrary` — id, agencyId, name, description, embedding, aiSummary

**Relations:**
- File → Agency (N:1)
- File → Client (N:1, optional)
- File → Project (N:1, optional)
- File → User (N:1, uploadedBy)
- FileVersion → File (N:1)
- FileShare → File (N:1)
- FileShare → User (N:1)

---

### 5. Analytics & Reporting

**Current State:** No analytics tables. The platform has no way to track KPIs, generate reports, or measure performance. `BusinessGoal` has `targetValue` and `currentValue` but no historical tracking.

**Required Tables:**
- `AnalyticsEvent` — id, agencyId, userId, event, entityType, entityId, metadata (JSON), createdAt
- `Report` — id, agencyId, title, type, config (JSON), status, generatedAt, filePath
- `KPI` — id, clientId, agencyId, name, value, targetValue, unit, period, recordedAt
- `KPISnapshot` — id, kpiId, value, recordedAt

**Relations:**
- AnalyticsEvent → Agency (N:1)
- AnalyticsEvent → User (N:1)
- Report → Agency (N:1)
- KPI → Client (N:1)
- KPI → Agency (N:1)
- KPISnapshot → KPI (N:1)

---

### 6. Email & Notification Preferences

**Current State:** `Notification` model exists but there's no email integration, no notification preferences, and no way to control what notifications are sent. The `NotificationBell` component polls the API but there's no push notification or email fallback.

**Required Tables:**
- `EmailLog` — id, agencyId, userId, to, from, subject, body, status, sentAt, openedAt, clickedAt
- `NotificationPreference` — id, userId, type, channel (email|push|in_app), enabled
- `EmailTemplate` — id, agencyId, name, subject, body, variables, isActive

**Relations:**
- EmailLog → Agency (N:1)
- EmailLog → User (N:1)
- NotificationPreference → User (N:1)
- EmailTemplate → Agency (N:1)

---

### 7. Calendar & Scheduling

**Current State:** `BusinessGoal` has `targetDate` and `BusinessMilestone` has `dueDate`, but there's no calendar view, no scheduling, and no deadline management. `Proposal` has `sentAt` and `acceptedAt` but no meeting scheduling.

**Required Tables:**
- `CalendarEvent` — id, agencyId, clientId, projectId, title, description, startTime, endTime, location, embedding, aiSummary
- `EventAttendee` — id, eventId, userId, status (accepted|declined|tentative), respondedAt
- `Deadline` — id, entityType, entityId, dueDate, reminderAt, completedAt
- `Availability` — id, userId, dayOfWeek, startTime, endTime, timezone

**Relations:**
- CalendarEvent → Agency (N:1)
- CalendarEvent → Client (N:1, optional)
- CalendarEvent → Project (N:1, optional)
- EventAttendee → CalendarEvent (N:1)
- EventAttendee → User (N:1)
- Deadline → User (N:1)
- Availability → User (N:1)

---

## Revised ERD

### After All Fixes and New Modules

The revised database will have **58 models** across **14 domains**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    VIBE CODING MASTERY - REVISED DATABASE ERD                                │
│                                    (58 models across 14 domains)                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          AUTHENTICATION & USERS                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  Agency ─1──*── User ─1──*── Contractor                                                                    
│                    │              │                                                       
│                    │              ├── ContractorRole                                                           
│                    │              ├── ContractorPortal (+sessionToken, ipAddress, userAgent)                  
│                    │              └── ContractorOnboardingStep (NEW)                                          
│                    │                                                                                          
│                    └── Client (+portalToken generation atomic)                                               
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          CLIENT FEEDBACK                                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  FeedbackBoard ─1──*── FeedbackItem ─1──*── FeedbackResponse                                                
│                    (+embedding used for semantic search)                                                     
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          BUSINESS OPERATIONS                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  BusinessPlan ─1──*── BusinessGoal (+relation to Plan) ─1──*── BusinessMilestone                            
│                                                                                                              │
│  Proposal ─1──*── ProposalModule (canonical: content field)                                                 │
│         └── ProposalTemplate ─1──*── TemplateModule                                                          │
│         └── ProposalVersion (NEW)                                                                            │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          PROJECT MANAGEMENT (NEW)                                            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  Project ─1──*── ProjectMember                                                                              
│         └──*── ProjectTask ─1──*── ProjectComment                                                            │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          TRAINING                                                            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  TrainingLesson (+requiresSlack) ─1──*── TrainingAssignment                                                 │
│                                         ├── TrainingStepProgress                                            │
│                                         ├── GitHubRepository                                                 │
│                                         ├── SlackConnection                                                 │
│                                         └── SOW ─1──*── SOWMilestone ─1──*── SOWDeliverable                
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          DELIVERABLES                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  Deliverable (+assignmentId) ─1──*── Milestone (+assignmentId) ─1──*── MilestoneDeliverable                
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          INVOICING & PAYMENTS (NEW)                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  Invoice ─1──*── InvoiceLineItem                                                                            │
│         └──*── Payment                                                                                      │
│                                                                                                              │
│  Expense                                                                                                    
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          COMMUNICATION (NEW)                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  ActivityFeed                                                                                               │
│  Comment (+entityType, entityId) ─1──*── Mention                                                            
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          DOCUMENTS (Markdown)                                                │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  Document ─1──*── DocumentVersion ─*── DocumentTag                                                          │
│         └──*── DocumentPermission                                                                            │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          FILE MANAGEMENT (NEW)                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  File ─1──*── FileVersion                                                                                   │
│        └──*── FileShare                                                                                     │
│                                                                                                              │
│  MediaLibrary                                                                                               │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          ANALYTICS (NEW)                                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  AnalyticsEvent                                                                                             │
│  Report                                                                                                      │
│  KPI ─1──*── KPISnapshot                                                                                    │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          EMAIL & NOTIFICATIONS (NEW)                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  EmailLog                                                                                                    │
│  NotificationPreference                                                                                     │
│  EmailTemplate                                                                                              │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          CALENDAR (NEW)                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  CalendarEvent ─1──*── EventAttendee                                                                        │
│  Deadline                                                                                                    │
│  Availability                                                                                                │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          INTEGRATIONS                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  ProjectSyncConfig                                                                                          │
│  AuditLog (+agencyId)                                                                                        │
│  Notification (+agencyId)                                                                                    │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Revised Statistics

| Domain | Models | Change | New Models |
|--------|--------|--------|-----------|
| Auth & Users | 7 | +1 | ContractorOnboardingStep |
| Client Feedback | 3 | 0 | — |
| Business Operations | 6 | +1 | ProposalVersion |
| Project Management | 4 | +4 | Project, ProjectMember, ProjectTask, ProjectComment |
| Training | 6 | 0 | — |
| Deliverables | 3 | 0 | — |
| Invoicing & Payments | 4 | +4 | Invoice, InvoiceLineItem, Payment, Expense |
| Communication | 3 | +3 | ActivityFeed, Comment, Mention |
| Documents | 4 | 0 | — |
| File Management | 3 | +3 | File, FileVersion, FileShare, MediaLibrary |
| Analytics | 4 | +4 | AnalyticsEvent, Report, KPI, KPISnapshot |
| Email & Notifications | 3 | +3 | EmailLog, NotificationPreference, EmailTemplate |
| Calendar | 3 | +3 | CalendarEvent, EventAttendee, Deadline, Availability |
| Integrations | 3 | 0 | — |
| **Total** | **58** | **+28** | |

### Changes to Existing Models

| Model | Field | Change | Reason |
|-------|-------|--------|--------|
| `Client` | `portalToken` | Generate atomically with creation | Fix #1 |
| `ProposalModule` | `data` | Rename → `rawJson` or remove | Fix #2 |
| `ProposalModule` | `content` | Make canonical | Fix #2 |
| `Proposal` | `currentVersion` | Mark deprecated | Fix #13 |
| `FeedbackItem` | `embedding` | Generate real embedding | Fix #4 |
| `AuditLog` | `agencyId` | Add `String?` | Fix #5 |
| `Notification` | `agencyId` | Add `String?` | Fix #5 |
| `SOW` | `signedBy` | Set to `contractor.userId` | Fix #6 |
| `MilestoneDeliverable` | insert | Use `upsert` | Fix #7 |
| `Contractor` | `onboardingStep` | Add `ContractorOnboardingStep` | Fix #8 |
| `BusinessGoal` | `planId` | Add Prisma relation | Fix #9 |
| `Document` | `embedding` | Generate real embedding | Fix #10 |
| `NotificationBell` | polling | Add `lastCheckedAt` | Fix #11 |
| `ContractorPortal` | session | Add `sessionToken`, `ipAddress`, `userAgent` | Fix #14 |
| `TrainingLesson` | `requiresSlack` | Add `Boolean @default(false)` | Phase 3 |

---

## Migration Strategy

### Phase 1: Critical Fixes (Non-Breaking)

These changes are backward-compatible and can be deployed without downtime:

1. **Fix #1** — Generate portal token atomically in `createClientWithLogin()`
2. **Fix #4** — Call `generateEmbedding()` for FeedbackItem
3. **Fix #5** — Add `agencyId` to AuditLog and Notification
4. **Fix #6** — Set `SOW.signedBy` to `contractor.userId`
5. **Fix #7** — Use `upsert` for MilestoneDeliverable
6. **Fix #8** — Add ContractorOnboardingStep model
7. **Fix #9** — Add Prisma relation for BusinessGoal.planId
8. **Fix #10** — Generate real embedding for Document
9. **Fix #11** — Add `lastCheckedAt` to notification polling
10. **Fix #13** — Mark `Proposal.currentVersion` as deprecated
11. **Fix #14** — Add session tracking to ContractorPortal
12. **Phase 3** — Add `requiresSlack` to TrainingLesson

### Phase 2: Schema Changes (Breaking)

These changes require data migration and are deployed with a version bump:

1. **Fix #2** — Rename `ProposalModule.data` → `rawJson`
2. **Fix #3** — Add ProposalVersion model, migrate existing proposals
3. **Add Project Management** — 4 new models
4. **Add Invoicing & Payments** — 4 new models
5. **Add Communication** — 3 new models
6. **Add File Management** — 4 new models
7. **Add Analytics** — 4 new models
8. **Add Email & Notifications** — 3 new models
9. **Add Calendar** — 4 new models

### Phase 3: Performance Optimization

1. Add indexes on all foreign keys
2. Add composite indexes for common query patterns
3. Add full-text search indexes for embedding fields
4. Partition large tables (AuditLog, AnalyticsEvent) by date
5. Add materialized views for dashboard queries

### Migration Commands

```bash
# Phase 1: Critical fixes (non-breaking)
npx prisma migrate dev --name fix-critical-issues
npx prisma db push

# Phase 2: Schema changes (breaking)
npx prisma migrate dev --name add-project-management
npx prisma migrate dev --name add-invoicing
npx prisma migrate dev --name add-communication
npx prisma migrate dev --name add-file-management
npx prisma migrate dev --name add-analytics
npx prisma migrate dev --name add-email-notifications
npx prisma migrate dev --name add-calendar

# Phase 3: Performance
npx prisma migrate dev --name add-indexes
```

---

## Appendix: Complete Model List (58 Models)

### Existing Models (30)
1. Agency
2. User
3. Client
4. Contractor
5. ContractorRole
6. ContractorPortal
7. FeedbackBoard
8. FeedbackItem
9. FeedbackResponse
10. BusinessPlan
11. BusinessGoal
12. BusinessMilestone
13. ProposalTemplate
14. TemplateModule
15. Proposal
16. ProposalModule
17. TrainingLesson
18. TrainingAssignment
19. TrainingStepProgress
20. GitHubRepository
21. SlackConnection
22. SOW
23. SOWMilestone
24. SOWDeliverable
25. Deliverable
26. Milestone
27. MilestoneDeliverable
28. Document
29. DocumentVersion
30. DocumentTag
31. DocumentPermission
32. ProjectSyncConfig
33. AuditLog
34. Notification

### New Models (28)
35. ContractorOnboardingStep
36. ProposalVersion
37. Project
38. ProjectMember
39. ProjectTask
40. ProjectComment
41. Invoice
42. InvoiceLineItem
43. Payment
44. Expense
45. ActivityFeed
46. Comment
47. Mention
48. File
49. FileVersion
50. FileShare
51. MediaLibrary
52. AnalyticsEvent
53. Report
54. KPI
55. KPISnapshot
56. EmailLog
57. NotificationPreference
58. EmailTemplate
59. CalendarEvent
60. EventAttendee
61. Deadline
62. Availability
