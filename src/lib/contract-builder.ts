import type { Tables } from "@/integrations/supabase/types";
import { PUBLIC_PLAN_CATALOG, type PublicPlanCatalogItem } from "@/lib/public-plans";

export type BuilderPrimaryPlanId = PublicPlanCatalogItem["id"] | "none";
export type BuilderItemGroup = "planos" | "fixo" | "intermediario" | "mensal";
export type ContractBuilderStepIndex = 0 | 1 | 2 | 3 | 4;

export interface ContractBuilderParty {
  nome: string;
  nomeEmpresa?: string;
  documento: string;
  email?: string;
  whatsapp?: string;
  telefone?: string;
  instagram?: string;
  siteUrl?: string;
  endereco: string;
  cep?: string;
  cidade?: string;
  estado?: string;
}

export interface ContractBuilderContractor {
  nome: string;
  representante: string;
  documento: string;
  endereco: string;
  observacaoRecebimento: string;
}

export interface ContractBuilderItem {
  id: string;
  source: "plan" | "extra";
  sourceId?: string;
  group: BuilderItemGroup;
  name: string;
  description: string;
  selected: boolean;
  setupPrice: number;
  monthlyPrice: number;
  isPrimaryPlan: boolean;
}

export interface ContractBuilderClientExtraSnapshot {
  id: string;
  extraId: string;
  name: string;
  description: string;
  category: BuilderItemGroup;
  typeLabel: "mensal" | "único";
  setupPrice: number;
  monthlyPrice: number;
}

export interface ContractBuilderPricing {
  setupSubtotal: number;
  monthlySubtotal: number;
  negotiatedSetup: number;
  discountType: "fixed" | "percentage";
  discountValue: number;
  discountAmount: number;
  finalSetupTotal: number;
  entryValue: number;
  balanceValue: number;
  negotiatedMonthly: number;
  finalMonthlyTotal: number;
}

export interface ContractBuilderPayload {
  clienteId: string;
  lastStep: ContractBuilderStepIndex;
  primaryPlanId: BuilderPrimaryPlanId;
  contractante: ContractBuilderParty;
  contratada: ContractBuilderContractor;
  items: ContractBuilderItem[];
  clientExtrasSnapshot: ContractBuilderClientExtraSnapshot[];
  customScope: string;
  prazoDias: string;
  formaPagamento: string;
  numeroRevisoes: string;
  valorRevisao: string;
  prazoSuporte: string;
  observacoesComerciais: string;
  escopoExclusoes: string;
  pricing: ContractBuilderPricing;
  createdAt: string;
  updatedAt: string;
}

export interface ContractProposalSummarySection {
  eyebrow: string;
  title: string;
  lines: string[];
}

export interface ContractProposalSummaryService {
  name: string;
  description: string;
  pricing: string;
  highlight?: string;
}

export interface ContractProposalSummary {
  contractante: ContractProposalSummarySection;
  contratada: ContractProposalSummarySection;
  comercial: ContractProposalSummarySection;
  pricingBreakdown: string[];
  scopeNotice: ContractProposalSummarySection;
  selectedPlan: ContractProposalSummaryService | null;
  selectedServices: ContractProposalSummaryService[];
  customScope: string;
}

export interface ContractClauseExplanation {
  number: string;
  title: string;
  explanation: string;
}

export interface ContractSignatureSummary {
  locationAndDate: string;
  contractanteName: string;
  contractanteCaption: string;
  contratadaName: string;
  contratadaCaption: string;
  note: string;
}

export interface ContractSignatureOptions {
  contractanteSignedName?: string | null;
  signedAt?: string | null;
}

