# Flow 04 — Profile Configuration

Status: accepted

Scope: one page with two tabs — **Account** (identity facet) and **Character** (persona facet).

## Entry

- Route: `/account`
- Reachable from: the avatar menu in the navbar
- Actors: member; also used to reactivate an inactive account from the login screen

## Steps

### Account tab

1. **Email change**: enter the new email → an emailed confirmation link (same rules as account confirmation) → applies on the next login.
2. **Password change**: current password + new password; applies globally to the account.
3. **Status**: set the account inactive (with a clear explanation that posting is blocked but data is kept); reactivate from here or from login.
4. **Notification preferences**: choose which notification types are received (replies, mentions, resolved appeals, birthday/interest currency).
5. **Quick logins**: add or remove quick logins, one per character, up to two (flow 05).
6. **Delete account**: destructive confirmation with consequences listed (profile, currency, inventory, and identity removed; posts remain visible with an unlinked display name).

### Character tab

1. **Character name**: editable (non-unique display name).
2. **Username**: one-time custom rename opportunity, shown only while the random username is still in place; validated for uniqueness.
3. **Character sheet**: link to create/edit the sheet (ticket `51-character-sheet-page`).
4. **Avatar and banner**: management UI (flow 16).

## States

- Account: `active ⇄ inactive` — inactive keeps all data, shows an "account inactive" notice on the public profile, blocks posting, and still allows browsing, settings, notifications, and quick login.
- Email/password changes are global and take effect on the next login.

## Errors

| Error | Surface |
| --- | --- |
| Email already in use | inline field error |
| Current password wrong | inline field error |
| Username rename already used or taken | inline field error, one-time opportunity stays until taken |
| Delete confirmation not completed | confirmation dialog blocks the action |

## Result

Credentials and preferences apply to the whole account; character identity changes apply to the persona. Public profile and navbar reflect the new state immediately.

## Navigation

`/` → `/account` → save → `/account` with inline feedback; reactivation is also reachable from `/login` and `/member/<username>`.
