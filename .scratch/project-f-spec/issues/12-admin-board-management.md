# 12 — Admin board management

**What to build:** An administrator creates, edits, reorders, and deletes boards; the web master sets per-rank permissions, visitor visibility, and content limits from the admin Boards tab; the changes take effect in browsing immediately.

**Blocked by:** 10 — Admin shell & dashboard, 11 — Forum structure & board browsing

**Status:** ready-for-agent

- [ ] Board CRUD: `POST /api/boards` respects depth ≤ 1 (422 `depth_exceeded`); a board with children or threads cannot be deleted → 422 `board_in_use` (decision D2, api.md §3.3)
- [ ] `PUT /api/boards/:id/permissions` (web master only; the web master rank stays read+write) and `PUT /api/boards/:id/visibility` (stories 59–61)
- [ ] `PUT /api/boards/:id/content-limits` (web master only): min/max characters, image policy and allowed ranks, validated `0 ≤ min ≤ max` (story 60, ticket 31 in the initial set)
- [ ] The admin Boards tab with the PermissionsMatrix and the visitor-visibility toggle (flow 07, component-architecture §5)
- [ ] Seam tests: CRUD, depth/RESTRICT errors, permission/visibility/limits updates, and their enforcement while browsing