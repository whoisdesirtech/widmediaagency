# 05 — Assistant Operations Manual

**Audience:** Creative Talent Operations Assistant (human), with an AI assistant as a force multiplier.
**Purpose:** A complete training manual for running the talent pipeline day to day.
**Version:** 1.0 (proposal) · 2026-11-06

---

## 1. Your job in one paragraph

You are the system's memory and follow-through. You make sure every applicant gets a timely, respectful answer; every decision is recorded with evidence; every approved talent is contracted, trained, and ready; every assignment has the right person and a realistic deadline; and every delivery is reviewed and closed. You do not make hiring, rate, or contract decisions. You prepare them so a human can decide quickly.

---

## 2. What you may and may not do

### 2.1 You may

- Create and update applicant records.
- Send approved acknowledgment, scheduling, reminder, and document-request templates.
- Compute and record rubric scores based on evidence.
- Assign reviewers and interviewers.
- Assemble decision packets.
- Draft SOWs from approved rates and addenda.
- Assign approved training.
- Route deliverables to reviewers.
- Escalate late or blocked items.
- Record performance facts from delivery data.
- Capture and score a project listing; record evidence and the band.
- Extract requirements from a brief and mark each field `confirmed`, `inferred`, or `missing`.
- Generate a ranked shortlist for a human to review.
- Operate the queue, follow-ups, status responses, and the weekly report.

### 2.2 You may not (hard stops)

| Prohibited action | Why | Do instead |
|---|---|---|
| Promise employment or a specific volume of work | Creates legal/reputational risk | Say "the team will review and respond by [date]" |
| State or negotiate a rate | Compensation is a human decision | Collect the expectation and route to the Principal |
| Sign or send a contract | Legal commitment | Prepare the draft and request approval |
| Make a hiring/rejection decision | Accountability and bias | Prepare the packet and request a decision |
| Share tax forms, IDs, bank details, or client-confidential material | Privacy/security | Share only via approved restricted access |
| Treat an unverified lead as a real project | Misrepresents commitments | Label it "unverified" and request confirmation |
| Contact talent about an assignment or hold availability | Commitment without approval | Prepare the recommendation; an admin contacts and offers |
| Bypass training or document checks | Compliance and quality | Escalate for an explicit exception |

When in doubt, escalate. Escalation is never a failure; silence is.

---

## 3. The daily routine

### 3.1 Morning (30 minutes)

1. **Open the queue dashboard.** Sort by SLA age, oldest first.
2. **Clear acknowledgments.** Every application from the previous business day must have an acknowledgment. If the email failed, resend and note it.
3. **Triage new applications.** Check duplicates, completeness, role fit, and consent. Move to `triage_passed` or `triage_hold` with a specific reason.
4. **Check reviewer load.** Rebalance if any reviewer has more than 5 open reviews.
5. **Check interviews today.** Confirm interviewer, candidate, timezone, and prep note.
6. **Check delivery risk.** Any deliverable due in 48 hours without a submission gets a check-in.
7. **Check the demand queue.** Any `unverified` listing older than 2 business days, and any `pursue` opportunity missing requirements, gets an owner action today.

### 3.2 Midday (15 minutes)

1. **Process document uploads.** Verify the file type and legibility, record the state, and move to the next step.
2. **Clear approvals.** Anything waiting on a human for more than 24 hours gets a polite nudge with the decision and deadline.
3. **Update candidate statuses.** No candidate should be in the same state for more than 3 business days without a note.

### 3.3 End of day (15 minutes)

1. **Write tomorrow's top three.** The three items that will hurt most if not done.
2. **Log blockers.** Every red item gets an owner and a next action.
3. **Confirm no one is waiting silently.** Check the "awaiting us" and "awaiting them" lists.
4. **Do not leave a restricted document open.** Close tabs, lock screens, sign out of shared machines.

### 3.4 Weekly (45 minutes)

1. Pipeline review: applications, reviews, interviews, decisions, holds.
2. Aging review: anything over SLA with a written reason.
3. Demand review: new listings, unverified aging, missing requirements, shortlist acceptance, no-match causes.
4. Calibration: compare two reviewers' scores on the same portfolio; discuss gaps.
5. Delivery review: late items, revision loops, client blockers.
6. Next-week staffing forecast: roles, dates, gaps.
7. Update the decision log and clean duplicate records.

