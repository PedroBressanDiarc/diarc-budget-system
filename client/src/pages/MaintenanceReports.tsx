import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Filter, Calendar, DollarSign, Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MaintenanceReports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: records } = trpc.maintenance.records.list.useQuery();
  const { data: schedules } = trpc.maintenance.schedules.list.useQuery();
  const { data: equipment } = trpc.equipment.list.useQuery();

  // Filtrar registros
  const filteredRecords = records?.filter(record => {
    let matches = true;

    if (startDate) {
      const recordDate = new Date(record.completedDate);
      const filterStart = new Date(startDate);
      if (recordDate < filterStart) matches = false;
    }

    if (endDate) {
      const recordDate = new Date(record.completedDate);
      const filterEnd = new Date(endDate);
      if (recordDate > filterEnd) matches = false;
    }

    if (selectedEquipment !== "all") {
      if (record.equipmentId !== parseInt(selectedEquipment)) matches = false;
    }

    return matches;
  }) || [];

  // Filtrar agendamentos
  const filteredSchedules = schedules?.filter(schedule => {
    let matches = true;

    if (selectedEquipment !== "all") {
      if (schedule.equipmentId !== parseInt(selectedEquipment)) matches = false;
    }

    if (selectedType !== "all") {
      if (schedule.type !== selectedType) matches = false;
    }

    return matches;
  }) || [];

  // Calcular estatísticas
  const totalCost = filteredRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
  const avgCost = filteredRecords.length > 0 ? totalCost / filteredRecords.length : 0;
  const preventiveCount = filteredSchedules.filter(s => s.type === 'preventive').length;
  const correctiveCount = filteredSchedules.filter(s => s.type === 'corrective').length;

  // Função para exportar para CSV
  const exportToCSV = () => {
    const headers = ['Data', 'Equipamento', 'Descrição', 'Técnico', 'Custo', 'Peças Utilizadas'];
    const rows = filteredRecords.map(record => {
      const eq = equipment?.find(e => e.id === record.equipmentId);
      return [
        new Date(record.completedDate).toLocaleDateString('pt-BR'),
        eq?.name || 'Desconhecido',
        record.description || '',
        record.technician || '',
        `R$ ${(record.cost || 0).toFixed(2)}`,
        record.partsUsed || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_manutencoes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios de Manutenções</h1>
          <p className="text-muted-foreground">Análises detalhadas e exportação de dados</p>
        </div>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>Filtre os dados para gerar relatórios personalizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipamento</Label>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {equipment?.map(eq => (
                    <SelectItem key={eq.id} value={eq.id.toString()}>
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="preventive">Preventiva</SelectItem>
                  <SelectItem value="corrective">Corretiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Manutenções</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRecords.length}</div>
            <p className="text-xs text-muted-foreground">Manutenções realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Soma de todos os custos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {avgCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Por manutenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSchedules.length}</div>
            <p className="text-xs text-muted-foreground">
              {preventiveCount} preventivas, {correctiveCount} corretivas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Tabelas */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Manutenções Realizadas</TabsTrigger>
          <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
          <TabsTrigger value="costs">Análise de Custos</TabsTrigger>
        </TabsList>

        {/* Tab: Manutenções Realizadas */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Manutenções Realizadas</CardTitle>
              <CardDescription>Histórico completo de manutenções concluídas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Peças</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => {
                      const eq = equipment?.find(e => e.id === record.equipmentId);
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            {new Date(record.completedDate).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-medium">{eq?.name || 'Desconhecido'}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {record.description || '-'}
                          </TableCell>
                          <TableCell>{record.technician || '-'}</TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600">
                              R$ {(record.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">
                            {record.partsUsed || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhuma manutenção encontrada com os filtros selecionados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Agendamentos */}
        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos</CardTitle>
              <CardDescription>Manutenções agendadas e seu status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Agendada</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.length > 0 ? (
                    filteredSchedules.map((schedule) => {
                      const eq = equipment?.find(e => e.id === schedule.equipmentId);
                      return (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            {new Date(schedule.scheduledDate).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-medium">{eq?.name || 'Desconhecido'}</TableCell>
                          <TableCell>
                            <Badge variant={schedule.type === 'preventive' ? 'default' : 'secondary'}>
                              {schedule.type === 'preventive' ? 'Preventiva' : 'Corretiva'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {schedule.description || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                schedule.status === 'completed'
                                  ? 'default'
                                  : schedule.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {schedule.status === 'completed'
                                ? 'Concluída'
                                : schedule.status === 'pending'
                                ? 'Pendente'
                                : 'Cancelada'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum agendamento encontrado com os filtros selecionados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Análise de Custos */}
        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Custos por Equipamento</CardTitle>
              <CardDescription>Custos totais de manutenção por equipamento</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Qtd. Manutenções</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Custo Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment?.map((eq) => {
                    const eqRecords = filteredRecords.filter(r => r.equipmentId === eq.id);
                    const eqTotal = eqRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
                    const eqAvg = eqRecords.length > 0 ? eqTotal / eqRecords.length : 0;

                    if (eqRecords.length === 0) return null;

                    return (
                      <TableRow key={eq.id}>
                        <TableCell className="font-medium">{eq.name}</TableCell>
                        <TableCell>{eqRecords.length}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            R$ {eqTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell>
                          R$ {eqAvg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
