import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle2, DollarSign } from "lucide-react";

interface RecurrentBillingStatsProps {
  totalClientes: number;
  totalSelecionados: number;
  totalSelecionadoValor: number;
}

export function RecurrentBillingStats({
  totalClientes,
  totalSelecionados,
  totalSelecionadoValor,
}: RecurrentBillingStatsProps) {
  const stats = [
    { icon: Users, label: "Clientes", value: totalClientes, color: "text-blue-500" },
    { icon: CheckCircle2, label: "Selecionados", value: totalSelecionados, color: "text-emerald-500" },
    { icon: DollarSign, label: "Total Sel.", value: `R$ ${totalSelecionadoValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {stats.map((s, i) => (
        <Card key={i}>
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
            <div className="min-w-0">
              <p className="text-sm sm:text-lg font-bold text-foreground truncate">{s.value}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold truncate">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
