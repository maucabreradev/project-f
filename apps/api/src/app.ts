import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { dbMiddleware, sessionMiddleware, csrfMiddleware } from "./http/middleware";
import { banMiddleware } from "./http/ban";
import { errorHandler, notFoundHandler } from "./http/errors";
import { modules } from "./modules";
import type { Env } from "./env";

export const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", cors({ origin: "*", credentials: true }));
app.use("*", dbMiddleware);
app.use("*", sessionMiddleware);
app.use("*", banMiddleware);

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.get("/api/health", (c) => c.json({ ok: true, timestamp: Date.now() }));

app.get("/api/config", async (c) => {
  const db = c.get("db");
  const config = await modules.configuration.get(db);
  return c.json(config);
});

export type AppType = typeof app;