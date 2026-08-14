import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./schema/index.ts",
  out: "../../drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || "file:./local.db",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
  },
} as any);