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
      title: "Leads pedindo resposta",
      count: newLeads,
      description: "Novas oportunidades esperando qualificação do time.",
      href: "/admin/leads?preset=novos",
      accent: "from-[#7b1fa2]/20 to-[#c2185b]/10",
    },
    {
      title: "Financeiro pedente de cobrança",
      count: pendingInvoices,
      description: "Cobranças em aberto que ainda podem impactar o caixa.",
      href: "/admin/financeiro?status=pendente&period=month",
      accent: "from-[#FFB800]/20 to-[#FFB800]/5",
    },
    {
      title: "Projetos com risco de atraso",
      count: lateProjects,
      description: "Entregas vencidas ou perto do prazo que precisam de revisão.",
      href: "/admin/projetos",
      accent: "from-[#e8334a]/20 to-[#e8334a]/5",
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
    setClienteSel("");
    setExtraSel("");
    setObs("");
    refresh();
  };

  const selectedExtra = catalogo.find(c => c.id === extraSel);

  return (
    <motion.div className="space-y-6 min-h-screen pb-10" initial="hidden" animate="show" variants={stagger}>
      
      {/* KPIs */}
      <DashboardKPIs stats={stats} revenue={revenue} />
      <DashboardKPIAlerts newLeads={newLeads} pendingInvoices={pendingInvoices} lateProjects={lateProjects} />

      <motion.div variants={fadeUp}>
        <Card className="border-white/[0.06] bg-[var(--admin-surface)] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7b1fa2]/[0.03] via-transparent to-[#FFB800]/[0.02] pointer-events-none" />
          <CardContent className="p-5 sm:p-6 relative z-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Prioridades do Dia</p>
                <h2 className="text-lg font-black text-foreground tracking-tight">Seu foco operacional em um só bloco</h2>
              </div>
              <Button variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold border border-white/10 text-primary hover:bg-primary/5" onClick={() => refresh()}>
                Atualizar painel
              </Button>
            </div>

            {priorities.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {priorities.map((priority) => (
                  <Link
                    key={priority.title}
                    to={priority.href}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:-translate-y-1 hover:border-white/10"
                  >
                    <div className={cn("h-1 w-full rounded-full bg-gradient-to-r mb-4", priority.accent)} />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{priority.title}</p>
                        <p className="text-3xl font-black tracking-tighter text-foreground mt-2">{priority.count}</p>
                        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{priority.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">Operação sob controle agora</p>
                  <p className="text-xs text-muted-foreground mt-1">Sem pendências críticas neste momento. Vale aproveitar para revisar clientes ativos, projetos em andamento ou novos módulos.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild className="h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] text-foreground hover:bg-white/[0.08]">
                    <Link to="/admin/clientes">Ver clientes</Link>
                  </Button>
                  <Button asChild className="h-9 rounded-xl bg-gradient-to-r from-[#7b1fa2] to-[#c2185b] border-0 text-white">
                    <Link to="/admin/projetos">Revisar projetos</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* CHARTS ROW — moved up for visual impact */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4" variants={fadeUp}>
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyRevenue} />
        </div>
        <div className="lg:col-span-1">
          <ModulesChart data={topModules} />
        </div>
      </motion.div>

      {/* CABINE DE INTELIGÊNCIA */}
      <motion.div variants={fadeUp} className="relative bg-[var(--admin-surface)] border border-white/[0.06] rounded-2xl p-8 overflow-hidden">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7b1fa2] via-[#c2185b] via-[#e8334a] to-[#FFB800] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#7b1fa2]/[0.03] via-transparent to-[#FFB800]/[0.02] pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-8 relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7b1fa2]/20 to-[#c2185b]/20 flex items-center justify-center border border-[#7b1fa2]/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Central de Arquitetura Operacional</h2>
            <p className="text-[10px] text-muted-foreground font-medium italic">Inteligência v10.0 • Otimizando a engenharia do seu sucesso.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
          <InsightAction icon={UserPlus} title="Novo Lead Pendente" desc={`Você tem ${funnelData[0].value} leads que ainda não viraram clientes.`} action="Ver Leads" link="/admin/leads" color="border-[#7b1fa2]/20" />
          <InsightAction icon={DollarSign} title="Faturas Pendentes" desc={`Existem ${pendingInvoices} faturas aguardando pagamento no banco.`} action="Ver Financeiro" link="/admin/financeiro?status=pendente&period=month" color="border-[#FFB800]/20" />
          <InsightAction icon={Zap} title="Projetos Sensíveis" desc={lateProjects > 0 ? `${lateProjects} entregas pedem atenção imediata do time.` : "Os projetos estão dentro da cadência prevista hoje."} action="Abrir Projetos" link="/admin/projetos" color="border-[#c2185b]/20" />
        </div>
      </motion.div>

      {/* Quick Actions Premium */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#FFB800]" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Ações Rápidas</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#7b1fa2] to-[#c2185b] text-white shadow-lg shadow-[#7b1fa2]/20 border-0 group text-xs font-bold hover:shadow-[#7b1fa2]/30 transition-shadow" onClick={openAddExtra}>
            <Plus className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-90 transition-transform" /> Injetar Módulo
          </Button>
          <Button asChild className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#8A2BE2] via-[#FF0000] to-[#FF007F] text-white border-0 shadow-lg shadow-[#8A2BE2]/20 text-xs font-bold hover:shadow-[#FF007F]/30">
            <Link to="/admin/briefings">
              <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> Abrir Briefings
            </Link>
          </Button>
          <Button asChild className="h-10 px-4 rounded-xl bg-white/[0.04] text-foreground border border-white/[0.06] text-xs font-medium hover:bg-white/[0.08]">
            <Link to="/admin/clientes"><Users className="w-3.5 h-3.5 mr-1.5 text-[#7b1fa2]" /> Novo Ecossistema</Link>
          </Button>
          <Button asChild className="h-10 px-4 rounded-xl bg-white/[0.04] text-foreground border border-white/[0.06] text-xs font-medium hover:bg-white/[0.08]">
            <Link to="/admin/financeiro"><DollarSign className="w-3.5 h-3.5 mr-1.5 text-[#FFB800]" /> Nova Fatura</Link>
          </Button>
          <Button variant="ghost" className="h-10 px-4 rounded-xl text-primary hover:bg-primary/5 text-xs font-bold uppercase tracking-widest border border-dashed border-primary/20" onClick={() => setShowPricing(true)}>
            <DollarSign className="w-3.5 h-3.5 mr-1.5" /> Ver Catálogo de Preços
          </Button>
        </div>
      </motion.div>

      {/* Pricing Catalogue */}
      <PricingDialog open={showPricing} onOpenChange={setShowPricing} />

      {/* Tables & Activity */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" variants={fadeUp}>
        <Card className="border-white/[0.06] bg-[var(--admin-surface)] xl:col-span-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#7b1fa2]/40 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#7b1fa2]" /> Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activity.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-5 text-center">
                <p className="text-sm font-semibold text-foreground">Sem atividade recente para mostrar</p>
                <p className="text-xs text-muted-foreground mt-2">Use esse espaço como gatilho de operação: abra leads, finance ou clientes para gerar o próximo movimento do dia.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Button asChild size="sm" className="h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground hover:bg-white/[0.08]">
                    <Link to="/admin/leads?preset=novos">Abrir leads</Link>
                  </Button>
                  <Button asChild size="sm" className="h-8 rounded-xl bg-gradient-to-r from-[#7b1fa2] to-[#c2185b] border-0 text-white">
                    <Link to="/admin/clientes">Ver clientes</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={cn("relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#7b1fa2]/30 before:via-[#c2185b]/10 before:to-transparent", visibleActs > 5 && "max-h-[400px] overflow-y-auto pr-2 custom-scrollbar")}>
                  {activity.slice(0, visibleActs).map((act) => (
                    <div key={act.id} className="relative flex items-center gap-4 group">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-gradient-to-br from-[#7C3AED]/20 to-[#DC2626]/20 text-[#7C3AED] group-hover:scale-110 transition-transform font-black text-[10px] shadow-inner shadow-[#7C3AED]/10">
                        {act.title ? act.title.substring(0, 2).toUpperCase() : <BellRing className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground leading-none">{act.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{act.body}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase tracking-tighter">{new Date(act.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {activity.length > visibleActs && (
                  <Button variant="ghost" size="sm" className="w-full text-[10px] text-primary font-bold h-8 border border-primary/20" onClick={() => setVisibleActs(visibleActs + 10)}>Mostrar mais (+10)</Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-[var(--admin-surface)] xl:col-span-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#c2185b]/40 to-transparent" />
          <CardHeader><CardTitle className="text-sm font-semibold text-foreground">Pedidos Recentes</CardTitle></CardHeader>
          <CardContent>
            {pedidos.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nenhum pedido ainda</p> : (
              <Table>
                <TableHeader><TableRow className="border-white/[0.06]"><TableHead className="text-[11px]">Cliente</TableHead><TableHead className="text-[11px]">Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {pedidos.map((p: any) => (
                    <TableRow key={p.id} className="border-white/[0.06] h-10 hover:bg-white/[0.03] cursor-pointer" onClick={() => navigate("/admin/clientes", { state: { selectedId: p.cliente_id, tab: "financeiro" } })}>
                      <TableCell className="text-xs text-foreground py-2">{p.clientes?.nome || "—"}</TableCell>
                      <TableCell className="py-2"><StatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-[var(--admin-surface)] xl:col-span-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#FFB800]/40 to-transparent" />
          <CardHeader><CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2"><Headphones className="w-4 h-4 text-[#FFB800]" /> Suporte</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {tickets.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nenhum ticket aberto</p> : tickets.map((t: any) => (
              <div key={t.id} className="flex items-start justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div><p className="text-sm font-medium text-foreground line-clamp-1">{t.titulo}</p><p className="text-[11px] text-muted-foreground mt-0.5">{t.clientes?.nome || "—"}</p></div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog Adicionar Extra */}
      <Dialog open={showAddExtra} onOpenChange={setShowAddExtra}>
        <DialogContent className="bg-[var(--admin-surface)] border border-white/[0.06] text-foreground max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">Adicionar Extra ao Cliente</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cliente</Label>
              <Select value={clienteSel} onValueChange={setClienteSel}>
                <SelectTrigger className="glass-input border-white/10 text-foreground"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Extra</Label>
              <Select value={extraSel} onValueChange={setExtraSel}>
                <SelectTrigger className="glass-input border-white/10 text-foreground"><SelectValue placeholder="Selecione o extra" /></SelectTrigger>
                <SelectContent>{catalogo.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {selectedExtra && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-sm font-medium text-foreground">{selectedExtra.nome}</p>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground font-bold">
                  <span className="text-emerald-400">{selectedExtra.categoria}</span>
                  {Number(selectedExtra.preco_mensal) > 0 && <span>R$ {Number(selectedExtra.preco_mensal).toFixed(0)}/mês</span>}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Observação</Label>
              <Textarea className="glass-input border-white/10 text-foreground text-sm min-h-[60px]" placeholder="Ex: Cortesia por 3 meses..." value={obs} onChange={e => setObs(e.target.value)} />
            </div>
            <Button className="bg-gradient-to-r from-[#7b1fa2] to-[#c2185b] border-0 text-white w-full rounded-lg hover:shadow-lg hover:shadow-[#7b1fa2]/20 transition-shadow" onClick={handleAddExtra} disabled={!clienteSel || !extraSel || saving}>{saving ? "Salvando..." : "Confirmar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
