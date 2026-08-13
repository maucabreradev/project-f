# Project F — Architecture

Living document for the approved architecture. Hard-to-reverse decisions live in `docs/adr/` (ADR-0005 stack, ADR-0006 application architecture). This document records the current shape: structure, module interfaces, and communication rules. If code and this document disagree, stop and ask (AGENTS.md rule 33).

## Repository structure

pnpm workspaces monorepo:

```
project-f/
├── apps/
│   ├── web/                    # Astro SSR + SolidJS islands — the deployment unit
│   │   ├── src/pages/          # file routes mirroring the forum structure
│   │   ├── src/islands/        # SolidJS islands: editor, navbar, character switcher, shop
│   │   ├── src/components/     # Atomic Design: atoms / molecules / organisms / templates
│   │   ├── src/layouts/
│   │   ├── src/styles/         # design tokens (ticket 02)
│   │   ├── src/entrypoint.ts   # the single Worker entry
│   │   ├── astro.config.mjs
│   │   └── wrangler.toml
│   └── api/                    # Hono backend — consumed by web as a library
│       ├── src/app.ts          # composition root: routes + middleware
│       ├── src/http/           # session middleware, ban check, CSRF, error mapping
│       ├── src/modules/        # one deep module per domain aggregate
│       ├── src/db/             # Drizzle schema, migrations, libSQL client
│       ├── src/mail/           # Resend adapter
│       ├── src/realtime/       # Durable Object notification hub
│       └── test/               # the single testing seam
└── packages/
    └── validation/             # Zod schemas shared FE/BE
```

No `packages/ui`, no `packages/contracts`: the Hono RPC client infers the contract types from the API, and components live inside the web app (one caller — a separate package would be a shallow module).

## Deployment unit

One Worker per deployment (ADR-0003, ADR-0006). The entrypoint wraps the Astro SSR handler with Hono: `/api/*` and `/realtime` → API; everything else → Astro. The web master deploys once via `wrangler deploy`; the forum serves any configured host.

## Frontend

- **Pages** render server-side (Astro SSR) so visitors read without JavaScript; routes are Astro file routes (AGENTS.md rule 23).
- **Islands** (SolidJS) only where interactivity earns its cost: WYSIWYG editor, real-time navbar, character switcher, shop interactions, complex forms.
- **Server state**: `@tanstack/solid-query` in islands for caching and mutations.
- **Styling**: Tailwind CSS v4 tokens (ticket 02) with Kobalte primitives and shadcn-solid components; Atomic Design organization (AGENTS.md rule 20).
- **Forms**: SolidJS-native forms validated with Zod from `packages/validation`; complex forms live in islands.
- **Data access**: pages and islands call the API through the `hc` client over the HTTP seam.

## Backend modules

One deep module per domain aggregate. Routes are thin adapters; all invariants and rules live inside the modules.

| Module | Aggregate | Interface (function names) |
| --- | --- | --- |
| `configuration` | ForumConfiguration | `get`, `update` |
| `identity` | Member (account facet) | `register`, `confirm`, `login`, `logout`, `getSession`, `resetPassword`, `changeEmail`, `setInactive`, `deleteAccount`, `approveRegistration` |
| `characters` | Member (persona facet) | `create`, `switch`, `renameUsername`, `addQuickLogin`, `removeQuickLogin`, `setAvatar`, `setBanner` |
| `boards` | Board | `list`, `create`, `update`, `setPermissions`, `setVisibility`, `setContentLimits` |
| `content` | Thread | `listThreads`, `getThread`, `createThread`, `createPost`, `editPost`, `setState`, `pin`, `move` |
| `economy` | Shop | `getBalance`, `getEconomy`, `buy`, `sell`, `refund`, `adjust`, `grantEarn`, `applyLoginStreak`, `runInterest`, `runBirthday` |
| `moderation` | Ban | `ban`, `isBanned`, `appeal`, `decideAppeal`, `arbitrate`, `log` |
| `sheets` | CharacterSheet | `defineFields`, `create`, `update`, `get`, `evaluate` |
| `notifications` | Notification | `emit`, `getPrefs`, `setPrefs`, `list`, `markRead` |

Ownership rules: each table belongs to exactly one module; other modules reach its data only through its interface. The max-2-characters invariant lives in `characters`; the thread state machine in `content`; refund window and stock restore in `economy`; mandatory reason and arbitration in `moderation`.

## Module communication

Direct typed calls, wired in the composition root (`app.ts`). Acyclic dependencies:

```
http ─▶ identity ─▶ moderation.isBanned
     ─▶ content  ─▶ boards | economy.grantEarn | notifications.emit | moderation.log
     ─▶ economy  ─▶ notifications.emit
     ─▶ moderation ─▶ notifications.emit
     ─▶ sheets   ─▶ configuration | evaluation adapter (BYO key, ADR-0002)
     ─▶ notifications ─▶ realtime hub
```

No event bus (ADR-0006): one process, one subscriber per event — a bus would be a shallow pass-through.

## Frontend/backend communication

- Reads and writes via `hc()` over the HTTP seam; same origin, cookies flow naturally, CSRF token on state-changing requests.
- Astro SSR pages fetch through the same seam in-process — the HTTP interface is never bypassed, so tests at the seam see everything the browser sees.
- Real-time: WebSocket to the DO hub at `/realtime`; the navbar island subscribes.
- Files (avatars, banners, post images): uploaded through the API into R2.

## Persistence

- Turso (libSQL) over HTTP via Drizzle; schema and migrations owned by `apps/api/src/db` (AGENTS.md rule 26: every structural change is a migration).
- FTS5 virtual tables for global and per-thread search.
- Economy atomicity over the HTTP protocol is validated in ticket 01 (spike); fallback is single-writer serialization through a Durable Object.
- R2 for user images; Durable Object for the real-time hub.

## Authentication & authorization

- Custom sessions (Argon2id hashes, DB-backed sessions, HttpOnly/Secure/SameSite cookies, CSRF); the ban hook (`isBanned(email, ip)`) runs on every authenticated request.
- Authorization is policy-as-data evaluated by a small permission module: `canRead(board, actor)`, `canWrite(board, actor)`, `canModerate(scope, target, actor)`. Ranks on the member, read/write per rank on boards, moderation scope at promotion, visitor visibility flags; configuration routes additionally require the unique Web master rank.

## Real-time, scheduled jobs, email

- Durable Object hub: connection registry + push; notification records and preferences stay in the database via `notifications`.
- Cron triggers (interest monthly, birthday daily, soft-delete window expiry daily) call the same module functions as the HTTP routes.
- Transactional email (confirmation, reset, email change) goes through the Resend adapter in `apps/api/src/mail`.

## Testing

The HTTP seam is the single testing seam (spec lines 137–139, ADR-0005): Vitest + `app.request()` against a local libSQL database covering registration flows, economy transactions, thread state transitions, moderation permissions, and the ban/appeal lifecycle. Island unit tests and a minimal Playwright suite cover UI flows. A feature is not finished until tests, typecheck, lint, and build pass (AGENTS.md rule 28).
