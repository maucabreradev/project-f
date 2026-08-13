# Flow 18 — Project Configuration (Deployment)

Status: proposed

Scope: the deployment lifecycle **outside the web UI** — how a web master turns a cloned repository into a running forum tenant (ADR-0003, ADR-0005).

## Entry

- A cloned repository, before the first deploy
- Actors: the web master (operator), using the CLI — no web UI exists yet at this stage

## Steps

1. `pnpm install` in the monorepo.
2. `wrangler login` to the web master's own Cloudflare account.
3. Create a Turso database and an API token (one external account per deployment, accepted in ADR-0005).
4. Configure secrets for the Worker: `TURSO_URL`, `TURSO_AUTH_TOKEN`, Resend API key (transactional email), AI evaluation API key when enabled (ADR-0002).
5. `wrangler.toml`: Worker name, bindings for R2 (avatars, banners, post images), the real-time Durable Object, and Cron Triggers (interest monthly, birthday daily, soft-delete window daily).
6. `wrangler deploy` → the forum is live on Cloudflare's default subdomain (launch before buying a domain, spec story 82).
7. First access: the **first registration is the web master bootstrap** — auto-approved and assigned the unique Web master rank, regardless of the configured registration mode.
8. Later: point a web master–owned domain via Cloudflare DNS/TLS and set it in the forum configuration (flow 17, Identity tab).

## States

- Not deployed → deployed → configured
- First member: holds the unique Web master rank (invariant 13)

## Errors

| Error | Surface |
| --- | --- |
| Missing secret or binding | deploy fails with the failing step named |
| Deploy failure | wrangler output; re-run after fixing |
| Domain not connected | forum keeps serving on the default subdomain |

## Result

The forum is online; the web master completes forum configuration through `/admin` (flows 07, 17) and the first members register through flow 01.

## Navigation

None inside the app (CLI-only); post-bootstrap navigation is `/login` → `/admin`.
