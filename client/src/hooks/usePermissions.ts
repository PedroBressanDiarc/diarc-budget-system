import { trpc } from "@/lib/trpc";

export type PermissionLevel = "total" | "readonly" | "none";

/**
 * Hook para verificar permissões do usuário logado
 * Consulta permissões customizadas da tabela role_permissions
 */
export function usePermissions() {
  const { data, isLoading } = trpc.customRoles.getUserPermissions.useQuery();

  /**
   * Verifica se usuário tem permissão para acessar um módulo
   * @param moduleKey Chave do módulo (ex: "compras", "manutencoes", "financeiro")
   * @param requiredLevel Nível mínimo necessário ("total" ou "readonly")
   * @returns true se tem permissão, false caso contrário
   */
  const hasPermission = (
    moduleKey: string,
    requiredLevel: PermissionLevel = "readonly"
  ): boolean => {
    if (isLoading) return false;
    if (!data) return false;

    // Se não tem customRole (customRoleId é NULL), libera TUDO (compatibilidade com sistema antigo)
    if (!data.customRole) {
      return true;
    }

    // Se não tem permissões configuradas, libera tudo também
    if (!data.permissions || data.permissions.length === 0) {
      return true;
    }

    // Buscar permissão do módulo
    const permission = data.permissions.find((p: any) => p.module === moduleKey);

    if (!permission) {
      return false; // Sem permissão configurada = sem acesso
    }

    // Verificar nível de permissão
    if (permission.permission === "none") {
      return false;
    }

    if (requiredLevel === "total" && permission.permission !== "total") {
      return false;
    }

    return true;
  };

  /**
   * Verifica se usuário tem permissão de escrita (total) em um módulo
   */
  const canWrite = (moduleKey: string): boolean => {
    return hasPermission(moduleKey, "total");
  };

  /**
   * Verifica se usuário tem pelo menos permissão de leitura em um módulo
   */
  const canRead = (moduleKey: string): boolean => {
    return hasPermission(moduleKey, "readonly");
  };

  return {
    permissions: data?.permissions || [],
    customRole: data?.customRole || null,
    role: data?.role || null,
    isLoading,
    hasPermission,
    canWrite,
    canRead,
  };
}
