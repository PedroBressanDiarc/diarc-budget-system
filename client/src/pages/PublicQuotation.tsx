import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Building2, Calendar, FileText, Package } from "lucide-react";
import { toast } from "sonner";

export default function PublicQuotation() {
  const [, params] = useRoute("/cotacao/:token");
  const token = params?.token || "";
  
  const [itemPrices, setItemPrices] = useState<Record<number, { unitPrice: string; deliveryTime: string; notes: string }>>({});
  const [observations, setObservations] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data, isLoading, error } = trpc.quotations.getByToken.useQuery({ token });
  const submitMutation = trpc.quotations.submitQuotation.useMutation({
    onSuccess: () => {
      toast.success("Cotação enviada com sucesso!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar cotação: ${error.message}`);
      setIsSubmitting(false);
    },
  });
  
  // Preencher dados se já existe cotação
  useEffect(() => {
    if (data?.existingQuote) {
      const quote = data.existingQuote;
      setObservations(quote.observations || "");
      setPaymentTerms(quote.paymentTerms || "");
      setDeliveryTime(quote.deliveryTime || "");
      
      const prices: Record<number, { unitPrice: string; deliveryTime: string; notes: string }> = {};
      quote.items?.forEach((item: any) => {
        prices[item.requisitionItemId] = {
          unitPrice: item.unitPrice || "",
          deliveryTime: item.deliveryTime || "",
          notes: item.notes || "",
        };
      });
      setItemPrices(prices);
    }
  }, [data]);
  
  const handleItemChange = (itemId: number, field: string, value: string) => {
    setItemPrices(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      }
    }));
  };
  
  const calculateTotalPrice = (itemId: number, quantity: number) => {
    const unitPrice = parseFloat(itemPrices[itemId]?.unitPrice || "0");
    return (unitPrice * quantity).toFixed(2);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!data?.requisition?.items) {
      toast.error("Nenhum item encontrado");
      setIsSubmitting(false);
      return;
    }
    
    const items = data.requisition.items.map((item: any) => ({
      requisitionItemId: item.id,
      unitPrice: itemPrices[item.id]?.unitPrice || "0",
      totalPrice: calculateTotalPrice(item.id, item.quantity),
      deliveryTime: itemPrices[item.id]?.deliveryTime,
      notes: itemPrices[item.id]?.notes,
    }));
    
    submitMutation.mutate({
      token,
      items,
      observations,
      paymentTerms,
      deliveryTime,
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Erro ao Carregar Cotação</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error?.message || "Token inválido ou expirado"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { requisition, supplier, tokenData, existingQuote } = data;
  const isExpired = new Date() > new Date(tokenData.expiresAt);
  const isSubmitted = tokenData.submitted;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Solicitação de Cotação</CardTitle>
                <CardDescription>
                  Requisição #{requisition.id} - {requisition.description}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {supplier.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4" />
                  Expira em: {new Date(tokenData.expiresAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* Alertas */}
        {isExpired && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este link de cotação expirou. Entre em contato com o solicitante para obter um novo link.
            </AlertDescription>
          </Alert>
        )}
        
        {isSubmitted && !isExpired && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Cotação já enviada em {new Date(tokenData.submittedAt!).toLocaleString('pt-BR')}.
              Você pode visualizar ou atualizar os dados abaixo.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens da Requisição
              </CardTitle>
              <CardDescription>
                Preencha os preços unitários para cada item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead>Preço Unitário (R$)</TableHead>
                      <TableHead>Preço Total (R$)</TableHead>
                      <TableHead>Prazo de Entrega</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requisition.items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item}</TableCell>
                        <TableCell>{item.description || "-"}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={itemPrices[item.id]?.unitPrice || ""}
                            onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                            disabled={isExpired}
                            required
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell className="font-semibold">
                          {calculateTotalPrice(item.id, item.quantity)}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            placeholder="Ex: 5 dias"
                            value={itemPrices[item.id]?.deliveryTime || ""}
                            onChange={(e) => handleItemChange(item.id, "deliveryTime", e.target.value)}
                            disabled={isExpired}
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            placeholder="Observações"
                            value={itemPrices[item.id]?.notes || ""}
                            onChange={(e) => handleItemChange(item.id, "notes", e.target.value)}
                            disabled={isExpired}
                            className="w-48"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Informações Adicionais */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
                <Input
                  id="paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Ex: 30 dias, À vista com desconto, etc"
                  disabled={isExpired}
                />
              </div>
              
              <div>
                <Label htmlFor="deliveryTime">Prazo de Entrega Geral</Label>
                <Input
                  id="deliveryTime"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="Ex: 15 dias úteis"
                  disabled={isExpired}
                />
              </div>
              
              <div>
                <Label htmlFor="observations">Observações Gerais</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Informações adicionais sobre a cotação..."
                  rows={4}
                  disabled={isExpired}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Botão de Envio */}
          {!isExpired && (
            <div className="flex justify-end mt-6">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : isSubmitted ? "Atualizar Cotação" : "Enviar Cotação"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
