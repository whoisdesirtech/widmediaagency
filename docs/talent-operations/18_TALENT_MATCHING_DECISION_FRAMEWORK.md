# 18 — Talent Matching Decision Framework

**Purpose:** Turn a confirmed project requirement and the qualified talent pool into a short, explainable shortlist — and make clear that a human, not the system, makes the assignment.
**Status:** `PROPOSED`.
**Scope:** Matching qualified talent to a specific opportunity or project.
**Related:** `16_PROJECT_LISTING_EVALUATION_PLAYBOOK.md`, `17_TALENT_QUALIFICATION_FRAMEWORK.md`, `09_RATE_CARD_AND_NEGOTIATION_FRAMEWORK.md`, `12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md`.

---

## 1. Principles

1. **Eligibility before ranking.** A person who cannot legally or practically do the work is never ranked.
2. **Evidence over vibes.** Every score cites a record.
3. **Explain every candidate.** A shortlist without reasons is not a shortlist.
4. **Show uncertainty.** Thin history is labeled `insufficient_data`, not treated as strong.
5. **Human decides.** The system recommends; a human offers.
6. **No promises.** Matching does not create an engagement, rate, or start date.
7. **Fairness by design.** Protected characteristics are never inputs. Location is used only where the work requires it.

---

## 2. Inputs

### 2.1 From the requirement

| Field | Required | Source |
|---|---|---|
| Service category | Yes | `OpportunityRequirement` |
| Role(s) | Yes | Requirement |
| Skills and level | Yes | Requirement |
| Start and end dates | Yes | Requirement |
| Location / remote | Yes | Requirement |
| Crew size | Yes | Requirement |
| Budget band | Yes for paid work | Approved rate band |
| Rights and usage | Yes | Requirement |
| Client restrictions | If any | Client record |
| Risk level | Yes | Listing evaluation |

### 2.2 From the talent record

| Field | Required | Source |
|---|---|---|
| Qualification band and confidence | Yes | `TalentReview` |
| Skills and verified level | Yes | `TalentSkill` |
| Availability | Yes | `TalentAvailability` |
| Rate band | Yes for paid work | `TalentRate` / `RateBand` |
| Location, timezone, travel radius | Yes | `TalentProfile` |
| Reliability and quality | If available | `TalentPerformance` |
| Compliance status | Yes | `TalentCredential` |
| Conflicts | Yes | Bookings, client restrictions |

---

## 3. Stage 1 — Hard eligibility filters

A candidate is excluded if **any** filter fails. Record the exclusion reason; do not silently drop.

| Filter | Rule | Exclusion reason code |
|---|---|---|
| Qualification | Band is `qualified` or `qualified_with_gaps` | `not_qualified` |
| Consent | Consent is current | `no_consent` |
| Skill | Has the required skill at or above the required level | `skill_gap` |
| Availability | Available for the full date range | `unavailable` |
| Location | Can work on-site or remotely as required | `location_mismatch` |
| Timezone | Can cover the required hours | `timezone_mismatch` |
| Compliance | Required documents valid or waiver approved | `compliance_gap` |
| Rate | Rate band fits the approved budget, or an exception exists | `rate_mismatch` |
| Conflict | No existing booking or client restriction | `conflict` |
| Rights | Can grant the required usage | `rights_mismatch` |
| Confidence | Meets the minimum confidence for the risk level | `low_confidence` |

**Rule:** `qualified_with_gaps` may pass only if the gap is unrelated to the requirement, or a human explicitly approves a supervised placement.

---

## 4. Stage 2 — Weighted ranking

Only eligible candidates are ranked. Weights are configurable per service category and project type; the defaults below are the starting point.

| Factor | Weight | Evidence | Notes |
|---|---|---|---|
| Skill match | 30% | `TalentSkill.level` vs required level | Exact skill > adjacent skill |
| Relevant experience | 20% | Portfolio pieces in the same format/genre | Recency matters |
| Quality | 20% | `TalentPerformance.quality` or rubric score | `insufficient_data` if < 3 data points |
| Reliability | 15% | On-time delivery, response rate, no-shows | `insufficient_data` if < 3 data points |
| Availability fit | 5% | Full range, buffer, travel | Already filtered; rewards flexibility |
| Commercial fit | 5% | Rate vs band, no exception needed | Never reward below-market rates |
| Relationship | 5% | Prior successful work with the agency/client | Not a popularity score |

### 4.1 Score normalization

- Each factor is scored 0–5.
- Weighted score = Σ (factor score × weight).
- Band: **Strong (4.0+)**, **Good (3.0–3.9)**, **Possible (2.0–2.9)**, **Weak (<2.0)**.
- Ties break by: quality, then reliability, then earliest availability, then a documented human tiebreak.

### 4.2 `insufficient_data` handling

If quality or reliability has fewer than three data points:

- Score the factor at the pool median, not at 5.
- Label the candidate `insufficient_data`.
- Cap the overall band at **Good**.
- Require a human note to place the candidate above a proven candidate.

---

## 5. Stage 3 — Shortlist rules

| Rule | Value |
|---|---|
| Minimum shortlist | 2 eligible candidates, or an explicit "no match" record |
| Maximum shortlist | 5 candidates |
| Diversity of option | Include at least one `qualified_with_gaps` candidate when the top two are close |
| Explanation | Every candidate has a one-line reason and evidence links |
| Exclusions | Every excluded candidate has a reason code |
| Freshness | Availability checked at shortlist time and again before the offer |
| Human review | Required before any contact |

If fewer than two eligible candidates exist, the system must:

1. return the shortlist it has,
2. create a `source_talent` task,
3. state which filter eliminated the most people,
4. never lower the bar automatically.

---

## 6. Decision tree

