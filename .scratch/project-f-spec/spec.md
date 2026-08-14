# Project F — Consolidated Product Specification

Status: accepted (consolidation of approved decisions only; adds no new requirements)

## Problem Statement

Building an online roleplay forum today means starting from generic forum software (phpBB, MyBB, Forumotion) and stitching together third-party mods and plugins for the things roleplay communities actually need: a configurable virtual economy, an integrated item shop, character sheets, and character-scoped identity. The web master owns the deployment, but the tooling never fits the activity.

## Solution

Project F is a deployable web application for building customizable online roleplay forums from the ground up. A web master clones the repository and deploys it to their own Cloudflare account — one deployment, one forum tenant (ADR-0003), domain-agnostic, launched on Cloudflare's default subdomain and optionally pointed at a web master–owned domain later (story 82). The web master configures the forum from an admin dashboard: identity (name, domain, cover images, colors), categories, forums, currency, shop items, sheet fields, permissions, and more (flow 17). Roleplay is first-class: content, currency, and inventory belong to the character, not the account (ADR-0001), so members can play up to two independent personas with fully separate economies.

## Users (actors)

- **Visitor** — a person browsing without an account; reads the whole forum by default; the web master may hide categories, forums, or public profiles from them (stories 28, 61).
- **Member** — a registered participant; identified by their account (email + password); confirmed (and approved when the registration mode requires it).
- **Character** — the fictional persona; the scope owner of threads, posts, profile, currency, and inventory; members hold up to two.
- **Staff** — Moderator, Administrator, Web master.
- **Web master** — the unique rank (invariant 13); the only actor that changes forum configuration and promotes staff (story 62).

## Domain

**Entities** (authoritative in `docs/domain-model.md`): Member (aggregate root; identity facet), Character (scope owner; 0..2 per member), Board (Category/Forum/Subforum — one entity, depth ≤ 1), Thread, Post, CharacterSheet, SheetTemplate, SheetEvaluation, Item, InventoryEntry, BagEntry, Transaction, EarnRule, Ban, Appeal, Notification, ModerationAction, ForumConfiguration (single instance).

**States**: `Member.confirmation` unconfirmed→confirmed; `status` active⇄inactive; `approval` pending→approved|rejected (approval mode); `Character.status` active→deleted (soft tombstone, D3); `Thread.state` open→closed→archived→soft-deleted with pinning as an orthogonal flag; `InventoryEntry` owned→sold|refunded; `Ban` active→appealed→approved|rejected / revoked|expired; `Appeal` open→approved|rejected.

**Relationships and value objects**: as recorded in `docs/domain-model.md` §3–§4 (CharacterName, Username, Email, CurrencyAmount, DateRange, ModerationScope, StockModel, QuickLogin, etc.).

## Business Rules

From `docs/domain-model.md` §7–§8: max 2 characters per member; usernames unique per forum (one-time rename); threads always belong to a board; sheet required to post in IC forums, OOC requires only the character account; every staff moderation action recorded with actor and timestamp and shown on the thread; closing blocks replies (staff reopens); archiving is permanent and read-only (only an Administrator unarchives); soft delete moves content to the Archive forum for a web master–configured window (0–30 days) then stops being shown; currency and inventory are scoped per character; items are permanent once bought; refunds only within 24 hours, refunding a limited-stock item restores stock globally; sell-back returns a fraction of the price; stock models infinite/limited/unique; earn rules (per thread, per post, per-character login streak, interest, birthday) are web master–configurable; currency already granted is never clawed back; bans are a measure of last resort by any staff, target email or IP, reason mandatory and visible, permanent or dated, staff-target bans require a third Administrator's arbitration; banned members can appeal, resolved by an Administrator; account lifecycle (open/approval registration, 15-min confirmation link, ≤2 resends/hour, global email/password changes, inactive keeps data, deletion unlinks names); visitors read by default with web master–controllable hiding; per-forum content limits and image policy; AI sheet evaluation only when enabled with the web master's own API key (ADR-0002).

Invariants 1–14 of `docs/domain-model.md` §8 are authoritative.

## User Stories

Reproduced verbatim from the accepted `.scratch/initial-product-definition/spec.md` (stories 1–83). No stories added or removed.

### Accounts and registration

