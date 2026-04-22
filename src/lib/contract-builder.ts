import type { Tables } from "@/integrations/supabase/types";
import { PUBLIC_PLAN_CATALOG, type PublicPlanCatalogItem } from "@/lib/public-plans";

export type BuilderPrimaryPlanId = PublicPlanCatalogItem["id"] | "none";
export type BuilderItemGroup = "planos" | "extras";
export type ContractBuilderStepIndex = 0 | 1 | 2 | 3 | 4;
export type ContractStatus =
  | "rascunho"
  | "em_revisao"
  | "aprovado"
  | "enviado"
  | "assinado"
  | "ativo"
  | "cancelado"
  | "encerrado";

export interface ContractBuilderParty {
  nome: string;
  nomeEmpresa?: string;
  documento: string;
  rg?: string;
  email?: string;
  whatsapp?: string;
  telefone?: string;
  dataNascimento?: string;
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
  cidade: string;
  estado: string;
  observacaoRecebimento: string;
}

export interface ContractBuilderItem {
  id: string;
  source: "plan";
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
  clause: string;
  active: boolean;
  order: number;
  setupPrice: number;
  monthlyPrice: number;
}

export interface ContractBuilderPricing {
  baseValue: number;
  extrasTotal: number;
  totalValue: number;
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
  version: "v2";
  clienteId: string;
  lastStep: ContractBuilderStepIndex;
  status: ContractStatus;
  primaryPlanId: BuilderPrimaryPlanId;
  contractNumber: string;
  issueDate: string;
  startDate: string;
  dueDate: string;
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
  customClauses: string;
  pricing: ContractBuilderPricing;
  createdAt: string;
  updatedAt: string;
}

export type AdminContractDraft = ContractBuilderPayload;

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

export const DEFAULT_CONTRACTOR_DATA: ContractBuilderContractor = {
  nome: "NovaesWeb",
  representante: "Lucas Rodrigo Ferreira dos Santos",
  documento: "503.328.838-50",
  endereco: "Estrada da Prainha, 630 - Mato Grande",
  cidade: "Canoas",
  estado: "RS",
  observacaoRecebimento:
    "A NovaesWeb atua com formalização contratual centralizada e mantém registro administrativo interno deste aceite.",
};

export const DEFAULT_SCOPE_EXCLUSIONS =
  "Nao fazem parte do escopo campanhas de trafego pago, gestao de redes sociais, producao de conteudo, novas funcionalidades nao descritas e custos externos de plataformas terceiras.";

export const DEFAULT_COMMERCIAL_NOTES =
  "A contratacao considera apenas o escopo aprovado nesta proposta. Ajustes estruturais, mudancas de escopo e novas entregas podem gerar aditivo ou cobranca complementar.";

export const DEFAULT_PAYMENT_METHOD = "PIX, boleto, cartao ou link de pagamento";

const CONTRACT_SCOPE_NOTICE_TITLE = "Escopo de atuação";

const CONTRACT_SCOPE_NOTICE_LINES = [
  "A NovaesWeb responde pela estrutura digital, pelo documento contratual e pelo fluxo operacional descrito na proposta.",
  "Serviços de marketing, campanhas, produção de conteúdo e metas comerciais dependem de contratação e operação separadas.",
  "Tudo o que não estiver descrito no escopo principal ou nos extras vinculados fica fora da entrega padrão deste contrato.",
];

