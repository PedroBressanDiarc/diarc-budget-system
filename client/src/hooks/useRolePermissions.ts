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
      // Se permissions é null, é Diretor (acesso total)
      if (permissions === null) return true;
      // Se ainda está carregando (undefined), negar acesso
      if (!permissions) return false;
      
      const perm = permissions.find(
        (p: any) => p.module === module && p.submodule === submodule
      );
      
      // Se não tem permissão definida, NEGAR acesso por padrão
      if (!perm) return false;
      
      // Se tem permissão, verificar se não é "none"
      return perm.permissionLevel !== "none";
    };
  }, [permissions]);

  // Função para verificar se pode escrever (criar/editar)
  const canWrite = useMemo(() => {
    return (module: string, submodule?: string | null): boolean => {
      if (permissions === null) return true; // Diretor
      if (!permissions) return false;
      
      const perm = permissions.find(
        (p: any) => p.module === module && p.submodule === submodule
      );
      
      if (!perm) return false;
      
      return perm.permissionLevel === "write" || perm.permissionLevel === "total";
    };
  }, [permissions]);

  // Função para verificar se pode deletar
  const canDelete = useMemo(() => {
    return (module: string, submodule?: string | null): boolean => {
      if (permissions === null) return true; // Diretor
      if (!permissions) return false;
      
      const perm = permissions.find(
        (p: any) => p.module === module && p.submodule === submodule
      );
      
      if (!perm) return false;
      
      return perm.permissionLevel === "total";
    };
  }, [permissions]);

  // Função para obter o nível de permissão
  const getPermissionLevel = useMemo(() => {
    return (module: string, submodule?: string | null): PermissionLevel => {
      if (permissions === null) return "total"; // Diretor
      if (!permissions) return "none";
      
      const perm = permissions.find(
        (p: any) => p.module === module && p.submodule === submodule
      );
      
      return perm?.permissionLevel || "none";
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
