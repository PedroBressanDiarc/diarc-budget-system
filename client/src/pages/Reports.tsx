import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Package, Clock, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useLocation } from "wouter";

const statusLabels: Record<string, string> = {
  solicitacao: "Solicitação",
  cotacao_em_progresso: "Cotação em Progresso",
  cotacoes_em_analise: "Cotações em Análise",
  aguardando_autorizacao: "Aguardando Autorização",
  autorizado: "Autorizado",
  ordem_compra_enviada: "Ordem de Compra Enviada",
  aguardando_recebimento: "Aguardando Recebimento",
  recebido: "Recebido",
  cancelado: "Cancelado",
};

export default function Reports() {
  const [, setLocation] = useLocation();

  const { data: requisitionsByStatus } = trpc.reports.requisitionsByStatus.useQuery();
  const { data: topSuppliers } = trpc.reports.topSuppliers.useQuery({ limit: 10 });
  const { data: metrics } = trpc.reports.systemMetrics.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Análises e estatísticas do sistema de compras
        </p>
      </div>

      {/* Cards de Acesso Rápido */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setLocation("/relatorios/economias")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dashboard de Economias</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics?.totalSavings || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total economizado
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setLocation("/relatorios/obras")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatório por Obras</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Ver Detalhes
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Economias por projeto
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setLocation("/alertas-orcamento")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Orçamento</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Gerenciar
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cotações excedidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Por Status</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        {/* Requisições por Status */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requisições por Status</CardTitle>
              <CardDescription>Distribuição de requisições no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {requisitionsByStatus && requisitionsByStatus.length > 0 ? (
                <div className="space-y-4">
                  {requisitionsByStatus.map((item) => {
                    const total = requisitionsByStatus.reduce((sum, i) => sum + Number(i.count), 0);
                    const percentage = (Number(item.count) / total) * 100;

                    return (
                      <div key={item.status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{statusLabels[item.status] || item.status}</span>
                          <span className="text-muted-foreground">
                            {item.count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fornecedores Mais Utilizados */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Fornecedores</CardTitle>
              <CardDescription>Fornecedores mais utilizados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {topSuppliers && topSuppliers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead className="text-right">Cotações</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSuppliers.map((supplier, index) => (
                      <TableRow key={supplier.supplierId}>
                        <TableCell>
                          {index === 0 && <Badge variant="default">🥇</Badge>}
                          {index === 1 && <Badge variant="secondary">🥈</Badge>}
                          {index === 2 && <Badge variant="outline">🥉</Badge>}
                          {index > 2 && <span className="text-muted-foreground">{index + 1}º</span>}
                        </TableCell>
                        <TableCell className="font-medium">{supplier.supplierName}</TableCell>
                        <TableCell className="text-right">{supplier.quotesCount}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(supplier.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum fornecedor cadastrado ainda
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métricas Gerais */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalRequisitions || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requisições criadas no sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Cotações</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalQuotes || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cotações recebidas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média de Cotações</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.avgQuotesPerRequisition ? Number(metrics.avgQuotesPerRequisition).toFixed(1) : '0.0'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por requisição
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics?.totalSavings || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Economizado até agora
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Indicadores de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Performance</CardTitle>
              <CardDescription>Análise de eficiência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Taxa de Conclusão</span>
                  <span className="text-sm font-semibold">
                    {requisitionsByStatus && requisitionsByStatus.length > 0
                      ? (
                          (Number(requisitionsByStatus.find(s => s.status === 'recebido')?.count || 0) / 
                          requisitionsByStatus.reduce((sum, s) => sum + Number(s.count), 0)) * 100
                        ).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600" 
                    style={{ 
                      width: `${requisitionsByStatus && requisitionsByStatus.length > 0
                        ? (Number(requisitionsByStatus.find(s => s.status === 'recebido')?.count || 0) / 
                          requisitionsByStatus.reduce((sum, s) => sum + Number(s.count), 0)) * 100
                        : 0}%` 
                    }} 
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requisições concluídas vs total
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Taxa de Aprovação</span>
                  <span className="text-sm font-semibold">
                    {requisitionsByStatus && requisitionsByStatus.length > 0
                      ? (
                          (Number(requisitionsByStatus.find(s => s.status === 'autorizado')?.count || 0) / 
                          requisitionsByStatus.reduce((sum, s) => sum + Number(s.count), 0)) * 100
                        ).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600" 
                    style={{ 
                      width: `${requisitionsByStatus && requisitionsByStatus.length > 0
                        ? (Number(requisitionsByStatus.find(s => s.status === 'autorizado')?.count || 0) / 
                          requisitionsByStatus.reduce((sum, s) => sum + Number(s.count), 0)) * 100
                        : 0}%` 
                    }} 
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requisições autorizadas vs total
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
