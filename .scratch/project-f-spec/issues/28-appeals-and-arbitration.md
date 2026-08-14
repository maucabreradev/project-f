# 28 — Appeals & arbitration

**What to build:** Banned members appeal (one open appeal per ban) and track it; administrators resolve appeals from the dashboard (approval lifts the ban) and arbitrate staff-target bans; resolution notifies the member.

**Blocked by:** 27 — Bans & ban hook, 24 — Notifications infrastructure & events

**Status:** ready-for-agent

- [ ] The `appeals` table exists with a partial unique index on an open appeal per ban; `POST /api/bans/me/appeal` rejects a second open appeal → 422 `appeal_open` (story 72)
- [ ] `GET /api/bans/me` returns the ban + appeal status; `POST /api/admin/bans/:id/appeals/:appealId/decision` (administrator+) approves/rejects; approval lifts the ban (stories 71, 73)
- [ ] Arbitration: `POST /api/admin/bans/:id/arbitration` requires an administrator who is not the creator → 422 `self_arbitration`/`not_pending` (story 74)
- [ ] Appeal and arbitration resolutions emit the appropriate notification to the member (story 78)
- [ ] Seam tests: appeal lifecycle, one-open-appeal, arbitration rules, notification on resolution