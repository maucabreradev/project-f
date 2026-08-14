# Project F — Design Tokens

Status: accepted

The approved design token layer for Project F. It is a design document only — no components or code are implemented here. Implementation follows Tailwind CSS v4 with shadcn-solid naming (ADR-0005); see `README.md` in this directory for how the tokens map onto Tailwind's `@theme`.

Design direction: clean, flat, modern, minimalist. Hairline borders carry structure; shadows are reserved for floating layers only.

## 1. Token layers

Tokens are split into two layers so the forum can be re-skinned without breaking the system:

| Layer | Scope | Owner | Notes |
| --- | --- | --- | --- |
| **Core** | neutrals, text hierarchy, borders, state colors, radius, spacing, motion | Design System (fixed) | The baseline; never overridden by forum configuration |
| **Identity** | accent color, cover tint, navbar presentation | Web master (flow 17, Identity tab) | Rides on top of Core via CSS variables; values are contrast-constrained in the picker |

`<brand>` in `ForumConfiguration` maps to Identity tokens. The Identity layer must never change a semantic meaning: it re-hues `--primary`, the cover gradient tint, and the navbar surface, but never the red/green/amber semantic states, text hierarchy, or contrast ratios.

## 2. Color — light

Color is authored in OKLCH (Tailwind v4 default). Values are reference defaults; the hard rule is contrast (see `../accessibility.md` §2).

| Token | Value | Purpose |
| --- | --- | --- |
| `--background` | `oklch(0.985 0.0025 247)` | page background, cool off-white |
| `--foreground` | `oklch(0.21 0.02 262)` | primary text |
| `--card` | `oklch(1 0 0)` | card / surface-raised |
| `--card-foreground` | `oklch(0.21 0.02 262)` | text on card |
| `--popover` | `oklch(1 0 0)` | dropdown / popover surface |
| `--popover-foreground` | `oklch(0.21 0.02 262)` | text on popover |
| `--surface-sunken` | `oklch(0.96 0.004 247)` | inset wells, quote blocks, embedded preview |
| `--primary` | `oklch(0.51 0.22 278)` | accent (index), buttons, links, active states |
| `--primary-foreground` | `oklch(0.99 0.005 280)` | text on primary |
| `--secondary` | `oklch(0.965 0.004 247)` | subtle button / chip background |
| `--secondary-foreground` | `oklch(0.29 0.02 262)` | text on secondary |
| `--muted` | `oklch(0.96 0.004 247)` | muted surfaces, hover fills |
| `--muted-foreground` | `oklch(0.5 0.02 262)` | secondary text, meta, placeholders |
| `--accent` | `oklch(0.93 0.03 278)` | soft indigo tint: hover, selected, borders |
| `--accent-foreground` | `oklch(0.38 0.18 278)` | text on accent tint |
| `--destructive` | `oklch(0.577 0.245 27.3)` | destructive actions, errors |
| `--destructive-foreground` | `oklch(0.985 0.005 20)` | text on destructive |
| `--success` | `oklch(0.56 0.15 155)` | success states |
| `--success-foreground` | `oklch(0.985 0.005 160)` | text on success |
| `--warning` | `oklch(0.68 0.14 85)` | warning states |
| `--warning-foreground` | `oklch(0.25 0.04 85)` | text on warning |
| `--info` | `oklch(0.58 0.11 245)` | informational states |
| `--info-foreground` | `oklch(0.985 0.005 245)` | text on info |
| `--border` | `oklch(0.91 0.005 247)` | hairline borders |
| `--input` | `oklch(0.9 0.008 247)` | input borders (slightly stronger than border) |
| `--ring` | `oklch(0.51 0.22 278)` | focus ring (primary hue) |
| `--cover` | `oklch(0.51 0.22 278)` | Identity: cover overlay tint (overrideable) |

## 3. Color — dark

