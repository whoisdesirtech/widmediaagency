# 14 — Implementation Roadmap and Acceptance Criteria

**Purpose:** Sequence the master assignment's eleven automation areas (A–K) into buildable phases with explicit gates, affected files, risks, tests, rollback, and objective acceptance criteria.
**Status:** `PROPOSED`. **No work in this document is authorized until the Lead Developer approves it in writing.**
**Constraint:** Additive changes only in Phase 1. No application code, schema, deployment, authentication, or Git operations are performed by this suite.

---

## 1. How to read this roadmap

- **Phase 0** fixes existing security blockers. Nothing else ships first.
- **Phases 1–4** build the talent-to-opportunity loop: intake, qualification, demand capture, matching.
- **Phase 5** adds the human decision, interview, and verification workflow.
- **Phase 6** connects to the existing contract, onboarding, and delivery flows.
- **Phases 7–8** make the system observable and add optional AI drafting.
- A phase is **done** only when every exit criterion is verified and the approval record exists.

**Effort unit:** one focused engineer-day. Estimates exclude review latency and are planning envelopes, not commitments.

**Feature flags (`PROPOSED`):**

| Flag | Default | Controls |
|---|---|---|
| `TALENT_OPS_ENABLED` | `false` | Public `/apply`, admin talent routes and UI |
| `TALENT_AUTOMATION_ENABLED` | `false` | Automations A–K; false = queue-only manual mode |
| `TALENT_AI_ENABLED` | `false` | AI adapter calls; false = deterministic fallback |
| `TALENT_EMAIL_ENABLED` | `false` | Outbound talent email; false = draft-only queue |

Flags must be changeable without a deploy and tested before each phase launch.

---

## 2. Phase overview

| Phase | Name | Automations | Effort | Depends on |
|---|---|---|---|---|
| 0 | Security blockers | — | 3–5 days | none |
| 1 | Inquiry intake, acknowledgment, information collection | A, B | 8–12 days | Phase 0 |
| 2 | Categorization, qualification, portfolio review, status tracking | C, D, I | 10–14 days | Phase 1 |
| 3 | Project listing discovery and requirement extraction | E, F | 8–12 days | Phase 2 |
| 4 | Matching and follow-up | G, H | 8–12 days | Phase 3 |
| 5 | Decision support, interview, verification | — (human gates) | 8–10 days | Phase 2 |
| 6 | Contract, onboarding, delivery (downstream) | L1–L4 | 8–10 days | Phase 5 |
| 7 | Reporting and exception escalation | J, K | 6–8 days | Phases 1–6 |
| 8 | AI drafting adapter | optional | 6–10 days | Phase 4 + security sign-off |

**Total:** roughly 65–93 engineer-days plus review, QA, and legal time.

**Sequencing rule:** do not start a phase whose dependency exit criteria are unmet. Phase 5 may run in parallel with Phase 3 or 4 because it depends only on Phase 2, but it must not ship before the decision-record controls exist.

---

## 3. Phase 0 — Security blockers

### 3.1 Scope

Fix the findings that make a new public talent surface irresponsible. These are pre-existing defects, not talent features.

| Finding | Fix | Files |
|---|---|---|
| F-01 | Remove plaintext password logging; never log secrets | `src/app/api/auth/reset-password/route.ts:53-55` |
| F-02 | Stop returning temporary passwords to the browser | `src/app/api/contractors/[id]/login/route.ts:39-44,118-123` |
| F-03 | Replace body spread with an explicit allowlist | `src/app/api/contractors/[id]/route.ts:29-39` |
| F-06 | Enforce `agencyId` on contractor GET/PATCH by ID | `src/app/api/contractors/[id]/route.ts:13-16,36-39` |
| F-07 | Escape or template booking email HTML | `src/app/api/booking/route.ts:67-82` |
| F-08 | Record actual consent instead of forcing `true` | `src/app/api/growth-lead/route.ts:55-57,115` |
| F-14 | Replace raw `error.message` with typed codes | `src/app/api/proposal/download/route.ts:50-54`; `src/app/api/proposal/checkout/route.ts:21-26` |

### 3.2 Dependencies

None. Start immediately on approval.

### 3.3 Risks

