# Project F — Domain Model

Consolidated domain model of Project F, derived from the discovery interviews. The ubiquitous language lives in `CONTEXT.md` (the canonical glossary); this document records the entities, relationships, states, roles, rules, and invariants that the language refers to.

Domain context: a deployable web application for building customizable online roleplay forums. Each deployment is a single forum tenant owned and deployed by a web master (ADR-0003). Content, currency, and inventory are scoped to the character, not the account (ADR-0001).

## 1. Ubiquitous language

The canonical glossary is `CONTEXT.md`. This section indexes the terms by cluster and records the modeling notes where a glossary term needed a sharper boundary.

| Term | Notes |
| --- | --- |
| Member / Account | **One entity.** The glossary defines Member and Account circularly (Member is "identified by their account"; Account is "the member's main identity"). In the model they are a single aggregate: the account holder. "Account" refers to the identity facet (email, password, status); "Member" to the person as a participant. |
| Forum / Subforum | **One entity at different depths.** A Subforum is a Forum whose parent is a Forum; depth is constrained to 1. Both terms stay in the language; the invariant lives on a single entity. |
| Character | The fictional persona; the scope owner of content and economy. |
| Character sheet / Public character profile | Distinct: the sheet is the roleplay document (web master–defined fields); the profile is the public page projecting character data (name, avatar, banner, currency, inventory, bag, recent activity). |
| Inventory / Bag | Inventory is all items owned; Bag is the carried subset shown on posts. Both scoped to a character. |
| IC/OOC tag | A thread-level attribute, editable by creator or staff. |
| Rank | Permission level (Web master, Administrator, Moderator, User), independent of characters. |
| Moderation scope | The forums a moderator can act on, plus whether they may edit currency/inventory. Decided at promotion. |
| Registration mode | Open vs. approval-required admission of new accounts. |

## 2. Entities

### 2.1 Member (aggregate root)
Identity facet: email, password, confirmation state, approval state (when registration mode requires it), status, bans, ranks.
- `id`
- `email`
- `passwordHash`
- `confirmation` — `unconfirmed | confirmed`; confirmation link expires in 15 min; max 2 resends/hour
- `approval` — only when Registration mode is approval: `pending | approved | rejected`
- `status` — `active | inactive` (inactive: data preserved, profile shows notice, posting blocked until reactivated)
- `rank` — Web master | Administrator | Moderator | User
- `moderationScope` — for Moderator: set of forums + currency/inventory edit rights
- `notificationPreferences` — which notification types the member receives
- `characters` — 0..2
- `quickLogins` — stored login shortcuts for up to two characters, one per character

Account-level invariants: credentials are shared across the member's characters; changing email/password is global and takes effect on the next login.

### 2.2 Character
The fictional persona and the scope owner of content and economy.
- `id`
- `name` (character name — non-unique, spaces/symbols allowed)
- `username` — unique per forum; random on creation; one-time rename opportunity; used in mentions, search, URLs
- `avatar`, `banner` — upload or external URL
- `owner` — Member (0..2 per member)
- `sheet` — 0..1
- `currencyBalance`
- `inventory`, `bag`
- `birthDate` — present only when the web master enables the birthday earn rule; the field appears on the character at that point
- `status` — `active | deleted`; deletion removes inventory, currency, and public profile; posts remain visible with an unlinked display name
- `registeredAt`, `lastSeen`

### 2.3 Board (Category / Forum / Subforum)
One entity; depth determines the kind.
- `id`, `name`, `order`
- `parent` — null (Category) | Category (Forum) | Forum (Subforum)
- `permissions` — read/write per rank (Forum permissions)
- `hiddenFromVisitors` — whether the section is hidden from Visitors
- `contentLimits` — min/max characters per post, image policy (allowed / who may post images)
- `isArchive` — the special Archive forum

Invariant: nesting depth ≤ 1 (a Subforum cannot contain further subforums).

