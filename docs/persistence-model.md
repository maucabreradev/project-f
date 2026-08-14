# Project F — Persistence Model

Design document for the persistence layer of Project F. It defines tables, columns, types, primary keys, foreign keys, unique constraints, indexes, nullability, timestamps, and delete behaviour.

Derived exclusively from the approved domain (`CONTEXT.md`, `docs/domain-model.md`), the business rules and invariants (§7–§8 of the domain model), the approved decisions (`docs/adr/0001-0006`), the application architecture (`docs/architecture.md`), the route map (`docs/routes.md`), and the accepted integration tickets (`.scratch/initial-product-definition/issues/`). It contains no SQL — the target schema to be implemented by the initial Drizzle migration in `apps/api/src/db`.

Status: accepted

## 1. Facts that shape the schema

- **Single tenant per deployment (ADR-0003):** each deployment is one forum. There is **no `tenant_id` column anywhere** and exactly one `forum_configuration` row.
- **Storage (ADR-0005):** Turso/libSQL (SQLite) over HTTP via Drizzle; FTS5 virtual tables for search; every structural change is a migration (AGENTS.md rule 26).
- **Character-scoped content and economy (ADR-0001):** threads, posts, currency, inventory, and the public profile belong to the character, not the account.
- **Module ownership (ADR-0006):** each table belongs to exactly one deep module; other modules reach its data only through that module's interface.
- **Economy atomicity:** the multi-statement write path (debit + stock + ledger) is validated by the ticket 01 spike; the single-writer Durable Object is the fallback (ADR-0006). The schema is independent of the outcome.
- **Proposed, not accepted:** the public character directory (`.scratch/member-directory/`) is excluded here. Character FTS5 exists only for the approved global search (ticket 56).

## 2. Conventions

| Concern | Convention |
| --- | --- |
| Primary keys | `TEXT`, generated at the application layer (unique id). Not SQLite `rowid`. |
| Timestamps | `INTEGER` unix epoch milliseconds, UTC. `created_at`/`updated_at` on every table unless a domain timestamp replaces them (e.g. `occurred_at`, `submitted_at`, `purchased_at`). |
| Booleans | `INTEGER` with `CHECK (x IN (0, 1))`, stored and read as `0/1`. |
| Enums | `TEXT` with `CHECK (col IN (...))` (SQLite has no native enum type). The `characters`/`Thread` state check values follow the canonical glossary. |
| Currency (decision D1) | `INTEGER` whole units. Fractional results of interest percentages and sell fractions are rounded **down** (floored) by the economy module. |
| JSON payloads | `TEXT` holding JSON, validated by Zod in `packages/validation`; the module owning the column is the single writer. |
| Text case | Emails and usernames stored normalized (lowercase) to make uniqueness and ban lookups exact. |
| Column/table names | `snake_case`, singular table names. |

## 3. Tables by module

Ownership summary (§10): `configuration` owns `forum_configuration`; `identity` owns `members`, `sessions`, `email_tokens`, `moderation_scope_boards`; `characters` owns `characters`, `quick_logins`; `boards` owns `boards`, `board_permissions`; `content` owns `threads`, `posts` and the FTS5 tables; `economy` owns `items`, `inventory_entries`, `transactions`, `earn_rules`; `sheets` owns `sheet_templates`, `character_sheets`; `moderation` owns `bans`, `appeals`, `moderation_actions`; `notifications` owns `notifications`, `notification_preferences`.

### 3.1 configuration module

