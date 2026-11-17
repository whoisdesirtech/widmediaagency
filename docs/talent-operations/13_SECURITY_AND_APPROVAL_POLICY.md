# 13 — Security and Approval Policy

**Purpose:** Define how talent data is classified, accessed, redacted, retained, and approved, and state the controls that no automation may bypass.
**Status:** `PROPOSED`. This document does not authorize code, schema, deployment, or authentication changes.
**Audience:** Lead Developer, security reviewer, operations lead, any person or agent operating automations A–K.
**Companion documents:** `CREATIVE_TALENT_OPERATIONS.md` §7–§10, §14–§15; `01_APPLICATION_AUDIT.md` findings register; `03_AUTOMATION_OPPORTUNITY_REPORT.md` §4; `12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` §8–§11.

---

## 1. Policy statement

1. Talent applicants and contractors are people, not leads. Their data is collected for a stated purpose, held for a stated period, and shared only with a lawful basis and a named human owner.
2. No automation may make, imply, or transmit a decision about employment, engagement, compensation, or a contract. Those five categories are hard stops (§4).
3. Every state-changing action on talent data is attributable to a human user ID or a named automation, and is recorded.
4. Where this policy and a business urgency conflict, this policy wins until the Lead Developer amends it in writing.
5. Where the current implementation cannot meet a control, the gap is recorded as a finding, not silently accepted. Current gaps are listed in §9.

**Evidence convention:** `CONFIRMED` = verified in the repository at the cited path and line. `LIKELY` = strongly implied, not exercised end-to-end. `UNKNOWN` = not observable locally (production configuration, vendor settings). `PROPOSED` = target state requiring approval.

---

## 2. Data classification

### 2.1 Classes

| Class | Definition | Examples in the talent domain | Storage rule | Sharing rule |
|---|---|---|---|---|
| **Public** | Deliberately published or approved for public view | Published reel URL, public portfolio page, role title, city, headline | May be indexed | Share freely, with recorded consent |
| **Internal** | Routine operations data | Applicant status, rubric scores, interview notes, availability windows, queue ownership | Platform DB only | Ops team and the assigned reviewer |
| **Confidential** | Commercially sensitive | Rate expectations, approved rates, margin, contract terms, client feedback, decision reason | Platform DB; export requires audit entry | Need-to-know; never in chat tools or email bodies |
| **Restricted** | Identity, financial, and legal documents | Tax ID, tax form contents, insurance certificates, licensing, government ID, bank details, right-to-work evidence, background-check results | Drive restricted folder + DB reference only; never in AI prompts | Owner and Principal only; documented legal basis required |

### 2.2 Classification rules

- **Default to Internal.** A field is not Public because it is convenient to publish it.
- **Document contents are Restricted even when the reference is Confidential.** A Drive file ID is Confidential; the file it points to is Restricted.
- **Aggregation escalates.** A list of Internal fields that identifies one person's compensation is Confidential.
- **Client identity follows the client record.** Talent must not learn a client's name before the client relationship permits it.
- **Portfolio rights are data too.** A piece marked `rightsStatus = unknown` is not Public and may not be shared externally.

### 2.3 Current-state evidence

`CONFIRMED`: the schema stores **URLs** for tax forms, insurance, and licensing rather than document bytes (`prisma/schema.prisma:61-64`). Document contents live in Google Drive through a service account (`src/lib/driveService.ts`).

`UNKNOWN`: encryption at rest, bucket/folder access logging, key rotation, and retention behavior in the deployed Drive, Supabase, and hosting environments. These must be confirmed by the Lead Developer before Restricted data enters the talent system at volume.

`CONFIRMED`: the deployed environment is not fully observable from the repository. The local `.env` contains only `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`; production values, SMTP credentials, and Drive service-account scopes are `UNKNOWN`.

---

## 3. Access control

### 3.1 Role model

`CONFIRMED`: authentication is NextAuth credentials with a JWT session carrying `role`, `agencyId`, `contractorId`, and `clientId` (`src/lib/auth.ts:19-86`). Guards are `requireAdmin`, `requireAdminOrStaff`, `requireAuth`, and role-specific helpers (`src/lib/auth.ts:119-191`). Contractors and clients must be scoped to their own records.

`PROPOSED`: talent operations use these platform roles with the following capabilities. No new authentication role is required for Phase 1.

