import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useMemo } from "react";

type PermissionLevel = "none" | "readonly" | "write" | "total";

export function useRolePermissions() {
  const { user } = useAuth();
  
  // Buscar permissões do role do usuário
  const { data: permissions, isLoading } = trpc.permissionRoles.getUserPermissionsByRole.useQuery(
    { roleName: user?.role || "" },
    { enabled: !!user?.role }
  );

  // Função para verificar se pode visualizar um módulo/submódulo
  const canView = useMemo(() => {
    return (module: string, submodule?: string | null): boolean => {
      if (!permissions) return true; // Se não carregou ainda, mostrar tudo
      
      const perm = permissions.find(
        (p: any) => p.module === module && p.submodule === submodule
      );
      
      // Se não tem permissão definida, mostrar por padrão
      if (!perm) return true;
      
      // Se tem permissão, verificar se não é "none"
      return perm.permissionLevel !== "none";
    };
  }, [permissions]);

  // Função para verificar se pode escrever (criar/editar)
  const canWrite = useMemo(() => {
    return (module: string, submodule?: string | null): boolean => {
      if (!permissions) return true;
      
      const perm = permissions.find(
        (p: any) => p.module === module && p.submodule === submodule
      );
      
      if (!perm) return true;
      
      return perm.permissionLevel === "write" || perm.permissionLevel === "total";
    };
  }, [permissions]);

  // Função para verificar se pode deletar
  const canDelete = useMemo(() => {
    return (module: string, submodule?: string | null): boolean => {
      if (!permissions) return true;
      
      const perm = permissions.find(
        (p: any) => p.module === module && p.submodule === submodule
      );
      
      if (!perm) return true;
      
      return perm.permissionLevel === "total";
    };
  }, [permissions]);

  // Função para obter o nível de permissão
  const getPermissionLevel = useMemo(() => {
    return (module: string, submodule?: string | null): PermissionLevel => {
      if (!permissions) return "total";
      
      const perm = permissions.find(
        (p: any) => p.module === module && p.submodule === submodule
      );
      
      return perm?.permissionLevel || "total";
    };
  }, [permissions]);

  return {
    canView,
    canWrite,
    canDelete,
    getPermissionLevel,
    isLoading,
  };
}
