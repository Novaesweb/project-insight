export const CLAUSE_LIBRARY_STORAGE_KEY = "nw_clausulas";

export type ClauseCategory =
  | "objeto"
  | "pagamento"
  | "cancelamento"
  | "entrega"
  | "revisao"
  | "propriedade"
  | "sigilo"
  | "suporte"
  | "geral";

export interface ClauseCategoryMeta {
  id: ClauseCategory;
  label: string;
  color: string;
  icon: string;
}

export interface ClauseLibraryItem {
  id: string;
  title: string;
  text: string;
  category: ClauseCategory;
  required: boolean;
  origin: "seed" | "custom";
  createdAt: string;
  updatedAt: string;
}

export interface ContractClauseSelectionItem {
  clauseId: string;
  title: string;
  text: string;
  category: ClauseCategory;
  required: boolean;
  order: number;
}

export interface ContractClauseSelection {
  items: ContractClauseSelectionItem[];
  updatedAt: string | null;
}

export type ClauseVariableMap = Record<string, string>;

export interface ClauseVariablePayloadSource {
  contractante: {
    nome: string;
    nomeEmpresa?: string;
    telefone?: string;
    whatsapp?: string;
  };
  contratada: {
    nome: string;
    representante: string;
  };
  pricing: {
    baseValue: number;
    finalMonthlyTotal?: number;
  };
  issueDate: string;
  startDate: string;
  dueDate: string;
  prazoDias: string;
  numeroRevisoes: string;
}

export const CLAUSE_CATEGORIES: ClauseCategoryMeta[] = [
  { id: "objeto", label: "Objeto", color: "#7C3AED", icon: "FileText" },
  { id: "pagamento", label: "Pagamento", color: "#10B981", icon: "Wallet" },
  { id: "cancelamento", label: "Cancelamento", color: "#DC2626", icon: "XCircle" },
  { id: "entrega", label: "Entrega", color: "#F59E0B", icon: "Rocket" },
  { id: "revisao", label: "Revisoes", color: "#38BDF8", icon: "PenSquare" },
  { id: "propriedade", label: "Propriedade Intelectual", color: "#C026D3", icon: "BadgeCheck" },
  { id: "sigilo", label: "Sigilo", color: "#6366F1", icon: "Shield" },
  { id: "suporte", label: "Suporte", color: "#F97316", icon: "LifeBuoy" },
  { id: "geral", label: "Geral", color: "#9B89B8", icon: "ScrollText" },
];

export const CLAUSE_VARIABLE_TOKENS = [
  "{{NOME_CLIENTE}}",
  "{{EMPRESA_CLIENTE}}",
  "{{VALOR_ATIVACAO}}",
  "{{MENSALIDADE}}",
  "{{PRAZO_ENTREGA}}",
  "{{DIA_VENCIMENTO}}",
  "{{DATA_INICIO}}",
  "{{DATA_TERMINO}}",
  "{{DURACAO}}",
  "{{NUM_REVISOES}}",
  "{{CONTRATADA}}",
  "{{REPRESENTANTE}}",
] as const;

function nowIso() {
  return new Date().toISOString();
}