| Risk | Mitigation |
|---|---|
| Credential rotation breaks a live admin flow | Announce, rotate, verify login, keep a rollback contact |
| Allowlist omits a field the UI writes | Diff UI payload against the allowlist; contract test |
| Agency scope breaks legitimate staff access | Seed two agencies in a test DB; verify both |
| Regression in booking or proposal flows | Existing tests plus manual smoke |

### 3.4 Tests

- Unit: contractor PATCH rejects `userId`, `agencyId`, `id`, and other protected fields; `status` is validated against the allowed enum (`tests/phase0-security.test.ts`).
- Unit: reset-password and contractor-login sources contain no secret logging and no password field in the response (`tests/phase0-security.test.ts`).
- Unit: `escapeHtml` escapes tags, quotes, and ampersands; `sanitizeHeaderValue` strips CR/LF.
- Integration (pending): agency A cannot GET/PATCH agency B's contractor.
- Integration (pending): booking email escapes `<script>`.
- Integration (pending): growth-lead rejects `consent !== true` and never stores an invented `true`.
- `npm run typecheck`, `npm run build`.

### 3.5 Rollback

Per-fix revert. No schema change. Rotated credentials are reissued, not restored.

### 3.6 Exit criteria

- [ ] F-01, F-02, F-03, F-06 closed with linked commits and tests.
- [ ] F-07, F-08, F-14 closed or scheduled with a written exception.
- [ ] No new plaintext secret in logs or responses.
- [ ] Security reviewer signs `13_SECURITY_AND_APPROVAL_POLICY.md` §13.

**Implementation status (2026-11-07):** all seven fixes are in the working tree. `tests/phase0-security.test.ts` passes; `npm run typecheck` and `npm run build` pass. The integration cases remain pending a two-agency test database. No commits were created, so the boxes above stay unchecked until the security reviewer signs §13.

**Gate:** `/apply` may not be enabled until this phase is closed.

---

## 4. Phase 1 — Inquiry intake, acknowledgment, information collection (A, B)

### 4.1 Scope

1. `/apply` page for the four verticals; 375px; WCAG 2.1 AA.
2. `POST /api/talent/apply`: validation, rate limit, honeypot, consent, dedupe, DB write, internal notification.
3. Acknowledgment email and `EmailLog`.
4. One consolidated missing-information request and a follow-up.
5. `GET /api/talent/apply/status` and `POST /api/talent/withdraw`.
6. Admin applicant list/detail/status update with allowlists and audit.
7. Queue with owner, due date, and SLA.

**Out of scope:** qualification scoring, portfolio review, matching, decisions, AI.

### 4.2 Data model (additive)

`Applicant`, `ApplicationAsset`, `ApplicantEvent`, `TalentQueueItem`, `EmailLog`, `AutomationRun` (`12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` §4.1, §4.4, §4.5).

### 4.3 Affected files (proposed)

| Area | Path |
|---|---|
| Public page | `src/app/apply/page.tsx` (new) |
| Form component | `src/components/talent/ApplicationForm.tsx` (new) |
| Public API | `src/app/api/talent/apply/route.ts` (new) |
| Status/withdraw | `src/app/api/talent/apply/status/route.ts`, `src/app/api/talent/withdraw/route.ts` (new) |
| Applicant service | `src/lib/talent/applicant-service.ts` (new) |
| Triage/dedupe | `src/lib/talent/triage.ts` (new) |
| Reference generator | `src/lib/talent/reference.ts` (new) |
| Admin list/detail | `src/app/admin/talent/page.tsx`, `.../[id]/page.tsx` (new) |
| Admin API | `src/app/api/admin/talent/applicants/route.ts`, `.../[id]/route.ts` (new) |
| Queue API | `src/app/api/admin/talent/queue/route.ts` (new) |
| Mailer | `src/lib/email/transport.ts`, `send.ts`, `templates/application_received.ts` (new) |
| Schema | `prisma/schema.prisma` (additive) |
| Middleware | `src/middleware.ts` (deliberate public-path addition if required) |
| Sidebar | `src/components/Sidebar.tsx` (admin nav) |
| Seed | `prisma/seed.ts` (synthetic, gated) |

### 4.4 Dependencies

