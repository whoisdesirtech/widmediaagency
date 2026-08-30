# Deliverable Workflow — Brain Dump

Internal product-thinking companion to `docs/features/DELIVERABLE_ACCEPTANCE_WORKFLOW.md`.
Informal by design; captures *why*, not just *what*.

---

## 1. The original problem

A client portal dashboard displayed a hardcoded **"Homepage Hero Image / Website Redesign"** approval card
with dead buttons. It was static JSX in `src/app/client/dashboard/page.tsx`. It looked real, did nothing,
and — worst of all — it *modeled a workflow the product didn't have*.

That's the deeper problem: the fake card wasn't just fake data. It encoded a belief that
"an approval is one button press by one person." The real agency business has three separate decisions.

## 2. What the fake dashboard implementation actually was

- A `<span>Homepage Hero Image</span>` and `<span>Website Redesign</span>` rendered literally in JSX.
- Two `<button>`s (`Approve`, `Request Changes`) **with no onClick handler at all**.
- A "Pending Approvals" stat that used `…filter(p => p.status === 'review').length || 2` — a fake `|| 2` fallback that guaranteed a nonzero, meaningless number even with an empty database.
- A "Messages" stat hardcoded to `4`.

The number "homepage hero image" itself was probably copied from a placeholder suggestion ("e.g. Homepage Hero Image"
is literally the placeholder text in `src/app/clients/[id]/deliverables/page.tsx:208`).

## 3. Why the fake UI was removed

- It conditionally displayed a decision that didn't exist for that actor (client "Approve").
- Its buttons did nothing, so it was dishonest UI.
- It showed fixed numbers when the DB was empty — the antithesis of "the dashboard reflects real workflow state."
- Hard refresh of browser cache was legitimately confusing: the client's "test messages" were old MOCK data
  cached from before the messages page was wired to real APIs.

The replacement (already shipped, to be preserved): the dashboard Approvals card now calls `/api/deliverables`,
filters `pending-approval`, shows a working **Request Changes** PATCH, and renders a proper empty state.
The `|| 2` fallback and the static `4` are gone. This work is correct and future-cleaning must not regress it.

## 4. Why the existing workflow was too simplified

The real pipeline today (in code):

```
deliverable created (status='pending', contractor assigned optionally)
  → contractor: Start (in-progress) → Submit (pending-approval) [+ URL/attachments]
  → client: Request Changes only (→ changes-requested)
  → admin: Approve (→ approved), Request Changes, or Reject (→ rejected)
```

Evidence, not inference:
- `src/app/api/deliverables/route.ts` — create with default `status:'pending'`, no assignment consent.
- `src/app/api/deliverables/[id]/route.ts`
  - contractor branch: allowed statuses `['draft','in-progress','pending-approval']` (no accept/decline).
  - client branch: ONLY `changes-requested` from `pending-approval` (no accept — agency built the client as "reviewer who can bounce it back, never sign off").
  - admin branch: **no transition validation at all**; sets whatever status string comes in. `approved` sets `approvedAt`.
- Portal UIs (admin/contractor/client) each render their own `STATUS_CONFIG`; there is no `assigned`/`accepted`/`declined`/`closed`.

So "approved" today really means **admin-approved**, and it doubles as client acceptance and closure.
Three decisions collapse into one button owned by one role.

## 5. The real agency workflow

```
client approves proposal
  → admin confirms delivery needs with client
  → admin creates deliverables
  → admin assigns contractor
  → contractor accepts OR declines
  → contractor does work
  → contractor submits for CLIENT review
  → client accepts OR client requests changes
      → (revision loop) contractor revises and resubmits
  → once client accepts: admin performs FINAL operational approval
  → deliverable CLOSED for all parties
```

## 6. Why contractor acceptance, client acceptance, and admin final approval are different events

