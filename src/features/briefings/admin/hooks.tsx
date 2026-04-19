import { useCallback, useEffect, useMemo, useState } from "react";

import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { evaluateContentReadiness } from "@/lib/content-validation";
import { createEmptyBriefingField, getTemplateSearchText, type BriefingFieldDraft } from "@/lib/project-briefings";
import { buildBriefingSnapshot } from "@/lib/project-briefings";

import {
  buildAnswerMap,
  buildEditorFromClient,
  buildResponseSections,
  countBriefingStatuses,
  emptyEditorState,
  getClientDisplayName,
  hasAnswerValue,
  mapAttachmentsToSnapshot,
  type BriefingAnswerRow,
  type BriefingAttachmentRow,
  type BriefingEditorState,
  type BriefingTemplateRow,
  type ClientBriefingRow,
  type ClientLite,
} from "./types";
import {
  buildTemplateFieldDraft,
  createProjectFromAdminBriefing,
  fetchAdminBriefingDetail,
  fetchAdminBriefingsOverview,
  saveAdminBriefing,
} from "./api";

type UseAdminBriefingsOverviewOptions = {
  includeInactiveTemplates?: boolean;
};

export function useAdminBriefingsOverview({
  includeInactiveTemplates = false,
}: UseAdminBriefingsOverviewOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [briefings, setBriefings] = useState<ClientBriefingRow[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [templates, setTemplates] = useState<BriefingTemplateRow[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminBriefingsOverview({ includeInactiveTemplates });
    setBriefings(data.briefings);
    setClients(data.clients);
    setTemplates(data.templates);
    setLoading(false);
  }, [includeInactiveTemplates]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useRealtimeRefresh(
    [
      { table: "client_briefings" },
      { table: "briefing_templates" },
      { table: "clientes" },
    ],
    reload,
    {
      channelPrefix: includeInactiveTemplates ? "admin-briefings-overview-all" : "admin-briefings-overview",
      debounceMs: 350,
    },
  );

  const statusCounts = useMemo(() => countBriefingStatuses(briefings), [briefings]);

  return {
    loading,
    briefings,
    clients,
    templates,
    statusCounts,
    reload,
  };
}

type UseBriefingEditorOptions = {
  mode: "draft" | "sent";
  briefingId?: string | null;
  initialClientId?: string | null;
  clients: ClientLite[];
  briefings: ClientBriefingRow[];
  templates: BriefingTemplateRow[];
  reloadOverview: () => Promise<void>;
};

export function useBriefingEditor({
  mode,
  briefingId,
  initialClientId,
  clients,
  briefings,
  templates,
  reloadOverview,
}: UseBriefingEditorOptions) {
  const [loading, setLoading] = useState(Boolean(briefingId));
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<BriefingEditorState>(emptyEditorState);
  const [fieldDrafts, setFieldDrafts] = useState<BriefingFieldDraft[]>([]);
  const [persistedFieldIds, setPersistedFieldIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<BriefingAnswerRow[]>([]);
  const [attachments, setAttachments] = useState<BriefingAttachmentRow[]>([]);
  const [templateSelection, setTemplateSelection] = useState<string[]>([]);

  const selectedBriefing = useMemo(
    () => briefings.find((item) => item.id === (briefingId || editor.id)) || null,
    [briefingId, briefings, editor.id],
  );

  const selectedClient = useMemo(
    () => clients.find((item) => item.id === (editor.cliente_id || initialClientId || "")) || null,
    [clients, editor.cliente_id, initialClientId],
  );

  const loadDetail = useCallback(async () => {
    if (!briefingId) {
      const client = clients.find((item) => item.id === (initialClientId || "")) || null;
      setEditor(buildEditorFromClient(client));
      setFieldDrafts([]);
      setPersistedFieldIds([]);
      setAnswers([]);
      setAttachments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const detail = await fetchAdminBriefingDetail(briefingId);

    setEditor({
      id: detail.briefing.id,
      cliente_id: detail.briefing.cliente_id,
      projeto_id: detail.briefing.projeto_id,
      titulo: detail.briefing.titulo,
      instrucoes: detail.briefing.instrucoes || emptyEditorState.instrucoes,
      status: detail.briefing.status,
      snapshot_briefing: detail.briefing.snapshot_briefing || "",
      snapshot_references: detail.briefing.snapshot_references || "",
    });
    setFieldDrafts(detail.fields);
    setPersistedFieldIds(detail.fields.map((field) => field.id));
    setAnswers(detail.answers);
    setAttachments(detail.attachments);
    setLoading(false);
  }, [briefingId, clients, initialClientId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  useRealtimeRefresh(
    briefingId
      ? [
          { table: "client_briefing_fields", filter: `briefing_id=eq.${briefingId}` },
          { table: "client_briefing_answers", filter: `briefing_id=eq.${briefingId}` },
          { table: "briefing_attachments", filter: `briefing_id=eq.${briefingId}` },
          { table: "client_briefings", filter: `id=eq.${briefingId}` },
        ]
      : [],
    loadDetail,
    {
      enabled: Boolean(briefingId),
      channelPrefix: briefingId ? `admin-briefings-detail-${briefingId}` : "admin-briefings-detail-idle",
      debounceMs: 350,
    },
  );

  const answerMap = useMemo(() => buildAnswerMap(answers), [answers]);

  const snapshot = useMemo(
    () => buildBriefingSnapshot(fieldDrafts, answerMap, mapAttachmentsToSnapshot(attachments)),
    [answerMap, attachments, fieldDrafts],
  );

  const responseSections = useMemo(() => buildResponseSections(fieldDrafts), [fieldDrafts]);

  const answeredFieldCount = useMemo(
    () =>
      fieldDrafts.filter((field) => {
        if (field.field_type === "file_upload") {
          return attachments.some((file) => file.field_id === field.id);
        }

        return hasAnswerValue(answerMap[field.id]);
      }).length,
    [answerMap, attachments, fieldDrafts],
  );

  const pendingFieldCount = Math.max(fieldDrafts.length - answeredFieldCount, 0);
  const readinessScore = fieldDrafts.length === 0 ? 0 : Math.round((answeredFieldCount / fieldDrafts.length) * 100);

  const contentValidation = useMemo(
    () =>
      evaluateContentReadiness({
        client: selectedClient,
        fields: fieldDrafts,
        answers: answerMap,
        attachments,
        summaryText: snapshot.briefing || editor.snapshot_briefing,
        referenceText: snapshot.references || editor.snapshot_references,
      }),
    [
      answerMap,
      attachments,
      editor.snapshot_briefing,
      editor.snapshot_references,
      fieldDrafts,
      selectedClient,
      snapshot.briefing,
      snapshot.references,
    ],
  );

  const selectClient = useCallback(
    (clientId: string) => {
      const client = clients.find((item) => item.id === clientId) || null;
      setEditor((current) => ({
        ...(current.id ? { ...current } : buildEditorFromClient(client)),
        cliente_id: clientId,
        titulo: current.id ? current.titulo : buildEditorFromClient(client).titulo,
      }));
    },
    [clients],
  );

  const handleFieldChange = useCallback((fieldId: string, patch: Partial<BriefingFieldDraft>) => {
    setFieldDrafts((current) =>
      current.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)),
    );
  }, []);

  const moveField = useCallback((fieldId: string, direction: -1 | 1) => {
    setFieldDrafts((current) => {
      const index = current.findIndex((field) => field.id === fieldId);
      const nextIndex = index + direction;
      if (index === -1 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next.map((field, position) => ({ ...field, sort_order: position }));
    });
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setFieldDrafts((current) =>
      current
        .filter((field) => field.id !== fieldId)
        .map((field, position) => ({ ...field, sort_order: position })),
    );
  }, []);

  const addCustomField = useCallback(() => {
    setFieldDrafts((current) => [...current, createEmptyBriefingField(current.length)]);
  }, []);

  const toggleTemplateSelection = useCallback((templateId: string, checked: boolean) => {
    setTemplateSelection((current) =>
      checked ? [...new Set([...current, templateId])] : current.filter((item) => item !== templateId),
    );
  }, []);

  const addSelectedTemplates = useCallback(() => {
    if (templateSelection.length === 0) return;

    setFieldDrafts((current) => {
      const existingTemplateIds = new Set(current.map((field) => field.template_id).filter(Boolean));
      const next = [...current];

      templateSelection.forEach((templateId) => {
        if (existingTemplateIds.has(templateId)) return;
        const template = templates.find((item) => item.id === templateId);
        if (!template) return;
        next.push(buildTemplateFieldDraft(template, next.length));
      });

      return next.map((field, position) => ({ ...field, sort_order: position }));
    });

    setTemplateSelection([]);
  }, [templateSelection, templates]);

  const persist = useCallback(
    async (modeToPersist: "draft" | "send" | "reopen" | "conclude") => {
      setSaving(true);
      try {
        const result = await saveAdminBriefing({
          mode: modeToPersist,
          editor,
          fieldDrafts,
          persistedFieldIds,
          selectedClientId: editor.cliente_id || initialClientId,
          client: selectedClient,
          selectedBriefing,
          snapshot,
        });

        setEditor({
          id: result.briefing.id,
          cliente_id: result.briefing.cliente_id,
          projeto_id: result.briefing.projeto_id,
          titulo: result.briefing.titulo,
          instrucoes: result.briefing.instrucoes || emptyEditorState.instrucoes,
          status: result.briefing.status,
          snapshot_briefing: result.briefing.snapshot_briefing || "",
          snapshot_references: result.briefing.snapshot_references || "",
        });
        setFieldDrafts(result.fields);
        setPersistedFieldIds(result.fields.map((field) => field.id));
        await reloadOverview();
        if (briefingId) {
          await loadDetail();
        }
        return result.briefing;
      } finally {
        setSaving(false);
      }
    },
    [
      briefingId,
      editor,
      fieldDrafts,
      initialClientId,
      loadDetail,
      persistedFieldIds,
      reloadOverview,
      selectedBriefing,
      selectedClient,
      snapshot,
    ],
  );

  const createProject = useCallback(async () => {
    if (!selectedClient || !editor.id) {
      throw new Error("Selecione um briefing válido antes de criar o projeto.");
    }

    setSaving(true);
    try {
      const projectId = await createProjectFromAdminBriefing({
        briefingId: editor.id,
        client: selectedClient,
        editor,
        selectedBriefing,
        fieldDrafts,
        answers: answerMap,
        snapshot,
      });
      await reloadOverview();
      await loadDetail();
      return projectId;
    } finally {
      setSaving(false);
    }
  }, [answerMap, editor, fieldDrafts, loadDetail, reloadOverview, selectedBriefing, selectedClient, snapshot]);

  const filteredTemplates = useCallback(
    (templateSearch: string, templateSection: string) =>
      templates.filter((template) => {
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
      }),
    [templates],
  );

  return {
    mode,
    loading,
    saving,
    editor,
    setEditor,
    fieldDrafts,
    setFieldDrafts,
    answers,
    attachments,
    selectedClient,
    selectedBriefing,
    answerMap,
    snapshot,
    responseSections,
    answeredFieldCount,
    pendingFieldCount,
    readinessScore,
    contentValidation,
    templateSelection,
    setTemplateSelection,
    selectClient,
    handleFieldChange,
    moveField,
    removeField,
    addCustomField,
    toggleTemplateSelection,
    addSelectedTemplates,
    persist,
    createProject,
    filteredTemplates,
  };
}
