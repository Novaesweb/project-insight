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
      className="space-y-8 pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Header Premium */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            Financial Intelligence
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Gestão Financeira</h1>
            <p className="max-w-2xl text-sm text-white/55">
              Controle de fluxo de caixa, faturamento recorrente e saúde financeira do ecossistema.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Link to="/admin/financeiro/lista">
              <FileText className="mr-2 h-4 w-4" />
              Ver Lançamentos
            </Link>
          </Button>
          <Button className="gradient-primary text-white shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[10px] px-6">
            <Plus className="mr-2 h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Finance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card Principal - Receita Total */}
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="glass-card-premium h-full relative overflow-hidden group bg-emerald-500/[0.03] border-emerald-500/20">
             <CardContent className="p-8">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Faturamento Total</p>
                    <h3 className="text-5xl font-black text-white">R$ {stats.total.toLocaleString()}</h3>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Wallet size={32} />
                  </div>
               </div>
               <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                    <ArrowUpRight size={14} /> +8.4%
                  </div>
                  <span className="text-xs text-white/30 font-medium">vs último mês</span>
               </div>
             </CardContent>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent" />
          </Card>
        </motion.div>

        {/* Card Recebido */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-card-premium h-full border-l-4 border-l-emerald-500">
            <CardContent className="p-8">
              <div className="p-3 rounded-xl bg-emerald-500/10 w-fit mb-6">
                <TrendingUp className="text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black text-white">R$ {stats.recebido.toLocaleString()}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-2">Liquidado (Mês)</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Pendente */}
        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-card-premium h-full border-l-4 border-l-amber-500">
            <CardContent className="p-8">
              <div className="p-3 rounded-xl bg-amber-500/10 w-fit mb-6">
                <DollarSign className="text-amber-400" />
              </div>
              <h3 className="text-3xl font-black text-white">R$ {stats.pendente.toLocaleString()}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-2">Pendente</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerta de Atraso */}
        <motion.div variants={fadeUp} className="md:col-span-1">
          <Card className={cn(
            "glass-card-premium h-full transition-all border",
            stats.atraso > 0 ? "border-rose-500/50 bg-rose-500/[0.02]" : "border-white/5"
          )}>
            <CardContent className="p-8">
              <div className={cn(
                "p-3 rounded-xl w-fit mb-6",
                stats.atraso > 0 ? "bg-rose-500/10" : "bg-white/5"
              )}>
                <AlertCircle className={stats.atraso > 0 ? "text-rose-400" : "text-white/20"} />
              </div>
              <h3 className={cn("text-3xl font-black", stats.atraso > 0 ? "text-rose-400" : "text-white/40")}>
                R$ {stats.atraso.toLocaleString()}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-2">Faturas em Atraso</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Billing Panel (Reuso) */}
        <motion.div variants={fadeUp} className="md:col-span-3">
           <Card className="glass-card-premium overflow-hidden border-white/5">
             <CardHeader className="border-b border-white/5 bg-white/[0.01]">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-primary" />
                 Próximos Vencimentos
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
