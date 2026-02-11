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
import { Plus, Pencil, Trash2, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FinishedPieces() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    secondaryName: "",
    defaultUnit: "un",
    ncm: "",
    ncmDefinition: "",
    quantity: 0,
    unitPrice: 0,
    category: "",
    brand: "",
    location: "",
    minStock: 0,
    maxStock: 0,
    notes: "",
  });

  const { data: items, refetch } = trpc.items.list.useQuery();
  const createMutation = trpc.items.create.useMutation();
  const updateMutation = trpc.items.update.useMutation();
  const deleteMutation = trpc.items.delete.useMutation();

  const resetForm = () => {
    setFormData({
      name: "",
      secondaryName: "",
      defaultUnit: "un",
      ncm: "",
      ncmDefinition: "",
      quantity: 0,
      unitPrice: 0,
      category: "",
      brand: "",
      location: "",
      minStock: 0,
      maxStock: 0,
      notes: "",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Item criado com sucesso!");
      setIsCreateOpen(false);
      resetForm();
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
      quantity: parseFloat(item.quantity || 0),
      unitPrice: parseFloat(item.unitPrice || 0),
      category: item.category || "",
      brand: item.brand || "",
      location: item.location || "",
      minStock: parseFloat(item.minStock || 0),
      maxStock: parseFloat(item.maxStock || 0),
      notes: item.notes || "",
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
      resetForm();
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

  const getStockStatus = (item: any) => {
    const qty = parseFloat(item.quantity || "0");
    const min = parseFloat(item.minStock || "0");
    
    if (qty === 0) return { label: "Sem estoque", variant: "destructive" as const };
    if (min > 0 && qty <= min) return { label: "Estoque baixo", variant: "secondary" as const };
    return { label: "Em estoque", variant: "default" as const };
  };

  const calculateTotalValue = (item: any) => {
    const qty = parseFloat(item.quantity || 0);
    const price = parseFloat(item.unitPrice || 0);
    return (qty * price).toFixed(2);
  };

  const totalInventoryValue = items?.reduce((sum, item) => {
    const qty = parseFloat(item.quantity || "0");
    const price = parseFloat(item.unitPrice || "0");
    return sum + (qty * price);
  }, 0) || 0;

  const lowStockItems = items?.filter(item => {
    const qty = parseFloat(item.quantity || "0");
    const min = parseFloat(item.minStock || "0");
    return min > 0 && qty <= min && qty > 0;
  }) || [];

  const outOfStockItems = items?.filter(item => parseFloat(item.quantity || "0") === 0) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Peças Finalizadas</h1>
          <p className="text-muted-foreground">Controle de peças de concreto prontas para entrega</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Peça
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Criar Nova Peça</DialogTitle>
                <DialogDescription>Adicione uma nova peça finalizada</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="stock">Estoque</TabsTrigger>
                    <TabsTrigger value="additional">Adicionais</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome do Item *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Abraçadeira pesada 1/2&quot;"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="secondaryName">Nome Secundário</Label>
                      <Input
                        id="secondaryName"
                        value={formData.secondaryName}
                        onChange={(e) => setFormData({ ...formData, secondaryName: e.target.value })}
                        placeholder="Nome alternativo ou descrição"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="Ex: Abrasivos, EPI, Metalúrgica"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="defaultUnit">Unidade de Medida *</Label>
                        <Select value={formData.defaultUnit} onValueChange={(value) => setFormData({ ...formData, defaultUnit: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="un">UN - Unidade</SelectItem>
                            <SelectItem value="kg">KG - Quilograma</SelectItem>
                            <SelectItem value="m">M - Metro</SelectItem>
                            <SelectItem value="m2">M² - Metro Quadrado</SelectItem>
                            <SelectItem value="m3">M³ - Metro Cúbico</SelectItem>
                            <SelectItem value="l">L - Litro</SelectItem>
                            <SelectItem value="cx">CX - Caixa</SelectItem>
                            <SelectItem value="pc">PC - Peça</SelectItem>
                            <SelectItem value="rl">RL - Rolo</SelectItem>
                            <SelectItem value="gl">GL - Galão</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="stock" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantidade em Estoque</Label>
                        <Input
                          id="quantity"
                          type="number"
                          step="0.01"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="unitPrice">Preço Unitário (R$)</Label>
                        <Input
                          id="unitPrice"
                          type="number"
                          step="0.01"
                          value={formData.unitPrice}
                          onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="minStock">Estoque Mínimo</Label>
                        <Input
                          id="minStock"
                          type="number"
                          step="0.01"
                          value={formData.minStock}
                          onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="maxStock">Estoque Máximo</Label>
                        <Input
                          id="maxStock"
                          type="number"
                          step="0.01"
                          value={formData.maxStock}
                          onChange={(e) => setFormData({ ...formData, maxStock: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ex: Almoxarifado A - Prateleira 3"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="additional" className="space-y-4 mt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="brand">Marca</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="ncm">NCM</Label>
                        <Input
                          id="ncm"
                          value={formData.ncm}
                          onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                          placeholder="Código NCM"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="ncmDefinition">Definição NCM</Label>
                        <Input
                          id="ncmDefinition"
                          value={formData.ncmDefinition}
                          onChange={(e) => setFormData({ ...formData, ncmDefinition: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
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
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalInventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{items?.length || 0} itens cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Itens abaixo do mínimo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Itens zerados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Itens */}
      <Card>
        <CardHeader>
          <CardTitle>Peças Finalizadas</CardTitle>
          <CardDescription>Lista completa de todas as peças prontas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{item.name}</div>
                          {item.secondaryName && (
                            <div className="text-xs text-muted-foreground">{item.secondaryName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.category || "-"}</TableCell>
                      <TableCell>{item.defaultUnit?.toUpperCase()}</TableCell>
                      <TableCell className="text-right">
                        {parseFloat(item.quantity || "0").toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.unitPrice ? `R$ ${parseFloat(item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {calculateTotalValue(item)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!items || items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhum item cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Editar Item</DialogTitle>
              <DialogDescription>Atualize as informações do item</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="stock">Estoque</TabsTrigger>
                  <TabsTrigger value="additional">Adicionais</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Nome do Item *</Label>
                    <Input
                      id="edit-name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-secondaryName">Nome Secundário</Label>
                    <Input
                      id="edit-secondaryName"
                      value={formData.secondaryName}
                      onChange={(e) => setFormData({ ...formData, secondaryName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-category">Categoria</Label>
                      <Input
                        id="edit-category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-defaultUnit">Unidade de Medida *</Label>
                      <Select value={formData.defaultUnit} onValueChange={(value) => setFormData({ ...formData, defaultUnit: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="un">UN - Unidade</SelectItem>
                          <SelectItem value="kg">KG - Quilograma</SelectItem>
                          <SelectItem value="m">M - Metro</SelectItem>
                          <SelectItem value="m2">M² - Metro Quadrado</SelectItem>
                          <SelectItem value="m3">M³ - Metro Cúbico</SelectItem>
                          <SelectItem value="l">L - Litro</SelectItem>
                          <SelectItem value="cx">CX - Caixa</SelectItem>
                          <SelectItem value="pc">PC - Peça</SelectItem>
                          <SelectItem value="rl">RL - Rolo</SelectItem>
                          <SelectItem value="gl">GL - Galão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="stock" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-quantity">Quantidade em Estoque</Label>
                      <Input
                        id="edit-quantity"
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-unitPrice">Preço Unitário (R$)</Label>
                      <Input
                        id="edit-unitPrice"
                        type="number"
                        step="0.01"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-minStock">Estoque Mínimo</Label>
                      <Input
                        id="edit-minStock"
                        type="number"
                        step="0.01"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-maxStock">Estoque Máximo</Label>
                      <Input
                        id="edit-maxStock"
                        type="number"
                        step="0.01"
                        value={formData.maxStock}
                        onChange={(e) => setFormData({ ...formData, maxStock: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-location">Localização</Label>
                    <Input
                      id="edit-location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-brand">Marca</Label>
                    <Input
                      id="edit-brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-ncm">NCM</Label>
                      <Input
                        id="edit-ncm"
                        value={formData.ncm}
                        onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-ncmDefinition">Definição NCM</Label>
                      <Input
                        id="edit-ncmDefinition"
                        value={formData.ncmDefinition}
                        onChange={(e) => setFormData({ ...formData, ncmDefinition: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-notes">Observações</Label>
                    <Textarea
                      id="edit-notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>
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
