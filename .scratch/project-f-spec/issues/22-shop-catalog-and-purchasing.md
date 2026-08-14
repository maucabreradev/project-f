# 22 — Shop catalog & purchasing

**What to build:** The web master manages the item catalog (price, stock models, per-character unique purchase); characters browse the shop and buy items atomically against their balance.

**Blocked by:** 21 — Economy ledger & earn rules, 10 — Admin shell & dashboard

**Status:** ready-for-agent

- [ ] `items` and `inventory_entries` tables exist; admin item CRUD (web master only); an item still owned by any character cannot be deleted → 422 `item_owned` (decision D4) (stories 49)
- [ ] `GET /api/shop` lists items with affordability against the balance; `POST /api/shop/:itemId/purchases` is atomic (debit + stock + ledger + entry) (tickets 01 spike, 38 in the initial set)
- [ ] Purchase errors: 422 `insufficient_balance`, `out_of_stock`, `unique_purchase`, `not_stackable` (quantity > 1) (api.md §3.6)
- [ ] `/shop` page with ShopCatalog + item detail dialog with purchase confirmation (ItemDetailDialog)
- [ ] Seam tests: purchase atomicity, infinite/limited/unique stock models, unique purchase per character, quantity rules