- Phase 0 closed.
- Baseline migration adopted.
- SMTP credentials and sender identity confirmed.
- Consent text reviewed.

### 4.5 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Spam / bots | Cost, noise | Rate limit, honeypot, minimum fill time, moderation |
| Duplicate applicants | Bad reporting | Normalized unique email + human merge |
| Acknowledgment fails | Candidate silence | `EmailLog`, retry, visible failure queue |
| Consent not withdrawable | Compliance | Withdraw route + deletion workflow stub |
| Drive leakage | Privacy | Restricted verification folder; public links only with consent |
| Schema drift | Data loss | Baseline migration; no `db push` in production |

### 4.6 Tests

- Unit: validation, dedupe, reference format, consent preservation.
- Integration: submit → applicant + event + queue + notification + email log.
- Integration: rate limit returns 429.
- Integration: status lookup with wrong email returns the same generic response.
- Integration: withdraw stops sequences.
- Security: admin routes reject contractor/client; cross-agency denied.
- Accessibility: axe + keyboard; E2E at 375px.
- Typecheck and build.

### 4.7 Rollback

`TALENT_OPS_ENABLED=false`. Additive tables remain unused. Emails stop; queue remains for manual export.

### 4.8 Exit criteria

- [ ] A real application can be submitted, acknowledged, and queued within the SLA.
- [ ] Duplicates are flagged, not silently merged.
- [ ] Every admin state change has an event and an audit row.
- [ ] Public routes are rate-limited and covered by CSRF policy.
- [ ] No Restricted field in the form response, acknowledgment, or logs.
- [ ] Kill switch tested.

---

## 5. Phase 2 — Categorization, qualification, portfolio review, status (C, D, I)

### 5.1 Scope

1. Discipline/role/seniority categorization with evidence.
2. Four-gate qualification and bands (`17_TALENT_QUALIFICATION_FRAMEWORK.md`).
3. Versioned portfolio rubric per vertical (`08_PORTFOLIO_AND_REEL_EVALUATION_FRAMEWORK.md`).
4. Reviewer routing and second review near the disagreement band.
5. Status timeline and candidate-facing status.
6. Re-score and appeal path.

**Out of scope:** opportunity capture, matching, decisions, contracts.

### 5.2 Affected files (proposed)

| Area | Path |
|---|---|
| Qualification | `src/lib/talent/qualification.ts` (new) |
| Rubric | `src/lib/talent/rubric.ts`, `rubrics/` (new) |
| Review API | `src/app/api/admin/talent/applicants/[id]/review/route.ts` (new) |
| Review UI | `src/app/admin/talent/[id]/review/page.tsx` (new) |
| Status API | `src/app/api/talent/apply/status/route.ts` (extend Phase 1) |
| Status page | `src/app/apply/status/page.tsx` (new) |
| Schema | `TalentReview`, `TalentReviewScore`, `TalentSkill`, `TalentPortfolioItem` |
| Tests | `tests/talent-qualification.test.ts`, `tests/talent-rubric.test.ts` (new) |

### 5.3 Dependencies

- Phase 1 exit criteria met.
- Rubric and qualification framework approved.
- Reviewer capacity and calibration schedule agreed.

### 5.4 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Rubric bias | Unfair decisions | Versioned rubric, evidence notes, calibration, override reasons |
| Reviewer inconsistency | Noise | Weighted score + band; 10% sample audit |
| Thin evidence | Bad categorization | `qualified_with_gaps`, confidence levels |
| Status overpromises | Candidate harm | Approved status language; no outcome hints |
| Role taxonomy mismatch | Wrong training later | Resolve `developer-intern` (F-12) before promotion |

### 5.5 Tests

- Unit: gates, bands, confidence, disqualifiers.
- Unit: rubric weights sum to 100; missing evidence lowers confidence.
- Unit: seniority cannot exceed evidence.
- Integration: review → band → timeline; status lookup reflects it.
- Security: reviewer scope; no cross-agency access.
- Calibration: two reviewers within one band on 80% of cases.
- Typecheck and build.

### 5.6 Rollback

Flag off review and status routes; applicants remain `in_review` for manual handling. Additive tables remain.

### 5.7 Exit criteria

