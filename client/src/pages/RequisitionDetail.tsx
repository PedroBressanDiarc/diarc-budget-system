import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText, Upload, Plus, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

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
    brand: string;
    notes: string;
  }>>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFileType, setUploadFileType] = useState<"cotacao" | "ordem_compra" | "adicional">("cotacao");
  const [isUploading, setIsUploading] = useState(false);
  
  const { data, isLoading } = trpc.requisitions.getById.useQuery({ 
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

  const deleteMutation = trpc.attachments.delete.useMutation({
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
      toast.error("Erro ao adicionar cotação: " + error.message);
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
    // Inicializar quoteItems com os itens da requisição
    const initialQuoteItems = items.map((item: any) => ({
      requisitionItemId: item.id,
      unitPrice: "",
      brand: item.brand || "",
      notes: "",
    }));
    setQuoteItems(initialQuoteItems);
    setIsQuoteDialogOpen(true);
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
        <Badge variant={statusColors[requisition.status]}>
          {statusLabels[requisition.status]}
        </Badge>
      </div>

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
      {canAddQuotes && requisition?.status !== "solicitacao" && (
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
                                    Total: R$ {(Number(quoteItem.unitPrice) * Number(reqItem?.quantity || 0)).toFixed(2)}
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
                        <div className="text-right">
                          <p className="text-2xl font-bold">R$ {Number(quote.totalAmount).toFixed(2)}</p>
                          <Badge variant={quote.status === "approved" ? "default" : "secondary"}>
                            {quote.status === "approved" ? "Aprovada" : quote.status === "rejected" ? "Rejeitada" : "Pendente"}
                          </Badge>
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
                              <TableCell>R$ {Number(item.unitPrice).toFixed(2)}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>R$ {Number(item.totalPrice).toFixed(2)}</TableCell>
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
                                  R$ {qp.unitPrice.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Total: R$ {qp.totalPrice?.toFixed(2)}
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
                        <p className="text-lg">R$ {Number(quote.totalAmount).toFixed(2)}</p>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Resumo da Comparação:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {quotes.map((quote: any) => (
                  <div key={quote.id}>
                    <p className="font-medium">{quote.supplier?.name}</p>
                    <p className="text-muted-foreground">Total: R$ {Number(quote.totalAmount).toFixed(2)}</p>
                    <p className="text-muted-foreground">Prazo: {quote.deliveryTime || "N/A"} dias</p>
                    {quote.paymentTerms && (
                      <p className="text-muted-foreground">Pag: {quote.paymentTerms}</p>
                    )}
                  </div>
                ))}
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
                        onClick={() => deleteMutation.mutate({ id: attachment.id })}
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
