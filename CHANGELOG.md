# Changelog

All notable changes to the **WhoIsDésir Media** platform are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/) and the project adheres
to [Semantic Versioning](https://semver.org/). The version number in `package.json`
is the source of truth; every meaningful change should bump it and add an entry here.

## [1.1.0] - 2026-08-18

Second tracked release. Adds multi-role contractor system, SOW/deliverables workflow,
developer portal, knowledge base, security hardening, and proposal builder.

> Scope: the Amazon Associates plugin and its landing pages are a **separate project**
> and are tracked outside this repository. This changelog covers the WhoIsDésir Media
> agency platform only.

### Added

#### Multi-role contractor system
- `ContractorRole` database model supporting multiple roles per contractor with
  approval workflow (pending → approved/rejected).
- Contractor "My Roles" page (`/contractor/my-roles`) — view role statuses, request
  new roles from 12 available specializations.
- Admin role management on contractor detail page — approve, reject, remove, or add
  roles with full audit trail.
- Login now stores `contractorRoles[]` array (all approved roles) instead of single
  `contractorRole` string.
- ContractorSidebar dynamically builds navigation from all approved roles (e.g.,
  developer role unlocks Developer Workspace link).
- Sidebar subtitle shows all active roles (e.g., "Photography · Development").

#### SOW ↔ Deliverables connected workflow
- Added `sowId` and `approvedAt` fields to `Deliverable` model for linking
  deliverables to Statements of Work and tracking admin approval.
- Contractor "My SOWs" page (`/contractor/sows`) — view all SOWs with status, see
  SOW scope items, track linked deliverables, update deliverable statuses.
- Admin deliverables management page (`/admin/deliverables`) — view all deliverables
  across contractors/clients, create new deliverables (linked to client, contractor,
  and optionally SOW), approve/reject/request changes, filter by status.
- Deliverables PATCH now allows contractors to update their own deliverables' status
  (in-progress, pending-approval) — previously blocked by admin-only auth.
- Auto-sets `approvedAt` timestamp when admin approves a deliverable.

#### Developer portal
- Public developer landing page (`/developer`) — tech stack, architecture, API
  reference, security model, database schema, project structure.
- Contractor Developer Workspace (`/contractor/developer`) — quick links to GitHub,
  Vercel, Supabase; git workflow reference; environment variables guide; embedded
  developer training.
- Developer training guide (`public/developer-training.html`) — 9 sections covering
  access setup, local development, project structure, auth patterns, git workflow,
  conventions, vibe coding best practices, common tasks.
- Developer-specific sidebar items (Developer Workspace) shown only when contractor
  has `developer` role approved.

#### Knowledge base
- Public Knowledge Base (`/knowledge-base`) — 21 expandable lessons across 5
  categories: Getting Started, Vendor, Client, Developer, Google Drive.
- Developer lessons (D1–D5): Getting Started, Git Workflow, Auth Patterns, Vibe
  Coding Best Practices, Tech Stack Reference.
- Accessible without login for vendors, clients, and developers.

#### Security hardening
- CSRF double-submit cookie protection (`src/middleware.ts`) on all mutating API
  routes (except auth, booking, plugin-lead). `CsrfProvider` in root layout patches
  `window.fetch` to attach the header.
- Audit logging (`src/lib/audit.ts`) on all state-mutating operations — contracts,
  signatures, settings, agreements, addenda, clients, contractors, SOWs, credentials.
- Rate limiting (`src/lib/rateLimit.ts`) on public endpoints (booking, plugin-lead,
  reset-password).
- Auth guards on all API routes — `requireAdmin`, `requireAdminOrStaff`,
  `requireAuth(roles)` with `isNextResponse` check. No unguarded routes remain.
- Storage limits for contractor uploads (`src/lib/storage.ts`) — 500MB default cap
  per contractor.

#### Proposal builder
- Proposal builder system (`/proposal-builder`) — admin can create branded proposals
  with line items, generate PDF, and share checkout links.
- Proposal PDF generator (`src/lib/proposal-generator.ts`, 3,202 lines) — renders
  professional proposals with line items, totals, terms, and branding.
- Checkout page (`/proposal-builder/checkout`) — client-facing proposal acceptance
  and payment flow.
- Success page (`/proposal-builder/success`) — post-acceptance confirmation.

#### Documentation & training
- Admin Drive setup guide (`public/admin-drive-setup.html`) — 6-step visual flow for
  setting up Google Drive Shared Drive folders per client.
- Vendor training updated with Google Drive upload instructions (Section 6 + 6a).
- Client training updated with Google Drive media gallery access instructions
  (Section 3, 5 steps).
- Portal guide (`/portal-guide`) with role-specific instructions for Vendor, Client,
  Developer, and Admin roles.
- Public developer landing page with full tech stack documentation.

### Fixed
- Folders API blocking contractors — added `contractor` role to allowed roles list
  in `GET /api/folders`.
- Contractor folder loading falls back to client's root `googleDriveFolderId` when
  no sub-folders exist.
- Client media page falls back to root Drive folder when contractor has no
  sub-folders.
- Client deliverables page replaced hardcoded mock data with real API fetch from
  `GET /api/deliverables`.
- Contractor deliverables PATCH now allows contractors to update their own
  deliverables' status (was previously admin-only).

### Changed
- Rebranded product from "Freelancer Talent Agreement System" to "Creative Business
  Operations Platform" across all pages, sidebars, training docs, and metadata.
- Added version display (`v1.1.0`) to landing page, developer docs, knowledge base,
  portal guide, and all public training HTML files.

### Security
- CSRF double-submit cookie protection on all mutating `/api/*` routes.
- Audit logging on all state-mutating operations with entity tracking.
- Rate limiting on public endpoints (booking, plugin-lead, reset-password).
- Auth guards enforced on every API route handler — no unguarded routes.
- Contractor upload storage limits enforced per-contractor.
- Removed secret references from `vercel.json`.

### Infrastructure
- Google Drive service account integration with Shared Drive support.
- Vercel environment variables configured: `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
  `GOOGLE_PRIVATE_KEY`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
- `ContractorRole` database model with unique constraint on
  `(contractorId, role)`.
- `Deliverable` model enhanced with `sowId` and `approvedAt` fields.
- Backfill script (`prisma/backfill-roles.ts`) migrated existing single-role
  contractors to the multi-role system.

## [1.0.0] - 2026-08-12

First tracked release. Captures all work since the project began (2026-07-17).

> Scope: the Amazon Associates plugin and its landing pages are a **separate project**
> and are tracked outside this repository. This changelog covers the WhoIsDésir Media
> agency platform only.

### Added

#### Core platform
- Admin, contractor, and client portals (role-based dashboards with dedicated sidebars).
- **Client portal** with full dashboard UI and Google Drive media access
  (project-based image gallery + per-client media folders).
- **Project management system**: timelines, progress, deliverables, statuses.
- **Dual-party contract signing**: admin signs the agency pad, contractor signs from
  their portal; a contract activates only when both parties have signed.
- **SOW editing and deliverable approval**: admins edit SOW deliverables in a modal;
  contractors approve or deny each deliverable.
- **Contractor assignment**: admins assign contractors to projects/deliverables; vendors
  get their own project and deliverable pages.
- Contractor list page at `/contractors`.
- Per-client **folder management** with Google Drive embedding.
- **Password reset**: API endpoint, admin reset button, and "forgot password" flow.
- Internal training pages for admin and contractor portals.
- **Google Drive vendor delivery** (WD sprint):
  - WD-101/102 — Cleaned/normalized Google Drive links across the app plus an embedded
    Google Drive folder view (`embeddedfolderview`) in the client media gallery.
  - WD-103 — Vendor photo upload straight into the client's shared Drive folder
    ("Deliver Photos to Client Drive" in the contractor portal).
  - WD-105 — Shared-drive support for service-account uploads (service accounts cannot
    write to a personal My Drive) and clickable "folder / file" tiles for deliverables
    that aren't images.

#### Marketing & landing pages
- Publicis-inspired landing page (services, platform, how-it-works).
- **Désir Fils keynote speaker page** at `/speaker` with a booking API route.
- GTM Strategy executive HTML landing page.

### Changed
- Brand identity assets added: headshot, logo, YouTube video, event photo
  (brand assets copied into `public/` for Vercel compatibility).
- Speaker inquiries pointed to Désir with proper greeting.

### Fixed
- Removed secret references from `vercel.json`.
- Admin client sub-pages 404s — moved to correct route paths.
- Client media gallery 404 — replaced deprecated `embeddedfolderview` URL with a
  working Google Drive iframe, then direct open-in-Drive link.
- Dual-party signing edge cases and better signature error messages/logging.
- Prisma `db push` hanging against Supabase PgBouncer — removed from the build command
  and switched to a `DIRECT_URL` for direct connections.

### Infrastructure
- Supabase PostgreSQL + Vercel deployment config.
- Conditional `prisma db push` (only when `DATABASE_URL` is set).
- Google Drive API integration (service account, shared-drive setup, upload/list API).

[1.1.0]: https://github.com/whoisdesirtech/widmediaagency/releases/tag/v1.1.0
[1.0.0]: https://github.com/whoisdesirtech/widmediaagency/releases/tag/v1.0.0