1. As a visitor, I want to register with my email and password, so that I can join the forum.
2. As a new member, I want to confirm my account through an emailed link, so that my account is verified before I interact.
3. As a new member with an unconfirmed account, I want a reminder banner with a resend option, so that I can complete my confirmation.
4. As a member, I want my confirmation link to expire after 15 minutes and allow up to 2 resends per hour, so that the flow stays safe and simple.
5. As a web master, I want to choose between open registration and approval-required registration, so that I control who joins my community.
6. As an administrator, I want to approve or reject pending registrations, so that I can gate the community when required.
7. As a member, I want to log in with my email and password, so that I can enter my account.
8. As a member, I want to choose which of my characters to enter as after logging in, so that I start the session as the right persona.
9. As a member, I want to reset my password through an emailed link, so that I can recover access.
10. As a member, I want to change my email through an emailed link, so that my credentials stay current.
11. As a member, I want my email and password changes to apply to the whole account, so that all my characters benefit on next login.
12. As a member, I want to set my account as inactive, so that I can step away while keeping all my data.
13. As a member, I want my inactive account to show an "inactive" notice on my profile and block posting, so that the community knows I am away.
14. As a member, I want to reactivate my inactive account, so that I can participate again.
15. As a member, I want to delete my account, so that I can leave the forum; my posts remain visible with an unlinked name.

### Characters

16. As a confirmed member, I want to create my first character by giving it a name, so that I can start interacting.
17. As a member, I want character names to allow spaces and special characters and not require uniqueness, so that I am free in naming.
18. As a member, I want my character to receive a random username that I can replace once with a custom one, so that I get a unique identity in mentions, searches, and URLs.
19. As a member, I want to create a second character, so that I can play another persona.
20. As a member, I want to delete a character to free a slot, so that I can eventually create a third.
21. As a member, I want my characters to have fully separate threads, posts, profiles, currency, and inventory, so that each persona is independent.
22. As a member, I want to add any of my characters to quick login, so that I can enter the forum faster.
23. As a member, I want to log in via quick login by selecting a character and entering my account password, so that I land directly in character.
24. As a member, I want to switch between my characters in real time, so that I can roleplay different personas without logging out.
25. As a member, I want to upload my character's avatar and banner from my device or an external URL, so that my character looks unique.
26. As a member, I want a public character profile showing my name, avatar, banner, currency, inventory, bag, recent threads and replies, registration date, and last connection, so that the community can see my activity.
27. As a member, I want to confirm the account is not banned when using quick login, so that bans cannot be bypassed.

### Content and roleplay

28. As a visitor, I want to read the forum without an account, so that I can decide whether to join; the web master may hide sections from me.
29. As a character, I want to navigate categories, forums, and subforums, so that I can find my places.
30. As a character, I want to create threads inside forums and subforums only, so that content stays organized.
31. As a character, I want to post in threads, so that I can roleplay and discuss.
32. As a character, I want to mark my threads as IC or OOC and edit the tag, so that readers know the register; staff can edit it too.
33. As a character, I want to pin a thread I created, so that it stands out; moderators can pin any thread.
34. As a character, I want to write posts with BBCode and Markdown, images, mentions, spoilers, quotes, multi-quotes, emojis, stickers, and GIFs in a WYSIWYG editor, so that I can express myself richly.
35. As a character, I want to mention other characters by username, so that they get a notification.
36. As a character, I want to create my character sheet through an enabled template, so that I can post in in-character forums.
37. As a character, I want to post in out-of-character categories with only my character account (no sheet), so that OOC talk stays easy.
38. As a character, I want my sheet evaluated by AI when the forum enables it, so that my story fits the forum's lore and the web master's criteria.
39. As a visitor or member, I want to view any character sheet, so that I can read character stories.

### Economy and shop

40. As a character, I want to earn virtual currency according to the rules the web master configures, so that I can build wealth in character.
41. As a character, I want to earn currency per thread created and per post sent, so that participation pays.
42. As a character, I want to earn currency through a login streak, so that consistency pays; streaks are measured per character.
43. As a character, I want to earn interest on a configured day of the month, so that my savings grow.
44. As a character, I want to receive a birthday reward, so that the forum celebrates me; the birth-date field exists only when this rule is enabled.
45. As a character, I want to browse the shop and buy items with my own currency, so that I can customize my persona.
46. As a character, I want to put owned items into my bag, so that they appear as icons with quantity on my posts.
47. As a character, I want to sell owned items back at a fraction of the purchase price, so that I can recover currency.
48. As a character, I want to refund a purchase within 24 hours, so that I can undo a mistake.
49. As a web master, I want to configure prices, stock (infinite, limited, or unique), and per-character unique purchases, so that the shop economy fits my community.
50. As a web master, I want to configure earn rules and currency settings, so that the economy works as my community expects.

