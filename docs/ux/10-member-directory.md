# Flow 10 — Public Character Directory

Status: proposed — **new feature, not in the accepted spec**

> This flow describes a feature the current spec does not contain. It is designed here for review, with a spec and ticket update proposal in `.scratch/member-directory/`. Do not implement it until the proposal is accepted (AGENTS.md rules 16–17).

## Entry

- Route: `/members`
- Reachable from: the navbar; the web master can hide it from visitors (`hiddenFromVisitors` on the section)
- Actors: all visitors and members; direct access to a hidden section returns 404

## Steps

1. The page lists characters: avatar, character name, username, and last connection, paginated.
2. Filter and sort: by character name, username, or activity (registration date, last connection).
3. Search by character name or username (FTS-backed, consistent with global search).
4. Select a character → public character profile (flow `41-public-character-profile`).
5. The list reflects live data: characters whose account is inactive show a badge; deleted characters never appear.

## States

| State | Behavior |
| --- | --- |
| Character `active` | listed |
| Character `deleted` | not listed (posts remain, persona is gone) |
| Account inactive | listed with an "inactive" badge |
| Section hidden from visitors | 404 on direct access for visitors; hidden from navbar |

## Errors

| Error | Surface |
| --- | --- |
| Hidden section, direct URL | 404 |
| Empty forum | empty state with a call to join the forum |

## Result

Discovery of characters and navigation into their public profiles — the entry point for reading character stories and sheets.

## Navigation

`/` → `/members` → `/member/<username>` (public profile, which links to the sheet, economy, and inventory).
