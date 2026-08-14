# 59 — Delete a character (free a slot)

**What to build:** A member deletes one of their characters to free a slot; the character's inventory, currency, sheet, and public profile are removed; posts and threads the character authored remain visible with an unlinked display name; the username stays reserved.

**Blocked by:** 12 — Character creation, 19 — Threads & posts core

**Status:** ready-for-agent

- [ ] The character becomes a soft tombstone: `status = 'deleted'`, `deleted_at` set; created threads and posts unlink (`SET NULL`) but keep their display names (ADR-0001)
- [ ] Inventory, bag, currency balance, transactions, and sheet are removed; the public profile returns not-found; the character slot frees (max 2 counts active characters only)
- [ ] The reserved username cannot be reused after deletion (persistence model, decision D3)