### Moderation and administration

51. As a moderator, I want to edit, close, open, archive, delete, pin, and move threads within my moderation scope, so that I can keep order.
52. As a moderator, I want every moderation action to be recorded and shown on the thread ("edited/closed/... by X on date"), so that there is accountability.
53. As a moderator, I want to edit a character's currency and inventory from their public profile when granted, so that I can help resolve incidents.
54. As a moderator, I want to ban, so that I can respond to emergencies.
55. As a web master, I want to choose each moderator's moderation scope at promotion, so that moderators act only where I trust them.
56. As an administrator, I want to create categories and forums, so that I can shape the structure.
57. As an administrator, I want to unarchive a thread, so that I can restore content to the main forum.
58. As an administrator, I want to view the staff action log, the general forum log, and the economy log, so that I can audit the forum.
59. As a web master, I want to configure forum permissions per rank, so that I control who reads and writes where.
60. As a web master, I want to set per-forum content limits (minimum/maximum post length, image policy, who may post images), so that posts stay consistent.
61. As a web master, I want to hide categories, forums, or public profiles from visitors, so that parts of the forum stay private.
62. As a web master, I want to promote members to moderator or administrator and set their scope, so that I can grow staff; only I can promote staff.
63. As a web master, I want total control of the forum configuration, so that the forum reflects my community.

### Thread lifecycle

64. As a character, I want a closed thread to stay readable but not accept replies, so that old discussions stay intact.
65. As staff, I want to reopen a closed thread, so that a discussion can resume when appropriate.
66. As a character, I want archived threads to be read-only in the archive forum, so that the story stays available.
67. As a web master, I want deleted content to go to the archive forum for a configured window (0–30 days) and then stop being shown, so that removal is reversible without losing history.
68. As a moderator, I want deleted threads to keep their posts visible in the archive for the configured window, so that context survives moderation.

### Bans and appeals

69. As staff, I want to ban by registered email or by IP with a mandatory reason, so that I can act on emergencies.
70. As staff, I want to set a permanent or dated ban, so that the punishment fits the case.
71. As a banned member, I want to see the ban notice with the reason, so that I understand why I was banned.
72. As a banned member, I want to appeal and track my appeal, so that I can ask for reconsideration.
73. As an administrator, I want to approve or reject appeals from the admin dashboard, so that bans stay fair.
74. As staff, I want a ban against another staff member to require a third administrator's approval, so that staff conflicts are checked.
75. As staff, I want an IP ban to block the whole IP, including visitors, so that evasion is harder.

### Notifications, search, and configuration

76. As a member, I want a real-time notification icon in the navbar, so that I know about events instantly.
77. As a member, I want to choose which notification types I receive, so that I am not flooded.
78. As a member, I want notifications for replies to my threads, replies in threads I participate in, replies to my posts, mentions, resolved appeals, and birthday or interest currency, so that I stay informed.
79. As a member, I want a global search over threads, posts, and characters, so that I can find content.
80. As a member, I want to search within a thread, so that I can locate a specific reply.
81. As a web master, I want to configure the forum's identity (name, domain, cover images, colors), so that the forum matches my brand.
82. As a web master, I want to go live on Cloudflare's default subdomain and point my own domain later, so that I can launch before buying a domain.
83. As a web master, I want to define the character sheet data fields and enable the sheet templates I offer, so that sheets capture what my community needs.

## UX

Accepted flows in `docs/ux/` 01–09 and 11–18 (registration, login, character creation, profile configuration, quick login, character switching, admin dashboard, thread creation, reply, virtual economy, item shop, homepage, categories and forums, staff permissions, avatar and banner, web master configuration, project configuration). Global conventions: inline Zod validation with `packages/validation`; silent permission failures (sections a member cannot read are not shown, no 403 for boards); the admin dashboard and configuration routes return a hard 403; network/server failures surface as a non-blocking toast with form values preserved; every staff moderation action is logged and shown on the thread; global navbar with session-dependent rendering; global states (session, session without character, unconfirmed, pending approval, inactive, banned, character deleted).

