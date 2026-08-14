# 13 — Thread creation

**What to build:** A character creates a thread (with its opening post) inside a forum or subforum they can write to, choosing the IC/OOC tag; content is stored as editor source plus sanitized, server-rendered HTML with a name snapshot of the author.

**Blocked by:** 11 — Forum structure & board browsing, 05 — Login, logout & sessions

**Status:** ready-for-agent

- [ ] `threads` and `posts` tables exist: `content` (source) + `content_html` (sanitized server-side at write time, decision D6) and creator/author name snapshots (ADR-0001)
- [ ] `POST /api/boards/:id/threads` requires `canWrite` plus a confirmed, active member with an active character; validates content limits → 422 `content_limits`; IC/OOC tag required (story 32)
- [ ] Loose threads are impossible: a thread always belongs to a board or subforum (invariant 3); new threads default to `open`
- [ ] The `/new-thread/<boardId>` page with the NewThreadForm (title, tag, body); per-thread earn is out of scope here
- [ ] Seam tests: create thread with first post, permission denial, content-limit validation, no loose threads