# 18 — Thread moderation lifecycle

**What to build:** Staff in scope close, open, pin, archive, unarchive, soft-delete, and move threads; every action is recorded and shown on the thread ("… by X on date"); archived threads are read-only in the Archive forum; soft-deleted threads stop being shown after the configured window.

**Blocked by:** 15 — Replies & post editing, 17 — Staff promotion & registration approval

**Status:** ready-for-agent

- [ ] The thread state machine is enforced: `open → closed` (staff reopens), `open | closed → archived` (read-only, indefinite; only an Administrator unarchives), `open | closed → soft-deleted` (archive board, `soft_delete_expires_at`, hidden after the window; 0 days = immediate) (domain-model §5, ADR-0004)
- [ ] Pin/close/open/archive/unarchive/soft-delete/move endpoints check `canModerate(scope, target, actor)`; move targets must be a forum/subforum → 422 `invalid_target` (api.md §3.4)
- [ ] Every action records a `moderation_actions` entry (actor + timestamp, invariant 9) surfaced as visible thread history (story 52)
- [ ] The Archive board (`is_archive = 1`, at most one) exists; unarchive restores to `archive_source_board_id`; the web master's soft-delete window (0–30) is honored (tickets 22–23 in the initial set)
- [ ] ModerationInline tools on boards and threads within scope, with destructive confirmations
- [ ] Seam tests: state transitions, scope denial, history recording, window expiry