# 20 — Image upload & post image policy

**What to build:** Members upload avatars, banners, and post images to R2 through the API; the per-forum image policy (images allowed, and which ranks may post them) is enforced on post create and edit.

**Blocked by:** 19 — WYSIWYG editor & rich content, 12 — Admin board management

**Status:** ready-for-agent

- [ ] `POST /api/uploads/images` stores to R2 and returns `{ url, key }`; requires a confirmed, active member; 413 `too_large`, 422 `unsupported_mime` (api.md §3.10)
- [ ] Avatar/banner PUT endpoints accept the returned reference → 422 `invalid_image_ref` (stories 25)
- [ ] The per-forum image policy (`images_allowed`, `image_poster_ranks`) is enforced on post create and edit (story 60, ticket 31 in the initial set)
- [ ] Seam tests: upload validation, mime/size rejection, image-policy enforcement