| Capability | admin | staff | manager / reviewer (extended staff role) | contractor | client |
|---|---|---|---|---|---|
| Submit a public application | — | — | — | — | — (public route) |
| View applicant list | ✅ | ✅ | ✅ | ❌ | ❌ |
| View applicant detail (Internal) | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Restricted documents | ✅ (Principal only) | ❌ | ❌ | own only | ❌ |
| Record rubric review | ✅ | ✅ | ✅ (assigned vertical) | ❌ | ❌ |
| Schedule interview | ✅ | ✅ | ✅ | own only | ❌ |
| Record decision (`TalentDecision`) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve rate / rate exception | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assemble or send contract | ✅ | ✅ (draft only) | ❌ | own signature only | own signature only |
| Promote applicant to talent / contractor | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve role / assign training | ✅ | ✅ | ✅ | ❌ | ❌ |
| Final-approve or close deliverable | ✅ | ❌ | ❌ | ❌ | ❌ |
| Read audit log | ✅ | ❌ | ❌ | ❌ | ❌ |
| Change retention or redaction policy | ✅ Lead Developer | ❌ | ❌ | ❌ | ❌ |

Legend: ✅ allowed; ❌ denied; "own only" = record must match `session.contractorId` or `session.clientId`.

### 3.2 Enforcement rules

1. **Every route starts with a guard.** `CONFIRMED` convention (`AGENTS.md`, auth section). A route without a guard is a defect, not a style issue.
2. **Never trust a client-supplied identifier for ownership.** Compare the record's owner to `session.contractorId` / `session.clientId`; do not accept `contractorId` from the body or query.
3. **Scope by agency.** Every model with `agencyId` must be filtered by `session.agencyId`. `CONFIRMED` gap: `GET/PATCH /api/contractors/[id]` does not compare the record's `agencyId` to the session (`src/app/api/contractors/[id]/route.ts:13-16,36-39`) — finding F-06.
4. **Allowlist writable fields.** Never spread a request body into Prisma. `CONFIRMED` gap: the contractor PATCH mass-assigns the body (`src/app/api/contractors/[id]/route.ts:29-39`) — finding F-03.
5. **Least privilege for service accounts.** The Drive service account should reach only the agency root folders it needs. `UNKNOWN`: current scopes. A drive-wide or domain-wide delegation scope is a finding and must be reduced.
6. **Separate the reviewer from the decision-maker.** A rubric reviewer may recommend; only an admin records `advance`, `hold`, or `decline`.
7. **No shared logins.** Every action must map to a human user ID. Shared operations accounts are not permitted for decision records.
8. **Revoke on exit.** Offboarding removes portal access, rotates any shared secrets the person could see, and reassigns open queue items. `CONFIRMED`: no talent offboarding checklist exists today; the target checklist is in `10_ONBOARDING_AND_QUALITY_CONTROL_PLAYBOOK.md`.

### 3.3 Public-surface controls

| Control | Requirement | Current state |
|---|---|---|
| Rate limiting | Public apply 5/hour/IP; status lookup 20/hour/IP; withdraw 3/hour/IP | `rateLimit` exists and is DB-backed with memory fallback (`src/lib/rateLimit.ts:11-46`); new routes must call it |
| CSRF | Mutating public routes must be added deliberately to the exemption list and otherwise carry the double-submit token | Double-submit enforced (`src/middleware.ts:4-10,36-47`); exemption list at `src/middleware.ts:10` |
| Bot defense | Honeypot field + minimum completion time; optional email verification link | `PROPOSED` |
| Enumeration | Status lookup requires reference **and** email; identical response for mismatch | `PROPOSED` |
| Upload safety | Whitelist field names, extensions, and size; scan or quarantine before review | `CONFIRMED` pattern in `src/app/api/contractors/[id]/upload/route.ts`; extend, do not relax |
| Error messages | Typed error codes; never raw exception text or stack traces | `CONFIRMED` gap in proposal routes returning `error.message` (`src/app/api/proposal/download/route.ts:50-54`; `checkout/route.ts:21-26`) — finding F-14 |

---

## 4. The five hard stops

These five categories are **never** executed, drafted as a commitment, or transmitted by an automation, at any confidence level. The only permitted automation behavior is to open a queue item for a named human.

