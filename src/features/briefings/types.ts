import type { Tables } from "@/integrations/supabase/types";
import type { BriefingFieldDraft, ClientBriefingStatus, BriefingTemplate } from "@/lib/project-briefings";

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

export type BriefingTab = "briefing" | "sent" | "responses";
export type BriefingsPage = "dashboard" | "in-progress" | "enviados" | "library";