**`forum_configuration`** — one instance per deployment (domain §2.18). Singleton: exactly one row.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | INTEGER | PK | `CHECK (id = 1)`; seeded by the initial migration |
| `name` | TEXT | NOT NULL | forum identity name |
| `domain` | TEXT | NULL | null → Cloudflare default subdomain; later the web master's domain (ADR-0003) |
| `cover_image` | TEXT | NULL | cover image ref |
| `colors` | TEXT | NOT NULL | JSON identity colors |
| `registration_mode` | TEXT | NOT NULL | `CHECK (registration_mode IN ('open','approval'))` |
| `require_email_confirmation` | INTEGER | NOT NULL | `0/1`, default `1`; account confirmation policy |
| `refund_window_minutes` | INTEGER | NOT NULL | default `1440` (24 h), invariant 12 |
| `sell_fraction` | INTEGER | NOT NULL | integer percent; sale value = `price × sell_fraction / 100`, floored |
| `soft_delete_days` | INTEGER | NOT NULL | `CHECK (soft_delete_days BETWEEN 0 AND 30)` (ADR-0004) |
| `sheet_fields` | TEXT | NOT NULL | JSON — the single source of sheet data fields (invariant 14) |
| `default_permissions` | TEXT | NOT NULL | JSON per-rank read/write matrix applied to new boards |
| `ai_evaluation_enabled` | INTEGER | NOT NULL | `0/1` (ADR-0002) |
| `ai_criteria` | TEXT | NULL | the web master's evaluation criteria |
| `ai_api_key_ciphertext` | TEXT | NULL | stored encrypted, never plaintext (ADR-0002) |
| `updated_at` | INTEGER | NOT NULL | |

### 3.2 identity module

**`members`** — Member/Account aggregate root, identity facet (domain §2.1).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `email` | TEXT | NOT NULL | normalized lowercase; **UNIQUE** |
| `password_hash` | TEXT | NOT NULL | Argon2id |
| `confirmation_state` | TEXT | NOT NULL | `CHECK (confirmation_state IN ('unconfirmed','confirmed'))`, default `unconfirmed` |
| `approval_state` | TEXT | NULL | `CHECK (approval_state IN ('pending','approved','rejected'))`; non-null only in approval mode |
| `status` | TEXT | NOT NULL | `CHECK (status IN ('active','inactive'))`, default `active` |
| `rank` | TEXT | NOT NULL | `CHECK (rank IN ('webmaster','administrator','moderator','user'))`, default `user` |
| `moderator_can_edit_economy` | INTEGER | NOT NULL | `0/1`, default `0`; meaningful for rank `moderator` (ticket 44) |
| `moderator_scope_global` | INTEGER | NOT NULL | `0/1`, default `0`; global scope covers every forum |
| `created_at` | INTEGER | NOT NULL | |
| `updated_at` | INTEGER | NOT NULL | |

Constraints and indexes:
- **UNIQUE** `(email)`.
- **Partial unique index** `(rank) WHERE rank = 'webmaster'` — enforces invariant 13 (exactly one Web master).
- Index on `(email)` (login lookup).

**`sessions`** — DB-backed sessions (ADR-0005); login/logout (ticket 05).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | the session id (opaque token / its hash) |
| `member_id` | TEXT | NOT NULL | FK → `members` **ON DELETE CASCADE** |
| `active_character_id` | TEXT | NULL | FK → `characters` **ON DELETE SET NULL** (character switcher survives deletion; picker re-triggers) |
| `csrf_token` | TEXT | NOT NULL | CSRF protection |
| `created_at` | INTEGER | NOT NULL | |
| `last_seen_at` | INTEGER | NOT NULL | |
| `expires_at` | INTEGER | NOT NULL | |

Index: `(member_id)`.

The request-time ban hook (`isBanned(email, ip)`) runs on every authenticated request (tickets 05/46/47); it queries `bans` (§3.7), not the session.

**`email_tokens`** — one-time emailed links: account confirmation (15 min, ≤2 resends/hour), password reset, email change (tickets 04/17/18).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `member_id` | TEXT | NOT NULL | FK → `members` **ON DELETE CASCADE** |
| `purpose` | TEXT | NOT NULL | `CHECK (purpose IN ('confirm','password-reset','email-change'))` |
| `token_hash` | TEXT | NOT NULL | stored hashed; **UNIQUE** |
| `created_at` | INTEGER | NOT NULL | |
| `expires_at` | INTEGER | NOT NULL | confirmation links: 15 min |
| `consumed_at` | INTEGER | NULL | one-time use |

Index: `(member_id, purpose, created_at)` — resend throttling counts `confirm` tokens created within the last 60 minutes (≤2 resends/hour).

**`moderation_scope_boards`** — a moderator's scope: the set of forums they may act on (domain §2.1 `moderationScope`, tickets 44/45).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `member_id` | TEXT | NOT NULL | FK → `members` **ON DELETE CASCADE** |
| `board_id` | TEXT | NOT NULL | FK → `boards` **ON DELETE CASCADE** |
| `created_at` | INTEGER | NOT NULL | |

