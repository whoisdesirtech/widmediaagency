# Deliverable Acceptance and Final Approval Workflow

Feature specification for the WhoIsDésir® Media agency platform.
Companion internal reasoning doc: `docs/brain-dumps/DELIVERABLE_WORKFLOW_BRAIN_DUMP.md`.

> Status: IMPLEMENTED (initial release) — lifecycle states, transition guards, decision timestamps,
> audit metadata, role-scoped portal actions, and notifications are live. Existing behavior is captured
> inline as `[CURRENT BEHAVIOR]` notes for historical context. Remaining open items are flagged in §13.

---

## 1. Business Problem

Deliverables inside an agency are produced by a chain of people — a contractor does the work, a client
owns the outcome, and the agency is responsible for the final product. Today the platform records only a
flattened status on a deliverable and lets a single actor (admin) stamp "Approved".

Operationally this creates:

- **Unclear ownership** — a deliverable can be created and assigned with no confirmation that the contractor actually agreed to do it.
- **Unclear completion state** — "Approved" is ambiguous: approved by whom? The client? The agency?
- **Scattered client feedback** — feedback lives in one `feedback` text field with a single timestamp; revision history is not preserved.
- **No contractor accountability** — there is no explicit accept/decline moment, so work can silently stall after assignment.
- **No final closure** — once "approved" a deliverable is frozen with a button, which conflates client acceptance with the agency's internal quality sign-off.

The goal is a structured, auditable lifecycle that separates the **three distinct decisions**:

| Decision | Question |
| --- | --- |
| A. Contractor acceptance | "Do you accept responsibility for this assignment?" |
| B. Client acceptance | "Does this deliverable satisfy what was agreed upon?" |
| C. Admin final approval | "Has the agency completed its operational and quality-control requirements and can this be formally closed?" |

## 2. Users

- **Admin / Staff (Project Manager)** — create deliverables, assign contractors, reassign on decline, perform final operational approval, close, cancel. Staff currently inherits all deliverable privileges from admin.
- **Contractor** — accept or decline an assignment, perform the work, submit for client review, revise and resubmit after changes are requested.
- **Client** — review a submitted deliverable, accept it, or request changes.
- *(Private / Developer Portal extender roles: manager, reviewer, developer, intern — see `src/lib/auth.ts`. Not part of initial deliverable scope.)*

## 3. Business Workflow

```text
CLIENT APPROVES PROPOSAL
        ↓
ADMIN MEETS WITH CLIENT / CONFIRMS DELIVERY NEEDS
        ↓
ADMIN CREATES ONE OR MORE DELIVERABLES
        ↓
ADMIN ASSIGNS CONTRACTOR
        ↓
CONTRACTOR ACCEPTS OR DECLINES ASSIGNMENT
        ↓
CONTRACTOR COMPLETES WORK
        ↓
CONTRACTOR SUBMITS DELIVERABLE FOR CLIENT REVIEW
        ↓
CLIENT ACCEPTS DELIVERABLE          — or —      CLIENT REQUESTS CHANGES
        ↓                                                     ↓
                                        CONTRACTOR REVISES AND RESUBMITS
        ↓                                                     ↓
                                            (loop until CLIENT ACCEPTS)
        ↓
ADMIN PERFORMS FINAL OPERATIONAL APPROVAL
        ↓
DELIVERABLE IS CLOSED FOR ALL PARTIES
```

## 4. State Machine

Recommended lifecycle (kebab-case keys match the existing string-status convention — see §7):

```text
                    ┌───────────────────────┐
                    ▼                       │
                 draft ───assign──▶ assigned
                                    │     │
                 (admin reassigns)──┘     │
                    accept                 │ decline
                    ▼                      ▼
                 accepted              declined ──reassign/adjust──▶ assigned
                    │                                        or
                    ▼                                        cancelled
                 in-progress ───────────────────────┐        │
                    │                               │        ▼
                    │  (revision loop)              │    cancelled
                    ▼                               ▼
                 pending-approval  ◀── revise/resubmit
                  (for client)          │
                    │                   │
     ┌──────────────┼──────────────┐    │
     ▼              ▼              │    │
  changes-requested  client-accepted│    │
     │   (client)      │           │    │
     └────────────────┘           │
                    │             │
                    ▼             │
                 approved  ◀──────┘
               (admin final)
                    ▼
                 closed  ──────────────────────────► (terminal)
```

### Happy path

`draft → assigned → accepted → in-progress → pending-approval → client-accepted → approved → closed`

### Revision path

`pending-approval → changes-requested → in-progress → pending-approval …` (repeat until `client-accepted`); a `revisionCount` counter is incremented each time.

