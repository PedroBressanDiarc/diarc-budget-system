import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BudgetDetail() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/orcamentos")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detalhes do Orçamento</h1>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
}
