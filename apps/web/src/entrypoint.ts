import { Hono } from "hono";
import { app, type Env } from "@project-f/api";

const worker = new Hono<{ Bindings: Env }>();

worker.route("/api", app);
worker.route("/realtime", app);

// Astro SSR handler will be mounted at the edge via Astro's Cloudflare adapter
// This entrypoint is used by Wrangler to serve the combined Worker

export default worker;
export { app } from "@project-f/api";
export type { AppType } from "@project-f/api";