### Assignment exception

`assigned → declined → assigned (reassign to different contractor) | cancelled`

[ CURRENT BEHAVIOR ] Existing statuses are `draft | pending | in-progress | pending-approval | approved | changes-requested | rejected`. There is no assigned/accepted/declined/closed state and no client-accept action. "Approved" is set by admin and serves as both client acceptance and agency sign-off collapsed into one.

## 5. Roles and Permissions

### Transition matrix (proposed)

| Current State | Action | Actor | Next State | Preconditions |
| --- | --- | --- | --- | --- |
| draft | Create | Admin/Staff | draft | clientId + name required |
| draft → assigned | Assign | Admin/Staff | assigned | Valid contractorId; sets `assignedAt` |
| assigned | Accept | Contractor | accepted | Authenticated as assigned contractor; sets `contractorAcceptedAt` |
| assigned | Decline | Contractor | declined | Authenticated as assigned contractor; optional reason; sets `contractorDeclinedAt` |
| declined | Reassign | Admin/Staff | assigned | Assign to a different contractor; audit records previous actor |
| declined (or assigned) | Cancel | Admin/Staff | cancelled | Recorded; terminal |
| accepted / in-progress (revision) | Start work | Contractor | in-progress | Assigned contractor only |
| in-progress | Submit | Contractor | pending-approval | Assigned contractor; requires `submittedUrl` OR ≥1 attachment; sets `submittedAt` |
| pending-approval | Accept | Client | client-accepted | Own client only; sets `clientAcceptedAt`; optional feedback |
| pending-approval | Request changes | Client | changes-requested | Own client only; feedback recommended; increments `revisionCount` |
| changes-requested | Revise | Contractor | in-progress | Assigned contractor only |
| client-accepted | Final approve | Admin/Staff | approved | Client acceptance already recorded; sets `finalApprovedAt` + `reviewedBy/At` |
| approved | Close | Admin/Staff | closed | Terminal; immutable thereafter (except documented reopen in future) |
| any (pre-client-acceptance) | Cancel | Admin/Staff | cancelled | Terminal |

### Guards (proposed)

- All guards are **server-side**; the UI hides actions but the API enforces them.
- Unauthorized requests: 403 for wrong role/ownership; 409/400 for illegal transition (return `{ error }`, log to audit).
- Actions are **irreversible by design** in the happy path (states only move forward); corrections happen via explicit transitions (reassign, reopen-in-future), never by free-form status edits.
- Every transition is recorded in `AuditLog` with `fromStatus → toStatus`, actor, timestamp, and optional reason.
- `rejected` (existing, admin-only) is de-emphasized: it becomes a hard reject → `cancelled` outcome. See §13 open question.

[ CURRENT BEHAVIOR ] Admin PATCH has **no transition validation** (any status string accepted). Contractor can freely set `draft | in-progress | pending-approval`. Client can only set `changes-requested` from `pending-approval`. There is no client-accept, no assignment consent, no closure.

## 6. Revision Workflow

- Client requests changes → `changes-requested` (feedback stored, `revisionCount++`).
- Contractor enters revision via the existing **Revise** button flow → `in-progress` → resubmit → `pending-approval`.
- Multiple rounds are supported by the loop; every round is persisted in `AuditLog` and increments `revisionCount`, so later "revision analytics" and "time-to-acceptance" become computable without new instrumentation.
- Linked `ProjectTask` behavior (auto advance/revert — existing, Phase 4E) is preserved and maps onto the new states: submit → task `in_review`; changes-requested → task `in_progress`; final approval → task `completed`.

## 7. Final Approval and Closure

The three decisions are deliberately not collapsed:

- **Contractor acceptance** — the contractor explicitly opts in (`contractorAcceptedAt`). If they decline, work cannot start.
- **Client acceptance** — the client explicitly opts in (`clientAcceptedAt`). This is a *business* acceptance, not an agency QA stamp.
- **Admin final approval** — the agency's operational/quality sign-off (`finalApprovedAt`); only reachable *after* client acceptance. This is what flips the linked task to completed and drives project progress.
- **Closure** — `closed` makes the deliverable terminal; it cannot silently regress. Reopening (e.g., post-close operational issue) is a documented, audited action for a future phase.

### State representation decision

**Recommendation: hybrid model.**

