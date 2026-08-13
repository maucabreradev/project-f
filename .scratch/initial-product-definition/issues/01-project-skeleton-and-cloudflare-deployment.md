# 01 — Project skeleton & Cloudflare deployment

**What to build:** The walking skeleton: a pnpm monorepo with the Astro SSR app (SolidJS islands), the Hono API, the shared Zod validation package, Drizzle connected to a local Turso database, and the Vitest harness at the HTTP seam — bootable locally and deployable with wrangler to the web master's own Cloudflare account (Workers, Turso secret, R2 bucket, Durable Objects placeholder), domain-agnostic per ADR-0003.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The monorepo boots locally and `wrangler deploy` pushes a live skeleton to a Cloudflare account; the app serves any configured host (ADR-0003)
- [ ] Drizzle schema and first migration applied to a local Turso database
- [ ] The single testing seam runs (Vitest + `app.request()` against local libSQL) and CI gates typecheck, lint, tests, and build (AGENTS.md rule 28)
