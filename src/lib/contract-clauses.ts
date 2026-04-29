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
    "clause-seed-01-objeto",
    "CLAUSULA 01 - OBJETO DO CONTRATO",
    "objeto",
    false,
    "Este contrato formaliza a prestacao de servicos de criacao, desenvolvimento e hospedagem de website pela CONTRATADA ({{CONTRATADA}}) em favor do CONTRATANTE ({{NOME_CLIENTE}} - {{EMPRESA_CLIENTE}}). O foco exclusivo e a entrega de um site profissional, funcional e de qualidade, conforme escopo aprovado neste documento.",
  ),
  createSeedClause(
    "clause-seed-02-escopo",
    "CLAUSULA 02 - ESCOPO DOS SERVICOS CONTRATADOS",
    "objeto",
    false,
    "Os servicos abrangem: (a) desenvolvimento completo do website conforme layout e funcionalidades aprovadas; (b) hospedagem em servidores gerenciados pela CONTRATADA; (c) painel administrativo para atualizacao de conteudo; (d) suporte tecnico ao funcionamento do site.",
  ),
  createSeedClause(
    "clause-seed-03-nao-incluidos",
    "CLAUSULA 03 - SERVICOS NAO INCLUIDOS",
    "geral",
    false,
    "A CONTRATADA nao realiza, sob nenhuma hipotese, servicos de marketing digital, trafego pago, gestao de redes sociais, producao de conteudo, campanhas publicitarias, SEO avancado, fotografia, videomaking ou identidade visual. A assinatura deste contrato implica ciencia e concordancia plena com essa limitacao de escopo.",
  ),
  createSeedClause(
    "clause-seed-04-prazo-entrega",
    "CLAUSULA 04 - PRAZO DE ENTREGA",
    "entrega",
    false,
    "O prazo estimado de entrega e de ate {{PRAZO_ENTREGA}} apos aprovacao do escopo e recebimento de todos os materiais necessarios. Atrasos na entrega de textos, logotipo, imagens, referencias ou aprovacoes pelo CONTRATANTE prorrogam automaticamente o prazo, sem qualquer responsabilidade da CONTRATADA.",
  ),
  createSeedClause(
    "clause-seed-05-suporte",
    "CLAUSULA 05 - SUPORTE TECNICO",
    "suporte",
    false,
    "A CONTRATADA garante suporte tecnico para questoes relacionadas ao funcionamento do site, com prazo de resposta de ate 24 horas uteis a partir do chamado. O suporte e prestado em dias uteis, em horario comercial, por meio do canal oficial de atendimento. Novas funcionalidades ou alteracoes estruturais nao integram o suporte e podem gerar novo orcamento.",
  ),
  createSeedClause(
    "clause-seed-06-responsabilidade",
    "CLAUSULA 06 - LIMITACAO DE RESPONSABILIDADE DA CONTRATADA",
    "geral",
    false,
    "A CONTRATADA nao se responsabiliza por resultados comerciais, de vendas ou financeiros do CONTRATANTE, por posicionamento organico em buscadores, por desempenho de campanhas conduzidas por terceiros nem por indisponibilidades causadas por provedores de internet do CONTRATANTE ou eventos de forca maior. Sua responsabilidade limita-se ao correto funcionamento tecnico do site dentro do escopo contratado.",
  ),
  createSeedClause(
    "clause-seed-07-propriedade",
    "CLAUSULA 07 - PROPRIEDADE INTELECTUAL",
    "propriedade",
    false,
    "O codigo-fonte, layout, estrutura e demais elementos desenvolvidos pela CONTRATADA sao de sua propriedade intelectual. O CONTRATANTE possui direito de uso do site enquanto o contrato estiver ativo e adimplente. Em caso de cancelamento ou inadimplencia, o acesso ao site podera ser suspenso. A entrega de arquivos ou codigo-fonte somente ocorrera mediante acordo escrito especifico entre as partes.",
  ),
  createSeedClause(
    "clause-seed-08-revisoes",
    "CLAUSULA 08 - APROVACAO DE ETAPAS E REVISOES",
    "revisao",
    false,
    "O CONTRATANTE se compromete a revisar e aprovar cada etapa do desenvolvimento por escrito, por e-mail ou mensagem oficial. Apos a aprovacao de uma etapa, alteracoes nela solicitadas podem gerar cobranca adicional. Esta incluida no contrato a quantidade de revisoes definida no fechamento comercial ({{NUM_REVISOES}}). Revisoes adicionais serao orcadas separadamente.",
  ),
  createSeedClause(
    "clause-seed-09-conteudo",
    "CLAUSULA 09 - RESPONSABILIDADE PELO CONTEUDO",
    "geral",
    false,
    "O CONTRATANTE e o unico responsavel por textos, imagens, logotipos e demais conteudos fornecidos para o site, declarando possuir os direitos autorais ou as devidas autorizacoes de uso. Qualquer reclamacao judicial ou extrajudicial decorrente do conteudo inserido pelo CONTRATANTE sera de responsabilidade exclusiva deste, isentando a CONTRATADA de qualquer onus.",
  ),
  createSeedClause(
    "clause-seed-10-reajuste",
    "CLAUSULA 10 - REAJUSTE ANUAL",
    "pagamento",
    false,
    "Os valores contratados podem ser reajustados anualmente com base na variacao acumulada do IPCA nos 12 meses anteriores ao aniversario do contrato. O CONTRATANTE sera notificado com antecedencia minima de 30 dias antes da aplicacao de qualquer reajuste.",
  ),
  createSeedClause(
    "clause-seed-11-cancelamento",
    "CLAUSULA 11 - TAXA DE ATIVACAO E CANCELAMENTO",
    "cancelamento",
    false,
    "O cancelamento pode ser solicitado por qualquer das partes a qualquer momento, sem multa, mediante comunicacao por escrito. A taxa de ativacao de {{VALOR_ATIVACAO}} nao e reembolsavel, pois cobre configuracao, ferramentas e trabalho ja iniciado. Apos o cancelamento, o site sera desativado em ate 30 dias.",
  ),
  createSeedClause(
    "clause-seed-12-backup",
    "CLAUSULA 12 - BACKUP E SEGURANCA DOS DADOS",
    "sigilo",
    false,
    "A CONTRATADA realizara backups periodicos dos dados e arquivos do site. Em caso de falha tecnica, a restauracao sera feita a partir do backup mais recente disponivel. A CONTRATADA nao se responsabiliza por perdas de conteudo inserido diretamente pelo CONTRATANTE no painel apos o ultimo backup realizado.",
  ),
  createSeedClause(
    "clause-seed-13-lgpd",
    "CLAUSULA 13 - PROTECAO DE DADOS (LGPD)",
    "sigilo",
    false,
    "As partes comprometem-se a tratar os dados pessoais compartilhados neste contrato em conformidade com a Lei Geral de Protecao de Dados (Lei 13.709/2018 - LGPD). Os dados do CONTRATANTE serao utilizados exclusivamente para a execucao dos servicos contratados e nao serao compartilhados com terceiros sem autorizacao previa. O CONTRATANTE e responsavel pela coleta e pelo tratamento de dados de seus proprios clientes no site.",
  ),
  createSeedClause(
    "clause-seed-14-materiais",
    "CLAUSULA 14 - PRAZO DE ENTREGA E DEPENDENCIA DE MATERIAIS",
    "entrega",
    false,
    "O prazo de entrega do site depende diretamente do envio dos materiais pelo CONTRATANTE, incluindo textos, logotipo, imagens, referencias de layout e demais informacoes necessarias. O prazo comercial de {{PRAZO_ENTREGA}} somente comeca a contar apos o recebimento completo de todos os materiais solicitados. Enquanto houver pendencias de informacoes ou aprovacoes por parte do CONTRATANTE, o prazo ficara automaticamente suspenso.",
  ),
  createSeedClause(
    "clause-seed-15-pos-entrega",
    "CLAUSULA 15 - RESPONSABILIDADE APOS A ENTREGA DO SITE",
    "geral",
    false,
    "Apos a entrega e aprovacao formal do site pelo CONTRATANTE, toda a responsabilidade pelo conteudo, uso e gestao do site passa a ser exclusivamente do CONTRATANTE. A CONTRATADA nao se responsabiliza por alteracoes realizadas diretamente no painel administrativo, por conteudos desatualizados ou incorretos inseridos pelo CONTRATANTE nem por danos causados por terceiros apos a entrega. Qualquer correcao decorrente de acao do proprio CONTRATANTE pode ser cobrada como servico avulso.",
  ),
  createSeedClause(
    "clause-seed-16-manutencao",
    "CLAUSULA 16 - MANUTENCAO, ATUALIZACOES E PLANO MENSAL",
    "suporte",
    false,
    "Este contrato nao inclui manutencao recorrente, atualizacao de conteudo, inclusao de novas paginas, alteracoes de layout ou monitoramento de seguranca apos a entrega. Caso o CONTRATANTE deseje tais servicos, devera contratar um plano mensal especifico com a CONTRATADA, com valor e escopo definidos em proposta separada. Sem essa contratacao, qualquer atualizacao ou alteracao sera orcada e cobrada de forma avulsa, mediante aprovacao previa.",
  ),
  createSeedClause(
    "clause-seed-17-aditivos",
    "CLAUSULA 17 - ALTERACOES DE ESCOPO E ADITIVOS",
    "geral",
    false,
    "Qualquer nova funcionalidade, alteracao estrutural ou servico nao previsto neste contrato devera ser formalizado em aditivo contratual, com orcamento aprovado por escrito antes do inicio. Solicitacoes verbais nao geram obrigacao de entrega.",
  ),
  createSeedClause(
    "clause-seed-18-vigencia",
    "CLAUSULA 18 - VIGENCIA E PROPRIEDADE DO SITE",
    "propriedade",
    false,
    "O site permanecera ativo enquanto o contrato estiver vigente e os pagamentos em dia. Em caso de inadimplencia superior a 15 dias, a CONTRATADA podera suspender o site. Apos 30 dias de inadimplencia, o contrato podera ser rescindido e o site desativado definitivamente.",
  ),
  createSeedClause(
    "clause-seed-19-confidencialidade",
    "CLAUSULA 19 - CONFIDENCIALIDADE",
    "sigilo",
    false,
    "As partes comprometem-se a manter sigilo sobre informacoes confidenciais trocadas durante a vigencia deste contrato, nao as divulgando a terceiros sem autorizacao expressa da outra parte.",
  ),
  createSeedClause(
    "clause-seed-20-foro",
    "CLAUSULA 20 - DISPOSICOES GERAIS E FORO",
    "geral",
    false,
    "Este contrato e regido pelas leis da Republica Federativa do Brasil. As partes elegem o foro da Comarca de Canoas/RS para dirimir eventuais litigios. Este instrumento substitui todos os acordos verbais ou escritos anteriores sobre o mesmo objeto.",
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

export function createDefaultContractClauseSelection(_library: ClauseLibraryItem[]): ContractClauseSelection {
  return {
    items: [],
    updatedAt: null,
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
  const normalizedRevisions = (() => {
    const raw = payload.numeroRevisoes?.trim() || "";
    if (!raw) return "Nao definido";
    if (/^\d+$/.test(raw)) {
      return `${raw} ${raw === "1" ? "revisao" : "revisoes"}`;
    }
    return raw;
  })();
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
    "{{NUM_REVISOES}}": normalizedRevisions,
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
    .map((item) => {
      const resolved = replaceClauseVariables(item.text, variables);
      return `${item.title}\n${resolved}`;
    });

  return items.join("\n\n");
}
