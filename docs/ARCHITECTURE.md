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
