import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Users, FolderKanban, ShoppingCart, DollarSign, Headphones, TrendingUp, AlertTriangle, Plus, Sparkles, Calendar, BellRing, Clock, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const CHART_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({ clientes: 0, projetos: 0, pedidos: 0, receita: 0 });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<"conectado" | "erro" | "carregando">("carregando");
  const [subCount, setSubCount] = useState(0);

  // Modal Extras
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [clienteSel, setClienteSel] = useState("");
  const [extraSel, setExtraSel] = useState("");
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);

  // Charts Data
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [topModules, setTopModules] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [c, p, ped, t, fin, extrasCli, catFull] = await Promise.all([
        supabase.from("clientes").select("*", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("projetos").select("*", { count: "exact", head: true }).eq("status", "em_andamento"),
        supabase.from("pedidos").select("*, clientes(nome)").order("created_at", { ascending: false }).limit(5),
        supabase.from("tickets").select("*, clientes(nome)").neq("status", "resolvido").order("created_at", { ascending: false }).limit(5),
        supabase.from("financeiro").select("valor, created_at").eq("tipo", "entrada").eq("status", "pago"),
        supabase.from("extras_clientes").select("extra_id"),
        supabase.from("extras_catalogo").select("id, nome")
      ]);
      
      const receita = (fin.data || []).reduce((s: number, f: any) => s + Number(f.valor), 0);
      setStats({ clientes: c.count || 0, projetos: p.count || 0, pedidos: (ped.data || []).filter((x: any) => x.status === "pendente").length, receita });
      setPedidos(ped.data || []);
      setTickets(t.data || []);
      setDbStatus(c.error || p.error || ped.error || t.error || fin.error ? "erro" : "conectado");

      // Build Monthly Revenue Chart
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const currentMonthIndex = new Date().getMonth();
      const revenueMap: Record<string, number> = {};
      
      // Initialize last 6 months to 0 to preserve order
      for (let i = 5; i >= 0; i--) {
        let mIdx = currentMonthIndex - i;
        if (mIdx < 0) mIdx += 12;
        revenueMap[months[mIdx]] = 0;
      }

      fin.data?.forEach((f: any) => {
        const date = new Date(f.created_at);
        const monthName = months[date.getMonth()];
        if (revenueMap[monthName] !== undefined) {
           revenueMap[monthName] += Number(f.valor);
        }
      });

      const revData = Object.keys(revenueMap).map(k => ({ name: k, total: Number(revenueMap[k].toFixed(2)) }));
      setMonthlyRevenue(revData);

      // Build Top Modules Pie Chart
      const moduleCounts: Record<string, number> = {};
      extrasCli.data?.forEach((e: any) => {
        if (!e.extra_id) return;
        moduleCounts[e.extra_id] = (moduleCounts[e.extra_id] || 0) + 1;
      });

      const pieData = Object.keys(moduleCounts)
        .map((id) => {
          const cat = catFull.data?.find(c => c.id === id);
          return { name: cat ? cat.nome : 'Outro', value: moduleCounts[id] };
        })
        .sort((a,b) => b.value - a.value)
        .slice(0, 5); // Top 5
        
      if (pieData.length === 0) pieData.push({ name: 'Nenhum venda', value: 1 });
      setTopModules(pieData);

      // Subscriptions
      supabase.from("push_subscriptions").select("id", { count: "exact", head: true })
        .then(({ count }) => setSubCount(count || 0));

      // Recent Activity
      const { data: acts } = await supabase.from("notifications")
        .select("*")
        .eq("user_type", "admin")
        .order("created_at", { ascending: false })
        .limit(10);
      setActivity(acts || []);
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
    { label: "Clientes ativos", value: String(stats.clientes), change: "", icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Projetos em andamento", value: String(stats.projetos), change: "", icon: FolderKanban, color: "from-emerald-500 to-emerald-600" },
    { label: "Pedidos pendentes", value: String(stats.pedidos), change: stats.pedidos > 0 ? "Atenção" : "", icon: ShoppingCart, color: "from-amber-500 to-amber-600", alert: stats.pedidos > 0 },
    { label: "Receita total", value: `R$ ${(stats.receita / 1000).toFixed(1)}k`, change: "", icon: DollarSign, color: "from-violet-500 to-violet-600" },
  ];

  const selectedExtra = catalogo.find(c => c.id === extraSel);

  return (
    <motion.div className="space-y-6 ambient-glow min-h-screen pb-10" initial="hidden" animate="show" variants={stagger}>
      {/* Header Premium */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Dashboard <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/10">v2.4.8 Premium</Badge>
          </h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Bem-vindo de volta! Aqui está o resumo do seu negócio hoje.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/50">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          Sistema Operacional • {new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" variants={fadeUp}>
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="glass-card border-white/5 overflow-hidden info-card-hover group relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-10 blur-[40px] transition-opacity duration-500`} />
            <CardContent className="p-5 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-semibold">{kpi.label}</p>
                  <p className="text-3xl font-bold text-white mt-1.5 tracking-tight">{kpi.value}</p>
                  {kpi.change && (
                    <p className={`text-[11px] mt-2 flex items-center gap-1 font-medium ${kpi.alert ? "text-amber-400" : "text-emerald-400"}`}>
                      {kpi.alert ? <AlertTriangle className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {kpi.change}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${kpi.color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* CHARTS ROW */}
      <motion.div className="grid grid-cols-1 xl:grid-cols-3 gap-4" variants={fadeUp}>
        <Card className="glass-card border-[0.5px] xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Visão Financeira (Últimos 6 Meses)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pb-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase' }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px] xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Módulos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-0">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topModules}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {topModules.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                    formatter={(value: number) => [`${value} vendas`, 'Qtd']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="w-full mt-2 grid grid-cols-2 gap-x-2 gap-y-2">
              {topModules.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] truncate" title={entry.name}>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>


      {/* Quick Actions Premium */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Ações Rápidas</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="h-14 px-6 rounded-2xl gradient-primary text-white shadow-xl shadow-[hsl(var(--primary))]/20 hover:shadow-[hsl(var(--primary))]/40 hover:-translate-y-1 transition-all duration-300 text-sm font-semibold border-0 group" onClick={openAddExtra}>
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" /> Adicionar Extra
          </Button>
          <Button asChild className="h-14 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg hover:-translate-y-1 transition-all duration-300 text-sm font-medium">
            <Link to="/admin/clientes">
              <Users className="w-4 h-4 mr-2 text-blue-400" /> Novo Cliente
            </Link>
          </Button>
          <Button asChild className="h-14 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg hover:-translate-y-1 transition-all duration-300 text-sm font-medium">
            <Link to="/admin/financeiro">
              <DollarSign className="w-4 h-4 mr-2 text-emerald-400" /> Nova Fatura
            </Link>
          </Button>
          <Button asChild className="h-14 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg hover:-translate-y-1 transition-all duration-300 text-sm font-medium">
            <Link to="/admin/projetos">
              <FolderKanban className="w-4 h-4 mr-2 text-amber-400" /> Novo Projeto
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Tables & Activity */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" variants={fadeUp}>
        <Card className="glass-card border-[0.5px] xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">Sem atividades recentes</p>
            ) : (
              <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-primary/5 before:to-transparent">
                {activity.map((act) => (
                  <div key={act.id} className="relative flex items-center gap-4 group">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primary group-hover:scale-110 transition-transform">
                       <BellRing className="w-4 h-4" />
                     </div>
                     <div>
                       <h4 className="text-sm font-semibold text-white leading-none">{act.title}</h4>
                       <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-1">{act.body}</p>
                       <p className="text-[10px] text-white/20 mt-1 uppercase tracking-tighter">
                         {new Date(act.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                       </p>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px] xl:col-span-1">
          <CardHeader><CardTitle className="text-sm font-semibold text-white">Pedidos Recentes</CardTitle></CardHeader>
          <CardContent>
            {pedidos.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">Nenhum pedido ainda</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[rgba(255,255,255,0.06)]">
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Cliente</TableHead>
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((p: any) => (
                    <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                      <TableCell className="text-sm text-white">{p.clientes?.nome || "—"}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px] xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Headphones className="w-4 h-4" /> Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">Nenhum ticket aberto</p>
            ) : (
               tickets.map((t: any) => (
                 <div key={t.id} className="flex items-start justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                   <div>
                     <p className="text-sm font-medium text-white line-clamp-1">{t.titulo}</p>
                     <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{t.clientes?.nome || "—"}</p>
                   </div>
                   <div className="flex flex-col items-end gap-1">
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
