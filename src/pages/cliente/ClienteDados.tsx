import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  Paperclip,
  Save,
  Send,
  Trash2,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  BRAND_FONT_OPTIONS,
  BRAND_STYLE_OPTIONS,
  createEmptyBrandProfile,
  parseBrandStyleTags,
  sanitizeBrandProfile,
  type ClientBrandProfileDraft,
} from "@/lib/client-brand-profile";
import { evaluateContentReadiness } from "@/lib/content-validation";
import {
  briefingStatusMeta,
  buildBriefingSnapshot,
  canClientEditBriefing,
  type BriefingAnswerMap,
  type BriefingFieldDraft,
  type ClientBriefingStatus,
} from "@/lib/project-briefings";
import { getStoredClientProfile } from "@/lib/client-portal-auth";
import { notifyAdminPanel } from "@/lib/user-notifications";

type BriefingRow = {
  id: string;
  cliente_id: string;
  projeto_id: string | null;
  titulo: string;
  instrucoes: string | null;
  status: ClientBriefingStatus;
  snapshot_briefing: string | null;
  snapshot_references: string | null;
  started_at: string | null;
  submitted_at: string | null;
  updated_at: string;
  projetos?: { id: string; titulo: string; status: string } | null;
};

type FieldRow = {
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

type AnswerRow = {
  id: string;
  briefing_id: string;
  field_id: string;
  cliente_id: string;
  answer_text: string | null;
  answer_json: unknown;
  updated_at: string;
};

type AttachmentRow = {
  id: string;
  briefing_id: string;
  field_id: string | null;
  cliente_id: string;
  nome: string;
  url: string;
  storage_path: string;
  created_at: string;
};

type ClientProfileLite = {
  id: string;
  nome: string;
  nome_empresa: string | null;
  whatsapp: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  instagram: string | null;
  site_url: string | null;
};

type BrandProfileRow = {
  id: string;
  cliente_id: string;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_heading: string | null;
  font_body: string | null;
  style_tags: unknown;
  references_text: string | null;
  inspiration_links: string | null;
  notes: string | null;
  logo_url: string | null;
  logo_storage_bucket: string | null;
  logo_storage_path: string | null;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function toDraftField(field: FieldRow): BriefingFieldDraft {
  const options = Array.isArray(field.options)
    ? field.options
        .map((option) => {
          if (!option || typeof option !== "object") return null;
          const label = typeof option.label === "string" ? option.label : "";
          const value = typeof option.value === "string" ? option.value : label;
          if (!label && !value) return null;
          return { label: label || value, value: value || label };
        })
        .filter((option): option is { label: string; value: string } => Boolean(option))
    : [];

  return {
    id: field.id,
    template_id: field.template_id,
    section_name: field.section_name,
    label: field.label,
    help_text: field.help_text || "",
    field_type: field.field_type,
    required: field.required,
    placeholder: field.placeholder || "",
    options,
    sort_order: field.sort_order,
    is_custom: field.is_custom,
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
      return accumulator;
    }

    accumulator[answer.field_id] = "";
    return accumulator;
  }, {});
}

function isAnswerFilled(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value?.trim());
}

function normalizeFieldValue(field: BriefingFieldDraft, value: string | string[] | undefined) {
  if (field.field_type === "multi_choice") {
    return {
      answer_text: null,
      answer_json: Array.isArray(value) ? value : [],
    };
  }

  return {
    answer_text: typeof value === "string" ? value.trim() || null : null,
    answer_json: [],
  };
}

function toBrandProfileDraft(row?: BrandProfileRow | null, clienteId = ""): ClientBrandProfileDraft {
  const base = createEmptyBrandProfile(clienteId);
  if (!row) return base;

  return {
    id: row.id,
    cliente_id: row.cliente_id,
    primary_color: row.primary_color || base.primary_color,
    secondary_color: row.secondary_color || base.secondary_color,
    accent_color: row.accent_color || base.accent_color,
    font_heading: row.font_heading || base.font_heading,
    font_body: row.font_body || base.font_body,
    style_tags: parseBrandStyleTags(row.style_tags),
    references: row.references_text || "",
    inspiration_links: row.inspiration_links || "",
    notes: row.notes || "",
    logo_url: row.logo_url || "",
    logo_storage_bucket: row.logo_storage_bucket || base.logo_storage_bucket,
    logo_storage_path: row.logo_storage_path || "",
  };
}

