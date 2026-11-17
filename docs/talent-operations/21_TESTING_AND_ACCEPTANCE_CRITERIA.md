# 21 — Testing and Acceptance Criteria

**Purpose:** Define how every talent-operations capability is verified before it ships, and the objective criteria the Lead Developer uses to accept or reject a phase.
**Status:** `PROPOSED`.
**Scope:** All automations A–K, downstream lifecycle work, and the security controls they depend on.
**Related:** `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md` (phases), `13_SECURITY_AND_APPROVAL_POLICY.md` (controls), `20_CURRENT_FUNCTIONALITY_INVENTORY.md` (baseline).

---

## 1. Test strategy

### 1.1 Pyramid

| Layer | Share | What it proves | Tooling |
|---|---|---|---|
| Unit | 55% | Pure rules: qualification, rubric math, matching, SLA clocks, redaction, state transitions | Vitest |
| Integration | 30% | Route + Prisma + auth + audit + email log behavior | Vitest + test database |
| End-to-end | 10% | A person completes apply → acknowledge → review → decision | Browser automation (Playwright or equivalent) |
| Security | 4% | Guards, ownership, mass assignment, enumeration, injection | Vitest + targeted HTTP tests |
| Accessibility/performance | 1% | `/apply` AA, p95 latency | axe + load script |

### 1.2 Environments

| Environment | Data | Purpose |
|---|---|---|
| Local | Synthetic | Unit and integration |
| Preview | Synthetic, seeded | E2E, accessibility, dry runs |
| Staging | Synthetic only | Migration rehearsal, rollback drill |
| Production | Real | Smoke tests only; no synthetic records |

**Rule:** no real applicant data in local, preview, or staging.

### 1.3 Fixtures

- 40 synthetic applicants across the four verticals and four bands.
- 10 opportunities across pursue/qualify/hold/decline/unverified.
- 20 talent profiles with varied availability, rates, compliance, and performance sample sizes.
- 5 duplicate pairs, 5 broken portfolios, 5 missing-document cases.
- 3 conflict cases (double booking, client restriction, rate exception).
- 1 canary Restricted value used to prove redaction.

Fixtures are versioned and seeded by a script; they contain no real personal data.

---

## 2. Test matrix by automation

| Area | Unit | Integration | Security | E2E | Manual |
|---|---|---|---|---|---|
| A. Inquiry intake | Validation, dedupe, reference | Create + notify + audit | Rate limit, honeypot, CSRF | Submit on mobile | Copy review |
| B. Acknowledgment + info collection | Template render, stop rules | Email log, retry, missing-info task | No secrets in logs | Receive ack (sandbox) | Tone review |
| C. Categorization + qualification | Gates, bands, confidence | Review record + audit | Reviewer scope | Review a synthetic profile | Calibration |
| D. Portfolio review | Rubric math, evidence completeness | Score persistence | No Restricted data in prompts | Reviewer flow | Two-reviewer agreement |
| E. Listing discovery | Scoring, caps, bands | Opportunity create + queue | Unverified cannot reach talent | Capture a listing | Red-flag review |
| F. Requirement extraction | Field extraction, conflicts | Requirement persistence | Source quotes required | Brief → draft SOW | Client-question quality |
| G. Matching | Filters, ranking, ties | Shortlist + assignment guard | No auto-contact | Shortlist → human select | Explanation review |
| H. Follow-up | Thresholds, dedupe, stop | Queue escalation | Consent respected | Reminder appears | Volume review |
| I. Status tracking | Reference + email match | Generic response | Enumeration resistance | Status lookup | Wording review |
| J. Reporting | Aggregates, `insufficient_data` | Report snapshot | No Restricted fields | Weekly report | Usefulness review |
| K. Exceptions | Rule firing, severity | Exception record + escalation | Hard-stop block | S1 drill | Tabletop |

---

## 3. Acceptance criteria by master deliverable

### 3.1 Existing application audit

- [ ] Every current-state claim cites a path and line or a deterministic command.
- [ ] Counts match a fresh enumeration (models, routes, pages, tests).
- [ ] Findings F-01–F-20 are reproducible from the cited evidence.
- [ ] Unknown items are labeled `UNKNOWN`, not guessed.

### 3.2 Current functionality inventory

- [ ] All 41 models listed with purpose.
- [ ] All route groups and page groups listed.
- [ ] Absent models and routes explicitly named.
- [ ] Inventory re-runnable via documented commands.

### 3.3 Business process documentation

- [ ] Current-state value stream with handoffs.
- [ ] Failure modes and cycle times.
- [ ] RACI for the target state.
- [ ] Vertical-specific differences documented.

### 3.4 Automation opportunity report

- [ ] All eleven areas A–K present.
- [ ] Each has trigger, inputs, action, components, missing-information behavior, approval gate, failure detection.
- [ ] Each maps to a phase and a test row.
- [ ] No automation claims to exist today.

