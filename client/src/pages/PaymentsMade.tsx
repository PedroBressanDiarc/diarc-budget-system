import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function PaymentsMade() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="w-6 h-6" />
            Pagamentos - Em Desenvolvimento
          </CardTitle>
          <CardDescription>
            O módulo de Pagamentos a Fornecedores está em desenvolvimento e será disponibilizado em breve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Este módulo permitirá gerenciar pagamentos feitos a fornecedores, incluindo:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
            <li>Cadastro de pagamentos por fornecedor</li>
            <li>Controle de datas previstas e realizadas</li>
            <li>Upload de comprovantes de pagamento</li>
            <li>Relatórios de pagamentos por período</li>
            <li>Integração com requisições de compra</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
