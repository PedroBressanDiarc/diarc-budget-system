import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Calendar,
  Wrench,
  Package,
  MapPin,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EquipmentDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const equipmentId = parseInt(id || "0");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: "",
    code: "",
    type: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    location: "",
    purchaseDate: "",
    warrantyExpiry: "",
    status: "active" as "active" | "maintenance" | "inactive" | "retired",
    notes: "",
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    maintenanceType: "preventive" as "preventive" | "corrective",
    scheduledDate: "",
    description: "",
  });

  const [recordFormData, setRecordFormData] = useState({
    maintenanceType: "preventive" as "preventive" | "corrective",
    performedDate: "",
    description: "",
    technician: "",
    cost: "",
    partsReplaced: "",
    notes: "",
  });

  const { data, isLoading, refetch } = trpc.equipment.getById.useQuery({ id: equipmentId });
  const { data: schedules, refetch: refetchSchedules } = trpc.maintenance.schedules.listByEquipment.useQuery({ equipmentId });

  const updateMutation = trpc.equipment.update.useMutation({
    onSuccess: () => {
      toast.success("Equipamento atualizado com sucesso!");
      setEditDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar equipamento: " + error.message);
    },
  });

  const deleteMutation = trpc.equipment.delete.useMutation({
    onSuccess: () => {
      toast.success("Equipamento excluído com sucesso!");
      navigate("/equipment");
    },
    onError: (error) => {
      toast.error("Erro ao excluir equipamento: " + error.message);
    },
  });

  const createScheduleMutation = trpc.maintenance.schedules.create.useMutation({
    onSuccess: () => {
      toast.success("Manutenção agendada com sucesso!");
      setScheduleDialogOpen(false);
      refetchSchedules();
      setScheduleFormData({ maintenanceType: "preventive", scheduledDate: "", description: "" });
    },
    onError: (error) => {
      toast.error("Erro ao agendar manutenção: " + error.message);
    },
  });

  const createRecordMutation = trpc.maintenance.records.create.useMutation({
    onSuccess: () => {
      toast.success("Manutenção registrada com sucesso!");
      setRecordDialogOpen(false);
      refetch();
      setRecordFormData({
        maintenanceType: "preventive",
        performedDate: "",
        description: "",
        technician: "",
        cost: "",
        partsReplaced: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao registrar manutenção: " + error.message);
    },
  });

  const handleEdit = () => {
    if (data?.equipment) {
      setEditFormData({
        name: data.equipment.name,
        code: data.equipment.code || "",
        type: data.equipment.type || "",
        manufacturer: data.equipment.manufacturer || "",
        model: data.equipment.model || "",
        serialNumber: data.equipment.serialNumber || "",
        location: data.equipment.location || "",
        purchaseDate: data.equipment.purchaseDate || "",
        warrantyExpiry: data.equipment.warrantyExpiry || "",
        status: data.equipment.status,
        notes: data.equipment.notes || "",
      });
      setEditDialogOpen(true);
    }
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ id: equipmentId, ...editFormData });
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createScheduleMutation.mutate({
      equipmentId,
      ...scheduleFormData,
    });
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRecordMutation.mutate({
      equipmentId,
      ...recordFormData,
      cost: recordFormData.cost ? parseFloat(recordFormData.cost) : undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativo", variant: "default" as const, icon: CheckCircle },
      maintenance: { label: "Em Manutenção", variant: "secondary" as const, icon: Wrench },
      inactive: { label: "Inativo", variant: "outline" as const, icon: AlertCircle },
      retired: { label: "Descartado", variant: "destructive" as const, icon: Trash2 },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
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
      scheduled: { label: "Agendada", variant: "secondary" as const },
      completed: { label: "Concluída", variant: "default" as const },
      cancelled: { label: "Cancelada", variant: "destructive" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data?.equipment) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/equipment")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Equipamento não encontrado</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  const equipment = data.equipment;
  const maintenanceHistory = data.maintenanceHistory || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/equipment")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita e
                  todos os agendamentos e registros de manutenção serão removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate({ id: equipmentId })}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Package className="h-6 w-6" />
                {equipment.name}
              </CardTitle>
              {equipment.code && <CardDescription className="text-base mt-2">Código: {equipment.code}</CardDescription>}
            </div>
            {getStatusBadge(equipment.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {equipment.type && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <p className="text-base">{equipment.type}</p>
              </div>
            )}
            {equipment.manufacturer && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fabricante</p>
                <p className="text-base">{equipment.manufacturer}</p>
              </div>
            )}
            {equipment.model && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                <p className="text-base">{equipment.model}</p>
              </div>
            )}
            {equipment.serialNumber && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Número de Série</p>
                <p className="text-base">{equipment.serialNumber}</p>
              </div>
            )}
            {equipment.location && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Localização</p>
                <p className="text-base flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {equipment.location}
                </p>
              </div>
            )}
            {equipment.purchaseDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Compra</p>
                <p className="text-base">{new Date(equipment.purchaseDate).toLocaleDateString("pt-BR")}</p>
              </div>
            )}
            {equipment.warrantyExpiry && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Garantia até</p>
                <p className="text-base">{new Date(equipment.warrantyExpiry).toLocaleDateString("pt-BR")}</p>
              </div>
            )}
          </div>
          {equipment.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Observações</p>
              <p className="text-base">{equipment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Histórico de Manutenções</TabsTrigger>
          <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manutenções Realizadas</h3>
            <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Manutenção
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleRecordSubmit}>
                  <DialogHeader>
                    <DialogTitle>Registrar Manutenção Realizada</DialogTitle>
                    <DialogDescription>Registre uma manutenção que foi realizada</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="maintenanceType">Tipo de Manutenção *</Label>
                        <Select
                          value={recordFormData.maintenanceType}
                          onValueChange={(value: "preventive" | "corrective") =>
                            setRecordFormData({ ...recordFormData, maintenanceType: value })
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
                        <Label htmlFor="performedDate">Data de Realização *</Label>
                        <Input
                          id="performedDate"
                          type="date"
                          required
                          value={recordFormData.performedDate}
                          onChange={(e) =>
                            setRecordFormData({ ...recordFormData, performedDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Descreva o que foi feito"
                        value={recordFormData.description}
                        onChange={(e) =>
                          setRecordFormData({ ...recordFormData, description: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="technician">Técnico Responsável</Label>
                        <Input
                          id="technician"
                          placeholder="Nome do técnico"
                          value={recordFormData.technician}
                          onChange={(e) =>
                            setRecordFormData({ ...recordFormData, technician: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cost">Custo (R$)</Label>
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={recordFormData.cost}
                          onChange={(e) => setRecordFormData({ ...recordFormData, cost: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="partsReplaced">Peças Substituídas</Label>
                      <Textarea
                        id="partsReplaced"
                        placeholder="Liste as peças substituídas"
                        value={recordFormData.partsReplaced}
                        onChange={(e) =>
                          setRecordFormData({ ...recordFormData, partsReplaced: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        placeholder="Observações adicionais"
                        value={recordFormData.notes}
                        onChange={(e) => setRecordFormData({ ...recordFormData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setRecordDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createRecordMutation.isPending}>
                      {createRecordMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {maintenanceHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma manutenção registrada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Registre as manutenções realizadas neste equipamento
                </p>
                <Button onClick={() => setRecordDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Manutenção
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {maintenanceHistory.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getMaintenanceTypeBadge(record.maintenanceType)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(record.performedDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {record.description && <CardDescription>{record.description}</CardDescription>}
                      </div>
                      {record.cost && (
                        <div className="flex items-center gap-1 text-lg font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {parseFloat(record.cost).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {record.technician && (
                      <div className="text-sm">
                        <span className="font-medium">Técnico:</span> {record.technician}
                      </div>
                    )}
                    {record.partsReplaced && (
                      <div className="text-sm">
                        <span className="font-medium">Peças substituídas:</span> {record.partsReplaced}
                      </div>
                    )}
                    {record.notes && (
                      <div className="text-sm">
                        <span className="font-medium">Observações:</span> {record.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manutenções Agendadas</h3>
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
                    <DialogDescription>Agende uma manutenção futura para este equipamento</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="scheduleType">Tipo de Manutenção *</Label>
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
                        onChange={(e) =>
                          setScheduleFormData({ ...scheduleFormData, scheduledDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="scheduleDescription">Descrição</Label>
                      <Textarea
                        id="scheduleDescription"
                        placeholder="Descreva o que será feito"
                        value={scheduleFormData.description}
                        onChange={(e) =>
                          setScheduleFormData({ ...scheduleFormData, description: e.target.value })
                        }
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

          {schedules && schedules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma manutenção agendada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Agende manutenções preventivas ou corretivas
                </p>
                <Button onClick={() => setScheduleDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Manutenção
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {schedules?.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getMaintenanceTypeBadge(schedule.maintenanceType)}
                          {getScheduleStatusBadge(schedule.status)}
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Agendada para: {new Date(schedule.scheduledDate).toLocaleDateString("pt-BR")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {schedule.description && (
                    <CardContent>
                      <p className="text-sm">{schedule.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleUpdateSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Equipamento</DialogTitle>
              <DialogDescription>Atualize os dados do equipamento</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editName">Nome do Equipamento *</Label>
                <Input
                  id="editName"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editCode">Código</Label>
                  <Input
                    id="editCode"
                    value={editFormData.code}
                    onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editType">Tipo</Label>
                  <Input
                    id="editType"
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editManufacturer">Fabricante</Label>
                  <Input
                    id="editManufacturer"
                    value={editFormData.manufacturer}
                    onChange={(e) => setEditFormData({ ...editFormData, manufacturer: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editModel">Modelo</Label>
                  <Input
                    id="editModel"
                    value={editFormData.model}
                    onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editSerialNumber">Número de Série</Label>
                  <Input
                    id="editSerialNumber"
                    value={editFormData.serialNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, serialNumber: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editLocation">Localização</Label>
                  <Input
                    id="editLocation"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editPurchaseDate">Data de Compra</Label>
                  <Input
                    id="editPurchaseDate"
                    type="date"
                    value={editFormData.purchaseDate}
                    onChange={(e) => setEditFormData({ ...editFormData, purchaseDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editWarrantyExpiry">Vencimento da Garantia</Label>
                  <Input
                    id="editWarrantyExpiry"
                    type="date"
                    value={editFormData.warrantyExpiry}
                    onChange={(e) => setEditFormData({ ...editFormData, warrantyExpiry: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select value={editFormData.status} onValueChange={(value) => setEditFormData({ ...editFormData, status: value as "active" | "maintenance" | "inactive" | "retired" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="retired">Descartado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editNotes">Observações</Label>
                <Textarea
                  id="editNotes"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