- [ ] Every vertical has an approved rubric.
- [ ] Every review has evidence notes and a rubric version.
- [ ] Bands and confidence are reproducible from the record.
- [ ] Candidate status never implies an outcome.
- [ ] Calibration variance is within threshold.

---

## 6. Phase 3 — Project listing discovery and requirement extraction (E, F)

### 6.1 Scope

1. `ProjectOpportunity` capture from inbound, growth lead, prospect, referral, RFP, marketplace, repeat client.
2. Ten-dimension evaluation with caps and bands (`16_PROJECT_LISTING_EVALUATION_PLAYBOOK.md`).
3. Verification state; unverified listings cannot reach talent.
4. Requirement extraction with confirmed/inferred/missing fields and source quotes.
5. Client question list and draft scope.
6. Handoff to SOW assembly, clearly marked draft.

**Out of scope:** matching, rate negotiation, contract send.

### 6.2 Affected files (proposed)

| Area | Path |
|---|---|
| Opportunity service | `src/lib/talent/opportunity.ts` (new) |
| Listing evaluation | `src/lib/talent/listing-score.ts` (new) |
| Requirement extraction | `src/lib/talent/requirements.ts` (new) |
| Admin API | `src/app/api/admin/talent/opportunities/route.ts`, `.../[id]/route.ts` (new) |
| Requirements API | `.../opportunities/[id]/requirements/route.ts` (new) |
| Admin UI | `src/app/admin/talent/opportunities/page.tsx`, `.../[id]/page.tsx` (new) |
| Schema | `ProjectOpportunity`, `OpportunityRequirement` |
| Reuse | `GrowthLead`, `Prospect`, `BookingInquiry` as optional links |

### 6.3 Dependencies

- Phase 2 exit criteria met.
- Approved listing sources and terms review.
- Client verification checklist agreed.

### 6.4 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Unverified listing reaches talent | Reputational/legal | Hard block in matching; test |
| Scraping terms violation | Legal | Manual capture only; no scraping |
| Hallucinated requirements | Bad scope/rate | Source quote required; missing fields explicit |
| Duplicate listings | Noise | Dedupe by buyer + scope + dates |
| Overbuilding a CRM | Cost | Reuse existing lead models; build only the link |

### 6.5 Tests

- Unit: scoring, caps, bands, red flags.
- Unit: extraction marks missing fields, detects conflicts.
- Integration: opportunity → requirement → draft SOW link.
- Security: unverified cannot be selected for matching.
- Manual: four worked examples from the playbook.
- Typecheck and build.

### 6.6 Rollback

Flag off opportunity UI and APIs. Existing lead models remain untouched. No talent is affected.

### 6.7 Exit criteria

- [ ] No unverified listing can reach a shortlist.
- [ ] Every requirement field has a source or is marked missing.
- [ ] Conflicts are surfaced, not resolved by guessing.
- [ ] A draft SOW cannot be sent or signed.

---

## 7. Phase 4 — Matching and follow-up (G, H)

### 7.1 Scope

1. Hard eligibility filters with reason codes.
2. Weighted ranking, `insufficient_data` handling, bands.
3. Shortlist of 2–5 with reasons and exclusions.
4. No-match behavior and sourcing task.
5. Human selection; no auto-contact.
6. Follow-up thresholds, dedupe, stop rules, escalation.
7. Manual scan first; cron only after a measured need.

### 7.2 Affected files (proposed)

| Area | Path |
|---|---|
| Matching | `src/lib/talent/matching.ts`, `matching-weights.ts` (new) |
| Follow-up | `src/lib/talent/followup.ts` (new) |
| Queue | `src/lib/talent/queue.ts` (extend) |
| Admin API | `.../opportunities/[id]/shortlist/route.ts`, `.../assign/route.ts` (new) |
| UI | `src/app/admin/talent/match/page.tsx` (new) |
| Schema | `TalentAvailability`, `TalentPerformance` (read), `TalentQueueItem` |
| Assignment | reuse deliverable assignment flow |

### 7.3 Dependencies

- Phase 3 exit criteria met.
- Availability data exists or is explicitly absent.
- Assignment policy and override reasons approved.

