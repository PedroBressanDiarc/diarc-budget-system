import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Estrutura de módulos e submódulos do sistema
const SYSTEM_MODULES = [
  { module: "dashboard", label: "Dashboard", submodules: [] },
  { module: "chat", label: "Chat", submodules: [] },
  { module: "orcamentos", label: "Orçamentos", submodules: [] },
  {
    module: "compras",
    label: "Compras",
    submodules: [
      { submodule: "manutencao", label: "Manutenção" },
      { submodule: "administrativo", label: "Administrativo" },
      { submodule: "fabrica", label: "Fábrica" },
      { submodule: "obras", label: "Obras" },
    ],
  },
  { module: "manutencoes", label: "Manutenções", submodules: [] },
  {
    module: "financeiro",
    label: "Financeiro",
    submodules: [
      { submodule: "recebimentos", label: "Recebimentos" },
      { submodule: "pagamentos", label: "Pagamentos" },
    ],
  },
  { module: "relatorios", label: "Relatórios", submodules: [] },
  {
    module: "banco_dados",
    label: "Banco de Dados",
    submodules: [
      { submodule: "fornecedores", label: "Fornecedores" },
      { submodule: "equipamentos", label: "Equipamentos" },
      { submodule: "itens", label: "Itens" },
      { submodule: "obras", label: "Obras" },
      { submodule: "locais", label: "Locais" },
    ],
  },
];

