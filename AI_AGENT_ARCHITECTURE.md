# AI AGENT ARCHITECTURE — Recommended Design for the WhoIsDésir Platform

- **Date:** 2026-08-12
- **Baseline (verified):** the repo currently contains **zero AI code**; `src/data/clauses.ts`/`addenda.ts` contain AI *template text*; marketing pages reference AI. This document defines what to build.
- **Principle:** LLMs are commodity — integrate. **Orchestration over your proprietary workflow data is the moat — build.** All agents are **human-in-the-loop for writes**, autonomous only for drafts/reminders/summaries.

---

## 1. TOP-LEVEL ARCHITECTURE

```
                 ┌───────────────────────────────────────────┐
                 │  YOUR DOMAIN ENGINE (BUILD — the moat)     │
                 │  Workflow/state machine + events + audit   │
                 │  (contract.signed, deliverable.submitted,  │
                 │   invoice.due, compliance.expiring ...)    │
                 └───────────────────┬───────────────────────┘
                                     │ reads/writes (tool-calls)
                                     ▼
                 ┌───────────────────────────────────────────┐
                 │  ORCHESTRATOR (BUILD)                     │
                 │  Task routing · memory · guardrails ·     │
                 │  human-approval gate · audit log          │
                 └──────┬───────────┬───────────┬───────────┘
                        │           │           │
                 ┌──────▼───┐ ┌─────▼────┐ ┌─────▼─────┐
                 │ Agent 1  │ │ Agent 2  │ │  Agent 3  │ ...
                 │ (domain) │ │ (domain) │ │  (domain) │
                 └────┬─────┘ └────┬─────┘ └────┬─────┘
                      │            │            │
              ┌───────▼────────────▼────────────▼───────┐
              │  TOOL LAYER (wraps your APIs)           │
              │  contractTools · sOWTools · driveTools  │
              │  invoiceTools · bookingTools · client   │
              │  (each = typed function, zod-validated) │
              └───────┬────────────┬────────────┬───────┘
                      │            │            │
              INTEGRATE(LLM API)  │          INTEGRATE(providers)
              OpenAI/Anthropic   │          email/resend · drive ·
              (models are        │          calendar · stripe · esign
               commodity)        │
                                 ▼
                    INTEGRATE(workflow glue) n8n / Zapier
                    (optional: cross-SaaS automation)
```

**Key idea:** agents never talk to the DB directly — they call **typed tools** (your existing API routes) so the orchestrator controls scope, permissions, and the audit trail.

---

## 2. THE FIVE AGENTS

All share: goal, tools allowed, memory scope, approval policy (READY = autonomous · APPROVAL = human-required), notification channel (Resend email / in-app inbox).

| Agent | Job-to-be-done | Primary tools | Autonomy | Trigger events |
|---|---|---|---|---|
| **1. Sales/Inquiry Agent** | Convert inquiries (`BookingInquiry`) → qualified lead → booked intake call → draft SOW brief | bookingTools, calendarTools (Cal.com), clientTools, sOWTools(draft only), emailTools | READY: reply, qualify, book, draft brief. APPROVAL: send final pricing/SOW to client | `booking.created` |
| **2. Contract/Ops Agent** | Draft SOWs/addenda from briefs, assemble contracts, chase signatures, flag missing docs, remind on compliance expiry | contractTools (assemble/draft), sOWTools, contractorTools, emailTools, complianceTools | READY: drafts, reminders, status nudges. APPROVAL: finalize contract, send for signature | `sow.drafted`, `contract.pending_signature`, `compliance.expiring`, `contract.paused` |
| **3. Delivery/Task Agent** | Track project deadlines, chase deliverable submissions, detect delays/risks, coordinate vendor → client uploads | projectTools, deliverableTools, driveTools (read/status), emailTools, calendarTools | READY: reminders, risk alerts, status summaries. APPROVAL: auto-assign work, approve deliverables | `deliverable.due_soon`, `deliverable.submitted`, `project.at_risk`, `upload.completed` |
| **4. ClientSuccess Agent** | Summarize project status for clients, prep status updates, field common questions (status/progress/media), escalate humans | projectTools, deliverableTools, driveTools, clientTools, messageTools(via email), emailTools | READY: summaries, FAQ replies, media-availability answers. APPROVAL: share pricing, cancel/change scope | `project.status_changed`, `deliverable.approved`, `client.message` |
| **5. Finance Agent** | Generate invoice drafts from deliverables, chase overdue invoices, reconcile Stripe payments, report revenue per project/contractor | invoiceTools, stripeTools(read), accountingTools(QBO sync), emailTools | READY: invoice drafts, reminders, revenue reports. APPROVAL: send invoices, apply late fees, write off | `invoice.due`, `invoice.overdue`, `payment.received`, `monthly.close` |

