import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/trpc";

describe("Quotes Router", () => {
  const mockContext: TrpcContext = {
    user: { id: 1, email: "buyer@test.com", name: "Test Buyer", role: "buyer" },
    req: {} as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(mockContext);

  it("should create a quote with items", async () => {
    const result = await caller.quotes.create({
      requisitionId: 1,
      supplierId: 1,
      quoteNumber: "Q-001",
      deliveryTime: 15,
      paymentTerms: "30 dias",
      notes: "Cotação de teste",
      items: [
        {
          requisitionItemId: 1,
          unitPrice: 100.50,
          quantity: 10,
          brand: "Marca A",
          notes: "Item de teste",
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeGreaterThan(0);
  });

  it("should list quotes by requisition", async () => {
    const quotes = await caller.quotes.listByRequisition({ requisitionId: 1 });
    
    expect(Array.isArray(quotes)).toBe(true);
    if (quotes.length > 0) {
      expect(quotes[0]).toHaveProperty("id");
      expect(quotes[0]).toHaveProperty("supplierId");
      expect(quotes[0]).toHaveProperty("items");
      expect(quotes[0]).toHaveProperty("supplier");
    }
  });

  it("should calculate total amount correctly", async () => {
    const result = await caller.quotes.create({
      requisitionId: 1,
      supplierId: 1,
      items: [
        { requisitionItemId: 1, unitPrice: 10, quantity: 5 },
        { requisitionItemId: 2, unitPrice: 20, quantity: 3 },
      ],
    });

    expect(result.success).toBe(true);
    
    const quotes = await caller.quotes.listByRequisition({ requisitionId: 1 });
    const createdQuote = quotes.find(q => q.id === result.id);
    
    // Total should be (10 * 5) + (20 * 3) = 110
    expect(Number(createdQuote?.totalAmount)).toBe(110);
  });
});

describe("Attachments Router", () => {
  const mockContext: TrpcContext = {
    user: { id: 1, email: "buyer@test.com", name: "Test Buyer", role: "buyer" },
    req: {} as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(mockContext);

  it("should upload an attachment", async () => {
    const result = await caller.attachments.upload({
      requisitionId: 1,
      fileType: "cotacao",
      fileName: "cotacao-teste.pdf",
      fileUrl: "https://example.com/file.pdf",
      fileSize: 102400,
      mimeType: "application/pdf",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeGreaterThan(0);
  });

  it("should list attachments by requisition", async () => {
    const attachments = await caller.attachments.list({ requisitionId: 1 });
    
    expect(Array.isArray(attachments)).toBe(true);
    if (attachments.length > 0) {
      expect(attachments[0]).toHaveProperty("id");
      expect(attachments[0]).toHaveProperty("fileName");
      expect(attachments[0]).toHaveProperty("fileUrl");
      expect(attachments[0]).toHaveProperty("fileType");
    }
  });

  it("should delete an attachment", async () => {
    // First create an attachment
    const uploadResult = await caller.attachments.upload({
      requisitionId: 1,
      fileType: "adicional",
      fileName: "temp.pdf",
      fileUrl: "https://example.com/temp.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
    });

    // Then delete it
    const deleteResult = await caller.attachments.delete({ id: uploadResult.id });
    
    expect(deleteResult.success).toBe(true);
  });

  it("should accept different file types", async () => {
    const fileTypes = ["cotacao", "ordem_compra", "adicional"] as const;
    
    for (const fileType of fileTypes) {
      const result = await caller.attachments.upload({
        requisitionId: 1,
        fileType,
        fileName: `test-${fileType}.pdf`,
        fileUrl: `https://example.com/${fileType}.pdf`,
        fileSize: 1024,
        mimeType: "application/pdf",
      });

      expect(result.success).toBe(true);
    }
  });
});
