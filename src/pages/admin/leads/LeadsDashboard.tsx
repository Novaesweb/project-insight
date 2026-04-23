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
      className="space-y-10 pb-12"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Header Premium Brand */}
      <motion.div variants={fadeUp} className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between px-2">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border-slate-200 bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-[#EC4899]" />
            Growth & Conversion
          </div>
          <div>
            <h1 className="text-5xl font-light tracking-tight text-slate-900 md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Pipeline de <span className="text-brand-gradient italic">Oportunidades</span>
            </h1>
            <p className="max-w-2xl text-base text-slate-500 leading-relaxed">
              Gestão estratégica de leads e prospecção de alta performance NovaesWeb.
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1.5">
              Inteligência Comercial
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-2xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
            <Link to="/admin/leads/lista">
              Gerenciar Base
            </Link>
          </Button>
          <Button asChild className="rounded-2xl border-0 bg-brand-gradient text-white font-bold uppercase tracking-widest text-[10px] px-8 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_25px_rgba(124,58,237,0.2)]">
            <Link to="/admin/leads/lista?status=novo">
              <Zap className="mr-2 h-4 w-4" />
              Atender Novos
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid CRM Stats Brand */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-1">
        
        {/* Card Principal - Entradas de Hoje */}
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="glass-premium relative overflow-hidden h-full border-slate-200 shadow-sm">
             <CardContent className="p-10">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EC4899] mb-4">Novas Entradas (24h)</p>
                    <h3 className="text-7xl font-light text-slate-900 tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {stats.todayCount}
                    </h3>
                  </div>
                  <div className="p-5 rounded-[24px] bg-brand-gradient text-white group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-[#EC4899]/20">
                    <Sparkles size={36} />
                  </div>
               </div>
               <div className="mt-10 flex items-center gap-3">
                  <span className="text-emerald-600 font-black text-xs uppercase tracking-widest">+12%</span> 
                  <span className="text-xs text-slate-400 font-medium">Acima da média de crescimento</span>
               </div>
             </CardContent>
             <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-gradient opacity-40" />
          </Card>
        </motion.div>

        {/* Card Não Visualizados */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className={cn(
            "glass-premium h-full group transition-all shadow-sm bg-white",
            stats.unvisited > 0 ? "border-rose-200 bg-rose-50" : "border-slate-200"
          )}>
            <CardContent className="p-8">
              <div className={cn(
                "p-4 rounded-[20px] w-fit mb-8 border transition-all",
                stats.unvisited > 0 ? "bg-rose-100 border-rose-200" : "bg-emerald-50 border-emerald-100"
              )}>
                <Clock size={24} className={stats.unvisited > 0 ? "text-rose-500" : "text-emerald-500"} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Aguardando Triagem</p>
              <h3 className="text-4xl font-medium text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                {stats.unvisited}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mt-4 italic">Response time crucial</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Convertidos */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-premium h-full group hover:border-emerald-500/30 transition-all border-slate-200 shadow-sm bg-white">
            <CardContent className="p-8">
              <div className="p-4 rounded-[20px] bg-emerald-50 w-fit mb-8 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                <CheckCircle size={24} className="text-emerald-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Convertidos (Mês)</p>
              <h3 className="text-4xl font-medium text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                {stats.converted}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mt-4">Sucesso operacional</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Leads Recentes - Brand Layout */}
        <motion.div variants={fadeUp} className="md:col-span-3">
          <Card className="glass-premium border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Oportunidades Estratégicas Recentes</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-[#EC4899] text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-[#EC4899]/5">
                <Link to="/admin/leads/lista">Relatório Completo</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="space-y-1">
                {recentLeads.map((lead) => (
                  <Link 
                    key={lead.id} 
                    to={`/admin/leads/${lead.id}`}
                    className="flex items-center gap-5 p-4 rounded-[24px] hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-[16px] bg-slate-100 border border-slate-200 flex items-center justify-center font-serif text-xl text-slate-400 group-hover:bg-brand-gradient group-hover:border-transparent group-hover:text-white transition-all shadow-sm">
                      {lead.nome[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-[#EC4899] transition-colors">{lead.nome}</p>
                      <p className="text-[10px] text-slate-400 truncate uppercase tracking-[0.15em] mt-1">{lead.nome_negocio || "Empresa sob Sigilo"}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                       <div className={cn(
                         "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border transition-all shadow-sm",
                         lead.status === "novo" ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-slate-50 border-slate-200 text-slate-400"
                       )}>
                         {lead.status}
                       </div>
                       <ArrowRight size={16} className="text-slate-200 group-hover:text-[#EC4899] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Follow-up Actions */}
        <motion.div variants={fadeUp} className="col-span-1">
          <div className="grid grid-rows-2 gap-4 h-full">
             <Card className="glass-premium bg-emerald-50 border-emerald-100 group hover:bg-emerald-100 transition-all shadow-sm">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                   <div className="p-3 rounded-full bg-white mb-4 group-hover:scale-110 transition-transform shadow-sm">
                     <PhoneCall size={20} className="text-emerald-500" />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/60">Follow-up</p>
                   <p className="text-3xl font-medium text-slate-900 mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>14</p>
                </CardContent>
             </Card>
             <Card className="glass-premium bg-[#7C3AED]/5 border-[#7C3AED]/10 group hover:bg-[#7C3AED]/10 transition-all shadow-sm">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                   <div className="p-3 rounded-full bg-white mb-4 group-hover:scale-110 transition-transform shadow-sm">
                     <MessageCircle size={20} className="text-[#7C3AED]" />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C3AED]/60">Aguardando</p>
                   <p className="text-3xl font-medium text-slate-900 mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>08</p>
                </CardContent>
             </Card>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
