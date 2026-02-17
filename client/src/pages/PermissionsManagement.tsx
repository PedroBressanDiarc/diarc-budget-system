import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Pencil, Trash2, Check, Eye, X, Info } from "lucide-react";
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

// Componente de checkbox cíclico melhorado
function CyclicCheckbox({ 
  value, 
  onChange 
}: { 
  value: PermissionLevel; 
  onChange: (newValue: PermissionLevel) => void;
}) {
  const cycle = () => {
    const next: Record<PermissionLevel, PermissionLevel> = {
      none: "total",
      total: "readonly",
      readonly: "none",
    };
    onChange(next[value]);
  };

  const icons = {
    total: <Check className="h-4 w-4 text-green-600" />,
    readonly: <Eye className="h-4 w-4 text-blue-600" />,
    none: <X className="h-4 w-4 text-gray-400" />,
  };

  const colors = {
    total: "bg-green-50 hover:bg-green-100 border-green-300",
    readonly: "bg-blue-50 hover:bg-blue-100 border-blue-300",
    none: "bg-gray-50 hover:bg-gray-100 border-gray-300",
  };

  return (
    <button
      onClick={cycle}
      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${colors[value]}`}
      title={value === "total" ? "Acesso Total" : value === "readonly" ? "Somente Leitura" : "Sem Acesso"}
    >
      {icons[value]}
    </button>
  );
}

export default function PermissionsManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    color: "blue",
  });

  const { data: roles, isLoading, refetch } = trpc.permissionRoles.list.useQuery();
  const createMutation = trpc.permissionRoles.create.useMutation();
  const updateMutation = trpc.permissionRoles.update.useMutation();
  const deleteMutation = trpc.permissionRoles.delete.useMutation();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Nível de permissão criado com sucesso!");
      setIsCreateDialogOpen(false);
      setFormData({ name: "", displayName: "", description: "", color: "blue" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar nível de permissão");
    }
  };

  const handleUpdate = async () => {
    if (!selectedRole) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedRole.id,
        ...formData,
      });
      toast.success("Nível de permissão atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar nível de permissão");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este nível de permissão?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Nível de permissão deletado com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar nível de permissão");
    }
  };

  const openEditDialog = (role: any) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || "",
      color: role.color,
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Permissões</h1>
          <p className="text-muted-foreground mt-2">
            Configure os níveis de acesso e permissões para cada cargo do sistema
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Novo Nível
        </Button>
      </div>

      {/* Legenda */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center gap-6 ml-2">
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <strong>Total:</strong> Acesso completo (visualizar, criar, editar, deletar)
          </span>
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <strong>Leitura:</strong> Apenas visualizar (sem criar/editar/deletar)
          </span>
          <span className="flex items-center gap-2">
            <X className="h-4 w-4 text-gray-400" />
            <strong>Nenhum:</strong> Sem acesso (módulo oculto)
          </span>
        </AlertDescription>
      </Alert>

      {/* Lista de Níveis */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles?.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${role.color}-500`} />
                  <CardTitle>{role.displayName}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(role)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(role.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // TODO: Abrir dialog de edição de permissões detalhadas
                  toast.info("Funcionalidade de edição de permissões em desenvolvimento");
                }}
              >
                Configurar Permissões
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Criação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Nível de Permissão</DialogTitle>
            <DialogDescription>
              Defina um novo cargo/nível de acesso para o sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Interno (slug)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: supervisor"
                />
              </div>
              <div>
                <Label htmlFor="displayName">Nome de Exibição</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="ex: Supervisor"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva as responsabilidades deste cargo..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="color">Cor</Label>
              <select
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="blue">Azul</option>
                <option value="green">Verde</option>
                <option value="orange">Laranja</option>
                <option value="purple">Roxo</option>
                <option value="yellow">Amarelo</option>
                <option value="red">Vermelho</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Nível
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Nível de Permissão</DialogTitle>
            <DialogDescription>
              Atualize as informações do cargo/nível de acesso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nome Interno (slug)</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: supervisor"
                />
              </div>
              <div>
                <Label htmlFor="edit-displayName">Nome de Exibição</Label>
                <Input
                  id="edit-displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="ex: Supervisor"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva as responsabilidades deste cargo..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-color">Cor</Label>
              <select
                id="edit-color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="blue">Azul</option>
                <option value="green">Verde</option>
                <option value="orange">Laranja</option>
                <option value="purple">Roxo</option>
                <option value="yellow">Amarelo</option>
                <option value="red">Vermelho</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
