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
  const { canWrite, canDelete, isLoading, hasPermission: getPermissionLevel } = usePermissions();
  
  console.log('[PermissionButton] Checking:', { module, submodule, action, isLoading });
  
  // Aguardar carregamento de permissões
  if (isLoading) {
    console.log('[PermissionButton] Still loading, hiding button');
    return null;
  }
  
  // Verificar permissão baseado na ação
  const hasPermission = action === "write" 
    ? canWrite(module, submodule)
    : canDelete(module, submodule);
  
  const permissionLevel = getPermissionLevel(module, submodule);
  console.log('[PermissionButton] Permission level:', permissionLevel, 'hasPermission:', hasPermission);
  
  // Se não tem permissão, ocultar botão
  if (!hasPermission) {
    console.log('[PermissionButton] No permission, hiding button');
    return null;
  }
  
  console.log('[PermissionButton] Has permission, showing button');
  // Renderizar botão normalmente
  return <Button {...buttonProps}>{children}</Button>;
}