| Token | Value | Purpose |
| --- | --- | --- |
| `--background` | `oklch(0.15 0.014 262)` | deep cool slate |
| `--foreground` | `oklch(0.94 0.006 260)` | primary text |
| `--card` | `oklch(0.18 0.014 262)` | raised surface |
| `--card-foreground` | `oklch(0.94 0.006 260)` | text on card |
| `--popover` | `oklch(0.19 0.014 262)` | popover surface |
| `--popover-foreground` | `oklch(0.94 0.006 260)` | text on popover |
| `--surface-sunken` | `oklch(0.13 0.012 262)` | inset wells, quote blocks |
| `--primary` | `oklch(0.64 0.19 277)` | accent, lightened for dark contrast |
| `--primary-foreground` | `oklch(0.16 0.015 262)` | text on primary |
| `--secondary` | `oklch(0.24 0.015 262)` | subtle button / chip background |
| `--secondary-foreground` | `oklch(0.9 0.008 260)` | text on secondary |
| `--muted` | `oklch(0.24 0.014 262)` | muted surfaces |
| `--muted-foreground` | `oklch(0.68 0.02 262)` | secondary text, meta |
| `--accent` | `oklch(0.28 0.05 278)` | indigo-tinted surface: hover, selected |
| `--accent-foreground` | `oklch(0.82 0.09 277)` | text on accent tint |
| `--destructive` | `oklch(0.65 0.19 25)` | destructive actions, errors (lightened) |
| `--destructive-foreground` | `oklch(0.97 0.005 20)` | text on destructive |
| `--success` | `oklch(0.68 0.14 160)` | success states (lightened) |
| `--success-foreground` | `oklch(0.14 0.03 160)` | text on success |
| `--warning` | `oklch(0.78 0.12 90)` | warning states |
| `--warning-foreground` | `oklch(0.2 0.04 90)` | text on warning |
| `--info` | `oklch(0.68 0.11 245)` | informational states |
| `--info-foreground` | `oklch(0.16 0.03 245)` | text on info |
| `--border` | `oklch(0.25 0.016 262)` | hairline borders (stronger on dark) |
| `--input` | `oklch(0.29 0.018 262)` | input borders |
| `--ring` | `oklch(0.66 0.18 277)` | focus ring (lightened primary) |
| `--cover` | `oklch(0.64 0.19 277)` | Identity: cover overlay tint (overrideable) |

Rules:

- Scheme is toggled by a `.dark` class on the root; the default honors the member/device `prefers-color-scheme`. Web master config may pin one scheme per deployment.
- No solid shadow on dark; elevation is expressed through raised surface lightness and hairline borders.
- Semantic states (destructive/success/warning/info) are lightened in dark so their soft backgrounds and foregrounds stay distinguishable and contrast-safe.

## 4. Color — soft state backgrounds

Used by badges, alerts, and status chips. Each state exposes a soft background + strong foreground pair (defined above) so flat badges read without filled backgrounds.

| State | Soft bg (light / dark) | Strong fg (light / dark) |
| --- | --- | --- |
| neutral | `--secondary` / `--secondary` | `--muted-foreground` |
| accent/primary | `--accent` / `--accent` | `--accent-foreground` / `--accent-foreground` |
| success | `oklch(0.94 0.05 160)` / `oklch(0.2 0.05 160)` | `--success-foreground` |
| warning | `oklch(0.96 0.06 95)` / `oklch(0.24 0.05 90)` | `--warning-foreground` |
| destructive | `oklch(0.94 0.04 27)` / `oklch(0.26 0.06 25)` | `--destructive-foreground` |
| info | `oklch(0.95 0.02 245)` / `oklch(0.22 0.04 245)` | `--info-foreground` |

## 5. Typography

- **Family**: Inter (variable), self-hosted via the Astro asset pipeline (`@fontsource-variable/inter`); no external font host at runtime. This is the only family — UI and long-form share it, per the approved design direction.
- **Fallbacks**: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

### Type scale

| Step | Size / Line-height | Weight | Used for |
| --- | --- | --- | --- |
| display | `3rem` (48) / `1.05` | 800 | home banner forum name (clamped 36–64) |
| h1 | `2.25rem` (36) / `1.1` | 700 | page titles |
| h2 | `1.5rem` (24) / `1.2` | 700 | section headings |
| h3 | `1.125rem` (18) / `1.3` | 600 | card / item titles |
| base-lg | `1.0625rem` (17) / `1.5` | 400 | post body (forum prose) |
| base | `1rem` (16) / `1.5` | 400 | default body |
| sm | `0.875rem` (14) / `1.4` | 400 | UI copy, table rows, meta |
| xs | `0.75rem` (12) / `1.35` | 500 | captions, timestamps, badges |
| tabular | inherits size / `1.4` | 600 | currency balances, stats — `font-variant-numeric: tabular-nums` |

- Headings: `letter-spacing: -0.015em`; display: `-0.03em`.
- Inline code, quotes, spoilers: mono fallback `ui-monospace, SFMono-Regular, Menlo, monospace` at `0.95em`.
- All content uses logical line-length: prose blocks are capped by the layout system (`../layout.md` §3), not by the type scale.
- Ensure everything self-hosted has `font-display: swap` with the UI font preloaded to avoid layout shift.

