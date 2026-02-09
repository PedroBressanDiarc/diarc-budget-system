import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wrench } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manutenções</h1>
          <p className="text-muted-foreground">Agendamento e histórico de manutenções</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agendar Manutenção
        </Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Módulo em desenvolvimento</h3>
          <p className="text-sm text-muted-foreground">Manutenções preventivas e corretivas com agendamento</p>
        </CardContent>
      </Card>
    </div>
  );
}