### 7.4 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Double-booking | Delivery failure | Check at shortlist and again before offer |
| Opaque ranking | Trust | Every entry explained with evidence |
| Sparse history | Unfair ranking | `insufficient_data`, cap at Good |
| Reminder spam | Fatigue | One per threshold; dedupe; stop rules |
| Auto-contact | Hard stop | Code prevents; test asserts no send |

### 7.5 Tests

- Unit: filters, ranking, ties, `insufficient_data`.
- Unit: follow-up thresholds and stop conditions.
- Integration: shortlist → human select → assignment guard.
- Integration: concurrent assignment does not double-book.
- Security: contractor sees only own availability.
- Typecheck and build.

### 7.6 Rollback

Flag off matching and follow-up; staffing continues manually. Availability records remain.

### 7.7 Exit criteria

- [ ] Zero availability conflicts in the dry run.
- [ ] Every shortlist entry has a reason and evidence.
- [ ] No candidate is contacted automatically.
- [ ] Reminders stop on response, withdrawal, or closure.
- [ ] No-match produces a sourcing task, not a lowered bar.

---

## 8. Phase 5 — Decision support, interview, verification

### 8.1 Scope

Human-operated stages that A–K depend on, with automation assistance only.

1. Interview proposal/scheduling with timezone handling.
2. Credential request/receive/verify/waive with restricted Drive storage.
3. Reference capture and summary.
4. Decision packet assembled from evidence.
5. `TalentDecision` written only by an admin, with reason code and evidence.
6. Decision templates draft-only until approved.

### 8.2 Affected files (proposed)

| Area | Path |
|---|---|
| Interview API/UI | `.../interview/route.ts`, `src/app/admin/talent/[id]/interview/page.tsx` (new) |
| Credential API/UI | `.../credential/route.ts`, `.../verification/page.tsx` (new) |
| Reference API | `.../reference/route.ts` (new) |
| Decision packet | `src/lib/talent/decision-packet.ts` (new) |
| Decision API/UI | `.../decision/route.ts`, `.../decision/page.tsx` (new) |
| Storage | `src/lib/talent/storage.ts` (wraps `driveService.ts`) |
| Schema | `TalentInterview`, `TalentCredential`, `TalentReference`, `TalentDecision` |

### 8.3 Dependencies

- Phase 2 exit criteria met.
- Restricted Drive folder with least-privilege access.
- Legal review of verification requirements.
- Interview policy and accommodation rules.

### 8.4 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Restricted document mishandling | S1 | Restricted folder, owner/Principal access, access log |
| Decision without evidence | Accountability gap | API rejects advance/decline without evidence |
| Automated decline | Hard stop | Draft-only; human send |
| Double-booking interviews | Candidate harm | Timezone-aware validation; no hold without confirmation |
| Reference privacy | Data exposure | Store summaries, not raw third-party data in prompts |

### 8.5 Tests

- Unit: decision requires actor, reason, evidence.
- Unit: override requires a non-empty reason.
- Integration: interview scheduling and reschedule.
- Integration: credential request → verify → expiry.
- Security: only admin records a decision; reviewer cannot.
- Security: Restricted access limited and logged.
- Typecheck and build.

### 8.6 Rollback

Flag off decision and verification routes; manual process continues. No decision is deleted.

### 8.7 Exit criteria

- [ ] 100% of decisions have actor, reason, evidence.
- [ ] Zero automated declines/advances.
- [ ] Restricted documents accessible only to owner/Principal and logged.
- [ ] Interview times are timezone-correct.
- [ ] Decision packet reproducible from records.

---

## 9. Phase 6 — Contract, onboarding, delivery (downstream)

### 9.1 Scope

Reuse existing flows; do not rebuild them.

1. Contract/SOW prefill from approved requirements and rate band; draft only.
2. Assembly, signature tracking, and status.
3. Promotion to `TalentProfile` + draft `Contractor` (idempotent).
4. Role mapping and training assignment; readiness.
5. Delivery QA queue and SLA escalation using `src/lib/deliverable-lifecycle.ts`.
6. Performance facts captured at project close.

### 9.2 Affected files (proposed)

