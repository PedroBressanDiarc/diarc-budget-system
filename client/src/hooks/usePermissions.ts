import { trpc } from "@/lib/trpc";

export type PermissionLevel = "none" | "readonly" | "write" | "total";

export interface Permission {
  module: string;
  submodule: string | null;
  permissionLevel: PermissionLevel;
}

export function usePermissions() {
  const { data, isLoading } = trpc.permissionRoles.getUserPermissions.useQuery();

  /**
   * Verifica se o usuário tem permissão para acessar um módulo/submódulo
   * @param moduleKey - Chave do módulo (ex: "compras", "estoque")
   * @param submoduleKey - Chave do submódulo (opcional, ex: "manutencao", "pecas_finalizadas")
   * @returns Nível de permissão ("none", "readonly", "write", "total") ou null se ainda carregando
   */
  const hasPermission = (moduleKey: string, submoduleKey?: string | null): PermissionLevel | null => {
    if (isLoading || !data) return null;

    // Se não tem customRole, libera tudo (compatibilidade com sistema antigo)
    if (!data.customRole) return "total";

    // Diretor sempre tem acesso total
    if (data.user.role === "diretor") return "total";

    // Módulos universais (todos têm acesso)
    const universalModules = ["dashboard", "chat", "configuracoes"];
    if (universalModules.includes(moduleKey) && !submoduleKey) {
      return "total";
    }

    // Buscar permissão específica
    const permission = data.permissions?.find(
      (p: Permission) => p.module === moduleKey && p.submodule === submoduleKey
    );

    return permission?.permissionLevel || "none";
  };

  /**
   * Verifica se o usuário pode visualizar um módulo/submódulo
   */
  const canView = (moduleKey: string, submoduleKey?: string | null): boolean => {
    const level = hasPermission(moduleKey, submoduleKey);
    return level !== null && level !== "none";
  };

  /**
   * Verifica se o usuário pode criar/editar em um módulo/submódulo
   */
  const canWrite = (moduleKey: string, submoduleKey?: string | null): boolean => {
    const level = hasPermission(moduleKey, submoduleKey);
    return level === "write" || level === "total";
  };

  /**
   * Verifica se o usuário pode deletar em um módulo/submódulo
   */
  const canDelete = (moduleKey: string, submoduleKey?: string | null): boolean => {
    const level = hasPermission(moduleKey, submoduleKey);
    return level === "total";
  };

  /**
   * Verifica se o usuário tem apenas permissão de leitura
   */
  const isReadOnly = (moduleKey: string, submoduleKey?: string | null): boolean => {
    const level = hasPermission(moduleKey, submoduleKey);
    return level === "readonly";
  };

  return {
    permissions: data?.permissions || [],
    customRole: data?.customRole,
    user: data?.user,
    isLoading,
    hasPermission,
    canView,
    canWrite,
    canDelete,
    isReadOnly,
  };
}
