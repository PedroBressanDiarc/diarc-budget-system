import { usePermissions } from "@/hooks/usePermissions";
import { Button, ButtonProps } from "@/components/ui/button";

interface PermissionButtonProps extends ButtonProps {
  /**
   * Módulo que o botão pertence (ex: "compras", "estoque")
   */
  module: string;
  
  /**
   * Submódulo opcional (ex: "manutencao", "pecas_finalizadas")
   */
  submodule?: string | null;
  
  /**
   * Ação requerida: "write" para criar/editar, "delete" para excluir
   */
  action: "write" | "delete";
}

/**
 * Botão que só aparece se o usuário tiver a permissão necessária
 * 
 * @example
 * // Botão de criar requisição (requer permissão de escrita em compras)
 * <PermissionButton module="compras" action="write" onClick={handleCreate}>
 *   Criar Requisição
 * </PermissionButton>
 * 
 * @example
 * // Botão de deletar item (requer permissão total em estoque)
 * <PermissionButton module="estoque" submodule="estoque_interno" action="delete" onClick={handleDelete}>
 *   Excluir
 * </PermissionButton>
 */
export function PermissionButton({
  module,
  submodule,
  action,
  children,
  ...buttonProps
}: PermissionButtonProps) {
  const { canWrite, canDelete, isLoading } = usePermissions();
  
  // Aguardar carregamento de permissões
  if (isLoading) {
    return null;
  }
  
  // Verificar permissão baseado na ação
  const hasPermission = action === "write" 
    ? canWrite(module, submodule)
    : canDelete(module, submodule);
  
  // Se não tem permissão, ocultar botão
  if (!hasPermission) {
    return null;
  }
  
  // Renderizar botão normalmente
  return <Button {...buttonProps}>{children}</Button>;
}
