# 04 — Account confirmation

**What to build:** The confirmation email with an expiring link (15 minutes) is sent through Resend, with resend limited to twice per hour; the member confirms and becomes `confirmed`; a reminder banner offers resend.

**Blocked by:** 03 — Registration & account creation

**Status:** ready-for-agent

- [ ] Link sent on registration and on resend; expired links are rejected and lead to resend
- [ ] Resend throttled to 2 per hour per account
- [ ] Confirmed accounts can proceed to login; the banner disappears once confirmed
