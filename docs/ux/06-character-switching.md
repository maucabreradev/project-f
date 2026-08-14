# Flow 06 — Character Switching

Status: accepted

## Entry

- Element: character switcher island in the navbar
- Reachable from: every page, but only visible when the member owns two characters
- Actors: member with 2 active characters

## Steps

1. Open the switcher (avatar chip in the navbar).
2. See both characters: avatar, name, and current currency balance (economy is fully separate per character — ADR-0001).
3. Select the other character → the session character changes without logging out; no password is requested (session-level action).
4. The current page context reloads scoped to the new character (own content, economy, inventory, permissions).

## States

- Active character: the session persona; everything content- and economy-related reads it
- Characters not shown in the switcher: deleted characters (removed from pickers entirely)

## Errors

| Error | Surface |
| --- | --- |
| Character deleted between render and action | switcher refreshes; entry disappears |
| Inactive account | switch still works; the account-inactive banner persists and posting stays blocked |

## Result

The session continues as the other persona; navbar (balance, notifications, profile link) and all scoped views reflect the switch.

## Navigation

No route change — the switcher acts in place. Subsequent navigation (board, thread, shop, economy) already belongs to the new character.
