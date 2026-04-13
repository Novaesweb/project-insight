import {
  buildBuilderTemplateValues,
  computeBuilderPricing,
  createEmptyBuilderPayload,
  getContractExtraSnapshots,
  parseMoneyInput,
  stripLegacySignaturePlaceholders,
  type BuilderPrimaryPlanId,
  type ContractBuilderPayload,
  type ContractBuilderStepIndex,
} from "@/lib/contract-builder";
import { validateAndSanitizeBuilderPayload } from "@/lib/contract-builder-schema";
import { PUBLIC_PLAN_CATALOG } from "@/lib/public-plans";
import { contractTemplates, fillTemplate } from "@/lib/contract-templates";

import { BUILDER_TEMPLATE_ID, type Contrato, type ExtraCatalogo } from "./types";

export function formatMoneyInputValue(value: number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function buildItemMoneyDraftKey(itemId: string, field: "setupPrice" | "monthlyPrice") {
  return `item:${itemId}:${field}`;
}

export function buildPricingMoneyDraftKey(field: "discountValue" | "entryValue" | "negotiatedMonthly") {
  return `pricing:root:${field}`;
}

export function getContractErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}

export function normalizeBuilderStep(
  value: unknown,
  fallback: ContractBuilderStepIndex,
): ContractBuilderStepIndex {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4 ? value : fallback;
}

export function normalizeBuilderPayload(
  rawPayload: unknown,
  extras: ExtraCatalogo[],
  fallbackClientId = "",
  fallbackStep: ContractBuilderStepIndex = 0,
): ContractBuilderPayload {
  const base = createEmptyBuilderPayload(extras);

  if (!rawPayload || typeof rawPayload !== "object") {
    return {
      ...base,
      clienteId: fallbackClientId,
    };
  }

  const payload = rawPayload as Partial<ContractBuilderPayload>;
  const savedItems = Array.isArray(payload.items) ? payload.items : [];
  const baseById = new Map(base.items.map((item) => [item.id, item]));
  const mergedItems = base.items.map((item) => {
    const saved = savedItems.find((entry) => entry.id === item.id);
    if (!saved) return item;

    return {
      ...item,
      name: saved.name || item.name,
      description: saved.description || item.description,
      selected: Boolean(saved.selected),
      setupPrice: Number(saved.setupPrice ?? item.setupPrice ?? 0),
      monthlyPrice: Number(saved.monthlyPrice ?? item.monthlyPrice ?? 0),
    };
  });

  const legacyItems = savedItems.filter((item) => !baseById.has(item.id));
  const items = [...mergedItems, ...legacyItems];
  const primaryPlanId =
    payload.primaryPlanId && payload.primaryPlanId !== "none"
      ? (payload.primaryPlanId as BuilderPrimaryPlanId)
      : ((items.find((item) => item.isPrimaryPlan && item.selected)?.sourceId as BuilderPrimaryPlanId) || "none");

  const clientExtrasSnapshot = Array.isArray(payload.clientExtrasSnapshot)
    ? payload.clientExtrasSnapshot.map((item) => ({
        ...item,
        setupPrice: Number(item.setupPrice || 0),
        monthlyPrice: Number(item.monthlyPrice || 0),
        typeLabel: item.typeLabel === "mensal" ? "mensal" : "único",
        category:
          item.category === "mensal" || item.category === "intermediario" || item.category === "fixo"
            ? item.category
            : "fixo",
      }))
    : [];

  const pricing = computeBuilderPricing(items, clientExtrasSnapshot, {
    negotiatedSetup: Number(payload.pricing?.negotiatedSetup ?? payload.pricing?.setupSubtotal ?? 0),
    discountType: payload.pricing?.discountType === "percentage" ? "percentage" : "fixed",
    discountValue: Number(payload.pricing?.discountValue ?? 0),
    entryValue: Number(payload.pricing?.entryValue ?? 0),
    negotiatedMonthly: Number(payload.pricing?.negotiatedMonthly ?? payload.pricing?.monthlySubtotal ?? 0),
  });

  const normalizedPayload: ContractBuilderPayload = {
    ...base,
    ...payload,
    clienteId: payload.clienteId || fallbackClientId,
    lastStep: normalizeBuilderStep(payload.lastStep, fallbackStep),
    primaryPlanId,
    contractante: {
      ...base.contractante,
      ...(payload.contractante || {}),
    },
    contratada: {
      ...base.contratada,
      ...(payload.contratada || {}),
    },
    items,
    clientExtrasSnapshot,
    pricing,
    createdAt: payload.createdAt || base.createdAt,
    updatedAt: new Date().toISOString(),
  };

  try {
    return validateAndSanitizeBuilderPayload(normalizedPayload);
  } catch {
    return normalizedPayload;
  }
}