### 3.5 Assistant operations manual

- [ ] Daily, weekly, monthly routine.
- [ ] Queue playbooks for every queue type.
- [ ] Communication standards and templates.
- [ ] Escalation card.
- [ ] Glossary.

### 3.6 Assistant training curriculum

- [ ] Ten modules with objectives.
- [ ] Exercises and scenarios with model answers.
- [ ] 20-question assessment with answer key.
- [ ] Hard-stop check with 100% requirement.
- [ ] Certification and remediation rules.
- [ ] Two-week schedule.

### 3.7 Webinar presentation and script

- [ ] Slide plan with timing.
- [ ] Verbatim instructor script.
- [ ] Exercises and Q&A prompts.
- [ ] Takeaway checklist.
- [ ] Deliverable references accurate.

### 3.8 Talent inquiry response library

- [ ] At least 15 templates covering the full lifecycle.
- [ ] Auto-send vs human-review table.
- [ ] No template promises employment, rate, contract, or decision.
- [ ] Variables and governance defined.
- [ ] Scenarios with model responses.

### 3.9 Project listing evaluation playbook

- [ ] Source taxonomy.
- [ ] Ten scored dimensions with weights and caps.
- [ ] Decision tree and red flags.
- [ ] Verification checklist.
- [ ] Output schema and worked examples.
- [ ] Unverified listings cannot reach talent.

### 3.10 Talent qualification framework

- [ ] Four gates with pass conditions.
- [ ] Criteria by vertical and seniority.
- [ ] Bands and confidence levels.
- [ ] Disqualifiers and protected-characteristic exclusions.
- [ ] Decision tree and worked examples.
- [ ] Re-application and calibration.

### 3.11 Talent matching decision framework

- [ ] Hard filters with reason codes.
- [ ] Weighted ranking and bands.
- [ ] `insufficient_data` handling.
- [ ] Shortlist rules and no-match behavior.
- [ ] Overrides and forbidden reasons.
- [ ] Human gate and explanation format.

### 3.12 Proposed application architecture

- [ ] Reuse-first component map.
- [ ] Route and service responsibilities.
- [ ] Data flow from inquiry to assignment.
- [ ] Failure and fallback paths.
- [ ] No unnecessary vendor.

### 3.13 Database and integration recommendations

- [ ] Additive schema with relations and indexes.
- [ ] Migration strategy that avoids drift.
- [ ] Integration decisions for email, Drive, calendar, AI, scheduler.
- [ ] Env var list.
- [ ] Cost and alternatives.

### 3.14 Security and approval policy

- [ ] Data classification.
- [ ] Access matrix.
- [ ] Five hard stops with enforcement.
- [ ] Approval matrix.
- [ ] Redaction list.
- [ ] Retention and incident response.
- [ ] Findings and accepted gaps.

### 3.15 Phased implementation roadmap

- [ ] Phases with scope, dependencies, risks, tests, rollback.
- [ ] Exit criteria per phase.
- [ ] Cross-phase acceptance.
- [ ] Approval blocks.
- [ ] Open questions.

### 3.16 Testing and acceptance criteria (this document)

- [ ] Test matrix covers A–K.
- [ ] Acceptance criteria are objective and checkable.
- [ ] Defect severity and exit rules defined.
- [ ] Rollback and sign-off defined.

---

## 4. Security test cases

| ID | Case | Expected |
|---|---|---|
| SEC-01 | Contractor PATCH includes `agencyId` | Rejected or ignored; no change |
| SEC-02 | Admin from agency A GETs agency B contractor | 403/404 |
| SEC-03 | Reset-password with SMTP missing | No password in response or logs |
| SEC-04 | Contractor login generation | No plaintext credential in response body |
| SEC-05 | Public apply over rate limit | 429 |
| SEC-06 | Status lookup with wrong email | Same generic response as unknown reference |
| SEC-07 | Booking email with `<script>` | Escaped, not executed |
| SEC-08 | Growth lead consent unchecked | Stored as false |
| SEC-09 | AI payload contains a canary Restricted value | Redaction removes it; test fails otherwise |
| SEC-10 | Kill switch off | No AI call, no outbound email, queue-only mode |
| SEC-11 | Contractor reads another contractor's availability | 403 |
| SEC-12 | Client reads applicant data | 403 |
| SEC-13 | Upload with `.exe` | Rejected |
| SEC-14 | Upload over size cap | Rejected |
| SEC-15 | Hard-stop request (rate quote) | Blocked; escalation created |

---

## 5. Data-integrity test cases

| ID | Case | Expected |
|---|---|---|
| DAT-01 | Duplicate email submission | One applicant + duplicate flag, no double pipeline |
| DAT-02 | Promote twice | One profile, one contractor |
| DAT-03 | Concurrent assignment | One succeeds, one conflict, no double booking |
| DAT-04 | Decision without evidence | Rejected |
| DAT-05 | Advance without `decidedBy` | Rejected |
| DAT-06 | Rate outside band without exception | Blocked |
| DAT-07 | Deliverable transition invalid | Rejected by lifecycle guard |
| DAT-08 | Audit write failure | Request succeeds, alert raised |
| DAT-09 | Retention dry run | Reports counts, deletes nothing |
| DAT-10 | Deletion without approval | Blocked |

