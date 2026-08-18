# Known Issues

## Critical

_None identified._

## High

- **No test suite** — Zero test files exist. No test framework is configured. All verification is manual via `npm run typecheck` and `npm run build`.
- **No ESLint** — No linting configuration. Code style is enforced only by convention.

## Medium

- **238 `any` type annotations** — TypeScript strictness is undermined by widespread `any` usage across the codebase.
- **3,202-line monolith** — `src/lib/proposal-generator.ts` handles PDF generation in a single file. Should be decomposed.
- **Stale branches** — `feat/admin-vendor-training-pages` and `feat/security-hardening` are merged but not deleted.

## Low

- **1 untracked file** — `src/lib/proposal-schema.ts` exists but is not committed.
- **Hardcoded values** — Client dashboard media count (`77`) is still hardcoded (planned WD-107).
- **Root-level markdown clutter** — 13 markdown files in project root should be organized into `docs/`.
