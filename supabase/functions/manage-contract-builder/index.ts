// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import {
  createAdminClient,
  getCorsHeaders,
  jsonResponse,
  requireInternalAdmin,
} from "../_shared/internal-security.ts";

declare const Deno: any;

const BUILDER_TEMPLATE_ID = "novaesweb-contrato-mestre";
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

type BuilderAction = "save-draft" | "archive" | "unarchive" | "delete-draft";

function normalizeNewlines(value: string) {
  return value.replace(/\r\n?/g, "\n");
}

function sanitizePlainText(
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

function sanitizeDocument(value: unknown) {
  return String(value ?? "")
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(/[^\d./-]/g, "")
    .trim()
    .slice(0, 32);
}

function sanitizePhone(value: unknown) {
  return String(value ?? "")
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(/[^\d()+\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 32);
}

function sanitizeEmail(value: unknown) {
  const normalized = sanitizePlainText(value, { maxLength: 160 }).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : "";
}

function sanitizeUrl(value: unknown) {
  const candidate = sanitizePlainText(value, { maxLength: 320 });
  if (!candidate) return "";

  try {
    const url = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function sanitizeMoney(value: unknown) {
  const normalized = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? Number(parsed.toFixed(2)) : 0;
}

function sanitizeJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeJsonValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        sanitizeJsonValue(entry),
      ]),
    );
  }

  if (typeof value === "string") {
    return sanitizePlainText(value, { maxLength: 6000, preserveLineBreaks: true });
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  return value;
}

function sanitizeBuilderPayload(payload: Record<string, unknown> | null | undefined) {
  if (!payload || typeof payload !== "object") return null;

  const nextPayload = sanitizeJsonValue(payload) as Record<string, any>;

  if (nextPayload.contractante && typeof nextPayload.contractante === "object") {
    nextPayload.contractante = {
      ...nextPayload.contractante,
      nome: sanitizePlainText(nextPayload.contractante.nome, { maxLength: 160 }),
      nomeEmpresa: sanitizePlainText(nextPayload.contractante.nomeEmpresa, { maxLength: 160 }),
      documento: sanitizeDocument(nextPayload.contractante.documento),
      email: sanitizeEmail(nextPayload.contractante.email),
      whatsapp: sanitizePhone(nextPayload.contractante.whatsapp),
      telefone: sanitizePhone(nextPayload.contractante.telefone),
      instagram: sanitizePlainText(nextPayload.contractante.instagram, { maxLength: 160 }),
      siteUrl: sanitizeUrl(nextPayload.contractante.siteUrl),
      endereco: sanitizePlainText(nextPayload.contractante.endereco, {
        maxLength: 320,
        preserveLineBreaks: true,
      }),
      cep: sanitizePlainText(nextPayload.contractante.cep, { maxLength: 16 }),
      cidade: sanitizePlainText(nextPayload.contractante.cidade, { maxLength: 120 }),
      estado: sanitizePlainText(nextPayload.contractante.estado, { maxLength: 8 }),
    };
  }

  if (nextPayload.contratada && typeof nextPayload.contratada === "object") {
    nextPayload.contratada = {
      ...nextPayload.contratada,
      nome: sanitizePlainText(nextPayload.contratada.nome, { maxLength: 160 }),
      representante: sanitizePlainText(nextPayload.contratada.representante, { maxLength: 160 }),
      documento: sanitizeDocument(nextPayload.contratada.documento),
      endereco: sanitizePlainText(nextPayload.contratada.endereco, {
        maxLength: 320,
        preserveLineBreaks: true,
      }),
      observacaoRecebimento: sanitizePlainText(nextPayload.contratada.observacaoRecebimento, {
        maxLength: 600,
        preserveLineBreaks: true,
      }),
    };
  }

  if (Array.isArray(nextPayload.items)) {
    nextPayload.items = nextPayload.items.map((item: Record<string, unknown>) => ({
      ...item,
      id: sanitizePlainText(item.id, { maxLength: 200 }),
      source: item.source === "extra" ? "extra" : "plan",
      sourceId: sanitizePlainText(item.sourceId, { maxLength: 200 }),
      group:
        item.group === "planos" ||
        item.group === "fixo" ||
        item.group === "intermediario" ||
        item.group === "mensal"
          ? item.group
          : "fixo",
      name: sanitizePlainText(item.name, { maxLength: 160 }),
      description: sanitizePlainText(item.description, { maxLength: 800, preserveLineBreaks: true }),
      selected: Boolean(item.selected),
      setupPrice: sanitizeMoney(item.setupPrice),
      monthlyPrice: sanitizeMoney(item.monthlyPrice),
      isPrimaryPlan: Boolean(item.isPrimaryPlan),
    }));
  }

  if (nextPayload.pricing && typeof nextPayload.pricing === "object") {
    nextPayload.pricing = {
      setupSubtotal: sanitizeMoney(nextPayload.pricing.setupSubtotal),
      monthlySubtotal: sanitizeMoney(nextPayload.pricing.monthlySubtotal),
      negotiatedSetup: sanitizeMoney(nextPayload.pricing.negotiatedSetup),
      entryValue: sanitizeMoney(nextPayload.pricing.entryValue),
      balanceValue: sanitizeMoney(nextPayload.pricing.balanceValue),
      negotiatedMonthly: sanitizeMoney(nextPayload.pricing.negotiatedMonthly),
    };
  }

  nextPayload.customScope = sanitizePlainText(nextPayload.customScope, {
    maxLength: 2000,
    preserveLineBreaks: true,
  });
  nextPayload.prazoDias = sanitizePlainText(nextPayload.prazoDias, { maxLength: 16 });
  nextPayload.formaPagamento = sanitizePlainText(nextPayload.formaPagamento, { maxLength: 160 });
  nextPayload.numeroRevisoes = sanitizePlainText(nextPayload.numeroRevisoes, { maxLength: 16 });
  nextPayload.valorRevisao = sanitizePlainText(nextPayload.valorRevisao, { maxLength: 24 });
  nextPayload.prazoSuporte = sanitizePlainText(nextPayload.prazoSuporte, {
    maxLength: 800,
    preserveLineBreaks: true,
  });
  nextPayload.observacoesComerciais = sanitizePlainText(nextPayload.observacoesComerciais, {
    maxLength: 2400,
    preserveLineBreaks: true,
  });
  nextPayload.escopoExclusoes = sanitizePlainText(nextPayload.escopoExclusoes, {
    maxLength: 2400,
    preserveLineBreaks: true,
  });

  return nextPayload;
}

