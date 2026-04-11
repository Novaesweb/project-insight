import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  FileText,
  FolderKanban,
  Paperclip,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Send,
  Sparkles,
  Trash2,
  User2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  activeClientBriefingStatuses,
  briefingFieldTypeMeta,
  briefingStatusMeta,
  buildBriefingSnapshot,
  buildBriefingTitle,
  createEmptyBriefingField,
  createFieldDraftFromTemplate,
  getTemplateSearchText,
  parseBriefingOptions,
  parseOptionsInput,
  sanitizeBriefingField,
  serializeBriefingOptions,
  stringifyOptions,
  type BriefingAnswerMap,
  type BriefingAttachmentLike,
  type BriefingFieldDraft,
  type BriefingTemplate,
  type ClientBriefingStatus,
  validateBriefingFields,
} from "@/lib/project-briefings";
import { notifyClientPanel } from "@/lib/user-notifications";
import { cn } from "@/lib/utils";

type ClientLite = Pick<
  Tables<"clientes">,
  "id" | "nome" | "nome_empresa" | "email" | "status" | "bloqueado"
>;

type ProjectLite = Pick<Tables<"projetos">, "id" | "titulo" | "status">;

type ClientBriefingRow = {
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

type BriefingTemplateRow = {
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

type BriefingFieldRow = {
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

type BriefingAnswerRow = {
  id: string;
  briefing_id: string;
  field_id: string;
  cliente_id: string;
  answer_text: string | null;
  answer_json: unknown;
  updated_at: string;
};

type BriefingAttachmentRow = {
  id: string;
  briefing_id: string;
  field_id: string | null;
  cliente_id: string;
  nome: string;
  url: string;
  storage_path: string;
  created_at: string;
};

type BriefingEditorState = {
  id: string | null;
  cliente_id: string;
  projeto_id: string | null;
  titulo: string;
  instrucoes: string;
  status: ClientBriefingStatus;
  snapshot_briefing: string;
  snapshot_references: string;
};

const emptyEditorState: BriefingEditorState = {
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function getClientDisplayName(client?: ClientLite | ClientLite[] | null) {
  if (!client) return "Cliente não encontrado";
  const value = Array.isArray(client) ? client[0] : client;
  return value?.nome_empresa?.trim() || value?.nome?.trim() || "Cliente não encontrado";
}

function getProjectTitle(project?: ProjectLite | ProjectLite[] | null) {
  if (!project) return null;
  const value = Array.isArray(project) ? project[0] : project;
  return value?.titulo || null;
}

function formatDateTime(value?: string | null) {
  if (!value) return "Sem registro";
  return new Date(value).toLocaleString("pt-BR");
}

function buildEditorFromClient(client?: ClientLite | null): BriefingEditorState {
  return {
    ...emptyEditorState,
    cliente_id: client?.id || "",
    titulo: buildBriefingTitle(getClientDisplayName(client || null)),
  };
}

function toFieldDraft(field: BriefingFieldRow): BriefingFieldDraft {
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

function buildAnswerMap(rows: BriefingAnswerRow[]): BriefingAnswerMap {
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

function suggestProjectTitle(
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

export default function Briefings() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const clientParam = searchParams.get("cliente");

  const [loading, setLoading] = useState(true);
  const [briefings, setBriefings] = useState<ClientBriefingRow[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [templates, setTemplates] = useState<BriefingTemplateRow[]>([]);
  const [selectedBriefingId, setSelectedBriefingId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateSection, setTemplateSection] = useState("todas");
  const [templateSelection, setTemplateSelection] = useState<string[]>([]);
  const [editor, setEditor] = useState<BriefingEditorState>(emptyEditorState);
  const [fieldDrafts, setFieldDrafts] = useState<BriefingFieldDraft[]>([]);
  const [persistedFieldIds, setPersistedFieldIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<BriefingAnswerRow[]>([]);
  const [attachments, setAttachments] = useState<BriefingAttachmentRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [queryApplied, setQueryApplied] = useState(false);

  const loadListData = useCallback(async () => {
    const [briefingsResponse, clientsResponse, templatesResponse] = await Promise.all([
      (supabase
        .from("client_briefings" as never)
        .select("*, clientes(id, nome, nome_empresa, email, status, bloqueado), projetos(id, titulo, status)")
        .order("updated_at", { ascending: false }) as Promise<{ data: ClientBriefingRow[] | null }>),
      supabase
        .from("clientes")
        .select("id, nome, nome_empresa, email, status, bloqueado")
        .eq("bloqueado", false)
        .order("nome", { ascending: true }),
      (supabase
        .from("briefing_templates" as never)
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true }) as Promise<{ data: BriefingTemplateRow[] | null }>),
    ]);

    setBriefings(briefingsResponse.data || []);
    setClients(((clientsResponse.data as ClientLite[]) || []).filter((client) => client.status !== "inativo"));
    setTemplates(templatesResponse.data || []);
    setLoading(false);
  }, []);

  const loadDetail = useCallback(async () => {
    if (!selectedBriefingId) {
      setAnswers([]);
      setAttachments([]);
      return;
    }

    const [briefingResponse, fieldsResponse, answersResponse, attachmentsResponse] = await Promise.all([
      (supabase.from("client_briefings" as never).select("*").eq("id", selectedBriefingId).single() as Promise<{ data: ClientBriefingRow | null }>),
      (supabase.from("client_briefing_fields" as never).select("*").eq("briefing_id", selectedBriefingId).order("sort_order", { ascending: true }) as Promise<{ data: BriefingFieldRow[] | null }>),
      (supabase.from("client_briefing_answers" as never).select("*").eq("briefing_id", selectedBriefingId).order("updated_at", { ascending: false }) as Promise<{ data: BriefingAnswerRow[] | null }>),
      (supabase.from("briefing_attachments" as never).select("id, briefing_id, field_id, cliente_id, nome, url, storage_path, created_at").eq("briefing_id", selectedBriefingId).order("created_at", { ascending: false }) as Promise<{ data: BriefingAttachmentRow[] | null }>),
    ]);

    const briefingRow = briefingResponse.data;
    if (!briefingRow) return;

    const parsedFields = (fieldsResponse.data || []).map(toFieldDraft);
    setEditor({
      id: briefingRow.id,
      cliente_id: briefingRow.cliente_id,
      projeto_id: briefingRow.projeto_id,
      titulo: briefingRow.titulo,
      instrucoes: briefingRow.instrucoes || emptyEditorState.instrucoes,
      status: briefingRow.status,
      snapshot_briefing: briefingRow.snapshot_briefing || "",
      snapshot_references: briefingRow.snapshot_references || "",
    });
    setFieldDrafts(parsedFields);
    setPersistedFieldIds(parsedFields.map((field) => field.id));
    setAnswers(answersResponse.data || []);
    setAttachments(attachmentsResponse.data || []);
  }, [selectedBriefingId]);

  useEffect(() => {
    void loadListData();
  }, [loadListData]);

  useEffect(() => {
    if (queryApplied || loading) return;

    if (clientParam) {
      const activeBriefing = briefings.find(
        (item) => item.cliente_id === clientParam && activeClientBriefingStatuses.includes(item.status),
      );
      const selectedClient = clients.find((item) => item.id === clientParam) || null;

      setSelectedClientId(clientParam);

      if (activeBriefing) {
        setSelectedBriefingId(activeBriefing.id);
      } else {
        setSelectedBriefingId(null);
        setEditor(buildEditorFromClient(selectedClient));
        setFieldDrafts([]);
        setPersistedFieldIds([]);
        setAnswers([]);
        setAttachments([]);
      }
      setQueryApplied(true);
      return;
    }

    const firstBriefing = briefings[0];
    if (firstBriefing) {
      setSelectedBriefingId(firstBriefing.id);
      setSelectedClientId(firstBriefing.cliente_id);
    }
    setQueryApplied(true);
  }, [briefings, clientParam, clients, loading, queryApplied]);

  useEffect(() => {
    if (selectedBriefingId) {
      void loadDetail();
    }
  }, [loadDetail, selectedBriefingId]);

  useRealtimeRefresh(
    [
      { table: "client_briefings" },
      { table: "briefing_templates" },
      { table: "clientes" },
    ],
    loadListData,
    { channelPrefix: "admin-client-briefings-list", debounceMs: 350 },
  );

  useRealtimeRefresh(
    selectedBriefingId
      ? [
          { table: "client_briefing_fields", filter: `briefing_id=eq.${selectedBriefingId}` },
          { table: "client_briefing_answers", filter: `briefing_id=eq.${selectedBriefingId}` },
          { table: "briefing_attachments", filter: `briefing_id=eq.${selectedBriefingId}` },
          { table: "client_briefings", filter: `id=eq.${selectedBriefingId}` },
        ]
      : [],
    async () => {
      await loadListData();
      await loadDetail();
    },
    {
      enabled: Boolean(selectedBriefingId),
      channelPrefix: selectedBriefingId ? `admin-client-briefing-${selectedBriefingId}` : "admin-client-briefings",
      debounceMs: 350,
    },
  );

  const selectedClient = useMemo(
    () => clients.find((item) => item.id === (editor.cliente_id || selectedClientId)) || null,
    [clients, editor.cliente_id, selectedClientId],
  );

  const selectedBriefing = useMemo(
    () => briefings.find((item) => item.id === selectedBriefingId) || null,
    [briefings, selectedBriefingId],
  );

  const answerMap = useMemo(() => buildAnswerMap(answers), [answers]);

  const snapshot = useMemo(
    () => buildBriefingSnapshot(fieldDrafts, answerMap, attachments as BriefingAttachmentLike[]),
    [answerMap, attachments, fieldDrafts],
  );

  const filteredBriefings = useMemo(() => {
    return briefings.filter((item) => {
      if (statusFilter !== "todos" && item.status !== statusFilter) return false;

      const target = `${item.titulo} ${getClientDisplayName(item.clientes)} ${getProjectTitle(item.projetos) || ""}`
        .toLowerCase();
      return target.includes(search.trim().toLowerCase());
    });
  }, [briefings, search, statusFilter]);

  const pipelineCounts = useMemo(() => {
    return Object.entries(briefingStatusMeta).map(([key, meta]) => ({
      key,
      label: meta.label,
      total: briefings.filter((item) => item.status === key).length,
      tone: meta.tone,
    }));
  }, [briefings]);

  const templateSections = useMemo(
    () => ["todas", ...Array.from(new Set(templates.map((template) => template.section_name)))],
    [templates],
  );

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      if (templateSection !== "todas" && template.section_name !== templateSection) return false;
      if (!templateSearch.trim()) return true;
      return getTemplateSearchText({
        section_name: template.section_name,
        label: template.label,
        help_text: template.help_text || "",
        field_type: template.field_type,
        required_default: template.required_default,
        placeholder: template.placeholder || "",
        options: [],
        slug: template.slug,
        sort_order: template.sort_order,
      }).includes(templateSearch.trim().toLowerCase());
    });
  }, [templateSearch, templateSection, templates]);

  const handleSelectClient = (clientId: string) => {
    const activeBriefing = briefings.find(
      (item) => item.cliente_id === clientId && activeClientBriefingStatuses.includes(item.status),
    );
    const client = clients.find((item) => item.id === clientId) || null;

    setSelectedClientId(clientId);
    setTemplateSelection([]);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("cliente", clientId);
      return next;
    });

    if (activeBriefing) {
      setSelectedBriefingId(activeBriefing.id);
      return;
    }

    setSelectedBriefingId(null);
    setEditor(buildEditorFromClient(client));
    setFieldDrafts([]);
    setPersistedFieldIds([]);
    setAnswers([]);
    setAttachments([]);
  };

  const handleStartDraft = () => {
    if (!selectedClient) {
      toast({
        title: "Selecione um cliente",
        description: "Escolha o cliente antes de iniciar o briefing em construção.",
        variant: "destructive",
      });
      return;
    }

    setSelectedBriefingId(null);
    setEditor(buildEditorFromClient(selectedClient));
    setFieldDrafts([]);
    setPersistedFieldIds([]);
    setAnswers([]);
    setAttachments([]);
  };

  const handleOpenBriefing = (briefing: ClientBriefingRow) => {
    setSelectedBriefingId(briefing.id);
    setSelectedClientId(briefing.cliente_id);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("cliente", briefing.cliente_id);
      return next;
    });
  };

  const handleFieldChange = (fieldId: string, patch: Partial<BriefingFieldDraft>) => {
    setFieldDrafts((current) =>
      current.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)),
    );
  };

  const moveField = (fieldId: string, direction: -1 | 1) => {
    setFieldDrafts((current) => {
      const index = current.findIndex((field) => field.id === fieldId);
      const nextIndex = index + direction;
      if (index === -1 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next.map((field, position) => ({ ...field, sort_order: position }));
    });
  };

  const removeField = (fieldId: string) => {
    setFieldDrafts((current) =>
      current
        .filter((field) => field.id !== fieldId)
        .map((field, position) => ({ ...field, sort_order: position })),
    );
  };

  const addCustomField = () => {
    setFieldDrafts((current) => [...current, createEmptyBriefingField(current.length)]);
  };

  const toggleTemplateSelection = (templateId: string, checked: boolean) => {
    setTemplateSelection((current) =>
      checked ? [...new Set([...current, templateId])] : current.filter((item) => item !== templateId),
    );
  };

  const handleAddSelectedTemplates = () => {
    if (templateSelection.length === 0) return;

    setFieldDrafts((current) => {
      const existingTemplateIds = new Set(current.map((field) => field.template_id).filter(Boolean));
      const next = [...current];

      templateSelection.forEach((templateId) => {
        if (existingTemplateIds.has(templateId)) return;
        const template = templates.find((item) => item.id === templateId);
        if (!template) return;
        next.push(
          createFieldDraftFromTemplate(
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
            next.length,
          ),
        );
      });

      return next.map((field, position) => ({ ...field, sort_order: position }));
    });

    setTemplateSelection([]);
  };

  const upsertBriefing = useCallback(
    async (mode: "draft" | "send" | "reopen" | "conclude") => {
      const clientId = editor.cliente_id || selectedClientId;
      if (!clientId) {
        throw new Error("Selecione um cliente antes de salvar o briefing.");
      }

      const client = clients.find((item) => item.id === clientId) || null;
      const sanitizedFields = fieldDrafts.map((field, index) => sanitizeBriefingField(field, index));

      if ((mode === "send" || mode === "reopen") && sanitizedFields.length === 0) {
        throw new Error("Selecione ou crie perguntas antes de enviar o briefing.");
      }

      if (mode === "send" || mode === "reopen") {
        validateBriefingFields(sanitizedFields);
      }

      const now = new Date().toISOString();
      const nextStatus: ClientBriefingStatus =
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
        completed_at: mode === "conclude" ? now : mode === "send" || mode === "reopen" ? null : selectedBriefing?.completed_at || null,
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

        setFieldDrafts(
          (savedFields || [])
            .sort((left, right) => left.sort_order - right.sort_order)
            .map(toFieldDraft),
        );
        setPersistedFieldIds((savedFields || []).map((field) => field.id));
      } else {
        setPersistedFieldIds([]);
      }

      setSelectedBriefingId(briefingRow.id);
      setSelectedClientId(briefingRow.cliente_id);
      setEditor({
        id: briefingRow.id,
        cliente_id: briefingRow.cliente_id,
        projeto_id: briefingRow.projeto_id,
        titulo: briefingRow.titulo,
        instrucoes: briefingRow.instrucoes || emptyEditorState.instrucoes,
        status: briefingRow.status,
        snapshot_briefing: briefingRow.snapshot_briefing || "",
        snapshot_references: briefingRow.snapshot_references || "",
      });

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

      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("cliente", briefingRow.cliente_id);
        return next;
      });

      await loadListData();
      await loadDetail();
    },
    [
      clients,
      editor,
      fieldDrafts,
      loadDetail,
      loadListData,
      persistedFieldIds,
      selectedBriefing,
      selectedClientId,
      setSearchParams,
      snapshot.briefing,
      snapshot.references,
    ],
  );

  const handlePersist = async (mode: "draft" | "send" | "reopen" | "conclude") => {
    setSaving(true);
    try {
      await upsertBriefing(mode);
      toast({
        title:
          mode === "draft"
            ? "Briefing salvo"
            : mode === "send"
              ? "Briefing enviado ao cliente"
              : mode === "reopen"
                ? "Briefing reaberto"
                : "Briefing concluído",
      });
    } catch (error) {
      toast({
        title: "Falha no briefing",
        description: error instanceof Error ? error.message : "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProjectFromBriefing = async () => {
    if (!selectedBriefingId || !selectedClient) return;
    if (editor.projeto_id) {
      toast({
        title: "Projeto já criado",
        description: "Esse briefing já está vinculado a um projeto.",
      });
      return;
    }

    const title = suggestProjectTitle(getClientDisplayName(selectedClient), fieldDrafts, answerMap);
    const snapshotBriefing = snapshot.briefing || editor.snapshot_briefing;
    const snapshotReferences = snapshot.references || editor.snapshot_references;

    try {
      setSaving(true);
      const { data: projectRow, error: projectError } = await supabase
        .from("projetos")
        .insert({
          cliente_id: selectedClient.id,
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
        })
        .eq("id", selectedBriefingId) as Promise<{ error: Error | null }>);

      if (briefingError) throw briefingError;

      await notifyClientPanel(selectedClient.id, {
        title: "Projeto iniciado",
        body: `${title} entrou em fase de execução com base no briefing enviado.`,
        url: "/cliente/projetos",
      });

      toast({
        title: "Projeto criado",
        description: "O projeto foi aberto com o resumo do briefing já consolidado.",
      });

      await loadListData();
      await loadDetail();
      window.location.href = "/admin/projetos";
    } catch (error) {
      toast({
        title: "Falha ao criar projeto",
        description: error instanceof Error ? error.message : "Não foi possível criar o projeto a partir do briefing.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp} className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-200">
            <Sparkles className="h-3.5 w-3.5" />
            Estratégia antes do projeto
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Briefings por cliente</h1>
            <p className="max-w-3xl text-sm text-white/55">
              Monte o briefing aos poucos, escolhendo perguntas prontas e customizadas. Envie tudo de uma vez para o cliente só quando estiver completo.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]" onClick={handleStartDraft} disabled={!selectedClientId}>
            <FilePlus2 className="mr-2 h-4 w-4" />
            Briefing em construção
          </Button>
          <Button type="button" className="border-0 text-white" style={{ background: "var(--gradient-primary)" }} onClick={() => handlePersist("draft")} disabled={saving || !selectedClientId}>
            <Save className="mr-2 h-4 w-4" />
            Salvar sem enviar
          </Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white">Pipeline do briefing</CardTitle>
              <CardDescription className="text-white/45">Acompanhe em que etapa está cada cliente antes da abertura do projeto.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {pipelineCounts.map((item) => (
                <div key={item.key} className={cn("rounded-2xl border p-4", item.tone)}>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em]">{item.label}</p>
                  <p className="mt-3 text-3xl font-black text-white">{item.total}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white">Cliente alvo</CardTitle>
              <CardDescription className="text-white/45">O briefing nasce pelo cliente. O projeto só vem depois da resposta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedClientId || ""} onValueChange={handleSelectClient}>
                <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {getClientDisplayName(client)} {client.email ? `• ${client.email}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar briefing por cliente ou título" className="border-white/10 bg-white/[0.03] pl-9 text-white" />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  {Object.entries(briefingStatusMeta).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white">Fila de briefings</CardTitle>
              <CardDescription className="text-white/45">O briefing ativo do cliente fica em construção até você decidir enviar.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[520px] pr-3">
                <div className="space-y-3">
                  {loading && <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">Carregando briefings...</div>}
                  {!loading && filteredBriefings.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">Nenhum briefing encontrado com esse filtro.</div>}
                  {filteredBriefings.map((briefing) => {
                    const meta = briefingStatusMeta[briefing.status];
                    const active = briefing.id === selectedBriefingId;

                    return (
                      <button key={briefing.id} type="button" onClick={() => handleOpenBriefing(briefing)} className={cn("w-full rounded-3xl border p-4 text-left transition-all", active ? "border-fuchsia-400/30 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.12),rgba(194,24,91,0.14))]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]")}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-black text-white">{briefing.titulo}</p>
                            <div className="flex flex-wrap gap-3 text-[11px] text-white/45">
                              <span className="inline-flex items-center gap-1"><User2 className="h-3.5 w-3.5" />{getClientDisplayName(briefing.clientes)}</span>
                              {getProjectTitle(briefing.projetos) && <span className="inline-flex items-center gap-1"><FolderKanban className="h-3.5 w-3.5" />{getProjectTitle(briefing.projetos)}</span>}
                            </div>
                          </div>
                          <Badge className={cn("border", meta.tone)}>{meta.label}</Badge>
                        </div>
                        <p className="mt-3 text-xs text-white/50">{meta.helper}</p>
                        <p className="mt-3 text-[11px] text-white/35">Atualizado em {formatDateTime(briefing.updated_at)}</p>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader className="border-b border-white/10">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle className="text-white">Briefing em construção</CardTitle>
                  <CardDescription className="text-white/45">Monte a coleta com calma, acumulando perguntas prontas e customizadas antes do envio final.</CardDescription>
                </div>
                <Badge className={cn("border", briefingStatusMeta[editor.status].tone)}>{briefingStatusMeta[editor.status].label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Cliente</Label>
                  <Select value={editor.cliente_id || selectedClientId || ""} onValueChange={handleSelectClient}>
                    <SelectTrigger className="border-white/10 bg-white/[0.03] text-white"><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                    <SelectContent>{clients.map((client) => <SelectItem key={client.id} value={client.id}>{getClientDisplayName(client)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Projeto vinculado</Label>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white">{editor.projeto_id && getProjectTitle(selectedBriefing?.projetos) ? getProjectTitle(selectedBriefing?.projetos) : "Ainda não existe projeto criado"}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Título do briefing</Label>
                <Input value={editor.titulo} onChange={(event) => setEditor((current) => ({ ...current, titulo: event.target.value }))} placeholder="Ex: Briefing do site institucional" className="border-white/10 bg-white/[0.03] text-white" />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Instruções para o cliente</Label>
                <Textarea value={editor.instrucoes} onChange={(event) => setEditor((current) => ({ ...current, instrucoes: event.target.value }))} className="min-h-[100px] border-white/10 bg-white/[0.03] text-white" placeholder="Explique como responder, o que anexar e o que não deve ser enviado." />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" className="border-0 text-white" style={{ background: "var(--gradient-primary)" }} onClick={() => handlePersist("send")} disabled={saving || !selectedClientId}><Send className="mr-2 h-4 w-4" />Enviar tudo ao cliente</Button>
                {selectedBriefing && selectedBriefing.status === "respondido" && <Button type="button" variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]" onClick={() => handlePersist("reopen")} disabled={saving}><RefreshCcw className="mr-2 h-4 w-4" />Reabrir briefing</Button>}
                {selectedBriefing && selectedBriefing.status === "respondido" && !editor.projeto_id && <Button type="button" variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15" onClick={handleCreateProjectFromBriefing} disabled={saving}><CheckCircle2 className="mr-2 h-4 w-4" />Criar projeto a partir do briefing</Button>}
                {selectedBriefing && selectedBriefing.status !== "concluido" && <Button type="button" variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]" onClick={() => handlePersist("conclude")} disabled={saving}><ClipboardList className="mr-2 h-4 w-4" />Marcar como concluído</Button>}
                {editor.projeto_id && <Button asChild variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"><Link to="/admin/projetos">Abrir projetos</Link></Button>}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white">Perguntas selecionadas</p>
                    <p className="text-xs text-white/45">Você pode acumular perguntas aqui e só enviar quando o briefing estiver redondo.</p>
                  </div>
                  <Button type="button" variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]" onClick={addCustomField}><Plus className="mr-2 h-4 w-4" />Pergunta customizada</Button>
                </div>

                {fieldDrafts.length === 0 && <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">Nenhuma pergunta adicionada ainda. Use a biblioteca pronta ou crie uma pergunta manual.</div>}

                <div className="space-y-4">
                  {fieldDrafts.map((field, index) => (
                    <div key={field.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
                          <FileText className="h-3.5 w-3.5" />Pergunta {index + 1}{field.template_id ? <span className="text-fuchsia-300">• pronta</span> : <span className="text-amber-300">• custom</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-white/60" onClick={() => moveField(field.id, -1)} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-white/60" onClick={() => moveField(field.id, 1)} disabled={index === fieldDrafts.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-300" onClick={() => removeField(field.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Seção</Label>
                          <Input value={field.section_name} onChange={(event) => handleFieldChange(field.id, { section_name: event.target.value })} className="border-white/10 bg-white/[0.03] text-white" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Tipo</Label>
                          <Select value={field.field_type} onValueChange={(value) => handleFieldChange(field.id, { field_type: value as BriefingFieldDraft["field_type"], options: value === "single_choice" || value === "multi_choice" ? field.options : [] })}>
                            <SelectTrigger className="border-white/10 bg-white/[0.03] text-white"><SelectValue /></SelectTrigger>
                            <SelectContent>{briefingFieldTypeMeta.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Pergunta</Label>
                        <Input value={field.label} onChange={(event) => handleFieldChange(field.id, { label: event.target.value })} className="border-white/10 bg-white/[0.03] text-white" placeholder="Ex: Qual é o principal diferencial do seu negócio?" />
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Ajuda / contexto</Label>
                        <Textarea value={field.help_text} onChange={(event) => handleFieldChange(field.id, { help_text: event.target.value })} className="min-h-[72px] border-white/10 bg-white/[0.03] text-white" placeholder="Explique ao cliente o tipo de resposta que você espera." />
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                          <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Placeholder</Label>
                          <Input value={field.placeholder} onChange={(event) => handleFieldChange(field.id, { placeholder: event.target.value })} className="border-white/10 bg-white/[0.03] text-white" />
                        </div>
                        <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Obrigatória</p>
                            <p className="text-xs text-white/40">Exigir resposta do cliente</p>
                          </div>
                          <Switch checked={field.required} onCheckedChange={(checked) => handleFieldChange(field.id, { required: checked })} />
                        </div>
                      </div>

                      {(field.field_type === "single_choice" || field.field_type === "multi_choice") && (
                        <div className="mt-4 space-y-2">
                          <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Opções</Label>
                          <Input value={stringifyOptions(field.options)} onChange={(event) => handleFieldChange(field.id, { options: parseOptionsInput(event.target.value) })} className="border-white/10 bg-white/[0.03] text-white" placeholder="Separe por vírgula: Instagram, Indicação, Rua / local" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white">Biblioteca de perguntas prontas</CardTitle>
              <CardDescription className="text-white/45">Base inicial de marketing da NovaesWeb. Marque várias e adicione ao briefing em construção.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <Input value={templateSearch} onChange={(event) => setTemplateSearch(event.target.value)} placeholder="Buscar pergunta pronta" className="border-white/10 bg-white/[0.03] pl-9 text-white" />
                </div>
                <Select value={templateSection} onValueChange={setTemplateSection}>
                  <SelectTrigger className="border-white/10 bg-white/[0.03] text-white"><SelectValue placeholder="Seção" /></SelectTrigger>
                  <SelectContent>{templateSections.map((section) => <SelectItem key={section} value={section}>{section === "todas" ? "Todas as seções" : section}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="button" className="border-0 text-white" style={{ background: "var(--gradient-primary)" }} onClick={handleAddSelectedTemplates} disabled={templateSelection.length === 0}><Plus className="mr-2 h-4 w-4" />Adicionar selecionadas</Button>
              </div>

              <ScrollArea className="h-[340px] pr-3">
                <div className="space-y-3">
                  {filteredTemplates.map((template) => {
                    const alreadyAdded = fieldDrafts.some((field) => field.template_id === template.id);
                    const checked = templateSelection.includes(template.id);

                    return (
                      <label key={template.id} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all", alreadyAdded ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]")}>
                        <Checkbox checked={checked || alreadyAdded} disabled={alreadyAdded} onCheckedChange={(next) => toggleTemplateSelection(template.id, Boolean(next))} className="mt-1" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-white">{template.label}</p>
                            <Badge className="border border-white/10 bg-white/5 text-white/60">{template.section_name}</Badge>
                            {alreadyAdded && <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-200">Já adicionada</Badge>}
                          </div>
                          {template.help_text && <p className="mt-2 text-xs leading-relaxed text-white/45">{template.help_text}</p>}
                          <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/35">{briefingFieldTypeMeta.find((item) => item.value === template.field_type)?.label}</p>
                        </div>
                      </label>
                    );
                  })}
                  {filteredTemplates.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">Nenhuma pergunta encontrada nesse recorte.</div>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white">Resumo recebido</CardTitle>
              <CardDescription className="text-white/45">O admin acompanha respostas e anexos sem sair desta tela.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Snapshot do briefing</p>
                <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/70">{snapshot.briefing || editor.snapshot_briefing || "Nenhuma resposta consolidada ainda."}</pre>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Links e referências</p>
                <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/70">{snapshot.references || editor.snapshot_references || "Nenhum link consolidado ainda."}</pre>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2"><Paperclip className="h-4 w-4 text-fuchsia-200" /><p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Anexos do briefing</p></div>
                <div className="mt-3 space-y-2">
                  {attachments.length === 0 && <p className="text-xs text-white/45">Nenhum anexo recebido ainda.</p>}
                  {attachments.map((file) => <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75"><span className="truncate">{file.nome}</span><span className="text-[11px] text-white/35">{formatDateTime(file.created_at)}</span></a>)}
                </div>
              </div>

              {selectedBriefing && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Status operacional</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/65">
                    <span>Enviado: {formatDateTime(selectedBriefing.sent_at)}</span>
                    <span>Iniciado: {formatDateTime(selectedBriefing.started_at)}</span>
                    <span>Respondido: {formatDateTime(selectedBriefing.submitted_at)}</span>
                    <span>Concluído: {formatDateTime(selectedBriefing.completed_at)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
