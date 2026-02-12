import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, CheckCircle, Clock, AlertCircle, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function PaymentsReceived() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    projectId: 0,
    valor: "",
    parcela: 1,
    dataPrevista: "",
    observacoes: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Queries
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: payments, refetch } = trpc.paymentsReceived.list.useQuery(
    selectedProject ? { projectId: selectedProject } : undefined
  );
  const { data: summary } = trpc.paymentsReceived.summaryByProject.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject }
  );

  // Mutations
  const createPayment = trpc.paymentsReceived.create.useMutation({
    onSuccess: () => {
      toast.success("Recebimento cadastrado com sucesso!");
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updatePayment = trpc.paymentsReceived.update.useMutation({
    onSuccess: () => {
      toast.success("Recebimento atualizado com sucesso!");
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deletePayment = trpc.paymentsReceived.delete.useMutation({
    onSuccess: () => {
      toast.success("Recebimento excluído com sucesso!");
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      projectId: 0,
      valor: "",
      parcela: 1,
      dataPrevista: "",
      observacoes: "",
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (editingId) {
      updatePayment.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      createPayment.mutate(formData);
    }
  };

  const handleEdit = (payment: any) => {
    setEditingId(payment.id);
    setFormData({
      projectId: payment.projectId,
      valor: payment.valor,
      parcela: payment.parcela,
      dataPrevista: payment.dataPrevista,
      observacoes: payment.observacoes || "",
    });
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pendente: <span className="flex items-center gap-1 text-yellow-600"><Clock className="w-4 h-4" /> Pendente</span>,
      recebido: <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /> Recebido</span>,
      atrasado: <span className="flex items-center gap-1 text-red-600"><AlertCircle className="w-4 h-4" /> Atrasado</span>,
    };
    return badges[status as keyof typeof badges] || status;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recebimentos</h1>
          <p className="text-muted-foreground">Gestão de recebimentos por obra</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Recebimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Recebimento" : "Novo Recebimento"}</DialogTitle>
              <DialogDescription>Cadastre um novo recebimento de obra</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Obra</Label>
                <Select
                  value={formData.projectId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, projectId: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project: any) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label>Parcela</Label>
                <Input
                  type="number"
                  value={formData.parcela}
                  onChange={(e) => setFormData({ ...formData, parcela: Number(e.target.value) })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label>Data Prevista</Label>
                <Input
                  type="date"
                  value={formData.dataPrevista}
                  onChange={(e) => setFormData({ ...formData, dataPrevista: e.target.value })}
                />
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtro por Obra */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Obra</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProject?.toString() || "all"}
            onValueChange={(value) => setSelectedProject(value === "all" ? null : Number(value))}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Todas as obras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as obras</SelectItem>
              {projects?.map((project: any) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      {selectedProject && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Previsto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalPrevisto)}</p>
              <p className="text-sm text-muted-foreground mt-1">{summary.totalParcelas} parcelas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Total Recebido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalRecebido)}</p>
              <p className="text-sm text-muted-foreground mt-1">{summary.parcelasRecebidas} parcelas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-600">Total Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.totalPendente)}</p>
              <p className="text-sm text-muted-foreground mt-1">{summary.parcelasPendentes} parcelas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de Recebimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Recebimentos Cadastrados</CardTitle>
          <CardDescription>
            {selectedProject
              ? `Recebimentos da obra selecionada`
              : "Todos os recebimentos cadastrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Obra</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data Prevista</TableHead>
                <TableHead>Data Recebimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comprovante</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments && payments.length > 0 ? (
                payments.map((payment: any) => {
                  const project = projects?.find((p: any) => p.id === payment.projectId);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{project?.name || "N/A"}</TableCell>
                      <TableCell>{payment.parcela}ª</TableCell>
                      <TableCell>{formatCurrency(payment.valor)}</TableCell>
                      <TableCell>{formatDate(payment.dataPrevista)}</TableCell>
                      <TableCell>
                        {payment.dataRecebimento ? formatDate(payment.dataRecebimento) : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.comprovante ? (
                          <a href={payment.comprovante} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Ver comprovante
                          </a>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                // Upload para S3
                                const formData = new FormData();
                                formData.append("file", file);
                                
                                try {
                                  // Aqui você implementaria o upload para S3
                                  // Por enquanto, vamos simular com uma URL
                                  const url = URL.createObjectURL(file);
                                  
                                  await updatePayment.mutateAsync({
                                    id: payment.id,
                                    comprovante: url,
                                    status: "recebido",
                                    dataRecebimento: new Date().toISOString().split('T')[0],
                                  });
                                  
                                  toast.success("Comprovante enviado com sucesso!");
                                } catch (error) {
                                  toast.error("Erro ao enviar comprovante");
                                }
                              }}
                            />
                            <Button variant="outline" size="sm" type="button">
                              <Upload className="w-4 h-4 mr-1" />
                              Upload
                            </Button>
                          </label>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(payment)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Deseja realmente excluir este recebimento?")) {
                                deletePayment.mutate({ id: payment.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nenhum recebimento cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
