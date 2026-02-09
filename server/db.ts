import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  suppliers,
  purchaseRequisitions,
  requisitionItems,
  quotes,
  quoteItems,
  purchaseOrders,
  budgets,
  budgetItems,
  budgetTemplates,
  equipment,
  maintenanceSchedules,
  maintenanceRecords,
  companySettings,
  type Supplier,
  type PurchaseRequisition,
  type Quote,
  type PurchaseOrder,
  type Budget,
  type Equipment,
  type MaintenanceSchedule,
  type MaintenanceRecord,
  type CompanySettings
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'director';
      updateSet.role = 'director';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= SUPPLIERS =============

export async function getAllSuppliers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return result[0];
}

// ============= PURCHASE REQUISITIONS =============

export async function getAllRequisitions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(purchaseRequisitions).orderBy(desc(purchaseRequisitions.createdAt));
}

export async function getRequisitionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(purchaseRequisitions).where(eq(purchaseRequisitions.id, id)).limit(1);
  return result[0];
}

export async function getRequisitionItems(requisitionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(requisitionItems).where(eq(requisitionItems.requisitionId, requisitionId));
}

// ============= QUOTES =============

export async function getQuotesByRequisition(requisitionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quotes).where(eq(quotes.requisitionId, requisitionId));
}

export async function getQuoteItems(quoteId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));
}

// ============= PURCHASE ORDERS =============

export async function getAllPurchaseOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
}

export async function getPurchaseOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).limit(1);
  return result[0];
}

// ============= BUDGETS =============

export async function getAllBudgets() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(budgets).orderBy(desc(budgets.createdAt));
}

export async function getBudgetById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(budgets).where(eq(budgets.id, id)).limit(1);
  return result[0];
}

export async function getBudgetItems(budgetId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(budgetItems).where(eq(budgetItems.budgetId, budgetId));
}

export async function getAllBudgetTemplates() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(budgetTemplates).orderBy(desc(budgetTemplates.createdAt));
}

// ============= EQUIPMENT =============

export async function getAllEquipment() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(equipment).orderBy(desc(equipment.createdAt));
}

export async function getEquipmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(equipment).where(eq(equipment.id, id)).limit(1);
  return result[0];
}

// ============= MAINTENANCE =============

export async function getMaintenanceSchedules() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(maintenanceSchedules).orderBy(maintenanceSchedules.scheduledDate);
}

export async function getMaintenanceRecordsByEquipment(equipmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(maintenanceRecords)
    .where(eq(maintenanceRecords.equipmentId, equipmentId))
    .orderBy(desc(maintenanceRecords.performedDate));
}

export async function getUpcomingMaintenance(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return await db.select().from(maintenanceSchedules)
    .where(
      sql`${maintenanceSchedules.status} = 'scheduled' AND ${maintenanceSchedules.scheduledDate} >= ${today.toISOString().split('T')[0]} AND ${maintenanceSchedules.scheduledDate} <= ${futureDate.toISOString().split('T')[0]}`
    )
    .orderBy(maintenanceSchedules.scheduledDate);
}

// ============= COMPANY SETTINGS =============

export async function getCompanySettings() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companySettings).limit(1);
  return result[0];
}

// ============= DASHBOARD METRICS =============

export async function getDashboardMetrics() {
  const db = await getDb();
  if (!db) return null;

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Monthly purchase volume
  const monthlyOrders = await db.select().from(purchaseOrders)
    .where(
      sql`${purchaseOrders.orderDate} >= ${firstDayOfMonth.toISOString().split('T')[0]} AND ${purchaseOrders.orderDate} <= ${lastDayOfMonth.toISOString().split('T')[0]}`
    );

  const monthlyVolume = monthlyOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  // Pending requisitions
  const pendingReqs = await db.select().from(purchaseRequisitions)
    .where(eq(purchaseRequisitions.status, 'pending_quotes'));

  // Upcoming maintenance
  const upcomingMaint = await getUpcomingMaintenance(7);

  return {
    monthlyVolume,
    pendingRequisitions: pendingReqs.length,
    upcomingMaintenance: upcomingMaint.length,
  };
}
