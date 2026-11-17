# 07 — Talent Sourcing and Vetting Playbook

**Owner:** Creative Talent Operations Lead
**Applies to:** Photography, Videography, Content & Social, Design & Creative
**Status:** `PROPOSED` operating standard

---

## 1. Objective

Build a repeatable pipeline that produces **3–5 qualified candidates per open role within 10 business days**, with a complete evidence trail and no unrecorded promises.

---

## 2. Sourcing strategy

### 2.1 Channel mix

| Channel | Use | Quality signal | Cost | Owner |
|---|---|---|---|---|
| Referrals from current talent | Highest trust; fastest | Referrer track record | Referral thank-you (approved policy) | Ops |
| Referrals from clients | Strong context | Client has seen the work | None | Account lead |
| Direct outreach (Instagram, Behance, Dribbble, Vimeo, LinkedIn) | Volume and freshness | Portfolio quality | Time | Ops |
| Alumni / bench re-engagement | Fastest fill | Known reliability | None | Ops |
| Agency website `/apply` | Inbound | Self-selected | Hosting only | Ops |
| Creative communities and schools | Early-career pipeline | Potential, not proven | Time | Ops |
| Paid job boards | Only if organic fails | Variable | **Requires approval** | Principal |

**Reuse rule:** do not add a paid sourcing tool until the free channels have been run for 30 days and the funnel data shows the bottleneck is volume, not conversion.

### 2.2 Channel attribution

Every applicant must have a `source` value from a fixed list:

`referral_talent`, `referral_client`, `instagram`, `tiktok`, `behance`, `dribbble`, `vimeo`, `linkedin`, `website_apply`, `school`, `community`, `outbound`, `agency_import`, `other`.

This is how we learn which channel produces hires, not just applications. `GrowthLead.source` is an existing precedent (`prisma/schema.prisma:461`) but is client-only.

### 2.3 Sourcing targets by vertical

| Vertical | Primary channels | Portfolio artifact to request | Red flags |
|---|---|---|---|
| Photography | Instagram, referrals, editorial directories | 10–20 image gallery + 1 full set | Only flat-lay or only one lighting style |
| Videography | Vimeo, referrals, film communities | 1–3 minute reel + 1 full piece | Reel is all stock/other people's work |
| Content & Social | LinkedIn, referrals, creator communities | 2 sample calendars + 3 posts with results | Cannot explain a metric |
| Design & Creative | Behance, Dribbble, referrals | 2 case studies + source files | Pretty mockups, no process |

---

## 3. Outbound sourcing workflow

1. **Define the need.** Role, seniority, dates, location, budget band, must-have skills, nice-to-have skills.
2. **Build a target list of 20–30.** Name, profile URL, source, why they fit.
3. **Send a short, specific outreach message.** No mass copy-paste.
4. **Log every contact** in the sourcing sheet with date and response.
5. **Follow up once after 5 business days.** Then stop.
6. **Convert interested contacts to applications.** Never create a contractor record from a DM.
7. **Report weekly:** contacted, replied, applied, reviewed, interviewed, approved.

### 3.1 Outreach template

> Subject: [Specific project/role] — your work on [specific piece]
>
> Hi [Name],
>
> I'm [Name] from WhoIsDésir® Media. I saw [specific piece] and specifically liked [one concrete detail]. We're looking for a [role] for [type of work] in [location/remote] around [timeframe].
>
> If you're open to it, the next step is a short application so we can review your work properly: [link]. It takes about 10 minutes.
>
> No pressure either way — happy to answer questions first.
>
> — [Name]

**Do not include:** a rate, a guarantee of work, or a timeline you cannot keep.

---

## 4. Screening stages

### Stage 1 — Completeness (automated + human check)

| Check | Pass | Hold | Fail |
|---|---|---|---|
| Name, email, role | Present | — | Missing |
| Portfolio/reel link | Reachable | Private/broken → request | None after 2 requests |
| Consent | Present | — | Absent |
| Location/timezone | Present | Ambiguous | — |
| Availability | Present | "Flexible" with no range → clarify | Contradicts role |
| Rate expectation | Present | "Negotiable" → ask for a band | — |

