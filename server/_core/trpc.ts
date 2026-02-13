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
