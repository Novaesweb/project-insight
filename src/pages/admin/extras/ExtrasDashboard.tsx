import { motion } from "framer-motion";
import { 
  Zap, 
  Star, 
  Rocket, 
  Plus, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  ShoppingCart
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExtras } from "@/features/extras/hooks/useExtras";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ExtrasDashboard() {
  const { stats, loading } = useExtras();

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
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Upsell & Expansion
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Catálogo de Upgrades</h1>
            <p className="max-w-2xl text-sm text-white/55">
              Gerencie extras, pacotes premium e serviços recorrentes para expansão de contas.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Link to="/admin/extras/lista">
              <Package className="mr-2 h-4 w-4" />
              Ver Todos
            </Link>
          </Button>
          <Button className="gradient-primary text-white shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[10px] px-6">
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Extras Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card Principal - Loja de Upgrades */}
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="glass-card-premium fx-glint h-full relative overflow-hidden group border-primary/20">
             <CardContent className="p-8">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Expansion Revenue</p>
                    <h3 className="text-5xl font-black text-white">
                      R$ {stats.receitaPotencialFixos.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                    <Rocket size={32} />
                  </div>
               </div>
               <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-primary font-bold">
                    <TrendingUp size={14} /> +12.5%
                  </div>
                  <span className="text-xs text-white/30 font-medium">Potencial de Upsell fixo</span>
               </div>
             </CardContent>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
          </Card>
        </motion.div>

        {/* Card MRR */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-card-premium fx-glint h-full border-l-4 border-l-blue-500">
            <CardContent className="p-8">
              <div className="p-3 rounded-xl bg-blue-500/10 w-fit mb-6">
                <DollarSign className="text-blue-400" />
              </div>
              <h3 className="text-3xl font-black text-white">R$ {stats.mrrPotencial.toLocaleString()}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-2">MRR Potencial</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Itens Ativos */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-card-premium fx-glint h-full border-l-4 border-l-emerald-500">
            <CardContent className="p-8">
              <div className="p-3 rounded-xl bg-emerald-500/10 w-fit mb-6">
                <Zap className="text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black text-white">{stats.total}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-2">Itens no Catálogo</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categoria: Fixos */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-card-premium h-full border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                   <Star size={18} />
                </div>
                <ArrowUpRight size={16} className="text-white/20 group-hover:text-primary transition-colors" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Únicos</h4>
              <p className="text-2xl font-bold text-white/80 mt-1">{stats.fixos}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categoria: Assinaturas */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-card-premium h-full border-white/5 hover:border-blue-500/20 transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                   <Zap size={18} />
                </div>
                <ArrowUpRight size={16} className="text-white/20 group-hover:text-blue-400 transition-colors" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Assinaturas</h4>
              <p className="text-2xl font-bold text-white/80 mt-1">{stats.assinaturas}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Promoção de Pacotes */}
        <motion.div variants={fadeUp} className="md:col-span-2">
           <Card className="glass-card-premium overflow-hidden border-purple-500/20 bg-purple-500/[0.02] group cursor-pointer">
             <CardContent className="p-6 flex items-center justify-between">
               <div className="flex items-center gap-6">
                 <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                   <ShoppingCart size={24} />
                 </div>
                 <div>
                   <h4 className="text-lg font-black text-white">Pacotes Premium</h4>
                   <p className="text-sm text-white/40">Crie combos irresistíveis para seus clientes.</p>
                 </div>
               </div>
               <ChevronRight className="text-white/20 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
             </CardContent>
           </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
