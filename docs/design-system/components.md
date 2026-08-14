# Project F — Components

Status: accepted

The approved component vocabulary for Project F. It is a design document only — this file defines each component's responsibility, visual spec, states, and its mapping to the approved libraries (Tailwind CSS v4 + Kobalte primitives + shadcn-solid, ADR-0005). Organization follows Atomic Design (AGENTS.md rule 20): atoms, molecules, organisms, templates.

## 1. Principles

- **Do not wrap every HTML element in a component** (AGENTS.md rule 21). Prefer the shadcn-solid primitives as-is; create a Project F component only when the design adds behavior or a business-specific pattern.
- **One responsibility per component** (AGENTS.md rule 22). A component does one thing and composes.
- **Prefer the library.** Anything shadcn-solid already ships (button, input, select, badge, card, dialog, table, tabs, breadcrumb, dropdown-menu, skeleton, sonner, alert, field/form, pagination) is used, never rewritten.
- Components are **presentational and headless-driven**: markup, variants, and tokens only — stateful behavior comes from Kobalte primitives and SolidJS islands (`../architecture.md` islands list).
- Flat, modern, minimalist: hairline borders, restrained radius (`tokens.md` §8), no gratuitous gradients or excess shadow.

## 2. Component architecture

The canonical Atomic Design catalog — atoms, molecules, organisms, templates, and pages, each with responsibility, props, events, variants, and reusability — lives in `component-architecture.md` (the single source of truth for what components exist and at which level they sit). This file documents the design detail (states, tokens, behavior) of the components listed there.

