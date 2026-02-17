import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Trash2, Check, Eye, X } from "lucide-react";
import { toast } from "sonner";

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
      { key: "alertas_orcamento", label: "Alertas de Orçamento" },
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

const ACTIONS = [
  { key: "view", label: "Visualizar" },
  { key: "create", label: "Criar" },
  { key: "edit", label: "Editar" },
  { key: "delete", label: "Deletar" },
];

type PermissionLevel = "total" | "readonly" | "none";

interface PermissionState {
  module: string;
  submodule: string | null;
  action: string;
  permissionLevel: PermissionLevel;
}

// Componente de checkbox cíclico (✅ → 👁️ → ❌)
function CyclicCheckbox({ 
  value, 
  onChange 
}: { 
  value: PermissionLevel; 
  onChange: (newValue: PermissionLevel) => void;
}) {
  const handleClick = () => {
    const cycle: Record<PermissionLevel, PermissionLevel> = {
      none: "total",
      total: "readonly",
      readonly: "none",
    };
    onChange(cycle[value]);
  };

  const icons = {
    total: <Check className="h-4 w-4 text-green-600" />,
    readonly: <Eye className="h-4 w-4 text-blue-600" />,
    none: <X className="h-4 w-4 text-red-600" />,
  };

  const bgColors = {
    total: "bg-green-100 hover:bg-green-200 border-green-300",
    readonly: "bg-blue-100 hover:bg-blue-200 border-blue-300",
    none: "bg-red-100 hover:bg-red-200 border-red-300",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${bgColors[value]}`}
      title={value === "total" ? "Total" : value === "readonly" ? "Somente Leitura" : "Nenhum"}
    >
      {icons[value]}
    </button>
  );
}

export default function PermissionsManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDisplayName, setNewRoleDisplayName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [permissions, setPermissions] = useState<PermissionState[]>([]);

  const { data: roles, isLoading, refetch } = trpc.permissionRoles.list.useQuery();
  const createRole = trpc.permissionRoles.create.useMutation();
  const updatePermissions = trpc.permissionRoles.updatePermissions.useMutation();
  const deleteRole = trpc.permissionRoles.delete.useMutation();

  // Inicializar permissões com "none" para todos os módulos/submódulos/ações
  const initializePermissions = (existingPermissions: any[] = []) => {
    const allPermissions: PermissionState[] = [];
    
    MODULES.forEach(module => {
      if (module.submodules.length === 0) {
        // Módulo sem submódulos
        ACTIONS.forEach(action => {
          const existing = existingPermissions.find(
            p => p.module === module.key && !p.submodule && p.action === action.key
          );
          allPermissions.push({
            module: module.key,
            submodule: null,
            action: action.key,
            permissionLevel: existing?.permissionLevel || "none",
          });
        });
      } else {
        // Módulo com submódulos
        module.submodules.forEach(submodule => {
          ACTIONS.forEach(action => {
            const existing = existingPermissions.find(
              p => p.module === module.key && p.submodule === submodule.key && p.action === action.key
            );
            allPermissions.push({
              module: module.key,
              submodule: submodule.key,
              action: action.key,
              permissionLevel: existing?.permissionLevel || "none",
            });
          });
        });
      }
    });
    
    setPermissions(allPermissions);
  };

  const handleCreateRole = async () => {
    if (!newRoleName || !newRoleDisplayName) {
      toast.error("Preencha nome e nome de exibição");
      return;
    }

    try {
      await createRole.mutateAsync({
        name: newRoleName.toLowerCase().replace(/\s+/g, "_"),
        displayName: newRoleDisplayName,
        description: newRoleDescription,
        color: "blue",
        permissions: permissions.filter(p => p.permissionLevel !== "none"),
      });
      toast.success("Nível criado com sucesso!");
      setCreateDialogOpen(false);
      setNewRoleName("");
      setNewRoleDisplayName("");
      setNewRoleDescription("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar nível");
    }
  };

  const handleEditRole = async (role: any) => {
    setSelectedRole(role);
    // Buscar permissões do nível
    const roleData = await trpc.permissionRoles.getById.query({ id: role.id });
    initializePermissions(roleData.permissions);
    setEditDialogOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      await updatePermissions.mutateAsync({
        roleId: selectedRole.id,
        permissions: permissions.filter(p => p.permissionLevel !== "none"),
      });
      toast.success("Permissões atualizadas com sucesso!");
      setEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar permissões");
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm("Tem certeza que deseja deletar este nível?")) return;

    try {
      await deleteRole.mutateAsync({ id: roleId });
      toast.success("Nível deletado com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar nível");
    }
  };

  const updatePermission = (module: string, submodule: string | null, action: string, newLevel: PermissionLevel) => {
    setPermissions(prev =>
      prev.map(p =>
        p.module === module && p.submodule === submodule && p.action === action
          ? { ...p, permissionLevel: newLevel }
          : p
      )
    );
  };

  const getPermissionLevel = (module: string, submodule: string | null, action: string): PermissionLevel => {
    const perm = permissions.find(
      p => p.module === module && p.submodule === submodule && p.action === action
    );
    return perm?.permissionLevel || "none";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Permissões</h1>
          <p className="text-muted-foreground">Crie e edite níveis de acesso customizados</p>
        </div>
        <Button onClick={() => {
          initializePermissions();
          setCreateDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Novo Nível
        </Button>
      </div>

      <div className="grid gap-4">
        {roles?.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{role.displayName}</CardTitle>
                  <CardDescription>{role.description || "Sem descrição"}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Permissões
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteRole(role.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Dialog: Criar Novo Nível */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Nível de Permissão</DialogTitle>
            <DialogDescription>
              Configure as permissões para o novo nível. Clique nos ícones para alternar entre Total (✓), Somente Leitura (👁️) e Nenhum (✗).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Único (identificador)</Label>
              <Input
                id="name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="ex: supervisor_obra"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                value={newRoleDisplayName}
                onChange={(e) => setNewRoleDisplayName(e.target.value)}
                placeholder="ex: Supervisor de Obra"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Descreva as responsabilidades deste nível"
              />
            </div>

            {/* Tabela de Permissões */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold">Módulo / Submódulo</th>
                    {ACTIONS.map(action => (
                      <th key={action.key} className="text-center p-3 font-semibold w-24">
                        {action.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map(module => (
                    <>
                      {module.submodules.length === 0 ? (
                        <tr key={module.key} className="border-t">
                          <td className="p-3 font-medium">{module.label}</td>
                          {ACTIONS.map(action => (
                            <td key={action.key} className="text-center p-3">
                              <div className="flex justify-center">
                                <CyclicCheckbox
                                  value={getPermissionLevel(module.key, null, action.key)}
                                  onChange={(newLevel) => updatePermission(module.key, null, action.key, newLevel)}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ) : (
                        <>
                          <tr key={module.key} className="border-t bg-muted/50">
                            <td colSpan={5} className="p-3 font-bold">{module.label}</td>
                          </tr>
                          {module.submodules.map(submodule => (
                            <tr key={`${module.key}-${submodule.key}`} className="border-t">
                              <td className="p-3 pl-8 font-medium">↳ {submodule.label}</td>
                              {ACTIONS.map(action => (
                                <td key={action.key} className="text-center p-3">
                                  <div className="flex justify-center">
                                    <CyclicCheckbox
                                      value={getPermissionLevel(module.key, submodule.key, action.key)}
                                      onChange={(newLevel) => updatePermission(module.key, submodule.key, action.key, newLevel)}
                                    />
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRole} disabled={createRole.isPending}>
              {createRole.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Nível
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Permissões */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Permissões: {selectedRole?.displayName}</DialogTitle>
            <DialogDescription>
              Clique nos ícones para alternar entre Total (✓), Somente Leitura (👁️) e Nenhum (✗).
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-semibold">Módulo / Submódulo</th>
                  {ACTIONS.map(action => (
                    <th key={action.key} className="text-center p-3 font-semibold w-24">
                      {action.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map(module => (
                  <>
                    {module.submodules.length === 0 ? (
                      <tr key={module.key} className="border-t">
                        <td className="p-3 font-medium">{module.label}</td>
                        {ACTIONS.map(action => (
                          <td key={action.key} className="text-center p-3">
                            <div className="flex justify-center">
                              <CyclicCheckbox
                                value={getPermissionLevel(module.key, null, action.key)}
                                onChange={(newLevel) => updatePermission(module.key, null, action.key, newLevel)}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ) : (
                      <>
                        <tr key={module.key} className="border-t bg-muted/50">
                          <td colSpan={5} className="p-3 font-bold">{module.label}</td>
                        </tr>
                        {module.submodules.map(submodule => (
                          <tr key={`${module.key}-${submodule.key}`} className="border-t">
                            <td className="p-3 pl-8 font-medium">↳ {submodule.label}</td>
                            {ACTIONS.map(action => (
                              <td key={action.key} className="text-center p-3">
                                <div className="flex justify-center">
                                  <CyclicCheckbox
                                    value={getPermissionLevel(module.key, submodule.key, action.key)}
                                    onChange={(newLevel) => updatePermission(module.key, submodule.key, action.key, newLevel)}
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePermissions} disabled={updatePermissions.isPending}>
              {updatePermissions.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Permissões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
