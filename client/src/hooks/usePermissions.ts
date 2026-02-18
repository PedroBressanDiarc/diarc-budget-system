import { trpc } from "@/lib/trpc";

export type PermissionLevel = "none" | "readonly" | "write" | "total";

/**
 * Hook de permissões SIMPLIFICADO com regras fixas baseadas em user.role
 * 
 * Decisão de design: Sistema de permissões customizadas via banco de dados
 * foi removido por ser complexo e propenso a bugs. Agora usamos regras fixas
 * no código conforme matriz de permissões aprovada (ver Matriz_Permissoes_Diarc.xlsx)
 */
export function usePermissions() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  /**
   * Verifica se o usuário tem permissão para acessar um módulo/submódulo
   * @param moduleKey - Chave do módulo (ex: "compras", "estoque")
   * @param submoduleKey - Chave do submódulo (opcional, ex: "manutencao", "pecas_finalizadas")
   * @returns Nível de permissão ("none", "readonly", "write", "total") ou null se ainda carregando
   */
  const hasPermission = (moduleKey: string, submoduleKey?: string | null): PermissionLevel | null => {
    if (isLoading || !user) return null;

    const role = user.role;

    // ========== DIRETOR: Acesso total a TUDO ==========
    if (role === "diretor") return "total";

    // ========== REGRAS POR MÓDULO (baseadas na planilha Excel) ==========

    switch (moduleKey) {
      // DASHBOARD: Todos têm acesso total
      case "dashboard":
        return "total";

      // COMPRAS: Diretor/Comprador/Almoxarife (total), outros (none)
      case "compras":
        if (role === "comprador" || role === "almoxarife") return "total";
        return "none";

      // AUTORIZAÇÕES: Apenas diretor (já tratado acima)
      case "autorizacoes":
        return "none";

      // ESTOQUE: Diretor/Comprador (total), outros (none)
      case "estoque":
        if (role === "comprador") return "total";
        return "none";

      // ORÇAMENTOS: Apenas diretor (já tratado acima)
      case "orcamentos":
        return "none";

      // MANUTENÇÕES: Diretor/Manutenção (total), outros (none)
      case "manutencoes":
        if (role === "manutencao") return "total";
        return "none";

      // CHAT: Todos têm acesso total
      case "chat":
        return "total";

      // FINANCEIRO: Diretor/Financeiro (total), outros (none)
      case "financeiro":
        if (role === "financeiro") return "total";
        return "none";

      // RELATÓRIOS: Apenas diretor (já tratado acima)
      case "relatorios":
        return "none";

      // CONFIGURAÇÕES: Apenas diretor (já tratado acima)
      case "configuracoes":
        return "none";

      // GESTÃO: Apenas diretor (já tratado acima)
      case "gestao":
        return "none";

      // BANCO DE DADOS: Regras específicas por submódulo
      case "banco_de_dados":
        // Fornecedores: Diretor/Comprador/Manutenção (total)
        if (submoduleKey === "fornecedores") {
          if (role === "comprador" || role === "manutencao") return "total";
          return "none";
        }
        // Equipamentos: Diretor/Comprador/Manutenção (total)
        if (submoduleKey === "equipamentos") {
          if (role === "comprador" || role === "manutencao") return "total";
          return "none";
        }
        // Locais: Diretor/Comprador/Manutenção (total)
        if (submoduleKey === "locais") {
          if (role === "comprador" || role === "manutencao") return "total";
          return "none";
        }
        // Itens: Diretor/Comprador (total)
        if (submoduleKey === "itens") {
          if (role === "comprador") return "total";
          return "none";
        }
        // Obras: Diretor/Comprador (total)
        if (submoduleKey === "obras") {
          if (role === "comprador") return "total";
          return "none";
        }
        // Sem submódulo especificado: negar acesso
        return "none";

      default:
        return "none";
    }
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
    user,
    isLoading,
    hasPermission,
    canView,
    canWrite,
    canDelete,
    isReadOnly,
  };
}
