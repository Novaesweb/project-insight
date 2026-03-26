import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  inativo: { label: "Inativo", className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
  em_aberto: { label: "Em aberto", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  em_andamento: { label: "Em andamento", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  em_revisao: { label: "Em revisão", className: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  concluido: { label: "Concluído", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  cancelado: { label: "Cancelado", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  pausado: { label: "Pausado", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  pendente: { label: "Pendente", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  entregue: { label: "Entregue", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  aberto: { label: "Aberto", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  em_atendimento: { label: "Em atendimento", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  resolvido: { label: "Resolvido", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pago: { label: "Pago", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  em_atraso: { label: "Em atraso", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  critica: { label: "Crítica", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  normal: { label: "Normal", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  baixa: { label: "Baixa", className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
  aprovado: { label: "Aprovado", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  aguardando: { label: "Aguardando", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  recusado: { label: "Recusado", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  briefing: { label: "Briefing", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  design: { label: "Design", className: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  desenvolvimento: { label: "Desenvolvimento", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  homologacao: { label: "Testes/SEO", className: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("font-medium text-[11px] tracking-wide", config.className)}>
      {config.label}
    </Badge>
  );
}


