# 14 — Thread listing & viewing

**What to build:** Visitors and members browse a board's thread list (pinned threads first, newest activity first, state-filtered) and open a thread to read it with its creator, tag, state, post count, and moderation-history placeholder.

**Blocked by:** 13 — Thread creation

**Status:** ready-for-agent

- [ ] `GET /api/boards/:id/threads` lists threads ordered by `last_post_at` descending with pinned threads first; archived/soft-deleted hidden unless viewing the archive board (api.md §3.4, persistence-model D12)
- [ ] `GET /api/threads/:id` returns the thread view (creator, IC/OOC tag, pinned, state, postCount, lastPostAt, moderation history) (api.md resource shapes)
- [ ] Board pages render the ThreadList with ThreadRow; the thread page renders the opening PostCard
- [ ] Offset pagination works (`page`/`pageSize`, default 20, max 100) (api.md §5.1)
- [ ] Seam tests: ordering, pinned-first, state filtering, pagination