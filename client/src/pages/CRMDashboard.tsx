import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Target, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useLocation } from "wouter";

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
  prospeccao: "#6B7280",
  qualificacao: "#3B82F6",
  proposta: "#F59E0B",
  negociacao: "#10B981",
  fechamento: "#8B5CF6",
  ganho: "#059669",
  perdido: "#DC2626",
};

const statusLabels: Record<string, string> = {
  novo: "Novo",
  contatado: "Contatado",
  qualificado: "Qualificado",
  proposta_enviada: "Proposta Enviada",
  negociacao: "Negociação",
  ganho: "Ganho",
  perdido: "Perdido",
};

export default function CRMDashboard() {
  const [, setLocation] = useLocation();
  
  const { data: dashboard } = trpc.crm.dashboard.useQuery();
  const { data: leads } = trpc.crm.leads.list.useQuery();
  const { data: opportunities } = trpc.crm.opportunities.list.useQuery();

  const calculateConversionRate = () => {
    if (!leads || leads.length === 0) return 0;
    const wonLeads = leads.filter((lead: any) => lead.status === "ganho").length;
    return ((wonLeads / leads.length) * 100).toFixed(1);
  };

  const calculateWinRate = () => {
    if (!opportunities) return 0;
    const closedOpps = opportunities.filter((opp: any) => opp.stage === "ganho" || opp.stage === "perdido");
    if (closedOpps.length === 0) return 0;
    const wonOpps = closedOpps.filter((opp: any) => opp.stage === "ganho").length;
    return ((wonOpps / closedOpps.length) * 100).toFixed(1);
  };

  const getTotalPipelineValue = () => {
    if (!opportunities) return 0;
    return opportunities
      .filter((opp: any) => opp.stage !== "ganho" && opp.stage !== "perdido")
      .reduce((sum: number, opp: any) => sum + (parseFloat(opp.value) || 0), 0);
  };

  const getTotalWonValue = () => {
    if (!opportunities) return 0;
    return opportunities
      .filter((opp: any) => opp.stage === "ganho")
      .reduce((sum: number, opp: any) => sum + (parseFloat(opp.value) || 0), 0);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard CRM</h1>
        <p className="text-muted-foreground">Visão geral do seu funil de vendas</p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/crm/leads")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Taxa de conversão: {calculateConversionRate()}%
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/crm/oportunidades")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades Ativas</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities?.filter((o: any) => o.stage !== "ganho" && o.stage !== "perdido").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa de ganho: {calculateWinRate()}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Pipeline</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalPipelineValue())}
            </div>
            <p className="text-xs text-muted-foreground">
              Oportunidades ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Ganhas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(getTotalWonValue())}
            </div>
            <p className="text-xs text-muted-foreground">
              Total fechado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Vendas</CardTitle>
          <CardDescription>Distribuição de oportunidades por estágio</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboard?.opportunitiesByStage && dashboard.opportunitiesByStage.length > 0 ? (
            <div className="space-y-4">
              {dashboard.opportunitiesByStage
                .filter((item: any) => item.stage !== "ganho" && item.stage !== "perdido")
                .map((item: any) => {
                  const totalActive = dashboard.opportunitiesByStage
                    .filter((i: any) => i.stage !== "ganho" && i.stage !== "perdido")
                    .reduce((sum: number, i: any) => sum + Number(i.count), 0);
                  const percentage = totalActive > 0 ? (Number(item.count) / totalActive) * 100 : 0;
                  const value = parseFloat(item.totalValue) || 0;

                  return (
                    <div key={item.stage} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stageColors[item.stage] }}
                          />
                          <span className="font-medium">{stageLabels[item.stage]}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {item.count} oportunidade(s)
                          </span>
                          <span className="font-semibold">{formatCurrency(value)}</span>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: stageColors[item.stage],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma oportunidade no pipeline
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads por Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads por Status</CardTitle>
            <CardDescription>Distribuição de leads no funil</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.leadsByStatus && dashboard.leadsByStatus.length > 0 ? (
              <div className="space-y-3">
                {dashboard.leadsByStatus.map((item: any) => {
                  const total = dashboard.leadsByStatus.reduce((sum: number, i: any) => sum + Number(i.count), 0);
                  const percentage = total > 0 ? (Number(item.count) / total) * 100 : 0;

                  return (
                    <div key={item.status} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{statusLabels[item.status]}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhum lead cadastrado
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/crm/tarefas")}>
          <CardHeader>
            <CardTitle>Tarefas Pendentes</CardTitle>
            <CardDescription>Follow-ups e atividades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <Clock className="h-12 w-12 text-yellow-600 mx-auto" />
                <div className="text-3xl font-bold">{dashboard?.pendingTasksCount || 0}</div>
                <p className="text-sm text-muted-foreground">
                  Tarefas aguardando execução
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados Finais */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Oportunidades Ganhas</CardTitle>
              <CardDescription>Negócios fechados com sucesso</CardDescription>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {opportunities?.filter((o: any) => o.stage === "ganho").length || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Valor total: {formatCurrency(getTotalWonValue())}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Oportunidades Perdidas</CardTitle>
              <CardDescription>Negócios não concretizados</CardDescription>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {opportunities?.filter((o: any) => o.stage === "perdido").length || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Analisar motivos de perda
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
