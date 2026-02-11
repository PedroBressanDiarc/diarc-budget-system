import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Award, Package } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function SavingsDashboard() {
  const { data: ranking, isLoading: loadingRanking } = trpc.reports.savingsRanking.useQuery({});
  const { data: monthlyTrend, isLoading: loadingTrend } = trpc.reports.savingsMonthlyTrend.useQuery({ months: 12 });
  const { data: topItems, isLoading: loadingItems } = trpc.reports.topSavingItems.useQuery({ limit: 10 });
  const { data: metrics } = trpc.reports.systemMetrics.useQuery();

  // Calcular total de economias
  const totalSavings = ranking?.reduce((sum, r) => sum + Number(r.totalSavings), 0) || 0;

  // Calcular tendência (comparar últimos 2 meses)
  const trend = monthlyTrend && monthlyTrend.length >= 2
    ? Number(monthlyTrend[monthlyTrend.length - 1].totalSavings) - Number(monthlyTrend[monthlyTrend.length - 2].totalSavings)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Economias</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho de compras e economias conquistadas
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSavings)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {ranking?.length || 0} compradores ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência Mensal</CardTitle>
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{formatCurrency(trend)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisições</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalRequisitions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.totalQuotes || 0} cotações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Cotações</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avgQuotesPerRequisition ? Number(metrics.avgQuotesPerRequisition).toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              por requisição
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal de Economias</CardTitle>
          <CardDescription>Últimos 12 meses</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTrend ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Carregando...
            </div>
          ) : monthlyTrend && monthlyTrend.length > 0 ? (
            <div className="space-y-2">
              {monthlyTrend.map((item, index) => {
                const maxValue = Math.max(...monthlyTrend.map(m => Number(m.totalSavings)));
                const percentage = (Number(item.totalSavings) / maxValue) * 100;
                
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-muted-foreground">
                      {new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                    </div>
                    <div className="flex-1">
                      <div className="h-8 bg-muted rounded-md overflow-hidden">
                        <div 
                          className="h-full bg-green-600 transition-all duration-500 flex items-center px-3"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 20 && (
                            <span className="text-xs font-medium text-white">
                              {formatCurrency(item.totalSavings)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {percentage <= 20 && (
                      <div className="w-32 text-sm font-medium">
                        {formatCurrency(item.totalSavings)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ranking de Compradores */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Compradores</CardTitle>
            <CardDescription>Por economia total conquistada</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRanking ? (
              <div className="text-center text-muted-foreground py-8">Carregando...</div>
            ) : ranking && ranking.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead className="text-right">Economia</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((item, index) => (
                    <TableRow key={item.userId}>
                      <TableCell>
                        {index === 0 && <Badge variant="default" className="bg-yellow-500">🥇</Badge>}
                        {index === 1 && <Badge variant="secondary">🥈</Badge>}
                        {index === 2 && <Badge variant="outline">🥉</Badge>}
                        {index > 2 && <span className="text-muted-foreground">{index + 1}º</span>}
                      </TableCell>
                      <TableCell className="font-medium">{item.userName}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(item.totalSavings)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.savingsCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma economia registrada ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 10 Itens */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Itens com Maior Economia</CardTitle>
            <CardDescription>Itens que mais geraram economia</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingItems ? (
              <div className="text-center text-muted-foreground py-8">Carregando...</div>
            ) : topItems && topItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Economia</TableHead>
                    <TableHead className="text-right">Vezes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topItems.map((item) => (
                    <TableRow key={item.itemId}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {item.itemName}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(item.totalSavings)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.timesQuoted}x
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhum item com economia ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
