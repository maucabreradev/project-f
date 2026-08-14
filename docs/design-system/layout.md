# Project F — Layout, Responsive Behaviour & Motion

Status: accepted

The approved layout system: the page shell, the home banner, the floating navbar, containers, the board structure, responsive behaviour, and View Transitions / motion. It is a design document only — no components are implemented here. Tokens referenced live in `tokens.md`; component behavior in `components.md`.

Design direction: flat, modern, fast, minimalist, with the full-performance feel of Astro SSR + SolidJS islands. The two hero surfaces of this document — the full-width home banner and the floating navbar — are the visual signature of the forum.

## 1. Page shell

Every route shares the same template (true for the visitor-facing pages as much as the admin shell):

```
<SkipToContent />          # a11y (accessibility.md §3)
<FloatingNavbar />         # sticky top, glass (below)
<main id="main">           # per-route content
  <ForumHero />            # home only — full-width banner
  <Container>…</Container> # constrained content
</main>
<Footer />                 # minimal: identity, legal, "deploy" note
```

- Chrome (navbar, footer) renders server-side in Astro, like the rest of a page; only interactive bits hydrate as islands (notifications, switcher).
- The main `Container` is centered with `max-width` per `§3` and horizontal padding `space-4`/`space-8` responsive.
- Full-bleed layers (hero, ban interstitial) intentionally escape the container edge-to-edge.

## 2. Floating navbar

- **Position**: `sticky`, `top-0`, full viewport width, `z-index: 40`.
- **Surface**: translucent glass — backdrop `--background` at ~85% opacity + `backdrop-blur`, 1px hairline bottom border, `--shadow-nav` to separate from scrolling content. On the home page it may start transparent over the hero and gain the glass surface after the first scroll threshold (Modern: no layout shift — reserve h-16 space or animate background only, never height/content).
- **Height**: `h-16` (64px), content `h-10` row. On very small screens the search field collapses into the mobile drawer to fit.
- **Content (visitor)**: identity (logo + forum name), search, login, register.
- **Content (member)**: identity, search, real-time notification bell (island), character switcher (island, two characters), currency balance pill, avatar `DropdownMenu` (account, economy, shop, inventory, admin when rank allows, logout).
- **Mobile (< lg)**: identity + bell + avatar; navigation folds into a `Sheet` drawer from the side with the full menu, sections, and search.

Identity overrides (forum name/logo, accent tint) come from the Identity token layer (`tokens.md` §1, flow 17).

## 3. Containers and grid

| Surface | Max width | Where |
| --- | --- | --- |
| Full-bleed | none (100% viewport) | home hero banner, ban interstitial |
| Board/list container | `80rem` (1280) | home board structure, categories/forums, directory, shop list |
| Readable container | `72ch` (~46rem) | thread posts, character sheet body, prose content |
| Admin container | `80rem` (1280) | `/admin` tabs, settings |
| Auth container | `24rem` (384) centered | login, register, forgot/reset password |

- One-column-first everywhere; multi-column only above `lg`.
- Board listing (flow 14): category → forums (responsive grid, 1 col on small / 2 col `xl` for tiled cards) or table-like rows with last-activity metadata (recommended row layout: avatar-less, dense, scannable).
- Thread page: post list full width; any auxiliary panel (sheet preview, participants) becomes a side column ≥ `xl` only — never squeeze the readable column.

## 4. Home hero / banner (flow 13)

This is the requested full-width banner — it uses **100% of the forum's width**, edge to edge, on every breakpoint.

- **Height**: `clamp(20rem, 40vh, 26rem)` — responsive, never fixed-pixel so it fills nicely from phone to desktop.
- **Content**: web master–configured cover image (flow 17 Identity) with an overlay gradient tied to the Identity color (`--cover` → transparent) for guaranteed text contrast; atop it: a thin status row (chips: stats), the forum name (`display` step, `tokens.md` §5), and optional tagline; CTA row (register / browse - varies by session state).
- **Layer**: the hero sits directly under the floating navbar (navbar is sticky above it); the navbar's transparent-over-hero variant applies here.
- Placeholder: if no cover is configured, render a flat `--primary`→`--accent` gradient panel with the same overlay rules — the banner exists regardless.
- The banner is a `template`-level surface of the home route only (`/`, route map), not a reusable component elsewhere.

## 5. Responsive behaviour

Mobile-first, Tailwind breakpoints: `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`.

| Concern | Well below `sm` | `sm`–`lg` | `lg` and up |
| --- | --- | --- | --- |
| Navbar | condensed + drawer | condensed + drawer | full (identity, search, bell, switcher, balance, menu) |
| Hero | stacked, smaller display | stacked | as designed |
| Tables | stacked cards | stacked cards | full table |
| Post profile (thread) | stacks above post content | stacks | sidebar at `xl` |
| Board grid | 1 col | 2 col | 2–3 col / rows |
| Admin tabs | horizontal scroll-able tab bar | tabs | tabs |
| Dialogs | bottom-sheet feel (full-width, `space-4` padding) | centered | centered |

Rules:

- **No horizontal page scroll** at any width; wide tables collapse (`components.md` §10), long prose wraps, code blocks scroll internally.
- **Touch targets** ≥ 44×44 CSS px on all interactive controls at `sm` and below (`accessibility.md` §8).
- **Forms** stack full-width fields on mobile; two-column grids only ≥ `md` when semantically paired.
- Grid gap scale follows `tokens.md` §6; never add a third breakpoint-specific column without a layout reason.
- The readable column is preserved: text inside cards never exceeds ~72ch.

## 6. View Transitions and motion

Astro's `<ViewTransitions />` is enabled globally (MPA-friendly, works with SolidJS islands — `../architecture.md`; supported by the stack per ADR-0005).

**Behavior**

- Default cross-page transition: content fades and slides up subtly (`--duration-base`, `--ease-standard`); no full-screen flash or loading state.
- Persistent chrome — navbar and footer — crossfades in place (they are stable in the DOM between pages). Give navbar/banner stable names so the hero fades while the navbar stays put.
- Use `data-astro-transition-persist` on long-lived interactive islands worth keeping (e.g., the character switcher) so island state survives navigation; everything else re-hydrates fresh.
- The home hero can use a slow-zoom "reveal" (`--duration-slow`) on first paint only; nothing else animates continuously.

**Micro-interactions**

- Hover/press: `--duration-fast`; menu/popover open: `--duration-base` + `--ease-emphasis`.
- The floating navbar background fades in (`--duration-base`) when scrolling away from the top of the hero.
- Dialog/drawer slide+fade (`--duration-base`, `--ease-emphasis`); toasts slide in (`--duration-base`).

**Performance & reduced motion**

- All transitions are GPU-friendly (opacity/transform only) — no width/height animation.
- `prefers-reduced-motion` disables cross-page transitions and turn the page changes instant (`accessibility.md` §7).
- Islands that animate status (notification dot) use `opacity`/`transform`, never layout.

## 7. Section rhythm

- Home: hero → status banners (unconfirmed/inactive, when present) → board structure → recent activity → stats.
- Board page: breadcrumb → header (name, description, permissions hint) → action row (new thread when writable) → threads list → pagination.
- Thread: breadcrumb → title + tags/state → posts → composer (reply, quote, multi-quote).
- The spacing between top-level sections is `space-12`/`space-16`; within cards, `space-4`/`space-6` (`tokens.md` §6).
