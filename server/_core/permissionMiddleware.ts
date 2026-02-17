import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { rolePermissions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Tipos de permissão por módulo
 */
export type PermissionLevel = "total" | "readonly" | "none";

/**
 * Mapeamento de módulos para suas chaves no banco
 */
export const MODULE_KEYS = {
  // Módulos principais
  compras: "compras",
  autorizacoes: "autorizacoes",
  estoque: "estoque",
  orcamentos: "orcamentos",
  manutencoes: "manutencoes",
  chat: "chat",
  financeiro: "financeiro",
  relatorios: "relatorios",
  configuracoes: "configuracoes",
  gestao: "gestao",
  banco_dados: "banco_dados",
  
  // Submódulos de Compras
  compras_manutencao: "compras_manutencao",
  compras_administrativo: "compras_administrativo",
  compras_fabrica: "compras_fabrica",
  compras_obras: "compras_obras",
  
  // Submódulos de Estoque
  estoque_pecas: "estoque_pecas",
  estoque_interno: "estoque_interno",
  
  // Submódulos de Financeiro
  financeiro_recebimentos: "financeiro_recebimentos",
  financeiro_pagamentos: "financeiro_pagamentos",
  
  // Submódulos de Relatórios
  relatorios_visao_geral: "relatorios_visao_geral",
  relatorios_economias: "relatorios_economias",
  relatorios_obras: "relatorios_obras",
  relatorios_alertas: "relatorios_alertas",
  relatorios_manutencoes: "relatorios_manutencoes",
  
  // Submódulos de Gestão
  gestao_usuarios: "gestao_usuarios",
  gestao_permissoes: "gestao_permissoes",
  
  // Submódulos de Banco de Dados
  banco_fornecedores: "banco_fornecedores",
  banco_equipamentos: "banco_equipamentos",
  banco_locais: "banco_locais",
  banco_itens: "banco_itens",
  banco_projetos: "banco_projetos",
} as const;

export type ModuleKey = typeof MODULE_KEYS[keyof typeof MODULE_KEYS];

/**
 * Verifica se usuário tem permissão para acessar um módulo
 * @param userId ID do usuário
 * @param customRoleId ID do nível de permissão customizado
 * @param moduleKey Chave do módulo (ex: "compras", "manutencoes")
 * @param requiredLevel Nível mínimo necessário ("total" ou "readonly")
 * @returns true se tem permissão, false caso contrário
 */
export async function checkPermission(
  userId: number,
  customRoleId: number | null,
  moduleKey: ModuleKey,
  requiredLevel: "total" | "readonly" = "readonly"
): Promise<boolean> {
  // Se não tem customRoleId, usar lógica antiga (baseada em role fixo)
  if (!customRoleId) {
    return true; // Mantém compatibilidade com sistema antigo
  }

  const database = await getDb();
  if (!database) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  }

  // Buscar permissão do módulo para este role
  const permissions = await database
    .select()
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, customRoleId))
    .limit(1);

  if (permissions.length === 0) {
    return false; // Sem permissões configuradas = sem acesso
  }

  const permission = permissions[0];
  const permissionsData = permission.permissions as Record<string, PermissionLevel>;
  const userPermission = permissionsData[moduleKey];

  // Verificar nível de permissão
  if (!userPermission || userPermission === "none") {
    return false;
  }

  if (requiredLevel === "total" && userPermission !== "total") {
    return false;
  }

  return true;
}

/**
 * Middleware factory para criar procedures com verificação de permissão customizada
 * @param moduleKey Chave do módulo a ser verificado
 * @param requiredLevel Nível mínimo necessário ("total" para escrita, "readonly" para leitura)
 * @param fallbackRoles Roles fixos que têm acesso (para compatibilidade com sistema antigo)
 */
export function createPermissionMiddleware(
  moduleKey: ModuleKey,
  requiredLevel: "total" | "readonly" = "readonly",
  fallbackRoles: string[] = []
) {
  return async (opts: any) => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
    }

    // Se tem customRoleId, verificar permissões customizadas
    if (ctx.user.customRoleId) {
      const hasPermission = await checkPermission(
        ctx.user.id,
        ctx.user.customRoleId,
        moduleKey,
        requiredLevel
      );

      if (!hasPermission) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Você não tem permissão para ${requiredLevel === "total" ? "modificar" : "acessar"} este módulo`,
        });
      }
    } else if (fallbackRoles.length > 0) {
      // Fallback: verificar role fixo (compatibilidade com sistema antigo)
      if (!fallbackRoles.includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Acesso restrito a: ${fallbackRoles.join(", ")}`,
        });
      }
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  };
}
