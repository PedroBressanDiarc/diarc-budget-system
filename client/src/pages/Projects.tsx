import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Projects() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const { data: projects, refetch } = trpc.projects.list.useQuery();
  const createMutation = trpc.projects.create.useMutation();
  const updateMutation = trpc.projects.update.useMutation();
  const deleteMutation = trpc.projects.delete.useMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Obra criada com sucesso!");
      setIsCreateOpen(false);
      setFormData({ name: "", startDate: "", endDate: "" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar obra");
    }
  };

  const handleOpenEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      await updateMutation.mutateAsync({ id: editingProject.id, ...formData });
      toast.success("Obra atualizada com sucesso!");
      setIsEditOpen(false);
      setEditingProject(null);
      setFormData({ name: "", startDate: "", endDate: "" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar obra");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta obra?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Obra excluída com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir obra");
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Obras</CardTitle>
            <CardDescription>Cadastro de obras e projetos</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Obra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Nova Obra</DialogTitle>
                  <DialogDescription>Cadastre uma nova obra ou projeto</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">Data de Fim</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Criando..." : "Criar Obra"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Data de Fim</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects?.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{formatDate(project.startDate)}</TableCell>
                  <TableCell>{formatDate(project.endDate)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(project)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!projects || projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhuma obra cadastrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Editar Obra</DialogTitle>
              <DialogDescription>Atualize as informações da obra</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Data de Início</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">Data de Fim</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
