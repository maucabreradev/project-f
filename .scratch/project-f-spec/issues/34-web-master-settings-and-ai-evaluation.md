# 34 — Web master settings & AI evaluation

**What to build:** The web master configures the whole forum from `/admin/settings` (identity, registration, economy, shop, sheets + AI, archive, default permissions), toggles AI sheet evaluation with their own encrypted API key, and the evaluation reviews sheets against the configured criteria.

**Blocked by:** 03 — Forum configuration singleton & public identity, 16 — Character sheet & IC gating, 21 — Economy ledger & earn rules, 22 — Shop catalog & purchasing, 12 — Admin board management, 18 — Thread moderation lifecycle

**Status:** ready-for-agent

- [ ] `GET /api/admin/config` returns the full configuration with the AI key masked; `PATCH /api/admin/config` applies partial bodies per group (api.md §3.9)
- [ ] The Identity tab re-skins accent and cover with contrast-constrained picks (flow 17, tokens.md §1); the Registration tab sets mode and confirmation policy; Economy/Shop tabs set currency name, earn rules, refund window, sell fraction; the Archive tab sets the soft-delete window (0–30); the Permissions tab sets the default matrix for new boards
- [ ] AI evaluation: `aiEvaluationEnabled`, `aiCriteria`, and a write-only, encrypted API key (ADR-0002, persistence-model §3.1); `POST /api/sheet/evaluation` runs only when enabled and a key is present → 422 `evaluation_disabled`; the result is polled via `GET /api/sheet` (story 38)
- [ ] When the feature is off, no member content leaves the forum (ADR-0002)
- [ ] Seam tests: config round-trip + key masking, evaluation enable/disable, encrypted key storage, contrast-constrained identity values