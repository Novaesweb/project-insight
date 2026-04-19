import { supabase } from "@/integrations/supabase/client";
import type { 
  ClientBriefingRow, 
  BriefingTemplateRow, 
  BriefingFieldRow, 
  BriefingAnswerRow, 
  BriefingAttachmentRow,
  ClientLite
} from "../types";
import { 
  buildBriefingTitle, 
  sanitizeBriefingField, 
  validateBriefingFields, 
  serializeBriefingOptions,
  toFieldDraft,
  type BriefingFieldDraft,
  type ClientBriefingStatus
} from "../../../lib/project-briefings";
import { notifyClientPanel } from "@/lib/user-notifications";

export const briefingService = {
  async getBriefings(): Promise<ClientBriefingRow[]> {
    const { data, error } = await (supabase
      .from("client_briefings" as never)
      .select("*, clientes(id, nome, nome_empresa, email, status, bloqueado, telefone, whatsapp, endereco, cidade, estado, instagram, site_url), projetos(id, titulo, status)")
      .order("updated_at", { ascending: false }) as Promise<{ data: ClientBriefingRow[] | null; error: any }>);

    if (error) throw error;
    return data || [];
  },

  async getClients(): Promise<ClientLite[]> {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome, nome_empresa, email, status, bloqueado, telefone, whatsapp, endereco, cidade, estado, instagram, site_url")
      .eq("bloqueado", false)
      .order("nome", { ascending: true });

    if (error) throw error;
    return (data || []).filter((client) => client.status !== "inativo") as ClientLite[];
  },

  async getTemplates(): Promise<BriefingTemplateRow[]> {
    const { data, error } = await (supabase
      .from("briefing_templates" as never)
      .select("*")
      .order("sort_order", { ascending: true }) as Promise<{ data: BriefingTemplateRow[] | null; error: any }>);

    if (error) throw error;
    return data || [];
  },

  async getActiveTemplates(): Promise<BriefingTemplateRow[]> {
    const { data, error } = await (supabase
      .from("briefing_templates" as never)
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true }) as Promise<{ data: BriefingTemplateRow[] | null; error: any }>);

    if (error) throw error;
    return data || [];
  },

  async getBriefingDetail(briefingId: string) {
    const [briefingResponse, fieldsResponse, answersResponse, attachmentsResponse] = await Promise.all([
      (supabase.from("client_briefings" as never).select("*").eq("id", briefingId).single() as Promise<{ data: ClientBriefingRow | null; error: any }>),
      (supabase.from("client_briefing_fields" as never).select("*").eq("briefing_id", briefingId).order("sort_order", { ascending: true }) as Promise<{ data: BriefingFieldRow[] | null; error: any }>),
      (supabase.from("client_briefing_answers" as never).select("*").eq("briefing_id", briefingId).order("updated_at", { ascending: false }) as Promise<{ data: BriefingAnswerRow[] | null; error: any }>),
      (supabase.from("briefing_attachments" as never).select("id, briefing_id, field_id, cliente_id, nome, url, storage_path, created_at").eq("briefing_id", briefingId).order("created_at", { ascending: false }) as Promise<{ data: BriefingAttachmentRow[] | null; error: any }>),
    ]);

    if (briefingResponse.error) throw briefingResponse.error;

    return {
      briefing: briefingResponse.data,
      fields: fieldsResponse.data || [],
      answers: answersResponse.data || [],
      attachments: attachmentsResponse.data || [],
    };
  },

  async upsertBriefing(params: {
    editor: any;
    fieldDrafts: BriefingFieldDraft[];
    persistedFieldIds: string[];
    mode: "draft" | "send" | "reopen" | "conclude";
    clientName: string;
    snapshot: { briefing: string; references: string };
    existingBriefing?: ClientBriefingRow | null;
  }) {
    const { editor, fieldDrafts, persistedFieldIds, mode, clientName, snapshot, existingBriefing } = params;

    const sanitizedFields = fieldDrafts.map((field, index) => sanitizeBriefingField(field, index));

    if ((mode === "send" || mode === "reopen") && sanitizedFields.length === 0) {
      throw new Error("Selecione ou crie perguntas antes de enviar o briefing.");
    }

    if (mode === "send" || mode === "reopen") {
      validateBriefingFields(sanitizedFields);
    }

    const now = new Date().toISOString();
    let nextStatus: ClientBriefingStatus =
      mode === "send" || mode === "reopen"
        ? "enviado"
        : mode === "conclude"
          ? "concluido"
          : editor.id && (editor.status === "respondido" || editor.status === "concluido")
            ? editor.status
            : "em_construcao";

    const payload = {
      id: editor.id || undefined,
      cliente_id: editor.cliente_id,
      projeto_id: editor.projeto_id,
      titulo: editor.titulo.trim() || buildBriefingTitle(clientName),
      instrucoes: editor.instrucoes.trim() || null,
      status: nextStatus,
      snapshot_briefing:
        mode === "conclude" ? snapshot.briefing || editor.snapshot_briefing || null : editor.snapshot_briefing || null,
      snapshot_references:
        mode === "conclude" ? snapshot.references || editor.snapshot_references || null : editor.snapshot_references || null,
      sent_at: mode === "send" || mode === "reopen" ? now : existingBriefing?.sent_at || null,
      started_at: mode === "send" || mode === "reopen" ? null : existingBriefing?.started_at || null,
      submitted_at: mode === "send" || mode === "reopen" ? null : existingBriefing?.submitted_at || null,
      completed_at: mode === "conclude" ? now : mode === "send" || mode === "reopen" ? null : existingBriefing?.completed_at || null,
    };

    const { data: briefingRow, error: briefingError } = await (supabase
      .from("client_briefings" as never)
      .upsert(payload)
      .select("*")
      .single() as Promise<{ data: ClientBriefingRow | null; error: Error | null }>);

    if (briefingError || !briefingRow) {
      throw briefingError || new Error("Não foi possível salvar o briefing.");
    }

    // Handle field deletions
    const removedFieldIds = persistedFieldIds.filter(
      (fieldId) => !sanitizedFields.some((field) => field.id === fieldId),
    );

    if (removedFieldIds.length > 0) {
      const { error: deleteFieldsError } = await (supabase
        .from("client_briefing_fields" as never)
        .delete()
        .in("id", removedFieldIds) as Promise<{ error: Error | null }>);

      if (deleteFieldsError) throw deleteFieldsError;
    }

    // Handle field upserts
    let nextFieldDrafts: BriefingFieldDraft[] = [];
    if (sanitizedFields.length > 0) {
      const fieldsPayload = sanitizedFields.map((field) => ({
        id: field.id,
        briefing_id: briefingRow.id,
        template_id: field.template_id,
        section_name: field.section_name,
        label: field.label,
        help_text: field.help_text || null,
        field_type: field.field_type,
        required: field.required,
        placeholder: field.placeholder || null,
        options:
          field.field_type === "single_choice" || field.field_type === "multi_choice"
            ? serializeBriefingOptions(field.options)
            : [],
        sort_order: field.sort_order,
        is_custom: field.is_custom,
      }));

      const { data: savedFields, error: fieldsError } = await (supabase
        .from("client_briefing_fields" as never)
        .upsert(fieldsPayload)
        .select("*") as Promise<{ data: BriefingFieldRow[] | null; error: Error | null }>);

      if (fieldsError) throw fieldsError;

      nextFieldDrafts = (savedFields || [])
        .sort((left, right) => left.sort_order - right.sort_order)
        .map(row => ({
          id: row.id,
          template_id: row.template_id,
          section_name: row.section_name,
          label: row.label,
          help_text: row.help_text || "",
          field_type: row.field_type,
          required: row.required,
          placeholder: row.placeholder || "",
          options: (row.options as any) || [],
          sort_order: row.sort_order,
          is_custom: row.is_custom,
        }));
    }

    // Notifications
    if (mode === "send") {
      await notifyClientPanel(briefingRow.cliente_id, {
        title: "Briefing do site liberado",
        body: `${briefingRow.titulo} está disponível para preenchimento no portal.`,
        url: "/cliente/dados",
      });
    } else if (mode === "reopen") {
      await notifyClientPanel(briefingRow.cliente_id, {
        title: "Briefing reaberto para ajustes",
        body: `${briefingRow.titulo} foi reaberto com novas orientações.`,
        url: "/cliente/dados",
      });
    } else if (mode === "conclude") {
      await notifyClientPanel(briefingRow.cliente_id, {
        title: "Briefing concluído",
        body: `${briefingRow.titulo} foi encerrado pela NovaesWeb.`,
        url: "/cliente/dados",
      });
    }

    return { briefingRow, nextFieldDrafts };
  },

  async deleteBriefing(id: string) {
    const { error } = await supabase.from("client_briefings" as never).delete().eq("id", id);
    if (error) throw error;
  },

  async upsertTemplate(payload: any) {
    const { data, error } = await (supabase
      .from("briefing_templates" as never)
      .upsert(payload)
      .select("*")
      .single() as Promise<{ data: BriefingTemplateRow | null; error: any }>);

    if (error) throw error;
    return data;
  },

  async deleteTemplate(id: string) {
    const { error } = await supabase.from("briefing_templates" as never).delete().eq("id", id);
    if (error) throw error;
  }
};
