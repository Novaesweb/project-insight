import type { ClientBriefingRow } from "./types";

export const ADMIN_BRIEFINGS_HOME = "/admin/briefings";
export const ADMIN_BRIEFINGS_DRAFTS = "/admin/briefings/em-andamento";
export const ADMIN_BRIEFINGS_DRAFT_NEW = "/admin/briefings/em-andamento/novo";
export const ADMIN_BRIEFINGS_SENT = "/admin/briefings/enviados";
export const ADMIN_BRIEFINGS_LIBRARY = "/admin/briefings/biblioteca";

export function getAdminBriefingDraftDetailPath(id: string) {
  return `${ADMIN_BRIEFINGS_DRAFTS}/${id}`;
}

export function getAdminBriefingSentDetailPath(id: string) {
  return `${ADMIN_BRIEFINGS_SENT}/${id}`;
}

export function appendClientQuery(pathname: string, clientId?: string | null) {
  if (!clientId) return pathname;
  return `${pathname}?cliente=${encodeURIComponent(clientId)}`;
}

export function resolveAdminBriefingClientPath(
  briefings: ClientBriefingRow[],
  clientId: string,
) {
  const clientRows = briefings.filter((item) => item.cliente_id === clientId);
  const draft = clientRows.find((item) => item.status === "em_construcao");

  if (draft) {
    return appendClientQuery(getAdminBriefingDraftDetailPath(draft.id), clientId);
  }

  const latestSent = clientRows.find((item) => item.status !== "em_construcao");
  if (latestSent) {
    return appendClientQuery(getAdminBriefingSentDetailPath(latestSent.id), clientId);
  }

  return appendClientQuery(ADMIN_BRIEFINGS_DRAFT_NEW, clientId);
}