The component tree consumes these shadcn-solid/Kobalte primitives directly, never wrapped (AGENTS.md rule 21): `Button`, `Badge`, `Label`, `Input`, `Textarea`, `Select`, `Switch`, `Checkbox`, `RadioGroup`, `Separator`, `Spinner`, `Skeleton`, `Tooltip`, `Card`, `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `DropdownMenu`, `Tabs`, `Table`, `Breadcrumb`, `Field`, `Form` (Zod), `Alert`, `Sonner` (toast), `Pagination`. Project F owns the atoms `Avatar`, `Currency`, `RankTag`, `Tag`, `StatusChip`, `UserLink`, `PostMeta`, `Icon`; the remaining molecules/organisms are listed in `component-architecture.md` §4–5.

## 3. Atoms

### Avatar
- Square-ratio image with `--radius-full` (circle) for threads/profile, square `--radius-md` for post profile thumbs.
- Sizes: xs 24 / sm 32 / md 40 / lg 56 / xl 96.
- `alt` always set to the character name; decorative thumbnails pass `alt=""`.
- Loading: skeleton block with the same geometry; failure: fallback monogram (first letters of character name) on `--secondary`.

### Currency
- Renders a numeric balance in `tabular-nums` + the configured currency name/unit icon (flow 11).
- Compact variant for the navbar balance pill; ledger variant for the economy page.

### RankTag
- Badge representing a rank: Web master (primary), Administrator (info), Moderator (warning), User (neutral). Uses the soft state pairs from `tokens.md` §4.

### Icon
- One line-icon library only (lucide-solid, the default of the shadcn-solid stack). No mixed icon families. Decorative icons are `aria-hidden`.

## 4. Buttons

shadcn-solid `Button`.

**Variants**
- `default` — filled `--primary`, `--primary-foreground`.
- `secondary` — filled `--secondary` surface.
- `outline` — transparent, `--border`, `--foreground` text; primary text on hover.
- `ghost` — no border/background; primary text on hover.
- `destructive` — filled `--destructive`.
- `link` — primary text underlined on hover; used inline in prose.

**Sizes**: sm / default / lg / icon from `tokens.md` §7.

**States**: hover (surface +1 step), active (press, translate-y `1px`), focus-visible (`--ring`, per `accessibility.md` §3), disabled (40% opacity, no pointer events), loading (Spinner inline; button disabled). Icon+label buttons keep the icon left, label always present unless `icon` size with `aria-label`.

Destructive actions are always paired with a confirmation dialog (`accessibility.md`, `AlertDialog` below) except idempotent ones.

## 5. Inputs & fields

- **Input** — shadcn `Input`; height from `tokens.md` §7, `--input` border, focus ring. `read-only` variant uses `--muted` surface.
- **Textarea** — for multi-line; used by raw OOC editor fallback and admin forms. The WYSIWYG editor is the dedicated island (ticket 26) and inherits the same border/radius/focus tokens.
- **Field/Form** — shadcn `Field` + `Form` (Zod) for validation: label + control + description + inline error. Every form field has an explicit `<Label>`; errors are associated via `aria-describedby`, invalid controls carry `aria-invalid` (see `accessibility.md` §5).
- **Character counter** — pairs with content-limit fields (flow 07, min/max post length): shows `current / max` in `xs` `--muted-foreground`, turns warning at 90% and destructive at the cap.
- **Switch / Checkbox / RadioGroup** — shadcn primitives for settings, permission matrices, and preference toggles; always with a visible label.

**States (all controls)**: default, hover (border +1 step), focus-visible (ring), error (destructive border + inline message, no red glow), disabled (40% opacity), filled.

**Error convention**: inline field error under the control (Zod, shared `packages/validation`), never a blocking toast for a single field (UX README global error handling).

## 6. Selects

shadcn `Select` (Kobalte Select). Height aligned to Input (`tokens.md` §7), same border/radius/focus tokens.

- Single-select with placeholder (placeholder style = `--muted-foreground`).
- Multi-select for permission matrix rows and moderation scope (flow 15) — checked list inside the popover, count of selected in the trigger.
- Native `<select>` is allowed for small embedded picks (e.g., inline topic filters) only when no custom styling is required; the styled component is the default.

## 7. Badges, pills and tags

shadcn `Badge` + Project F `Tag`.

- **Badge**: `--radius-full` pill, soft state background + strong foreground (`tokens.md` §4). Variants map to states: neutral, primary, success, warning, destructive, info, outline.
- **Tag**: small rectangular chip for thread-level marks — **IC** (primary), **OOC** (neutral/outline), **PIN** (warning accent), spoiler (outline). IC/OOC is the primary thread discriminator (`../routes.md` threads) and must stay legible at `xs`.
- **Status chips**: `active` (success), `inactive` (neutral), `pending` (warning), `banned` (destructive), `unconfirmed` (warning). Used on profiles, member lists, admin queues.

Badges are decorative markers — when they carry the *only* meaning (e.g., an error that must reach SR users), pair with `sr-only` text (`accessibility.md` §6).

## 8. Cards and panels

shadcn `Card`. Flat by default: `--card` surface, 1px `--border`, `--radius-lg` (12).

- **Default card**: board/forum boxes, admin panels, shop item tiles.
- **Interactive card**: hover raises (`--surface-raised` or `--shadow-raise`, border +1 step); used for clickable boards/threads/items. Keyboard focus shows ring.
- **Post card**: the per-post container in `/thread/<id>` (`PostProfile` header + content + moderation history footer). Reply accents the left edge with `--primary` so "latest reply" is scannable.
- **Profile panel**: member profile header — banner (cover), avatar overlapping, name, username, rank, meta (`../routes.md` `/member/<username>`).
- Card headers keep title + optional action slot; dividers use `Separator`/hairline borders, never background contrast alone.

## 9. Dialogs and drawers

- **Dialog** — shadcn `Dialog` (Kobalte Dialog): overlay `--background` at 60% opacity with `backdrop-blur-sm`, content `--popover`/`--card`, `--radius-xl`, `--shadow-dialog`, default `space-6` padding. Used for: item purchase confirm (flow 12 `item detail`), item detail, quick actions, admin deep actions (flow 07), avatar/banner from URL (flow 16).
- **AlertDialog** — overlay of Dialog for destructive, non-closeable-on-outside-click confirmations: ban, delete account, delete character, and any permanent action. Mandatory because these actions are irreversible.
- **Sheet** — Kobalte Sheet used as (a) mobile navigation drawer (`layout.md` §2) and (b) optional character-sheet preview panel on post profiles.
- All overlays: focus trap, `Esc` to close, `aria-labelledby` heading, restore focus (`accessibility.md` §4). Loading and error states inside a dialog render inline (Skeleton / Alert), not as secondary modals.

## 10. Tables

shadcn `Table` for admin data (members, shop catalog, logs, bans, inventory) and the economy ledger.

- Dense rows (`py-2` within `sm` text), hairline row borders, `--card` background, `--radius-lg` container.
- Optional zebra striping via `--surface-sunken` at hover/achieve — hover row is required for interactive rows.
- Sortable headers (icon affix + `aria-sort`), sticky header with `--shadow-raise` on scroll (optional, long tables).
- Pagination via shadcn `Pagination`; server-side for member directory and logs.
- **Responsive**: tables collapse to stacked cards below `lg` (`layout.md` §5) — never horizontal-scroll-only.

## 11. Navigation

- **FloatingNavbar** (organism, `layout.md` §2): sticky top, full-width, glass; identity + search + real-time notification bell (island) + character switcher (island) + balance + avatar `DropdownMenu` (account, economy, shop, inventory, admin, logout). Visitor variant: login/register actions. Mobile: `Sheet` drawer.
- **Breadcrumb** — shadcn, board hierarchy (category → forum → subforum) and admin sections.
- **Tabs** — shadcn, admin dashboard and account (Account/Character tabs).
- **DropdownMenu** — avatar menu, thread actions (kebab), board actions.
- **Tooltip** — shadcn, for icon-only controls (bell, kebab, balance info).

Rules: navigation must keep member context (active character) — switching character never logs out (flow 06). Navbar identity and links render server-side; only the interactive parts hydrate as islands.

## 12. Feedback

- **Toast (sonner)** — non-blocking global feedback; used only for: network/server errors when the form state must be preserved (UX README), copy actions, and bulk-save confirmations. Stack: bottom-right, `--shadow-popover`. Success/warning/destructive variants use the soft state pairs.
- **Alert** — inline contextual banner: `info` (unconfirmed reminder with resend — flow 13), `warning` (inactive notice, soft-delete window), `destructive` (blocked action, arbitration required), `success` (transient confirmation). Alerts are part of the page flow, not overlays.
- **Notification bell** — real-time island (tickets 54/55); unread count as a numeric badge; dropdown lists notifications with read state; empty state when none.

## 13. Loading

- **Skeleton** — shadcn: page-level and island-level placeholders that match final geometry + radius. Used for the initial SSR-to-hydration gap and solid-query fetch states.
- **Spinner** — buttons/actions in progress; inline size per control height.
- **SkeletonPage** (template pattern, `component-architecture.md` §6) — layout-preserving skeleton for boards/threads/admin tabs (header + rows), never a full-page freeze.
- **Optimistic UI** — within islands, mutations update immediately and reconcile (solid-query `useMutation`).
- No full-page loading spinner on navigations (View Transitions handle them); spinners are for actions, skeletons for data.

## 14. Empty states

`EmptyState` (molecule): icon (from the line-icon set, `--muted-foreground`), title, optional description, optional single CTA. Flat, no illustrations or mascots. `space-24` breathing room.

Used for: board with no threads, no search results (global and per-thread), empty member directory filter, empty inventory / bag, no notifications, no bans/appeals queues. Each carries guidance + a route-forwarding CTA where meaningful (e.g., "no threads yet — be the first" → `/new-thread/<boardId>` when the actor has write).

## 15. Error states

- **InlineError** — per-field Zod errors (`accessibility.md` §5).
- **ErrorPage** (delivered by `StaticMessageTemplate`, `component-architecture.md` §6) — full-page states:
  - `404` — friendly, keeps navbar/chrome, search suggestion.
  - `403` — hard gate (admin/configuration routes are never silently hidden — flow 07/17). Explains the missing permission without exposing internals.
  - `500` — generic with retry.
- **BanInterstitial** (organism) — full-page shutter over every route when email/IP is banned (flow 13 errors): reason (mandatory), duration, appeal action. Takes visual precedence over all content (`z-index: 90`).
- **Failure states are never silent**: network/server failures surface as a non-blocking toast and the form keeps its values (UX README).

## 16. Cross-cutting

- Every state above is documented with its accessible name, role, and keyboard behavior — see `accessibility.md`.
- Component styling is expressed only through design tokens; nothing hardcodes a color, radius, or size value.
- Responsive behavior per component is defined in `layout.md` §5.
