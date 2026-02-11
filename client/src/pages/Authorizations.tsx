import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Authorizations() {
  const [, setLocation] = useLocation();
  const { data: requisitions = [], refetch } = trpc.requisitions.list.useQuery();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveObservations, setApproveObservations] = useState("");
  const [activeTab, setActiveTab] = useState("pendentes");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const approveMutation = trpc.requisitions.approve.useMutation({
    onSuccess: () => {
      toast.success("Requisição aprovada com sucesso!");
      setApproveDialogOpen(false);
      setApproveObservations("");
      setSelectedReqId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao aprovar: ${error.message}`);
    },
  });

  const rejectMutation = trpc.requisitions.reject.useMutation({
    onSuccess: () => {
      toast.success("Requisição rejeitada!");
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedReqId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao rejeitar: ${error.message}`);
    },
  });

  // Função de filtro e ordenação
  const filterAndSort = (reqs: typeof requisitions) => {
    let filtered = reqs;
    
    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Ordenação por data
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  };

  const pendingRequisitions = filterAndSort(requisitions.filter(r => r.status === "aguardando_autorizacao"));
  const authorizedRequisitions = filterAndSort(requisitions.filter(r => r.status === "autorizado"));
  const rejectedRequisitions = filterAndSort(requisitions.filter(r => r.status === "cancelado"));

  const handleApproveClick = (id: number) => {
    setSelectedReqId(id);
    setApproveDialogOpen(true);
  };

  const handleApproveConfirm = () => {
    if (selectedReqId) {
      approveMutation.mutate({ 
        id: selectedReqId,
        observations: approveObservations.trim() || undefined 
      });
    }
  };

  const handleRejectClick = (id: number) => {
    setSelectedReqId(id);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedReqId) {
      rejectMutation.mutate({ 
        id: selectedReqId, 
        reason: rejectReason.trim() || undefined 
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Autorizações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie requisições pendentes, autorizadas e rejeitadas
        </p>
      </div>

      {/* Controles de Busca e Ordenação */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por número ou título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-md bg-background"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
        >
          {sortOrder === "desc" ? "↓ Mais Recentes" : "↑ Mais Antigas"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pendentes">
            Pendentes ({pendingRequisitions.length})
          </TabsTrigger>
          <TabsTrigger value="autorizadas">
            Autorizadas ({authorizedRequisitions.length})
          </TabsTrigger>
          <TabsTrigger value="rejeitadas">
            Rejeitadas ({rejectedRequisitions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes">
          <Card>
        <CardHeader>
          <CardTitle>Requisições para Autorizar</CardTitle>
          <CardDescription>
            {pendingRequisitions.length === 0 
              ? "Nenhuma requisição pendente de autorização" 
              : `${pendingRequisitions.length} requisição(ões) aguardando autorização`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequisitions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Todas as requisições foram processadas!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequisitions.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.requisitionNumber}</TableCell>
                    <TableCell>{req.title}</TableCell>
                    <TableCell>
                      {req.requestedBy}
                    </TableCell>
                    <TableCell>
                      {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        ⏳ Aguardando Autorização
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/compras/${req.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveClick(req.id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectClick(req.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="autorizadas">
          <Card>
            <CardHeader>
              <CardTitle>Requisições Autorizadas</CardTitle>
              <CardDescription>
                {authorizedRequisitions.length === 0 
                  ? "Nenhuma requisição autorizada" 
                  : `${authorizedRequisitions.length} requisição(ões) autorizada(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authorizedRequisitions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma requisição autorizada ainda.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorizedRequisitions.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.requisitionNumber}</TableCell>
                        <TableCell>{req.title}</TableCell>
                        <TableCell>{req.requestedBy}</TableCell>
                        <TableCell>
                          {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-600">
                            ✓ Autorizado
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/compras/${req.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
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

        <TabsContent value="rejeitadas">
          <Card>
            <CardHeader>
              <CardTitle>Requisições Rejeitadas</CardTitle>
              <CardDescription>
                {rejectedRequisitions.length === 0 
                  ? "Nenhuma requisição rejeitada" 
                  : `${rejectedRequisitions.length} requisição(ões) rejeitada(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedRequisitions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <XCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma requisição rejeitada.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedRequisitions.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.requisitionNumber}</TableCell>
                        <TableCell>{req.title}</TableCell>
                        <TableCell>{req.requestedBy}</TableCell>
                        <TableCell>
                          {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            ✗ Rejeitado
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/compras/${req.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
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
      </Tabs>

      {/* Dialog de Aprovação */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Requisição</DialogTitle>
            <DialogDescription>
              Você pode opcionalmente adicionar observações sobre a aprovação.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Observações (opcional)"
              value={approveObservations}
              onChange={(e) => setApproveObservations(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialogOpen(false);
                setApproveObservations("");
                setSelectedReqId(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApproveConfirm}
              disabled={approveMutation.isPending}
            >
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rejeição */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Requisição</DialogTitle>
            <DialogDescription>
              Você pode opcionalmente informar o motivo da rejeição.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Motivo da rejeição (opcional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason("");
                setSelectedReqId(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
