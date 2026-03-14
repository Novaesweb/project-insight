import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FolderKanban, ShoppingCart, DollarSign, Headphones, TrendingUp, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { pedidos, tickets, receitaMensal, receitaCategoria } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const kpis = [
  { label: "Clientes ativos", value: "248", change: "+12 este mês", icon: Users, color: "from-blue-500 to-blue-600" },
  { label: "Projetos em andamento", value: "34", change: "", icon: FolderKanban, color: "from-emerald-500 to-emerald-600" },
  { label: "Pedidos pendentes", value: "12", change: "Atenção", icon: ShoppingCart, color: "from-amber-500 to-amber-600", alert: true },
  { label: "Receita mensal", value: "R$ 47.000", change: "+18%", icon: DollarSign, color: "from-violet-500 to-violet-600" },
];

export default function Dashboard() {
  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={stagger}>
      {/* KPIs */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={fadeUp}>
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="glass-card border-[0.5px] overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{kpi.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                  {kpi.change && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${kpi.alert ? "text-amber-400" : "text-emerald-400"}`}>
                      {kpi.alert ? <AlertTriangle className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {kpi.change}
                    </p>
                  )}
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4" variants={fadeUp}>
        <Card className="lg:col-span-2 glass-card border-[0.5px]">
          <CardHeader><CardTitle className="text-sm font-semibold text-white">Receita dos últimos 6 meses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={receitaMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]} />
                <Line type="monotone" dataKey="valor" stroke="#e8334a" strokeWidth={2.5} dot={{ fill: "#e8334a", r: 4 }} activeDot={{ r: 6, fill: "#c2185b" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardHeader><CardTitle className="text-sm font-semibold text-white">Serviços por Categoria</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={receitaCategoria} dataKey="valor" nameKey="categoria" cx="50%" cy="50%" innerRadius={45} outerRadius={75} strokeWidth={2} stroke="#0d0d14">
                  {receitaCategoria.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center">
              {receitaCategoria.map((item) => (
                <div key={item.categoria} className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.fill }} />
                  {item.categoria}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tables */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader><CardTitle className="text-sm font-semibold text-white">Pedidos Recentes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Cliente</TableHead>
                  <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Projeto</TableHead>
                  <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Valor</TableHead>
                  <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.slice(0, 5).map((p) => (
                  <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                    <TableCell className="text-sm text-white">{p.cliente}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.projeto}</TableCell>
                    <TableCell className="text-sm text-white">R$ {p.valor.toLocaleString("pt-BR")}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Headphones className="w-4 h-4" /> Tickets de Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.filter(t => t.status !== "resolvido").map((t) => (
              <div key={t.id} className="flex items-start justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                <div>
                  <p className="text-sm font-medium text-white">{t.titulo}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{t.cliente}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={t.prioridade} />
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
            <div className="pt-2 flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> {tickets.filter(t => t.prioridade === "critica").length} Críticas</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> {tickets.filter(t => t.prioridade === "normal").length} Normais</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
