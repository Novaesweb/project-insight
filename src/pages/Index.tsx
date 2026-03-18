import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FolderKanban, ShoppingCart, DollarSign, Headphones, TrendingUp, AlertTriangle, Plus, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({ clientes: 0, projetos: 0, pedidos: 0, receita: 0 });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // Add Extra state
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [clienteSel, setClienteSel] = useState("");
  const [extraSel, setExtraSel] = useState("");
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [c, p, ped, t, fin] = await Promise.all([
        supabase.from("clientes").select("*", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("projetos").select("*", { count: "exact", head: true }).eq("status", "em_andamento"),
        supabase.from("pedidos").select("*, clientes(nome)").order("created_at", { ascending: false }).limit(5),
        supabase.from("tickets").select("*, clientes(nome)").neq("status", "resolvido").order("created_at", { ascending: false }).limit(5),
        supabase.from("financeiro").select("valor, created_at").eq("tipo", "entrada").eq("status", "pago"),
      ]);
      
      const receita = (fin.data || []).reduce((s: number, f: any) => s + Number(f.valor), 0);
      setStats({ 
        clientes: c.count || 0, 
        projetos: p.count || 0, 
        pedidos: (ped.data || []).filter((x: any) => x.status === "pendente").length, 
        receita 
      });
      setPedidos(ped.data || []);
      setTickets(t.data || []);

      // Process chart data (last 6 months)
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
      const mockMonthlyData = months.map(m => ({
        name: m,
        faturamento: Math.floor(Math.random() * 5000) + 2000,
        leads: Math.floor(Math.random() * 20) + 5
      }));
      setChartData(mockMonthlyData);
    };
    load();
  }, []);

  const openAddExtra = async () => {
    const [cli, cat] = await Promise.all([
      supabase.from("clientes").select("id, nome").eq("status", "ativo").order("nome"),
      supabase.from("extras_catalogo").select("*").eq("status", "ativo").order("nome"),
    ]);
    setClientes(cli.data || []);
    setCatalogo(cat.data || []);
    setShowAddExtra(true);
  };

  const handleAddExtra = async () => {
    if (!clienteSel || !extraSel) return;
    const extra = catalogo.find(c => c.id === extraSel);
    if (!extra) return;
    setSaving(true);
    const { error } = await supabase.from("extras_clientes").insert({
      cliente_id: clienteSel,
      extra_id: extra.id,
      categoria: extra.categoria,
      preco_ativacao: Number(extra.preco_ativacao) || 0,
      preco_mensal: Number(extra.preco_mensal) || 0,
      observacao: obs || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    const clienteNome = clientes.find(c => c.id === clienteSel)?.nome;
    toast({ title: "Extra adicionado!", description: `"${extra.nome}" vinculado a ${clienteNome}.` });
    setShowAddExtra(false);
    setClienteSel("");
    setExtraSel("");
    setObs("");
  };

  const kpis = [
    { label: "Clientes ativos", value: String(stats.clientes), change: "+12%", icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Projetos em andamento", value: String(stats.projetos), change: "+2", icon: FolderKanban, color: "from-emerald-500 to-emerald-600" },
    { label: "Pedidos pendentes", value: String(stats.pedidos), change: stats.pedidos > 0 ? "Ação Requerida" : "Em dia", icon: ShoppingCart, color: "from-amber-500 to-amber-600", alert: stats.pedidos > 0 },
    { label: "Receita total", value: `R$ ${(stats.receita / 1000).toFixed(1)}k`, change: "+8.4%", icon: DollarSign, color: "from-violet-500 to-violet-600" },
  ];

  const selectedExtra = catalogo.find(c => c.id === extraSel);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={stagger}>
      {/* KPIs */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={fadeUp}>
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="glass-card border-[0.5px] overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{kpi.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                  {kpi.change && (
                    <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${kpi.alert ? "text-amber-400" : "text-emerald-400"}`}>
                      {kpi.alert ? <AlertTriangle className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {kpi.change} <span className="text-[hsl(var(--muted-foreground))]">vs mês anterior</span>
                    </p>
                  )}
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Charts Row */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={fadeUp}>
        <Card className="lg:col-span-2 glass-card border-[0.5px]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white">Evolução de Faturamento</CardTitle>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">Últimos 6 meses de performance</p>
              </div>
              <div className="flex items-center gap-2 bg-[hsl(var(--muted))]/30 p-1 rounded-lg border border-white/5">
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white/10 active"><Activity className="w-3 h-3" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 15, 20, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="faturamento" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorFat)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Leads & Conversão</CardTitle>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">Captação mensal de novos projetos</p>
          </CardHeader>
          <CardContent className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 15, 20, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 flex items-center gap-3">
            <Button className="gradient-primary border-0 text-white text-xs px-5 h-9" onClick={openAddExtra}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar Extra ao Cliente
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tables Row */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={fadeUp}>
        <Card className="lg:col-span-2 glass-card border-[0.5px]">
          <CardHeader><CardTitle className="text-sm font-semibold text-white">Últimos Pedidos</CardTitle></CardHeader>
          <CardContent>
            {pedidos.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">Nenhum pedido ainda</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[rgba(255,255,255,0.06)] hover:bg-transparent">
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Cliente</TableHead>
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Tipo</TableHead>
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Valor</TableHead>
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))] text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((p: any) => (
                    <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)] hover:bg-white/5 transition-colors">
                      <TableCell className="text-xs text-white font-medium">{p.clientes?.nome || "—"}</TableCell>
                      <TableCell className="text-xs text-[hsl(var(--muted-foreground))]">{p.tipo}</TableCell>
                      <TableCell className="text-xs text-white font-semibold">R$ {Number(p.valor).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right"><StatusBadge status={p.status} /></TableCell>
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
              <Headphones className="w-4 h-4 text-primary" /> Tickets de Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tickets.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">Nenhum ticket aberto</p>
            ) : (
              tickets.map((t: any) => (
                <div key={t.id} className="flex items-start justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer group">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-white group-hover:text-primary transition-colors">{t.titulo}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{t.clientes?.nome || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={t.prioridade} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog Adicionar Extra */}
      <Dialog open={showAddExtra} onOpenChange={setShowAddExtra}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Adicionar Extra ao Cliente</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cliente</Label>
              <Select value={clienteSel} onValueChange={setClienteSel}>
                <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Extra</Label>
              <Select value={extraSel} onValueChange={setExtraSel}>
                <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white"><SelectValue placeholder="Selecione o extra" /></SelectTrigger>
                <SelectContent>
                  {catalogo.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome} {Number(e.preco_mensal) > 0 ? `(R$ ${Number(e.preco_mensal).toFixed(2)}/mês)` : ""} {Number(e.preco_ativacao) > 0 ? `(Ativ: R$ ${Number(e.preco_ativacao).toFixed(2)})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExtra && (
              <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                <p className="text-sm font-medium text-white">{selectedExtra.nome}</p>
                {selectedExtra.descricao && <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{selectedExtra.descricao}</p>}
                <div className="flex gap-3 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="text-emerald-400">{selectedExtra.categoria}</span>
                  {Number(selectedExtra.preco_ativacao) > 0 && <span>Ativação: R$ {Number(selectedExtra.preco_ativacao).toFixed(2)}</span>}
                  {Number(selectedExtra.preco_mensal) > 0 && <span>Mensal: R$ {Number(selectedExtra.preco_mensal).toFixed(2)}</span>}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Observação (opcional)</Label>
              <Textarea className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm min-h-[60px]" placeholder="Ex: Cortesia por 3 meses..." value={obs} onChange={e => setObs(e.target.value)} />
            </div>

            <Button className="gradient-primary border-0 text-white w-full rounded-lg" onClick={handleAddExtra} disabled={!clienteSel || !extraSel || saving}>
              {saving ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
