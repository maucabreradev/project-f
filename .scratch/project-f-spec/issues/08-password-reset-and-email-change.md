# 08 — Password reset & email change

**What to build:** A member resets a forgotten password through an emailed link and changes their account email through an emailed link; both changes are global to the whole account and effective on the next login, without revealing whether an account exists.

**Blocked by:** 05 — Login, logout & sessions

**Status:** ready-for-agent

- [ ] `POST /api/auth/forgot-password` always returns 204 (no account enumeration); `POST /api/auth/reset-password` applies the new Argon2id hash with a single-use, expiring token → 422 `token_expired`/`token_invalid` (api.md §3.1)
- [ ] `POST /api/auth/change-email` emits the email-change link; 409 `conflict` when the new email is taken; `POST /api/auth/confirm-email-change` makes the old email stop logging in (story 10)
- [ ] Email and password changes apply to the whole account and take effect on the next login (stories 11, glossary Account)
- [ ] The `/forgot-password` and `/reset-password` pages (ResetRequestForm / ResetPasswordForm)
- [ ] Seam tests: reset flow + expiry, email-change flow effective next login, and the always-204 no-enumeration behavior