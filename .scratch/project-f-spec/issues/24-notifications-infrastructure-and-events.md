# 24 — Notifications infrastructure & events

**What to build:** Real-time notifications in the navbar bell with per-member preferences; events fire for replies to your threads, replies in threads you participate in, and replies to your posts.

**Blocked by:** 05 — Login, logout & sessions, 15 — Replies & post editing

**Status:** ready-for-agent

- [ ] `notifications` and `notification_preferences` tables exist; preferences are per member and per type (persistence-model §3.9)
- [ ] The Durable Object hub delivers pushes over `WS /realtime`; the navbar bell island shows the unread count and a list (stories 76, 78)
- [ ] Reply events emit (reply-thread, reply-participation, reply-post) respecting preferences; mark-read and read-all work (api.md §3.8)
- [ ] `GET /api/notifications` (with unread count) and `GET / PUT /api/notifications/preferences` round-trip
- [ ] Seam tests: emission respects prefs, read state and unread counts, preferences round-trip