# 10 — Onboarding and Quality Control Playbook

**Purpose:** Turn an approved, contracted creative into a ready, reliable contributor — and keep delivery quality consistent across all four verticals.
**Status:** `PROPOSED` operating standard.

---

## Part I — Onboarding

### 1. Onboarding objective

A new contractor should be **ready to accept work within 10 business days of contract activation**, with documents verified, training complete, integrations connected, and a named human contact.

`CONFIRMED` building blocks already exist:

- Role lessons are auto-assigned on role approval (`src/app/api/contractors/[id]/roles/[roleId]/route.ts:8-26,58-60`).
- `contractor-onboarding` is auto-assigned when a login is provisioned (`src/app/api/contractors/[id]/login/route.ts:85-114`).
- Readiness is computed from lesson completion and required integrations (`src/lib/role-training-config.ts:104-146`).
- The workforce dashboard exposes readiness (`src/app/api/admin/workforce/route.ts:25-136`).

`CONFIRMED` gap: there is no onboarding deadline, reminder, escalation, or named buddy in the data model.

---

### 2. Pre-boarding (before day one)

| # | Task | Owner | Due | Evidence |
|---|---|---|---|---|
| 1 | Contract fully signed | Ops | Before start | `AssembledContract.status = active`, signatures |
| 2 | Contractor record created/linked | Ops | Before start | `Contractor.id` |
| 3 | Role approved | Principal | Before start | `ContractorRole.status = approved` |
| 4 | Tax form collected | Ops | Before start | `taxFormType`, `taxFormUrl` |
| 5 | Insurance/licensing verified | Ops | Before start | `insuranceProofUrl`, `licensingProofUrl` |
| 6 | Drive folder created | Ops | Before start | `googleDriveFolderId` |
| 7 | Login provisioned | Admin | 2 days before | `Contractor.userId` |
| 8 | Lessons assigned | System | On role approval | `TrainingAssignment` rows |
| 9 | Buddy assigned | Ops | Before start | Recorded in onboarding note |
| 10 | Welcome pack sent | Ops | 1 day before | Email record |

### 3. Welcome pack contents

1. **Welcome note:** who we are, what we value, who to ask for help.
2. **First-week plan:** day-by-day expectations.
3. **Tools:** where work lives (Drive), how assignments arrive (platform), how feedback is given.
4. **Training:** links to assigned lessons and the expected completion date.
5. **Documents:** what is still missing and the secure upload link.
6. **Communication:** response-time expectations, escalation path, working hours.
7. **Payment:** invoice process and payment schedule (no new terms).
8. **Policies:** confidentiality, portfolio use, AI use, data handling.

### 4. First-week plan

| Day | Focus | Output |
|---|---|---|
| 1 | Welcome, accounts, Drive access, policies | Access confirmed |
| 2 | Brand and client context; review 2 past projects | Notes/questions |
| 3 | Tooling and workflow walkthrough | Can submit a test deliverable |
| 4 | Shadow a live review or edit | Observation notes |
| 5 | Small paid or supervised task | Feedback and readiness check |

**Rule:** no unsupervised client-facing work until readiness is `ready` and the first task has been reviewed.

### 5. Readiness definition

A contractor is `ready` only when **all** are true:

- [ ] All role lessons assigned.
- [ ] All lessons completed (`TrainingAssignment.status = completed`).
- [ ] Required integrations verified (`github` and/or `slack` per role config).
- [ ] Required documents verified and unexpired.
- [ ] Contract active.
- [ ] Buddy and escalation path confirmed.
- [ ] First-week plan completed or explicitly waived by the Principal.

`computeReadiness` already implements the lesson + integration portion (`src/lib/role-training-config.ts:104-146`). The document and contract checks must be added to the readiness gate; today they are separate.

### 6. Onboarding reminders

| When | Message | Owner |
|---|---|---|
| Contract active | Welcome pack + checklist | Ops |
| Day 2 | Access check | Ops |
| Day 5 | First-week check-in | Buddy |
| 50% training | Encouragement + blocker question | Ops |
| 80% training | Remaining lessons + deadline | Ops |
| 100% training | Readiness confirmation | Ops |
| Overdue 3 days | Escalation | Principal |
| Day 30 | 30-day check-in | Ops |

