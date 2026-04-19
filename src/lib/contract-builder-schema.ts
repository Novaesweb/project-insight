import { z } from "zod";

import {
  computeBuilderPricing,
  getSelectedPrimaryPlanId,
  parseMoneyInput,
  selectPrimaryPlan,
  type BuilderPrimaryPlanId,
  type ContractBuilderClientExtraSnapshot,
  type ContractBuilderItem,
  type ContractBuilderPayload,
  type ContractBuilderPricing,
  type ContractBuilderStepIndex,
} from "@/lib/contract-builder";

const CONTROL_CHARS_REGEX = new RegExp(
  `[${[
    [0x00, 0x08],
    [0x0b, 0x0c],
    [0x0e, 0x1f],
  ]
    .map(([start, end]) => `${String.fromCharCode(start)}-${String.fromCharCode(end)}`)
    .join("")}${String.fromCharCode(0x7f)}]`,
  "g",
);
const HTML_TAG_REGEX = /<[^>]*>/g;
const MULTISPACE_REGEX = /[^\S\n]+/g;
const MULTILINE_GAP_REGEX = /\n{3,}/g;

function clampMoney(value: number) {
  return Number.isFinite(value) && value > 0 ? Number(value.toFixed(2)) : 0;
}

function normalizeNewlines(value: string) {
  return value.replace(/\r\n?/g, "\n");
}

export function sanitizePlainText(
  value: unknown,
  {
    maxLength = 400,
    preserveLineBreaks = false,
  }: {
    maxLength?: number;
    preserveLineBreaks?: boolean;
  } = {},
) {
  let text = String(value ?? "");

  text = normalizeNewlines(text)
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(HTML_TAG_REGEX, "")
    .replace(/\u00A0/g, " ");

  if (preserveLineBreaks) {
    text = text
      .split("\n")
      .map((line) => line.replace(MULTISPACE_REGEX, " ").trim())
      .join("\n")
      .replace(MULTILINE_GAP_REGEX, "\n\n");
  } else {
    text = text.replace(/\s+/g, " ").trim();
  }

  if (text.length > maxLength) {
    text = text.slice(0, maxLength).trim();
  }

  return text;
}

export function sanitizeEmail(value: unknown) {
  const normalized = sanitizePlainText(value, { maxLength: 160 }).toLowerCase();
  if (!normalized) return "";
  return z.string().email().safeParse(normalized).success ? normalized : "";
}