PK `(member_id, board_id)`. Scope width (global or explicit boards) and economy edit rights live on `members` (`moderator_scope_global`, `moderator_can_edit_economy`).

### 3.3 characters module

**`characters`** — the fictional persona and scope owner of content and economy (domain §2.2).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `member_id` | TEXT | NOT NULL | FK → `members` **ON DELETE CASCADE** (account deletion removes its characters) |
| `name` | TEXT | NOT NULL | character name — non-unique, spaces/symbols allowed |
| `username` | TEXT | NOT NULL | unique per forum (invariant 2) = unique in this single-tenant deployment |
| `username_rename_used` | INTEGER | NOT NULL | `0/1`, default `0`; one-time rename (ticket 14) |
| `avatar` | TEXT | NULL | R2 key or external URL |
| `banner` | TEXT | NULL | R2 key or external URL |
| `currency_balance` | INTEGER | NOT NULL | default `0`; per-character (invariant 5, ADR-0001) |
| `birth_date` | TEXT | NULL | `YYYY-MM-DD`; present only while the birthday earn rule is enabled (domain §10.1) |
| `status` | TEXT | NOT NULL | `CHECK (status IN ('active','deleted'))`, default `active` |
| `deleted_at` | INTEGER | NULL | set on soft tombstone (decision D3) |
| `created_at` | INTEGER | NOT NULL | registration date of the character |
| `updated_at` | INTEGER | NOT NULL | |
| `last_seen_at` | INTEGER | NULL | last connection |

Constraints and indexes:
- **UNIQUE** `(username)`.
- Index `(member_id)` — list a member's characters.
- Max 2 characters per member (invariant 1) enforced by the `characters` module (count of `status = 'active'`), not as a DB constraint.

Delete behaviour (decision D3, ticket 59): soft tombstone — row kept with `status = 'deleted'` and `deleted_at`, username stays reserved, posts/threads referencing it unlink (`SET NULL`, snapshots preserved), its `inventory_entries`, `transactions`, `character_sheets`, and `quick_logins` cascade away, the public profile returns not-found, and the slot frees (active count).

**`quick_logins`** — stored login shortcuts bound to a character, one per character, max two (domain §2.1, tickets 15).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `character_id` | TEXT | PK | FK → `characters` **ON DELETE CASCADE**; one per character via PK |
| `member_id` | TEXT | NOT NULL | FK → `members` **ON DELETE CASCADE** |
| `created_at` | INTEGER | NOT NULL | |

Max 2 per member enforced by the `characters` module (not a DB constraint).

### 3.4 boards module

**`boards`** — Category / Forum / Subforum as one entity at different depths (domain §2.3; invariant 4: depth ≤ 1). Glossary term: Forum; code name Board.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `name` | TEXT | NOT NULL | non-unique |
| `kind` | TEXT | NOT NULL | `CHECK (kind IN ('category','forum','subforum'))` — materialized depth (category = no parent, forum = parent category, subforum = parent forum) |
| `parent_id` | TEXT | NULL | self-FK → `boards.id`; **ON DELETE RESTRICT** (decision D2) |
| `sort_order` | INTEGER | NOT NULL | ordering within the parent |
| `description` | TEXT | NOT NULL | default `''`; surfaced by the approved BoardRow component |
| `hidden_from_visitors` | INTEGER | NOT NULL | `0/1`, default `0` (ticket 10) |
| `is_archive` | INTEGER | NOT NULL | `0/1`, default `0` — the special Archive forum (ADR-0004) |
| `min_chars` | INTEGER | NULL | per-forum minimum post length (ticket 31) |
| `max_chars` | INTEGER | NULL | per-forum maximum post length (ticket 31) |
| `images_allowed` | INTEGER | NULL | `0/1` post image policy (ticket 31) |
| `image_poster_ranks` | TEXT | NULL | JSON array of ranks allowed to post images |
| `thread_count` | INTEGER | NOT NULL | denormalized counter, maintained by the `content` module |
| `post_count` | INTEGER | NOT NULL | denormalized counter, maintained by the `content` module |
| `last_post_at` | INTEGER | NULL | denormalized, feeds board/section listings |
| `created_at` | INTEGER | NOT NULL | |
| `updated_at` | INTEGER | NOT NULL | |

