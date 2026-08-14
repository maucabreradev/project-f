# AGENTS.md

## Permanent rules

### Global

1. All code, comments, files, commit messages, and text in every part of this project must always be written in English.

### Git

2. `main` is the stable branch.
3. Never work directly on `main`.
4. Every feature must use a `feature/<name>` branch.
5. Every bug must use a `fix/<name>` branch.
6. Every major refactor must use a `refactor/<name>` branch.
7. Commits must follow Conventional Commits.
8. Commits must be small and represent a single logical unit.
9. Do not mix unrelated features in the same commit.
10. Do not push without explicit authorization.
11. Do not merge without explicit authorization.

### Architecture

12. Do not change the approved stack without asking.
13. Do not introduce major dependencies without first explaining why they are needed.
14. Do not change approved architectural decisions without asking.
15. If an implementation requires changing an architectural decision, stop and explain the problem.

### Product

16. Do not invent features.
17. Do not implement features that are not in the current spec or ticket.
18. If information needed to implement a feature correctly is missing, ask.

### Frontend

19. Follow the approved Design System in `docs/design-system/` (canonical component catalog: `docs/design-system/component-architecture.md`).
20. Use Atomic Design as the component organization convention.
21. Do not artificially turn every HTML element into a component.
22. Components must have clear responsibilities.
23. Respect the approved routes.
24. Maintain responsive design and accessibility.

### Database

25. Do not modify the data model arbitrarily.
26. Every structural database change must go through a migration.
27. Do not drop columns or tables without explicit authorization.

### Quality

28. A feature is not finished until the corresponding tests, typecheck, lint, and build pass.
29. Do not hide test, lint, typecheck, or build errors.
30. Fixes must include tests when applicable.

### AI workflow

31. Before implementing a major feature, read AGENTS.md, the domain context, the spec, and the ticket.
32. Before making architectural changes, present the problem, alternatives, and consequences.
33. If there is a contradiction between the code and the approved documentation, stop and ask.

## Repository state

There is no application code, package manifest, build/test system, or CI yet — the tracked content is `LICENSE`, the documentation (`CONTEXT.md`, `docs/domain-model.md`, `docs/adr/0001-0006`, `docs/architecture.md`, the approved Design System `docs/design-system/`, the accepted UX flows `docs/ux/`, the accepted route map `docs/routes.md`), the product spec and implementation tickets (`.scratch/initial-product-definition/`), a proposed feature spec (`.scratch/member-directory/`), and the agent skills (`.agents/`, pinned by `skills-lock.json`). The domain documentation is complete and authoritative: read `CONTEXT.md` (glossary), `docs/domain-model.md` (entities, rules, invariants), and `docs/adr/` (decisions) before any design or implementation work; then follow the approved Design System (`docs/design-system/`), the approved UX flows (`docs/ux/`), and the route map (`docs/routes.md`). Don't hunt for entrypoints or conventions in code; there is none yet.

## Engineering skills (`.agents/skills/`)

- Two groups live in `.agents/skills/`:
  - **Managed** (pinned by `skills-lock.json`, installed from `mattpocock/skills` on GitHub): treat as managed installs — don't hand-edit them; updates flow through the skill installer.
  - **Manual/community** (not in `skills-lock.json`): `zod-validation-expert`, `hono`, `astro-developer`, `cloudflare`. User-added, safe to edit. Note `cloudflare` references sibling skills `workers`/`pages` that aren't installed.
- They are invoked by name (slash commands): `/ask-matt` is the router that picks a flow; the main ones are `/grill-with-docs`, `/to-spec`, `/to-tickets`, `/implement`, `/tdd`, `/code-review`, `/diagnosing-bugs`.
- `/setup-matt-pocock-skills` has been run: issue-tracker and domain-doc config live in `docs/agents/`.
- The skills assume a single-context domain layout: root `CONTEXT.md` + `docs/domain-model.md` + `docs/adr/`. `/grill-with-docs` leaves its paper trail there.

## Agent skills

### Issue tracker

Issues, specs, and tickets live as markdown files under `.scratch/<feature-slug>/` in this repo. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/domain-model.md` + `docs/adr/`. See `docs/agents/domain.md`.
