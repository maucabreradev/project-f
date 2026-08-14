# 02 — Design System foundation

**What to build:** The approved Design System rendered on the home page: Core + Identity design tokens with light and dark schemes, the BaseTemplate shell with skip-to-content and a floating glass navbar, the full-width home hero, the footer, View Transitions, and the WCAG 2.1 AA accessibility baseline verified by axe in the minimal Playwright suite.

**Blocked by:** 01 — Project skeleton & single testing seam

**Status:** ready-for-agent

- [ ] Tokens are implemented as CSS variables (`@theme`, shadcn-solid naming): colors, type, spacing, radius, shadows, motion; light + dark scheme honoring `prefers-color-scheme` with a `.dark` class toggle (tokens.md)
- [ ] Components use only design tokens — no hardcoded colors, radius, or sizes
- [ ] BaseTemplate renders: skip-to-content link to `#main`, semantic landmarks, exactly one `main`, FloatingNavbar (sticky glass, z-40, visitor + member states), footer
- [ ] The home page renders the full-width hero banner (height `clamp(20rem, 40vh, 26rem)`) with a placeholder cover gradient and the forum name (layout.md §4)
- [ ] View Transitions enabled with GPU-only motion; `prefers-reduced-motion` disables transitions (layout.md §6)
- [ ] Responsive: no horizontal scroll at any width; touch targets ≥ 44×44 px at `sm` and below (accessibility.md §8)
- [ ] Playwright + axe passes on the home route (accessibility.md §9)