Constraints and indexes:
- **Partial unique index** `(is_archive) WHERE is_archive = 1` — at most one Archive forum.
- Index `(parent_id, sort_order)`.
- Index `(kind)`.

Delete behaviour (decision D2, ticket 08 CRUD): a board with children or threads **cannot be deleted** — `parent_id` and `threads.board_id` are `ON DELETE RESTRICT`. Content must be moved or archived first. `board_permissions` and `moderation_scope_boards` entries cascade away with the board.

**`board_permissions`** — read/write per rank per board (domain §2.3 `permissions`, ticket 09).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `board_id` | TEXT | NOT NULL | FK → `boards` **ON DELETE CASCADE** |
| `rank` | TEXT | NOT NULL | `CHECK (rank IN ('webmaster','administrator','moderator','user'))` |
| `can_read` | INTEGER | NOT NULL | `0/1` |
| `can_write` | INTEGER | NOT NULL | `0/1` |

PK `(board_id, rank)`. The default matrix for new boards lives in `forum_configuration.default_permissions`, not here.

### 3.5 content module

**`threads`** — a topic inside a board (domain §2.4). Loose threads do not exist (invariant 3).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `board_id` | TEXT | NOT NULL | FK → `boards` **ON DELETE RESTRICT** (decision D2) |
| `title` | TEXT | NOT NULL | |
| `creator_id` | TEXT | NULL | FK → `characters` **ON DELETE SET NULL** — unlinked after character deletion |
| `creator_name` | TEXT | NOT NULL | snapshot of the character name (decision D6 / ADR-0001) |
| `ic_ooc` | TEXT | NOT NULL | `CHECK (ic_ooc IN ('ic','ooc'))` |
| `pinned` | INTEGER | NOT NULL | `0/1`, default `0`; orthogonal flag, not a state |
| `state` | TEXT | NOT NULL | `CHECK (state IN ('open','closed','archived','soft-deleted'))`, default `open` |
| `archive_source_board_id` | TEXT | NULL | FK → `boards`; original board kept when archived/soft-deleted, used by unarchive |
| `soft_delete_expires_at` | INTEGER | NULL | non-null only when `state = 'soft-deleted'`; 0-day window → expires immediately; after expiry the thread stops being shown (filtered by queries, no extra column) |
| `post_count` | INTEGER | NOT NULL | denormalized, maintained by the `content` module |
| `last_post_at` | INTEGER | NULL | denormalized |
| `created_at` | INTEGER | NOT NULL | |
| `updated_at` | INTEGER | NOT NULL | |

Indexes: `(board_id, state, pinned, last_post_at)` for board listings; `(creator_id)` for the character's recent threads; `(state)` for archive/soft-delete scanning.

State transition rules (§5 of the domain model) live in the `content` module: `open → closed` (staff reopens), `open|closed → archived` (moves to the Archive forum, read-only, only an Administrator unarchives), `open|closed → soft-deleted` (Archive forum, window then hidden).

**`posts`** — a single message within a thread (domain §2.5). No `state` column: the post state is inherited from its thread.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `thread_id` | TEXT | NOT NULL | FK → `threads` **ON DELETE CASCADE** |
| `author_id` | TEXT | NULL | FK → `characters` **ON DELETE SET NULL** — unlinked after character/account deletion |
| `author_name` | TEXT | NOT NULL | snapshot of the character name (decision D6 / ADR-0001) |
| `content` | TEXT | NOT NULL | editor source (BBCode/Markdown) |
| `content_html` | TEXT | NOT NULL | rendered, sanitized server-side at write time (decision D6) |
| `created_at` | INTEGER | NOT NULL | |
| `edited_at` | INTEGER | NULL | edited marker |

Index: `(thread_id, created_at)` for pagination. Images referenced inside `content`/`content_html` (R2 keys or URLs) — no separate image table.

### 3.6 economy module

