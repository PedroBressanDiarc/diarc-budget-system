import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Análises e relatórios exportáveis</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Módulo em desenvolvimento</h3>
          <p className="text-sm text-muted-foreground">Relatórios de compras, fornecedores e manutenções</p>
        </CardContent>
      </Card>
    </div>
  );
}
