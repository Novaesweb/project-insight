import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Phone,
  Search,
  Trash2,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/features/leads/hooks/useLeads";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  novo: { label: "Novo Lead", color: "text-rose-300", bg: "bg-rose-500/10 border-rose-500/20", icon: Zap },
  em_contato: { label: "Em Contato", color: "text-amber-300", bg: "bg-amber-500/10 border-amber-500/20", icon: Phone },
  convertido: { label: "Convertido", color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  perdido: { label: "Perdido", color: "text-white/60", bg: "bg-white/5 border-white/10", icon: XCircle },
};

export default function LeadsList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { leads, stats, deleteLead } = useLeads();
  const [busca, setBusca] = useState(searchParams.get("q") || "");
  const [filtroStatus, setFiltroStatus] = useState(searchParams.get("status") || "todos");
  const { requestDelete, dialogProps } = useDeleteConfirm();

  const filtrados = useMemo(() => {
    return leads.filter((lead) => {
      const matchBusca =
        lead.nome.toLowerCase().includes(busca.toLowerCase()) ||
        lead.email.toLowerCase().includes(busca.toLowerCase()) ||
        lead.whatsapp.includes(busca);
      const matchStatus = filtroStatus === "todos" || lead.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [leads, busca, filtroStatus]);

  const leadSignals = [
    { label: "Total", value: `${leads.length}`, hint: "na base atual", accent: "text-[#C4B5FD]" },
    { label: "Novos", value: `${stats.new}`, hint: "pedindo resposta", accent: "text-[#F9A8D4]" },
    { label: "Triagem", value: `${stats.unvisited}`, hint: "sem contato", accent: "text-[#FCA5A5]" },
    { label: "Convertidos", value: `${stats.converted}`, hint: "resultado recente", accent: "text-[#86EFAC]" },
  ];

  const handleDelete = (id: string) => {
    requestDelete(async () => {
      deleteLead(id);
    }, "Excluir Lead", "Tem certeza que deseja remover este lead permanentemente?");
  };

  return (
    <div className="space-y-8 pb-20">
      <section className="admin-hero-card p-8 md:p-10">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-gradient opacity-60" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(192,38,211,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(220,38,38,0.08),transparent_28%)]" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.22)] bg-[rgba(255,255,255,0.04)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--admin-muted)]">
              <Users className="h-3.5 w-3.5 text-[#EC4899]" />
              Lead Desk
            </div>
            <div>
              <h1 className="text-4xl font-light tracking-tight text-[var(--admin-text)] md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Fluxo de <span className="text-brand-gradient italic">Leads</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--admin-muted)]">
                Base viva de oportunidades com triagem, prioridade visual e acesso rapido para conversao em cliente.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {leadSignals.map((signal) => (
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

          <Button asChild className="h-12 rounded-2xl border-0 bg-brand-gradient px-8 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_14px_35px_rgba(124,58,237,0.24)] hover:scale-[1.02] transition-all">
            <Link to="/admin/leads">
              <Zap className="mr-2 h-4 w-4" />
              Voltar ao Radar
            </Link>
          </Button>
        </div>
      </section>

      <div className="admin-toolbar-card flex flex-col items-center justify-between gap-4 p-4 md:flex-row">
        <div className="group relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)] transition-colors group-focus-within:text-[#EC4899]" />
          <Input
            placeholder="Buscar leads..."
            className="admin-input-shell pl-11"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex w-full items-center gap-2 overflow-x-auto px-1 pb-2 md:w-auto md:pb-0">
          {["todos", "novo", "em_contato", "convertido", "perdido"].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={cn(
                "whitespace-nowrap rounded-xl border px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all",
                filtroStatus === status
                  ? "border-[#C026D3]/35 bg-[rgba(255,255,255,0.08)] text-[var(--admin-text)] shadow-[0_10px_25px_rgba(124,58,237,0.12)]"
                  : "border-[rgba(124,58,237,0.16)] bg-[rgba(255,255,255,0.03)] text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--admin-text)]",
              )}
            >
              {status === "todos" ? "Todos" : statusConfig[status]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-1 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtrados.map((lead) => {
            const sc = statusConfig[lead.status] || statusConfig.novo;

            return (
              <motion.div
                key={lead.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group"
              >
                <Card
                  className={cn(
                    "glass-card-admin h-full cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:border-[#C026D3]/30",
                    !lead.visualizado && "border-[#7C3AED]/28 bg-[linear-gradient(180deg,rgba(124,58,237,0.12),rgba(13,0,24,0.92))]",
                  )}
                  onClick={() => navigate(`/admin/leads/${lead.id}`)}
                >
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-start justify-between">
                      <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider", sc.bg, sc.color)}>
                        {sc.label}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(lead.id);
                        }}
                        className="rounded-xl p-2 text-[var(--admin-muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(124,58,237,0.16)] bg-[rgba(255,255,255,0.04)] text-xl font-black text-[var(--admin-text)] shadow-sm transition-all group-hover:bg-brand-gradient group-hover:text-white group-hover:border-transparent">
                        {lead.nome[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-black text-[var(--admin-text)] transition-colors group-hover:text-[#F9A8D4]">
                          {lead.nome}
                        </h3>
                        <p className="truncate text-xs font-medium text-[var(--admin-muted)]">
                          {lead.nome_negocio || "Sem empresa definida"}
                        </p>
                      </div>
                    </div>

                    <div className="mb-8 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-[var(--admin-muted)]">
                        <Phone size={14} className="text-white/30" />
                        {lead.whatsapp}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--admin-muted)]">
                        <Users size={14} className="text-white/30" />
                        {lead.segmento || "Nao informado"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[rgba(124,58,237,0.14)] pt-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                      <Button variant="ghost" className="h-9 px-4 text-xs font-black uppercase tracking-widest text-[#C4B5FD] transition-all group-hover:translate-x-1 hover:bg-[#7C3AED]/8">
                        Ver Perfil <ArrowRight size={14} className="ml-2" />
                      </Button>
                    </div>

                    {!lead.visualizado && (
                      <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#EC4899] shadow-[0_0_10px_rgba(236,72,153,0.5)] animate-pulse" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtrados.length === 0 && (
        <Card className="glass-card-admin">
          <CardContent className="flex flex-col items-center justify-center gap-6 p-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-[rgba(124,58,237,0.16)] bg-[rgba(255,255,255,0.05)] shadow-sm">
              <Users className="h-8 w-8 text-[var(--admin-muted)]" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Nenhum lead encontrado
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--admin-muted)]">
                Ajuste a busca ou o filtro de status para localizar as oportunidades desejadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <DeleteConfirmDialog {...dialogProps} />
    </div>
  );
}
