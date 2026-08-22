# Architecture

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict-ish) |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | NextAuth.js credentials strategy |
| File Storage | Google Drive API (service account) |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/
│   ├── api/              # 37 route handlers
│   │   ├── auth/         # NextAuth + reset-password
│   │   ├── contractors/  # CRUD + roles + upload
│   │   ├── clients/      # CRUD + login
│   │   ├── deliverables/ # CRUD with role-scoped access
│   │   ├── sows/         # CRUD with contractor scoping
│   │   ├── projects/     # CRUD + images
│   │   ├── contracts/    # Assembly + signing
│   │   ├── audit/        # Audit log feed
│   │   └── ...           # documents, invoices, settings, etc.
│   ├── admin/            # Admin portal pages
│   ├── contractor/       # Contractor portal pages
│   ├── client/           # Client portal pages
│   └── ...               # Public pages (landing, developer, knowledge-base)
├── components/           # 9 shared components
├── lib/                  # Shared utilities
│   ├── auth.ts           # Session helpers, role guards
│   ├── audit.ts          # Audit logging
│   ├── rateLimit.ts      # Rate limiting
│   ├── storage.ts        # Upload storage limits
│   ├── prisma.ts         # Prisma client singleton
│   ├── drive.ts          # Google Drive helpers
│   ├── driveService.ts   # Google Drive service account
│   └── proposal-generator.ts  # PDF generation (3,202 lines)
├── middleware.ts          # CSRF double-submit protection
└── types/                # TypeScript type definitions

prisma/
├── schema.prisma         # 18 models
├── seed.ts               # Dev seed data
└── backfill-roles.ts     # Migration: single-role → multi-role
```

## Auth Flow

1. User submits credentials to `/api/auth/[...nextauth]`
2. NextAuth validates against `User` table
3. Session carries: `id`, `email`, `name`, `role`, `agencyId`, `contractorId`, `clientId`
4. Client-side: login page fetches `/api/me` → stores user in localStorage
5. For contractors: also fetches `GET /api/contractors/{id}/roles` → stores `contractorRoles[]`
6. Every API route starts with an auth guard (`requireAdmin`, `requireAuth`, etc.)

## Key Relationships

```
Agency → Contractor (1:many)
Agency → Client (1:many)
Contractor → SOW (1:many)
Contractor → ContractorRole (1:many)
Client → Project (1:many)
Project → Deliverable (1:many, via projectId)
Contractor → Deliverable (1:many, via contractorId)
SOW → Deliverable (1:many, via sowId)
Client → Deliverable (1:many, via clientId)
```

## Security Layers

1. **CSRF** — double-submit cookie on all mutating API routes
2. **Auth guards** — every route handler starts with role verification
3. **Rate limiting** — public endpoints protected
4. **Audit logging** — all state mutations tracked
5. **Storage limits** — per-contractor upload caps
6. **File type whitelisting** — uploads restricted by extension and size

## Proposal Creator Suite — Cross-Project Context

A separate development effort is building a **Proposal Creator Suite** (a.k.a. the new Proposal Generator): a pre-sales system covering prospect research, social audits, creative mockups, AI-generated proposals, and acceptance. It will integrate into this platform under `Sales` (Sales → Proposals, Sales → Prospects → Proposal). Assume it exists when making future changes here.

### Stage Split (DECIDED 2026-08-22)

| Stage | Owner | Tool |
|---|---|---|
| Pre-sales (prospect → lead → proposal → acceptance) | New suite | Proposal Creator Suite |
| Post-deposit onboarding (light engagement/pricing docs for small deals) | This repo | Existing `src/lib/proposal-generator.ts` |
| Formal post-sale contracting | This repo | `MasterAgreement`/`Addendum`/`SOW` → `AssembledContract` → `Signature` |

The existing template generator (`proposal-generator.ts`, currently powering `/api/proposal` and static pages under `/public/proposals/{slug}/`) is **not** redundant under this plan — it is repurposed as the onboarding-document tool after deposits. Do not delete or rename it until the suite reaches integration parity.

### Entity Mapping (target → current)

| Target concept | Current state |
|---|---|
| Organization | ❌ none — `Client` is de-facto org; decide promote-vs-new before integration |
| Lead / Pipeline | ⚠️ partial — `BookingInquiry`, `PluginDownloadLead` capture forms only |
| Prospect Intelligence / Social Audits | ❌ none on main (PR #2's `InfluencerAudit` is influencer-focused, not this) |
| Client Account | ✅ `Client` + client portal |
| Project / Tasks / Deliverables / Files / Approvals | ✅ `Project`, `ProjectTask`, `TaskReview`, `Deliverable`, `FileFolder`, review workflow |
| Contractors / Agreements / Payments | ✅ `Contractor`, `ContractorRole`, SOW stack, `Invoice` |
| Vendors | ❌ none |

### Integration Principles

1. Never duplicate `Lead`, `Organization`, `User`, `Client`, or `Project` concepts that already exist.
2. Conversion chain stays clean: Prospect → Lead → Contact → Organization → Client Account → Project. Conversion = link/convert, never duplicate.
3. A prospect is not a client; a lead is not a platform user; a proposal does not auto-create an account.
4. Prospect research, scoring, and internal notes stay internal; client-facing artifacts are intentionally separated (existing pattern: standalone pages in `/public/proposals/{slug}/`).
5. New suite entities must carry `agencyId` (multi-tenant ready) and reuse existing auth/authz/db patterns.
6. No architectural changes to this repo solely to accommodate the suite without checking existing models first.
