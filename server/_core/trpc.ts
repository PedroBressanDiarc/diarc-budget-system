import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

// Middleware para verificar se é diretor
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'diretor') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// Middleware para verificar se é diretor ou comprador
export const buyerProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !['diretor', 'comprador'].includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a diretores e compradores" });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

// Middleware para verificar se é diretor ou almoxarife
export const storekeeperProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !['diretor', 'almoxarife'].includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a diretores e almoxarifes" });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

// Middleware para verificar se é diretor ou manutenção
export const maintenanceProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !['diretor', 'manutencao'].includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a diretores e manutenção" });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

// Middleware para verificar se é diretor ou financeiro
export const financeProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !['diretor', 'financeiro'].includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a diretores e financeiro" });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

// Middleware para verificar se é diretor, comprador ou manutenção (para equipamentos e locais)
export const equipmentProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !['diretor', 'comprador', 'manutencao'].includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a diretores, compradores e manutenção" });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

// ============= PROCEDURES COM PERMISSÕES CUSTOMIZADAS =============
import { createPermissionMiddleware, MODULE_KEYS } from "./permissionMiddleware";

// Compras (readonly)
export const comprasReadProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.compras, "readonly", ["diretor", "comprador", "almoxarife"]))
);

// Compras (escrita/total)
export const comprasWriteProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.compras, "total", ["diretor", "comprador"]))
);

// Manutenções (readonly)
export const manutencoesReadProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.manutencoes, "readonly", ["diretor", "manutencao"]))
);

// Manutenções (escrita/total)
export const manutencoesWriteProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.manutencoes, "total", ["diretor", "manutencao"]))
);

// Financeiro (readonly)
export const financeiroReadProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.financeiro, "readonly", ["diretor", "financeiro"]))
);

// Financeiro (escrita/total)
export const financeiroWriteProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.financeiro, "total", ["diretor", "financeiro"]))
);

// Banco de Dados - Fornecedores (readonly)
export const bancoFornecedoresReadProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.banco_fornecedores, "readonly", ["diretor", "comprador"]))
);

// Banco de Dados - Fornecedores (escrita/total)
export const bancoFornecedoresWriteProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.banco_fornecedores, "total", ["diretor", "comprador"]))
);

// Banco de Dados - Equipamentos (readonly)
export const bancoEquipamentosReadProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.banco_equipamentos, "readonly", ["diretor", "comprador", "manutencao"]))
);

// Banco de Dados - Equipamentos (escrita/total)
export const bancoEquipamentosWriteProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.banco_equipamentos, "total", ["diretor", "comprador", "manutencao"]))
);

// Banco de Dados - Locais (readonly)
export const bancoLocaisReadProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.banco_locais, "readonly", ["diretor", "comprador", "manutencao"]))
);

// Banco de Dados - Locais (escrita/total)
export const bancoLocaisWriteProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.banco_locais, "total", ["diretor", "comprador", "manutencao"]))
);

// Banco de Dados - Itens (readonly)
export const bancoItensReadProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.banco_itens, "readonly", ["diretor", "comprador"]))
);

// Banco de Dados - Itens (escrita/total)
export const bancoItensWriteProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.banco_itens, "total", ["diretor", "comprador"]))
);

// Banco de Dados - Projetos (readonly)
export const bancoProjetosReadProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.banco_projetos, "readonly", ["diretor", "comprador"]))
);

// Banco de Dados - Projetos (escrita/total)
export const bancoProjetosWriteProcedure = t.procedure.use(
  requireUser
).use(
  t.middleware(createPermissionMiddleware(MODULE_KEYS.banco_projetos, "total", ["diretor", "comprador"]))
);