| # | Hard stop | What is forbidden | What the automation may do | Required human record |
|---|---|---|---|---|
| 1 | **Employment or engagement promise** | "You're hired", "we'd love to work with you", "you're on the team", implied exclusivity or volume | Acknowledge receipt; state the review process and timeline; send a decline **only** after a human recorded it | `TalentDecision` with `decidedBy`; approved template ID |
| 2 | **Compensation** | Quoting, negotiating, agreeing, or confirming a rate, retainer, bonus, or payment term | Show the published rate band to the internal team; assemble a draft SOW from an approved band | `RateBand` + `TalentRate` / `RateException` with `approvedBy` |
| 3 | **Contracts** | Sending, signing, countersigning, or promising contract terms | Draft from the approved template; route to the signer; track signature status | Human signature event; assembled contract audit entry |
| 4 | **Hiring decision** | Advancing, rejecting, ranking as final, or closing an application | Compute the deterministic rubric score; summarize evidence; recommend `advance / hold / decline` | `TalentDecision` with reason code, actor, timestamp, evidence |
| 5 | **Private data sharing** | Sending, linking, or quoting Restricted data, client-confidential material, or another person's data | Reference that a document exists and its status; request a missing document | Document verification record; explicit consent or legal basis |

### 4.1 Additional non-negotiable gates

| Gate | Rule |
|---|---|
| **Unverified project lead** | A lead is `unverified` until a human confirms scope, budget, and authority. No talent may be promised work, and no availability may be held, against an unverified lead. `CONFIRMED`: `GrowthLead` exists but has no admin GET endpoint or UI (`src/app/api/growth-lead/route.ts` exports POST only). |
| **Rate override** | Any rate outside the approved band requires a `RateException` approved by an admin. |
| **Compliance waiver** | Waiving tax, insurance, licensing, or right-to-work requirements requires an admin decision with a reason and expiry. |
| **Retention exception** | Keeping Restricted data past its retention date requires a written reason and a new expiry. |
| **AI enablement** | Turning on an AI provider requires Lead Developer approval, a redaction test, a cost cap, and a kill-switch test. |

### 4.2 Blocking behavior

When an automation reaches a hard stop it must:

1. stop before composing outbound content,
2. create a `TalentQueueItem` (or the relevant queue type) assigned to the correct owner with a due date,
3. write an `ApplicantEvent` / audit entry with `blocked_by_policy` and the policy section,
4. return a deterministic fallback response to the caller.

It must **not** degrade into "send a soft version" of the forbidden action.

---

## 5. Approval matrix

Every consequential action requires the listed approver. Approval is a recorded row, not a chat message.

| Action | Preparer | Approver | Record | Reversible? |
|---|---|---|---|---|
| Publish `/apply` | Engineer | Lead Developer | Release note + flag change | Yes (flag off) |
| Enable AI drafting | Engineer | Lead Developer | ADR + redaction test result | Yes (kill switch) |
| Advance applicant | Reviewer | Admin | `TalentDecision` | Yes, with reason |
| Decline applicant | Reviewer | Admin | `TalentDecision` + reason code | Yes, with reason |
| Hold applicant | Reviewer | Admin | `TalentDecision` + next action + due date | Yes |
| Approve rate band | Ops lead | Admin (Principal) | `RateBand.approvedBy` | Only by new band |
| Rate exception | Ops lead | Admin (Principal) | `RateException.approvedBy` | Only by new record |
| Assemble contract | Staff | Admin | Contract audit entry | Supersede, do not edit signed |
| Send contract | Staff | Admin / signer | Signature event | No |
| Approve contractor role | Staff | Admin | `ContractorRole` status + audit | Yes, with reason |
| Waive compliance item | Ops lead | Admin | `TalentCredential` status `waived` + note | Yes, with expiry |
| Share Restricted document | Owner | Principal | Access log + legal basis | No (assume copied) |
| Change retention period | Ops lead | Lead Developer | Policy version + changelog | Yes |
| Delete/anonymize applicant | Ops lead | Lead Developer | Deletion record (counts only, no PII) | No |

**Approval validity:** an approval covers one action and one record. It expires when the underlying evidence changes (new portfolio, new rate, new scope) or after 30 days, whichever is sooner.

---

## 6. AI and prompt security

### 6.1 Rules

