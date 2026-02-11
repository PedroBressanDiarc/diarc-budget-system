import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { purchaseRequisitions, requisitionItems, quotes, quoteItems, savings, budgetAlerts, projects } from "../drizzle/schema";

describe("Reports Module", () => {
  let testUserId = 1;
  let testRequisitionId: number;
  let testProjectId: number;

  beforeAll(async () => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Criar projeto de teste
    const projectResult = await database.insert(projects).values({
      name: "Test Project for Reports",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      createdBy: testUserId,
    });
    testProjectId = Number(projectResult[0].insertId);

    // Criar requisição de teste
    const reqResult = await database.insert(purchaseRequisitions).values({
      requisitionNumber: `REQ-TEST-${Date.now()}`,
      title: "Test Requisition for Reports",
      description: "Test",
      projectId: testProjectId,
      requestedBy: testUserId,
      status: "solicitacao",
    });
    testRequisitionId = Number(reqResult[0].insertId);

    // Criar item de requisição com valor máximo
    const itemResult = await database.insert(requisitionItems).values({
      requisitionId: testRequisitionId,
      itemName: "Test Item with Max Price",
      quantity: 10,
      unit: "un",
      maxPrice: "100.00",
    });
    const testItemId = Number(itemResult[0].insertId);

    // Criar economia de teste
    await database.insert(savings).values({
      requisitionId: testRequisitionId,
      requisitionItemId: testItemId,
      quoteId: 1,
      maxPrice: "100.00",
      actualPrice: "80.00",
      savedAmount: "20.00",
      savedBy: testUserId,
    });

    // Criar alerta de orçamento de teste
    await database.insert(budgetAlerts).values({
      requisitionId: testRequisitionId,
      requisitionItemId: testItemId,
      quoteId: 1,
      maxPrice: "100.00",
      quotedPrice: "120.00",
      excessAmount: "20.00",
      createdBy: testUserId,
    });
  });

  it("should get system metrics", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "buyer" },
    } as any);

    const metrics = await caller.reports.systemMetrics();

    expect(metrics).toBeDefined();
    expect(metrics.totalSavings).toBeGreaterThanOrEqual(0);
    expect(metrics.totalRequisitions).toBeGreaterThan(0);
    expect(metrics.totalQuotes).toBeGreaterThanOrEqual(0);
  });

  it("should get savings ranking", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "buyer" },
    } as any);

    const ranking = await caller.reports.savingsRanking({});

    expect(Array.isArray(ranking)).toBe(true);
    if (ranking.length > 0) {
      expect(ranking[0]).toHaveProperty("userId");
      expect(ranking[0]).toHaveProperty("totalSavings");
      expect(ranking[0]).toHaveProperty("savingsCount");
      expect(ranking[0]).toHaveProperty("userName");
    }
  });

  it("should get monthly savings trend", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "buyer" },
    } as any);

    const trend = await caller.reports.savingsMonthlyTrend({ months: 12 });

    expect(Array.isArray(trend)).toBe(true);
    if (trend.length > 0) {
      expect(trend[0]).toHaveProperty("month");
      expect(trend[0]).toHaveProperty("totalSavings");
      expect(trend[0]).toHaveProperty("count");
    }
  });

  it("should get top saving items", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "buyer" },
    } as any);

    const topItems = await caller.reports.topSavingItems({ limit: 10 });

    expect(Array.isArray(topItems)).toBe(true);
    if (topItems.length > 0) {
      expect(topItems[0]).toHaveProperty("itemId");
      expect(topItems[0]).toHaveProperty("itemName");
      expect(topItems[0]).toHaveProperty("totalSavings");
      expect(topItems[0]).toHaveProperty("timesQuoted");
    }
  });

  it("should get savings by project", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "buyer" },
    } as any);

    const byProject = await caller.reports.savingsByProject({ projectId: testProjectId });

    expect(Array.isArray(byProject)).toBe(true);
    if (byProject.length > 0) {
      expect(byProject[0]).toHaveProperty("projectId");
      expect(byProject[0]).toHaveProperty("projectName");
      expect(byProject[0]).toHaveProperty("totalSavings");
      expect(byProject[0]).toHaveProperty("requisitionsCount");
      expect(byProject[0].projectId).toBe(testProjectId);
    }
  });

  it("should get requisitions by status", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "buyer" },
    } as any);

    const byStatus = await caller.reports.requisitionsByStatus();

    expect(Array.isArray(byStatus)).toBe(true);
    if (byStatus.length > 0) {
      expect(byStatus[0]).toHaveProperty("status");
      expect(byStatus[0]).toHaveProperty("count");
    }
  });

  it("should get top suppliers", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "buyer" },
    } as any);

    const topSuppliers = await caller.reports.topSuppliers({ limit: 10 });

    expect(Array.isArray(topSuppliers)).toBe(true);
    // Pode estar vazio se não houver cotações
  });

  it("should list pending budget alerts", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "director" },
    } as any);

    const alerts = await caller.budgetAlerts.listPending();

    expect(Array.isArray(alerts)).toBe(true);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].status).toBe("pending");
  });

  it("should approve budget alert", async () => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Criar alerta para aprovar
    const alertResult = await database.insert(budgetAlerts).values({
      requisitionId: testRequisitionId,
      requisitionItemId: 1,
      quoteId: 1,
      maxPrice: "100.00",
      quotedPrice: "110.00",
      excessAmount: "10.00",
      createdBy: testUserId,
    });
    const alertId = Number(alertResult[0].insertId);

    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "director" },
    } as any);

    const result = await caller.budgetAlerts.approve({
      id: alertId,
      notes: "Approved for testing",
    });

    expect(result.success).toBe(true);
  });

  it("should reject budget alert", async () => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Criar alerta para rejeitar
    const alertResult = await database.insert(budgetAlerts).values({
      requisitionId: testRequisitionId,
      requisitionItemId: 1,
      quoteId: 1,
      maxPrice: "100.00",
      quotedPrice: "130.00",
      excessAmount: "30.00",
      createdBy: testUserId,
    });
    const alertId = Number(alertResult[0].insertId);

    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "director" },
    } as any);

    const result = await caller.budgetAlerts.reject({
      id: alertId,
      notes: "Rejected for testing",
    });

    expect(result.success).toBe(true);
  });
});
