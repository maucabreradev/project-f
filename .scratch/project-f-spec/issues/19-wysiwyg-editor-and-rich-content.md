# 19 — WYSIWYG editor & rich content

**What to build:** The WYSIWYG editor with BBCode and Markdown, spoilers, quotes, multi-quotes, emojis, stickers, and GIFs; posts are rendered from sanitized HTML produced server-side at write time.

**Blocked by:** 15 — Replies & post editing

**Status:** ready-for-agent

- [ ] The PostComposer/NewThreadForm embed the WYSIWYG editor island (story 34)
- [ ] Content supports BBCode and Markdown, spoilers, quotes, multi-quote, emojis, stickers, and GIFs through the `content` payload (no new endpoints; api.md §3.4)
- [ ] The server-side sanitizer/renderer produces `content_html` at write time; the source is preserved (decision D6); disallowed markup is stripped
- [ ] Quote blocks carry the quoted author and content and collapse nested depth > 1 (QuoteBlock variant)
- [ ] Seam tests: round-trip formatting → sanitized HTML, disallowed tags stripped