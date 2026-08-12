# Changelog

All notable changes to the **WhoIsDésir Media** platform are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/) and the project adheres
to [Semantic Versioning](https://semver.org/). The version number in `package.json`
is the source of truth; every meaningful change should bump it and add an entry here.

## [1.0.0] - 2026-08-12

First tracked release. Captures all work since the project began (2026-07-17).

> Note: before 1.0.0, the Amazon plugin landing pages were versioned ad-hoc in commit
> messages (v1.1.0, v1.2.0, v1.5.0). That work is included under this release.

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
- **Amazon Associates** PHP snippets landing page + plugin zip download.
- **OAuth 2.0 access token** authentication support in the plugin and admin UI.
- Amazon `amazon_comparison` shortcode with responsive grid CSS.
- Lead-gated Amazon plugin downloads (`PluginDownloadLead` model + `/api/plugin-lead`).
- GTM Strategy executive HTML landing page.
- v1.5.0 rebrand of the Amazon plugin landing pages.

### Changed
- Brand identity assets added: headshot, logo, YouTube video, event photo
  (brand assets copied into `public/` for Vercel compatibility).
- Speaker inquiries pointed to Désir with proper greeting.
- Landing/plugin brand colors and copy updated to the WhoIsDésir look.

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

## [Unreleased]

- Amazon plugin landing page v1.5.1 refinements (in progress, not yet committed).
- Client dashboard media count (`77`) still hardcoded — planned WD-107.

[1.0.0]: https://github.com/whoisdesirtech/widmediaagency/releases/tag/v1.0.0
