# Project F — REST API Design

Status: accepted

Design-level specification of the REST interface served by the Hono Worker at `/api/*`. Derived from the approved domain (`CONTEXT.md`, `docs/domain-model.md`), the architecture (`docs/architecture.md`, `docs/adr/0005-0006`), the persistence model (`docs/persistence-model.md`), the route map (`docs/routes.md`), and the accepted tickets (`.scratch/initial-product-definition/issues/`). It defines, per use case: HTTP method, URL, request, response, validation, authentication, authorization, and error responses. No routes are implemented here.

## 1. Conventions

- **Base path & seam.** Everything under `/api/*` on the single Hono Worker (ADR-0006). All bodies and responses are JSON (`application/json`); image uploads are `multipart/form-data`. The contract is consumed type-safely through the Hono RPC client (`hc`), so this document is also the shape the RPC client must expose.
- **Authentication.** DB-backed session cookie `pf_session` (HttpOnly, Secure, SameSite=Lax) set on login and quick login. All unsafe methods (`POST`, `PUT`, `PATCH`, `DELETE`) additionally require the `X-CSRF-Token` header matching `sessions.csrf_token`. No session → **401**.
- **Ban hook.** On every request, an IP ban blocks that IP (invariant 11); authenticated requests also check the session email. A banned subject receives **403 `banned`** with the ban payload on every endpoint; the frontend renders the ban interstitial.
- **Account gates (403).** `unconfirmed`, `pending_approval`, `rejected`, and `inactive` map to distinct error codes. They gate writes; an inactive account may still browse, use settings, receive notifications, and use quick login (ticket 42).
- **Authorization (policy-as-data).** A permission module evaluates, per request: `canRead(board, actor)`, `canWrite(board, actor)`, `canModerate(scope, target, actor)`. Rank ladder `webmaster > administrator > moderator > user`. Writes to content, economy, and sheets act on the **session's active character** (ADR-0001). Policy denial → **403 `forbidden`**.
- **Character scoping.** `active_character_id` lives on the session (ticket 13). Endpoints with an explicit `:username` or `:id` read that specific character; mutations on own resources remain bound to the session member.
- **Validation.** Zod schemas live in `packages/validation`, applied with `@hono/zod-validator` on `json`, `query`, and `param`. Failure → **400** with `fieldErrors`.
- **Status codes.** 200 ok · 201 created · 202 accepted · 204 no content · 400 validation · 401 unauthenticated · 403 forbidden / account gate / banned · 404 not found (also used for visitor-hidden resources, to avoid leaking existence) · 409 conflict (duplicate username or email) · 413 payload too large · 422 domain, business, or state error · 429 resend rate limit reached.
- **Error envelope.** `{ "error": { "code": string, "message": string, "fieldErrors"?: Record<string, string[]>, "details"?: any } }`.
- **Pagination.** `?page=1&pageSize=20` (default 20, max 100); response `{ items, page, pageSize, total }`. Thread listings default to `lastPostAt` descending with pinned threads first.
- **Ids & format.** ULIDs (`TEXT`) generated at the application layer. Timestamps are integer unix epoch milliseconds, UTC. Enums are lowercase, matching `docs/persistence-model.md`. Usernames: `[a-zA-Z0-9_-]{3,30}`, stored lowercase, unique per forum.

## 2. Resource shapes

- `MemberView` = `{ id, email, confirmationState, approvalState, status, rank, moderatorScope: { global, boards[], canEditEconomy }, createdAt }`
- `CharacterView` = `{ id, name, username, avatar, banner, birthDate?, status, currencyBalance, registeredAt, lastSeen }`
- `BoardView` = `{ id, kind, name, description, parentId, sortOrder, hiddenFromVisitors, isArchive, contentLimits: { minChars?, maxChars?, imagesAllowed?, imagePosterRanks? }, permissions: { [rank]: { read, write } }, threadCount, postCount, lastPostAt }`
- `ThreadView` = `{ id, boardId, title, creator: { username, name }, icOoc, pinned, state, postCount, lastPostAt, createdAt, moderationHistory: [{ type, actorName, occurredAt }] }`
- `PostView` = `{ id, threadId, author: { username, name }, content, contentHtml, createdAt, editedAt, bag: [{ itemId, name, icon, quantity }] }`
- `ItemView` = `{ id, name, icon, price, stockModel, stockRemaining?, uniquePurchase, kind }`
- `InventoryEntryView` = `{ id, item: ItemView, quantity, purchasedAt, state, inBag, soldFor? }`
- `TransactionView` = `{ id, type, amount, itemName?, actorType, actorId?, reason?, occurredAt }`
- `SheetView` = `{ characterId, templateId, data, evaluation?: { provider, result, criteriaVersion, evaluatedAt } }`
- `BanView` = `{ id, targetType, target, reason, durationType, until?, state, arbitrationPending, arbitrationResult?, createdByName, createdAt }`

