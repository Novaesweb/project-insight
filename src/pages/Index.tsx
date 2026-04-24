import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  BellRing,
  Sparkles,
  UserPlus,
  Zap,
  Plus,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  DollarSign,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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

function DashboardHeroSkeleton() {
  return (
    <motion.section variants={fadeUp} className="admin-hero-card p-8 md:p-10">
      <div className="grid gap-8 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-5">
          <Skeleton className="h-7 w-44 rounded-full bg-white/10" />
          <Skeleton className="h-16 w-full max-w-2xl rounded-[28px] bg-white/10" />
          <Skeleton className="h-5 w-full max-w-xl rounded-full bg-white/10" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-[24px] bg-white/10" />
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function DashboardKpiSkeleton() {
  return (
    <motion.div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" variants={fadeUp}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-36 rounded-[32px] bg-white/10" />
      ))}
    </motion.div>
  );
}

function DashboardPrioritySkeleton() {
  return (
    <motion.div variants={fadeUp}>
      <Card className="glass-card-admin overflow-hidden">
        <CardContent className="space-y-8 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-36 rounded-full bg-white/10" />
              <Skeleton className="h-10 w-72 rounded-full bg-white/10" />
            </div>
            <Skeleton className="h-11 w-48 rounded-2xl bg-white/10" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-48 rounded-[32px] bg-white/10" />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DashboardChartsSkeleton() {
  return (
    <motion.div className="grid grid-cols-1 gap-6 lg:grid-cols-3" variants={fadeUp}>
      <Skeleton className="h-80 rounded-[32px] bg-white/10 lg:col-span-2" />
      <Skeleton className="h-80 rounded-[32px] bg-white/10" />
    </motion.div>
  );
}

function DashboardInsightsSkeleton() {
  return (
    <motion.div variants={fadeUp} className="admin-hero-card p-10">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
            <Skeleton className="h-8 w-80 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-[32px] bg-white/10" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DashboardActivitySkeleton() {
  return (
    <Card className="glass-card-admin lg:col-span-1">
      <CardHeader className="border-b border-[rgba(124,58,237,0.14)] p-6">
        <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <Skeleton className="h-10 w-1 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
              <Skeleton className="h-3 w-full rounded-full bg-white/10" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DashboardOrdersSkeleton() {
  return (
    <Card className="glass-card-admin lg:col-span-2">
      <CardHeader className="border-b border-[rgba(124,58,237,0.14)] p-6">
        <Skeleton className="h-4 w-36 rounded-full bg-white/10" />
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[1.5fr_1fr] gap-4">
            <Skeleton className="h-12 rounded-2xl bg-white/10" />
            <Skeleton className="h-12 rounded-2xl bg-white/10" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    stats,
    pedidos,
    tickets,
    dbStatus,
    subCount,
    activity,
    monthlyRevenue,
    topModules,
    funnelData,
    pendingInvoices,
    revenue,
    newLeads,
    lateProjects,
    isSnapshotLoading,
    isActivityLoading,
    isRefreshing,
    refresh,
  } = useDashboardData();

  const [showAddExtra, setShowAddExtra] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [clienteSel, setClienteSel] = useState("");
  const [extraSel, setExtraSel] = useState("");
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  const showSnapshotSkeleton = isSnapshotLoading && dbStatus === "carregando";
  const showActivitySkeleton = isActivityLoading && activity.length === 0;
  const showOrdersSkeleton = showSnapshotSkeleton && pedidos.length === 0;

  const priorities = [
    {
      title: "Novos Leads",
      count: newLeads,
      description: "Oportunidades de elite aguardando qualificacao.",
      href: "/admin/leads?preset=novos",
      accent: "from-[#FF1F1F] to-[#7C3AED]",
    },
    {
      title: "Financeiro Pendente",
      count: pendingInvoices,
      description: "Cobrancas em aberto que impactam o fluxo de caixa.",
      href: "/admin/financeiro?status=pendente&period=month",
      accent: "from-[#7C3AED] to-[#EC4899]",
    },
    {
      title: "Atrasos em Projetos",
      count: lateProjects,
      description: "Entregas criticas que exigem revisao estrategica.",
      href: "/admin/projetos",
      accent: "from-[#FF1F1F] to-[#EC4899]",
    },
  ].filter((item) => item.count > 0);

  const heroSignals = [
    {
      label: "Base ativa",
      value: `${stats.clientes}`,
      hint: "clientes premium",
      accent: "text-[#C4B5FD]",
    },
    {
      label: "Banco",
      value: dbStatus === "conectado" ? "Online" : dbStatus === "erro" ? "Falha" : "Sync",
      hint: "telemetria central",
      accent: dbStatus === "erro" ? "text-[#FCA5A5]" : "text-[#86EFAC]",
    },
    {
      label: "Push",
      value: `${subCount}`,
      hint: "assinaturas ativas",
      accent: "text-[#F9A8D4]",
    },
    {
      label: "Suporte",
      value: `${tickets.length}`,
      hint: "tickets em vista",
      accent: "text-[#FCD34D]",
    },
  ];

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

    const extra = catalogo.find((item) => item.id === extraSel);
    const cliente = clientes.find((item) => item.id === clienteSel);
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

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    await notifyAdminPanel({
      title: "Modulo adicionado rapido",
      body: `${extra.nome} foi vinculado para ${cliente?.nome || "cliente"}.`,
      url: "/admin/extras",
    });

    await notifyClientPanel(clienteSel, {
      title: "Novo extra disponivel",
      body: `${extra.nome} foi liberado no seu portal.`,
      url: "/cliente/extras",
    });

    toast({ title: "Modulo adicionado!" });
    setShowAddExtra(false);
    setClienteSel("");
    setExtraSel("");
    setObs("");
    void refresh();
  };

  return (
    <motion.div className="min-h-screen space-y-8 pb-12" initial="hidden" animate="show" variants={stagger}>
      {showSnapshotSkeleton ? (
        <DashboardHeroSkeleton />
      ) : (
        <motion.section variants={fadeUp} className="admin-hero-card p-8 md:p-10">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-gradient opacity-60" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(192,38,211,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(220,38,38,0.1),transparent_28%)]" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.22)] bg-[rgba(255,255,255,0.04)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.26em] text-[var(--admin-muted)]">
                <Sparkles className="h-3.5 w-3.5 text-[#EC4899]" />
                NovaesWeb Command Center
              </div>
              <div>
                <h1 className="text-4xl font-light tracking-tight text-[var(--admin-text)] md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Centro de <span className="text-brand-gradient italic">Comando</span>
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--admin-muted)]">
                  Visao consolidada da operacao para decidir rapido, agir com clareza e manter o ecossistema inteiro da NovaesWeb no mesmo ritmo premium.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {heroSignals.map((signal) => (
                  <div key={signal.label} className="admin-stat-pill">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-muted)]">{signal.label}</p>
                    <p className={`mt-2 text-2xl font-light tracking-tight ${signal.accent}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                      {signal.value}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{signal.hint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
              <Button
                className="h-12 rounded-2xl border-0 bg-brand-gradient text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_14px_35px_rgba(124,58,237,0.24)] transition-all hover:scale-[1.02]"
                onClick={openAddExtra}
              >
                <Plus size={16} className="mr-2" />
                Injetar Modulo
              </Button>
              <Button
                variant="ghost"
                className="h-12 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.04)] text-[10px] font-black uppercase tracking-[0.24em] text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.08)]"
                onClick={() => void refresh()}
              >
                <ShieldCheck size={16} className="mr-2 text-[#C4B5FD]" />
                {isRefreshing ? "Atualizando" : "Sincronizar"}
              </Button>
              <Button
                asChild
                className="h-12 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.04)] text-[10px] font-black uppercase tracking-[0.24em] text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.08)]"
              >
                <Link to="/admin/briefings">
                  <ClipboardList size={16} className="mr-2 text-[#EC4899]" />
                  Briefings Elite
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="h-12 rounded-2xl border border-dashed border-[#EC4899]/30 text-[10px] font-black uppercase tracking-[0.24em] text-[#F9A8D4] hover:bg-[#EC4899]/8"
                onClick={() => setShowPricing(true)}
              >
                <DollarSign size={16} className="mr-2" />
                Catalogo de Valor
              </Button>
            </div>
          </div>
        </motion.section>
      )}

      {showSnapshotSkeleton ? <DashboardKpiSkeleton /> : <DashboardKPIs stats={stats} revenue={revenue} />}

      {!showSnapshotSkeleton && <DashboardKPIAlerts newLeads={newLeads} pendingInvoices={pendingInvoices} lateProjects={lateProjects} />}

      {showSnapshotSkeleton ? (
        <DashboardPrioritySkeleton />
      ) : (
        <motion.div variants={fadeUp}>
          <Card className="glass-card-admin relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.02]" />
            <CardContent className="relative z-10 p-8">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#EC4899]">Foco Operacional</p>
                  <h2 className="text-3xl font-light leading-tight text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Sua <span className="text-brand-gradient italic">Estrategia</span> em Tempo Real
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  className="h-11 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.04)] px-6 text-[10px] font-black uppercase tracking-widest text-[var(--admin-muted)] transition-all hover:bg-[#EC4899]/8 hover:text-[#F9A8D4]"
                  onClick={() => void refresh()}
                >
                  {isRefreshing ? "Atualizando painel" : "Sincronizar Inteligencia"}
                </Button>
              </div>

              {priorities.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {priorities.map((priority) => (
                    <Link
                      key={priority.title}
                      to={priority.href}
                      className="admin-list-card group relative p-6 transition-all hover:-translate-y-2 hover:border-[#C026D3]/30"
                    >
                      <div className={cn("absolute top-0 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r opacity-40 transition-opacity group-hover:opacity-100", priority.accent)} />
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-muted)] transition-colors group-hover:text-[#F9A8D4]">
                            {priority.title}
                          </p>
                          <p className="text-5xl font-light tracking-tighter text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {priority.count}
                          </p>
                          <p className="text-xs leading-relaxed text-white/55 transition-colors group-hover:text-white/75">{priority.description}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.05)] text-[var(--admin-muted)] transition-all group-hover:bg-[#EC4899] group-hover:text-white">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="admin-list-card flex flex-col gap-6 p-10 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xl font-medium text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Operacao em <span className="text-brand-gradient italic">Equilibrio Perfeito</span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--admin-muted)]">
                      Nao detectamos pendencias criticas. Seu fluxo operacional esta otimizado de acordo com as diretrizes de alta performance da NovaesWeb.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      asChild
                      className="h-12 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.04)] px-8 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text)] shadow-sm transition-all hover:bg-[rgba(255,255,255,0.08)]"
                    >
                      <Link to="/admin/clientes">Ecossistema</Link>
                    </Button>
                    <Button
                      asChild
                      className="h-12 rounded-2xl border-0 bg-brand-gradient px-8 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-[#7C3AED]/20 transition-all hover:scale-105"
                    >
                      <Link to="/admin/projetos">Nova Estrategia</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {showSnapshotSkeleton ? (
        <DashboardChartsSkeleton />
      ) : (
        <motion.div className="grid grid-cols-1 gap-6 lg:grid-cols-3" variants={fadeUp}>
          <div className="lg:col-span-2">
            <RevenueChart data={monthlyRevenue} />
          </div>
          <div className="lg:col-span-1">
            <ModulesChart data={topModules} />
          </div>
        </motion.div>
      )}

      {showSnapshotSkeleton ? (
        <DashboardInsightsSkeleton />
      ) : (
        <motion.div variants={fadeUp} className="admin-hero-card relative p-10">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-brand-gradient opacity-20" />
          <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.01]" />

          <div className="relative mb-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient shadow-[0_0_20px_rgba(124,58,237,0.2)]">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#EC4899]">Hub de Arquitetura</h2>
              <p className="text-xl font-light text-[var(--admin-muted)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Engenharia de <span className="italic text-[var(--admin-text)]">Resultados Exponenciais</span>
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <InsightAction
              icon={UserPlus}
              title="Lead Prospections"
              desc={`Identificamos ${funnelData[0]?.value || 0} ativos que podem ser convertidos em clientes elite hoje.`}
              action="Expandir Base"
              link="/admin/leads"
              color="border-[rgba(124,58,237,0.18)]"
            />
            <InsightAction
              icon={DollarSign}
              title="Revenue Flow"
              desc={`O fluxo financeiro possui ${pendingInvoices} entradas pendentes de validacao bancaria.`}
              action="Validar Caixa"
              link="/admin/financeiro"
              color="border-[rgba(124,58,237,0.18)]"
            />
            <InsightAction
              icon={Zap}
              title="System Integrity"
              desc={lateProjects > 0 ? `${lateProjects} projetos requerem intervencao imediata para manter o SLA.` : "A integridade operacional do ecossistema esta em 100%."}
              action="Auditoria de Projetos"
              link="/admin/projetos"
              color="border-[rgba(124,58,237,0.18)]"
            />
          </div>
        </motion.div>
      )}

      <motion.div className="grid grid-cols-1 gap-6 lg:grid-cols-3" variants={fadeUp}>
        {showActivitySkeleton ? (
          <DashboardActivitySkeleton />
        ) : (
          <Card className="glass-card-admin lg:col-span-1">
            <CardHeader className="border-b border-[rgba(124,58,237,0.14)] p-6">
              <CardTitle className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#EC4899]">
                <BellRing size={14} /> Log de Inteligencia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {activity.length === 0 ? (
                <div className="py-10 text-center text-white/25">Sem atividade registrada</div>
              ) : (
                <div className="space-y-6">
                  {activity.slice(0, 5).map((act) => (
                    <div key={act.id} className="group flex gap-4">
                      <div className="h-8 w-1 rounded-full bg-brand-gradient opacity-20 transition-opacity group-hover:opacity-100" />
                      <div>
                        <p className="text-xs font-bold text-[var(--admin-text)] transition-colors group-hover:text-[#F9A8D4]">{act.title}</p>
                        <p className="mt-1 text-[10px] leading-relaxed text-[var(--admin-muted)]">{act.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showOrdersSkeleton ? (
          <DashboardOrdersSkeleton />
        ) : (
          <Card className="glass-card-admin lg:col-span-2">
            <CardHeader className="border-b border-[rgba(124,58,237,0.14)] p-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EC4899]">Monitor de Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pedidos.length === 0 ? (
                <div className="p-10 text-center text-[var(--admin-muted)]">Aguardando novos fluxos</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-[rgba(124,58,237,0.14)] hover:bg-transparent">
                      <TableHead className="pl-6 text-[9px] uppercase tracking-widest text-[var(--admin-muted)]">Cliente Ecossistema</TableHead>
                      <TableHead className="text-[9px] uppercase tracking-widest text-[var(--admin-muted)]">Status Operacional</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidos.map((pedido: any) => (
                      <TableRow
                        key={pedido.id}
                        className="cursor-pointer border-[rgba(124,58,237,0.12)] hover:bg-[rgba(255,255,255,0.04)]"
                        onClick={() => navigate("/admin/clientes")}
                      >
                        <TableCell className="py-4 pl-6 text-xs font-bold text-[var(--admin-text)]">{pedido.clientes?.nome || "-"}</TableCell>
                        <TableCell className="py-4">
                          <StatusBadge status={pedido.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>

      <Dialog open={showAddExtra} onOpenChange={setShowAddExtra}>
        <DialogContent className="glass-card-admin max-w-lg border-[rgba(124,58,237,0.22)] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              Injetar Modulo Rapido
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-[var(--admin-muted)]">Cliente</Label>
              <Select value={clienteSel} onValueChange={setClienteSel}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-[var(--admin-muted)]">Extra</Label>
              <Select value={extraSel} onValueChange={setExtraSel}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Selecione o modulo" />
                </SelectTrigger>
                <SelectContent>
                  {catalogo.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-[var(--admin-muted)]">Observacao</Label>
              <Textarea
                value={obs}
                onChange={(event) => setObs(event.target.value)}
                className="min-h-[110px] border-white/10 bg-white/5 text-white"
                placeholder="Observacao interna opcional para este modulo..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              className="border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.04)] text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() => setShowAddExtra(false)}
            >
              Cancelar
            </Button>
            <Button className="bg-brand-gradient text-white" disabled={saving || !clienteSel || !extraSel} onClick={handleAddExtra}>
              {saving ? "Aplicando..." : "Adicionar modulo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PricingDialog open={showPricing} onOpenChange={setShowPricing} />
    </motion.div>
  );
}
