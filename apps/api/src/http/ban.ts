import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { eq, and, or, gt } from "drizzle-orm";
import * as schema from "../db/schema";
import { Db } from "../db";

export interface BanCheckResult {
  banned: boolean;
  ban?: typeof schema.bans.$inferSelect;
}

export async function isBanned(
  db: Db,
  email: string | null,
  ip: string
): Promise<BanCheckResult> {
  const now = Date.now();

  const emailBan = email
    ? await db.query.bans.findFirst({
        where: (bans, { eq, and, or, gt }) =>
          and(
            eq(bans.target_type, "email"),
            eq(bans.target, email.toLowerCase()),
            eq(bans.state, "active"),
            or(eq(bans.duration_type, "permanent"), gt(bans.until, now))
          ),
      })
    : null;

  const ipBan = await db.query.bans.findFirst({
    where: (bans, { eq, and, or, gt }) =>
      and(
        eq(bans.target_type, "ip"),
        eq(bans.target, ip),
        eq(bans.state, "active"),
        or(eq(bans.duration_type, "permanent"), gt(bans.until, now))
      ),
  });

  const ban = emailBan || ipBan;
  return { banned: !!ban, ban: ban || undefined };
}

export const banMiddleware = createMiddleware(async (c, next) => {
  const db = c.get("db");
  const session = c.get("session");
  const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "unknown";
  const email = session?.memberId
    ? (await db.query.members.findFirst({ where: eq(schema.members.id, session.memberId) }))?.email
    : null;

  const { banned, ban } = await isBanned(db, email || null, ip);

  if (banned && ban) {
    throw new HTTPException(403, {
      message: "Banned",
      cause: {
        code: "banned",
        details: {
          reason: ban.reason,
          targetType: ban.target_type,
          durationType: ban.duration_type,
          until: ban.until,
        },
      },
    });
  }

  await next();
});