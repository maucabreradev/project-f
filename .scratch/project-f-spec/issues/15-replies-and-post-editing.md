# 15 — Replies & post editing

**What to build:** A character replies in a thread (with content limits enforced and the thread state respected) and edits their own post; the reply composer is embedded in the thread page.

**Blocked by:** 13 — Thread creation, 14 — Thread listing & viewing

**Status:** ready-for-agent

- [ ] `POST /api/threads/:id/posts` requires `canWrite` plus a confirmed, active member with an active character; a closed thread rejects replies → 422 `thread_closed` (invariant 7, story 64)
- [ ] Content limits are re-validated on reply → 422 `content_limits`; the reply stores `content` + sanitized `content_html` and a name snapshot
- [ ] `PATCH /api/posts/:id` lets the author edit their post; limits re-validated and `edited_at` set; non-author → 403 (api.md §3.4)
- [ ] The thread page embeds the PostComposer for replies (quote/multi-quote come later with the editor ticket)
- [ ] Seam tests: reply flow, closed-thread gate, content limits, edit permission + edited marker