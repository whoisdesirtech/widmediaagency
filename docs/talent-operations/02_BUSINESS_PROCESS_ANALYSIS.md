# 02 — Business Process Analysis

**Scope:** Creative talent operations for Photography, Videography, Content & Social, and Design & Creative.
**Method:** Walk the value stream stage by stage, compare what the code enforces today with what the business needs, and identify where work stalls.
**Evidence labels:** `CONFIRMED` / `LIKELY` / `UNKNOWN` / `PROPOSED`.

---

## 1. Current-state value stream

```
CLIENT NEED
   │
   ▼
[Sales / Growth] ── GrowthLead captured ──► internal email only
   │
   ▼
[Manual hiring decision] ── admin remembers who is available (no system)
   │
   ▼
[Contractor record] ── admin types 6 fields ──► /contractors/new
   │
   ▼
[Role] ── admin approves a ContractorRole ──► training auto-assigned
   │
   ▼
[SOW] ── admin creates rate + deliverables ──► contractor notified
   │
   ▼
[Contract] ── assemble master + SOW + addendum ──► signatures
   │
   ▼
[Assignment] ── admin assigns Deliverable/ProjectTask (no capacity check)
   │
   ▼
[Production] ── contractor accepts, works, submits via Drive URL/attachments
   │
   ▼
[Client review] ── client accepts or requests changes
   │
   ▼
[Admin final approval] ── admin approves, closes
   │
   ▼
[Invoice] ── client invoice (no contractor payout record)
   │
   ▼
[Retention] ── nothing systematic
```

### 1.1 What the code actually enforces

| Stage | Enforced behavior | Evidence | Label |
|---|---|---|---|
| Lead capture | `GrowthLead` stored; deterministic qualification; internal email | `src/app/api/growth-lead/route.ts:61-157`; `src/lib/growth.ts:54-146` | `CONFIRMED` |
| Hiring decision | No record; only `Contractor.status` default `invited` | `prisma/schema.prisma:60` | `CONFIRMED` |
| Contractor creation | Admin/staff only; requires name, businessName, role, state | `src/app/api/contractors/route.ts:8-16` | `CONFIRMED` |
| Role approval | Admin only; status approved/rejected; auto-assigns lessons | `src/app/api/contractors/[id]/roles/[roleId]/route.ts:28-80` | `CONFIRMED` |
| SOW | Admin/staff creates; contractor may only update deliverable status | `src/app/api/sows/route.ts:7-48,68-70` | `CONFIRMED` |
| Contract assembly | Requires SOW `approved` or `active` | `src/app/api/contracts/assemble/route.ts:73-74` | `CONFIRMED` |
| Delivery | 11-state machine, role-gated, admin-only final approval | `src/lib/deliverable-lifecycle.ts:5-17,43-83` | `CONFIRMED` |
| Payment | Client invoices only | `prisma/schema.prisma:338-351` | `CONFIRMED` |
| Retention | No model | model inventory | `CONFIRMED` |

### 1.2 Where work actually stalls

| Stall point | Why | Evidence |
|---|---|---|
| Before the contractor record | No public application; talent cannot enter the system | page inventory |
| Before the SOW | Admin must manually decide who is available; no availability data | `prisma/schema.prisma:53-78` |
| Before contract assembly | Missing tax/insurance/licensing documents block assembly; no expiry reminders | `prisma/schema.prisma:61-64` |
| During delivery | No capacity check; overlapping assignments are possible | `prisma/schema.prisma:194-215` |
| After submission | Reviewer routing is manual; no SLA timer | lifecycle has states, not timers (`src/lib/deliverable-lifecycle.ts`) |
| After delivery | No performance record; next staffing decision starts from memory | no review model |
| After offboarding | No bench or alumni record | no model |

---

## 2. Vertical-by-vertical analysis

### 2.1 Photography

**Typical engagement:** event, editorial, product, brand campaign, portrait.

