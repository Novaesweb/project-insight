import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, FolderKanban, ShoppingCart, DollarSign, Headphones, 
  BellRing, Sparkles, UserPlus, Zap, Plus, ShieldCheck, ArrowRight, ClipboardList
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notifyAdminPanel, notifyClientPanel } from "@/lib/user-notifications";

import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardKPIs, InsightAction, PricingDialog } from "@/components/admin/dashboard/DashboardComponents";
import { RevenueChart, ModulesChart } from "@/components/admin/dashboard/DashboardCharts";
import { DashboardKPIAlerts } from "@/components/admin/dashboard/DashboardKPIAlerts";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    stats, pedidos, tickets, dbStatus, activity, 
    monthlyRevenue, topModules, funnelData, pendingInvoices, revenue, newLeads, lateProjects, refresh 
  } = useDashboardData();

  const [showAddExtra, setShowAddExtra] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [clienteSel, setClienteSel] = useState("");
  const [extraSel, setExtraSel] = useState("");
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);
  const [visibleActs, setVisibleActs] = useState(5);

  const priorities = [
    {
      title: "Novos Leads",
      count: newLeads,
      description: "Oportunidades de ouro aguardando qualificação.",
      href: "/admin/leads?preset=novos",
      accent: "from-[#D4AF37] to-[#B8860B]",
    },
    {
      title: "Financeiro Pendente",
      count: pendingInvoices,
      description: "Cobranças em aberto que impactam o fluxo de caixa.",
      href: "/admin/financeiro?status=pendente&period=month",
      accent: "from-[#FFB800] to-[#D4AF37]",
    },
    {
      title: "Atrasos em Projetos",
      count: lateProjects,
      description: "Entregas críticas que exigem revisão estratégica.",
      href: "/admin/projetos",
      accent: "from-[#FF4D4D] to-[#FF0000]",
    },
  ].filter((item) => item.count > 0);

  const openAddExtra = async () => {
    const [cli, cat] = await Promise.all([
      supabase.from("clientes").select("id, nome").eq("status", "ativo").order("nome"),
      supabase.from("extras_catalogo").select("*").eq("status", "ativo").order("nome"),
    ]);
    setClientes(cli.data || []);
    setCatalogo(cat.data || []);
    setShowAddExtra(true);
  };

  const handleAddExtra = async () => {
    if (!clienteSel || !extraSel) return;
    const extra = catalogo.find(c => c.id === extraSel);
    const cliente = clientes.find((c) => c.id === clienteSel);
    if (!extra) return;
    setSaving(true);
    const { error } = await supabase.from("extras_clientes").insert({
      cliente_id: clienteSel,
      extra_id: extra.id,
      categoria: extra.categoria,
      preco_ativacao: Number(extra.preco_ativacao) || 0,
      preco_mensal: Number(extra.preco_mensal) || 0,
      observacao: obs || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    await notifyAdminPanel({
      title: "✨ Extra adicionado rápido",
      body: `${extra.nome} foi vinculado para ${cliente?.nome || "cliente"}.`,
      url: "/admin/extras",
    });
    await notifyClientPanel(clienteSel, {
      title: "Novo extra disponível",
      body: `${extra.nome} foi liberado no seu portal.`,
      url: "/cliente/extras",
    });
    toast({ title: "Módulo Adicionado!" });
    setShowAddExtra(false);
    refresh();
  };

  return (
    <motion.div className="space-y-8 min-h-screen pb-12" initial="hidden" animate="show" variants={stagger}>
      
      {/* KPIs Section */}
      <DashboardKPIs stats={stats} revenue={revenue} />
      <DashboardKPIAlerts newLeads={newLeads} pendingInvoices={pendingInvoices} lateProjects={lateProjects} />

      {/* Operation Focus */}
      <motion.div variants={fadeUp}>
        <Card className="glass-premium overflow-hidden relative border-[#D4AF37]/10">
          <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] pointer-events-none" />
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-2">Foco Operacional</p>
                <h2 className="text-3xl font-light text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Sua <span className="text-gold-gradient italic">Estratégia</span> em Tempo Real
                </h2>
              </div>
              <Button 
                variant="ghost" 
                className="h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 text-white/40 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all" 
                onClick={() => refresh()}
              >
                Sincronizar Inteligência
              </Button>
            </div>

            {priorities.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {priorities.map((priority) => (
                  <Link
                    key={priority.title}
                    to={priority.href}
                    className="group relative rounded-[32px] border border-white/5 bg-white/[0.02] p-6 transition-all hover:-translate-y-2 hover:border-[#D4AF37]/20 hover:bg-[#D4AF37]/5"
                  >
                    <div className={cn("absolute top-0 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r opacity-40 group-hover:opacity-100 transition-opacity", priority.accent)} />
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 group-hover:text-[#D4AF37] transition-colors">{priority.title}</p>
                        <p className="text-5xl font-light tracking-tighter text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{priority.count}</p>
                        <p className="text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">{priority.description}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[32px] border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xl font-medium text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Operação em <span className="text-gold-gradient italic">Equilíbrio Perfeito</span></p>
                  <p className="text-sm text-white/40 mt-2 leading-relaxed">Não detectamos pendências críticas. Seu fluxo operacional está otimizado de acordo com as diretrizes de alta performance da NovaesWeb.</p>
                </div>
                <div className="flex gap-4">
                  <Button asChild className="h-12 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                    <Link to="/admin/clientes">Ecossistema</Link>
                  </Button>
                  <Button asChild className="h-12 px-8 rounded-2xl bg-gold-gradient border-0 text-black font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                    <Link to="/admin/projetos">Nova Estratégia</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={fadeUp}>
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyRevenue} />
        </div>
        <div className="lg:col-span-1">
          <ModulesChart data={topModules} />
        </div>
      </motion.div>

      {/* Intelligence Hub */}
      <motion.div variants={fadeUp} className="relative glass-premium p-10 rounded-[40px] border-[#D4AF37]/10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gold-gradient opacity-20" />
        <div className="absolute inset-0 bg-gold-gradient opacity-[0.01] pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-10 relative">
          <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <Sparkles className="w-7 h-7 text-black" />
          </div>
          <div>
            <h2 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.4em]">Hub de Arquitetura</h2>
            <p className="text-xl font-light text-white/60" style={{ fontFamily: "'Playfair Display', serif" }}>Engenharia de <span className="text-white italic">Resultados Exponenciais</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          <InsightAction icon={UserPlus} title="Lead Prospections" desc={`Identificamos ${funnelData[0].value} ativos que podem ser convertidos em clientes elite hoje.`} action="Expandir Base" link="/admin/leads" color="border-[#D4AF37]/20" />
          <InsightAction icon={DollarSign} title="Revenue Flow" desc={`O fluxo financeiro possui ${pendingInvoices} entradas pendentes de validação bancária.`} action="Validar Caixa" link="/admin/financeiro" color="border-[#D4AF37]/20" />
          <InsightAction icon={Zap} title="System Integrity" desc={lateProjects > 0 ? `${lateProjects} projetos requerem intervenção imediata para manter o SLA.` : "A integridade operacional do ecossistema está em 100%."} action="Auditoria de Projetos" link="/admin/projetos" color="border-[#D4AF37]/20" />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
          <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Protocolos Rápidos</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button className="h-12 px-6 rounded-2xl bg-gold-gradient text-black font-bold uppercase tracking-widest text-[10px] border-0 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/10" onClick={openAddExtra}>
            <Plus size={16} className="mr-2" /> Injetar Módulo
          </Button>
          <Button asChild className="h-12 px-6 rounded-2xl bg-white/5 text-white border border-white/10 font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">
            <Link to="/admin/briefings">
              <ClipboardList size={16} className="mr-2 text-[#D4AF37]" /> Briefings Elite
            </Link>
          </Button>
          <Button variant="ghost" className="h-12 px-6 rounded-2xl text-[#D4AF37] hover:bg-[#D4AF37]/5 text-[10px] font-black uppercase tracking-[0.2em] border border-dashed border-[#D4AF37]/20" onClick={() => setShowPricing(true)}>
            <DollarSign size={16} className="mr-2" /> Catálogo de Valor
          </Button>
        </div>
      </motion.div>

      {/* Activity & Support */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={fadeUp}>
        <Card className="glass-premium lg:col-span-1 border-white/5">
          <CardHeader className="p-6 border-b border-white/5">
            <CardTitle className="text-[10px] font-black text-[#D4AF37] flex items-center gap-3 uppercase tracking-[0.3em]">
              <BellRing size={14} /> Log de Inteligência
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activity.length === 0 ? (
              <div className="text-center py-10 opacity-20">Sem atividade registrada</div>
            ) : (
              <div className="space-y-6">
                {activity.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex gap-4 group">
                    <div className="w-1 h-8 rounded-full bg-gold-gradient opacity-20 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">{act.title}</p>
                      <p className="text-[10px] text-white/30 mt-1 leading-relaxed">{act.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-premium lg:col-span-2 border-white/5">
          <CardHeader className="p-6 border-b border-white/5">
            <CardTitle className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Monitor de Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pedidos.length === 0 ? (
              <div className="p-10 text-center text-white/20">Aguardando novos fluxos</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[9px] uppercase tracking-widest text-white/30 pl-6">Cliente Ecossistema</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-widest text-white/30">Status Operacional</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((p: any) => (
                    <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.02] cursor-pointer" onClick={() => navigate("/admin/clientes")}>
                      <TableCell className="text-xs font-bold text-white/80 py-4 pl-6">{p.clientes?.nome || "—"}</TableCell>
                      <TableCell className="py-4"><StatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <PricingDialog open={showPricing} onOpenChange={setShowPricing} />
    </motion.div>
  );
}
