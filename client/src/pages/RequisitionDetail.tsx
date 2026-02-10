import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText, Upload } from "lucide-react";
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

export default function RequisitionDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data, isLoading } = trpc.requisitions.getById.useQuery({ 
    id: Number(id) 
  });

  const requisition = data?.requisition;
  const items = data?.items || [];

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
                  <TableCell>{item.unit || "-"}</TableCell>
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
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Adicionar Cotação
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Nenhuma cotação adicionada ainda
            </p>
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
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload de Arquivo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum arquivo anexado
          </p>
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