### 3.5 Monthly (60 minutes)

1. Funnel metrics: response time, decision time, pass rates, offer acceptance.
2. Roster health: utilization, reliability, retention risk, expiring documents.
3. Automation health: fallbacks, failures, false positives.
4. Policy drift: any workaround that became normal; propose a fix.
5. Training gaps: lessons that stall or do not match the role.

---

## 4. Queue playbooks

### 4.1 New application

**Goal:** every application acknowledged and triaged within 2 business days.

1. Confirm the record exists and the email is normalized.
2. Check for an exact duplicate. If found, link, do not overwrite.
3. Verify role, location, availability, rate expectation, and consent are present.
4. Check the portfolio link is reachable.
5. Send the acknowledgment if not already sent.
6. Assign the vertical reviewer.
7. Set the review SLA.
8. Record the action in the audit log.

**Decision tree:**

```
Complete + eligible + link works?
├─ Yes → triage_passed → assign reviewer → 3-day review SLA
├─ Link broken/private → evidence_insufficient → request access → pause SLA
├─ Missing consent → hold → request consent → do not process further
├─ Role not offered → ineligible → send approved decline
└─ Possible duplicate → flag → human merge
```

### 4.2 Portfolio review

1. Open the rubric for the vertical in `08_PORTFOLIO_AND_REEL_EVALUATION_FRAMEWORK.md`.
2. Score each criterion 1–5 with a one-line evidence note.
3. Record the total and the confidence (evidence completeness).
4. Write a 3–5 sentence summary: what is strong, what is missing, what the brief requires.
5. If below the floor, request a second reviewer before any decline.
6. Move to `reviewed` and notify the decision owner.

**Do not** write "great vibe" or "not a fit" without a criterion and evidence.

### 4.3 Interview scheduling

1. Confirm the interviewer and the interview type.
2. Offer three slots in the candidate's timezone with a clear duration.
3. Create the calendar event only after the candidate selects.
4. Send prep notes: who they will meet, what to bring, how to join.
5. Create the scorecard task due 24 hours after the interview.
6. Remind at T-48h and T-2h.
7. If no response in 3 business days, send one follow-up, then close the loop politely.

### 4.4 Verification

1. Create the checklist by role and country.
2. Request documents through the secure link only.
3. Verify legibility, name match, expiry, and required coverage.
4. Record `received`, `verified`, or `exception` with a note.
5. Never store documents in chat or email.
6. Block contract assembly if a required item is missing.

### 4.5 Decision packet

1. Compile: profile, score, interview notes, references, credentials, availability, rate expectation, risks.
2. Write a one-paragraph recommendation with the strongest evidence and the biggest risk.
3. Present Advance / Hold / Reject.
4. Do not send the outcome until the human records the decision.
5. After the decision, send the approved template within one business day.

### 4.6 Contract preparation

1. Confirm the SOW rate and rate type are approved.
2. Prefill the role addendum with the talent's defaults.
3. Check every required addendum field.
4. Create the SOW in `draft`.
5. Request human approval.
6. On approval, assemble and send for signature.
7. Track signatures and escalate at 5 business days.

### 4.7 Onboarding

1. Confirm the contract is active.
2. Assign role lessons.
3. Send the welcome pack: start date, first-week plan, buddy, training links, document checklist.
4. Track training at 50% and 80%.
5. Confirm documents are verified and unexpired.
6. Mark `ready` only when training is 100% and required integrations are verified.

### 4.8 Staffing

1. Restate the need: role, dates, location, budget, deliverables, client conflict rules.
2. Filter by eligibility and availability.
3. Check for overlapping assignments.
4. Shortlist 3–5 with a one-line reason each.
5. Present to the decision owner.
6. On approval, create the assignment and request acceptance.
7. Confirm acceptance before telling the client.

### 4.9 Delivery QA

1. Confirm a submission URL or attachment exists.
2. Route to the correct reviewer.
3. Apply the vertical QC checklist.
4. Record pass or specific change requests with reason codes.
5. Track revision count against the SOW.
6. Route client acceptance to admin final approval.
7. Never close a deliverable yourself.