### 2.4 Thread
- `id`, `title`
- `board` — Forum or Subforum; loose threads do not exist
- `creator` — Character
- `icoocTag` — `IC | OOC`, editable by creator or staff
- `pinned` — flag; set by creator or moderator
- `state` — `open | closed | archived | soft-deleted`
- `moderationHistory` — visible entries ("edited/closed/... by X on date")

### 2.5 Post
- `id`
- `thread`
- `author` — Character
- `content` — BBCode and Markdown; images by URL or local upload; mentions `@username`; spoilers; quotes; multi-quotes; emojis; stickers; GIFs; WYSIWYG editor
- `state` — inherited from the thread

### 2.6 CharacterSheet
- `id`
- `character` — 1:1
- `data` — values for the web master–defined fields
- `template` — the SheetTemplate used
- `evaluation` — 0..1 (only when AI evaluation is enabled)
- public once created; required to post in IC forums (not required in OOC categories, where only the character account is required)

### 2.7 SheetTemplate
- `id`
- presentation variant (structure, blocks, view); the data fields are identical across templates and defined by the web master
- `enabled` — the web master decides which templates are available

### 2.8 SheetEvaluation
- `id`, `sheet`, `provider`, `result`, `criteriaVersion`, `ranAt`
- Only runs when the web master enabled AI evaluation and supplied their own API key (ADR-0002); when off, no member content leaves the forum

### 2.9 Item (shop catalog)
- `id`, `name`, `icon`
- `price`
- `stockModel` — `infinite | limited | unique`
- `stockRemaining` — when limited/unique
- `uniquePurchase` — whether the same character may buy it more than once
- `kind` — `inventoryItem | cosmetic` (profile cosmetics: avatar frames, profile backgrounds)

A refund restores limited stock globally (back to the shop).

### 2.10 InventoryEntry
- `character`, `item`, `quantity`
- lifecycle: `owned` → `sold` (fraction of price) | `refunded` (within 24 h of purchase) → removed
- Items are permanent once bought; they are used symbolically in roleplay threads.

### 2.11 BagEntry
- `character`, `item`, `quantity`
- a subset of InventoryEntry marked as carried; shown on the character's post profiles as icon + count

### 2.12 Transaction (economy ledger)
- `id`, `character`, `type` — `earn | purchase | sale | refund | adjust`
- `amount`, `item?`, `reason`, `actor` (system, staff, member), `occurredAt`
- feeds the economy log

### 2.13 EarnRule (forum economy config)
- `type` — `per-thread | per-post | login-streak | interest | birthday`
- `parameters` — e.g. reward amount, streak window, interest day and percentage
- `enabled`
- configured by the web master
- enabling the birthday rule adds the character's birth-date field; login streaks are measured per individual character

### 2.14 Ban
- `id`
- `target` — `email | ip`
- `reason` — mandatory; visible to the banned member and to staff
- `duration` — permanent or date range
- `createdBy` — staff member
- `arbitration` — required when the target is another staff member; a third Administrator must approve or reject
- `state` — `active | appealed | revoked | expired`
- `appeal` — 0..1

### 2.15 Appeal
- `id`, `ban`, `message`, `submittedAt`
- `state` — `open | approved | rejected`
- `decidedBy`, `decidedAt`
- resolved by an Administrator from the admin dashboard; resolution notifies the member

### 2.16 Notification
- `id`, `recipient` (member), `type`, `payload`, `read`, `createdAt`
- delivered in real time to the navbar; per-member preferences
- types: reply to your thread; reply to a thread you participate in; reply to your post; mention; ban appeal resolved; currency by birthday; currency by interest

### 2.17 ModerationAction (log entry)
- `id`, `actor` (staff), `type` — edit / close / open / archive / unarchive / delete / pin / move / currency-adjust / inventory-adjust / ban
- `target`, `note`, `occurredAt`
- surfaced as a visible message on threads ("edited/closed/... by X on date")
- feeds the staff log, the general log, and (for economy) the economy log

