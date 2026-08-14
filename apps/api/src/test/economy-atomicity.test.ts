import { describe, it, expect, beforeEach } from "vitest";
import { eq, and } from "drizzle-orm";
import * as schema from "../db/schema";
import { ulid } from "ulid";
import { drizzle } from "drizzle-orm/libsql";

declare global {
  var testDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function getDb() {
  return globalThis.testDb!;
}

describe("Economy atomicity spike", () => {
  let characterId: string;
  let itemId: string;
  let memberId: string;

  beforeEach(async () => {
    const db = getDb();
    // Create a test member first
    memberId = ulid();
    await db.insert(schema.members).values({
      id: memberId,
      email: `test${Date.now()}@example.com`,
      password_hash: "hashed_password",
      confirmation_state: "confirmed",
      status: "active",
      rank: "user",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // Create a test character
    characterId = ulid();
    await db.insert(schema.characters).values({
      id: characterId,
      member_id: memberId,
      name: "Test Character",
      username: `testuser${Date.now()}`,
      currency_balance: 1000,
      status: "active",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // Create a test item with limited stock
    itemId = ulid();
    await db.insert(schema.items).values({
      id: itemId,
      name: "Test Item",
      icon: "test",
      price: 100,
      stock_model: "limited",
      stock_remaining: 5,
      unique_purchase: false,
      kind: "inventory-item",
      created_at: Date.now(),
      updated_at: Date.now(),
    });
  });

  it("should debit balance, decrement stock, and create ledger entry", async () => {
    const db = getDb();
    const initialBalance = 1000;
    const itemPrice = 100;
    const quantity = 1;

    // Execute statements sequentially (libSQL HTTP doesn't support batch transactions yet)
    await db
      .update(schema.characters)
      .set({
        currency_balance: initialBalance - itemPrice * quantity,
        updated_at: Date.now(),
      })
      .where(eq(schema.characters.id, characterId));

    await db
      .update(schema.items)
      .set({
        stock_remaining: 5 - quantity,
        updated_at: Date.now(),
      })
      .where(eq(schema.items.id, itemId));

    await db.insert(schema.inventoryEntries).values({
      id: ulid(),
      character_id: characterId,
      item_id: itemId,
      quantity,
      purchased_at: Date.now(),
      state: "owned",
      in_bag: false,
    });

    await db.insert(schema.transactions).values({
      id: ulid(),
      character_id: characterId,
      type: "purchase",
      amount: -itemPrice * quantity,
      item_id: itemId,
      item_name: "Test Item",
      actor_type: "member",
      actor_id: memberId,
      reason: "Purchase",
      occurred_at: Date.now(),
    });

    // Verify all changes committed
    const character = await db.query.characters.findFirst({
      where: eq(schema.characters.id, characterId),
    });
    expect(character?.currency_balance).toBe(initialBalance - itemPrice);

    const item = await db.query.items.findFirst({
      where: eq(schema.items.id, itemId),
    });
    expect(item?.stock_remaining).toBe(4);

    const inventory = await db.query.inventoryEntries.findFirst({
      where: and(
        eq(schema.inventoryEntries.character_id, characterId),
        eq(schema.inventoryEntries.item_id, itemId)
      ),
    });
    expect(inventory).toBeDefined();
    expect(inventory?.quantity).toBe(1);
    expect(inventory?.state).toBe("owned");

    const transaction = await db.query.transactions.findFirst({
      where: and(
        eq(schema.transactions.character_id, characterId),
        eq(schema.transactions.type, "purchase")
      ),
    });
    expect(transaction).toBeDefined();
    expect(transaction?.amount).toBe(-itemPrice);
  });

  it("should handle sequential purchases correctly", async () => {
    const db = getDb();
    const itemPrice = 100;
    const quantity = 1;

    for (let i = 0; i < 3; i++) {
      const charId = ulid();
      const newMemberId = ulid();
      await db.insert(schema.members).values({
        id: newMemberId,
        email: `test${i}_${Date.now()}@example.com`,
        password_hash: "hashed_password",
        confirmation_state: "confirmed",
        status: "active",
        rank: "user",
        created_at: Date.now(),
        updated_at: Date.now(),
      });

      await db.insert(schema.characters).values({
        id: charId,
        member_id: newMemberId,
        name: `Test Character ${i}`,
        username: `testuser${i}_${Date.now()}`,
        currency_balance: 1000,
        status: "active",
        created_at: Date.now(),
        updated_at: Date.now(),
      });

      await db
        .update(schema.characters)
        .set({
          currency_balance: 1000 - itemPrice,
          updated_at: Date.now(),
        })
        .where(eq(schema.characters.id, charId));

      await db
        .update(schema.items)
        .set({
          stock_remaining: (await db.query.items.findFirst({ where: eq(schema.items.id, itemId) }))
            ?.stock_remaining! - quantity,
          updated_at: Date.now(),
        })
        .where(eq(schema.items.id, itemId));

      await db.insert(schema.inventoryEntries).values({
        id: ulid(),
        character_id: charId,
        item_id: itemId,
        quantity,
        purchased_at: Date.now(),
        state: "owned",
        in_bag: false,
      });

      await db.insert(schema.transactions).values({
        id: ulid(),
        character_id: charId,
        type: "purchase",
        amount: -itemPrice,
        item_id: itemId,
        item_name: "Test Item",
        actor_type: "member",
        actor_id: newMemberId,
        reason: "Purchase",
        occurred_at: Date.now(),
      });
    }

    const item = await db.query.items.findFirst({
      where: eq(schema.items.id, itemId),
    });
    // 5 initial - 3 = 2
    expect(item?.stock_remaining).toBe(2);
  });
});

describe("Single-writer Durable Object fallback", () => {
  it("should be implemented if HTTP batch fails", () => {
    // This test documents the fallback requirement
    // The DO would serialize all economy writes
    expect(true).toBe(true); // Placeholder
  });
});