import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20" },
  inativo: { label: "Inativo", className: "bg-zinc-500/15 text-zinc-600 border-zinc-500/20" },
  em_andamento: { label: "Em andamento", className: "bg-blue-500/15 text-blue-700 border-blue-500/20" },
  concluido: { label: "Concluído", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20" },
  pausado: { label: "Pausado", className: "bg-amber-500/15 text-amber-700 border-amber-500/20" },
  cancelado: { label: "Cancelado", className: "bg-red-500/15 text-red-700 border-red-500/20" },
  pendente: { label: "Pendente", className: "bg-amber-500/15 text-amber-700 border-amber-500/20" },
  em_revisao: { label: "Em revisão", className: "bg-blue-500/15 text-blue-700 border-blue-500/20" },
  entregue: { label: "Entregue", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20" },
  aberto: { label: "Aberto", className: "bg-red-500/15 text-red-700 border-red-500/20" },
  em_atendimento: { label: "Em atendimento", className: "bg-blue-500/15 text-blue-700 border-blue-500/20" },
  resolvido: { label: "Resolvido", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20" },
  pago: { label: "Pago", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20" },
  em_atraso: { label: "Em atraso", className: "bg-red-500/15 text-red-700 border-red-500/20" },
  critica: { label: "Crítica", className: "bg-red-500/15 text-red-700 border-red-500/20" },
  normal: { label: "Normal", className: "bg-blue-500/15 text-blue-700 border-blue-500/20" },
  baixa: { label: "Baixa", className: "bg-zinc-500/15 text-zinc-600 border-zinc-500/20" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}
