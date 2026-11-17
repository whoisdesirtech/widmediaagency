# 15 — Talent Inquiry Response Library

**Purpose:** Give every operator and AI assistant approved, copy-ready responses for talent inquiries, with the rules for when a response may be sent automatically and when a human must review it.
**Status:** `PROPOSED` templates. The Lead Developer approves the wording once; changes require re-approval.
**Scope:** Inbound talent inquiries, applicants, and approved talent. Client sales responses are out of scope.
**Companion documents:** `05_ASSISTANT_OPERATIONS_MANUAL.md` §5; `13_SECURITY_AND_APPROVAL_POLICY.md` §4; `17_TALENT_QUALIFICATION_FRAMEWORK.md`.

---

## 1. Rules that apply to every message

1. **No promises.** Never say or imply "you're hired", "we'll definitely work with you", "your rate is approved", "the project is confirmed", or "we have a role for you".
2. **No invented facts.** If a field is unknown, say "not recorded yet" and ask. Never guess a rate, date, or availability.
3. **One message, one purpose.** Do not mix an acknowledgment with a decision.
4. **No restricted data.** Never include tax IDs, documents, bank details, other applicants' information, client-confidential material, or internal scores.
5. **Reference every applicant.** Use the public reference (for example `WID-T-2026-0001`).
6. **State the next step and the timeline.** "You'll hear from a human by [date]" is allowed only within the published SLA.
7. **Reply from the approved sender** with the monitored reply-to.
8. **Record the send.** Every outbound message gets an `EmailLog` row and an `ApplicantEvent`.
9. **Stop on withdrawal.** If the person withdraws, send only the withdrawal confirmation and stop all other sequences.
10. **Escalate ambiguity.** If the message would require a judgment about the person's future with the agency, route to a human.

### 1.1 Auto-send vs human review

| Message type | Auto-send? | Condition |
|---|---|---|
| Acknowledgment | ✅ | Approved template, applicant record exists |
| Missing information request | ✅ | One consolidated list, no judgment |
| Interview scheduling | ✅ | Slot confirmed by a human |
| Interview reschedule | ✅ | Within the published policy |
| Status update | ✅ | Status is recorded and current |
| Withdrawal confirmation | ✅ | Withdrawal recorded |
| Document request | ✅ | Required document list is defined |
| "No current fit, stay in pool" | ⚠️ Human review | Requires a recorded reason; no implication of future work |
| Hold | ⚠️ Human review | Requires next action and date |
| Decline | ❌ Human only | Requires a recorded decision and reason code |
| Advance | ❌ Human only | Requires a recorded decision |
| Rate, contract, start date | ❌ Human only | Hard stop |
| Anything about another person or client | ❌ Human only | Private data |

---

## 2. Decision tree for an inbound inquiry

```
New message from a person offering creative services
│
├─ Is it a talent inquiry (not a client, vendor, or spam)?
│   ├─ No → route to the correct queue; do not reply as talent ops
│   └─ Yes ↓
├─ Do we have a name, email, and discipline?
│   ├─ No → ask once, using T-02; keep the thread open
│   └─ Yes ↓
├─ Is there consent to store and review?
│   ├─ No → explain why it is needed; do not create a full profile
│   └─ Yes ↓
├─ Is the portfolio reachable?
│   ├─ No → T-03 (request a working link); status triage_hold
│   └─ Yes ↓
├─ Is the discipline one we represent?
│   ├─ No → T-11 (no current fit); do not promise future work
│   └─ Yes ↓
├─ Is there enough evidence to review?
│   ├─ No → T-03; one consolidated request
│   └─ Yes → T-01 acknowledgment + queue for review
│
Never: quote a rate, promise a project, or state an outcome in the first reply.
```

---

## 3. Template index

