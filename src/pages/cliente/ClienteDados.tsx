import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  FolderKanban,
  Paperclip,
  Save,
  Send,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  briefingStatusMeta,
  buildProjectBriefingSnapshot,
  canClientEditBriefing,
  type BriefingAnswerMap,
  type BriefingAttachmentLike,
  type BriefingFieldDraft,
  type ProjectBriefingStatus,
} from "@/lib/project-briefings";
import { getStoredClientProfile } from "@/lib/client-portal-auth";
import { notifyAdminPanel } from "@/lib/user-notifications";

type BriefingRow = Tables<"project_briefings"> & {
  projetos?: Pick<Tables<"projetos">, "id" | "titulo" | "status"> | null;
};

type FieldRow = Tables<"project_briefing_fields">;
type AnswerRow = Tables<"project_briefing_answers">;
type AttachmentRow = Pick<Tables<"projeto_arquivos">, "id" | "briefing_field_id" | "nome" | "url" | "created_at">;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function toDraftField(field: FieldRow): BriefingFieldDraft {
  return {
    id: field.id,
    section_name: field.section_name,
    label: field.label,
    help_text: field.help_text || "",
    field_type: field.field_type as BriefingFieldDraft["field_type"],
    required: field.required,
    placeholder: field.placeholder || "",
    options: Array.isArray(field.options)
      ? field.options
          .map((option) => {
            if (!option || typeof option !== "object") return null;
            const label = typeof option.label === "string" ? option.label : "";
            const value = typeof option.value === "string" ? option.value : label;
            if (!label && !value) return null;
            return { label: label || value, value: value || label };
          })
          .filter((option): option is { label: string; value: string } => Boolean(option))
      : [],
    sort_order: field.sort_order,
  };
}

function buildDraftAnswerMap(rows: AnswerRow[]): BriefingAnswerMap {
  return rows.reduce<BriefingAnswerMap>((accumulator, answer) => {
    if (answer.answer_text?.trim()) {
      accumulator[answer.field_id] = answer.answer_text;
      return accumulator;
    }

    if (Array.isArray(answer.answer_json)) {
      accumulator[answer.field_id] = answer.answer_json.filter(
        (item): item is string => typeof item === "string",
      );
    } else {
      accumulator[answer.field_id] = "";
    }
    return accumulator;
  }, {});
}

function isAnswerFilled(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value?.trim());
}

