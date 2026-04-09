import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const CONTRACT_STATUS_ORDER = [
  "rascunho",
  "enviado",
  "visualizado",
  "assinado",
  "cancelado",
] as const;

export type ContractWorkflowStatus = (typeof CONTRACT_STATUS_ORDER)[number];

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  visualizado: "Visualizado",
  assinado: "Assinado",
  cancelado: "Cancelado",
};

export const CONTRACT_STATUS_COLORS: Record<string, string> = {
  rascunho: "#b9a3d7",
  enviado: "#4ade80",
  visualizado: "#fb7185",
  assinado: "#22c55e",
  cancelado: "#ef4444",
};

export const CONTRACT_STATUS_BADGE_CLASSES: Record<string, string> = {
  rascunho: "border-violet-300/20 bg-violet-300/10 text-violet-200",
  enviado: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  visualizado: "border-rose-300/20 bg-rose-300/10 text-rose-200",
  assinado: "border-green-300/20 bg-green-300/10 text-green-200",
  cancelado: "border-red-300/20 bg-red-300/10 text-red-200",
};

export function getContractStatusLabel(status: string) {
  return CONTRACT_STATUS_LABELS[status] || status;
}

export function getContractStatusColor(status: string) {
  return CONTRACT_STATUS_COLORS[status] || "#b9a3d7";
}

export function getContractStatusBadgeClass(status: string) {
  return CONTRACT_STATUS_BADGE_CLASSES[status] || "border-white/10 bg-white/5 text-white/70";
}

type ContractStatusInsightInput = {
  status: string;
  dataEnvio?: string | null;
  dataVisualizacao?: string | null;
  dataAssinatura?: string | null;
  onboardingStartedAt?: string | null;
  pedidoId?: string | null;
  requiresResign?: boolean | null;
  resignReason?: string | null;
};

function formatRelative(date?: string | null) {
  if (!date) return null;
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
}

export function getContractStatusInsight({
  status,
  dataEnvio,
  dataVisualizacao,
  dataAssinatura,
  onboardingStartedAt,
  pedidoId,
  requiresResign,
  resignReason,
}: ContractStatusInsightInput) {
  if (requiresResign) {
    return {
      title: "Assinatura pendente por atualização",
      subtitle:
        resignReason || "Assinatura pendente por atualização de extra e melhoria do sistema.",
    };
  }

  if (status === "enviado") {
    const relative = formatRelative(dataEnvio);
    return {
      title: relative ? `Enviado ${relative}` : "Enviado aguardando leitura",
      subtitle: "O cliente já recebeu o contrato no portal, mas ainda não abriu.",
    };
  }

  if (status === "visualizado") {
    const relative = formatRelative(dataVisualizacao);
    return {
      title: relative ? `Visualizado ${relative}` : "Visualizado aguardando assinatura",
      subtitle: "Bom momento para follow-up comercial e fechamento.",
    };
  }

  if (status === "assinado") {
    const relative = formatRelative(dataAssinatura);
    if (onboardingStartedAt || pedidoId) {
      return {
        title: relative ? `Assinado ${relative}` : "Assinado",
        subtitle: pedidoId
          ? "Onboarding iniciado e pedido operacional criado automaticamente."
          : "Onboarding já foi iniciado para este contrato.",
      };
    }

    return {
      title: relative ? `Assinado ${relative}` : "Assinado",
      subtitle: "Contrato fechado. Falta iniciar o onboarding operacional.",
    };
  }

  if (status === "rascunho") {
    return {
      title: "Rascunho em preparação",
      subtitle: "A proposta ainda não foi enviada para o cliente.",
    };
  }

  if (status === "cancelado") {
    return {
      title: "Contrato cancelado",
      subtitle: "Este fluxo não está mais ativo no pipeline comercial.",
    };
  }

  return {
    title: getContractStatusLabel(status),
    subtitle: "Acompanhe a timeline para ver os próximos movimentos do contrato.",
  };
}