### Stage 2 — Eligibility (deterministic)

- Role is offered by the agency.
- Country is eligible for contractor engagement (confirm with Principal; default US).
- No conflict of interest with a current client.
- If regulated work (drone, minors, medical, financial), required license exists.

### Stage 3 — Portfolio rubric

Use `08_PORTFOLIO_AND_REEL_EVALUATION_FRAMEWORK.md`. Do not proceed without a score and evidence.

### Stage 4 — Interview

Use the structured format below.

### Stage 5 — Verification

Use the checklist in §6.

### Stage 6 — Decision

Use the decision packet in §7.

---

## 5. Structured interview guide

**Duration:** 40 minutes.
**Interviewer:** vertical lead or senior reviewer.
**Record:** notes + scorecard within 24 hours.

### 5.1 Agenda

| Time | Section | Purpose |
|---|---|---|
| 0–5 | Context | Role, project type, expectations |
| 5–25 | Portfolio walkthrough | Judgment, process, ownership |
| 25–35 | Ways of working | Feedback, deadlines, tools, conflict |
| 35–40 | Candidate questions | Motivation, constraints |

### 5.2 Questions (ask the same core questions for every candidate)

1. Walk me through this piece. What was the brief, and what did you decide?
2. What would you do differently if you had one more day?
3. Tell me about a time a client asked for something you disagreed with. What did you do?
4. How do you handle feedback you think is wrong?
5. How do you estimate time for a piece like this?
6. What do you need from a producer to do your best work?
7. What's a skill you're actively improving?
8. What questions do you have for us?

### 5.3 Scorecard (1–5 each)

| Criterion | 1 | 3 | 5 | Weight |
|---|---|---|---|---|
| Craft quality | Below role bar | Meets bar | Exceeds bar | 30% |
| Judgment | Cannot explain choices | Explains choices | Explains trade-offs and alternatives | 25% |
| Communication | Unclear | Clear | Clear, concise, client-ready | 15% |
| Reliability signals | Vague | Specific examples | Specific + references confirm | 15% |
| Collaboration | Difficult | Cooperative | Improves the team | 15% |

**Minimum to advance:** weighted score ≥ 3.5 and no criterion below 2, unless a human records an explicit override with reason.

---

## 6. Verification checklist

### 6.1 Identity and eligibility

- [ ] Legal name matches documents.
- [ ] Country of engagement confirmed.
- [ ] Right-to-work attestation (as required by counsel).
- [ ] Tax form type collected (W-9/W-8BEN or equivalent).
- [ ] Business entity status confirmed (individual vs LLC).

### 6.2 Insurance and licensing

- [ ] General liability (if required by client/venue).
- [ ] Equipment insurance (if equipment is provided or on set).
- [ ] Drone license (FAA Part 107 / CAA equivalent) with expiry.
- [ ] Professional license (if regulated).
- [ ] Vehicle/transport license (if applicable).

### 6.3 References

Call two references. Ask:

1. How did you work together, and on what?
2. How did they handle a deadline they were going to miss?
3. How did they take feedback they disagreed with?
4. Would you hire them again for the same scope? Why or why not?
5. Is there anything I should know before I put them in front of a client?

Record verbatim notes and a summary. A negative reference is a **hard stop** for the decision owner, not for the assistant.

### 6.4 Conflict check

- [ ] Not currently working with a direct competitor of the client.
- [ ] No undisclosed relationship with the client's staff.
- [ ] No exclusivity clause that conflicts with the engagement.
- [ ] Portfolio use rights allow showing the relevant work.

---

## 7. Decision packet template

