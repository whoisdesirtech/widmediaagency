# 04 — Talent Journey and SLA Map

**Purpose:** Give every stage an owner, a system state, a deadline, and an escalation. This is the operational map the assistant works from daily.

---

## 1. Journey overview

```
DISCOVER → APPLY → ACKNOWLEDGE → TRIAGE → REVIEW → INTERVIEW
   → VERIFY → DECIDE → CONTRACT → ONBOARD → TRAIN → READY
   → STAFF → ACCEPT → DELIVER → QA → CLIENT ACCEPT → FINAL APPROVE
   → PAY → REVIEW → RETAIN / BENCH / OFFBOARD
```

Two journeys run in parallel:

- **Candidate journey:** what the talent experiences.
- **Operations journey:** what the agency must do to keep the promise.

---

## 2. Candidate journey

| # | Stage | Candidate sees | Candidate action | Agency promise | System state (`PROPOSED` unless noted) |
|---|---|---|---|---|---|
| 1 | Discover | Role page / referral / social post | Reads role and expectations | Clear scope, rate range, and timeline | `published_role` |
| 2 | Apply | Application form | Submits profile, links, samples, availability, consent | Acknowledgment within minutes | `applicant.received` |
| 3 | Acknowledge | Email with reference ID | None | First human review within 2 business days | `applicant.acknowledged` |
| 4 | Triage | None (internal) | None | No ghosting; status visible on request | `applicant.triage_passed` / `triage_hold` |
| 5 | Review | Optional: request for accessible samples | Provides missing evidence | Decision within 7 business days of complete application | `applicant.reviewed` |
| 6 | Interview | Calendar invite + prep note | Selects slot, attends | Interviewer prepared; feedback recorded | `applicant.interview_scheduled` |
| 7 | Verify | Secure document request | Uploads documents; provides references | Documents handled confidentially | `applicant.verification` |
| 8 | Decision | Advance / hold / decline email | Responds if advancing | Respectful, specific, timely | `applicant.decided` |
| 9 | Contract | SOW + contract for signature | Reviews and signs | Clear terms, no surprise clauses | `contract.pending_signatures` |
| 10 | Onboard | Welcome pack + checklist | Completes documents and training | Named buddy; first-week plan | `contractor.onboarding` |
| 11 | Train | Lessons and progress | Completes lessons/integrations | Readiness confirmed within 10 business days | `contractor.training` |
| 12 | Staff | Assignment offer | Accepts or declines | No offer without a confirmed slot | `deliverable.assigned` |
| 13 | Deliver | Brief, deadline, feedback | Works and submits | Review within 2 business days | `deliverable.pending-approval` |
| 14 | Revise | Change request | Revises within SOW rounds | Specific, consolidated feedback | `deliverable.changes-requested` |
| 15 | Complete | Approval + payment info | Submits invoice if applicable | Payment per SOW | `deliverable.closed` |
| 16 | Review | Feedback request | Optional | Honest, useful feedback | `performance.recorded` |
| 17 | Retain/Bench | Future opportunity or exit note | Optional | Clear status; no ambiguity | `talent.active` / `bench` / `offboarded` |

### 2.1 Demand-side journey (project opportunity)

| # | Stage | Who acts | System state (`PROPOSED`) | Gate |
|---|---|---|---|---|
| 1 | Discover | Ops Lead / referral / inbound | `opportunity.unverified` | Source captured |
| 2 | Verify | Ops Lead | `opportunity.unverified` → `qualify` | Buyer identity and authority |
| 3 | Qualify | Ops Lead | `qualify` → `pursue` / `hold` / `decline` | Budget signal + written scope |
| 4 | Extract requirements | Ops Lead | `requirements.confirmed` | Every field sourced or marked missing |
| 5 | Match | System + Ops Lead | `shortlist.ready` | Eligibility filters pass |
| 6 | Select | Admin | `staffing.selected` | Rate and availability confirmed |
| 7 | Offer | Admin | `assignment.offered` | Contract path opened |
| 8 | Project | Delivery team | `project.active` | SOW signed |

**Hard rule:** no talent is contacted, and no availability is held, before stage 4 is confirmed and stage 5 is human-reviewed.


---

## 3. Operations journey (queues)

