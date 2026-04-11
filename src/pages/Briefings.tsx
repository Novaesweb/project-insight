import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  FolderKanban,
  Paperclip,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Send,
  Sparkles,
  User2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  briefingFieldTypeMeta,
  briefingStatusMeta,
  buildProjectBriefingSnapshot,
  createEmptyBriefingField,
  getAnswerValueDisplay,
  parseBriefingOptions,
  parseOptionsInput,
  sanitizeBriefingField,
  stringifyOptions,
  type BriefingFieldDraft,
  type ProjectBriefingStatus,
  validateBriefingFields,
} from "@/lib/project-briefings";
import { notifyClientPanel } from "@/lib/user-notifications";
import { cn } from "@/lib/utils";

type ProjectLite = Pick<Tables<"projetos">, "id" | "titulo" | "status" | "cliente_id"> & {
  clientes?: { nome: string } | { nome: string }[] | null;
};

type BriefingListItem = Tables<"project_briefings"> & {
  projetos?: ProjectLite | null;
};

type BriefingAnswerRow = Tables<"project_briefing_answers">;
type BriefingFieldRow = Tables<"project_briefing_fields">;
type BriefingAttachmentRow = Pick<
  Tables<"projeto_arquivos">,
  "id" | "briefing_field_id" | "nome" | "url" | "source" | "created_at"
>;

type BriefingEditorState = {
  id: string | null;
  projeto_id: string;
  cliente_id: string;
  titulo: string;
  instrucoes: string;
  status: ProjectBriefingStatus;
};

