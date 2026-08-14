import {
  sqliteTable,
  integer,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const forumConfiguration = sqliteTable("forum_configuration", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain"),
  cover_image: text("cover_image"),
  colors: text("colors").notNull(),
  registration_mode: text("registration_mode", { enum: ["open", "approval"] })
    .notNull()
    .default("open"),
  require_email_confirmation: integer("require_email_confirmation", { mode: "boolean" })
    .notNull()
    .default(true),
  refund_window_minutes: integer("refund_window_minutes").notNull().default(1440),
  sell_fraction: integer("sell_fraction").notNull().default(50),
  soft_delete_days: integer("soft_delete_days").notNull().default(7),
  sheet_fields: text("sheet_fields").notNull().default("[]"),
  default_permissions: text("default_permissions").notNull().default("{}"),
  ai_evaluation_enabled: integer("ai_evaluation_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  ai_criteria: text("ai_criteria"),
  ai_api_key_ciphertext: text("ai_api_key_ciphertext"),
  updated_at: integer("updated_at").notNull(),
});

export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  confirmation_state: text("confirmation_state", { enum: ["unconfirmed", "confirmed"] })
    .notNull()
    .default("unconfirmed"),
  approval_state: text("approval_state", { enum: ["pending", "approved", "rejected"] }),
  status: text("status", { enum: ["active", "inactive"] })
    .notNull()
    .default("active"),
  rank: text("rank", { enum: ["webmaster", "administrator", "moderator", "user"] })
    .notNull()
    .default("user"),
  moderator_can_edit_economy: integer("moderator_can_edit_economy", { mode: "boolean" })
    .notNull()
    .default(false),
  moderator_scope_global: integer("moderator_scope_global", { mode: "boolean" })
    .notNull()
    .default(false),
  created_at: integer("created_at").notNull(),
  updated_at: integer("updated_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  member_id: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  active_character_id: text("active_character_id").references(() => characters.id, {
    onDelete: "set null",
  }),
  csrf_token: text("csrf_token").notNull(),
  created_at: integer("created_at").notNull(),
  last_seen_at: integer("last_seen_at").notNull(),
  expires_at: integer("expires_at").notNull(),
});

export const emailTokens = sqliteTable("email_tokens", {
  id: text("id").primaryKey(),
  member_id: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  purpose: text("purpose", { enum: ["confirm", "password-reset", "email-change"] }).notNull(),
  token_hash: text("token_hash").notNull().unique(),
  created_at: integer("created_at").notNull(),
  expires_at: integer("expires_at").notNull(),
  consumed_at: integer("consumed_at"),
});

export const moderationScopeBoards = sqliteTable("moderation_scope_boards", {
  member_id: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  board_id: text("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  created_at: integer("created_at").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.member_id, table.board_id] }),
}));

export const characters = sqliteTable("characters", {
  id: text("id").primaryKey(),
  member_id: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  username_rename_used: integer("username_rename_used", { mode: "boolean" })
    .notNull()
    .default(false),
  avatar: text("avatar"),
  banner: text("banner"),
  currency_balance: integer("currency_balance").notNull().default(0),
  birth_date: text("birth_date"),
  status: text("status", { enum: ["active", "deleted"] }).notNull().default("active"),
  deleted_at: integer("deleted_at"),
  created_at: integer("created_at").notNull(),
  updated_at: integer("updated_at").notNull(),
  last_seen_at: integer("last_seen_at"),
});

export const quickLogins = sqliteTable("quick_logins", {
  character_id: text("character_id")
    .primaryKey()
    .references(() => characters.id, { onDelete: "cascade" }),
  member_id: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  created_at: integer("created_at").notNull(),
});

