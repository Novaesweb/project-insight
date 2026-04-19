import { supabase } from "@/integrations/supabase/client";
import {
  buildBriefingTitle,
  createFieldDraftFromTemplate,
  parseBriefingOptions,
  parseOptionsInput,
  sanitizeBriefingField,
  serializeBriefingOptions,
  stringifyOptions,
  validateBriefingFields,
  type BriefingAnswerMap,
  type BriefingFieldDraft,
} from "@/lib/project-briefings";
import { notifyClientPanel } from "@/lib/user-notifications";

import {
  buildEditorFromClient,
  emptyTemplateFormState,
  getClientDisplayName,
  suggestProjectTitle,
  toFieldDraft,
  type BriefingAnswerRow,
  type BriefingAttachmentRow,
  type BriefingEditorState,
  type BriefingFieldRow,
  type BriefingTemplateRow,
  type ClientBriefingRow,
  type ClientLite,
  type ProjectLite,
  type TemplateFormState,
} from "./types";

type FetchOverviewOptions = {
  includeInactiveTemplates?: boolean;
};

type SaveAdminBriefingParams = {
  mode: "draft" | "send" | "reopen" | "conclude";
  editor: BriefingEditorState;
  fieldDrafts: BriefingFieldDraft[];
  persistedFieldIds: string[];
  selectedClientId?: string | null;
  client: ClientLite | null;
  selectedBriefing?: ClientBriefingRow | null;
  snapshot: {
    briefing: string;
    references: string;
  };
};

type CreateProjectFromBriefingParams = {
  briefingId: string;
  client: ClientLite;
  editor: BriefingEditorState;
  selectedBriefing?: ClientBriefingRow | null;
  fieldDrafts: BriefingFieldDraft[];
  answers: BriefingAnswerMap;
  snapshot: {
    briefing: string;
    references: string;
  };
};

export async function fetchAdminBriefingsOverview({
  includeInactiveTemplates = false,
}: FetchOverviewOptions = {}) {
  const templatesQuery = supabase
    .from("briefing_templates" as never)
    .select("*")
    .order("sort_order", { ascending: true }) as Promise<{ data: BriefingTemplateRow[] | null }>;

  const [briefingsResponse, clientsResponse, templatesResponse] = await Promise.all([
    (supabase
      .from("client_briefings" as never)
      .select(
        "*, clientes(id, nome, nome_empresa, email, status, bloqueado, telefone, whatsapp, endereco, cidade, estado, instagram, site_url), projetos(id, titulo, status)",
      )
      .order("updated_at", { ascending: false }) as Promise<{ data: ClientBriefingRow[] | null }>),
    supabase
      .from("clientes")
      .select(
        "id, nome, nome_empresa, email, status, bloqueado, telefone, whatsapp, endereco, cidade, estado, instagram, site_url",
      )
      .eq("bloqueado", false)
      .order("nome", { ascending: true }),
    templatesQuery,
  ]);

  const templates = (templatesResponse.data || []).filter(
    (template) => includeInactiveTemplates || template.active,
  );

  return {
    briefings: briefingsResponse.data || [],
    clients: (((clientsResponse.data as ClientLite[]) || []).filter(
      (client) => client.status !== "inativo",
    )),
    templates,
  };
}

export async function fetchAdminBriefingDetail(briefingId: string) {
  const [briefingResponse, fieldsResponse, answersResponse, attachmentsResponse] = await Promise.all([
    (supabase
      .from("client_briefings" as never)
      .select("*")
      .eq("id", briefingId)
      .single() as Promise<{ data: ClientBriefingRow | null }>),
    (supabase
      .from("client_briefing_fields" as never)
      .select("*")
      .eq("briefing_id", briefingId)
      .order("sort_order", { ascending: true }) as Promise<{ data: BriefingFieldRow[] | null }>),
    (supabase
      .from("client_briefing_answers" as never)
      .select("*")
      .eq("briefing_id", briefingId)
      .order("updated_at", { ascending: false }) as Promise<{ data: BriefingAnswerRow[] | null }>),
    (supabase
      .from("briefing_attachments" as never)
      .select("id, briefing_id, field_id, cliente_id, nome, url, storage_path, created_at")
      .eq("briefing_id", briefingId)
      .order("created_at", { ascending: false }) as Promise<{ data: BriefingAttachmentRow[] | null }>),
  ]);

  const briefing = briefingResponse.data;
  if (!briefing) {
    throw new Error("Briefing não encontrado.");
  }

  return {
    briefing,
    fields: (fieldsResponse.data || []).map(toFieldDraft),
    answers: answersResponse.data || [],
    attachments: attachmentsResponse.data || [],
  };
}

