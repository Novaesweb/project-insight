import { useState } from "react";
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
  ShoppingCart,
  Users,
  Eye,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExtras } from "@/features/extras/hooks/useExtras";
import { cn } from "@/lib/utils";
import { BundleBuilderWizard } from "@/features/extras/components/BundleBuilderWizard";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  Tooltip,
  XAxis,
  YAxis 
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Mock data for the "Expansion Revenue" chart
const mockChartData = [
  { name: "Jan", val: 4000 },
  { name: "Fev", val: 3000 },
  { name: "Mar", val: 5000 },
  { name: "Abr", val: 4500 },
  { name: "Mai", val: 6000 },
  { name: "Jun", val: 7500 },
];

export default function ExtrasDashboard() {
  const { stats, loading } = useExtras();
  const [showBuilder, setShowBuilder] = useState(false);

  if (showBuilder) {
    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowBuilder(false)}
            className="text-white/40 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
          </Button>
        </div>
        <BundleBuilderWizard onComplete={() => setShowBuilder(false)} />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8 pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
    >
      {/* Header Premium */}
      <motion.div variants={fadeUp} className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Ecosystem Upsell Engine
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Hub de <span className="text-primary">Upgrades</span>
            </h1>
            <p className="max-w-2xl text-sm text-white/40 font-medium">
              Maximize o LTV (Lifetime Value) dos seus clientes através de ofertas estratégicas, 
              serviços recorrentes e pacotes premium personalizados.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 px-6 rounded-2xl">
            <Link to="/admin/extras">
              <Package className="mr-2 h-4 w-4" />
              Catálogo Completo
            </Link>
          </Button>
          <Button 
            onClick={() => setShowBuilder(true)}
            className="h-12 gradient-primary text-white shadow-xl shadow-primary/25 font-black uppercase tracking-widest text-[11px] px-8 rounded-2xl group transition-all hover:scale-[1.02]"
          >
            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
            Novo Módulo
          </Button>
        </div>
      </motion.div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Card - Growth Insight */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <Card className="glass-card-premium overflow-hidden border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(194,24,91,0.15),transparent_50%)]">
             <CardContent className="p-0">
               <div className="grid grid-cols-1 md:grid-cols-3">
                 <div className="p-8 space-y-6">
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Expansion Revenue</p>
                     <h3 className="text-5xl font-black text-white">
                       R$ {stats.receitaPotencialFixos.toLocaleString()}
                     </h3>
                     <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
                       <TrendingUp size={14} /> 
                       <span>+18.4% este mês</span>
                     </div>
                   </div>
                   
                   <div className="space-y-4 pt-4">
                     <div className="flex items-center gap-3">
                       <div className="h-2 w-2 rounded-full bg-primary" />
                       <span className="text-xs text-white/60 font-medium">Potencial de Venda Fixo</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="h-2 w-2 rounded-full bg-blue-400" />
                       <span className="text-xs text-white/60 font-medium">Potencial de MRR Ativo</span>
                     </div>
                   </div>

                   <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white/80 hover:text-white rounded-xl h-10 text-xs">
                     Ver Relatório Detalhado
                   </Button>
                 </div>

                 <div className="md:col-span-2 bg-black/20 p-4 md:p-8">
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockChartData}>
                          <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#c2185b" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#c2185b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1425', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="val" 
                            stroke="#c2185b" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorVal)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
               </div>
             </CardContent>
          </Card>
        </motion.div>

        {/* Vertical Stats Sidebar */}
        <div className="space-y-6">
          <motion.div variants={fadeUp}>
            <Card className="glass-card-premium fx-glint h-full border-l-4 border-l-blue-500 bg-blue-500/[0.03]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <DollarSign size={20} />
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[9px] uppercase tracking-tighter">Recorrente</Badge>
                </div>
                <h3 className="text-3xl font-black text-white">R$ {stats.mrrPotencial.toLocaleString()}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-2">MRR Potencial</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="glass-card-premium fx-glint h-full border-l-4 border-l-emerald-500 bg-emerald-500/[0.03]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Zap size={20} />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[9px] uppercase tracking-tighter">Ativos</Badge>
                </div>
                <h3 className="text-3xl font-black text-white">{stats.total}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-2">Módulos Ativos</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Categorias & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card Únicos */}
        <motion.div variants={fadeUp} className="group cursor-pointer">
          <Card className="glass-card-premium h-full border-white/5 group-hover:border-emerald-500/30 transition-all duration-500 overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <Star size={24} />
                </div>
                <ArrowUpRight className="text-white/10 group-hover:text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h4 className="text-xl font-black text-white">Upgrades Únicos</h4>
              <p className="text-sm text-white/40 mt-2 leading-relaxed">Configurações pontuais e setups especializados de alto impacto.</p>
              
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Quantidade</p>
                  <p className="text-2xl font-black text-white">{stats.fixos} <span className="text-sm font-medium text-white/30 italic">itens</span></p>
                </div>
                <div className="h-10 w-10 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Assinaturas */}
        <motion.div variants={fadeUp} className="group cursor-pointer">
          <Card className="glass-card-premium h-full border-white/5 group-hover:border-blue-500/30 transition-all duration-500 overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                  <Rocket size={24} />
                </div>
                <ArrowUpRight className="text-white/10 group-hover:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h4 className="text-xl font-black text-white">Recorrência (MRR)</h4>
              <p className="text-sm text-white/40 mt-2 leading-relaxed">Funcionalidades mensais que geram receita estável e escalável.</p>
              
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Quantidade</p>
                  <p className="text-2xl font-black text-white">{stats.assinaturas} <span className="text-sm font-medium text-white/30 italic">planos</span></p>
                </div>
                <div className="h-10 w-10 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Pacotes */}
        <motion.div variants={fadeUp} className="group cursor-pointer">
          <Card className="glass-card-premium h-full border-white/5 group-hover:border-purple-500/30 transition-all duration-500 overflow-hidden relative bg-[linear-gradient(135deg,transparent,rgba(168,85,247,0.02))]">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                  <ShoppingCart size={24} />
                </div>
                <ArrowUpRight className="text-white/10 group-hover:text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h4 className="text-xl font-black text-white">Bundles Premium</h4>
              <p className="text-sm text-white/40 mt-2 leading-relaxed">Combos estratégicos com descontos progressivos e alto valor percebido.</p>
              
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Ação Sugerida</p>
                  <p className="text-sm font-black text-purple-400 uppercase tracking-widest">Criar Novo Combo</p>
                </div>
                <div className="h-10 w-10 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* Footer Magic Banner */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card-premium border-primary/20 overflow-hidden bg-[linear-gradient(90deg,rgba(194,24,91,0.05),transparent)] relative">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl">
                <Users size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Inteligência de Mercado</h3>
                <p className="text-sm text-white/40">Descubra quais módulos seus clientes mais estão buscando no portal.</p>
              </div>
            </div>
            <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 px-8 rounded-xl font-black text-xs uppercase tracking-widest h-12">
              <Eye className="mr-2 h-4 w-4" />
              Explorar Intenções
            </Button>
          </CardContent>
          <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        </Card>
      </motion.div>
    </motion.div>
  );
}
