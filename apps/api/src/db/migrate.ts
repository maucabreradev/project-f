import { migrate } from "drizzle-orm/libsql/migrator";
import { createDb } from "./index";

export async function runMigrations(env: { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN: string }) {
  const db = createDb(env);
  await migrate(db, { migrationsFolder: "./drizzle" });
}