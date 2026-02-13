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
  role: mysqlEnum("role", ["diretor", "comprador", "almoxarife", "manutencao", "financeiro"]).default("comprador").notNull(),
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
  website: varchar("website", { length: 255 }),
  paymentTerms: text("paymentTerms"), // Condições de pagamento padrão
  deliveryTime: varchar("deliveryTime", { length: 100 }), // Prazo de entrega médio
  category: varchar("category", { length: 100 }), // Categoria de produtos/serviços
  rating: int("rating"), // Avaliação de 1-5
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
  usageLocation: varchar("usageLocation", { length: 100 }),
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
  projectId: int("projectId"),
  requestedBy: int("requestedBy").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  observations: text("observations"),
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
  maxPrice: decimal("maxPrice", { precision: 12, scale: 2 }), // Valor máximo permitido (definido por admin)
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
 * Clients (Clientes)
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Budgets (Orçamentos)
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  budgetNumber: varchar("budgetNumber", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  clientId: int("clientId").notNull(),
  validUntil: varchar("validUntil", { length: 10 }),
  observations: text("observations"),
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
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }).notNull(),
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
  location: varchar("location", { length: 255 }), // Deprecated - usar locationId
  locationId: int("locationId"), // Referência para tabela locations
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
  status: mysqlEnum("status", ["scheduled", "quotation", "analysis", "awaiting_authorization", "authorized", "in_progress", "completed", "sent_to_purchase", "cancelled"]).default("scheduled").notNull(),
  estimatedPrice: decimal("estimatedPrice", { precision: 10, scale: 2 }),
  attachments: text("attachments"),
  purchaseRequisitionId: int("purchaseRequisitionId"),
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
  fileType: mysqlEnum("fileType", ["cotacao", "ordem_compra", "nota_fiscal", "adicional"]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize"), // em bytes
  mimeType: varchar("mimeType", { length: 100 }),
  uploadedBy: int("uploadedBy").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type RequisitionAttachment = typeof requisitionAttachments.$inferSelect;
export type InsertRequisitionAttachment = typeof requisitionAttachments.$inferInsert;

/**
 * Items (Itens - Base de dados de produtos/materiais)
 */
export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  secondaryName: varchar("secondaryName", { length: 255 }),
  defaultUnit: varchar("defaultUnit", { length: 50 }).notNull(),
  ncm: varchar("ncm", { length: 20 }),
  ncmDefinition: text("ncmDefinition"),
  // Campos de estoque
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("0").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }),
  totalValue: decimal("totalValue", { precision: 10, scale: 2 }),
  category: varchar("category", { length: 100 }),
  brand: varchar("brand", { length: 255 }),
  location: varchar("location", { length: 255 }),
  minStock: decimal("minStock", { precision: 10, scale: 2 }),
  maxStock: decimal("maxStock", { precision: 10, scale: 2 }),
  notes: text("notes"),
  stockType: mysqlEnum("stockType", ["finished_pieces", "internal_stock"]).default("internal_stock").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;

/**
 * Projects (Obras)
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Savings (Economias) - Rastreamento de economia por item
 */
