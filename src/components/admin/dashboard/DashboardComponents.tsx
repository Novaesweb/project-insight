import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users, FolderKanban, ShoppingCart, DollarSign, ArrowRight, CheckCircle2, 
  Plus, Sparkles, AlertTriangle, TrendingUp 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function DashboardKPIs({ stats, revenue }: any) {
  const kpis = [
    { label: "Ecossistemas em Operação", value: String(stats.clientes), icon: Users, color: "from-[#7b1fa2] to-[#c2185b]" },
    { label: "Engenharia de Soluções", value: String(stats.projetos), icon: FolderKanban, color: "from-[#c2185b] to-[#e8334a]" },
    { 
      label: "Alertas de Conversão", 
      value: String(stats.pedidos), 
      icon: ShoppingCart, 
      color: "from-[#e8334a] to-[#7b1fa2]", 
      alert: stats.pedidos > 0,
      change: stats.pedidos > 0 ? "Prioritário" : ""
    },
    { 
      label: "Impacto Financeiro Gerado", 
      value: `R$ ${(stats.receita / 1000).toFixed(1)}k`, 
      icon: DollarSign, 
      color: "from-[#7b1fa2] via-[#c2185b] to-[#e8334a]" 
    },
  ];

  return (
    <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={fadeUp}>
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="glass-card border-white/5 overflow-hidden info-card-hover group relative">
          <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-20 blur-[40px] transition-all duration-700 group-hover:scale-150`} />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold mb-0.5">{kpi.label}</p>
                <p className="text-2xl font-black text-white tracking-tighter leading-none">{kpi.value}</p>
                {kpi.change && (
                  <div className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8px] font-bold mt-2 border",
                    kpi.alert ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                  )}>
                    {kpi.alert ? <AlertTriangle className="w-2 h-2" /> : <TrendingUp className="w-2 h-2" />}
                    {kpi.change}
                  </div>
                )}
              </div>
              <div className={`p-2.5 rounded-[14px] bg-gradient-to-br ${kpi.color} shadow-2xl shadow-black/40 group-hover:rotate-12 transition-all duration-500`}>
                <kpi.icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}

export function InsightAction({ icon: Icon, title, desc, action, link, color }: any) {
  return (
    <div className={cn("p-5 rounded-[2rem] bg-white/[0.02] border transition-all hover:bg-white/5 hover:border-white/10 group", color)}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black text-white mb-1 uppercase tracking-tighter">{title}</h4>
          <p className="text-[10px] text-white/40 font-medium leading-relaxed mb-4">{desc}</p>
          <Button asChild variant="ghost" className="h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 border border-primary/10">
            <Link to={link}>{action} <ArrowRight className="ml-2 w-3 h-3" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PricingDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-[0.5px] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Catálogo de Planos & Engenharia v9.0
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <PlanCard title="V9 BASE" price="R$ 497" monthly="R$ 49" items={["Site Vitrine v9.0", "Botão WhatsApp", "Suporte Padrão"]} color="border-blue-500/20" />
          <PlanCard title="V9 PLUS" price="R$ 997" monthly="R$ 99" items={["Delivery Completo", "PWA Nativo", "Painel Architect"]} color="border-primary/20" featured />
          <PlanCard title="V9 PRO" price="R$ 1.997" monthly="R$ 199" items={["Tudo + IA GPT", "CRM Architect", "Prioridade Zero"]} color="border-purple-500/20" />
        </div>

        <div className="mt-8 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Extras e Upgrades Individuais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <ExtraItem label="IA Sales GPT" setup="R$ 500" monthly="R$ 50" />
            <ExtraItem label="Fidelidade Digital" setup="R$ 300" monthly="R$ 30" />
            <ExtraItem label="Multi-Store" setup="R$ 400" monthly="R$ 40" />
            <ExtraItem label="Dossiê Performance" setup="—" monthly="R$ 200" />
            <ExtraItem label="Blindagem (Cofre)" setup="R$ 150" monthly="—" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlanCard({ title, price, monthly, items, color, featured }: any) {
  return (
    <div className={cn(
      "p-6 rounded-[2rem] bg-white/[0.02] border transition-all h-full flex flex-col",
      color,
      featured && "bg-primary/5 border-primary/40 shadow-2xl shadow-primary/10 scale-105"
    )}>
      <div className="mb-6">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{title}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white">{price}</span>
          <span className="text-[10px] text-white/40 font-bold">SETUP</span>
        </div>
        <div className="text-primary font-black text-sm mt-1">{monthly}/mês</div>
      </div>
      <ul className="space-y-2 mb-8 flex-1">
        {items.map((it: string) => (
          <li key={it} className="flex items-center gap-2 text-[10px] font-medium text-white/60">
            <CheckCircle2 className="w-3 h-3 text-primary" /> {it}
          </li>
        ))}
      </ul>
      <Button className={cn("w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", featured ? "gradient-primary border-0" : "bg-white/5 border border-white/10 hover:bg-white/10")}>
        Selecionar
      </Button>
    </div>
  );
}

export function ExtraItem({ label, setup, monthly }: any) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
      <div>
        <h5 className="text-[10px] font-black text-white uppercase tracking-tighter">{label}</h5>
        <p className="text-[9px] text-white/40 font-medium">{setup} setup • {monthly}/mês</p>
      </div>
      <Plus className="w-3 h-3 text-white/20 group-hover:text-primary transition-colors" />
    </div>
  );
}



