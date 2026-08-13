# 03 — Registration & account creation

**What to build:** A visitor registers with email and password; the account is created unconfirmed; duplicate emails are rejected; validation runs through the shared Zod schemas on both sides.

**Blocked by:** 01 — Project skeleton & Cloudflare deployment

**Status:** ready-for-agent

- [ ] Registration validates on frontend and API via the shared validation package
- [ ] Duplicate email rejected with a user-facing message
- [ ] Account persisted with confirmation state `unconfirmed`
