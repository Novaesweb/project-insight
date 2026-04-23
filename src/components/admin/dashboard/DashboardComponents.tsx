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

const kpiGradients = [
  { bg: "from-[#FF1F1F]/20 to-transparent", icon: "bg-brand-gradient", glow: "shadow-[#FF1F1F]/20", border: "border-[#FF1F1F]/10" },
  { bg: "from-[#7C3AED]/20 to-transparent", icon: "bg-brand-gradient", glow: "shadow-[#7C3AED]/20", border: "border-[#7C3AED]/10" },
  { bg: "from-[#EC4899]/20 to-transparent", icon: "bg-brand-gradient", glow: "shadow-[#EC4899]/20", border: "border-[#EC4899]/10" },
  { bg: "from-[#FF1F1F]/20 to-[#7C3AED]/5", icon: "bg-brand-gradient", glow: "shadow-[#FF1F1F]/20", border: "border-[#7C3AED]/10" },
];

export function DashboardKPIs({ stats, revenue }: any) {
  const kpis = [
    {
      label: "Ecossistemas",
      value: String(stats.clientes),
      icon: Users,
      href: "/admin/clientes",
      hint: "Ativos na Base",
    },
    {
      label: "Engenharia",
      value: String(stats.projetos),
      icon: FolderKanban,
      href: "/admin/projetos",
      hint: "Projetos Ativos",
    },
    { 
      label: "Oportunidades", 
      value: String(stats.leads), 
      icon: ShoppingCart, 
      alert: stats.leads > 0,
      change: stats.leads > 0 ? "Novo Lead" : "",
      href: "/admin/leads?preset=novos",
      hint: "Leads Pendentes",
    },
    { 
      label: "Liquidez", 
      value: `R$ ${(stats.receita / 1000).toFixed(1)}k`, 
      icon: DollarSign,
      change: revenue?.pending > 0 ? `R$ ${(revenue.pending / 1000).toFixed(1)}k pend.` : "Fluxo Estável",
      href: "/admin/financeiro",
      hint: "Receita Mensal",
    },
  ];

  return (
    <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={fadeUp}>
      {kpis.map((kpi, i) => {
        const g = kpiGradients[i];
        return (
          <Link key={kpi.label} to={kpi.href} className="block">
            <Card className={cn("glass-premium relative overflow-hidden border-white/10 group transition-all duration-500 hover:-translate-y-2")}>
            <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${g.bg} opacity-0 group-hover:opacity-100 blur-[40px] transition-all duration-700`} />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EC4899]/60 group-hover:text-[#EC4899] transition-colors mb-2">{kpi.label}</p>
                  <p className="text-4xl font-light text-white tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>{kpi.value}</p>
                  {kpi.change && (
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold mt-3 border transition-colors",
                      kpi.alert ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20"
                    )}>
                      {kpi.alert ? <AlertTriangle size={10} /> : <TrendingUp size={10} />}
                      {kpi.change}
                    </div>
                  )}
                </div>
                <div className={cn("p-3 rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-110", g.icon, g.glow)}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors">
                <span>{kpi.hint}</span>
                <ArrowRight size={12} className="text-[#EC4899] transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </CardContent>
            </Card>
          </Link>
        );
      })}
    </motion.div>
  );
}

export function InsightAction({ icon: Icon, title, desc, action, link, color }: any) {
  return (
    <div className={cn("glass-premium p-6 rounded-[32px] border-white/5 transition-all hover:border-[#7C3AED]/20 group", color)}>
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-[20px] bg-brand-gradient flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-[#7C3AED]/10">
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black text-white mb-2 uppercase tracking-[0.2em] group-hover:text-[#EC4899] transition-colors">{title}</h4>
          <p className="text-[11px] text-white/40 font-medium leading-relaxed mb-6 group-hover:text-white/60 transition-colors">{desc}</p>
          <Button asChild variant="ghost" className="h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#EC4899] hover:bg-[#EC4899]/5 border border-[#EC4899]/20">
            <Link to={link}>{action} <ArrowRight className="ml-2 w-3.5 h-3.5" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PricingDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-premium border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto p-10 rounded-[40px]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-light text-white flex items-center gap-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Sparkles className="w-8 h-8 text-[#EC4899]" /> Catálogo de <span className="text-brand-gradient italic">Valor Elite</span>
          </DialogTitle>
          <p className="text-xs text-white/40 uppercase tracking-[0.3em] mt-2">Engenharia de Soluções Premium • v10.0 Brand Edition</p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <PlanCard title="V10 BASE" price="R$ 497" monthly="R$ 49" items={["Site Vitrine v10.0", "Botão WhatsApp", "Suporte Especialista"]} gradient="from-[#FF1F1F]/40 to-[#7C3AED]/10" />
          <PlanCard title="V10 PLUS" price="R$ 997" monthly="R$ 99" items={["Delivery High-End", "PWA Nativo Brand", "Painel Architect Pro"]} gradient="from-[#FF1F1F] to-[#7C3AED]" featured />
          <PlanCard title="V10 PRO" price="R$ 1.997" monthly="R$ 199" items={["Tudo + IA Neural", "CRM Fluxo de Performance", "Prioridade Alpha 24/7"]} gradient="from-[#7C3AED] to-[#EC4899]" />
        </div>

        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Injeções de Performance Individuais</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ExtraItem label="IA Sales GPT" setup="R$ 500" monthly="R$ 50" />
            <ExtraItem label="Fidelidade Digital" setup="R$ 300" monthly="R$ 30" />
            <ExtraItem label="Multi-Store" setup="R$ 400" monthly="R$ 40" />
            <ExtraItem label="Dossiê Performance" setup="—" monthly="R$ 200" />
            <ExtraItem label="Blindagem Alpha" setup="R$ 150" monthly="—" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlanCard({ title, price, monthly, items, gradient, featured }: any) {
  return (
    <div className={cn(
      "glass-premium relative p-8 rounded-[32px] border-white/5 transition-all h-full flex flex-col overflow-hidden",
      featured && "border-[#7C3AED]/40 shadow-[0_20px_50px_rgba(124,58,237,0.1)] scale-[1.05] z-10 bg-[#7C3AED]/5"
    )}>
      <div className={cn("absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-50", gradient)} />
      <div className="mb-8">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EC4899]/60 mb-4">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{price}</span>
          <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Setup</span>
        </div>
        <div className="text-xl font-medium mt-2 text-brand-gradient" style={{ fontFamily: "'Playfair Display', serif" }}>{monthly}<span className="text-xs text-white/40">/mês</span></div>
      </div>
      <ul className="space-y-4 mb-10 flex-1">
        {items.map((it: string) => (
          <li key={it} className="flex items-center gap-3 text-[11px] font-medium text-white/50 group">
            <CheckCircle2 size={14} className="text-[#EC4899]" /> {it}
          </li>
        ))}
      </ul>
      <Button className={cn("w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all", featured ? "bg-brand-gradient text-white border-0 shadow-lg shadow-[#7C3AED]/20" : "bg-white/5 border border-white/10 hover:bg-white/20 text-white")}>
        Adquirir
      </Button>
    </div>
  );
}

export function ExtraItem({ label, setup, monthly }: any) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-[#EC4899]/20 hover:bg-[#EC4899]/5 transition-all">
      <div>
        <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1 group-hover:text-[#EC4899] transition-colors">{label}</h5>
        <p className="text-[10px] text-white/30 font-medium">{setup} <span className="mx-1 opacity-30">•</span> {monthly}/mês</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#EC4899] group-hover:text-black transition-all">
        <Plus size={14} />
      </div>
    </div>
  );
}