---

## 6. Non-functional tests

| Area | Test | Target |
|---|---|---|
| Performance | Apply submit p95 | < 1.5s excluding upload |
| Performance | Admin list p95 at 10k applicants | < 800ms |
| Availability | Health check over 30 days | 99.5% |
| Accessibility | axe on `/apply` | No critical/serious issues |
| Accessibility | Keyboard-only completion | Pass |
| Mobile | 375px completion | Pass |
| Email | Delivery to major providers | > 98% (sandbox measurement) |
| Resilience | SMTP down | Queue + visible failure, no data loss |
| Resilience | DB rate-limit fallback | Memory fallback active, alert raised |
| Cost | AI per-run and per-day caps | Never exceeded |

---

## 7. Defect severity

| Severity | Definition | Fix window |
|---|---|---|
| **Blocker** | Data loss, security breach, hard-stop bypass, cannot apply | Before release |
| **Critical** | Wrong decision recorded, cross-agency access, duplicate contractor | 24 hours |
| **Major** | Broken flow, missing audit, incorrect SLA, inaccessible form | 5 business days |
| **Minor** | Copy error, layout issue, non-blocking log noise | Next release |
| **Trivial** | Cosmetic | Backlog |

**Release rule:** zero open blockers or criticals. Majors require a written exception from the Lead Developer.

---

## 8. Test execution and evidence

For each phase, attach:

1. Command output for `npm run typecheck` and `npm run build`.
2. Unit and integration test summary.
3. E2E recording or screenshots.
4. Security test results, including the canary redaction test.
5. Accessibility report.
6. Manual QA checklist signed by the tester.
7. Rollback drill result.
8. Known defects with severity and owner.

Store evidence with the phase approval record. Do not paste real applicant data into evidence.

---

## 9. Manual QA scripts

### 9.1 Apply end-to-end

1. Open `/apply` on a 375px viewport.
2. Complete the form with synthetic data; leave a required field empty (expect an error).
3. Submit; confirm the reference and acknowledgment.
4. Confirm the admin queue item, owner, and due date.
5. Look up status with the correct reference + email (success) and a wrong email (generic).
6. Withdraw; confirm the confirmation and stopped sequences.

### 9.2 Review and decision

1. Open the applicant; confirm evidence links.
2. Record a rubric review; confirm score, band, and notes.
3. Attempt `advance` without evidence (expect rejection).
4. Record `advance` as admin; confirm the timeline and audit.
5. Confirm no decline/advance email sends when the flag is off.

### 9.3 Listing and matching

1. Capture an unverified listing; confirm it cannot be sent to talent.
2. Verify the buyer; move to `pursue`.
3. Extract requirements; confirm missing fields are listed.
4. Generate a shortlist; confirm 2–5 entries with reasons.
5. Select a candidate as admin; confirm no auto-contact.
6. Attempt an assignment that conflicts with availability (expect block).

### 9.4 Exception drill

1. Create an S1 exception (simulated).
2. Confirm owner notification and escalation.
3. Confirm the downstream action is blocked.
4. Resolve with a note; confirm closure requires a human.
5. Confirm the post-incident record has no PII.

---

## 10. Rollback testing

| Change | Rollback | Verification |
|---|---|---|
| New public route | Flag off; route returns maintenance | Form inaccessible; no records created |
| New tables | Leave unused; no reads | Existing flows unaffected |
| Email templates | Flag off; draft-only | No outbound messages |
| AI adapter | `TALENT_AI_ENABLED=false` | Deterministic path works |
| Scheduler | Disable job | Queue still operable manually |
| Migration | Forward-only; restore from backup if destructive | Staging drill passes |

**Rule:** every phase must execute its rollback once in staging before production rollout.

---

## 11. Acceptance sign-off

| Field | Value |
|---|---|
| Phase | |
| Test lead | |
| Date | |
| Typecheck | Pass / Fail |
| Build | Pass / Fail |
| Unit/integration | x/y pass |
| Security | x/15 pass |
| Accessibility | Pass / Fail |
| Rollback drill | Pass / Fail |
| Open blockers | 0 required |
| Open criticals | 0 required |
| Exceptions | |
| Approved by | |
| Signature | |

No phase is accepted without this block. Acceptance is recorded in the phase approval template in `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md` §15.2.

---

## 12. What this document does not do

- It does not authorize test data that contains real personal information.
- It does not replace the security review.
- It does not permit shipping with open blockers.
- It does not make a phase accepted without Lead Developer sign-off.

**End of testing and acceptance criteria.**
