import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Wrench, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function MaintenanceDetail() {
  const [, params] = useRoute("/manutencoes/:id");
  const [, setLocation] = useLocation();
  const maintenanceId = params?.id ? parseInt(params.id) : null;

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { data: schedule, isLoading, refetch } = trpc.maintenance.schedules.getById.useQuery(
    { id: maintenanceId! },
    { enabled: !!maintenanceId }
  );

  const { data: equipmentList } = trpc.equipment.list.useQuery();

  const updateStatusMutation = trpc.maintenance.schedules.updateStatus.useMutation({
    onSuccess: (data) => {
      if (data.requisitionId) {
        toast.success("Status atualizado e requisição de compra criada automaticamente!");
      } else {
        toast.success("Status atualizado com sucesso!");
      }
      setIsStatusDialogOpen(false);
      setSelectedStatus(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Manutenção não encontrada</p>
            <Button className="mt-4" onClick={() => setLocation("/manutencoes")}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const equipment = equipmentList?.find((e) => e.id === schedule.equipmentId);

  const statusLabels: Record<string, string> = {
    scheduled: "Agendada",
    quotation: "Cotação",
    analysis: "Análise",
    awaiting_authorization: "Aguardando Autorização",
    authorized: "Autorizado",
    in_progress: "Em Execução",
    completed: "Concluída",
    sent_to_purchase: "Enviado ao Compras",
  };

  const statusColors: Record<string, any> = {
    scheduled: "default",
    quotation: "default",
    analysis: "secondary",
    awaiting_authorization: "secondary",
    authorized: "default",
    in_progress: "secondary",
    completed: "default",
    sent_to_purchase: "default",
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header com Botão Voltar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/manutencoes")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Manutenção #{schedule.id}</h1>
            <p className="text-muted-foreground">
              {equipment?.name || `Equipamento #${schedule.equipmentId}`}
            </p>
          </div>
        </div>
        <Badge variant={statusColors[schedule.status]}>
          {statusLabels[schedule.status]}
        </Badge>
      </div>

      {/* Timeline do Fluxo de Manutenção */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo da Manutenção</CardTitle>
          <CardDescription>Acompanhe o progresso da manutenção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Linha de progresso */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div className="relative flex justify-between">
              {[
                { key: "scheduled", label: "Agendada", icon: "📅" },
                { key: "quotation", label: "Cotação", icon: "💰" },
                { key: "analysis", label: "Análise", icon: "🔍" },
                { key: "awaiting_authorization", label: "Aguardando Autorização", icon: "⏳" },
                { key: "authorized", label: "Autorizado", icon: "✅" },
                { key: "in_progress", label: "Em Execução", icon: "🔧" },
                { key: "completed", label: "Concluída", icon: "✔️" },
                { key: "sent_to_purchase", label: "Enviado ao Compras", icon: "📦" },
              ].map((step) => {
                const statusOrder = [
                  "scheduled",
                  "quotation",
                  "analysis",
                  "awaiting_authorization",
                  "authorized",
                  "in_progress",
                  "completed",
                  "sent_to_purchase"
                ];
                const currentIndex = statusOrder.indexOf(schedule.status);
                const stepIndex = statusOrder.indexOf(step.key);
                const isActive = stepIndex === currentIndex;
                const isCompleted = stepIndex < currentIndex;
                const isCanceled = schedule.status === "cancelled";

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
            {schedule.status === "cancelled" && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                <p className="text-sm font-medium text-destructive">❌ Manutenção Cancelada</p>
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
              Tem certeza que deseja alterar o status desta manutenção para <strong>{selectedStatus && statusLabels[selectedStatus]}</strong>?
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
                    id: schedule.id,
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

      {/* Informações da Manutenção */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Equipamento</p>
                <p className="text-sm text-muted-foreground">
                  {equipment?.name || `Equipamento #${schedule.equipmentId}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tipo de Manutenção</p>
                <Badge variant={schedule.maintenanceType === "preventive" ? "default" : "destructive"}>
                  {schedule.maintenanceType === "preventive" ? "Preventiva" : "Corretiva"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data Agendada</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(schedule.scheduledDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {schedule.description || "Nenhuma descrição fornecida"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Anexos (Fotos, Cotações) */}
      <Card>
        <CardHeader>
          <CardTitle>Anexos (Fotos, Cotações)</CardTitle>
          <CardDescription>Adicione fotos, cotações e outros arquivos relacionados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              id="file-upload"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                // TODO: Implementar upload para S3 e armazenar URLs no campo attachments
                toast.info(`${files.length} arquivo(s) selecionado(s). Upload será implementado em breve.`);
              }}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="w-full" onClick={() => document.getElementById('file-upload')?.click()}>
                Selecionar Arquivos
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">Formatos aceitos: imagens e PDF</p>
          </div>

          {/* Lista de anexos (quando implementado) */}
          {schedule.attachments && schedule.attachments.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Arquivos anexados:</p>
              <div className="grid gap-2">
                {JSON.parse(schedule.attachments).map((url: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm truncate">{url.split('/').pop()}</span>
                    <Button variant="ghost" size="sm" onClick={() => window.open(url, '_blank')}>
                      Abrir
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum anexo adicionado ainda</p>
          )}
        </CardContent>
      </Card>

      {/* Requisição de Compra Vinculada */}
      {schedule.purchaseRequisitionId && (
        <Card>
          <CardHeader>
            <CardTitle>Requisição de Compra Vinculada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Requisição #{schedule.purchaseRequisitionId} criada automaticamente
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/requisicoes/${schedule.purchaseRequisitionId}`)}
              >
                Ver Requisição
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