export function sanitizePhone(value: unknown) {
  return String(value ?? "")
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(/[^\d()+\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 32);
}

export function sanitizeDocument(value: unknown) {
  return String(value ?? "")
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(/[^\d./-]/g, "")
    .trim()
    .slice(0, 32);
}

export function sanitizeUrl(value: unknown) {
  const candidate = sanitizePlainText(value, { maxLength: 320 });
  if (!candidate) return "";

  try {
    const url = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

function sanitizeMoney(value: unknown) {
  return clampMoney(parseMoneyInput(value as string | number | null | undefined));
}

const builderStepSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

const builderPrimaryPlanSchema = z.enum(["express", "pro", "sob-medida", "none"]);

const contractanteSchema = z.object({
  nome: z.any().transform((value) => sanitizePlainText(value, { maxLength: 160 })),
  nomeEmpresa: z.any().optional().transform((value) => sanitizePlainText(value, { maxLength: 160 })),
  documento: z.any().transform(sanitizeDocument),
  email: z.any().optional().transform(sanitizeEmail),
  whatsapp: z.any().optional().transform(sanitizePhone),
  telefone: z.any().optional().transform(sanitizePhone),
  instagram: z.any().optional().transform((value) => sanitizePlainText(value, { maxLength: 160 })),
  siteUrl: z.any().optional().transform(sanitizeUrl),
  endereco: z.any().transform((value) => sanitizePlainText(value, { maxLength: 320, preserveLineBreaks: true })),
  cep: z.any().optional().transform((value) => sanitizePlainText(value, { maxLength: 16 })),
  cidade: z.any().optional().transform((value) => sanitizePlainText(value, { maxLength: 120 })),
  estado: z.any().optional().transform((value) => sanitizePlainText(value, { maxLength: 8 })),
});

const contratadaSchema = z.object({
  nome: z.any().transform((value) => sanitizePlainText(value, { maxLength: 160 })),
  representante: z.any().transform((value) => sanitizePlainText(value, { maxLength: 160 })),
  documento: z.any().transform(sanitizeDocument),
  endereco: z.any().transform((value) => sanitizePlainText(value, { maxLength: 320, preserveLineBreaks: true })),
  observacaoRecebimento: z
    .any()
    .transform((value) => sanitizePlainText(value, { maxLength: 600, preserveLineBreaks: true })),
});

const itemSchema = z.object({
  id: z.string().min(1).max(200),
  source: z.enum(["plan", "extra"]),
  sourceId: z.string().max(200).optional(),
  group: z.enum(["planos", "fixo", "intermediario", "mensal"]),
  name: z.any().transform((value) => sanitizePlainText(value, { maxLength: 160 })),
  description: z.any().transform((value) => sanitizePlainText(value, { maxLength: 800, preserveLineBreaks: true })),
  selected: z.boolean(),
  setupPrice: z.any().transform(sanitizeMoney),
  monthlyPrice: z.any().transform(sanitizeMoney),
  isPrimaryPlan: z.boolean(),
});

const clientExtraSnapshotSchema = z.object({
  id: z.string().min(1).max(200),
  extraId: z.string().min(1).max(200),
  name: z.any().transform((value) => sanitizePlainText(value, { maxLength: 160 })),
  description: z.any().transform((value) => sanitizePlainText(value, { maxLength: 800, preserveLineBreaks: true })),
  category: z.enum(["planos", "fixo", "intermediario", "mensal"]),
  typeLabel: z.enum(["mensal", "único"]),
  setupPrice: z.any().transform(sanitizeMoney),
  monthlyPrice: z.any().transform(sanitizeMoney),
});

const pricingSchema = z.object({
  setupSubtotal: z.any().transform(sanitizeMoney),
  monthlySubtotal: z.any().transform(sanitizeMoney),
  negotiatedSetup: z.any().transform(sanitizeMoney),
  discountType: z.enum(["fixed", "percentage"]),
  discountValue: z.any().transform(sanitizeMoney),
  discountAmount: z.any().transform(sanitizeMoney),
  finalSetupTotal: z.any().transform(sanitizeMoney),
  entryValue: z.any().transform(sanitizeMoney),
  balanceValue: z.any().transform(sanitizeMoney),
  negotiatedMonthly: z.any().transform(sanitizeMoney),
  finalMonthlyTotal: z.any().transform(sanitizeMoney),
});

export const contractBuilderPayloadSchema = z.object({
  clienteId: z.any().transform((value) => sanitizePlainText(value, { maxLength: 80 })),
  lastStep: builderStepSchema,
  primaryPlanId: builderPrimaryPlanSchema,
  contractante: contractanteSchema,
  contratada: contratadaSchema,
  items: z.array(itemSchema),
  clientExtrasSnapshot: z.array(clientExtraSnapshotSchema).default([]),
  customScope: z.any().transform((value) => sanitizePlainText(value, { maxLength: 2000, preserveLineBreaks: true })),
  prazoDias: z.any().transform((value) => sanitizePlainText(value, { maxLength: 16 })),
  formaPagamento: z.any().transform((value) => sanitizePlainText(value, { maxLength: 160 })),
  numeroRevisoes: z.any().transform((value) => sanitizePlainText(value, { maxLength: 16 })),
  valorRevisao: z.any().transform((value) => sanitizePlainText(value, { maxLength: 24 })),
  prazoSuporte: z.any().transform((value) => sanitizePlainText(value, { maxLength: 800, preserveLineBreaks: true })),
  observacoesComerciais: z
    .any()
    .transform((value) => sanitizePlainText(value, { maxLength: 2400, preserveLineBreaks: true })),
  escopoExclusoes: z
    .any()
    .transform((value) => sanitizePlainText(value, { maxLength: 2400, preserveLineBreaks: true })),
  pricing: pricingSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

function normalizePricing(
  items: ContractBuilderItem[],
  clientExtrasSnapshot: ContractBuilderClientExtraSnapshot[],
  previousPricing: ContractBuilderPricing,
) {
  const setupBase = computeBuilderPricing(items, clientExtrasSnapshot).setupSubtotal;
  const monthlyBase = computeBuilderPricing(items, clientExtrasSnapshot).monthlySubtotal;
  const negotiatedSetup = Math.max(previousPricing.negotiatedSetup, 0);
  const entryValue = Math.max(previousPricing.entryValue, 0);

  return computeBuilderPricing(items, clientExtrasSnapshot, {
    negotiatedSetup: negotiatedSetup || setupBase,
    discountType: previousPricing.discountType || "fixed",
    discountValue: previousPricing.discountValue || 0,
    entryValue,
    negotiatedMonthly: previousPricing.negotiatedMonthly || monthlyBase,
  });
}

export function validateAndSanitizeBuilderPayload(input: unknown) {
  const parsed = contractBuilderPayloadSchema.parse(input);
  const primaryPlanId = parsed.primaryPlanId as BuilderPrimaryPlanId;
  const step = parsed.lastStep as ContractBuilderStepIndex;
  const requestedEntryValue = Math.max(parsed.pricing.entryValue, 0);

  const normalizedItems = selectPrimaryPlan(parsed.items, primaryPlanId).map((item) => ({
    ...item,
    name: item.name || (item.source === "plan" ? "Plano" : "Extra"),
  }));

  const reconciledPrimaryPlan = getSelectedPrimaryPlanId(normalizedItems);
  const normalizedPricing = normalizePricing(normalizedItems, parsed.clientExtrasSnapshot, parsed.pricing);

  if (requestedEntryValue > normalizedPricing.finalSetupTotal) {
    throw new z.ZodError([
      {
        code: "custom",
        path: ["pricing", "entryValue"],
        message: "A entrada não pode ser maior que o valor final da implantação.",
      },
    ]);
  }

  const nextPayload: ContractBuilderPayload = {
    ...parsed,
    lastStep: step,
    primaryPlanId: reconciledPrimaryPlan,
    items: normalizedItems,
    clientExtrasSnapshot: parsed.clientExtrasSnapshot,
    pricing: normalizedPricing,
    updatedAt: new Date().toISOString(),
  };

  if (reconciledPrimaryPlan === "sob-medida" && !nextPayload.customScope.trim()) {
    throw new z.ZodError([
      {
        code: "custom",
        path: ["customScope"],
        message: "Escopo customizado é obrigatório para propostas Sob Medida.",
      },
    ]);
  }

  if (nextPayload.pricing.entryValue > nextPayload.pricing.finalSetupTotal) {
    throw new z.ZodError([
      {
        code: "custom",
        path: ["pricing", "entryValue"],
        message: "A entrada não pode ser maior que o valor final da implantação.",
      },
    ]);
  }

  return nextPayload;
}