### 4.10 Offboarding

1. Confirm the reason and effective date.
2. Close or reassign active work.
3. Revoke access and archive assets.
4. Record the performance and bench status.
5. Send the approved exit note.

### 4.11 Listing evaluation (demand)

**Goal:** every new opportunity is verified, scored, and owned within 2 business days.

1. Capture the source, raw text, buyer, scope, dates, location, budget signal, and rights.
2. Score the ten dimensions in `16_PROJECT_LISTING_EVALUATION_PLAYBOOK.md`; write one line of evidence per dimension.
3. Apply the caps: any zero on identity, authority, budget, or risk keeps the listing `unverified`.
4. Assign the band: `pursue`, `qualify`, `hold`, `decline`, or `unverified`.
5. Set the owner and the response deadline.
6. Record the reason for a decline; do not recycle it silently.
7. **Never** describe the listing to talent as an approved project before `pursue` and a human confirmation.

### 4.12 Requirement extraction (demand)

1. Read the brief, message, or call notes; keep the source text.
2. Extract role, skills, dates, location, crew size, deliverables, rights, budget band, payment terms, revisions, and confidentiality.
3. Mark each field `confirmed`, `inferred`, or `missing`; attach a quote to every `confirmed` field.
4. List conflicts (two dates, two budgets, incompatible rights) and send them to the client.
5. Produce the client question list — only what is actually missing.
6. Hand the confirmed set to SOW assembly; keep the draft clearly marked.
7. **Never** invent a deliverable count, date, budget, or rate.

### 4.13 Shortlist and selection (demand)

1. Confirm the requirement set is complete and human-confirmed.
2. Apply the hard filters; record an exclusion code for every removed candidate.
3. Rank eligible candidates with the weights in `18_TALENT_MATCHING_DECISION_FRAMEWORK.md`.
4. Produce 2–5 entries with a one-line reason, evidence links, and risks.
5. Label `insufficient_data` and cap it at Good.
6. Re-check availability at shortlist time.
7. Present to the decision owner; record any override reason.
8. **Do not contact talent.** An admin makes the offer after rate and availability are confirmed.

### 4.14 No-match sourcing (demand)

1. Return the empty shortlist rather than lowering the bar.
2. State which filter eliminated the most candidates.
3. Create a sourcing task with the role, dates, location, and budget band.
4. Offer a re-scope option to the client if the market cannot supply the request.
5. Record the outcome; do not quietly substitute a lower-quality candidate.

### 4.15 Status request (talent)

1. Verify the reference **and** the email; return the same generic response for any mismatch.
2. Report only the recorded status and the next step; never guess or imply an outcome.
3. If the status is stale, open an internal task and tell the candidate a person will follow up by the SLA date.
4. Record the lookup in the timeline.
5. If the candidate withdraws, confirm and stop all other sequences.

---

## 5. Communication standards

### 5.1 Tone

- Warm, direct, and specific.
- No hype, no vague praise, no false urgency.
- Respect the person's time: say what you need, by when, and why.

### 5.2 Structure for every message

1. **Context:** what this is about.
2. **Status:** where things stand.
3. **Ask:** exactly what is needed.
4. **Deadline:** date and timezone.
5. **Fallback:** what happens if not received.

### 5.3 Approved phrases

| Situation | Use | Avoid |
|---|---|---|
| Acknowledgment | "Thanks for applying. We've received your profile and will review it by [date]." | "We'll be in touch." |
| Delay | "We're still reviewing and will update you by [date]." | "Sorry for the delay" with no date |
| Missing evidence | "To continue, we need [specific item] by [date]." | "Send more work." |
| Decline | "We're not moving forward at this time because [objective reason]. We'll keep your profile for [period] if you'd like." | "Not a fit." |
| Rate question | "I've recorded your expectation. The team will confirm the rate before any commitment." | Any number you are not authorized to give |
| Contract | "The draft is ready for your review. Please do not begin work until it is signed." | "You're all set." |
| Assignment | "We'd like to offer [scope] on [dates] at [approved rate]. Please accept by [date]." | "Can you start tomorrow?" without a contract |
| Delay on our side | "This is on us. New date: [date]. Here's what we're doing." | Blaming the client or talent |

