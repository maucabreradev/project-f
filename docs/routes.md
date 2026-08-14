# Project F — Route Map

Status: accepted

The design-level route map, derived from the approved UX flows (`docs/ux/`). It defines each route's purpose, authorized actors, required data, actions, and states — no routes are implemented here. Final file routing in the Astro app mirrors this map, per the application architecture (Astro file routes mirroring the forum structure).

- `<username>` is unique per forum; `<id>`, `<boardId>`, and `<characterId>` are ids for uniqueness (character names are not unique, and board names are not guaranteed unique).
- Board routes mirror the forum structure (category → forum → subforum, depth ≤ 1) with a hierarchy breadcrumb.
- The ban interstitial applies to every route when the email or IP is banned; `/banned` is its explicit representation with the appeal option.

## Global and forum identity

| Route | Purpose | Authorized actors | Required data | Actions | States |
| --- | --- | --- | --- | --- | --- |
| `/` | Home: forum identity, board structure, recent activity, stats | All (visitor and member) | Identity configuration (name, cover, colors), visible boards, recent threads/posts, stats, active session | Navigate to boards/threads/shop/admin; login/register; search; session state (`/members` is proposed — row below) | Visitor vs. member rendering; `unconfirmed`/`inactive` banners; global ban interstitial (replaces the page) |

## Identity

| Route | Purpose | Authorized actors | Required data | Actions | States |
| --- | --- | --- | --- | --- | --- |
| `/login` | Sign in with email + password; includes quick login and the post-login character picker | Visitor | Credentials; quick login entries (max 2, one per character); the member's characters | Login; quick login (account password + ban check); choose character (1 → direct, 2 → picker, 0 → forced creation); reset/register links | Session active/inactive; `unconfirmed`/`pending`/`rejected`/`inactive`; `banned` (email/IP) → ban notice |
| `/register` | Account sign-up (email + password) | Visitor | Email, password + confirmation; registration mode (open/approval) | Create account; "check your inbox" screen; resend confirmation | `unconfirmed`; `pending → approved \| rejected`; **bootstrap** (first registration = Web master, auto-approved) |
| `/register/confirm` | Landing for the emailed confirmation link | Visitor with token | Confirmation token | Confirm the account; resend (expires 15 min, max 2/hour) | `unconfirmed → confirmed`; `expired`; `resend limit reached` |
| `/forgot-password` | Password reset request | Visitor | Email | Send the reset email | `sent`/accepted (does not reveal whether the account exists) |
| `/reset-password` | New password form | Visitor with token | Token + new password | Reset password (global to the account) | Success; `invalid/expired token` |
| `/banned` | Ban notice with the mandatory reason and an appeal option | Banned member (email/IP) | Ban (mandatory reason, duration, target), appeal status | View the reason; submit an appeal | `active \| appealed \| revoked \| expired`; appeal `open → approved \| rejected` |

## Characters

| Route | Purpose | Authorized actors | Required data | Actions | States |
| --- | --- | --- | --- | --- | --- |
| `/characters/new` | Character creation | Confirmed member (max 2) | Free slots; name; username (random + one-time custom rename); optional avatar/banner; sheet | Create character (name, custom username validated for uniqueness); skip/create sheet | 0–2 characters (invariant); at the limit "delete to free a slot"; `active → deleted` |
| `/account` | Profile configuration (Account + Character tabs) | Member | Email/password, status, notification preferences, quick logins; characters (name, username, avatar/banner), sheet | Change email (confirmed link, applies on next login); password; active/inactive; notification preferences; manage quick logins; delete account (confirmation); edit name; one-time username rename; avatar/banner; link to sheet | Account `active ⇄ inactive`; `unconfirmed`; rename used/available; session/CSRF |

## Profiles and community

| Route | Purpose | Authorized actors | Required data | Actions | States |
| --- | --- | --- | --- | --- | --- |
| `/member/<username>` | Public character profile | All (hideable from visitors) | Character (name, avatar, banner, balance, inventory, bag, recent threads and replies, registeredAt, lastSeen), character owner's account status | View profile/sheet/inventory; character owner: edit avatar/banner, rename username; staff: adjust balance/inventory (when in scope), moderate | `active`; `deleted` (not visible); `inactive` badge; `hiddenFromVisitors` → 404/absent |
| `/members` | Public character directory (**proposed, not in the accepted spec**) | All (hideable from visitors) | Active characters (avatar, name, username, lastSeen), FTS search, pagination | Search by name/username; filter/sort; paginate; open the profile | `active` listed; `deleted` excluded; `inactive` badge; hidden → 404 for visitors |

## Character sheets