export const boards = sqliteTable("boards", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  kind: text("kind", { enum: ["category", "forum", "subforum"] }).notNull(),
  parent_id: text("parent_id").references((): any => boards.id, { onDelete: "restrict" }),
  sort_order: integer("sort_order").notNull().default(0),
  description: text("description").notNull().default(""),
  hidden_from_visitors: integer("hidden_from_visitors", { mode: "boolean" })
    .notNull()
    .default(false),
  is_archive: integer("is_archive", { mode: "boolean" }).notNull().default(false),
  min_chars: integer("min_chars"),
  max_chars: integer("max_chars"),
  images_allowed: integer("images_allowed", { mode: "boolean" }),
  image_poster_ranks: text("image_poster_ranks"),
  thread_count: integer("thread_count").notNull().default(0),
  post_count: integer("post_count").notNull().default(0),
  last_post_at: integer("last_post_at"),
  created_at: integer("created_at").notNull(),
  updated_at: integer("updated_at").notNull(),
});

export const boardPermissions = sqliteTable("board_permissions", {
  board_id: text("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  rank: text("rank", { enum: ["webmaster", "administrator", "moderator", "user"] }).notNull(),
  can_read: integer("can_read", { mode: "boolean" }).notNull(),
  can_write: integer("can_write", { mode: "boolean" }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.board_id, table.rank] }),
}));

export const threads = sqliteTable("threads", {
  id: text("id").primaryKey(),
  board_id: text("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  creator_id: text("creator_id").references(() => characters.id, { onDelete: "set null" }),
  creator_name: text("creator_name").notNull(),
  ic_ooc: text("ic_ooc", { enum: ["ic", "ooc"] }).notNull(),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  state: text("state", { enum: ["open", "closed", "archived", "soft-deleted"] })
    .notNull()
    .default("open"),
  archive_source_board_id: text("archive_source_board_id").references(() => boards.id),
  soft_delete_expires_at: integer("soft_delete_expires_at"),
  post_count: integer("post_count").notNull().default(0),
  last_post_at: integer("last_post_at"),
  created_at: integer("created_at").notNull(),
  updated_at: integer("updated_at").notNull(),
});

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  thread_id: text("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  author_id: text("author_id").references(() => characters.id, { onDelete: "set null" }),
  author_name: text("author_name").notNull(),
  content: text("content").notNull(),
  content_html: text("content_html").notNull(),
  created_at: integer("created_at").notNull(),
  edited_at: integer("edited_at"),
});

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  price: integer("price").notNull(),
  stock_model: text("stock_model", { enum: ["infinite", "limited", "unique"] }).notNull(),
  stock_remaining: integer("stock_remaining"),
  unique_purchase: integer("unique_purchase", { mode: "boolean" }).notNull().default(false),
  kind: text("kind", { enum: ["inventory-item", "cosmetic"] }).notNull(),
  created_at: integer("created_at").notNull(),
  updated_at: integer("updated_at").notNull(),
});

export const inventoryEntries = sqliteTable("inventory_entries", {
  id: text("id").primaryKey(),
  character_id: text("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  item_id: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull().default(1),
  purchased_at: integer("purchased_at").notNull(),
  state: text("state", { enum: ["owned", "sold", "refunded"] }).notNull().default("owned"),
  lifecycled_at: integer("lifecycled_at"),
  sold_for: integer("sold_for"),
  in_bag: integer("in_bag", { mode: "boolean" }).notNull().default(false),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  character_id: text("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["earn", "purchase", "sale", "refund", "adjust"] }).notNull(),
  amount: integer("amount").notNull(),
  item_id: text("item_id").references(() => items.id, { onDelete: "set null" }),
  item_name: text("item_name"),
  actor_type: text("actor_type", { enum: ["system", "staff", "member"] }).notNull(),
  actor_id: text("actor_id").references(() => members.id, { onDelete: "set null" }),
  reason: text("reason"),
  occurred_at: integer("occurred_at").notNull(),
});

export const earnRules = sqliteTable("earn_rules", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["per-thread", "per-post", "login-streak", "interest", "birthday"] })
    .notNull()
    .unique(),
  params: text("params").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  created_at: integer("created_at").notNull(),
  updated_at: integer("updated_at").notNull(),
});

