# Flow 08 — Thread Creation

Status: accepted

## Entry

- Route: `/new-thread/<boardId>`
- Reachable from: the "New thread" button in a board listing (only when the active character has write permission on that board, and the board is not the archive)
- Actors: character (member session); IC boards additionally require an existing character sheet

## Steps

1. **Title** field (required; length limits from the board configuration).
2. **IC/OOC tag**: required choice, defaulting to OOC; the creator can edit the tag later (staff can edit it too).
3. **Content** in the WYSIWYG editor (same editor as flow 09: BBCode/Markdown, images, mentions, spoilers, quotes, emojis, stickers, GIFs).
4. Pre-submit checks:
   - IC board → the active character must have a public character sheet, otherwise the form is blocked with a link to create it.
   - OOC board → only the character account is required.
   - Account inactive or banned → blocked.
   - Content limits: min/max characters and image policy from the board's configuration are validated.
5. Submit → the thread is created with `state = open`; if the **per-thread earn rule** is active, the reward is credited to the character (ledger: `earn`).
6. The creator can immediately pin the thread (creator pin).

## States

- Thread: `open` (created); `closed`, `archived`, `soft-deleted` are later states (tickets 20–23)
- Tag: `IC | OOC`, editable by creator or staff
- Earned currency is never clawed back when the thread is later deleted

## Errors

| Error | Surface |
| --- | --- |
| No write permission | the button and route are not offered; direct access shows the board without the form |
| No sheet on an IC board | blocking message with a link to the sheet page |
| Content outside min/max limits | inline validation |
| Image policy violation | inline validation |
| Inactive or banned account | blocking message |

## Result

The thread appears in the board listing with its tag, author, and optional pin; the creator's balance updates when the rule is on; participants are notified.

## Navigation

Board listing → `/new-thread/<boardId>` → `/thread/<id>`.
