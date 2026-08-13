# Flow 03 — Character Creation

Status: proposed

## Entry

- Route: `/characters/new`
- Reachable from: post-login routing when the member has no characters, the character switcher, the "create your character" banner, and `/account`
- Actors: confirmed (and approved, when required) members; invariant: at most 2 characters per member

## Steps

1. Enter the **character name** (display name; spaces and special characters allowed; uniqueness not required).
2. Optionally set avatar and banner (flow 16); this can be skipped and done later from `/account`.
3. **Username step**: the system assigns a random username and immediately shows the one-time opportunity to replace it with a custom username. The replacement is validated for uniqueness (usernames are unique per forum; they back mentions, search, and URLs).
4. Optional next step: invite the member to create the **character sheet** (flow in `51-character-sheet-page`); a sheet is not required to create the character, but it is required to post in IC forums.
5. Confirm → the character is created, activated, and becomes the session character.

## States

- Character count per member: `0..2` (invariant)
- Character status: `active → deleted` (deleting a character frees a slot; a third character requires deleting an old one first)
- At the 2-character limit the create action offers "delete a character to free a slot" instead of failing silently.

## Errors

| Error | Surface |
| --- | --- |
| Character limit (2) reached | explained state with delete-to-free option |
| Custom username already taken | inline field error, uniqueness validated live |
| Empty or overlong character name | inline field error |

## Result

The character is active, the session enters as it, and the initial balance applies when the web master configured one. Threads, posts, currency, and inventory are now scoped to this character (ADR-0001).

## Navigation

`/login` → `/characters/new` → `/` (or straight to `/sheet/<characterId>` when the member chooses the sheet step).
