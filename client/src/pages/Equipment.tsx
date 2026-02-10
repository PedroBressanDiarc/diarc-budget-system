import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Package, MapPin, Calendar, AlertCircle, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Equipment() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    location: "",
    purchaseDate: "",
    warrantyExpiry: "",
    notes: "",
  });

  const { data: equipmentList, isLoading, refetch } = trpc.equipment.list.useQuery();
  const createMutation = trpc.equipment.create.useMutation({
    onSuccess: () => {
      toast.success("Equipamento cadastrado com sucesso!");
      setOpen(false);
      refetch();
      setFormData({
        name: "",
        code: "",
        type: "",
        manufacturer: "",
        model: "",
        serialNumber: "",
        location: "",
        purchaseDate: "",
        warrantyExpiry: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar equipamento: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativo", variant: "default" as const },
      maintenance: { label: "Em Manutenção", variant: "secondary" as const },
      inactive: { label: "Inativo", variant: "outline" as const },
      retired: { label: "Descartado", variant: "destructive" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-muted-foreground">Cadastro e gestão de equipamentos e máquinas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Cadastrar Equipamento</DialogTitle>
                <DialogDescription>Preencha os dados do novo equipamento</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Equipamento *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Ex: Escavadeira Hidráulica"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Código</Label>
                    <Input
                      id="code"
                      placeholder="Ex: EQ-001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Input
                      id="type"
                      placeholder="Ex: Máquina Pesada"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="manufacturer">Fabricante</Label>
                    <Input
                      id="manufacturer"
                      placeholder="Ex: Caterpillar"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      placeholder="Ex: 320D"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="serialNumber">Número de Série</Label>
                    <Input
                      id="serialNumber"
                      placeholder="Ex: ABC123456"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      placeholder="Ex: Obra Centro"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="purchaseDate">Data de Compra</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="warrantyExpiry">Vencimento da Garantia</Label>
                    <Input
                      id="warrantyExpiry"
                      type="date"
                      value={formData.warrantyExpiry}
                      onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Informações adicionais sobre o equipamento"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {equipmentList && equipmentList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum equipamento cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece cadastrando seu primeiro equipamento
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Equipamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equipmentList?.map((equipment) => (
            <Card
              key={equipment.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setLocation(`/equipment/${equipment.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {equipment.name}
                  </CardTitle>
                  {getStatusBadge(equipment.status)}
                </div>
                {equipment.code && <CardDescription>Código: {equipment.code}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-2">
                {equipment.manufacturer && equipment.model && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {equipment.manufacturer} - {equipment.model}
                    </span>
                  </div>
                )}
                {equipment.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{equipment.location}</span>
                  </div>
                )}
                {equipment.warrantyExpiry && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Garantia até: {new Date(equipment.warrantyExpiry).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
