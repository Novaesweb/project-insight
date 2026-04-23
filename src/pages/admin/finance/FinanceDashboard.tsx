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
      {/* Header Premium Brand */}
      <motion.div variants={fadeUp} className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between px-2">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border-slate-200 bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-[#EC4899]" />
            Financial Intelligence
          </div>
          <div>
            <h1 className="text-5xl font-light tracking-tight text-slate-900 md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Gestão <span className="text-brand-gradient italic">Financeira</span>
            </h1>
            <p className="max-w-2xl text-base text-slate-500 leading-relaxed">
              Monitore o fluxo de capital e a saúde do ecossistema NovaesWeb com precisão cirúrgica.
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1.5">
              Fluxo e Performance
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-2xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
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

      {/* Bento Grid Finance Stats Brand */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-1">
        
        {/* Card Principal - Receita Total */}
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="glass-premium relative overflow-hidden h-full border-slate-200 shadow-sm">
             <CardContent className="p-10">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EC4899] mb-3">Faturamento Global</p>
                    <h3 className="text-6xl font-light text-slate-900 tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                      R$ {stats.total.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-5 rounded-[24px] bg-brand-gradient text-white group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-[#7C3AED]/20">
                    <Wallet size={36} />
                  </div>
               </div>
               <div className="mt-10 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                    <ArrowUpRight size={14} /> +8.4%
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Crescimento vs anterior</span>
               </div>
             </CardContent>
             <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-gradient opacity-40" />
          </Card>
        </motion.div>

        {/* Card Recebido */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-premium h-full group hover:border-emerald-500/30 transition-all border-slate-200 shadow-sm bg-white">
            <CardContent className="p-8">
              <div className="p-4 rounded-[20px] bg-emerald-50 w-fit mb-8 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                <TrendingUp size={24} className="text-emerald-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Liquidado (Mês)</p>
              <h3 className="text-3xl font-medium text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                R$ {stats.recebido.toLocaleString()}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Pendente */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-premium h-full group hover:border-amber-500/30 transition-all border-slate-200 shadow-sm bg-white">
            <CardContent className="p-8">
              <div className="p-4 rounded-[20px] bg-amber-50 w-fit mb-8 border border-amber-100 group-hover:bg-amber-100 transition-colors">
                <DollarSign size={24} className="text-amber-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Pendente</p>
              <h3 className="text-3xl font-medium text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                R$ {stats.pendente.toLocaleString()}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerta de Atraso */}
        <motion.div variants={fadeUp} className="md:col-span-1">
          <Card className={cn(
            "glass-premium h-full group transition-all shadow-sm bg-white",
            stats.atraso > 0 ? "border-rose-200 bg-rose-50" : "border-slate-200"
          )}>
            <CardContent className="p-8">
              <div className={cn(
                "p-4 rounded-[20px] w-fit mb-8 border transition-all",
                stats.atraso > 0 ? "bg-rose-100 border-rose-200" : "bg-slate-50 border-slate-100"
              )}>
                <AlertCircle size={24} className={stats.atraso > 0 ? "text-rose-500" : "text-slate-300"} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Crítico / Atraso</p>
              <h3 className={cn("text-3xl font-medium", stats.atraso > 0 ? "text-rose-500" : "text-slate-400")} style={{ fontFamily: "'Playfair Display', serif" }}>
                R$ {stats.atraso.toLocaleString()}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        {/* Próximos Vencimentos List */}
        <motion.div variants={fadeUp} className="md:col-span-3">
           <Card className="glass-premium overflow-hidden border-slate-200 shadow-sm bg-white">
             <CardHeader className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-[#EC4899] flex items-center gap-3">
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
