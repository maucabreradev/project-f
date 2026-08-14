# 30 — Character & account deletion

**What to build:** A member deletes a character to free a slot (soft tombstone, username stays reserved, economy and profile cascade away, posts stay visible with unlinked names) or deletes their account (characters, sessions, and rewards cascade; posts remain visible with unlinked names).

**Blocked by:** 09 — Account settings & inactive account, 13 — Thread creation, 15 — Replies & post editing

**Status:** ready-for-agent

- [ ] `DELETE /api/characters/:id` soft-tombstones the character (`status = deleted`, `deleted_at`, decision D3); inventory, bag, currency, transactions, sheet, and quick logins cascade away; the username stays reserved; the slot frees (active count) (story 20, ticket 59 in the initial set)
- [ ] Created threads and posts unlink (`SET NULL`) but keep their display-name snapshots (ADR-0001, decisions D3/D6); the public profile returns not-found
- [ ] `DELETE /api/account` cascades characters, sessions, email tokens, preferences, and rewards; posts remain visible with unlinked names (story 15)
- [ ] Seam tests: tombstone + slot freeing, unlink behavior with snapshots, reserved username, account cascade