### 2.18 ForumConfiguration (single instance per deployment)
- identity: name, domain, cover images, colors
- registration mode, account confirmation policy
- currency settings and EarnRules
- shop settings: refund window (24 h), sell fraction
- soft-delete window (0–30 days; 0 = immediate)
- sheet field definitions and enabled SheetTemplates
- AI evaluation toggle and API key
- archive forum existence and visibility defaults

## 3. Value objects

- **CharacterName** — display name; not unique; spaces/symbols allowed
- **Username** — unique identifier; constraints: uniqueness, one-time rename
- **Email** — account identifier
- **Password** — stored hashed
- **CurrencyAmount** — a character's balance / transaction amounts
- **Percentage** — interest rate
- **DateRange** — ban duration range
- **Reason** — mandatory ban reason
- **Icon** — item icon reference
- **ImageRef** — uploaded file or external URL (avatar, banner, post images)
- **Threshold** — min/max post length per forum
- **ModerationScope** — set of forums + currency/inventory edit rights
- **StockModel** — infinite | limited | unique
- **QuickLogin** — character-bound stored credential shortcut

## 4. Relationships

- Member **1 — 0..2** Character (invariant: max 2)
- Character **1 — 0..1** CharacterSheet
- CharacterSheet **0..1 — 0..1** SheetEvaluation
- Character **1 — 0..1** SheetTemplate (used by sheet)
- Board (Category) **1 — 0..*** Board (Forum)
- Board (Forum) **0..1 — 0..*** Board (Subforum)
- Board **1 — 0..*** Thread
- Thread **1 — 0..*** Post
- Character **1 — 0..*** Thread (as creator)
- Character **1 — 0..*** Post (as author)
- Character **1 — 0..*** InventoryEntry
- Character **1 — 0..*** BagEntry
- Item **1 — 0..*** InventoryEntry
- Character **1 — 0..*** Transaction
- Member **1 — 0..*** Ban (as target) ; Ban **0..1 — 0..1** Appeal
- Member **1 — 0..*** Notification (as recipient)
- Member **1 — 0..*** ModerationAction (as actor)
- ForumConfiguration **1 — 1** (the deployment)

## 5. States

**Member.confirmation**: `unconfirmed → confirmed`

**Member.status**: `active ⇄ inactive`

**Member.approval** (registration mode = approval): `pending → approved | rejected`

**Character.status**: `active → deleted`

**Thread.state**:
- `open → closed` (staff reopens)
- `open | closed → archived` (moves to Archive forum, read-only; only an Administrator unarchives)
- `open | closed → soft-deleted` (moves to Archive forum for the configured window; after the window it stops being shown)
- `pinned` is an orthogonal flag, not a state transition

**Post**: inherits the thread state.

**InventoryEntry**: `owned → sold | refunded`

**Ban**: `active → appealed → approved | rejected` (an accepted appeal lifts the ban) ; `active → revoked | expired`

**Appeal**: `open → approved | rejected`

## 6. Roles

| Role | Scope | Capabilities (summary) |
| --- | --- | --- |
| **Visitor** | not a member | reads the whole forum by default; the web master may hide sections (categories, forums, public profiles) |
| **User rank** | member | reads/writes where Forum permissions allow; creates and edits own threads and profile; no staff actions |
| **Moderator** | member + moderation scope | edits, closes, opens, archives, deletes, pins, moves threads; edits currency and inventory from public profiles (if granted at promotion); bans (with arbitration when targeting staff) |
| **Administrator** | member | all moderator actions plus: create categories and forums; modify currency and inventory; view logs; ban; resolve appeals. Cannot change forum configuration and cannot promote staff. |
| **Web master** | member, unique | total control of the forum and its members: forum configuration, staff promotion, everything the Administrator can do. |

## 7. Business rules