export const savings = mysqlTable("savings", {
  id: int("id").autoincrement().primaryKey(),
  requisitionId: int("requisitionId").notNull(),
  requisitionItemId: int("requisitionItemId").notNull(),
  quoteId: int("quoteId").notNull(),
  maxPrice: decimal("maxPrice", { precision: 12, scale: 2 }).notNull(), // Valor máximo definido
  actualPrice: decimal("actualPrice", { precision: 12, scale: 2 }).notNull(), // Valor real da cotação
  savedAmount: decimal("savedAmount", { precision: 12, scale: 2 }).notNull(), // Economia = maxPrice - actualPrice
  savedBy: int("savedBy").notNull(), // ID do comprador que conseguiu a economia
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Saving = typeof savings.$inferSelect;
export type InsertSaving = typeof savings.$inferInsert;

/**
 * Budget Alerts (Alertas de Orçamento) - Notificações quando cotação excede valor máximo
 */
export const budgetAlerts = mysqlTable("budget_alerts", {
  id: int("id").autoincrement().primaryKey(),
  requisitionId: int("requisitionId").notNull(),
  requisitionItemId: int("requisitionItemId").notNull(),
  quoteId: int("quoteId").notNull(),
  maxPrice: decimal("maxPrice", { precision: 12, scale: 2 }).notNull(),
  quotedPrice: decimal("quotedPrice", { precision: 12, scale: 2 }).notNull(),
  excessAmount: decimal("excessAmount", { precision: 12, scale: 2 }).notNull(), // quotedPrice - maxPrice
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdBy: int("createdBy").notNull(), // Comprador que criou a cotação
  reviewedBy: int("reviewedBy"), // Diretor que aprovou/rejeitou
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BudgetAlert = typeof budgetAlerts.$inferSelect;
export type InsertBudgetAlert = typeof budgetAlerts.$inferInsert;

/**
 * Payments Received (Recebimentos) - Pagamentos recebidos de clientes por obra
 */
export const paymentsReceived = mysqlTable("payments_received", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // Referência à obra (projects table)
  valor: decimal("valor", { precision: 12, scale: 2 }).notNull(),
  parcela: int("parcela").notNull(), // Número da parcela (1, 2, 3...)
  dataPrevista: date("dataPrevista").notNull(), // Data prevista do recebimento
  dataRecebimento: date("dataRecebimento"), // Data real do recebimento (null se pendente)
  comprovante: text("comprovante"), // URL do S3 para comprovante de recebimento
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["pendente", "recebido", "atrasado"]).default("pendente").notNull(),
  createdBy: int("createdBy").notNull(), // Usuário que cadastrou
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentReceived = typeof paymentsReceived.$inferSelect;
export type InsertPaymentReceived = typeof paymentsReceived.$inferInsert;

/**
 * Payments Made (Pagamentos) - Pagamentos feitos a fornecedores
 * Placeholder para futura implementação
 */
export const paymentsMade = mysqlTable("payments_made", {
  id: int("id").autoincrement().primaryKey(),
  supplierId: int("supplierId"), // Fornecedor
  requisitionId: int("requisitionId"), // Requisição relacionada
  valor: decimal("valor", { precision: 12, scale: 2 }).notNull(),
  dataPrevista: date("dataPrevista").notNull(),
  dataPagamento: date("dataPagamento"),
  comprovante: text("comprovante"),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["pendente", "pago", "atrasado"]).default("pendente").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentMade = typeof paymentsMade.$inferSelect;
export type InsertPaymentMade = typeof paymentsMade.$inferInsert;

/**
 * Chats (Conversas) - Conversas privadas ou em grupo
 */
export const chats = mysqlTable("chats", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }), // Nome do grupo (null para chat privado)
  isGroup: boolean("isGroup").default(false).notNull(), // true = grupo, false = privado
  createdBy: int("createdBy").notNull(), // Criador do chat/grupo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;

/**
 * Chat Participants (Participantes do Chat)
 */
export const chatParticipants = mysqlTable("chat_participants", {
  id: int("id").autoincrement().primaryKey(),
  chatId: int("chatId").notNull(), // ID do chat
  userId: int("userId").notNull(), // ID do usuário participante
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  lastRead: timestamp("lastRead"), // Última vez que leu mensagens
});

export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = typeof chatParticipants.$inferInsert;

/**
 * Messages (Mensagens)
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  chatId: int("chatId").notNull(), // ID do chat
  senderId: int("senderId").notNull(), // ID do usuário que enviou
  content: text("content").notNull(), // Conteúdo da mensagem
  mentions: text("mentions"), // JSON com menções parseadas
  references: text("references"), // JSON com referências parseadas
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Message Mentions (Menções em Mensagens)
 */
export const messageMentions = mysqlTable("message_mentions", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  mentionedUserId: int("mentionedUserId").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MessageMention = typeof messageMentions.$inferSelect;
export type InsertMessageMention = typeof messageMentions.$inferInsert;

/**
 * Locations (Locais - onde equipamentos estão localizados)
 */
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

/**
 * CRM - Leads (Potenciais Clientes)
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  source: varchar("source", { length: 100 }), // origem do lead (site, indicação, evento, etc)
  status: mysqlEnum("status", ["novo", "contatado", "qualificado", "proposta_enviada", "negociacao", "ganho", "perdido"]).default("novo").notNull(),
  score: int("score").default(0), // pontuação do lead (0-100)
  assignedTo: int("assignedTo"), // usuário responsável
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * CRM - Opportunities (Oportunidades de Venda)
 */
export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  clientId: int("clientId"), // referência à tabela clients
  leadId: int("leadId"), // referência à tabela leads (se veio de um lead)
  value: decimal("value", { precision: 15, scale: 2 }),
  stage: mysqlEnum("stage", ["prospeccao", "qualificacao", "proposta", "negociacao", "fechamento", "ganho", "perdido"]).default("prospeccao").notNull(),
  probability: int("probability").default(0), // probabilidade de fechar (0-100%)
  expectedCloseDate: date("expectedCloseDate"),
  actualCloseDate: date("actualCloseDate"),
  assignedTo: int("assignedTo").notNull(), // usuário responsável
  description: text("description"),
  lostReason: text("lostReason"), // motivo da perda (se perdido)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

/**
 * CRM - Interactions (Interações com Clientes/Leads)
 */
export const interactions = mysqlTable("interactions", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["ligacao", "email", "reuniao", "whatsapp", "visita", "outro"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  clientId: int("clientId"), // referência à tabela clients
  leadId: int("leadId"), // referência à tabela leads
  opportunityId: int("opportunityId"), // referência à oportunidade
  interactionDate: timestamp("interactionDate").defaultNow().notNull(),
  duration: int("duration"), // duração em minutos
  outcome: varchar("outcome", { length: 100 }), // resultado (positivo, neutro, negativo)
  nextSteps: text("nextSteps"), // próximos passos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = typeof interactions.$inferInsert;

/**
 * CRM - Tasks (Tarefas/Follow-ups)
 */
export const crmTasks = mysqlTable("crm_tasks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["ligacao", "email", "reuniao", "follow_up", "outro"]).notNull(),
  priority: mysqlEnum("priority", ["baixa", "media", "alta", "urgente"]).default("media").notNull(),
  status: mysqlEnum("status", ["pendente", "em_andamento", "concluida", "cancelada"]).default("pendente").notNull(),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  clientId: int("clientId"),
  leadId: int("leadId"),
  opportunityId: int("opportunityId"),
  assignedTo: int("assignedTo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type CrmTask = typeof crmTasks.$inferSelect;
export type InsertCrmTask = typeof crmTasks.$inferInsert;

/**
 * CRM - Pipeline Stages (Estágios do Pipeline - customizáveis)
 */
export const pipelineStages = mysqlTable("pipeline_stages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  order: int("order").notNull(), // ordem de exibição
  probability: int("probability").default(0), // probabilidade padrão (0-100%)
  color: varchar("color", { length: 7 }), // cor em hex (#RRGGBB)
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertPipelineStage = typeof pipelineStages.$inferInsert;

/**
 * Quotation Tokens (Tokens de Cotação)
 * Tokens únicos gerados para fornecedores preencherem cotações
 */
export const quotationTokens = mysqlTable("quotation_tokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(), // token único UUID
  requisitionId: int("requisitionId").notNull(), // requisição relacionada
  supplierId: int("supplierId").notNull(), // fornecedor destinatário
  emailSent: boolean("emailSent").default(false).notNull(),
  emailSentAt: timestamp("emailSentAt"),
  accessed: boolean("accessed").default(false).notNull(),
  accessedAt: timestamp("accessedAt"),
  submitted: boolean("submitted").default(false).notNull(),
  submittedAt: timestamp("submittedAt"),
  expiresAt: timestamp("expiresAt").notNull(), // data de expiração do token
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type QuotationToken = typeof quotationTokens.$inferSelect;
export type InsertQuotationToken = typeof quotationTokens.$inferInsert;

/**
 * Requisition Suppliers (Fornecedores Selecionados para Cotação)
 * Relacionamento entre requisições e fornecedores convidados para cotar
 */
export const requisitionSuppliers = mysqlTable("requisition_suppliers", {
  id: int("id").autoincrement().primaryKey(),
  requisitionId: int("requisitionId").notNull(),
  supplierId: int("supplierId").notNull(),
  invited: boolean("invited").default(true).notNull(),
  invitedAt: timestamp("invitedAt").defaultNow().notNull(),
  responded: boolean("responded").default(false).notNull(),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type RequisitionSupplier = typeof requisitionSuppliers.$inferSelect;
export type InsertRequisitionSupplier = typeof requisitionSuppliers.$inferInsert;
