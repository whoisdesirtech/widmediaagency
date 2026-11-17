# 09 — Rate Card and Negotiation Framework

**Purpose:** Make rate conversations consistent, margin-aware, and legally safe without turning the assistant into a negotiator.
**Status:** `PROPOSED` framework. **All numeric bands below are placeholders and must be calibrated by the Principal before use.**
**Hard rule:** the assistant never quotes, promises, or negotiates a rate. It records the expectation and routes the decision.

---

## 1. What the system already supports

`CONFIRMED`:

- SOW stores `rate` (Float), `rateType`, and `paymentSchedule` (`prisma/schema.prisma:104-121`).
- `rateType` values: `hourly | half-day | full-day | project | monthly-retainer` (`prisma/schema.prisma:109`).
- `paymentSchedule` values: `weekly | biweekly | monthly | net15 | net30` (`prisma/schema.prisma:110`).
- Additional equipment and software terms are stored per SOW (`prisma/schema.prisma:113-114`).
- The SOW API blocks contractors from changing rate or payment terms (`src/app/api/sows/route.ts:68-70`).
- Role addenda capture rate-adjacent scope such as revision rounds, licensing, travel, and equipment (`src/data/addenda.ts:21-189`).

`CONFIRMED` gap: there is no rate card, rate history, benchmark, margin calculation, or approval record. Rates exist only inside individual SOWs.

---

## 2. Rate architecture

### 2.1 Rate types

| Type | Use when | Unit | Risk |
|---|---|---|---|
| `hourly` | Small, variable tasks; consulting; editing | Hour | Scope creep; requires time tracking |
| `half-day` | Shoot or workshop up to 4–5 hours | Half-day | Travel/overrun ambiguity |
| `full-day` | Shoot or production day up to 10 hours | Day | Overtime and turnaround rules |
| `project` | Defined deliverable with clear scope | Project | Revision/scope creep |
| `monthly-retainer` | Ongoing content/social/design capacity | Month | Capacity ambiguity; priority conflicts |

### 2.2 Rate components

A complete rate decision considers:

```
Base creative rate
+ Equipment / kit fee
+ Travel / per diem
+ Licensing / usage fee
+ Rush / overtime premium
+ Third-party costs (music, stock, printing, permits)
− Volume / retainer discount
= Proposed engagement cost
```

The SOW captures base rate plus equipment/software notes. It does **not** have structured fields for licensing, rush, or third-party costs (`prisma/schema.prisma:104-121`). `PROPOSED`: add these as structured SOW line items or a `RateComponent` table.

### 2.3 Illustrative bands (placeholders)

> **Do not use these numbers externally.** They exist only to show the shape of the rate card. The Principal must set real bands by role, seniority, and market.

| Role | Junior | Mid | Senior | Lead |
|---|---|---|---|---|
| Photographer (day) | $TBD | $TBD | $TBD | $TBD |
| Videographer / DP (day) | $TBD | $TBD | $TBD | $TBD |
| Editor (day) | $TBD | $TBD | $TBD | $TBD |
| Content/Social manager (month) | $TBD | $TBD | $TBD | $TBD |
| Copywriter (project) | $TBD | $TBD | $TBD | $TBD |
| Designer (project) | $TBD | $TBD | $TBD | $TBD |
| Web designer (project) | $TBD | $TBD | $TBD | $TBD |
| Motion designer (day) | $TBD | $TBD | $TBD | $TBD |

**Calibration inputs required from the Principal:**

1. Minimum acceptable margin per engagement type.
2. Approved bands for each role and seniority.
3. Travel and per-diem policy.
4. Licensing/usage multipliers.
5. Rush and overtime rules.
6. Retainer capacity definitions (hours or deliverables per month).
7. Payment schedule policy by client size.

---

## 3. Margin guardrails

### 3.1 Definitions

```
Gross margin = (client price − talent cost − direct costs) / client price
```

Direct costs include equipment rental, travel, permits, stock/music, printing, and platform fees.

### 3.2 Proposed thresholds

| Engagement type | Minimum gross margin | Review trigger |
|---|---|---|
| Project | 40% | < 35% |
| Retainer | 45% | < 40% |
| Rush (< 72 hours) | 50% | < 45% |
| New client (first project) | 35% | < 30% |
| Strategic account | Principal approval | Any below 30% |

These are `PROPOSED`; replace with the agency's actual targets.

### 3.3 Below-threshold handling

If a proposed rate produces margin below the threshold:

1. The assistant flags `margin_below_threshold` with the calculation.
2. The Principal chooses: adjust client price, adjust scope, adjust talent rate, or approve an exception with a reason.
3. The exception is recorded; it is not normalized.

---

## 4. Rate decision workflow

```
Need created
  → Role + seniority + scope defined
  → System proposes band (read-only)
  → Talent expectation recorded
  → Margin calculated
  → Principal approves / adjusts / declines
  → Rate locked in SOW
  → Any change requires a new approval
```

### 4.1 Who can do what

| Action | Assistant | Ops Lead | Principal | Finance |
|---|---|---|---|---|
| Record expectation | Yes | Yes | Yes | No |
| Propose band from approved card | Yes | Yes | Yes | No |
| Discuss range with talent | **No** | Only approved ranges | Yes | No |
| Set final rate | **No** | **No** | Yes | Consulted |
| Approve below-margin exception | **No** | **No** | Yes | Consulted |
| Change an approved rate | **No** | **No** | Yes | Consulted |
| Sign the SOW | **No** | **No** | Yes | No |

---

## 5. Negotiation principles