| Stage | Current | Target (`PROPOSED`) | Gap |
|---|---|---|---|
| Source | Referral/Instagram; no capture | Application + source attribution + referral code | No intake |
| Screen | Informal portfolio review | 8–12 image rubric (composition, lighting, retouching, consistency, brief fit) | No rubric |
| Verify | Tax/insurance/licensing URLs | Verification states + expiry + right-to-work | No state machine |
| Contract | Photography addendum with edited image count, RAW, lighting, second shooter, travel, licensing, turnaround, style, retouching | Same addendum, auto-populated from profile defaults | Manual entry |
| Staff | Memory | Availability + travel radius + equipment match | No availability |
| Deliver | Deliverable with Drive URL/attachments | Same, plus shot-list checklist and EXIF/date evidence | No checklist |
| QA | Client then admin | Rubric-based first-pass QA + revision limit | No QA rubric |
| Pay | Client invoice | Contractor payout tied to SOW rate | No payout record |
| Retain | None | Reliability + quality score; preferred-photographer bench | No record |

**Photography-specific data needed:** camera systems, lighting kit, second-shooter network, travel radius, RAW policy, licensing defaults, turnaround by image count.

`CONFIRMED`: The Photography Addendum already captures edited image count, RAW delivery, lighting setup, second shooter, travel fees, image licensing, turnaround, style, and retouching level (`src/data/addenda.ts:21-34`). These are contract fields, not searchable talent attributes.

### 2.2 Videography

**Typical engagement:** brand film, event recap, social cutdowns, interview, podcast.

| Stage | Current | Target (`PROPOSED`) | Gap |
|---|---|---|---|
| Source | Referral | Application + reel URL + role specialty (DP, editor, colorist, sound) | No model |
| Screen | Informal reel review | Reel rubric: storytelling, camera, sound, edit, color, pacing, brief fit | No rubric |
| Verify | Insurance/licensing | Same + drone license (FAA/CAA) + equipment insurance | No expiry/license tracking |
| Contract | Videography addendum with camera package, drone, audio, editing, revisions, exports, captions, social versions, runtime, B-roll | Same, plus music licensing and footage ownership | Manual |
| Staff | Memory | Crew compatibility, kit match, travel, date availability | No availability |
| Deliver | Drive URL/attachments | Same + proxy/final versioning + caption files | No version control |
| QA | Client then admin | Technical QC checklist + brand QC + legal QC | No checklist |
| Pay | Client invoice | Milestone payout tied to SOW | No payout |
| Retain | None | Crew bench by specialty | No record |

`CONFIRMED`: The Videography Addendum includes camera package, drone usage (with license note), audio, editing, revision rounds, exports, captions, social versions, runtime, and B-roll (`src/data/addenda.ts:38-52`). Drone licensing is a text note, not a verified credential.

### 2.3 Content & Social

**Typical engagement:** monthly retainer, content calendar, community management, copywriting, reporting.

| Stage | Current | Target (`PROPOSED`) | Gap |
|---|---|---|---|
| Source | Referral | Application + platform handles + sample calendar | No intake |
| Screen | Informal | Rubric: platform fluency, copy quality, visual consistency, analytics literacy, brand safety | No rubric |
| Verify | None | Identity + portfolio access + conflict check (competing clients) | No conflict model |
| Contract | Social addendum: platforms, cadence, community management, analytics, captions, approval workflow, pillars, hashtags, stories/reels | Same + response-time SLA + escalation matrix | Manual |
| Staff | Memory | Capacity by platform and monthly post volume | No capacity |
| Deliver | Deliverable/task | Content calendar artifact + post-level evidence | No calendar model |
| QA | Client then admin | Two-tier: brand/legal pre-approval + performance review | No pre-approval gate |
| Pay | Client retainer invoice | Contractor monthly retainer payout | No payout |
| Retain | None | Performance + brand-safety record | No record |

