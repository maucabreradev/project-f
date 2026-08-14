# Project F — Design System

Status: accepted

The approved Design System for Project F: a **clean, flat, modern, minimalist** interface for a customizable online roleplay forum, fast on Astro SSR + SolidJS islands (ADR-0005). This document is the index; the normative content lives in the sub-documents. It is a design document only — no components are implemented here.

## Principles

1. **Minimalist and flat.** Structure comes from hairline borders and surface lightness, not shadows. Restrained radius. One accent color with a cool-neutral slate base.
2. **Fast by default.** Pages render server-side; only islands hydrate. View Transitions give the app feel without a client router. Inter is self-hosted; motion is GPU-only.
3. **Libraries over custom code** (approved stack): Tailwind CSS v4 tokens, Kobalte primitives, shadcn-solid components, a single line-icon set. The Design System defines tokens and responsibilities; custom components exist only where the product is genuinely specific (floating navbar, home banner, post profile, empty/error/ban states).
4. **Configurable without breaking.** The web master can re-skin accent and cover (flow 17) through an Identity token layer; the semantic core and contrast guarantees are fixed (`tokens.md` §1).
5. **Accessible by design** — WCAG 2.1 AA baseline throughout (`accessibility.md`).

## Documents

| Doc | Covers |
| --- | --- |
| `tokens.md` | Color (light + dark), typography (Inter), type + spacing scales, radius, shadows, z-index, motion tokens, Identity override layer |
| `components.md` | Buttons, inputs, selects, badges, cards, dialogs, tables, navigation, feedback, loading, empty/error states — variants, states, library mapping |
| `component-architecture.md` | The canonical Atomic Design catalog: atoms, molecules, organisms, templates, pages — responsibility, props, events, variants, reusability |
| `layout.md` | Page shell, floating navbar, full-width home banner, containers, board structure, responsive behaviour, View Transitions & motion |
| `accessibility.md` | WCAG 2.1 AA baseline: contrast, focus/keyboard, forms, SR, motion, touch, verification |

## The visual signatures

- **Floating navbar** — sticky, top, glass, hairline border; identity, search, real-time notifications, character switcher, balance, avatar menu (`layout.md` §2).
- **Home banner** — full 100% width of the forum, cover + identity-tinted overlay, forum name display; sits under the navbar (`layout.md` §4, flow 13).
- **View Transitions** — fade/slide on navigation, persistent chrome, `prefers-reduced-motion` respected (`layout.md` §6).

## How it maps onto the approved stack

- **Tailwind CSS v4**: tokens are CSS variables in `@theme` (semantic names from shadcn-solid) plus the Identity override layer. Scheme toggled by a `.dark` class on the root, default honoring `prefers-color-scheme`.
- **Kobalte + shadcn-solid**: primitives are consumed directly, never wrapped (`component-architecture.md` §2); nothing headless is re-implemented.
- **Atomic Design** (AGENTS.md rule 20): atoms → molecules → organisms → templates → pages; the canonical catalog is `component-architecture.md`; components live in `apps/web/src/components/` (`../architecture.md`).
- **Islands**: only interactive organisms hydrate (navbar bell, character switcher, editor, shop, complex forms); everything else is SSR.

## Implementation contract

- Every component and page uses only design tokens — no hardcoded colors/radius/sizes (`components.md` §16).
- A feature is finished only when its tokens, contrast, keyboard, and SR behavior pass the baselines (`accessibility.md` §9) and the tests/typecheck/lint/build pass (AGENTS.md rule 28).
- This Design System is the deliverable behind ticket `02-design-system-tokens.md` (status `done`; see its checklist).

## References

- ADR-0005 tech stack (Tailwind v4, Kobalte, shadcn-solid); ADR-0006 application architecture; `docs/architecture.md`.
- `docs/routes.md` (route map) and `docs/ux/` (flows) drive which surfaces need which composition.
- `docs/agents/` — issue tracker (tickets live in `.scratch/`).
