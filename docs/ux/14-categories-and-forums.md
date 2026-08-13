# Flow 14 — Categories and Forums

Status: proposed

## Entry

- Routes: `/boards/<catId>`, `/boards/<catId>/<forumId>`, `/boards/<catId>/<forumId>/<subId>` (mirroring the forum structure; depth ≤ 1)
- Reachable from: the home page structure and breadcrumbs
- Actors: visitors (per visibility flags) and members (per per-rank read permissions)

## Steps

1. **Category level**: list the forums inside the category — name, description, thread/post counts, last post.
2. **Forum level**: list subforums (when present) and the threads of the forum — title, IC/OOC tag, pin, author, reply count, last reply, state badges (`closed`, `archived`).
3. **Subforum level**: threads only; nesting stops here (a subforum cannot contain further subforums).
4. **Breadcrumb**: home → category → forum → subforum; every level links back up.
5. **Actions**: "New thread" on the forum/subforum level (write permission and flow 08 gates); moderation tools inline for staff within their moderation scope.
6. Visibility and permissions are applied server-side: a section a rank cannot read is not rendered, and direct access to a hidden section returns 404.

## States

| State | Behavior |
| --- | --- |
| Section hidden from visitors | not rendered for visitors; 404 on direct access |
| Board read/write permissions | per rank, per board (web master configuration) |
| Thread badges | closed, archived, pinned, soft-deleted (invisible in regular listings) |
| Archive forum | receives archived and soft-deleted threads; read-only |

## Errors

| Error | Surface |
| --- | --- |
| No read permission | section invisible (no 403) |
| Hidden section, direct URL | 404 |
| Empty board | empty state with a create call when permitted |

## Result

Navigation into threads and thread creation; staff can act on threads in scope directly from the listing.

## Navigation

`/` → categories → forums → subforums → `/thread/<id>`; "New thread" → `/new-thread/<boardId>`; breadcrumbs back up the tree.