const LEGACY_SIGNATURE_LINES_REGEX = /\n{0,2}(CONTRATANTE|CONTRATADA):\s*_+\s*(?=\n|$)/gi;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeBuilderGroup(): BuilderItemGroup {
  return "extras";
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function buildContractNumber() {
  return `CTR-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function formatCurrencyBRL(value: number) {
  return `R$ ${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

export function stripLegacySignaturePlaceholders(body: string) {
  return String(body || "")
    .replace(LEGACY_SIGNATURE_LINES_REGEX, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function composeClientAddress(cliente: Partial<Tables<"clientes">> | ContractBuilderParty) {
  const address = cliente.endereco?.trim() || "";
  const number = "numero_endereco" in cliente ? cliente.numero_endereco?.trim() || "" : "";
  const complement = "complemento" in cliente ? cliente.complemento?.trim() || "" : "";
  const district = "bairro" in cliente ? cliente.bairro?.trim() || "" : "";
  const city = cliente.cidade?.trim() || "";
  const state = cliente.estado?.trim() || "";
  const cep = cliente.cep?.trim() || "";

  const firstLine = [address, number].filter(Boolean).join(", ");
  const secondLine = [complement, district].filter(Boolean).join(" - ");
  const thirdLine = [city, state].filter(Boolean).join(" / ");

  return [firstLine, secondLine, thirdLine, cep].filter(Boolean).join(" | ");
}

export function buildContractanteFromClient(cliente: Tables<"clientes">): ContractBuilderParty {
  return {
    nome: cliente.nome || "",
    nomeEmpresa: cliente.nome_empresa || "",
    documento: cliente.documento || "",
    email: cliente.email || "",
    whatsapp: cliente.whatsapp || "",
    telefone: cliente.telefone || "",
    endereco: composeClientAddress(cliente),
    cep: cliente.cep || "",
    cidade: cliente.cidade || "",
    estado: cliente.estado || "",
    rg: "",
    dataNascimento: "",
  };
}

export function buildDefaultExtraClause(extra: {
  name?: string;
  description?: string;
  monthlyPrice?: number;
  setupPrice?: number;
}) {
  const label = extra.name?.trim() || "Extra contratado";
  const detail = extra.description?.trim() || "Entrega complementar vinculada ao contrato principal.";
  const price = extra.monthlyPrice && extra.monthlyPrice > 0
    ? `${formatCurrencyBRL(extra.monthlyPrice)} por mes`
    : `${formatCurrencyBRL(extra.setupPrice || 0)} em valor unico`;

  return `${label}: ${detail} O valor deste extra foi definido em ${price}.`;
}

export function buildContractBuilderItems(_extras: Tables<"extras_catalogo">[] = []): ContractBuilderItem[] {
  return PUBLIC_PLAN_CATALOG.map((plan) => ({
    id: `plan:${plan.id}`,
    source: "plan",
    sourceId: plan.id,
    group: "planos",
    name: plan.title,
    description: plan.description,
    selected: false,
    setupPrice: Number(plan.setupPrice || 0),
    monthlyPrice: Number(plan.monthlyPrice || 0),
    isPrimaryPlan: true,
  }));
}

export function computeBuilderPricing(
  items: ContractBuilderItem[],
  clientExtrasSnapshot: ContractBuilderClientExtraSnapshot[] = [],
  overrides?: Partial<ContractBuilderPricing>,
): ContractBuilderPricing {
  const selectedPlan = items.find((item) => item.isPrimaryPlan && item.selected) || null;
  const baseValue = Number(overrides?.baseValue ?? selectedPlan?.setupPrice ?? 0);
  const extrasTotal = Number(
    overrides?.extrasTotal ??
      clientExtrasSnapshot
        .filter((item) => item.active !== false)
        .reduce((sum, item) => sum + Number(item.setupPrice || 0), 0),
  );
  const totalValue = Number(overrides?.totalValue ?? baseValue + extrasTotal);
  const entryValue = Math.min(Number(overrides?.entryValue ?? 0), totalValue);
  const balanceValue = Math.max(totalValue - entryValue, 0);

  return {
    baseValue,
    extrasTotal,
    totalValue,
    setupSubtotal: baseValue,
    monthlySubtotal: 0,
    negotiatedSetup: baseValue,
    discountType: "fixed",
    discountValue: 0,
    discountAmount: 0,
    finalSetupTotal: totalValue,
    entryValue,
    balanceValue,
    negotiatedMonthly: 0,
    finalMonthlyTotal: 0,
  };
}

export function createEmptyBuilderPayload(
  extras: Tables<"extras_catalogo">[] = [],
): ContractBuilderPayload {
  const now = new Date().toISOString();
  const items = buildContractBuilderItems(extras);
  const issueDate = todayISO();

  return {
    version: "v2",
    clienteId: "",
    lastStep: 4,
    status: "rascunho",
    primaryPlanId: "none",
    contractNumber: buildContractNumber(),
    issueDate,
    startDate: issueDate,
    dueDate: issueDate,
    contractante: {
      nome: "",
      nomeEmpresa: "",
      documento: "",
      rg: "",
      email: "",
      whatsapp: "",
      telefone: "",
      dataNascimento: "",
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
    valorRevisao: "0,00",
    prazoSuporte: "Atendimento em dias úteis durante o horário comercial.",
    observacoesComerciais: DEFAULT_COMMERCIAL_NOTES,
    escopoExclusoes: DEFAULT_SCOPE_EXCLUSIONS,
    customClauses: "",
    pricing: computeBuilderPricing(items),
    createdAt: now,
    updatedAt: now,
  };
}

export function selectPrimaryPlan(items: ContractBuilderItem[], planId: BuilderPrimaryPlanId) {
  return items.map((item) => ({
    ...item,
    selected: item.isPrimaryPlan ? planId !== "none" && item.sourceId === planId : item.selected,
  }));
}

export function getSelectedPrimaryPlanId(items: ContractBuilderItem[]): BuilderPrimaryPlanId {
  return (items.find((item) => item.isPrimaryPlan && item.selected)?.sourceId as BuilderPrimaryPlanId) || "none";
}

export function getContractExtraSnapshots(payload: ContractBuilderPayload) {
  return payload.clientExtrasSnapshot
    .filter((item) => item.active !== false)
    .sort((left, right) => left.order - right.order);
}

function formatContractDate(value?: string | null) {
  if (!value) return "Não definido";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function buildCidadeEstado(payload: ContractBuilderPayload) {
  return [payload.contractante.cidade, payload.contractante.estado].filter(Boolean).join(" / ");
}

export function buildBuilderTemplateValues(payload: ContractBuilderPayload) {
  const extras = getContractExtraSnapshots(payload);

  return {
    nome_cliente: payload.contractante.nome,
    cpf_cliente: payload.contractante.documento,
    rg_cliente: payload.contractante.rg || "",
    telefone_cliente: payload.contractante.telefone || payload.contractante.whatsapp || "",
    email_cliente: payload.contractante.email || "",
    endereco_cliente: payload.contractante.endereco,
    cidade_estado: buildCidadeEstado(payload),
    data_nascimento_cliente: payload.contractante.dataNascimento || "",
    numero_contrato: payload.contractNumber,
    data_emissao: formatContractDate(payload.issueDate),
    data_inicio: formatContractDate(payload.startDate),
    vencimento: formatContractDate(payload.dueDate),
    plano:
      payload.items.find((item) => item.isPrimaryPlan && item.selected)?.name ||
      (payload.customScope.trim() ? "Sob medida" : "Plano não definido"),
    valor_base: formatCurrencyBRL(payload.pricing.baseValue),
    lista_extras:
      extras.length > 0
        ? extras
            .map(
              (extra, index) =>
                `${index + 1}. ${extra.name} - ${extra.description}\nValor: ${formatCurrencyBRL(extra.setupPrice)}\nCláusula: ${extra.clause}`,
            )
            .join("\n\n")
        : "Nenhum extra vinculado a este contrato.",
    valor_extras: formatCurrencyBRL(payload.pricing.extrasTotal),
    valor_total: formatCurrencyBRL(payload.pricing.totalValue),
    observacoes: payload.observacoesComerciais || "Sem observações adicionais.",
    clausulas_adicionais: payload.customClauses || "",
    nome_contratada: payload.contratada.nome,
    documento_contratada: payload.contratada.documento,
    endereco_contratada: `${payload.contratada.endereco}, ${payload.contratada.cidade}/${payload.contratada.estado}`,
  };
}

export function buildProposalSummary(payload: ContractBuilderPayload): ContractProposalSummary {
  const extras = getContractExtraSnapshots(payload);
  const selectedPlan = payload.items.find((item) => item.isPrimaryPlan && item.selected) || null;

  return {
    contractante: {
      eyebrow: "Cliente",
      title: payload.contractante.nome.trim() || "Cliente não definido",
      lines: [
        payload.contractante.nomeEmpresa?.trim() ? `Empresa: ${payload.contractante.nomeEmpresa.trim()}` : null,
        payload.contractante.documento?.trim() ? `Documento: ${payload.contractante.documento.trim()}` : null,
        payload.contractante.rg?.trim() ? `RG: ${payload.contractante.rg.trim()}` : null,
        payload.contractante.telefone?.trim() ? `Telefone: ${payload.contractante.telefone.trim()}` : null,
        payload.contractante.email?.trim() ? `E-mail: ${payload.contractante.email.trim()}` : null,
        payload.contractante.endereco?.trim() ? `Endereço: ${payload.contractante.endereco.trim()}` : null,
      ].filter(Boolean) as string[],
    },
    contratada: {
      eyebrow: "Contratada",
      title: payload.contratada.nome.trim() || "NovaesWeb",
      lines: [
        `Representante: ${payload.contratada.representante}`,
        `Documento: ${payload.contratada.documento}`,
        `Endereço: ${payload.contratada.endereco}, ${payload.contratada.cidade}/${payload.contratada.estado}`,
      ],
    },
    comercial: {
      eyebrow: "Condições",
      title: "Resumo comercial",
      lines: [
        `Número do contrato: ${payload.contractNumber}`,
        `Emissão: ${formatContractDate(payload.issueDate)} | Início: ${formatContractDate(payload.startDate)}`,
        `Plano: ${selectedPlan?.name || "Não definido"}`,
        `Status: ${payload.status.replace(/_/g, " ")}`,
      ],
    },
    pricingBreakdown: [
      `Valor base: ${formatCurrencyBRL(payload.pricing.baseValue)}`,
      `Extras: ${formatCurrencyBRL(payload.pricing.extrasTotal)}`,
      `Total do contrato: ${formatCurrencyBRL(payload.pricing.totalValue)}`,
    ],
    scopeNotice: {
      eyebrow: "Escopo",
      title: CONTRACT_SCOPE_NOTICE_TITLE,
      lines: CONTRACT_SCOPE_NOTICE_LINES,
    },
    selectedPlan: selectedPlan
      ? {
          name: selectedPlan.name,
          description: selectedPlan.description,
          pricing: formatCurrencyBRL(payload.pricing.baseValue),
          highlight: "Plano base",
        }
      : null,
    selectedServices: extras.map((item) => ({
      name: item.name,
      description: item.clause,
      pricing: formatCurrencyBRL(item.setupPrice),
      highlight: "Extra vinculado",
    })),
    customScope: payload.customScope.trim(),
  };
}

export function buildContractSignatureSummary(
  payload?: ContractBuilderPayload | null,
  options?: ContractSignatureOptions,
): ContractSignatureSummary | null {
  if (!payload) return null;

  const signatureDate = options?.signedAt ? new Date(options.signedAt) : new Date();

  return {
    locationAndDate: `Canoas/RS, ${signatureDate.toLocaleDateString("pt-BR")}`,
    contractanteName:
      options?.contractanteSignedName?.trim() || payload.contractante.nome.trim() || "Contratante",
    contractanteCaption: options?.signedAt
      ? "Aceite eletrônico registrado no portal do cliente"
      : "Responsável pelo contratante",
    contratadaName: payload.contratada.nome.trim() || "NovaesWeb",
    contratadaCaption: payload.contratada.representante?.trim()
      ? `Representada por ${payload.contratada.representante.trim()}`
      : "Parte contratada",
    note: options?.signedAt
      ? "A assinatura eletrônica registra o nome informado pelo cliente e a data do aceite."
      : "Estrutura visual preparada para assinatura, impressão e PDF.",
  };
}

export function buildContractClauseExplanations(payload: ContractBuilderPayload): ContractClauseExplanation[] {
  const extras = getContractExtraSnapshots(payload);
  const extrasLabel = extras.length > 0
    ? `Foram vinculados ${extras.length} extra(s) ao plano principal, todos renderizados automaticamente no documento.`
    : "Nenhum extra foi vinculado a este contrato até o momento.";

  return [
    {
      number: "1",
      title: "Objeto do contrato",
      explanation:
        "Este contrato formaliza a entrega principal da NovaesWeb e o conjunto de soluções digitais aprovadas para o cliente.",
    },
    {
      number: "2",
      title: "Dados automáticos do cliente",
      explanation:
        "Os dados do cliente são puxados do cadastro ativo e podem receber complementos pontuais, como RG e data de nascimento, antes do envio final.",
    },
    {
      number: "3",
      title: "Plano e composição comercial",
      explanation: `O valor base do contrato foi configurado em ${formatCurrencyBRL(
        payload.pricing.baseValue,
      )}, servindo como referência principal da proposta.`,
    },
    {
      number: "4",
      title: "Extras vinculados",
      explanation: extrasLabel,
    },
    {
      number: "5",
      title: "Cálculo automático",
      explanation: `O total do contrato é calculado automaticamente pela fórmula valor base + soma dos extras, resultando em ${formatCurrencyBRL(
        payload.pricing.totalValue,
      )}.`,
    },
    {
      number: "6",
      title: "Escopo e observações",
      explanation:
        payload.observacoesComerciais.trim() ||
        "As observações comerciais ficam registradas no contrato e acompanham o PDF, a impressão e a experiência do portal do cliente.",
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
  const signatureSummary = buildContractSignatureSummary(proposal, signatureOptions);

  const renderLines = (lines: string[]) =>
    lines.map((line) => `<div class="line">${escapeHtml(line)}</div>`).join("");

  const renderInfoCard = (title: string, lines: string[]) => `
    <div class="info-card">
      <div class="info-title">${escapeHtml(title)}</div>
      <div class="info-lines">${renderLines(lines)}</div>
    </div>
  `;

  const renderExtraCards = summary?.selectedServices.length
    ? summary.selectedServices
        .map(
          (service) => `
            <div class="service-card">
              <div class="service-name">${escapeHtml(service.name)}</div>
              <div class="service-pricing">${escapeHtml(service.pricing)}</div>
              <div class="service-copy">${escapeHtml(service.description)}</div>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-card">Nenhum extra vinculado ao contrato.</div>`;

  const signatureHtml = signatureSummary
    ? `
      <div class="signature-panel">
        <div class="signature-kicker">Aceite e assinatura</div>
        <div class="signature-date">${escapeHtml(signatureSummary.locationAndDate)}</div>
        <div class="signature-grid">
          <div class="signature-card">
            <div class="signature-line"></div>
            <div class="signature-name">${escapeHtml(signatureSummary.contractanteName)}</div>
            <div class="signature-caption">${escapeHtml(signatureSummary.contractanteCaption)}</div>
          </div>
          <div class="signature-card">
            <div class="signature-line"></div>
            <div class="signature-name">${escapeHtml(signatureSummary.contratadaName)}</div>
            <div class="signature-caption">${escapeHtml(signatureSummary.contratadaCaption)}</div>
          </div>
        </div>
        <div class="signature-note">${escapeHtml(signatureSummary.note)}</div>
      </div>
    `
    : "";

  return `<!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>${safeTitle}</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          background: #f7f1fb;
          color: #1d1324;
          margin: 0;
          padding: 0;
        }
        .sheet {
          padding: 34px;
        }
        .hero {
          background: linear-gradient(135deg, #1e0a2c 0%, #6d28d9 48%, #e11d48 100%);
          color: white;
          padding: 28px;
          border-radius: 26px;
          box-shadow: 0 20px 40px rgba(29, 19, 36, 0.18);
        }
        .hero-kicker {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          opacity: 0.72;
          font-weight: 700;
        }
        .hero-title {
          font-size: 30px;
          font-weight: 800;
          margin-top: 10px;
        }
        .hero-copy {
          margin-top: 12px;
          line-height: 1.7;
          color: rgba(255,255,255,0.84);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 22px;
        }
        .info-card,
        .service-card,
        .empty-card {
          background: white;
          border: 1px solid #eadff5;
          border-radius: 20px;
          padding: 18px;
        }
        .info-title,
        .service-name {
          font-size: 16px;
          font-weight: 700;
          color: #241631;
        }
        .info-lines,
        .service-copy {
          margin-top: 10px;
          font-size: 12px;
          line-height: 1.7;
          color: #5c4d68;
        }
        .service-pricing {
          margin-top: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #7c3aed;
        }
        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #8d3cb0;
          font-weight: 800;
          margin: 30px 0 12px;
        }
        .body-card {
          background: white;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #eadff5;
          line-height: 1.8;
          font-size: 13px;
          white-space: normal;
        }
        .signature-panel {
          margin-top: 28px;
          border: 1px solid #eadff5;
          border-radius: 24px;
          background: white;
          padding: 24px;
          text-align: center;
        }
        .signature-kicker {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #8d3cb0;
          font-weight: 800;
        }
        .signature-date {
          margin-top: 8px;
          color: #6d5f77;
          font-size: 13px;
        }
        .signature-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 20px;
        }
        .signature-card {
          border: 1px solid #eadff5;
          border-radius: 18px;
          padding: 18px;
          background: #fff;
        }
        .signature-line {
          height: 1px;
          background: linear-gradient(90deg, rgba(124,58,237,0.35), rgba(225,29,72,0.75), rgba(124,58,237,0.35));
          margin-bottom: 16px;
        }
        .signature-name {
          font-weight: 700;
        }
        .signature-caption,
        .signature-note {
          font-size: 12px;
          color: #6d5f77;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="hero">
          <div class="hero-kicker">NovaesWeb • Contrato dinâmico</div>
          <div class="hero-title">${safeTitle}</div>
          <div class="hero-copy">
            Documento comercial renderizado com dados automáticos do cliente, extras vinculados e total calculado em tempo real.
          </div>
        </div>

        ${
          summary
            ? `
          <div class="section-title">Resumo executivo</div>
          <div class="grid">
            ${renderInfoCard(summary.contractante.title, summary.contractante.lines)}
            ${renderInfoCard(summary.contratada.title, summary.contratada.lines)}
            ${renderInfoCard(summary.comercial.title, summary.comercial.lines)}
            ${renderInfoCard("Fechamento financeiro", summary.pricingBreakdown)}
          </div>
          <div class="section-title">Extras vinculados</div>
          <div class="grid">${renderExtraCards}</div>
        `
            : ""
        }

        <div class="section-title">Documento final</div>
        <div class="body-card">${safeBody}</div>
        ${signatureHtml}
      </div>
    </body>
  </html>`;
}
