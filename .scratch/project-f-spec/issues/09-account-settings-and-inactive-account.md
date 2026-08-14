# 09 — Account settings & inactive account

**What to build:** A member manages their account — sees email, status, characters, and quick logins — and can set the account inactive (all data kept, browsing/settings/notifications/quick login still work, posting blocked) and reactivate it.

**Blocked by:** 07 — Quick login, 08 — Password reset & email change

**Status:** ready-for-agent

- [ ] `GET /api/account` returns the account view: email, status, quick logins, characters (api.md §3.1)
- [ ] `PATCH /api/account/status` toggles `active ⇄ inactive`; while inactive the account cannot interact with threads or posts (403 `inactive`) but may browse, use settings, receive notifications, and use quick login (stories 12–14, domain-model §7)
- [ ] The `/account` page (Account template, AccountTabs) shows the account overview and the status toggle
- [ ] An inactive notice is surfaced where the account is shown (banner on the public profile)
- [ ] Seam tests: status toggle, inactive write-gating, partial accessibility while inactive, reactivation