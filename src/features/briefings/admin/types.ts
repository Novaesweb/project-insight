import type { Tables } from "@/integrations/supabase/types";
import type {
  BriefingAnswerMap,
  BriefingAttachmentLike,
  BriefingFieldDraft,
  BriefingTemplate,
  ClientBriefingStatus,
} from "@/lib/project-briefings";
import { briefingStatusMeta, buildBriefingTitle, parseBriefingOptions } from "@/lib/project-briefings";

export type ClientLite = Pick<
  Tables<"clientes">,
  | "id"
  | "nome"
  | "nome_empresa"
  | "email"
  | "status"
  | "bloqueado"
  | "telefone"
  | "whatsapp"
  | "endereco"
  | "cidade"
  | "estado"
  | "instagram"
  | "site_url"
>;

export type ProjectLite = Pick<Tables<"projetos">, "id" | "titulo" | "status">;

export type ClientBriefingRow = {
  id: string;
  cliente_id: string;
  projeto_id: string | null;
  titulo: string;
  instrucoes: string | null;
  status: ClientBriefingStatus;
  snapshot_briefing: string | null;
  snapshot_references: string | null;
  sent_at: string | null;
  started_at: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  clientes?: ClientLite | ClientLite[] | null;
  projetos?: ProjectLite | ProjectLite[] | null;
};

export type BriefingTemplateRow = {
  id: string;
  slug: string;
  section_name: string;
  label: string;
  help_text: string | null;
  field_type: BriefingTemplate["field_type"];
  required_default: boolean;
  placeholder: string | null;
  options: unknown;
  sort_order: number;
  active: boolean;
};

export type BriefingFieldRow = {
  id: string;
  briefing_id: string;
  template_id: string | null;
  section_name: string;
  label: string;
  help_text: string | null;
  field_type: BriefingFieldDraft["field_type"];
  required: boolean;
  placeholder: string | null;
  options: unknown;
  sort_order: number;
  is_custom: boolean;
};

export type BriefingAnswerRow = {
  id: string;
  briefing_id: string;
  field_id: string;
  cliente_id: string;
  answer_text: string | null;
  answer_json: unknown;
  updated_at: string;
};

export type BriefingAttachmentRow = {
  id: string;
  briefing_id: string;
  field_id: string | null;
  cliente_id: string;
  nome: string;
  url: string;
  storage_path: string;
  created_at: string;
};

export type BriefingEditorState = {
  id: string | null;
  cliente_id: string;
  projeto_id: string | null;
  titulo: string;
  instrucoes: string;
  status: ClientBriefingStatus;
  snapshot_briefing: string;
  snapshot_references: string;
};

export type BriefingStatusCounts = {
  draft: number;
  awaiting: number;
  partial: number;
  answered: number;
  completed: number;
};

export type TemplateFormState = {
  id: string | null;
  slug: string;
  section_name: string;
  label: string;
  help_text: string;
  field_type: BriefingTemplate["field_type"];
  required_default: boolean;
  placeholder: string;
  optionsText: string;
  sort_order: string;
  active: boolean;
};

export const emptyEditorState: BriefingEditorState = {
  id: null,
  cliente_id: "",
  projeto_id: null,
  titulo: "",
  instrucoes:
    "Responda com o máximo de contexto real possível sobre o negócio. Nunca envie senhas, chaves, tokens ou segredos em texto puro.",
  status: "em_construcao",
  snapshot_briefing: "",
  snapshot_references: "",
};

export const emptyTemplateFormState: TemplateFormState = {
  id: null,
  slug: "",
  section_name: "Geral",
  label: "",
  help_text: "",
  field_type: "short_text",
  required_default: false,
  placeholder: "",
  optionsText: "",
  sort_order: "",
  active: true,
};

export function getClientDisplayName(client?: ClientLite | ClientLite[] | null) {
  if (!client) return "Cliente não encontrado";
  const value = Array.isArray(client) ? client[0] : client;
  return value?.nome_empresa?.trim() || value?.nome?.trim() || "Cliente não encontrado";
}

export function getProjectTitle(project?: ProjectLite | ProjectLite[] | null) {
  if (!project) return null;
  const value = Array.isArray(project) ? project[0] : project;
  return value?.titulo || null;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Sem registro";
  return new Date(value).toLocaleString("pt-BR");
}

export function getSentStatusLabel(status: ClientBriefingStatus) {
  switch (status) {
    case "enviado":
      return "Aguardando resposta";
    case "em_preenchimento":
      return "Parcial";
    default:
      return briefingStatusMeta[status].label;
  }
}

export function hasAnswerValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value?.trim());
}

export function buildEditorFromClient(client?: ClientLite | null): BriefingEditorState {
  return {
    ...emptyEditorState,
    cliente_id: client?.id || "",
    titulo: buildBriefingTitle(getClientDisplayName(client || null)),
  };
}

export function toFieldDraft(field: BriefingFieldRow): BriefingFieldDraft {
  return {
    id: field.id,
    template_id: field.template_id,
    section_name: field.section_name,
    label: field.label,
    help_text: field.help_text || "",
    field_type: field.field_type,
    required: field.required,
    placeholder: field.placeholder || "",
    options: parseBriefingOptions(field.options as never),
    sort_order: field.sort_order,
    is_custom: field.is_custom,
  };
}

export function buildAnswerMap(rows: BriefingAnswerRow[]): BriefingAnswerMap {
  return rows.reduce<BriefingAnswerMap>((accumulator, answer) => {
    if (answer.answer_text?.trim()) {
      accumulator[answer.field_id] = answer.answer_text;
      return accumulator;
    }

    if (Array.isArray(answer.answer_json)) {
      accumulator[answer.field_id] = answer.answer_json.filter(
        (item): item is string => typeof item === "string",
      );
      return accumulator;
    }

    accumulator[answer.field_id] = "";
    return accumulator;
  }, {});
}

export function suggestProjectTitle(
  clientName: string,
  fields: BriefingFieldDraft[],
  answers: BriefingAnswerMap,
) {
  const companyField = fields.find((field) =>
    field.label.trim().toLowerCase().includes("nome da empresa"),
  );
  const companyName = companyField ? (answers[companyField.id] as string | undefined)?.trim() || "" : "";
  return `Site ${companyName || clientName}`;
}

export function countBriefingStatuses(briefings: ClientBriefingRow[]): BriefingStatusCounts {
  return {
    draft: briefings.filter((item) => item.status === "em_construcao").length,
    awaiting: briefings.filter((item) => item.status === "enviado").length,
    partial: briefings.filter((item) => item.status === "em_preenchimento").length,
    answered: briefings.filter((item) => item.status === "respondido").length,
    completed: briefings.filter((item) => item.status === "concluido").length,
  };
}

export function buildResponseSections(fields: BriefingFieldDraft[]) {
  return fields.reduce<Array<{ name: string; fields: BriefingFieldDraft[] }>>((accumulator, field) => {
    const existingSection = accumulator.find((section) => section.name === field.section_name);
    if (existingSection) {
      existingSection.fields.push(field);
      return accumulator;
    }

    accumulator.push({ name: field.section_name || "Geral", fields: [field] });
    return accumulator;
  }, []);
}

export function mapAttachmentsToSnapshot(attachments: BriefingAttachmentRow[]): BriefingAttachmentLike[] {
  return attachments;
}
