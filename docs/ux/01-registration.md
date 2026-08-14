# Flow 01 — Registration

Status: accepted

## Entry

- Route: `/register`
- Reachable from: "Join" link in the navbar (visitor state), the home page, and the login page
- Actors: visitor only; a member with an active session is redirected to `/`

## Steps

1. Fill the registration form: email, password, password confirmation. Validated with Zod (format, strength policy configured by the web master).
2. Submit → the account is created server-side with `confirmation = unconfirmed`.
3. Registration-mode routing (web master choice, `ForumConfiguration`):
   - **Open mode**: a confirmation email is sent; the screen switches to "check your inbox" with a resend option.
   - **Approval mode**: the account additionally enters `approval = pending`; the screen shows "your account is pending approval".
4. **Bootstrap edge case**: if the forum has zero members, this first registration is the web master bootstrap — it is auto-approved, skips confirmation friction, and the member receives the unique **Web master** rank.
5. The member confirms through the emailed link (valid 15 min, max 2 resends/hour) → `confirmation = confirmed`.
6. After confirmation (and approval, when required), login redirects to character onboarding (flow 03) when the member has no characters.

## States

- `unconfirmed → confirmed` (confirmation link)
- `pending → approved | rejected` (approval mode; rejected members see the rejection on login)
- A persistent reminder banner offers resend while unconfirmed.

## Errors

| Error | Surface |
| --- | --- |
| Email already registered | inline field error |
| Invalid email | inline field error |
| Weak password | inline field error with policy hint |
| Confirmation link expired (15 min) | confirmation landing offers resend |
| Resend limit reached (2/hour) | disabled resend button with countdown |
| Registration rejected (approval mode) | rejection notice on login attempt |
| Banned email or IP | ban notice screen with reason and appeal option |

## Result

The member is confirmed (and approved), holds the User rank — or the unique Web master rank in the bootstrap case — and can create their first character.

## Navigation

`/` → `/register` → success screen → email link → `/register/confirm` → `/login` → `/characters/new` (when the member has no characters).
