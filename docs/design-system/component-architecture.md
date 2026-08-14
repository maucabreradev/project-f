# Project F — Component Architecture (Atomic Design)

Status: accepted

The approved component architecture for Project F, organized with Atomic Design: **Atoms → Molecules → Organisms → Templates → Pages**. It is a design document only — no components are implemented here. It is the canonical component catalog; `components.md` holds the per-component design detail (states, tokens), `layout.md` the layout/motion, `tokens.md` the tokens, `accessibility.md` the a11y baseline.

Every entry defines: **responsibility, props, events, variants, reusability**. Project F follows AGENTS.md rule 21 — no artificial components; external primitives are consumed directly, never wrapped.

## 1. Conventions

### 1.1 Dual nature: SSR vs island

The stack (ADR-0005) is Astro SSR with SolidJS islands. Each component is one of two natures:

| Marker | Nature | Rules |
| --- | --- | --- |
| `[SSR]` | Server-rendered (Astro) | Serializable props + optional `slot`; no DOM events (links/forms are native). Rendering never depends on hydration. |
| `[Island]` | Client-hydrated (SolidJS, `client:*`) | Props include data + render callbacks; events are `on*` handlers. Hydrates only where interactivity earns its cost. |

Pages stay readable without JS: islands enhance, never gate, SSR content (see `accessibility.md` §1).

### 1.2 Props / events schema

- **Props** are written as TypeScript-shaped pseudo-signatures (no code is produced here); required vs optional is explicit.
- **Events** are named `onX` for islands. SSR components that need an action use a native `<form action>` or a link — they declare no events.
- Reuse of a component never changes its API; variations come from **variants**, not ad-hoc props.

### 1.3 No artificial components

- Shadcn-solid/Kobalte primitives are **consumed directly** (`components.md` §16, AGENTS.md rule 21). They are listed in §2 as a contract — they are not Project F components and hold no entry.
- A new Project F component is justified only when it adds behavior, a business pattern, or a composition that repeats across surfaces. When in doubt: use the primitive; if the same composition repeats 2+ times, promote it to a molecule.

### 1.4 Placement

```
apps/web/src/
├── components/
│   ├── atoms/        # presentational, one job
│   ├── molecules/    # compose a few atoms, single responsibility
│   ├── organisms/    # self-contained sections, may be islands
│   └── templates/    # page layouts with slots
├── islands/          # client-only wrappers the navbar/editor/shop demands
└── pages/            # route files (routes.md) composing templates
```

Atoms/molecules are SSR unless marked `[Island]`. Organisms may be islands; templates and pages are SSR composition (pages fetch data through `hc` per `../architecture.md`).

### 1.5 Reusability

| Value | Meaning |
| --- | --- |
| `reusable` | Used in 2+ pages/surfaces; lives in the shared tree. |
| `scoped` | Used in one surface or one domain cluster; still in the shared tree but with a narrow API. |
| `page-local` | Composed only on its owning page; co-located (not a reusable export). |

## 2. Consumed primitives (shadcn-solid / Kobalte)

Contract: these exist and are used **as shipped** in `apps/web` — no wrapper, no fork, no restyle beyond tokens. Variants/events come from the library.

