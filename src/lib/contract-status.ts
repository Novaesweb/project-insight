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
