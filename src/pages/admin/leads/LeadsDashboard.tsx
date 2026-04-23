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
      {/* Header Premium Gold */}
      <motion.div variants={fadeUp} className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between px-2">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">
            <TrendingUp className="h-3.5 w-3.5" />
            Growth & Conversion Gold
          </div>
          <div>
            <h1 className="text-5xl font-light tracking-tight text-white md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Pipeline de <span className="text-gold-gradient italic">Oportunidades</span>
            </h1>
            <p className="max-w-2xl text-base text-white/40 leading-relaxed">
              Gestão de relacionamento e conversão de leads de alto valor estratégico.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-2xl border-white/5 bg-white/[0.03] text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <Link to="/admin/leads/lista">
              Gerenciar Base
            </Link>
          </Button>
          <Button asChild className="rounded-2xl border-0 bg-gold-gradient text-black font-bold uppercase tracking-widest text-[10px] px-8 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_25px_rgba(212,175,55,0.2)]">
            <Link to="/admin/leads/lista?status=novo">
              <Zap className="mr-2 h-4 w-4" />
              Atender Novos
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid CRM Stats Gold */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-1">
        
        {/* Card Principal - Entradas de Hoje */}
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="glass-premium fx-glint group relative overflow-hidden h-full border-[#D4AF37]/20">
             <CardContent className="p-10">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] mb-4">Novas Entradas (24h)</p>
                    <h3 className="text-7xl font-light text-white tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {stats.todayCount}
                    </h3>
                  </div>
                  <div className="p-5 rounded-[24px] bg-[#D4AF37]/10 text-[#FFD700] group-hover:rotate-12 transition-all duration-500">
                    <Sparkles size={36} />
                  </div>
               </div>
               <div className="mt-10 flex items-center gap-3">
                  <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">+12%</span> 
                  <span className="text-xs text-white/20 font-medium">Acima da média de crescimento</span>
               </div>
             </CardContent>
             <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D4AF37] to-transparent opacity-50" />
          </Card>
        </motion.div>

        {/* Card Não Visualizados */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className={cn(
            "glass-premium h-full group transition-all",
            stats.unvisited > 0 ? "border-rose-500/30 bg-rose-500/[0.03]" : "border-white/5"
          )}>
            <CardContent className="p-8">
              <div className={cn(
                "p-4 rounded-[20px] w-fit mb-8 border transition-all",
                stats.unvisited > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20"
              )}>
                <Clock size={24} className={stats.unvisited > 0 ? "text-rose-400" : "text-emerald-400"} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">Aguardando Triagem</p>
              <h3 className="text-4xl font-medium text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {stats.unvisited}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/10 mt-4 italic">Response time crucial</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Convertidos */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-premium h-full group hover:border-emerald-500/30 transition-all">
            <CardContent className="p-8">
              <div className="p-4 rounded-[20px] bg-emerald-500/5 w-fit mb-8 border border-emerald-500/10 group-hover:bg-emerald-500/10 transition-colors">
                <CheckCircle size={24} className="text-emerald-400" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">Convertidos (Mês)</p>
              <h3 className="text-4xl font-medium text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {stats.converted}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/10 mt-4">Sucesso operacional</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Leads Recentes - Gold Layout */}
        <motion.div variants={fadeUp} className="md:col-span-3">
          <Card className="glass-premium">
            <CardHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-white/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Oportunidades Estratégicas Recentes</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-[#D4AF37]/5">
                <Link to="/admin/leads/lista">Relatório Completo</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="space-y-1">
                {recentLeads.map((lead) => (
                  <Link 
                    key={lead.id} 
                    to={`/admin/leads/${lead.id}`}
                    className="flex items-center gap-5 p-4 rounded-[24px] hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-[16px] bg-white/[0.03] border border-white/5 flex items-center justify-center font-serif text-xl text-[#D4AF37] group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/20 transition-all">
                      {lead.nome[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white tracking-tight group-hover:text-[#FFD700] transition-colors">{lead.nome}</p>
                      <p className="text-[10px] text-white/20 truncate uppercase tracking-[0.15em] mt-1">{lead.nome_negocio || "Empresa sob Sigilo"}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                       <div className={cn(
                         "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border transition-all",
                         lead.status === "novo" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-white/5 border-white/5 text-white/30"
                       )}>
                         {lead.status}
                       </div>
                       <ArrowRight size={16} className="text-white/10 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
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
             <Card className="glass-premium bg-emerald-500/[0.02] border-emerald-500/10 group hover:bg-emerald-500/5 transition-all">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                   <div className="p-3 rounded-full bg-emerald-500/10 mb-4 group-hover:scale-110 transition-transform">
                     <PhoneCall size={20} className="text-emerald-400" />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/60">Follow-up</p>
                   <p className="text-3xl font-medium text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>14</p>
                </CardContent>
             </Card>
             <Card className="glass-premium bg-[#D4AF37]/[0.02] border-[#D4AF37]/10 group hover:bg-[#D4AF37]/5 transition-all">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                   <div className="p-3 rounded-full bg-[#D4AF37]/10 mb-4 group-hover:scale-110 transition-transform">
                     <MessageCircle size={20} className="text-[#FFD700]" />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]/60">Aguardando</p>
                   <p className="text-3xl font-medium text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>08</p>
                </CardContent>
             </Card>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
