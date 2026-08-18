# Recovery Baseline

## Version Information

| Field | Value |
|---|---|
| Current Version | 1.1.0 |
| Previous Version | 1.0.0 |
| Latest Git Tag | v1.0.0 |
| Tag Date | 2026-08-12 |
| Release Date | 2026-08-18 (proposed) |
| Branch | main |
| Remote | origin → whoisdesirtech/widmediaagency.git |

## Commits Since Last Release

15 commits from 2026-08-12 to 2026-08-18.

| Commit | Date | Description |
|---|---|---|
| f1d5268 | 2026-08-18 | feat: connect SOWs and deliverables workflow with admin approval |
| d0fd964 | 2026-08-17 | feat: multi-role contractor system with admin approval flow |
| 64775c4 | 2026-08-17 | feat: add developer workspace, training, and knowledge base lessons |
| e7cbc7b | 2026-08-17 | feat: add public developer landing page with tech stack, API, and architecture docs |
| ca95a70 | 2026-08-17 | feat: add contractor assignment to projects + Drive fallback fixes + test script |
| e99ec1b | 2026-08-17 | fix: allow contractors to access folders API and fall back to client root Drive folder |
| 5fd5d2d | 2026-08-17 | feat: add Google Drive setup guide and update all training docs |
| 6f65503 | 2026-08-17 | feat: add public knowledge base for vendors and clients |
| 649b946 | 2026-08-17 | chore: trigger redeploy for NEXTAUTH_SECRET fix |
| 2ec3f19 | 2026-08-17 | feat: add Google Drive setup guide to admin and vendor training pages |
| bfc5d8f | 2026-08-17 | chore: trigger redeploy for NEXTAUTH_URL fix |
| a1b6421 | 2026-08-17 | feat: add admin and vendor portal training pages |
| 70d2dc6 | 2026-08-17 | Merge pull request #1 from whoisdesirtech/feat/security-hardening |
| 1ba7a62 | 2026-08-17 | feat: security hardening — NextAuth, CSRF, audit logging, rate limiting, auth guards |
| d0f17c0 | 2026-08-12 | docs: scope CHANGELOG to WhoIsDésir Media platform |

## Codebase Metrics

| Metric | Value |
|---|---|
| TypeScript source files | 114 |
| Page components | 54 |
| API route files | 37 |
| Shared components | 9 |
| Prisma models | 18 |
| HTML training/guide pages | 16 |
| Lines of TypeScript | ~9,600 |
| Total files changed since v1.0.0 | 104 (+13,605 / -213) |

## Database State

18 Prisma models. Key models added/modified in v1.1.0:
- `ContractorRole` (new) — multi-role junction table
- `Deliverable` — added `sowId`, `approvedAt` fields

## Environment Requirements

- Node.js 18+
- PostgreSQL (Supabase)
- Google Drive API service account (optional, for Drive features)
- NEXTAUTH_SECRET, NEXTAUTH_URL
- DATABASE_URL, DIRECT_URL (Supabase)
