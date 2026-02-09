import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(role: "buyer" | "director" = "buyer"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("suppliers", () => {
  it("should list suppliers", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.suppliers.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow creating supplier", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const supplierData = {
      name: "Test Supplier",
      cnpj: "12.345.678/0001-90",
      contact: "John Doe",
      phone: "(11) 1234-5678",
      email: "test@supplier.com",
    };

    const result = await caller.suppliers.create(supplierData);

    expect(result.success).toBe(true);
    expect(result.id).toBeTypeOf("number");
  });
});

describe("dashboard", () => {
  it("should return metrics", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.metrics();

    expect(result).toBeDefined();
    expect(result).toHaveProperty("monthlyVolume");
    expect(result).toHaveProperty("pendingRequisitions");
    expect(result).toHaveProperty("upcomingMaintenance");
  });
});