**`items`** — shop catalog (domain §2.9, tickets 37–38).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `name` | TEXT | NOT NULL | |
| `icon` | TEXT | NOT NULL | item icon reference |
| `price` | INTEGER | NOT NULL | whole units (decision D1) |
| `stock_model` | TEXT | NOT NULL | `CHECK (stock_model IN ('infinite','limited','unique'))` |
| `stock_remaining` | INTEGER | NULL | non-null only for `limited`/`unique` |
| `unique_purchase` | INTEGER | NOT NULL | `0/1` — whether the same character may buy it more than once |
| `kind` | TEXT | NOT NULL | `CHECK (kind IN ('inventory-item','cosmetic'))` |
| `created_at` | INTEGER | NOT NULL | |
| `updated_at` | INTEGER | NOT NULL | |

Delete behaviour (decision D4): an item with owned entries **cannot be deleted** — `inventory_entries.item_id` is `ON DELETE RESTRICT`. Empty catalog items may be deleted.

**`inventory_entries`** — purchase instances + current holdings (domain §2.10). Bag is a subset flag (decision D5).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `character_id` | TEXT | NOT NULL | FK → `characters` **ON DELETE CASCADE** |
| `item_id` | TEXT | NOT NULL | FK → `items` **ON DELETE RESTRICT** (decision D4) |
| `quantity` | INTEGER | NOT NULL | default `1`; stackable items may hold > 1 |
| `purchased_at` | INTEGER | NOT NULL | refund-window base (invariant 12: refund only within 24 h) |
| `state` | TEXT | NOT NULL | `CHECK (state IN ('owned','sold','refunded'))`, default `owned` |
| `lifecycled_at` | INTEGER | NULL | set when sold/refunded |
| `sold_for` | INTEGER | NULL | the sell-back credit (decision D1) |
| `in_bag` | INTEGER | NOT NULL | `0/1`, default `0` — materializes the BagEntry subset (decision D5) |

Indexes: `(character_id, state)` for inventory lists; `(character_id, item_id, state)` for per-character holdings.

`unique_purchase` enforcement, stock restore on refund (global, back to the shop), and the sell/refund lifecycle are module logic — the constraint depends on `item.unique_purchase`, which a static DB constraint cannot express. Historical movements live in `transactions`; a row leaves `inventory_entries` only after sale/refund (active holdings kept; `sold`/`refunded` rows exist for audit and are excluded from holdings).

**`transactions`** — the economy ledger (domain §2.12, tickets 32/38/39/45). Feeds the economy log.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `character_id` | TEXT | NOT NULL | FK → `characters` **ON DELETE CASCADE** |
| `type` | TEXT | NOT NULL | `CHECK (type IN ('earn','purchase','sale','refund','adjust'))` |
| `amount` | INTEGER | NOT NULL | signed by convention: earn `+`, purchase `-`, sale `+`, refund `+`, adjust `±` |
| `item_id` | TEXT | NULL | FK → `items` **ON DELETE SET NULL** |
| `item_name` | TEXT | NULL | snapshot for the ledger display |
| `actor_type` | TEXT | NOT NULL | `CHECK (actor_type IN ('system','staff','member'))` |
| `actor_id` | TEXT | NULL | FK → `members` **ON DELETE SET NULL** |
| `reason` | TEXT | NULL | mandatory for `adjust` (ticket 45) |
| `occurred_at` | INTEGER | NOT NULL | |

Indexes: `(character_id, occurred_at)` for the member/character ledger; `(type, occurred_at)` for the economy log.

The no-clawback rule (currency already granted is not clawed back when the granting thread or post is deleted — `docs/domain-model.md` §7, economy rules) is business logic, not schema. Economy write atomicity (debit + stock + ledger) is implemented per the ticket 01 spike outcome.

**`earn_rules`** — forum economy configuration (domain §2.13, tickets 33–36).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `type` | TEXT | NOT NULL | `CHECK (type IN ('per-thread','per-post','login-streak','interest','birthday'))`; **UNIQUE** (one rule per type per deployment) |
| `params` | TEXT | NOT NULL | JSON — reward amount, streak window, interest day and percentage |
| `enabled` | INTEGER | NOT NULL | `0/1`, default `0` |
| `created_at` | INTEGER | NOT NULL | |
| `updated_at` | INTEGER | NOT NULL | |

Enabling the `birthday` rule unlocks `characters.birth_date` (domain §10.1, resolved ambiguity 1); login streaks are measured per character (§2.2, §10.2).

