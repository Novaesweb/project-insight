import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FolderKanban, ShoppingCart, DollarSign, Headphones, TrendingUp, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const receitaCategoria = [
  { categoria: "Sites", valor: 0, fill: "#e8334a" },
  { categoria: "E-commerce", valor: 0, fill: "#c2185b" },
  { categoria: "Apps", valor: 0, fill: "#7b1fa2" },
  { categoria: "Marketing", valor: 0, fill: "#9c27b0" },
  { categoria: "Design", valor: 0, fill: "#e91e63" },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ clientes: 0, projetos: 0, pedidos: 0, receita: 0 });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [c, p, ped, t, fin] = await Promise.all([
        supabase.from("clientes").select("*", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("projetos").select("*", { count: "exact", head: true }).eq("status", "em_andamento"),
        supabase.from("pedidos").select("*, clientes(nome)").order("created_at", { ascending: false }).limit(5),
        supabase.from("tickets").select("*, clientes(nome)").neq("status", "resolvido").order("created_at", { ascending: false }).limit(5),
        supabase.from("financeiro").select("valor").eq("tipo", "entrada").eq("status", "pago"),
      ]);
      const receita = (fin.data || []).reduce((s: number, f: any) => s + Number(f.valor), 0);
      setStats({ clientes: c.count || 0, projetos: p.count || 0, pedidos: (ped.data || []).filter((x: any) => x.status === "pendente").length, receita });
      setPedidos(ped.data || []);
      setTickets(t.data || []);
    };
    load();
  }, []);

  const kpis = [
    { label: "Clientes ativos", value: String(stats.clientes), change: "", icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Projetos em andamento", value: String(stats.projetos), change: "", icon: FolderKanban, color: "from-emerald-500 to-emerald-600" },
    { label: "Pedidos pendentes", value: String(stats.pedidos), change: stats.pedidos > 0 ? "Atenção" : "", icon: ShoppingCart, color: "from-amber-500 to-amber-600", alert: stats.pedidos > 0 },
    { label: "Receita total", value: `R$ ${(stats.receita / 1000).toFixed(0)}k`, change: "", icon: DollarSign, color: "from-violet-500 to-violet-600" },
  ];

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

      {/* Tables */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader><CardTitle className="text-sm font-semibold text-white">Pedidos Recentes</CardTitle></CardHeader>
          <CardContent>
            {pedidos.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">Nenhum pedido ainda</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[rgba(255,255,255,0.06)]">
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Cliente</TableHead>
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Tipo</TableHead>
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Valor</TableHead>
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((p: any) => (
                    <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                      <TableCell className="text-sm text-white">{p.clientes?.nome || "—"}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.tipo}</TableCell>
                      <TableCell className="text-sm text-white">R$ {Number(p.valor).toLocaleString("pt-BR")}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Headphones className="w-4 h-4" /> Tickets de Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">Nenhum ticket aberto</p>
            ) : (
              tickets.map((t: any) => (
                <div key={t.id} className="flex items-start justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                  <div>
                    <p className="text-sm font-medium text-white">{t.titulo}</p>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{t.clientes?.nome || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={t.prioridade} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
