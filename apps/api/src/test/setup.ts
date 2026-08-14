import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";
import { beforeAll, afterAll, vi } from "vitest";

let testDb: ReturnType<typeof drizzle> | undefined;
let client: ReturnType<typeof createClient> | undefined;

const createTablesStatements = [
  `CREATE TABLE IF NOT EXISTS forum_configuration (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    cover_image TEXT,
    colors TEXT NOT NULL,
    registration_mode TEXT NOT NULL DEFAULT 'open' CHECK (registration_mode IN ('open', 'approval')),
    require_email_confirmation INTEGER NOT NULL DEFAULT 1 CHECK (require_email_confirmation IN (0, 1)),
    refund_window_minutes INTEGER NOT NULL DEFAULT 1440,
    sell_fraction INTEGER NOT NULL DEFAULT 50,
    soft_delete_days INTEGER NOT NULL DEFAULT 7 CHECK (soft_delete_days BETWEEN 0 AND 30),
    sheet_fields TEXT NOT NULL DEFAULT '[]',
    default_permissions TEXT NOT NULL DEFAULT '{}',
    ai_evaluation_enabled INTEGER NOT NULL DEFAULT 0 CHECK (ai_evaluation_enabled IN (0, 1)),
    ai_criteria TEXT,
    ai_api_key_ciphertext TEXT,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    confirmation_state TEXT NOT NULL DEFAULT 'unconfirmed' CHECK (confirmation_state IN ('unconfirmed', 'confirmed')),
    approval_state TEXT CHECK (approval_state IN ('pending', 'approved', 'rejected')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    rank TEXT NOT NULL DEFAULT 'user' CHECK (rank IN ('webmaster', 'administrator', 'moderator', 'user')),
    moderator_can_edit_economy INTEGER NOT NULL DEFAULT 0 CHECK (moderator_can_edit_economy IN (0, 1)),
    moderator_scope_global INTEGER NOT NULL DEFAULT 0 CHECK (moderator_scope_global IN (0, 1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    active_character_id TEXT REFERENCES characters(id) ON DELETE SET NULL,
    csrf_token TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS email_tokens (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL CHECK (purpose IN ('confirm', 'password-reset', 'email-change')),
    token_hash TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    consumed_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS moderation_scope_boards (
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (member_id, board_id)
  )`,
  `CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    username_rename_used INTEGER NOT NULL DEFAULT 0 CHECK (username_rename_used IN (0, 1)),
    avatar TEXT,
    banner TEXT,
    currency_balance INTEGER NOT NULL DEFAULT 0,
    birth_date TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    deleted_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_seen_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS quick_logins (
    character_id TEXT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('category', 'forum', 'subforum')),
    parent_id TEXT REFERENCES boards(id) ON DELETE RESTRICT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    hidden_from_visitors INTEGER NOT NULL DEFAULT 0 CHECK (hidden_from_visitors IN (0, 1)),
    is_archive INTEGER NOT NULL DEFAULT 0 CHECK (is_archive IN (0, 1)),
    min_chars INTEGER,
    max_chars INTEGER,
    images_allowed INTEGER CHECK (images_allowed IN (0, 1)),
    image_poster_ranks TEXT,
    thread_count INTEGER NOT NULL DEFAULT 0,
    post_count INTEGER NOT NULL DEFAULT 0,
    last_post_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS board_permissions (
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    rank TEXT NOT NULL CHECK (rank IN ('webmaster', 'administrator', 'moderator', 'user')),
    can_read INTEGER NOT NULL CHECK (can_read IN (0, 1)),
    can_write INTEGER NOT NULL CHECK (can_write IN (0, 1)),
    PRIMARY KEY (board_id, rank)
  )`,
  `CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    creator_id TEXT REFERENCES characters(id) ON DELETE SET NULL,
    creator_name TEXT NOT NULL,
    ic_ooc TEXT NOT NULL CHECK (ic_ooc IN ('ic', 'ooc')),
    pinned INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
    state TEXT NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'closed', 'archived', 'soft-deleted')),
    archive_source_board_id TEXT REFERENCES boards(id),
    soft_delete_expires_at INTEGER,
    post_count INTEGER NOT NULL DEFAULT 0,
    last_post_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    author_id TEXT REFERENCES characters(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    edited_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    price INTEGER NOT NULL,
    stock_model TEXT NOT NULL CHECK (stock_model IN ('infinite', 'limited', 'unique')),
    stock_remaining INTEGER,
    unique_purchase INTEGER NOT NULL DEFAULT 0 CHECK (unique_purchase IN (0, 1)),
    kind TEXT NOT NULL CHECK (kind IN ('inventory-item', 'cosmetic')),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS inventory_entries (
    id TEXT PRIMARY KEY,
    character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    purchased_at INTEGER NOT NULL,
    state TEXT NOT NULL DEFAULT 'owned' CHECK (state IN ('owned', 'sold', 'refunded')),
    lifecycled_at INTEGER,
    sold_for INTEGER,
    in_bag INTEGER NOT NULL DEFAULT 0 CHECK (in_bag IN (0, 1))
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('earn', 'purchase', 'sale', 'refund', 'adjust')),
    amount INTEGER NOT NULL,
    item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
    item_name TEXT,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('system', 'staff', 'member')),
    actor_id TEXT REFERENCES members(id) ON DELETE SET NULL,
    reason TEXT,
    occurred_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS earn_rules (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL UNIQUE CHECK (type IN ('per-thread', 'per-post', 'login-streak', 'interest', 'birthday')),
    params TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sheet_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    presentation TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS character_sheets (
    id TEXT PRIMARY KEY,
    character_id TEXT NOT NULL UNIQUE REFERENCES characters(id) ON DELETE CASCADE,
    template_id TEXT REFERENCES sheet_templates(id) ON DELETE SET NULL,
    data TEXT NOT NULL,
    evaluation_provider TEXT,
    evaluation_result TEXT,
    evaluation_criteria_version TEXT,
    evaluated_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS bans (
    id TEXT PRIMARY KEY,
    target_type TEXT NOT NULL CHECK (target_type IN ('email', 'ip')),
    target TEXT NOT NULL,
    reason TEXT NOT NULL,
    duration_type TEXT NOT NULL CHECK (duration_type IN ('permanent', 'until')),
    until INTEGER,
    state TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'appealed', 'revoked', 'expired')),
    arbitration_pending INTEGER NOT NULL DEFAULT 0 CHECK (arbitration_pending IN (0, 1)),
    arbitration_result TEXT CHECK (arbitration_result IN ('approved', 'rejected')),
    arbiter_id TEXT REFERENCES members(id) ON DELETE SET NULL,
    decided_at INTEGER,
    created_by_id TEXT REFERENCES members(id) ON DELETE SET NULL,
    created_by_name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS appeals (
    id TEXT PRIMARY KEY,
    ban_id TEXT NOT NULL REFERENCES bans(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'approved', 'rejected')),
    submitted_at INTEGER NOT NULL,
    decided_by_id TEXT REFERENCES members(id) ON DELETE SET NULL,
    decided_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS moderation_actions (
    id TEXT PRIMARY KEY,
    actor_id TEXT REFERENCES members(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('edit', 'close', 'open', 'archive', 'unarchive', 'delete', 'pin', 'move', 'currency-adjust', 'inventory-adjust', 'ban')),
    thread_id TEXT REFERENCES threads(id) ON DELETE CASCADE,
    post_id TEXT REFERENCES posts(id) ON DELETE SET NULL,
    character_id TEXT REFERENCES characters(id) ON DELETE SET NULL,
    ban_id TEXT REFERENCES bans(id) ON DELETE SET NULL,
    note TEXT,
    occurred_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    recipient_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('reply-thread', 'reply-participation', 'reply-post', 'mention', 'appeal-resolved', 'currency-birthday', 'currency-interest')),
    payload TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0 CHECK (read IN (0, 1)),
    read_at INTEGER,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS notification_preferences (
    member_id TEXT PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    prefs TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  // Indexes
  `CREATE INDEX IF NOT EXISTS members_email_idx ON members(email)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS members_webmaster_unique ON members(rank) WHERE rank = 'webmaster'`,
  `CREATE INDEX IF NOT EXISTS sessions_member_id_idx ON sessions(member_id)`,
  `CREATE INDEX IF NOT EXISTS email_tokens_member_purpose_created_idx ON email_tokens(member_id, purpose, created_at)`,
  `CREATE INDEX IF NOT EXISTS characters_member_id_idx ON characters(member_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS characters_username_unique ON characters(username)`,
  `CREATE INDEX IF NOT EXISTS boards_parent_sort_idx ON boards(parent_id, sort_order)`,
  `CREATE INDEX IF NOT EXISTS boards_kind_idx ON boards(kind)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS boards_archive_unique ON boards(is_archive) WHERE is_archive = 1`,
  `CREATE INDEX IF NOT EXISTS threads_board_state_pinned_last_idx ON threads(board_id, state, pinned, last_post_at)`,
  `CREATE INDEX IF NOT EXISTS threads_creator_id_idx ON threads(creator_id)`,
  `CREATE INDEX IF NOT EXISTS threads_state_idx ON threads(state)`,
  `CREATE INDEX IF NOT EXISTS posts_thread_created_idx ON posts(thread_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS inventory_entries_character_state_idx ON inventory_entries(character_id, state)`,
  `CREATE INDEX IF NOT EXISTS inventory_entries_character_item_state_idx ON inventory_entries(character_id, item_id, state)`,
  `CREATE INDEX IF NOT EXISTS transactions_character_occurred_idx ON transactions(character_id, occurred_at)`,
  `CREATE INDEX IF NOT EXISTS transactions_type_occurred_idx ON transactions(type, occurred_at)`,
  `CREATE INDEX IF NOT EXISTS bans_target_state_idx ON bans(target_type, target, state)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS appeals_open_unique ON appeals(ban_id) WHERE state = 'open'`,
  `CREATE INDEX IF NOT EXISTS moderation_actions_thread_occurred_idx ON moderation_actions(thread_id, occurred_at)`,
  `CREATE INDEX IF NOT EXISTS moderation_actions_character_occurred_idx ON moderation_actions(character_id, occurred_at)`,
  `CREATE INDEX IF NOT EXISTS moderation_actions_type_occurred_idx ON moderation_actions(type, occurred_at)`,
  `CREATE INDEX IF NOT EXISTS notifications_recipient_read_created_idx ON notifications(recipient_id, read, created_at)`,
  `CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications(created_at)`,
];

beforeAll(async () => {
  client = createClient({
    url: "file:./test.db",
  });
  testDb = drizzle(client, { schema });

  // Create tables one by one
  for (const sql of createTablesStatements) {
    await client.execute(sql);
  }

  vi.stubGlobal("testDb", testDb);
});

afterAll(async () => {
  if (client) {
    await client.close();
  }
  // Clean up test database file (ignore Windows file locking errors)
  const fs = await import("fs");
  if (fs.existsSync("./test.db")) {
    try {
      fs.unlinkSync("./test.db");
    } catch {
      // Ignore EBUSY on Windows
    }
  }
});

export { createTablesStatements };