## 3. Endpoints by module

The module groups mirror the deep modules of `docs/architecture.md` (§ Backend modules). Columns: **Authn** = authentication requirement; **Authz** = authorization policy beyond authentication.

### 3.1 Identity — authentication & account

| Method | URL | Authn | Authz | Request → Response / key errors |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | public | n/a | `{ email, password }` → 201 `{ memberId, gatewayState: 'unconfirmed' \| 'pending' }`. Validation: email format; password 8–128; duplicate email → 409 `conflict` |
| POST | `/api/auth/confirm` | public | n/a | `{ token }` → 204. 422 `token_expired` (15 min) / `token_invalid`; token is single-use |
| POST | `/api/auth/resend-confirmation` | public | n/a | `{ email }` → 204 always (no enumeration). 429 `already_resent` (≤ 2 resends/hour) |
| POST | `/api/auth/login` | public | n/a | `{ email, password }` → 200 `{ member, characters }` + Set-Cookie. 401 `invalid_credentials`; 403 `banned` / `unconfirmed` / `pending_approval` / `rejected` (ban hook on email) |
| POST | `/api/auth/quick-login` | public | n/a | `{ characterId, password }` → 200 as login. Fails when no quick login exists for that character; the ban check still applies (ticket 27) |
| POST | `/api/auth/logout` | member | n/a | → 204; session destroyed |
| GET | `/api/session` | member | n/a | → 200 `{ member, characters, activeCharacterId, rank, moderatorScope }` (identity `getSession`) |
| POST | `/api/session/character` | member | own character | `{ characterId }` → 204; sets `active_character_id` on the session (ticket 13, swaps without logout) |
| POST | `/api/auth/forgot-password` | public | n/a | `{ email }` → 204 always (does not reveal whether the account exists) |
| POST | `/api/auth/reset-password` | public | n/a | `{ token, newPassword }` → 204. 422 `token_expired` / `token_invalid`; token is single-use and expiring |
| POST | `/api/auth/change-email` | member | self | `{ newEmail }` → 204; emits the email-change link; effective at next login (global to the account). 409 `conflict` when the new email is taken |
| POST | `/api/auth/confirm-email-change` | public | n/a | `{ token }` → 204; the old email no longer logs in (ticket 18) |
| PATCH | `/api/account/status` | member | self | `{ status: 'active' \| 'inactive' }` → 204; data preserved, posting gated while inactive (ticket 42) |
| GET | `/api/account` | member | self | → 200 own account view: email, status, quick logins, characters |
| DELETE | `/api/account` | member | self | optional `{ password }` → 204; cascades characters, sessions, rewards; posts remain visible with unlinked names (pending — ticket 43) |
| GET | `/api/admin/members` | staff | administrator+ | `?status=pending\|all&page=` → `{ items: MemberView + characterCount }` |
| POST | `/api/admin/members/:id/approval` | staff | administrator+ | `{ decision: 'approve' \| 'reject' }` → 204. 422 `not_pending` (ticket 11) |
| POST | `/api/admin/members/:id/rank` | staff | **webmaster only** | `{ rank: 'administrator' \| 'moderator' \| 'user', scope?: { global, boards[], canEditEconomy } }` → 200 MemberView. Scope is required when promoting to moderator (ticket 44); 422 `webmaster_demotion` forbidden |

### 3.2 Characters