| ID | Name | When | Auto |
|---|---|---|---|
| T-01 | Application received | After a complete application | ✅ |
| T-02 | Need basic details | Missing name, email, or discipline | ✅ |
| T-03 | Missing portfolio or samples | Link broken or evidence thin | ✅ |
| T-04 | Interview invitation | Human confirmed a slot | ✅ |
| T-05 | Interview reschedule | Candidate or agency needs a new time | ✅ |
| T-06 | Document request | Verification stage | ✅ |
| T-07 | Reference request | Verification stage | ✅ |
| T-08 | Status update | Candidate asks, status is recorded | ✅ |
| T-09 | Still in review (delay) | SLA at risk, no decision yet | ✅ |
| T-10 | Hold | Human recorded a hold | ⚠️ |
| T-11 | No current fit | Human recorded a decline for fit | ⚠️ |
| T-12 | Decline after review | Human recorded a decline | ❌ |
| T-13 | Advance to next stage | Human recorded advance | ❌ |
| T-14 | Withdrawal confirmation | Candidate withdrew | ✅ |
| T-15 | Rate question (no answer) | Candidate asks about pay | ✅ |
| T-16 | Unverified opportunity (internal) | Staff asks about a lead | Internal |
| T-17 | Duplicate application | Same email applies twice | ✅ |
| T-18 | Accessibility or accommodation | Candidate requests help | ✅ |

**Variables:** `{{firstName}}`, `{{reference}}`, `{{discipline}}`, `{{reviewByDate}}`, `{{senderName}}`, `{{agencyName}}`, `{{missingItems}}`, `{{slotOptions}}`, `{{documentList}}`, `{{statusLabel}}`, `{{nextStep}}`.

---

## 4. Templates

### T-01 — Application received

**Subject:** We received your application — {{reference}}

Hi {{firstName}},

Thank you for applying to {{agencyName}}. Your application reference is **{{reference}}**.

What happens next:
1. A person reviews your portfolio and experience.
2. If we need anything else, we'll ask in one email.
3. You'll hear from us by **{{reviewByDate}}**.

You can check your status any time with your reference and this email address. If you need to withdraw, reply with "withdraw" and we'll confirm.

We review every application, but we can't guarantee a project or a timeline beyond the review.

{{senderName}}
{{agencyName}}

---

### T-02 — Need basic details

**Subject:** A few details to complete your application — {{reference}}

Hi {{firstName}},

Thanks for reaching out. To review your application we need three things:

- Your full name
- The best email address for you
- Your primary discipline: Photography, Videography, Content & Social, or Design & Creative

Reply with those and we'll continue. If you already sent them, ignore this and we'll match them to your application.

{{senderName}}

---

### T-03 — Missing portfolio or samples

**Subject:** We couldn't open your portfolio — {{reference}}

Hi {{firstName}},

Thanks for your application. We tried to open the link below but it didn't load or requires access:

- {{missingItems}}

Could you send a working link, or attach 3–5 samples that show your role on each piece? A short note on what you did on each project helps us review fairly.

Once we have that, your application goes back into review.

{{senderName}}

---

### T-04 — Interview invitation

**Subject:** Interview invitation — {{reference}}

Hi {{firstName}},

We'd like to learn more about your work in a short conversation. Please choose one of these times:

- {{slotOptions}}

The conversation is about 30 minutes and will cover your experience, how you work, and what you're looking for. If none of these times work, reply with two windows that do.

This is a conversation, not an offer or a commitment of work.

{{senderName}}

---

### T-05 — Interview reschedule

**Subject:** Rescheduling our conversation — {{reference}}

Hi {{firstName}},

No problem. Here are new options:

- {{slotOptions}}

If you'd rather suggest times, send two windows and we'll confirm one.

{{senderName}}

---

### T-06 — Document request

**Subject:** Documents needed for onboarding — {{reference}}

Hi {{firstName}},

To complete onboarding we need:

- {{documentList}}

Please upload them through the secure link in your portal. Do not send tax or identity documents as email attachments.

These documents are used only for onboarding and compliance. They are not shared with clients.

{{senderName}}

---

### T-07 — Reference request

