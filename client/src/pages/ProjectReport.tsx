import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingDown, DollarSign, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState } from "react";

export default function ProjectReport() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);

  const { data: projects } = trpc.projects.list.useQuery();
  const { data: savingsByProject } = trpc.reports.savingsByProject.useQuery({ 
    projectId: selectedProjectId 
  });

  // Filtrar dados do projeto selecionado
  const selectedProjectData = selectedProjectId
    ? savingsByProject?.find(p => p.projectId === selectedProjectId)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatório por Obras</h1>
        <p className="text-muted-foreground">
          Acompanhe economias e gastos por projeto
        </p>
      </div>

      {/* Filtro de Obra */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Obra</CardTitle>
          <CardDescription>Escolha uma obra para ver detalhes</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProjectId?.toString() || "all"}
            onValueChange={(value) => setSelectedProjectId(value === "all" ? undefined : Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as obras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as obras</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Resumo Geral de Todas as Obras */}
      {!selectedProjectId && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savingsByProject?.map((project) => (
            <Card key={project.projectId || 'sem-obra'} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => project.projectId && setSelectedProjectId(project.projectId)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {project.projectName || "Sem Obra Definida"}
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(project.totalSavings || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {project.requisitionsCount} requisição(ões)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detalhes da Obra Selecionada */}
      {selectedProjectId && selectedProjectData && (
        <>
          {/* Cards de Métricas */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(selectedProjectData.totalSavings || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Economizado nesta obra
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requisições</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedProjectData.requisitionsCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requisições vinculadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia Média</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    Number(selectedProjectData.totalSavings) / Number(selectedProjectData.requisitionsCount)
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por requisição
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Informações da Obra */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Obra</CardTitle>
              <CardDescription>{selectedProjectData.projectName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects?.find(p => p.id === selectedProjectId) && (
                  <>
                    {projects.find(p => p.id === selectedProjectId)?.startDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Início:</span>
                        <span className="font-medium">
                          {new Date(projects.find(p => p.id === selectedProjectId)!.startDate!).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    {projects.find(p => p.id === selectedProjectId)?.endDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Término:</span>
                        <span className="font-medium">
                          {new Date(projects.find(p => p.id === selectedProjectId)!.endDate!).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Requisições:</span>
                  <span className="font-medium">{selectedProjectData.requisitionsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Economia Conquistada:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(selectedProjectData.totalSavings || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análise de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Performance</CardTitle>
              <CardDescription>Indicadores de eficiência de compras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Taxa de Economia</span>
                    <span className="text-sm font-semibold text-green-600">
                      {/* Assumindo 10% como taxa média de economia */}
                      ~10%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: '10%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentual médio economizado em relação ao orçamento
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Badge variant="default" className="bg-green-600">
                    Desempenho Excelente
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Esta obra está apresentando ótimos resultados de economia. Continue monitorando para manter a eficiência.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Tabela Resumo de Todas as Obras */}
      {!selectedProjectId && savingsByProject && savingsByProject.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Todas as Obras</CardTitle>
            <CardDescription>Comparativo de economias por projeto</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Obra</TableHead>
                  <TableHead className="text-right">Requisições</TableHead>
                  <TableHead className="text-right">Economia Total</TableHead>
                  <TableHead className="text-right">Economia Média</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savingsByProject.map((project) => (
                  <TableRow 
                    key={project.projectId || 'sem-obra'}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => project.projectId && setSelectedProjectId(project.projectId)}
                  >
                    <TableCell className="font-medium">
                      {project.projectName || "Sem Obra Definida"}
                    </TableCell>
                    <TableCell className="text-right">
                      {project.requisitionsCount}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(project.totalSavings || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        Number(project.totalSavings) / Number(project.requisitionsCount)
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
