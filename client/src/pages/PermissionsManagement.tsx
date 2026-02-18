import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { X, Check, Eye, Pencil, ChevronDown, ChevronRight, Save } from "lucide-react";

type PermissionLevel = "none" | "readonly" | "write" | "total";

interface PermissionState {
  module: string;
  submodule: string | null;
  permissionLevel: PermissionLevel;
}

// Definição de módulos e submódulos do sistema
const MODULES = [
  { key: "dashboard", label: "Dashboard", submodules: [] },
  { 
    key: "compras", 
    label: "Compras", 
    submodules: [
      { key: "manutencao", label: "Manutenção" },
      { key: "administrativo", label: "Administrativo" },
      { key: "fabrica", label: "Fábrica" },
      { key: "obras", label: "Obras" },
    ]
  },
  { key: "autorizacoes", label: "Autorizações", submodules: [] },
  { 
    key: "estoque", 
    label: "Estoque", 
    submodules: [
      { key: "pecas_finalizadas", label: "Peças Finalizadas" },
      { key: "estoque_interno", label: "Estoque Interno" },
    ]
  },
  { key: "orcamentos", label: "Orçamentos", submodules: [] },
  { key: "manutencoes", label: "Manutenções", submodules: [] },
  { key: "chat", label: "Chat", submodules: [] },
  { 
    key: "financeiro", 
    label: "Financeiro", 
    submodules: [
      { key: "recebimentos", label: "Recebimentos" },
      { key: "pagamentos", label: "Pagamentos" },
    ]
  },
  { 
    key: "relatorios", 
    label: "Relatórios", 
    submodules: [
      { key: "economias", label: "Economias" },
      { key: "obras", label: "Obras" },
      { key: "alertas_orcamento", label: "Alertas Orçamento" },
      { key: "manutencoes", label: "Manutenções" },
    ]
  },
  { key: "configuracoes", label: "Configurações", submodules: [] },
  { 
    key: "gestao", 
    label: "Gestão", 
    submodules: [
      { key: "usuarios", label: "Usuários" },
      { key: "permissoes", label: "Permissões" },
    ]
  },
  { 
    key: "banco_dados", 
    label: "Banco de Dados", 
    submodules: [
      { key: "fornecedores", label: "Fornecedores" },
      { key: "equipamentos", label: "Equipamentos" },
      { key: "itens", label: "Itens" },
      { key: "obras_bd", label: "Obras" },
      { key: "locais", label: "Locais" },
    ]
  },
];

// Ícones e cores para cada estado
const PERMISSION_ICONS = {
  none: { icon: X, color: "text-gray-400", bg: "bg-gray-100", label: "Oculto" },
  readonly: { icon: Eye, color: "text-blue-500", bg: "bg-blue-100", label: "Visualizar" },
  write: { icon: Pencil, color: "text-yellow-500", bg: "bg-yellow-100", label: "Criar/Editar" },
  total: { icon: Check, color: "text-green-500", bg: "bg-green-100", label: "Total" },
};

// Ciclo de estados ao clicar
const PERMISSION_CYCLE: PermissionLevel[] = ["none", "readonly", "write", "total"];

