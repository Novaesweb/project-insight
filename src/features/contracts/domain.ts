import { normalizeContractStatus } from "@/lib/contract-status";

import type { Contrato } from "./types";

export function buildSendToClientUpdate(contract: Contrato, sentAt: string) {
  const normalizedStatus = normalizeContractStatus(contract.status);
  const isResignFlow = Boolean((contract as any).requer_reassinatura);
  const nextStatus = normalizedStatus === "aprovado" || normalizedStatus === "em_revisao" || isResignFlow
    ? "enviado"
    : normalizedStatus === "rascunho"
      ? "enviado"
      : contract.status;

  return {
    isResignFlow,
    nextStatus,
    update: {
      status: nextStatus,
      data_envio: sentAt,
      archived_at: null,
      updated_at: sentAt,
      requer_reassinatura: false,
      reassinatura_motivo: null,
    },
  };
}

export function buildArchivePayload(archived: boolean) {
  return {
    archived_at: archived ? new Date().toISOString() : null,
  };
}