| Route | Purpose | Authorized actors | Required data | Actions | States |
| --- | --- | --- | --- | --- | --- |
| `/sheet/<characterId>` | Character sheet (public once created) | All | Sheet data (web master–defined fields), template, AI evaluation (when enabled) | View; owner: create/edit | Not created; created and public; evaluation `pending → ok/fail` (when enabled) |
| `/sheet/<characterId>/edit` | Create/edit the sheet | Character owner | Web master–defined fields, enabled templates, AI toggle + key | Fill fields; choose template; save; submit for evaluation | Draft vs. published; evaluation (ADR-0002, opt-in) |

## Boards and content

| Route | Purpose | Authorized actors | Required data | Actions | States |
| --- | --- | --- | --- | --- | --- |
| `/boards/<catId>` | Category: list of forums | Read permission (visitor unless hidden) | Category, forums with stats (threads/posts, last post) | Navigate to forums; breadcrumb | `hiddenFromVisitors` → invisible/404 |
| `/boards/<catId>/<forumId>` | Forum: subforums + threads | Read permission (+ write to create) | Forum, subforums, threads (title, IC/OOC tag, pin, author, last reply), content limits, per-rank permissions | View threads; new thread (write); inline moderation (staff in scope) | Threads `open/closed/archived/soft-deleted` (hidden), `pinned`; archive read-only |
| `/boards/<catId>/<forumId>/<subId>` | Subforum: threads only (depth 1) | Read permission (+ write) | Same as forum, without subforums | Same as forum | Same as forum |
| `/thread/<id>` | Thread with posts | Read permission | Thread, posts (post profile with bag), state, moderation history, sheet (on IC), content limits | Reply (write + sheet on IC); quote/multi-quote; tag/pin (creator/staff); close/open/archive/pin/move (staff in scope) | `open/closed/archived/soft-deleted` inherited by posts; `IC/OOC` tag |
| `/new-thread/<boardId>` | Thread creation | Write permission, sheet on IC boards | Board, sheet (when IC), content limits, tag | Create thread (title, tag, WYSIWYG content); per-thread earn | `open`; blocked without a sheet on IC boards; limits validated |

## Economy and shop

| Route | Purpose | Authorized actors | Required data | Actions | States |
| --- | --- | --- | --- | --- | --- |
| `/economy` | Active character's balance + ledger | Member (per character) | Balance, transactions (earn/purchase/sale/refund/adjust with reason and actor), active earn rules | View balance/ledger/rules; navigate to the shop | Rules on/off; per-character streak; birth-date field only when the birthday rule is active; no clawback of earned currency |
| `/shop` | Shop catalog | Member (per character) | Items (icon, price, stock model), balance | View/filter catalog; open item detail | Stock `infinite/limited/unique`; `uniquePurchase` |
| `/shop/item/<id>` | Item detail + purchase | Member (per character) | Item (price, remaining stock, rules), balance | Buy (confirmation, debits balance → InventoryEntry) | Available/out of stock/already bought; cosmetic applicable to the profile |
| `/inventory` | Inventory and bag | Member (per character) | InventoryEntry (item, quantity, kind), bag, balance | Equip/unequip bag; sell back (fraction of price); refund (24 h, restores stock globally); apply cosmetics | `owned → sold \| refunded`; bag subset; refund window passed/available |

## Administration

| Route | Purpose | Authorized actors | Required data | Actions | States |
| --- | --- | --- | --- | --- | --- |
| `/admin` | Dashboard tabs: Overview, Members, Boards, Economy, Shop, Sheets, Bans & Appeals, Logs | Administrator + Web master (tabs filtered by rank; Moderator absent) | Stats, pending queues (registrations to approve, appeals), members, boards/permissions/visibility/limits, balances, catalog, sheet configuration, bans, logs | Approve/reject registrations; ban (with arbitration when targeting staff); resolve appeals; create/edit/reorder boards; adjust balance/inventory (mandatory reason); manage catalog; define sheet fields/templates; view logs; unarchive | Rank-scoped (hard 403 when insufficient); arbitration `pending → approved \| rejected`; every action logged |
| `/admin/settings` | Full forum configuration (tabs: identity, registration, economy, shop, sheets+AI, archive, default permissions) | **Web master only** | Full `ForumConfiguration`, AI API key (ADR-0002) | Update identity/registration mode/earn rules/shop/sheet fields/soft-delete window/default permissions | Single instance; changes effective immediately; toggles that reveal fields (e.g., birthday rule adds the birth-date field) |

## Non-route interactions

The following have no dedicated route, consistent with `docs/ux/`:

- **Character switching** — the navbar switcher island (no route change).
- **Avatar and banner** — managed inside `/account` (Character tab) or from the member's own `/member/<username>` edit action.
- **Content moderation** — inline tools on boards and threads within the moderator's scope.
- **Email/password change confirmations** — handled through emailed links returning to `/account`.