| Area | Path |
|---|---|
| Promotion | `src/lib/talent/promotion.ts`, `.../promote/route.ts` (new) |
| Contract prefill | reuse `src/app/api/contracts/assemble/route.ts`, `SOW` |
| Onboarding | `src/lib/talent/onboarding-checklist.ts`, admin UI (new) |
| Training | reuse `src/app/api/admin/training/assign/route.ts` |
| Readiness | reuse `src/lib/role-training-config.ts:104-146` |
| Delivery hooks | extend `src/app/api/deliverables/[id]/route.ts` (no permission change) |
| Performance | `src/lib/talent/performance.ts` (new) |

### 9.3 Dependencies

- Phase 5 exit criteria met.
- `developer-intern` taxonomy decision.
- Finance approval of rate bands.
- Delivery lifecycle review.

### 9.4 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Duplicate contractor | Data integrity | Unique `applicantId`, idempotency key |
| Premature access | Security | Draft contractor has no login until activation |
| Duplicate lifecycle logic | Divergence | Import the lifecycle module; no local maps |
| Contract implies commitment | Hard stop | Draft watermark; send/sign disabled |
| Training drift | Readiness errors | Reuse unique assignment constraint |

### 9.5 Tests

- Unit: promote idempotent; role mapping covers all 13 keys.
- Integration: promotion → profile + draft contractor + training + queue.
- Integration: readiness requires training, integrations, documents.
- Regression: lifecycle permissions unchanged (admin final approval).
- Security: no login before activation.
- Typecheck and build.

### 9.6 Rollback

Flag off promotion and onboarding; existing contractor flows unchanged. No deletion.

### 9.7 Exit criteria

- [ ] One profile and one contractor per applicant.
- [ ] No access before activation.
- [ ] Readiness matches the workforce dashboard.
- [ ] No duplicate lifecycle definition.
- [ ] Contract prefill cannot be sent or signed by automation.

---

## 10. Phase 7 — Reporting and exception escalation (J, K)

### 10.1 Scope

1. Weekly operations report: volume, SLA, bottlenecks, exceptions.
2. Monthly roster report: utilization, bench, reliability, retention risk.
3. Data-quality flags.
4. Exception rules S1–S4, ownership, escalation, blocking.
5. Hard-stop attempt detection and refusal record.
6. Report snapshots with source queries.

### 10.2 Affected files (proposed)

| Area | Path |
|---|---|
| Reporting | `src/lib/talent/reporting.ts` (new) |
| Exception rules | `src/lib/talent/exceptions.ts` (new) |
| Admin UI | `src/app/admin/talent/reports/page.tsx`, `.../exceptions/page.tsx` (new) |
| APIs | `.../reports/route.ts`, `.../exceptions/route.ts` (new) |
| Reuse | `AuditLog`, `AutomationRun`, `TalentQueueItem` |

### 10.3 Dependencies

- Phases 1–6 exit criteria met.
- Metric definitions approved.
- On-call and escalation owners named.

### 10.4 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Misleading metrics | Bad decisions | Source query + `insufficient_data` |
| Alert fatigue | Ignored exceptions | Severity + dedupe + weekly review |
| Restricted data in reports | S1 | Field allowlist; no export without audit |
| Exception closed without fix | Recurrence | Resolution + prevention note required |

### 10.5 Tests

- Unit: aggregates, `insufficient_data`, severity rules.
- Integration: report snapshot; exception lifecycle.
- Security: no Restricted fields; export audited.
- Manual: S1 tabletop drill.
- Typecheck and build.

### 10.6 Rollback

Flag off reports and exceptions; manual review continues. Existing audit remains.

### 10.7 Exit criteria

- [ ] Weekly report produced from a source query.
- [ ] Every exception has an owner and due date.
- [ ] S1/S2 closure requires a human.
- [ ] Hard-stop attempts are blocked and recorded.
- [ ] No Restricted data in any report.

---

## 11. Phase 8 — AI drafting adapter (optional)

### 11.1 Scope

1. `src/lib/ai/adapter.ts`, `redact.ts`, `registry.ts`, `guard.ts`.
2. Env-gated provider; one implementation.
3. Redaction test with a canary Restricted value.
4. Schema validation; deterministic fallback.
5. `AutomationRun` logging without prompt bodies.
6. Cost cap, timeout, kill switch.
7. Pilot evaluation against human drafts.