- **Characters**: max 2 per member; a third requires deleting an old one. Usernames unique per forum; character names are not. One-time username rename.
- **Content**: threads always belong to a board. Sheet required to post in IC forums; OOC posting requires only the character account.
- **Moderation**: closing blocks replies (staff reopens); archiving is permanent and read-only (only an Administrator unarchives); every staff moderation action is recorded and shown on the thread.
- **Deletion**: soft delete sends threads/posts to the Archive forum for a web master–configured window (0–30 days; 0 = immediate, never shown); after the window they stop being shown. Archived threads remain indefinitely.
- **Economy**: currency and inventory belong to the character. Items are permanent once bought. Refunds only within 24 hours of purchase; refunding a limited-stock item restores that stock globally. Sell-back returns a fraction of the purchase price. Stock can be infinite, limited, or unique; unique purchase may be enforced per character. Earn rules (per thread, per post, login streak, interest, birthday) are configurable by the web master; login streaks are measured per character. Currency already granted is not clawed back when the granting thread or post is later deleted.
- **Bans**: measure of last resort by any staff; target is either the registered email or the IP; banning an IP blocks the whole IP, including visitors. Reason is mandatory and visible to the banned member and staff. Duration is permanent or a date range. Banning a staff member requires a third Administrator as arbiter. Quick login still validates that the account's email is not banned.
- **Appeals**: banned members can appeal; appeals are resolved (approved or rejected) by an Administrator from the admin dashboard.
- **Accounts**: registration is open or approval-required (web master choice). Confirmation link expires after 15 min; max 2 resends/hour. Changing email/password is global across characters. An inactive account keeps its data, shows an "inactive" notice, and cannot interact with threads or posts; it may still browse, use settings, receive notifications, and use quick login. Account deletion removes profile, currency, inventory, and user identity; posts remain visible with an unlinked name.
- **Visitors**: read the whole forum by default; the web master can hide sections.
- **Forum content**: per-forum minimum/maximum post length and image policy (allowed, and which ranks may post images).
- **AI evaluation**: only runs when enabled and an API key is supplied by the web master (ADR-0002).

## 8. Invariants

1. A member has at most 2 characters.
2. Usernames are unique per forum.
3. A thread always belongs to a forum or subforum.
4. Board nesting depth ≤ 1.
5. Currency and inventory are scoped per character, never shared across a member's characters.
6. An archived thread is read-only; only an Administrator unarchives.
7. A closed thread cannot receive new posts; only staff reopens.
8. A soft-deleted thread is removed from the forum after the configured window (0–30 days).
9. Every staff moderation action is recorded with actor and timestamp.
10. Every ban records a mandatory reason.
11. A ban by IP covers all access from that IP, registered or not.
12. A refund is only possible within 24 hours of purchase.
13. Exactly one member holds the Web master rank.
14. Sheet data fields are identical across templates for a given forum (templates differ only in presentation).

## 9. Aggregate boundaries

- **Member aggregate** — Member, its Characters, InventoryEntries, BagEntries, currency, Sheet, quick logins. Enforces: max 2 characters, per-character economy, identity invariants.
- **Thread aggregate** — Thread, its Posts, ModerationActions. Enforces: state transitions, moderation history, post state inheritance.
- **Board aggregate** — Category, Forums, Subforums, Forum permissions, content limits, visitor visibility. Enforces: depth ≤ 1, permission model.
- **Shop aggregate** — Item catalog, InventoryEntry lifecycle, Transaction ledger, EarnRules. Enforces: stock, unique purchase, refund window, sell fraction.
- **Ban aggregate** — Ban and Appeal. Enforces: mandatory reason, arbitration, appeal lifecycle.
- **Notification aggregate** — Notification records and member preferences.
- **ForumConfiguration** — single configuration root per deployment.

## 10. Resolved ambiguities

Previously open points, now decided:

1. **Birthday-based economy** — the birth-date field exists on the character only when the web master enables the birthday earn rule; otherwise the rule does not apply.
2. **Login streak scope** — measured per individual character.
3. **Economy on deleted content** — currency granted is not clawed back when the granting thread or post is deleted; refunding a limited-stock item restores the stock globally.
4. **Inactive account breadth** — may browse, use settings, receive notifications, and use quick login; only interaction with threads and posts is blocked.
5. **Quick login** — up to two characters per member (one per character), all shown in the quick login list.
