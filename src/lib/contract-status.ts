import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const CONTRACT_STATUS_ORDER = [
  "rascunho",
  "em_revisao",
  "aprovado",
  "enviado",
  "assinado",
  "ativo",
  "cancelado",
  "encerrado",
] as const;

export type ContractWorkflowStatus = (typeof CONTRACT_STATUS_ORDER)[number];

const LEGACY_STATUS_ALIASES: Record<string, ContractWorkflowStatus> = {
  aguardando: "rascunho",
  visualizado: "enviado",
};

export const CONTRACT_STATUS_LABELS: Record<ContractWorkflowStatus, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  enviado: "Enviado",
  assinado: "Assinado",
  ativo: "Ativo",
  cancelado: "Cancelado",
  encerrado: "Encerrado",
};

export const CONTRACT_STATUS_COLORS: Record<ContractWorkflowStatus, string> = {
  rascunho: "#a78bfa",
  em_revisao: "#fbbf24",
  aprovado: "#38bdf8",
  enviado: "#f472b6",
  assinado: "#34d399",
  ativo: "#22c55e",
  cancelado: "#ef4444",
  encerrado: "#94a3b8",
};

export const CONTRACT_STATUS_BADGE_CLASSES: Record<ContractWorkflowStatus, string> = {
  rascunho: "border-violet-300/20 bg-violet-300/10 text-violet-100",
  em_revisao: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  aprovado: "border-sky-300/20 bg-sky-300/10 text-sky-100",
  enviado: "border-pink-300/20 bg-pink-300/10 text-pink-100",
  assinado: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  ativo: "border-green-300/20 bg-green-300/10 text-green-100",
  cancelado: "border-red-300/20 bg-red-300/10 text-red-100",
  encerrado: "border-slate-300/20 bg-slate-300/10 text-slate-100",
};

export function normalizeContractStatus(status?: string | null): ContractWorkflowStatus {
  if (!status) return "rascunho";
  if (status in LEGACY_STATUS_ALIASES) {
    return LEGACY_STATUS_ALIASES[status];
  }
  return CONTRACT_STATUS_ORDER.includes(status as ContractWorkflowStatus)
    ? (status as ContractWorkflowStatus)
    : "rascunho";
}

export function getContractStatusLabel(status: string) {
  return CONTRACT_STATUS_LABELS[normalizeContractStatus(status)];
}

export function getContractStatusColor(status: string) {
  return CONTRACT_STATUS_COLORS[normalizeContractStatus(status)];
}

export function getContractStatusBadgeClass(status: string) {
  return CONTRACT_STATUS_BADGE_CLASSES[normalizeContractStatus(status)];
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
  const normalizedStatus = normalizeContractStatus(status);

  if (requiresResign) {
    return {
      title: "Nova assinatura necessária",
      subtitle:
        resignReason ||
        "Este contrato foi atualizado depois da assinatura e precisa de um novo aceite do cliente.",
    };
  }

  if (normalizedStatus === "rascunho") {
    return {
      title: "Contrato em preparação",
      subtitle: "A proposta ainda está sendo estruturada no painel administrativo.",
    };
  }

  if (normalizedStatus === "em_revisao") {
    return {
      title: "Ajustes solicitados",
      subtitle: "O cliente pediu revisão e o contrato voltou para edição interna.",
    };
  }

  if (normalizedStatus === "aprovado") {
    return {
      title: "Pronto para envio",
      subtitle: "O contrato já foi aprovado internamente e aguarda disparo para o portal do cliente.",
    };
  }

  if (normalizedStatus === "enviado") {
    const viewedLabel = formatRelative(dataVisualizacao);
    const sentLabel = formatRelative(dataEnvio);

    return {
      title: viewedLabel ? `Visualizado ${viewedLabel}` : sentLabel ? `Enviado ${sentLabel}` : "Enviado ao cliente",
      subtitle: viewedLabel
        ? "O cliente já abriu o contrato, mas o status principal continua em envio até revisão ou assinatura."
        : "O contrato está disponível no portal do cliente para leitura e aceite.",
    };
  }

  if (normalizedStatus === "assinado") {
    const signedLabel = formatRelative(dataAssinatura);

    return {
      title: signedLabel ? `Assinado ${signedLabel}` : "Contrato assinado",
      subtitle: onboardingStartedAt || pedidoId
        ? "Assinatura concluída. O próximo passo é ativar a operação no painel."
        : "A assinatura foi registrada e o contrato aguarda ativação operacional.",
    };
  }

  if (normalizedStatus === "ativo") {
    return {
      title: "Contrato em operação",
      subtitle: onboardingStartedAt || pedidoId
        ? "O contrato já está vinculado ao fluxo operacional e onboarding ativo."
        : "O contrato foi marcado como ativo e está em execução.",
    };
  }

  if (normalizedStatus === "cancelado") {
    return {
      title: "Contrato cancelado",
      subtitle: "Este fluxo foi interrompido e não segue mais para assinatura ou ativação.",
    };
  }

  return {
    title: "Contrato encerrado",
    subtitle: "O histórico foi preservado, mas este contrato não está mais em operação.",
  };
}
