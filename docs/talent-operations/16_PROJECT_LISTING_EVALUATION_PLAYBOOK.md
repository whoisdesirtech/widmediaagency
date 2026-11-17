# 16 — Project Listing Evaluation Playbook

**Purpose:** Decide quickly and consistently whether an opportunity is a real, fundable, well-scoped project the agency can staff — before any talent is contacted or any promise is made.
**Status:** `PROPOSED` operating playbook.
**Scope:** Inbound client inquiries, referrals, RFPs, partner messages, and marketplace listings that could become agency projects.
**Hard rule:** An unverified listing is **never** presented to talent as an approved agency project.

---

## 1. What counts as a project listing

| Source | Examples | Current platform support |
|---|---|---|
| Inbound client inquiry | Website contact, booking form, email | `BookingInquiry` exists for event/speaker inquiries (`prisma/schema.prisma:366-376`); no general project intake |
| Marketing lead | Growth landing page, masterclass, referral form | `GrowthLead` exists (`prisma/schema.prisma:453-479`) with score/tier/status; no admin GET/UI |
| Prospecting | Outbound research on target clients | `Prospect` + `ProspectIntelligence` exist (`prisma/schema.prisma:389-425`) |
| Referral | Existing client or partner introduction | No model; capture manually |
| RFP / marketplace | Public brief, creative platform listing | No model; capture manually |
| Repeat business | New scope from an existing client | `Client`, `SOW`, `Project` exist (`prisma/schema.prisma:151-215`) |

`CONFIRMED`: the platform captures client interest but has **no** opportunity record that links a demand signal to requirements, a shortlist, or a staffing decision. `GrowthLead` stores budget fields and a deterministic score but has no GET route (`src/app/api/growth-lead/route.ts` exports POST only).

---

## 2. Evaluation dimensions

Score each dimension 0–5. The score is evidence-based; write one sentence of evidence per dimension.

| # | Dimension | Question | 0 | 3 | 5 |
|---|---|---|---|---|---|
| 1 | Identity | Do we know who the buyer is? | Anonymous | Named person, unverified company | Verified company + named decision-maker |
| 2 | Authority | Can this person approve spend? | Unknown | Influencer | Budget holder confirmed |
| 3 | Budget | Is there a real budget signal? | None | Range mentioned | Approved range in writing |
| 4 | Scope clarity | Can we describe the deliverable? | Vague | Draft brief | Written brief with deliverables and counts |
| 5 | Timeline | Are dates feasible? | Impossible | Tight but possible | Realistic with buffer |
| 6 | Rights and usage | Are rights defined? | Rights grab / unlimited | Partly defined | Defined term, territory, media |
| 7 | Fit | Can our network do this well? | Outside all verticals | Partial fit | Strong fit in an existing vertical |
| 8 | Commercial | Is the margin plausible? | Below cost | Thin | Within approved band |
| 9 | Risk | Any legal, safety, or reputational issue? | Serious | Manageable | None |
| 10 | Relationship | Is there trust or history? | Cold, no history | Warm intro | Existing client in good standing |

### 2.1 Weighted score

| Dimension | Weight |
|---|---|
| Identity | 10% |
| Authority | 10% |
| Budget | 15% |
| Scope clarity | 15% |
| Timeline | 10% |
| Rights and usage | 10% |
| Fit | 15% |
| Commercial | 5% |
| Risk | 5% |
| Relationship | 5% |

**Bands:**

- **4.0–5.0 → Pursue.** Assign an owner and a response deadline.
- **3.0–3.9 → Qualify.** Ask the missing questions before committing effort.
- **2.0–2.9 → Hold.** Keep on file; revisit if the client clarifies.
- **0–1.9 → Decline.** Record the reason; do not recycle silently.

**Any score of 0 on Identity, Authority, Budget, or Risk caps the listing at `unverified` regardless of the total.** This is deliberate: a beautiful brief from an anonymous buyer is not a project.

---

## 3. Decision tree

