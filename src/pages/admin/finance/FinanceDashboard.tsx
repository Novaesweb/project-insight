import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UpcomingBillingPanel from "@/components/admin/financeiro/UpcomingBillingPanel";
import { useFinance } from "@/features/finance/hooks/useFinance";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FinanceDashboard() {
  const { entries, stats, loading } = useFinance();
  const isFinanceEmpty = !loading && entries.length === 0;

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
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.22)] bg-[rgba(255,255,255,0.04)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--admin-muted)]">
              <TrendingUp className="h-3.5 w-3.5 text-[#EC4899]" />
              Financial Intelligence
            </div>

            <div>
              <h1 className="admin-page-title text-[var(--admin-text)]">
                Gestao <span className="text-brand-gradient italic">Financeira</span>
              </h1>
              <p className="admin-copy">
                {isFinanceEmpty
                  ? "Seu caixa esta limpo para iniciar operacao. Os primeiros lancamentos e recorrencias vao aparecer aqui assim que voce comecar a vender."
                  : "Monitore o fluxo de capital, vencimentos e liquidez do ecossistema NovaesWeb com uma leitura executiva, clara e responsiva."}
              </p>
              <p className="admin-kicker mt-1.5 text-white/35">Fluxo e Performance</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.04)] px-6 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.08)]"
            >
              <Link to="/admin/financeiro/lista">
                <FileText className="mr-2 h-4 w-4" />
                Relatorios
              </Link>
            </Button>

            <Button className="h-12 rounded-2xl border-0 bg-brand-gradient px-8 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_14px_35px_rgba(124,58,237,0.24)] transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="mr-2 h-4 w-4" />
              Lancamento
            </Button>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 px-1 md:grid-cols-4">
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="glass-card-admin relative h-full overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="admin-kicker mb-3 text-[#EC4899]">Faturamento Global</p>
                  <h2 className="admin-page-title !text-[clamp(2.2rem,6vw,4.4rem)] text-[var(--admin-text)]">
                    R$ {stats.total.toLocaleString()}
                  </h2>
                </div>

                <div className="rounded-[24px] bg-brand-gradient p-5 text-white shadow-lg shadow-[#7C3AED]/20">
                  <Wallet size={34} />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  <ArrowUpRight size={14} /> +8.4%
                </div>
                <span className="text-xs font-medium text-[var(--admin-muted)]">Crescimento vs periodo anterior</span>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-brand-gradient opacity-40" />
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-card-admin h-full transition-all hover:border-emerald-500/30">
            <CardContent className="p-8">
              <div className="mb-8 w-fit rounded-[20px] border border-emerald-500/20 bg-emerald-500/10 p-4">
                <TrendingUp size={24} className="text-emerald-300" />
              </div>
              <p className="admin-kicker mb-2 text-[var(--admin-muted)]">Liquidado (Mes)</p>
              <h3 className="admin-section-title text-[var(--admin-text)]">R$ {stats.recebido.toLocaleString()}</h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="col-span-1">
          <Card className="glass-card-admin h-full transition-all hover:border-amber-500/30">
            <CardContent className="p-8">
              <div className="mb-8 w-fit rounded-[20px] border border-amber-500/20 bg-amber-500/10 p-4">
                <DollarSign size={24} className="text-amber-300" />
              </div>
              <p className="admin-kicker mb-2 text-[var(--admin-muted)]">Pendente</p>
              <h3 className="admin-section-title text-[var(--admin-text)]">R$ {stats.pendente.toLocaleString()}</h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="md:col-span-1">
          <Card
            className={cn(
              "glass-card-admin h-full transition-all",
              stats.atraso > 0 && "border-rose-500/30 bg-[linear-gradient(180deg,rgba(127,29,29,0.18),rgba(13,0,24,0.92))]",
            )}
          >
            <CardContent className="p-8">
              <div
                className={cn(
                  "mb-8 w-fit rounded-[20px] border p-4",
                  stats.atraso > 0 ? "border-rose-500/25 bg-rose-500/12" : "border-[rgba(124,58,237,0.16)] bg-[rgba(255,255,255,0.04)]",
                )}
              >
                <AlertCircle size={24} className={stats.atraso > 0 ? "text-rose-300" : "text-[var(--admin-muted)]"} />
              </div>
              <p className="admin-kicker mb-2 text-[var(--admin-muted)]">Critico / Atraso</p>
              <h3 className={cn("admin-section-title", stats.atraso > 0 ? "text-rose-300" : "text-[var(--admin-muted)]")}>
                R$ {stats.atraso.toLocaleString()}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="md:col-span-3">
          <Card className="glass-card-admin overflow-hidden">
            <CardHeader className="border-b border-[rgba(124,58,237,0.14)] px-6 py-5 md:px-8 md:py-6">
              <CardTitle className="admin-kicker flex items-center gap-3 text-[#EC4899]">
                <Calendar className="h-4 w-4" />
                Agenda de Faturamentos Proximos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <UpcomingBillingPanel />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {isFinanceEmpty && (
        <motion.div variants={fadeUp}>
          <Card className="glass-card-admin overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center gap-5 px-8 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.05)]">
                <Wallet className="h-7 w-7 text-[#C4B5FD]" />
              </div>
              <div>
                <h3 className="text-2xl font-light text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Financeiro pronto para iniciar
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--admin-muted)]">
                  Nao existem lancamentos, contratos, pedidos ou cobrancas de teste no ambiente atual. O painel esta pronto para receber suas primeiras entradas reais.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
