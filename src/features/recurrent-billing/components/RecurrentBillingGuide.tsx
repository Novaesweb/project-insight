import { Card, CardContent } from "@/components/ui/card";

interface RecurrentBillingGuideProps {
  diaCorte: number;
}

export function RecurrentBillingGuide({ diaCorte }: RecurrentBillingGuideProps) {
  const guideItems = [
    { color: "bg-blue-500", text: `Extras adicionados após o dia ${diaCorte} vão para o mês seguinte` },
    { color: "bg-emerald-500", text: "Selecione clientes → Gerar Fatura → escolha mês e vencimento" },
    { color: "bg-amber-500", text: "A fatura fica como RASCUNHO até você clicar 'Enviar ao Financeiro'" },
    { color: "bg-purple-500", text: "O Asaas é acionado automaticamente 3 dias antes do vencimento" },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider mb-3">Como funciona</h3>
        {guideItems.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0 mt-1.5`} />
            <p className="text-[11px] text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
