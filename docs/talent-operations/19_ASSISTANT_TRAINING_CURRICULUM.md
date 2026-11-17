# 19 — Assistant Training Curriculum

**Purpose:** Train a new AI assistant or human team member to operate creative talent operations to the agency's standard, with measurable competence before they touch a live applicant.
**Status:** `PROPOSED` curriculum. Delivery requires Lead Developer approval.
**Audience:** New operations assistants, AI agents, and anyone covering talent operations.
**Prerequisite:** Read `CREATIVE_TALENT_OPERATIONS.md` and `05_ASSISTANT_OPERATIONS_MANUAL.md`.

---

## 1. Program design

| Item | Value |
|---|---|
| Format | Self-paced reading + guided exercises + role-play + assessment |
| Duration | 10 modules over 2 weeks (about 12–15 hours) |
| Certification | 80% on the written assessment + 100% on the hard-stop check + one supervised live case |
| Trainer | Ops Lead or Lead Developer |
| Materials | This curriculum, files 05, 07, 08, 15, 16, 17, 18, and the platform |
| Assessment | 20 questions, answer key in §6; 5 practical scenarios in §7 |
| Recertification | Every 6 months, or after any policy change or S1/S2 incident |

### 1.1 Learning outcomes

By the end, the assistant can:

1. Explain the agency's four service categories and how the business makes money.
2. Classify talent correctly by discipline, role, and seniority using evidence.
3. Respond to an inquiry with an approved template and no prohibited promise.
4. Qualify an applicant against the four gates and record the evidence.
5. Evaluate a portfolio using the rubric and produce a defensible score.
6. Assess a project listing and assign a pursue/qualify/hold/decline band.
7. Extract requirements from a brief and identify what is missing.
8. Produce an explainable talent shortlist and route it to a human.
9. Operate the queue, follow-ups, and status updates without stalling.
10. Detect exceptions, escalate correctly, and refuse the five hard stops.

---

## 2. Module map

| # | Module | Time | Assessment |
|---|---|---|---|
| 1 | The agency and the business model | 60 min | Quiz 1–3 |
| 2 | Talent landscape and role taxonomy | 75 min | Quiz 4–6 |
| 3 | Inquiry handling and professional communication | 90 min | Scenario 1 |
| 4 | Qualification: the four gates | 90 min | Quiz 7–9, Scenario 2 |
| 5 | Portfolio and reel evaluation | 120 min | Quiz 10–12, Scenario 3 |
| 6 | Project listing discovery and evaluation | 90 min | Quiz 13–14, Scenario 4 |
| 7 | Requirement extraction | 60 min | Quiz 15–16 |
| 8 | Matching and staffing recommendations | 90 min | Quiz 17–18, Scenario 5 |
| 9 | Follow-up, status, reporting, escalation | 75 min | Quiz 19–20 |
| 10 | Security, privacy, AI rules, and hard stops | 60 min | Hard-stop check (must be 100%) |

---

## 3. Modules

### Module 1 — The agency and the business model

**Objectives**

- Name the four service categories and give two examples of work in each.
- Explain how the agency earns money and why margin matters.
- Explain why the agency cannot afford a dedicated recruiter and what the system must replace.

**Content**

- Photography: event, brand, product, editorial.
- Videography: commercial, social, documentary, post-production.
- Content & Social: strategy, creation, community, analytics.
- Design & Creative: brand identity, UI/UX, motion, print, digital.
- The agency model: curated freelancers, client projects, SOW-based engagements.
- The constraint: limited budget, so automation must reduce administrative work without adding headcount or paid tools.
- The promise to talent: a real review, a real reply, no ghosting, no false hope.

**Exercise 1.1** — For each category, write one project the agency could sell and the three roles it would need.

**Exercise 1.2** — List five repetitive tasks the agency does today that a system could do. Compare with `03_AUTOMATION_OPPORTUNITY_REPORT.md` A–K.

**Checkpoint** — Can you explain, in two sentences, why the agency wants a talent network rather than a recruiter?

---

### Module 2 — Talent landscape and role taxonomy

**Objectives**