export default function PermissionsManagement() {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [permissions, setPermissions] = useState<PermissionState[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data: roles, refetch } = trpc.permissionRoles.list.useQuery();
  const updatePermissionsMutation = trpc.permissionRoles.updatePermissions.useMutation();
  const utils = trpc.useUtils();

  const handleConfigureRole = async (role: any) => {
    setSelectedRole(role);
    
    // Buscar permissões existentes do role
    const existingPerms = await utils.permissionRoles.getUserPermissions.fetch({ roleId: role.id });
    setPermissions(existingPerms);
    
    // Expandir módulos que têm permissões
    const modulesWithPerms = new Set(existingPerms.map((p: any) => p.module));
    setExpandedModules(modulesWithPerms);
    
    setConfigDialogOpen(true);
  };

  const getPermissionLevel = (module: string, submodule: string | null): PermissionLevel => {
    const perm = permissions.find(
      (p) => p.module === module && p.submodule === submodule
    );
    return perm?.permissionLevel || "none";
  };

  const cyclePermission = (module: string, submodule: string | null) => {
    const current = getPermissionLevel(module, submodule);
    const currentIndex = PERMISSION_CYCLE.indexOf(current);
    const next = PERMISSION_CYCLE[(currentIndex + 1) % PERMISSION_CYCLE.length];

    setPermissions((prev) => {
      const existing = prev.find(
        (p) => p.module === module && p.submodule === submodule
      );
      if (existing) {
        return prev.map((p) =>
          p.module === module && p.submodule === submodule
            ? { ...p, permissionLevel: next }
            : p
        );
      } else {
        return [...prev, { module, submodule, permissionLevel: next }];
      }
    });
  };

  const toggleModuleExpansion = (moduleKey: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleKey)) {
        newSet.delete(moduleKey);
      } else {
        newSet.add(moduleKey);
      }
      return newSet;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    const payload = {
      roleId: selectedRole.id,
      permissions: permissions.filter((p) => p.permissionLevel !== "none"), // Não salvar "none"
    };
    try {
      await updatePermissionsMutation.mutateAsync(payload);
      await utils.permissionRoles.getUserPermissions.invalidate();
      toast.success("Permissões atualizadas! Usuários devem recarregar a página (F5) para ver as mudanças.");
      setConfigDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar permissões");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Configuração de Acessos</h1>
          <p className="text-muted-foreground mt-2">
            Configure quais módulos cada tipo de usuário pode acessar
          </p>
        </div>
      </div>

      {/* Legenda */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Legenda de Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(PERMISSION_ICONS).map(([key, { icon: Icon, color, bg, label }]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`${bg} p-2 rounded`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Roles Fixos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles?.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <div>
                    <CardTitle>{role.displayName}</CardTitle>
                    <CardDescription className="text-xs">{role.name}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
              <Button
                className="w-full"
                onClick={() => handleConfigureRole(role)}
              >
                Configurar Acessos
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Configuração */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configurar Acessos: {selectedRole?.displayName}
            </DialogTitle>
            <DialogDescription>
              Clique nos ícones para alternar entre os níveis de permissão
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            {MODULES.map((module) => {
              const moduleLevel = getPermissionLevel(module.key, null);
              const isExpanded = expandedModules.has(module.key);
              const hasSubmodules = module.submodules.length > 0;

              return (
                <div key={module.key} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {hasSubmodules && (
                        <button
                          onClick={() => toggleModuleExpansion(module.key)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      <span className="font-medium">{module.label}</span>
                    </div>

                    <button
                      onClick={() => cyclePermission(module.key, null)}
                      className={`${PERMISSION_ICONS[moduleLevel].bg} p-2 rounded hover:opacity-80 transition-opacity`}
                    >
                      {(() => {
                        const Icon = PERMISSION_ICONS[moduleLevel].icon;
                        return (
                          <Icon
                            className={`h-4 w-4 ${PERMISSION_ICONS[moduleLevel].color}`}
                          />
                        );
                      })()}
                    </button>
                  </div>

                  {/* Submódulos */}
                  {hasSubmodules && isExpanded && (
                    <div className="ml-8 mt-2 space-y-2">
                      {module.submodules.map((submodule) => {
                        const subLevel = getPermissionLevel(module.key, submodule.key);
                        return (
                          <div
                            key={submodule.key}
                            className="flex items-center justify-between py-2 border-t"
                          >
                            <span className="text-sm">{submodule.label}</span>
                            <button
                              onClick={() =>
                                cyclePermission(module.key, submodule.key)
                              }
                              className={`${PERMISSION_ICONS[subLevel].bg} p-2 rounded hover:opacity-80 transition-opacity`}
                            >
                              {(() => {
                                const Icon = PERMISSION_ICONS[subLevel].icon;
                                return (
                                  <Icon
                                    className={`h-4 w-4 ${PERMISSION_ICONS[subLevel].color}`}
                                  />
                                );
                              })()}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={updatePermissionsMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {updatePermissionsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