`CONFIRMED`: The Social Media Management Addendum captures platforms, posting frequency, community management, analytics reporting, caption writing, approval workflow, content pillars, hashtag strategy, and stories/reels (`src/data/addenda.ts:56-69`). Approval workflow is a contract option (`Pre-approval required | Post-approval | Autonomous`), not an enforced system gate.

### 2.4 Design & Creative

**Typical engagement:** brand identity, campaign assets, web design, motion graphics, packaging, presentation.

| Stage | Current | Target (`PROPOSED`) | Gap |
|---|---|---|---|
| Source | Referral | Application + Behance/Dribbble/portfolio URL + file samples | No intake |
| Screen | Informal | Rubric: concept, craft, typography, systems thinking, file hygiene, brief fit | No rubric |
| Verify | None | Identity + software competency + source-file policy | No verification |
| Contract | Design addendum: formats, source files, brand guidelines, revisions, software, deliverable type, print-ready, animation | Same + asset ownership + font licensing | Manual |
| Staff | Memory | Skill tags (brand, web, motion, packaging) + capacity | No skills |
| Deliver | Drive URL/attachments | Same + source-file handover checklist | No checklist |
| QA | Client then admin | Design QC: brand compliance, print specs, accessibility, file naming | No checklist |
| Pay | Client invoice/project | Milestone payout | No payout |
| Retain | None | Craft score + preferred-designer bench | No record |

`CONFIRMED`: The Graphic Design Addendum captures file formats, source files, brand guidelines, revision rounds, software, deliverable type, print-ready, and animation (`src/data/addenda.ts:73-85`). It does not capture typography, accessibility, or font licensing.

---

## 3. Process inventory and cycle times

Estimates below are **planning assumptions**, not measured data. They are labeled `LIKELY` only where the workflow implies them; otherwise they are `PROPOSED` targets.

| Process | Trigger | Current owner | Current cycle | Target cycle | Automation |
|---|---|---|---|---|---|
| Talent inquiry intake | Talent submits or messages | Nobody (no surface) | n/a | Same day acknowledgment | A |
| Duplicate check | Inquiry received | Nobody | n/a | < 1 minute | A |
| Acknowledgment | Inquiry recorded | Nobody | Never | Within minutes | B |
| Missing-information collection | Triage finds a gap | Admin (ad hoc) | 3–10 days | One consolidated request; 5-day follow-up | B |
| Categorization and qualification | Evidence complete | Admin (ad hoc) | 3–10 days | ≤ 2 business days | C |
| Portfolio review | Qualification passes | Admin (ad hoc) | 3–10 days | ≤ 3 business days | D |
| Project listing discovery | Lead, referral, RFP, marketplace | Admin (memory) | Ad hoc | ≤ 2 business days to verify | E |
| Requirement extraction | Listing is `pursue` | Admin | Ad hoc | ≤ 2 business days | F |
| Talent-to-project matching | Requirements confirmed | Admin (memory) | 1–3 days | Same day shortlist | G |
| Follow-up reminders | Any open item passes a threshold | Nobody | Never | One reminder per threshold; escalate at 1 day overdue | H |
| Application status tracking | Candidate asks | Admin (email) | 1–3 days | Self-serve lookup | I |
| Administrative reporting | Weekly/monthly review | Nobody | Never | Weekly one-pager | J |
| Exception detection and escalation | SLA breach, conflict, hard-stop attempt | Nobody | Reactive | Detected and assigned same day | K |
| Contract assembly (downstream) | SOW approved | Admin | 1–2 days | ≤ 2 business days | L1 (Phase 6) |
| Onboarding and training (downstream) | Contract signed | Admin | 3–10 days | ≤ 10 business days | L2 (Phase 6) |
| Delivery QA and revision (downstream) | Submission | Admin | 1–3 days | ≤ 2 business days | L3 (Phase 6) |
| Payment (downstream) | Invoice due | Admin | Manual | Automated reminder | Existing flow |
| Performance and offboarding (downstream) | Project close or exit | Nobody / Admin | Never / ad hoc | ≤ 5 business days | L4 (Phase 6) |

