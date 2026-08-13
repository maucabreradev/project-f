# Project F — UX Flows

Status: proposed

This directory defines the UX flows of Project F. It is a design document only — no components are implemented here. Every flow follows the same template:

- **Entry** — where the flow starts and who can reach it
- **Steps** — the ordered interactions
- **States** — the domain states the flow moves through
- **Errors** — the failure cases and how they surface
- **Result** — the outcome when the flow succeeds
- **Navigation** — the routes involved

The domain language, rules, and invariants come from `CONTEXT.md`, `docs/domain-model.md`, and `docs/adr/`. If a flow contradicts the approved domain documentation, stop and ask (AGENTS.md rule 33).

## Route map

Proposed routes (the architecture leaves file routes open; this document fixes them for the first time — AGENTS.md rule 23).

| Route | Page | Actors |
| --- | --- | --- |
| `/` | Home | all |
| `/login` | Login, including quick login | visitor |
| `/register` | Registration | visitor |
| `/register/confirm` | Account confirmation landing | visitor |
| `/forgot-password` | Password reset request | visitor |
| `/reset-password` | Password reset form | visitor |
| `/members` | Public character directory | all (hideable from visitors) |
| `/member/<username>` | Public character profile | all (hideable from visitors) |
| `/boards/<catId>/<forumId>/<subId>` | Board listing (category, forum, subforum) | read-permission-filtered |
| `/thread/<id>` | Thread with posts | read permission |
| `/new-thread/<boardId>` | Create thread | write permission |
| `/account` | Account and character settings | member |
| `/characters/new` | Character creation | confirmed member |
| `/economy` | Balance and transaction ledger | member, per active character |
| `/shop` | Shop catalog | member, per active character |
| `/shop/item/<id>` | Item detail | member, per active character |
| `/inventory` | Inventory and bag | member, per active character |
| `/sheet/<characterId>` | Character sheet | all (public once created) |
| `/admin` | Admin dashboard (tabs) | Administrator, Web master |
| `/admin/settings` | Web master configuration | Web master only |

Board routes mirror the forum structure (category → forum → subforum); ids keep the path unique. The breadcrumb always renders the parent chain.

## Shared conventions

### Actors

| Actor | Meaning |
| --- | --- |
| Visitor | no account |
| Member | registered, confirmed (and approved, when the registration mode requires it) |
| Character | the member's active persona — all content and economy actions are scoped to it |
| Staff | Moderator, Administrator, Web master |
| Web master | the unique rank; the only actor that changes forum configuration and promotes staff |

### Global states

| State | Behavior |
| --- | --- |
| Session active | session cookie set, ban check (email + IP) passes on every authenticated request |
| Session without character | member logged in but no character selected — UI forces character creation or the picker |
| Unconfirmed account | persistent reminder banner with resend (max 2 resends/hour, link expires in 15 min) |
| Pending approval | "account pending approval" screen; no interaction until approved |
| Inactive account | banner on the public profile; browsing, settings, notifications, and quick login still work; posting blocked |
| Banned (email or IP) | ban notice screen with the mandatory reason and an appeal option |
| Character deleted | removed from pickers and quick login; posts remain visible with an unlinked display name |

### Global error handling

- Validation errors appear inline under the field (Zod, shared frontend/backend in `packages/validation`).
- Permission failures are silent by default: sections a member cannot read are not shown (no 403 for boards). The admin dashboard and configuration routes return a hard 403.
- Network/server failures surface as a non-blocking toast; the form keeps its values.
- Every staff moderation action is logged and shown on the thread ("edited/closed/... by X on date").

### Global navigation elements

- **Navbar**: forum identity, search, notifications (real time), character switcher, currency balance, avatar menu (account, economy, shop, inventory, admin, logout).
- **Character switcher**: island, visible only with two characters; switching never logs out.
- **Session state**: visitor sees login/register; member sees the active character.

## Flow index

| # | File | Area |
| --- | --- | --- |
| 01 | `01-registration.md` | Identity |
| 02 | `02-login.md` | Identity |
| 03 | `03-character-creation.md` | Characters |
| 04 | `04-profile-configuration.md` | Identity + characters |
| 05 | `05-quick-login.md` | Identity |
| 06 | `06-character-switching.md` | Characters |
| 07 | `07-admin-dashboard.md` | Administration |
| 08 | `08-thread-creation.md` | Content |
| 09 | `09-reply.md` | Content |
| 10 | `10-member-directory.md` | Community — **new feature proposal, not in the accepted spec** |
| 11 | `11-virtual-economy.md` | Economy |
| 12 | `12-item-shop.md` | Economy |
| 13 | `13-homepage.md` | Navigation |
| 14 | `14-categories-and-forums.md` | Navigation |
| 15 | `15-staff-permissions.md` | Administration |
| 16 | `16-avatar-and-banner.md` | Characters |
| 17 | `17-web-master-configuration.md` | Administration |
| 18 | `18-project-configuration.md` | Deployment (outside the web UI) |
