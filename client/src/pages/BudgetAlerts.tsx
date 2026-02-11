import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState } from "react";
import { toast } from "sonner";

export default function BudgetAlerts() {
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const { data: alerts, refetch } = trpc.budgetAlerts.listPending.useQuery();

  const approveMutation = trpc.budgetAlerts.approve.useMutation({
    onSuccess: () => {
      toast.success("Cotação aprovada com sucesso!");
      setSelectedAlert(null);
      setReviewNotes("");
      setAction(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao aprovar: " + error.message);
    },
  });

  const rejectMutation = trpc.budgetAlerts.reject.useMutation({
    onSuccess: () => {
      toast.success("Cotação rejeitada com sucesso!");
      setSelectedAlert(null);
      setReviewNotes("");
      setAction(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao rejeitar: " + error.message);
    },
  });

  const handleReview = () => {
    if (!selectedAlert || !action) return;

    if (action === "approve") {
      approveMutation.mutate({
        id: selectedAlert.id,
        notes: reviewNotes || undefined,
      });
    } else {
      rejectMutation.mutate({
        id: selectedAlert.id,
        notes: reviewNotes || undefined,
      });
    }
  };

  const openReviewDialog = (alert: any, reviewAction: "approve" | "reject") => {
    setSelectedAlert(alert);
    setAction(reviewAction);
    setReviewNotes("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alertas de Orçamento</h1>
        <p className="text-muted-foreground">
          Cotações que excedem o valor máximo definido e aguardam aprovação
        </p>
      </div>

      {/* Card de Resumo */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle>Alertas Pendentes</CardTitle>
          </div>
          <CardDescription>
            {alerts?.length || 0} cotação(ões) aguardando revisão
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!alerts || alerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <p className="text-lg font-medium">Nenhum alerta pendente</p>
              <p className="text-sm">Todas as cotações estão dentro do orçamento</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requisição</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Valor Máximo</TableHead>
                  <TableHead className="text-right">Valor Cotado</TableHead>
                  <TableHead className="text-right">Excesso</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      #{alert.requisitionId}
                    </TableCell>
                    <TableCell>
                      Item #{alert.requisitionItemId}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(alert.maxPrice)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-orange-600">
                      {formatCurrency(alert.quotedPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">
                        +{formatCurrency(alert.excessAmount)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ID {alert.createdBy}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => openReviewDialog(alert, "approve")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openReviewDialog(alert, "reject")}
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

      {/* Dialog de Revisão */}
      <Dialog open={!!selectedAlert} onOpenChange={() => {
        setSelectedAlert(null);
        setReviewNotes("");
        setAction(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Aprovar Cotação" : "Rejeitar Cotação"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve" 
                ? "Você está aprovando uma cotação que excede o orçamento definido."
                : "Você está rejeitando uma cotação. O comprador precisará buscar outra opção."}
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Máximo</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedAlert.maxPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Cotado</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {formatCurrency(selectedAlert.quotedPrice)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Excesso</p>
                  <p className="text-lg font-semibold text-red-600">
                    +{formatCurrency(selectedAlert.excessAmount)} ({((Number(selectedAlert.excessAmount) / Number(selectedAlert.maxPrice)) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações (opcional)</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={action === "approve" 
                    ? "Ex: Aprovado devido à urgência do projeto..."
                    : "Ex: Solicitar nova cotação com fornecedor alternativo..."}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAlert(null);
                setReviewNotes("");
                setAction(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={handleReview}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {action === "approve" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