| Method | URL | Authn | Authz | Request → Response / key errors |
| --- | --- | --- | --- | --- |
| POST | `/api/characters` | member | confirmed + active | `{ name }` → 201 CharacterView (random unique username; becomes the active character). 422 `character_limit` (max 2 active, invariant 1; delete to free a slot) |
| GET | `/api/characters` | member | self | → 200 `[CharacterView]` |
| POST | `/api/characters/:id/username` | member | own | `{ username }` → 200 CharacterView. One-time rename → 422 `already_renamed`; 409 `username_taken` (ticket 14) |
| PUT | `/api/characters/:id/avatar` | member | own | `{ url }` (ref from `/api/uploads/images`) → 200. 422 `invalid_image_ref` (ticket 16) |
| PUT | `/api/characters/:id/banner` | member | own | `{ url }` → 200, same validation |
| POST | `/api/characters/:id/quick-login` | member | own | → 201. 422 `quick_login_limit` (max 2 total, one per character, ticket 15) |
| DELETE | `/api/characters/:id/quick-login` | member | own | → 204 |
| DELETE | `/api/characters/:id` | member | own | → 204; soft tombstone (D3): inventory, currency, sheet, quick logins cascade; posts/threads unlink with name snapshots; username stays reserved; slot frees (ticket 59) |
| GET | `/api/characters/:username` | all | readable unless profile hidden from visitors | → 200 public profile (CharacterView + owner account status badge + sheet summary + inventory + bag + recent threads/posts + registeredAt + lastSeen, ticket 41). 404 when deleted or hidden |
| POST | `/api/characters/:id/economy` | staff | administrator, or moderator with `canEditEconomy` and the character in scope | `{ amount, reason }` → 200 `{ character, balance, ledgerId }`; reason is mandatory → 422; records ledger `adjust` + `moderation_actions` entry (ticket 45) |
| POST | `/api/characters/:id/inventory` | staff | same | `{ itemId, delta, reason }` → 200. 422 `invalid_delta` (delta below owned quantity) |

### 3.3 Boards

| Method | URL | Authn | Authz | Request → Response / key errors |
| --- | --- | --- | --- | --- |
| GET | `/api/boards` | all | `canRead`; hidden-from-visitors filtered | → 200 tree (categories → forums → subforums) with stats (ticket 08) |
| GET | `/api/boards/:id` | all | `canRead` respecting visibility | → 200 BoardView. 404 when hidden |
| POST | `/api/boards` | staff | administrator+ | `{ kind, name, parentId?, sortOrder?, description? }` → 201 BoardView. 422 `depth_exceeded` (subforum under a subforum, invariant 4) |
| PATCH | `/api/boards/:id` | staff | administrator+ | `{ name?, description?, sortOrder? }` → 200 |
| DELETE | `/api/boards/:id` | staff | administrator+ | → 204. 422 `board_in_use` (has children or threads; RESTRICT, decision D2) |
| PUT | `/api/boards/:id/permissions` | staff | **webmaster only** | `{ permissions: { rank: { read, write } } }` → 200. Validation: the four ranks; webmaster stays read+write (ticket 09) |
| PUT | `/api/boards/:id/visibility` | staff | **webmaster only** | `{ hiddenFromVisitors: boolean }` → 200 (ticket 10) |
| PUT | `/api/boards/:id/content-limits` | staff | **webmaster only** | `{ minChars?, maxChars?, imagesAllowed?, imagePosterRanks? }` → 200. Validation: 0 ≤ min ≤ max (ticket 31) |

### 3.4 Content — threads, posts, moderation actions

