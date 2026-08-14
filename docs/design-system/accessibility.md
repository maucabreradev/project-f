# Project F — Accessibility Baseline

Status: accepted

The approved accessibility baseline for Project F, aligned to WCAG 2.1 **Level AA**. It is a design document only. It defines the acceptance criteria the Design System and every implemented UI must satisfy, and how they are verified (axe inside the minimal Playwright suite, ADR-0005).

## 1. Scope

The baseline applies to all public surfaces:

- Visitor-reading pages (home, boards, threads, profiles, sheets) — must be fully operable without JavaScript where the page serves server-side (Astro SSR); islands enhance, never gate, reading.
- Islands (editor, real-time navbar, character switcher, shop, complex forms) — must keep keyboard + SR operability.
- Admin dashboard.

Non-goals (tracked elsewhere): ban/antispam flows are product logic, not a11y; localization is out of current scope (English-first product per AGENTS.md rule 1).

## 2. Color & contrast

| Requirement | Value |
| --- | --- |
| Text / UI foreground vs. background | ≥ **4.5:1** for normal text, graph & UI components; ≥ 3:1 for large text (≥ 24px / 18.5px bold) |
| Focus indicator | `--ring`, ≥ 2px, offset by 2px; contrast vs. adjacent ≥ 3:1 |
| Non-text contrast (borders, icons, input outlines) | ≥ 3:1 where the affordance carries meaning |

- Every token pair in `tokens.md` §2–4 must pass the ratio above; the pairs are fixed system values, not author-decided at runtime.
- **Web master overrides** (Identity layer, `tokens.md` §1) are contrast-constrained: the settings UI rejects accent/cover picks whose `--primary`-on-surface or text-on-cover ratio drops below 4.5:1 (flow 17).
- Color is never the only signal: every status also carries an icon, a word, or shape (e.g., IC/OOC tag is a colored pill **with a two-letter label**; destructive row: avatar mark + text).
- Borders on dark surfaces are brighter than on light (`tokens.md` §3) to keep 3:1 on chrome.

## 3. Focus & keyboard

- Visible `:focus-visible` ring on all interactive elements; `:focus` (pointer) does not render the ring, but the element keeps a non-decorative focus state.
- **Skip-to-content** link as the first focusable element on every page → `#main`.
- Landmarks: `header`, `nav`, `main`, `footer`, and `aside` used semantically; exactly one `main` per page.
- Heading hierarchy starts at `h1` once per page (home hero is `h1`; board/thread titles are `h1`; section headers `h2`…).
- Kobalte-driven overlays guarantee: focus trap in dialogs/sheets/alert-dialogs, `Esc` to close, focus returns to the trigger, `aria-labelledby` on the overlay content, `aria-describedby` for the message where it clarifies (AlertDialog).
- Roving tabindex where the primitive supplies it (tablist, menu, radio group); manual `Tab` moves on within real tabs only.
- Region-based scroll: long tables/databases remain usable with a keyboard (row linking, pagination accessible).

## 4. Non-interactive & dynamic content

- **Images**: `alt` describes meaning; decorative images `alt=""`. Avatars always carry the character name; avatars rendered purely decoratively (e.g., in a quote) get `alt=""`.
- **Toasts / notifications**: rendered to an `aria-live=polite` region (default) and `assertive` only for truly blocking failures; announce changes without stealing focus.
- **Real-time notification counts**: announced on change (polite), not as an alert.
- **Loading skeletons** have `aria-hidden`; an `aria-progress` (e.g., `aria-busy` on the container) conveys the pending state to assistive tech — never "Please wait" text alone.
- **Optimistic updates** in islands reconcile the DOM announced state or benignly do nothing visible; failure toasts are polite.

## 5. Forms

- Every control has a visible `<Label>`; the label's `for`/`htmlFor` matches the control.
- Required, error, and hint are associated: helper text + error share `aria-describedby`; the control sets `aria-invalid="true"` when the Zod validation fails (shared `packages/validation`).
- Errors are announced (same `aria-describedby` region, `aria-live=polite`) and remain inline under the field — values persist on network failure (UX README).
- Input mode hints for virtual keyboards (e.g., `inputmode` on email/tel where relevant), `autocomplete` attributes on auth/account forms.
- Character counters (content limits, flow 07) are programmatically tied to the field (live counter), not decorative.

## 6. Meaning conveyed by visual only

- Badges/status chips: pair with `sr-only` text when the badge is the only indicator (e.g., "Inactive account", "Account unconfirmed", threaded "pinned").
- IC/OOC tag, pin, read/unread: text label always present (bell badges may be numeric `aria-label="3 unread notifications"`).
- Icons used as the sole control (kebab, bell, close) have `aria-label` + `type=button`.

## 7. Motion & reduced motion

- `prefers-reduced-motion: reduce` → disable cross-page View Transitions (transitions become instant) and all micro-interactions (hover presses, drawer slides, toast slides use opacity-only at 0). `.astro` transitions respect the media query by default in the Astro implementation; the Design System must not re-enable animation.
- Motion tokens are only opacity/transform (`layout.md` §6); no parallax/scroll-jacking effects.

## 8. Touch & pointer

- Targets ≥ **44×44 CSS px** at `sm` and below; larger where practical (navbar buttons, pagination).
- No hover-only affordances: menus/actions reachable by tap first (the drawer and dropdown are `click`-opened).
- Text resizing up to **200%** without loss of content or function; containers are fluid (`layout.md` §3); tables collapse rather than clip (WCAG 1.4.4).

## 9. Verification

- CI runs axe-core checks on the key flows (home, a board, a thread, login/register, admin, a dialog, the ban interstitial) in the minimal Playwright suite (ADR-0005).
- Manual checks: keyboard sweep (Tab order logical, no traps), SR spot-checks (NVDA + macOS VoiceOver) for navbar, dialog, sounds (toast), and the notification dropdown.
- Any new component lands with its accessible name, role, keyboard expectations and token-contrast pairing documented in `components.md` §16.

## 10. Failure handling

- 403 / 404 / 500 errors are not decorative pages — they carry the failure reason in plain language and are keyboard/SR-clean (`components.md` §15).
- The ban interstitial is a full-page shutter with the reason, an appeal action, and functioning focus management (page is intentionally the only surface).
