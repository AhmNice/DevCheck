# DevCheck Workflow

## Purpose

This workflow defines how DevCheck moves work from idea to production while keeping quality high and delivery predictable. It combines engineering best practices with project management discipline for a small team.

## Roles and Ownership

- Product Manager: Owns priorities, scope, acceptance criteria, and release decisions.
- Senior Developer: Owns technical design, implementation quality, risk management, and mentoring.
- Reviewer: Owns independent validation of correctness, maintainability, and security.

In a 2-person team, one person can wear multiple hats, but each responsibility must still be explicitly covered.

## Delivery Lifecycle

### 1. Plan and Define

- Every feature, bug, or technical task starts as an issue.
- Each issue must include:
  - Problem statement
  - Scope boundaries (in scope and out of scope)
  - Acceptance criteria
  - Risk notes (data changes, auth impact, performance impact)
- Priority order is decided before coding begins.

### 2. Prepare Branch

- Update local main first:
  - git checkout main
  - git pull origin main
- Create one branch per issue using the approved naming style:
  - feature/short-description
  - bugfix/short-description
  - chore/short-description
- Never push directly to main.

### 3. Build in Small Increments

- Keep PR size focused and small.
- Commit in logical units with clear messages.
- Keep architecture boundaries clean:
  - Frontend: UI components in components, data access in services, state in store.
  - Backend: Routes thin, business logic in services/controllers, input validation in middleware/schema.
- For database-related changes, run and verify the initialization/table scripts in development before opening PR.

### 4. Local Quality Gate Before Push

Run relevant checks before pushing:

Root checks:

- npm run lint
- npm run format

Client checks:

- cd client
- npm run lint
- npm run build

Server checks:

- cd server
- npm run lint
- npm run build

For server schema setup and data structure validation in development:

- npm run db:init:dev
- npm run db:table:dev

### 5. Open Pull Request

PR must include:

- Clear summary of what changed and why
- Link to issue
- Scope statement (what is intentionally not included)
- Test evidence (manual steps and command outputs)
- Screenshots or short video for UI changes
- Migration/setup notes if backend or DB behavior changed

### 6. Review and Decision

Reviewer checks against docs/code-review-checklist.md:

- Correctness and edge cases
- Type safety and structure
- Security and sensitive data handling
- Performance risks
- API contract consistency with API_DOCUMENTATION.md

Review outcomes:

- Approve if criteria are met
- Request changes with explicit, actionable comments
- Re-review quickly after updates

### 7. Merge and Close

- Merge only after approval and passing checks.
- Prefer squash merge for clean history unless preserving commit sequence is valuable.
- Delete feature branch after merge.
- Close linked issue and summarize delivered behavior.

## Definition of Ready

Work is ready to start when:

- Acceptance criteria are clear and testable
- Dependencies are identified
- Scope is small enough for one focused PR
- Unknowns and risks are documented

## Definition of Done

Work is done when:

- Acceptance criteria are satisfied
- Lint/build checks pass for touched apps
- API documentation is updated when contracts change
- Reviewer approval is obtained
- Branch is merged and cleaned up
- Follow-up tasks are captured as new issues (not hidden in PR comments)

## Weekly Operating Rhythm

- Weekly planning (30-45 minutes): confirm priorities and assign ownership.
- Mid-week checkpoint (15 minutes): surface blockers and re-plan scope if needed.
- End-week review (30 minutes): demo completed work, review misses, and define improvements for next week.

## Incident and Hotfix Flow

- Create a bugfix issue immediately with impact and reproduction steps.
- Branch from latest main using bugfix naming.
- Implement minimal safe fix first.
- Run server/client quality gates relevant to impacted area.
- Fast-track review with at least one reviewer.
- Merge, deploy, and document root cause plus prevention action.

## Communication Standards

- Keep issue and PR descriptions factual and concise.
- Raise blockers early, never at merge time.
- For major architecture changes, align first before implementation.
- Keep code review tone objective and solution-focused.

## Success Metrics

Track these every sprint/week:

- PR cycle time (open to merge)
- Change failure rate (bugs from recent merges)
- Average PR size
- Rework rate (follow-up fixes for same issue)
- Predictability (planned vs completed)

Use metrics to improve process quality, not to blame individuals.

## Related Project Docs

- docs/branching-strategy.md
- docs/team-workflow.md
- docs/code-review-checklist.md
- docs/pr.template.md
- API_DOCUMENTATION.md
