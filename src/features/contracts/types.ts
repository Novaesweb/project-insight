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

export type ContractDraftStatus = ContractStatus;
export type ContractDraft = AdminContractDraft;

export const BUILDER_TEMPLATE_ID = "novaesweb-contrato-mestre";
export const RESIGN_REASON_DEFAULT =
  "Uma nova revisão do contrato foi publicada e depende de aceite atualizado do cliente.";

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const CONTRACT_STATUS_OPTIONS: Array<{ value: ContractStatus; label: string }> = [
  { value: "rascunho", label: "Rascunho" },
  { value: "em_revisao", label: "Em revisão" },
  { value: "aprovado", label: "Aprovado" },
  { value: "enviado", label: "Enviado" },
  { value: "assinado", label: "Assinado" },
  { value: "ativo", label: "Ativo" },
  { value: "cancelado", label: "Cancelado" },
  { value: "encerrado", label: "Encerrado" },
];

export const BUILDER_STEPS: Array<{
  id: ContractBuilderStepIndex;
  label: string;
  description: string;
}> = [
  { id: 0, label: "Cliente", description: "Selecione o cliente e carregue os dados automáticos." },
  { id: 1, label: "Contrato", description: "Ajuste campos complementares, datas e status do documento." },
  { id: 2, label: "Plano", description: "Defina o plano base e o valor principal do contrato." },
  { id: 3, label: "Extras", description: "Revise extras vinculados ao cliente e personalize cláusulas." },
  { id: 4, label: "Preview", description: "Confira o contrato renderizado em tempo real antes de salvar." },
];
