import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3, Users, FolderKanban, ShoppingCart, TrendingUp } from "lucide-react";

const relatorios = [
  { titulo: "Financeiro", descricao: "Entradas, saídas e balanço por período", icon: TrendingUp },
  { titulo: "Por Cliente", descricao: "Receita e projetos agrupados por cliente", icon: Users },
  { titulo: "Por Projeto", descricao: "Status, custos e prazos de cada projeto", icon: FolderKanban },
  { titulo: "Pedidos por Status", descricao: "Distribuição de pedidos por status atual", icon: ShoppingCart },
  { titulo: "Desempenho Geral", descricao: "KPIs e métricas consolidadas do negócio", icon: BarChart3 },
];

export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Gere e exporte relatórios por período</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatorios.map((r) => (
          <Card key={r.titulo} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <r.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{r.titulo}</CardTitle>
                  <CardDescription className="mt-1">{r.descricao}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="w-4 h-4 mr-1" /> PDF
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-1" /> Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