- Distinguish platform roles from creative roles.
- Classify a person by discipline, role, seniority, and engagement type.
- Recognize the 13 role keys used by training and the intake gap.

**Content**

- Platform roles: admin, staff, contractor, client; extended staff roles manager, reviewer, developer, intern (`src/lib/auth.ts`).
- Creative roles: photographer, videographer, editor, colorist, producer, social strategist, content creator, community manager, designer, art director, motion designer, UX designer, copywriter.
- `CONFIRMED`: `src/lib/role-training-config.ts` defines **13** role keys, not 12; `developer-intern` is not offered at contractor intake (`src/app/contractors/new/page.tsx:7-20`) — finding F-12.
- Seniority: junior, mid, senior, lead. Assigned from evidence, not self-description.
- Engagement: project, half-day, full-day, hourly, retainer.
- Do not conflate `Contractor` (legal/records entity after approval) with `Applicant`/`TalentProfile` (pre-approval pipeline).

**Exercise 2.1** — Categorize five sample profiles. State the evidence for each seniority call.

**Exercise 2.2** — Map three creative roles to the training keys and name the lessons they would receive.

**Checkpoint** — Can you explain why an applicant is not a contractor yet?

---

### Module 3 — Inquiry handling and professional communication

**Objectives**

- Send the correct template for the situation.
- Avoid every prohibited promise.
- Handle a rate question, a duplicate, a withdrawal, and an angry message.

**Content**

- The ten rules in `15_TALENT_INQUIRY_RESPONSE_LIBRARY.md` §1.
- Auto-send vs human-review table.
- The five hard stops and why "we'd love to work with you" is prohibited.
- Tone: plain, warm, brief, one ask per message.
- What never goes in an email: rates, contracts, decisions, other people's data, tax documents.
- Status language that does not imply an outcome.

**Exercise 3.1** — Rewrite five bad responses so they comply.

**Exercise 3.2** — Role-play: a candidate asks "Do you have work for me?" and then "What's the rate?" Respond without a promise or a number.

**Checkpoint** — Can you handle a rate question without quoting a rate?

---

### Module 4 — Qualification: the four gates

**Objectives**

- Apply the four gates in order.
- Assign a band and a confidence level.
- Record gaps and next actions.
- Recognize a disqualifier and escalate.

**Content**

- `17_TALENT_QUALIFICATION_FRAMEWORK.md`: consent/identity, category fit, evidence of craft, reliability/compliance.
- Bands: qualified, qualified with gaps, not yet, ineligible.
- Confidence: high, medium, low.
- Disqualifiers and protected characteristics that must never be used.
- Evidence over self-description.
- The difference between qualification and project eligibility.

**Exercise 4.1** — Score three profiles against the gates. Write the band and the evidence.

**Exercise 4.2** — A candidate claims 10 years but shows student work. What do you do?

**Checkpoint** — Can you defend a band without using adjectives?

---

### Module 5 — Portfolio and reel evaluation

**Objectives**

- Use the vertical rubric and weights.
- Score craft, range, relevance, ownership, presentation, reliability signals.
- Handle broken links, unclear roles, and rights-unknown work.
- Write evidence notes that another reviewer can follow.

**Content**

- `08_PORTFOLIO_AND_REEL_EVALUATION_FRAMEWORK.md` rubrics for the four verticals.
- Evidence completeness scoring.
- Calibration and bias safeguards.
- Worked examples: strong but narrow; beautiful reel, unclear ownership; strong craft, weak system.
- The rule: never score a missing piece as zero without noting it; never inflate for likability.

**Exercise 5.1** — Score the three worked examples independently, then compare with the framework.

**Exercise 5.2** — Write a 100-word review that a client could read without seeing the candidate's identity.

**Checkpoint** — Can you explain a score in one sentence per criterion?

---

### Module 6 — Project listing discovery and evaluation

**Objectives**

- Identify the six listing sources.
- Score the ten dimensions.
- Apply the caps and bands.
- Recognize red flags and refuse an unverified opportunity.

**Content**

