# 25 — Mentions

**What to build:** Mentioning another character by `@username` in a post notifies them, with type-ahead suggestions from the character index.

**Blocked by:** 19 — WYSIWYG editor & rich content, 24 — Notifications infrastructure & events

**Status:** ready-for-agent

- [ ] `characters_search` FTS feeds `GET /api/characters/search` prefix suggestions `[{ username, name, avatar }]` (api.md §3.10, ticket 27 in the initial set)
- [ ] An `@username` in a post creates a mention notification to the mentioned character's member, respecting preferences (story 35, persistence-model §3.9)
- [ ] Seam tests: suggestion matching, mention → notification, unknown mention ignored