### 3.7 sheets module

**`sheet_templates`** — preset layouts for the character sheet (domain §2.7, ticket 50). Presentational only.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `name` | TEXT | NOT NULL | |
| `presentation` | TEXT | NOT NULL | JSON — structure, blocks, view |
| `enabled` | INTEGER | NOT NULL | `0/1` — the web master decides availability |
| `created_at` | INTEGER | NOT NULL | |
| `updated_at` | INTEGER | NOT NULL | |

Invariant 14 (data fields identical across templates) is enforced by keeping the field definitions in a single place: `forum_configuration.sheet_fields`. Templates carry only presentation.

**`character_sheets`** — the character's roleplay document (domain §2.6, tickets 51/52). Public once created; no draft/publish column.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `character_id` | TEXT | NOT NULL | **UNIQUE**; FK → `characters` **ON DELETE CASCADE** (1:1) |
| `template_id` | TEXT | NULL | FK → `sheet_templates` **ON DELETE SET NULL** |
| `data` | TEXT | NOT NULL | JSON values for the web master–defined fields (`forum_configuration.sheet_fields`) |
| `evaluation_provider` | TEXT | NULL | decision D8 — 0..1 evaluation on the sheet (domain §2.8) |
| `evaluation_result` | TEXT | NULL | JSON `ok`/`fail` plus detail |
| `evaluation_criteria_version` | TEXT | NULL | criteria version used |
| `evaluated_at` | INTEGER | NULL | |
| `created_at` | INTEGER | NOT NULL | |
| `updated_at` | INTEGER | NOT NULL | |

IC posting requires a sheet (ticket 52); OOC posting requires only the character account. Evaluation only runs when `forum_configuration.ai_evaluation_enabled` and the encrypted key are present (ADR-0002).

### 3.8 moderation module

**`bans`** — ban by registered email or by IP, permanent or dated, with a mandatory reason (domain §2.14, tickets 46/47/48).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `target_type` | TEXT | NOT NULL | `CHECK (target_type IN ('email','ip'))` |
| `target` | TEXT | NOT NULL | normalized email or IP string |
| `reason` | TEXT | NOT NULL | invariant 10; visible to the banned member and to staff |
| `duration_type` | TEXT | NOT NULL | `CHECK (duration_type IN ('permanent','until'))` |
| `until` | INTEGER | NULL | non-null only when `duration_type = 'until'` |
| `state` | TEXT | NOT NULL | `CHECK (state IN ('active','appealed','revoked','expired'))`, default `active` |
| `arbitration_pending` | INTEGER | NOT NULL | `0/1` — staff-target ban awaiting a third Administrator (ticket 48) |
| `arbitration_result` | TEXT | NULL | `CHECK (arbitration_result IN ('approved','rejected'))` |
| `arbiter_id` | TEXT | NULL | FK → `members` **ON DELETE SET NULL** |
| `decided_at` | INTEGER | NULL | arbitration decision time |
| `created_by_id` | TEXT | NULL | FK → `members` **ON DELETE SET NULL** |
| `created_by_name` | TEXT | NOT NULL | snapshot of the acting staff member |
| `created_at` | INTEGER | NOT NULL | |
| `expires_at` | INTEGER | NULL | = `until` for dated bans |
| `updated_at` | INTEGER | NOT NULL | |

Index: `(target_type, target, state)` — the per-request `isBanned(email, ip)` hook (a ban by IP covers the whole IP, registered or not — invariant 11).

Delete behaviour: kept for audit (no incoming cascade); its `appeals` cascade away.

**`appeals`** — a formal request from a banned member (domain §2.15, ticket 49).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `ban_id` | TEXT | NOT NULL | FK → `bans` **ON DELETE CASCADE** |
| `message` | TEXT | NOT NULL | |
| `state` | TEXT | NOT NULL | `CHECK (state IN ('open','approved','rejected'))`, default `open` |
| `submitted_at` | INTEGER | NOT NULL | |
| `decided_by_id` | TEXT | NULL | FK → `members` **ON DELETE SET NULL** (Administrator) |
| `decided_at` | INTEGER | NULL | |

**Partial unique index** `(ban_id) WHERE state = 'open'` — at most one open appeal per ban. An accepted appeal lifts the ban (module state transitions); resolution notifies the member via `notifications`.

