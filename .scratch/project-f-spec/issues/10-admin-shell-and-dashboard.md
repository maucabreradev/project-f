# 10 — Admin shell & dashboard

**What to build:** The admin dashboard shell with rank-filtered tabs (Overview, Members, Boards, Economy, Shop, Sheets, Bans & Appeals, Logs, Settings), a hard 403 for insufficient rank, and an Overview tab with placeholder stats; the shell that later admin features plug into.

**Blocked by:** 05 — Login, logout & sessions

**Status:** ready-for-agent

- [ ] `AdminShell` renders the tabs filtered by rank; the dashboard is absent for Moderator and gated for Administrator + Web master (flow 07)
- [ ] Access by a non-staff actor returns a hard 403 (never silently hidden on the admin routes; UX README, flow 17)
- [ ] The Overview tab renders stats placeholders (members, threads, posts, pending queues) from `GET /api/admin/stats`
- [ ] `/admin` is wired to the Admin template (AdminShell + AdminPanel + DataTable compositions); keyboard and dialog accessibility pass (accessibility.md §3)