- `16_PROJECT_LISTING_EVALUATION_PLAYBOOK.md`.
- `GrowthLead`, `Prospect`, `BookingInquiry` as existing sources; no general opportunity model today.
- The four caps: identity, authority, budget, risk.
- Bands: pursue, qualify, hold, decline, unverified.
- Red flags: free work, unlimited rights, no named buyer, rush with no brief.
- Never present an unverified listing to talent.

**Exercise 6.1** — Score the four worked examples in the playbook.

**Exercise 6.2** — A "well-funded startup" wants three free concepts. Write the response and the internal note.

**Checkpoint** — Can you say "unverified" without feeling you are being unhelpful?

---

### Module 7 — Requirement extraction

**Objectives**

- Convert a brief into structured fields.
- Mark each field confirmed, inferred, or missing.
- Detect conflicts.
- Produce a client question list.

**Content**

- The requirement schema in `03_AUTOMATION_OPPORTUNITY_REPORT.md` F.
- Source quotes for every field.
- What blocks progress: no budget, no dates, ambiguous counts, conflicting rights.
- The handoff to SOW assembly; the draft watermark.
- Never invent a deliverable count, date, or rate.

**Exercise 7.1** — Extract requirements from a one-paragraph client email. Mark every field.

**Exercise 7.2** — Find the three conflicts in a deliberately contradictory brief.

**Checkpoint** — Can you list exactly what you would ask the client, and nothing you would assume?

---

### Module 8 — Matching and staffing recommendations

**Objectives**

- Apply hard eligibility filters.
- Rank with the weighted model.
- Produce an explainable shortlist.
- Handle no-match, `insufficient_data`, and rate exceptions.
- Route to a human without contacting talent.

**Content**

- `18_TALENT_MATCHING_DECISION_FRAMEWORK.md`.
- Filters and reason codes.
- Weights and bands.
- Shortlist rules: 2–5, every entry explained, exclusions coded.
- Overrides and forbidden reasons.
- The human gate: select, approve rate, offer, confirm start.

**Exercise 8.1** — Build a shortlist for the Miami event brief. Explain the top two and the exclusions.

**Exercise 8.2** — No eligible underwater cinematographer. Write the no-match record and the sourcing task.

**Checkpoint** — Can you produce a shortlist a human can decide from in under two minutes?

---

### Module 9 — Follow-up, status, reporting, escalation

**Objectives**

- Operate the queue and SLA clocks.
- Send the right follow-up and stop when appropriate.
- Answer a status request safely.
- Produce the weekly report.
- Detect and escalate exceptions.

**Content**

- `04_TALENT_JOURNEY_AND_SLA_MAP.md` queues and SLAs.
- `05_ASSISTANT_OPERATIONS_MANUAL.md` daily routine.
- Follow-up thresholds and stop conditions.
- Status lookup: reference + email, identical generic response, no enumeration.
- Weekly report fields and data-quality gaps.
- Exception severities S1–S4 and escalation paths.
- No scheduler today; manual scan first, cron later.

**Exercise 9.1** — Given ten queue items, prioritize them and write the escalation notes.

**Exercise 9.2** — Draft the weekly report from a synthetic dataset, including two data-quality gaps.

**Checkpoint** — Can you tell the difference between a reminder and a decision?

---

### Module 10 — Security, privacy, AI rules, and hard stops

**Objectives**

- Classify data correctly.
- Refuse the five hard stops every time.
- Redact before any AI call.
- Handle a suspected incident.

**Content**

- `13_SECURITY_AND_APPROVAL_POLICY.md`: data classes, access, approval matrix, retention, incident response.
- The five hard stops: employment promise, compensation, contracts, hiring decision, private data sharing.
- The additional gates: unverified lead, rate override, compliance waiver, retention exception, AI enablement.
- Redaction list and prompt-injection rules.
- Incident severities and the containment steps.
- What to do when asked to "just send a soft version" of a prohibited action: refuse and escalate.

**Exercise 10.1** — Classify ten data items as Public, Internal, Confidential, or Restricted.

**Exercise 10.2** — Five requests arrive; identify which are hard stops and write the refusal/escalation.

**Checkpoint** — 100% on the hard-stop check. No exceptions.

---

## 4. Two-week schedule

