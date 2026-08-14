# Project F

Project F is a deployable web application for building customizable online roleplay forums. Each deployment is an independent forum tenant deployed and owned by a web master.

## Language

**Web master**:
The person who deploys and owns the forum instance. They register as the first member and hold the unique Web master rank; only they can change the forum's configuration.
_Avoid_: owner, admin, sysadmin

**Member**:
A registered participant of the forum, identified by their account.
_Avoid_: user (when referring to a person)

**Visitor**:
A person browsing the forum without an account. By default visitors can read the whole forum; the web master can hide specific sections from them, such as public profiles, categories, or forums.
_Avoid_: guest, anon

**Registration mode**:
The way new accounts are admitted, configured by the web master: open to anyone, or requiring approval before the account can interact.
_Avoid_: signup policy

**Account**:
The member's main identity, secured by email and password and shared by all of the member's characters. Changing the email or password applies to the whole account and takes effect on the next login.
_Avoid_: profile, login

**Account confirmation**:
The email-based step that verifies a member's account before they can interact. The confirmation link expires after 15 minutes and can be resent up to twice per hour.
_Avoid_: email verification

**Inactive account**:
An account a member has chosen to set as inactive. All data is kept, the public profile shows an "account inactive" notice, and the member cannot post until the account is reactivated.
_Avoid_: deactivated, suspended

**Rank**:
The permission level assigned to a member. Values: Web master (unique, held by exactly one member), Administrator, Moderator, User. A rank is independent of the characters a member plays.
_Avoid_: role, permission group

**User rank**:
The base rank held by every member who holds no administrative privilege.
_Avoid_: regular user, member rank

**Character**:
The fictional persona a member plays within the forum's roleplay. Characters scope their own content: threads, posts, profile, currency, and inventory are separate per character. A member can have up to two characters. Characters are identified by id; their names are not unique.
_Avoid_: role, avatar

**Character name**:
The display name a member chooses when creating their character. It may contain spaces and special characters and is not required to be unique.
_Avoid_: title

**Username**:
The character's unique identifier in the forum, distinct from the character name. Assigned randomly on creation; the member gets one opportunity to replace it with a custom username. Usernames are unique per forum and are used for mentions, searches, and URLs.
_Avoid_: handle, nickname

**Character sheet**:
The character's roleplay profile, created on a dedicated page. The data fields are defined by the web master and presented through a sheet template chosen by the web master. It may include images if the template allows. Posting in out-of-character categories requires only the character account, not a sheet; in-character forums require both. A sheet is public once created.
_Avoid_: sheet form, character profile

**Public character profile**:
The character's public page, showing the character name, avatar, banner, currency balance, inventory, bag, recent threads and replies, registration date, and last connection.
_Avoid_: character page

**Avatar**:
Together with the banner, the images attached to a character's profile. A member provides them by uploading a file from their device or pasting an external image URL.
_Avoid_: profile picture

**Sheet template**:
A preset layout for the character sheet. Templates differ in structure and presentation, but the data fields are always the same and are defined by the web master. The web master decides which templates are available.
_Avoid_: skin, theme, layout

**Character sheet evaluation**:
The optional AI-based review of a character sheet against the forum's lore and the web master's criteria. It runs only when the web master enables it and supplies their own AI API key; when off, no member content leaves the forum.
_Avoid_: validation, moderation, approval

**Admin dashboard**:
The administration interface where Web master and Administrators perform administrative actions.
_Avoid_: admin panel, control panel

**Virtual currency**:
A currency configured by the web master that characters use in the forum's economy. Each character owns its own balance. How characters earn it is configured by the web master (for example per thread, per post, login streaks, interest, or birthday rewards).
_Avoid_: coins, money, points

**Inventory**:
The set of items owned by a single character.
_Avoid_: backpack, bag

**Bag**:
The set of items a character chooses to carry on their adventure. Bag items are shown on the character's post profiles with an icon and the quantity held.
_Avoid_: backpack, carried items

**Item**:
A purchasable object in the shop, owned by a character. Items are stackable or unique and are permanent once bought. They can be carried in the bag, used symbolically in roleplay threads, or sold back for a fraction of their purchase price. Profile cosmetics are a separate kind of item.
_Avoid_: object, product

**Shop**:
The forum's integrated store where characters buy items with virtual currency and sell owned items back for a fraction of the price. The web master configures prices, stock (infinite, limited, or unique), whether an item can be bought more than once by the same character, and the 24-hour refund window.
_Avoid_: store, market

**Category**:
The top-level grouping of forums in the forum structure.
_Avoid_: section

**Forum**:
A board inside a category that hosts threads or subforums.
_Avoid_: board
(The technical/code name is **Board**: `docs/domain-model.md` §2.3, the `boards` API module, and the `/boards/...` routes use it. The glossary term remains Forum.)

**Subforum**:
An optional subdivision of a forum that hosts threads. Nesting stops at one level: a subforum cannot contain further subforums.

**Forum permissions**:
The read and write access granted to each rank for a category or forum, configurable by the web master.
_Avoid_: access control, ACL

**Thread**:
A topic inside a forum or subforum that holds posts. Every thread belongs to a forum or subforum — loose threads do not exist. Threads carry an in-character / out-of-character tag.
_Avoid_: topic

**Post**:
A single message within a thread.
_Avoid_: reply

**IC/OOC tag**:
The thread-level tag marking a thread as in-character or out-of-character. It can be edited by the thread creator or by staff.

**Pin**:
A thread-level mark that sets a thread apart from the regular flow of its forum. A thread can be pinned by its creator or by a moderator.

**Archive forum**:
The special forum that receives archived and soft-deleted threads. Archived threads remain there indefinitely; soft-deleted threads remain for a web master–configured period.
_Avoid_: trash, recycle bin

**Ban**:
A moderation measure that blocks access to the forum by registered email or by IP, permanently or for a date range, always with a recorded reason. The banned member sees only the ban notice and an appeal option.
_Avoid_: suspension, blacklist

**Appeal**:
A formal request from a banned member to reconsider their ban, reviewed by an administrator from the admin dashboard.
_Avoid_: contest, dispute

**Forum log**:
The record of staff actions, general forum events, and economy movements, viewable by administrators in the admin dashboard.
_Avoid_: audit log, activity log

**Quick login**:
A stored login shortcut bound to a specific character, letting the member enter the forum as that character with the account password.
_Avoid_: remember me, one-tap login

**Moderation scope**:
The set of forums a moderator may moderate. Chosen by the web master when promoting a member to moderator; selecting every forum makes the moderator global. Whether a moderator may edit inventories and currency is also decided at promotion.
_Avoid_: moderation area

**Notification**:
A real-time alert shown in the navbar, configurable per member. Examples: replies to your threads or posts, mentions, resolved ban appeals, and currency granted by birthday or interest.
_Avoid_: alert, notice

## See also

- `README.md` — document hierarchy and how the repo is organized
- `docs/domain-model.md` — consolidated domain model (entities, rules, invariants)
- `docs/adr/` — architectural decisions
- `docs/architecture.md` — approved application architecture
- `docs/persistence-model.md` — accepted persistence model (tables, decisions)
- `docs/design-system/` — approved Design System
- `docs/ux/` — accepted UX flows
- `docs/routes.md` — accepted route map
