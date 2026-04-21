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

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

function normalizeBuilderGroup(value: unknown): "planos" | "fixo" | "intermediario" | "mensal" {
  return value === "planos" || value === "fixo" || value === "intermediario" || value === "mensal"
    ? value
    : "fixo";
}

function normalizeBuilderText(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function normalizeBuilderMoney(value: unknown) {
  return parseMoneyInput(value as string | number | null | undefined);
}

function normalizeBuilderTypeLabel(value: unknown): "mensal" | "único" {
  return value === "mensal" ? "mensal" : "único";
}

function buildFallbackCustomScope(items: ContractBuilderPayload["items"]) {
  const selectedServices = items
    .filter((item) => item.selected)
    .map((item) => item.name.trim())
    .filter(Boolean);

  if (selectedServices.length > 0) {
    return `Escopo legado importado: ${selectedServices.join(", ")}. Revise antes de salvar.`;
  }

  return "Escopo sob medida importado de contrato legado. Revise antes de salvar.";
}

function normalizePrimaryPlanId(
  value: unknown,
  items: ContractBuilderPayload["items"],
): BuilderPrimaryPlanId {
  if (value === "express" || value === "pro" || value === "sob-medida" || value === "none") {
    return value;
  }

  return (items.find((item) => item.isPrimaryPlan && item.selected)?.sourceId as BuilderPrimaryPlanId) || "none";
}

function normalizeContractante(
  value: Record<string, any>,
  fallback: ContractBuilderPayload["contractante"],
): ContractBuilderPayload["contractante"] {
  return {
    ...fallback,
    nome: normalizeBuilderText(value.nome, fallback.nome),
    nomeEmpresa: normalizeBuilderText(value.nomeEmpresa, fallback.nomeEmpresa),
    documento: normalizeBuilderText(value.documento, fallback.documento),
    email: normalizeBuilderText(value.email, fallback.email),
    whatsapp: normalizeBuilderText(value.whatsapp, fallback.whatsapp),
    telefone: normalizeBuilderText(value.telefone, fallback.telefone),
    instagram: normalizeBuilderText(value.instagram, fallback.instagram),
    siteUrl: normalizeBuilderText(value.siteUrl, fallback.siteUrl),
    endereco: normalizeBuilderText(value.endereco, fallback.endereco),
    cep: normalizeBuilderText(value.cep, fallback.cep),
    cidade: normalizeBuilderText(value.cidade, fallback.cidade),
    estado: normalizeBuilderText(value.estado, fallback.estado),
  };
}

function normalizeContratada(
  value: Record<string, any>,
  fallback: ContractBuilderPayload["contratada"],
): ContractBuilderPayload["contratada"] {
  return {
    ...fallback,
    nome: normalizeBuilderText(value.nome, fallback.nome),
    representante: normalizeBuilderText(value.representante, fallback.representante),
    documento: normalizeBuilderText(value.documento, fallback.documento),
    endereco: normalizeBuilderText(value.endereco, fallback.endereco),
    observacaoRecebimento: normalizeBuilderText(value.observacaoRecebimento, fallback.observacaoRecebimento),
  };
}

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
  const rawContractante = isRecord(payload.contractante) ? payload.contractante : {};
  const rawContratada = isRecord(payload.contratada) ? payload.contratada : {};
  const rawPricing = isRecord(payload.pricing) ? payload.pricing : {};
  const savedItems = Array.isArray(payload.items) ? payload.items.filter(isRecord) : [];
  const baseById = new Map(base.items.map((item) => [item.id, item]));
  const mergedItems = base.items.map((item) => {
    const saved = savedItems.find((entry) => entry.id === item.id);
    if (!saved) return item;

    return {
      ...item,
      name: normalizeBuilderText(saved.name, item.name),
      description: normalizeBuilderText(saved.description, item.description),
      selected: Boolean(saved.selected),
      setupPrice: normalizeBuilderMoney(saved.setupPrice ?? item.setupPrice ?? 0),
      monthlyPrice: normalizeBuilderMoney(saved.monthlyPrice ?? item.monthlyPrice ?? 0),
    };
  });

  const legacyItems = savedItems
    .filter((item) => typeof item.id === "string" && !baseById.has(item.id))
    .map((item) => ({
      id: String(item.id),
      source: item.source === "plan" || item.source === "extra" ? item.source : "extra",
      sourceId: typeof item.sourceId === "string" ? item.sourceId : undefined,
      group: normalizeBuilderGroup(item.group),
      name: normalizeBuilderText(item.name, "Extra legado").trim() || "Extra legado",
      description: normalizeBuilderText(item.description),
      selected: Boolean(item.selected),
      setupPrice: normalizeBuilderMoney(item.setupPrice),
      monthlyPrice: normalizeBuilderMoney(item.monthlyPrice),
      isPrimaryPlan: Boolean(item.isPrimaryPlan),
    }));
  const items = [...mergedItems, ...legacyItems];
  const primaryPlanId = normalizePrimaryPlanId(payload.primaryPlanId, items);

  const clientExtrasSnapshot = Array.isArray(payload.clientExtrasSnapshot)
    ? payload.clientExtrasSnapshot
        .filter(isRecord)
        .map((item, index) => ({
          id:
            normalizeBuilderText(item.id).trim() ||
            normalizeBuilderText(item.extraId).trim() ||
            `legacy-extra-${index}`,
          extraId:
            normalizeBuilderText(item.extraId).trim() ||
            normalizeBuilderText(item.id).trim() ||
            `legacy-extra-${index}`,
          name:
            normalizeBuilderText(item.name).trim() ||
            normalizeBuilderText(item.label).trim() ||
            "Extra legado",
          description: normalizeBuilderText(item.description),
          setupPrice: normalizeBuilderMoney(item.setupPrice),
          monthlyPrice: normalizeBuilderMoney(item.monthlyPrice),
          typeLabel: normalizeBuilderTypeLabel(item.typeLabel),
          category: normalizeBuilderGroup(item.category ?? item.group),
        }))
    : [];

  const pricing = computeBuilderPricing(items, clientExtrasSnapshot, {
    negotiatedSetup: normalizeBuilderMoney(rawPricing.negotiatedSetup ?? rawPricing.setupSubtotal ?? 0),
    discountType: rawPricing.discountType === "percentage" ? "percentage" : "fixed",
    discountValue: normalizeBuilderMoney(rawPricing.discountValue),
    entryValue: normalizeBuilderMoney(rawPricing.entryValue),
    negotiatedMonthly: normalizeBuilderMoney(rawPricing.negotiatedMonthly ?? rawPricing.monthlySubtotal ?? 0),
  });
  const customScope = normalizeBuilderText(payload.customScope, base.customScope).trim();

  const normalizedPayload: ContractBuilderPayload = {
    ...base,
    clienteId: typeof payload.clienteId === "string" ? payload.clienteId : fallbackClientId,
    lastStep: normalizeBuilderStep(payload.lastStep, fallbackStep),
    primaryPlanId,
    contractante: normalizeContractante(rawContractante, base.contractante),
    contratada: normalizeContratada(rawContratada, base.contratada),
    items,
    clientExtrasSnapshot,
    customScope:
      primaryPlanId === "sob-medida" ? customScope || buildFallbackCustomScope(items) : customScope,
    prazoDias: normalizeBuilderText(payload.prazoDias, base.prazoDias),
    formaPagamento: normalizeBuilderText(payload.formaPagamento, base.formaPagamento),
    numeroRevisoes: normalizeBuilderText(payload.numeroRevisoes, base.numeroRevisoes),
    valorRevisao: normalizeBuilderText(payload.valorRevisao, base.valorRevisao),
    prazoSuporte: normalizeBuilderText(payload.prazoSuporte, base.prazoSuporte),
    observacoesComerciais: normalizeBuilderText(payload.observacoesComerciais, base.observacoesComerciais),
    escopoExclusoes: normalizeBuilderText(payload.escopoExclusoes, base.escopoExclusoes),
    pricing,
    createdAt: typeof payload.createdAt === "string" ? payload.createdAt : base.createdAt,
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