### 7. Onboarding failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Login never used | No session after 3 days | Resend credentials; call |
| Training stalled | No progress for 5 days | Ask what is blocking; reassign |
| Missing document | Checklist incomplete at day 5 | Secure upload link; escalate |
| Integration failure | GitHub/Slack error | Manual verification path |
| Buddy unavailable | No check-in | Reassign buddy |
| Role mismatch discovered | First task quality poor | Pause; re-review role fit |

---

## Part II — Quality control

### 8. QC principles

1. **QC is a checklist, not a taste test.** Every rejection cites a criterion.
2. **Technical QC comes before creative QC.** A broken file is not a creative disagreement.
3. **One consolidated change request.** No drip-feeding feedback.
4. **Revision limits are contractual.** Enforce the SOW/addendum count.
5. **Final approval is admin-only.** Enforced by the lifecycle (`src/lib/deliverable-lifecycle.ts:76,80`).

### 9. Submission gate

A deliverable can move to `pending-approval` only if:

- [ ] A submission URL or attachment exists (`hasSubmissionAssets`, `src/lib/deliverable-lifecycle.ts:63`).
- [ ] The file opens and matches the requested format.
- [ ] The file naming convention is followed.
- [ ] The correct version is marked final.
- [ ] Required companion files are present (source, captions, exports).

If any fails, return a **technical rejection** with the specific issue; do not start creative review.

### 10. Photography QC checklist

**Technical**

- [ ] Resolution meets the brief (print vs web).
- [ ] Color profile correct (sRGB/Adobe RGB as specified).
- [ ] No unintentional crops, dust, or artifacts.
- [ ] Consistent white balance across the set.
- [ ] Files named per convention.

**Creative**

- [ ] Composition matches the approved shot list.
- [ ] Lighting matches the brief.
- [ ] Retouching is consistent and natural.
- [ ] Brand/product details are accurate.
- [ ] Required images delivered in the required count.

**Legal/rights**

- [ ] Model/property releases present where required.
- [ ] Usage/licensing matches the SOW.
- [ ] No visible third-party trademarks without clearance.

### 11. Videography QC checklist

**Technical**

- [ ] Resolution/frame rate match the brief.
- [ ] Audio levels consistent; no clipping or dropouts.
- [ ] Color grade consistent across scenes.
- [ ] Captions/subtitles accurate and synced.
- [ ] Exports available in required aspect ratios.

**Creative**

- [ ] Story/arc matches the approved treatment.
- [ ] Runtime within the brief.
- [ ] B-roll and graphics support the story.
- [ ] Brand assets correct.
- [ ] Music and sound design licensed.

**Legal/rights**

- [ ] Releases for on-camera talent.
- [ ] Music license covers the intended use.
- [ ] Drone footage covered by a valid license.
- [ ] Client confidentiality respected in selects.

### 12. Content & Social QC checklist

**Technical**

- [ ] Correct dimensions and aspect ratios per platform.
- [ ] Captions and alt text present.
- [ ] Links tested.
- [ ] Scheduling metadata correct.

**Creative**

- [ ] Voice matches the brand.
- [ ] Hook is clear in the first line/frame.
- [ ] CTA is present and correct.
- [ ] Visual system matches the approved grid.
- [ ] Hashtags/mentions are accurate.

**Brand safety**

- [ ] No unverified claims.
- [ ] No sensitive or political misstep.
- [ ] Competitor mentions handled correctly.
- [ ] Approval workflow followed (pre-approval if required by addendum).

### 13. Design & Creative QC checklist

**Technical**

- [ ] Source files included and organized.
- [ ] Layers named; links embedded.
- [ ] Fonts outlined or licensed.
- [ ] Print specs correct (bleed, CMYK, resolution).
- [ ] Export formats match the brief.

**Creative**

- [ ] Concept matches the approved direction.
- [ ] Typography hierarchy is clear.
- [ ] Grid and spacing are consistent.
- [ ] Brand guidelines followed.
- [ ] Accessibility checked (contrast, alt text, reading order).

**Legal/rights**

