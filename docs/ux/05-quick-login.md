# Flow 05 — Quick Login

Status: proposed

## Entry

- Route: `/login` — "Quick login" section listing the stored shortcuts
- Reachable from: the login page; empty state when no character has quick login configured
- Actors: visitor with up to 2 stored quick logins (one per character, configured in `/account`)

## Steps

1. Select a character from the quick login list (avatar + character name).
2. Enter the **account password** (the shortcut stores a character binding, never a password).
3. Server validates the session and runs the **ban check on the account email** (and IP) — a ban cannot be bypassed through quick login.
4. Session starts directly as that character → redirect to `/`.

## States

- Quick login entries: valid or orphaned (character deleted → the entry is removed from the list on next load)
- Account statuses still gate the flow: banned blocks entirely; inactive allows entry without posting rights

## Errors

| Error | Surface |
| --- | --- |
| Wrong password | inline error, retry |
| Banned email | ban notice screen with reason and appeal option |
| Character deleted | entry removed; the list updates |
| Inactive account | entry allowed with the reactivation banner |

## Result

Session started directly as the chosen character — one selection and the account password instead of the full login form.

## Navigation

`/login` → quick login → `/`.
