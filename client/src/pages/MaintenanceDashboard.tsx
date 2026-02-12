import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Wrench, AlertTriangle, CheckCircle, Clock, TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function MaintenanceDashboard() {
  const [, setLocation] = useLocation();
  
  // Buscar dados de manutenções
  const { data: schedules } = trpc.maintenance.schedules.list.useQuery();
  const { data: records } = trpc.maintenance.records.list.useQuery();
  const { data: equipment } = trpc.equipment.list.useQuery();
  const { data: upcomingSchedules } = trpc.maintenance.schedules.upcoming.useQuery();

  // Calcular estatísticas
  const totalEquipment = equipment?.length || 0;
  const totalSchedules = schedules?.length || 0;
  const totalRecords = records?.length || 0;
  const upcomingCount = upcomingSchedules?.length || 0;

  // Manutenções atrasadas (agendadas para antes de hoje e status pending)
  const overdueSchedules = schedules?.filter(s => {
    const scheduledDate = new Date(s.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduledDate < today && s.status === 'pending';
  }) || [];

  // Manutenções concluídas este mês
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const completedThisMonth = records?.filter(r => {
    const date = new Date(r.performedDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }) || [];

  // Custo total de manutenções este mês
  const totalCostThisMonth = completedThisMonth.reduce((sum, r) => sum + (r.cost || 0), 0);

  // Equipamentos com mais manutenções
  const equipmentMaintenanceCount = records?.reduce((acc, record) => {
    const eqId = record.equipmentId;
    acc[eqId] = (acc[eqId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  const topEquipment = Object.entries(equipmentMaintenanceCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([eqId, count]) => {
      const eq = equipment?.find(e => e.id === parseInt(eqId));
      return { name: eq?.name || 'Desconhecido', count };
    });

  // Manutenções por tipo
  const preventiveCount = schedules?.filter(s => s.maintenanceType === 'preventive').length || 0;
  const correctiveCount = schedules?.filter(s => s.maintenanceType === 'corrective').length || 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Manutenções</h1>
        <p className="text-muted-foreground">Visão geral completa do sistema de manutenções</p>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/equipment')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Equipamentos</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipment}</div>
            <p className="text-xs text-muted-foreground">Equipamentos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/manutencoes')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Manutenções</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">Nos próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenções Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueSchedules.length}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas Este Mês</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedThisMonth.length}</div>
            <p className="text-xs text-muted-foreground">
              Custo: R$ {totalCostThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Linha 2: Cards de Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manutenções por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Manutenções por Tipo</CardTitle>
            <CardDescription>Distribuição entre preventivas e corretivas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Preventivas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{preventiveCount}</span>
                <Badge variant="secondary">
                  {totalSchedules > 0 ? Math.round((preventiveCount / totalSchedules) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm">Corretivas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{correctiveCount}</span>
                <Badge variant="secondary">
                  {totalSchedules > 0 ? Math.round((correctiveCount / totalSchedules) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total de Agendamentos</span>
                <span className="text-2xl font-bold">{totalSchedules}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipamentos com Mais Manutenções */}
        <Card>
          <CardHeader>
            <CardTitle>Equipamentos com Mais Manutenções</CardTitle>
            <CardDescription>Top 5 equipamentos que mais receberam manutenção</CardDescription>
          </CardHeader>
          <CardContent>
            {topEquipment.length > 0 ? (
              <div className="space-y-3">
                {topEquipment.map((eq, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium truncate max-w-[200px]">{eq.name}</span>
                    </div>
                    <Badge variant="outline">{eq.count} manutenções</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma manutenção registrada ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manutenções Atrasadas - Lista Detalhada */}
      {overdueSchedules.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Manutenções Atrasadas - Atenção Necessária
            </CardTitle>
            <CardDescription>Manutenções que deveriam ter sido realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueSchedules.slice(0, 5).map((schedule) => {
                const eq = equipment?.find(e => e.id === schedule.equipmentId);
                const daysOverdue = Math.floor(
                  (new Date().getTime() - new Date(schedule.scheduledDate).getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/equipment/${schedule.equipmentId}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{eq?.name || 'Equipamento desconhecido'}</p>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {schedule.maintenanceType === 'preventive' ? 'Preventiva' : 'Corretiva'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">{daysOverdue} dias atrasado</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Previsto: {new Date(schedule.scheduledDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximas Manutenções */}
      {upcomingSchedules && upcomingSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Próximas Manutenções (30 dias)
            </CardTitle>
            <CardDescription>Manutenções agendadas para as próximas semanas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSchedules.slice(0, 5).map((schedule) => {
                const eq = equipment?.find(e => e.id === schedule.equipmentId);
                const daysUntil = Math.ceil(
                  (new Date(schedule.scheduledDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/equipment/${schedule.equipmentId}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{eq?.name || 'Equipamento desconhecido'}</p>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {schedule.maintenanceType === 'preventive' ? 'Preventiva' : 'Corretiva'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-blue-100">
                        Em {daysUntil} {daysUntil === 1 ? 'dia' : 'dias'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(schedule.scheduledDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
