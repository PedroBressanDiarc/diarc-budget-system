import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Updated to support independent authentication with email + password.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name").notNull(),
  role: mysqlEnum("role", ["storekeeper", "buyer", "director"]).default("buyer").notNull(),
  isActive: int("isActive").default(1).notNull(),
  openId: varchar("openId", { length: 64 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("local"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Suppliers (Fornecedores)
 */
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  contact: varchar("contact", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

/**
 * Purchase Requisitions (Requisições de Compra)
 */
export const purchaseRequisitions = mysqlTable("purchase_requisitions", {
  id: int("id").autoincrement().primaryKey(),
  requisitionNumber: varchar("requisitionNumber", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", [
    "solicitacao",              // Almoxarife criou
    "cotacao_em_progresso",     // Comprador adicionando cotações
    "cotacoes_em_analise",      // Comprador fez comparação inicial
    "aguardando_autorizacao",   // Diretor vai aprovar
    "autorizado",               // Diretor aprovou
    "ordem_compra_enviada",     // Pedido gerado e enviado
    "aguardando_recebimento",   // Aguardando entrega
    "recebido",                 // Concluído
    "cancelado"                 // Cancelado
  ]).default("solicitacao").notNull(),
  requestedBy: int("requestedBy").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  notes: text("notes"),
  changeRequested: boolean("changeRequested").default(false).notNull(),
  changeRequestReason: text("changeRequestReason"),
  changeRequestedAt: timestamp("changeRequestedAt"),
  changeApprovedBy: int("changeApprovedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseRequisition = typeof purchaseRequisitions.$inferSelect;
export type InsertPurchaseRequisition = typeof purchaseRequisitions.$inferInsert;

/**
 * Requisition Items (Itens da Requisição)
 */
export const requisitionItems = mysqlTable("requisition_items", {
  id: int("id").autoincrement().primaryKey(),
  requisitionId: int("requisitionId").notNull(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  brand: varchar("brand", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RequisitionItem = typeof requisitionItems.$inferSelect;
export type InsertRequisitionItem = typeof requisitionItems.$inferInsert;

/**
 * Quotes (Cotações)
 */
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  requisitionId: int("requisitionId").notNull(),
  supplierId: int("supplierId").notNull(),
  quoteNumber: varchar("quoteNumber", { length: 50 }),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }),
  deliveryTime: int("deliveryTime"), // days
  paymentTerms: text("paymentTerms"),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

/**
 * Quote Items (Itens da Cotação)
 */
export const quoteItems = mysqlTable("quote_items", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull(),
  requisitionItemId: int("requisitionItemId").notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }).notNull(),
  brand: varchar("brand", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = typeof quoteItems.$inferInsert;

/**
 * Purchase Orders (Pedidos de Compra)
 */
export const purchaseOrders = mysqlTable("purchase_orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  requisitionId: int("requisitionId").notNull(),
  quoteId: int("quoteId").notNull(),
  supplierId: int("supplierId").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "received", "cancelled"]).default("pending").notNull(),
  orderDate: varchar("orderDate", { length: 10 }).notNull(),
  expectedDelivery: varchar("expectedDelivery", { length: 10 }),
  actualDelivery: varchar("actualDelivery", { length: 10 }),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  receivedBy: int("receivedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

/**
 * Budget Templates (Templates de Orçamento)
 */
export const budgetTemplates = mysqlTable("budget_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetTemplate = typeof budgetTemplates.$inferSelect;
export type InsertBudgetTemplate = typeof budgetTemplates.$inferInsert;

/**
 * Budgets (Orçamentos)
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  budgetNumber: varchar("budgetNumber", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  templateId: int("templateId"),
  status: mysqlEnum("status", ["draft", "sent", "approved", "rejected"]).default("draft").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Budget Items (Itens do Orçamento)
 */
export const budgetItems = mysqlTable("budget_items", {
  id: int("id").autoincrement().primaryKey(),
  budgetId: int("budgetId").notNull(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  brand: varchar("brand", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = typeof budgetItems.$inferInsert;

/**
 * Equipment (Equipamentos e Máquinas)
 */
export const equipment = mysqlTable("equipment", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).unique(),
  type: varchar("type", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 255 }),
  model: varchar("model", { length: 255 }),
  serialNumber: varchar("serialNumber", { length: 255 }),
  location: varchar("location", { length: 255 }),
  purchaseDate: varchar("purchaseDate", { length: 10 }),
  warrantyExpiry: varchar("warrantyExpiry", { length: 10 }),
  status: mysqlEnum("status", ["active", "maintenance", "inactive", "retired"]).default("active").notNull(),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;

/**
 * Maintenance Schedules (Agendamentos de Manutenção)
 */
export const maintenanceSchedules = mysqlTable("maintenance_schedules", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: int("equipmentId").notNull(),
  maintenanceType: mysqlEnum("maintenanceType", ["preventive", "corrective"]).notNull(),
  scheduledDate: varchar("scheduledDate", { length: 10 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertMaintenanceSchedule = typeof maintenanceSchedules.$inferInsert;

/**
 * Maintenance Records (Registros de Manutenções Realizadas)
 */
export const maintenanceRecords = mysqlTable("maintenance_records", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: int("equipmentId").notNull(),
  scheduleId: int("scheduleId"),
  maintenanceType: mysqlEnum("maintenanceType", ["preventive", "corrective"]).notNull(),
  performedDate: varchar("performedDate", { length: 10 }).notNull(),
  description: text("description"),
  technician: varchar("technician", { length: 255 }),
  cost: decimal("cost", { precision: 12, scale: 2 }),
  partsReplaced: text("partsReplaced"),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = typeof maintenanceRecords.$inferInsert;

/**
 * Company Settings (Configurações da Empresa para PDFs)
 */
export const companySettings = mysqlTable("company_settings", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  logoUrl: text("logoUrl"),
  updatedBy: int("updatedBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = typeof companySettings.$inferInsert;

/**
 * Requisition Attachments (Anexos de Requisições)
 */
export const requisitionAttachments = mysqlTable("requisition_attachments", {
  id: int("id").autoincrement().primaryKey(),
  requisitionId: int("requisitionId").notNull(),
  fileType: mysqlEnum("fileType", ["cotacao", "ordem_compra", "adicional"]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize"), // em bytes
  mimeType: varchar("mimeType", { length: 100 }),
  uploadedBy: int("uploadedBy").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type RequisitionAttachment = typeof requisitionAttachments.$inferSelect;
export type InsertRequisitionAttachment = typeof requisitionAttachments.$inferInsert;
