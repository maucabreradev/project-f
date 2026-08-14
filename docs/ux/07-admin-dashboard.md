# Flow 07 — Admin Dashboard

Status: accepted

## Entry

- Route: `/admin` (tabbed shell)
- Reachable from: the navbar for staff (Administrator and Web master; Moderators do not enter the dashboard — they use inline tools in the forum)
- Actors: Administrator and Web master; each tab is permission-filtered (Web master-only items are hidden or hard-403 for Administrators)

## Steps

The dashboard is a set of tabs; every action is confirmed where destructive and recorded in the forum log.

1. **Overview**: forum statistics and pending queues (registrations to approve, appeals to resolve). Quick links into the relevant tabs.
2. **Members**: search members; inspect status (confirmation, approval, inactive, banned); promote staff (Web master only — flow 15); ban (tickets `46-ban-by-email`, `47-ban-by-ip`); resolve registration approvals (Administrator).
3. **Boards**: create, edit, and reorder categories, forums, and subforums (depth ≤ 1 invariant); configure per-rank read/write permissions, visitor visibility, and per-forum content limits.
4. **Economy**: adjust a character's balance and inventory (with mandatory reason, recorded as `adjust` transactions); review earn rules; view the economy log.
5. **Shop**: manage the item catalog — price, stock model (infinite/limited/unique), remaining stock, per-character unique purchase, kind (inventory item or cosmetic).
6. **Sheets**: define the sheet data fields, enable sheet templates, toggle AI evaluation and manage the web master's own API key (ADR-0002).
7. **Bans & Appeals**: active bans with reasons, appeal queue; approve or reject appeals (Administrator).
8. **Logs**: staff action log, general forum log, economy log (Administrator+).
9. **Settings** (Web master only): full forum configuration — flow 17.

## States

- Per-tab loading and empty states; pending queues surface badges on the relevant tabs
- Every staff action is recorded with actor and timestamp (forum log) and shown on the affected thread where applicable

## Errors

| Error | Surface |
| --- | --- |
| Insufficient rank | 403 page (hard gate — this route is never silently hidden) |
| Invalid action (e.g., ban staff without arbitration, demote the Web master) | blocked with an explanatory message; arbitration required |
| Validation failure in forms (Zod) | inline field errors |

## Result

Administrative actions persist, are logged, and take effect immediately (ranks, boards, permissions, balances, bans, appeals).

## Navigation

`/admin` → tabs; deep actions (promote, ban, appeal resolution, item edit) open dialogs; links out to public profiles and threads keep context.