- [ ] Image/font licenses cover the use.
- [ ] No unlicensed stock.
- [ ] Trademark usage approved.

### 14. Change request format

```
DELIVERABLE: [name]   VERSION: [n]
REVIEWER: [name]      DATE: [YYYY-MM-DD]

RESULT: [ ] Approved   [ ] Changes required   [ ] Technical rejection

REASON CODE: [TECH_FORMAT | TECH_QUALITY | BRIEF_MISMATCH | BRAND |
              LEGAL | ACCESSIBILITY | SCOPE | OTHER_HUMAN]

ITEM 1
- Location: [timestamp / page / file]
- Issue: [specific, observable]
- Required change: [specific]
- Priority: [must-fix | should-fix]

ITEM 2
...

REVISION DUE: [date]
REVISIONS USED: [n] of [limit]
```

**Rules:**

- One change request per review round.
- No new scope in a revision request.
- If the request exceeds the SOW revision limit, escalate to the Principal for a change order.

### 15. Revision and escalation ladder

| Situation | Action |
|---|---|
| First revision | Normal; log reason code |
| Second revision | Reviewer confirms the brief was clear |
| Third revision (beyond SOW) | Principal approves a change order or stops work |
| Repeated same issue | Reviewer and talent hold a live call |
| Talent disagrees | Reviewer documents; Principal decides |
| Client changes direction | New brief or change order; do not absorb silently |
| Quality failure | Performance record; possible removal from assignment |

### 16. Final approval checklist (admin)

- [ ] Client accepted, or changes resolved.
- [ ] QC checklist passed.
- [ ] Legal/rights verified.
- [ ] Revision count within SOW.
- [ ] Files archived in the correct Drive folder.
- [ ] Performance scorecard created.
- [ ] Invoice trigger confirmed.
- [ ] Deliverable moved to `approved`, then `closed` (`src/lib/deliverable-lifecycle.ts:76,80`).

### 17. Performance scorecard

| Dimension | Weight | Source |
|---|---|---|
| Quality | 30% | First-pass approval, revision count |
| Timeliness | 25% | Due date vs submission |
| Communication | 20% | Responsiveness, clarity, escalation behavior |
| Compliance | 15% | Documents, rights, brand safety |
| Client satisfaction | 10% | Recorded client feedback |

Score 1–5 per dimension. Record evidence. If fewer than 3 data points, mark `insufficient_data`.

### 18. Offboarding checklist

| # | Task | Owner | Evidence |
|---|---|---|---|
| 1 | Confirm reason and effective date | Principal | Decision record |
| 2 | Close or reassign active work | Ops | Deliverable records |
| 3 | Revoke platform login | Admin | User disabled |
| 4 | Revoke Drive access | Admin | Folder permissions |
| 5 | Collect/archive assets | Ops | Drive archive |
| 6 | Confirm final invoice/payment | Finance | Invoice record |
| 7 | Record performance | Ops | Scorecard |
| 8 | Set bench/alumni status | Ops | Talent status |
| 9 | Send exit note | Ops | Email record |
| 10 | Update access review | Security | Audit log |

**Rule:** no offboarded contractor may retain an active assignment or Drive access. This must be verified, not assumed.

---

## 19. QC metrics

| Metric | Target |
|---|---|
| Technical rejection rate | < 10% of submissions |
| First-pass approval rate | ≥ 70% |
| Average revision rounds | ≤ 1.5 |
| Review turnaround | ≤ 2 business days |
| Final approval within 3 days of client acceptance | ≥ 95% |
| Offboarding completed within 5 business days | 100% |
| Post-offboarding access incidents | 0 |

---

## 20. Quick reference

| Stage | Gate | Owner |
|---|---|---|
| Contract signed | All signatures | Ops |
| Onboarding | Documents + welcome pack | Ops |
| Ready | Training 100% + integrations + docs | Ops |
| Assignment | Availability + conflict + rate | Principal |
| Submission | Technical gate | Talent |
| QC | Checklist | Reviewer |
| Client accept | Client | Client |
| Final approve | Admin checklist | Admin |
| Close | Performance + invoice | Ops |
| Offboard | Access + assets + status | Ops |
