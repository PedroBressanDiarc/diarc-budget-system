import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Items() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    secondaryName: "",
    defaultUnit: "un",
    ncm: "",
    ncmDefinition: "",
  });

  const { data: items, refetch } = trpc.items.list.useQuery();
  const createMutation = trpc.items.create.useMutation();
  const updateMutation = trpc.items.update.useMutation();
  const deleteMutation = trpc.items.delete.useMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Item criado com sucesso!");
      setIsCreateOpen(false);
      setFormData({ name: "", secondaryName: "", defaultUnit: "un", ncm: "", ncmDefinition: "" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar item");
    }
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      secondaryName: item.secondaryName || "",
      defaultUnit: item.defaultUnit,
      ncm: item.ncm || "",
      ncmDefinition: item.ncmDefinition || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({ id: editingItem.id, ...formData });
      toast.success("Item atualizado com sucesso!");
      setIsEditOpen(false);
      setEditingItem(null);
      setFormData({ name: "", secondaryName: "", defaultUnit: "un", ncm: "", ncmDefinition: "" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar item");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Item excluído com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir item");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Itens</CardTitle>
            <CardDescription>Cadastro de itens e materiais</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Novo Item</DialogTitle>
                  <DialogDescription>Cadastre um novo item ou material</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="secondaryName">Nome Secundário</Label>
                    <Input
                      id="secondaryName"
                      value={formData.secondaryName}
                      onChange={(e) => setFormData({ ...formData, secondaryName: e.target.value })}
                      placeholder="Nome alternativo para busca"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="defaultUnit">Unidade Padrão *</Label>
                    <Select
                      value={formData.defaultUnit}
                      onValueChange={(value) => setFormData({ ...formData, defaultUnit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="un">Unidade (un)</SelectItem>
                        <SelectItem value="caixa">Caixa</SelectItem>
                        <SelectItem value="pacote">Pacote</SelectItem>
                        <SelectItem value="kg">Quilograma (kg)</SelectItem>
                        <SelectItem value="g">Grama (g)</SelectItem>
                        <SelectItem value="m">Metro (m)</SelectItem>
                        <SelectItem value="cm">Centímetro (cm)</SelectItem>
                        <SelectItem value="L">Litro (L)</SelectItem>
                        <SelectItem value="mL">Mililitro (mL)</SelectItem>
                        <SelectItem value="m2">Metro Quadrado (m²)</SelectItem>
                        <SelectItem value="m3">Metro Cúbico (m³)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ncm">NCM</Label>
                    <Input
                      id="ncm"
                      value={formData.ncm}
                      onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                      placeholder="Nomenclatura Comum do Mercosul"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ncmDefinition">Definição do NCM</Label>
                    <Textarea
                      id="ncmDefinition"
                      value={formData.ncmDefinition}
                      onChange={(e) => setFormData({ ...formData, ncmDefinition: e.target.value })}
                      placeholder="Descrição do código NCM"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Criando..." : "Criar Item"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nome Secundário</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>NCM</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.secondaryName || "-"}</TableCell>
                  <TableCell>{item.defaultUnit}</TableCell>
                  <TableCell>{item.ncm || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!items || items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum item cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Editar Item</DialogTitle>
              <DialogDescription>Atualize as informações do item</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-secondaryName">Nome Secundário</Label>
                <Input
                  id="edit-secondaryName"
                  value={formData.secondaryName}
                  onChange={(e) => setFormData({ ...formData, secondaryName: e.target.value })}
                  placeholder="Nome alternativo para busca"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-defaultUnit">Unidade Padrão *</Label>
                <Select
                  value={formData.defaultUnit}
                  onValueChange={(value) => setFormData({ ...formData, defaultUnit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="pacote">Pacote</SelectItem>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="g">Grama (g)</SelectItem>
                    <SelectItem value="m">Metro (m)</SelectItem>
                    <SelectItem value="cm">Centímetro (cm)</SelectItem>
                    <SelectItem value="L">Litro (L)</SelectItem>
                    <SelectItem value="mL">Mililitro (mL)</SelectItem>
                    <SelectItem value="m2">Metro Quadrado (m²)</SelectItem>
                    <SelectItem value="m3">Metro Cúbico (m³)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-ncm">NCM</Label>
                <Input
                  id="edit-ncm"
                  value={formData.ncm}
                  onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                  placeholder="Nomenclatura Comum do Mercosul"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-ncmDefinition">Definição do NCM</Label>
                <Textarea
                  id="edit-ncmDefinition"
                  value={formData.ncmDefinition}
                  onChange={(e) => setFormData({ ...formData, ncmDefinition: e.target.value })}
                  placeholder="Descrição do código NCM"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