**Out of scope:** autonomous sending, decisions, fine-tuning.

### 11.2 Dependencies

- Phase 4 exit criteria met.
- Lead Developer approval of provider and terms.
- Redaction and kill-switch tests passing.
- Security sign-off (`13_SECURITY_AND_APPROVAL_POLICY.md` §6).

### 11.3 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| PII leakage | S1 | Redaction test; allowlist payload; no free-text notes |
| Hallucinated commitment | Hard stop | Templates forbid; human send gate; schema |
| Cost overrun | Budget | Caps + alerts |
| Prompt injection | Manipulation | Untrusted-input wrapper; no tools |
| Silent degradation | Quality | Fallback-rate monitoring |

### 11.4 Tests

- Unit: redaction removes every listed field; canary never sent.
- Unit: invalid schema triggers fallback.
- Unit: cost cap and timeout abort.
- Integration: kill switch off → deterministic path, no provider call.
- Evaluation: AI vs human on 30 synthetic cases.
- Typecheck and build.

### 11.5 Rollback

`TALENT_AI_ENABLED=false`; all callers use deterministic templates. No migration.

### 11.6 Exit criteria

- [ ] Zero Restricted fields in payloads.
- [ ] Kill switch verified in staging and production.
- [ ] Fallback rate < 2% over the pilot week.
- [ ] No AI message sent without human approval.
- [ ] Cost within cap.
- [ ] Evaluation threshold met.

---

## 12. Cross-phase acceptance criteria

### 12.1 Security

- [ ] Every new route starts with a guard and returns early on `isNextResponse`.
- [ ] Ownership and `agencyId` scope enforced server-side.
- [ ] Writable fields allowlisted; no body spread.
- [ ] Public routes rate-limited; CSRF exemption deliberate.
- [ ] No Restricted field in logs, prompts, emails, or URLs.
- [ ] Uploads use field/extension/size whitelists and Drive.
- [ ] Errors are typed; no raw exception text.

### 12.2 Data and audit

- [ ] Additive migration through the adopted process.
- [ ] Every state change writes a typed record and an `AuditLog` row.
- [ ] Idempotency verified for create/promote/send.
- [ ] No destructive change to existing tables.
- [ ] Rollback tested.

### 12.3 Human control

- [ ] All five hard stops enforced in code and tested.
- [ ] Every decision has a human actor, reason, evidence.
- [ ] No automation sends a commitment, rate, contract, or decision.
- [ ] Kill switches work without a deploy.

### 12.4 Quality

- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes (`NODE_OPTIONS=--max-old-space-size=6144` locally if needed).
- [ ] New unit/integration tests pass; no coverage reduction.
- [ ] Accessibility check for new public UI.
- [ ] Documentation updated.

### 12.5 Operations

- [ ] Named owner per queue type.
- [ ] SLA clocks match `04_TALENT_JOURNEY_AND_SLA_MAP.md`.
- [ ] Runbooks for failure, fallback, incident.
- [ ] Monitoring thresholds configured.

---

## 13. Definition of done (per phase)

1. Exit criteria checked with linked evidence.
2. Cross-phase criteria in §12 pass.
3. Dry run on synthetic data attached.
4. Rollback executed once in staging.
5. Lead Developer signs the phase approval block (§15.2).
6. Changelog and this document updated.

---

## 14. Program risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Security blockers ship late | Medium | High | Phase 0 gate | Lead Developer |
| Overbuilding before validation | High | Medium | Phase 1 is intake only; measure | Lead Developer |
| Rubric bias | Medium | High | Versioned rubric, calibration | Ops Lead |
| Unverified listing reaches talent | Low | High | Hard block + test | Ops Lead |
| Restricted data mishandling | Low | Critical | Restricted folders, access log, redaction | Lead Developer |
| Queue overload | Medium | Medium | Capacity plan, SLAs | Ops Lead |
| Schema drift | Medium | High | Migration baseline | Engineer |
| Auth regression | Medium | High | Reuse guards, route tests | Engineer |
| AI vendor terms inadequate | Medium | High | DPA review; fallback | Lead Developer |
| Candidate experience harm | Medium | High | Acknowledgment SLA, no auto-decline | Ops Lead |

