import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type SystemCost = Tables<"custos_sistema">;
export type SystemCostInsert = TablesInsert<"custos_sistema">;
export type SystemCostUpdate = TablesUpdate<"custos_sistema">;

export const SYSTEM_COST_CATEGORIES = [
  { value: "hospedagem", label: "Hospedagem" },
  { value: "programacao", label: "Programação" },
  { value: "dominio", label: "Domínio" },
  { value: "ferramentas", label: "Ferramentas" },
  { value: "infraestrutura", label: "Infraestrutura" },
  { value: "automacao", label: "Automação" },
  { value: "marketing", label: "Marketing" },
  { value: "outros", label: "Outros" },
] as const;

export const SYSTEM_COST_FREQUENCIES = [
  { value: "mensal", label: "Mensal" },
  { value: "anual", label: "Anual" },
  { value: "unico", label: "Único" },
] as const;

export const SYSTEM_COST_STATUSES = [
  { value: "ativo", label: "Ativo" },
  { value: "pausado", label: "Pausado" },
  { value: "cancelado", label: "Cancelado" },
] as const;

const categoryLabels = Object.fromEntries(
  SYSTEM_COST_CATEGORIES.map((category) => [category.value, category.label])
);

const frequencyLabels = Object.fromEntries(
  SYSTEM_COST_FREQUENCIES.map((frequency) => [frequency.value, frequency.label])
);

function toSortableTime(date: string | null) {
  if (!date) return Number.MAX_SAFE_INTEGER;
  return new Date(`${date}T12:00:00`).getTime();
}

export function sortSystemCosts(costs: SystemCost[]) {
  return [...costs].sort((a, b) => {
    const dateDiff = toSortableTime(a.proxima_cobranca) - toSortableTime(b.proxima_cobranca);
    if (dateDiff !== 0) return dateDiff;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

export function getSystemCostCategoryLabel(category: string) {
  return categoryLabels[category] || category;
}

export function getSystemCostFrequencyLabel(frequency: string) {
  return frequencyLabels[frequency] || frequency;
}

export function getMonthlyEquivalent(cost: Pick<SystemCost, "frequencia" | "valor" | "status">) {
  if (cost.status !== "ativo") return 0;
  if (cost.frequencia === "mensal") return Number(cost.valor);
  if (cost.frequencia === "anual") return Number(cost.valor) / 12;
  return 0;
}

export function getAnnualProjection(cost: Pick<SystemCost, "frequencia" | "valor" | "status">) {
  if (cost.status !== "ativo") return 0;
  if (cost.frequencia === "mensal") return Number(cost.valor) * 12;
  return Number(cost.valor);
}

export function isSystemCostDueSoon(cost: Pick<SystemCost, "proxima_cobranca" | "status">, days = 30) {
  if (!cost.proxima_cobranca || cost.status !== "ativo") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  const dueDate = new Date(`${cost.proxima_cobranca}T12:00:00`);
  return dueDate >= today && dueDate <= limit;
}

export async function listSystemCosts() {
  const result = await supabase.from("custos_sistema").select("*");
  return {
    ...result,
    data: sortSystemCosts(result.data || []),
  };
}

export async function createSystemCost(payload: SystemCostInsert) {
  return supabase.from("custos_sistema").insert(payload);
}

export async function updateSystemCost(id: string, payload: SystemCostUpdate) {
  return supabase.from("custos_sistema").update(payload).eq("id", id);
}

export async function deleteSystemCost(id: string) {
  return supabase.from("custos_sistema").delete().eq("id", id);
}