Flow 10 (member directory) and route `/members` are **proposed, not accepted** — excluded.

## Routes

The accepted route map in `docs/routes.md`: `/`, `/login`, `/register`, `/register/confirm`, `/forgot-password`, `/reset-password`, `/banned`, `/characters/new`, `/account`, `/member/<username>`, `/sheet/<characterId>` and `/sheet/<characterId>/edit`, `/boards/<catId>[/<forumId>[/<subId>]]`, `/thread/<id>`, `/new-thread/<boardId>`, `/economy`, `/shop`, `/shop/item/<id>`, `/inventory`, `/admin`, `/admin/settings`. Non-route interactions (character switcher, avatar/banner in `/account` or own profile, inline content moderation, emailed-link confirmations) have no dedicated route. The ban interstitial applies to every route when the email or IP is banned; `/banned` is its explicit representation.

## Design System

Approved `docs/design-system/`: clean, flat, modern, minimalist. Core + Identity token layers (Identity overrides are contrast-constrained in the picker); OKLCH color with light and dark schemes; Inter self-hosted via the Astro asset pipeline; quarter-rem spacing scale; restrained radius; hairline borders with shadows reserved for floating layers; floating glass navbar (z-40); full-width home hero banner; View Transitions (GPU-only opacity/transform, reduced-motion safe); WCAG 2.1 AA baseline (contrast ≥ 4.5:1, visible focus rings, skip-to-content, landmark structure, `aria-live` regions, `aria-describedby` form errors, sr-only companions for color-only signals, 44×44 px touch targets, 200% text resize, no horizontal scroll); components use only design tokens — no hardcoded values. Scheme toggled by a `.dark` class honoring `prefers-color-scheme`, pinnable per deployment by the web master.

## Atomic Design

Canonical catalog in `docs/design-system/component-architecture.md`. Atoms: Avatar, Currency, RankTag, Tag, StatusChip, UserLink, PostMeta, Icon. Molecules: SearchField, BalancePill, BreadcrumbStrip, StatusBanner, InlineError, CharacterCounter, ThreadRow, BoardRow, PostProfile, PostContent, QuoteBlock, TransactionRow, ShopItemCard, InventoryRow/BagItemRow, PaginationControls, NotificationItem, EmptyState. Organisms: FloatingNavbar, NotificationCenter, CharacterSwitcher, AvatarMenu, ForumHero, ForumStats, RecentActivity, BoardStructure, ThreadList, PostCard, PostComposer, NewThreadForm, LoginForm, RegisterForm, ResetRequestForm, ResetPasswordForm, CharacterCreationForm, AccountTabs, CharacterSheetEditor, SheetViewer, ShopCatalog, ItemDetailDialog, InventoryPanel, EconomyLedger, ProfileHeader, GlobalSearch, AdminShell, AdminPanel, DataTable, PermissionsMatrix, ModerationInline, BanInterstitial. Templates: Base, Home, Board, Thread, Auth, Account, Admin, Profile, Catalog, Sheet/SheetEdit, StaticMessage, Skeleton. Pages map to the accepted routes (§7). Rules: SSR by default, islands only where interactivity earns hydration; no artificial components (Kobalte/shadcn-solid consumed directly, never wrapped); variants over ad-hoc props; A11y ships with each component; routes are the source of pages.

The `MemberDirectory`/`CharacterCard` organisms and `DirectoryTemplate` are **proposed (member directory), not accepted** — excluded. `PostComposer`, `NewThreadForm`, `CharacterSheetEditor`, `MemberDirectory` and `PostCard` are the only components with any reference to the proposed flow 10 — all other catalog entries are in scope.

## Architecture

