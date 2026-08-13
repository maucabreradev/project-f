# Project F — Initial Product Definition

Status: accepted

## Problem Statement

Building an online roleplay forum today means starting from generic forum software (phpBB, MyBB, Forumotion) and stitching together third-party mods and plugins for the things roleplay communities actually need: a configurable virtual economy, an integrated item shop, character sheets, and character-scoped identity. The web master owns the deployment, but the tooling never fits the activity.

## Solution

Project F is a deployable web application for building customizable online roleplay forums from the ground up. A web master clones the repository and deploys it to their own Cloudflare account — one deployment, one forum tenant (ADR-0003). The web master then configures the forum from an admin dashboard: identity, name, domain, cover images, colors, categories, forums, currency, shop items, sheet fields, permissions, and more. Roleplay is first-class: content, currency, and inventory belong to the character, not the account (ADR-0001), so members can play up to two independent personas with fully separate economies.

## User Stories

### Accounts and registration

1. As a visitor, I want to register with my email and password, so that I can join the forum.
2. As a new member, I want to confirm my account through an emailed link, so that my account is verified before I interact.
3. As a new member with an unconfirmed account, I want a reminder banner with a resend option, so that I can complete my confirmation.
4. As a member, I want my confirmation link to expire after 15 minutes and allow up to 2 resends per hour, so that the flow stays safe and simple.
5. As a web master, I want to choose between open registration and approval-required registration, so that I control who joins my community.
6. As an administrator, I want to approve or reject pending registrations, so that I can gate the community when required.
7. As a member, I want to log in with my email and password, so that I can enter my account.
8. As a member, I want to choose which of my characters to enter as after logging in, so that I start the session as the right persona.
9. As a member, I want to reset my password through an emailed link, so that I can recover access.
10. As a member, I want to change my email through an emailed link, so that my credentials stay current.
11. As a member, I want my email and password changes to apply to the whole account, so that all my characters benefit on next login.
12. As a member, I want to set my account as inactive, so that I can step away while keeping all my data.
13. As a member, I want my inactive account to show an "inactive" notice on my profile and block posting, so that the community knows I am away.
14. As a member, I want to reactivate my inactive account, so that I can participate again.
15. As a member, I want to delete my account, so that I can leave the forum; my posts remain visible with an unlinked name.

### Characters

16. As a confirmed member, I want to create my first character by giving it a name, so that I can start interacting.
17. As a member, I want character names to allow spaces and special characters and not require uniqueness, so that I am free in naming.
18. As a member, I want my character to receive a random username that I can replace once with a custom one, so that I get a unique identity in mentions, searches, and URLs.
19. As a member, I want to create a second character, so that I can play another persona.
20. As a member, I want to delete a character to free a slot, so that I can eventually create a third.
21. As a member, I want my characters to have fully separate threads, posts, profiles, currency, and inventory, so that each persona is independent.
22. As a member, I want to add any of my characters to quick login, so that I can enter the forum faster.
23. As a member, I want to log in via quick login by selecting a character and entering my account password, so that I land directly in character.
24. As a member, I want to switch between my characters in real time, so that I can roleplay different personas without logging out.
25. As a member, I want to upload my character's avatar and banner from my device or an external URL, so that my character looks unique.
26. As a member, I want a public character profile showing my name, avatar, banner, currency, inventory, bag, recent threads and replies, registration date, and last connection, so that the community can see my activity.
27. As a member, I want to confirm the account is not banned when using quick login, so that bans cannot be bypassed.

### Content and roleplay

