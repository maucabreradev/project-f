# Flow 12 — Item Shop

Status: proposed

## Entry

- Routes: `/shop` (catalog), `/shop/item/<id>` (detail), `/inventory` (owned items and bag)
- Reachable from: navbar (balance + shop link)
- Actors: member, per active character (inventory and currency are character-scoped — ADR-0001)

## Steps

1. **Browse the catalog**: item icon, name, price, and a stock badge — infinite, limited (remaining count), or unique (single unit).
2. **Item detail**: description, purchase rules (per-character unique purchase when configured), stock status.
3. **Buy**: confirmation dialog (price, resulting balance) → the purchase debits the balance and creates an `InventoryEntry` (`owned`); the ledger records a `purchase` transaction.
4. **Inventory**: owned items, quantities, and the bag.
5. **Equip to bag**: mark items as carried; bag items render as icon + quantity on the character's post profiles.
6. **Sell back**: an owned item is sold for a fraction of its purchase price (web master configuration); ledger records a `sale`.
7. **Refund**: within 24 hours of purchase the item is refunded at full price; refunding a limited-stock item restores that stock globally; the ledger records a `refund`.
8. **Cosmetics**: items of kind `cosmetic` (avatar frames, profile backgrounds) apply to the public profile instead of the bag.

## States

- Item stock: `infinite | limited | unique`; refunds restore limited/unique stock globally
- InventoryEntry lifecycle: `owned → sold | refunded`; items are permanent once bought (until sold or refunded)
- Cosmetic application: active or inactive on the profile

## Errors

| Error | Surface |
| --- | --- |
| Insufficient balance | blocked at confirmation with the missing amount |
| Stock exhausted | purchase disabled, stock badge at zero |
| Unique purchase already made by this character | purchase disabled with explanation |
| Refund window passed (24 h) | refund action unavailable; sell-back remains |
| Item already sold | action disabled |

## Result

The character owns the item (or a cosmetic is applied), the balance updates, and the ledger records the transaction; staff can adjust inventories with reason from the admin dashboard.

## Navigation

`/` → `/shop` → `/shop/item/<id>` → buy → `/inventory`; sell/refund from the inventory; bag editing in `/inventory`; cosmetic effects visible on `/member/<username>`.