Approved in `docs/architecture.md` + ADR-0005/0006. pnpm monorepo: `apps/web` (Astro SSR + SolidJS islands, the deployment unit), `apps/api` (Hono, consumed by web as a library), `packages/validation` (Zod shared FE/BE). One Worker per deployment; the entrypoint wraps the Astro SSR handler with Hono (`/api/*` and `/realtime` → API; everything else → Astro). One deep module per domain aggregate: configuration, identity, characters, boards, content, economy, moderation, sheets, notifications. Modules communicate by direct typed calls wired in the composition root; no event bus. Every frontend call — browser or server-rendered — crosses the same HTTP seam through the type-safe `hc` client. Persistence: Turso (libSQL) over HTTP via Drizzle, schema and migrations owned by `apps/api/src/db`; FTS5 for search; R2 for user images; Durable Object hub for real-time; Cron triggers (interest monthly, birthday daily, soft-delete expiry daily) call the same module functions as HTTP routes; Resend adapter for transactional email. Economy write atomicity validated as a spike (ticket 01); the single-writer Durable Object is the fallback.

## API

Accepted `docs/api.md`. Conventions: base `/api/*`, JSON bodies/responses (`multipart/form-data` for uploads), contract consumed via `hc`; `pf_session` cookie (HttpOnly, Secure, SameSite=Lax) with `X-CSRF-Token` on unsafe methods; ban hook on every request (IP always, email when authenticated) → 403 `banned`; account gates → 403 (`unconfirmed`, `pending_approval`, `rejected`, `inactive`); policy-as-data authorization (`canRead`, `canWrite`, `canModerate`); writes act on the session's active character; Zod validation (`@hono/zod-validator`) → 400 `fieldErrors`; status codes (200/201/202/204/400/401/403/404/409/413/422/429); error envelope `{ error: { code, message, fieldErrors?, details? } }`; offset pagination `?page=&pageSize=` (default 20, max 100), thread listings by `lastPostAt` desc with pinned first; ULIDs as TEXT ids; integer epoch-ms timestamps UTC; lowercase enums; usernames `[a-zA-Z0-9_-]{3,30}` stored lowercase.

Endpoint groups per module: identity (§3.1 auth + account + admin members), characters (§3.2), boards (§3.3), content (§3.4 threads/posts/moderation), sheets (§3.5), economy & shop (§3.6), moderation/bans & appeals (§3.7), notifications (§3.8), configuration (§3.9), search & uploads (§3.10). Real-time `WS /realtime` to the Durable Object hub is outside the REST surface. Cron jobs, emailed-link landings, and editor feature enrichment are deliberately not REST endpoints.

Accepted decision §5.2: profile visibility — hideable public profiles return 404 to visitors; the `forum_configuration.hidden_profiles_from_visitors` boolean is a documented structural change requiring a migration (no such column exists in the current accepted schema). Accepted decisions §5.1–§5.6 (pagination, profile visibility, moderator economy scope, username charset, error style, admin economy/shop ownership) are authoritative.

## Database

Accepted `docs/persistence-model.md`. Conventions: TEXT ULID primary keys; integer unix epoch-ms timestamps UTC (`created_at`/`updated_at` unless a domain timestamp replaces them); booleans `INTEGER` with `CHECK (x IN (0, 1))`; enums `TEXT` with `CHECK`; currency `INTEGER` whole units (interest/sell-fraction floored by the economy module, D1); JSON payloads `TEXT` validated by Zod with a single owning module; emails and usernames stored lowercase normalized; `snake_case`, singular table names. Tables by module (§3.1–§3.10): configuration → `forum_configuration` (singleton); identity → `members`, `sessions`, `email_tokens`, `moderation_scope_boards`; characters → `characters`, `quick_logins`; boards → `boards`, `board_permissions`; content → `threads`, `posts` (+ FTS5); economy → `items`, `inventory_entries`, `transactions`, `earn_rules`; sheets → `sheet_templates`, `character_sheets`; moderation → `bans`, `appeals`, `moderation_actions`; notifications → `notifications`, `notification_preferences`. FTS5 standalone tables (`threads_search`, `posts_search`, `characters_search`) with triggers. Delete behaviour (CASCADE / SET NULL / RESTRICT, soft tombstones, D3 character, D7 hidden-by-filter soft-deleted threads). Decisions D1–D13 are authoritative. The schema is the target of the initial Drizzle migration; every later structural change is a migration (AGENTS.md rule 26).

Note: the persistence model documents the full target schema. Implementation proceeds incrementally as vertical slices: each feature ticket introduces its own tables, columns, and indexes through its own migration, converging on the accepted schema.

## Authentication & Authorization

