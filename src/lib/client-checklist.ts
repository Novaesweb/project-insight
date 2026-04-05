import type { Tables } from "@/integrations/supabase/types";

export type ClientChecklistItem = Tables<"cliente_checklist_items">;
export type ClientChecklistStatus = ClientChecklistItem["status"];

export function getChecklistFilledCount(items: ClientChecklistItem[]) {
  return items.filter((item) => item.status !== "pendente").length;
}

export function getChecklistApprovedCount(items: ClientChecklistItem[]) {
  return items.filter((item) => item.status === "aprovado").length;
}

export function getChecklistPendingCount(items: ClientChecklistItem[]) {
  return items.filter((item) => item.status === "pendente").length;
}

export function getChecklistProgress(items: ClientChecklistItem[]) {
  if (!items.length) return 0;
  return Math.round((getChecklistFilledCount(items) / items.length) * 100);
}

export function getChecklistOverallStatus(items: ClientChecklistItem[]): ClientChecklistStatus {
  if (!items.length) return "pendente";

  const approvedCount = getChecklistApprovedCount(items);
  const filledCount = getChecklistFilledCount(items);

  if (approvedCount === items.length) return "aprovado";
  if (filledCount > 0) return "preenchido";
  return "pendente";
}

export function getChecklistStatusMeta(status: ClientChecklistStatus) {
  switch (status) {
    case "aprovado":
      return {
        label: "Aprovado",
        className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      };
    case "preenchido":
      return {
        label: "Preenchido",
        className: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      };
    default:
      return {
        label: "Pendente",
        className: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      };
  }
}

export function normalizeChecklistText(value?: string | null) {
  return value?.trim() ?? "";
}