1. **One authoritative `status` String** continues to be the lifecycle state (matching the existing code-level enum pattern — `status` is a `String` column, not a DB enum, so adding members needs no destructive migration).
2. **Distinct decision timestamps on the row** (`assignedAt`, `contractorAcceptedAt`, `contractorDeclinedAt`, `clientAcceptedAt`, `finalApprovedAt`, `closedAt`, `revisionCount`) so the three decisions stay independently provable and queryable.
3. **Append-only history via the existing `AuditLog`** (extended `metadata` with `fromStatus`, `toStatus`, `reason`) rather than a new table — the generic journal already exists and backs the "auditable" positioning.

Why not:
- *Single enum only* — loses who/when for the three decisions and the ability to audit revision rounds.
- *Status + events table (full event sourcing)* — more machinery than the application needs today; the flat generic `AuditLog` suffices for the initial release and can be promoted to a dedicated `DeliverableEvent` table later if metrics demand it (see §13).

## 8. Data Requirements

[ CURRENT BEHAVIOR ] `Deliverable` (`prisma/schema.prisma:304`): `clientId` (true FK); `projectId/contractorId/sowId/taskId` are **plain string soft-links** (no relations — deleting a project/contractor does NOT cascade); fields include `dueDate String?`, `submittedUrl`, `submittedAt`, `attachments JSON string`, `feedback`, `reviewedBy`, `reviewedAt`, `approvedAt`.

### Proposed additive changes (all non-destructive)

| Field | Type | Purpose |
| --- | --- | --- |
| `assignedAt` | `DateTime?` | When assigned |
| `contractorAcceptedAt` | `DateTime?` | Decision A |
| `contractorDeclinedAt` | `DateTime?` | Decline record |
| `clientAcceptedAt` | `DateTime?` | Decision B |
| `finalApprovedAt` | `DateTime?` | Decision C (admin) — distinct from legacy `approvedAt` |
| `closedAt` | `DateTime?` | Closure |
| `revisionCount` | `Int @default(0)` | Revision rounds |
| `declineReason` | `String?` | Contractor decline reason |
| `closedBy` | `String?` | User id of closure actor |

Legacy `approvedAt` is retained for backward compatibility (existing rows) and is set alongside `finalApprovedAt` for continuity.

## 9. Audit Requirements

[ CURRENT BEHAVIOR ] `AuditLog` (`schema.prisma:444`) — `userId, userEmail, role, action, method, path, entity, entityId, ip, metadata (JSON string), createdAt`. `logAudit()` (best-effort, never blocks). Deliverable handlers already log: `deliverable.create`, `deliverable.submit`, `deliverable.requestChanges`, `deliverable.update`, `deliverable.delete`. It does **not** record previous state.

### Proposed

- Every transition writes `metadata: { fromStatus, toStatus, reason }`.
- Action names keyed to the decision: `deliverable.assign`, `deliverable.acceptAssignment`, `deliverable.declineAssignment`, `deliverable.submit`, `deliverable.requestChanges`, `deliverable.clientAccept`, `deliverable.finalApprove`, `deliverable.close`, `deliverable.cancel`.
- The contractor branch stops using the generic `deliverable.submit` action for in-progress nudges (use `deliverable.statusChange`).
- Consider a future `DeliverableEvent` table if UI history-timeline / metrics require queryability beyond AuditLog (IMPORTANT NEXT).

## 10. Notifications

[ CURRENT BEHAVIOR ] In-app notifications only (no email/SMS delivery). Helpers in `src/lib/notifications.ts` (`createNotification`, `createNotificationForUsers`, `getUnreadCount`). Existing deliverable notifications: submit → client + admins; changes-requested → contractor + admins; approved/rejected → contractor; project-complete → admin actor.

### Proposed (initial release)

| Event | Receivers |
| --- | --- |
| Assignment | Assigned contractor |
| Contractor accepted / declined | Admin(s) |
| Submitted for client review | Client |
| Client accepted | Admin(s) + contractor |
| Final approved / closed | Client + contractor |
| Changes requested | Contractor (+ admin) |

### Future (not implemented claims)

Automated reminders, email delivery, SLA/escalation nudges — see §13.

## 11. Edge Cases

Classification legend: **[M]** MUST HAVE (initial release) · **[I]** IMPORTANT NEXT · **[F]** FUTURE · **[NA]** NOT APPLICABLE

