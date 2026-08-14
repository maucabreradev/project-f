import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { ulid } from "ulid";
import { createDb, Db } from "../db";
import { env } from "../env";
import * as schema from "../db/schema";
import { eq, and, gt } from "drizzle-orm";

export interface SessionData {
  memberId: string;
  characterId: string | null;
  csrfToken: string;
}

declare module "hono" {
  interface ContextVariableMap {
    db: Db;
    session: SessionData | null;
    env: typeof env;
  }
}

export const dbMiddleware = createMiddleware(async (c, next) => {
  const db = createDb({
    TURSO_DATABASE_URL: c.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: c.env.TURSO_AUTH_TOKEN,
  });
  c.set("db", db);
  c.set("env", { ...env, ...c.env });
  await next();
});

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const db = c.get("db");
  const sessionId = getCookie(c, "pf_session");

  if (!sessionId) {
    c.set("session", null);
    await next();
    return;
  }

  const session = await db.query.sessions.findFirst({
    where: (sessions, { eq, and, gt }) =>
      and(eq(sessions.id, sessionId), gt(sessions.expires_at, Date.now())),
    with: {
      member: true,
    },
  }) as any;

  if (!session || !session.member) {
    deleteCookie(c, "pf_session", { path: "/", httpOnly: true, secure: true, sameSite: "Lax" });
    c.set("session", null);
    await next();
    return;
  }

  if (session.member.status === "inactive") {
    c.set("session", {
      memberId: session.member.id,
      characterId: session.active_character_id,
      csrfToken: session.csrf_token,
    });
    await next();
    return;
  }

  c.set("session", {
    memberId: session.member.id,
    characterId: session.active_character_id,
    csrfToken: session.csrf_token,
  });

  await db
    .update(schema.sessions)
    .set({ last_seen_at: Date.now() })
    .where(eq(schema.sessions.id, sessionId));

  await next();
});

export const csrfMiddleware = createMiddleware(async (c, next) => {
  const method = c.req.method;
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    await next();
    return;
  }

  const session = c.get("session");
  if (!session) {
    throw new HTTPException(401, { message: "Unauthenticated" });
  }

  const csrfHeader = c.req.header("X-CSRF-Token");
  if (!csrfHeader || csrfHeader !== session.csrfToken) {
    throw new HTTPException(403, { message: "Invalid CSRF token" });
  }

  await next();
});

export const requireAuth = createMiddleware(async (c, next) => {
  const session = c.get("session");
  if (!session) {
    throw new HTTPException(401, { message: "Unauthenticated" });
  }
  await next();
});

export const requireConfirmed = createMiddleware(async (c, next) => {
  const session = c.get("session");
  if (!session) {
    throw new HTTPException(401, { message: "Unauthenticated" });
  }
  const db = c.get("db");
  const member = await db.query.members.findFirst({
    where: eq(schema.members.id, session.memberId),
  });
  if (!member || member.confirmation_state !== "confirmed") {
    throw new HTTPException(403, {
      message: "Account not confirmed",
      cause: { code: "unconfirmed" },
    });
  }
  if (member.approval_state === "pending") {
    throw new HTTPException(403, {
      message: "Account pending approval",
      cause: { code: "pending_approval" },
    });
  }
  if (member.approval_state === "rejected") {
    throw new HTTPException(403, {
      message: "Account rejected",
      cause: { code: "rejected" },
    });
  }
  if (member.status === "inactive") {
    throw new HTTPException(403, {
      message: "Account inactive",
      cause: { code: "inactive" },
    });
  }
  await next();
});

export const requireCharacter = createMiddleware(async (c, next) => {
  const session = c.get("session");
  if (!session?.characterId) {
    throw new HTTPException(403, {
      message: "No active character",
      cause: { code: "no_character" },
    });
  }
  await next();
});