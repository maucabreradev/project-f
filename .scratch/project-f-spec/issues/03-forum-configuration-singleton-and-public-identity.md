# 03 — Forum configuration singleton & public identity

**What to build:** The single `ForumConfiguration` per deployment: the `forum_configuration` table seeded with defaults, the configuration module's `get` (public, no secrets), the public `GET /api/config` endpoint, and the home page rendering the forum's identity (name, cover, colors) from it over the seam.

**Blocked by:** 02 — Design System foundation

**Status:** ready-for-agent

- [ ] `forum_configuration` singleton exists (`id = 1` with CHECK) and is seeded by a migration with defaults: registration mode open, require email confirmation on, 24 h refund window, sell fraction, soft-delete window, default per-rank permission matrix (persistence-model §3.1)
- [ ] `GET /api/config` returns the public config (identity, registration mode, guest visibility, economy/shop settings, sheet fields, enabled templates) and never exposes the AI key or secrets (api.md §3.9)
- [ ] The home hero and navbar render the forum name, cover, and accent color from `/api/config` via `hc` over the HTTP seam
- [ ] Seam tests cover the public config shape, the default values, and the absence of secrets