export default function ClienteDados() {
  const cliente = getStoredClientProfile();
  const { toast } = useToast();
  const skipAutosaveRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [briefings, setBriefings] = useState<BriefingRow[]>([]);
  const [selectedBriefingId, setSelectedBriefingId] = useState<string | null>(null);
  const [fields, setFields] = useState<BriefingFieldDraft[]>([]);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [answerDrafts, setAnswerDrafts] = useState<BriefingAnswerMap>({});
  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  const [autosaving, setAutosaving] = useState(false);
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedBriefing = useMemo(
    () => briefings.find((item) => item.id === selectedBriefingId) || null,
    [briefings, selectedBriefingId],
  );

  const groupedFields = useMemo(() => {
    return fields.reduce<Record<string, BriefingFieldDraft[]>>((accumulator, field) => {
      const sectionName = field.section_name || "Geral";
      if (!accumulator[sectionName]) accumulator[sectionName] = [];
      accumulator[sectionName].push(field);
      return accumulator;
    }, {});
  }, [fields]);

  const canEdit = canClientEditBriefing(selectedBriefing?.status);

  const loadBriefings = useCallback(async () => {
    if (!cliente?.id) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("project_briefings")
      .select("*, projetos(id, titulo, status)")
      .eq("cliente_id", cliente.id)
      .order("updated_at", { ascending: false });

    const rows = (data as BriefingRow[]) || [];
    setBriefings(rows);
    setSelectedBriefingId((current) =>
      current && rows.some((item) => item.id === current) ? current : rows[0]?.id || null,
    );
    setLoading(false);
  }, [cliente?.id]);

  const loadDetail = useCallback(async () => {
    if (!selectedBriefingId || !selectedBriefing?.projeto_id) {
      setFields([]);
      setAnswers([]);
      setAttachments([]);
      setAnswerDrafts({});
      return;
    }

    const [fieldsResponse, answersResponse, attachmentsResponse] = await Promise.all([
      supabase
        .from("project_briefing_fields")
        .select("*")
        .eq("briefing_id", selectedBriefingId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("project_briefing_answers")
        .select("*")
        .eq("briefing_id", selectedBriefingId)
        .eq("cliente_id", cliente?.id || "")
        .order("updated_at", { ascending: false }),
      (supabase.from("projeto_arquivos" as never)
        .select("id, briefing_field_id, nome, url, created_at")
        .eq("projeto_id", selectedBriefing.projeto_id)
        .eq("source", "briefing")
        .order("created_at", { ascending: false }) as Promise<{ data: AttachmentRow[] | null }>),
    ]);

    const fieldRows = (fieldsResponse.data as FieldRow[]) || [];
    const answerRows = (answersResponse.data as AnswerRow[]) || [];
    setFields(fieldRows.map(toDraftField));
    setAnswers(answerRows);
    setAttachments(attachmentsResponse.data || []);
    skipAutosaveRef.current = true;
    setAnswerDrafts(buildDraftAnswerMap(answerRows));
  }, [cliente?.id, selectedBriefing?.projeto_id, selectedBriefingId]);

  useEffect(() => {
    void loadBriefings();
  }, [loadBriefings]);

  useEffect(() => {
    if (selectedBriefingId) {
      void loadDetail();
    }
  }, [loadDetail, selectedBriefingId]);

  useRealtimeRefresh(
    cliente?.id
      ? [{ table: "project_briefings", filter: `cliente_id=eq.${cliente.id}` }]
      : [],
    loadBriefings,
    { enabled: Boolean(cliente?.id), channelPrefix: `cliente-briefings-${cliente?.id}`, debounceMs: 350 },
  );

  useRealtimeRefresh(
    selectedBriefingId && selectedBriefing?.projeto_id
      ? [
          { table: "project_briefing_fields", filter: `briefing_id=eq.${selectedBriefingId}` },
          { table: "project_briefing_answers", filter: `briefing_id=eq.${selectedBriefingId}` },
          { table: "projeto_arquivos", filter: `projeto_id=eq.${selectedBriefing.projeto_id}` },
          { table: "project_briefings", filter: `id=eq.${selectedBriefingId}` },
        ]
      : [],
    async () => {
      await loadBriefings();
      await loadDetail();
    },
    {
      enabled: Boolean(selectedBriefingId && selectedBriefing?.projeto_id),
      channelPrefix: `cliente-briefing-detail-${selectedBriefingId || "idle"}`,
      debounceMs: 350,
    },
  );

  const ensureBriefingStarted = useCallback(async () => {
    if (!selectedBriefing || selectedBriefing.status !== "enviado") return;

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("project_briefings")
      .update({ status: "em_preenchimento", started_at: now })
      .eq("id", selectedBriefing.id);

    if (!error) {
      setBriefings((current) =>
        current.map((item) =>
          item.id === selectedBriefing.id
            ? { ...item, status: "em_preenchimento", started_at: now }
            : item,
        ),
      );
      await notifyAdminPanel({
        title: "Cliente iniciou o briefing",
        body: `${selectedBriefing.titulo} começou a ser preenchido no portal.`,
        url: `/admin/briefings?projeto=${selectedBriefing.projeto_id}`,
      });
    }
  }, [selectedBriefing]);

  useEffect(() => {
    if (!selectedBriefingId || !cliente?.id || !canEdit) return;
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }

    const timer = window.setTimeout(async () => {
      setAutosaving(true);
      try {
        if (Object.values(answerDrafts).some((value) => isAnswerFilled(value))) {
          await ensureBriefingStarted();
        }

        const answerFields = fields.filter((field) => field.field_type !== "file_upload");
        for (const field of answerFields) {
          const value = answerDrafts[field.id];
          if (!isAnswerFilled(value)) {
            await supabase
              .from("project_briefing_answers")
              .delete()
              .eq("briefing_id", selectedBriefingId)
              .eq("field_id", field.id)
              .eq("cliente_id", cliente.id);
            continue;
          }

          const payload = {
            briefing_id: selectedBriefingId,
            field_id: field.id,
            cliente_id: cliente.id,
            answer_text: Array.isArray(value) ? null : value.trim(),
            answer_json: Array.isArray(value) ? value : [],
          };

          await supabase.from("project_briefing_answers").upsert(payload);
        }
      } finally {
        setAutosaving(false);
      }
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [answerDrafts, canEdit, cliente?.id, ensureBriefingStarted, fields, selectedBriefingId]);

  const setFieldValue = (fieldId: string, value: string | string[]) => {
    setAnswerDrafts((current) => ({ ...current, [fieldId]: value }));
  };

  const toggleMultiChoice = (fieldId: string, optionValue: string) => {
    setAnswerDrafts((current) => {
      const currentValues = Array.isArray(current[fieldId]) ? current[fieldId] : [];
      const nextValues = currentValues.includes(optionValue)
        ? currentValues.filter((item) => item !== optionValue)
        : [...currentValues, optionValue];
      return { ...current, [fieldId]: nextValues };
    });
  };

  const handleUpload = async (fieldId: string, file?: File | null) => {
    if (!file || !selectedBriefing?.projeto_id || !cliente?.id) return;

    setUploadingFieldId(fieldId);
    try {
      await ensureBriefingStarted();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${selectedBriefing.projeto_id}/briefing/${fieldId}-${Date.now()}-${safeName}`;

      const { error: storageError } = await supabase.storage.from("projeto-arquivos").upload(path, file);
      if (storageError) throw storageError;

      const { data } = supabase.storage.from("projeto-arquivos").getPublicUrl(path);
      const { error: dbError } = await (supabase.from("projeto_arquivos" as never).insert({
        projeto_id: selectedBriefing.projeto_id,
        nome: file.name,
        url: data.publicUrl,
        tipo: file.name.split(".").pop() || file.type || "arquivo",
        tamanho: file.size,
        enviado_por: "cliente",
        source: "briefing",
        briefing_field_id: fieldId,
      }) as Promise<{ error: Error | null }>);

      if (dbError) throw dbError;

      toast({ title: "Arquivo enviado", description: "O material já está disponível para a equipe." });
      await loadDetail();
    } catch (error) {
      toast({
        title: "Falha no upload",
        description: error instanceof Error ? error.message : "Não foi possível enviar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploadingFieldId(null);
    }
  };

  const handleSubmitBriefing = async () => {
    if (!selectedBriefing || !cliente?.id || !selectedBriefing.projeto_id) return;

    for (const field of fields) {
      const value = answerDrafts[field.id];
      const fieldAttachments = attachments.filter((attachment) => attachment.briefing_field_id === field.id);
      if (field.required && field.field_type === "file_upload" && fieldAttachments.length === 0) {
        toast({
          title: "Arquivo obrigatório pendente",
          description: `Envie o material de "${field.label}" antes do envio final.`,
          variant: "destructive",
        });
        return;
      }

      if (field.required && field.field_type !== "file_upload" && !isAnswerFilled(value)) {
        toast({
          title: "Campo obrigatório pendente",
          description: `Preencha "${field.label}" antes do envio final.`,
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      await ensureBriefingStarted();
      const snapshot = buildProjectBriefingSnapshot(fields, answerDrafts, attachments as BriefingAttachmentLike[]);
      const now = new Date().toISOString();

      const { error: briefingError } = await supabase
        .from("project_briefings")
        .update({ status: "respondido", submitted_at: now })
        .eq("id", selectedBriefing.id);

      if (briefingError) throw briefingError;

      const { error: projectError } = await supabase
        .from("projetos")
        .update({ briefing: snapshot.briefing, referencias: snapshot.referencias })
        .eq("id", selectedBriefing.projeto_id);

      if (projectError) throw projectError;

      await notifyAdminPanel({
        title: "Briefing respondido pelo cliente",
        body: `${selectedBriefing.titulo} foi enviado e consolidado no projeto.`,
        url: `/admin/briefings?projeto=${selectedBriefing.projeto_id}`,
        push: true,
      });

      toast({ title: "Briefing enviado", description: "A equipe NovaesWeb já recebeu suas respostas." });
      await loadBriefings();
      await loadDetail();
    } catch (error) {
      toast({
        title: "Falha ao enviar briefing",
        description: error instanceof Error ? error.message : "Não foi possível concluir o envio.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!cliente) {
    return (
      <div className="min-h-[320px] flex items-center justify-center">
        <Card className="w-full max-w-xl border-white/10 bg-white/[0.04]">
          <CardContent className="p-8 text-center text-white/70">
            Não foi possível identificar o cliente para abrir o briefing do site.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 min-h-screen pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-200">
          <FileText className="h-3.5 w-3.5" />
          Dados do site
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">Briefing do projeto</h1>
        <p className="max-w-3xl text-sm text-white/55">
          Preencha o briefing do seu site com contexto, referências e materiais. Não envie senhas ou segredos.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-white">Seus briefings</CardTitle>
            <CardDescription className="text-white/45">
              Abra um briefing para preencher ou revisar o material já enviado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[520px] pr-3">
              <div className="space-y-3">
                {loading && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                    Carregando briefings...
                  </div>
                )}

                {!loading && briefings.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">
                    Nenhum briefing disponível no momento.
                  </div>
                )}

                {briefings.map((briefing) => {
                  const active = briefing.id === selectedBriefingId;
                  const meta = briefingStatusMeta[briefing.status as ProjectBriefingStatus];
                  return (
                    <button
                      key={briefing.id}
                      type="button"
                      onClick={() => setSelectedBriefingId(briefing.id)}
                      className={`w-full rounded-3xl border p-4 text-left transition-all ${
                        active
                          ? "border-fuchsia-400/30 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.12),rgba(194,24,91,0.14))]"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-white">{briefing.titulo}</p>
                          <p className="inline-flex items-center gap-1 text-[11px] text-white/45">
                            <FolderKanban className="h-3.5 w-3.5" />
                            {briefing.projetos?.titulo || "Projeto"}
                          </p>
                        </div>
                        <Badge className={`border ${meta.tone}`}>{meta.label}</Badge>
                      </div>
                      <p className="mt-3 text-xs text-white/50">{meta.helper}</p>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader className="border-b border-white/10">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle className="text-white">{selectedBriefing?.titulo || "Selecione um briefing"}</CardTitle>
                  <CardDescription className="text-white/45">
                    {selectedBriefing?.instrucoes || "Abra um briefing para visualizar perguntas e anexos."}
                  </CardDescription>
                </div>
                {selectedBriefing && (
                  <Badge className={`border ${briefingStatusMeta[selectedBriefing.status as ProjectBriefingStatus].tone}`}>
                    {briefingStatusMeta[selectedBriefing.status as ProjectBriefingStatus].label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {!selectedBriefing && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/45">
                  Nenhum briefing selecionado.
                </div>
              )}

              {selectedBriefing && !canEdit && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  Este briefing já foi finalizado. Se precisar alterar algo, aguarde a equipe reabrir o mesmo briefing para edição.
                </div>
              )}

              {selectedBriefing && Object.entries(groupedFields).map(([sectionName, sectionFields]) => (
                <div key={sectionName} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">{sectionName}</p>
                  <div className="mt-4 space-y-5">
                    {sectionFields.map((field) => {
                      const value = answerDrafts[field.id];
                      const fieldAttachments = attachments.filter((attachment) => attachment.briefing_field_id === field.id);
                      return (
                        <div key={field.id} className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-white">{field.label}</p>
                              {field.help_text && <p className="text-xs text-white/45">{field.help_text}</p>}
                            </div>
                            {field.required && <Badge className="border-0 bg-amber-500/15 text-amber-200">Obrigatório</Badge>}
                          </div>

                          {field.field_type === "short_text" && (
                            <Input
                              value={Array.isArray(value) ? "" : value || ""}
                              onChange={(event) => setFieldValue(field.id, event.target.value)}
                              placeholder={field.placeholder || ""}
                              className="border-white/10 bg-white/[0.03] text-white"
                              disabled={!canEdit}
                            />
                          )}

                          {field.field_type === "url" && (
                            <Input
                              value={Array.isArray(value) ? "" : value || ""}
                              onChange={(event) => setFieldValue(field.id, event.target.value)}
                              placeholder={field.placeholder || "https://"}
                              className="border-white/10 bg-white/[0.03] text-white"
                              disabled={!canEdit}
                            />
                          )}

                          {field.field_type === "long_text" && (
                            <Textarea
                              value={Array.isArray(value) ? "" : value || ""}
                              onChange={(event) => setFieldValue(field.id, event.target.value)}
                              placeholder={field.placeholder || ""}
                              className="min-h-[120px] border-white/10 bg-white/[0.03] text-white"
                              disabled={!canEdit}
                            />
                          )}

                          {field.field_type === "single_choice" && (
                            <Select
                              value={Array.isArray(value) ? "" : value || ""}
                              onValueChange={(nextValue) => setFieldValue(field.id, nextValue)}
                              disabled={!canEdit}
                            >
                              <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                                <SelectValue placeholder="Selecione uma opção" />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {field.field_type === "multi_choice" && (
                            <div className="flex flex-wrap gap-2">
                              {field.options.map((option) => {
                                const selected = Array.isArray(value) && value.includes(option.value);
                                return (
                                  <Button
                                    key={option.value}
                                    type="button"
                                    variant="outline"
                                    className={`border-white/10 ${selected ? "bg-fuchsia-500/20 text-fuchsia-100" : "bg-white/[0.03] text-white/70"}`}
                                    onClick={() => toggleMultiChoice(field.id, option.value)}
                                    disabled={!canEdit}
                                  >
                                    {option.label}
                                  </Button>
                                );
                              })}
                            </div>
                          )}

                          {field.field_type === "file_upload" && (
                            <div className="space-y-3">
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
                                      <Download className="h-3.5 w-3.5" />
                                    </a>
                                  ))}
                                </div>
                              )}

                              {canEdit && (
                                <div className="relative inline-flex">
                                  <input
                                    type="file"
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    onChange={(event) => handleUpload(field.id, event.target.files?.[0] || null)}
                                    disabled={uploadingFieldId === field.id}
                                  />
                                  <Button type="button" className="border-0 text-white" style={{ background: "var(--gradient-primary)" }}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {uploadingFieldId === field.id ? "Enviando..." : "Enviar arquivo"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {selectedBriefing && (
                <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                  <Badge className="border-white/10 bg-white/[0.03] text-white/70">
                    {autosaving ? "Salvando rascunho..." : "Rascunho salvo automaticamente"}
                  </Badge>

                  {canEdit && (
                    <Button
                      type="button"
                      className="border-0 text-white"
                      style={{ background: "var(--gradient-primary)" }}
                      onClick={handleSubmitBriefing}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar briefing final
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedBriefing && (
            <Card className="border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Resumo para o projeto</CardTitle>
                <CardDescription className="text-white/45">
                  Esse material será consolidado no projeto quando o envio final for concluído.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Briefing consolidado</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/65">
                    {buildProjectBriefingSnapshot(fields, answerDrafts, attachments as BriefingAttachmentLike[]).briefing || "Sem material suficiente ainda."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Referências</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/65">
                    {buildProjectBriefingSnapshot(fields, answerDrafts, attachments as BriefingAttachmentLike[]).referencias || "Sem links ou anexos vinculados."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
