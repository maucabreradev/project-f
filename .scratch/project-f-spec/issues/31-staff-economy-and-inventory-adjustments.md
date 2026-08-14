# 31 — Staff economy & inventory adjustments

**What to build:** Staff adjust a character's currency and inventory from the public profile with a mandatory reason — administrators always, moderators only when granted `canEditEconomy` and the character is in scope; adjustments hit the ledger and the moderation log.

**Blocked by:** 21 — Economy ledger & earn rules, 23 — Inventory, bag & sell-back/refund, 17 — Staff promotion & registration approval, 29 — Public character profile

**Status:** ready-for-agent

- [ ] `POST /api/characters/:id/economy` requires a mandatory reason → 422 otherwise; records a ledger `adjust` + a `moderation_actions` entry; returns balance + ledgerId (story 53, api.md §3.2)
- [ ] `POST /api/characters/:id/inventory` applies item deltas; a delta below the owned quantity → 422 `invalid_delta`
- [ ] Authorization per api.md §5.3: administrator, or moderator with `canEditEconomy` and the character in scope (global scope, or the character authored content in a scoped board)
- [ ] Staff controls are offered on the public profile; the profile page renders the adjust actions only for permitted staff
- [ ] Seam tests: the authorization matrix, mandatory reason, ledger + log entries