**Taxonomy note:** A–K follow the master assignment (inquiry intake through exception escalation). Contract, onboarding, delivery, and performance work is downstream and is tracked as L1–L4 in `03_AUTOMATION_OPPORTUNITY_REPORT.md` and Phase 6 of `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md`. The old draft labeled those downstream steps A–K; that mapping is retired.

---

## 4. Handoff map and failure modes

| Handoff | From → To | Artifact | Failure mode | Control (`PROPOSED`) |
|---|---|---|---|---|
| H1 | Marketing → Ops | Inbound application | Lost in email/DM | Single intake endpoint + queue |
| H2 | Ops → Reviewer | Applicant + portfolio | No reviewer assigned | Auto-assign by vertical + load |
| H3 | Reviewer → Ops | Score + notes | Score not recorded | Structured scorecard required |
| H4 | Ops → Principal | Decision packet | Decision made verbally | Decision record + approval gate |
| H5 | Ops → Legal/Contract | SOW + addendum | Missing document blocks assembly | Pre-flight checklist + reminder |
| H6 | Ops → Talent | Contract + onboarding | Talent waits silently | Acknowledgment + status page |
| H7 | Ops → Delivery | Assignment | Double-booking | Availability check + conflict warning |
| H8 | Talent → Reviewer | Submission | Wrong reviewer, unclear feedback | Routing rules + feedback schema |
| H9 | Client → Admin | Acceptance/changes | Unclear revision scope | Revision reason codes + limit |
| H10 | Admin → Finance | Approval/close | Invoice delay | Close-to-invoice trigger |
| H11 | Ops → Talent (end) | Offboarding/bench | No record | Offboarding checklist + alumni tag |

**Critical failure:** H1 is currently impossible because there is no intake surface. `CONFIRMED`.

---

## 5. RACI (target state)

| Activity | Principal | Ops Lead | Talent Reviewer | Finance | AI Assistant |
|---|---|---|---|---|---|
| Publish role/opportunity | A | R | C | I | I |
| Receive application | I | A/R | I | I | R (capture) |
| Screen portfolio | I | A | R | I | C (score draft) |
| Interview | I | R | C | I | R (scheduling) |
| Verify credentials | I | A | C | C | R (checklist) |
| Hiring decision | A | R | C | I | **No authority** |
| Rate decision | A | R | C | C | **No authority** |
| Contract assembly | A | R | I | C | R (draft) |
| Contract signature | A | R | I | I | **No authority** |
| Onboarding | I | A/R | C | I | R (assign) |
| Staffing decision | A | R | C | I | C (shortlist) |
| Assignment | I | A/R | I | I | R (create draft) |
| QA routing | I | A | R | I | R (route) |
| Final approval | A | R | C | I | **No authority** |
| Payment | A | C | I | R | R (remind) |
| Rate review | A | R | C | C | C (data) |
| Offboarding | A | R | C | C | R (checklist) |

**A** = accountable, **R** = responsible, **C** = consulted, **I** = informed.

---

## 6. Pain points and root causes

| Pain point | Symptom | Root cause | Evidence |
|---|---|---|---|
| Talent cannot apply | Only referral/manual records | No public intake | page/model inventory |
| Everyone is "available" | Double-booking, missed deadlines | No availability/capacity model | `prisma/schema.prisma:53-78` |
| Same person does intake, review, and decision | Bottleneck and bias | No role separation or decision log | no model |
| Portfolios live in DMs and Drive links | Lost evidence, inconsistent evaluation | No portfolio record | `PortfolioItem` is internal (`prisma/schema.prisma:626-654`) |
| Contracts start from scratch | Slow assembly, inconsistent terms | Addenda exist but are not prefilled from talent profile | `src/data/addenda.ts`; manual SOW form |
| Onboarding is reminder-driven | Training slips | Auto-assignment exists, but no deadline/escalation | `roles/[roleId]/route.ts:8-26` |
| Follow-ups depend on memory | Silent aging | No queue, no SLA timer | no scheduler (`vercel.json:1-12`) |
| No one knows who is good | Re-hiring by memory | No performance/reliability record | no model |
| Rates are renegotiated each time | Margin leakage | No rate history/benchmark | rate only per SOW (`prisma/schema.prisma:104-121`) |
| Applicants get no reply | Brand damage | No acknowledgment email | email inventory |

