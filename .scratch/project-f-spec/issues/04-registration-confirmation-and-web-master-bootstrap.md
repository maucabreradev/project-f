# 04 — Registration, confirmation & web master bootstrap

**What to build:** A visitor registers with email + password, confirms through an emailed link (valid 15 minutes, up to 2 resends per hour), and sees the unconfirmed reminder banner; the first registration in an empty forum bootstraps the unique Web master rank (auto-approved); approval-mode registration shows the pending screen until an administrator decides.

**Blocked by:** 03 — Forum configuration singleton & public identity

**Status:** ready-for-agent

- [ ] `POST /api/auth/register` creates the member (`confirmation_state = unconfirmed`, rank user); duplicate email → 409 `conflict` (identity module, members + email_tokens tables)
- [ ] The confirmation link is valid 15 minutes, single-use, and expires → 422 `token_expired`; resend is limited to ≤ 2 per hour → 429 `already_resent` (flows 01/02, stories 2–4)
- [ ] In approval mode the account is created `pending` and cannot interact; `/register` shows the pending screen (story 5)
- [ ] Bootstrap: the first registration in an empty forum is auto-approved, skips confirmation friction, and receives the unique Web master rank (invariant 13 partial unique index) (flow 01 step 4, flow 18)
- [ ] `/register` and `/register/confirm` pages; the home page shows an unconfirmed reminder banner with a resend action; resend/forgot never reveal whether the account exists (204 always)
- [ ] Seam tests: full registration flow, confirmation expiry, resend limit, duplicate email, bootstrap rank, approval-mode pending state