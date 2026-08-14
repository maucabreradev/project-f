# 07 — Quick login

**What to build:** A member adds up to two characters to quick login (one per character) and signs in directly as a character with the account password, with the ban check still applied on every quick login.

**Blocked by:** 06 — Character creation, switching & username

**Status:** ready-for-agent

- [ ] `POST` / `DELETE /api/characters/:id/quick-login` manage the stored shortcuts (max 2 total, one per character → 422 `quick_login_limit`) (persistence-model §3.3 quick_logins)
- [ ] `POST /api/auth/quick-login` signs in as the character with the account password; fails when no quick login exists for that character
- [ ] The ban check still applies on quick login: a banned email cannot bypass via quick login (story 27)
- [ ] Quick logins are listed on `/login` and managed in the `/account` page (flow 05)
- [ ] Seam tests: create/remove/limits, quick-login flow, and ban enforcement on quick login