export async function saveAdminBriefing({
  mode,
  editor,
  fieldDrafts,
  persistedFieldIds,
  selectedClientId,
  client,
  selectedBriefing,
  snapshot,
}: SaveAdminBriefingParams) {
  const clientId = editor.cliente_id || selectedClientId;
  if (!clientId) {
    throw new Error("Selecione um cliente antes de salvar o briefing.");
  }

  const sanitizedFields = fieldDrafts.map((field, index) => sanitizeBriefingField(field, index));

  if ((mode === "send" || mode === "reopen") && sanitizedFields.length === 0) {
    throw new Error("Selecione ou crie perguntas antes de enviar o briefing.");
  }

  if (mode === "send" || mode === "reopen") {
    validateBriefingFields(sanitizedFields);
  }

  const now = new Date().toISOString();
  const nextStatus =
    mode === "send" || mode === "reopen"
      ? "enviado"
      : mode === "conclude"
        ? "concluido"
        : editor.id && (editor.status === "respondido" || editor.status === "concluido")
          ? editor.status
          : "em_construcao";

  const payload = {
    id: editor.id || undefined,
    cliente_id: clientId,
    projeto_id: editor.projeto_id,
    titulo: editor.titulo.trim() || buildBriefingTitle(getClientDisplayName(client)),
    instrucoes: editor.instrucoes.trim() || null,
    status: nextStatus,
    snapshot_briefing:
      mode === "conclude" ? snapshot.briefing || editor.snapshot_briefing || null : editor.snapshot_briefing || null,
    snapshot_references:
      mode === "conclude" ? snapshot.references || editor.snapshot_references || null : editor.snapshot_references || null,
    sent_at: mode === "send" || mode === "reopen" ? now : selectedBriefing?.sent_at || null,
    started_at: mode === "send" || mode === "reopen" ? null : selectedBriefing?.started_at || null,
    submitted_at: mode === "send" || mode === "reopen" ? null : selectedBriefing?.submitted_at || null,
    completed_at:
      mode === "conclude"
        ? now
        : mode === "send" || mode === "reopen"
          ? null
          : selectedBriefing?.completed_at || null,
  };

  const { data: briefingRow, error: briefingError } = await (supabase
    .from("client_briefings" as never)
    .upsert(payload)
    .select("*")
    .single() as Promise<{ data: ClientBriefingRow | null; error: Error | null }>);

  if (briefingError || !briefingRow) {
    throw briefingError || new Error("Não foi possível salvar o briefing.");
  }

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

  const nextFieldDrafts =
    sanitizedFields.length > 0
      ? await (async () => {
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

          return (savedFields || [])
            .sort((left, right) => left.sort_order - right.sort_order)
            .map(toFieldDraft);
        })()
      : [];

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

  return {
    briefing: briefingRow,
    fields: nextFieldDrafts,
  };
}

