import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus,
  FileText,
  PieChart,
  Calendar,
  Wallet
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/features/finance/hooks/useFinance";
import UpcomingBillingPanel from "@/components/admin/financeiro/UpcomingBillingPanel";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FinanceDashboard() {
  const { entries, stats, loading } = useFinance();

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
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#FFD700]">
            <TrendingUp className="h-3.5 w-3.5" />
            Financial Intelligence Gold
          </div>
          <div>
            <h1 className="text-5xl font-light tracking-tight text-white md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Gestão <span className="text-gold-gradient italic">Financeira</span>
            </h1>
            <p className="max-w-2xl text-base text-white/40 leading-relaxed">
              Monitore o fluxo de capital e a saúde do ecossistema NovaesWeb com precisão cirúrgica.
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1.5">
              Fluxo e Performance
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-2xl border-white/5 bg-white/[0.03] text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <Link to="/admin/financeiro/lista">
              <FileText className="mr-2 h-4 w-4" />
              Relatórios
            </Link>
          </Button>
          <Button className="rounded-2xl border-0 bg-brand-gradient text-white font-bold uppercase tracking-widest text-[10px] px-8 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_25px_rgba(124,58,237,0.2)]">
            <Plus className="mr-2 h-4 w-4" />
            Lançamento
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Finance Stats Gold */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-1">
        
        {/* Card Principal - Receita Total */}
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="glass-premium fx-glint group relative overflow-hidden h-full border-[#D4AF37]/20">
             <CardContent className="p-10">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] mb-3">Faturamento Global</p>
                    <h3 className="text-6xl font-light text-white tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                      R$ {stats.total.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-5 rounded-[24px] bg-[#D4AF37]/10 text-[#FFD700] group-hover:scale-110 transition-transform duration-500">
                    <Wallet size={36} />
                  </div>
               </div>
               <div className="mt-10 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                    <ArrowUpRight size={14} /> +8.4%
                  </div>
                  <span className="text-xs text-white/20 font-medium">Crescimento vs anterior</span>
               </div>
             </CardContent>
             <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D4AF37] to-transparent opacity-50" />
          </Card>
        </motion.div>

        {/* Card Recebido */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-premium h-full group hover:border-emerald-500/30 transition-all">
            <CardContent className="p-8">
              <div className="p-4 rounded-[20px] bg-emerald-500/5 w-fit mb-8 border border-emerald-500/10 group-hover:bg-emerald-500/10 transition-colors">
                <TrendingUp size={24} className="text-emerald-400" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">Liquidado (Mês)</p>
              <h3 className="text-3xl font-medium text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                R$ {stats.recebido.toLocaleString()}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Pendente */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-premium h-full group hover:border-amber-500/30 transition-all">
            <CardContent className="p-8">
              <div className="p-4 rounded-[20px] bg-amber-500/5 w-fit mb-8 border border-amber-500/10 group-hover:bg-amber-500/10 transition-colors">
                <DollarSign size={24} className="text-amber-400" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">Pendente</p>
              <h3 className="text-3xl font-medium text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                R$ {stats.pendente.toLocaleString()}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerta de Atraso */}
        <motion.div variants={fadeUp} className="md:col-span-1">
          <Card className={cn(
            "glass-premium h-full group transition-all",
            stats.atraso > 0 ? "border-rose-500/30 bg-rose-500/[0.03]" : "border-white/5"
          )}>
            <CardContent className="p-8">
              <div className={cn(
                "p-4 rounded-[20px] w-fit mb-8 border transition-all",
                stats.atraso > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-white/5 border-white/5"
              )}>
                <AlertCircle size={24} className={stats.atraso > 0 ? "text-rose-400" : "text-white/20"} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">Crítico / Atraso</p>
              <h3 className={cn("text-3xl font-medium", stats.atraso > 0 ? "text-rose-400" : "text-white/30")} style={{ fontFamily: "'Playfair Display', serif" }}>
                R$ {stats.atraso.toLocaleString()}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        {/* Próximos Vencimentos List */}
        <motion.div variants={fadeUp} className="md:col-span-3">
           <Card className="glass-premium overflow-hidden border-white/5">
             <CardHeader className="border-b border-white/5 px-8 py-6 bg-white/[0.01]">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37] flex items-center gap-3">
                 <Calendar className="w-4 h-4" />
                 Agenda de Faturamentos Próximos
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <UpcomingBillingPanel />
             </CardContent>
           </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