1. **Opt-in only.** AI features read `TALENT_AI_ENABLED`; when false, deterministic templates and rubric math run instead (`12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` §10).
2. **Redact before send.** A field on the redaction list never leaves the application boundary, including in examples, few-shot prompts, and error messages.
3. **No training on talent data.** The provider must be configured so submitted content is not retained for model training. `UNKNOWN`: provider terms; confirm before enablement.
4. **No decision authority.** Model output is a draft with a `promptId` and model version; a human accepts or edits it.
5. **Evidence-bound.** Prompts must require the model to cite the field or record it used and to output `not recorded` for gaps.
6. **Output validation.** Every AI response is parsed against a schema; invalid output is discarded and the deterministic fallback runs.
7. **Cost and rate caps.** A per-run token cap, a per-day cost cap, and a timeout are enforced in the adapter guard.
8. **Kill switch.** Disabling `TALENT_AUTOMATION_ENABLED` or `TALENT_AI_ENABLED` must take effect without a deploy and must be tested before launch.
9. **Audit.** `AutomationRun` records automation, mode, status, fallback reason, and duration. It must not store prompt bodies containing Internal or Confidential data; store the prompt ID and a hash instead.

### 6.2 Field-level redaction list

The following fields are **never** included in a model prompt, an AI vendor request, a log line, an email body, or a URL query string.

| Field group | Fields | Class |
|---|---|---|
| Government identity | government ID number, ID document image, passport, visa, right-to-work evidence | Restricted |
| Financial identity | bank account, routing number, tax ID / EIN / SSN, payout details | Restricted |
| Tax and insurance documents | tax form URL and contents, insurance certificate contents, licensing document contents | Restricted |
| Background checks | check provider, results, adverse-action notes | Restricted |
| Credentials | password, temporary password, reset token, session token, API key | Secret |
| Third-party personal data | reference contact details, referee responses attributable to a named individual | Restricted |
| Client confidentiality | client name before release, client brief contents, unpublished campaign details, contract terms | Confidential |
| Compensation | rate expectation, approved rate, margin, retainer, bonus | Confidential |
| Free-text notes | interview notes and reviewer notes may contain any of the above | Treat as Confidential; redact on export |

**Allowed in prompts (after consent):** first name, role, vertical, years of experience, seniority, city/timezone, public portfolio and reel URLs, public asset descriptions, availability windows, and rubric scores.

`CONFIRMED`: today there is no AI integration and therefore no live redaction path (`package.json:24-38` contains no AI SDK). The list above is the gate that must exist before the first integration.

### 6.3 Prompt-injection and content handling

- Portfolio pages, reel descriptions, and applicant free text are **untrusted input**. Wrap them clearly and instruct the model to ignore embedded instructions.
- Never let applicant text trigger a tool call. The adapter exposes no tools.
- Strip HTML and scripts from anything rendered in the admin UI or an email. `CONFIRMED` gap: booking email HTML interpolates user input without escaping (`src/app/api/booking/route.ts:67-82`) — finding F-07.

---

## 7. Data lifecycle and retention

### 7.1 Retention schedule

| Data | Default retention | Trigger to delete/anonymize | Notes |
|---|---|---|---|
| Application (not advanced) | 12 months from last activity | Consent expiry or applicant request | Configurable per consent; store `retentionUntil` |
| Application (declined) | 12 months from decision | Applicant request | Keep decision counts without PII |
| Interview notes and scorecards | 24 months | Applicant request | Restricted-adjacent; purge text, keep score |
| Approved talent profile | Life of engagement + 24 months | Offboarding + 24 months | Anonymize after |
| Portfolio assets | While profile active or rights permit | Rights withdrawal | Remove Drive link on withdrawal |
| Verification documents | Duration of engagement + statutory period | Contract end + statutory period | Restricted; legal basis required |
| Rate and contract records | Per contract/statutory requirement | Not deletable while legally required | Keep minimum |
| Audit and decision records | 7 years | Not deletable by automation | Anonymize PII where possible |
| Email log | 24 months | Automatic | No message bodies |
| Automation run log | 12 months | Automatic | No prompt bodies |

`UNKNOWN`: statutory retention requirements in the agency's operating jurisdictions. Legal review is required before launch; the table above is a default, not legal advice.

### 7.2 Deletion and anonymization