```
New listing
│
├─ Is the source trusted (existing client, verified referral, known partner)?
│   ├─ No → verify identity first; status = unverified
│   └─ Yes ↓
├─ Is there a named buyer with authority?
│   ├─ No → Qualify: ask "who approves the budget?"
│   └─ Yes ↓
├─ Is there a budget signal?
│   ├─ No → Qualify; do not discuss rate or hold talent
│   └─ Yes ↓
├─ Is the scope specific enough to price?
│   ├─ No → Request a written brief; keep in Qualify
│   └─ Yes ↓
├─ Are rights and usage defined?
│   ├─ No → Ask; flag as a contract risk
│   └─ Yes ↓
├─ Can we staff it within the dates?
│   ├─ No → Decline or propose a revised date
│   └─ Yes ↓
├─ Does the margin fit an approved band?
│   ├─ No → Rate exception or decline
│   └─ Yes → Pursue
│
Never: contact talent, promise a date, or quote a rate before Pursue.
```

---

## 4. Verification checklist

Before a listing moves from `unverified` to `pursue`:

- [ ] Buyer's full name, role, and company confirmed.
- [ ] Company website and a business contact match the domain.
- [ ] Budget range or approval confirmed in writing.
- [ ] Written scope with deliverable counts.
- [ ] Dates and location confirmed.
- [ ] Rights, usage, and exclusivity stated.
- [ ] Payment terms and invoicing entity confirmed.
- [ ] No request for unpaid speculative work beyond a defined paid pitch.
- [ ] No conflict with an existing client or exclusivity clause.
- [ ] Safety, legal, and reputational check complete.
- [ ] Owner assigned and response deadline set.
- [ ] Recorded in `ProjectOpportunity` with source and evidence links.

---

## 5. Red flags (stop and escalate)

| Red flag | Why it matters | Action |
|---|---|---|
| "We'll pay after the campaign succeeds" | No guaranteed budget | Decline or require a fixed fee |
| "Send free samples first" | Unpaid speculative work | Decline; offer a paid pitch |
| Unlimited rights for all media, forever | Rights grab | Escalate; require a defined license |
| No named buyer | Cannot verify authority | Keep unverified |
| Rush deadline with no brief | Setup for failure | Qualify or decline |
| Budget far below band | Negative margin | Decline or rate exception |
| Requests talent contact details before scope | Data sharing risk | Refuse; share profiles only with consent |
| Asks for tax or bank details before a contract | Fraud risk | Refuse; escalate |
| NDA with no project | Restricts the agency for free | Decline or limit term |
| "Exposure" or "portfolio opportunity" as payment | Not a budget | Decline |
| Client is a competitor or conflicted | Reputational/legal | Escalate |
| Listing asks for a specific named talent | Possible poaching | Escalate; do not share contact data |

---

## 6. Evaluation record (output schema)

```json
{
  "opportunityId": "opp_...",
  "source": "referral | inbound | growth_lead | prospect | rfp | marketplace | repeat_client",
  "sourceDetail": "string",
  "buyer": {
    "name": "string",
    "role": "string",
    "company": "string",
    "email": "string",
    "verified": false
  },
  "scores": {
    "identity": { "score": 0, "evidence": "string" },
    "authority": { "score": 0, "evidence": "string" },
    "budget": { "score": 0, "evidence": "string" },
    "scopeClarity": { "score": 0, "evidence": "string" },
    "timeline": { "score": 0, "evidence": "string" },
    "rights": { "score": 0, "evidence": "string" },
    "fit": { "score": 0, "evidence": "string" },
    "commercial": { "score": 0, "evidence": "string" },
    "risk": { "score": 0, "evidence": "string" },
    "relationship": { "score": 0, "evidence": "string" }
  },
  "weightedScore": 0.0,
  "band": "pursue | qualify | hold | decline | unverified",
  "missingInformation": ["string"],
  "redFlags": ["string"],
  "ownerUserId": "string",
  "responseDeadline": "ISO-8601",
  "decision": "string",
  "decidedBy": "string",
  "decidedAt": "ISO-8601"
}
```

