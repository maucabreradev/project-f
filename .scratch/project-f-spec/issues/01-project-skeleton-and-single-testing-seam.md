# 01 — Project skeleton & single testing seam

**What to build:** The walking skeleton: a pnpm monorepo (Astro SSR + SolidJS islands, Hono API, shared Zod validation package) running as one Cloudflare Worker per deployment where Hono owns `/api/*` and `/realtime` and wraps the Astro SSR handler for everything else; Drizzle + migration tooling over a local Turso (libSQL) database; the type-safe `hc` client; the single Vitest seam (`app.request()` against local libSQL); and the economy-atomicity spike (debit + stock + ledger over the libSQL HTTP protocol, with the single-writer Durable Object as the fallback).

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The monorepo boots locally and `wrangler deploy` pushes a live skeleton to a Cloudflare account; the app serves any configured host (ADR-0003)
- [ ] Hono owns `/api/*` and `/realtime`; everything else is served by the wrapped Astro SSR handler (ADR-0006)
- [ ] Drizzle and migrations are wired; a first migration applies to a local Turso database; the schema targets `docs/persistence-model.md`
- [ ] The single testing seam runs (Vitest + `app.request()` against local libSQL) and CI gates typecheck, lint, tests, and build (AGENTS.md rule 28)
- [ ] The economy-atomicity spike is validated (multi-statement transactions over libSQL HTTP) or the single-writer Durable Object fallback is adopted (ADR-0006)