28. As a visitor, I want to read the forum without an account, so that I can decide whether to join; the web master may hide sections from me.
29. As a character, I want to navigate categories, forums, and subforums, so that I can find my places.
30. As a character, I want to create threads inside forums and subforums only, so that content stays organized.
31. As a character, I want to post in threads, so that I can roleplay and discuss.
32. As a character, I want to mark my threads as IC or OOC and edit the tag, so that readers know the register; staff can edit it too.
33. As a character, I want to pin a thread I created, so that it stands out; moderators can pin any thread.
34. As a character, I want to write posts with BBCode and Markdown, images, mentions, spoilers, quotes, multi-quotes, emojis, stickers, and GIFs in a WYSIWYG editor, so that I can express myself richly.
35. As a character, I want to mention other characters by username, so that they get a notification.
36. As a character, I want to create my character sheet through an enabled template, so that I can post in in-character forums.
37. As a character, I want to post in out-of-character categories with only my character account (no sheet), so that OOC talk stays easy.
38. As a character, I want my sheet evaluated by AI when the forum enables it, so that my story fits the forum's lore and the web master's criteria.
39. As a visitor or member, I want to view any character sheet, so that I can read character stories.

### Economy and shop

40. As a character, I want to earn virtual currency according to the rules the web master configures, so that I can build wealth in character.
41. As a character, I want to earn currency per thread created and per post sent, so that participation pays.
42. As a character, I want to earn currency through a login streak, so that consistency pays; streaks are measured per character.
43. As a character, I want to earn interest on a configured day of the month, so that my savings grow.
44. As a character, I want to receive a birthday reward, so that the forum celebrates me; the birth-date field exists only when this rule is enabled.
45. As a character, I want to browse the shop and buy items with my own currency, so that I can customize my persona.
46. As a character, I want to put owned items into my bag, so that they appear as icons with quantity on my posts.
47. As a character, I want to sell owned items back at a fraction of the purchase price, so that I can recover currency.
48. As a character, I want to refund a purchase within 24 hours, so that I can undo a mistake.
49. As a web master, I want to configure prices, stock (infinite, limited, or unique), and per-character unique purchases, so that the shop economy fits my community.
50. As a web master, I want to configure earn rules and currency settings, so that the economy works as my community expects.

### Moderation and administration

51. As a moderator, I want to edit, close, open, archive, delete, pin, and move threads within my moderation scope, so that I can keep order.
52. As a moderator, I want every moderation action to be recorded and shown on the thread ("edited/closed/... by X on date"), so that there is accountability.
53. As a moderator, I want to edit a character's currency and inventory from their public profile when granted, so that I can help resolve incidents.
54. As a moderator, I want to ban, so that I can respond to emergencies.
55. As a web master, I want to choose each moderator's moderation scope at promotion, so that moderators act only where I trust them.
56. As an administrator, I want to create categories and forums, so that I can shape the structure.
57. As an administrator, I want to unarchive a thread, so that I can restore content to the main forum.
58. As an administrator, I want to view the staff action log, the general forum log, and the economy log, so that I can audit the forum.
59. As a web master, I want to configure forum permissions per rank, so that I control who reads and writes where.
60. As a web master, I want to set per-forum content limits (minimum/maximum post length, image policy, who may post images), so that posts stay consistent.
61. As a web master, I want to hide categories, forums, or public profiles from visitors, so that parts of the forum stay private.
62. As a web master, I want to promote members to moderator or administrator and set their scope, so that I can grow staff; only I can promote staff.
63. As a web master, I want total control of the forum configuration, so that the forum reflects my community.

### Thread lifecycle

64. As a character, I want a closed thread to stay readable but not accept replies, so that old discussions stay intact.
65. As staff, I want to reopen a closed thread, so that a discussion can resume when appropriate.
66. As a character, I want archived threads to be read-only in the archive forum, so that the story stays available.
67. As a web master, I want deleted content to go to the archive forum for a configured window (0–30 days) and then stop being shown, so that removal is reversible without losing history.
68. As a moderator, I want deleted threads to keep their posts visible in the archive for the configured window, so that context survives moderation.

### Bans and appeals

69. As staff, I want to ban by registered email or by IP with a mandatory reason, so that I can act on emergencies.
70. As staff, I want to set a permanent or dated ban, so that the punishment fits the case.
71. As a banned member, I want to see the ban notice with the reason, so that I understand why I was banned.
72. As a banned member, I want to appeal and track my appeal, so that I can ask for reconsideration.
73. As an administrator, I want to approve or reject appeals from the admin dashboard, so that bans stay fair.
74. As staff, I want a ban against another staff member to require a third administrator's approval, so that staff conflicts are checked.
75. As staff, I want an IP ban to block the whole IP, including visitors, so that evasion is harder.

