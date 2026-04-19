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
      className="space-y-8 pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Header Premium */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-primary fx-glintReveal">
            <Sparkles className="h-3.5 w-3.5" />
            Engenharia de Soluções
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Dashboard de Projetos</h1>
            <p className="max-w-2xl text-sm text-white/55">
              Visão consolidada da saúde e progresso da sua operação digital.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
           <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Link to="/admin/projetos/lista">
              <List className="mr-2 h-4 w-4" />
              Lista
            </Link>
          </Button>
          <Button asChild className="border-0 text-white shadow-lg shadow-primary/20" style={{ background: "var(--gradient-primary)" }}>
            <Link to="/admin/projetos/kanban">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Kanban
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* KPI: Projetos Ativos - Grande */}
        <motion.div variants={fadeUp} className="md:col-span-2 row-span-1">
          <Card className="glass-card-premium h-full relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
               <FolderKanban size={120} />
             </div>
             <CardContent className="p-8 flex flex-col justify-between h-full">
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Operação Ativa</p>
                 <h3 className="text-5xl font-black text-white">{kpis.active}</h3>
                 <p className="text-sm text-white/40 mt-2">Projetos em desenvolvimento ou homologação.</p>
               </div>
               <div className="mt-8 flex gap-4">
                 <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/30">Concluídos</p>
                    <p className="text-xl font-bold text-emerald-400">{kpis.completed}</p>
                 </div>
                 <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/30">Total Histórico</p>
                    <p className="text-xl font-bold text-white/80">{kpis.total}</p>
                 </div>
               </div>
             </CardContent>
          </Card>
        </motion.div>

        {/* KPI: Atrasados - Alerta */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className={cn(
            "glass-card-premium h-full transition-all border-l-4",
            kpis.late > 0 ? "border-l-red-500 bg-red-500/5" : "border-l-emerald-500"
          )}>
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div className={cn("p-3 rounded-xl", kpis.late > 0 ? "bg-red-500/20" : "bg-emerald-500/20")}>
                  {kpis.late > 0 ? <AlertTriangle className="text-red-400" /> : <CheckCircle2 className="text-emerald-400" />}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-4xl font-black text-white">{kpis.late}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-2">
                  {kpis.late === 1 ? "Projeto Atrasado" : "Projetos Atrasados"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI: Saúde (Estagnados) */}
        <motion.div variants={fadeUp} className="col-span-1">
           <Card className="glass-card-premium h-full">
            <CardContent className="p-8">
              <div className="p-3 rounded-xl bg-amber-500/20 w-fit">
                <Clock className="text-amber-400" />
              </div>
              <div className="mt-6">
                <h3 className="text-4xl font-black text-white">{healthMetrics?.staleCount || 0}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-2">Sem Atualização (3d+)</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Atividade Recente - Lista elegante */}
        <motion.div variants={fadeUp} className="md:col-span-3 lg:col-span-2">
           <Card className="glass-card-premium h-full">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/60">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white/90 truncate">{activity.projetos?.titulo}</p>
                      <p className="text-[10px] text-white/40 truncate mt-0.5">{activity.descricao}</p>
                    </div>
                    <span className="text-[9px] font-bold text-white/20 whitespace-nowrap">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )) : (
                  <p className="text-center py-8 text-xs text-white/30 font-medium italic">Nenhuma atividade recente registrada.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Projetos em Risco - Detalhes */}
        <motion.div variants={fadeUp} className="md:col-span-3 lg:col-span-2">
           <Card className="glass-card-premium h-full border-dashed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-red-400/80">Projetos em Risco</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500/50" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
               <div className="space-y-4">
                  {healthMetrics?.staleProjects.length > 0 ? healthMetrics.staleProjects.map((p: any) => (
                    <Link key={p.id} to={`/admin/projetos/${p.id}`} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all group">
                      <span className="text-xs font-bold text-white/80">{p.titulo}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] uppercase font-bold text-red-400/60">Ver Detalhes</span>
                         <ArrowRight size={12} className="text-red-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                       <CheckCircle2 size={32} className="text-emerald-500/20 mb-2" />
                       <p className="text-xs text-white/40 font-medium">Todos os projetos em dia!</p>
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
