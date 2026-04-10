import type { Contrato } from "./types";

export function buildSendToClientUpdate(contract: Contrato, sentAt: string) {
  const isResignFlow = Boolean((contract as any).requer_reassinatura);
  const nextStatus = contract.status === "assinado" && !isResignFlow ? "assinado" : "enviado";

  return {
    isResignFlow,
    nextStatus,
    update: {
      status: nextStatus,
      data_envio: sentAt.slice(0, 10),
      data_visualizacao: contract.status === "assinado" ? contract.data_visualizacao : null,
      archived_at: null,
      updated_at: sentAt,
    },
  };
}

export function buildArchivePayload(archived: boolean) {
  return {
    archived_at: archived ? new Date().toISOString() : null,
  };
}
