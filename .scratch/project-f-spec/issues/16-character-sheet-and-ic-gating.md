# 16 — Character sheet & IC gating

**What to build:** The web master defines the sheet data fields (single source in the forum configuration) and enables templates; a character creates and edits their sheet through an enabled template; sheets are public once created; posting in IC boards requires a sheet while OOC posting requires only the character account.

**Blocked by:** 13 — Thread creation, 15 — Replies & post editing, 03 — Forum configuration singleton & public identity, 10 — Admin shell & dashboard

**Status:** ready-for-agent

- [ ] `sheet_templates` and `character_sheets` tables exist; the data fields live only in `forum_configuration.sheet_fields` (decision D13, invariant 14 — identical fields across templates) (persistence-model §3.7)
- [ ] The admin Sheets tab (web master only) defines the data fields and enables/disables templates (story 83, flow 17)
- [ ] `PUT /api/sheet` validates `data` against `sheet_fields` and requires an enabled `templateId` → 422 otherwise; `GET /api/sheet` returns the sheet; sheets are public once created (stories 36, 39)
- [ ] IC boards/threads reject thread or post creation without a sheet → 422 `sheet_required`; OOC requires only the character account (story 37, domain-model §2.6)
- [ ] `/sheet/<characterId>` (SheetViewer) and `/sheet/<characterId>/edit` (CharacterSheetEditor) pages
- [ ] Seam tests: field validation, template enforcement, IC/OOC gating on thread and post creation