| Queue | Items | Owner | SLA | Escalation |
|---|---|---|---|---|
| Q1 New applications | Unacknowledged or unassigned applications | Ops Lead | 2 business days | Principal at 3 days |
| Q2 Triage holds | Missing evidence or eligibility questions | Ops Lead | 3 business days | Principal at 5 days |
| Q3 Portfolio review | Assigned reviews | Vertical reviewer | 3 business days | Vertical lead at 4 days |
| Q4 Interview scheduling | Awaiting slot or scorecard | Ops Lead | 2 business days to slot; scorecard 24h after | Principal at 5 days |
| Q5 Verification | Missing/expired documents, references | Ops Lead | 5 business days | Principal at 7 days |
| Q6 Decision | Packet ready, awaiting human | Principal | 5 business days | Owner at 6 days |
| Q7 Contract | Draft SOW, assembly, signatures | Ops Lead | 2 business days assembly; 5 days signatures | Principal at 6 days |
| Q8 Onboarding | Documents, training, readiness | Ops Lead | 10 business days | Principal at 12 days |
| Q9 Staffing | Shortlist and assignment | Ops Lead | Same day for shortlist | Principal at 1 day |
| Q10 Delivery risk | Due soon, overdue, blocked | Ops Lead | T-24h warning | Principal at T-0 |
| Q11 QA/revision | Awaiting review or revision | Reviewer | 2 business days | Vertical lead at 3 days |
| Q12 Payment | Invoice due/overdue | Finance | 3 business days | Principal at 5 days overdue |
| Q13 Performance | Project close without score | Ops Lead | 5 business days after close | Principal at 7 days |
| Q14 Offboarding | Access, assets, bench status | Ops Lead | 5 business days | Principal at 7 days |
| Q15 Unverified listings | Opportunity captured, buyer not verified | Ops Lead | 2 business days | Principal at 3 days |
| Q16 Requirements | Opportunity in `pursue` with missing fields | Ops Lead | 2 business days | Principal at 3 days |
| Q17 Shortlists | Confirmed requirement awaiting a human shortlist review | Ops Lead | 1 business day | Principal at 2 days |
| Q18 No-match sourcing | Requirement with zero eligible talent | Ops Lead | 2 business days to source or re-scope | Principal at 4 days |

**Queue split:** Q1–Q14 are talent-side; Q15–Q18 are demand-side. Both feed the same weekly review, but they are owned by different stages of the same Ops Lead role until volume justifies a split.

---

## 4. SLA definitions

### 4.1 Business time

- Business hours: Monday–Friday, 09:00–18:00 America/New_York, excluding US federal holidays.
- "Same day" means by 18:00 ET on the day received if received before 15:00 ET; otherwise next business day.
- Time zones are recorded per talent, not assumed.

### 4.2 Clock rules

| Event | Clock starts | Clock pauses | Clock stops |
|---|---|---|---|
| Application first response | Submission timestamp | Never | Acknowledgment sent |
| Portfolio review | All required evidence received | Evidence inaccessible or candidate asked for more | Score recorded |
| Interview scheduling | Advance decision | Candidate has not selected a slot | Slot confirmed |
| Verification | Request sent | Waiting on candidate or third party | All required items verified |
| Decision | Packet complete | Missing evidence | Decision recorded |
| Contract assembly | SOW approved | Missing addendum field | Contract assembled |
| Signature | Contract sent | Party requests changes | All signatures captured |
| Onboarding | Contract active | Document backlog owned by agency | Readiness `ready` |
| Delivery QA | Submission received | Submission technically unreadable | Review recorded |
| Payment | Invoice due date | Disputed invoice | Payment recorded |

### 4.3 Breach handling

1. At **80% of SLA**, the owner receives an in-app notification.
2. At **100%**, the item turns red and the escalation owner is notified.
3. At **150%**, the item appears in the weekly principal review with a written reason.
4. Repeated breaches by the same queue trigger a process review, not individual blame.

---

## 5. State model

### 5.1 Applicant states (`PROPOSED`)

```
received → acknowledged → triage_passed → in_review → reviewed
   → interview_scheduled → interviewed → verification
   → decision_pending → advanced | held | declined | withdrawn
```

Exception states: `duplicate`, `ineligible`, `evidence_insufficient`, `no_response`, `archived`.

### 5.2 Talent states (`PROPOSED`)

```
prospect → applicant → approved_talent → onboarding → ready
   → active → bench → alumni → offboarded
```

### 5.3 Mapping to existing states

