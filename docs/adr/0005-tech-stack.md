# Tech stack

Project F is a single-tenant, deployable web application: each web master clones the repo and deploys to their own Cloudflare account (ADR-0003). The spec records product requirements only, so the stack was chosen and approved as a separate decision (spec line 134, AGENTS.md rules 12–15).

**Frontend** — Astro SSR with SolidJS islands; TypeScript strict across the repo; Astro file-based routes; `@tanstack/solid-query` inside interactive islands (WYSIWYG editor, real-time navbar, character switcher); Tailwind CSS v4 with Kobalte primitives and shadcn-solid tokens for the Design System; SolidJS-native forms validated with Zod for complex forms (registration, character sheet, forum configuration); Zod shared between frontend and backend in a `packages/validation` module.

**Backend** — Hono on Cloudflare Workers; REST API consumed type-safely via the Hono RPC client (`hc`); custom authentication on Hono (HttpOnly/Secure/SameSite cookies, Argon2id password hashing, sessions stored in the database, ban checks by email and IP on every request); authorization as Hono middleware enforcing the domain's rank and forum-permission model with per-moderator moderation scope; real-time notifications via Durable Objects WebSockets.

**Database** — Turso (libSQL) accessed over HTTP; Drizzle ORM with the `@libsql/client` driver; Drizzle Kit for migrations (every structural change goes through a migration, AGENTS.md rule 26); libSQL FTS5 for global and per-thread search.

**Infrastructure** — pnpm monorepo (`apps/web`, `apps/api`, `packages/validation`); local development with Wrangler and a local Turso database; no Docker (the deployment target is the Workers edge runtime, so containers add nothing in production; local parity comes from Miniflare and Turso local); production deployment via `wrangler deploy`: Workers (Astro SSR + Hono API), Durable Objects, R2 for avatars, banners, and post images, Cron Triggers for interest, birthday, and login-streak economy rules; Resend for transactional email (confirmation links, password reset); the forum's own domain via Cloudflare DNS/TLS per ADR-0003.

**Testing** — one seam for the whole application (spec lines 137–139): the Hono HTTP boundary, exercised with Vitest and `app.request()` against an embedded/local libSQL database, covering economy transactions, thread state transitions, moderation permissions, and the ban/appeal lifecycle; a minimal Playwright suite covers UI flows only.

## Considered options

- **React SPA + TanStack Router** — rejected: weaker SSR/SEO story for the visitor-readable forum.
- **Better Auth** — rejected: the domain rules (ban-by-email/IP on every request, approval-mode registration, quick login, inactive accounts, per-rank forum permissions) are unusual enough that a framework would fight them.
- **D1 (SQLite)** — considered: zero external infrastructure, but binds the data plane to Cloudflare and weakens local ergonomics.
- **Neon Postgres via Hyperdrive** — considered: full managed Postgres, but adds an external account and operational surface for every web master.
- **Chosen: Turso (libSQL) over HTTP** — edge-distributed SQLite with ACID transactions, FTS5, and familiar SQL, independent of the Cloudflare data plane.

## Consequences

- Every deployment needs its own Turso database and API token, stored as a secret in the Cloudflare deployment — one external account per web master, accepted as part of the decision.
- The single testing seam is fixed: HTTP-boundary integration tests; UI flows covered by a minimal Playwright suite.
- The Design System is documented at `docs/design-system/` (tokens, components, layout, accessibility) — the approved styling tokens for frontend implementation (AGENTS.md rules 19, 23, 24).
