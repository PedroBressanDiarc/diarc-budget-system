import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Authorizations() {
  const [, setLocation] = useLocation();
  const { data: requisitions = [], refetch } = trpc.requisitions.list.useQuery();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const approveMutation = trpc.requisitions.approve.useMutation({
    onSuccess: () => {
      toast.success("Requisição aprovada com sucesso!");
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

  const pendingRequisitions = requisitions.filter(r => r.status === "aguardando_autorizacao");

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id });
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
        <h1 className="text-3xl font-bold">Autorizações Pendentes</h1>
        <p className="text-muted-foreground mt-2">
          Requisições aguardando sua autorização
        </p>
      </div>

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
                          onClick={() => handleApprove(req.id)}
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