1. **Anchor on scope, not on the number.** "Here's what's included" before "here's what it costs."
2. **Never negotiate against yourself.** Ask once, listen, respond once.
3. **Trade, don't discount.** If the rate must move, reduce scope, extend timeline, reduce revisions, or change usage rights.
4. **Protect the floor.** A below-floor rate needs a written exception, not a wink.
5. **Be transparent about constraints.** "Our budget for this scope is X; here's what we can do within it."
6. **Respect the talent.** A low offer with a clear reason is better than a vague maybe.
7. **Walk away cleanly.** If the gap is too large, say so and preserve the relationship.

---

## 6. Negotiation scripts

### 6.1 Talent asks for a higher rate

> **Talent:** "My day rate is [X]."
>
> **Ops:** "Thanks for being direct. I've recorded [X]. Our approved range for this scope is [range], because [scope/usage/timeline]. If [X] is firm, I'll take it to the Principal with the scope as described. I can't confirm anything today."

Do **not** say: "That's too high", "We can do [number]", or "I'm sure we can make it work."

### 6.2 Talent asks for a lower-scope option

> **Ops:** "We can adjust scope rather than rate. Options: reduce the shot count from [A] to [B], remove [deliverable], or move delivery from [date] to [date]. Which trade-off works best?"

### 6.3 Client pushes for a lower price

> **Ops:** "We can meet that budget by adjusting [scope/deliverable/timeline]. The creative rate itself is set by the Principal. I'll send two options: [reduced scope at target price] and [full scope at current price]."

### 6.4 Client asks for a rush

> **Ops:** "Rush delivery within [X] days requires a premium and may change the review timeline. I'll confirm availability and send the revised scope and rate for approval."

### 6.5 Usage/licensing request

> **Ops:** "The rate covers [usage] for [duration/territory]. Extended usage is a separate license. I'll send the options."

### 6.6 Rate increase request at renewal

> **Ops:** "Thanks for raising it. I'll review the last [N] engagements, delivery quality, and current scope, and the Principal will respond by [date]. I can't confirm a change today."

---

## 7. Rate review at renewal

### 7.1 Triggers

- 12 months since last rate change.
- Scope increased by more than 20%.
- Consistently high performance (top quartile).
- Market shift or new competitor data.
- Talent requests a review.
- Margin erosion on renewals.

### 7.2 Inputs

- On-time delivery rate.
- First-pass approval rate.
- Revision loops.
- Client feedback.
- Utilization.
- Scope change.
- Current approved band.

### 7.3 Rules

- No increase without a performance record.
- No increase without a margin check.
- No decrease without a documented performance or scope reason.
- Every change is recorded with the approver and effective date.

---

## 8. Payment terms

### 8.1 Policy

| Term | Use |
|---|---|
| `net15` | Default for small projects and new talent |
| `net30` | Default for established clients |
| `weekly` | Ongoing production with weekly invoicing |
| `biweekly` | Retainers or long productions |
| `monthly` | Retainers |

### 8.2 Rules

- Payment terms are stated in the SOW (`prisma/schema.prisma:110`).
- Contractor pay is contingent on client payment unless the SOW states otherwise (`src/data/clauses.ts:31`).
- Late payment interest and work-pause rights are in the compensation clause (`src/data/clauses.ts:31`). Confirm enforceability with counsel.
- The assistant may send reminders; it may not promise a payment date outside the SOW.

---

## 9. Red flags

| Red flag | Risk | Action |
|---|---|---|
| Talent demands payment before contract | Compliance/fraud | Hard stop; Principal |
| Client demands work before signature | Scope/legal | Hard stop; Principal |
| Rate far below band | Quality/exploitation | Probe scope; do not auto-accept |
| Rate far above band with no differentiation | Margin | Principal decision |
| Requests for off-platform payment | Fraud/tax | Decline; document |
| Pressure to classify as contractor when acting as employee | Legal | Counsel review |
| Unclear usage rights | Licensing dispute | Define in writing before work |
| Endless revisions without a limit | Margin | Enforce SOW revision count |

---

## 10. Data model implications (`PROPOSED`)

| Need | Proposed model | Key fields |
|---|---|---|
| Rate card | `RateBand` | role, seniority, rate_type, min, max, currency, effective_from |
| Rate history | `TalentRate` | contractor_id, rate, rate_type, approved_by, effective_from, effective_to |
| SOW line items | `SowRateComponent` | sow_id, type, amount, taxable, notes |
| Margin check | computed at SOW creation | client_price, talent_cost, direct_cost, margin_pct |
| Exception | `RateException` | sow_id, requested_by, approved_by, reason, expires_at |

Reuse `SOW` (`prisma/schema.prisma:104-121`) rather than creating a parallel engagement record.

---

## 11. Quarterly rate review agenda

1. Margin by engagement type.
2. Rate variance vs approved band.
3. Exceptions granted and why.
4. Talent retention vs rate.
5. Client price vs talent cost trends.
6. Update bands (Principal only).
7. Communicate changes only after approval.

---

## 12. Quick card

| Question | Answer |
|---|---|
| Can I quote a rate? | No. |
| Can I record an expectation? | Yes. |
| Can I say "that's too high"? | No. Say "I'll take it to the Principal." |
| Can I offer a lower rate to win the deal? | No. Offer reduced scope instead. |
| Can I promise a payment date? | Only the date in the signed SOW. |
| Can I approve a below-margin deal? | No. Principal only. |
| What if the talent pressures me? | "I can't confirm that today. I'll respond by [date]." |
| What if the client pressures me? | Same, plus a scope option. |

**Compensation is never an assistant decision.**