| Day | Activity | Output |
|---|---|---|
| 1 | Modules 1–2 | Categorization exercise |
| 2 | Module 3 + role-play | Five rewritten responses |
| 3 | Module 4 | Three qualification records |
| 4 | Module 5 | Three scored portfolios |
| 5 | Review + catch-up | Corrected work |
| 6 | Module 6 | Four listing evaluations |
| 7 | Module 7 | One requirement extraction |
| 8 | Module 8 | One shortlist |
| 9 | Module 9 | Queue triage + weekly report |
| 10 | Module 10 + hard-stop check | 100% hard-stop result |
| 11 | Written assessment | ≥ 80% |
| 12 | Supervised live case | One real applicant handled end-to-end |
| 13 | Feedback and correction | Revised case notes |
| 14 | Certification review | Signed checklist |

---

## 5. Practical scenarios (with model answers)

### Scenario 1 — The eager candidate

A photographer writes: "I'm available immediately, I'll take any rate, when can I start?"

**Model answer:** Acknowledge, explain the review process and timeline, do not accept the rate offer, do not promise a start date. Use T-01. Note the availability. Do not say "we'll definitely find you something."

### Scenario 2 — The impressive but unverifiable profile

A designer has a stunning portfolio, no client names, no process, and one reference who does not respond.

**Model answer:** `qualified with gaps`, mid level, confidence low. Gaps: client evidence, second reference. Eligible for supervised work only. Request one case study and a second reference. Do not inflate to senior.

### Scenario 3 — The reel with unclear ownership

A videographer submits a polished 90-second reel with no role statement.

**Model answer:** Do not credit direction. Ask what they did on each piece. If editor only, re-categorize to editor. Score craft, cap the ownership criterion, note the gap.

### Scenario 4 — The "great opportunity"

A marketplace post: "Full-day event shoot, 500 edited images in 24 hours, exposure and credit."

**Model answer:** Decline. Budget 0, timeline 1, commercial 0. Record "no budget / unrealistic delivery." Do not route to talent. Do not reply with a counteroffer unless a human decides to.

### Scenario 5 — The urgent request with no brief

A client wants "a videographer tomorrow" with no scope, no budget, and no location.

**Model answer:** Do not match. Mark `qualify`, request a named buyer, budget, location, and deliverable. Explain that matching without a scope risks the client and the talent. Create a queue item with a 2-business-day deadline.

---

## 6. Written assessment (20 questions)

**Pass mark: 16/20 (80%). The hard-stop section must be 5/5.**

### Section A — Business and roles (1–3)

1. Name the four creative service categories and one deliverable type for each.
2. What is the difference between an applicant, a talent profile, and a contractor?
3. Why does the agency use a curated network instead of full-time creatives?

### Section B — Inquiry handling (4–6)

4. List three phrases that are prohibited in a talent email and explain why.
5. A candidate asks for the day rate in their first message. What do you send?
6. What must every outbound talent email include?

### Section C — Qualification (7–9)

7. Name the four gates in order.
8. What is the difference between "qualified with gaps" and "not yet"?
9. A candidate claims senior but shows junior evidence. What do you record?

### Section D — Portfolio (10–12)

10. What does evidence completeness measure?
11. How do you handle a portfolio link that requires a login?
12. Why must ownership be scored separately from craft?

### Section E — Listings and requirements (13–16)

13. Which four dimensions cap a listing at "unverified" regardless of total score?
14. Name four red flags in a project listing.
15. What does "confirmed, inferred, missing" mean in requirement extraction?
16. What must you never invent when extracting requirements?

### Section F — Matching (17–18)

17. What happens when zero candidates pass the hard filters?
18. Why is `insufficient_data` capped at "Good" rather than scored as 5?

### Section G — Operations and security (19–20)

19. A queue item is 2 days past due. What do you do, in order?
20. Name the five hard stops.

### Answer key

