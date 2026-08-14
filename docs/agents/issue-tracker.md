# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` — never a single combined tickets file
- Triage state is recorded as a `Status:` line near the top of each issue file
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Statuses & completion

Ticket `Status:` values follow a small vocabulary:

- `ready-for-agent` — the ticket is grabbable (the default when published)
- `in-progress` — an agent is actively working it
- `done` — terminal; the ticket is complete
- `blocked` / `wontfix` — used when a ticket is held or intentionally not done

A ticket becomes `done` only when its acceptance criteria pass and the tests, typecheck, lint, and build pass (AGENTS.md rule 28), and the work has been committed. When it is finished, set its `Status:` line to `done` and append a `## Completion` note recording the commit and date.

An agent continues work by picking the **frontier** ticket: the earliest ticket whose `Status` is not `done` and whose `Blocked by` are all `done`.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.