export function buildBuilderSavePayload(
  payload: ContractBuilderPayload,
  currentStep: ContractBuilderStepIndex = payload.lastStep,
) {
  const template = contractTemplates.find((item) => item.id === BUILDER_TEMPLATE_ID);
  if (!template) return null;

  const normalizedPayload = validateAndSanitizeBuilderPayload({
    ...payload,
    lastStep: currentStep,
    updatedAt: new Date().toISOString(),
  });

  const templateValues = buildBuilderTemplateValues(normalizedPayload);
  const selectedCount =
    (normalizedPayload.primaryPlanId !== "none" ? 1 : 0) + getContractExtraSnapshots(normalizedPayload).length;
  const selectedPlan =
    PUBLIC_PLAN_CATALOG.find((plan) => plan.id === normalizedPayload.primaryPlanId)?.title || "Sem plano principal";
  const clientLabel =
    normalizedPayload.contractante.nomeEmpresa?.trim() || normalizedPayload.contractante.nome.trim() || "Cliente";

  return {
    normalizedPayload,
    title: `Contrato Mestre NovaesWeb — ${clientLabel}`,
    body: fillTemplate(template.corpo, templateValues),
    description: `Montador Comercial • ${selectedPlan} • ${selectedCount} item(ns) contratado(s)`,
    value: normalizedPayload.pricing.finalSetupTotal,
  };
}

export function hasMeaningfulBuilderState(payload: ContractBuilderPayload) {
  return Boolean(
    payload.clienteId ||
      payload.primaryPlanId !== "none" ||
      payload.clientExtrasSnapshot.length > 0 ||
      payload.items.some(
        (item) => item.selected || Number(item.setupPrice || 0) > 0 || Number(item.monthlyPrice || 0) > 0,
      ) ||
      payload.customScope.trim() ||
      payload.observacoesComerciais.trim() ||
      payload.escopoExclusoes.trim() ||
      Number(payload.pricing.negotiatedSetup || 0) > 0 ||
      Number(payload.pricing.negotiatedMonthly || 0) > 0
  );
}

export function formatContratoValue(value: number | null) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatContractClock(value: string | null | undefined) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatContractDateTime(value: string | null | undefined) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function buildBuilderDirtySignature(
  payload: ContractBuilderPayload,
  currentStep: ContractBuilderStepIndex,
) {
  return JSON.stringify({
    ...payload,
    lastStep: currentStep,
    updatedAt: "",
  });
}

export function buildComparableContractPayload(payload: ContractBuilderPayload) {
  return validateAndSanitizeBuilderPayload({
    ...payload,
    createdAt: "",
    updatedAt: "",
    lastStep: 4,
  });
}

export function buildContractMaterialSignature(input: {
  title: string;
  description: string;
  value: number;
  body: string;
  payload: ContractBuilderPayload;
}) {
  return JSON.stringify({
    title: input.title.trim(),
    description: input.description.trim(),
    value: Number(input.value || 0),
    body: stripLegacySignaturePlaceholders(input.body).replace(/\s+/g, " ").trim(),
    payload: buildComparableContractPayload(input.payload),
  });
}

export function hasSignedContractMaterialChanges(
  existingContract: Contrato,
  prepared: NonNullable<ReturnType<typeof buildBuilderSavePayload>>,
  extras: ExtraCatalogo[],
) {
  const existingPayload = normalizeBuilderPayload(
    existingContract.builder_payload,
    extras,
    existingContract.cliente_id || "",
    4,
  );

  const existingSignature = buildContractMaterialSignature({
    title: existingContract.titulo || "",
    description: existingContract.descricao || "",
    value: Number(existingContract.valor || 0),
    body: (existingContract.corpo as string) || existingContract.descricao || "",
    payload: existingPayload,
  });

  const nextSignature = buildContractMaterialSignature({
    title: prepared.title,
    description: prepared.description,
    value: Number(prepared.value || 0),
    body: prepared.body,
    payload: prepared.normalizedPayload,
  });

  return existingSignature !== nextSignature;
}

export function isBuilderContract(contrato: Contrato) {
  return Boolean(contrato.builder_payload);
}

export function parseComercialSummaryLines(lines: string[]) {
  return lines.reduce<Record<string, number>>((acc, line) => {
    const normalized = line.toLowerCase();
    const numericValue = parseMoneyInput(line);

    if (normalized.includes("ativação total")) acc.setup = numericValue;
    if (normalized.includes("entrada / sinal")) acc.entry = numericValue;
    if (normalized.includes("saldo na entrega")) acc.balance = numericValue;
    if (normalized.includes("mensalidade contratada")) acc.monthly = numericValue;
    return acc;
  }, {});
}
