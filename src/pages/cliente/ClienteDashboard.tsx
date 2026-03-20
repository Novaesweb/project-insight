import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FolderKanban, Plus, Receipt, Headphones, CalendarDays, Clock, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { statusReuniaoLabels, statusReuniaoColors, tipoReuniaoLabels, type StatusReuniao, type TipoReuniao } from "@/lib/mock-data";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import StatusBadge from "@/components/StatusBadge";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function ClienteDashboard() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const cId = cliente.id;
  const [counts, setCounts] = useState({ projetos: 0, extras: 0, faturas: 0, tickets: 0 });
  const [proximaReuniao, setProximaReuniao] = useState<any>(null);
  const [atualizacoes, setAtualizacoes] = useState<any[]>([]);

  const load = useCallback(() => {
    if (!cId) return;
    Promise.all([
      supabase.from("projetos").select("id", { count: "exact", head: true }).eq("cliente_id", cId).neq("status", "cancelado"),
      supabase.from("extras_clientes").select("id", { count: "exact", head: true }).eq("cliente_id", cId).eq("status", "ativo"),
      supabase.from("faturas").select("id", { count: "exact", head: true }).eq("cliente_id", cId).neq("status", "paga"),
      supabase.from("tickets").select("id", { count: "exact", head: true }).eq("cliente_id", cId).neq("status", "resolvido"),
    ]).then(([p, e, f, t]) => setCounts({ projetos: p.count || 0, extras: e.count || 0, faturas: f.count || 0, tickets: t.count || 0 }));

    supabase.from("reunioes").select("*").eq("cliente_id", cId).in("status", ["agendada", "confirmada"]).order("data", { ascending: true }).limit(1)
      .then(({ data }) => setProximaReuniao(data?.[0] || null));

    supabase.from("projeto_atualizacoes").select("*, projetos!inner(titulo, cliente_id)").eq("projetos.cliente_id", cId).eq("visivel_cliente", true)
      .order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setAtualizacoes(data || []));
  }, [cId]);

  useEffect(() => { load(); }, [load]);
  useRealtimeSubscription("projetos", load);
  useRealtimeSubscription("faturas", load);
  useRealtimeSubscription("tickets", load);
  useRealtimeSubscription("extras_clientes", load);
  useRealtimeSubscription("reunioes", load);
  useRealtimeSubscription("projeto_atualizacoes", load);

  const kpis = [
    { label: "Projetos ativos", value: counts.projetos, icon: FolderKanban, color: "text-blue-400" },
    { label: "Extras contratados", value: counts.extras, icon: Plus, color: "text-green-400" },
    { label: "Faturas pendentes", value: counts.faturas, icon: Receipt, color: counts.faturas > 0 ? "text-yellow-400" : "text-green-400" },
    { label: "Tickets abertos", value: counts.tickets, icon: Headphones, color: "text-purple-400" },
  ];

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6 ambient-glow min-h-screen pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Olá, {cliente.nome?.split(" ")[0]}! <motion.span animate={{ rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 2 }}>👋</motion.span>
          </h1>
          <p className="text-sm text-white/50">Seu projeto está evoluindo! Veja o que há de novo.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/50">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[9px] uppercase font-bold">Portal Premium</Badge>
          Suporte prioritário ativo
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="glass-card border-white/5 info-card-hover overflow-hidden group">
            <CardContent className="p-4 flex items-center gap-3 relative">
              <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-colors`} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold text-white`}>{kpi.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions - High-End SaaS UI */}
      <div className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold px-1">Atalhos rápidos</h2>
        <motion.div variants={stagger} className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
          {[
            { to: "/cliente/suporte", label: "Suporte", icon: Headphones, color: "blue" },
            { to: "/cliente/faturas", label: "Faturas", icon: Receipt, color: "emerald" },
            { to: "/cliente/projetos", label: "Projetos", icon: FolderKanban, color: "purple" },
            { to: "/cliente/reunioes", label: "Reuniões", icon: CalendarDays, color: "amber" },
          ].map((item, idx) => (
            <Button key={idx} asChild className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-2xl h-24 w-32 flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-black/20 group cursor-pointer overflow-hidden">
              <Link to={item.to}>
                <div className={`p-2.5 rounded-xl bg-${item.color}-500/10 text-${item.color}-400 group-hover:scale-110 group-hover:bg-${item.color}-500/20 transition-all z-10`}><item.icon className="w-5 h-5" /></div>
                <span className="text-xs font-semibold z-10">{item.label}</span>
                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-${item.color}-500/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
              </Link>
            </Button>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Updates Section */}
        <Card className="glass-card border-white/5 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Histórico de Evolução
              </h2>
              <StatusBadge status="em_andamento" />
            </div>
            
            {atualizacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-xs text-white/40">Iniciando os trabalhos... As atualizações aparecerão aqui.</p>
              </div>
            ) : (
              <div className="space-y-0 relative ml-2">
                <div className="absolute left-[5px] top-2 bottom-6 w-px bg-white/5" />
                {atualizacoes.map((a: any, i: number) => (
                  <div key={a.id} className="flex gap-4 pb-6 last:pb-0 relative group">
                    <div className="relative z-10">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-[0_0_8px_rgba(232,51,74,0.4)] group-hover:scale-125 transition-transform mt-1" />
                    </div>
                    <div className="flex-1 -mt-0.5 p-3 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                      <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{a.descricao}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <Badge variant="outline" className="text-[9px] border-white/10 text-white/30 h-4">{ (a as any).projetos?.titulo }</Badge>
                         <span className="text-[10px] text-white/30 flex items-center gap-1">
                           <Clock className="w-3 h-3 text-white/20" /> 
                           {new Date(a.created_at).toLocaleDateString("pt-BR")}
                         </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Live Status Widget */}
          <Card className="glass-card border-emerald-500/10 bg-emerald-500/5 group">
            <CardContent className="p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-white mb-1">Status do Seu Site</p>
              <p className="text-[10px] text-emerald-400/70 mb-4 font-medium uppercase tracking-wider">Publicado e Seguro</p>
              <Button asChild variant="outline" className="w-full h-8 text-[10px] rounded-lg border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
                <a href="https://novaesweb.com.br" target="_blank" rel="noopener noreferrer">Acessar Meu Site →</a>
              </Button>
            </CardContent>
          </Card>

          {/* Meeting Widget */}
          <Card className="glass-card border-white/5 hover:border-white/10 transition-all">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-amber-400" /> Próxima Reunião
              </h2>
              {proximaReuniao ? (
                <div className="p-4 rounded-xl space-y-3 bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{tipoReuniaoLabels[proximaReuniao.tipo as TipoReuniao]}</span>
                    <Badge variant="outline" className="text-[10px] border-0 px-2 py-0.5 rounded-md" style={{ backgroundColor: statusReuniaoColors[proximaReuniao.status as StatusReuniao] + "33", color: statusReuniaoColors[proximaReuniao.status as StatusReuniao] }}>
                      {statusReuniaoLabels[proximaReuniao.status as StatusReuniao]}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <CalendarDays className="w-3 h-3" /> {proximaReuniao.data}
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <Clock className="w-3 h-3" /> {proximaReuniao.hora_inicio} — {proximaReuniao.hora_fim}
                    </div>
                  </div>
                  {proximaReuniao.link && (
                    <Button asChild className="w-full h-9 mt-1 gradient-primary border-0 text-white rounded-lg text-xs font-bold">
                      <a href={proximaReuniao.link} target="_blank" rel="noopener noreferrer">
                        Entrar na Reunião
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-white/5 rounded-xl group hover:border-white/10 transition-all">
                  <p className="text-xs text-white/20 group-hover:text-white/40 transition-colors">Tudo em ordem. Nenhuma reunião pendente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
