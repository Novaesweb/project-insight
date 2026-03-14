import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FolderKanban, ShoppingCart, DollarSign, Headphones } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { clientes, projetos, pedidos, tickets, receitaMensal, receitaCategoria } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

const COLORS = ["hsl(243, 75%, 59%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

const kpis = [
  { label: "Clientes Ativos", value: clientes.filter(c => c.status === "ativo").length, icon: Users, color: "text-blue-600" },
  { label: "Projetos em Andamento", value: projetos.filter(p => p.status === "em_andamento").length, icon: FolderKanban, color: "text-emerald-600" },
  { label: "Pedidos Pendentes", value: pedidos.filter(p => p.status === "pendente").length, icon: ShoppingCart, color: "text-amber-600" },
  { label: "Receita Mensal", value: `R$ ${(71000).toLocaleString("pt-BR")}`, icon: DollarSign, color: "text-violet-600" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-muted ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={receitaMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Bar dataKey="valor" fill="hsl(243, 75%, 59%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receita por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={receitaCategoria} dataKey="valor" nameKey="categoria" cx="50%" cy="50%" outerRadius={90} strokeWidth={2}>
                  {receitaCategoria.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {receitaCategoria.map((item, i) => (
                <div key={item.categoria} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  {item.categoria}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.slice(0, 4).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell>{p.cliente}</TableCell>
                    <TableCell>R$ {p.valor.toLocaleString("pt-BR")}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Headphones className="w-5 h-5" /> Tickets Abertos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.filter(t => t.status !== "resolvido").map((t) => (
              <div key={t.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{t.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.cliente}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={t.prioridade} />
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