function normalizeBuilderGroup(value: string | null | undefined): BuilderItemGroup {
  if (value === "planos" || value === "fixo" || value === "intermediario" || value === "mensal") {
    return value;
  }

  return "fixo";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const LEGACY_SIGNATURE_LINES_REGEX =
  /\n{0,2}(CONTRATANTE|CONTRATADA):\s*_+\s*(?=\n|$)/gi;

export const DEFAULT_CONTRACTOR_DATA: ContractBuilderContractor = {
  nome: "NovaesWeb",
  representante: "Lucas Rodrigo Ferreira dos Santos",
  documento: "503.328.838-50",
  endereco: "Estrada da Prainha, 630 – Mato Grande, Canoas – RS",
  observacaoRecebimento:
    "A NovaesWeb está no início da operação e utiliza CPF como forma de recebimento neste momento.",
};

export const DEFAULT_SCOPE_EXCLUSIONS =
  "Licenças, integrações não previstas, campanhas pagas, textos, fotos, artes, hospedagem, domínio ou novas funcionalidades não descritas na proposta aprovada.";

export const DEFAULT_COMMERCIAL_NOTES =
  "Serviços recorrentes, extras, integrações, domínio, hospedagem e demandas fora do escopo poderão ser contratados e cobrados à parte mediante aprovação do CONTRATANTE.";

export const DEFAULT_PAYMENT_METHOD =
  "PIX, boleto, cartão ou link de pagamento";

const CONTRACT_SCOPE_NOTICE_TITLE = "Escopo de atuação - importante";

const CONTRACT_SCOPE_NOTICE_LINES = [
  "AVISO: A NovaesWeb atua exclusivamente na criação, desenvolvimento e manutenção do site e das estruturas digitais contratadas.",
  "Serviços de marketing digital, gestão de tráfego pago, produção de conteúdo, gerenciamento de redes sociais, campanhas publicitárias e estratégias comerciais não estão incluídos no escopo da NovaesWeb.",
  "A NovaesWeb não oferece nem se responsabiliza por resultados de marketing, captação de clientes ou performance comercial.",
];

export function createEmptyBuilderPayload(
  extras: Tables<"extras_catalogo">[] = [],
): ContractBuilderPayload {
  const now = new Date().toISOString();
  const items = buildContractBuilderItems(extras);

  return {
    clienteId: "",
    lastStep: 0,
    primaryPlanId: "none",
    contractante: {
      nome: "",
      nomeEmpresa: "",
      documento: "",
      email: "",
      whatsapp: "",
      telefone: "",
      instagram: "",
      siteUrl: "",
      endereco: "",
      cep: "",
      cidade: "",
      estado: "",
    },
    contratada: { ...DEFAULT_CONTRACTOR_DATA },
    items,
    clientExtrasSnapshot: [],
    customScope: "",
    prazoDias: "15",
    formaPagamento: DEFAULT_PAYMENT_METHOD,
    numeroRevisoes: "2",
    valorRevisao: "150,00",
    prazoSuporte: "30 dias após a entrega",
    observacoesComerciais: DEFAULT_COMMERCIAL_NOTES,
    escopoExclusoes: DEFAULT_SCOPE_EXCLUSIONS,
    pricing: computeBuilderPricing(items),
    createdAt: now,
    updatedAt: now,
  };
}

export function formatCurrencyBRL(value: number) {
  return `R$ ${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function stripLegacySignaturePlaceholders(body: string) {
  return String(body || "")
    .replace(LEGACY_SIGNATURE_LINES_REGEX, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseMoneyInput(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const normalized = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function composeClientAddress(
  cliente: Partial<Tables<"clientes">> | ContractBuilderParty,
) {
  const enderecoBase = cliente.endereco?.trim() || "";
  const numero = "numero_endereco" in cliente ? cliente.numero_endereco?.trim() || "" : "";
  const complemento = cliente.complemento?.trim() || "";
  const bairro = cliente.bairro?.trim() || "";
  const cidade = cliente.cidade?.trim() || "";
  const estado = cliente.estado?.trim() || "";
  const cep = cliente.cep?.trim() || "";

  const primeiraLinha = [enderecoBase, numero].filter(Boolean).join(", ");
  const segundaLinha = [complemento, bairro].filter(Boolean).join(" — ");
  const terceiraLinha = [cidade, estado].filter(Boolean).join(" / ");

  return [primeiraLinha, segundaLinha, terceiraLinha, cep].filter(Boolean).join(" | ");
}

export function buildContractanteFromClient(cliente: Tables<"clientes">): ContractBuilderParty {
  return {
    nome: cliente.nome || "",
    nomeEmpresa: cliente.nome_empresa || "",
    documento: cliente.documento || "",
    email: cliente.email || "",
    whatsapp: cliente.whatsapp || "",
    telefone: cliente.telefone || "",
    instagram: cliente.instagram || "",
    siteUrl: cliente.site_url || "",
    endereco: composeClientAddress(cliente),
    cep: cliente.cep || "",
    cidade: cliente.cidade || "",
    estado: cliente.estado || "",
  };
}

export function buildContractBuilderItems(
  _extras: Tables<"extras_catalogo">[],
): ContractBuilderItem[] {
  return PUBLIC_PLAN_CATALOG.map((plan) => ({
    id: `plan:${plan.id}`,
    source: "plan",
    sourceId: plan.id,
    group: "planos",
    name: plan.title,
    description: plan.description,
    selected: false,
    setupPrice: plan.setupPrice,
    monthlyPrice: plan.monthlyPrice,
    isPrimaryPlan: true,
  }));
}

function getSelectedPlanItem(items: ContractBuilderItem[]) {
  return items.find((item) => item.isPrimaryPlan && item.selected) || null;
}

export function getContractExtraSnapshots(payload: ContractBuilderPayload) {
  if (payload.clientExtrasSnapshot.length > 0) {
    return payload.clientExtrasSnapshot;
  }

  return payload.items
    .filter((item) => item.selected && !item.isPrimaryPlan)
    .map((item) => ({
      id: item.id,
      extraId: item.sourceId || item.id,
      name: item.name,
      description: item.description,
      category: item.group,
      typeLabel: item.monthlyPrice > 0 ? "mensal" : "único",
      setupPrice: item.setupPrice,
      monthlyPrice: item.monthlyPrice,
    }));
}

export function selectPrimaryPlan(
  items: ContractBuilderItem[],
  planId: BuilderPrimaryPlanId,
) {
  return items.map((item) => {
    if (!item.isPrimaryPlan) return item;
    if (planId === "none") return { ...item, selected: false };
    return {
      ...item,
      selected: item.id === `plan:${planId}`,
    };
  });
}

export function toggleBuilderItem(
  items: ContractBuilderItem[],
  itemId: string,
  selected: boolean,
) {
  return items.map((item) =>
    item.id === itemId ? { ...item, selected } : item,
  );
}

export function updateBuilderItemPrice(
  items: ContractBuilderItem[],
  itemId: string,
  field: "setupPrice" | "monthlyPrice",
  value: number,
) {
  return items.map((item) =>
    item.id === itemId
      ? {
          ...item,
          [field]: Number.isFinite(value) ? value : 0,
        }
      : item,
  );
}

export function computeBuilderPricing(
  items: ContractBuilderItem[],
  clientExtrasSnapshot: ContractBuilderClientExtraSnapshot[] = [],
  overrides?: Partial<ContractBuilderPricing>,
): ContractBuilderPricing {
  const selectedPlan = getSelectedPlanItem(items);
  const pricedExtras =
    clientExtrasSnapshot.length > 0
      ? clientExtrasSnapshot
      : items.filter((item) => item.selected && !item.isPrimaryPlan).map((item) => ({
          setupPrice: item.setupPrice,
          monthlyPrice: item.monthlyPrice,
        }));

  const setupSubtotal =
    Number(selectedPlan?.setupPrice || 0) +
    pricedExtras.reduce((sum, item) => sum + Number(item.setupPrice || 0), 0);

  const monthlySubtotal =
    Number(selectedPlan?.monthlyPrice || 0) +
    pricedExtras.reduce((sum, item) => sum + Number(item.monthlyPrice || 0), 0);

  const negotiatedSetup = overrides?.negotiatedSetup ?? setupSubtotal;
  const negotiatedMonthly = overrides?.negotiatedMonthly ?? monthlySubtotal;
  const discountType = overrides?.discountType === "percentage" ? "percentage" : "fixed";
  const discountValue = Math.max(Number(overrides?.discountValue || 0), 0);
  const discountAmount =
    discountType === "percentage"
      ? Math.min((negotiatedSetup * discountValue) / 100, negotiatedSetup)
      : Math.min(discountValue, negotiatedSetup);
  const finalSetupTotal = Math.max(negotiatedSetup - discountAmount, 0);
  const entryValue = Math.min(overrides?.entryValue ?? 0, finalSetupTotal);
  const balanceValue = Math.max(finalSetupTotal - entryValue, 0);
  const finalMonthlyTotal = negotiatedMonthly;

  return {
    setupSubtotal,
    monthlySubtotal,
    negotiatedSetup,
    discountType,
    discountValue,
    discountAmount,
    finalSetupTotal,
    entryValue,
    balanceValue,
    negotiatedMonthly,
    finalMonthlyTotal,
  };
}

export function getSelectedPrimaryPlanId(items: ContractBuilderItem[]): BuilderPrimaryPlanId {
  const selectedPlan = items.find((item) => item.isPrimaryPlan && item.selected);
  return (selectedPlan?.sourceId as BuilderPrimaryPlanId) || "none";
}

export function buildContractedServicesSummary(
  payload: ContractBuilderPayload,
) {
  const selectedPlan = getSelectedPlanItem(payload.items);
  const selectedExtras = getContractExtraSnapshots(payload);

  if (payload.primaryPlanId === "sob-medida" && payload.customScope.trim()) {
    return [
      payload.customScope.trim(),
      selectedPlan?.name ? `Plano base: ${selectedPlan.name}` : null,
      selectedExtras.length
        ? `Itens adicionais contratados: ${selectedExtras.map((item) => item.name).join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join(" | ");
  }

  return [selectedPlan?.name || null, ...selectedExtras.map((item) => item.name)]
    .filter(Boolean)
    .join(", ");
}

export function describeBuilderItemPricing(item: ContractBuilderItem) {
  if (!item.selected) return "(Não incluso neste pacote)";

  const setupText = item.setupPrice > 0 ? formatCurrencyBRL(item.setupPrice) : "Incluso";
  const monthlyText = item.monthlyPrice > 0 ? formatCurrencyBRL(item.monthlyPrice) : "Incluso";

  if (item.group === "mensal" && item.setupPrice <= 0) {
    return `${monthlyText}/mês`;
  }

  if (item.monthlyPrice > 0) {
    return `${setupText} (Setup) / ${monthlyText} (Mensal)`;
  }

  return `${setupText} (Setup)`;
}

export function describeClientExtraPricing(item: ContractBuilderClientExtraSnapshot) {
  const setupText = item.setupPrice > 0 ? formatCurrencyBRL(item.setupPrice) : "Incluso";
  const monthlyText = item.monthlyPrice > 0 ? `${formatCurrencyBRL(item.monthlyPrice)}/mês` : "Sem recorrência";

  if (item.monthlyPrice > 0 && item.setupPrice > 0) {
    return `${setupText} + ${monthlyText}`;
  }

  if (item.monthlyPrice > 0) {
    return monthlyText;
  }

  return setupText;
}

export function buildServicesTableText(
  payload: ContractBuilderPayload,
) {
  const selectedPlan = getSelectedPlanItem(payload.items);
  const selectedExtras = getContractExtraSnapshots(payload);
  const lines = ["CONDIÇÕES COMERCIAIS:", ""];

  lines.push(`• Total ativação (setup único): ${formatCurrencyBRL(payload.pricing.finalSetupTotal)}`);
  lines.push(
    `• Total mensal: ${
      payload.pricing.finalMonthlyTotal > 0
        ? `${formatCurrencyBRL(payload.pricing.finalMonthlyTotal)} / mês`
        : "Sem recorrência"
    }`,
  );
  lines.push(
    `• Entrada / sinal: ${formatCurrencyBRL(payload.pricing.entryValue)} | Saldo na entrega: ${formatCurrencyBRL(
      payload.pricing.balanceValue,
    )}`,
  );
  lines.push(`• Prazo estimado: ${payload.prazoDias} dias úteis | Pagamento: ${payload.formaPagamento}`);
  lines.push("");

  if (selectedPlan) {
    lines.push("PLANO E SERVIÇOS CONTRATADOS:");
    lines.push("Plano principal");
    lines.push(`• ${selectedPlan.name} — ${describeBuilderItemPricing(selectedPlan)}`);
    lines.push("");
  }

  if (payload.primaryPlanId === "sob-medida" && payload.customScope.trim()) {
    lines.push("Escopo customizado:");
    lines.push(payload.customScope.trim());
    lines.push("");
  }

  if (selectedExtras.length) {
    lines.push("Extras contratados:");
    selectedExtras.forEach((item) => {
      lines.push(`• ${item.name} — ${describeClientExtraPricing(item)} — Tipo: ${item.typeLabel}`);
    });
    lines.push("");
  }

  lines.push("FECHAMENTO FINANCEIRO:");
  lines.push(`• Subtotal da implantação: ${formatCurrencyBRL(payload.pricing.setupSubtotal)}`);
  lines.push(`• Desconto aplicado: ${formatCurrencyBRL(payload.pricing.discountAmount)}`);
  lines.push(`• Valor final da implantação: ${formatCurrencyBRL(payload.pricing.finalSetupTotal)}`);
  lines.push(`• Entrada / sinal: ${formatCurrencyBRL(payload.pricing.entryValue)}`);
  lines.push(`• Saldo na entrega: ${formatCurrencyBRL(payload.pricing.balanceValue)}`);
  if (payload.pricing.finalMonthlyTotal > 0) {
    lines.push(`• Mensalidade contratada: ${formatCurrencyBRL(payload.pricing.finalMonthlyTotal)}`);
  }
  lines.push("");
  lines.push(CONTRACT_SCOPE_NOTICE_TITLE.toUpperCase() + ":");
  CONTRACT_SCOPE_NOTICE_LINES.forEach((line) => {
    lines.push(line);
  });

  return lines.join("\n");
}

export function buildContratadaLegalText(contratada: ContractBuilderContractor) {
  return `${contratada.nome}, representada por seu fundador e CEO ${contratada.representante}, CPF ${contratada.documento}, ${contratada.endereco}, doravante denominada simplesmente CONTRATADA. ${contratada.observacaoRecebimento}`;
}

export function buildBuilderTemplateValues(payload: ContractBuilderPayload) {
  return {
    nome_cliente: payload.contractante.nome,
    cpf_cnpj: payload.contractante.documento,
    endereco: payload.contractante.endereco,
    nome_contratada: `${payload.contratada.nome}, representada por seu fundador e CEO ${payload.contratada.representante}`,
    cpf_cnpj_contratada: payload.contratada.documento,
    endereco_contratada: payload.contratada.endereco,
    cidade_foro: "Canoas",
    estado_foro: "RS",
    lista_servicos: buildContractedServicesSummary(payload),
    tabela_servicos: buildServicesTableText(payload),
    escopo_exclusoes: payload.escopoExclusoes,
    valor_subtotal_implantacao: payload.pricing.setupSubtotal.toFixed(2).replace(".", ","),
    valor_desconto: payload.pricing.discountAmount.toFixed(2).replace(".", ","),
    valor_ativacao_total: payload.pricing.finalSetupTotal.toFixed(2).replace(".", ","),
    prazo_dias: payload.prazoDias,
    valor_entrada: payload.pricing.entryValue.toFixed(2).replace(".", ","),
    valor_saldo: payload.pricing.balanceValue.toFixed(2).replace(".", ","),
    valor_mensal: payload.pricing.finalMonthlyTotal.toFixed(2).replace(".", ","),
    dia_vencimento: "10",
    forma_pagamento: payload.formaPagamento,
    numero_revisoes: payload.numeroRevisoes,
    valor_revisao: payload.valorRevisao,
    prazo_suporte: payload.prazoSuporte,
    observacoes_comerciais: payload.observacoesComerciais,
    data: new Date().toISOString().slice(0, 10),
  };
}

export function buildProposalSummary(payload: ContractBuilderPayload): ContractProposalSummary {
  const selectedPlan = getSelectedPlanItem(payload.items);
  const selectedServices = getContractExtraSnapshots(payload).map((item) => ({
    name: item.name,
    description: item.description,
    pricing: describeClientExtraPricing(item),
    highlight: item.typeLabel === "mensal" ? "Extra mensal" : "Extra único",
  }));

  const contractanteLines = [
    payload.contractante.nomeEmpresa?.trim() ? `Empresa: ${payload.contractante.nomeEmpresa.trim()}` : null,
    payload.contractante.documento?.trim() ? `CPF/CNPJ: ${payload.contractante.documento.trim()}` : null,
    payload.contractante.email?.trim() ? `E-mail: ${payload.contractante.email.trim()}` : null,
    payload.contractante.whatsapp?.trim() ? `WhatsApp: ${payload.contractante.whatsapp.trim()}` : null,
    payload.contractante.telefone?.trim() ? `Telefone: ${payload.contractante.telefone.trim()}` : null,
    payload.contractante.endereco?.trim() ? `Endereço: ${payload.contractante.endereco.trim()}` : null,
  ].filter(Boolean) as string[];

  const contratadaLines = [
    `Representante: ${payload.contratada.representante}`,
    `CPF/CNPJ: ${payload.contratada.documento}`,
    `Endereço: ${payload.contratada.endereco}`,
    payload.contratada.observacaoRecebimento.trim(),
  ].filter(Boolean);

  const comercialLines = [
    `Total Ativação (Setup Único): ${formatCurrencyBRL(payload.pricing.finalSetupTotal)}`,
    `Total Mensal: ${
      payload.pricing.finalMonthlyTotal > 0
        ? `${formatCurrencyBRL(payload.pricing.finalMonthlyTotal)} / mês`
        : "Sem recorrência"
    }`,
    `Entrada / sinal: ${formatCurrencyBRL(payload.pricing.entryValue)} | Saldo na entrega: ${formatCurrencyBRL(
      payload.pricing.balanceValue,
    )}`,
    `Prazo estimado: ${payload.prazoDias} dias úteis | Pagamento: ${payload.formaPagamento}`,
  ].filter(Boolean) as string[];

  const pricingBreakdown = [
    `Subtotal da implantação: ${formatCurrencyBRL(payload.pricing.setupSubtotal)}`,
    `Desconto aplicado: ${formatCurrencyBRL(payload.pricing.discountAmount)}`,
    `Valor final da implantação: ${formatCurrencyBRL(payload.pricing.finalSetupTotal)}`,
    payload.pricing.finalMonthlyTotal > 0
      ? `Mensalidade contratada: ${formatCurrencyBRL(payload.pricing.finalMonthlyTotal)}`
      : null,
  ].filter(Boolean) as string[];

  return {
    contractante: {
      eyebrow: "Contratante",
      title: payload.contractante.nome.trim() || "Contratante",
      lines: contractanteLines,
    },
    contratada: {
      eyebrow: "Contratada",
      title: payload.contratada.nome.trim() || "Contratada",
      lines: contratadaLines,
    },
    comercial: {
      eyebrow: "Comercial",
      title: "Condições comerciais",
      lines: comercialLines,
    },
    pricingBreakdown,
    scopeNotice: {
      eyebrow: "Escopo",
      title: CONTRACT_SCOPE_NOTICE_TITLE,
      lines: [...CONTRACT_SCOPE_NOTICE_LINES],
    },
    selectedPlan: selectedPlan
      ? {
          name: selectedPlan.name,
          description: selectedPlan.description,
          pricing: describeBuilderItemPricing(selectedPlan),
          highlight: "Plano principal",
        }
      : null,
    selectedServices,
    customScope: payload.primaryPlanId === "sob-medida" ? payload.customScope.trim() : "",
  };
}

export function buildContractSignatureSummary(
  payload?: ContractBuilderPayload | null,
  options?: ContractSignatureOptions,
): ContractSignatureSummary | null {
  if (!payload) return null;

  const signatureDate = options?.signedAt ? new Date(options.signedAt) : new Date();
  const locationAndDate = `Canoas/RS, ${signatureDate.toLocaleDateString("pt-BR")}`;
  const contractanteName =
    options?.contractanteSignedName?.trim() || payload.contractante.nome.trim() || "Contratante";

  return {
    locationAndDate,
    contractanteName,
    contractanteCaption: options?.signedAt
      ? "Aceite eletrônico registrado no portal"
      : "Nome do responsável pelo contratante",
    contratadaName: payload.contratada.nome.trim() || "NovaesWeb",
    contratadaCaption: payload.contratada.representante?.trim()
      ? `Representada por ${payload.contratada.representante.trim()}`
      : "Parte contratada",
    note: options?.signedAt
      ? "Assinatura eletrônica simples confirmada com nome do responsável no portal do cliente."
      : "Espaço visual preparado para aceite final e impressão da proposta.",
  };
}

export function buildContractClauseExplanations(
  payload: ContractBuilderPayload,
): ContractClauseExplanation[] {
  const selectedPlan = getSelectedPlanItem(payload.items)?.name || "sem plano principal";
  const selectedExtras = getContractExtraSnapshots(payload);
  const selectedExtrasLabel = selectedExtras.length
    ? "e foram incluídos os extras listados acima."
    : "sem extras adicionais vinculados nesta proposta.";
  const customScopeText =
    payload.primaryPlanId === "sob-medida" && payload.customScope.trim()
      ? ` O escopo customizado desta proposta é: ${payload.customScope.trim()}.`
      : "";
  const reviewPrice =
    payload.valorRevisao?.trim() ? ` por pelo menos R$ ${payload.valorRevisao.trim()}` : "";

  return [
    {
      number: "1",
      title: "O que está sendo contratado",
      explanation: `Este contrato cobre a estrutura digital contratada dentro do ecossistema NovaesWeb, podendo abranger site institucional, landing page, sistema interno, painel administrativo, gestão de pedidos, manutenção recorrente, módulos adicionais, integrações e extras, conforme detalhado nas condições comerciais. Nesta venda, o plano principal é ${selectedPlan} e ${selectedExtrasLabel}${customScopeText}`,
    },
    {
      number: "2",
      title: "Escopo e exclusões",
      explanation:
        "Tudo o que está descrito no resumo comercial faz parte da entrega. Serviços de marketing digital, gestão de tráfego pago, produção de conteúdo e gerenciamento de redes sociais NÃO fazem parte do escopo da NovaesWeb. O cliente deve fornecer materiais (logo, textos, fotos) em tempo ágil para não comprometer o prazo.",
    },
    {
      number: "3",
      title: "Materiais e briefing",
      explanation:
        "O CONTRATANTE deverá fornecer todos os materiais e informações necessários. O atraso no envio suspende automaticamente a contagem dos prazos. A CONTRATADA não se responsabiliza por atrasos decorrentes de material incompleto ou enviado fora do prazo.",
    },
    {
      number: "4",
      title: "Prazos e execução",
      explanation: `Prazo estimado de ${payload.prazoDias} dias úteis. O prazo começa quando briefing, materiais e pagamento inicial estiverem em ordem. Havendo paralisação por mais de 15 dias, a CONTRATADA poderá reprogramar a fila de produção.`,
    },
    {
      number: "5",
      title: "Valores e pagamento",
      explanation: `A implantação negociada ficou em ${formatCurrencyBRL(
        payload.pricing.finalSetupTotal,
      )}${
        payload.pricing.discountAmount > 0
          ? `, já considerando desconto de ${formatCurrencyBRL(payload.pricing.discountAmount)} sobre o subtotal de ${formatCurrencyBRL(
              payload.pricing.setupSubtotal,
            )}`
          : ""
      }, com entrada de ${formatCurrencyBRL(payload.pricing.entryValue)} e saldo de ${formatCurrencyBRL(
        payload.pricing.balanceValue,
      )}.${
        payload.pricing.finalMonthlyTotal > 0
          ? ` A mensalidade contratada ficou em ${formatCurrencyBRL(payload.pricing.finalMonthlyTotal)}.`
          : ""
      } A forma de pagamento combinada é ${payload.formaPagamento}. Custos externos com licenças, APIs ou domínio são de responsabilidade do CONTRATANTE.`,
    },
    {
      number: "6",
      title: "Atrasos e inadimplência",
      explanation:
        "Em caso de atraso no pagamento, a CONTRATADA poderá suspender serviços, atendimento, manutenção, publicações, entregas e liberações até a regularização financeira. Se houver saldo em aberto durante o projeto, a execução poderá ser congelada até a quitação integral.",
    },
    {
      number: "7",
      title: "Revisões e alterações",
      explanation: `Estão incluídas até ${payload.numeroRevisoes} rodadas de revisão dentro do escopo aprovado. Revisões, refações, alterações estruturais, mudanças de direção ou novos pedidos fora do escopo poderão ser cobrados adicionalmente no valor mínimo de R$ ${payload.valorRevisao} por demanda.`,
    },
    {
      number: "8",
      title: "Propriedade intelectual",
      explanation:
        "Até a quitação integral, a estrutura, arquivos editáveis, painel, páginas, sistemas, automações, layouts, códigos e ativos digitais permanecem sob titularidade da CONTRATADA. A cessão definitiva ocorre somente após pagamento total.",
    },
    {
      number: "9",
      title: "Marketing e resultados",
      explanation:
        "A NovaesWeb garante trabalho técnico de ponta e estratégia digital moderna, mas não garante resultado absoluto de vendas, leads ou faturamento, pois isso depende da operação e mercado do cliente. Serviços de marketing (anúncios, redes sociais) não estão inclusos nesta contratação técnica.",
    },
    {
      number: "10",
      title: "Suporte e manutenção",
      explanation: `Serviços de suporte, manutenção, acompanhamento ou operação recorrente só valem se contratados expressamente. Quando existentes, serão prestados dentro da janela: ${payload.prazoSuporte}. Não se incluem automaticamente: criação de novas páginas, novos módulos, mudanças profundas de layout, integrações não previstas ou demandas fora do escopo.`,
    },
    {
      number: "11",
      title: "Cancelamento e rescisão",
      explanation:
        "Você pode cancelar mesmo após o início dos trabalhos, mas os valores já pagos para ativação e estruturação do projeto não serão devolvidos, pois cobrem as horas de produção técnica já utilizadas. Em caso de cancelamento, a estrutura permanece ativa apenas até o fim do período já pago.",
    },
    {
      number: "12",
      title: "Sigilo e dados",
      explanation:
        "As partes mantêm sigilo sobre informações estratégicas, comerciais, operacionais, dados e documentos. Os dados serão utilizados apenas para execução do serviço, atendimento, suporte e obrigações correlatas. O CONTRATANTE é responsável pela veracidade das informações fornecidas.",
    },
    {
      number: "13",
      title: "Observações comerciais",
      explanation:
        payload.observacoesComerciais.trim() ||
        "Serviços recorrentes, extras, integrações, domínio, hospedagem e demandas fora do escopo poderão ser contratados e cobrados à parte mediante aprovação do CONTRATANTE.",
    },
    {
      number: "14",
      title: "Foro e jurisdição",
      explanation:
        "Fica eleito o foro da Comarca de Canoas/RS para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.",
    },
  ];
}

export function buildContractWordHtml(
  title: string,
  body: string,
  proposal?: ContractBuilderPayload | null,
  signatureOptions?: ContractSignatureOptions,
) {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(stripLegacySignaturePlaceholders(body)).replace(/\n/g, "<br />");
  const summary = proposal ? buildProposalSummary(proposal) : null;
  const explanations = proposal ? buildContractClauseExplanations(proposal) : [];
  const signatureSummary = buildContractSignatureSummary(proposal, signatureOptions);

  const renderInfoCard = (section: ContractProposalSummarySection) => `
    <td class="info-card">
      <div class="info-kicker">${escapeHtml(section.eyebrow)}</div>
      <div class="info-title">${escapeHtml(section.title)}</div>
      <div class="info-lines">
        ${section.lines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}
      </div>
    </td>
  `;

  const renderServiceCard = (service: ContractProposalSummaryService, featured = false) => `
    <div class="${featured ? "service-card service-card-featured" : "service-card"}">
      ${service.highlight ? `<div class="service-tag">${escapeHtml(service.highlight)}</div>` : ""}
      <div class="service-name">${escapeHtml(service.name)}</div>
      <div class="service-pricing">${escapeHtml(service.pricing)}</div>
      ${service.description ? `<div class="service-description">${escapeHtml(service.description)}</div>` : ""}
    </div>
  `;

  const renderScopeBox = (title: string, lines: string[]) => `
    <div class="scope-box">
      <strong>${escapeHtml(title)}</strong><br />
      ${lines.map((line) => escapeHtml(line)).join("<br />")}
    </div>
  `;

  const renderExplanationCard = (item: ContractClauseExplanation) => `
    <div class="explanation-card">
      <div class="explanation-kicker">Cláusula ${escapeHtml(item.number)}</div>
      <div class="explanation-title">${escapeHtml(item.title)}</div>
      <div class="explanation-copy">${escapeHtml(item.explanation)}</div>
    </div>
  `;

  return `<!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>${safeTitle}</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #16121f;
          margin: 0;
          background: #f7f4fb;
        }
        .sheet {
          padding: 34px 34px 48px;
        }
        .hero {
          background: linear-gradient(135deg, #261135, #5d1f7a 48%, #e8334a 100%);
          color: white;
          padding: 24px 26px;
          border-radius: 24px;
          box-shadow: 0 18px 40px rgba(35, 11, 44, 0.18);
        }
        .hero-kicker {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          opacity: 0.72;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .title {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          color: #fff;
        }
        .hero-copy {
          margin-top: 12px;
          font-size: 13px;
          line-height: 1.7;
          max-width: 640px;
          color: rgba(255,255,255,0.84);
        }
        .summary-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 14px;
          margin-top: 20px;
        }
        .info-card {
          width: 33.33%;
          vertical-align: top;
          background: #ffffff;
          border: 1px solid #ecdff4;
          border-radius: 20px;
          padding: 18px 18px 16px;
        }
        .info-kicker {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #7f668f;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .info-title {
          font-size: 17px;
          font-weight: 700;
          color: #1b1323;
          margin-bottom: 10px;
        }
        .info-lines {
          font-size: 12px;
          line-height: 1.7;
          color: #54495d;
        }
        .section-title {
          margin: 26px 0 12px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #8d3cb0;
          font-weight: 800;
        }
        .service-card {
          background: #ffffff;
          border: 1px solid #ecdff4;
          border-radius: 20px;
          padding: 18px 18px 16px;
          margin-bottom: 12px;
        }
        .service-card-featured {
          background: linear-gradient(180deg, #fff, #fff7fb);
          border-color: #e6b9d4;
        }
        .service-tag {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #7f668f;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .service-name {
          font-size: 16px;
          font-weight: 800;
          color: #1b1323;
        }
        .service-pricing {
          margin-top: 6px;
          font-size: 13px;
          color: #a32161;
          font-weight: 700;
        }
        .service-description {
          margin-top: 8px;
          font-size: 12px;
          line-height: 1.7;
          color: #54495d;
        }
        .scope-box {
          margin-top: 12px;
          background: #ffffff;
          border: 1px solid #ecdff4;
          border-radius: 20px;
          padding: 18px;
          font-size: 12px;
          line-height: 1.7;
          color: #54495d;
        }
        .explanation-card {
          background: #ffffff;
          border: 1px solid #ecdff4;
          border-radius: 20px;
          padding: 18px;
          margin-bottom: 12px;
        }
        .explanation-kicker {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #7f668f;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .explanation-title {
          font-size: 15px;
          font-weight: 800;
          color: #1b1323;
          margin-bottom: 8px;
        }
        .explanation-copy {
          font-size: 12px;
          line-height: 1.7;
          color: #54495d;
        }
        .copy {
          margin-top: 26px;
          background: #ffffff;
          border: 1px solid #ecdff4;
          border-radius: 24px;
          padding: 26px;
          white-space: pre-wrap;
          line-height: 1.7;
          font-size: 12px;
        }
        .signature-section {
          margin-top: 24px;
          padding: 26px 24px;
          border-radius: 28px;
          background:
            radial-gradient(circle at top left, rgba(123,31,162,0.14), transparent 34%),
            radial-gradient(circle at top right, rgba(232,51,74,0.12), transparent 36%),
            linear-gradient(135deg, rgba(123,31,162,0.12), rgba(232,51,74,0.08), rgba(194,24,91,0.14));
          border: 1px solid #ecdff4;
          text-align: center;
        }
        .signature-kicker {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #8d3cb0;
          font-weight: 800;
        }
        .signature-date {
          margin-top: 8px;
          font-size: 12px;
          color: #6f5b7d;
        }
        .signature-grid {
          width: 100%;
          border-collapse: separate;
          border-spacing: 14px 0;
          margin-top: 18px;
        }
        .signature-card {
          width: 50%;
          background: rgba(255,255,255,0.9);
          border: 1px solid #ecdff4;
          border-radius: 22px;
          padding: 16px 16px 18px;
          vertical-align: top;
          box-shadow: 0 18px 36px rgba(33, 18, 49, 0.08);
        }
        .signature-role {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #8b7998;
          font-weight: 800;
        }
        .signature-line {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, #7b1fa2, #e8334a, #c2185b);
          margin: 14px 0 12px;
        }
        .signature-name {
          font-size: 16px;
          font-weight: 800;
          color: #1b1323;
        }
        .signature-caption {
          margin-top: 6px;
          font-size: 11px;
          color: #6d5f77;
        }
        .signature-note {
          margin-top: 14px;
          font-size: 11px;
          color: #6d5f77;
        }
        .footer {
          margin-top: 40px;
          padding-top: 18px;
          border-top: 2px solid #f0d8ea;
          font-size: 11px;
          color: #6d5f77;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="hero">
          <div class="hero-kicker">NovaesWeb • Proposta comercial premium</div>
          <div class="title">${safeTitle}</div>
          <div class="hero-copy">Documento comercial gerado no montador da NovaesWeb, com escopo selecionado, condições financeiras e cláusulas contratuais organizadas para negociação e fechamento.</div>
        </div>
        ${
          summary
            ? `
        <table class="summary-table">
          <tr>
            ${renderInfoCard(summary.contractante)}
            ${renderInfoCard(summary.contratada)}
            ${renderInfoCard(summary.comercial)}
          </tr>
        </table>
        <div class="section-title">Plano e serviços contratados</div>
        ${summary.selectedPlan ? renderServiceCard(summary.selectedPlan, true) : ""}
        ${summary.customScope ? `<div class="scope-box"><strong>Escopo customizado</strong><br />${escapeHtml(summary.customScope)}</div>` : ""}
        ${summary.selectedServices.map((service) => renderServiceCard(service)).join("")}
        ${summary.pricingBreakdown.length ? renderScopeBox("Fechamento financeiro", summary.pricingBreakdown) : ""}
        <div class="section-title">${escapeHtml(summary.scopeNotice.title)}</div>
        ${renderScopeBox(summary.scopeNotice.title, summary.scopeNotice.lines)}
        `
            : ""
        }
        ${
          explanations.length
            ? `
        <div class="section-title">Contrato explicado em linguagem simples</div>
        ${explanations.map((item) => renderExplanationCard(item)).join("")}
        `
            : ""
        }
        <div class="copy">${safeBody}</div>
        ${
          signatureSummary
            ? `
        <div class="signature-section">
          <div class="signature-kicker">Aceite e assinatura</div>
          <div class="signature-date">${escapeHtml(signatureSummary.locationAndDate)}</div>
          <table class="signature-grid">
            <tr>
              <td class="signature-card">
                <div class="signature-role">Contratante</div>
                <div class="signature-line"></div>
                <div class="signature-name">${escapeHtml(signatureSummary.contractanteName)}</div>
                <div class="signature-caption">${escapeHtml(signatureSummary.contractanteCaption)}</div>
              </td>
              <td class="signature-card">
                <div class="signature-role">Contratada</div>
                <div class="signature-line"></div>
                <div class="signature-name">${escapeHtml(signatureSummary.contratadaName)}</div>
                <div class="signature-caption">${escapeHtml(signatureSummary.contratadaCaption)}</div>
              </td>
            </tr>
          </table>
          <div class="signature-note">${escapeHtml(signatureSummary.note)}</div>
        </div>
        `
            : ""
        }
        <div class="footer">NovaesWeb • Estrutura digital premium • Documento gerado no painel administrativo</div>
      </div>
    </body>
  </html>`;
}