**Subject:** Reference check — {{reference}}

Hi {{firstName}},

As part of verification, we'd like to contact two references who can speak to your work. Please send:

- Name, relationship, and preferred contact for each reference

We'll tell you before we contact them. References are used only for this review.

{{senderName}}

---

### T-08 — Status update

**Subject:** Your application status — {{reference}}

Hi {{firstName}},

Your application is currently: **{{statusLabel}}**.

Next step: {{nextStep}}.

If anything has changed — new work, new availability, or a new link — reply and we'll add it to your file.

{{senderName}}

---

### T-09 — Still in review (delay)

**Subject:** An update on your application — {{reference}}

Hi {{firstName}},

We're still reviewing your application. We'd rather take the time to review it properly than send a rushed answer.

We expect to have an update by **{{reviewByDate}}**. Thank you for your patience.

{{senderName}}

---

### T-10 — Hold (human approved)

**Subject:** Your application is on hold — {{reference}}

Hi {{firstName}},

We're keeping your application on hold rather than closing it. The reason is: {{reason}}.

What we need to move forward: {{nextStep}}. The next review date is **{{reviewByDate}}**.

A hold is not a promise of work. It means we want to look again when the missing piece is available.

{{senderName}}

---

### T-11 — No current fit (human approved)

**Subject:** Your application — {{reference}}

Hi {{firstName}},

Thank you for the time you put into your application. We don't have a current fit for your profile in {{discipline}}.

We'll keep your details for the period described in our privacy notice unless you ask us to delete them. You can ask us to remove them at any time.

We wish you well with your work.

{{senderName}}

---

### T-12 — Decline after review (human only)

**Subject:** Your application — {{reference}}

Hi {{firstName}},

Thank you for applying and for sharing your work. After review, we're not moving forward with your application at this time.

The main reason is: {{reason}}.

This decision is about the current need, not a judgment of your work overall. You're welcome to apply again after {{reapplyAfter}} if your portfolio changes.

{{senderName}}

---

### T-13 — Advance to next stage (human only)

**Subject:** Next step in your application — {{reference}}

Hi {{firstName}},

We'd like to move your application to the next stage: {{nextStage}}.

What happens now: {{nextStep}}.

This is progress in our process, not an offer of work or a rate. Those discussions happen separately and in writing.

{{senderName}}

---

### T-14 — Withdrawal confirmation

**Subject:** Withdrawal confirmed — {{reference}}

Hi {{firstName}},

We've withdrawn your application. You won't receive further review messages.

You can ask us to delete your data at any time. If you'd like to apply again later, you're welcome to.

{{senderName}}

---

### T-15 — Rate question (no answer)

**Subject:** Re: your rate question

Hi {{firstName}},

Thanks for asking. We don't quote or confirm rates by email before a scope is agreed and a human has approved it.

If we reach a project discussion, we'll share the rate range and terms in writing, and you'll have time to review them.

{{senderName}}

---

### T-16 — Unverified opportunity (internal note)

**Internal only — do not send externally.**

Opportunity `{{opportunityId}}` is currently **unverified**. Do not contact talent or describe it as an agency project until a human confirms:
- the client's identity and authority to buy,
- a written scope,
- a budget range,
- and the response deadline.

Owner: {{owner}}. Due: {{dueDate}}.

---

### T-17 — Duplicate application

**Subject:** We have your application — {{reference}}

Hi {{firstName}},

It looks like you've applied before with this email. We've linked this submission to your existing application ({{reference}}) so you don't need to send it again.

If the earlier application is out of date, reply with what changed and we'll update it.

{{senderName}}

---

### T-18 — Accessibility or accommodation

**Subject:** How we can make this easier

Hi {{firstName}},

Thanks for telling us. We can adjust the process — for example, a written interview instead of a call, extra time, larger text, or a different format for samples.

Tell us what would help and we'll make it work. You don't need to disclose a diagnosis.

{{senderName}}

---

## 5. Scenarios and model responses