Every field marked `verified` must link to evidence. A human records `decision` and `decidedBy`.

---

## 7. Worked examples

### 7.1 Strong inbound project

A hotel group asks for a two-day brand shoot in Miami, names the marketing director, gives a $18–24k range, dates six weeks out, and asks for usage in web and social for 12 months.

- Identity 5, Authority 5, Budget 5, Scope 4, Timeline 5, Rights 4, Fit 5, Commercial 4, Risk 5, Relationship 3.
- Weighted ≈ 4.55 → **Pursue**. Confirm the shot list and rights, then match photography talent.

### 7.2 Attractive but unverified

A "well-funded startup" asks for a full brand campaign, no name, no budget, "we'll discuss after the pitch," and wants three concepts for free.

- Identity 1, Authority 1, Budget 0, Scope 2, Timeline 3, Rights 1, Fit 4, Commercial 1, Risk 3, Relationship 1.
- Caps at **unverified**. Ask for a named buyer and budget; decline the free concepts.

### 7.3 Right client, wrong scope

An existing client asks for a documentary in four weeks with a budget below the band and unlimited rights.

- High identity/authority/relationship, low timeline/commercial/rights.
- Weighted ≈ 3.0 → **Qualify**, but escalate the rights and timeline; do not accept unlimited rights by default.

### 7.4 Listing that should be declined

A marketplace post offers "exposure and credit" for a full-day event shoot with 500 edited images in 24 hours.

- Budget 0, Timeline 1, Commercial 0, Risk 3.
- **Decline.** Record "no budget / unrealistic delivery" and do not route to talent.

---

## 8. Routing and SLAs

| Band | Owner | First action | Deadline |
|---|---|---|---|
| Pursue | Ops Lead | Confirm scope and budget; start requirements | 1 business day |
| Qualify | Ops Lead | Send the missing-information questions | 2 business days |
| Hold | Ops Lead | Set a review date | 10 business days |
| Decline | Ops Lead | Record reason and close | 1 business day |
| Unverified | Ops Lead | Verify identity and authority | 2 business days |

SLA source: `04_TALENT_JOURNEY_AND_SLA_MAP.md`.

---

## 9. Integration with the platform

### 9.1 Reuse

- `GrowthLead` for marketing-origin leads, with its existing deterministic score (`src/lib/growth.ts:54-146`).
- `Prospect` / `ProspectIntelligence` for researched target clients.
- `BookingInquiry` for event inquiries.
- `Client`, `SOW`, `Project` once the opportunity is won.

### 9.2 Add

`ProjectOpportunity` and `OpportunityRequirement` (see `12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` and `22_DATABASE_AND_INTEGRATION_RECOMMENDATIONS.md`). Link `growthLeadId`, `prospectId`, or `bookingInquiryId` as optional foreign keys rather than copying data.

### 9.3 Do not

- Do not overload `GrowthLead` with talent or project fields.
- Do not scrape marketplaces without written approval and terms review.
- Do not auto-message a buyer or talent.
- Do not create a `Project` before a signed SOW.

---

## 10. Weekly listing review

Every week, the Ops Lead reviews:

- New listings and their bands.
- `unverified` listings older than 2 business days.
- `qualify` listings with no response.
- Declines and their reasons.
- Pursuit-to-proposal conversion.
- Any listing that reached talent without verification (should be zero).

---

## 11. Checklist for the evaluator

- [ ] Source and evidence captured.
- [ ] Buyer verified or marked unverified.
- [ ] Budget signal recorded, not assumed.
- [ ] Scope specific enough to price.
- [ ] Rights and usage explicit.
- [ ] Timeline feasible.
- [ ] Fit within a service category.
- [ ] Risk reviewed.
- [ ] Band assigned with a reason.
- [ ] Owner and deadline set.
- [ ] No talent contacted before `pursue`.

**End of playbook.**
