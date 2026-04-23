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
      {/* Header Premium Brand */}
      <motion.div variants={fadeUp} className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between px-2">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border-slate-200 bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-[#EC4899]" />
            Solution Engineering
          </div>
          <div>
            <h1 className="text-5xl font-light tracking-tight text-slate-900 md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Painel de <span className="text-brand-gradient italic">Projetos</span>
            </h1>
            <p className="max-w-2xl text-base text-slate-500 leading-relaxed">
              Supervisão analítica de performance, cronogramas e entregas de alto padrão.
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1.5">
              Governança e Operações
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-2xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
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

      {/* Bento Grid Control Center Brand */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-1">
        
        {/* KPI: Projetos Ativos - Grande */}
        <motion.div variants={fadeUp} className="md:col-span-2 row-span-1">
          <Card className="glass-premium relative overflow-hidden h-full border-slate-200 shadow-sm">
             <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700">
               <FolderKanban size={240} />
             </div>
             <CardContent className="p-10 flex flex-col justify-between h-full relative z-10">
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EC4899] mb-4">Engenharia Ativa</p>
                 <h3 className="text-7xl font-light text-slate-900 tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                   {kpis.active}
                 </h3>
                 <p className="text-sm text-slate-400 mt-4 leading-relaxed">Projetos em fase de execução de alta fidelidade.</p>
               </div>
               <div className="mt-12 grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-200 group-hover:bg-slate-100 transition-colors shadow-sm">
                     <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Entregues</p>
                     <p className="text-2xl font-medium text-emerald-600" style={{ fontFamily: "'Playfair Display', serif" }}>{kpis.completed}</p>
                  </div>
                  <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-200 group-hover:bg-slate-100 transition-colors shadow-sm">
                     <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Histórico</p>
                     <p className="text-2xl font-medium text-slate-600" style={{ fontFamily: "'Playfair Display', serif" }}>{kpis.total}</p>
                  </div>
               </div>
             </CardContent>
             <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-gradient opacity-40" />
          </Card>
        </motion.div>

        {/* KPI: Atrasados - Alerta */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className={cn(
            "glass-premium h-full group transition-all shadow-sm bg-white",
            kpis.late > 0 ? "border-rose-200 bg-rose-50" : "border-slate-200"
          )}>
            <CardContent className="p-8">
              <div className={cn(
                "p-5 rounded-[24px] border w-fit mb-8 transition-all",
                kpis.late > 0 ? "bg-rose-100 border-rose-200" : "bg-emerald-50 border-emerald-100"
              )}>
                {kpis.late > 0 ? <AlertTriangle size={28} className="text-rose-500" /> : <CheckCircle2 size={28} className="text-emerald-500" />}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Prazos & Riscos</p>
              <h3 className={cn("text-5xl font-medium", kpis.late > 0 ? "text-rose-500" : "text-emerald-500")} style={{ fontFamily: "'Playfair Display', serif" }}>
                {kpis.late}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mt-4">
                {kpis.late === 1 ? "Inconsistência Detectada" : "Prazos em Revisão"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI: Saúde (Estagnados) */}
        <motion.div variants={fadeUp} className="col-span-1">
           <Card className="glass-premium h-full group hover:border-[#7C3AED]/30 transition-all border-slate-200 shadow-sm bg-white">
            <CardContent className="p-8">
              <div className="p-5 rounded-[24px] bg-amber-50 border border-amber-100 w-fit mb-8 group-hover:bg-amber-100 transition-all">
                <Clock size={28} className="text-amber-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Inércia (3 dias+)</p>
              <h3 className="text-5xl font-medium text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                {healthMetrics?.staleCount || 0}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mt-4">Aguardando Resposta</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Atividade Recente - Brand List */}
        <motion.div variants={fadeUp} className="md:col-span-3 lg:col-span-2">
           <Card className="glass-premium h-full border-slate-200 shadow-sm bg-white">
            <CardHeader className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Log de Operações Premium</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="space-y-2">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-5 p-4 rounded-[20px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-gradient shadow-[0_0_8px_rgba(124,58,237,0.3)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate tracking-tight">{activity.projetos?.titulo}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-1">{activity.descricao}</p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )) : (
                  <p className="text-center py-10 text-xs text-slate-300 italic font-medium">Silêncio operacional no momento.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Projetos em Risco - Brand Alert */}
        <motion.div variants={fadeUp} className="md:col-span-3 lg:col-span-2">
           <Card className="glass-premium h-full border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-slate-100 bg-rose-50/50">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500/80">Projetos sob Atenção</CardTitle>
              <AlertTriangle className="h-4 w-4 text-rose-300" />
            </CardHeader>
            <CardContent className="px-6 py-6">
               <div className="space-y-3">
                  {healthMetrics?.staleProjects.length > 0 ? healthMetrics.staleProjects.map((p: any) => (
                    <Link key={p.id} to={`/admin/projetos/${p.id}`} className="flex items-center justify-between p-4 rounded-[24px] bg-rose-50 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-all group shadow-sm">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-900">{p.titulo}</span>
                        <p className="text-[9px] text-rose-400 uppercase tracking-widest font-black">Risco de Estagnação</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <ArrowRight size={14} className="text-rose-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                       <div className="p-5 rounded-full bg-emerald-50 border border-emerald-100 mb-4 shadow-sm">
                          <CheckCircle2 size={40} className="text-emerald-500/40" />
                       </div>
                       <p className="text-xs text-slate-400 font-medium tracking-wide">Ecossistema operando em plena saúde.</p>
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