export default function ClienteDados() {
  const cliente = getStoredClientProfile();
  const { toast } = useToast();
  const skipAutosaveRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState<ClientProfileLite | null>(null);
  const [briefings, setBriefings] = useState<BriefingRow[]>([]);
  const [selectedBriefingId, setSelectedBriefingId] = useState<string | null>(null);
  const [fields, setFields] = useState<BriefingFieldDraft[]>([]);
  const [answerDrafts, setAnswerDrafts] = useState<BriefingAnswerMap>({});
  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  const [brandProfile, setBrandProfile] = useState<ClientBrandProfileDraft>(createEmptyBrandProfile(cliente?.id || ""));
  const [autosaving, setAutosaving] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);
  const [uploadingBrandLogo, setUploadingBrandLogo] = useState(false);
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

    const { data } = await (supabase
      .from("client_briefings" as never)
      .select("*, projetos(id, titulo, status)")
      .eq("cliente_id", cliente.id)
      .order("updated_at", { ascending: false }) as Promise<{ data: BriefingRow[] | null }>);

    const rows = data || [];
    setBriefings(rows);
    setSelectedBriefingId((current) =>
      current && rows.some((item) => item.id === current)
        ? current
        : rows.find((item) => item.status !== "concluido")?.id || rows[0]?.id || null,
    );
    setLoading(false);
  }, [cliente?.id]);

  const loadClientInfo = useCallback(async () => {
    if (!cliente?.id) {
      setClientInfo(null);
      return;
    }

    const { data } = await supabase
      .from("clientes")
      .select("id, nome, nome_empresa, whatsapp, telefone, endereco, cidade, estado, instagram, site_url")
      .eq("id", cliente.id)
      .maybeSingle();

    setClientInfo((data as ClientProfileLite | null) || null);
  }, [cliente?.id]);

  const loadBrandProfile = useCallback(async () => {
    if (!cliente?.id) {
      setBrandProfile(createEmptyBrandProfile());
      return;
    }

    const { data } = await (supabase
      .from("client_brand_profiles" as never)
      .select("*")
      .eq("cliente_id", cliente.id)
      .maybeSingle() as Promise<{ data: BrandProfileRow | null }>);

    setBrandProfile(toBrandProfileDraft(data, cliente.id));
  }, [cliente?.id]);

  const loadDetail = useCallback(async () => {
    if (!selectedBriefingId) {
      setFields([]);
      setAttachments([]);
      setAnswerDrafts({});
      return;
    }

    const [fieldsResponse, answersResponse, attachmentsResponse] = await Promise.all([
      (supabase
        .from("client_briefing_fields" as never)
        .select("*")
        .eq("briefing_id", selectedBriefingId)
        .order("sort_order", { ascending: true }) as Promise<{ data: FieldRow[] | null }>),
      (supabase
        .from("client_briefing_answers" as never)
        .select("*")
        .eq("briefing_id", selectedBriefingId)
        .eq("cliente_id", cliente?.id || "")
        .order("updated_at", { ascending: false }) as Promise<{ data: AnswerRow[] | null }>),
      (supabase
        .from("briefing_attachments" as never)
        .select("id, briefing_id, field_id, cliente_id, nome, url, storage_path, created_at")
        .eq("briefing_id", selectedBriefingId)
        .eq("cliente_id", cliente?.id || "")
        .order("created_at", { ascending: false }) as Promise<{ data: AttachmentRow[] | null }>),
    ]);

    const fieldRows = fieldsResponse.data || [];
    const answerRows = answersResponse.data || [];
    setFields(fieldRows.map(toDraftField));
    setAttachments(attachmentsResponse.data || []);
    skipAutosaveRef.current = true;
    setAnswerDrafts(buildDraftAnswerMap(answerRows));
  }, [cliente?.id, selectedBriefingId]);

  useEffect(() => {
    void loadBriefings();
  }, [loadBriefings]);

  useEffect(() => {
    void loadClientInfo();
    void loadBrandProfile();
  }, [loadBrandProfile, loadClientInfo]);

  useEffect(() => {
    if (selectedBriefingId) {
      void loadDetail();
    }
  }, [loadDetail, selectedBriefingId]);

  useRealtimeRefresh(
    cliente?.id ? [{ table: "client_briefings", filter: `cliente_id=eq.${cliente.id}` }] : [],
    loadBriefings,
    { enabled: Boolean(cliente?.id), channelPrefix: `cliente-briefings-${cliente?.id}`, debounceMs: 350 },
  );

  useRealtimeRefresh(
    cliente?.id
      ? [
          { table: "clientes", filter: `id=eq.${cliente.id}` },
          { table: "client_brand_profiles", filter: `cliente_id=eq.${cliente.id}` },
        ]
      : [],
    async () => {
      await loadClientInfo();
      await loadBrandProfile();
    },
    { enabled: Boolean(cliente?.id), channelPrefix: `cliente-brand-${cliente?.id}`, debounceMs: 350 },
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
      await loadBriefings();
      await loadDetail();
    },
    {
      enabled: Boolean(selectedBriefingId),
      channelPrefix: `cliente-briefing-detail-${selectedBriefingId || "idle"}`,
      debounceMs: 350,
    },
  );

  const ensureBriefingStarted = useCallback(async () => {
    if (!selectedBriefing || selectedBriefing.status !== "enviado") return;

    const now = new Date().toISOString();
    const { error } = await (supabase
      .from("client_briefings" as never)
      .update({ status: "em_preenchimento", started_at: now })
      .eq("id", selectedBriefing.id) as Promise<{ error: Error | null }>);

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
        url: `/admin/briefings?cliente=${selectedBriefing.cliente_id}`,
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

        const payload = fields
          .filter((field) => field.field_type !== "file_upload")
          .map((field) => {
            const normalized = normalizeFieldValue(field, answerDrafts[field.id]);
            return {
              briefing_id: selectedBriefingId,
              field_id: field.id,
              cliente_id: cliente.id,
              ...normalized,
            };
          });

        if (payload.length > 0) {
          await (supabase.from("client_briefing_answers" as never).upsert(payload) as Promise<unknown>);
        }
      } catch (error) {
        console.error("[ClienteDados] autosave failed", error);
      } finally {
        setAutosaving(false);
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [answerDrafts, canEdit, cliente?.id, ensureBriefingStarted, fields, selectedBriefingId]);

  const contentValidation = useMemo(
    () =>
      evaluateContentReadiness({
        client: clientInfo,
        fields,
        answers: answerDrafts,
        attachments,
        summaryText: selectedBriefing?.snapshot_briefing,
        referenceText: selectedBriefing?.snapshot_references,
        brandProfile,
      }),
    [answerDrafts, attachments, brandProfile, clientInfo, fields, selectedBriefing?.snapshot_briefing, selectedBriefing?.snapshot_references],
  );

  const handleValueChange = (fieldId: string, value: string | string[]) => {
    setAnswerDrafts((current) => ({ ...current, [fieldId]: value }));
  };

  const handleMultiChoiceToggle = (fieldId: string, optionValue: string, checked: boolean) => {
    setAnswerDrafts((current) => {
      const currentValue = Array.isArray(current[fieldId]) ? current[fieldId] : [];
      const nextValue = checked
        ? [...new Set([...currentValue, optionValue])]
        : currentValue.filter((item) => item !== optionValue);
      return { ...current, [fieldId]: nextValue };
    });
  };

  const handleUpload = async (fieldId: string, file: File) => {
    if (!selectedBriefing || !cliente?.id) return;

    setUploadingFieldId(fieldId);
    try {
      await ensureBriefingStarted();
      const fileName = `briefings/${cliente.id}/${selectedBriefing.id}/${Date.now()}-${file.name}`;
      const { error: storageError } = await (supabase.storage.from("projeto-arquivos") as any).upload(fileName, file);
      if (storageError) throw storageError;

      const { data } = (supabase.storage.from("projeto-arquivos") as any).getPublicUrl(fileName);
      const { error: dbError } = await (supabase.from("briefing_attachments" as never).insert({
        briefing_id: selectedBriefing.id,
        field_id: fieldId,
        cliente_id: cliente.id,
        nome: file.name,
        url: data.publicUrl,
        storage_path: fileName,
        tipo: file.type || null,
        tamanho: file.size,
        enviado_por: "cliente",
      }) as Promise<{ error: Error | null }>);

      if (dbError) throw dbError;

      toast({ title: "Arquivo enviado" });
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

  const handleDeleteAttachment = async (attachment: AttachmentRow) => {
    try {
      await (supabase.storage.from("projeto-arquivos") as any).remove([attachment.storage_path]);
      const { error } = await (supabase
        .from("briefing_attachments" as never)
        .delete()
        .eq("id", attachment.id) as Promise<{ error: Error | null }>);
      if (error) throw error;
      await loadDetail();
    } catch (error) {
      toast({
        title: "Falha ao remover anexo",
        description: error instanceof Error ? error.message : "Não foi possível remover o arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleBrandProfileChange = <Key extends keyof ClientBrandProfileDraft>(
    key: Key,
    value: ClientBrandProfileDraft[Key],
  ) => {
    setBrandProfile((current) => ({ ...current, [key]: value }));
  };

  const toggleBrandStyle = (style: ClientBrandProfileDraft["style_tags"][number], checked: boolean) => {
    setBrandProfile((current) => ({
      ...current,
      style_tags: checked
        ? [...new Set([...current.style_tags, style])]
        : current.style_tags.filter((item) => item !== style),
    }));
  };

  const handleSaveBrandProfile = async () => {
    if (!cliente?.id) return;
    setSavingBrand(true);
    try {
      const payload = sanitizeBrandProfile(brandProfile, cliente.id);
      const { error } = await (supabase.from("client_brand_profiles" as never).upsert({
        id: payload.id,
        cliente_id: payload.cliente_id,
        primary_color: payload.primary_color,
        secondary_color: payload.secondary_color,
        accent_color: payload.accent_color,
        font_heading: payload.font_heading,
        font_body: payload.font_body,
        style_tags: payload.style_tags,
        references_text: payload.references || null,
        inspiration_links: payload.inspiration_links || null,
        notes: payload.notes || null,
        logo_url: payload.logo_url || null,
        logo_storage_bucket: payload.logo_storage_bucket,
        logo_storage_path: payload.logo_storage_path || null,
      }) as Promise<{ error: Error | null }>);

      if (error) throw error;
      toast({ title: "Identidade visual salva" });
      await loadBrandProfile();
    } catch (error) {
      toast({
        title: "Falha ao salvar identidade visual",
        description: error instanceof Error ? error.message : "Não foi possível salvar os dados visuais.",
        variant: "destructive",
      });
    } finally {
      setSavingBrand(false);
    }
  };

  const handleBrandLogoUpload = async (file: File) => {
    if (!cliente?.id) return;

    setUploadingBrandLogo(true);
    try {
      const bucket = brandProfile.logo_storage_bucket || "projeto-arquivos";
      const nextPath = `brand-profiles/${cliente.id}/${Date.now()}-${file.name}`;

      if (brandProfile.logo_storage_path) {
        await (supabase.storage.from(bucket) as any).remove([brandProfile.logo_storage_path]);
      }

      const { error: storageError } = await (supabase.storage.from(bucket) as any).upload(nextPath, file);
      if (storageError) throw storageError;

      const { data } = (supabase.storage.from(bucket) as any).getPublicUrl(nextPath);
      setBrandProfile((current) => ({
        ...current,
        cliente_id: cliente.id,
        logo_storage_bucket: bucket,
        logo_storage_path: nextPath,
        logo_url: data.publicUrl,
      }));
      toast({ title: "Logo carregada", description: "Salve a identidade visual para concluir." });
    } catch (error) {
      toast({
        title: "Falha no upload da logo",
        description: error instanceof Error ? error.message : "Não foi possível carregar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploadingBrandLogo(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBriefing || !cliente?.id) return;

    for (const field of fields) {
      if (!field.required) continue;
      if (field.field_type === "file_upload") {
        const hasFile = attachments.some((attachment) => attachment.field_id === field.id);
        if (!hasFile) {
          toast({
            title: "Campo obrigatório pendente",
            description: `Envie o arquivo solicitado em "${field.label}".`,
            variant: "destructive",
          });
          return;
        }
        continue;
      }

      if (!isAnswerFilled(answerDrafts[field.id])) {
        toast({
          title: "Campo obrigatório pendente",
          description: `Preencha "${field.label}" antes de enviar.`,
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = fields
        .filter((field) => field.field_type !== "file_upload")
        .map((field) => ({
          briefing_id: selectedBriefing.id,
          field_id: field.id,
          cliente_id: cliente.id,
          ...normalizeFieldValue(field, answerDrafts[field.id]),
        }));

      if (payload.length > 0) {
        await (supabase.from("client_briefing_answers" as never).upsert(payload) as Promise<unknown>);
      }

      const summary = buildBriefingSnapshot(fields, answerDrafts, attachments);
      const now = new Date().toISOString();
      const { error } = await (supabase
        .from("client_briefings" as never)
        .update({
          status: "respondido",
          submitted_at: now,
          snapshot_briefing: summary.briefing || null,
          snapshot_references: summary.references || null,
        })
        .eq("id", selectedBriefing.id) as Promise<{ error: Error | null }>);

      if (error) throw error;

      await notifyAdminPanel({
        title: "Cliente enviou o briefing",
        body: `${selectedBriefing.titulo} foi concluído no portal.`,
        url: `/admin/briefings?cliente=${selectedBriefing.cliente_id}`,
      });

      toast({ title: "Briefing enviado com sucesso" });
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
        <Card className="w-full max-w-2xl border-white/10 bg-white/[0.04]">
          <CardContent className="p-8 text-center text-white/70">
            Não foi possível identificar seu perfil para abrir os dados do site.
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
        <h1 className="text-2xl font-black tracking-tight text-white">Briefing do seu projeto</h1>
        <p className="max-w-2xl text-sm text-white/60">
          Responda com calma. A NovaesWeb usa esse briefing para entender sua estrutura, seu posicionamento e o tipo de site ideal para o seu negócio.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-[220px_1fr_1fr]">
        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(138,43,226,0.16),rgba(255,0,0,0.1),rgba(255,0,127,0.12))]">
          <CardContent className="p-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Completude</p>
            <div className="mt-4 text-5xl font-black text-white">{contentValidation.score}%</div>
            <p className="mt-3 text-xs text-white/45">{contentValidation.completed} de {contentValidation.total} blocos concluídos</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">O que falta de você</p>
            <div className="mt-4 space-y-2">
              {contentValidation.missing.length === 0 && <p className="text-sm text-emerald-200">Sua base já está bem preenchida. A equipe consegue seguir sem depender de mais materiais críticos.</p>}
              {contentValidation.missing.slice(0, 4).map((issue) => (
                <div key={issue.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-sm font-semibold text-white">{issue.label}</p>
                  <p className="mt-1 text-xs text-white/50">{issue.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">O que a NovaesWeb está fazendo</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-3 text-sm text-white">1. Estruturando o briefing para entender objetivo, público e conversão.</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">2. Organizando sua identidade visual para reduzir retrabalho no design.</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">3. Preparando a base para abrir o projeto com mais clareza e menos ida e volta.</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={fadeUp} className="space-y-6">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white">Seus briefings</CardTitle>
              <CardDescription className="text-white/50">
                O briefing ativo fica aqui até você concluir o envio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[520px] pr-3">
                <div className="space-y-3">
                  {loading && <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">Carregando dados...</div>}
                  {!loading && briefings.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">Nenhum briefing foi enviado para você ainda.</div>}
                  {briefings.map((briefing) => {
                    const active = briefing.id === selectedBriefingId;
                    const meta = briefingStatusMeta[briefing.status];
                    return (
                      <button key={briefing.id} type="button" onClick={() => setSelectedBriefingId(briefing.id)} className={`w-full rounded-3xl border p-4 text-left transition-all ${active ? "border-fuchsia-400/30 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.12),rgba(194,24,91,0.14))]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-white">{briefing.titulo}</p>
                            {briefing.projetos?.titulo && <p className="mt-1 text-xs text-white/45">{briefing.projetos.titulo}</p>}
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

          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white">Resumo consolidado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Briefing</p>
                <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/70">
                  {selectedBriefing?.snapshot_briefing || "Nenhum resumo consolidado ainda."}
                </pre>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Links e referências</p>
                <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/70">
                  {selectedBriefing?.snapshot_references || "Nenhum link consolidado ainda."}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(255,0,127,0.14),rgba(13,11,18,0.9),rgba(138,43,226,0.16))]">
            <CardHeader>
              <CardTitle className="text-white">Central de identidade visual</CardTitle>
              <CardDescription className="text-white/50">Defina cores, fontes, estilo e referências para orientar o design do seu site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03]">
                    {brandProfile.logo_url ? (
                      <img src={brandProfile.logo_url} alt="Logo da marca" className="max-h-[140px] max-w-full object-contain" />
                    ) : (
                      <div className="text-center text-xs text-white/40">Nenhuma logo enviada</div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 w-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                    onClick={() => document.getElementById("cliente-brand-logo-upload")?.click()}
                    disabled={uploadingBrandLogo}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadingBrandLogo ? "Enviando..." : "Enviar logo"}
                  </Button>
                  <input
                    id="cliente-brand-logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleBrandLogoUpload(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { key: "primary_color", label: "Cor principal" },
                      { key: "secondary_color", label: "Cor secundária" },
                      { key: "accent_color", label: "Cor de destaque" },
                    ].map((item) => (
                      <div key={item.key} className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                          <input
                            type="color"
                            value={brandProfile[item.key as keyof ClientBrandProfileDraft] as string}
                            onChange={(event) => handleBrandProfileChange(item.key as keyof ClientBrandProfileDraft, event.target.value as never)}
                            className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent"
                          />
                          <Input
                            value={brandProfile[item.key as keyof ClientBrandProfileDraft] as string}
                            onChange={(event) => handleBrandProfileChange(item.key as keyof ClientBrandProfileDraft, event.target.value as never)}
                            className="border-0 bg-transparent p-0 text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Fonte dos títulos</p>
                      <Select value={brandProfile.font_heading} onValueChange={(value) => handleBrandProfileChange("font_heading", value)}>
                        <SelectTrigger className="border-white/10 bg-white/[0.03] text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>{BRAND_FONT_OPTIONS.map((font) => <SelectItem key={font} value={font}>{font}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Fonte do corpo</p>
                      <Select value={brandProfile.font_body} onValueChange={(value) => handleBrandProfileChange("font_body", value)}>
                        <SelectTrigger className="border-white/10 bg-white/[0.03] text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>{BRAND_FONT_OPTIONS.map((font) => <SelectItem key={font} value={font}>{font}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Estilo visual</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {BRAND_STYLE_OPTIONS.map((option) => {
                        const checked = brandProfile.style_tags.includes(option.value);
                        return (
                          <label key={option.value} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all ${checked ? "border-fuchsia-400/30 bg-fuchsia-500/10 text-white" : "border-white/10 bg-white/[0.03] text-white/70"}`}>
                            <Checkbox checked={checked} onCheckedChange={(next) => toggleBrandStyle(option.value, Boolean(next))} />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Referências visuais</p>
                    <Textarea value={brandProfile.references} onChange={(event) => handleBrandProfileChange("references", event.target.value)} className="min-h-[80px] border-white/10 bg-white/[0.03] text-white" placeholder="Descreva o estilo ou diga que visual você quer passar." />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Links de inspiração</p>
                    <Textarea value={brandProfile.inspiration_links} onChange={(event) => handleBrandProfileChange("inspiration_links", event.target.value)} className="min-h-[80px] border-white/10 bg-white/[0.03] text-white" placeholder="Cole links de sites ou referências visuais." />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Observações da marca</p>
                    <Textarea value={brandProfile.notes} onChange={(event) => handleBrandProfileChange("notes", event.target.value)} className="min-h-[80px] border-white/10 bg-white/[0.03] text-white" placeholder="Ex.: evitar visual carregado, destacar premium, manter WhatsApp em evidência." />
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" className="border-0 text-white" style={{ background: "var(--gradient-primary)" }} onClick={handleSaveBrandProfile} disabled={savingBrand}>
                      <Save className="mr-2 h-4 w-4" />
                      {savingBrand ? "Salvando..." : "Salvar identidade visual"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-6">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader className="border-b border-white/10">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-white">{selectedBriefing?.titulo || "Dados do site"}</CardTitle>
                  <CardDescription className="text-white/50">
                    {selectedBriefing?.instrucoes || "Use este espaço para responder tudo o que a NovaesWeb precisa para planejar o seu site."}
                  </CardDescription>
                </div>
                {selectedBriefing && <Badge className={`border ${briefingStatusMeta[selectedBriefing.status].tone}`}>{briefingStatusMeta[selectedBriefing.status].label}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {!selectedBriefing && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/45">
                  Selecione um briefing para começar.
                </div>
              )}

              {selectedBriefing && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]" disabled>
                      <Save className="mr-2 h-4 w-4" />
                      {autosaving ? "Salvando..." : "Autosave ativo"}
                    </Button>
                    <Button type="button" className="border-0 text-white" style={{ background: "var(--gradient-primary)" }} onClick={handleSubmit} disabled={!canEdit || submitting}>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar briefing final
                    </Button>
                  </div>

                  {!canEdit && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                      Esse briefing está bloqueado para edição no momento. Se precisar ajustar algo, aguarde a reabertura pela equipe NovaesWeb.
                    </div>
                  )}

                  {Object.entries(groupedFields).map(([section, sectionFields]) => (
                    <div key={section} className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                      <div>
                        <h3 className="text-sm font-black text-white">{section}</h3>
                        <p className="text-xs text-white/45">Preencha esta etapa com o máximo de contexto real.</p>
                      </div>

                      {sectionFields.map((field) => {
                        const value = answerDrafts[field.id];
                        const fieldAttachments = attachments.filter((attachment) => attachment.field_id === field.id);

                        return (
                          <div key={field.id} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-white">{field.label}</p>
                              {field.required && <Badge className="border border-amber-500/20 bg-amber-500/10 text-amber-100">Obrigatória</Badge>}
                            </div>
                            {field.help_text && <p className="text-xs text-white/45">{field.help_text}</p>}

                            {(field.field_type === "short_text" || field.field_type === "url") && (
                              <Input value={typeof value === "string" ? value : ""} onChange={(event) => handleValueChange(field.id, event.target.value)} disabled={!canEdit} className="border-white/10 bg-white/[0.03] text-white" placeholder={field.placeholder || ""} />
                            )}

                            {field.field_type === "long_text" && (
                              <Textarea value={typeof value === "string" ? value : ""} onChange={(event) => handleValueChange(field.id, event.target.value)} disabled={!canEdit} className="min-h-[120px] border-white/10 bg-white/[0.03] text-white" placeholder={field.placeholder || ""} />
                            )}

                            {field.field_type === "single_choice" && (
                              <Select value={typeof value === "string" ? value : ""} onValueChange={(nextValue) => handleValueChange(field.id, nextValue)} disabled={!canEdit}>
                                <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                                  <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )}

                            {field.field_type === "multi_choice" && (
                              <div className="grid gap-3 md:grid-cols-2">
                                {field.options.map((option) => {
                                  const checked = Array.isArray(value) ? value.includes(option.value) : false;
                                  return (
                                    <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/75">
                                      <Checkbox checked={checked} disabled={!canEdit} onCheckedChange={(next) => handleMultiChoiceToggle(field.id, option.value, Boolean(next))} />
                                      <span>{option.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {field.field_type === "file_upload" && (
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                  <Button type="button" variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]" disabled={!canEdit || uploadingFieldId === field.id} onClick={() => document.getElementById(`briefing-upload-${field.id}`)?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {uploadingFieldId === field.id ? "Enviando..." : "Enviar arquivo"}
                                  </Button>
                                  <input id={`briefing-upload-${field.id}`} type="file" className="hidden" onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) void handleUpload(field.id, file);
                                    event.currentTarget.value = "";
                                  }} />
                                </div>

                                <div className="space-y-2">
                                  {fieldAttachments.length === 0 && <p className="text-xs text-white/45">Nenhum arquivo enviado ainda.</p>}
                                  {fieldAttachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                      <a href={attachment.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 text-sm text-white/75 hover:text-white">
                                        <Paperclip className="h-4 w-4" />
                                        <span className="truncate">{attachment.nome}</span>
                                      </a>
                                      {canEdit && (
                                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-300" onClick={() => handleDeleteAttachment(attachment)}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