### 5.4 Response templates

**Acknowledgment**

> Subject: We received your application — [Role]
>
> Hi [First name],
>
> Thanks for applying for the [Role] role at WhoIsDésir® Media. Your application reference is [REF].
>
> Here's what happens next:
> 1. We review your portfolio and experience (2–3 business days).
> 2. If there's a fit, we'll invite you to a short interview.
> 3. We'll let you know either way by [date].
>
> If you need to update your application, reply to this email with your reference.
>
> — [Name], Creative Talent Operations

**Evidence request**

> Subject: One more item for your application — [REF]
>
> Hi [First name],
>
> We couldn't access [link/file] from your application. Could you send an accessible link or attach 3–5 samples by [date]?
>
> If we don't hear back by then, we'll pause your application rather than close it.
>
> — [Name]

**Interview invite**

> Subject: Interview invitation — [Role]
>
> Hi [First name],
>
> We'd like to meet. Please choose one of these 30-minute slots (times shown in [timezone]):
> - [Slot 1]
> - [Slot 2]
> - [Slot 3]
>
> You'll meet [Interviewer], who leads [vertical]. We'll review 2–3 pieces from your portfolio and discuss how you work.
>
> — [Name]

**Decline**

> Subject: Your application — [Role]
>
> Hi [First name],
>
> Thank you for the time you put into your application. We're not moving forward because [specific, objective reason, e.g. "the role requires on-location work in Miami and your availability is remote-only"].
>
> If you'd like, we can keep your profile for future [vertical] work for [12 months]. Just reply "keep me on file."
>
> We wish you well.
>
> — [Name]

**Contract ready**

> Subject: Contract ready for review — [Project]
>
> Hi [First name],
>
> Your SOW and contract are ready. Please review and sign by [date]. Do not begin work until both parties have signed.
>
> Key terms: [rate], [payment schedule], [deliverables], [revision rounds].
>
> — [Name]

**Send authority:** only the acknowledgment, evidence request, interview invite, and status update may be sent from an approved automated sequence. The decline, contract, rate, and assignment templates are for an **authorized human** and must never be sent by an automation. The full template set, variables, and auto-send rules are in `15_TALENT_INQUIRY_RESPONSE_LIBRARY.md`; that file is authoritative where the two differ.

---

## 6. Evidence and record-keeping

Every record must answer:

- **Who** made the decision (human name and user ID).
- **What** was decided (state and reason code).
- **When** (timestamp, timezone).
- **Why** (evidence links, score, notes).
- **What next** (owner and due date).

### 6.1 Reason codes

| Code | Use |
|---|---|
| `ROLE_MISMATCH` | Skills/role do not match the open need |
| `PORTFOLIO_BELOW_FLOOR` | Rubric score below the vertical floor |
| `EVIDENCE_INSUFFICIENT` | Cannot assess due to missing/unreachable work |
| `AVAILABILITY_MISMATCH` | Cannot meet dates/location |
| `RATE_OUT_OF_RANGE` | Expectation outside approved band |
| `CREDENTIAL_MISSING` | Required document not provided |
| `REFERENCE_NEGATIVE` | Verified negative reference |
| `CLIENT_CONFLICT` | Conflict of interest |
| `CANDIDATE_WITHDREW` | Candidate withdrew |
| `NO_RESPONSE` | Candidate did not respond after defined attempts |
| `POSITION_FILLED` | Role filled by another candidate |
| `OTHER_HUMAN` | Human judgment with written note |

### 6.2 Note quality

Bad: "Good portfolio."

Good: "Editorial portrait set (12 images). Strong natural-light consistency and retouching; weak on flash setups required by the brief. Rubric: composition 4, lighting 3, retouching 4, consistency 4, brief fit 2, range 3 = 67/100. Evidence: [link]."

---

## 7. Working with the AI assistant

### 7.1 What to delegate

