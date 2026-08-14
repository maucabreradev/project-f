# Flow 15 — Staff Permissions

Status: accepted

## Entry

- Route: `/admin` → Members tab
- Reachable from: the admin dashboard; promotion and demotion are **Web master only** (Administrators cannot promote staff)
- Actors: Web master; Administrators see the outcome (ranks, scopes) but not the controls

## Steps

1. Search and select a member.
2. **Promote to Moderator**:
   - choose the **moderation scope**: a set of forums (or "all forums" = global moderator),
   - grant or deny the right to edit currency and inventory from public profiles (decided at promotion),
   - confirm → the rank and scope apply immediately and the promotion is logged.
3. **Promote to Administrator**: no scope choice — all moderator actions plus board creation, currency/inventory modification, logs, bans, and appeal resolution (never forum configuration, never staff promotion).
4. **Demote**: reverts to the previous rank; the Web master can never be demoted.
5. **Banning staff** (ticket `48-staff-ban-arbitration`): when the ban target is another staff member, a **third Administrator** must approve or reject the ban (arbitration) — the UI routes the ban into a pending state until decided.
6. Board-level permissions per rank are configured separately in the Boards tab (flow 07/17), not at promotion.

## States

- Member rank: `User → Moderator → Administrator → Web master` (Web master unique — exactly one holder)
- Moderation scope: forum set or global; currency/inventory edit right: granted or not
- Staff-ban arbitration: `pending → approved | rejected`

## Errors

| Error | Surface |
| --- | --- |
| Not the Web master | 403; controls absent |
| No third Administrator available for staff-ban arbitration | blocked with explanation |
| Demoting the Web master | blocked |
| Self-promotion attempts | blocked |

## Result

New ranks and scopes are effective immediately across boards, inline moderation tools, and profile economy edits; all changes are recorded in the forum log.

## Navigation

`/admin` → Members → promotion dialog → back to `/admin`; moderation scope is shown in the member's detail; per-board permission matrices live in the Boards tab.
