# 23 — Soft-delete retention

**What to build:** Soft-deleted threads move to the Archive forum for the configured window (0–30 days) and stop being shown afterward; posts stay visible during the window.

**Blocked by:** 19 — Threads & posts core, 22 — Archive & unarchive

**Status:** ready-for-agent

- [ ] Window configurable (0–30); 0 means never shown (ADR-0004)
- [ ] Thread hidden after the window; visible in the Archive during it
