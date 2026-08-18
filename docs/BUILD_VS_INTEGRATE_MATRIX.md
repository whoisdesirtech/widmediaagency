# WhoIsDésir® Media — Build vs. Buy vs. Integrate Matrix

**Phase 7 of the product audit.** Companion to `PRODUCT_ARCHITECTURE_AUDIT.md`.

Decision rule used throughout:
- **BUILD** only what is (a) core to the differentiated workflow and (b) cheap to own
  long-term. Build = competitive moat or existential.
- **INTEGRATE** (use a vendor/SaaS) what is commodity, complex to maintain, or requires
  certifications you don't have. Integrate = adopt + wrap.
- **BUY** (purchase outright / licensed embed) when the value is small and a mature vendor
  wins on compliance/trust.

---

## Capability-by-capability matrix

| Capability | Current state (verified) | Decision | Rationale |
|---|---|---|---|
| **Auth & sessions** | Custom, broken-ish (localStorage, no server auth) | **BUILD** | Existential & core; must be first-party, portal-aware. Use/complete the existing `src/lib/auth.ts` (NextAuth) rather than a third-party auth shell. |
| **RBAC & tenant scoping** | None | **BUILD** | Core security; agency-scoped queries. Not a vendor product. |
| **Contract assembly engine** | Built (good) | **BUILD + own** | The moat (`PROPRIETARY_MOAT.md`). Keep and deepen: versioning, merge rules, jurisdiction logic, PDF output. |
| **Legal clause corpus** | Built (unvetted) | **BUILD + attorney review** | Moat asset. External validation (attorney), not a software purchase. |
| **E-signature capture** | Built (canvas → base64 PNG) | **INTEGRATE (or keep if hardened)** | Commodity; DocuSign/Dropbox Sign/PandaDoc win on compliance + audit trail. If kept in-house: add hash+timestamp+immutable storage, else buy. |
| **PDF / document export** | None (html2canvas/jspdf unused) | **BUILD (small)** or integrate | Low cost either way; a robust PDF renderer (e.g., `pdf-lib`/`react-pdf`) is a quick build. |
| **Email / transactional** | nodemailer + SMTP (booking/plugin only) | **INTEGRATE** | Use Resend / AWS SES / Postmark; templates + deliverability + bounce handling. Do NOT hand-roll. |
| **Payments & invoicing** | Manual invoice records only | **INTEGRATE** | Stripe (Connect for multi-agency later). Webhooks + hosted checkout/payment links. Never build a payments processor. |
| **Scheduling / calendar** | None | **INTEGRATE** | Calendly / Cal.com embed for booking; project timelines stay in-house (they are workflow, not scheduling infra). |
| **Messaging / chat** | Mock data | **INTEGRATE (or minimal build)** | Intercom / Crisp / plain email threads. Replacing mock with a minimal Message model is acceptable MVP; a full chat system is not. |
| **File storage / uploads** | Server FS + Drive (uploads wiped on redeploy) | **INTEGRATE (storage)** | Object storage (S3 / Cloudflare R2 / Supabase Storage) with signed URLs; keep Drive API for client delivery UX. |
| **Google Drive (client delivery)** | Built (service account, shared drives) | **KEEP (own)** | Already works; it's the delivery UX differentiator. Wrap with storage fallback. |
| **CRM pipeline** | Client/contractor records; lead models unused | **BUILD (thin) / INTEGRATE** | Don't build a CRM suite. Build admin UI over `BookingInquiry`/`PluginDownloadLead`; optionally export to a CRM (HubSpot) later. |
| **Workflow automation** | Hardcoded | **INTEGRATE first, then BUILD** | Ship Zapier/Make webhooks to get value instantly; grow a first-party rule engine (trigger→action) only once patterns are proven. |
| **AI / agentic** | None | **BUILD (phased)** | The next moat (`AI_AGENT_ARCHITECTURE.md`). Use LLM APIs (OpenAI/Anthropic) + frameworks (LangChain/Vercel AI SDK) — build the workflow/agents, not the models. |
| **Observability** | None | **INTEGRATE** | Sentry + structured logs (pino) + uptime; not worth building. |
| **Analytics / dashboards** | Basic stats | **BUILD (thin)** | Aggregate internal KPIs; use a BI embed (e.g., Metabase/Superset) if it grows. |
| **Multi-tenancy** | Single-tenant | **BUILD (when SaaS)** | Strategic decision; `Agency` model already supports it. |
| **Database / queue / cache** | Supabase/Cloud SQL | **INTEGRATE** | Managed Postgres + Redis (queue for emails/agents). |

---

## Decision summary & sequencing

**Build (own — the moat):**
1. Auth/sessions/RBAC/tenant scoping (fix the security hole)
2. Contract assembly engine + PDF output (deepen the moat)
3. Legal clause corpus (attorney-vetted, versioned)
4. Google Drive delivery workflow (already built — keep)
5. Agentic AI layer (phased — the future moat)
6. Thin admin surfaces for leads + internal KPIs

**Integrate (adopt — commodity):**
1. Transactional email (Resend/SES)
2. Payments (Stripe)
3. Scheduling (Calendly/Cal.com)
4. Chat (Intercom/Crisp) or minimal in-house messages
5. Object storage (S3/R2/Supabase Storage)
6. Automation glue (Zapier/Make) with webhooks
7. Observability (Sentry, logs)
8. E-sign audit trail (DocuSign/PandaDoc) **if not kept in-house hardened**

**Buy / license (only where specified):** none critical — everything commodity is better
integrated as SaaS than licensed.

---

## Cost comparison (rough annual, at small scale — RE-VERIFY)

| Path | Capability set | Approx cost |
|---|---|---|
| All-build | Everything in-house | $150–400k+ engineering + maintenance forever |
| Recommended (mixed) | Build moat, integrate commodity | $10–30k/mo tooling at scale; ~2–3 eng-yr build for the moat slice |
| All-integrate | Everything via vendors | Loses the moat entirely — not recommended |

---

## Guardrails
- **Rule of thumb:** if it's in `public/uploads`, mock data, or an unused dependency
  (`next-auth`, `html2canvas`, `jspdf`) it's either incomplete or a commodity — finish it
  or integrate it.
- **Never hand-roll:** payments, signing compliance, email deliverability, auth sessions.
- **Never outsource:** contract assembly, clause corpus, agentic workflows, tenant scoping.
