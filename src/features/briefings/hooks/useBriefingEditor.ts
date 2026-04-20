import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { briefingService } from "../services/briefing-service";
import type { BriefingEditorState, BriefingFieldRow, ClientBriefingRow } from "../types";
import { 
  buildBriefingTitle, 
  createEmptyBriefingField, 
  createFieldDraftFromTemplate, 
  toFieldDraft,
  buildBriefingSnapshot,
  type BriefingFieldDraft,
  type BriefingAttachmentLike,
  type BriefingAnswerMap
} from "../../../lib/project-briefings";
import { usePersistentDraftState } from "@/hooks/usePersistentDraftState";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { useToast } from "@/hooks/use-toast";

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

export function useBriefingEditor(briefingId?: string | null) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(Boolean(briefingId));
  const [editor, setEditor] = useState<BriefingEditorState>(emptyEditorState);
  const [fieldDrafts, setFieldDrafts] = useState<BriefingFieldDraft[]>([]);
  const [persistedFieldIds, setPersistedFieldIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [existingBriefing, setExistingBriefing] = useState<ClientBriefingRow | null>(null);

  const {
    state: draftState,
    setState: setDraftState,
    markSaved: markDraftSaved,
    isDirty: draftDirty,
    isHydrated: draftHydrated,
  } = usePersistentDraftState({
    storageKey: `briefing-editor-${briefingId || "new"}`,
    initialState: {
      editor: emptyEditorState,
      fieldDrafts: [] as BriefingFieldDraft[],
      persistedFieldIds: [] as string[],
    },
  });

  const loadDetail = useCallback(async () => {
    if (!briefingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await briefingService.getBriefingDetail(briefingId);
      const { briefing, fields, answers, attachments } = data;

      if (!briefing) return;

      setExistingBriefing(briefing);
      setAnswers(answers);
      setAttachments(attachments);

      const parsedFields = fields.map(toFieldDraft);

      if (!draftDirty || editor.id !== briefingId) {
        const nextEditor = {
          id: briefing.id,
          cliente_id: briefing.cliente_id,
          projeto_id: briefing.projeto_id,
          titulo: briefing.titulo,
          instrucoes: briefing.instrucoes || emptyEditorState.instrucoes,
          status: briefing.status,
          snapshot_briefing: briefing.snapshot_briefing || "",
          snapshot_references: briefing.snapshot_references || "",
        };
        const nextPersistedFieldIds = parsedFields.map((f) => f.id);

        setEditor(nextEditor);
        setFieldDrafts(parsedFields);
        setPersistedFieldIds(nextPersistedFieldIds);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao carregar briefing", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [briefingId, draftDirty, editor.id, toast]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (draftHydrated && draftDirty) {
      setEditor(draftState.editor);
      setFieldDrafts(draftState.fieldDrafts);
      setPersistedFieldIds(draftState.persistedFieldIds);
    }
  }, [draftHydrated, draftDirty, draftState.editor, draftState.fieldDrafts, draftState.persistedFieldIds]);

  useEffect(() => {
    if (draftHydrated) {
      setDraftState({ editor, fieldDrafts, persistedFieldIds });
    }
  }, [editor, fieldDrafts, persistedFieldIds, draftHydrated, setDraftState]);

  const answerMap = useMemo(() => {
    return answers.reduce((acc, ans) => {
      acc[ans.field_id] = ans.answer_text || ans.answer_json || "";
      return acc;
    }, {} as BriefingAnswerMap);
  }, [answers]);

  const snapshot = useMemo(() => {
    return buildBriefingSnapshot(fieldDrafts, answerMap, attachments as BriefingAttachmentLike[]);
  }, [fieldDrafts, answerMap, attachments]);

  const handlePersist = async (mode: "draft" | "send" | "reopen" | "conclude", clientName: string) => {
    try {
      setSaving(true);
      const { briefingRow, nextFieldDrafts } = await briefingService.upsertBriefing({
        editor,
        fieldDrafts,
        persistedFieldIds,
        mode,
        clientName,
        snapshot,
        existingBriefing,
      });

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
      setFieldDrafts(nextFieldDrafts);
      setPersistedFieldIds(nextFieldDrafts.map(f => f.id));
      markDraftSaved({ editor, fieldDrafts, persistedFieldIds });
      
      toast({ 
        title: mode === "send" ? "Briefing enviado" : mode === "draft" ? "Rascunho salvo" : "Briefing atualizado" 
      });
      
      return briefingRow;
    } catch (err) {
      toast({ 
        title: "Erro ao salvar briefing", 
        description: err instanceof Error ? err.message : "Erro desconhecido", 
        variant: "destructive" 
      });
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const addField = (template?: any) => {
    if (template) {
      setFieldDrafts(curr => [...curr, createFieldDraftFromTemplate(template, curr.length)]);
    } else {
      setFieldDrafts(curr => [...curr, createEmptyBriefingField(curr.length)]);
    }
  };

  const removeField = (id: string) => {
    setFieldDrafts(curr => curr.filter(f => f.id !== id).map((f, i) => ({ ...f, sort_order: i })));
  };

  const moveField = (id: string, direction: number) => {
    setFieldDrafts(curr => {
      const idx = curr.findIndex(f => f.id === id);
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= curr.length) return curr;
      const next = [...curr];
      const [item] = next.splice(idx, 1);
      next.splice(newIdx, 0, item);
      return next.map((f, i) => ({ ...f, sort_order: i }));
    });
  };

  const updateField = (id: string, patch: Partial<BriefingFieldDraft>) => {
    setFieldDrafts(curr => curr.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  return {
    editor,
    setEditor,
    fieldDrafts,
    setFieldDrafts,
    loading,
    saving,
    handlePersist,
    addField,
    removeField,
    moveField,
    updateField,
    snapshot,
    answerMap,
    attachments,
    existingBriefing,
  };
}
