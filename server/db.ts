import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot create user: database not available");
  }

  const result = await db.insert(users).values(user);
  return result[0].insertId;
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot update password: database not available");
  }

  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function updateUserLastSignIn(userId: number) {
  const db = await getDb();
  if (!db) {
    return;
  }

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function listUsers() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(users);
}

export async function updateUser(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot update user: database not available");
  }

  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot delete user: database not available");
  }

  await db.delete(users).where(eq(users.id, userId));
}

// ============= SUPPLIERS =============

import { 
  suppliers, purchaseRequisitions, requisitionItems, quotes, quoteItems,
  purchaseOrders, budgets, budgetItems, budgetTemplates, equipment,
  maintenanceSchedules, maintenanceRecords, companySettings
} from "../drizzle/schema";
import { desc, sql } from "drizzle-orm";

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

export async function getMaintenanceScheduleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.id, id)).limit(1);
  return result[0];
}

export async function getMaintenanceSchedulesByEquipment(equipmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(maintenanceSchedules)
    .where(eq(maintenanceSchedules.equipmentId, equipmentId))
    .orderBy(maintenanceSchedules.scheduledDate);
}

export async function getAllMaintenanceRecords() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(maintenanceRecords).orderBy(desc(maintenanceRecords.performedDate));
}

export async function getMaintenanceRecordById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.id, id)).limit(1);
  return result[0];
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