### Notifications, search, and configuration

76. As a member, I want a real-time notification icon in the navbar, so that I know about events instantly.
77. As a member, I want to choose which notification types I receive, so that I am not flooded.
78. As a member, I want notifications for replies to my threads, replies in threads I participate in, replies to my posts, mentions, resolved appeals, and birthday or interest currency, so that I stay informed.
79. As a member, I want a global search over threads, posts, and characters, so that I can find content.
80. As a member, I want to search within a thread, so that I can locate a specific reply.
81. As a web master, I want to configure the forum's identity (name, domain, cover images, colors), so that the forum matches my brand.
82. As a web master, I want to go live on Cloudflare's default subdomain and point my own domain later, so that I can launch before buying a domain.
83. As a web master, I want to define the character sheet data fields and enable the sheet templates I offer, so that sheets capture what my community needs.

## Implementation Decisions

- **Single-tenant deployment** (ADR-0003): one forum per Cloudflare deployment; domain-agnostic; starts on Cloudflare's default subdomain, later on a web master–owned domain with Cloudflare DNS/TLS.
- **Character-scoped content and economy** (ADR-0001): threads, posts, profiles, currency, and inventory belong to the character; members hold at most two characters.
- **AI sheet evaluation is optional** (ADR-0002): opt-in per forum, web master supplies their own API key; when off, no member content leaves the forum.
- **Soft-delete retention** (ADR-0004): moderated content moves to the archive forum for a web master–configured window (0–30 days); archived content stays indefinitely; currency already granted is never clawed back.
- **Economy**: currency and inventory per character; refunds only within 24 hours of purchase; refunding a limited-stock item restores stock globally; sell-back at a fraction of the price; stock models infinite/limited/unique; earn rules (per thread, per post, per-character login streak, interest, birthday) configurable per forum.
- **Thread state machine**: open → closed (staff reopens) → archived (read-only, only an administrator unarchives) → soft-deleted (archive window, then hidden); pinning is an orthogonal flag set by creator or moderator.
- **Permission model**: ranks (Web master, Administrator, Moderator, User) with a per-moderator moderation scope; forum permissions per rank; visitor visibility per section; only the web master promotes staff.
- **Identity model**: one entity for the account holder (Member/Account); username is the unique character identifier (one-time rename); character names are not unique.
- **Sheet model**: web master–defined data fields presented through enabled templates (templates differ only in presentation); birth-date field appears on the character only when the birthday earn rule is enabled.
- **Notifications**: real-time delivery to the navbar with per-member preferences; types: replies, mentions, resolved appeals, birthday/interest currency.
- **Tech stack**: not yet decided. The spec records product requirements; stack selection is a separate decision and must be approved before implementation (AGENTS.md rules 12–15).

## Testing Decisions

- No codebase exists yet, so no testing seams or prior art exist. At implementation time, tests must exercise external behavior only (registration flows, economy transactions, thread state transitions, moderation permissions, ban/appeal lifecycle), not implementation details.
- The single testing seam for the whole application will be proposed when the stack is selected; prefer one seam over many.

## Out of Scope

- Anti-spam, rate limiting, and captcha (deferred to future iterations).
- Multi-tenant SaaS hosting or centralized infrastructure (ADR-0003).
- Mods/plugins marketplace: Project F ships the roleplay features (economy, shop, sheets) built in; a plugin ecosystem is not planned.
- Real-money payments: the currency is virtual only.
- Native mobile applications.
- Email delivery infrastructure and image hosting choices: implementation details for the stack decision.

## Further Notes

- Canonical language: `CONTEXT.md`. Consolidated model: `docs/domain-model.md`. Decisions: `docs/adr/0001-0004`.
- Modeling resolutions to keep: Member and Account are one entity; Forum and Subforum are one entity at different nesting depths (invariant: depth ≤ 1).
- Recording ambiguity for the future: none blocking; the five previously open points are resolved in `docs/domain-model.md` section 10.
