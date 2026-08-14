import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { Db } from "../db";

export const configurationModule = {
  get: async (db: Db) => {
    const config = await db.query.forumConfiguration.findFirst();
    if (!config) {
      // Return defaults if not configured
      return {
        name: "Project F Forum",
        domain: null,
        cover_image: null,
        colors: {
          primary: "#3b82f6",
          secondary: "#64748b",
          accent: "#f59e0b",
          background: "#ffffff",
          text: "#111827",
        },
        registration_mode: "open",
        require_email_confirmation: true,
        refund_window_minutes: 1440,
        sell_fraction: 50,
        soft_delete_days: 7,
        sheet_fields: [],
        default_permissions: {
          webmaster: { read: true, write: true },
          administrator: { read: true, write: true },
          moderator: { read: true, write: true },
          user: { read: true, write: true },
        },
        ai_evaluation_enabled: false,
        ai_criteria: null,
        updated_at: Date.now(),
      };
    }
    return {
      ...config,
      colors: JSON.parse(config.colors),
      default_permissions: JSON.parse(config.default_permissions),
      sheet_fields: JSON.parse(config.sheet_fields),
    };
  },

  update: async (db: Db, data: Partial<typeof schema.forumConfiguration.$inferInsert>) => {
    const existing = await db.query.forumConfiguration.findFirst();
    if (existing) {
      await db
        .update(schema.forumConfiguration)
        .set({ ...data, updated_at: Date.now() })
        .where(eq(schema.forumConfiguration.id, 1));
    } else {
      await db.insert(schema.forumConfiguration).values({
        id: 1,
        ...data,
        updated_at: Date.now(),
      } as any);
    }
    return configurationModule.get(db);
  },
};