- Summarizing a portfolio against the rubric.
- Drafting the first version of a status email.
- Extracting facts from a CV or brief into fields.
- Finding missing fields in a decision packet.
- Drafting a QA checklist result from reviewer notes.
- Grouping similar rejection reasons for a quarterly review.

### 7.2 What never to delegate

- The hiring decision.
- The rate.
- The contract send.
- The final approval.
- Any message that could be read as a commitment.
- Any handling of restricted documents.

### 7.3 How to prompt

Use the templates in `11_AI_ASSISTANT_PROMPT_LIBRARY.md`. Always include:

- role and task,
- the exact input,
- the output schema,
- the prohibited content,
- the escalation rule.

### 7.4 How to verify AI output

1. Does every claim trace to an input?
2. Are scores computed from the rubric, not invented?
3. Is any prohibited commitment present?
4. Is any restricted data present?
5. Would you be comfortable if the candidate read it?

If any answer is no, do not use it.

---

## 8. Quality bar

| Artifact | Standard |
|---|---|
| Acknowledgment | Sent within 1 business day; includes reference and next date |
| Review score | Every criterion has an evidence note |
| Decision packet | One page; facts separated from recommendation; risk stated |
| SOW draft | Every required addendum field filled; rate approved |
| Onboarding | Welcome pack within 1 business day of contract active |
| Assignment | Availability checked; conflict checked; rate approved |
| QA | Checklist completed; reason codes for every change request |
| Performance | Recorded within 5 business days of close |
| Audit | Every state change logged with actor and reason |

---

## 9. Weekly self-audit

Answer these ten questions every Friday:

1. Is any applicant waiting more than 2 business days for a first response?
2. Is any application older than 7 business days without a decision?
3. Does every review have a rubric score and evidence?
4. Does every interview have a scorecard within 24 hours?
5. Is any contract unsigned beyond 5 business days?
6. Is any hired talent not `ready` within 10 business days?
7. Is any assignment missing an availability check?
8. Is any deliverable past due without an escalation?
9. Is any project closed without a performance record?
10. Did any automation fail without a human noticing?

If you answer yes to any, that is next week's first fix.

---

## 10. Onboarding a new assistant (first week)

| Day | Focus | Deliverable |
|---|---|---|
| 1 | Read this manual, the policy, and the journey map | Written questions |
| 2 | Shadow the queue; observe 5 applications and 2 reviews | Annotated examples |
| 3 | Score 3 portfolios with a mentor; compare | Calibration notes |
| 4 | Draft 3 emails and 1 decision packet for review | Reviewed drafts |
| 5 | Run the morning routine with supervision | Checklist signed off |
| 2 weeks | Own the queue with daily review | SLA report |
| 4 weeks | Propose one process improvement | One-page proposal |

**Competency check:** the assistant can explain the five hard stops, score a portfolio with evidence, write a decision packet, and run the daily routine without prompting.

---

## 11. Escalation card (print this)

| If this happens | Do this | Tell |
|---|---|---|
| Candidate asks for a rate | Record expectation; do not quote | Principal |
| Candidate says they have another offer | Note deadline; expedite decision packet | Principal |
| Portfolio contains client-confidential work | Do not download/share; ask for public samples | Principal |
| Reference is negative | Stop; record verbatim; do not decide | Principal |
| Document looks altered | Do not verify; preserve original; escalate | Principal + security |
| Client asks for free extra work | Do not promise; log scope change | Principal |
| Deliverable is late | Notify owner and client-facing lead immediately | Principal |
| Restricted data was shared | Preserve evidence; notify immediately | Principal + security |
| You are unsure | Ask before acting | Your lead |

---

## 12. Glossary

| Term | Meaning |
|---|---|
| Applicant | A person who submitted an application; not yet a contractor |
| Talent | An approved creative person, whether or not currently engaged |
| Contractor | The legal/records entity in the platform |
| Role | A creative discipline or sub-specialty |
| Vertical | Photography, Videography, Content & Social, Design & Creative |
| SOW | Statement of Work; rate, dates, deliverables, terms |
| Addendum | Role-specific contract schedule |
| Readiness | Training complete + required integrations verified |
| Bench | Approved talent not currently assigned |
| Hard stop | An action no automation may take |
| SLA | Service-level agreement; the promised response time |
