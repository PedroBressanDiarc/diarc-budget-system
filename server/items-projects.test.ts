import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { items, projects } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Items CRUD", () => {
  let testItemId: number;

  it("should create a new item", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db
      .insert(items)
      .values({
        name: "Parafuso M10",
        secondaryName: "Parafuso Métrico 10mm",
        defaultUnit: "un",
        ncm: "73181500",
        ncmDefinition: "Parafusos e pinos ou cavilhas, roscados, de ferro fundido, ferro ou aço",
        createdBy: 1,
      });

    testItemId = Number(result[0].insertId);
    expect(testItemId).toBeGreaterThan(0);

    // Verify the item was created
    const [item] = await db.select().from(items).where(eq(items.id, testItemId));
    expect(item).toBeDefined();
    expect(item.name).toBe("Parafuso M10");
    expect(item.secondaryName).toBe("Parafuso Métrico 10mm");
    expect(item.defaultUnit).toBe("un");
    expect(item.ncm).toBe("73181500");
  });

  it("should list all items", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allItems = await db.select().from(items);
    expect(allItems.length).toBeGreaterThan(0);
    expect(allItems.some((i) => i.id === testItemId)).toBe(true);
  });

  it("should update an item", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    await db
      .update(items)
      .set({
        name: "Parafuso M10 Atualizado",
        secondaryName: "Parafuso Métrico 10mm - Inox",
      })
      .where(eq(items.id, testItemId));

    // Verify the update
    const [updated] = await db.select().from(items).where(eq(items.id, testItemId));
    expect(updated.name).toBe("Parafuso M10 Atualizado");
    expect(updated.secondaryName).toBe("Parafuso Métrico 10mm - Inox");
  });

  it("should delete an item", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(items).where(eq(items.id, testItemId));
    const deleted = await db.select().from(items).where(eq(items.id, testItemId));
    expect(deleted.length).toBe(0);
  });
});

describe("Projects CRUD", () => {
  let testProjectId: number;

  it("should create a new project", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db
      .insert(projects)
      .values({
        name: "Obra Comil - Fase 2",
        startDate: "2026-03-01",
        endDate: "2026-12-31",
        createdBy: 1,
      });

    testProjectId = Number(result[0].insertId);
    expect(testProjectId).toBeGreaterThan(0);

    // Verify the project was created
    const [project] = await db.select().from(projects).where(eq(projects.id, testProjectId));
    expect(project).toBeDefined();
    expect(project.name).toBe("Obra Comil - Fase 2");
    expect(project.startDate).toBeDefined();
    expect(project.endDate).toBeDefined();
  });

  it("should list all projects", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allProjects = await db.select().from(projects);
    expect(allProjects.length).toBeGreaterThan(0);
    expect(allProjects.some((p) => p.id === testProjectId)).toBe(true);
  });

  it("should update a project", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    await db
      .update(projects)
      .set({
        name: "Obra Comil - Fase 2 Atualizada",
        endDate: "2027-01-31",
      })
      .where(eq(projects.id, testProjectId));

    // Verify the update
    const [updated] = await db.select().from(projects).where(eq(projects.id, testProjectId));
    expect(updated.name).toBe("Obra Comil - Fase 2 Atualizada");
    // Note: MySQL date fields return Date objects
    expect(updated.endDate).toBeDefined();
    if (updated.endDate) {
      const year = new Date(updated.endDate).getFullYear();
      expect(year).toBe(2027);
    }
  });

  it("should delete a project", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(projects).where(eq(projects.id, testProjectId));
    const deleted = await db.select().from(projects).where(eq(projects.id, testProjectId));
    expect(deleted.length).toBe(0);
  });
});

describe("Items Search Functionality", () => {
  let searchItemId: number;

  beforeAll(async () => {
    // Create test item for search
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db
      .insert(items)
      .values({
        name: "Cimento Portland",
        secondaryName: "Cimento CP-II",
        defaultUnit: "kg",
        ncm: "25232900",
        ncmDefinition: "Cimentos Portland",
        createdBy: 1,
      });
    
    searchItemId = Number(result[0].insertId);
  });

  it("should find item by primary name", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const results = await db
      .select()
      .from(items)
      .where(eq(items.name, "Cimento Portland"));
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe("Cimento Portland");
  });

  it("should find item by secondary name", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const results = await db
      .select()
      .from(items)
      .where(eq(items.secondaryName, "Cimento CP-II"));
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].secondaryName).toBe("Cimento CP-II");
  });

  // Cleanup
  afterAll(async () => {
    const db = await getDb();
    if (!db) return;
    await db.delete(items).where(eq(items.id, searchItemId));
  });
});