| Target concept | Existing equivalent | Evidence |
|---|---|---|
| Contractor record | `Contractor` | `prisma/schema.prisma:53-78` |
| Role approval | `ContractorRole.status` | `prisma/schema.prisma:500-511` |
| Training readiness | `computeReadiness` | `src/lib/role-training-config.ts:104-146` |
| Contract | `SOW` + `AssembledContract` | `prisma/schema.prisma:104-137` |
| Assignment | `Deliverable` / `ProjectTask` | `prisma/schema.prisma:194-215,304-336` |
| Delivery QA | `deliverable-lifecycle.ts` | `src/lib/deliverable-lifecycle.ts:5-83` |
| Notification | `Notification` | `prisma/schema.prisma:276-288` |

Do not create parallel states for concepts the platform already models. Extend with a talent-specific status only where no equivalent exists.

### 5.4 Opportunity states (`PROPOSED`)

```
unverified → qualify → pursue → staffing → won | lost
      ↘ hold ↗         ↘ decline
```

| State | Meaning | Exit condition |
|---|---|---|
| `unverified` | Listing captured; buyer identity or authority unconfirmed | Human verifies buyer and authority |
| `qualify` | Real buyer, but budget, scope, or rights still missing | Written scope + budget signal received |
| `hold` | Paused by the buyer or the agency | Revisit date reached |
| `pursue` | Verified and worth effort; owner and deadline assigned | Requirements confirmed |
| `decline` | Not viable | Reason recorded; no talent contact |
| `staffing` | Requirements confirmed; shortlist in progress | Human selects talent and rate approved |
| `won` | SOW signed | Contract path opened |
| `lost` | Buyer chose elsewhere or withdrew | Reason recorded |

**Caps:** a score of 0 on identity, authority, budget, or risk keeps the opportunity at `unverified` regardless of the total (`16_PROJECT_LISTING_EVALUATION_PLAYBOOK.md` §2.1). Unverified and declined opportunities are invisible to matching.

### 5.5 Requirement states (`PROPOSED`)

Each requirement field is `confirmed`, `inferred`, or `missing`, with a source quote for `confirmed` and `inferred`. A requirement set is `confirmed` only when role, dates, location, budget band, and rights are all `confirmed` by a human. Any `missing` field blocks matching.

---

## 6. Handoff checklist by stage

### 6.1 Application → Review

- [ ] Record created with normalized email.
- [ ] Acknowledgment sent or queued.
- [ ] Role/vertical assigned.
- [ ] Portfolio link reachable or evidence requested.
- [ ] Consent recorded.
- [ ] Reviewer assigned.
- [ ] SLA timer started.

### 6.2 Review → Interview

- [ ] Rubric score recorded with evidence links.
- [ ] Reviewer notes recorded.
- [ ] Conflicts of interest checked.
- [ ] Advance/hold decision recorded by a human.
- [ ] Interview slots offered in candidate timezone.

### 6.3 Interview → Decision

- [ ] Scorecard completed within 24 hours.
- [ ] References requested and logged.
- [ ] Credentials requested.
- [ ] Decision packet assembled.
- [ ] Approver named.

### 6.4 Decision → Contract

- [ ] Human approval recorded with reason.
- [ ] `Contractor` created or linked.
- [ ] `ContractorRole` approved explicitly.
- [ ] Rate and terms confirmed by an authorized human.
- [ ] Required addendum fields complete.
- [ ] Documents verified or exceptions approved.

### 6.5 Contract → Onboarding

- [ ] All signatures captured.
- [ ] Contract active.
- [ ] Role lessons assigned.
- [ ] Integrations requested.
- [ ] Buddy assigned.
- [ ] First-week plan sent.

### 6.6 Onboarding → Ready

- [ ] Documents verified and unexpired.
- [ ] Training 100%.
- [ ] Required integrations verified.
- [ ] Readiness computed as `ready`.
- [ ] Ops owner notified.

### 6.7 Staffing → Delivery

- [ ] Availability checked.
- [ ] No client conflict.
- [ ] Rate within approved range.
- [ ] Deliverable created with brief and deadline.
- [ ] Talent accepted.
- [ ] Reviewer pre-assigned.

### 6.8 Delivery → Close

- [ ] Submission assets present.
- [ ] QC checklist passed.
- [ ] Client accepted or changes resolved.
- [ ] Admin final approval recorded.
- [ ] Deliverable closed.
- [ ] Performance score recorded.
- [ ] Invoice triggered.

### 6.9 Close → Retain/Offboard

- [ ] Performance review complete.
- [ ] Rate review if due.
- [ ] Bench or active decision recorded.
- [ ] Access reviewed.
- [ ] Assets and rights archived.

### 6.10 Listing → Qualify (demand)