export const sheetTemplates = sqliteTable("sheet_templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  presentation: text("presentation").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  created_at: integer("created_at").notNull(),
  updated_at: integer("updated_at").notNull(),
});

export const characterSheets = sqliteTable("character_sheets", {
  id: text("id").primaryKey(),
  character_id: text("character_id")
    .notNull()
    .unique()
    .references(() => characters.id, { onDelete: "cascade" }),
  template_id: text("template_id").references(() => sheetTemplates.id, { onDelete: "set null" }),
  data: text("data").notNull(),
  evaluation_provider: text("evaluation_provider"),
  evaluation_result: text("evaluation_result"),
  evaluation_criteria_version: text("evaluation_criteria_version"),
  evaluated_at: integer("evaluated_at"),
  created_at: integer("created_at").notNull(),
  updated_at: integer("updated_at").notNull(),
});

export const bans = sqliteTable("bans", {
  id: text("id").primaryKey(),
  target_type: text("target_type", { enum: ["email", "ip"] }).notNull(),
  target: text("target").notNull(),
  reason: text("reason").notNull(),
  duration_type: text("duration_type", { enum: ["permanent", "until"] }).notNull(),
  until: integer("until"),
  state: text("state", { enum: ["active", "appealed", "revoked", "expired"] })
    .notNull()
    .default("active"),
  arbitration_pending: integer("arbitration_pending", { mode: "boolean" })
    .notNull()
    .default(false),
  arbitration_result: text("arbitration_result", { enum: ["approved", "rejected"] }),
  arbiter_id: text("arbiter_id").references(() => members.id, { onDelete: "set null" }),
  decided_at: integer("decided_at"),
  created_by_id: text("created_by_id").references(() => members.id, { onDelete: "set null" }),
  created_by_name: text("created_by_name").notNull(),
  created_at: integer("created_at").notNull(),
  expires_at: integer("expires_at"),
  updated_at: integer("updated_at").notNull(),
});

export const appeals = sqliteTable("appeals", {
  id: text("id").primaryKey(),
  ban_id: text("ban_id")
    .notNull()
    .references(() => bans.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  state: text("state", { enum: ["open", "approved", "rejected"] })
    .notNull()
    .default("open"),
  submitted_at: integer("submitted_at").notNull(),
  decided_by_id: text("decided_by_id").references(() => members.id, { onDelete: "set null" }),
  decided_at: integer("decided_at"),
});

export const moderationActions = sqliteTable("moderation_actions", {
  id: text("id").primaryKey(),
  actor_id: text("actor_id").references(() => members.id, { onDelete: "set null" }),
  actor_name: text("actor_name").notNull(),
  type: text("type", {
    enum: [
      "edit",
      "close",
      "open",
      "archive",
      "unarchive",
      "delete",
      "pin",
      "move",
      "currency-adjust",
      "inventory-adjust",
      "ban",
    ],
  }).notNull(),
  thread_id: text("thread_id").references(() => threads.id, { onDelete: "cascade" }),
  post_id: text("post_id").references(() => posts.id, { onDelete: "set null" }),
  character_id: text("character_id").references(() => characters.id, { onDelete: "set null" }),
  ban_id: text("ban_id").references(() => bans.id, { onDelete: "set null" }),
  note: text("note"),
  occurred_at: integer("occurred_at").notNull(),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  recipient_id: text("recipient_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: [
      "reply-thread",
      "reply-participation",
      "reply-post",
      "mention",
      "appeal-resolved",
      "currency-birthday",
      "currency-interest",
    ],
  }).notNull(),
  payload: text("payload").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  read_at: integer("read_at"),
  created_at: integer("created_at").notNull(),
});

export const notificationPreferences = sqliteTable("notification_preferences", {
  member_id: text("member_id")
    .primaryKey()
    .references(() => members.id, { onDelete: "cascade" }),
  prefs: text("prefs").notNull(),
  updated_at: integer("updated_at").notNull(),
});