# 27 — Bans & ban hook

**What to build:** Staff ban by registered email or IP with a mandatory reason, permanently or for a date range; the ban hook blocks banned emails and IPs on every request with the ban interstitial; banning a staff member enters arbitration-pending.

**Blocked by:** 05 — Login, logout & sessions, 17 — Staff promotion & registration approval, 10 — Admin shell & dashboard

**Status:** ready-for-agent

- [ ] The `bans` table exists; `POST /api/admin/bans` (moderator+) validates the mandatory reason (invariant 10); target is email or IP; duration permanent or dated (stories 69–70)
- [ ] Banning a staff member returns 202 with `arbitrationPending` — a third Administrator must decide (story 74, api.md §3.7)
- [ ] The `isBanned(email, ip)` hook runs on every request: an IP ban blocks the whole IP including visitors (invariant 11); a banned subject gets 403 `banned` with the ban payload
- [ ] `/banned` page and the full-page ban interstitial (with the mandatory reason and an appeal option) on every route; admin Bans tab lists bans (api.md §3.7, routes.md)
- [ ] Seam tests: email/IP enforcement, permanent/dated, mandatory reason, staff-target pending