**`moderation_actions`** — the staff/general/economy log entries plus visible thread history (domain §2.17, ticket 25, ADR-0006 `moderation.log`).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `actor_id` | TEXT | NULL | FK → `members` **ON DELETE SET NULL** |
| `actor_name` | TEXT | NOT NULL | snapshot of the staff member's name |
| `type` | TEXT | NOT NULL | `CHECK (type IN ('edit','close','open','archive','unarchive','delete','pin','move','currency-adjust','inventory-adjust','ban'))` |
| `thread_id` | TEXT | NULL | FK → `threads` **ON DELETE CASCADE** (thread-scoped history dies with the thread; threads are not hard-deleted in practice) |
| `post_id` | TEXT | NULL | FK → `posts` **ON DELETE SET NULL** (posts are never hard-deleted on moderation) |
| `character_id` | TEXT | NULL | FK → `characters` **ON DELETE SET NULL** (economy-adjust targets) |
| `ban_id` | TEXT | NULL | FK → `bans` **ON DELETE SET NULL** |
| `note` | TEXT | NULL | mandatory reason for adjusts |
| `occurred_at` | INTEGER | NOT NULL | |

Indexes: `(thread_id, occurred_at)` for the thread-visible history ("…by X on date"); `(character_id, occurred_at)` for adjust history; `(type, occurred_at)` for the staff/general/economy logs.

NonNullable actor + timestamp structurally satisfy invariant 9 (every staff moderation action is recorded with actor and timestamp). Per-target nullable FK columns keep referential integrity without a polymorphic id.

### 3.9 notifications module

**`notifications`** — real-time alerts shown in the navbar (domain §2.16, tickets 54/55).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | TEXT | PK | |
| `recipient_id` | TEXT | NOT NULL | FK → `members` **ON DELETE CASCADE** |
| `type` | TEXT | NOT NULL | `CHECK (type IN ('reply-thread','reply-participation','reply-post','mention','appeal-resolved','currency-birthday','currency-interest'))` |
| `payload` | TEXT | NOT NULL | JSON — href, context ids, snippet |
| `read` | INTEGER | NOT NULL | `0/1`, default `0` |
| `read_at` | INTEGER | NULL | |
| `created_at` | INTEGER | NOT NULL | |

Index: `(recipient_id, read, created_at)` for the badge and dropdown; `(created_at)`.

**`notification_preferences`** — per-member on/off for each notification type (domain §2.16, ticket 54).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| `member_id` | TEXT | PK | FK → `members` **ON DELETE CASCADE** |
| `prefs` | TEXT | NOT NULL | JSON per-type on/off |
| `updated_at` | INTEGER | NOT NULL | |

### 3.10 search — FTS5

libSQL FTS5 virtual tables (ADR-0005, architecture §Persistence; tickets 56/57/27). Standalone FTS tables with insert/update/delete triggers, because Project F uses TEXT primary keys (not rowids), which the external-content FTS mode does not fit cleanly.

| Table | Content | Purpose |
| --- | --- | --- |
| `threads_search` | `title`, `body` | global thread search (ticket 56) |
| `posts_search` | `content`, plus a `thread_id` term | global post search and per-thread search (tickets 56/57) |
| `characters_search` | `name`, `username` | character search and `@username` mention suggestions (tickets 56/27) |

Triggers live in the owning modules (`content` for threads/posts; `characters` for characters) and keep the FTS rows in sync with their lifecycle.

## 4. Search and lookups

- **Username/name search**: `characters_search` FTS5. Usernames are unique (invariant 2) and power mentions, URLs, and the `/member/<username>` routes.
- **Per-thread search**: `posts_search` filtered by the `thread_id` term (ticket 57).
- **Ban hook**: indexed lookup on `bans (target_type, target, state)` — runs on every authenticated request for the session email and the request IP.

## 5. Delete behaviour summary

**CASCADE** — `members` → `characters`, `sessions`, `email_tokens`, `notification_preferences`, `notifications`, `quick_logins`, `moderation_scope_boards`; `characters` → `inventory_entries`, `transactions`, `character_sheets`; `bans` → `appeals`; `threads` → `posts`; `boards` → `board_permissions`; `moderation_actions.thread_id`.

