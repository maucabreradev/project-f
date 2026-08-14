# 06 — Character creation, switching & username

**What to build:** A confirmed member creates up to two characters, each receiving a random unique username with a one-time custom rename, and switches between them without logging out; the navbar character switcher reflects the active character.

**Blocked by:** 05 — Login, logout & sessions

**Status:** ready-for-agent

- [ ] `POST /api/characters` creates the character (random lowercase username, becomes the active character on the session); at 2 active characters → 422 `character_limit` (invariant 1); character names allow spaces and special characters and need not be unique (stories 16–19)
- [ ] `POST /api/characters/:id/username` performs the one-time custom rename: 409 `username_taken`, 422 `already_renamed`; usernames unique per forum and stored lowercase (invariant 2, api.md §5.4)
- [ ] `POST /api/session/character` swaps the active character on the session without logout (ticket 13 flow, story 24)
- [ ] The `/characters/new` page creates a character; the navbar CharacterSwitcher island (hidden with one character) switches personas
- [ ] Seam tests: max-2 invariant, username uniqueness + one-time rename, character switching