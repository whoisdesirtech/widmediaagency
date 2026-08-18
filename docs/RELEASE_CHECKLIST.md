# Release Checklist

## Pre-Release

- [ ] Review Git status (clean working tree)
- [ ] Review commits since previous release
- [ ] Identify features, bug fixes, breaking changes, security changes
- [ ] Determine version increment (MAJOR/MINOR/PATCH)
- [ ] Update `package.json` version
- [ ] Update `CHANGELOG.md` with release entry
- [ ] Run `npm run typecheck` — must pass
- [ ] Run `npm run build` — must pass
- [ ] Review database migrations (`npm run db:push` status)
- [ ] Review environment variable changes
- [ ] Review security-sensitive changes
- [ ] Update documentation if needed

## Release

- [ ] Commit release changes
- [ ] Create Git tag (`git tag vX.Y.Z`)
- [ ] Push to origin (`git push origin main --tags`)
- [ ] Verify Vercel deployment succeeds
- [ ] Verify production site loads

## Post-Release

- [ ] Verify key features work in production
- [ ] Check Vercel deployment logs for errors
- [ ] Document any issues found
- [ ] Clean up stale branches (with authorization)
