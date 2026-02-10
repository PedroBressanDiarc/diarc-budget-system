import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText, Upload, Plus, X, Edit, Trash2, MoreVertical, ChevronDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";

const statusLabels: Record<string, string> = {
  solicitacao: "Solicita\u00e7\u00e3o",
  cotacao_em_progresso: "Cota\u00e7\u00e3o em Progresso",
  cotacoes_em_analise: "Cota\u00e7\u00f5es em An\u00e1lise",
  aguardando_autorizacao: "Aguardando Autoriza\u00e7\u00e3o",
  ordem_compra_enviada: "Ordem de Compra Enviada",
  aguardando_recebimento: "Aguardando Recebimento",
  recebido: "Recebido",
  cancelado: "Cancelado",
};

const unitLabels: Record<string, string> = {
  un: "Unidade",
  caixa: "Caixa",
  pacote: "Pacote",
  kg: "Quilograma",
  g: "Grama",
  m: "Metro",
  cm: "Cent\u00edmetro",
  l: "Litro",
  ml: "Mililitro",
  m2: "Metro Quadrado",
  m3: "Metro C\u00fabico",
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

export default function RequisitionDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [isEditQuoteDialogOpen, setIsEditQuoteDialogOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [quoteFormData, setQuoteFormData] = useState({
    quoteNumber: "",
    deliveryTime: "",
    paymentTerms: "",
    notes: "",
  });
  const [quoteItems, setQuoteItems] = useState<Array<{
    requisitionItemId: number;
    unitPrice: string;
    quantity: number;
    brand: string;
    notes: string;
  }>>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFileType, setUploadFileType] = useState<"cotacao" | "ordem_compra" | "adicional">("cotacao");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: "", description: "" });
  const [editItems, setEditItems] = useState<Array<{
    id?: number;
    name: string;
    quantity: string;
    unit: string;
    brand: string;
    notes: string;
  }>>([]);

  const updateRequisitionMutation = trpc.requisitions.update.useMutation({
    onSuccess: () => {
      toast.success("Requisição atualizada com sucesso!");
      setIsEditDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const updateStatusMutation = trpc.requisitions.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      setIsStatusDialogOpen(false);
      setSelectedStatus(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  const deleteRequisitionMutation = trpc.requisitions.delete.useMutation({
    onSuccess: () => {
      toast.success("Requisição excluída com sucesso!");
      setLocation("/compras");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });
  
  const { data, isLoading, refetch } = trpc.requisitions.getById.useQuery({ 
    id: Number(id) 
  });

  const requisition = data?.requisition;
  const items = data?.items || [];

  const { data: suppliers } = trpc.suppliers.list.useQuery();
  const { data: quotes, refetch: refetchQuotes } = trpc.quotes.listByRequisition.useQuery(
    { requisitionId: Number(id) },
    { enabled: !!id }
  );
  const { data: attachments, refetch: refetchAttachments } = trpc.attachments.list.useQuery(
    { requisitionId: Number(id) },
    { enabled: !!id }
  );

  const uploadMutation = trpc.attachments.upload.useMutation({
    onSuccess: () => {
      toast.success("Arquivo enviado com sucesso!");
      setIsUploadDialogOpen(false);
      refetchAttachments();
    },
    onError: (error) => {
      toast.error("Erro ao enviar arquivo: " + error.message);
    },
  });

  const deleteAttachmentMutation = trpc.attachments.delete.useMutation({
    onSuccess: () => {
      toast.success("Arquivo removido com sucesso!");
      refetchAttachments();
    },
    onError: (error) => {
      toast.error("Erro ao remover arquivo: " + error.message);
    },
  });

  const createQuoteMutation = trpc.quotes.create.useMutation({
    onSuccess: () => {
      toast.success("Cotação adicionada com sucesso!");
      setIsQuoteDialogOpen(false);
      resetQuoteForm();
      refetchQuotes();
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar cotação: ${error.message}`);
    },
  });

  const deleteQuoteMutation = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      toast.success("Cotação excluída com sucesso!");
      refetchQuotes();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir cotação: ${error.message}`);
    },
  });

  const updateQuoteMutation = trpc.quotes.update.useMutation({
    onSuccess: () => {
      toast.success("Cotação atualizada com sucesso!");
      setIsEditQuoteDialogOpen(false);
      resetQuoteForm();
      refetchQuotes();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar cotação: ${error.message}`);
    },
  });

  const resetQuoteForm = () => {
    setSelectedSupplierId("");
    setQuoteFormData({
      quoteNumber: "",
      deliveryTime: "",
      paymentTerms: "",
      notes: "",
    });
    setQuoteItems([]);
  };

  const handleOpenQuoteDialog = () => {
    const initialQuoteItems = items.map((item: any) => ({
      requisitionItemId: item.id,
      unitPrice: "",
      quantity: item.quantity,
      brand: "",
      notes: "",
    }));
    setQuoteItems(initialQuoteItems);
    setIsQuoteDialogOpen(true);
  };

  const handleOpenEditQuote = (quote: any) => {
    setEditingQuoteId(quote.id);
    setSelectedSupplierId(quote.supplierId.toString());
    setQuoteFormData({
      quoteNumber: quote.quoteNumber || "",
      deliveryTime: quote.deliveryTime?.toString() || "",
      paymentTerms: quote.paymentTerms || "",
      notes: quote.notes || "",
    });
    
    const editQuoteItems = items.map((item: any) => {
      const existingItem = quote.items?.find((qi: any) => qi.requisitionItemId === item.id);
      return {
        requisitionItemId: item.id,
        unitPrice: existingItem?.unitPrice || "",
        quantity: item.quantity,
        brand: existingItem?.brand || "",
        notes: existingItem?.notes || "",
      };
    });
    setQuoteItems(editQuoteItems);
    setIsEditQuoteDialogOpen(true);
  };

  const handleUpdateQuote = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplierId || !editingQuoteId) {
      toast.error("Dados inválidos");
      return;
    }

    const validItems = quoteItems.filter(item => {
      const price = Number(item.unitPrice);
      return item.unitPrice && !isNaN(price) && price > 0;
    });

    if (validItems.length === 0) {
      toast.error("Adicione preços para pelo menos um item");
      return;
    }

    updateQuoteMutation.mutate({
      id: editingQuoteId,
      supplierId: Number(selectedSupplierId),
      quoteNumber: quoteFormData.quoteNumber || undefined,
      deliveryTime: quoteFormData.deliveryTime ? Number(quoteFormData.deliveryTime) : undefined,
      paymentTerms: quoteFormData.paymentTerms || undefined,
      notes: quoteFormData.notes || undefined,
      items: validItems.map((quoteItem) => ({
        requisitionItemId: quoteItem.requisitionItemId,
        unitPrice: Number(quoteItem.unitPrice),
        quantity: Number(quoteItem.quantity),
        brand: quoteItem.brand || undefined,
        notes: quoteItem.notes || undefined,
      })),
    });
  };

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplierId) {
      toast.error("Selecione um fornecedor");
      return;
    }

    const validItems = quoteItems.filter(item => {
      const price = Number(item.unitPrice);
      return item.unitPrice && !isNaN(price) && price > 0;
    });

    if (validItems.length === 0) {
      toast.error("Adicione preços para pelo menos um item");
      return;
    }

    const correspondingReqItems = items.filter((item: any) =>
      validItems.some(qi => qi.requisitionItemId === item.id)
    );

    createQuoteMutation.mutate({
      requisitionId: Number(id),
      supplierId: Number(selectedSupplierId),
      quoteNumber: quoteFormData.quoteNumber || undefined,
      deliveryTime: quoteFormData.deliveryTime ? Number(quoteFormData.deliveryTime) : undefined,
      paymentTerms: quoteFormData.paymentTerms || undefined,
      notes: quoteFormData.notes || undefined,
      items: validItems.map((quoteItem, index) => ({
        requisitionItemId: quoteItem.requisitionItemId,
        unitPrice: Number(quoteItem.unitPrice),
        quantity: Number(correspondingReqItems.find((ri: any) => ri.id === quoteItem.requisitionItemId)?.quantity || 1),
        brand: quoteItem.brand || undefined,
        notes: quoteItem.notes || undefined,
      })),
    });
  };

  const updateQuoteItem = (index: number, field: string, value: string) => {
    const newItems = [...quoteItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setQuoteItems(newItems);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append("file", file);

      // Upload para S3 usando o helper do servidor
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Falha no upload");
      }

      const { url } = await response.json();

      // Salvar metadados no banco
      await uploadMutation.mutateAsync({
        requisitionId: Number(id),
        fileType: uploadFileType,
        fileName: file.name,
        fileUrl: url,
        fileSize: file.size,
        mimeType: file.type,
      });
    } catch (error) {
      toast.error("Erro ao fazer upload do arquivo");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando requisição...</p>
        </div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Requisição não encontrada</p>
          <Button onClick={() => setLocation("/compras")} className="mt-4">
            Voltar para Compras
          </Button>
        </div>
      </div>
    );
  }

  const canAddQuotes = user?.role === "buyer" || user?.role === "director";
  const canApprove = user?.role === "director";
  const isStorekeeper = user?.role === "storekeeper";

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/compras")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{requisition.title}</h1>
            <p className="text-muted-foreground">
              {requisition.requisitionNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusColors[requisition.status]}>
            {statusLabels[requisition.status]}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditFormData({
                title: requisition.title,
                description: requisition.description || "",
              });
              setEditItems(items.map(item => ({
                id: item.id,
                name: item.itemName,
                quantity: item.quantity,
                unit: item.unit || "un",
                brand: item.brand || "",
                notes: item.notes || "",
              })));
              setIsEditDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Tem certeza que deseja excluir esta requisição?")) {
                deleteRequisitionMutation.mutate({ id: requisition.id });
              }
            }}
            disabled={deleteRequisitionMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Timeline do Fluxo de Compras */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo da Requisição</CardTitle>
          <CardDescription>Acompanhe o progresso da requisição de compra</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Linha de progresso */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div className="relative flex justify-between">
              {[
                { key: "solicitacao", label: "Solicitação", icon: "📋" },
                { key: "cotacao_em_progresso", label: "Cotação", icon: "💰" },
                { key: "cotacoes_em_analise", label: "Análise", icon: "🔍" },
                { key: "aguardando_autorizacao", label: "Autorização", icon: "✅" },
                { key: "ordem_compra_enviada", label: "Ordem Enviada", icon: "📤" },
                { key: "aguardando_recebimento", label: "Aguardando", icon: "🚚" },
                { key: "recebido", label: "Recebido", icon: "✔️" },
              ].map((step) => {
                const statusOrder = [
                  "solicitacao",
                  "cotacao_em_progresso",
                  "cotacoes_em_analise",
                  "aguardando_autorizacao",
                  "ordem_compra_enviada",
                  "aguardando_recebimento",
                  "recebido",
                  "cancelado"
                ];
                const currentIndex = statusOrder.indexOf(requisition.status);
                const stepIndex = statusOrder.indexOf(step.key);
                const isActive = stepIndex === currentIndex;
                const isCompleted = stepIndex < currentIndex;
                const isCanceled = requisition.status === "cancelado";

                return (
                  <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                    <button
                      onClick={() => {
                        setSelectedStatus(step.key);
                        setIsStatusDialogOpen(true);
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 cursor-pointer transition-all hover:scale-110 ${
                        isCanceled
                          ? "bg-destructive/20 text-destructive"
                          : isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isActive
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {step.icon}
                    </button>
                    <p className={`text-xs mt-2 text-center ${
                      isActive ? "font-semibold" : "text-muted-foreground"
                    }`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
            {requisition.status === "cancelado" && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                <p className="text-sm font-medium text-destructive">❌ Requisição Cancelada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Mudança de Status */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Mudança de Status</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja alterar o status desta requisição para <strong>{selectedStatus && statusLabels[selectedStatus]}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsStatusDialogOpen(false);
                setSelectedStatus(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedStatus) {
                  updateStatusMutation.mutate({
                    id: requisition.id,
                    status: selectedStatus as any,
                  });
                }
              }}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Atualizando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="!max-w-none !w-[90vw] !h-[90vh] overflow-y-auto p-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateRequisitionMutation.mutate({
                id: requisition.id,
                title: editFormData.title,
                description: editFormData.description,
                items: editItems.map(item => ({
                  id: item.id,
                  itemName: item.name,
                  quantity: parseFloat(item.quantity),
                  unit: item.unit,
                  brand: item.brand,
                  notes: item.notes,
                })),
              });
            }}
            className="p-6 h-full flex flex-col"
          >
            <DialogHeader>
              <DialogTitle>Editar Requisição de Compra</DialogTitle>
              <DialogDescription>
                Atualize as informações da requisição e seus itens
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-6 py-4">
              {/* Título e Descrição */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Título da Requisição *</Label>
                  <Input
                    id="edit-title"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              {/* Itens */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Itens da Requisição</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setEditItems([...editItems, { name: "", quantity: "", unit: "un", brand: "", notes: "" }])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                {editItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <Label>Nome do Item *</Label>
                            <Input
                              value={item.name}
                              onChange={(e) => {
                                const newItems = [...editItems];
                                newItems[index].name = e.target.value;
                                setEditItems(newItems);
                              }}
                              required
                            />
                          </div>
                          <div>
                            <Label>Quantidade *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...editItems];
                                newItems[index].quantity = e.target.value;
                                setEditItems(newItems);
                              }}
                              required
                            />
                          </div>
                          <div>
                            <Label>Unidade</Label>
                            <Select
                              value={item.unit}
                              onValueChange={(value) => {
                                const newItems = [...editItems];
                                newItems[index].unit = value;
                                setEditItems(newItems);
                              }}
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
                          <div>
                            <Label>Marca</Label>
                            <Input
                              value={item.brand}
                              onChange={(e) => {
                                const newItems = [...editItems];
                                newItems[index].brand = e.target.value;
                                setEditItems(newItems);
                              }}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Observações</Label>
                            <Textarea
                              value={item.notes}
                              onChange={(e) => {
                                const newItems = [...editItems];
                                newItems[index].notes = e.target.value;
                                setEditItems(newItems);
                              }}
                              rows={2}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => setEditItems(editItems.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateRequisitionMutation.isPending}>
                {updateRequisitionMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Requisição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Descrição</p>
              <p>{requisition.description || "Sem descrição"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
              <p>{new Date(requisition.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itens da Requisição */}
      <Card>
        <CardHeader>
          <CardTitle>Itens Solicitados</CardTitle>
          <CardDescription>Lista de itens desta requisição</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit ? unitLabels[item.unit] || item.unit : "-"}</TableCell>
                  <TableCell>{item.brand || "-"}</TableCell>
                  <TableCell>{item.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Seção de Cotações */}
      {canAddQuotes && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cotações</CardTitle>
                <CardDescription>Cotações de fornecedores para esta requisição</CardDescription>
              </div>
              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenQuoteDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Cotação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <form onSubmit={handleCreateQuote}>
                    <DialogHeader>
                      <DialogTitle>Nova Cotação</DialogTitle>
                      <DialogDescription>
                        Adicione uma cotação de fornecedor para esta requisição
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplier">Fornecedor *</Label>
                        <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um fornecedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers?.map((supplier: any) => (
                              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quoteNumber">Número da Cotação</Label>
                          <Input
                            id="quoteNumber"
                            value={quoteFormData.quoteNumber}
                            onChange={(e) => setQuoteFormData({ ...quoteFormData, quoteNumber: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deliveryTime">Prazo de Entrega (dias)</Label>
                          <Input
                            id="deliveryTime"
                            type="number"
                            value={quoteFormData.deliveryTime}
                            onChange={(e) => setQuoteFormData({ ...quoteFormData, deliveryTime: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
                        <Input
                          id="paymentTerms"
                          value={quoteFormData.paymentTerms}
                          onChange={(e) => setQuoteFormData({ ...quoteFormData, paymentTerms: e.target.value })}
                          placeholder="Ex: 30 dias, à vista, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={quoteFormData.notes}
                          onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="border-t pt-4">
                        <Label className="text-base mb-4 block">Preços dos Itens *</Label>
                        <div className="space-y-3">
                          {quoteItems.map((quoteItem, index) => {
                            const reqItem = items.find((item: any) => item.id === quoteItem.requisitionItemId);
                            return (
                              <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{reqItem?.itemName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Quantidade: {reqItem?.quantity} {reqItem?.unit || ""}
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label>Preço Unitário (R$) *</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={quoteItem.unitPrice}
                                      onChange={(e) => updateQuoteItem(index, "unitPrice", e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Marca/Modelo</Label>
                                    <Input
                                      value={quoteItem.brand}
                                      onChange={(e) => updateQuoteItem(index, "brand", e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Observações</Label>
                                  <Input
                                    value={quoteItem.notes}
                                    onChange={(e) => updateQuoteItem(index, "notes", e.target.value)}
                                  />
                                </div>
                                {quoteItem.unitPrice && (
                                  <p className="text-sm font-medium text-right">
                                     Total: {formatCurrency(Number(quoteItem.unitPrice) * Number(reqItem?.quantity || 0))}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createQuoteMutation.isPending}>
                        {createQuoteMutation.isPending ? "Salvando..." : "Salvar Cotação"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Dialog de Editar Cotação */}
              <Dialog open={isEditQuoteDialogOpen} onOpenChange={setIsEditQuoteDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <form onSubmit={handleUpdateQuote}>
                    <DialogHeader>
                      <DialogTitle>Editar Cotação</DialogTitle>
                      <DialogDescription>
                        Atualize as informações da cotação
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-supplier">Fornecedor *</Label>
                        <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um fornecedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers?.map((supplier: any) => (
                              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-quoteNumber">Número da Cotação</Label>
                          <Input
                            id="edit-quoteNumber"
                            value={quoteFormData.quoteNumber}
                            onChange={(e) => setQuoteFormData({ ...quoteFormData, quoteNumber: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-deliveryTime">Prazo de Entrega (dias)</Label>
                          <Input
                            id="edit-deliveryTime"
                            type="number"
                            value={quoteFormData.deliveryTime}
                            onChange={(e) => setQuoteFormData({ ...quoteFormData, deliveryTime: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-paymentTerms">Condições de Pagamento</Label>
                        <Input
                          id="edit-paymentTerms"
                          value={quoteFormData.paymentTerms}
                          onChange={(e) => setQuoteFormData({ ...quoteFormData, paymentTerms: e.target.value })}
                          placeholder="Ex: 30 dias, à vista, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-notes">Observações</Label>
                        <Textarea
                          id="edit-notes"
                          value={quoteFormData.notes}
                          onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="border-t pt-4">
                        <Label className="text-base mb-4 block">Preços dos Itens *</Label>
                        <div className="space-y-3">
                          {quoteItems.map((quoteItem, index) => {
                            const reqItem = items.find((item: any) => item.id === quoteItem.requisitionItemId);
                            return (
                              <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{reqItem?.itemName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Quantidade: {reqItem?.quantity} {reqItem?.unit || ""}
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label>Preço Unitário (R$) *</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={quoteItem.unitPrice}
                                      onChange={(e) => updateQuoteItem(index, "unitPrice", e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Marca/Modelo</Label>
                                    <Input
                                      value={quoteItem.brand}
                                      onChange={(e) => updateQuoteItem(index, "brand", e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Observações</Label>
                                  <Input
                                    value={quoteItem.notes}
                                    onChange={(e) => updateQuoteItem(index, "notes", e.target.value)}
                                  />
                                </div>
                                {quoteItem.unitPrice && (
                                  <p className="text-sm font-medium text-right">
                                     Total: {formatCurrency(Number(quoteItem.unitPrice) * Number(reqItem?.quantity || 0))}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsEditQuoteDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={updateQuoteMutation.isPending}>
                        {updateQuoteMutation.isPending ? "Atualizando..." : "Atualizar Cotação"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {quotes && quotes.length > 0 ? (
              <div className="space-y-4">
                {quotes.map((quote: any) => (
                  <Card key={quote.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{quote.supplier?.name}</CardTitle>
                          <CardDescription>
                            {quote.quoteNumber && `Nº: ${quote.quoteNumber} • `}
                            Prazo: {quote.deliveryTime || "Não informado"} dias
                          </CardDescription>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold">{formatCurrency(quote.totalAmount)}</p>
                            <Badge variant={quote.status === "approved" ? "default" : "secondary"}>
                              {quote.status === "approved" ? "Aprovada" : quote.status === "rejected" ? "Rejeitada" : "Pendente"}
                            </Badge>
                          </div>
                          {canAddQuotes && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEditQuote(quote)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    if (confirm(`Tem certeza que deseja excluir a cotação de ${quote.supplier?.name}?`)) {
                                      deleteQuoteMutation.mutate({ id: quote.id });
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Preço Unit.</TableHead>
                            <TableHead>Qtd.</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quote.items?.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>{items.find((i: any) => i.id === item.requisitionItemId)?.itemName}</TableCell>
                              <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {quote.paymentTerms && (
                        <p className="text-sm text-muted-foreground mt-4">
                          <strong>Pagamento:</strong> {quote.paymentTerms}
                        </p>
                      )}
                      {quote.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Observações:</strong> {quote.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma cotação adicionada ainda
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seção de Comparação de Preços */}
      {quotes && quotes.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação de Preços</CardTitle>
            <CardDescription>Comparação lado a lado das cotações recebidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Item</TableHead>
                    {quotes.map((quote: any) => (
                      <TableHead key={quote.id} className="text-center">
                        <div>
                          <p className="font-semibold">{quote.supplier?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Prazo: {quote.deliveryTime || "N/A"} dias
                          </p>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any) => {
                    const quotePrices = quotes.map((quote: any) => {
                      const quoteItem = quote.items?.find((qi: any) => qi.requisitionItemId === item.id);
                      return {
                        quoteId: quote.id,
                        unitPrice: quoteItem ? Number(quoteItem.unitPrice) : null,
                        totalPrice: quoteItem ? Number(quoteItem.totalPrice) : null,
                        brand: quoteItem?.brand,
                      };
                    });

                    const minPrice = Math.min(...quotePrices.filter(qp => qp.totalPrice !== null).map(qp => qp.totalPrice!));

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{item.itemName}</p>
                            <p className="text-xs text-muted-foreground">
                              Qtd: {item.quantity} {item.unit || ""}
                            </p>
                          </div>
                        </TableCell>
                        {quotePrices.map((qp, index) => (
                          <TableCell key={index} className="text-center">
                            {qp.unitPrice !== null ? (
                              <div className={qp.totalPrice === minPrice ? "bg-green-50 dark:bg-green-950 p-2 rounded" : "p-2"}>
                                 <p className="font-semibold">
                                   {formatCurrency(qp.unitPrice)}
                                 </p>
                                 <p className="text-xs text-muted-foreground">
                                   Total: {formatCurrency(qp.totalPrice)}
                                 </p>
                                {qp.brand && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {qp.brand}
                                  </p>
                                )}
                                {qp.totalPrice === minPrice && (
                                  <Badge variant="default" className="mt-1 text-xs">
                                    Melhor preço
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">-</p>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total Geral</TableCell>
                    {quotes.map((quote: any) => (
                      <TableCell key={quote.id} className="text-center">
                        <p className="text-lg">{formatCurrency(quote.totalAmount)}</p>
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="font-medium">Prazo de Entrega</TableCell>
                    {quotes.map((quote: any) => (
                      <TableCell key={quote.id} className="text-center">
                        <p className="font-medium">{quote.deliveryTime ? `${quote.deliveryTime} dias` : "N\u00e3o informado"}</p>
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="font-medium">Prazo de Pagamento</TableCell>
                    {quotes.map((quote: any) => (
                      <TableCell key={quote.id} className="text-center">
                        <p className="font-medium">{quote.paymentTerms || "N\u00e3o informado"}</p>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-3">An\u00e1lise Comparativa:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const minTotal = Math.min(...quotes.map((q: any) => Number(q.totalAmount)));
                  const minDelivery = Math.min(...quotes.filter((q: any) => q.deliveryTime).map((q: any) => q.deliveryTime));
                  
                  return quotes.map((quote: any) => {
                    const isBestPrice = Number(quote.totalAmount) === minTotal;
                    const isBestDelivery = quote.deliveryTime && quote.deliveryTime === minDelivery;
                    const badges = [];
                    if (isBestPrice) badges.push("Melhor Pre\u00e7o");
                    if (isBestDelivery) badges.push("Entrega Mais R\u00e1pida");
                    
                    return (
                      <div key={quote.id} className={`p-3 rounded-lg border-2 ${
                        isBestPrice ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-border"
                      }`}>
                        <p className="font-semibold text-base mb-2">{quote.supplier?.name}</p>
                        <div className="space-y-1 text-sm">
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium">{formatCurrency(quote.totalAmount)}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Entrega:</span>
                            <span className="font-medium">{quote.deliveryTime ? `${quote.deliveryTime} dias` : "N/A"}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Pagamento:</span>
                            <span className="font-medium">{quote.paymentTerms || "N/A"}</span>
                          </p>
                        </div>
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {badges.map((badge, idx) => (
                              <Badge key={idx} variant="default" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção de Arquivos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Arquivos Anexados</CardTitle>
              <CardDescription>Cotações, ordens de compra e documentos adicionais</CardDescription>
            </div>
            {!isStorekeeper && (
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload de Arquivo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload de Arquivo</DialogTitle>
                    <DialogDescription>
                      Selecione o tipo de arquivo e faça o upload
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Tipo de Arquivo</Label>
                      <Select value={uploadFileType} onValueChange={(value: any) => setUploadFileType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cotacao">Cotação</SelectItem>
                          <SelectItem value="ordem_compra">Ordem de Compra</SelectItem>
                          <SelectItem value="adicional">Arquivo Adicional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">Arquivo</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {attachments && attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((attachment: any) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.fileType === "cotacao" ? "Cotação" : 
                         attachment.fileType === "ordem_compra" ? "Ordem de Compra" : 
                         "Arquivo Adicional"}
                        {" • "}
                        {(attachment.fileSize / 1024).toFixed(2)} KB
                        {" • "}
                        {new Date(attachment.uploadedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(attachment.fileUrl, "_blank")}
                    >
                      Baixar
                    </Button>
                    {!isStorekeeper && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAttachmentMutation.mutate({ id: attachment.id })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum arquivo anexado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4">
        {isStorekeeper && requisition?.status === "solicitacao" && (
          <Button variant="outline">
            Requisitar Alteração
          </Button>
        )}
        
        {canAddQuotes && requisition?.status === "cotacao_em_progresso" && (
          <Button>
            Enviar para Análise
          </Button>
        )}
        
        {canApprove && requisition?.status === "aguardando_autorizacao" && (
          <>
            <Button variant="destructive">
              Rejeitar
            </Button>
            <Button>
              Aprovar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
