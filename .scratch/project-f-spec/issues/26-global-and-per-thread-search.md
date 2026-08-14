# 26 — Global & per-thread search

**What to build:** Global search over threads, posts, and characters via FTS5, plus search within a thread; results respect read permissions and visitor visibility.

**Blocked by:** 13 — Thread creation, 15 — Replies & post editing, 06 — Character creation, switching & username

**Status:** ready-for-agent

- [ ] `threads_search`, `posts_search`, and `characters_search` standalone FTS5 tables exist with triggers kept in sync by the owning modules (decision D11, persistence-model §3.10)
- [ ] `GET /api/search` (`type=threads|posts|characters`, `boardId?`, pagination) returns results filtered by `canRead` and visitor visibility (stories 79)
- [ ] `GET /api/threads/:id/posts?q=` searches within a thread (story 80, ticket 57 in the initial set)
- [ ] The GlobalSearch organism and SearchField surface global and per-thread search in the UI
- [ ] Seam tests: matching, trigger sync on create/delete, permission filtering