| Event | Decides | Fail to model → |
| --- | --- | --- |
| Contractor acceptance | "Do I own this assignment?" | Work silently stalls; no accountability |
| Client acceptance | "Does this satisfy the agreement?" | "Approved" is claimed without the client ever agreeing |
| Admin final approval | "Has the agency QA'd and can close?" | Agency sign-off conflated with client sign-off |

They have different actors, different questions, different preconditions, and likely different legal/process weight.
Collapsing them makes the platform untruthful about who agreed to what — the exact sin of the fake card.

## 7. Architecture decision in plain words

Don't rebuild. Three moves:

1. **One status string, extended** — `status` is already a plain `String` column (not a DB enum), so adding
   `assigned / accepted / declined / client-accepted / closed / cancelled` is purely code-level. No destructive migration.
2. **Timestamps per decision on the row** — `assignedAt`, `contractorAcceptedAt`, `contractorDeclinedAt`,
   `clientAcceptedAt`, `finalApprovedAt`, `closedAt`, plus `revisionCount`. Cheap and queryable.
3. **Audit everything through the existing `AuditLog`** — add `fromStatus/toStatus/reason` to `metadata`.
   Generic journal already exists (`logAudit`, best-effort). A dedicated `DeliverableEvent` table is a
   possible future promotion if a UI history timeline or metrics demand lower-latency querying — not needed now.

## 8. Open questions (product decisions needed)

- **Legacy `rejected` status** — do we keep "admin rejects" as a hard-stop, or fold it into `cancelled` with a reason? (`rejected` currently exists in admin + contractor UI; client UI lacks it entirely.)
- **`approved` key vs `final-approved`** — keep `approved` as the key and add `finalApprovedAt` field (my recommendation: least churn, UI label "Final Approval"), or rename everywhere?
- **Staff vs admin for final approval** — should staff really do final QA sign-off, or is that admin-only?
- **Where does "client approves proposal" live?** — this is a pre-deliverable gate (proposal/doc status), not part of the deliverable model today. Out of scope for this feature; decision deferred.
- **Default status on creation** — today `pending`. With `assigned` existing, should creation + assignment be one action (status `assigned`) or two (unassigned `draft` → `assigned`)?
- **Reopen semantics** — never reopen in v1, or allow audited reopen for post-close operational issues?

## 9. Risks of building the UI before the workflow

- Every dashboard widget becomes a lie the moment the workflow it reflects doesn't exist (the fake card is proof).
- Contractors and clients learn wrong mental models (approve = done) that are hard to un-teach.
- Statuses diverge across the three portals (already happening: each portal has its own STATUS_CONFIG, and `rejected` is missing from the client config — a minor real bug).
- Rework cost: UI built against a collapsed model must be rebuilt when the model splits.

## 10. Lessons that keep repeating (applicable to every future WhoIsDésir feature)

- Fake UI and fake fallback counts are anti-patterns; an empty-but-real state beats a populated-but-false one.
- Mock data in the browser cache outlives the mock code — purge or version-shift mock pages before switching to real APIs.
- A `String` status column with per-portal `STATUS_CONFIG` maps is a maintenance trap; centralize the transition rules and label config once.
- Decisions should live on the data (timestamps), not in UI copy.
- Audit-first: if the change can't be explained by a log line (who, from, to, when, why), it wasn't built right.

---

### Labels

- **CONFIRMED CURRENT BEHAVIOR** — all `[CURRENT BEHAVIOR]` notes in the feature spec; statuses `draft|pending|in-progress|pending-approval|approved|changes-requested|rejected`; admin has unrestricted PATCH; client can only request changes; plain-string FKs on Deliverable; in-app notifications only; AuditLog does not store previous state; tests cover deliverables only via model-presence smoke test.
- **INTENDED PRODUCT DIRECTION** — the lifecycle in §5/§6 and the three-decision model.
- **OPEN QUESTIONS** — §8 above.
- **FUTURE IDEAS** — feature spec §13 (email/SLA/reminders/payment triggers/partial approvals/milestones/reopen/analytics/contractor metrics).