import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import * as db from "./db";
import { authenticateUser, hashPassword } from "./auth";
import { 
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
  equipment,
  maintenanceSchedules,
  maintenanceRecords,
  companySettings
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

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
    create: adminProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        role: z.enum(["buyer", "director", "storekeeper"]),
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
        role: z.enum(["buyer", "director", "storekeeper"]).optional(),
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

    create: protectedProcedure
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

        const result = await database.insert(suppliers).values({
          ...input,
          createdBy: ctx.user.id,
        });

        return { success: true, id: Number(result[0].insertId) };
      }),

    update: protectedProcedure
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

        const { id, ...updateData } = input;
        await database.update(suppliers).set(updateData).where(eq(suppliers.id, id));

        return { success: true };
      }),
  }),

  // ============= PURCHASE REQUISITIONS =============
  requisitions: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllRequisitions();
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
        items: z.array(z.object({
          itemName: z.string().min(1),
          quantity: z.number().positive(),
          unit: z.string().optional(),
          brand: z.string().optional(),
          notes: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Generate requisition number
        const requisitionNumber = `REQ-${Date.now()}`;

        const result = await database.insert(purchaseRequisitions).values({
          requisitionNumber,
          title: input.title,
          description: input.description,
          requestedBy: ctx.user.id,
          status: 'solicitacao',
        });

        const requisitionId = Number(result[0].insertId);

        // Insert items
        for (const item of input.items) {
          await database.insert(requisitionItems).values({
            requisitionId,
            itemName: item.itemName,
            quantity: item.quantity.toString(),
            unit: item.unit,
            brand: item.brand,
            notes: item.notes,
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
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
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
          });
        }

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Delete items first (foreign key constraint)
        await database.delete(requisitionItems).where(eq(requisitionItems.requisitionId, input.id));
        
        // Delete requisition
        await database.delete(purchaseRequisitions).where(eq(purchaseRequisitions.id, input.id));

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

        const updateData: any = { status: input.status };
        
        if (input.status === 'received') {
          updateData.receivedBy = ctx.user.id;
          updateData.actualDelivery = input.actualDelivery || new Date().toISOString().split('T')[0];
        }

        await database.update(purchaseOrders).set(updateData).where(eq(purchaseOrders.id, input.id));

        return { success: true };
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
        templateId: z.number().optional(),
        items: z.array(z.object({
          itemName: z.string().min(1),
          quantity: z.number().positive(),
          unit: z.string().optional(),
          brand: z.string().optional(),
          notes: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const budgetNumber = `BUD-${Date.now()}`;

        const result = await database.insert(budgets).values({
          budgetNumber,
          title: input.title,
          description: input.description,
          templateId: input.templateId,
          createdBy: ctx.user.id,
        });

        const budgetId = Number(result[0].insertId);

        for (const item of input.items) {
          await database.insert(budgetItems).values({
            budgetId,
            itemName: item.itemName,
            quantity: item.quantity.toString(),
            unit: item.unit,
            brand: item.brand,
            notes: item.notes,
          });
        }

        return { success: true, id: budgetId, budgetNumber };
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

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        code: z.string().optional(),
        type: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        serialNumber: z.string().optional(),
        location: z.string().optional(),
        purchaseDate: z.string().optional(),
        warrantyExpiry: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
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

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        code: z.string().optional(),
        type: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        serialNumber: z.string().optional(),
        location: z.string().optional(),
        purchaseDate: z.string().optional(),
        warrantyExpiry: z.string().optional(),
        status: z.enum(['active', 'maintenance', 'inactive', 'retired']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const { id, ...updateData } = input;
        await database.update(equipment).set(updateData).where(eq(equipment.id, id));

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
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
      list: protectedProcedure.query(async () => {
        return await db.getMaintenanceSchedules();
      }),

      listByEquipment: protectedProcedure
        .input(z.object({ equipmentId: z.number() }))
        .query(async ({ input }) => {
          return await db.getMaintenanceSchedulesByEquipment(input.equipmentId);
        }),

      upcoming: protectedProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ input }) => {
          return await db.getUpcomingMaintenance(input.days);
        }),

      getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return await db.getMaintenanceScheduleById(input.id);
        }),

      create: protectedProcedure
        .input(z.object({
          equipmentId: z.number(),
          maintenanceType: z.enum(['preventive', 'corrective']),
          scheduledDate: z.string(),
          description: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const database = await getDb();
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

      update: protectedProcedure
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

          const { id, ...updateData } = input;
          await database.update(maintenanceSchedules).set(updateData).where(eq(maintenanceSchedules.id, id));

          return { success: true };
        }),

      updateStatus: protectedProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(['scheduled', 'completed', 'cancelled']),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");

          await database.update(maintenanceSchedules).set({ status: input.status }).where(eq(maintenanceSchedules.id, input.id));

          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const database = await getDb();
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

          await database.delete(maintenanceRecords).where(eq(maintenanceRecords.id, input.id));

          return { success: true };
        }),
    }),
  }),

  // ============= DASHBOARD =============
  dashboard: router({
    metrics: protectedProcedure.query(async () => {
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

        await database.delete(requisitionAttachments).where(eq(requisitionAttachments.id, input.id));

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
