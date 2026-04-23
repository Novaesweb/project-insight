import {
  buildBuilderTemplateValues,
  buildDefaultExtraClause,
  computeBuilderPricing,
  createEmptyBuilderPayload,
  formatCurrencyBRL,
  parseMoneyInput,
  selectPrimaryPlan,
  type BuilderPrimaryPlanId,
  type ContractBuilderClientExtraSnapshot,
  type ContractBuilderPayload,
  type ContractBuilderStepIndex,
  type ContractStatus,
} from "@/lib/contract-builder";
export { validateAndSanitizeBuilderPayload } from "@/lib/contract-builder-schema";
import { contractTemplates, fillTemplate } from "@/lib/contract-templates";
import { PUBLIC_PLAN_CATALOG } from "@/lib/public-plans";
import { normalizeContractStatus } from "@/lib/contract-status";

import { BUILDER_TEMPLATE_ID, type Contrato, type ExtraCatalogo } from "./types";

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

function normalizeText(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function normalizeBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeContractStatusToken(value: unknown): ContractStatus {
  return normalizeContractStatus(typeof value === "string" ? value : null);
}

function normalizeBuilderStep(
  value: unknown,
  fallback: ContractBuilderStepIndex,
): ContractBuilderStepIndex {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4 ? value : fallback;
}

function normalizePrimaryPlanId(value: unknown): BuilderPrimaryPlanId {
  return value === "express" || value === "pro" || value === "sob-medida" || value === "none"
    ? value
    : "none";
}

function normalizeContractante(
  value: Record<string, any>,
  fallback: ContractBuilderPayload["contractante"],
): ContractBuilderPayload["contractante"] {
  return {
    ...fallback,
    nome: normalizeText(value.nome, fallback.nome),
    nomeEmpresa: normalizeText(value.nomeEmpresa ?? value.nome_empresa, fallback.nomeEmpresa),
    documento: normalizeText(value.documento ?? value.cpfCnpj ?? value.cpf_cnpj, fallback.documento),
    rg: normalizeText(value.rg, fallback.rg),
    email: normalizeText(value.email, fallback.email),
    whatsapp: normalizeText(value.whatsapp, fallback.whatsapp),
    telefone: normalizeText(value.telefone, fallback.telefone),
    dataNascimento: normalizeText(value.dataNascimento ?? value.data_nascimento, fallback.dataNascimento),
    endereco: normalizeText(value.endereco, fallback.endereco),
    cep: normalizeText(value.cep, fallback.cep),
    cidade: normalizeText(value.cidade, fallback.cidade),
    estado: normalizeText(value.estado, fallback.estado),
  };
}

function normalizeContratada(
  value: Record<string, any>,
  fallback: ContractBuilderPayload["contratada"],
): ContractBuilderPayload["contratada"] {
  return {
    ...fallback,
    nome: normalizeText(value.nome, fallback.nome),
    representante: normalizeText(value.representante, fallback.representante),
    documento: normalizeText(value.documento, fallback.documento),
    endereco: normalizeText(value.endereco, fallback.endereco),
    cidade: normalizeText(value.cidade, fallback.cidade),
    estado: normalizeText(value.estado, fallback.estado),
    observacaoRecebimento: normalizeText(value.observacaoRecebimento, fallback.observacaoRecebimento),
  };
}

function normalizeExtrasSnapshot(
  rawExtras: unknown,
  fallback: ContractBuilderPayload["clientExtrasSnapshot"],
): ContractBuilderClientExtraSnapshot[] {
  const items = Array.isArray(rawExtras) ? rawExtras.filter(isRecord) : [];

  return items.map((item, index) => {
    const name =
      normalizeText(item.name).trim() ||
      normalizeText(item.nome).trim() ||
      normalizeText(item.label).trim() ||
      `Extra ${index + 1}`;
    const description = normalizeText(item.description ?? item.descricao);
    const setupPrice = parseMoneyInput(item.setupPrice ?? item.preco_setup ?? item.preco_ativacao ?? item.valor);
    const monthlyPrice = parseMoneyInput(item.monthlyPrice ?? item.preco_mensal ?? 0);

    return {
      id: normalizeText(item.id, `extra-${index}`),
      extraId: normalizeText(item.extraId ?? item.extra_id ?? item.id, `extra-${index}`),
      name,
      description,
      clause: normalizeText(item.clause ?? item.clausula, buildDefaultExtraClause({
        name,
        description,
        setupPrice,
        monthlyPrice,
      })),
      active: normalizeBoolean(item.active, true),
      order: Number.isFinite(Number(item.order ?? item.ordem)) ? Number(item.order ?? item.ordem) : index,
      setupPrice,
      monthlyPrice,
    };
  });
}

function hydrateLegacyPlanSelection(
  items: ContractBuilderPayload["items"],
  rawPayload: Record<string, any>,
): ContractBuilderPayload["items"] {
  const requestedPrimaryPlan = normalizePrimaryPlanId(rawPayload.primaryPlanId);
  const selectedByLegacyId =
    normalizeText(rawPayload.plano).trim().toLowerCase() ||
    normalizeText(rawPayload.plan).trim().toLowerCase() ||
    "";

  const selectedPlan =
    PUBLIC_PLAN_CATALOG.find((plan) => plan.id === requestedPrimaryPlan) ||
    PUBLIC_PLAN_CATALOG.find((plan) => plan.title.toLowerCase() === selectedByLegacyId) ||
    null;

  return selectPrimaryPlan(items, selectedPlan?.id || "none");
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

export function buildPricingMoneyDraftKey(field: string) {
  return `pricing:root:${field}`;
}

export function getContractErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}

export { normalizeBuilderStep };

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
      lastStep: fallbackStep,
    };
  }

  const payload = rawPayload as Record<string, any>;
  const items = hydrateLegacyPlanSelection(base.items, payload).map((item) => {
    const legacySelected = Array.isArray(payload.items)
      ? payload.items.find((entry: Record<string, any>) => entry?.id === item.id)
      : null;

    return legacySelected
      ? {
          ...item,
          name: normalizeText(legacySelected.name, item.name),
          description: normalizeText(legacySelected.description, item.description),
          setupPrice: parseMoneyInput(legacySelected.setupPrice ?? item.setupPrice),
          monthlyPrice: parseMoneyInput(legacySelected.monthlyPrice ?? item.monthlyPrice),
          selected: normalizeBoolean(legacySelected.selected, item.selected),
        }
      : item;
  });

  const primaryPlanId =
    normalizePrimaryPlanId(payload.primaryPlanId) !== "none"
      ? normalizePrimaryPlanId(payload.primaryPlanId)
      : (items.find((item) => item.selected)?.sourceId as BuilderPrimaryPlanId) || "none";

  const extrasSnapshot = normalizeExtrasSnapshot(payload.clientExtrasSnapshot ?? payload.extras, base.clientExtrasSnapshot);
  const selectedPlan = items.find((item) => item.selected) || null;
  const pricing = computeBuilderPricing(items, extrasSnapshot, {
    baseValue: parseMoneyInput(
      payload.pricing?.baseValue ??
        payload.pricing?.negotiatedSetup ??
        payload.pricing?.setupSubtotal ??
        payload.comercial?.ativacao ??
        selectedPlan?.setupPrice ??
        0,
    ),
    entryValue: parseMoneyInput(payload.pricing?.entryValue ?? 0),
  });

  const normalizedPayload: ContractBuilderPayload = {
    ...base,
    version: "v2",
    clienteId:
      typeof payload.clienteId === "string"
        ? payload.clienteId
        : typeof payload.clientId === "string"
          ? payload.clientId
          : fallbackClientId,
    lastStep: normalizeBuilderStep(payload.lastStep, fallbackStep),
    status: normalizeContractStatusToken(payload.status),
    primaryPlanId,
    contractNumber: normalizeText(payload.contractNumber ?? payload.numeroContrato ?? payload.numero, base.contractNumber),
    issueDate: normalizeText(payload.issueDate ?? payload.dataEmissao ?? payload.createdAt, base.issueDate).slice(0, 10) || base.issueDate,
    startDate: normalizeText(payload.startDate ?? payload.dataInicio ?? base.startDate).slice(0, 10) || base.startDate,
    dueDate: normalizeText(payload.dueDate ?? payload.vencimento ?? base.dueDate).slice(0, 10) || base.dueDate,
    contractante: normalizeContractante(
      isRecord(payload.contractante) ? payload.contractante : {},
      base.contractante,
    ),
    contratada: normalizeContratada(
      isRecord(payload.contratada) ? payload.contratada : {},
      base.contratada,
    ),
    items: selectPrimaryPlan(items, primaryPlanId),
    clientExtrasSnapshot: extrasSnapshot,
    customScope: (() => {
      const explicitScope = normalizeText(payload.customScope, base.customScope).trim();
      if (explicitScope) return explicitScope;
      return primaryPlanId === "sob-medida"
        ? "Escopo sob medida em definição. Revise os objetivos, módulos e entregas específicas deste contrato antes do envio."
        : base.customScope;
    })(),
    prazoDias: normalizeText(payload.prazoDias, base.prazoDias),
    formaPagamento: normalizeText(payload.formaPagamento, base.formaPagamento),
    numeroRevisoes: normalizeText(payload.numeroRevisoes, base.numeroRevisoes),
    valorRevisao: normalizeText(payload.valorRevisao, base.valorRevisao),
    prazoSuporte: normalizeText(payload.prazoSuporte, base.prazoSuporte),
    observacoesComerciais: normalizeText(
      payload.observacoesComerciais ?? payload.observacoes,
      base.observacoesComerciais,
    ),
    escopoExclusoes: normalizeText(payload.escopoExclusoes, base.escopoExclusoes),
    customClauses: normalizeText(payload.customClauses, base.customClauses),
    pricing,
    createdAt: normalizeText(payload.createdAt, base.createdAt) || base.createdAt,
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
  const selectedPlan =
    normalizedPayload.items.find((item) => item.isPrimaryPlan && item.selected)?.name || "Plano não definido";
  const clientLabel =
    normalizedPayload.contractante.nomeEmpresa?.trim() || normalizedPayload.contractante.nome.trim() || "Cliente";

  return {
    normalizedPayload,
    title: `Contrato NovaesWeb - ${clientLabel}`,
    body: fillTemplate(template.corpo, templateValues),
    description: `${selectedPlan} • ${normalizedPayload.clientExtrasSnapshot.filter((item) => item.active !== false).length} extra(s) • ${formatCurrencyBRL(
      normalizedPayload.pricing.totalValue,
    )}`,
    value: normalizedPayload.pricing.totalValue,
  };
}

export function hasMeaningfulBuilderState(payload: ContractBuilderPayload) {
  return Boolean(
    payload.clienteId ||
      payload.contractante.nome.trim() ||
      payload.contractante.documento.trim() ||
      payload.primaryPlanId !== "none" ||
      payload.clientExtrasSnapshot.length > 0 ||
      payload.pricing.baseValue > 0 ||
      payload.observacoesComerciais.trim() ||
      payload.contractNumber.trim(),
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
    createdAt: "",
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
    body: input.body.replace(/\s+/g, " ").trim(),
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

    if (normalized.includes("valor base")) acc.baseValue = numericValue;
    if (normalized.includes("extras")) acc.extrasTotal = numericValue;
    if (normalized.includes("total do contrato")) acc.totalValue = numericValue;
    return acc;
  }, {});
}
