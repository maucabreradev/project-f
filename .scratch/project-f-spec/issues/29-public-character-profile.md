# 29 — Public character profile

**What to build:** The public character profile at `/member/<username>` shows name, avatar, banner, balance, inventory, bag, recent threads and replies, registration date, last connection, and account status; the web master can hide profiles from visitors; the owner edits avatar and banner.

**Blocked by:** 06 — Character creation, switching & username, 16 — Character sheet & IC gating, 20 — Image upload & post image policy, 23 — Inventory, bag & sell-back/refund, 15 — Replies & post editing

**Status:** ready-for-agent

- [ ] `GET /api/characters/:username` returns the full public profile: character view + owner account-status badge + sheet summary + inventory + bag + recent threads/posts + registeredAt + lastSeen; 404 when deleted or hidden (stories 26, 41 in the initial set)
- [ ] Profile hiding: the `forum_configuration.hidden_profiles_from_visitors` boolean (a documented structural change via migration, api.md §5.2) hides public profiles from visitors → 404 (story 61)
- [ ] The ProfilePage renders ProfileHeader + tabs (overview / sheet / inventory / recent threads); the owner edits avatar/banner; inactive accounts show the notice
- [ ] Seam tests: profile shape, deleted → 404, visitor-hiding → 404, owner edit