export async function createProjectFromAdminBriefing({
  briefingId,
  client,
  editor,
  selectedBriefing,
  fieldDrafts,
  answers,
  snapshot,
}: CreateProjectFromBriefingParams) {
  if (editor.projeto_id) {
    throw new Error("Esse briefing já está vinculado a um projeto.");
  }

  const title = suggestProjectTitle(getClientDisplayName(client), fieldDrafts, answers);
  const snapshotBriefing = snapshot.briefing || editor.snapshot_briefing;
  const snapshotReferences = snapshot.references || editor.snapshot_references;

  const { data: projectRow, error: projectError } = await supabase
    .from("projetos")
    .insert({
      cliente_id: client.id,
      titulo: title,
      descricao: `Projeto criado a partir do briefing "${editor.titulo}".`,
      briefing: snapshotBriefing || null,
      referencias: snapshotReferences || null,
      status: "briefing",
      progresso: 20,
      valor: 0,
    })
    .select("id")
    .single();

  if (projectError || !projectRow) {
    throw projectError || new Error("Não foi possível criar o projeto.");
  }

  const now = new Date().toISOString();
  const { error: briefingError } = await (supabase
    .from("client_briefings" as never)
    .update({
      projeto_id: projectRow.id,
      status: "concluido",
      completed_at: now,
      snapshot_briefing: snapshotBriefing || null,
      snapshot_references: snapshotReferences || null,
      sent_at: selectedBriefing?.sent_at || null,
    })
    .eq("id", briefingId) as Promise<{ error: Error | null }>);

  if (briefingError) throw briefingError;

  await notifyClientPanel(client.id, {
    title: "Projeto iniciado",
    body: `${title} entrou em fase de execução com base no briefing enviado.`,
    url: "/cliente/projetos",
  });

  return projectRow.id;
}

function slugifyTemplate(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createTemplateFormState(template?: BriefingTemplateRow | null): TemplateFormState {
  if (!template) {
    return emptyTemplateFormState;
  }

  return {
    id: template.id,
    slug: template.slug,
    section_name: template.section_name,
    label: template.label,
    help_text: template.help_text || "",
    field_type: template.field_type,
    required_default: template.required_default,
    placeholder: template.placeholder || "",
    optionsText: stringifyOptions(parseBriefingOptions(template.options as never)),
    sort_order: String(template.sort_order),
    active: template.active,
  };
}

export async function saveBriefingTemplate(
  form: TemplateFormState,
  fallbackSortOrder: number,
) {
  const label = form.label.trim();
  if (!label) {
    throw new Error("A pergunta da biblioteca precisa ter um título.");
  }

  const options =
    form.field_type === "single_choice" || form.field_type === "multi_choice"
      ? parseOptionsInput(form.optionsText)
      : [];

  if ((form.field_type === "single_choice" || form.field_type === "multi_choice") && options.length === 0) {
    throw new Error("Perguntas de escolha precisam de opções separadas por vírgula.");
  }

  const sortOrder = Number.parseInt(form.sort_order, 10);

  const payload = {
    id: form.id || undefined,
    slug: form.slug.trim() || slugifyTemplate(label),
    section_name: form.section_name.trim() || "Geral",
    label,
    help_text: form.help_text.trim() || null,
    field_type: form.field_type,
    required_default: form.required_default,
    placeholder: form.placeholder.trim() || null,
    options: serializeBriefingOptions(options),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : fallbackSortOrder,
    active: form.active,
  };

  const { data, error } = await (supabase
    .from("briefing_templates" as never)
    .upsert(payload)
    .select("*")
    .single() as Promise<{ data: BriefingTemplateRow | null; error: Error | null }>);

  if (error || !data) {
    throw error || new Error("Não foi possível salvar o template.");
  }

  return data;
}

export async function deleteBriefingTemplate(templateId: string) {
  const { error } = await (supabase
    .from("briefing_templates" as never)
    .delete()
    .eq("id", templateId) as Promise<{ error: Error | null }>);

  if (error) {
    throw error;
  }
}

export function buildTemplateFieldDraft(template: BriefingTemplateRow, sortOrder: number) {
  return createFieldDraftFromTemplate(
    {
      id: template.id,
      section_name: template.section_name,
      label: template.label,
      help_text: template.help_text,
      field_type: template.field_type,
      required_default: template.required_default,
      placeholder: template.placeholder,
      options: parseBriefingOptions(template.options as never),
    },
    sortOrder,
  );
}
