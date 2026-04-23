import type { Tables } from "@/integrations/supabase/types";
import type {
  AdminContractDraft,
  ContractBuilderPayload,
  ContractBuilderStepIndex,
  ContractStatus,
} from "@/lib/contract-builder";

export type Cliente = Tables<"clientes">;
export type ExtraCatalogo = Tables<"extras_catalogo">;
export type ExtraCliente = Tables<"extras_clientes"> & {
  extras_catalogo?: Tables<"extras_catalogo"> | null;
};
export type Contrato = Tables<"contratos"> & {
  clientes?: {
    nome: string;
  } | null;
};
export type ContratoVersion = Tables<"contrato_versions">;

export interface PreviewState {
  title: string;
  body: string;
  assinaturaAdmin?: string | null;
  assinaturaCliente?: string | null;
  proposal?: ContractBuilderPayload | null;
  contract?: Contrato | null;
}

export interface ContractCofreState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  cofreFilter: "ativos" | "arquivados";
  setCofreFilter: (filter: "ativos" | "arquivados") => void;
  cofreStatusFilter: "todos" | ContractStatus;
  setCofreStatusFilter: (status: "todos" | ContractStatus) => void;
  deleteTarget: Contrato | null;
  setDeleteTarget: (target: Contrato | null) => void;
  filteredContratos: Contrato[];
  activeContractsCount: number;
  archivedContractsCount: number;
  contractStatusCounts: Record<string, number>;
  handleArchiveContract: (target: Contrato) => Promise<void>;
  handleUnarchiveContract: (target: Contrato) => Promise<void>;
  handleDeleteContract: () => Promise<void>;
}

export interface ContractBuilderState {
  builderPayload: ContractBuilderPayload | null;
  editingBuilderContract: Contrato | null;
  builderStep: ContractBuilderStepIndex;
  setBuilderStep: (step: ContractBuilderStepIndex) => void;
  builderStatusLabel: { title: string; subtitle: string };
  builderProgress: number;
  selectedItemsCount: number;
  resetBuilder: () => void;
  onClientChange: (clientId: string) => Promise<void>;
  onRefreshExtras: () => Promise<void>;
  onUpdateContractante: (field: string, value: string) => void;
  onUpdateContratada: (field: string, value: string) => void;
  onUpdateTextField: (field: string, value: string) => void;
  onPrimaryPlanChange: (planId: any) => void; // Using any for planId to avoid circular dependency or missing import if not careful, but better than full any
  onPricingChange: (field: string, value: string) => void;
  onExtraFieldChange: (extraId: string, field: "name" | "description" | "clause" | "setupPrice", value: string) => void;
  onToggleExtra: (extraId: string, active: boolean) => void;
  openBuilderContract: (contrato: Contrato) => void;
  persistBuilderDraft: (options?: {
    requireCompleteValidation?: boolean;
    silent?: boolean;
    autosaveRemote?: boolean;
    stepOverride?: ContractBuilderStepIndex;
  }) => Promise<Contrato | null | false>;
  changeContractStatus: (status: ContractStatus) => Promise<boolean>;
  handleGeneratePdf: () => void;
  handleDownloadWord: () => void;
  handlePrint: () => void;
  syncingClientExtras: boolean;
  mobileSummaryOpen: boolean;
  setMobileSummaryOpen: (open: boolean) => void;
  builderRecoveredLocally?: boolean;
  builderLastSavedSignature?: string | null;
  builderLastSavedAt: string | null;
  builderRemoteAutosaveState: "idle" | "saving" | "saved" | "error";
  shouldReduceMotion?: boolean;
  workingBuilderPayload: ContractBuilderPayload | null;
  builderSummary: any; // ContractProposalSummary
  builderPrepared: any;
  builderPreparedError: string | null;
  builderClientExtras: any[];
  onDiscountTypeChange: (value: string) => void;
  onMoneyDraftBlur: (key: string, value: number) => void;
  getBuilderStepError: (step: number) => string | null;
  getMoneyInputDisplayValue: (key: string, value: number) => string;
  buildPricingMoneyDraftKey: (field: string) => string;
  describeClientExtraPricing: (item: any) => string;
}

export type ContractDraftStatus = ContractStatus;
export type ContractDraft = AdminContractDraft;

export const BUILDER_TEMPLATE_ID = "novaesweb-contrato-mestre";
export const RESIGN_REASON_DEFAULT =
  "Uma nova revisao do contrato foi publicada e depende de aceite atualizado do cliente.";

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const CONTRACT_STATUS_OPTIONS: Array<{ value: ContractStatus; label: string }> = [
  { value: "rascunho", label: "Rascunho" },
  { value: "em_revisao", label: "Em revisao" },
  { value: "aprovado", label: "Aprovado" },
  { value: "enviado", label: "Enviado" },
  { value: "assinado", label: "Assinado" },
  { value: "ativo", label: "Ativo" },
  { value: "cancelado", label: "Cancelado" },
  { value: "encerrado", label: "Encerrado" },
];

export type ContractBuilderStepSlug = "cliente" | "dados" | "plano" | "extras" | "preview";

export const BUILDER_STEPS: Array<{
  id: ContractBuilderStepIndex;
  slug: ContractBuilderStepSlug;
  label: string;
  description: string;
}> = [
  { id: 0, slug: "cliente", label: "Cliente", description: "Selecione o cliente e carregue os dados automaticos." },
  { id: 1, slug: "dados", label: "Contrato", description: "Ajuste campos complementares, datas e status do documento." },
  { id: 2, slug: "plano", label: "Plano", description: "Defina o plano base e o valor principal do contrato." },
  { id: 3, slug: "extras", label: "Extras", description: "Revise extras vinculados ao cliente e personalize clausulas." },
  { id: 4, slug: "preview", label: "Preview", description: "Confira o contrato renderizado em tempo real antes de salvar." },
];

export function getContractBuilderStepSlug(step: ContractBuilderStepIndex): ContractBuilderStepSlug {
  return BUILDER_STEPS.find((item) => item.id === step)?.slug || "cliente";
}

export function getContractBuilderStepFromSlug(slug: string | null | undefined): ContractBuilderStepIndex {
  return BUILDER_STEPS.find((item) => item.slug === slug)?.id ?? 0;
}

export function getContractBuilderStepMeta(step: ContractBuilderStepIndex) {
  return BUILDER_STEPS.find((item) => item.id === step) || BUILDER_STEPS[0];
}

export function getContractBuilderStepPath(step: ContractBuilderStepIndex) {
  return `/admin/contratos/novo/${getContractBuilderStepSlug(step)}`;
}