---

## 15. Approval blocks

### 15.1 Program approval

- [ ] Lead Developer has read `01`, `03`, `12`, `13`, `14`, `21`, `22`.
- [ ] Target architecture and data model approved.
- [ ] Phase 0 scope approved and scheduled.
- [ ] Phase 1 scope and exit criteria approved.
- [ ] Named owner assigned to each automation A–K.
- [ ] Dry-run dataset and rollback plan approved.
- [ ] Vendors, if any, approved with a reuse analysis and data-processing terms.

**Approved by:** ____________________  **Date:** __________  **Version:** 1.0

**Phase 0 approval record**

| Date | Approved by | Scope | Deferred |
|---|---|---|---|
| 2026-11-07 | Lead Developer (repo owner, approved in-session) | Phase 0 only: F-01, F-02, F-03, F-06, F-07, F-08, F-14 | §16 questions 1–10; Phases 1–8 |

The remaining §15.1 boxes stay unchecked until the full program is approved.

### 15.2 Phase approval template

| Field | Value |
|---|---|
| Phase | |
| Exit criteria verified by | |
| Evidence links | |
| Tests | |
| Rollback tested | Yes / No |
| Residual risks accepted | |
| Approved by | |
| Date | |

No phase may begin production rollout without a completed approval block.

---

## 16. Open questions for the Lead Developer

1. Which jurisdictions do talent operate in, and what retention and verification obligations apply?
2. Who is the Principal with access to Restricted documents?
3. Which sender identity and monitored reply-to are approved?
4. Is `developer-intern` offered at intake, or removed?
5. Which calendar provider is authoritative, and is the existing Google Calendar integration in scope?
6. What are the approved rate bands per role and seniority for the first quarter?
7. Is a background check required for any vertical, and under what legal basis?
8. Which AI provider, if any, is permitted, and are no-training terms available?
9. What is the on-call path for S1 incidents outside business hours?
10. Does the agency want a candidate status portal in Phase 1, or email-only updates?

---

## 17. Recommended first three actions after approval

1. **Close Phase 0 blockers.** F-01, F-02, F-03, and F-06 become more dangerous with a public form.
2. **Baseline the database and adopt migrations.** The project uses `db push` with no migrations directory (`AGENTS.md:12`), and `docs/SESSION_HANDOFF.md:27-31` documents a prior drift incident.
3. **Build Phase 1 intake, acknowledgment, and queue.** The fastest way to reduce candidate silence and lost applications is a reliable capture-and-reply path.

---

## 18. Relationship to other deliverables

| Topic | Authoritative document |
|---|---|
| Current state and findings | `01_APPLICATION_AUDIT.md` |
| Functionality inventory | `20_CURRENT_FUNCTIONALITY_INVENTORY.md` |
| Process design | `02_BUSINESS_PROCESS_ANALYSIS.md` |
| Automation A–K | `03_AUTOMATION_OPPORTUNITY_REPORT.md` |
| Journey, owners, SLA | `04_TALENT_JOURNEY_AND_SLA_MAP.md` |
| Operating manual | `05_ASSISTANT_OPERATIONS_MANUAL.md` |
| Training curriculum | `19_ASSISTANT_TRAINING_CURRICULUM.md` |
| Response library | `15_TALENT_INQUIRY_RESPONSE_LIBRARY.md` |
| Listing evaluation | `16_PROJECT_LISTING_EVALUATION_PLAYBOOK.md` |
| Qualification | `17_TALENT_QUALIFICATION_FRAMEWORK.md` |
| Matching | `18_TALENT_MATCHING_DECISION_FRAMEWORK.md` |
| Architecture | `12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` |
| Database/integrations | `22_DATABASE_AND_INTEGRATION_RECOMMENDATIONS.md` |
| Security | `13_SECURITY_AND_APPROVAL_POLICY.md` |
| Testing/acceptance | `21_TESTING_AND_ACCEPTANCE_CRITERIA.md` |
| Durable policy | `CREATIVE_TALENT_OPERATIONS.md` |

**End of roadmap. Implementation remains paused pending Lead Developer approval.**