| Method | URL | Authn | Authz | Request → Response / key errors |
| --- | --- | --- | --- | --- |
| GET | `/api/boards/:id/threads` | all | `canRead` | `?page=&pinned=&state=` → `{ items: ThreadView }`; archived/soft-deleted hidden unless viewing the archive board |
| POST | `/api/boards/:id/threads` | member (active char) | `canWrite` + confirmed + active | `{ title, icOoc, content }` → 201 ThreadView. 422 `sheet_required` (IC boards, ticket 52), 422 `content_limits`; per-thread earn applied (ticket 33) |
| GET | `/api/threads/:id` | all | `canRead` | → 200 ThreadView incl. moderation history (ticket 25) |
| GET | `/api/threads/:id/posts` | all | `canRead` | `?page=&q=` (q = per-thread FTS, ticket 57) → `{ items: PostView }` |
| POST | `/api/threads/:id/posts` | member (active char) | `canWrite` + confirmed + active | `{ content }` → 201 PostView. 422 `thread_closed` (invariant 7), 422 `sheet_required` (IC thread), 422 `content_limits`; per-post earn + notifications emitted (tickets 19/55) |
| PATCH | `/api/posts/:id` | member (active char) | author (own) or staff in scope | `{ content }` → 200 PostView; staff edit additionally records `moderation_actions` `edit`; limits re-validated |
| PATCH | `/api/threads/:id` | member | creator or staff (title/tag) | `{ title?, icOoc? }` → 200 ThreadView; staff change records `edit` (ticket 32 tag editability) |
| POST | `/api/threads/:id/pin` / DELETE `…/pin` | member | creator or staff in scope | → 200 / 204; records `pin` (ticket 21) |
| POST | `/api/threads/:id/close` | staff | moderator+ in scope | → 200; records `close`; replies blocked while closed (invariant 7) |
| POST | `/api/threads/:id/open` | staff | moderator+ in scope | → 200; only from `closed`; records `open` |
| POST | `/api/threads/:id/archive` | staff | moderator+ in scope | → 200; moves to the Archive forum, read-only, indefinite (invariant 6); records `archive`; 422 from `archived`/`soft-deleted` |
| POST | `/api/threads/:id/unarchive` | staff | **administrator only** | → 200; restores to `archive_source_board_id`; records `unarchive` (ticket 22) |
| DELETE | `/api/threads/:id` | staff | moderator+ in scope | → 204 soft-delete into the Archive for `soft_delete_days` (0 → immediate hide, ADR-0004); posts stay visible during the window; records `delete` (ticket 23) |
| POST | `/api/threads/:id/move` | staff | moderator+ in scope | `{ targetBoardId }` → 200; target must be a forum or subforum → 422 `invalid_target`; records `move` (ticket 24) |
| GET | `/api/admin/logs` | staff | **administrator+** | `?type=staff\|general\|economy&page=` → `{ items }` from `moderation_actions` (ticket 58/25) |

Editor richness (spoilers, quotes, multi-quotes, emojis, stickers, GIFs, images in posts — tickets 28–30) adds no endpoints: it extends the `content` payload and the server-side sanitizer/renderer (decision D6). The per-forum image policy (ticket 31) is enforced on post create/edit.

### 3.5 Sheets

| Method | URL | Authn | Authz | Request → Response / key errors |
| --- | --- | --- | --- | --- |
| GET | `/api/sheet/templates` | all | n/a | → 200 `[{ id, name, presentation }]` of enabled templates (ticket 50) |
| GET | `/api/characters/:username/sheet` | all | visible unless hidden | → 200 SheetView (public once created, ticket 51); 404 when not created |
| GET | `/api/sheet` | member (active char) | self | → 200 SheetView or 404 (not created) |
| PUT | `/api/sheet` | member (active char) | self | `{ templateId, data }` → 200 SheetView. Validation: `data` against `forum_configuration.sheet_fields` (invariant 14); `templateId` must be enabled → 422 |
| POST | `/api/sheet/evaluation` | member (active char) | self | → 202; runs only when enabled and a key is present (ADR-0002) → 422 `evaluation_disabled`; result polled via GET `/api/sheet` (ticket 53) |
| GET / PUT | `/api/admin/sheet-definition` | staff | **webmaster only** | GET → current fields; PUT `{ fields }` → 200 (single source of sheet data fields, decision D13) |
| CRUD | `/api/admin/sheet-templates(/.:id)` | staff | **webmaster only** | `{ name, presentation, enabled }` → 200 / 201 / 204 |

### 3.6 Economy & shop