---

## 7. Opportunity ranking

Scored 1–5 on impact, effort (inverse), risk (inverse), and reuse.

| Opportunity | Impact | Effort | Risk | Reuse | Priority |
|---|---|---|---|---|---|
| Public talent application + acknowledgment | 5 | 3 | 4 | 5 | P0 |
| Applicant/talent data model + dedupe | 5 | 3 | 4 | 4 | P0 |
| Portfolio/reel structured record | 5 | 3 | 4 | 3 | P0 |
| Deterministic rubric + scorecard | 5 | 2 | 5 | 4 | P0 |
| Decision log + approval gate | 5 | 2 | 5 | 4 | P0 |
| Candidate status notifications | 4 | 2 | 5 | 5 | P1 |
| Availability/capacity model | 5 | 3 | 3 | 3 | P1 |
| Queue-based follow-ups/SLA timers | 4 | 3 | 4 | 4 | P1 |
| Prefilled SOW/addendum from profile | 4 | 3 | 4 | 5 | P1 |
| Interview scheduling | 3 | 3 | 4 | 3 | P2 |
| Rate history/benchmark | 4 | 4 | 3 | 2 | P2 |
| Performance/reliability scoring | 4 | 4 | 3 | 3 | P2 |
| AI drafting adapter | 3 | 4 | 2 | 2 | P3 |
| Full analytics warehouse | 3 | 5 | 3 | 1 | P3 |

---

## 8. Target-state process (summary)

`PROPOSED`:

1. **One front door.** A public `/apply` surface with role selection, profile, portfolio links/uploads, availability, rate expectation, and consent. It writes an `Applicant` record and sends an acknowledgment.
2. **One queue.** Every applicant, document, review, and decision has an owner and due date.
3. **One rubric per vertical.** Scores are deterministic and recorded before any human judgment.
4. **One decision record.** Advance/hold/reject with reason and evidence, approved by a named human.
5. **One profile.** A promoted applicant becomes a `TalentProfile` linked to `Contractor`; rates, skills, availability, and portfolio live there once.
6. **One contract path.** SOW and addendum are prefilled from the profile; assembly and signature reuse the existing system.
7. **One delivery path.** Assignment checks availability; QA routes by vertical; final approval stays admin-only.
8. **One feedback loop.** Delivery quality and reliability feed the next staffing decision and the quarterly rate review.

---

## 9. Assumptions to validate with the owner

| Assumption | Why it matters | Validation |
|---|---|---|
| Monthly application volume < 200 | Determines whether a queue or a full ATS is needed | Ask owner; check DMs/referrals |
| Most talent is US-based | Determines tax/right-to-work flow | Ask owner |
| Engagements are project or monthly retainer | Determines rate model | Schema already supports both (`prisma/schema.prisma:109`) |
| The agency wants to keep human final say on every hire | Determines automation ceiling | Confirm in approval |
| Google Drive remains the document store | Avoids new storage cost | Confirm deployed usage |
| Existing contract templates are attorney-reviewed | Determines launch risk | Confirm legal status |

---

## 10. Conclusion

The business process is currently **person-dependent and invisible**. The platform enforces the back half (contract → deliver → approve) well, but the front half (attract → evaluate → decide → onboard) has no system at all. The design in this suite closes that gap without replacing the working back half.