| Edge case | Class | Handling |
| --- | --- | --- |
| Contractor declines assignment | M | `declined` state; admin may reassign or cancel; audit reason |
| Contractor accepts but later cannot complete | I | Admin reassign (with audit); task/deliverable preserved |
| Admin reassigns contractor | I | `assigned` re-entry + `deliverable.assign` audit; only before submission |
| Client requests changes multiple times | M | Loop is inherent; `revisionCount` |
| Client tries to review an unsubmitted item | M | Guard: client actions valid only from `pending-approval` |
| Contractor submits after cancellation | M | Guard: contractor actions invalid from `cancelled`/`closed` |
| Admin final-approval before client acceptance | M | Guard: only from `client-accepted` |
| Client acceptance, then discovered operational issue | I | Documented reopen (admin) → `in-progress`, audited |
| Closed deliverable needs reopening | F | Reopen workflow (scope future) |
| Contractor reassigned during revision | I | Block reassign once work started unless cancelled first |
| Multiple files/assets per deliverable | M | Already supported (`attachments` JSON) — require ≥1 on submit |
| Multiple deliverables in one project | M | Already supported (`projectId`) — each has independent lifecycle |
| Deliverable cancellation | M | `cancelled` terminal state |
| Missing required submission assets | M | Submit guard requires `submittedUrl` or ≥1 attachment |
| Duplicate client review actions | M | Precondition guards make double-submit a no-op (same-state transition rejected) |
| Concurrent status updates | M | Fetch-existing-then-transition per request; no transition both ways allowed |

## 12. Initial Release Scope

**In scope:** lifecycle states (`draft, assigned, accepted, declined, in-progress, pending-approval, changes-requested, client-accepted, approved, closed, cancelled`), transition guards + transition matrix, three decision timestamps + revision counter, audit metadata on every transition, role-scoped UI actions (admin assign/reassign/cancel/final-approve/close; contractor accept/decline/start/submit/revise; client accept/request-changes), notifications for the events in §10, standard empty states.

**Out of scope (initial release):** email delivery, SLA/reminders, payment triggers, partial approvals, milestone breakdown, reopen after close, revision analytics, contractor performance metrics.

## 13. Future Expansion

Ideas only — not implemented, not claimed:

- Automated reminders and escalation on timeout (e.g., "in client review > X days")
- SLA tracking per deliverable/contractor
- Contractor payment triggers on final approval/closure (invoice linkage)
- Partial approvals (approve per asset/file)
- Milestone deliverables inside projects
- Reopen workflow after closure (with immutable audit trail)
- Revision analytics (avg rounds, time-to-acceptance)
- Contractor performance metrics (on-time closure, acceptance rate)
- Dedicated `DeliverableEvent` table + UI history timeline
- Post-close operational-issue reopen (wire to a QA flow)

Open product questions (see brain dump §4): use of legacy `rejected` status; whether `approved` should be renamed to `final-approved` (vs keeping `approved` + `finalApprovedAt`); whether staff truly equals admin for final approval; where "client accepts proposal" (pre-deliverable) lives.

## 14. GTM / Product Positioning

**Positioning direction**

> The platform replaces scattered emails, text messages, verbal approvals, and disconnected shared folders with a structured, auditable workflow for deliverables involving the agency, contractors, and clients.

### Problems solved

**For agencies**
- Clear ownership and completion status at every step
- Centralized client feedback with revision history
- Visibility into contractor workload and acceptance behavior
- A single auditable record of final closure

**For contractors**
- Clearer, explicit assignments (accept/decline)
- Centralized requirements and submission channel
- Structured revision feedback
- Visibility into acceptance and closure

**For clients**
- A structured review surface (accept or request changes)
- Visibility into deliverable progress
- Confidence that approval is separated from the agency's internal sign-off

### Feature hypothesis

> If assignment consent, client acceptance, and admin final approval are modeled as three explicit lifecycle events, then no deliverable will close without (1) an accepted contractor, (2) an accepted client, and (3) an agency QA sign-off — eliminating ambiguous "approved" outcomes and reducing rework loops by measurable time.

### Potential metrics

| Metric | Capability |
| --- | --- |
| Deliverables created / accepted / closed | EXISTING METRICS CAPABILITY (countable from data after this feature) |
| Assignment acceptance rate, decline rate | EXISTING METRICS CAPABILITY |
| Assignment → acceptance time | EXISTING METRICS CAPABILITY |
| Time to first submission | EXISTING METRICS CAPABILITY |
| Client acceptance rate | EXISTING METRICS CAPABILITY |
| Revision count / time in client review | EXISTING METRICS CAPABILITY |
| Time from client acceptance to closure | EXISTING METRICS CAPABILITY |
| On-time closure rate | EXISTING METRICS CAPABILITY |
| Automated dashboards / scheduled reporting of the above | PROPOSED FUTURE METRICS (no analytics infra exists today) |
| SLA adherence / escalation alerts | PROPOSED FUTURE METRICS |

> No analytics infrastructure currently exists in the repository. "EXISTING METRICS CAPABILITY" above means the fields needed to compute a metric will exist in the data model after this feature — not that a metrics UI exists.