| Method | URL | Authn | Authz | Request → Response / key errors |
| --- | --- | --- | --- | --- |
| GET | `/api/economy` | member (active char) | self | → 200 `{ balance, transactions: [TransactionView], earnRules: [enabled] }` (ticket 32) |
| GET | `/api/shop` | member | self | → 200 `[ItemView]` + `balance` (affordability) (ticket 37) |
| GET | `/api/shop/:itemId` | member | self | → 200 ItemView (+ `stockRemaining`, owned count). 404 not found |
| POST | `/api/shop/:itemId/purchases` | member (active char) | self | `{ quantity? }` → 201 InventoryEntryView + balance. Atomic (debit + stock + ledger, tickets 01/38); 422 `insufficient_balance` / `out_of_stock` / `unique_purchase` / `not_stackable` (quantity > 1) |
| GET | `/api/inventory` | member (active char) | self | → 200 owned entries incl. bag subset + balance |
| POST | `/api/inventory/:entryId/sell` | member (active char) | owns entry | → 200 `{ entry, credits, balance }` at `sell_fraction`, floored (decision D1). 404 / 422 `entry_closed` (already sold or refunded) |
| POST | `/api/inventory/:entryId/refund` | member (active char) | owns entry | → 200 `{ entry, credits, balance }`. 422 `refund_window_passed` (> 24 h, invariant 12); limited/unique stock restored globally (ticket 39) |
| PUT | `/api/inventory/:entryId/bag` | member (active char) | owns entry | `{ inBag: boolean, quantity? }` → 200; bag ⊆ inventory enforced → 422 (decision D5, ticket 40) |
| CRUD | `/api/admin/shop/items(/.:id)` | staff | **webmaster only** | `{ name, icon, price, stockModel, stockRemaining?, uniquePurchase, kind }` → 200 / 201 / 204. 422 `item_owned` (RESTRICT, decision D4) |
| CRUD | `/api/admin/earn-rules(/.:type)` | staff | **webmaster only** | `{ type, params, enabled }` → 200 / 204. Enabling `birthday` reveals the birth-date field (tickets 33–36) |
| GET | `/api/admin/logs/economy` | staff | **administrator+** | → 200 economy ledger across characters (ticket 58) |

Scheduled earn rules (interest, birthday, soft-delete expiry) and login-streak application run through Cron and at login against the same modules — no public HTTP surface. `grantEarn`, `applyLoginStreak`, `runInterest`, and `runBirthday` are internal module functions; currency granted is never clawed back when the granting content is deleted (ADR-0004).

### 3.7 Moderation — bans & appeals

| Method | URL | Authn | Authz | Request → Response / key errors |
| --- | --- | --- | --- | --- |
| POST | `/api/admin/bans` | staff | moderator+ (ban rights) | `{ targetType: 'email' \| 'ip', target, reason, durationType: 'permanent' \| 'until', until? }` → 201 BanView; when the target is a staff member → **202** `{ ban, arbitrationPending: true }` (a third Administrator must decide, ticket 48); reason is mandatory → 422 (invariant 10) |
| GET | `/api/admin/bans` | staff | administrator+ | `?state=&page=` → 200 ban list |
| POST | `/api/admin/bans/:id/revoke` | staff | moderator+ or administrator | → 200; records the moderation action |
| POST | `/api/admin/bans/:id/arbitration` | staff | administrator, not the creator | `{ decision: 'approve' \| 'reject' }` → 200; approve → active, reject → not applied; 422 `not_pending` / `self_arbitration` |
| GET | `/api/bans/me` | banned member | self | → 200 BanView + appeal status (ticket 71) |
| POST | `/api/bans/me/appeal` | banned member | self | `{ message }` → 201 AppealView. 422 `appeal_open` (at most one open appeal per ban, ticket 72) |
| POST | `/api/admin/bans/:id/appeals/:appealId/decision` | staff | administrator+ | `{ decision: 'approve' \| 'reject' }` → 200; approve lifts the ban; the member is notified (tickets 49/55) |

### 3.8 Notifications

| Method | URL | Authn | Authz | Request → Response / key errors |
| --- | --- | --- | --- | --- |
| GET | `/api/notifications` | member | self | `?page=&unreadOnly=` → `{ items, unreadCount }` (ticket 54) |
| POST | `/api/notifications/:id/read` | member | self | → 204 |
| POST | `/api/notifications/read-all` | member | self | → 204 |
| GET / PUT | `/api/notifications/preferences` | member | self | `{ prefs: { replyThread, replyParticipation, replyPost, mention, appealResolved, currencyBirthday, currencyInterest } }` → 200 / 204 (tickets 54/77) |

Real-time delivery: `WS /realtime` → the Durable Object notification hub. WebSocket upgrade is outside the REST surface and is documented separately for the navbar island (architecture § Real-time).

