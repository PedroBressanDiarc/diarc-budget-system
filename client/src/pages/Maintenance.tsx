import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, Wrench, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Package } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Maintenance() {
  const [, setLocation] = useLocation();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    equipmentId: "",
    maintenanceType: "preventive" as "preventive" | "corrective",
    scheduledDate: "",
    description: "",
  });

  const { data: equipmentList } = trpc.equipment.list.useQuery();
  const { data: schedules, isLoading: schedulesLoading, refetch: refetchSchedules } = trpc.maintenance.schedules.list.useQuery();
  const { data: upcomingMaintenance } = trpc.maintenance.schedules.upcoming.useQuery({ days: 30 });
  const { data: records, isLoading: recordsLoading } = trpc.maintenance.records.list.useQuery();

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
      });
    },
    onError: (error) => {
      toast.error("Erro ao agendar manutenção: " + error.message);
    },
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleFormData.equipmentId) {
      toast.error("Selecione um equipamento");
      return;
    }
    createScheduleMutation.mutate({
      equipmentId: parseInt(scheduleFormData.equipmentId),
      maintenanceType: scheduleFormData.maintenanceType,
      scheduledDate: scheduleFormData.scheduledDate,
      description: scheduleFormData.description,
    });
  };

  const getMaintenanceTypeBadge = (type: string) => {
    return type === "preventive" ? (
      <Badge variant="default">Preventiva</Badge>
    ) : (
      <Badge variant="destructive">Corretiva</Badge>
    );
  };

  const getScheduleStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: "Agendada", variant: "secondary" as const, icon: Clock },
      completed: { label: "Concluída", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelada", variant: "destructive" as const, icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getEquipmentName = (equipmentId: number) => {
    const equipment = equipmentList?.find((e) => e.id === equipmentId);
    return equipment?.name || `Equipamento #${equipmentId}`;
  };

  if (schedulesLoading || recordsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manutenções</h1>
          <p className="text-muted-foreground">Agendamento e histórico de manutenções</p>
        </div>
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agendar Manutenção
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleScheduleSubmit}>
              <DialogHeader>
                <DialogTitle>Agendar Manutenção</DialogTitle>
                <DialogDescription>Agende uma manutenção para um equipamento</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="equipmentId">Equipamento *</Label>
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
                          {equipment.name} {equipment.code && `(${equipment.code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maintenanceType">Tipo de Manutenção *</Label>
                  <Select
                    value={scheduleFormData.maintenanceType}
                    onValueChange={(value: "preventive" | "corrective") =>
                      setScheduleFormData({ ...scheduleFormData, maintenanceType: value })
                    }
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
                <div className="grid gap-2">
                  <Label htmlFor="scheduledDate">Data Agendada *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    required
                    value={scheduleFormData.scheduledDate}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, scheduledDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o que será feito"
                    value={scheduleFormData.description}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, description: e.target.value })}
                  />
                </div>
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

      {/* Próximas Manutenções */}
      {upcomingMaintenance && upcomingMaintenance.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="h-5 w-5" />
              Próximas Manutenções (30 dias)
            </CardTitle>
            <CardDescription className="text-orange-700">
              {upcomingMaintenance.length} manutenção(ões) agendada(s) para os próximos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingMaintenance.slice(0, 5).map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    const equipment = equipmentList?.find((e) => e.id === schedule.equipmentId);
                    if (equipment) setLocation(`/equipment/${equipment.id}`);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{getEquipmentName(schedule.equipmentId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(schedule.scheduledDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  {getMaintenanceTypeBadge(schedule.maintenanceType)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="schedules" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <h3 className="text-lg font-semibold">Todas as Manutenções Agendadas</h3>
          {schedules && schedules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma manutenção agendada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Agende manutenções preventivas ou corretivas para seus equipamentos
                </p>
                <Button onClick={() => setScheduleDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Manutenção
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schedules?.map((schedule) => (
                <Card
                  key={schedule.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    const equipment = equipmentList?.find((e) => e.id === schedule.equipmentId);
                    if (equipment) setLocation(`/equipment/${equipment.id}`);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Package className="h-4 w-4" />
                          {getEquipmentName(schedule.equipmentId)}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getMaintenanceTypeBadge(schedule.maintenanceType)}
                          {getScheduleStatusBadge(schedule.status)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Agendada para: {new Date(schedule.scheduledDate).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {schedule.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{schedule.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <h3 className="text-lg font-semibold">Histórico de Manutenções Realizadas</h3>
          {records && records.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma manutenção registrada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Os registros de manutenções realizadas aparecerão aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {records?.map((record) => (
                <Card
                  key={record.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    const equipment = equipmentList?.find((e) => e.id === record.equipmentId);
                    if (equipment) setLocation(`/equipment/${equipment.id}`);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Package className="h-4 w-4" />
                          {getEquipmentName(record.equipmentId)}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getMaintenanceTypeBadge(record.maintenanceType)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(record.performedDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      {record.cost && (
                        <div className="text-lg font-semibold">
                          R$ {parseFloat(record.cost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {record.description && (
                      <p className="text-sm line-clamp-2">{record.description}</p>
                    )}
                    {record.technician && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Técnico:</span> {record.technician}
                      </div>
                    )}
                    {record.partsReplaced && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Peças:</span> {record.partsReplaced}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
