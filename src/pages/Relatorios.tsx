import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, BarChart3, Users, FolderKanban, ShoppingCart, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { receitaMensal } from "@/lib/mock-data";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const relatorios = [
  { titulo: "Financeiro", descricao: "Entradas, saídas e balanço por período", icon: TrendingUp },
  { titulo: "Por Cliente", descricao: "Receita e projetos agrupados por cliente", icon: Users },
  { titulo: "Por Projeto", descricao: "Status, custos e prazos de cada projeto", icon: FolderKanban },
  { titulo: "Por Status", descricao: "Distribuição de pedidos por status atual", icon: ShoppingCart },
  { titulo: "Desempenho Geral", descricao: "KPIs e métricas consolidadas do negócio", icon: BarChart3 },
];

const resumo = [
  { label: "Total Receita", valor: "R$ 336.000" },
  { label: "Total Projetos", valor: "8" },
  { label: "Ticket Médio", valor: "R$ 42.000" },
  { label: "Clientes Ativos", valor: "6" },
];

export default function Relatorios() {
  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      {/* Filters */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-1.5 flex-1">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Data início</Label>
                <Input type="date" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
              </div>
              <div className="space-y-1.5 flex-1">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Data fim</Label>
                <Input type="date" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
              </div>
              <div className="space-y-1.5 flex-1">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Tipo</Label>
                <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent">
                  <option>Todos</option>
                  <option>Financeiro</option>
                  <option>Por Cliente</option>
                  <option>Por Projeto</option>
                </select>
              </div>
              <Button className="gradient-primary border-0 text-white rounded-lg h-9">Gerar</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary cards */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={fadeUp}>
        {resumo.map((r) => (
          <Card key={r.label} className="glass-card border-[0.5px]">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{r.label}</p>
              <p className="text-xl font-bold text-white mt-1">{r.valor}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader><CardTitle className="text-sm font-semibold text-white">Comparativo Mensal</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={receitaMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Bar dataKey="valor" fill="#e8334a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Report types */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={fadeUp}>
        {relatorios.map((r) => (
          <Card key={r.titulo} className="glass-card border-[0.5px] hover:border-[rgba(255,255,255,0.15)] transition-all">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl gradient-primary shadow-lg">
                  <r.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm text-white">{r.titulo}</CardTitle>
                  <CardDescription className="text-xs mt-1">{r.descricao}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-xs">
                  <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                </Button>
                <Button variant="outline" size="sm" className="flex-1 glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" /> Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
}