### 3.9 Configuration

| Method | URL | Authn | Authz | Request → Response / key errors |
| --- | --- | --- | --- | --- |
| GET | `/api/config` | all | n/a | → 200 public config: identity, registration mode, guest visibility, currency/shop settings, `sheet_fields`, enabled templates. No secrets and no AI key (ticket 58) |
| GET | `/api/admin/config` | staff | **webmaster only** | → 200 full `ForumConfiguration` (AI key masked, ADR-0002) |
| PATCH | `/api/admin/config` | staff | **webmaster only** | partial bodies per group (identity / registration / economy / shop / sheets / archive / default permissions / AI). AI: `{ aiEvaluationEnabled, aiCriteria, aiApiKey? }` — key is write-only. Toggling the birthday rule reveals the birth-date field (ticket 36) |
| GET | `/api/admin/stats` | staff | administrator+ | → 200 dashboard overview (members, threads, posts, pending queues, economy totals) |

### 3.10 Search & uploads

| Method | URL | Authn | Authz | Request → Response / key errors |
| --- | --- | --- | --- | --- |
| GET | `/api/search` | all | results filtered by `canRead`/visibility | `?q=&type=threads\|posts\|characters&boardId?&page=` via FTS5 → `{ items }` per type (ticket 56) |
| GET | `/api/characters/search` | member | self | `?q=` prefix match on `characters_search` → mention suggestions `[{ username, name, avatar }]` (ticket 27) |
| POST | `/api/uploads/images` | member | confirmed + active | `multipart/form-data file` → 201 `{ url, key }`; 413 `too_large`; 422 `unsupported_mime`; R2-backed. Avatar/banner PUTs accept the returned `url` |

## 4. Deliberately not REST endpoints

- **Cron jobs** (interest, birthday, soft-delete expiry) and **login-streak** application — internal module calls (`economy.runInterest`, `economy.runBirthday`, `economy.applyLoginStreak`, content soft-delete sweep).
- **Emailed-link landings** (`/register/confirm`, `/reset-password`, email-change) — Astro pages that post the token to the matching `/api/auth/*` confirm endpoints; email delivery goes through the Resend adapter.
- **Editor features** — content-format enrichment over the `content` payload, not new endpoints.

## 5. Accepted decisions at this revision

Confirmed defaults for design points the domain left open; revisitable only through a documented change.

1. **Pagination.** Offset `page`/`pageSize` for all list endpoints (adequate for forum scale); thread listings order by `last_post_at` desc with pinned first.
2. **Profile visibility.** `forum_configuration` gains a `hidden_profiles_from_visitors` boolean (no such column exists today); hideable public profiles return 404 to visitors. Structural change goes through a migration (AGENTS.md rule 26).
3. **Moderator economy scope** (ticket 45). A moderator may adjust a character only when the character authored content in a board inside the moderator's scope, or when the scope is global; `canEditEconomy` must also be granted at promotion.
4. **Username charset.** `[a-zA-Z0-9_-]{3,30}`, stored lowercase; uniqueness is case-insensitive.
5. **Error style.** Zod failures → 400 with `fieldErrors`; domain/state failures → 422; unique violations → 409; unauthenticated → 401; policy denial → 403. No success-body wrapper.
6. **Admin economy/shop ownership.** Shop item CRUD and earn-rule config → **webmaster only** (spec stories 49/50). Inventory/currency *adjustments* → administrator, or moderator with `canEditEconomy` + scope (ticket 45).

## 6. Traceability

- Entities, rules, invariants: `docs/domain-model.md` §2–§8; glossary: `CONTEXT.md`.
- Decisions: `docs/adr/0001` (character scope), `0002` (AI opt-in), `0003` (single tenant), `0004` (soft-delete window), `0005` (stack), `0006` (application architecture & module ownership).
- Module interfaces: `docs/architecture.md` § Backend modules.
- Persistence enums and delete behaviour: `docs/persistence-model.md`.
- Route map and authorized actors: `docs/routes.md`.
- Use cases: tickets 01, 03–27, 30–59 in `.scratch/initial-product-definition/issues/`.
- Not implemented: the public character directory (`.scratch/member-directory/`) is proposed, not accepted — no API surface here (AGENTS.md rules 16–17).