function validateBuilderPayload(payload: Record<string, any> | null) {
  if (!payload) {
    throw new Error("Builder payload inválido.");
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  const selectedPrimaryPlans = items.filter((item: Record<string, unknown>) => item.isPrimaryPlan && item.selected);

  if (selectedPrimaryPlans.length > 1) {
    throw new Error("Somente um plano principal pode ficar selecionado por proposta.");
  }

  const selectedItems = items.filter((item: Record<string, unknown>) => item.selected);
  const setupSubtotal = selectedItems.reduce(
    (sum: number, item: Record<string, unknown>) => sum + sanitizeMoney(item.setupPrice),
    0,
  );
  const monthlySubtotal = selectedItems.reduce(
    (sum: number, item: Record<string, unknown>) => sum + sanitizeMoney(item.monthlyPrice),
    0,
  );
  const negotiatedSetup = sanitizeMoney(payload.pricing?.negotiatedSetup ?? setupSubtotal);
  const entryValue = sanitizeMoney(payload.pricing?.entryValue);
  const negotiatedMonthly = sanitizeMoney(payload.pricing?.negotiatedMonthly ?? monthlySubtotal);
  const primaryPlanId = sanitizePlainText(payload.primaryPlanId, { maxLength: 32 }) || "none";

  if (primaryPlanId === "sob-medida" && !String(payload.customScope || "").trim()) {
    throw new Error("Escopo customizado é obrigatório para propostas Sob Medida.");
  }

  if (entryValue > negotiatedSetup) {
    throw new Error("A entrada não pode ser maior que o valor negociado.");
  }

  payload.items = items.map((item: Record<string, unknown>) => ({
    ...item,
    selected: Boolean(item.selected),
    setupPrice: sanitizeMoney(item.setupPrice),
    monthlyPrice: sanitizeMoney(item.monthlyPrice),
  }));
  payload.primaryPlanId = primaryPlanId;
  payload.pricing = {
    setupSubtotal: Number(setupSubtotal.toFixed(2)),
    monthlySubtotal: Number(monthlySubtotal.toFixed(2)),
    negotiatedSetup,
    entryValue,
    balanceValue: Number(Math.max(negotiatedSetup - entryValue, 0).toFixed(2)),
    negotiatedMonthly,
  };

  return payload;
}

function sanitizeContractRecord(record: Record<string, unknown>) {
  return {
    cliente_id:
      typeof record.cliente_id === "string" && record.cliente_id.trim().length > 0
        ? record.cliente_id.trim()
        : null,
    titulo: sanitizePlainText(record.titulo, { maxLength: 240 }),
    descricao: sanitizePlainText(record.descricao, { maxLength: 400, preserveLineBreaks: true }),
    valor: sanitizeMoney(record.valor),
    status: "rascunho",
    corpo: sanitizePlainText(record.corpo, { maxLength: 50000, preserveLineBreaks: true }),
    modelo: BUILDER_TEMPLATE_ID,
    builder_payload: validateBuilderPayload(
      sanitizeBuilderPayload(record.builder_payload as Record<string, unknown> | null),
    ),
    assinatura_admin: null,
    updated_at: new Date().toISOString(),
  };
}

async function loadContrato(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  contractId: string,
) {
  const { data, error } = await supabaseAdmin
    .from("contratos")
    .select("*, clientes(nome)")
    .eq("id", contractId)
    .eq("modelo", BUILDER_TEMPLATE_ID)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createVersionSnapshot(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  contrato: Record<string, any>,
) {
  const { data: latestVersion, error: versionError } = await supabaseAdmin
    .from("contrato_versions")
    .select("version_number")
    .eq("contrato_id", contrato.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (versionError) throw versionError;

  const nextVersionNumber = Number(latestVersion?.version_number || 0) + 1;
  const { error } = await supabaseAdmin.from("contrato_versions").insert({
    contrato_id: contrato.id,
    version_number: nextVersionNumber,
    titulo: contrato.titulo,
    descricao: contrato.descricao,
    valor: contrato.valor,
    status: contrato.status,
    corpo: contrato.corpo,
    builder_payload: contrato.builder_payload,
  });

  if (error) throw error;
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(origin) });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const auth = await requireInternalAdmin(req, supabaseAdmin, origin);

    if (auth.response) {
      return auth.response;
    }

    const body = await req.json();
    const action = sanitizePlainText(body?.action, { maxLength: 40 }) as BuilderAction;
    const contractId = sanitizePlainText(body?.contractId, { maxLength: 80 });

    if (!action) {
      return jsonResponse({ error: "Ação obrigatória." }, 400, origin);
    }

    if (action === "save-draft") {
      const sanitizedRecord = sanitizeContractRecord((body?.contrato || {}) as Record<string, unknown>);

      if (!sanitizedRecord.titulo || !sanitizedRecord.corpo) {
        return jsonResponse({ error: "O contrato mestre precisa de título e corpo válidos." }, 400, origin);
      }

      if (contractId) {
        const existing = await loadContrato(supabaseAdmin, contractId);
        if (!existing) {
          return jsonResponse({ error: "Contrato não encontrado para atualização." }, 404, origin);
        }

        await createVersionSnapshot(supabaseAdmin, existing);

        const { data, error } = await supabaseAdmin
          .from("contratos")
          .update(sanitizedRecord as any)
          .eq("id", contractId)
          .eq("modelo", BUILDER_TEMPLATE_ID)
          .select("*, clientes(nome)")
          .single();

        if (error) {
          throw error;
        }

        return jsonResponse({ contrato: data }, 200, origin);
      }

      const { data, error } = await supabaseAdmin
        .from("contratos")
        .insert(sanitizedRecord as any)
        .select("*, clientes(nome)")
        .single();

      if (error) {
        throw error;
      }

      return jsonResponse({ contrato: data }, 200, origin);
    }

    if (!contractId) {
      return jsonResponse({ error: "Identificador do contrato é obrigatório." }, 400, origin);
    }

    const existing = await loadContrato(supabaseAdmin, contractId);
    if (!existing) {
      return jsonResponse({ error: "Contrato não encontrado." }, 404, origin);
    }

    if (action === "archive" || action === "unarchive") {
      const { data, error } = await supabaseAdmin
        .from("contratos")
        .update({
          archived_at: action === "archive" ? new Date().toISOString() : null,
        } as any)
        .eq("id", contractId)
        .eq("modelo", BUILDER_TEMPLATE_ID)
        .select("*, clientes(nome)")
        .single();

      if (error) {
        throw error;
      }

      return jsonResponse({ contrato: data }, 200, origin);
    }

    if (action === "delete-draft") {
      if (existing.status !== "rascunho") {
        return jsonResponse({ error: "Somente rascunhos podem ser excluídos." }, 400, origin);
      }

      const { error } = await supabaseAdmin
        .from("contratos")
        .delete()
        .eq("id", contractId)
        .eq("modelo", BUILDER_TEMPLATE_ID);

      if (error) {
        throw error;
      }

      return jsonResponse({ success: true }, 200, origin);
    }

    return jsonResponse({ error: "Ação inválida." }, 400, origin);
  } catch (error: any) {
    return jsonResponse({ error: error?.message || "Falha ao processar o contrato." }, 500, origin);
  }
});
