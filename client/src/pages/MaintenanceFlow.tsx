import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Wrench, Calendar, Clock, CheckCircle, XCircle, Package, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function MaintenanceFlow() {
  const [, setLocation] = useLocation();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    equipmentId: "",
    maintenanceType: "preventive" as "preventive" | "corrective",
    scheduledDate: "",
    description: "",
    estimatedPrice: "",
    attachments: [] as string[],
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    equipmentId: "all",
    maintenanceType: "all",
    status: "all",
  });

  const { data: equipmentList } = trpc.equipment.list.useQuery();
  const { data: schedules, isLoading: schedulesLoading, refetch: refetchSchedules } = trpc.maintenance.schedules.list.useQuery();

  const createScheduleMutation = trpc.maintenance.schedules.create.useMutation({
    onSuccess: () => {
      toast.success("Manutenção agendada com sucesso!");
      setScheduleDialogOpen(false);
      refetchSchedules();
      setScheduleFormData({
        equipmentId: "",
        maintenanceType: "preventive",
        scheduledDate: "",
        description: "",
        estimatedPrice: "",
        attachments: [],
      });
    },
    onError: (error) => {
      toast.error("Erro ao agendar manutenção: " + error.message);
    },
  });

  const updateStatusMutation = trpc.maintenance.schedules.updateStatus.useMutation({
    onSuccess: (data) => {
      if (data.requisitionId) {
        toast.success("Status atualizado e requisição de compra criada automaticamente!");
      } else {
        toast.success("Status atualizado com sucesso!");
      }
      setStatusDialogOpen(false);
      setSelectedSchedule(null);
      refetchSchedules();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleFormData.equipmentId || !scheduleFormData.scheduledDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createScheduleMutation.mutate({
      equipmentId: parseInt(scheduleFormData.equipmentId),
      maintenanceType: scheduleFormData.maintenanceType,
      scheduledDate: scheduleFormData.scheduledDate,
      description: scheduleFormData.description,
    });
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedSchedule) return;
    updateStatusMutation.mutate({
      id: selectedSchedule.id,
      status: newStatus as any,
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      scheduled: { label: "Agendada", color: "bg-blue-500", icon: Clock },
      approved: { label: "Aprovada", color: "bg-green-500", icon: CheckCircle },
      in_progress: { label: "Em Execução", color: "bg-yellow-500", icon: Wrench },
      sent_to_purchase: { label: "Enviado ao Compras", color: "bg-purple-500", icon: Package },
      completed: { label: "Concluída", color: "bg-gray-500", icon: CheckCircle },
      cancelled: { label: "Cancelada", color: "bg-red-500", icon: XCircle },
    };
    return configs[status as keyof typeof configs] || configs.scheduled;
  };

  const getNextStatus = (currentStatus: string) => {
    const flow = {
      scheduled: "approved",
      approved: "in_progress",
      in_progress: "sent_to_purchase",
      sent_to_purchase: "completed",
    };
    return flow[currentStatus as keyof typeof flow];
  };



  const getEquipmentName = (equipmentId: number) => {
    const equipment = equipmentList?.find((e) => e.id === equipmentId);
    return equipment?.name || `Equipamento #${equipmentId}`;
  };

  const getMaintenanceTypeBadge = (type: string) => {
    return type === "preventive" ? (
      <Badge variant="default">Preventiva</Badge>
    ) : (
      <Badge variant="destructive">Corretiva</Badge>
    );
  };

  // Aplicar filtros
  const filteredSchedules = schedules?.filter((schedule) => {
    // Filtro por equipamento
    if (filters.equipmentId !== "all" && schedule.equipmentId.toString() !== filters.equipmentId) {
      return false;
    }
    // Filtro por tipo de manutenção
    if (filters.maintenanceType !== "all" && schedule.maintenanceType !== filters.maintenanceType) {
      return false;
    }
    // Filtro por status
    if (filters.status !== "all" && schedule.status !== filters.status) {
      return false;
    }
    return true;
  });

  // Agrupar manutenções filtradas por status
  const groupedSchedules = filteredSchedules?.reduce((acc, schedule) => {
    const status = schedule.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(schedule);
    return acc;
  }, {} as Record<string, any[]>);

  const statusOrder = ["scheduled", "approved", "in_progress", "sent_to_purchase", "completed", "cancelled"];

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Manutenção</h1>
          <p className="text-muted-foreground">Gerencie o fluxo completo de manutenções</p>
        </div>
        <Button onClick={() => setScheduleDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agendar Manutenção
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Equipamento</Label>
              <Select value={filters.equipmentId} onValueChange={(value) => setFilters({ ...filters, equipmentId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {equipmentList?.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id.toString()}>
                      {equipment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Manutenção</Label>
              <Select value={filters.maintenanceType} onValueChange={(value) => setFilters({ ...filters, maintenanceType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="preventive">Preventiva</SelectItem>
                  <SelectItem value="corrective">Corretiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="quotation">Cotação</SelectItem>
                  <SelectItem value="analysis">Análise</SelectItem>
                  <SelectItem value="awaiting_authorization">Aguardando Autorização</SelectItem>
                  <SelectItem value="authorized">Autorizado</SelectItem>
                  <SelectItem value="in_progress">Em Execução</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="sent_to_purchase">Enviado ao Compras</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setFilters({ equipmentId: "all", maintenanceType: "all", status: "all" })}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fluxo de Status */}
      <div className="grid gap-6">
        {schedulesLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          statusOrder.map((status) => {
            const config = getStatusConfig(status);
            const Icon = config.icon;
            const items = groupedSchedules?.[status] || [];
            
            if (items.length === 0) return null;

            return (
              <Card key={status}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    {config.label}
                    <Badge variant="secondary">{items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((schedule) => (
                      <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {getEquipmentName(schedule.equipmentId)}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {getMaintenanceTypeBadge(schedule.maintenanceType)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(schedule.scheduledDate).toLocaleDateString("pt-BR")}</span>
                          </div>
                          {schedule.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{schedule.description}</p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/manutencoes/${schedule.id}`)}
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog: Agendar Manutenção */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Manutenção</DialogTitle>
            <DialogDescription>Crie um novo agendamento de manutenção</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="equipment">Equipamento *</Label>
              <Select
                value={scheduleFormData.equipmentId}
                onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, equipmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentList?.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id.toString()}>
                      {equipment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo de Manutenção *</Label>
              <Select
                value={scheduleFormData.maintenanceType}
                onValueChange={(value: any) => setScheduleFormData({ ...scheduleFormData, maintenanceType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventiva</SelectItem>
                  <SelectItem value="corrective">Corretiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Data Agendada *</Label>
              <Input
                id="date"
                type="date"
                value={scheduleFormData.scheduledDate}
                onChange={(e) => setScheduleFormData({ ...scheduleFormData, scheduledDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={scheduleFormData.description}
                onChange={(e) => setScheduleFormData({ ...scheduleFormData, description: e.target.value })}
                placeholder="Descreva a manutenção necessária..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="estimatedPrice">Preço Estimado (R\$) <span className="text-muted-foreground text-xs">(Opcional)</span></Label>
              <Input
                id="estimatedPrice"
                type="number"
                step="0.01"
                value={scheduleFormData.estimatedPrice}
                onChange={(e) => setScheduleFormData({ ...scheduleFormData, estimatedPrice: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createScheduleMutation.isPending}>
                {createScheduleMutation.isPending ? "Agendando..." : "Agendar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


    </div>
  );
}
