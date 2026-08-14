# Flow 17 — Web Master Configuration

Status: accepted

## Entry

- Route: `/admin/settings`
- Reachable from: the admin dashboard Settings tab
- Actors: **Web master only** — the unique rank; any other actor gets a hard 403 (this route is never silently hidden)

## Steps

Tabbed configuration, each tab validated with Zod and saved to the single `ForumConfiguration`:

1. **Identity**: forum name, domain, cover images, colors. Applies to the home page, navbar, and shared UI tokens.
2. **Registration**: mode (`open | approval`), confirmation policy. Applies to flows 01–02.
3. **Economy**: currency name; earn rules — per thread, per post, login streak, monthly interest (day and percentage), birthday reward (enabling the birthday rule adds the character birth-date field). Applies to flow 11.
4. **Shop**: refund window (24 h), sell-back fraction. Applies to flow 12.
5. **Sheets**: data field definitions, enabled sheet templates (presentation variants over the same fields — invariant 14), AI evaluation toggle with the web master's own API key (ADR-0002).
6. **Archive**: soft-delete window (0–30 days; 0 = immediate), archive forum visibility defaults. Applies to flows 22–23.
7. **Permissions**: default per-rank read/write matrices for new boards (fine-grained per-board overrides stay in the Boards tab, flow 07).

## States

- Single configuration instance per deployment; changes take effect immediately on save
- Toggles expose dependent fields (e.g., enabling birthday reveals the reward amount)

## Errors

| Error | Surface |
| --- | --- |
| Not the Web master | 403 |
| Validation failures (Zod) | inline field errors |
| Out-of-range values (e.g., window not in 0–30) | inline field errors with allowed ranges |
| Malformed API key (AI evaluation) | inline error; evaluation stays off |

## Result

The forum's identity, policies, and economy are active; public UI (name, colors, cover), flows 01–02, 11–12, and the sheet flow reflect the configuration immediately.

## Navigation

`/admin` → Settings; per-board permission matrices and shop catalog are managed from their own dashboard tabs (flows 07, 12).
