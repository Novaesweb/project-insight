import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, BarChart3, Users, FolderKanban, ShoppingCart, TrendingUp } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const relatorios = [
  { titulo: "Financeiro", descricao: "Entradas, saídas e balanço por período", icon: TrendingUp },
  { titulo: "Por Cliente", descricao: "Receita e projetos agrupados por cliente", icon: Users },
  { titulo: "Por Projeto", descricao: "Status, custos e prazos de cada projeto", icon: FolderKanban },
  { titulo: "Por Status", descricao: "Distribuição de pedidos por status atual", icon: ShoppingCart },
  { titulo: "Desempenho Geral", descricao: "KPIs e métricas consolidadas do negócio", icon: BarChart3 },
];

export default function Relatorios() {
  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex items-center gap-3 mb-2" variants={fadeUp}>
        <div className="flex gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-[hsl(var(--muted-foreground))]">De</Label>
            <Input type="date" className="glass-input border-0 text-white text-sm w-40" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[hsl(var(--muted-foreground))]">Até</Label>
            <Input type="date" className="glass-input border-0 text-white text-sm w-40" />
          </div>
        </div>
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={fadeUp}>
        {relatorios.map((r) => (
          <Card key={r.titulo} className="glass-card border-[0.5px] hover:border-[rgba(255,255,255,0.15)] transition-all cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl gradient-primary"><r.icon className="w-5 h-5 text-white" /></div>
                <CardTitle className="text-sm text-white">{r.titulo}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">{r.descricao}</CardDescription>
              <Button size="sm" className="mt-4 gradient-primary border-0 text-white text-xs w-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Download className="w-3 h-3 mr-1.5" /> Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">
          Selecione um relatório acima para gerar com dados reais do sistema
        </p>
      </motion.div>
    </motion.div>
  );
}
