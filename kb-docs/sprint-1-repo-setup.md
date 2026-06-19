# Sprint 1 — Repository & Project Initialization

## Meta
- Project: Rose App (Elevate Tech bootcamp) — Website
- Sprint: Sprint 1 of 6 (Website)
- Sprint focus: Project setup + the design-system foundation and core UI components
- Shared across all teams: yes — every team gets the same tasks
- Figma: https://www.figma.com/design/q5TO5u0kOpfIZhoozTz0mB/Rose-App--Enhanced-?node-id=16745-10693

## Story: Repository & Project Initialization
- Epic: Project Setup & Infrastructure
- Priority: Highest
- Story points: 5

### User story
As a developer, I want to set up the GitHub repository with all branches, team access, and full project configuration, so the whole team can start developing from a standardized environment.

### Tasks
- GitHub repo created with main, testing, and release branches
- All team members + instructor + mentor invited as collaborators
- Next.js 16 initialized with TypeScript (strict mode)
- Tailwind CSS configured with a custom config file
- next-intl configured with /en and /ar route prefixes
- React Query provider + DevTools in dev mode
- React Hook Form + Zod installed
- ESLint + Prettier + Husky + lint-staged configured
- Path alias @/ mapped to src/

### Acceptance criteria (the task is accepted when ALL pass)
1. TypeScript compiles with zero errors (tsc --noEmit)
2. The dev server starts without errors on localhost:3000
3. /en and /ar routes are both accessible
4. Lint passes with no errors

### States
- Setup task (no loading/empty).
- Error: CI fails on lint/type errors, PR blocked from merge.
- Success: all checks pass, homepage renders, all dependencies installed.

### Edge cases
- Verify branch protection rules are active on testing and release.
- Confirm .env.example is committed but .env is gitignored.

### Gherkin
- Given the repo was created, when a member clones it and runs install + dev, then the Next.js 16 app starts with no errors, /en and /ar return 200, lint passes, and tsc --noEmit exits 0.
