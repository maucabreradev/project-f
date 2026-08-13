# Flow 13 — Home Page

Status: proposed

## Entry

- Route: `/` (the root of every deployment)
- Actors: visitors and members — the landing page of the forum

## Steps

1. **Forum identity header**: forum name, cover image, and colors from the web master's configuration (flow 17).
2. **Navbar**:
   - visitor: login, register, search;
   - member: search, real-time notifications, character switcher, balance, avatar menu (account, economy, shop, inventory, admin, logout).
3. **Board structure**: categories with their forums and subforums (flow 14), each with description and last-activity metadata.
4. **Recent activity**: latest threads and posts across the visible boards.
5. **Stats**: member/character counts, thread and post counts.
6. **Status banners**: unconfirmed-account reminder with resend; account-inactive notice.
7. Section visibility applies here first: boards hidden from visitors are not rendered for them.

## States

- Visitor vs. member rendering (session state)
- Banners: unconfirmed / inactive / banned (ban replaces the page content with the ban notice)
- Notifications arrive in real time on the navbar island

## Errors

| Error | Surface |
| --- | --- |
| Banned (email/IP) | the whole forum is replaced by the ban notice with the reason and appeal option |
| Hidden sections | simply absent from the structure |

## Result

A single entry point to everything: browsing, joining, and — for members — their current session state at a glance.

## Navigation

`/` → any route: login, register, boards, thread, shop, members, account, admin (rank-permitted).