```
Confirmed requirement
│
├─ Is the requirement complete (role, dates, location, budget, rights)?
│   ├─ No → return to requirement extraction; do not match
│   └─ Yes ↓
├─ Apply hard filters
│   ├─ Zero eligible → "no match" + sourcing task + filter analysis
│   └─ One or more ↓
├─ Rank eligible candidates
├─ Is the top candidate within the approved rate band?
│   ├─ No → rate exception path; do not shortlist as approved
│   └─ Yes ↓
├─ Is availability confirmed for the full range?
│   ├─ No → exclude or mark tentative; re-check before offer
│   └─ Yes ↓
├─ Does the candidate meet the confidence threshold for the risk level?
│   ├─ No → mark "supervised only" and require human approval
│   └─ Yes ↓
└─ Produce shortlist with reasons → human selects → human offers
```

---

## 7. Overrides

A human may override any ranking. The override requires:

- the candidate selected,
- the candidate(s) skipped,
- a reason code (`relationship`, `specific_skill`, `availability`, `client_request`, `development`, `other`),
- a written note,
- the approver,
- a timestamp.

**Forbidden override reasons:** protected characteristics, "cheaper", "easier", or "the client will like them more" without a work-related basis.

---

## 8. Worked examples

### 8.1 Event photographer, Miami, two days

Requirement: photography, event, Miami, 2 days, $1,800–2,400/day, web/social rights 12 months, medium risk.

- 6 eligible; 2 excluded for `unavailable`, 1 for `rate_mismatch`.
- Top candidate: strong skill match, 8 relevant events, quality 4.5 (6 data points), reliability 4.7, rate $2,100.
- Second: slightly lower quality, available, $1,900, `insufficient_data` on reliability.
- **Shortlist of 3**, with the top two explained. Human selects after a portfolio check.

### 8.2 Documentary editor, remote, four weeks

Requirement: editor, remote, 4 weeks, documentary, $700–900/day, high risk.

- 2 eligible; 1 `qualified_with_gaps` (no long-form credit).
- Top candidate has 3 documentary credits and high reliability.
- **Shortlist of 2.** The gap candidate is labeled "supervised only." Human decides whether to take the risk.

### 8.3 No eligible talent

Requirement: underwater cinematographer, 3 days, remote island, next week.

- Zero eligible: no skill match, no availability.
- **No match.** Create a sourcing task, state the filter that eliminated everyone, and do not offer a lower-quality substitute as if it were equivalent.

### 8.4 Rate exception

Top candidate's rate is 20% above the band.

- Shortlist includes the candidate with a `rate_exception_required` flag.
- No offer until an admin approves the exception (`09_RATE_CARD_AND_NEGOTIATION_FRAMEWORK.md`).
- The system may show a second candidate within band.

### 8.5 Client requests a specific person

- Verify the person is qualified and available.
- Check the rate and conflict.
- Record the client request as the override reason.
- Do not bypass compliance or consent.

---

## 9. Failure modes and handling

| Failure | Symptom | Handling |
|---|---|---|
| Stale availability | Candidate booked elsewhere | Re-check before offer; treat as a conflict |
| Incomplete requirement | Vague role or dates | Return to extraction; do not guess |
| Thin history | Everyone is `insufficient_data` | Lower confidence cap, require human review, do not invent scores |
| Popular candidate | Same person on every shortlist | Check utilization and bench balance |
| Filter too strict | Zero eligible repeatedly | Review the requirement, not the people |
| Filter too loose | 40 eligible, no ranking signal | Tighten must-have skills |
| Rate inflation | Candidates cluster above band | Review the band, not the candidates |
| Bias | Homogeneous shortlists | Audit by source, vertical, and reviewer; calibrate |

---

## 10. Explanation format

Every shortlist entry uses this shape:

```
Candidate: [name or internal ID]
Band: Strong / Good / Possible / Weak (score)
Why: [one sentence tied to the requirement]
Evidence: [portfolio link], [performance record], [availability record]
Risks: [gap, conflict, rate exception, low confidence]
Next step: [portfolio check / interview / reference / rate approval]
```

No adjectives without evidence. No ranking without a reason.

---

## 11. Human approval gate

| Action | Who |
|---|---|
| Generate shortlist | System |
| Review shortlist | Ops Lead |
| Approve a `qualified_with_gaps` placement | Admin |
| Approve a rate exception | Admin |
| Select the candidate | Admin or delegated Ops Lead |
| Make the offer | Admin, in writing, after rate and availability are confirmed |
| Communicate the start date | Admin, after the contract is signed |

**The system never contacts talent about an assignment.** It prepares the internal recommendation and, at most, an approved draft for human review.

---

## 12. Metrics

| Metric | Definition | Target |
|---|---|---|
| Fill rate | Requirements filled within SLA / total | ≥ 90% |
| Time to shortlist | Requirement confirmed → shortlist ready | ≤ 1 business day |
| Shortlist acceptance | Human accepts one of the top 3 / total | ≥ 80% |
| Override rate | Overrides / selections | Tracked, investigate > 25% |
| No-match rate | Requirements with zero eligible | Tracked by cause |
| Conflict rate | Offers blocked by stale availability | < 5% |
| Bench balance | Assignments per active talent per quarter | Within a healthy range |

---

## 13. Quick reference card

```
1. REQUIREMENT COMPLETE?  No → extract, don't guess
2. HARD FILTERS          qualification, consent, skill, dates, location,
                         compliance, rate, conflict, rights, confidence
3. RANK                  skill 30 · experience 20 · quality 20 ·
                         reliability 15 · availability 5 · commercial 5 · relationship 5
4. SHORTLIST             2–5, every entry explained, exclusions coded
5. HUMAN                 selects, approves rate, offers, confirms start
6. NEVER                 promise, negotiate, or contact talent automatically
```

**End of framework.**
