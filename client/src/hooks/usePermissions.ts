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
   * @param moduleKey Chave do módulo (ex: "compras", "compras:manutencao", "estoque:estoque_interno")
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

    // Separar módulo e submódulo (formato: "modulo" ou "modulo:submodulo")
    const [module, submodule] = moduleKey.split(":");

    // Buscar permissão do módulo/submódulo
    const permission = data.permissions.find((p: any) => {
      if (submodule) {
        // Buscar por módulo E submódulo
        return p.module === module && p.submodule === submodule;
      } else {
        // Buscar apenas por módulo (submodule deve ser null ou vazio)
        return p.module === module && (!p.submodule || p.submodule === "");
      }
    });

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