- [ ] Source, URL, and raw text captured.
- [ ] Buyer name, role, and company recorded.
- [ ] Identity and authority verified or the record marked `unverified`.
- [ ] Budget signal recorded as a quote, not an assumption.
- [ ] Scope specific enough to price, or a written brief requested.
- [ ] Rights, usage, exclusivity, and territory stated.
- [ ] Dates and location confirmed.
- [ ] Red flags reviewed against the playbook.
- [ ] Band assigned with evidence per dimension.
- [ ] Owner and response deadline set.
- [ ] No talent contacted.

### 6.11 Requirements → Shortlist (demand)

- [ ] Every requirement field is `confirmed`, `inferred`, or `missing`.
- [ ] Each `confirmed` field links to a source quote.
- [ ] Conflicts surfaced to the client, not resolved by guessing.
- [ ] Required roles and skills mapped to the talent taxonomy.
- [ ] Budget band matches an approved rate band, or a rate exception is opened.
- [ ] Client restrictions and conflicts recorded.
- [ ] Risk level assigned.
- [ ] A human confirmed the requirement set.
- [ ] SOW assembly remains draft-only.

### 6.12 Shortlist → Assignment (demand)

- [ ] Eligibility filters applied; every exclusion has a reason code.
- [ ] 2–5 eligible candidates, each with a reason and evidence links.
- [ ] `insufficient_data` labeled and capped at Good.
- [ ] Availability re-checked at shortlist time.
- [ ] Rate within band or an approved exception.
- [ ] Confidence meets the risk threshold, or the placement is marked supervised-only.
- [ ] Human selected the candidate; override reason recorded if any.
- [ ] Offer sent by an admin in writing; no automation contact.
- [ ] Availability re-checked again before the start date is confirmed.

---

## 7. Escalation matrix

| Situation | First contact | Escalate to | Time |
|---|---|---|---|
| Candidate asks about status | Ops Lead | Principal | Same day |
| Reviewer misses SLA | Ops Lead | Vertical lead | 1 business day |
| Suspected duplicate/fraud | Ops Lead | Principal + security | Immediately |
| Negative reference | Ops Lead | Principal | Same day |
| Rate above ceiling | Ops Lead | Principal + Finance | Same day |
| Client conflict | Ops Lead | Principal | Immediately |
| Deliverable overdue | Ops Lead | Principal + account owner | T-0 |
| Client requests out-of-scope work | Ops Lead | Principal | Same day |
| Restricted data exposure | Any staff | Principal + security | Immediately |
| Talent complaint | Ops Lead | Principal | Same day |
| Unverified listing presented to talent | Ops Lead | Principal + security | Immediately |
| Listing past its response deadline | Ops Lead | Principal | 1 business day |
| Requirement missing budget or rights | Ops Lead | Principal + Finance | Same day |
| No eligible talent for a `pursue` requirement | Ops Lead | Principal | 2 business days |
| Rate exception requested | Ops Lead | Principal + Finance | Same day |
| Availability conflict after selection | Ops Lead | Principal | Immediately |

---

## 8. Metrics for this map

| Metric | Formula | Cadence |
|---|---|---|
| Queue age | Now − item created | Daily |
| SLA attainment | Items closed within SLA / items closed | Weekly |
| First response time | Acknowledgment − submission | Weekly |
| Time to decision | Decision − complete application | Weekly |
| Reviewer load | Open reviews per reviewer | Daily |
| Offer acceptance | Accepted / offered | Weekly |
| Readiness time | Ready − contract active | Weekly |
| On-time delivery | On time / delivered | Weekly |
| First-pass approval | Approved first time / submitted | Weekly |
| Revision loops | Average revisions per deliverable | Monthly |
| Retention at 90 days | Active at 90 days / hired | Quarterly |
| Escalation rate | Escalated items / total items | Monthly |
| Listing verification time | Verified − captured | Weekly |
| Unverified aging | `unverified` listings older than 2 business days | Weekly |
| Requirement completeness | Fields confirmed / total required fields | Weekly |
| Time to shortlist | Requirement confirmed → shortlist ready | Weekly |
| No-match rate | Requirements with zero eligible / total requirements | Weekly |
| Shortlist acceptance | Human accepts a top-3 candidate / selections | Monthly |
| Override rate | Overrides / selections | Monthly |
| Unverified-to-talent incidents | Listings that reached talent before verification | Must be zero |

---

## 9. Operating rule

If a stage has no owner, it is not a process. If it has no deadline, it is not a commitment. If it has no record, it did not happen.
