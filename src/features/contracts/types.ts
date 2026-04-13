import type { Tables } from "@/integrations/supabase/types";
import type { ContractBuilderPayload, ContractBuilderStepIndex } from "@/lib/contract-builder";

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

export const BUILDER_TEMPLATE_ID = "novaesweb-contrato-mestre";
export const RESIGN_REASON_DEFAULT = "Assinatura pendente por atualização de extra e melhoria do sistema.";

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const builderGroupTitles: Record<string, string> = {
  fixo: "Extras Únicos",
  intermediario: "Extras Pro",
  mensal: "Extras Mensais",
};

export const moneyDraftFieldPattern =
  /^(item|pricing):(.+):(setupPrice|monthlyPrice|negotiatedSetup|entryValue|negotiatedMonthly)$/;

export type MoneyDraftField =
  | "setupPrice"
  | "monthlyPrice"
  | "negotiatedSetup"
  | "entryValue"
  | "negotiatedMonthly";

export const BUILDER_STEPS: Array<{
  id: ContractBuilderStepIndex;
  label: string;
  description: string;
}> = [
  { id: 0, label: "Cliente", description: "Selecione o cadastro base da proposta." },
  { id: 1, label: "Partes", description: "Revise contratante e contratada." },
  { id: 2, label: "Plano e extras", description: "Monte o escopo comercial contratado." },
  { id: 3, label: "Totais", description: "Ajuste valores, prazo e observações." },
  { id: 4, label: "Preview final", description: "Confira a proposta premium antes de salvar ou exportar." },
];