**SET NULL** (audit/content preserved, name snapshots retained) — `posts.author_id` and `threads.creator_id` (after character/account deletion, unlinked display name), `moderation_actions.actor_id`/`character_id`/`ban_id`/`post_id`, `bans.created_by_id`/`arbiter_id`, `appeals.decided_by_id`, `transactions.actor_id`/`item_id`, `sessions.active_character_id`, `character_sheets.template_id`.

**RESTRICT** (blocked) — `boards.parent_id` (board with subforums) and `threads.board_id` (board with threads) per decision D2; `inventory_entries.item_id` (item still owned) per decision D4.

**Soft deletions** — `characters.status = 'deleted'` tombstone (D3); `threads.state = 'soft-deleted'` with `soft_delete_expires_at` (ADR-0004). Posts never hard-delete on moderation.

## 6. Decisions

Confirmed design decisions (all recommended options, chosen in session):

| Id | Decision |
| --- | --- |
| D1 | Currency is `INTEGER` whole units; interest and sell-fraction results are floored by the economy module. |
| D2 | Boards containing subforums or threads cannot be deleted (`RESTRICT`); content must be moved or archived first. |
| D3 | Character deletion is a soft tombstone (`status = 'deleted'`, `deleted_at`); the username stays reserved; economy/profile content cascades away; posts keep unlinked name snapshots. |
| D4 | Items still owned by any character cannot be deleted (`RESTRICT`). |
| D5 | The bag is persisted as `inventory_entries.in_bag` (0/1) — a subset flag that guarantees bag ⊆ inventory; no separate bag table. |
| D6 | Posts store both the editor source (`content`) and the sanitized render (`content_html`); threads and posts store creator/author name snapshots for unlinked display after deletion (ADR-0001). |
| D7 | Soft-deleted threads are hidden by filtering against `soft_delete_expires_at`; no separate "purged" flag. |
| D8 | Sheet evaluation is 0..1, stored as nullable columns on `character_sheets` (domain §2.8); no evaluation history table. |
| D9 | Generic `email_tokens` table covers confirmation, password reset, and email change; resend throttling counts `confirm` tokens in the rolling hour. |
| D10 | `moderation_actions` uses nullable per-target FK columns instead of a polymorphic target column, preserving referential integrity. |
| D11 | Search uses standalone FTS5 tables with triggers (TEXT PKs make external-content mode awkward). |
| D12 | Denormalized counters (`threads.post_count`/`last_post_at`, `boards.thread_count`/`post_count`/`last_post_at`) maintained transactionally by the owning modules for list pages and stats. |
| D13 | `forum_configuration.sheet_fields` is the single source of sheet data fields, enforcing invariant 14 across templates. |

## 7. Module → table ownership map

| Module | Tables |
| --- | --- |
| `configuration` | `forum_configuration` |
| `identity` | `members`, `sessions`, `email_tokens`, `moderation_scope_boards` |
| `characters` | `characters`, `quick_logins` (+ `characters_search` triggers) |
| `boards` | `boards`, `board_permissions` |
| `content` | `threads`, `posts` (+ `threads_search`, `posts_search`) |
| `economy` | `items`, `inventory_entries`, `transactions`, `earn_rules` |
| `sheets` | `sheet_templates`, `character_sheets` |
| `moderation` | `bans`, `appeals`, `moderation_actions` |
| `notifications` | `notifications`, `notification_preferences` |

## 8. Excluded

- **Public character directory** (`.scratch/member-directory/`): proposed, not in the accepted spec — no schema here (AGENTS.md rules 16–17). Its FTS need is already covered by `characters_search` for approved global search.

## 9. Traceability

- Entities/flags: `docs/domain-model.md` §2; states §5; roles §6; rules §7; invariants §8.
- Decisions: `docs/adr/0001` (character scope), `0002` (AI opt-in), `0003` (single tenant), `0004` (soft-delete window), `0005` (stack), `0006` (application architecture & module ownership).
- Persistence/architecture: `docs/architecture.md` §Persistence.
- Use cases: tickets 01, 04–05, 08–10, 14–15, 17–18, 25, 27, 31–39, 44–50, 51–52, 54–57, and 59 in `.scratch/initial-product-definition/issues/`.
