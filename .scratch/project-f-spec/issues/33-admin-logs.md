# 33 — Admin logs

**What to build:** The administrator Logs tab shows the staff action log, the general forum log, and the economy log, all sourced from `moderation_actions` and the economy ledger.

**Blocked by:** 18 — Thread moderation lifecycle, 21 — Economy ledger & earn rules

**Status:** ready-for-agent

- [ ] `GET /api/admin/logs` (`type=staff|general|economy`, paginated) returns entries from `moderation_actions`; `GET /api/admin/logs/economy` returns the cross-character economy ledger (story 58, api.md §3.4/§3.6)
- [ ] The admin Logs tab renders the three views with a DataTable (administrator+ only)
- [ ] Seam tests: log sources, type filtering, and the administrator+ permission gate