## 6. Spacing

Quarter-rem base (matches Tailwind v4 default scale). Reference scale and the semantic uses Project F commits to:

| Token | Base | Usage |
| --- | --- | --- |
| `space-1` | `0.25rem` (4) | tight icon gaps, input padding (x) |
| `space-2` | `0.5rem` (8) | input padding (y), chip gaps, small spacing |
| `space-3` | `0.75rem` (12) | form field gaps, card padding (compact) |
| `space-4` | `1rem` (16) | default card padding, list gaps |
| `space-6` | `1.5rem` (24) | section spacing, dialog padding |
| `space-8` | `2rem` (32) | large section spacing |
| `space-12` | `3rem` (48) | page section breaks |
| `space-16` | `4rem` (64) | home hero spacing |
| `space-24` | `6rem` (96) | empty-state breathing room |

Rules:

- Controls in a row / forms column use `space-2`/`space-3`; card interiors use `space-4`/`space-6`.
- Never vary spacing for emphasis; use the scale.
- Grid gaps follow the same scale (`gap-2/3/4/6`).

## 7. Size scale for controls

Buttons, inputs, and selects share one height scale so they align in forms:

| Size | Height | Padding (x) | Radius | Font |
| --- | --- | --- | --- | --- |
| sm | `2rem` (32) | `0.75rem` | `--radius-sm` | sm (14) |
| default | `2.5rem` (40) | `1rem` | `--radius` (8) | sm (14) |
| lg | `3rem` (48) | `1.25rem` | `--radius-md` (10) | base (16) |
| icon | `2.5rem` (40) square | — | `--radius` | — |

## 8. Border radius

| Token | Value | Used for |
| --- | --- | --- |
| `--radius-sm` | `0.375rem` (6) | small controls, chips (when not full) |
| `--radius` | `0.5rem` (8) | default controls, badges, alerts |
| `--radius-md` | `0.625rem` (10) | large controls (lg size) |
| `--radius-lg` | `0.75rem` (12) | cards, panels |
| `--radius-xl` | `1rem` (16) | feature cards, hero panel, dialogs |
| `--radius-full` | `9999px` | pills, tags, avatars (circle) |

Rules:

- Flat and restrained: radius communicates grouping, never decoration.
- Focus ring follows the element's own radius.

## 9. Shadows

Flat baseline: structure comes from 1px hairline borders and surface lightness, not shadows. Shadows exist only to float layers.

| Token | Light value | Dark value | Used for |
| --- | --- | --- | --- |
| `--shadow-none` | `none` | `none` | cards, panels, tables (default — flat) |
| `--shadow-raise` | `0 1px 2px rgb(15 23 42 / 0.06), 0 2px 8px -2px rgb(15 23 42 / 0.05)` | `0 1px 2px rgb(0 0 0 / 0.5)` | interactive cards on hover, sticky table headers |
| `--shadow-nav` | `0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.14)` | `0 1px 2px rgb(0 0 0 / 0.5), 0 8px 24px -12px rgb(0 0 0 / 0.6)` | floating navbar |
| `--shadow-popover` | `0 8px 30px -6px rgb(15 23 42 / 0.18)` | `0 8px 30px -6px rgb(0 0 0 / 0.65)` | dropdowns, popovers, tooltips |
| `--shadow-dialog` | `0 16px 48px -12px rgb(15 23 42 / 0.28)` | `0 16px 48px -12px rgb(0 0 0 / 0.75)` | dialogs, drawers, modals |

Focus is expressed with `--ring` (ring, offset outline), never a shadow — the ring works in both schemes.

## 10. Z-index scale

| Value | Layer |
| --- | --- |
| `10` | sticky headers, table sticky rows |
| `40` | floating navbar |
| `50` | dropdowns, popovers, tooltips |
| `60` | drawer / sheet (mobile nav) |
| `70` | dialogs, confirmations |
| `80` | toasts |
| `90` | ban interstitial overlay (page shutter) |
| `999` | skip-to-content link (above everything) |

## 11. Motion tokens

See `../layout.md` §6 for how these apply (View Transitions, micro-interactions).

| Token | Value |
| --- | --- |
| `--duration-fast` | `150ms` |
| `--duration-base` | `250ms` |
| `--duration-slow` | `400ms` |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--ease-emphasis` | `cubic-bezier(0.16, 1, 0.3, 1)` |

All motion is disabled under `prefers-reduced-motion`; see `../accessibility.md` §7.