```
APPLICANT: [Name]            REF: [ID]
ROLE: [Role]                 VERTICAL: [Vertical]
SOURCE: [Channel]            DATE: [YYYY-MM-DD]

FACTS
- Experience: [X years], [domains]
- Availability: [start], [capacity], [timezone]
- Rate expectation: [amount/type]
- Location/travel: [city], [radius]
- Credentials: [verified/missing/expiry]
- References: [2 completed / summary]

SCORES
- Portfolio: [0-100] ([band]) — evidence: [link]
- Interview: [0-5 weighted] — evidence: [scorecard]
- Verification: [complete/partial/blocked]

RISKS / OPEN QUESTIONS
- [Risk 1]
- [Risk 2]

RECOMMENDATION
[Advance / Hold for X / Decline for Y]

DECISION (human only)
[ ] Advance   [ ] Hold   [ ] Decline
Reason code: [code]
Approved by: [name]  Date: [YYYY-MM-DD]
Next action / owner / due: [ ]
```

---

## 8. Vetting red flags

| Red flag | Why it matters | Action |
|---|---|---|
| Portfolio work not attributable | May be stolen or team work misrepresented | Ask for process files and a walkthrough |
| Vague dates or inconsistent timeline | Reliability risk | Ask for specifics; check references |
| Speaks negatively about every past client | Collaboration risk | Probe; do not decide alone |
| Refuses references | Verification risk | Hold; Principal decides |
| Rate far below market | Quality or desperation risk | Probe scope; do not exploit |
| Rate far above band with no differentiated work | Margin risk | Principal decision |
| Pressure to start before contract | Compliance risk | Hard stop |
| Requests to bypass written scope | Scope creep risk | Decline politely; document |
| Reluctance to sign NDA/confidentiality | Client risk | Principal decision |
| Portfolio includes confidential client work | Legal risk | Do not download; request public samples |

---

## 9. Rejection and hold standards

### 9.1 Hold

Use when the issue is **fixable**:

- inaccessible portfolio,
- missing document,
- unclear availability,
- unanswered scheduling.

Message: specific item, deadline, consequence of no response.

### 9.2 Decline

Use when the issue is **not fixable for this role**:

- role mismatch,
- below portfolio floor after second review,
- unavailable for the required dates,
- rate outside band and no flexibility,
- negative verified reference.

Every decline includes:

1. Thanks.
2. One objective reason.
3. An offer to keep the profile on file for a defined period.
4. No false hope.

### 9.3 Never

- Decline because of a protected characteristic.
- Decline because of a "gut feeling" without a reason code.
- Ghost.
- Say "we'll keep you in mind" unless the record is actually retained.

---

## 10. Weekly sourcing report

| Metric | Definition | Target |
|---|---|---|
| Contacts made | Outbound messages sent | 30/week |
| Reply rate | Replies / contacts | ≥ 25% |
| Applications | Completed applications | 10/week |
| Qualified rate | `triage_passed` / applications | ≥ 40% |
| Portfolio pass rate | Above floor / reviewed | Tracked |
| Interview rate | Interviewed / portfolio pass | ≥ 50% |
| Approval rate | Approved / interviewed | Tracked |
| Source-to-hire | Hires by channel | Monthly |
| Time to fill | Open → accepted | ≤ 10 business days |

---

## 11. Compliance notes

- Keep applicant data only as long as the consent allows (default 12 months for retained profiles; shorter for rejected unless consent says otherwise).
- Do not ask for age, marital status, nationality, health, or other protected information.
- Do not request unpaid speculative work. If a paid test is used, define scope, rate, and rights in writing.
- Confirm contractor classification with counsel; do not treat a contractor as an employee.
- Confirm the legal review status of contract templates before relying on them. `src/data/clauses.ts` contains attorney-review notes (for example line 31).

---

## 12. Playbook checklist

- [ ] Role defined with must-have and nice-to-have skills.
- [ ] Channel plan chosen and logged.
- [ ] Outreach sent with specific personalization.
- [ ] Application complete and deduplicated.
- [ ] Consent recorded.
- [ ] Portfolio scored with evidence.
- [ ] Interview completed with scorecard.
- [ ] Two references recorded.
- [ ] Credentials verified or exception approved.
- [ ] Conflict check completed.
- [ ] Decision packet assembled.
- [ ] Human decision recorded with reason.
- [ ] Outcome communicated within one business day.
