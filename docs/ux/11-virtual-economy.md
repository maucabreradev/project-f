# Flow 11 — Virtual Economy

Status: accepted

## Entry

- Route: `/economy`
- Reachable from: navbar (always shows the active character's balance); the public character profile also shows the balance and inventory
- Actors: member, per active character (balances are never shared between characters — ADR-0001)

## Steps

1. **Balance view**: current balance of the active character.
2. **Ledger view**: the transaction history — types `earn`, `purchase`, `sale`, `refund`, `adjust` — each with amount, reason, and actor (system, staff, member). The ledger is immutable.
3. **Rules view**: the earn rules the web master enabled, so the character knows how to earn:
   - per thread created and per post sent (amounts from configuration),
   - login streak (measured per individual character),
   - monthly interest (day and percentage configured),
   - birthday reward (the birth-date field exists only when this rule is enabled).
4. **Earning in flow**: login applies the streak; interest and birthday rewards are granted by scheduled jobs and arrive as notifications.
5. Spend: purchases, sales, and refunds happen in the shop (flow 12); staff adjustments (with reason) appear as `adjust` transactions.
6. Currency already granted is never clawed back when the granting thread or post is later deleted.

## States

- Balance per character (persistent, sourced from the ledger)
- Rules: enabled or disabled per web master configuration
- Transaction lifecycle: recorded once, immutable

## Errors

| Error | Surface |
| --- | --- |
| Insufficient funds | blocked in the shop, never here — purchases fail at the shop |
| Rule disabled | the rule is not shown as active |
| Broken streak | the streak counter resets, explained in the rules view |

## Result

The character understands and tracks its economy; every movement is accounted for in the ledger and visible to staff when adjusted.

## Navigation

`/` → `/economy`; spending actions → `/shop`; public profile shows balance, inventory, and bag; staff adjustments happen from `/member/<username>`.
