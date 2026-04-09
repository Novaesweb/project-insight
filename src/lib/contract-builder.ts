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

export interface ContractBuilderPricing {
  setupSubtotal: number;
  monthlySubtotal: number;
  negotiatedSetup: number;
  entryValue: number;
  balanceValue: number;
  negotiatedMonthly: number;
}

export interface ContractBuilderPayload {
  clienteId: string;
  lastStep: ContractBuilderStepIndex;
  primaryPlanId: BuilderPrimaryPlanId;
  contractante: ContractBuilderParty;
  contratada: ContractBuilderContractor;
  items: ContractBuilderItem[];
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

const grupoLabels: Record<BuilderItemGroup, string> = {
  planos: "PLANOS PRINCIPAIS",
  fixo: "EXTRAS ÚNICOS",
  intermediario: "EXTRAS PRO",
  mensal: "EXTRAS MENSAIS",
};

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
  "Não estão inclusos serviços, licenças, integrações, campanhas pagas, textos, fotos, artes, hospedagem, domínio ou novas funcionalidades não descritas na proposta aprovada.";

export const DEFAULT_COMMERCIAL_NOTES =
  "Serviços recorrentes, extras, integrações, mídia paga, domínio, hospedagem e demandas fora do escopo poderão ser contratados e cobrados à parte mediante aprovação do contratante.";

export const DEFAULT_PAYMENT_METHOD =
  "PIX, boleto, cartão ou link de pagamento";

export function createEmptyBuilderPayload(
  extras: Tables<"extras_catalogo">[],
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
  extras: Tables<"extras_catalogo">[],
): ContractBuilderItem[] {
  const planItems: ContractBuilderItem[] = PUBLIC_PLAN_CATALOG.map((plan) => ({
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

  const extraItems: ContractBuilderItem[] = extras.map((extra) => ({
    id: `extra:${extra.id}`,
    source: "extra",
    sourceId: extra.id,
    group: normalizeBuilderGroup(extra.categoria),
    name: extra.nome,
    description: extra.descricao || "",
    selected: false,
    setupPrice: Number(extra.preco_ativacao || 0),
    monthlyPrice: Number(extra.preco_mensal || 0),
    isPrimaryPlan: false,
  }));

  return [...planItems, ...extraItems];
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
  overrides?: Partial<ContractBuilderPricing>,
): ContractBuilderPricing {
  const setupSubtotal = items
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.setupPrice, 0);

  const monthlySubtotal = items
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.monthlyPrice, 0);

  const negotiatedSetup =
    overrides?.negotiatedSetup ?? setupSubtotal;
  const entryValue = overrides?.entryValue ?? 0;
  const balanceValue = overrides?.balanceValue ?? Math.max(negotiatedSetup - entryValue, 0);
  const negotiatedMonthly =
    overrides?.negotiatedMonthly ?? monthlySubtotal;

  return {
    setupSubtotal,
    monthlySubtotal,
    negotiatedSetup,
    entryValue,
    balanceValue,
    negotiatedMonthly,
  };
}

export function getSelectedPrimaryPlanId(items: ContractBuilderItem[]): BuilderPrimaryPlanId {
  const selectedPlan = items.find((item) => item.isPrimaryPlan && item.selected);
  return (selectedPlan?.sourceId as BuilderPrimaryPlanId) || "none";
}

export function buildContractedServicesSummary(
  items: ContractBuilderItem[],
  primaryPlanId: BuilderPrimaryPlanId,
  customScope: string,
) {
  const selectedItems = items.filter((item) => item.selected);

  if (primaryPlanId === "sob-medida" && customScope.trim()) {
    const selectedExtras = selectedItems
      .filter((item) => !item.isPrimaryPlan)
      .map((item) => item.name);

    return [customScope.trim(), selectedExtras.length ? `Itens adicionais contratados: ${selectedExtras.join(", ")}` : null]
      .filter(Boolean)
      .join(" | ");
  }

  const selectedNames = selectedItems.map((item) => item.name);

  return selectedNames.join(", ");
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

export function buildServicesTableText(
  items: ContractBuilderItem[],
  primaryPlanId: BuilderPrimaryPlanId,
  customScope: string,
  pricing: ContractBuilderPricing,
) {
  const selectedPlan = items.find((item) => item.isPrimaryPlan && item.selected);
  const selectedExtras = items.filter((item) => !item.isPrimaryPlan && item.selected);
  const lines = ["RESUMO COMERCIAL DA PROPOSTA:", ""];

  if (selectedPlan) {
    lines.push("PLANO CONTRATADO:");
    lines.push(`• ${selectedPlan.name} — ${describeBuilderItemPricing(selectedPlan)}`);
    lines.push("");
  }

  if (primaryPlanId === "sob-medida" && customScope.trim()) {
    lines.push("ESCOPO CUSTOMIZADO:");
    lines.push(customScope.trim());
    lines.push("");
  }

  if (selectedExtras.length) {
    lines.push("SERVIÇOS E EXTRAS CONTRATADOS:");
    selectedExtras.forEach((item) => {
      lines.push(`• ${item.name} — ${describeBuilderItemPricing(item)}`);
    });
    lines.push("");
  }

  lines.push("CONDIÇÕES COMERCIAIS:");
  lines.push(`• Ativação total: ${formatCurrencyBRL(pricing.negotiatedSetup)}`);
  lines.push(`• Entrada / sinal: ${formatCurrencyBRL(pricing.entryValue)}`);
  lines.push(`• Saldo na entrega: ${formatCurrencyBRL(pricing.balanceValue)}`);
  lines.push(`• Mensalidade contratada: ${formatCurrencyBRL(pricing.negotiatedMonthly)}`);

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
    lista_servicos: buildContractedServicesSummary(
      payload.items,
      payload.primaryPlanId,
      payload.customScope,
    ),
    tabela_servicos: buildServicesTableText(
      payload.items,
      payload.primaryPlanId,
      payload.customScope,
      payload.pricing,
    ),
    escopo_exclusoes: payload.escopoExclusoes,
    prazo_dias: payload.prazoDias,
    valor_entrada: payload.pricing.entryValue.toFixed(2).replace(".", ","),
    valor_saldo: payload.pricing.balanceValue.toFixed(2).replace(".", ","),
    valor_mensal: payload.pricing.negotiatedMonthly.toFixed(2).replace(".", ","),
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
  const selectedPlan = payload.items.find((item) => item.isPrimaryPlan && item.selected) || null;
  const selectedServices = payload.items
    .filter((item) => item.selected && !item.isPrimaryPlan)
    .map((item) => ({
      name: item.name,
      description: item.description,
      pricing: describeBuilderItemPricing(item),
      highlight: grupoLabels[item.group],
    }));

  const contractanteLines = [
    payload.contractante.nomeEmpresa?.trim() ? `Empresa: ${payload.contractante.nomeEmpresa.trim()}` : null,
    payload.contractante.documento?.trim() ? `Documento: ${payload.contractante.documento.trim()}` : null,
    payload.contractante.email?.trim() ? `E-mail: ${payload.contractante.email.trim()}` : null,
    payload.contractante.whatsapp?.trim() ? `WhatsApp: ${payload.contractante.whatsapp.trim()}` : null,
    payload.contractante.telefone?.trim() ? `Telefone: ${payload.contractante.telefone.trim()}` : null,
    payload.contractante.endereco?.trim() ? `Endereço: ${payload.contractante.endereco.trim()}` : null,
  ].filter(Boolean) as string[];

  const contratadaLines = [
    `Representante: ${payload.contratada.representante}`,
    `Documento: ${payload.contratada.documento}`,
    `Endereço: ${payload.contratada.endereco}`,
    payload.contratada.observacaoRecebimento.trim(),
  ].filter(Boolean);

  const comercialLines = [
    `Ativação total: ${formatCurrencyBRL(payload.pricing.negotiatedSetup)}`,
    `Entrada / sinal: ${formatCurrencyBRL(payload.pricing.entryValue)}`,
    `Saldo na entrega: ${formatCurrencyBRL(payload.pricing.balanceValue)}`,
    `Mensalidade contratada: ${formatCurrencyBRL(payload.pricing.negotiatedMonthly)}`,
    `Prazo estimado: ${payload.prazoDias} dias úteis`,
    `Pagamento: ${payload.formaPagamento}`,
  ];

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
  const selectedPlan =
    payload.items.find((item) => item.isPrimaryPlan && item.selected)?.name || "sem plano principal";
  const selectedExtras = payload.items.filter((item) => item.selected && !item.isPrimaryPlan);
  const selectedExtrasLabel = selectedExtras.length
    ? `${selectedExtras.length} extra(s) adicional(is)`
    : "nenhum extra adicional";
  const customScopeText =
    payload.primaryPlanId === "sob-medida" && payload.customScope.trim()
      ? ` O escopo customizado desta proposta é: ${payload.customScope.trim()}.`
      : "";
  const reviewPrice =
    payload.valorRevisao?.trim() ? ` por pelo menos R$ ${payload.valorRevisao.trim()}` : "";

  return [
    {
      number: "Partes",
      title: "Quem está assinando",
      explanation: `Este contrato é entre ${payload.contractante.nome || "o cliente"} e ${
        payload.contratada.nome || "a NovaesWeb"
      }. Ele identifica quem contrata, quem presta o serviço e quais dados básicos valem para esta proposta.`,
    },
    {
      number: "1",
      title: "Objeto do contrato",
      explanation: `A proposta cobre a estrutura digital contratada dentro do ecossistema NovaesWeb. Nesta venda, o plano principal é ${selectedPlan} e foram incluídos ${selectedExtrasLabel}.${customScopeText}`,
    },
    {
      number: "2",
      title: "Escopo e exclusões",
      explanation:
        "Tudo o que está descrito no resumo comercial faz parte da entrega. O que estiver fora do escopo, nas exclusões ou não estiver aprovado na proposta pode ser tratado como adicional e cobrado à parte.",
    },
    {
      number: "3",
      title: "Materiais e briefing",
      explanation:
        "O cliente precisa enviar logo, textos, fotos, acessos e demais materiais necessários. Se isso atrasar, o prazo do projeto também pode atrasar, porque a produção depende dessas informações.",
    },
    {
      number: "4",
      title: "Prazo e execução",
      explanation: `O prazo estimado desta proposta é de ${payload.prazoDias} dias úteis. Esse prazo começa de verdade quando briefing, materiais e pagamento inicial estiverem em ordem.`,
    },
    {
      number: "5",
      title: "Valores e pagamento",
      explanation: `A implantação negociada ficou em ${formatCurrencyBRL(
        payload.pricing.negotiatedSetup,
      )}, com entrada de ${formatCurrencyBRL(
        payload.pricing.entryValue,
      )} e saldo de ${formatCurrencyBRL(payload.pricing.balanceValue)}. A mensalidade contratada ficou em ${formatCurrencyBRL(
        payload.pricing.negotiatedMonthly,
      )}. A forma de pagamento combinada é ${payload.formaPagamento}.`,
    },
    {
      number: "6",
      title: "Inadimplência",
      explanation:
        "Se houver atraso no pagamento, a NovaesWeb pode suspender atendimento, manutenção, automações, publicações ou entregas até a regularização. Se o projeto ainda estiver em andamento, ele também pode ser congelado até quitar o valor pendente.",
    },
    {
      number: "7",
      title: "Revisões e mudanças",
      explanation: `Esta proposta inclui ${payload.numeroRevisoes} rodada(s) de revisão dentro do que foi aprovado. Alterações fora do escopo ou novas demandas podem ser cobradas${reviewPrice}.`,
    },
    {
      number: "8",
      title: "Propriedade intelectual",
      explanation:
        "Enquanto o contrato não estiver quitado por completo, a estrutura, os arquivos, o painel, as páginas, o código e os demais ativos continuam sob titularidade da NovaesWeb. A liberação final acontece após pagamento integral.",
    },
    {
      number: "9",
      title: "Marketing e automações",
      explanation:
        "Quando houver marketing, atendimento automatizado ou processos comerciais, a NovaesWeb executa com base técnica e estratégica, mas não promete resultado absoluto de vendas, leads ou faturamento porque isso depende de fatores externos e da operação do cliente.",
    },
    {
      number: "10",
      title: "Suporte e recorrência",
      explanation: `Suporte, manutenção e operação contínua só valem se estiverem contratados. Nesta proposta, a referência de atendimento ficou definida como: ${payload.prazoSuporte}.`,
    },
    {
      number: "11",
      title: "Rescisão",
      explanation:
        "O cliente pode cancelar mesmo depois do início do projeto, mas o valor inicial já pago para ativar e começar a estrutura não é devolvido. Se houver cancelamento, o site, painel, sistema ou automação continua ativo somente até o período já pago; depois disso, a NovaesWeb pode encerrar a estrutura automaticamente.",
    },
    {
      number: "12",
      title: "Sigilo e dados",
      explanation:
        "As informações trocadas para execução do projeto devem ser tratadas com sigilo. Os dados enviados pelo cliente serão usados para executar o serviço, dar suporte e cuidar da operação comercial e financeira do contrato.",
    },
    {
      number: "13",
      title: "Observações comerciais",
      explanation:
        payload.observacoesComerciais.trim() ||
        "Qualquer observação comercial adicional da proposta passa a fazer parte deste contrato e vale como complemento das condições combinadas.",
    },
    {
      number: "14",
      title: "Foro",
      explanation:
        "Se surgir discussão jurídica que não seja resolvida entre as partes, o foro escolhido para tratar disso é Canoas/RS.",
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
          padding: 22px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(123,31,162,0.12), rgba(232,51,74,0.08), rgba(194,24,91,0.14));
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
          background: rgba(255,255,255,0.82);
          border: 1px solid #ecdff4;
          border-radius: 18px;
          padding: 18px 16px 16px;
          vertical-align: top;
        }
        .signature-line {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, #7b1fa2, #e8334a, #c2185b);
          margin: 24px 0 10px;
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
                <div class="signature-line"></div>
                <div class="signature-name">${escapeHtml(signatureSummary.contractanteName)}</div>
                <div class="signature-caption">${escapeHtml(signatureSummary.contractanteCaption)}</div>
              </td>
              <td class="signature-card">
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
