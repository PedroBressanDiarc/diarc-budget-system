import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Eye, Trash2, Edit, CheckSquare, Square } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

const statusLabels: Record<string, string> = {
  solicitacao: "Solicitação",
  cotacao_em_progresso: "Cotação em Progresso",
  cotacoes_em_analise: "Cotações em Análise",
  aguardando_autorizacao: "Aguardando Autorização",
  ordem_compra_enviada: "Ordem de Compra Enviada",
  aguardando_recebimento: "Aguardando Recebimento",
  recebido: "Recebido",
  cancelado: "Cancelado",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  solicitacao: "secondary",
  cotacao_em_progresso: "default",
  cotacoes_em_analise: "default",
  aguardando_autorizacao: "outline",
  ordem_compra_enviada: "default",
  aguardando_recebimento: "secondary",
  recebido: "default",
  cancelado: "destructive",
};

export default function PurchasesFactory() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [items, setItems] = useState<Array<{ name: string; quantity: string; unit: string; brand: string; notes: string; maxPrice?: string }>>([
    { name: "", quantity: "", unit: "un", brand: "", notes: "" }
  ]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    usageLocation: "",
  });

  const { data: requisitions, refetch } = trpc.requisitions.list.useQuery();

  const createMutation = trpc.requisitions.create.useMutation({
    onSuccess: () => {
      toast.success("Requisição criada com sucesso!");
      setIsCreateOpen(false);
      setFormData({ title: "", description: "", usageLocation: "" });
      setItems([{ name: "", quantity: "", unit: "un", brand: "", notes: "" }]);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar requisição: " + error.message);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(item => {
      const qty = Number(item.quantity);
      return item.name && item.quantity && !isNaN(qty) && qty > 0;
    });
    
    if (validItems.length === 0) {
      toast.error("Adicione pelo menos um item à requisição");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      usageLocation: formData.usageLocation || undefined,
      items: validItems.map(item => ({
        itemName: item.name,
        quantity: Number(item.quantity),
        unit: item.unit || undefined,
        brand: item.brand || undefined,
        notes: item.notes || undefined,
        maxPrice: item.maxPrice ? Number(item.maxPrice) : undefined,
      })),
    });
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: "", unit: "un", brand: "", notes: "", maxPrice: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const deleteMutation = trpc.requisitions.delete.useMutation({
    onSuccess: () => {
      toast.success("Requisições excluídas com sucesso!");
      setSelectedIds([]);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} requisição(s)?`)) {
      selectedIds.forEach(id => {
        deleteMutation.mutate({ id });
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compras - Fábrica</h1>
          <p className="text-muted-foreground">Gerencie requisições de compras para a fábrica</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <>
              <Badge variant="secondary" className="px-3 py-2">
                {selectedIds.length} selecionada(s)
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Selecionadas
              </Button>
            </>
          )}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Requisição
            </Button>
          </DialogTrigger>
          <DialogContent className="!max-w-none !w-[90vw] !h-[90vh] overflow-y-auto p-0">
            <form onSubmit={handleCreate} className="p-6 h-full flex flex-col">
              <DialogHeader>
                <DialogTitle>Nova Requisição de Compra</DialogTitle>
                <DialogDescription>
                  Preencha os dados da requisição e adicione os itens necessários
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Requisição *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageLocation">Local de Uso</Label>
                  <Select
                    value={formData.usageLocation}
                    onValueChange={(value) => setFormData({ ...formData, usageLocation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Obra: Comil">Obra: Comil</SelectItem>
                      <SelectItem value="Fabrica">Fábrica</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-base">Itens da Requisição</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium">Item {index + 1}</h4>
                            {items.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nome do Item *</Label>
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(index, "name", e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Quantidade *</Label>
                              <Input
                                type="number"
                                min="0.01"
                                step="any"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Unidade *</Label>
                              <Select
                                value={item.unit}
                                onValueChange={(value) => updateItem(index, "unit", value)}
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
                                  <SelectItem value="l">Litro (L)</SelectItem>
                                  <SelectItem value="ml">Mililitro (mL)</SelectItem>
                                  <SelectItem value="m2">Metro Quadrado (m²)</SelectItem>
                                  <SelectItem value="m3">Metro Cúbico (m³)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Marca/Modelo</Label>
                              <Input
                                value={item.brand}
                                onChange={(e) => updateItem(index, "brand", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2 col-span-2">
                              <Label>Observações</Label>
                              <Textarea
                                value={item.notes}
                                onChange={(e) => updateItem(index, "notes", e.target.value)}
                                rows={2}
                              />
                            </div>
                            {user?.role === "director" && (
                              <div className="space-y-2 col-span-2">
                                <Label className="flex items-center gap-2">
                                  Valor Máximo (R$)
                                  <span className="text-xs text-muted-foreground font-normal">
                                    (Opcional - Define limite de orçamento para este item)
                                  </span>
                                </Label>
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={item.maxPrice || ""}
                                  onChange={(e) => updateItem(index, "maxPrice", e.target.value)}
                                  placeholder="Ex: 1500.00"
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-auto pt-4 border-t">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Requisição"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requisições de Compra</CardTitle>
          <CardDescription>Lista de todas as requisições cadastradas</CardDescription>
        </CardHeader>
        <CardContent>
          {requisitions && requisitions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (selectedIds.length === requisitions.length) {
                          setSelectedIds([]);
                        } else {
                          setSelectedIds(requisitions.map((r: any) => r.id));
                        }
                      }}
                    >
                      {selectedIds.length === requisitions.length ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisitions.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (selectedIds.includes(req.id)) {
                            setSelectedIds(selectedIds.filter(id => id !== req.id));
                          } else {
                            setSelectedIds([...selectedIds, req.id]);
                          }
                        }}
                      >
                        {selectedIds.includes(req.id) ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{req.requisitionNumber}</TableCell>
                    <TableCell>{req.title}</TableCell>
                    <TableCell>{req.requestedBy}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[req.status] || "secondary"}>
                        {statusLabels[req.status] || req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(req.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/compras/${req.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma requisição cadastrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
