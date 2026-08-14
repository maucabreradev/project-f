# 23 — Inventory, bag & sell-back/refund

**What to build:** Characters manage owned items in their inventory, equip items into the bag (shown with icon and quantity on post profiles), sell items back at a fraction of the purchase price, and refund purchases within 24 hours (restoring limited stock globally).

**Blocked by:** 22 — Shop catalog & purchasing, 15 — Replies & post editing

**Status:** ready-for-agent

- [ ] The bag is persisted as `inventory_entries.in_bag` (0/1) — a subset flag guaranteeing bag ⊆ inventory (decision D5); `PUT /api/inventory/:entryId/bag` enforces the subset (story 46)
- [ ] `POST /api/inventory/:entryId/sell` returns a floored fraction of the price (decision D1); already sold/refunded → 422 `entry_closed` (story 47)
- [ ] `POST /api/inventory/:entryId/refund` works within 24 h → 422 `refund_window_passed`; limited/unique stock is restored globally (invariant 12, story 48)
- [ ] `/inventory` page (InventoryPanel) manages inventory and bag; PostProfile shows bag items with icon and quantity on posts
- [ ] Seam tests: bag subset, sell-fraction flooring, refund window, global stock restore