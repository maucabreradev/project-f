# Project F

Project F is a deployable web application for building customizable online roleplay forums. Each deployment is an independent forum tenant deployed and owned by a web master (ADR-0003). It ships roleplay features as first-class: content, currency, and inventory belong to the character, not the account (ADR-0001); a configurable virtual economy, an integrated item shop, character sheets, and character-scoped identity.

The stack is Astro SSR with SolidJS islands, a Hono API on Cloudflare Workers, Turso (libSQL) via Drizzle, real-time notifications over Durable Objects, R2 for images, and Vitest at the HTTP seam (ADR-0005, ADR-0006).

## Repository state

This repository contains **documentation only** — no application code yet. The domain documentation is complete and authoritative. Start by reading `AGENTS.md`; it contains the permanent rules every agent and contributor must follow.

## Document hierarchy

| Doc | Role |
| --- | --- |
| `AGENTS.md` | Permanent rules and repository state; read this first |
| `.scratch/initial-product-definition/spec.md` | Product requirements: user stories and implementation decisions |
| `.scratch/project-f-spec/spec.md` | Consolidated product specification (all approved decisions) with vertical-slice tickets 01–34 in `.scratch/project-f-spec/issues/` |
| `CONTEXT.md` | Canonical glossary (ubiquitous language) |
| `docs/domain-model.md` | Authoritative domain model: entities, relationships, states, roles, rules, invariants |
| `docs/adr/` | Architectural decisions (0001–0006) |
| `docs/architecture.md` | Approved application architecture: modules, communication, persistence, auth |
| `docs/persistence-model.md` | Accepted persistence model: tables, columns, decisions (D1–D13), target of the initial Drizzle migration |
| `docs/api.md` | Accepted REST API design: methods, URLs, requests, responses, validation, auth, authorization, errors |
| `docs/design-system/` | Approved Design System: tokens, components, layout, accessibility |
| `docs/ux/` | Accepted UX flows (01–18) |
| `docs/routes.md` | Accepted route map |
| `docs/agents/` | Engineering-skill config (issue tracker, domain docs) |

## Where the work is tracked

Product specs and implementation tickets live as markdown in `.scratch/<feature-slug>/`: the accepted spec and tickets 01–59 in `.scratch/initial-product-definition/`, the consolidated spec and its vertical-slice tickets 01–34 in `.scratch/project-f-spec/`, and a proposed (not accepted) feature in `.scratch/member-directory/`. See `docs/agents/issue-tracker.md`.
