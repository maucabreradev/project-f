# 11 — Forum structure & board browsing

**What to build:** Visitors and members browse the forum tree (categories → forums → subforums, nesting depth ≤ 1) with per-rank read permissions, visitor-visibility hiding, and last-activity stats; sections hidden from visitors are invisible or 404.

**Blocked by:** 03 — Forum configuration singleton & public identity

**Status:** ready-for-agent

- [ ] `boards` and `board_permissions` tables exist; new boards inherit the default permission matrix from the forum configuration (persistence-model §3.4)
- [ ] `GET /api/boards` returns the tree (categories → forums → subforums) respecting `canRead` and `hidden_from_visitors`; hidden boards are 404/absent (api.md §3.3, ticket 10 in the initial set)
- [ ] The home BoardStructure and the category/forum pages render with the hierarchy breadcrumb and BoardRow metadata (threads/posts, last post)
- [ ] Depth invariant enforced: a subforum cannot contain further subforums (invariant 4)
- [ ] Seam tests: tree shape, depth invariant, read-permission filtering, visitor visibility