export default function PermissionsManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    color: "blue",
  });

  // Estado para permissões (módulo/submódulo -> permissão)
  const [permissions, setPermissions] = useState<Record<string, "total" | "readonly" | "none">>({});

  const { data: roles, refetch } = trpc.customRoles.list.useQuery();
  const { data: roleDetails, refetch: refetchDetails } = trpc.customRoles.getById.useQuery(
    { id: selectedRoleId! },
    { enabled: !!selectedRoleId && isEditOpen }
  );

  const createMutation = trpc.customRoles.create.useMutation({
    onSuccess: () => {
      toast.success("Nível de permissão criado!");
      setIsCreateOpen(false);
      setFormData({ name: "", displayName: "", description: "", color: "blue" });
      setPermissions({});
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar nível: " + error.message);
    },
  });

  const updateMutation = trpc.customRoles.update.useMutation({
    onSuccess: () => {
      toast.success("Nível atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });

  const updatePermissionsMutation = trpc.customRoles.updatePermissions.useMutation({
    onSuccess: () => {
      toast.success("Permissões atualizadas!");
      setIsEditOpen(false);
      setSelectedRoleId(null);
      setPermissions({});
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar permissões: " + error.message);
    },
  });

  const deleteMutation = trpc.customRoles.delete.useMutation({
    onSuccess: () => {
      toast.success("Nível deletado!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao deletar: " + error.message);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converter permissões para array
    const permissionsArray = Object.entries(permissions).map(([key, value]) => {
      const [module, submodule] = key.split(":");
      return {
        module,
        submodule: submodule || null,
        permission: value,
      };
    });

    createMutation.mutate({
      ...formData,
      permissions: permissionsArray,
    } as any);
  };

  const handleEdit = () => {
    if (!selectedRoleId) return;

    // Converter permissões para array
    const permissionsArray = Object.entries(permissions).map(([key, value]) => {
      const [module, submodule] = key.split(":");
      return {
        module,
        submodule: submodule || null,
        permission: value,
      };
    });

    // Atualizar informações básicas
    updateMutation.mutate({
      id: selectedRoleId,
      displayName: formData.displayName,
      description: formData.description,
      color: formData.color,
    });

    // Atualizar permissões
    updatePermissionsMutation.mutate({
      roleId: selectedRoleId,
      permissions: permissionsArray,
    });
  };

  const openEditDialog = (roleId: number) => {
    setSelectedRoleId(roleId);
    setIsEditOpen(true);

    // Carregar dados do role
    const role = roles?.find((r) => r.id === roleId);
    if (role) {
      setFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.description || "",
        color: role.color,
      });
    }
  };

  // Carregar permissões quando roleDetails mudar
  useState(() => {
    if (roleDetails && isEditOpen) {
      const permsMap: Record<string, "total" | "readonly" | "none"> = {};
      
      // Inicializar todos com "none"
      SYSTEM_MODULES.forEach((mod) => {
        if (mod.submodules.length === 0) {
          permsMap[mod.module] = "none";
        } else {
          mod.submodules.forEach((sub) => {
            permsMap[`${mod.module}:${sub.submodule}`] = "none";
          });
        }
      });

      // Aplicar permissões existentes
      roleDetails.permissions.forEach((perm: any) => {
        const key = perm.submodule ? `${perm.module}:${perm.submodule}` : perm.module;
        permsMap[key] = perm.permission;
      });

      setPermissions(permsMap);
    }
  });

  const getPermissionKey = (module: string, submodule?: string) => {
    return submodule ? `${module}:${submodule}` : module;
  };

  const setPermission = (module: string, submodule: string | undefined, value: "total" | "readonly" | "none") => {
    const key = getPermissionKey(module, submodule);
    setPermissions({ ...permissions, [key]: value });
  };

  const getPermission = (module: string, submodule?: string): "total" | "readonly" | "none" => {
    const key = getPermissionKey(module, submodule);
    return permissions[key] || "none";
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500 hover:bg-blue-600",
      green: "bg-green-500 hover:bg-green-600",
      orange: "bg-orange-500 hover:bg-orange-600",
      purple: "bg-purple-500 hover:bg-purple-600",
      yellow: "bg-yellow-500 hover:bg-yellow-600 text-gray-900",
      red: "bg-red-500 hover:bg-red-600",
      gray: "bg-gray-500 hover:bg-gray-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Níveis de Permissão</h1>
          <p className="text-muted-foreground">Gerencie níveis de acesso e permissões do sistema</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Nível
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Níveis Cadastrados</CardTitle>
          <CardDescription>Todos os níveis de permissão do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Badge className={getColorClass(role.color)}>{role.displayName}</Badge>
                  </TableCell>
                  <TableCell>{role.description || "-"}</TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge variant="outline">Sistema</Badge>
                    ) : (
                      <Badge variant="secondary">Customizado</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      title="Editar Permissões"
                      onClick={() => openEditDialog(role.id)}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button
                        size="sm"
                        variant="destructive"
                        title="Deletar Nível"
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja deletar o nível "${role.displayName}"?`)) {
                            deleteMutation.mutate({ id: role.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Criar Nível */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Criar Novo Nível de Permissão</DialogTitle>
              <DialogDescription>Defina nome, cor e permissões do novo nível</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Interno *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="ex: gerente_obra"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome de Exibição *</Label>
                  <Input
                    id="displayName"
                    required
                    placeholder="ex: Gerente de Obra"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição do nível de permissão"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="yellow">Amarelo</SelectItem>
                    <SelectItem value="red">Vermelho</SelectItem>
                    <SelectItem value="gray">Cinza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Permissões por Módulo</h3>
                <div className="space-y-3">
                  {SYSTEM_MODULES.map((mod) => (
                    <div key={mod.module} className="space-y-2">
                      {mod.submodules.length === 0 ? (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="font-medium">{mod.label}</span>
                          <Select
                            value={getPermission(mod.module)}
                            onValueChange={(value: any) => setPermission(mod.module, undefined, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              <SelectItem value="readonly">Somente Leitura</SelectItem>
                              <SelectItem value="total">Total</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="font-medium text-sm text-muted-foreground">{mod.label}</div>
                          {mod.submodules.map((sub) => (
                            <div key={sub.submodule} className="flex items-center justify-between p-3 bg-muted rounded-lg ml-4">
                              <span>{sub.label}</span>
                              <Select
                                value={getPermission(mod.module, sub.submodule)}
                                onValueChange={(value: any) => setPermission(mod.module, sub.submodule, value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nenhum</SelectItem>
                                  <SelectItem value="readonly">Somente Leitura</SelectItem>
                                  <SelectItem value="total">Total</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Nível"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Permissões */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Nível: {formData.displayName}</DialogTitle>
            <DialogDescription>Altere informações e permissões do nível</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editDisplayName">Nome de Exibição *</Label>
                <Input
                  id="editDisplayName"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editColor">Cor</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="yellow">Amarelo</SelectItem>
                    <SelectItem value="red">Vermelho</SelectItem>
                    <SelectItem value="gray">Cinza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Descrição</Label>
              <Input
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Permissões por Módulo</h3>
              <div className="space-y-3">
                {SYSTEM_MODULES.map((mod) => (
                  <div key={mod.module} className="space-y-2">
                    {mod.submodules.length === 0 ? (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">{mod.label}</span>
                        <Select
                          value={getPermission(mod.module)}
                          onValueChange={(value: any) => setPermission(mod.module, undefined, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            <SelectItem value="readonly">Somente Leitura</SelectItem>
                            <SelectItem value="total">Total</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="font-medium text-sm text-muted-foreground">{mod.label}</div>
                        {mod.submodules.map((sub) => (
                          <div key={sub.submodule} className="flex items-center justify-between p-3 bg-muted rounded-lg ml-4">
                            <span>{sub.label}</span>
                            <Select
                              value={getPermission(mod.module, sub.submodule)}
                              onValueChange={(value: any) => setPermission(mod.module, sub.submodule, value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhum</SelectItem>
                                <SelectItem value="readonly">Somente Leitura</SelectItem>
                                <SelectItem value="total">Total</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEdit} disabled={updateMutation.isPending || updatePermissionsMutation.isPending}>
              {updateMutation.isPending || updatePermissionsMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
