# 32 — Scheduled economy rules

**What to build:** Login-streak rewards (measured per character, applied at login), monthly interest, and daily birthday rewards run through cron; enabling the birthday rule reveals the character birth-date field; birthday and interest rewards notify the member.

**Blocked by:** 21 — Economy ledger & earn rules, 24 — Notifications infrastructure & events, 05 — Login, logout & sessions

**Status:** ready-for-agent

- [ ] Login streaks are measured per individual character and applied at login (`applyLoginStreak`) (domain-model §10.2, story 42)
- [ ] Interest (monthly cron, floored percentage, configured day) and birthday (daily cron) call the same module functions as the HTTP routes; cron bindings exist from the skeleton (stories 43–44, architecture §Real-time)
- [ ] Enabling the birthday rule adds the character birth-date field; disabling hides it (resolved ambiguity 1, ticket 36 in the initial set)
- [ ] Birthday and interest rewards emit the matching notification, respecting preferences (story 78)
- [ ] Seam tests: streak accumulation, interest flooring, birthday field gating, notification emission