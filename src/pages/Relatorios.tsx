import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BarChart3, Users, FolderKanban, ShoppingCart, TrendingUp, 
  ArrowUpRight, ArrowDownRight, DollarSign, Target, CheckCircle2, Clock
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const STATUS_COLORS: Record<string, string> = {
  briefing: "#3b82f6",
  design: "#a855f7",
  desenvolvimento: "#f59e0b",
  homologacao: "#8b5cf6",
  concluido: "#10b981",
  cancelado: "#ef4444"
};

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: format(subMonths(new Date(), 6), "yyyy-MM-01"),
    to: format(new Date(), "yyyy-MM-dd")
  });
  const [stats, setStats] = useState({
    receitaTotal: 0,
    receitaPendente: 0,
    totalClientes: 0,
    totalLeads: 0,
    leadsConvertidos: 0,
    projetosAtivos: 0,
    chartData: [] as any[],
    statusData: [] as any[]
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      // 1. Financeiro
      const { data: finData } = await supabase.from("financeiro").select("*");
      
      // 2. Clientes
      const { count: clientCount } = await supabase.from("clientes").select("*", { count: 'exact', head: true });
      
      // 3. Leads
      const { data: leadsData } = await supabase.from("leads").select("status");
      
      // 4. Projetos
      const { data: projData } = await supabase.from("projetos").select("status");

      if (finData) {
        const receitaTotal = finData
          .filter(f => f.tipo === 'entrada' && f.status === 'pago')
          .reduce((acc, f) => acc + Number(f.valor), 0);
        
        const receitaPendente = finData
          .filter(f => f.tipo === 'entrada' && f.status === 'pendente')
          .reduce((acc, f) => acc + Number(f.valor), 0);

        // Processar dados para o gráfico mensal (últimos 6 meses)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(new Date(), i);
          const monthName = format(monthDate, "MMM", { locale: ptBR });
          const start = startOfMonth(monthDate);
          const end = endOfMonth(monthDate);

          const monthValue = finData
            .filter(f => f.tipo === 'entrada' && f.status === 'pago' && isWithinInterval(new Date(f.data), { start, end }))
            .reduce((acc, f) => acc + Number(f.valor), 0);

          monthlyData.push({ name: monthName, valor: monthValue });
        }

        // Processar dados de status dos projetos
        const statusMap: Record<string, number> = {};
        projData?.forEach(p => {
          statusMap[p.status] = (statusMap[p.status] || 0) + 1;
        });
        const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

        setStats({
          receitaTotal,
          receitaPendente,
          totalClientes: clientCount || 0,
          totalLeads: leadsData?.length || 0,
          leadsConvertidos: leadsData?.filter(l => l.status === 'convertido').length || 0,
          projetosAtivos: projData?.filter(p => p.status !== 'concluido' && p.status !== 'cancelado').length || 0,
          chartData: monthlyData,
          statusData
        });
      }
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const kpis = [
    { label: "Receita Confirmada", value: `R$ ${stats.receitaTotal.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-400", trend: "+12%" },
    { label: "Receita em Aberto", value: `R$ ${stats.receitaPendente.toLocaleString()}`, icon: Clock, color: "text-amber-400", trend: "Previsto" },
    { label: "Taxa de Conversão", value: `${((stats.leadsConvertidos / (stats.totalLeads || 1)) * 100).toFixed(1)}%`, icon: Target, color: "text-blue-400", trend: stats.leadsConvertidos + " leads" },
    { label: "Projetos Ativos", value: stats.projetosAtivos.toString(), icon: FolderKanban, color: "text-purple-400", trend: "Em curso" },
  ];

  return (
    <motion.div className="space-y-6 pb-12" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      {/* Header com Filtros */}
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" variants={fadeUp}>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Relatórios & Insights</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Visão geral do desempenho do seu negócio</p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl glass-card border-[0.5px]">
          <div className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-white/5 rounded-lg transition-colors">
            <span className="text-xs text-white/60">Período:</span>
            <span className="text-xs font-medium text-white">Últimos 6 meses</span>
          </div>
          <Button size="sm" variant="ghost" className="h-8 text-primary hover:text-primary/80" onClick={loadStats}>
            Atualizar dados
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={fadeUp}>
        {kpis.map((kpi, i) => (
          <Card key={i} className="glass-card border-[0.5px] relative overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-white/5 ${kpi.color}`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/40">
                  {kpi.trend}
                </div>
              </div>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-semibold">{kpi.label}</p>
              <h3 className="text-xl font-bold text-white mt-1">{loading ? "..." : kpi.value}</h3>
              {/* Background Glow */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-5 rounded-full ${kpi.color.replace('text', 'bg')}`} />
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >
        {/* Gráfico de Receita */}
        <motion.div className="lg:col-span-2" variants={fadeUp}>
          <Card className="glass-card border-[0.5px] h-full">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Fluxo de Receita Mensal
              </CardTitle>
              <CardDescription className="text-[11px]">Entradas confirmadas por mês</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e8334a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#e8334a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 15, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="valor" stroke="#e8334a" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico de Status */}
        <motion.div variants={fadeUp}>
          <Card className="glass-card border-[0.5px] h-full">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">Status dos Projetos</CardTitle>
              <CardDescription className="text-[11px]">Distribuição por fase atual</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#666"} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 15, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend 
                     verticalAlign="bottom" 
                     align="center"
                     iconType="circle"
                     formatter={(value) => <span className="text-[10px] text-white/60 capitalize">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Adicional: Leads vs Clientes */}
      <motion.div variants={fadeUp} className="pt-4">
        <Card className="glass-card border-[0.5px] overflow-hidden">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
            <div className="flex-1 p-6">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Users className="w-5 h-5" /></div>
                 <div>
                   <h4 className="text-sm font-semibold text-white">Base de Clientes</h4>
                   <p className="text-xs text-white/40">Total de clientes ativos</p>
                 </div>
               </div>
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-bold text-white">{stats.totalClientes}</span>
                 <span className="text-xs text-emerald-400 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> +2</span>
               </div>
            </div>
            <div className="flex-1 p-6">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400"><ShoppingCart className="w-5 h-5" /></div>
                 <div>
                   <h4 className="text-sm font-semibold text-white">Leads Gerados</h4>
                   <p className="text-xs text-white/40">Oportunidades no funil</p>
                 </div>
               </div>
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-bold text-white">{stats.totalLeads}</span>
                 <span className="text-xs text-emerald-400 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> +5</span>
               </div>
            </div>
            <div className="flex-1 p-6">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><CheckCircle2 className="w-5 h-5" /></div>
                 <div>
                   <h4 className="text-sm font-semibold text-white">Taxa de Sucesso</h4>
                   <p className="text-xs text-white/40">Eficiência de fechamento</p>
                 </div>
               </div>
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-bold text-white">{((stats.leadsConvertidos / (stats.totalLeads || 1)) * 100).toFixed(0)}%</span>
                 <span className="text-xs text-white/30 ml-1">leads convertidos</span>
               </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}