### Scenario 1 — "Do you have any work for me right now?"

**Wrong:** "Yes, we're always looking for photographers — send your rate."
**Right (T-08 or T-15):** Acknowledge, explain the review process, do not promise work, do not ask for a rate before scope.

### Scenario 2 — Candidate asks for a rate on the first message

**Wrong:** "Our rate is $X/day."
**Right (T-15):** Explain that rates are discussed after scope and human approval. No number.

### Scenario 3 — Portfolio is a private Instagram account

**Right (T-03):** Ask for a public link or 3–5 samples with a note on the candidate's role. Do not ask for a password or follow the account from an agency account without approval.

### Scenario 4 — Candidate is strong but there is no current project

**Right (T-10 or T-11 depending on the recorded decision):** Be specific, keep the record, set a review date, and never imply future work is guaranteed.

### Scenario 5 — Candidate applies twice

**Right (T-17):** Link the records, confirm the reference, ask what changed. Do not create a second active pipeline.

### Scenario 6 — Candidate asks "Did I get it?"

**Right (T-08):** Report the recorded status only. If no decision is recorded, say it is still in review and give the date. Never guess.

### Scenario 7 — A staff member asks you to tell a candidate a project is confirmed

**Right:** Refuse. The project is unverified or the contract is unsigned. Route to the owner and cite the hard stop. Internal note T-16.

### Scenario 8 — Candidate asks to be deleted

**Right:** Confirm the request, execute the deletion/anonymization workflow after the retention check, and send a confirmation that contains no personal data. Do not argue.

### Scenario 9 — Candidate sends tax documents by email

**Right:** Do not open or forward them. Ask them to upload through the secure portal, then delete the email attachment per the incident procedure and record the event.

### Scenario 10 — Candidate is a minor

**Right:** Stop the standard process. Escalate to the Lead Developer. Do not collect documents or schedule work until eligibility and consent rules are confirmed.

---

## 6. Tone and structure

### 6.1 Tone

- Plain, warm, and brief.
- No corporate filler, no flattery, no false urgency.
- Respect the person's time: one clear ask per message.
- Never use "unfortunately" as the only explanation; give the reason.
- Never use "we'll keep your CV on file" unless the retention record actually exists.

### 6.2 Structure

1. Greeting with first name.
2. One sentence of context or thanks.
3. The substance: status, request, or next step.
4. The timeline or date.
5. One closing line.
6. Signature.

### 6.3 Approved phrases

| Use | Avoid |
|---|---|
| "A person will review your application." | "Our team of experts will evaluate you." |
| "We'll have an update by [date]." | "Soon." |
| "This is not an offer of work." | "We'd love to have you on board." |
| "We don't have a current fit." | "You're not a good fit." |
| "You can ask us to delete your data." | "We'll keep your details forever." |
| "Rates are discussed after scope and approval." | "Our standard rate is..." |

---

## 7. Response checklist (before sending)

- [ ] Correct reference and first name.
- [ ] No promise of work, rate, contract, or outcome.
- [ ] No restricted or third-party data.
- [ ] One clear ask.
- [ ] Date within the published SLA.
- [ ] Approved template or documented human approval.
- [ ] `EmailLog` and `ApplicantEvent` will be written.
- [ ] Reply-to is the monitored mailbox.
- [ ] If the person withdrew, no other sequence is running.

---

## 8. Template governance

| Item | Rule |
|---|---|
| Owner | Ops Lead |
| Approver | Lead Developer |
| Versioning | Template ID + version stored with every send |
| Change process | Edit, review, approve, bump version, test with a synthetic applicant |
| Localization | Add a locale variant rather than editing the base template |
| Retired templates | Kept for audit, never deleted |
| Metrics | Response time, reply rate, opt-out rate, complaint rate |

---

## 9. What this library does not do

- It does not authorize automatic declines or advances.
- It does not replace the decision record.
- It does not permit rate or contract discussion.
- It does not permit sharing applicant data with clients.

**End of library.**
