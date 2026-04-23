import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  FolderKanban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProjectsDashboard() {
  const { kpis, healthMetrics, recentActivity, loading } = useProjects();

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
            <Sparkles className="h-3.5 w-3.5" />
            Solution Engineering Gold
          </div>
          <div>
            <h1 className="text-5xl font-light tracking-tight text-white md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Painel de <span className="text-gold-gradient italic">Projetos</span>
            </h1>
            <p className="max-w-2xl text-base text-white/40 leading-relaxed">
              Supervisão analítica de performance, cronogramas e entregas de alto padrão.
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1.5">
              Governança e Operações
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-2xl border-white/5 bg-white/[0.03] text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <Link to="/admin/projetos/lista">
              <List className="mr-2 h-4 w-4" />
              Tabela
            </Link>
          </Button>
          <Button asChild className="rounded-2xl border-0 bg-brand-gradient text-white font-bold uppercase tracking-widest text-[10px] px-8 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_25px_rgba(124,58,237,0.2)]">
            <Link to="/admin/projetos/kanban">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Kanban
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Control Center Gold */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-1">
        
        {/* KPI: Projetos Ativos - Grande */}
        <motion.div variants={fadeUp} className="md:col-span-2 row-span-1">
          <Card className="glass-premium fx-glint group relative overflow-hidden h-full border-[#D4AF37]/20">
             <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700">
               <FolderKanban size={240} />
             </div>
             <CardContent className="p-10 flex flex-col justify-between h-full relative z-10">
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] mb-4">Engenharia Ativa</p>
                 <h3 className="text-7xl font-light text-white tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                   {kpis.active}
                 </h3>
                 <p className="text-sm text-white/30 mt-4 leading-relaxed">Projetos em fase de execução de alta fidelidade.</p>
               </div>
               <div className="mt-12 grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                     <p className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-1">Entregues</p>
                     <p className="text-2xl font-medium text-emerald-400" style={{ fontFamily: "'Playfair Display', serif" }}>{kpis.completed}</p>
                  </div>
                  <div className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                     <p className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-1">Histórico</p>
                     <p className="text-2xl font-medium text-white/70" style={{ fontFamily: "'Playfair Display', serif" }}>{kpis.total}</p>
                  </div>
               </div>
             </CardContent>
             <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D4AF37] to-transparent opacity-50" />
          </Card>
        </motion.div>

        {/* KPI: Atrasados - Alerta */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className={cn(
            "glass-premium fx-glint h-full group transition-all",
            kpis.late > 0 ? "border-rose-500/30 bg-rose-500/[0.03]" : "border-white/5"
          )}>
            <CardContent className="p-8">
              <div className={cn(
                "p-5 rounded-[24px] border w-fit mb-8 transition-all",
                kpis.late > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20"
              )}>
                {kpis.late > 0 ? <AlertTriangle size={28} className="text-rose-400" /> : <CheckCircle2 size={28} className="text-emerald-400" />}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">Prazos & Riscos</p>
              <h3 className={cn("text-5xl font-medium", kpis.late > 0 ? "text-rose-400" : "text-emerald-400")} style={{ fontFamily: "'Playfair Display', serif" }}>
                {kpis.late}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/20 mt-4">
                {kpis.late === 1 ? "Inconsistência Detectada" : "Prazos em Revisão"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI: Saúde (Estagnados) */}
        <motion.div variants={fadeUp} className="col-span-1">
           <Card className="glass-premium h-full group hover:border-[#D4AF37]/30 transition-all">
            <CardContent className="p-8">
              <div className="p-5 rounded-[24px] bg-[#D4AF37]/5 border border-[#D4AF37]/10 w-fit mb-8 group-hover:bg-[#D4AF37]/10 transition-all">
                <Clock size={28} className="text-[#D4AF37]" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">Inércia (3 dias+)</p>
              <h3 className="text-5xl font-medium text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {healthMetrics?.staleCount || 0}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/20 mt-4">Aguardando Resposta</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Atividade Recente - Gold List */}
        <motion.div variants={fadeUp} className="md:col-span-3 lg:col-span-2">
           <Card className="glass-premium h-full">
            <CardHeader className="px-8 py-6 border-b border-white/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Log de Operações Premium</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="space-y-2">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-5 p-4 rounded-[20px] hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5 group">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/90 truncate tracking-tight">{activity.projetos?.titulo}</p>
                      <p className="text-[10px] text-white/40 truncate mt-1">{activity.descricao}</p>
                    </div>
                    <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )) : (
                  <p className="text-center py-10 text-xs text-white/20 italic font-medium">Silêncio operacional no momento.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Projetos em Risco - Gold Alert */}
        <motion.div variants={fadeUp} className="md:col-span-3 lg:col-span-2">
           <Card className="glass-premium h-full">
            <CardHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-white/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-400/80">Projetos sob Atenção</CardTitle>
              <AlertTriangle className="h-4 w-4 text-rose-500/40" />
            </CardHeader>
            <CardContent className="px-6 py-6">
               <div className="space-y-3">
                  {healthMetrics?.staleProjects.length > 0 ? healthMetrics.staleProjects.map((p: any) => (
                    <Link key={p.id} to={`/admin/projetos/${p.id}`} className="flex items-center justify-between p-4 rounded-[24px] bg-rose-500/[0.03] border border-rose-500/10 hover:bg-rose-500/[0.06] hover:border-rose-500/30 transition-all group">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white/90">{p.titulo}</span>
                        <p className="text-[9px] text-rose-400/50 uppercase tracking-widest font-black">Risco de Estagnação</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <ArrowRight size={14} className="text-rose-500/40 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                       <div className="p-5 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-4">
                          <CheckCircle2 size={40} className="text-emerald-500/20" />
                       </div>
                       <p className="text-xs text-white/30 font-medium tracking-wide">Ecossistema operando em plena saúde.</p>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
