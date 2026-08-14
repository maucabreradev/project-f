# 17 — Staff promotion & registration approval

**What to build:** The web master promotes members to moderator or administrator (setting each moderator's moderation scope and economy-edit right at promotion) and approves or rejects pending registrations from the admin Members tab; only the web master promotes staff.

**Blocked by:** 10 — Admin shell & dashboard, 06 — Character creation, switching & username

**Status:** ready-for-agent

- [ ] `POST /api/admin/members/:id/rank` (web master only) promotes to administrator/moderator/user; promoting to moderator requires a scope `{ global, boards[], canEditEconomy }`; 422 `webmaster_demotion`; the unique web master rank is never reassigned (stories 55, 62, 74, invariant 13)
- [ ] `moderation_scope_boards` stores explicit scopes; the global flag and `canEditEconomy` live on the member (persistence-model §3.2, ticket 44 in the initial set)
- [ ] `GET /api/admin/members` lists members with character count; `POST /api/admin/members/:id/approval` approves/rejects pending registrations (422 `not_pending`) (story 6)
- [ ] The admin Members tab lists members, promotes with a scope picker, and handles the pending-registration queue
- [ ] Seam tests: web-master-only promotion, scope persistence, demotion rule, approval/rejection flow