1. Deletion is a two-step action: request, then execute after the retention check.
2. Anonymize rather than delete where an audit or contract obligation exists: replace name, email, phone, and free text with a tombstone; keep IDs and counts.
3. Delete Drive assets before or with the DB record; record only file counts and the deletion timestamp.
4. A deletion record must not contain the deleted PII.
5. Automations may **never** delete or anonymize. They may only flag eligibility for a human.

### 7.3 Consent

- The application form requires an explicit, unbundled consent checkbox. `CONFIRMED` gap pattern: growth-lead consent is forced `true` regardless of input (`src/app/api/growth-lead/route.ts:55-57,115`) — finding F-08. Do not repeat this pattern.
- Consent text states purpose, retention, sharing with clients, and how to withdraw.
- Withdrawal is honored within 5 business days and triggers the deletion/anonymization workflow.
- Consent records store the text version, timestamp, and IP or session reference (as permitted).

---

## 8. Incident response

### 8.1 Severity

| Severity | Definition | Examples | Response |
|---|---|---|---|
| **S1** | Confirmed Restricted data exposure or credential compromise | Tax documents reachable publicly; plaintext password in logs; provider key leaked | Contain within 1 hour; notify Lead Developer immediately; preserve evidence |
| **S2** | Confidential data exposure or hard-stop breach | Rate sheet sent externally; automated email promised employment; cross-agency contractor access | Contain within 4 hours; notify Lead Developer same day |
| **S3** | Internal data exposure or control failure without confirmed leak | Missing guard on a new route; AI prompt with redaction miss caught pre-send; audit gap | Fix within 5 business days; record finding |
| **S4** | Policy deviation, no data impact | Queue item closed without a note; approval missing | Fix within 10 business days; coaching |

### 8.2 Procedure

1. **Detect.** Alert source: automation failure log, audit anomaly, user report, or review.
2. **Contain.** Disable the kill switch, revoke the credential, remove the public link, or disable the route. Do not delete evidence.
3. **Assess.** Identify data classes, affected people, time window, and whether the data left the boundary.
4. **Notify.** Lead Developer immediately for S1/S2. External notification follows the agency's legal obligations; `UNKNOWN` until legal review.
5. **Remediate.** Fix the root cause, add a regression test, and update this policy if a rule was missing.
6. **Record.** Incident record with timeline, classes, people count, actions, and prevention. No PII in the record.
7. **Review.** Blameless post-incident within 5 business days; update the findings register.

### 8.3 Current findings that are incident-ready

`CONFIRMED` from `01_APPLICATION_AUDIT.md`:

| Finding | Severity | Issue | Immediate containment |
|---|---|---|---|
| F-01 | S1 | `reset-password` logs the new plaintext password when SMTP is unconfigured (`src/app/api/auth/reset-password/route.ts:53-55`) | Remove the log line; rotate any password logged since deploy |
| F-02 | S1 | Contractor login returns a plaintext temporary password to the admin browser (`src/app/api/contractors/[id]/login/route.ts:39-44,118-123`) | Stop returning the secret; deliver out-of-band; rotate exposed credentials |
| F-03 | S1/S2 | Contractor PATCH mass-assigns the request body (`src/app/api/contractors/[id]/route.ts:29-39`) | Allowlist fields; audit recent PATCH calls for `userId`, `agencyId`, `status` changes |
| F-06 | S2 | Contractor GET/PATCH by ID lacks agency scoping (`src/app/api/contractors/[id]/route.ts:13-16,36-39`) | Add `agencyId` comparison; review access logs |
| F-07 | S3 | Booking email HTML does not escape user input (`src/app/api/booking/route.ts:67-82`) | Escape or template the HTML |
| F-08 | S3 | Consent forced true (`src/app/api/growth-lead/route.ts:55-57,115`) | Record the actual value; do not infer consent |

These are pre-existing and are **not** fixed by this documentation. They must be scheduled before the new public surface ships (see `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md`, Phase 0).

---

## 9. Findings register and control gaps

Full register with evidence: `01_APPLICATION_AUDIT.md` §"Findings register" (F-01–F-20). Security-relevant status:

| Finding | Class | Status after this suite | Required phase |
|---|---|---|---|
| F-01 plaintext password in logs | Credential | Fixed in Phase 0 (pending reviewer sign-off) | Phase 0 (blocker) |
| F-02 plaintext credential to browser | Credential | Fixed in Phase 0 (pending reviewer sign-off) | Phase 0 (blocker) |
| F-03 mass assignment | Authorization | Fixed in Phase 0 (pending reviewer sign-off) | Phase 0 (blocker) |
| F-05 no applicant acknowledgment | Process | Addressed by design A | Phase 1 |
| F-06 missing agency scope | Authorization | Fixed in Phase 0 (pending reviewer sign-off) | Phase 0 (blocker) |
| F-07 HTML injection in email | Injection | Fixed in Phase 0 (pending reviewer sign-off) | Phase 0 |
| F-08 forced consent | Compliance | Fixed in Phase 0 (pending reviewer sign-off) | Phase 0 |
| F-09 per-instance rate-limit fallback | Availability | Accepted with monitoring | Phase 2 |
| F-10 no scheduler/queue | Operations | Addressed by design (queues first) | Phase 1–2 |
| F-14 raw error messages | Information disclosure | Fixed in Phase 0 (pending reviewer sign-off) | Phase 0 |
| F-15 no email log | Observability | Addressed by design (mailer adapter) | Phase 2 |
| F-18 no reason taxonomy | Fairness/audit | Addressed by design (`TalentDecision.reasonCode`) | Phase 2 |

**Phase 0 implementation (2026-11-07):** the seven fixes exist in the working tree with unit coverage in `tests/phase0-security.test.ts`. Status remains `fixed-pending-review` until the security reviewer completes §13. No commits were created.

**Control gaps accepted for Phase 1 (documented, not hidden):**

- No automated malware scan on uploaded portfolio files. Mitigation: extension and size whitelist, manual review, no direct execution, Drive preview only.
- No field-level database encryption for Confidential fields. Mitigation: access control, audit, no export without approval.
- No automated PII discovery in free-text notes. Mitigation: reviewer guidance, redaction on export, restricted access.
- Rate limiting is weaker during a database outage (`src/lib/rateLimit.ts:23-26,29-46`). Mitigation: alert on fallback, tighten at the edge if abuse is observed.

---

## 10. Audit and monitoring requirements

### 10.1 What must be audited

| Event | Record | Minimum fields |
|---|---|---|
| Application submitted | `ApplicantEvent` + `AuditLog` | applicant id, source, timestamp, consent version |
| Status change | `ApplicantEvent` | from, to, actor, reason |
| Rubric review recorded | `TalentReview` + audit | reviewer, rubric version, weighted score, band |
| Interview scheduled/changed | `TalentInterview` + audit | actor, slot, timezone, attendees |
| Decision recorded | `TalentDecision` + audit | decision, reason code, actor, evidence |
| Document requested/received/verified/waived | `TalentCredential` + audit | type, status, actor, expiry |
| Restricted document viewed | Access log entry | actor, file id, timestamp, purpose |
| Rate set or excepted | `TalentRate` / `RateException` + audit | amount band or exception, approver |
| Contract assembled/sent/signed | Audit + signature event | contract id, actor, channel |
| Automation run | `AutomationRun` | automation, mode, status, fallback, duration |
| Email sent | `EmailLog` | template, status, related record (no body) |
| Export performed | Audit | actor, entity scope, fields, purpose |
| Deletion/anonymization | Deletion record + audit | counts, timestamp, approver (no PII) |

`CONFIRMED`: `logAudit(user, { action, method, path, entity, entityId, metadata })` exists and is best-effort (`src/lib/audit.ts:14-31`); audit failures never block the request. `CONFIRMED`: `AuditLog` is a technical trail, not a decision log (`prisma/schema.prisma:481-498`). The typed records above are `PROPOSED`.

### 10.2 Monitoring

| Signal | Threshold | Action |
|---|---|---|
| Automation fallback rate | > 2% over 24h | Investigate; consider disable |
| Public apply rate-limit hits | > 100/hour sustained | Review bot defense; consider edge block |
| Email failures | > 5% over 1h | Check transport; queue manual resend |
| Queue items past due | > 10 open | Escalate to ops lead |
| Restricted document access | Any access outside owner/Principal | S2 incident |
| Cross-agency query attempt | Any | S2 incident; review guard |
| AI output schema failures | > 5% over 1h | Disable AI; use fallback |

### 10.3 Log hygiene

- No secrets, tokens, passwords, or Restricted fields in logs. `CONFIRMED` violation: F-01.
- No full request bodies in logs for talent routes.
- Correlation ID per request, propagated to audit and email log.
- Log retention aligns with §7.1; audit retention is longer and tamper-evident where the host allows.