Authentication: custom sessions — Argon2id password hashes, DB-backed sessions (`pf_session` cookie), HttpOnly/Secure/SameSite, CSRF tokens; email-token flows (account confirmation: 15-min expiry, ≤2 resends/hour; password reset; email change — all single-use, expiring, no-account-enumeration, effective at next login); quick login validates the account email is not banned; the ban hook (`isBanned(email, ip)`) runs on every authenticated request.

Authorization: policy-as-data evaluated by a small permission module — `canRead(board, actor)`, `canWrite(board, actor)`, `canModerate(scope, target, actor)`. Rank ladder webmaster > administrator > moderator > user. Per-board read/write permissions per rank; per-moderator moderation scope decided at promotion (including `canEditEconomy`); visitor-visibility flags; configuration routes require the unique Web master rank. Admin dashboard and configuration routes return a hard 403 on denial; non-readable sections are silently absent.

## Testing Decisions

The single testing seam is fixed by ADR-0005/0006: the Hono HTTP boundary, exercised with Vitest and `app.request()` against a local libSQL database — registration flows, economy transactions, thread state transitions, moderation permissions, and the ban/appeal lifecycle. Tests exercise external behavior only, never implementation details. A minimal Playwright suite covers UI flows, including axe-core checks on key flows (home, a board, a thread, login/register, admin, a dialog, the ban interstitial). A feature is not finished until tests, typecheck, lint, and build pass (AGENTS.md rule 28). No codebase exists yet, so there is no prior art; the accepted implementation tickets (`.scratch/initial-product-definition/issues/`, tickets 01–59) are the source of integration use cases.

## Non-Functional Requirements

Synthesized from accepted decisions:

- **Performance** — SSR-first rendering with islands only where interactivity earns its cost; GPU-only motion (opacity/transform); no layout shift (reserved navbar height, `font-display: swap` with preloaded Inter); fluid containers; self-hosted fonts; edge runtime via Workers.
- **Accessibility** — WCAG 2.1 Level AA baseline throughout (`docs/design-system/accessibility.md`), verified by axe in the Playwright suite plus manual keyboard/SR sweeps.
- **Security** — Argon2id password hashing; DB-backed sessions with HttpOnly/Secure/SameSite cookies and CSRF protection; ban-by-email/IP on every request; AI API key stored encrypted, never plaintext, write-only (ADR-0002); post HTML sanitized server-side at write time (D6); no-account-enumeration on resend/forgot-password (204 always); mandatory ban reasons; single-use expiring tokens.
- **Deployability** — single-tenant, domain-agnostic; `wrangler deploy` to the web master's own Cloudflare account; per-deployment secrets (Turso URL/token, Resend key, AI key); one external Turso account per deployment (accepted in ADR-0005).
- **Responsiveness** — mobile-first; no horizontal scroll at any width; touch targets ≥ 44×44 CSS px at `sm` and below; text resizing to 200% without loss.
- **Maintainability** — pnpm monorepo, TypeScript strict across the repo, one deep module per aggregate, single testing seam, Conventional Commits, ADRs; no anti-pattern (no event bus, no UI packages).
- **Localization** — English-first product (AGENTS.md rule 1); localization out of scope.

## Out of Scope

Anti-spam, rate limiting, and captcha (deferred to future iterations); multi-tenant SaaS hosting or centralized infrastructure (ADR-0003); mods/plugins marketplace; real-money payments (currency is virtual only); native mobile applications; email delivery infrastructure and image hosting choices (implementation details of the stack decision); the public member directory (`.scratch/member-directory/`, flow 10, route `/members` — proposed, not accepted).

## Further Notes

Canonical glossary: `CONTEXT.md`. Consolidated model: `docs/domain-model.md`. Decisions: `docs/adr/0001-0006`. Architecture: `docs/architecture.md`. Persistence: `docs/persistence-model.md`. API: `docs/api.md`. Design System: `docs/design-system/`. UX flows: `docs/ux/`. Route map: `docs/routes.md`. Implementation tickets: `.scratch/project-f-spec/issues/` (this spec's ticket set).

Modeling resolutions to keep: Member and Account are one entity; Forum and Subforum are one entity at different nesting depths (invariant: depth ≤ 1); the five previously open points are resolved in `docs/domain-model.md` §10 (birthday field only when the rule is enabled, login streaks per character, no-clawback economy, inactive account breadth, quick login max two one per character).
