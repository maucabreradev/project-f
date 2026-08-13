# 05 — Login, logout & sessions

**What to build:** Email+password login creates a server-side session (HttpOnly/Secure/SameSite cookie, CSRF protection); logout invalidates it; a request-time ban hook checks the email and the IP on every authenticated request.

**Blocked by:** 04 — Account confirmation

**Status:** ready-for-agent

- [ ] Login creates a session, logout destroys it; cookie flags and CSRF protection are in place
- [ ] Every authenticated request runs the ban check (email, then IP); a banned subject is blocked
