# Flow 02 — Login

Status: accepted

## Entry

- Route: `/login`
- Reachable from: navbar (visitor state), the registration success screen, the home page, or a post-action redirect ("login required", carrying the original URL)
- Actors: visitor (including unconfirmed, pending, inactive, and banned members)

## Steps

1. Enter email and password.
2. Submit → server validates credentials, creates the session, and runs the **ban check on email and IP** (a banned email or IP blocks login entirely; quick login is validated the same way).
3. Character routing:
   - 0 characters → forced creation flow (flow 03).
   - 1 character → session starts as that character (with a "always enter as this character" option).
   - 2 characters → character picker (flow 03/06 semantics).
4. Redirect to `/` or to the original destination URL.
5. Account status routing:
   - Unconfirmed → login allowed to view the reminder banner, or blocked by policy and routed to resend (web master configuration).
   - Pending/rejected (approval mode) → shown their status screen.
   - Inactive → login allowed; a reactivation banner is shown; posting remains blocked until reactivation.

## States

- Session active (cookie-based, HttpOnly/Secure/SameSite, DB-backed)
- Session character: selected or none
- Account statuses that gate interaction: `unconfirmed`, `pending`, `rejected`, `inactive`, `banned`, `deleted`

## Errors

| Error | Surface |
| --- | --- |
| Wrong email or password | generic "invalid credentials" inline error |
| Account unconfirmed | reminder banner with resend (flow 01 rules) |
| Registration rejected | rejection notice |
| Email or IP banned | ban notice screen with the mandatory reason and an appeal option |
| Account deleted | "no account found" on login (identity removed) |

## Result

Session started as the chosen character; the navbar shows the character, balance, and real-time notifications.

## Navigation

`/` → `/login` → `/` (or the original destination, or `/characters/new` when the member has no characters).