---

## 11. Third-party and vendor rules

1. **Reuse before buy.** The stack already provides auth, database, storage, email, and hosting. A new vendor needs a written reuse analysis (`CREATIVE_TALENT_OPERATIONS.md` §15).
2. **Data processing terms required** for any vendor that sees Internal or Confidential data.
3. **No Restricted data to any vendor** without a security review and a signed agreement. This includes AI providers, form tools, and analytics.
4. **Sub-processor disclosure** must be recorded.
5. **Exit plan:** data export and deletion must be possible without vendor cooperation beyond the contract.
6. **Current vendors observed:** PostgreSQL host (`UNKNOWN` provider), Google Drive (service account), GitHub (Octokit), Slack (bot token), SMTP (`UNKNOWN` provider). Each is `LIKELY` in production; configuration is `UNKNOWN`.

---

## 12. Secure development requirements

Before any talent-operations code merges:

- [ ] Route starts with the correct guard and returns early on `isNextResponse`.
- [ ] Ownership and agency scope are enforced server-side.
- [ ] Writable fields are allowlisted; no body spread.
- [ ] Public routes call `rateLimit` and are deliberately added to the CSRF exemption list only if required.
- [ ] Mutations call `logAudit` and create the typed record.
- [ ] Errors are typed; no raw `error.message` to the client.
- [ ] Uploads use field/extension/size whitelists and go to Drive, not local disk.
- [ ] Email uses the shared mailer and a versioned template; no Restricted data in the body.
- [ ] PII redaction runs before any AI call; kill switch tested.
- [ ] New env vars are documented and never exposed to the client.
- [ ] Unit tests cover the state machine, rubric math, redaction, and rate-limit behavior.
- [ ] A dry run against synthetic data is attached to the change.
- [ ] Rollback is documented and tested (flag off, additive tables left in place).

---

## 13. Verification checklist (for the security reviewer)

1. Read `01_APPLICATION_AUDIT.md` findings F-01–F-20 and confirm each is either fixed, scheduled, or accepted in writing.
2. Confirm Phase 0 blockers F-01, F-02, F-03, F-06 are closed before `/apply` is enabled.
3. Walk the five hard stops and confirm each has a queue path and no outbound bypass.
4. Confirm every new route has a guard, scope check, allowlist, audit call, and rate limit where public.
5. Confirm the redaction list is implemented in code and covered by a test that fails if a Restricted field reaches the adapter.
6. Confirm the kill switches work without a deploy.
7. Confirm consent is explicit, versioned, and withdrawable.
8. Confirm retention jobs (or manual runbooks) exist and are owned.
9. Confirm the incident procedure has a named on-call and a contact path.
10. Confirm no new paid vendor was added without a reuse analysis.

---

## 14. Policy ownership and change control

| Item | Owner | Review cadence |
|---|---|---|
| This policy | Lead Developer | Quarterly, or after any S1/S2 incident |
| Redaction list | Lead Developer + security reviewer | Before any AI enablement; quarterly |
| Approval matrix | Lead Developer | Quarterly |
| Retention schedule | Lead Developer + legal | Annually and at launch |
| Findings register | Lead Developer | Monthly |
| Incident log | Lead Developer | After each incident |

Changes require a version bump, a changelog entry, and re-approval of the affected roadmap phase. No automation may be enabled against a policy version other than the one it was tested with.

---

## 15. Relationship to other deliverables

| Topic | Authoritative document |
|---|---|
| Current-state evidence and findings | `01_APPLICATION_AUDIT.md` |
| Automation behavior and fallbacks | `03_AUTOMATION_OPPORTUNITY_REPORT.md` |
| Journey, owners, SLA | `04_TALENT_JOURNEY_AND_SLA_MAP.md` |
| Assistant day-to-day rules | `05_ASSISTANT_OPERATIONS_MANUAL.md` |
| Prompt content and schemas | `11_AI_ASSISTANT_PROMPT_LIBRARY.md` |
| Data model and storage folders | `12_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` |
| Phasing, tests, acceptance | `14_IMPLEMENTATION_ROADMAP_AND_ACCEPTANCE.md` |
| Durable agency policy | `CREATIVE_TALENT_OPERATIONS.md` |

**End of policy. Implementation remains paused pending Lead Developer approval.**
