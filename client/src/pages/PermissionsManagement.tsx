import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Settings, Trash2, X, Check, Eye, Pencil, ChevronDown, ChevronRight } from "lucide-react";

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [newRole, setNewRole] = useState({ name: "", displayName: "", description: "", color: "#3b82f6" });
  const [permissions, setPermissions] = useState<PermissionState[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data: roles, refetch } = trpc.permissionRoles.list.useQuery();
  const createMutation = trpc.permissionRoles.create.useMutation();
  const updateMutation = trpc.permissionRoles.update.useMutation();
  const deleteMutation = trpc.permissionRoles.delete.useMutation();
  const updatePermissionsMutation = trpc.permissionRoles.updatePermissions.useMutation();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(newRole);
      toast.success("Nível criado com sucesso!");
      setCreateDialogOpen(false);
      setNewRole({ name: "", displayName: "", description: "", color: "#3b82f6" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar nível");
    }
  };

  const handleUpdate = async () => {
    if (!selectedRole) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedRole.id,
        displayName: selectedRole.displayName,
        description: selectedRole.description,
        color: selectedRole.color,
      });
      toast.success("Nível atualizado com sucesso!");
      setEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar nível");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este nível? Usuários vinculados perderão suas permissões.")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Nível deletado com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar nível");
    }
  };

  const handleConfigurePermissions = async (role: any) => {
    setSelectedRole(role);
    
    // Inicializar permissões: carregar do banco ou criar padrão
    const initialPermissions: PermissionState[] = [];
    
    MODULES.forEach(module => {
      // Módulo principal
      const modulePermission = role.permissions?.find((p: any) => p.module === module.key && !p.submodule);
      initialPermissions.push({
        module: module.key,
        submodule: null,
        permissionLevel: modulePermission?.permissionLevel || "none",
      });
      
      // Submódulos
      module.submodules.forEach(sub => {
        const subPermission = role.permissions?.find((p: any) => p.module === module.key && p.submodule === sub.key);
        initialPermissions.push({
          module: module.key,
          submodule: sub.key,
          permissionLevel: subPermission?.permissionLevel || "none",
        });
      });
    });
    
    setPermissions(initialPermissions);
    setConfigDialogOpen(true);
  };

  const getPermission = (module: string, submodule: string | null): PermissionLevel => {
    const perm = permissions.find(p => p.module === module && p.submodule === submodule);
    return perm?.permissionLevel || "none";
  };

  const cyclePermission = (module: string, submodule: string | null) => {
    const current = getPermission(module, submodule);
    const currentIndex = PERMISSION_CYCLE.indexOf(current);
    const next = PERMISSION_CYCLE[(currentIndex + 1) % PERMISSION_CYCLE.length];
    
    setPermissions(prev => {
      const existing = prev.find(p => p.module === module && p.submodule === submodule);
      if (existing) {
        return prev.map(p => 
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
    setExpandedModules(prev => {
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
    try {
      await updatePermissionsMutation.mutateAsync({
        roleId: selectedRole.id,
        permissions: permissions.filter(p => p.permissionLevel !== "none"), // Não salvar "none"
      });
      toast.success("Permissões atualizadas com sucesso!");
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
          <h1 className="text-3xl font-bold">Gerenciamento de Permissões</h1>
          <p className="text-muted-foreground mt-2">
            Configure níveis de acesso e permissões para cada cargo do sistema
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Novo Nível
        </Button>
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

      {/* Lista de Níveis */}
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
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedRole(role);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {role.description || "Sem descrição"}
              </p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleConfigurePermissions(role)}
              >
                Configurar Permissões
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog: Criar Nível */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Nível</DialogTitle>
            <DialogDescription>
              Defina as informações básicas do novo nível de permissão
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome (identificador único)</Label>
              <Input
                id="name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="ex: supervisor"
              />
            </div>
            <div>
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                value={newRole.displayName}
                onChange={(e) => setNewRole({ ...newRole, displayName: e.target.value })}
                placeholder="ex: Supervisor"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Descreva as responsabilidades deste nível"
              />
            </div>
            <div>
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                type="color"
                value={newRole.color}
                onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Nível */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nível</DialogTitle>
            <DialogDescription>
              Atualize as informações do nível de permissão
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-displayName">Nome de Exibição</Label>
                <Input
                  id="edit-displayName"
                  value={selectedRole.displayName}
                  onChange={(e) => setSelectedRole({ ...selectedRole, displayName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={selectedRole.description || ""}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-color">Cor</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={selectedRole.color}
                  onChange={(e) => setSelectedRole({ ...selectedRole, color: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Configurar Permissões */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Permissões - {selectedRole?.displayName}</DialogTitle>
            <DialogDescription>
              Clique nos ícones para alternar entre os estados de permissão
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            {MODULES.map(module => {
              const modulePermission = getPermission(module.key, null);
              const moduleConfig = PERMISSION_ICONS[modulePermission];
              const ModuleIcon = moduleConfig.icon;
              const hasSubmodules = module.submodules.length > 0;
              const isExpanded = expandedModules.has(module.key);
              const shouldShowSubmodules = hasSubmodules && modulePermission !== "none" && isExpanded;

              return (
                <div key={module.key} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {hasSubmodules && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleModuleExpansion(module.key)}
                          disabled={modulePermission === "none"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <span className="font-medium">{module.label}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${moduleConfig.bg} hover:${moduleConfig.bg}`}
                      onClick={() => cyclePermission(module.key, null)}
                    >
                      <ModuleIcon className={`h-5 w-5 ${moduleConfig.color}`} />
                    </Button>
                  </div>

                  {shouldShowSubmodules && (
                    <div className="mt-3 ml-8 space-y-2">
                      {module.submodules.map(sub => {
                        const subPermission = getPermission(module.key, sub.key);
                        const subConfig = PERMISSION_ICONS[subPermission];
                        const SubIcon = subConfig.icon;

                        return (
                          <div key={sub.key} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                            <span className="text-sm">{sub.label}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`${subConfig.bg} hover:${subConfig.bg}`}
                              onClick={() => cyclePermission(module.key, sub.key)}
                            >
                              <SubIcon className={`h-4 w-4 ${subConfig.color}`} />
                            </Button>
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
            <Button onClick={handleSavePermissions}>
              Salvar Permissões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
