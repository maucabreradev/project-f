# Public Character Directory — Spec Proposal

Status: proposed

Proposed addition to the accepted product spec (`.scratch/initial-product-definition/spec.md`). Designed alongside `docs/ux/10-member-directory.md`. Do not implement until this proposal is accepted (AGENTS.md rules 16–17).

## Proposed user stories

Append to the spec's "Notifications, search, and configuration" section:

- As a visitor or member, I want to browse a public directory of characters (avatar, character name, username, last connection), so that I can discover the community and its roleplayers.
- As a member, I want to search and filter the directory by character name or username, so that I can find specific characters.
- As a visitor, I want to open a character's public profile from the directory, so that I can read their story.
- As a web master, I want to hide the directory from visitors, so that parts of the forum stay private.

## Proposed implementation decisions

- **Scope is characters, not accounts** (consistent with ADR-0001): the directory lists characters; each entry links to the character's public profile. Deleted characters never appear. Accounts marked inactive show a badge.
- **Search**: reuses the FTS5 infrastructure (threads/posts search) over character names and usernames; usernames are unique per forum, character names are not.
- **Visibility**: a new `ForumConfiguration` flag (e.g. `membersDirectoryVisibleToVisitors`, default on — visitors read the whole forum by default, mirroring the board visibility model). Structural change → migration (AGENTS.md rule 26). Surfaced in the web master settings (Identity or Registration tab, flow 17).
- **Route**: `/members`, hidden from navbar for visitors when the flag is off; direct access returns 404.
- **Ordering/pagination**: by last connection or registration date; paginated server-side.

## Proposed domain model notes

- No new entity: the directory is a projection over `Character` (`name`, `username`, `avatar`, `lastSeen`, `registeredAt`, character owner's account status).
- The visibility flag belongs to `ForumConfiguration` (single instance per deployment).

## Proposed tickets

- `issues/01-member-directory-page.md` — directory page (list, search, filter, profile links)
- `issues/02-member-directory-visibility.md` — web master visibility flag (configuration + migration + settings UI)
