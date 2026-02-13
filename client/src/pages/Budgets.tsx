import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Download, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CNPJInput } from "@/components/ui/cnpj-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "default",
  approved: "default",
  rejected: "destructive",
};

const unitOptions = [
  { value: "un", label: "Unidade" },
  { value: "caixa", label: "Caixa" },
  { value: "pacote", label: "Pacote" },
  { value: "kg", label: "Quilograma" },
  { value: "g", label: "Grama" },
  { value: "m", label: "Metro" },
  { value: "cm", label: "Centímetro" },
  { value: "l", label: "Litro" },
  { value: "ml", label: "Mililitro" },
  { value: "m2", label: "Metro Quadrado" },
  { value: "m3", label: "Metro Cúbico" },
];

export default function Budgets() {
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: 0,
    validUntil: "",
    observations: "",
  });
  const [clientFormData, setClientFormData] = useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [items, setItems] = useState<Array<{
    itemName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    brand: string;
    notes: string;
  }>>([{ itemName: "", quantity: 1, unit: "un", unitPrice: 0, brand: "", notes: "" }]);

  const { data: budgets, refetch: refetchBudgets } = trpc.budgets.list.useQuery();
  const { data: clients, refetch: refetchClients } = trpc.clients.list.useQuery();

  const createBudget = trpc.budgets.create.useMutation({
    onSuccess: () => {
      toast.success("Orçamento criado com sucesso!");
      refetchBudgets();
      setIsBudgetDialogOpen(false);
      resetBudgetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar orçamento: ${error.message}`);
    },
  });

  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente cadastrado com sucesso!");
      refetchClients();
      setIsClientDialogOpen(false);
      resetClientForm();
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar cliente: ${error.message}`);
    },
  });

  const generatePdf = trpc.budgets.generatePdf.useMutation({
    onSuccess: (data) => {
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF gerado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao gerar PDF: ${error.message}`);
    },
  });

  const resetBudgetForm = () => {
    setFormData({
      title: "",
      description: "",
      clientId: 0,
      validUntil: "",
      observations: "",
    });
    setItems([{ itemName: "", quantity: 1, unit: "un", unitPrice: 0, brand: "", notes: "" }]);
  };

  const resetClientForm = () => {
    setClientFormData({
      name: "",
      cnpj: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
  };

  const addItem = () => {
    setItems([...items, { itemName: "", quantity: 1, unit: "un", unitPrice: 0, brand: "", notes: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.clientId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (items.some(item => !item.itemName || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error("Todos os itens devem ter nome, quantidade e preço válidos");
      return;
    }

    createBudget.mutate({
      ...formData,
      items: items.map(item => ({
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        brand: item.brand,
        notes: item.notes,
      })),
    });
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientFormData.name) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }

    createClient.mutate(clientFormData);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie clientes e propostas comerciais</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Cliente</DialogTitle>
                <DialogDescription>Adicione um novo cliente ao sistema</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleClientSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Nome *</Label>
                  <Input
                    id="clientName"
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                    placeholder="Nome completo ou razão social"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientCnpj">CNPJ</Label>
                  <CNPJInput
                    id="clientCnpj"
                    value={clientFormData.cnpj}
                    onChange={(value) => setClientFormData({ ...clientFormData, cnpj: value })}
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">E-mail</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientFormData.email}
                    onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Telefone</Label>
                  <PhoneInput
                    id="clientPhone"
                    value={clientFormData.phone}
                    onChange={(value) => setClientFormData({ ...clientFormData, phone: value })}
                  />
                </div>
                <div>
                  <Label htmlFor="clientAddress">Endereço</Label>
                  <Textarea
                    id="clientAddress"
                    value={clientFormData.address}
                    onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                    rows={2}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsClientDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createClient.isPending}>
                    {createClient.isPending ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Orçamento</DialogTitle>
                <DialogDescription>
                  Selecione o cliente e preencha os itens da proposta
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBudgetSubmit} className="space-y-6">
                {/* Dados do Orçamento */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Dados do Orçamento</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="clientId">Cliente *</Label>
                      <Select value={formData.clientId.toString()} onValueChange={(value) => setFormData({ ...formData, clientId: parseInt(value) })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients?.map((client: any) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name} {client.cnpj ? `- ${client.cnpj}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Proposta de Fornecimento de Materiais"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descrição detalhada do orçamento"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="validUntil">Validade</Label>
                      <Input
                        id="validUntil"
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Itens do Orçamento */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Itens do Orçamento</h3>
                    <Button type="button" onClick={addItem} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                              <Label>Item *</Label>
                              <Input
                                value={item.itemName}
                                onChange={(e) => updateItem(index, "itemName", e.target.value)}
                                placeholder="Nome do item"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Qtd *</Label>
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Unidade</Label>
                              <Select value={item.unit} onValueChange={(value) => updateItem(index, "unit", value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {unitOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <Label>Preço Unit. *</Label>
                              <CurrencyInput
                                value={item.unitPrice}
                                onChange={(value) => updateItem(index, "unitPrice", value)}
                              />
                            </div>
                            <div className="col-span-2 flex items-end">
                              <div className="w-full">
                                <Label>Total</Label>
                                <Input
                                  value={`R$ ${(item.quantity * item.unitPrice).toFixed(2).replace('.', ',')}`}
                                  disabled
                                />
                              </div>
                              {items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(index)}
                                  className="ml-2"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-2xl font-bold">
                        R$ {calculateTotal().toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Condições de pagamento, prazo de entrega, garantias, etc."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsBudgetDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createBudget.isPending}>
                    {createBudget.isPending ? "Criando..." : "Criar Orçamento"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="budgets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets">
          <Card>
            <CardHeader>
              <CardTitle>Orçamentos Criados</CardTitle>
              <CardDescription>Gerencie e visualize todos os orçamentos</CardDescription>
            </CardHeader>
            <CardContent>
              {!budgets || budgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum orçamento criado</h3>
                  <p className="text-sm text-muted-foreground">Clique em "Novo Orçamento" para começar</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets.map((budget: any) => (
                      <TableRow key={budget.id}>
                        <TableCell className="font-mono">{budget.budgetNumber}</TableCell>
                        <TableCell className="font-medium">{budget.title}</TableCell>
                        <TableCell>{new Date(budget.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[budget.status]}>
                            {statusLabels[budget.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generatePdf.mutate({ id: budget.id })}
                            disabled={generatePdf.isPending}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Cadastrados</CardTitle>
              <CardDescription>Gerencie sua base de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              {!clients || clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum cliente cadastrado</h3>
                  <p className="text-sm text-muted-foreground">Clique em "Novo Cliente" para começar</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cadastrado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client: any) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell className="font-mono">{client.cnpj || '-'}</TableCell>
                        <TableCell>{client.email || '-'}</TableCell>
                        <TableCell>{client.phone || '-'}</TableCell>
                        <TableCell>{new Date(client.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
