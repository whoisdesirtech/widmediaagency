# Version Control Policy

## Version Numbering

This project uses [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

### MAJOR

Breaking changes. Examples:
- Database schema changes that require data migration
- API endpoint removal or signature changes
- Auth flow changes that require user action
- Removal of features

### MINOR

New backward-compatible functionality. Examples:
- New pages or features
- New API endpoints
- New database models or fields (additive)
- New role permissions

### PATCH

Backward-compatible bug fixes. Examples:
- Fixing broken pages
- API response corrections
- UI fixes
- Documentation updates

## Version Source of Truth

`package.json` → `version` field is the source of truth.

## Release Process

1. All work happens on `main` (or feature branches merged via PR)
2. When ready to release:
   - Bump version in `package.json`
   - Update `CHANGELOG.md` with release entry
   - Commit: `chore: release vX.Y.Z`
   - Create Git tag: `git tag vX.Y.Z`
   - Push: `git push origin main --tags`
3. Vercel auto-deploys on push to `main`

## Git Tags

Tags follow the format `vX.Y.Z` (e.g., `v1.0.0`, `v1.1.0`).

## Branch Naming

- `main` — production-ready code
- `feat/description` — feature branches
- `fix/description` — bug fix branches
- `chore/description` — maintenance branches

## AI Agent Rules

AI coding agents must NOT:
- Bump versions without explicit authorization
- Create Git tags without explicit authorization
- Force-push to any branch
- Delete branches
- Rewrite Git history
- Deploy to production without authorization
