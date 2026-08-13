# 02 — Member directory visibility

**What to build:** A `ForumConfiguration` flag (`membersDirectoryVisibleToVisitors`, default on) that hides `/members` and its navbar link from visitors when off; direct visitor access to a hidden directory returns 404. Exposed in the web master settings (flow 17) alongside the board visibility model. Database migration required (AGENTS.md rule 26).

**Blocked by:** 01 — Member directory page, 58 — Forum identity configuration (settings UI)

**Status:** proposed

- [ ] Migration adds the flag to the configuration
- [ ] Web master can toggle the flag from settings
- [ ] Visitors get 404 and no navbar link when hidden; members unaffected
- [ ] Behavior follows `docs/ux/10-member-directory.md`
