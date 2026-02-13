import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, buyerProcedure, storekeeperProcedure, maintenanceProcedure, financeProcedure, equipmentProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import * as db from "./db";
import { authenticateUser, hashPassword } from "./auth";
import { 
  users,
  suppliers, 
  purchaseRequisitions, 
  requisitionItems,
  requisitionAttachments,
  quotes,
  quoteItems,
  purchaseOrders,
  budgets,
  budgetItems,
  budgetTemplates,
  clients,
  equipment,
  maintenanceSchedules,
  maintenanceRecords,
  companySettings,
  items,
  projects,
  savings,
  budgetAlerts,
  paymentsReceived,
  paymentsMade,
  chats,
  chatParticipants,
  messages,
  messageMentions,
  locations
} from "../drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await authenticateUser(input.email, input.password);
        
        if (!result.success) {
          throw new Error(result.error || "Falha na autenticação");
        }

        // Definir cookie com token
        ctx.res.cookie("auth_token", result.token, {
          httpOnly: true,
          secure: true, // Forçar secure pois Manus usa HTTPS
          sameSite: "none", // Necessário para cookies em ambiente com proxy
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
          path: "/",
        });

        return {
          success: true,
          user: result.user,
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie("auth_token", { path: "/" });
      return { success: true };
    }),
  }),

  // ============= USER MANAGEMENT =============
  users: router({
    list: adminProcedure.query(async () => {
      return await db.listUsers();
    }),
    // Endpoint público para chat: lista apenas id, name e email
    listForChat: protectedProcedure.query(async () => {
      const users = await db.listUsers();
      return users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
      }));
    }),
    create: adminProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        role: z.enum(["buyer", "director", "storekeeper", "manutencao", "financeiro"]),
        username: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const passwordHash = await hashPassword(input.password);
        const userId = await db.createUser({
          email: input.email,
          passwordHash,
          name: input.name,
          role: input.role,
          username: input.username || null,
          isActive: 1,
          loginMethod: "local",
        });
        return { success: true, id: userId };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        email: z.string().email().optional(),
        name: z.string().min(1).optional(),
        role: z.enum(["buyer", "director", "storekeeper", "manutencao", "financeiro"]).optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateUser(id, data);
        return { success: true };
      }),
    resetPassword: adminProcedure
      .input(z.object({
        userId: z.number(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const passwordHash = await hashPassword(input.newPassword);
        await db.updateUserPassword(input.userId, passwordHash);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteUser(input.id);
        return { success: true };
      }),
  }),

  // ============= SUPPLIERS =============
  suppliers: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllSuppliers();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSupplierById(input.id);
      }),

    create: buyerProcedure
      .input(z.object({
        name: z.string().min(1),
        cnpj: z.string().optional(),
        contact: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const result = await database.insert(suppliers).values({
          ...input,
          createdBy: ctx.user.id,
        });

        return { success: true, id: Number(result[0].insertId) };
      }),

    update: buyerProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        cnpj: z.string().optional(),
        contact: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const { id, ...updateData } = input;
        await database.update(suppliers).set(updateData).where(eq(suppliers.id, id));

        return { success: true };
      }),
  }),

  // ============= LOCATIONS =============
  locations: router({
    list: equipmentProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      return await database.select().from(locations).orderBy(desc(locations.createdAt));
    }),

    getById: equipmentProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [location] = await database.select().from(locations).where(eq(locations.id, input.id));
        return location;
      }),

    create: equipmentProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const result = await database.insert(locations).values({
          ...input,
          createdBy: ctx.user.id,
        });

        return { success: true, id: Number(result[0].insertId) };
      }),

    update: equipmentProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const { id, ...updateData } = input;
        await database.update(locations).set(updateData).where(eq(locations.id, id));

        return { success: true };
      }),

    delete: equipmentProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        await database.delete(locations).where(eq(locations.id, input.id));

        return { success: true };
      }),
  }),

  // ============= PURCHASE REQUISITIONS =============
  requisitions: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllRequisitions();
    }),

    listByCategory: protectedProcedure
      .input(z.object({ category: z.enum(["maintenance", "administrative", "factory", "works"]) }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        // Buscar todas as requisições
        const allRequisitions = await db.getAllRequisitions();
        
        // Filtrar por categoria
        return allRequisitions.filter((req: any) => {
          if (input.category === "maintenance") {
            // Requisições originadas de manutenções (verificar se existe relacionamento)
            // TODO: Adicionar campo sourceMaintenanceId ou similar para rastrear origem
            return req.usageLocation?.toLowerCase().includes("manutenção");
          } else if (input.category === "administrative") {
            return req.usageLocation?.toLowerCase() === "administrativo";
          } else if (input.category === "factory") {
            return req.usageLocation?.toLowerCase() === "fabrica" || req.usageLocation?.toLowerCase() === "fábrica";
          } else if (input.category === "works") {
            // Qualquer usageLocation que comece com "obra:"
            return req.usageLocation?.toLowerCase().startsWith("obra:");
          }
          return false;
        });
      }),

    countPendingAuth: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      if (!database) return 0;
      
      const result = await database.select({ count: sql<number>`count(*)` })
        .from(purchaseRequisitions)
        .where(eq(purchaseRequisitions.status, 'aguardando_autorizacao'));
      
      return result[0]?.count || 0;
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const requisition = await db.getRequisitionById(input.id);
        const items = await db.getRequisitionItems(input.id);
        return { requisition, items };
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        usageLocation: z.string().optional(),
        projectId: z.number().optional(),
        items: z.array(z.object({
          itemName: z.string().min(1),
          quantity: z.number().positive(),
          unit: z.string().optional(),
          brand: z.string().optional(),
          notes: z.string().optional(),
          maxPrice: z.number().optional(), // Valor máximo permitido (apenas admins)
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        // Generate requisition number
        const requisitionNumber = `REQ-${Date.now()}`;

        const result = await database.insert(purchaseRequisitions).values({
          requisitionNumber,
          title: input.title,
          description: input.description,
          usageLocation: input.usageLocation,
          projectId: input.projectId,
          requestedBy: ctx.user.id,
          status: 'solicitacao',
        });

        const requisitionId = Number(result[0].insertId);

        // Insert items
        for (const item of input.items) {
          await database.insert(requisitionItems).values({
            requisitionId: requisitionId,
            itemName: item.itemName,
            quantity: item.quantity.toString(),
            unit: item.unit,
            brand: item.brand,
            notes: item.notes,
            maxPrice: item.maxPrice ? item.maxPrice.toString() : null,
          });
        }

        return { success: true, id: requisitionId, requisitionNumber };
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['solicitacao', 'cotacao_em_progresso', 'cotacoes_em_analise', 'aguardando_autorizacao', 'ordem_compra_enviada', 'aguardando_recebimento', 'recebido', 'cancelado']),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const updateData: any = { status: input.status };
        
        if (input.status === 'aguardando_autorizacao' || input.status === 'ordem_compra_enviada') {
          updateData.approvedBy = ctx.user.id;
          updateData.approvedAt = new Date();
        }

        await database.update(purchaseRequisitions).set(updateData).where(eq(purchaseRequisitions.id, input.id));

        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        items: z.array(z.object({
          id: z.number().optional(), // existing item id
          itemName: z.string().min(1),
          quantity: z.number().positive(),
          unit: z.string().optional(),
          brand: z.string().optional(),
          notes: z.string().optional(),
          maxPrice: z.number().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        // Update requisition
        await database.update(purchaseRequisitions)
          .set({
            title: input.title,
            description: input.description,
          })
          .where(eq(purchaseRequisitions.id, input.id));

        // Delete all existing items
        await database.delete(requisitionItems).where(eq(requisitionItems.requisitionId, input.id));

        // Insert updated items
        for (const item of input.items) {
          await database.insert(requisitionItems).values({
            requisitionId: input.id,
            itemName: item.itemName,
            quantity: item.quantity.toString(),
            unit: item.unit,
            brand: item.brand,
            notes: item.notes,
            maxPrice: item.maxPrice ? item.maxPrice.toString() : null,
          });
        }

        return { success: true };
      }),

    approve: protectedProcedure
      .input(z.object({ 
        id: z.number(),
        observations: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        await database.update(purchaseRequisitions)
          .set({
            status: 'autorizado',
            approvedBy: ctx.user.id,
            approvedAt: new Date(),
            observations: input.observations || null,
          })
          .where(eq(purchaseRequisitions.id, input.id));

        return { success: true };
      }),

    reject: protectedProcedure
      .input(z.object({ 
        id: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        await database.update(purchaseRequisitions)
          .set({
            status: 'cancelado',
            notes: input.reason ? `Rejeitado: ${input.reason}` : 'Rejeitado',
          })
          .where(eq(purchaseRequisitions.id, input.id));

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        // Delete items first (foreign key constraint)
        await database.delete(requisitionItems).where(eq(requisitionItems.requisitionId, input.id));
        
        // Delete requisition
        await database.delete(purchaseRequisitions).where(eq(purchaseRequisitions.id, input.id));

        return { success: true };
      }),

    requestChange: protectedProcedure
      .input(z.object({
        id: z.number(),
        reason: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        await database.update(purchaseRequisitions)
          .set({
            changeRequested: true,
            changeRequestReason: input.reason,
            changeRequestedAt: new Date(),
          })
          .where(eq(purchaseRequisitions.id, input.id));

        return { success: true };
      }),

    approveChange: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        await database.update(purchaseRequisitions)
          .set({
            changeRequested: false,
            changeRequestReason: null,
            changeApprovedBy: ctx.user.id,
            status: 'solicitacao', // Volta para status inicial para edição
          })
          .where(eq(purchaseRequisitions.id, input.id));

        return { success: true };
      }),
  }),

  // ============= QUOTES =============
  quotes: router({
    listByRequisition: protectedProcedure
      .input(z.object({ requisitionId: z.number() }))
      .query(async ({ input }) => {
        const quotesList = await db.getQuotesByRequisition(input.requisitionId);
        
        const quotesWithDetails = await Promise.all(
          quotesList.map(async (quote) => {
            const items = await db.getQuoteItems(quote.id);
            const supplier = await db.getSupplierById(quote.supplierId);
            return { ...quote, items, supplier };
          })
        );

        return quotesWithDetails;
      }),

    create: protectedProcedure
      .input(z.object({
        requisitionId: z.number(),
        supplierId: z.number(),
        quoteNumber: z.string().optional(),
        deliveryTime: z.number().optional(),
        paymentTerms: z.string().optional(),
        notes: z.string().optional(),
        items: z.array(z.object({
          requisitionItemId: z.number(),
          unitPrice: z.number(),
          quantity: z.number(),
          brand: z.string().optional(),
          notes: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const totalAmount = input.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

        const result = await database.insert(quotes).values({
          requisitionId: input.requisitionId,
          supplierId: input.supplierId,
          quoteNumber: input.quoteNumber,
          totalAmount: totalAmount.toString(),
          deliveryTime: input.deliveryTime,
          paymentTerms: input.paymentTerms,
          notes: input.notes,
          createdBy: ctx.user.id,
        });

        const quoteId = Number(result[0].insertId);

        // Inserir itens da cotação e calcular economia
        for (const item of input.items) {
          const totalPrice = item.unitPrice * item.quantity;
          await database.insert(quoteItems).values({
            quoteId,
            requisitionItemId: item.requisitionItemId,
            unitPrice: item.unitPrice.toString(),
            quantity: item.quantity.toString(),
            totalPrice: totalPrice.toString(),
            brand: item.brand,
            notes: item.notes,
          });

          // Verificar se há valor máximo definido e calcular economia
          const requisitionItem = await database
            .select()
            .from(requisitionItems)
            .where(eq(requisitionItems.id, item.requisitionItemId))
            .limit(1);

          if (requisitionItem[0]?.maxPrice) {
            const maxPrice = parseFloat(requisitionItem[0].maxPrice);
            const actualPrice = item.unitPrice;

            // Se o preço da cotação for menor que o máximo, registrar economia
            if (actualPrice < maxPrice) {
              const savedAmount = maxPrice - actualPrice;
              await database.insert(savings).values({
                requisitionId: input.requisitionId,
                requisitionItemId: item.requisitionItemId,
                quoteId,
                maxPrice: maxPrice.toString(),
                actualPrice: actualPrice.toString(),
                savedAmount: savedAmount.toString(),
                savedBy: ctx.user.id,
              });
            }
            // Se o preço exceder o máximo, criar alerta para aprovação
            else if (actualPrice > maxPrice) {
              const excessAmount = actualPrice - maxPrice;
              await database.insert(budgetAlerts).values({
                requisitionId: input.requisitionId,
                requisitionItemId: item.requisitionItemId,
                quoteId,
                maxPrice: maxPrice.toString(),
                quotedPrice: actualPrice.toString(),
                excessAmount: excessAmount.toString(),
                createdBy: ctx.user.id,
              });
            }
          }
        }

        return { success: true, id: quoteId };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        supplierId: z.number(),
        quoteNumber: z.string().optional(),
        deliveryTime: z.number().optional(),
        paymentTerms: z.string().optional(),
        notes: z.string().optional(),
        items: z.array(z.object({
          requisitionItemId: z.number(),
          unitPrice: z.number(),
          quantity: z.number(),
          brand: z.string().optional(),
          notes: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const totalAmount = input.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

        // Update quote
        await database.update(quotes)
          .set({
            supplierId: input.supplierId,
            quoteNumber: input.quoteNumber,
            totalAmount: totalAmount.toString(),
            deliveryTime: input.deliveryTime,
            paymentTerms: input.paymentTerms,
            notes: input.notes,
          })
          .where(eq(quotes.id, input.id));

        // Delete existing items
        await database.delete(quoteItems).where(eq(quoteItems.quoteId, input.id));

        // Insert updated items
        for (const item of input.items) {
          const totalPrice = item.unitPrice * item.quantity;
          await database.insert(quoteItems).values({
            quoteId: input.id,
            requisitionItemId: item.requisitionItemId,
            unitPrice: item.unitPrice.toString(),
            quantity: item.quantity.toString(),
            totalPrice: totalPrice.toString(),
            brand: item.brand,
            notes: item.notes,
          });
        }

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        // Delete items first (foreign key)
        await database.delete(quoteItems).where(eq(quoteItems.quoteId, input.id));
        
        // Delete quote
        await database.delete(quotes).where(eq(quotes.id, input.id));

        return { success: true };
      }),
  }),

  // ============= PURCHASE ORDERS =============
  orders: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllPurchaseOrders();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPurchaseOrderById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        requisitionId: z.number(),
        quoteId: z.number(),
        supplierId: z.number(),
        totalAmount: z.number(),
        orderDate: z.string(),
        expectedDelivery: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const orderNumber = `PO-${Date.now()}`;

        const result = await database.insert(purchaseOrders).values({
          orderNumber,
          requisitionId: input.requisitionId,
          quoteId: input.quoteId,
          supplierId: input.supplierId,
          totalAmount: input.totalAmount.toString(),
          orderDate: input.orderDate,
          expectedDelivery: input.expectedDelivery,
          notes: input.notes,
          createdBy: ctx.user.id,
        });

        return { success: true, id: Number(result[0].insertId), orderNumber };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'confirmed', 'received', 'cancelled']),
        actualDelivery: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const updateData: any = { status: input.status };
        
        if (input.status === 'received') {
          updateData.receivedBy = ctx.user.id;
          updateData.actualDelivery = input.actualDelivery || new Date().toISOString().split('T')[0];
        }

        await database.update(purchaseOrders).set(updateData).where(eq(purchaseOrders.id, input.id));

        return { success: true };
      }),
  }),

  // ============= CLIENTS =============
  clients: router({  
    list: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const result = await database.select().from(clients).where(eq(clients.active, true));
      return result;
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        cnpj: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const result = await database.insert(clients).values({
          ...input,
          createdBy: ctx.user.id,
        });
        
        return { success: true, id: Number(result[0].insertId) };
      }),
  }),

  // ============= BUDGETS =============
  budgets: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllBudgets();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const budget = await db.getBudgetById(input.id);
        const items = await db.getBudgetItems(input.id);
        return { budget, items };
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        clientId: z.number(),
        validUntil: z.string().optional(),
        observations: z.string().optional(),
        templateId: z.number().optional(),
        items: z.array(z.object({
          itemName: z.string().min(1),
          quantity: z.number().positive(),
          unit: z.string().optional(),
          unitPrice: z.number().positive(),
          brand: z.string().optional(),
          notes: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const budgetNumber = `ORC-${Date.now()}`;

        const result = await database.insert(budgets).values({
          budgetNumber,
          title: input.title,
          description: input.description,
          clientId: input.clientId,
          validUntil: input.validUntil,
          observations: input.observations,
          templateId: input.templateId,
          createdBy: ctx.user.id,
        });

        const budgetId = Number(result[0].insertId);

        for (const item of input.items) {
          const totalPrice = item.quantity * item.unitPrice;
          await database.insert(budgetItems).values({
            budgetId,
            itemName: item.itemName,
            quantity: item.quantity.toString(),
            unit: item.unit,
            unitPrice: item.unitPrice.toString(),
            totalPrice: totalPrice.toString(),
            brand: item.brand,
            notes: item.notes,
          });
        }

        return { success: true, id: budgetId, budgetNumber };
      }),

    generatePdf: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const budget = await db.getBudgetById(input.id);
        const items = await db.getBudgetItems(input.id);
        
        if (!budget) throw new Error("Orçamento não encontrado");
        
        // Buscar dados do cliente
        const clientResult = await database.select().from(clients).where(eq(clients.id, budget.clientId)).limit(1);
        const client = clientResult[0];
        
        if (!client) throw new Error("Cliente não encontrado");
        
        // Calcular total
        const total = items.reduce((sum: number, item: any) => {
          return sum + parseFloat(item.totalPrice || "0");
        }, 0);
        
        // Gerar PDF usando manus-md-to-pdf
        const fs = require('fs');
        const { execSync } = require('child_process');
        
        const mdContent = `
# PROPOSTA COMERCIAL

**Número:** ${budget.budgetNumber}  
**Data:** ${new Date(budget.createdAt).toLocaleDateString('pt-BR')}  
${budget.validUntil ? `**Validade:** ${budget.validUntil}` : ''}

---

## DADOS DO CLIENTE

**Nome:** ${client.name}  
${client.cnpj ? `**CNPJ:** ${client.cnpj}` : ''}  
${client.email ? `**E-mail:** ${client.email}` : ''}  
${client.phone ? `**Telefone:** ${client.phone}` : ''}  
${client.address ? `**Endereço:** ${client.address}` : ''}

---

## ${budget.title}

${budget.description || ''}

---

## ITENS DO ORÇAMENTO

| Item | Qtd | Unidade | Valor Unit. | Total |
|------|-----|---------|-------------|-------|
${items.map((item: any) => 
  `| ${item.itemName} | ${item.quantity} | ${item.unit || '-'} | R$ ${parseFloat(item.unitPrice || "0").toFixed(2)} | R$ ${parseFloat(item.totalPrice || "0").toFixed(2)} |`
).join('\n')}

---

### VALOR TOTAL: R$ ${total.toFixed(2).replace('.', ',')}

${budget.observations ? `\n---\n\n## OBSERVAÇÕES\n\n${budget.observations}` : ''}

---

*Proposta gerada em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}*
        `;
        
        const tempMdPath = `/tmp/budget-${budget.id}.md`;
        const pdfPath = `/tmp/budget-${budget.id}.pdf`;
        
        fs.writeFileSync(tempMdPath, mdContent);
        execSync(`manus-md-to-pdf ${tempMdPath} ${pdfPath}`);
        
        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfBase64 = pdfBuffer.toString('base64');
        
        // Limpar arquivos temporários
        fs.unlinkSync(tempMdPath);
        fs.unlinkSync(pdfPath);
        
        return { 
          success: true, 
          pdf: pdfBase64,
          filename: `Orcamento-${budget.budgetNumber}.pdf`
        };
      }),

    templates: router({
      list: protectedProcedure.query(async () => {
        return await db.getAllBudgetTemplates();
      }),

      create: protectedProcedure
        .input(z.object({
          name: z.string().min(1),
          description: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
      if (!database) throw new Error("Database not available");
          if (!database) throw new Error("Database not available");

          const result = await database.insert(budgetTemplates).values({
            name: input.name,
            description: input.description,
            createdBy: ctx.user.id,
          });

          return { success: true, id: Number(result[0].insertId) };
        }),
    }),
  }),

  // ============= EQUIPMENT =============
  equipment: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllEquipment();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const equipmentData = await db.getEquipmentById(input.id);
        const maintenanceHistory = await db.getMaintenanceRecordsByEquipment(input.id);
        return { equipment: equipmentData, maintenanceHistory };
      }),

    create: equipmentProcedure
      .input(z.object({
        name: z.string().min(1),
        code: z.string().optional(),
        type: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        serialNumber: z.string().optional(),
        location: z.string().optional(),
        locationId: z.number().optional(),
        purchaseDate: z.string().optional(),
        warrantyExpiry: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const result = await database.insert(equipment).values({
          name: input.name,
          code: input.code,
          type: input.type,
          manufacturer: input.manufacturer,
          model: input.model,
          serialNumber: input.serialNumber,
          location: input.location,
          purchaseDate: input.purchaseDate,
          warrantyExpiry: input.warrantyExpiry,
          notes: input.notes,
          createdBy: ctx.user.id,
        });

        return { success: true, id: Number(result[0].insertId) };
      }),

    update: equipmentProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        code: z.string().optional(),
        type: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        serialNumber: z.string().optional(),
        location: z.string().optional(),
        locationId: z.number().optional(),
        purchaseDate: z.string().optional(),
        warrantyExpiry: z.string().optional(),
        status: z.enum(['active', 'maintenance', 'inactive', 'retired']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const { id, ...updateData } = input;
        await database.update(equipment).set(updateData).where(eq(equipment.id, id));

        return { success: true };
      }),

    delete: equipmentProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        // Delete related maintenance schedules and records first
        await database.delete(maintenanceSchedules).where(eq(maintenanceSchedules.equipmentId, input.id));
        await database.delete(maintenanceRecords).where(eq(maintenanceRecords.equipmentId, input.id));
        
        // Then delete the equipment
        await database.delete(equipment).where(eq(equipment.id, input.id));

        return { success: true };
      }),
  }),

  // ============= MAINTENANCE =============
  maintenance: router({
    schedules: router({
      list: protectedProcedure
        .input(z.object({}).optional())
        .query(async () => {
          return await db.getMaintenanceSchedules();
        }),

      listByEquipment: protectedProcedure
        .input(z.object({ equipmentId: z.number() }))
        .query(async ({ input }) => {
          return await db.getMaintenanceSchedulesByEquipment(input.equipmentId);
        }),

      upcoming: protectedProcedure
        .input(z.object({ days: z.number().optional().default(30) }).optional())
        .query(async ({ input }) => {
          return await db.getUpcomingMaintenance(input?.days || 30);
        }),

      getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return await db.getMaintenanceScheduleById(input.id);
        }),

      create: maintenanceProcedure
        .input(z.object({
          equipmentId: z.number(),
          maintenanceType: z.enum(['preventive', 'corrective']),
          scheduledDate: z.string(),
          description: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
      if (!database) throw new Error("Database not available");
          if (!database) throw new Error("Database not available");

          const result = await database.insert(maintenanceSchedules).values({
            equipmentId: input.equipmentId,
            maintenanceType: input.maintenanceType,
            scheduledDate: input.scheduledDate,
            description: input.description,
            createdBy: ctx.user.id,
          });

          return { success: true, id: Number(result[0].insertId) };
        }),

      update: maintenanceProcedure
        .input(z.object({
          id: z.number(),
          equipmentId: z.number().optional(),
          maintenanceType: z.enum(['preventive', 'corrective']).optional(),
          scheduledDate: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
      if (!database) throw new Error("Database not available");
          if (!database) throw new Error("Database not available");

          const { id, ...updateData } = input;
          await database.update(maintenanceSchedules).set(updateData).where(eq(maintenanceSchedules.id, id));

          return { success: true };
        }),

      updateStatus: maintenanceProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(['scheduled', 'quotation', 'analysis', 'awaiting_authorization', 'authorized', 'in_progress', 'completed', 'sent_to_purchase']),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
      if (!database) throw new Error("Database not available");
          if (!database) throw new Error("Database not available");

          // Se o status for "sent_to_purchase", criar requisição de compra automaticamente
          if (input.status === 'sent_to_purchase') {
            // Buscar dados da manutenção
            const [maintenance] = await database.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.id, input.id));
            
            if (maintenance) {
              // Buscar dados do equipamento
              const [equipmentData] = await database.select().from(equipment).where(eq(equipment.id, maintenance.equipmentId));
              
              // Criar requisição de compra com dados da manutenção
              const requisitionTitle = `Manutenção ${maintenance.maintenanceType === 'preventive' ? 'Preventiva' : 'Corretiva'} - ${equipmentData?.name || 'Equipamento'}`;
              const requisitionDescription = `**Equipamento:** ${equipmentData?.name || 'N/A'}\n**Tipo:** ${maintenance.maintenanceType === 'preventive' ? 'Preventiva' : 'Corretiva'}\n**Data Agendada:** ${maintenance.scheduledDate}\n**Descrição:** ${maintenance.description || 'N/A'}`;
              
              const [requisition] = await database.insert(purchaseRequisitions).values({
                requisitionNumber: `REQ-${Date.now()}`,
                title: requisitionTitle,
                description: requisitionDescription,
                usageLocation: 'Manutenção',
                status: 'solicitacao',
                requestedBy: ctx.user.id,
              }).$returningId();
              
              // Atualizar manutenção com ID da requisição
              await database.update(maintenanceSchedules).set({ 
                status: input.status,
                purchaseRequisitionId: requisition.id 
              }).where(eq(maintenanceSchedules.id, input.id));
              
              return { success: true, requisitionId: requisition.id };
            }
          }

          await database.update(maintenanceSchedules).set({ status: input.status }).where(eq(maintenanceSchedules.id, input.id));

          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const database = await getDb();
      if (!database) throw new Error("Database not available");
          if (!database) throw new Error("Database not available");

          await database.delete(maintenanceSchedules).where(eq(maintenanceSchedules.id, input.id));

          return { success: true };
        }),
    }),

    records: router({
      list: protectedProcedure.query(async () => {
        return await db.getAllMaintenanceRecords();
      }),

      listByEquipment: protectedProcedure
        .input(z.object({ equipmentId: z.number() }))
        .query(async ({ input }) => {
          return await db.getMaintenanceRecordsByEquipment(input.equipmentId);
        }),

      getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return await db.getMaintenanceRecordById(input.id);
        }),

      create: protectedProcedure
        .input(z.object({
          equipmentId: z.number(),
          scheduleId: z.number().optional(),
          maintenanceType: z.enum(['preventive', 'corrective']),
          performedDate: z.string(),
          description: z.string().optional(),
          technician: z.string().optional(),
          cost: z.number().optional(),
          partsReplaced: z.string().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
      if (!database) throw new Error("Database not available");
          if (!database) throw new Error("Database not available");

          const costValue = input.cost !== undefined ? input.cost.toString() : undefined;
          const result = await database.insert(maintenanceRecords).values({
            equipmentId: input.equipmentId,
            scheduleId: input.scheduleId,
            maintenanceType: input.maintenanceType,
            performedDate: input.performedDate,
            description: input.description,
            technician: input.technician,
            cost: costValue,
            partsReplaced: input.partsReplaced,
            notes: input.notes,
            createdBy: ctx.user.id,
          });

          // If linked to a schedule, mark it as completed
          if (input.scheduleId) {
            await database.update(maintenanceSchedules)
              .set({ status: 'completed' })
              .where(eq(maintenanceSchedules.id, input.scheduleId));
          }

          return { success: true, id: Number(result[0].insertId) };
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          equipmentId: z.number().optional(),
          maintenanceType: z.enum(['preventive', 'corrective']).optional(),
          performedDate: z.string().optional(),
          description: z.string().optional(),
          technician: z.string().optional(),
          cost: z.number().optional(),
          partsReplaced: z.string().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
      if (!database) throw new Error("Database not available");
          if (!database) throw new Error("Database not available");

          const { id, cost, ...otherData } = input;
          const updateData: any = { ...otherData };
          if (cost !== undefined) {
            updateData.cost = cost.toString();
          }

          await database.update(maintenanceRecords).set(updateData).where(eq(maintenanceRecords.id, id));

          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const database = await getDb();
      if (!database) throw new Error("Database not available");
          if (!database) throw new Error("Database not available");

          await database.delete(maintenanceRecords).where(eq(maintenanceRecords.id, input.id));

          return { success: true };
        }),
    }),
  }),

  // ============= DASHBOARD =============
  dashboard: router({
    metrics: protectedProcedure
      .input(z.object({}).optional())
      .query(async () => {
        return await db.getDashboardMetrics();
      }),
  }),

  // ============= COMPANY SETTINGS =============
  settings: router({
    get: protectedProcedure.query(async () => {
      return await db.getCompanySettings();
    }),

    update: adminProcedure
      .input(z.object({
        companyName: z.string().min(1),
        cnpj: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        logoUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const existing = await db.getCompanySettings();

        if (existing) {
          await database.update(companySettings).set({
            ...input,
            updatedBy: ctx.user.id,
          }).where(eq(companySettings.id, existing.id));
        } else {
          await database.insert(companySettings).values({
            ...input,
            updatedBy: ctx.user.id,
          });
        }

        return { success: true };
      }),
  }),

  // ============= ATTACHMENTS =============
  attachments: router({
    list: protectedProcedure
      .input(z.object({ requisitionId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAttachmentsByRequisition(input.requisitionId);
      }),

    upload: protectedProcedure
      .input(z.object({
        requisitionId: z.number(),
        fileType: z.enum(["cotacao", "ordem_compra", "adicional"]),
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const result = await database.insert(requisitionAttachments).values({
          requisitionId: input.requisitionId,
          fileType: input.fileType,
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          uploadedBy: ctx.user.id,
        });

        return { success: true, id: Number(result[0].insertId) };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        await database.delete(requisitionAttachments).where(eq(requisitionAttachments.id, input.id));

        return { success: true };
      }),
  }),

  // Items Router
  items: router({
    list: protectedProcedure
      .input(z.object({ stockType: z.enum(["finished_pieces", "internal_stock"]).optional() }).optional())
      .query(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        let query = database.select().from(items);
        
        if (input?.stockType) {
          query = query.where(eq(items.stockType, input.stockType)) as any;
        }
        
        const result = await query.orderBy(desc(items.createdAt));
        return result;
      }),

    create: buyerProcedure
      .input(
        z.object({
          name: z.string(),
          secondaryName: z.string().optional(),
          defaultUnit: z.string(),
          ncm: z.string().optional(),
          ncmDefinition: z.string().optional(),
          quantity: z.number().optional(),
          unitPrice: z.number().optional(),
          category: z.string().optional(),
          brand: z.string().optional(),
          location: z.string().optional(),
          minStock: z.number().optional(),
          maxStock: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const { quantity, unitPrice, minStock, maxStock, ...otherInput } = input;
        const insertData: any = {
          ...otherInput,
          createdBy: ctx.user.id,
        };
        if (quantity !== undefined) insertData.quantity = quantity.toString();
        if (unitPrice !== undefined) insertData.unitPrice = unitPrice.toString();
        if (minStock !== undefined) insertData.minStock = minStock.toString();
        if (maxStock !== undefined) insertData.maxStock = maxStock.toString();
        
        const result = await database.insert(items).values(insertData);

        return { success: true, id: Number(result[0].insertId) };
      }),

    update: buyerProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string(),
          secondaryName: z.string().optional(),
          defaultUnit: z.string(),
          ncm: z.string().optional(),
          ncmDefinition: z.string().optional(),
          quantity: z.number().optional(),
          unitPrice: z.number().optional(),
          category: z.string().optional(),
          brand: z.string().optional(),
          location: z.string().optional(),
          minStock: z.number().optional(),
          maxStock: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const { id, quantity, unitPrice, minStock, maxStock, ...otherData } = input;
        const updateData: any = { ...otherData };
        if (quantity !== undefined) updateData.quantity = quantity.toString();
        if (unitPrice !== undefined) updateData.unitPrice = unitPrice.toString();
        if (minStock !== undefined) updateData.minStock = minStock.toString();
        if (maxStock !== undefined) updateData.maxStock = maxStock.toString();
        
        await database.update(items).set(updateData).where(eq(items.id, id));

        return { success: true };
      }),

    delete: buyerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        await database.delete(items).where(eq(items.id, input.id));

        return { success: true };
      }),

    importFromExcel: protectedProcedure
      .input(
        z.object({
          items: z.array(
            z.object({
              name: z.string(),
              category: z.string().optional(),
              quantity: z.number().optional(),
              unitPrice: z.number().optional(),
              defaultUnit: z.union([z.string(), z.number()]).transform(val => String(val)),
              notes: z.string().optional(),
              stockType: z.enum(["finished_pieces", "internal_stock"]).optional(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const item of input.items) {
          try {
            const insertData: any = {
              name: item.name,
              defaultUnit: item.defaultUnit,
              stockType: item.stockType || "internal_stock",
              active: true,
              createdBy: ctx.user.id,
            };

            if (item.category) insertData.category = item.category;
            if (item.quantity !== undefined) insertData.quantity = item.quantity.toString();
            if (item.unitPrice !== undefined) insertData.unitPrice = item.unitPrice.toString();
            if (item.notes) insertData.notes = item.notes;

            await database.insert(items).values(insertData);
            successCount++;
          } catch (error: any) {
            errorCount++;
            errors.push(`Erro ao importar "${item.name}": ${error.message}`);
          }
        }

        return {
          success: true,
          imported: successCount,
          failed: errorCount,
          errors: errors.slice(0, 10), // Retornar apenas os primeiros 10 erros
        };
      }),
  }),

  // Projects Router
  projects: router({
    list: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      if (!database) throw new Error("Database not available");

      const result = await database.select().from(projects).orderBy(desc(projects.createdAt));
      return result;
    }),

    create: buyerProcedure
      .input(
        z.object({
          name: z.string(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const result = await database.insert(projects).values({
          name: input.name,
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
          createdBy: ctx.user.id,
        });

        return { success: true, id: Number(result[0].insertId) };
      }),

    update: buyerProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const { id, ...data } = input;
        await database.update(projects).set({
          name: data.name,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
        }).where(eq(projects.id, id));

        return { success: true };
      }),

    delete: buyerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        await database.delete(projects).where(eq(projects.id, input.id));

        return { success: true };
      }),
  }),

  // ============= SAVINGS (ECONOMIAS) =============
  savings: router({
    // Listar economias por usuário
    listByUser: protectedProcedure
      .input(z.object({ userId: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const userId = input.userId || ctx.user.id;
        const result = await database
          .select()
          .from(savings)
          .where(eq(savings.savedBy, userId))
          .orderBy(desc(savings.createdAt));

        return result;
      }),

    // Listar todas as economias (para relatórios)
    listAll: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      if (!database) throw new Error("Database not available");

      const result = await database
        .select()
        .from(savings)
        .orderBy(desc(savings.createdAt));

      return result;
    }),

    // Calcular economia total por usuário
    getTotalByUser: protectedProcedure
      .input(z.object({ userId: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const userId = input.userId || ctx.user.id;
        const result = await database
          .select({ total: sql<string>`SUM(${savings.savedAmount})` })
          .from(savings)
          .where(eq(savings.savedBy, userId));

        return Number(result[0]?.total || 0);
      }),
  }),

  // ============= REPORTS (RELATÓRIOS) =============
  reports: router({
    // Dashboard de Economias - Ranking de compradores
    savingsRanking: protectedProcedure
      .input(z.object({ 
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        let query = database
          .select({
            userId: savings.savedBy,
            totalSavings: sql<number>`SUM(${savings.savedAmount})`,
            savingsCount: sql<number>`COUNT(*)`,
          })
          .from(savings)
          .groupBy(savings.savedBy)
          .orderBy(desc(sql`SUM(${savings.savedAmount})`));

        const result = await query;

        // Buscar nomes dos usuários
        const userIds = result.map(r => r.userId);
        const users = await database
          .select({ id: sql<number>`id`, name: sql<string>`name` })
          .from(sql`users`)
          .where(sql`id IN (${sql.join(userIds, sql`, `)})`);;

        return result.map(r => ({
          ...r,
          userName: users.find(u => u.id === r.userId)?.name || "Desconhecido",
        }));
      }),

    // Dashboard - Evolução mensal de economias
    savingsMonthlyTrend: protectedProcedure
      .input(z.object({ months: z.number().default(12) }))
      .query(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const result = await database
          .select({
            month: sql<string>`DATE_FORMAT(${savings.createdAt}, '%Y-%m')`.as('month'),
            totalSavings: sql<number>`SUM(${savings.savedAmount})`.as('totalSavings'),
            count: sql<number>`COUNT(*)`.as('count'),
          })
          .from(savings)
          .groupBy(sql`month`)
          .orderBy(sql`month`);

        return result;
      }),

    // Dashboard - Top 10 itens com maior economia
    topSavingItems: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const result = await database
          .select({
            itemId: requisitionItems.id,
            itemName: requisitionItems.itemName,
            totalSavings: sql<number>`SUM(${savings.savedAmount})`,
            timesQuoted: sql<number>`COUNT(*)`,
            avgSaving: sql<number>`AVG(${savings.savedAmount})`,
          })
          .from(savings)
          .innerJoin(requisitionItems, eq(savings.requisitionItemId, requisitionItems.id))
          .groupBy(requisitionItems.id, requisitionItems.itemName)
          .orderBy(desc(sql`SUM(${savings.savedAmount})`))
          .limit(input.limit);

        return result;
      }),

    // Relatório por Obras - Economias por projeto
    savingsByProject: protectedProcedure
      .input(z.object({ projectId: z.number().optional() }))
      .query(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        let query = database
          .select({
            projectId: purchaseRequisitions.projectId,
            projectName: projects.name,
            totalSavings: sql<number>`SUM(${savings.savedAmount})`,
            requisitionsCount: sql<number>`COUNT(DISTINCT ${purchaseRequisitions.id})`,
          })
          .from(savings)
          .innerJoin(purchaseRequisitions, eq(savings.requisitionId, purchaseRequisitions.id))
          .leftJoin(projects, eq(purchaseRequisitions.projectId, projects.id))
          .groupBy(purchaseRequisitions.projectId, projects.name);

        if (input.projectId) {
          query = query.where(eq(purchaseRequisitions.projectId, input.projectId)) as any;
        }

        const result = await query;
        return result;
      }),

    // Métricas gerais do sistema
    systemMetrics: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      if (!database) throw new Error("Database not available");

      const totalSavings = await database
        .select({ total: sql<string>`SUM(${savings.savedAmount})` })
        .from(savings);

      const totalRequisitions = await database
        .select({ count: sql<number>`COUNT(*)` })
        .from(purchaseRequisitions);

      const totalQuotes = await database
        .select({ count: sql<number>`COUNT(*)` })
        .from(quotes);

      const avgQuotesPerRequisition = await database
        .select({ avg: sql<number>`AVG(quote_count)` })
        .from(
          database
            .select({ quote_count: sql<number>`COUNT(*)`.as('quote_count') })
            .from(quotes)
            .groupBy(quotes.requisitionId)
            .as("quote_counts")
        );

      return {
        totalSavings: Number(totalSavings[0]?.total || 0),
        totalRequisitions: Number(totalRequisitions[0]?.count || 0),
        totalQuotes: Number(totalQuotes[0]?.count || 0),
        avgQuotesPerRequisition: Number(avgQuotesPerRequisition[0]?.avg || 0),
      };
    }),

    // Relatório de requisições por status
    requisitionsByStatus: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      if (!database) throw new Error("Database not available");

      const result = await database
        .select({
          status: purchaseRequisitions.status,
          count: sql<number>`COUNT(*)`,
        })
        .from(purchaseRequisitions)
        .groupBy(purchaseRequisitions.status);

      return result;
    }),

    // Fornecedores mais utilizados
    topSuppliers: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const result = await database
          .select({
            supplierId: quotes.supplierId,
            supplierName: suppliers.name,
            quotesCount: sql<number>`COUNT(*)`,
            totalAmount: sql<number>`SUM(${quotes.totalAmount})`,
          })
          .from(quotes)
          .innerJoin(suppliers, eq(quotes.supplierId, suppliers.id))
          .groupBy(quotes.supplierId, suppliers.name)
          .orderBy(desc(sql`COUNT(*)`))
          .limit(input.limit);

        return result;
      }),
  }),

  // ============= BUDGET ALERTS (ALERTAS DE ORÇAMENTO) =============
  budgetAlerts: router({
    // Listar alertas pendentes
    listPending: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      if (!database) throw new Error("Database not available");

      const result = await database
        .select()
        .from(budgetAlerts)
        .where(eq(budgetAlerts.status, "pending"))
        .orderBy(desc(budgetAlerts.createdAt));

      return result;
    }),

    // Aprovar alerta
    approve: protectedProcedure
      .input(z.object({ 
        id: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        await database.update(budgetAlerts).set({
          status: "approved",
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
          reviewNotes: input.notes,
        }).where(eq(budgetAlerts.id, input.id));

        return { success: true };
      }),

    // Rejeitar alerta
    reject: protectedProcedure
      .input(z.object({ 
        id: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        await database.update(budgetAlerts).set({
          status: "rejected",
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
          reviewNotes: input.notes,
        }).where(eq(budgetAlerts.id, input.id));

        return { success: true };
      }),
  }),

  // Router de Recebimentos (Módulo Financeiro)
  paymentsReceived: router({
    // Listar todos os recebimentos
    list: financeProcedure
      .input(z.object({
        projectId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        let query = database.select().from(paymentsReceived);
        
        if (input?.projectId) {
          query = query.where(eq(paymentsReceived.projectId, input.projectId)) as any;
        }

        const results = await query.orderBy(desc(paymentsReceived.dataPrevista));
        return results;
      }),

    // Criar novo recebimento
    create: financeProcedure
      .input(z.object({
        projectId: z.number(),
        valor: z.string(),
        parcela: z.number(),
        dataPrevista: z.string(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        await database.insert(paymentsReceived).values({
          projectId: input.projectId,
          valor: input.valor,
          parcela: input.parcela,
          dataPrevista: new Date(input.dataPrevista),
          observacoes: input.observacoes,
          status: "pendente",
          createdBy: ctx.user.id,
        });

        return { success: true };
      }),

    // Atualizar recebimento
    update: financeProcedure
      .input(z.object({
        id: z.number(),
        valor: z.string().optional(),
        parcela: z.number().optional(),
        dataPrevista: z.string().optional(),
        dataRecebimento: z.string().optional(),
        comprovante: z.string().optional(),
        observacoes: z.string().optional(),
        status: z.enum(["pendente", "recebido", "atrasado"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const { id, dataPrevista, dataRecebimento, ...data } = input;
        const updateData: any = { ...data };
        if (dataPrevista) updateData.dataPrevista = new Date(dataPrevista);
        if (dataRecebimento) updateData.dataRecebimento = new Date(dataRecebimento);
        await database.update(paymentsReceived).set(updateData).where(eq(paymentsReceived.id, id));

        return { success: true };
      }),

    // Excluir recebimento
    delete: financeProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        await database.delete(paymentsReceived).where(eq(paymentsReceived.id, input.id));

        return { success: true };
      }),

    // Resumo de recebimentos por obra
    summaryByProject: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        if (!database) throw new Error("Database not available");

        const payments = await database.select().from(paymentsReceived)
          .where(eq(paymentsReceived.projectId, input.projectId));

        const totalPrevisto = payments.reduce((sum, p) => sum + Number(p.valor), 0);
        const totalRecebido = payments
          .filter(p => p.status === "recebido")
          .reduce((sum, p) => sum + Number(p.valor), 0);
        const totalPendente = payments
          .filter(p => p.status === "pendente")
          .reduce((sum, p) => sum + Number(p.valor), 0);

        return {
          totalPrevisto: totalPrevisto.toString(),
          totalRecebido: totalRecebido.toString(),
          totalPendente: totalPendente.toString(),
          totalParcelas: payments.length,
          parcelasRecebidas: payments.filter(p => p.status === "recebido").length,
          parcelasPendentes: payments.filter(p => p.status === "pendente").length,
        };
      }),
  }),

  // Chat routes
  chats: router({
    // Listar todos os chats do usuário logado
    list: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const userId = ctx.user.id;

      // Buscar todos os chats que o usuário participa
      const userChats = await database
        .select()
        .from(chatParticipants)
        .where(eq(chatParticipants.userId, userId));

      const chatIds = userChats.map(uc => uc.chatId);
      if (chatIds.length === 0) return [];

      // Buscar informações dos chats
      const chatsData = await database
        .select()
        .from(chats)
        .where(sql`${chats.id} IN (${sql.join(chatIds, sql`, `)})`);

      // Para cada chat, buscar participantes e última mensagem
      const chatsWithDetails = await Promise.all(
        chatsData.map(async (chat) => {
          // Buscar participantes
          const participants = await database
            .select({
              userId: chatParticipants.userId,
              userName: sql<string>`users.name`,
              userEmail: sql<string>`users.email`,
            })
            .from(chatParticipants)
            .innerJoin(sql`users`, eq(chatParticipants.userId, sql`users.id`))
            .where(eq(chatParticipants.chatId, chat.id));

          // Buscar última mensagem
          const lastMessage = await database
            .select()
            .from(messages)
            .where(eq(messages.chatId, chat.id))
            .orderBy(desc(messages.createdAt))
            .limit(1);

          // Contar mensagens não lidas
          const userParticipant = userChats.find(uc => uc.chatId === chat.id);
          const unreadCount = userParticipant?.lastRead
            ? await database
                .select({ count: sql<number>`count(*)` })
                .from(messages)
                .where(
                  sql`${messages.chatId} = ${chat.id} AND ${messages.createdAt} > ${userParticipant.lastRead}`
                )
                .then(r => r[0]?.count || 0)
            : await database
                .select({ count: sql<number>`count(*)` })
                .from(messages)
                .where(eq(messages.chatId, chat.id))
                .then(r => r[0]?.count || 0);

          return {
            ...chat,
            participants,
            lastMessage: lastMessage[0] || null,
            unreadCount,
          };
        })
      );

      return chatsWithDetails;
    }),

    // Criar novo chat privado ou grupo
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(), // Nome do grupo (obrigatório se isGroup = true)
          isGroup: z.boolean(),
          participantIds: z.array(z.number()), // IDs dos participantes
        })
      )
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        const userId = ctx.user.id;

        // Validar: grupo precisa de nome
        if (input.isGroup && !input.name) {
          throw new Error("Grupos precisam de um nome");
        }

        // Validar: chat privado precisa de exatamente 1 participante (além do criador)
        if (!input.isGroup && input.participantIds.length !== 1) {
          throw new Error("Chat privado deve ter exatamente 2 participantes");
        }

        // Verificar se já existe chat privado entre esses usuários
        if (!input.isGroup) {
          const otherUserId = input.participantIds[0];
          const existingChats = await database
            .select()
            .from(chats)
            .where(eq(chats.isGroup, false));

          for (const chat of existingChats) {
            const participants = await database
              .select()
              .from(chatParticipants)
              .where(eq(chatParticipants.chatId, chat.id));

            const participantIds = participants.map(p => p.userId).sort();
            const requestedIds = [userId, otherUserId].sort();

            if (JSON.stringify(participantIds) === JSON.stringify(requestedIds)) {
              return chat; // Retornar chat existente
            }
          }
        }

        // Criar novo chat
        const [newChat] = await database.insert(chats).values({
          name: input.name || null,
          isGroup: input.isGroup,
          createdBy: userId,
        });

        const chatId = newChat.insertId;

        // Adicionar criador como participante
        await database.insert(chatParticipants).values({
          chatId,
          userId,
        });

        // Adicionar outros participantes
        for (const participantId of input.participantIds) {
          await database.insert(chatParticipants).values({
            chatId,
            userId: participantId,
          });
        }

        return { id: chatId, ...input };
      }),

    // Buscar mensagens de um chat
    getMessages: protectedProcedure
      .input(z.object({ chatId: z.number() }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        const userId = ctx.user.id;

        // Verificar se usuário participa do chat
        if (!database) throw new Error("Database not available");
        const participant = await database
          .select()
          .from(chatParticipants)
          .where(
            sql`${chatParticipants.chatId} = ${input.chatId} AND ${chatParticipants.userId} = ${userId}`
          )
          .limit(1);

        if (participant.length === 0) {
          throw new Error("Você não tem permissão para acessar este chat");
        }

        // Buscar mensagens
        if (!database) throw new Error("Database not available");
        const msgs = await database
          .select({
            id: messages.id,
            chatId: messages.chatId,
            senderId: messages.senderId,
            senderName: sql<string>`users.name`,
            content: messages.content,
            createdAt: messages.createdAt,
          })
          .from(messages)
          .innerJoin(sql`users`, eq(messages.senderId, sql`users.id`))
          .where(eq(messages.chatId, input.chatId))
          .orderBy(messages.createdAt);

        // Atualizar lastRead
        if (!database) throw new Error("Database not available");
        await database
          .update(chatParticipants)
          .set({ lastRead: new Date() })
          .where(
            sql`${chatParticipants.chatId} = ${input.chatId} AND ${chatParticipants.userId} = ${userId}`
          );

        return msgs;
      }),

    // Enviar mensagem
    sendMessage: protectedProcedure
      .input(
        z.object({
          chatId: z.number(),
          content: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
      if (!database) throw new Error("Database not available");
        const userId = ctx.user.id;

        // Verificar se usuário participa do chat
        if (!database) throw new Error("Database not available");
        const participant = await database
          .select()
          .from(chatParticipants)
          .where(
            sql`${chatParticipants.chatId} = ${input.chatId} AND ${chatParticipants.userId} = ${userId}`
          )
          .limit(1);

        if (participant.length === 0) {
          throw new Error("Você não tem permissão para enviar mensagens neste chat");
        }

        // Parser de menções (@usuário) e referências (#requisição/#manutenção)
        const mentionRegex = /@(\w+)/g;
        const referenceRegex = /#([\w\s-]+)/g;
        
        const mentions: string[] = [];
        const references: string[] = [];
        
        let match;
        while ((match = mentionRegex.exec(input.content)) !== null) {
          mentions.push(match[1]);
        }
        
        while ((match = referenceRegex.exec(input.content)) !== null) {
          references.push(match[1]);
        }

        // Inserir mensagem com menções e referências
        if (!database) throw new Error("Database not available");
        const [newMessage] = await database.insert(messages).values({
          chatId: input.chatId,
          senderId: userId,
          content: input.content,
          mentions: mentions.length > 0 ? JSON.stringify(mentions) : null,
          references: references.length > 0 ? JSON.stringify(references) : null,
        });

        const messageId = newMessage.insertId;

        // Criar registros de menções para notificações
        if (mentions.length > 0) {
          // Buscar IDs dos usuários mencionados
          const mentionedUsers = await database
            .select({ id: users.id, name: users.name })
            .from(users)
            .where(sql`${users.name} IN (${sql.join(mentions.map(m => sql`${m}`), sql`, `)})`);;

          // Inserir menções
          for (const user of mentionedUsers) {
            await database.insert(messageMentions).values({
              messageId,
              mentionedUserId: user.id,
              isRead: false,
            });
          }
        }

        return { id: messageId, ...input, senderId: userId, mentions, references };
      }),

    // Buscar menções não lidas do usuário
    getUnreadMentions: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const userId = ctx.user.id;

      const unreadMentions = await database
        .select({
          id: messageMentions.id,
          messageId: messageMentions.messageId,
          chatId: messages.chatId,
          content: messages.content,
          senderName: sql<string>`sender.name`,
          createdAt: messageMentions.createdAt,
        })
        .from(messageMentions)
        .innerJoin(messages, eq(messageMentions.messageId, messages.id))
        .innerJoin(sql`users as sender`, eq(messages.senderId, sql`sender.id`))
        .where(
          sql`${messageMentions.mentionedUserId} = ${userId} AND ${messageMentions.isRead} = false`
        )
        .orderBy(desc(messageMentions.createdAt));

      return unreadMentions;
    }),

    // Marcar menções como lidas
    markMentionsAsRead: protectedProcedure
      .input(z.object({ mentionIds: z.array(z.number()) }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const userId = ctx.user.id;

        // Atualizar apenas menções do usuário
        await database
          .update(messageMentions)
          .set({ isRead: true })
          .where(
            sql`${messageMentions.id} IN (${sql.join(input.mentionIds.map(id => sql`${id}`), sql`, `)}) AND ${messageMentions.mentionedUserId} = ${userId}`
          );

        return { success: true };
      }),
  }),

  // ============= CRM =============
  crm: router({
    // ===== LEADS =====
    leads: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const allLeads = await database
          .select()
          .from(leads)
          .orderBy(desc(leads.createdAt));
        
        return allLeads;
      }),

      create: protectedProcedure
        .input(z.object({
          name: z.string(),
          company: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          source: z.string().optional(),
          status: z.enum(["novo", "contatado", "qualificado", "proposta_enviada", "negociacao", "ganho", "perdido"]).optional(),
          score: z.number().optional(),
          assignedTo: z.number().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          
          await database.insert(leads).values({
            ...input,
            createdBy: ctx.user.id,
          });
          
          return { success: true };
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          company: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          source: z.string().optional(),
          status: z.enum(["novo", "contatado", "qualificado", "proposta_enviada", "negociacao", "ganho", "perdido"]).optional(),
          score: z.number().optional(),
          assignedTo: z.number().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          
          const { id, ...updateData } = input;
          await database.update(leads).set(updateData).where(eq(leads.id, id));
          
          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          
          await database.delete(leads).where(eq(leads.id, input.id));
          
          return { success: true };
        }),
    }),

    // ===== OPPORTUNITIES =====
    opportunities: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const allOpportunities = await database
          .select()
          .from(opportunities)
          .orderBy(desc(opportunities.createdAt));
        
        return allOpportunities;
      }),

      create: protectedProcedure
        .input(z.object({
          title: z.string(),
          clientId: z.number().optional(),
          leadId: z.number().optional(),
          value: z.string().optional(),
          stage: z.enum(["prospeccao", "qualificacao", "proposta", "negociacao", "fechamento", "ganho", "perdido"]).optional(),
          probability: z.number().optional(),
          expectedCloseDate: z.string().optional(),
          assignedTo: z.number(),
          description: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          
          await database.insert(opportunities).values({
            ...input,
            createdBy: ctx.user.id,
          });
          
          return { success: true };
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().optional(),
          clientId: z.number().optional(),
          value: z.string().optional(),
          stage: z.enum(["prospeccao", "qualificacao", "proposta", "negociacao", "fechamento", "ganho", "perdido"]).optional(),
          probability: z.number().optional(),
          expectedCloseDate: z.string().optional(),
          actualCloseDate: z.string().optional(),
          assignedTo: z.number().optional(),
          description: z.string().optional(),
          lostReason: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          
          const { id, ...updateData } = input;
          await database.update(opportunities).set(updateData).where(eq(opportunities.id, id));
          
          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          
          await database.delete(opportunities).where(eq(opportunities.id, input.id));
          
          return { success: true };
        }),
    }),

    // ===== INTERACTIONS =====
    interactions: router({
      list: protectedProcedure
        .input(z.object({
          clientId: z.number().optional(),
          leadId: z.number().optional(),
          opportunityId: z.number().optional(),
        }))
        .query(async ({ input, ctx }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          
          let query = database.select().from(interactions);
          
          if (input.clientId) {
            query = query.where(eq(interactions.clientId, input.clientId));
          } else if (input.leadId) {
            query = query.where(eq(interactions.leadId, input.leadId));
          } else if (input.opportunityId) {
            query = query.where(eq(interactions.opportunityId, input.opportunityId));
          }
          
          const allInteractions = await query.orderBy(desc(interactions.interactionDate));
          
          return allInteractions;
        }),

      create: protectedProcedure
        .input(z.object({
          type: z.enum(["ligacao", "email", "reuniao", "whatsapp", "visita", "outro"]),
          subject: z.string(),
          description: z.string().optional(),
          clientId: z.number().optional(),
          leadId: z.number().optional(),
          opportunityId: z.number().optional(),
          interactionDate: z.string().optional(),
          duration: z.number().optional(),
          outcome: z.string().optional(),
          nextSteps: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          
          await database.insert(interactions).values({
            ...input,
            createdBy: ctx.user.id,
          });
          
          return { success: true };
        }),
    }),

    // ===== TASKS =====
    tasks: router({
      list: protectedProcedure
        .input(z.object({
          status: z.enum(["pendente", "em_andamento", "concluida", "cancelada"]).optional(),
          assignedTo: z.number().optional(),
        }))
        .query(async ({ input, ctx }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          
          let query = database.select().from(crmTasks);
          
          if (input.status) {
            query = query.where(eq(crmTasks.status, input.status));
          }
          if (input.assignedTo) {
            query = query.where(eq(crmTasks.assignedTo, input.assignedTo));
          }
          
          const allTasks = await query.orderBy(asc(crmTasks.dueDate));
          
          return allTasks;
        }),

      create: protectedProcedure
        .input(z.object({
          title: z.string(),
          description: z.string().optional(),
          type: z.enum(["ligacao", "email", "reuniao", "follow_up", "outro"]),
          priority: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
          dueDate: z.string().optional(),
          clientId: z.number().optional(),
          leadId: z.number().optional(),
          opportunityId: z.number().optional(),
          assignedTo: z.number(),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          
          await database.insert(crmTasks).values({
            ...input,
            createdBy: ctx.user.id,
          });
          
          return { success: true };
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["pendente", "em_andamento", "concluida", "cancelada"]).optional(),
          priority: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
          dueDate: z.string().optional(),
          completedAt: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          
          const { id, ...updateData } = input;
          await database.update(crmTasks).set(updateData).where(eq(crmTasks.id, id));
          
          return { success: true };
        }),
    }),

    // ===== DASHBOARD =====
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      // Contar leads por status
      const leadsByStatus = await database
        .select({
          status: leads.status,
          count: sql<number>`count(*)`
        })
        .from(leads)
        .groupBy(leads.status);
      
      // Contar oportunidades por estágio
      const opportunitiesByStage = await database
        .select({
          stage: opportunities.stage,
          count: sql<number>`count(*)`,
          totalValue: sql<string>`sum(${opportunities.value})`
        })
        .from(opportunities)
        .groupBy(opportunities.stage);
      
      // Tarefas pendentes
      const pendingTasks = await database
        .select({ count: sql<number>`count(*)` })
        .from(crmTasks)
        .where(eq(crmTasks.status, "pendente"));
      
      return {
        leadsByStatus,
        opportunitiesByStage,
        pendingTasksCount: pendingTasks[0]?.count || 0,
      };
    }),
  }),

  // ============= CUSTOM ROLES & PERMISSIONS =============
  customRoles: router({
    // Listar todos os roles
    list: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const roles = await database.select().from(customRoles);
      return roles;
    }),

    // Obter role por ID com permissões
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }: any) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [role] = await database.select().from(customRoles).where(eq(customRoles.id, input.id));
        if (!role) throw new Error("Role não encontrado");
        const permissions = await database.select().from(rolePermissions).where(eq(rolePermissions.roleId, input.id));
        return { ...role, permissions };
      }),

    // Obter role por name com permissões
    getByName: protectedProcedure
      .input(z.object({ name: z.string() }))
      .query(async ({ input }: any) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [role] = await database.select().from(customRoles).where(eq(customRoles.name, input.name));
        if (!role) throw new Error("Role não encontrado");
        const permissions = await database.select().from(rolePermissions).where(eq(rolePermissions.roleId, role.id));
        return { ...role, permissions };
      }),

    // Criar novo role (apenas admin)
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        displayName: z.string().min(1),
        description: z.string().optional(),
        color: z.string().default("blue"),
        permissions: z.array(z.object({
          module: z.string(),
          submodule: z.string().nullable(),
          permission: z.enum(["total", "readonly", "none"]),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }: any) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [newRole] = await database.insert(customRoles).values({
          name: input.name,
          displayName: input.displayName,
          description: input.description,
          color: input.color,
          isSystem: false,
          createdBy: ctx.user.id,
        });
        
        // Inserir permissões se fornecidas
        if (input.permissions && input.permissions.length > 0 && newRole.insertId) {
          const permissionsToInsert = input.permissions
            .filter((p: any) => p.permission !== "none")
            .map((p: any) => ({
              roleId: newRole.insertId,
              module: p.module,
              submodule: p.submodule,
              permission: p.permission,
            }));
          if (permissionsToInsert.length > 0) {
            await database.insert(rolePermissions).values(permissionsToInsert);
          }
        }
        
        return newRole;
      }),

    // Atualizar role (apenas admin)
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ input }: any) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const updateData: any = {};
        if (input.displayName) updateData.displayName = input.displayName;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.color) updateData.color = input.color;
        await database.update(customRoles).set(updateData).where(eq(customRoles.id, input.id));
        return { success: true };
      }),

    // Deletar role (apenas admin, não pode deletar roles do sistema)
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }: any) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [role] = await database.select().from(customRoles).where(eq(customRoles.id, input.id));
        if (!role) throw new Error("Role não encontrado");
        if (role.isSystem) throw new Error("Não é possível deletar roles do sistema");
        await database.delete(customRoles).where(eq(customRoles.id, input.id));
        return { success: true };
      }),

    // Atualizar permissões de um role (apenas admin)
    updatePermissions: adminProcedure
      .input(z.object({
        roleId: z.number(),
        permissions: z.array(z.object({
          module: z.string(),
          submodule: z.string().nullable(),
          permission: z.enum(["total", "readonly", "none"]),
        })),
      }))
      .mutation(async ({ input }: any) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.delete(rolePermissions).where(eq(rolePermissions.roleId, input.roleId));
        const permissionsToInsert = input.permissions
          .filter((p: any) => p.permission !== "none")
          .map((p: any) => ({
            roleId: input.roleId,
            module: p.module,
            submodule: p.submodule,
            permission: p.permission,
          }));
        if (permissionsToInsert.length > 0) {
          await database.insert(rolePermissions).values(permissionsToInsert);
        }
        return { success: true };
      }),

    // Obter permissões de um usuário (baseado no role dele)
    getUserPermissions: protectedProcedure.query(async ({ ctx }: any) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const userRole = ctx.user.role;
      const [role] = await database.select().from(customRoles).where(eq(customRoles.name, userRole));
      if (!role) return { role: userRole, permissions: [] };
      const permissions = await database.select().from(rolePermissions).where(eq(rolePermissions.roleId, role.id));
      return { role: userRole, permissions };
    }),
  }),
});

export type AppRouter = typeof appRouter;
