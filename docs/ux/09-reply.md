# Flow 09 — Reply to a Thread or Post

Status: proposed

## Entry

- Route: `/thread/<id>` — the reply box at the bottom of the thread, plus Reply/Quote/Multi-quote actions on individual posts
- Reachable from: any thread the active character can read
- Actors: character with write permission; IC boards require a character sheet

## Steps

1. Compose in the WYSIWYG editor: BBCode and Markdown, images by URL or upload, mentions `@username`, spoilers, quotes, multi-quotes (select several posts and quote them together), emojis, stickers, GIFs.
2. Pre-submit checks (same gates as flow 08): board limits (min/max characters, image policy), sheet on IC boards, active and unbanned account.
3. Submit → the post is created; its state inherits from the thread.
4. Post effects:
   - **Per-post earn rule**: reward credited to the character (ledger: `earn`).
   - **Notifications**: replies to your threads, replies in threads you participate in, replies to your posts, and mention notifications are emitted in real time to the navbar.
5. Thread metadata updates: last activity, reply count; the post renders the character's post profile (avatar, name, bag icons with quantities).

## States

| Thread state | Reply behavior |
| --- | --- |
| `open` | allowed |
| `closed` | blocked for everyone; staff may reopen (flow 20) |
| `archived` | read-only; only an Administrator unarchives (flow 22) |
| `soft-deleted` | hidden during the configured archive window (flow 23) |

## Errors

| Error | Surface |
| --- | --- |
| Thread closed/archived | the reply box is disabled with the reason shown |
| No write permission | reply box not rendered |
| No sheet on an IC board | disabled box with a link to create the sheet |
| Content outside limits / image policy | inline validation |
| Inactive or banned account | disabled box; ban shows the ban notice |

## Result

The post is published in the thread with the character's post profile; balances and notifications update; the thread's last-activity metadata refreshes.

## Navigation

In-page on the same thread; Quote/Multi-quote fills the reply box with the quoted content; mention autocomplete targets `@username`.