`Button`, `Badge`, `Label`, `Input`, `Textarea`, `Select`, `Switch`, `Checkbox`, `RadioGroup`, `Separator`, `Spinner`, `Skeleton`, `Tooltip`, `Card`, `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `DropdownMenu`, `Tabs`, `Table`, `Breadcrumb`, `Field`, `Form` (Zod), `Alert`, `Sonner` (toast), `Pagination`.

## 3. Atoms

### Avatar `[SSR]`
- **Responsibility**: display a character/account image with a monogram fallback and correct alt text.
- **Props**: `src?: string`, `alt: string` (character name; `alt=""` when purely decorative), `size: 'xs'|'sm'|'md'|'lg'|'xl'`, `shape: 'circle'|'rounded'`, `fallback: string`.
- **Events**: none.
- **Variants**: sizes; circle (threads/profiles) vs rounded-square (post-profile thumbs).
- **Reusable**: `reusable`.

### Currency `[SSR]`
- **Responsibility**: render a numeric balance with `tabular-nums` and the configured currency unit.
- **Props**: `amount: number`, `unit: string`, `size: 'sm'|'md'`, `compact?: boolean`, `tone?: 'default'|'muted'`.
- **Events**: none.
- **Variants**: `compact` (navbar pill), `ledger` (economy page, signed amounts).
- **Reusable**: `reusable`.

### RankTag `[SSR]`
- **Responsibility**: present a rank as a colored badge (soft state pair).
- **Props**: `rank: 'webmaster'|'administrator'|'moderator'|'user'`.
- **Events**: none.
- **Variants**: one per rank (primary/info/warning/neutral).
- **Reusable**: `reusable`.

### Tag `[SSR]`
- **Responsibility**: thread-level mark chip.
- **Props**: `kind: 'ic'|'ooc'|'pin'|'spoiler'`, `label?: string` (defaults per kind).
- **Events**: none.
- **Variants**: per kind; `outline` option for quiet contexts.
- **Reusable**: `reusable` (ThreadRow, thread header, search results).

### StatusChip `[SSR]`
- **Responsibility**: account/thread status indicator (never color-only).
- **Props**: `status: 'active'|'inactive'|'pending'|'banned'|'unconfirmed'|'closed'|'archived'|'deleted'`.
- **Events**: none.
- **Variants**: per state; always with `sr-only` companion text (`accessibility.md` §6).
- **Reusable**: `reusable`.

### UserLink `[SSR]`
- **Responsibility**: link to a character profile by username.
- **Props**: `name: string`, `username: string`, `as?: 'text'|'avatar'|'avatar-name'`, `className?`.
- **Events**: none (native navigation).
- **Variants**: text-only, avatar-only, avatar+name.
- **Reusable**: `reusable`.

### PostMeta `[SSR]`
- **Responsibility**: single metadata line (author + relative date + optional edited marker).
- **Props**: `author: UserLink data`, `date: Date`, `editedAt?: Date`, `size?: 'xs'|'sm'`.
- **Events**: none.
- **Variants**: default, compact (dense lists).
- **Reusable**: `reusable`.

### Icon `[SSR] | [Island]`
- **Responsibility**: typed wrapper over the single line-icon set (lucide-solid) enforcing one family.
- **Props**: `name: IconName`, `size?: number`, `ariaHidden?: boolean`, `className?`.
- **Events**: none (decorative; interactive icons live on buttons/links).
- **Variants**: none (per-icon).
- **Reusable**: `reusable`.

## 4. Molecules

### SearchField `[Island]`
- **Responsibility**: text search input with icon, clear, and debounced submit.
- **Props**: `placeholder: string`, `initial?: string`, `compact?: boolean`, `loading?: boolean`, `query: string`, `onSearch(q: string): void`.
- **Events**: `onSearch`; `onClear`.
- **Variants**: `navbar` (collapses to drawer on mobile), `board` (inline filter), `global` (dedicated route).
- **Reusable**: `reusable`.

### BalancePill `[SSR]`
- **Responsibility**: navbar/economy currency chip linking to the active character's balance.
- **Props**: `balance: number`, `unit: string`, `href: string`.
- **Events**: none (anchor).
- **Variants**: default (navbar), raised (economy header).
- **Reusable**: `reusable`.

### BreadcrumbStrip `[SSR]`
- **Responsibility**: hierarchy breadcrumb composed from shadcn `Breadcrumb`.
- **Props**: `items: { label: string; href?: string }[]`.
- **Events**: none.
- **Variants**: board hierarchy (`home / category / forum`), admin (`home / admin / tab`).
- **Reusable**: `reusable`.

### StatusBanner `[SSR] | [Island]`
- **Responsibility**: contextual inline notice (unconfirmed reminder with resend, inactive notice, soft-delete notice).
- **Props**: `kind: 'info'|'warning'|'destructive'|'success'`, `title: string`, `body?: string`, `actionLabel?: string`, `onAction?(): void`.
- **Events**: `onAction` (e.g., resend confirmation).
- **Variants**: per kind; `dismissible`.
- **Reusable**: `reusable` (home, profile, account).

### InlineError `[SSR]`
- **Responsibility**: single field error tied to its control.
- **Props**: `id: string`, `message: string`.
- **Events**: none (referenced via `aria-describedby`).
- **Variants**: none.
- **Reusable**: `reusable` (via shadcn `Field`/`Form` composition).

### CharacterCounter `[SSR]`
- **Responsibility**: `current / max` counter for content-limit fields (flow 07).
- **Props**: `current: number`, `max: number`, `tone?: 'muted'|'warning'|'destructive'`.
- **Events**: none.
- **Variants**: per tone threshold (90% → warning, cap → destructive).
- **Reusable**: `reusable`.

### ThreadRow `[SSR]`
- **Responsibility**: summary row of a thread in board/search/profile listings.
- **Props**: `thread: { title: string; tags: TagKind[]; author: string; replyCount: number; lastReply?: { by: string; at: Date }; state: ThreadState }`, `href: string`, `compact?: boolean`.
- **Events**: none (native navigation).
- **Variants**: `compact` (dense board list), `expanded` (with pin/lock markers).
- **Reusable**: `reusable` (ForumPage, SubforumPage, GlobalSearch, Profile recent threads).

### BoardRow `[SSR]`
- **Responsibility**: forum/subforum row with description, subforums, and last activity.
- **Props**: `board: { name: string; description?: string; subforums: string[]; lastActivity?: string }`, `href: string`.
- **Events**: none.
- **Variants**: `row` (dense listing), `card` (tiled interactive card — see BoardCard alias).
- **Reusable**: `reusable` (CategorySection, admin boards tab).

### PostProfile `[SSR]`
- **Responsibility**: the character header of a single post — avatar, name, rank, bag, balance, profile link.
- **Props**: `character: { name: string; username: string; avatar?: string; rank: Rank; bag?: BagEntry[]; balance?: number; unit?: string }`, `quiet?: boolean`.
- **Events**: none.
- **Variants**: `default`, `quiet` (omit bag/balance when absent).
- **Reusable**: `reusable` (PostCard; optional in quote blocks).

### PostContent `[SSR]`
- **Responsibility**: render sanitized editor output (post body) with safe HTML and word/character count.
- **Props**: `html: string` (sanitized server-side), `limits?: { min: number; max: number }`, `maxLengthNote?: boolean`.
- **Events**: none.
- **Variants**: full, truncated (preview mode).
- **Reusable**: `reusable` (PostCard, ThreadPost preview, moderation view).

### QuoteBlock `[SSR]`
- **Responsibility**: rendered quote of a previous post.
- **Props**: `author: string`, `content: string`, `link?: string`.
- **Events**: none.
- **Variants**: single quote, nested (depth > 1 collapses).
- **Reusable**: `reusable`.

### TransactionRow `[SSR]`
- **Responsibility**: one economy ledger entry.
- **Props**: `entry: { type: 'earn'|'purchase'|'sale'|'refund'|'adjust'; amount: number; reason?: string; actor?: string; at: Date }`.
- **Events**: none.
- **Variants**: per type (amount sign + soft color).
- **Reusable**: `reusable` (EconomyLedger, admin economy).

### ShopItemCard `[SSR] | [Island]`
- **Responsibility**: shop tile — icon, name, price, stock model.
- **Props**: `item: { id: string; name: string; icon: string; price: number; stock: 'infinite'|'limited'|'unique'; remaining?: number; affordable?: boolean }`, `onOpen?(id: string): void`, `onBuy?(id: string): void`.
- **Events**: `onOpen`, `onBuy`.
- **Variants**: `affordable` / `soldOut` / `uniquePurchased`.
- **Reusable**: `reusable` (ShopCatalog, item results).

### InventoryRow / BagItemRow `[Island]`
- **Responsibility**: inventory/bag item with quantity and actions (equip/unequip, sell, refund).
- **Props**: `entry: { itemId: string; name: string; icon: string; quantity: number; kind: 'inventory'|'cosmetic'; refundable: boolean }`, `onSell(id, qty)`, `onRefund(id)`, `onToggleBag(id)`.
- **Events**: `onSell`, `onRefund`, `onToggleBag`.
- **Variants**: inventory (full actions), bag (carry/remove).
- **Reusable**: `scoped` (InventoryPanel).

### CharacterCard `[SSR]`
- **Responsibility**: directory entry — avatar, name, username, last seen, status.
- **Props**: `character: { name: string; username: string; avatar?: string; lastSeen: Date; status: 'active'|'inactive' }`, `href: string`.
- **Events**: none.
- **Variants**: grid tile, list row.
- **Reusable**: `scoped` (MemberDirectory).

### PaginationControls `[SSR]`
- **Responsibility**: paged navigation wrapping shadcn `Pagination`.
- **Props**: `page: number`, `pageCount: number`, `baseHref: string` (SSR) — or `onChange(page)` when used inside an island.
- **Events**: `onChange` ([Island] usage).
- **Variants**: default, compact (small result sets).
- **Reusable**: `reusable`.

### NotificationItem `[SSR]`
- **Responsibility**: single notification row with type icon, text, time, read state.
- **Props**: `notification: { id: string; type: string; text: string; at: Date; unread: boolean; href?: string }`.
- **Events**: none (wrapper link).
- **Variants**: per type icon; read/unread background.
- **Reusable**: `scoped` (NotificationCenter).

### EmptyState `[SSR]`
- **Responsibility**: flat empty-state block — icon, title, description, optional single CTA.
- **Props**: `icon: IconName`, `title: string`, `description?: string`, `action?: { label: string; href?: string }`.
- **Events**: none.
- **Variants**: none (content-driven).
- **Reusable**: `reusable` (every empty list: boards, threads, search, inventory, notifications, admin queues).

## 5. Organisms

### FloatingNavbar `[Island]`
- **Responsibility**: the sticky glass navbar — forum identity, search, real-time notifications, character switcher, balance, avatar menu; grows a blur surface on scroll (`layout.md` §2).
- **Props**: `identity: { name: string; logoSrc?: string }`, `session: { status: 'visitor'|'member' }`, `member?: { avatar?: string; username: string; characters: CharacterShort[]; notifications: { count: number }; balance?: { amount: number; unit: string } }`, `accentHrefs: { account: string; economy: string; shop: string; inventory: string; admin?: string }`, `onLogout(): void`.
- **Events**: `onLogout`, `onSwitchCharacter(id)`, `onNavigate(href)` (drawer).
- **Variants**: `visitor` (login/register), `member`, `mobile` (drawer via Sheet).
- **Reusable**: `page-local` (BaseTemplate/Home only — the shared chrome lives in the layout, `layout.md`).

### NotificationCenter `[Island]`
- **Responsibility**: real-time bell with unread count, dropdown list, mark-read, per-member prefs entry point (tickets 54/55).
- **Props**: `initial: NotificationItem[]`, `unreadCount: number`, `prefsHref: string`, `onMarkRead(id)`, `onMarkAll()`, `onOpenItem(id)`.
- **Events**: `onMarkRead`, `onMarkAll`, `onOpenItem`.
- **Variants**: none (mounted from navbar).
- **Reusable**: `scoped` (navbar interaction; feeds from the realtime hub).

### CharacterSwitcher `[Island]`
- **Responsibility**: switch between the member's characters without logging out (flow 06).
- **Props**: `characters: { id: string; name: string; username: string; avatar?: string; active: boolean }[]`, `onSwitch(id)`.
- **Events**: `onSwitch`.
- **Variants**: none (hidden with 1 character; not rendered on visitor).
- **Reusable**: `scoped` (navbar).

### AvatarMenu `[Island]`
- **Responsibility**: avatar dropdown — account, economy, shop, inventory, admin (rank-filtered), logout.
- **Props**: `member: { avatar?: string; username: string; rank: Rank }`, `items: { label: string; href: string; show: boolean }[]`, `onLogout(): void`.
- **Events**: `onLogout`, navigation via items.
- **Variants**: none.
- **Reusable**: `scoped` (navbar).

### ForumHero `[SSR]`
- **Responsibility**: the full-width home banner — web master cover/identity and session CTA (flow 13, `layout.md` §4); stats live in the separate `ForumStats` strip.
- **Props**: `identity: { name: string; cover?: string; accent: string; tagline?: string }`, `session: { status: 'visitor'|'member' }`.
- **Events**: none.
- **Variants**: `cover` (configured image + tint overlay), `gradient` (placeholder when no cover).
- **Reusable**: `page-local` (home only).

### ForumStats `[SSR]`
- **Responsibility**: home stats strip — member, thread, and post counts (flow 13).
- **Props**: `stats: { members?: number; threads?: number; posts?: number }`.
- **Events**: none.
- **Variants**: none.
- **Reusable**: `page-local` (home only; sits over the hero or under it per `layout.md` §7).

### RecentActivity `[SSR]`
- **Responsibility**: chronological activity feed — latest threads and posts across visible boards (home), recent threads and replies of a character (profile, route `/member/<username>`), honoring visibility.
- **Props**: `items: { type: 'thread'|'post'; title: string; href: string; by: string; at: Date; excerpt?: string }[]`, `compact?: boolean`.
- **Events**: none.
- **Variants**: `feed` (home, excerpt-rich), `compact` (profile list).
- **Reusable**: `reusable` (home + profile).

### BoardStructure `[SSR]`
- **Responsibility**: the forum tree — categories with their forums/subforums, each with description and last activity; respects visitor visibility (flow 14).
- **Props**: `sections: { category: { name: string; href: string }; forums: BoardRow[] }[]`.
- **Events**: none.
- **Variants**: `home` (full structure), `categoryOnly` (board pages).
- **Reusable**: `reusable` (home + category/forum pages).

### ThreadList `[SSR]`
- **Responsibility**: ordered thread list with filter/sort controls and pagination; empty state when none.
- **Props**: `threads: ThreadRow[]`, `filters?: { sort: string; active?: string }`, `pagination: { page; pageCount; baseHref }`, `emptyState: EmptyState props`, `onFilter?(f)`.
- **Events**: `onFilter` ([Island] when client filter).
- **Variants**: none (composes ThreadRow + PaginationControls + EmptyState).
- **Reusable**: `reusable` (forum, subforum, search).

### PostCard `[SSR]` (+ inline actions `[Island]`)
- **Responsibility**: one post in a thread — PostProfile + PostContent + action row (quote, multi-quote) + moderation history footer.
- **Props**: `post: { id; author profile; contentHtml; state; history?: { at; by; action }[] }`, `canModerate: boolean`, `onQuote?(id)`, `onMultiQuote?(id)`, `onModerate?(action)`.
- **Events**: `onQuote`, `onMultiQuote`, `onModerate` (island sub-controls).
- **Variants**: `default`, `first` (thread opener emphasis), `deleted` (unlinked name).
- **Reusable**: `reusable` (ThreadPage, quote previews).

### PostComposer `[Island]`
- **Responsibility**: reply/quote/multi-quote composer wrapping the WYSIWYG editor + content limits + submit (flows 08/09, ticket 26).
- **Props**: `threadId: string`, `limits?: { min; max }`, `initial?: { type: 'reply'|'quote'|'multiQuote'; sourceIds: string[] }`, `onSubmit(payload)`, `onCancel()`.
- **Events**: `onSubmit`, `onCancel`, editor events delegated to editor island.
- **Variants**: `reply`, `quote`, `multiQuote` (banner listing quoted posts).
- **Reusable**: `scoped` (ThreadPage).

### NewThreadForm `[Island]`
- **Responsibility**: thread creation — title, IC/OOC tag, WYSIWYG body, sheet gate on IC boards (flow 08, tile 19).
- **Props**: `boardId: string`, `board: { requiresSheet: boolean; sheetAvailable?: boolean; limits; canTag: boolean }`, `onSuccess(threadId)`, `onCancel()`.
- **Events**: `onSuccess`, `onCancel`, `onSubmit` (Zod-validated).
- **Variants**: none.
- **Reusable**: `page-local` (NewThreadPage).

### LoginForm `[Island]`
- **Responsibility**: email+password sign-in with validation, plus post-login character handling (flow 02).
- **Props**: `quickLogins?: QuickLogin[]`, `characters: CharacterShort[]`, `bootstrap?: boolean`, `onSuccess(next?)`, `onForgot()`, `onRegister()`.
- **Events**: `onSuccess`, `onQuickLogin(id)`, `onForgot`, `onRegister`.
- **Variants**: `default`, `withQuickLogin` (list), `postLogin` (character picker 1→direct, 2→picker, 0→force create).
- **Reusable**: `page-local` (LoginPage).

### RegisterForm `[Island]`
- **Responsibility**: account sign-up (email + password + confirm) with validation (flow 01).
- **Props**: `mode: 'open'|'approval'`, `onSuccess()`, `onLogin()`.
- **Events**: `onSuccess`, `onLogin`.
- **Variants**: none.
- **Reusable**: `page-local` (RegisterPage).

### ResetRequestForm `[Island]` / ResetPasswordForm `[Island]`
- **Responsibility**: forgot-password (request) and new-password (token) forms (flow: routes `/forgot-password`, `/reset-password`).
- **Props (request)**: `onSent()`. **Props (reset)**: `token: string`, `onSuccess()`.
- **Events**: `onSent`, `onSuccess`, submit.
- **Variants**: none.
- **Reusable**: `page-local` each.

### CharacterCreationForm `[Island]`
- **Responsibility**: character creation — name, username (random + one-time rename), optional avatar/banner, optional sheet (flow 03).
- **Props**: `freeSlots: number`, `sheetRequired?: boolean`, `onSuccess(characterId)`, `onCancel()`.
- **Events**: `onSuccess`, `onCancel`, `onSubmit`.
- **Variants**: none.
- **Reusable**: `page-local` (CharacterCreatePage).

### AccountTabs `[Island]`
- **Responsibility**: account configuration — Account tab (credentials, status, notification prefs, quick logins, deletion) and Character tab (name, username rename, avatar/banner) (flow 04).
- **Props**: `account: AccountConfig`, `characters: CharacterConfig[]`, `onSave(section, data)`, `onChangePassword()`, `onDeleteAccount()`, `onRenameUsername(id)`, `onUploadAvatar/Banner(id, file|url)`.
- **Events**: per above; form sub-blocks emit on submit.
- **Variants**: none (tabs).
- **Reusable**: `page-local` (AccountPage).

### CharacterSheetEditor `[Island]`
- **Responsibility**: create/edit character sheet — web master–defined fields, template picker, AI evaluation toggle when enabled (flows: route `/sheet/<id>/edit`, tickets 50/51/53).
- **Props**: `schema: SheetFieldDef[]`, `templates: { id; name }[]`, `aiEnabled: boolean`, `initial?: SheetDraft`, `onSave(draft)`, `onSubmitForEvaluation()`, `onCancel()`.
- **Events**: `onSave`, `onSubmitForEvaluation`, `onCancel`.
- **Variants**: `create`, `edit`.
- **Reusable**: `scoped` (SheetEditPage; form reused for draft re-edit).

### SheetViewer `[SSR]`
- **Responsibility**: render a published sheet through its template.
- **Props**: `sheet: SheetData`, `template: string`.
- **Events**: none.
- **Variants**: per enabled template.
- **Reusable**: `scoped` (SheetPage, post-profile preview).

### ShopCatalog `[Island]`
- **Responsibility**: shop listing with category filter, affordable state, pagination (flow 12).
- **Props**: `items: ShopItemCard[]`, `balance: number`, `unit: string`, `pagination`, `onOpenItem(id)`, `onBuy(id)`.
- **Events**: `onOpenItem`, `onBuy`.
- **Variants**: `grid` (default), `list`.
- **Reusable**: `page-local` (ShopPage).

### ItemDetailDialog `[Island]`
- **Responsibility**: item detail + purchase confirmation in a Dialog (stock rules, unique purchase, confirm debit) (ticket 38).
- **Props**: `item: ItemDetail`, `balance: number`, `unit: string`, `onBuy()`, `onClose()`.
- **Events**: `onBuy`, `onClose`.
- **Variants**: `available` / `soldOut` / `alreadyPurchased`.
- **Reusable**: `scoped` (ShopPage, mounted on item open).

### InventoryPanel `[Island]`
- **Responsibility**: inventory/bag views — the owner's manager (lists, equip/unequip bag, sell-back, refund within window, tickets 39/40, route `/inventory`) and the public read-only view on the character profile.
- **Props**: `entries: InventoryRow[]`, `bagIds: string[]`, `refundWindowOpen: boolean`, `readOnly?: boolean`, `onSell`, `onRefund`, `onToggleBag`, `onApplyCosmetic`.
- **Events**: `onSell`, `onRefund`, `onToggleBag`, `onApplyCosmetic` (absent in `readOnly`).
- **Variants**: `manager` (`/inventory`: inventory tab, bag tab, actions), `readOnly` (public profile view, no actions).
- **Reusable**: `scoped` (InventoryPage, ProfilePage).

### EconomyLedger `[SSR]`
- **Responsibility**: active character balance header + transaction table (flow 11, route `/economy`).
- **Props**: `balance: number`, `unit: string`, `entries: TransactionRow[]`, `earnRules?: string[]`.
- **Events**: none.
- **Variants**: none.
- **Reusable**: `page-local` (EconomyPage).

### MemberDirectory `[Island]`
- **Responsibility**: searchable character directory — grid of CharacterCards, FTS search, pagination; visitor gating per config (proposed flow 10).
- **Props**: `characters: CharacterCard[]`, `query?: string`, `pagination`, `onSearch(q)`, `onPage(p)`.
- **Events**: `onSearch`, `onPage`.
- **Variants**: `grid`, `list`.
- **Reusable**: `page-local` (DirectoryPage).

### ProfileHeader `[SSR]`
- **Responsibility**: character public profile header — banner, avatar, name/username, rank, meta, edit actions for owner, moderation for staff (route `/member/<username>`).
- **Props**: `character: { name; username; avatar?; banner?; rank; registeredAt; lastSeen; status }`, `balance?`, `canEdit: boolean`, `canModerate: boolean`, `onEdit?()`, `onModerate?()`.
- **Events**: `onEdit`, `onModerate` ([Island] actions).
- **Variants**: `active` / `inactive` (notice) / hidden-from-visitors (absent render).
- **Reusable**: `scoped` (ProfilePage).

### GlobalSearch `[Island]`
- **Responsibility**: global search UI over threads, posts, and characters with per-thread search (tickets 56/57).
- **Props**: `query: string`, `results: { threads: ThreadRow[]; posts: PostCard[]; characters: CharacterCard[] }`, `pagination`, `onSearch(q)`, `onPage(p)`, `onOpenResult(href)`.
- **Events**: `onSearch`, `onPage`, `onOpenResult`.
- **Variants**: `global` (grouped results), `withinThread` (compact).
- **Reusable**: `scoped` (search page, thread search).

### AdminShell `[Island]`
- **Responsibility**: tabbed admin dashboard — Overview, Members, Boards, Economy, Shop, Sheets, Bans & Appeals, Logs, Settings; rank-filtered and hard-403 gated (flow 07, paths per `../routes.md`).
- **Props**: `tabs: AdminTab[]` (each: key, label, badge?, canAccess), `active: string`, `onSelect(tab)`, `children` per tab (AdminPanel/DataTable compositions supplied by the page).
- **Events**: `onSelect`.
- **Variants**: none.
- **Reusable**: `page-local` (AdminPage).

### AdminPanel `[SSR]`
- **Responsibility**: generic admin section wrapper — title, optional actions slot, content, pending-queue badge.
- **Props**: `title: string`, `description?: string`, `badge?: number`, `actions?: slot`, `children`.
- **Events**: none.
- **Variants**: none.
- **Reusable**: `reusable` (all admin tabs).

### DataTable `[SSR] | [Island]`
- **Responsibility**: dense admin table — columns, sortable headers, pagination, row actions (members, catalog, bans, logs).
- **Props**: `columns: ColumnDef[]`, `rows: Row[]`, `sortable?: boolean`, `paginated?: boolean`, `pagination?`, `onSort(col)`, `onPage(p)`, `onRowAction(action, row)`.
- **Events**: `onSort`, `onPage`, `onRowAction`.
- **Variants**: `list` (default), `queue` (approvals/appeals with primary action).
- **Reusable**: `reusable` across admin tabs.

### PermissionsMatrix `[Island]`
- **Responsibility**: per-rank read/write matrix per board, with visitor visibility toggle (flows 07/17, tickets 09/10).
- **Props**: `ranks: Rank[]`, `matrix: Record<Rank, { read: boolean; write: boolean }>`, `visitorHidden: boolean`, `onChange(rank, perm, value)`, `onToggleVisitor(value)`.
- **Events**: `onChange`, `onToggleVisitor`.
- **Variants**: `board` (edit one board), `defaults` (web master default matrix).
- **Reusable**: `scoped` (Boards tab, Settings tab).

### ModerationInline `[Island]`
- **Responsibility**: inline moderation tools on boards/threads within scope — pin, close/open, archive, move, delete (tickets 20–24).
- **Props**: `target: { type: 'thread'|'post'; id: string }`, `scope: ModerationScope`, `actions: ModerationAction[]`, `onAction(action)`, `onConfirm(action)`.
- **Events**: `onAction`, `onConfirm` (destructive → AlertDialog).
- **Variants**: `thread`, `post`.
- **Reusable**: `reusable` (board list rows, thread header, post actions).

### BanInterstitial `[SSR]` (+ appeal form `[Island]`)
- **Responsibility**: full-page shutter replacing all content for banned email/IP — mandatory reason, duration, appeal option (flow: `/banned`, inline on every route).
- **Props**: `ban: { reason: string; target: 'email'|'ip'; duration: 'permanent'|'until'; until?: Date }`, `appeal: { status: 'none'|'open'|'approved'|'rejected' }`, `onAppeal(submission)`.
- **Events**: `onAppeal`.
- **Variants**: none.
- **Reusable**: `page-local` (BannedPage; the shutter is a layout-level interstitial).

## 6. Templates

Templates are layout skeletons with **slots**; pages fill slots and supply data. They define order, spacing rhythm (`layout.md` §7), and responsive behavior; they hold no domain logic.

### BaseTemplate
- **Responsibility**: global shell — skip link, FloatingNavbar slot, main content slot, footer, View Transitions wiring (`layout.md` §1).
- **Slots**: `navbar`, `default` (main), `footer`.
- **Props**: `title`, `description`, session data.
- **Reuse**: `page-local` wrapper used by every page.

### HomeTemplate
- **Slots**: `hero` (ForumHero), `banners` (StatusBanner), `structure` (BoardStructure), `recent` (RecentActivity), `stats`.
- **Reuse**: `page-local` (HomePage).

### BoardTemplate
- **Slots**: `breadcrumb`, `header` (name/description/action), `subforums?`, `threads` (ThreadList), `pagination`.
- **Reuse**: `reusable` (category, forum, subforum pages).

### ThreadTemplate
- **Slots**: `breadcrumb`, `title` (+tags/state), `posts` (`PostCard[]`), `composer` (PostComposer), `moderation` (ModerationInline), `sidebar?`.
- **Reuse**: `page-local` (ThreadPage; the NewThread flow reuses its header/composer region).

### AuthTemplate
- **Responsibility**: centered single-column auth card with brand; shared by identity pages.
- **Slots**: `brand`, `form`, `footer` (links: login/register/forgot).
- **Reuse**: `reusable` (login, register, confirm, forgot, reset, character creation).

### AccountTemplate
- **Slots**: `header` (profile summary), `tabs` (AccountTabs).
- **Reuse**: `page-local` (AccountPage).

### AdminTemplate
- **Slots**: `nav` (AdminShell/AdminTabs), `content` (AdminPanel + DataTable per tab).
- **Reuse**: `page-local` (AdminPage, SettingsPage).

### ProfileTemplate
- **Slots**: `header` (ProfileHeader), `tabs` (overview / sheet / inventory / recent threads), `content`.
- **Reuse**: `page-local` (ProfilePage).

### DirectoryTemplate
- **Slots**: `search` (SearchField), `grid` (MemberDirectory), `pagination`.
- **Reuse**: `page-local` (DirectoryPage).

### CatalogTemplate
- **Slots**: `header` (balance/title), `content` (ShopCatalog | InventoryPanel), `pagination`.
- **Reuse**: `reusable` (ShopPage, InventoryPage).

### SheetTemplate / SheetEditTemplate
- **Slots**: `breadcrumb`, `heading`, `body` (SheetViewer | CharacterSheetEditor), `actions`.
- **Reuse**: `page-local` (SheetPage, SheetEditPage).

### StaticMessageTemplate
- **Responsibility**: centered status page — used by 404, 403, 500, and the ban interstitial.
- **Slots**: `icon`, `title`, `body`, `action`.
- **Reuse**: `reusable` (error pages) with `BanInterstitial` composing the ban variant.

## 7. Pages

Pages are the route-bound instances (`docs/routes.md`). Each definition: route → template → organisms → nature. Data access via `hc` (pages fetch server-side; islands mutate through the API — `../architecture.md`).

| Route | Page | Template | Key organisms | Nature |
| --- | --- | --- | --- | --- |
| `/` | HomePage | HomeTemplate | ForumHero, ForumStats, BoardStructure, RecentActivity, StatusBanner | SSR (+ navbar islands) |
| `/login` | LoginPage | AuthTemplate | LoginForm (quick logins + character picker) | SSR + LoginForm [Island] |
| `/register` | RegisterPage | AuthTemplate | RegisterForm | SSR + RegisterForm [Island] |
| `/register/confirm` | ConfirmPage | AuthTemplate | — (confirmation status block) | SSR |
| `/forgot-password` | ForgotPasswordPage | AuthTemplate | ResetRequestForm | SSR + form [Island] |
| `/reset-password` | ResetPasswordPage | AuthTemplate | ResetPasswordForm | SSR + form [Island] |
| `/banned` | BannedPage | StaticMessageTemplate | BanInterstitial (incl. appeal) | SSR (+ appeal [Island]) |
| `/characters/new` | CharacterCreatePage | AuthTemplate | CharacterCreationForm | SSR + form [Island] |
| `/account` | AccountPage | AccountTemplate | AccountTabs (creds, prefs, quick logins, characters, delete) | SSR + tabs [Island] |
| `/member/<username>` | ProfilePage | ProfileTemplate | ProfileHeader, ProfileTabs, RecentActivity, SheetViewer, InventoryPanel | SSR (+ owner/staff islands) |
| `/members` | DirectoryPage | DirectoryTemplate | SearchField, MemberDirectory | SSR + search [Island] — **proposed, not in the accepted spec (per `routes.md`); do not implement** |
| `/sheet/<characterId>` | SheetPage | SheetTemplate | SheetViewer | SSR |
| `/sheet/<characterId>/edit` | SheetEditPage | SheetEditTemplate | CharacterSheetEditor | SSR + editor [Island] |
| `/boards/<catId>` | CategoryPage | BoardTemplate | BreadcrumbStrip, BoardStructure (category only) | SSR |
| `/boards/<catId>/<forumId>` | ForumPage | BoardTemplate | BreadcrumbStrip, header, subforums, ThreadList, PaginationControls | SSR (+ moderation islands) |
| `/boards/<catId>/<forumId>/<subId>` | SubforumPage | BoardTemplate | same as ForumPage (no subforums) | SSR |
| `/thread/<id>` | ThreadPage | ThreadTemplate | BreadcrumbStrip, `PostCard[]`, PostComposer, ModerationInline, sheet preview (xl) | SSR + composer/moderation [Islands] |
| `/new-thread/<boardId>` | NewThreadPage | ThreadTemplate (create region) | NewThreadForm | SSR + form [Island] |
| `/economy` | EconomyPage | CatalogTemplate (header+content) | EconomyLedger, BalancePill | SSR |
| `/shop` | ShopPage | CatalogTemplate | ShopCatalog, BalancePill | SSR + catalog [Island] |
| `/shop/item/<id>` | ItemPage | CatalogTemplate | ItemDetailDialog (mounted), ShopCatalog | SSR + dialog [Island] |
| `/inventory` | InventoryPage | CatalogTemplate | InventoryPanel | SSR + panel [Island] |
| `/admin` | AdminPage | AdminTemplate | AdminShell, AdminPanel, DataTable (per tab), PermissionsMatrix, Moderation queues | SSR + tabs/tables [Island] |
| `/admin/settings` | SettingsPage | AdminTemplate | PermissionsMatrix (defaults), configuration form panels | SSR + forms [Island] |

> **Proposed pages**: rows marked *proposed* (`/members`, member directory) are not in the accepted spec — do not implement them (AGENTS.md rule 16/17). The rest of §7 mirrors the accepted `docs/routes.md`.

### Non-route islands (no page of their own, `docs/routes.md` §non-route)

| Island | Lives in | Organism |
| --- | --- | --- |
| Real-time notification bell | FloatingNavbar | NotificationCenter |
| Character switcher | FloatingNavbar | CharacterSwitcher |
| WYSIWYG editor | PostComposer / NewThreadForm | editor island (ticket 26) |
| Shop interactions | ItemPage / ShopPage | ItemDetailDialog, ShopCatalog |
| Complex forms (auth, account, sheet) | their pages | island-forms above |

## 8. Rules

1. **Reuse before create** — check §3–5 first; if a composition is wanted but a similar Project F component exists, extend variants; only new behavior justifies a new entry (AGENTS.md rule 22).
2. **No generic catch-alls** — `DataTable` is the one deliberate generic (many similar admin tables); everything else has one responsibility.
3. **SSR by default** — a component is `[SSR]` unless its interactivity earns hydration; components.md §"islands" scopes when hydration is appropriate (`../architecture.md`).
4. **Props carry data, not style** — all visual variation goes through `variants` + design tokens; no ad-hoc inline styling (components.md §16).
5. **A11y ships with the component** — each entry inherits the baselines in `accessibility.md` (focus, labels, SR, contrast) and must document any deviation.
6. **Routes are the source of pages** — pages in §7 mirror `docs/routes.md`; never add a page outside the route map (AGENTS.md rule 23).

## 9. Relationship to the other design docs

- `components.md` — design detail/state of each component referenced here; §2 map points at this catalog.
- `tokens.md`, `layout.md`, `accessibility.md` — the tokens, layout/motion, and a11y baselines every entry above is bound to.
- `docs/routes.md` — the authority for §7 pages; `docs/ux/` — the flows that shape the organisms.