function createSeedClause(
  id: string,
  title: string,
  category: ClauseCategory,
  required: boolean,
  text: string,
): ClauseLibraryItem {
  const timestamp = nowIso();
  return {
    id,
    title,
    text,
    category,
    required,
    origin: "seed",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const CLAUSE_LIBRARY_SEED: ClauseLibraryItem[] = [
  createSeedClause(
    "clause-seed-objeto",
    "DO OBJETO",
    "objeto",
    true,
    "O presente instrumento tem por objeto a prestacao de servicos de desenvolvimento digital pela CONTRATADA ({{CONTRATADA}}) a CONTRATANTE ({{NOME_CLIENTE}} — {{EMPRESA_CLIENTE}}), compreendendo criacao, configuracao e entrega das solucoes descritas na proposta comercial aceita.",
  ),
  createSeedClause(
    "clause-seed-pagamento",
    "DO PAGAMENTO E ATIVACAO",
    "pagamento",
    true,
    "O valor de ativacao de {{VALOR_ATIVACAO}} e devido no ato da assinatura e nao e reembolsavel. A mensalidade de {{MENSALIDADE}} vence todo {{DIA_VENCIMENTO}}. Atrasos sujeitam a multa de 2% mais juros de 1% ao mes. Apos 15 dias de inadimplencia os servicos poderao ser suspensos sem aviso previo.",
  ),
  createSeedClause(
    "clause-seed-entrega",
    "DO PRAZO DE ENTREGA",
    "entrega",
    true,
    "O prazo de {{PRAZO_ENTREGA}} inicia-se em {{DATA_INICIO}}, condicionado ao recebimento integral de materiais e aprovacoes do CONTRATANTE. Atrasos por omissao do CONTRATANTE implicam reprogramacao automatica do cronograma.",
  ),
  createSeedClause(
    "clause-seed-revisoes",
    "DAS REVISOES",
    "revisao",
    false,
    "O escopo inclui {{NUM_REVISOES}}, entendidas como ajustes dentro do escopo original aprovado, consolidadas em uma unica solicitacao formal por rodada. Alteracoes de escopo serao orcadas separadamente.",
  ),
  createSeedClause(
    "clause-seed-vigencia",
    "DA VIGENCIA E RENOVACAO",
    "geral",
    true,
    "Vigencia de {{DURACAO}}, de {{DATA_INICIO}} a {{DATA_TERMINO}}. Renova-se automaticamente por igual prazo salvo aviso contrario por escrito com 30 dias de antecedencia.",
  ),
  createSeedClause(
    "clause-seed-cancelamento",
    "DO CANCELAMENTO",
    "cancelamento",
    true,
    "Cancelamento deve ser formalizado por escrito com 30 dias de antecedencia. O valor de ativacao ({{VALOR_ATIVACAO}}) nao e reembolsavel. Cancelamento antes do termino sujeita ao pagamento de 30% do valor restante como clausula penal.",
  ),
  createSeedClause(
    "clause-seed-obrigacoes-contratante",
    "DAS OBRIGACOES DO CONTRATANTE",
    "geral",
    false,
    "O CONTRATANTE compromete-se a fornecer materiais em ate 5 dias uteis apos solicitacao, designar responsavel unico para aprovacoes e efetuar pagamentos nas datas acordadas. O descumprimento suspende automaticamente os prazos da CONTRATADA.",
  ),
  createSeedClause(
    "clause-seed-obrigacoes-contratada",
    "DAS OBRIGACOES DA CONTRATADA",
    "geral",
    false,
    "A CONTRATADA compromete-se a entregar nos prazos acordados, manter equipe qualificada, comunicar imprevistos com 48h de antecedencia e corrigir erros de execucao sem custo em ate 30 dias apos a entrega.",
  ),
  createSeedClause(
    "clause-seed-propriedade",
    "DA PROPRIEDADE INTELECTUAL",
    "propriedade",
    false,
    "Os direitos patrimoniais sao transferidos ao CONTRATANTE somente apos quitacao integral. Ate esse momento permanecem com a CONTRATADA ({{CONTRATADA}}). Componentes open source permanecem sob suas respectivas licencas.",
  ),
  createSeedClause(
    "clause-seed-sigilo",
    "DO SIGILO",
    "sigilo",
    false,
    "Ambas as partes mantem sigilo sobre informacoes confidenciais pelo prazo de 2 anos apos o encerramento. A violacao sujeita a parte infratora a indenizacao por perdas e danos.",
  ),
  createSeedClause(
    "clause-seed-suporte",
    "DO SUPORTE TECNICO",
    "suporte",
    false,
    "A mensalidade de {{MENSALIDADE}} cobre suporte para manutencao do desenvolvido. Novos desenvolvimentos serao orcados separadamente. Atendimento em dias uteis das 9h as 18h com retorno em ate 24 horas.",
  ),
  createSeedClause(
    "clause-seed-foro",
    "DO FORO",
    "geral",
    true,
    "As partes elegem o foro da comarca de Canoas/RS para dirimir quaisquer controversias, com renuncia a qualquer outro por mais privilegiado que seja.",
  ),
];

function sanitizeClauseText(value: unknown, { multiline = false, maxLength = 4000 } = {}) {
  let text = String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim();

  if (!multiline) {
    text = text.replace(/\s+/g, " ");
  } else {
    text = text
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
  }

  return text.slice(0, maxLength);
}

function sanitizeCategory(value: unknown): ClauseCategory {
  return CLAUSE_CATEGORIES.find((item) => item.id === value)?.id ?? "geral";
}

function normalizeClauseLibraryItem(input: unknown, fallback?: ClauseLibraryItem): ClauseLibraryItem | null {
  if (!input || typeof input !== "object") return fallback ?? null;

  const raw = input as Record<string, unknown>;
  const timestamp = nowIso();
  const title = sanitizeClauseText(raw.title, { maxLength: 120 }) || fallback?.title || "";
  const text = sanitizeClauseText(raw.text, { maxLength: 6000, multiline: true }) || fallback?.text || "";

  if (!title || !text) return fallback ?? null;

  return {
    id: sanitizeClauseText(raw.id, { maxLength: 120 }) || fallback?.id || `clause-${Date.now()}`,
    title,
    text,
    category: sanitizeCategory(raw.category ?? fallback?.category),
    required: typeof raw.required === "boolean" ? raw.required : fallback?.required ?? false,
    origin: raw.origin === "custom" ? "custom" : fallback?.origin === "custom" ? "custom" : "seed",
    createdAt: sanitizeClauseText(raw.createdAt, { maxLength: 40 }) || fallback?.createdAt || timestamp,
    updatedAt: sanitizeClauseText(raw.updatedAt, { maxLength: 40 }) || timestamp,
  };
}

export function normalizeClauseLibrary(input: unknown): ClauseLibraryItem[] {
  if (!Array.isArray(input)) {
    return CLAUSE_LIBRARY_SEED.map((item) => ({ ...item }));
  }

  const fallbackMap = new Map(CLAUSE_LIBRARY_SEED.map((item) => [item.id, item]));
  const normalized = input
    .map((item) => normalizeClauseLibraryItem(item, fallbackMap.get(String((item as { id?: string })?.id || ""))))
    .filter(Boolean) as ClauseLibraryItem[];

  if (normalized.length === 0) {
    return CLAUSE_LIBRARY_SEED.map((item) => ({ ...item }));
  }

  return normalized.sort((left, right) => left.title.localeCompare(right.title, "pt-BR"));
}

export function loadClauseLibrary() {
  if (typeof window === "undefined") {
    return CLAUSE_LIBRARY_SEED.map((item) => ({ ...item }));
  }

  try {
    const raw = window.localStorage.getItem(CLAUSE_LIBRARY_STORAGE_KEY);
    return normalizeClauseLibrary(raw ? JSON.parse(raw) : null);
  } catch {
    return CLAUSE_LIBRARY_SEED.map((item) => ({ ...item }));
  }
}

export function saveClauseLibrary(items: ClauseLibraryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLAUSE_LIBRARY_STORAGE_KEY, JSON.stringify(normalizeClauseLibrary(items)));
}

export function getClauseCategoryMeta(category: ClauseCategory) {
  return CLAUSE_CATEGORIES.find((item) => item.id === category) || CLAUSE_CATEGORIES[CLAUSE_CATEGORIES.length - 1];
}

export function createClauseLibraryItem(input: {
  id?: string;
  title: string;
  text: string;
  category: ClauseCategory;
  required: boolean;
  origin?: "seed" | "custom";
}) {
  const timestamp = nowIso();
  return normalizeClauseLibraryItem(
    {
      id: input.id || `clause-${Date.now()}`,
      title: input.title,
      text: input.text,
      category: input.category,
      required: input.required,
      origin: input.origin || "custom",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    undefined,
  ) as ClauseLibraryItem;
}

export function createSelectionItemFromClause(
  item: ClauseLibraryItem,
  order: number,
): ContractClauseSelectionItem {
  return {
    clauseId: item.id,
    title: item.title,
    text: item.text,
    category: item.category,
    required: item.required,
    order,
  };
}

export function createDefaultContractClauseSelection(library: ClauseLibraryItem[]): ContractClauseSelection {
  const items = library
    .filter((item) => item.required)
    .map((item, index) => createSelectionItemFromClause(item, index));

  return {
    items,
    updatedAt: items.length > 0 ? nowIso() : null,
  };
}

export function normalizeContractClauseSelection(input: unknown): ContractClauseSelection {
  if (!input || typeof input !== "object") {
    return { items: [], updatedAt: null };
  }

  const raw = input as Record<string, unknown>;
  const items = Array.isArray(raw.items)
    ? raw.items
        .map((item, index) => {
          if (!item || typeof item !== "object") return null;
          const current = item as Record<string, unknown>;
          const title = sanitizeClauseText(current.title, { maxLength: 120 });
          const text = sanitizeClauseText(current.text, { maxLength: 6000, multiline: true });
          if (!title || !text) return null;
          return {
            clauseId: sanitizeClauseText(current.clauseId ?? current.id, { maxLength: 120 }) || `legacy-${index}`,
            title,
            text,
            category: sanitizeCategory(current.category),
            required: Boolean(current.required),
            order: Number.isFinite(Number(current.order)) ? Number(current.order) : index,
          } satisfies ContractClauseSelectionItem;
        })
        .filter(Boolean)
        .sort((left, right) => left.order - right.order)
    : [];

  return {
    items,
    updatedAt: sanitizeClauseText(raw.updatedAt, { maxLength: 40 }) || null,
  };
}

export function mergeClauseSelectionWithLibrary(
  selection: ContractClauseSelection,
  library: ClauseLibraryItem[],
) {
  const libraryMap = new Map(library.map((item) => [item.id, item]));
  const items = selection.items.map((item, index) => {
    const latest = libraryMap.get(item.clauseId);
    return latest
      ? createSelectionItemFromClause(latest, index)
      : {
          ...item,
          order: index,
        };
  });

  return {
    items,
    updatedAt: selection.updatedAt,
  } satisfies ContractClauseSelection;
}

function formatCurrency(value: number) {
  return `R$ ${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Nao definido";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function buildClauseVariableMap(payload: ClauseVariablePayloadSource): ClauseVariableMap {
  const startDate = formatDate(payload.startDate);
  const endDate = formatDate(payload.dueDate);
  const dueDay = payload.dueDate ? `dia ${new Date(`${payload.dueDate}T12:00:00`).getDate()}` : "Nao definido";
  const duration = payload.startDate && payload.dueDate
    ? `${startDate} ate ${endDate}`
    : payload.prazoDias?.trim()
      ? `${payload.prazoDias.trim()} dias`
      : "Nao definido";

  return {
    "{{NOME_CLIENTE}}": payload.contractante.nome || "Cliente nao definido",
    "{{EMPRESA_CLIENTE}}": payload.contractante.nomeEmpresa || payload.contractante.nome || "Empresa nao informada",
    "{{VALOR_ATIVACAO}}": formatCurrency(payload.pricing.baseValue || 0),
    "{{MENSALIDADE}}": formatCurrency(payload.pricing.finalMonthlyTotal || 0),
    "{{PRAZO_ENTREGA}}": payload.prazoDias?.trim() ? `${payload.prazoDias.trim()} dias` : "Nao definido",
    "{{DIA_VENCIMENTO}}": dueDay,
    "{{DATA_INICIO}}": startDate,
    "{{DATA_TERMINO}}": endDate,
    "{{DURACAO}}": duration,
    "{{NUM_REVISOES}}": payload.numeroRevisoes?.trim() || "Nao definido",
    "{{CONTRATADA}}": payload.contratada.nome || "NovaesWeb",
    "{{REPRESENTANTE}}": payload.contratada.representante || "Nao informado",
  };
}

export function replaceClauseVariables(text: string, variables: ClauseVariableMap) {
  return Object.entries(variables).reduce((currentText, [token, value]) => {
    return currentText.split(token).join(value || token);
  }, text);
}

export function renderContractClauseSelection(
  selection: ContractClauseSelection,
  variables: ClauseVariableMap,
) {
  const items = selection.items
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((item, index) => {
      const resolved = replaceClauseVariables(item.text, variables);
      return `CLAUSULA ADICIONAL ${index + 1} - ${item.title}\n${resolved}`;
    });

  return items.join("\n\n");
}