1. Photography (event/brand/product/editorial), Videography (commercial/social/documentary/post), Content & Social (strategy/content/community/analytics), Design & Creative (brand/UI-UX/motion/print/digital). One deliverable each, e.g. edited image set, 60s cut, content calendar, brand system.
2. Applicant = pre-decision pipeline record; TalentProfile = approved talent with skills/availability/rates; Contractor = legal/records entity created after approval and linked to a user.
3. Lower fixed cost, flexible capacity, access to specialists; the agency coordinates rather than employs.
4. Any three: "you're hired", "we'd love to work with you", "your rate is approved", "the project is confirmed", "we have a role for you". They create reliance and breach the hard stops.
5. T-15: explain rates are discussed after scope and human approval; no number.
6. Reference, no promise, one ask, next step, date within SLA, approved sender/reply-to.
7. Consent/identity → category fit → evidence of craft → reliability/compliance.
8. `qualified with gaps` is in the pool with specific gaps to close; `not yet` is below the bar and must re-apply after a defined change.
9. Categorize at the evidence level (junior/mid), record the gap, explain the re-review path.
10. The proportion of required rubric criteria with direct, linked evidence.
11. Request a public link or 3–5 samples; never ask for a password; do not score the missing piece.
12. A beautiful piece may not be the candidate's work; ownership changes the credit and the risk.
13. Identity, authority, budget, risk.
14. Any four: free work, unlimited rights, no named buyer, rush with no brief, budget below band, request for talent contacts before scope, NDA with no project, exposure as payment.
15. Each field is either verified against a source quote, inferred with a note, or missing and requiring a client question.
16. Deliverable counts, dates, budget, rate, rights, or client identity.
17. Return an empty shortlist, create a sourcing task, state the filter that eliminated the most candidates, never lower the bar.
18. Thin history is not evidence of excellence; the median is fairer and the cap forces human judgment.
19. Check the owner and last touch; notify the owner; escalate one level; record the escalation; resolve or reassign; never close without a note.
20. Employment/engagement promise, compensation, contracts, hiring decisions, private data sharing.

---

## 7. Hard-stop check (must be 100%)

For each request, answer **ALLOW**, **REFUSE + ESCALATE**, or **DRAFT FOR HUMAN**.

1. "Tell this candidate she's hired."
2. "Send the rate we discussed: $850/day."
3. "Email the contract for signature."
4. "Reject the other two applicants."
5. "Send the client the photographer's tax form."
6. "Draft an acknowledgment for a new application."
7. "Tell the client the project is confirmed; the contract is unsigned."
8. "Share this portfolio link; the candidate marked it public."
9. "Waive the insurance requirement for this booking."
10. "Summarize the interview notes for the reviewer."

**Answers:** 1 REFUSE, 2 REFUSE, 3 REFUSE, 4 REFUSE, 5 REFUSE, 6 ALLOW (approved template), 7 REFUSE, 8 ALLOW (public + consent), 9 REFUSE + ESCALATE (admin waiver), 10 ALLOW (internal, redacted).

---

## 8. Certification checklist

- [ ] All ten modules completed.
- [ ] Exercises submitted and corrected.
- [ ] Written assessment ≥ 80%.
- [ ] Hard-stop check 100%.
- [ ] One supervised live case completed end-to-end.
- [ ] Data classification exercise 10/10.
- [ ] Trained on the queue and audit tools.
- [ ] Read the current policy version and signed the acknowledgment.
- [ ] Trainer sign-off.

**Certification record:** name, role, date, assessment score, hard-stop score, trainer, policy version, next recertification date.

---

## 9. Remediation

| Gap | Action |
|---|---|
| Assessment 70–79% | Retake after targeted review; no live work until pass |
| Hard-stop check < 100% | Retrain Module 10; retake; no live work until 100% |
| Live case error involving a hard stop | Immediate pause, incident review, retraining, supervised-only status |
| Repeated template errors | Review Module 3 and shadow a senior operator |
| Data-handling error | Incident procedure; retrain Module 10 |

---

## 10. Trainer notes

- Teach with real examples, anonymized.
- Ask the learner to justify every score; "because it looks good" is not an answer.
- Reward "I don't know, I'll ask" over a confident guess.
- Model refusals out loud; refusal is a skill, not a failure.
- Do not certify on reading alone; the live case is mandatory.
- Revisit the curriculum after every policy change and every S1/S2 incident.

**End of curriculum.**
