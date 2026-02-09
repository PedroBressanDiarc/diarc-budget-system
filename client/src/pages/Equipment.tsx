import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";

export default function Equipment() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-muted-foreground">Cadastro e gestão de equipamentos e máquinas</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Equipamento
        </Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Módulo em desenvolvimento</h3>
          <p className="text-sm text-muted-foreground">Cadastro de equipamentos com histórico de manutenções</p>
        </CardContent>
      </Card>
    </div>
  );
}