const emptyEditorState: BriefingEditorState = {
  id: null,
  projeto_id: "",
  cliente_id: "",
  titulo: "",
  instrucoes: "",
  status: "rascunho",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function getClientName(project?: ProjectLite | null) {
  if (!project?.clientes) return "Cliente não encontrado";
  if (Array.isArray(project.clientes)) return project.clientes[0]?.nome || "Cliente não encontrado";
  return project.clientes.nome;
}

function buildEditorFromProject(project?: ProjectLite | null): BriefingEditorState {
  return {
    id: null,
    projeto_id: project?.id || "",
    cliente_id: project?.cliente_id || "",
    titulo: project ? `Briefing do site - ${project.titulo}` : "",
    instrucoes:
      "Peça contexto real para o site. Nunca solicite senhas ou segredos; use apenas URL, login e instruções.",
    status: "rascunho",
  };
}

function toFieldDraft(field: BriefingFieldRow): BriefingFieldDraft {
  return {
    id: field.id,
    section_name: field.section_name,
    label: field.label,
    help_text: field.help_text || "",
    field_type: field.field_type as BriefingFieldDraft["field_type"],
    required: field.required,
    placeholder: field.placeholder || "",
    options: parseBriefingOptions(field.options),
    sort_order: field.sort_order,
  };
}

function formatDateTime(value?: string | null) {
  if (!value) return "Sem registro";
  return new Date(value).toLocaleString("pt-BR");
}

export default function Briefings() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectParam = searchParams.get("projeto");
  const clientParam = searchParams.get("cliente");

  const [loading, setLoading] = useState(true);
  const [briefings, setBriefings] = useState<BriefingListItem[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [selectedBriefingId, setSelectedBriefingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<BriefingEditorState>(emptyEditorState);
  const [fieldDrafts, setFieldDrafts] = useState<BriefingFieldDraft[]>([createEmptyBriefingField(0)]);
  const [persistedFieldIds, setPersistedFieldIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<BriefingAnswerRow[]>([]);
  const [attachments, setAttachments] = useState<BriefingAttachmentRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [queryApplied, setQueryApplied] = useState(false);

  const loadListData = useCallback(async () => {
    const [briefingsResponse, projectsResponse] = await Promise.all([
      supabase
        .from("project_briefings")
        .select("*, projetos(id, titulo, status, cliente_id, clientes(nome))")
        .order("updated_at", { ascending: false }),
      supabase
        .from("projetos")
        .select("id, titulo, status, cliente_id, clientes(nome)")
        .order("created_at", { ascending: false }),
    ]);

    setBriefings((briefingsResponse.data as BriefingListItem[]) || []);
    setProjects((projectsResponse.data as ProjectLite[]) || []);
    setLoading(false);
  }, []);

  const loadDetail = useCallback(async () => {
    if (!selectedBriefingId) {
      setAnswers([]);
      setAttachments([]);
      return;
    }

    const [briefingResponse, fieldsResponse, answersResponse] = await Promise.all([
      supabase.from("project_briefings").select("*").eq("id", selectedBriefingId).single(),
      supabase
        .from("project_briefing_fields")
        .select("*")
        .eq("briefing_id", selectedBriefingId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("project_briefing_answers")
        .select("*")
        .eq("briefing_id", selectedBriefingId)
        .order("updated_at", { ascending: false }),
    ]);

    const briefingRow = briefingResponse.data;
    if (!briefingRow) return;

    const parsedFields = ((fieldsResponse.data as BriefingFieldRow[]) || []).map(toFieldDraft);
    setEditor({
      id: briefingRow.id,
      projeto_id: briefingRow.projeto_id,
      cliente_id: briefingRow.cliente_id,
      titulo: briefingRow.titulo,
      instrucoes: briefingRow.instrucoes || "",
      status: briefingRow.status as ProjectBriefingStatus,
    });
    setFieldDrafts(parsedFields.length > 0 ? parsedFields : [createEmptyBriefingField(0)]);
    setPersistedFieldIds(parsedFields.map((field) => field.id));
    setAnswers((answersResponse.data as BriefingAnswerRow[]) || []);

    if (briefingRow.projeto_id) {
      const attachmentsResponse = await (supabase
        .from("projeto_arquivos" as never)
        .select("id, briefing_field_id, nome, url, source, created_at")
        .eq("projeto_id", briefingRow.projeto_id)
        .eq("source", "briefing")
        .order("created_at", { ascending: false }) as Promise<{ data: BriefingAttachmentRow[] | null }>);

      setAttachments(attachmentsResponse.data || []);
    } else {
      setAttachments([]);
    }
  }, [selectedBriefingId]);

  useEffect(() => {
    void loadListData();
  }, [loadListData]);

  useEffect(() => {
    if (queryApplied || loading) return;

    if (projectParam) {
      const existingBriefing = briefings.find((item) => item.projeto_id === projectParam);
      if (existingBriefing) {
        setSelectedBriefingId(existingBriefing.id);
      } else {
        const project = projects.find((item) => item.id === projectParam) || null;
        setEditor(buildEditorFromProject(project));
        setFieldDrafts([createEmptyBriefingField(0)]);
        setPersistedFieldIds([]);
        setAnswers([]);
        setAttachments([]);
        setSelectedBriefingId(null);
      }
      setQueryApplied(true);
      return;
    }

    if (clientParam) {
      const firstBriefing = briefings.find((item) => item.cliente_id === clientParam);
      if (firstBriefing) {
        setSelectedBriefingId(firstBriefing.id);
      }
      setQueryApplied(true);
      return;
    }

    setQueryApplied(true);
  }, [briefings, clientParam, loading, projectParam, projects, queryApplied]);

  useEffect(() => {
    if (selectedBriefingId) {
      void loadDetail();
    }
  }, [loadDetail, selectedBriefingId]);

  useRealtimeRefresh(
    [
      { table: "project_briefings" },
      { table: "projetos" },
    ],
    loadListData,
    { channelPrefix: "admin-briefings-list", debounceMs: 350 },
  );

  useRealtimeRefresh(
    selectedBriefingId
      ? [
          { table: "project_briefing_fields", filter: `briefing_id=eq.${selectedBriefingId}` },
          { table: "project_briefing_answers", filter: `briefing_id=eq.${selectedBriefingId}` },
          { table: "projeto_arquivos", filter: `projeto_id=eq.${editor.projeto_id}` },
          { table: "project_briefings", filter: `id=eq.${selectedBriefingId}` },
        ]
      : [],
    loadDetail,
    {
      enabled: Boolean(selectedBriefingId),
      channelPrefix: selectedBriefingId ? `admin-briefings-${selectedBriefingId}` : "admin-briefings",
      debounceMs: 350,
    },
  );

  const filteredBriefings = useMemo(() => {
    return briefings.filter((item) => {
      if (statusFilter !== "todos" && item.status !== statusFilter) return false;
      if (clientParam && item.cliente_id !== clientParam) return false;

      const target = `${item.titulo} ${item.projetos?.titulo || ""} ${getClientName(item.projetos)}`.toLowerCase();
      return target.includes(search.trim().toLowerCase());
    });
  }, [briefings, clientParam, search, statusFilter]);

  const availableProjects = useMemo(() => {
    return projects.filter((project) => {
      if (!project.id) return false;
      if (clientParam && project.cliente_id !== clientParam) return false;
      if (project.id === editor.projeto_id) return true;
      return !briefings.some((briefing) => briefing.projeto_id === project.id && briefing.id !== editor.id);
    });
  }, [briefings, clientParam, editor.id, editor.projeto_id, projects]);

  const answerMap = useMemo(() => {
    return answers.reduce<Record<string, string | string[]>>((accumulator, answer) => {
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
  }, [answers]);

  const groupedFields = useMemo(() => {
    return fieldDrafts.reduce<Record<string, BriefingFieldDraft[]>>((accumulator, field) => {
      const sectionName = field.section_name || "Geral";
      if (!accumulator[sectionName]) accumulator[sectionName] = [];
      accumulator[sectionName].push(field);
      return accumulator;
    }, {});
  }, [fieldDrafts]);

  const selectedBriefing = useMemo(
    () => briefings.find((item) => item.id === selectedBriefingId) || null,
    [briefings, selectedBriefingId],
  );

  const selectedProject = useMemo(
    () => projects.find((item) => item.id === editor.projeto_id) || selectedBriefing?.projetos || null,
    [editor.projeto_id, projects, selectedBriefing?.projetos],
  );

  const pipelineCounts = useMemo(() => {
    return Object.entries(briefingStatusMeta).map(([key, meta]) => ({
      key,
      label: meta.label,
      total: briefings.filter((item) => item.status === key).length,
      tone: meta.tone,
    }));
  }, [briefings]);

  const snapshot = useMemo(
    () => buildProjectBriefingSnapshot(fieldDrafts, answerMap, attachments),
    [answerMap, attachments, fieldDrafts],
  );

  const handleStartNew = (projectId?: string) => {
    const project = projects.find((item) => item.id === projectId) || null;
    setSelectedBriefingId(null);
    setEditor(buildEditorFromProject(project));
    setFieldDrafts([createEmptyBriefingField(0)]);
    setPersistedFieldIds([]);
    setAnswers([]);
    setAttachments([]);

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (project?.id) {
        next.set("projeto", project.id);
      } else {
        next.delete("projeto");
      }

      if (project?.cliente_id) {
        next.set("cliente", project.cliente_id);
      } else if (!clientParam) {
        next.delete("cliente");
      }
      return next;
    });
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId) || null;
    setEditor((current) => ({
      ...current,
      projeto_id: project?.id || "",
      cliente_id: project?.cliente_id || "",
      titulo: current.id ? current.titulo : project ? `Briefing do site - ${project.titulo}` : current.titulo,
    }));
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
    setFieldDrafts((current) => {
      const next = current.filter((field) => field.id !== fieldId);
      if (next.length === 0) return [createEmptyBriefingField(0)];
      return next.map((field, position) => ({ ...field, sort_order: position }));
    });
  };

  const addField = () => {
    setFieldDrafts((current) => [...current, createEmptyBriefingField(current.length)]);
  };

  const upsertBriefing = useCallback(
    async (mode: "draft" | "send" | "reopen" | "conclude") => {
      if (!editor.projeto_id || !editor.cliente_id) {
        throw new Error("Selecione um projeto antes de salvar o briefing.");
      }

      if (!editor.titulo.trim()) {
        throw new Error("Defina um título para o briefing.");
      }

      const sanitizedFields = fieldDrafts.map((field, index) => sanitizeBriefingField(field, index));
      if (mode !== "draft") {
        validateBriefingFields(sanitizedFields);
      }

      const now = new Date().toISOString();
      const nextStatus: ProjectBriefingStatus =
        mode === "draft"
          ? editor.status === "concluido"
            ? "concluido"
            : "rascunho"
          : mode === "send"
            ? "enviado"
            : mode === "reopen"
              ? "enviado"
              : "concluido";

      const payload = {
        id: editor.id || undefined,
        projeto_id: editor.projeto_id,
        cliente_id: editor.cliente_id,
        titulo: editor.titulo.trim(),
        instrucoes: editor.instrucoes.trim() || null,
        status: nextStatus,
        sent_at: mode === "send" || mode === "reopen" ? now : mode === "draft" ? null : selectedBriefing?.sent_at || null,
        started_at: mode === "send" || mode === "reopen" ? null : selectedBriefing?.started_at || null,
        submitted_at: mode === "send" || mode === "reopen" ? null : selectedBriefing?.submitted_at || null,
        completed_at: mode === "conclude" ? now : mode === "send" || mode === "reopen" ? null : selectedBriefing?.completed_at || null,
      };

      const { data: briefingRow, error: briefingError } = await supabase
        .from("project_briefings")
        .upsert(payload)
        .select("*")
        .single();

      if (briefingError || !briefingRow) {
        throw briefingError || new Error("Não foi possível salvar o briefing.");
      }

      const removedFieldIds = persistedFieldIds.filter(
        (fieldId) => !sanitizedFields.some((field) => field.id === fieldId),
      );

      if (removedFieldIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("project_briefing_fields")
          .delete()
          .in("id", removedFieldIds);

        if (deleteError) throw deleteError;
      }

      const fieldsPayload = sanitizedFields.map((field) => ({
        id: field.id,
        briefing_id: briefingRow.id,
        section_name: field.section_name,
        label: field.label,
        help_text: field.help_text || null,
        field_type: field.field_type,
        required: field.required,
        placeholder: field.placeholder || null,
        options:
          field.field_type === "single_choice" || field.field_type === "multi_choice"
            ? field.options
            : [],
        sort_order: field.sort_order,
      }));

      const { data: savedFields, error: fieldsError } = await supabase
        .from("project_briefing_fields")
        .upsert(fieldsPayload)
        .select("*");

      if (fieldsError) throw fieldsError;

      setSelectedBriefingId(briefingRow.id);
      setEditor({
        id: briefingRow.id,
        projeto_id: briefingRow.projeto_id,
        cliente_id: briefingRow.cliente_id,
        titulo: briefingRow.titulo,
        instrucoes: briefingRow.instrucoes || "",
        status: briefingRow.status as ProjectBriefingStatus,
      });
      setFieldDrafts(
        ((savedFields as BriefingFieldRow[]) || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(toFieldDraft),
      );
      setPersistedFieldIds(((savedFields as BriefingFieldRow[]) || []).map((field) => field.id));
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("projeto", briefingRow.projeto_id);
        next.set("cliente", briefingRow.cliente_id);
        return next;
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
          body: `${briefingRow.titulo} foi encerrado e consolidado no projeto.`,
          url: "/cliente/projetos",
        });
      }

      await loadListData();
      await loadDetail();
    },
    [
      editor,
      fieldDrafts,
      loadDetail,
      loadListData,
      persistedFieldIds,
      selectedBriefing?.completed_at,
      selectedBriefing?.sent_at,
      selectedBriefing?.started_at,
      selectedBriefing?.submitted_at,
      setSearchParams,
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
            Coleta operacional do site
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Briefings do site</h1>
            <p className="max-w-3xl text-sm text-white/55">
              Monte perguntas por projeto, envie ao cliente no portal e acompanhe respostas e anexos em tempo real.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
            onClick={() => handleStartNew()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo briefing
          </Button>
          <Button
            type="button"
            className="border-0 text-white"
            style={{ background: "var(--gradient-primary)" }}
            onClick={() => handlePersist("draft")}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar rascunho
          </Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white">Pipeline do briefing</CardTitle>
              <CardDescription className="text-white/45">
                Situação operacional dos briefings ativos por projeto.
              </CardDescription>
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
              <CardTitle className="text-white">Busca e recorte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por cliente, projeto ou título"
                  className="border-white/10 bg-white/[0.03] pl-9 text-white"
                />
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
              <CardDescription className="text-white/45">
                Clique em um briefing para revisar perguntas, respostas e anexos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[420px] pr-3">
                <div className="space-y-3">
                  {loading && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                      Carregando briefings...
                    </div>
                  )}

                  {!loading && filteredBriefings.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">
                      Nenhum briefing encontrado com esse filtro.
                    </div>
                  )}

                  {filteredBriefings.map((briefing) => {
                    const meta = briefingStatusMeta[briefing.status as ProjectBriefingStatus];
                    const active = briefing.id === selectedBriefingId;

                    return (
                      <button
                        key={briefing.id}
                        type="button"
                        onClick={() => {
                          setSelectedBriefingId(briefing.id);
                          setSearchParams((current) => {
                            const next = new URLSearchParams(current);
                            next.set("projeto", briefing.projeto_id);
                            next.set("cliente", briefing.cliente_id);
                            return next;
                          });
                        }}
                        className={cn(
                          "w-full rounded-3xl border p-4 text-left transition-all",
                          active
                            ? "border-fuchsia-400/30 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.12),rgba(194,24,91,0.14))]"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-black text-white">{briefing.titulo}</p>
                            <div className="flex flex-wrap gap-3 text-[11px] text-white/45">
                              <span className="inline-flex items-center gap-1">
                                <FolderKanban className="h-3.5 w-3.5" />
                                {briefing.projetos?.titulo || "Projeto removido"}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <User2 className="h-3.5 w-3.5" />
                                {getClientName(briefing.projetos)}
                              </span>
                            </div>
                          </div>
                          <Badge className={cn("border", meta.tone)}>{meta.label}</Badge>
                        </div>
                        <p className="mt-3 text-xs text-white/50">{meta.helper}</p>
                        <p className="mt-3 text-[11px] text-white/35">
                          Atualizado em {formatDateTime(briefing.updated_at)}
                        </p>
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
                  <CardTitle className="text-white">Editor do briefing</CardTitle>
                  <CardDescription className="text-white/45">
                    Configure o projeto, as instruções e as perguntas que o cliente verá em <code>/cliente/dados</code>.
                  </CardDescription>
                </div>
                {editor.status && (
                  <Badge className={cn("border", briefingStatusMeta[editor.status].tone)}>
                    {briefingStatusMeta[editor.status].label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Projeto</Label>
                  <Select value={editor.projeto_id || ""} onValueChange={handleProjectChange}>
                    <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.titulo} • {getClientName(project)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Cliente</Label>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white">
                    {selectedProject ? getClientName(selectedProject) : "Selecione um projeto"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Título do briefing</Label>
                <Input
                  value={editor.titulo}
                  onChange={(event) => setEditor((current) => ({ ...current, titulo: event.target.value }))}
                  placeholder="Ex: Briefing do site institucional"
                  className="border-white/10 bg-white/[0.03] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Instruções para o cliente</Label>
                <Textarea
                  value={editor.instrucoes}
                  onChange={(event) => setEditor((current) => ({ ...current, instrucoes: event.target.value }))}
                  className="min-h-[100px] border-white/10 bg-white/[0.03] text-white"
                  placeholder="Explique como responder, o que anexar e o que não deve ser enviado."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white">Perguntas do briefing</p>
                    <p className="text-xs text-white/45">Monte a coleta exatamente como o projeto exige.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                    onClick={addField}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova pergunta
                  </Button>
                </div>

                <div className="space-y-4">
                  {fieldDrafts.map((field, index) => (
                    <div key={field.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
                          <FileText className="h-3.5 w-3.5" />
                          Pergunta {index + 1}
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="ghost" className="text-white/60 hover:text-white" onClick={() => moveField(field.id, -1)} disabled={index === 0}>
                            ↑
                          </Button>
                          <Button type="button" size="sm" variant="ghost" className="text-white/60 hover:text-white" onClick={() => moveField(field.id, 1)} disabled={index === fieldDrafts.length - 1}>
                            ↓
                          </Button>
                          <Button type="button" size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200" onClick={() => removeField(field.id)}>
                            Remover
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Seção</Label>
                          <Input
                            value={field.section_name}
                            onChange={(event) => handleFieldChange(field.id, { section_name: event.target.value })}
                            className="border-white/10 bg-white/[0.03] text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Tipo de campo</Label>
                          <Select
                            value={field.field_type}
                            onValueChange={(value) =>
                              handleFieldChange(field.id, {
                                field_type: value as BriefingFieldDraft["field_type"],
                                options:
                                  value === "single_choice" || value === "multi_choice"
                                    ? field.options
                                    : [],
                              })
                            }
                          >
                            <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {briefingFieldTypeMeta.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Pergunta</Label>
                        <Input
                          value={field.label}
                          onChange={(event) => handleFieldChange(field.id, { label: event.target.value })}
                          placeholder="Ex: Qual é o principal objetivo do site?"
                          className="border-white/10 bg-white/[0.03] text-white"
                        />
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="space-y-2">
                          <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Ajuda / contexto</Label>
                          <Textarea
                            value={field.help_text}
                            onChange={(event) => handleFieldChange(field.id, { help_text: event.target.value })}
                            placeholder="Ex: explique o tipo de material desejado."
                            className="min-h-[88px] border-white/10 bg-white/[0.03] text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-white">Obrigatória</p>
                            <p className="text-xs text-white/45">Bloqueia envio final se ficar vazia</p>
                          </div>
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => handleFieldChange(field.id, { required: checked })}
                          />
                        </div>
                      </div>

                      {(field.field_type === "short_text" || field.field_type === "long_text" || field.field_type === "url") && (
                        <div className="mt-4 space-y-2">
                          <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Placeholder</Label>
                          <Input
                            value={field.placeholder}
                            onChange={(event) => handleFieldChange(field.id, { placeholder: event.target.value })}
                            className="border-white/10 bg-white/[0.03] text-white"
                          />
                        </div>
                      )}

                      {(field.field_type === "single_choice" || field.field_type === "multi_choice") && (
                        <div className="mt-4 space-y-2">
                          <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Opções</Label>
                          <Input
                            value={stringifyOptions(field.options)}
                            onChange={(event) => handleFieldChange(field.id, { options: parseOptionsInput(event.target.value) })}
                            placeholder="Ex: Institucional, Vendas, Catálogo"
                            className="border-white/10 bg-white/[0.03] text-white"
                          />
                          <p className="text-[11px] text-white/35">Separe por vírgula. O cliente verá essas opções no portal.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <Button
                  type="button"
                  className="border-0 text-white"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={() => handlePersist("draft")}
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar rascunho
                </Button>

                <Button
                  type="button"
                  className="border-0 bg-emerald-500 text-white hover:bg-emerald-400"
                  onClick={() => handlePersist(editor.status === "respondido" ? "reopen" : "send")}
                  disabled={saving}
                >
                  {editor.status === "respondido" ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reabrir
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar ao cliente
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="border-cyan-400/20 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
                  onClick={() => handlePersist("conclude")}
                  disabled={saving || !editor.id}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marcar como concluído
                </Button>

                {editor.projeto_id && (
                  <Button asChild type="button" variant="ghost" className="text-white/60 hover:text-white">
                    <Link to="/admin/projetos">
                      <FolderKanban className="mr-2 h-4 w-4" />
                      Ver projeto
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <Card className="border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Respostas recebidas</CardTitle>
                <CardDescription className="text-white/45">
                  Visão resumida do que o cliente já enviou neste briefing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {answers.length === 0 && attachments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/45">
                    Nenhuma resposta recebida ainda.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {Object.entries(groupedFields).map(([sectionName, fields]) => {
                      const visibleFields = fields.filter((field) => {
                        const value = answerMap[field.id];
                        const fieldAttachments = attachments.filter((attachment) => attachment.briefing_field_id === field.id);
                        return Boolean(getAnswerValueDisplay(value) || fieldAttachments.length > 0);
                      });

                      if (visibleFields.length === 0) return null;

                      return (
                        <div key={sectionName} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">{sectionName}</p>
                          <div className="mt-4 space-y-4">
                            {visibleFields.map((field) => {
                              const value = answerMap[field.id];
                              const fieldAttachments = attachments.filter((attachment) => attachment.briefing_field_id === field.id);
                              return (
                                <div key={field.id} className="space-y-2">
                                  <p className="text-sm font-semibold text-white">{field.label}</p>
                                  {getAnswerValueDisplay(value) && (
                                    <p className="text-sm leading-relaxed text-white/65">{getAnswerValueDisplay(value)}</p>
                                  )}
                                  {fieldAttachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {fieldAttachments.map((attachment) => (
                                        <a
                                          key={attachment.id}
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/75 transition hover:bg-white/[0.08]"
                                        >
                                          <Paperclip className="h-3.5 w-3.5" />
                                          {attachment.nome}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Snapshot do projeto</CardTitle>
                <CardDescription className="text-white/45">
                  O resumo abaixo alimenta <code>projetos.briefing</code> e <code>projetos.referencias</code> quando o cliente envia o briefing final.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Resumo consolidado</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/65">
                    {snapshot.briefing || "Ainda não existe material suficiente para consolidar o resumo do projeto."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Referências e links</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/65">
                    {snapshot.referencias || "Sem links ou anexos vinculados até o momento."}
                  </p>
                </div>

                {selectedBriefing && (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                    <p>Enviado: {formatDateTime(selectedBriefing.sent_at)}</p>
                    <p>Iniciado: {formatDateTime(selectedBriefing.started_at)}</p>
                    <p>Respondido: {formatDateTime(selectedBriefing.submitted_at)}</p>
                    <p>Concluído: {formatDateTime(selectedBriefing.completed_at)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
