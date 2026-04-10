import type {
  NovaesFlowExtra,
  NovaesFlowFinishPayload,
  NovaesFlowPlan,
  NovaesFlowSelection,
} from "../types";

export function formatNovaesFlowCurrency(
  value: number,
  locale = "pt-BR",
  currency = "BRL",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function computeNovaesFlowTotals(
  plans: NovaesFlowPlan[],
  extras: NovaesFlowExtra[],
  selectedPlanId: string | null,
  selectedExtraIds: string[],
) {
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const selectedExtras = extras.filter((extra) => selectedExtraIds.includes(extra.id));

  const setup =
    Number(selectedPlan?.price || 0) +
    selectedExtras.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const recurring =
    Number(selectedPlan?.monthlyPrice || 0) +
    selectedExtras.reduce((sum, item) => sum + Number(item.monthlyPrice || 0), 0);

  return {
    selectedPlan,
    selectedExtras,
    totals: {
      setup,
      recurring,
      selectedCount: Number(Boolean(selectedPlan)) + selectedExtras.length,
    },
  };
}

export function buildNovaesFlowSelection(
  plans: NovaesFlowPlan[],
  extras: NovaesFlowExtra[],
  selectedPlanId: string | null,
  selectedExtraIds: string[],
  fieldValues: Record<string, string>,
): NovaesFlowSelection {
  const computed = computeNovaesFlowTotals(plans, extras, selectedPlanId, selectedExtraIds);

  return {
    selectedPlan: computed.selectedPlan,
    selectedExtras: computed.selectedExtras,
    fieldValues,
    totals: computed.totals,
  };
}

export function buildNovaesFlowFinishPayload(
  selection: NovaesFlowSelection,
  selectedPlanId: string | null,
  selectedExtraIds: string[],
  theme: string,
): NovaesFlowFinishPayload {
  return {
    ...selection,
    planId: selectedPlanId,
    extraIds: selectedExtraIds,
    submittedAt: new Date().toISOString(),
    theme,
    version: "1.0.0",
  };
}