---

## 3. CONCRETE USER STORIES (tie to existing code)

1. **"Contract/Ops, draft the SOW for the Start Social Q3 project from this brief."** → Agent uses `sOWTools.draftFromBrief` (grounded in `src/data/clauses.ts` + past SOWs) → creates a draft SOW in the DB → notifies admin for approval → on approval, assembles contract via existing `/api/contracts/assemble`.
2. **"Nudge the photographer: deliverable 2 is due tomorrow."** → Delivery agent checks `Deliverable` due dates → sends Resend email + in-app notification to contractor → if late, escalates alert to admin.
3. **"Summarize last month for Start Social."** → ClientSuccess agent reads `Project`, `Deliverable` (approved/denied), Drive folder activity → drafts a branded status email for admin approval.
4. **"Invoice Désir Media for the completed Jaxon shoot."** → Finance agent drafts an `Invoice` from approved deliverables → admin approves → sends via Stripe Payment Link → marks paid on `payment.received` webhook.
5. **"A new speaker booking inquiry arrived."** → Sales agent qualifies via `/api/booking` → books Cal.com slot → drafts initial reply for approval.

---

## 4. GUARDRAILS & SAFETY (mandatory)

| Rule | Implementation |
|---|---|
| Human-in-the-loop on writes | Orchestrator `APPROVAL` gate before any tool that mutates legal/financial/scope data; agent creates **drafts** + sends approval notification |
| Only agents may use tools | Tools call **your authenticated API** (fix auth first — P0) and enforce agent identity + permission scope |
| Full audit trail | Every agent tool-call logged (who/what/when/why) → reuse for reporting & trust |
| No prompt injection via client data | Treat any client/contractor-supplied text as untrusted data, never instructions; validate tool args with zod |
| Model choice behind `AIProvider` | Swap OpenAI/Anthropic per task (drafting vs classification); keep one interface |
| Cost + latency guardrails | Token budgets per task, rate limits, caching of clause embeddings |
| Sensitive data policy | Agent memory never stores full tax forms/insurance PDFs; references file IDs only |

---

## 5. IMPLEMENTATION PLAN (incremental — 4 quarters)

| Step | Timeline | Deliverable |
|---|---|---|
| 1. Harden auth + API surface (pre-requisite for agents to be safe) | Q1 | Authenticated, zod-validated routes; agent identity layer |
| 2. Domain engine + typed tool layer | Q2 | Event/state machine; `tools/` package wrapping existing API routes; audit log |
| 3. Orchestrator skeleton + AIProvider | Q2 | Router, memory, approval gate; OpenAI/Anthropic behind interface |
| 4. Agent 2 (Contract/Ops) MVP — highest ROI on existing contract engine | Q3 | Draft SOW/addenda, chase signatures, compliance reminders |
| 5. Agents 3 & 5 (Delivery, Finance) | Q3–Q4 | Deliverable reminders/risk; invoice drafting + overdue chaser |
| 6. Agents 1 & 4 (Sales, ClientSuccess) | Q4 | Inquiry→booking→brief; status summaries + FAQ |
| 7. Observability & eval harness | Ongoing | Agent logs, success-rate metrics, human-feedback capture |

**Start with Agent 2 (Contract/Ops)** — it sits directly on the strongest, most complete part of your codebase (contracts/SOW/signatures) and delivers the clearest "AI does the paperwork" story for positioning.
