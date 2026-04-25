import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MessageCircle,
  PhoneCall,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/features/leads/hooks/useLeads";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LeadsDashboard() {
  const { leads, stats, loading } = useLeads();
  const recentLeads = leads.slice(0, 5);
  const isEmptyPipeline = !loading && leads.length === 0;
  const dashboardSignals = [
    { label: "Hoje", value: `${stats.todayCount}`, hint: "novas entradas", accent: "text-[#F9A8D4]" },
    { label: "Triagem", value: `${stats.unvisited}`, hint: "aguardando contato", accent: "text-[#FCA5A5]" },
    { label: "Convertidos", value: `${stats.converted}`, hint: "no mes atual", accent: "text-[#86EFAC]" },
    { label: "Pipeline", value: `${leads.length}`, hint: "leads carregados", accent: "text-[#C4B5FD]" },
  ];

  return (
    <motion.div
      className="space-y-10 pb-12"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.section variants={fadeUp} className="admin-hero-card p-8 md:p-10">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-gradient opacity-60" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(192,38,211,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(220,38,38,0.08),transparent_28%)]" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.22)] bg-[rgba(255,255,255,0.04)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[var(--admin-muted)]">
              <TrendingUp className="h-3.5 w-3.5 text-[#EC4899]" />
              Growth & Conversion
            </div>
            <div>
              <h1
                className="text-4xl font-light tracking-tight text-[var(--admin-text)] md:text-6xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Pipeline de <span className="text-brand-gradient italic">Oportunidades</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--admin-muted)]">
                {isEmptyPipeline
                  ? "Painel limpo e pronto para captar. Assim que os primeiros leads entrarem, esta area vira seu radar comercial central."
                  : "Visao comercial para priorizar resposta, qualificar oportunidades e acelerar conversoes sem perder contexto."}
              </p>
              <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.4em] text-white/35">
                Inteligencia Comercial
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {dashboardSignals.map((signal) => (
                <div key={signal.label} className="admin-stat-pill">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-muted)]">{signal.label}</p>
                  <p
                    className={`mt-2 text-2xl font-light tracking-tight ${signal.accent}`}
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {signal.value}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{signal.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.04)] px-6 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.08)]"
            >
              <Link to="/admin/leads/lista">Gerenciar Base</Link>
            </Button>
            <Button
              asChild
              className="h-12 rounded-2xl border-0 bg-brand-gradient px-8 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_14px_35px_rgba(124,58,237,0.24)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Link to="/admin/leads/lista?status=novo">
                <Zap className="mr-2 h-4 w-4" />
                Atender Novos
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 px-1 md:grid-cols-4">
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="glass-card-admin relative h-full overflow-hidden">
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-brand-gradient opacity-40" />
            <CardContent className="p-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[#EC4899]">
                    Novas Entradas (24h)
                  </p>
                  <h3
                    className="text-7xl font-light tracking-tighter text-[var(--admin-text)]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {loading ? "--" : stats.todayCount}
                  </h3>
                </div>
                <div className="rounded-[24px] bg-brand-gradient p-5 text-white shadow-lg shadow-[#EC4899]/20 transition-all duration-500 group-hover:rotate-12">
                  <Sparkles size={36} />
                </div>
              </div>
              <div className="mt-10 flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-300">Pulse comercial</span>
                <span className="text-xs font-medium text-[var(--admin-muted)]">
                  Janela principal para contato rapido e qualificacao.
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="col-span-1">
          <Card
            className={cn(
              "glass-card-admin h-full transition-all",
              stats.unvisited > 0 && "border-[#DC2626]/30 bg-[linear-gradient(180deg,rgba(127,29,29,0.18),rgba(13,0,24,0.92))]",
            )}
          >
            <CardContent className="p-8">
              <div
                className={cn(
                  "mb-8 w-fit rounded-[20px] border p-4 transition-all",
                  stats.unvisited > 0
                    ? "border-rose-500/25 bg-rose-500/12"
                    : "border-emerald-500/20 bg-emerald-500/10",
                )}
              >
                <Clock size={24} className={stats.unvisited > 0 ? "text-rose-300" : "text-emerald-300"} />
              </div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                Aguardando Triagem
              </p>
              <h3 className="text-4xl font-medium text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {loading ? "--" : stats.unvisited}
              </h3>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 italic">
                response time crucial
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-card-admin h-full transition-all hover:border-emerald-500/30">
            <CardContent className="p-8">
              <div className="mb-8 w-fit rounded-[20px] border border-emerald-500/20 bg-emerald-500/10 p-4 transition-colors">
                <CheckCircle size={24} className="text-emerald-300" />
              </div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                Convertidos (Mes)
              </p>
              <h3 className="text-4xl font-medium text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {loading ? "--" : stats.converted}
              </h3>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                sucesso operacional
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="md:col-span-3">
          <Card className="glass-card-admin">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[rgba(124,58,237,0.14)] px-8 py-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--admin-muted)]">
                Oportunidades Estrategicas Recentes
              </CardTitle>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EC4899] hover:bg-[#EC4899]/5"
              >
                <Link to="/admin/leads/lista">Relatorio Completo</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-6 py-6">
              {isEmptyPipeline ? (
                <div className="flex flex-col items-center justify-center gap-5 rounded-[28px] border border-dashed border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.03)] px-6 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.05)]">
                    <Sparkles className="h-7 w-7 text-[#F9A8D4]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Base pronta para captar
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--admin-muted)]">
                      Nenhum lead foi registrado ainda. Assim que os primeiros contatos entrarem, eles vao aparecer aqui para triagem e conversao.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="h-11 rounded-2xl border-0 bg-brand-gradient px-6 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_14px_35px_rgba(124,58,237,0.24)]"
                  >
                    <Link to="/admin/leads/lista">Abrir Base Comercial</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      to={`/admin/leads/${lead.id}`}
                      className="group flex items-center gap-5 rounded-[24px] border border-transparent p-4 transition-all hover:border-[rgba(124,58,237,0.18)] hover:bg-[rgba(255,255,255,0.04)]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[rgba(124,58,237,0.16)] bg-[rgba(255,255,255,0.04)] font-serif text-xl text-[var(--admin-text)] transition-all group-hover:bg-brand-gradient group-hover:text-white group-hover:border-transparent shadow-sm">
                        {lead.nome[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold tracking-tight text-[var(--admin-text)] transition-colors group-hover:text-[#F9A8D4]">
                          {lead.nome}
                        </p>
                        <p className="mt-1 truncate text-[10px] uppercase tracking-[0.15em] text-[var(--admin-muted)]">
                          {lead.nome_negocio || "Empresa sob sigilo"}
                        </p>
                      </div>
                      <div className="hidden items-center gap-4 sm:flex">
                        <div
                          className={cn(
                            "rounded-full border px-4 py-1 text-[9px] font-black uppercase tracking-[0.15em] shadow-sm",
                            lead.status === "novo"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                              : "border-[rgba(124,58,237,0.16)] bg-[rgba(255,255,255,0.04)] text-[var(--admin-muted)]",
                          )}
                        >
                          {lead.status}
                        </div>
                        <ArrowRight size={16} className="text-white/20 transition-all group-hover:translate-x-1 group-hover:text-[#EC4899]" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="col-span-1">
          <div className="grid h-full grid-rows-2 gap-4">
            <Card className="glass-card-admin border-emerald-500/16 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(13,0,24,0.9))]">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-[rgba(255,255,255,0.06)] p-3 shadow-sm transition-transform group-hover:scale-110">
                  <PhoneCall size={20} className="text-emerald-300" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/70">Follow-up</p>
                <p className="mt-1 text-3xl font-medium text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {Math.max(stats.unvisited, 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card-admin border-[#7C3AED]/20 bg-[linear-gradient(180deg,rgba(124,58,237,0.12),rgba(13,0,24,0.9))]">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-[rgba(255,255,255,0.06)] p-3 shadow-sm transition-transform group-hover:scale-110">
                  <MessageCircle size={20} className="text-[#C4B5FD]" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4B5FD]/70">Aguardando</p>
                <p className="mt-1 text-3xl font-medium text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {Math.max(leads.length - stats.converted, 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
