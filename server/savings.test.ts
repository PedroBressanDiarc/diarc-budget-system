import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/trpc";
import { getDb } from "./db";
import { requisitionItems, quotes, savings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Savings (Economias)", () => {
  const buyerContext: TrpcContext = {
    user: { id: 1, email: "buyer@test.com", name: "Test Buyer", role: "buyer" },
    req: {} as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(buyerContext);

  it("should calculate savings when quote price is lower than max price", async () => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Criar requisição com valor máximo
    const reqResult = await caller.requisitions.create({
      title: "Test Requisition with Max Price",
      description: "Testing savings calculation",
      items: [{
        itemName: "Test Item",
        quantity: 10,
        unit: "un",
        maxPrice: 100, // Valor máximo R$ 100
      }],
    });

    const requisitionId = reqResult.id;

    // Buscar item criado
    const itemsResult = await database
      .select()
      .from(requisitionItems)
      .where(eq(requisitionItems.requisitionId, requisitionId));

    const itemId = itemsResult[0].id;

    // Criar cotação com preço menor que o máximo
    const quoteResult = await caller.quotes.create({
      requisitionId,
      supplierId: 2, // PEDRO BRESSAN
      quoteNumber: "Q-TEST-001",
      items: [{
        requisitionItemId: itemId,
        unitPrice: 80, // R$ 80 (R$ 20 de economia)
        quantity: 10,
      }],
    });

    // Verificar se a economia foi registrada
    const savingsResult = await database
      .select()
      .from(savings)
      .where(eq(savings.quoteId, quoteResult.id));

    expect(savingsResult.length).toBe(1);
    expect(parseFloat(savingsResult[0].maxPrice)).toBe(100);
    expect(parseFloat(savingsResult[0].actualPrice)).toBe(80);
    expect(parseFloat(savingsResult[0].savedAmount)).toBe(20);
    expect(savingsResult[0].savedBy).toBe(1); // ID do comprador

    // Limpar dados de teste
    await database.delete(savings).where(eq(savings.quoteId, quoteResult.id));
    await database.delete(quotes).where(eq(quotes.id, quoteResult.id));
  });

  it("should NOT create savings when quote price equals or exceeds max price", async () => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Criar requisição com valor máximo
    const reqResult = await caller.requisitions.create({
      title: "Test Requisition No Savings",
      description: "Testing no savings when price is higher",
      items: [{
        itemName: "Test Item No Savings",
        quantity: 5,
        unit: "un",
        maxPrice: 50,
      }],
    });

    const requisitionId = reqResult.id;

    // Buscar item criado
    const itemsResult = await database
      .select()
      .from(requisitionItems)
      .where(eq(requisitionItems.requisitionId, requisitionId));

    const itemId = itemsResult[0].id;

    // Criar cotação com preço IGUAL ao máximo
    const quoteResult = await caller.quotes.create({
      requisitionId,
      supplierId: 2,
      quoteNumber: "Q-TEST-002",
      items: [{
        requisitionItemId: itemId,
        unitPrice: 50, // Igual ao máximo
        quantity: 5,
      }],
    });

    // Verificar que NÃO foi criada economia
    const savingsResult = await database
      .select()
      .from(savings)
      .where(eq(savings.quoteId, quoteResult.id));

    expect(savingsResult.length).toBe(0);

    // Limpar dados de teste
    await database.delete(quotes).where(eq(quotes.id, quoteResult.id));
  });

  it("should list savings by user", async () => {
    const result = await caller.savings.listByUser({ userId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should calculate total savings by user", async () => {
    const total = await caller.savings.getTotalByUser({ userId: 1 });
    expect(typeof total).toBe("number");
    expect(total).toBeGreaterThanOrEqual(0);
  });
});
