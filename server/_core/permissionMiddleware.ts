import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { customRoles, rolePermissions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Verifica se o usuário tem permissão para acessar um módulo/submódulo/ação
 * 
 * @param ctx - Contexto do tRPC com informações do usuário
 * @param module - Nome do módulo (ex: "compras", "estoque")
 * @param submodule - Nome do submódulo (ex: "manutencao", "obras") ou null
 * @param action - Ação (ex: "view", "create", "edit", "delete")
 * @param requiredLevel - Nível mínimo necessário ("readonly" ou "total")
 * @returns true se tem permissão, lança TRPCError se não tiver
 */
export async function checkPermission(
  ctx: any,
  module: string,
  submodule: string | null,
  action: string,
  requiredLevel: "readonly" | "total" = "readonly"
): Promise<boolean> {
  // Diretor tem acesso total a tudo
  if (ctx.user.role === "diretor") {
    return true;
  }

  // Módulos universais (todos têm acesso)
  const universalModules = ["dashboard", "chat", "configuracoes"];
  if (universalModules.includes(module) && action === "view") {
    return true;
  }

  // Se usuário não tem customRoleId, bloquear acesso (exceto módulos universais)
  if (!ctx.user.customRoleId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Sem permissão",
    });
  }

  // Buscar permissões do usuário
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const permissions = await database
    .select()
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, ctx.user.customRoleId));

  // Buscar permissão específica
  const permission = permissions.find(
    (p) =>
      p.module === module &&
      (p.submodule === submodule || (!p.submodule && !submodule)) &&
      p.action === action
  );

  // Se não encontrou permissão ou é "none", bloquear
  if (!permission || permission.permissionLevel === "none") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Sem permissão",
    });
  }

  // Se requer "total" mas tem apenas "readonly", bloquear
  if (requiredLevel === "total" && permission.permissionLevel === "readonly") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Sem permissão",
    });
  }

  return true;
}

/**
 * Helper para verificar permissão de leitura (view)
 */
export async function checkReadPermission(
  ctx: any,
  module: string,
  submodule: string | null = null
): Promise<boolean> {
  return checkPermission(ctx, module, submodule, "view", "readonly");
}

/**
 * Helper para verificar permissão de escrita (create, edit, delete)
 */
export async function checkWritePermission(
  ctx: any,
  module: string,
  submodule: string | null = null,
  action: "create" | "edit" | "delete" = "create"
): Promise<boolean> {
  return checkPermission(ctx, module, submodule, action, "total");
}
