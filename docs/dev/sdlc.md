# Development Lifecycle

## Branch Strategy

- `main` — production-ready code, deployed by CI
- `develop` — integration branch; all feature PRs target this before promotion to `main`
- `feature/US-NNN-short-description` — feature branches cut from `develop`
- `fix/NNN-short-description` — bug fix branches cut from `develop`

Only `feature/*` and `fix/*` branches may be deleted. `main` and `develop` are permanent.

## Story Workflow

1. **Pick a story** from `docs/user-stories/` that is in **Draft** status
2. **Create a feature branch**: `git checkout develop && git checkout -b feature/US-NNN-short-description`
3. **Update story status** to **In Progress** in `docs/user-stories/README.md`
4. **Implement** the story's acceptance criteria
5. **Update documentation** (local-setup.md, architecture.md, api.md as needed)
6. **Run `/qa`** to verify acceptance criteria and run tests
7. **Spawn a reviewer sub-agent** for independent code review
8. If reviewer passes: **commit and push** the feature branch
9. **Create a PR** targeting `develop`
10. After merge to `develop`, update story status to **Done**

## Commit Messages

Use conventional commit format with the user story number:

```
feat(auth): implement US-001 Google Sign-In
fix(tasks): resolve drag-and-drop revert issue in US-006
```

## Pull Requests

All PRs target `develop`. The PR description should reference the user story number(s) and list the acceptance criteria verified.

## Deployment

- Pushing to `develop` triggers a preview deployment on Vercel
- Pushing to `main` triggers a production deployment on Vercel
- No manual deployment steps required