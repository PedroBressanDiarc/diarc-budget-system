import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";

const stageLabels: Record<string, string> = {
  prospeccao: "Prospecção",
  qualificacao: "Qualificação",
  proposta: "Proposta",
  negociacao: "Negociação",
  fechamento: "Fechamento",
  ganho: "Ganho",
  perdido: "Perdido",
};

const stageColors: Record<string, string> = {
  prospeccao: "bg-gray-500",
  qualificacao: "bg-blue-500",
  proposta: "bg-yellow-500",
  negociacao: "bg-orange-500",
  fechamento: "bg-purple-500",
  ganho: "bg-green-600",
  perdido: "bg-red-500",
};

export default function CRMOpportunities() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    stage: "prospeccao" as any,
    probability: 0,
    expectedCloseDate: "",
    description: "",
    assignedTo: 1, // ID do usuário atual
  });

  const { data: opportunities, refetch } = trpc.crm.opportunities.list.useQuery();
  const { data: clients } = trpc.budgets.clients.list.useQuery();
  
  const createOpportunity = trpc.crm.opportunities.create.useMutation({
    onSuccess: () => {
      toast.success("Oportunidade criada com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar oportunidade: ${error.message}`);
    },
  });

  const updateOpportunity = trpc.crm.opportunities.update.useMutation({
    onSuccess: () => {
      toast.success("Oportunidade atualizada com sucesso!");
      setIsDialogOpen(false);
      setEditingOpportunity(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar oportunidade: ${error.message}`);
    },
  });

  const deleteOpportunity = trpc.crm.opportunities.delete.useMutation({
    onSuccess: () => {
      toast.success("Oportunidade excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir oportunidade: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      value: "",
      stage: "prospeccao",
      probability: 0,
      expectedCloseDate: "",
      description: "",
      assignedTo: 1,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingOpportunity) {
      updateOpportunity.mutate({ id: editingOpportunity.id, ...formData });
    } else {
      createOpportunity.mutate(formData);
    }
  };

  const handleEdit = (opportunity: any) => {
    setEditingOpportunity(opportunity);
    setFormData({
      title: opportunity.title || "",
      value: opportunity.value || "",
      stage: opportunity.stage || "prospeccao",
      probability: opportunity.probability || 0,
      expectedCloseDate: opportunity.expectedCloseDate || "",
      description: opportunity.description || "",
      assignedTo: opportunity.assignedTo || 1,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta oportunidade?")) {
      deleteOpportunity.mutate({ id });
    }
  };

  const calculateTotalValue = () => {
    if (!opportunities) return 0;
    return opportunities
      .filter((opp: any) => opp.stage !== "perdido" && opp.stage !== "ganho")
      .reduce((sum: number, opp: any) => sum + (parseFloat(opp.value) || 0), 0);
  };

  const calculateWeightedValue = () => {
    if (!opportunities) return 0;
    return opportunities
      .filter((opp: any) => opp.stage !== "perdido" && opp.stage !== "ganho")
      .reduce((sum: number, opp: any) => sum + ((parseFloat(opp.value) || 0) * (opp.probability || 0) / 100), 0);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Oportunidades</h1>
          <p className="text-muted-foreground">Gerencie seu pipeline de vendas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingOpportunity(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingOpportunity ? "Editar Oportunidade" : "Nova Oportunidade"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados da oportunidade de venda
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value">Valor (R$)</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedCloseDate">Data Prevista de Fechamento</Label>
                    <Input
                      id="expectedCloseDate"
                      type="date"
                      value={formData.expectedCloseDate}
                      onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stage">Estágio</Label>
                    <Select value={formData.stage} onValueChange={(value: any) => setFormData({ ...formData, stage: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(stageLabels).filter(([key]) => key !== "ganho" && key !== "perdido").map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="probability">Probabilidade (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createOpportunity.isPending || updateOpportunity.isPending}>
                  {editingOpportunity ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total em Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(calculateTotalValue())}</div>
            <p className="text-xs text-muted-foreground">Oportunidades ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Ponderado</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(calculateWeightedValue())}</div>
            <p className="text-xs text-muted-foreground">Baseado na probabilidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Oportunidades</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities?.length || 0}</div>
            <p className="text-xs text-muted-foreground">No sistema</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Oportunidades</CardTitle>
          <CardDescription>
            Acompanhe suas oportunidades de venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {opportunities && opportunities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estágio</TableHead>
                  <TableHead>Probabilidade</TableHead>
                  <TableHead>Data Prevista</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((opp: any) => (
                  <TableRow key={opp.id}>
                    <TableCell className="font-medium">{opp.title}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(opp.value) || 0)}</TableCell>
                    <TableCell>
                      <Badge className={stageColors[opp.stage]}>
                        {stageLabels[opp.stage]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${opp.probability}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{opp.probability}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString('pt-BR') : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(opp)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(opp.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma oportunidade cadastrada ainda
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
