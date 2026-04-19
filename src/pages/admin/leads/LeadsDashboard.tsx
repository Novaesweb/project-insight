import { motion } from "framer-motion";
import { 
  Users, 
  Sparkles, 
  Zap, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  MessageCircle,
  PhoneCall
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/features/leads/hooks/useLeads";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LeadsDashboard() {
  const { leads, stats, loading } = useLeads();

  const recentLeads = leads.slice(0, 5);

  return (
    <motion.div
      className="space-y-8 pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Header Premium */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-primary fx-glintReveal">
            <TrendingUp className="h-3.5 w-3.5" />
            Growth & Conversion
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Pipeline de Leads</h1>
            <p className="max-w-2xl text-sm text-white/55">
              Transforme oportunidades em clientes reais através de uma gestão baseada em dados.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Link to="/admin/leads/lista">
              Gerenciar Base
            </Link>
          </Button>
          <Button asChild className="border-0 text-white shadow-lg shadow-primary/20" style={{ background: "var(--gradient-primary)" }}>
            <Link to="/admin/leads/lista?status=novo">
              <Zap className="mr-2 h-4 w-4" />
              Atender Novos
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card Principal - Hoje */}
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="glass-card-premium fx-glint h-full relative overflow-hidden group bg-primary/5 border-primary/20">
             <CardContent className="p-8">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Entradas de Hoje</p>
                    <h3 className="text-6xl font-black text-white">{stats.todayCount}</h3>
                  </div>
                  <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                    <Sparkles size={32} />
                  </div>
               </div>
               <div className="mt-8 flex items-center gap-2 text-sm text-white/40">
                  <span className="text-emerald-400 font-bold">+12%</span> em relação à média semanal
               </div>
             </CardContent>
          </Card>
        </motion.div>

        {/* Card Pendentes */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className={cn(
            "glass-card-premium fx-glint h-full transition-all border-l-4",
            stats.unvisited > 0 ? "border-l-rose-500 bg-rose-500/5" : "border-l-emerald-500"
          )}>
            <CardContent className="p-8">
              <div className="p-3 rounded-xl bg-white/5 w-fit mb-6">
                <Clock className={stats.unvisited > 0 ? "text-rose-400" : "text-emerald-400"} />
              </div>
              <h3 className="text-4xl font-black text-white">{stats.unvisited}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-2">Não Visualizados</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Convertidos */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-card-premium h-full">
            <CardContent className="p-8">
              <div className="p-3 rounded-xl bg-emerald-500/10 w-fit mb-6">
                <CheckCircle className="text-emerald-400" />
              </div>
              <h3 className="text-4xl font-black text-white">{stats.converted}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-2">Convertidos (Mês)</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Leads Recentes */}
        <motion.div variants={fadeUp} className="md:col-span-3">
          <Card className="glass-card-premium">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/60">Últimas Oportunidades</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-primary text-[10px] font-bold uppercase tracking-widest">
                <Link to="/admin/leads/lista">Ver Todos</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-2">
                {recentLeads.map((lead) => (
                  <Link 
                    key={lead.id} 
                    to={`/admin/leads/${lead.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                  >
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-white group-hover:bg-primary/20 transition-colors">
                      {lead.nome[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{lead.nome}</p>
                      <p className="text-[10px] text-white/30 truncate uppercase tracking-widest">{lead.nome_negocio || "Startup"}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                       <div className={cn(
                         "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                         lead.status === "novo" ? "bg-rose-500/10 text-rose-400" : "bg-white/10 text-white/40"
                       )}>
                         {lead.status}
                       </div>
                    </div>
                    <ArrowRight size={14} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="col-span-1">
          <div className="grid grid-rows-2 gap-4 h-full">
             <Card className="glass-card-premium bg-emerald-500/5 border-emerald-500/10">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                   <PhoneCall className="text-emerald-400 mb-3" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">Follow-up Pendente</p>
                   <p className="text-2xl font-black text-white mt-1">14</p>
                </CardContent>
             </Card>
             <Card className="glass-card-premium bg-amber-500/5 border-amber-500/10">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                   <MessageCircle className="text-amber-400 mb-3" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">Aguardando Resposta</p>
                   <p className="text-2xl font-black text-white mt-1">08</p>
                </CardContent>
             </Card>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
