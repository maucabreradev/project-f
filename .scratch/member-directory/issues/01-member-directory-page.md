# 01 — Member directory page

**What to build:** The public character directory at `/members`: paginated listing of active characters (avatar, character name, username, last connection), search by name/username (FTS), and links to each character's public profile. Inactive accounts render a badge; deleted characters never appear. Empty state when the forum has no characters.

**Blocked by:** 12 — Character creation, 41 — Public character profile, 56 — Global search (FTS infrastructure), 10 — Visitor visibility (hiding pattern), 58 — Forum identity configuration (visibility flag placement)

**Status:** proposed

- [ ] `/members` route renders the listing server-side (SSR, works without JavaScript)
- [ ] Search and filters work over character names and usernames
- [ ] Badges and empty states render correctly
- [ ] Directory is character-scoped; deleted characters excluded
- [ ] Behavior follows `docs/ux/10-member-directory.md`
