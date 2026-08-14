# 05 — Login, logout & sessions

**What to build:** A member logs in with email + password (Argon2id), receives a DB-backed session (`pf_session` cookie with CSRF protection), restores the session on later requests, and logs out; login routes by character count (0 → create, 1 → direct, 2 → picker) and gates unconfirmed, pending, rejected, inactive, and banned accounts.

**Blocked by:** 04 — Registration, confirmation & web master bootstrap

**Status:** ready-for-agent

- [ ] `POST /api/auth/login` verifies the Argon2id hash, sets the `pf_session` cookie (HttpOnly, Secure, SameSite=Lax), and returns `{ member, characters }`; wrong credentials → 401 `invalid_credentials` (api.md §1)
- [ ] Account gates return distinct 403 codes: `unconfirmed`, `pending_approval`, `rejected`, `inactive` (api.md §1)
- [ ] `GET /api/session` restores the session (member, characters, activeCharacterId, rank, moderatorScope); `POST /api/auth/logout` destroys it
- [ ] Unsafe methods require the `X-CSRF-Token` header matching `sessions.csrf_token`; no session → 401
- [ ] The `/login` page signs in with the post-login character routing (0 → force creation, 1 → direct, 2 → picker) per flow 02
- [ ] Seam tests: login/logout, session restore, wrong password, CSRF enforcement, and the account gates