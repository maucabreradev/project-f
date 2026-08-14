# 21 — Economy ledger & earn rules

**What to build:** Characters earn virtual currency per thread and per post according to the web master–configured, enabled earn rules; the balance and the transaction ledger are visible on the `/economy` page.

**Blocked by:** 13 — Thread creation, 15 — Replies & post editing, 10 — Admin shell & dashboard

**Status:** ready-for-agent

- [ ] `transactions` and `earn_rules` tables exist (per-thread, per-post types; one rule per type per deployment); `characters.currency_balance` is updated (persistence-model §3.6)
- [ ] `grantEarn` applies per-thread and per-post rewards on content creation; earned currency is never clawed back when the granting content is later deleted (domain-model §7)
- [ ] Admin earn-rules CRUD (web master only) enables/disables rules; disabled rules earn nothing (stories 41, 50)
- [ ] `GET /api/economy` returns balance + ledger + enabled rules; the `/economy` page renders the EconomyLedger with TransactionRow
- [ ] Seam tests: earn on create, disabled-rule behavior, no-clawback on delete