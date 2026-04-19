import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
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
import { briefingFieldTypeMeta, briefingStatusMeta, parseOptionsInput, stringifyOptions, type BriefingFieldDraft } from "@/lib/project-briefings";
import { cn } from "@/lib/utils";

import {
  formatDateTime,
  getClientDisplayName,
  getProjectTitle,
  getSentStatusLabel,
  hasAnswerValue,
  type BriefingAttachmentRow,
  type BriefingEditorState,
  type BriefingTemplateRow,
  type ClientBriefingRow,
  type ClientLite,
} from "./types";

type HeaderAction = {
  label: string;
  to?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  className?: string;
};

export function BriefingsPageHeader({
  title,
  description,
  eyebrow = "Estratégia antes do projeto",
  breadcrumbs = [],
  actions = [],
}: {
  title: string;
  description: string;
  eyebrow?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  actions?: HeaderAction[];
}) {
  return (
    <div className="space-y-4">
      {breadcrumbs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/35">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {item.to ? (
                <Link to={item.to} className="transition-colors hover:text-white/70">
                  {item.label}
                </Link>
              ) : (
                <span className="text-white/65">{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-200">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
            <p className="max-w-3xl text-sm text-white/55">{description}</p>
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => {
              const variant = action.variant || "outline";
              const className =
                action.className ||
                (variant === "default"
                  ? "border-0 text-white"
                  : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]");

              if (action.to) {
                return (
                  <Button key={`${action.label}-${action.to}`} asChild variant={variant} className={className}>
                    <Link to={action.to}>{action.label}</Link>
                  </Button>
                );
              }

              return (
                <Button
                  key={action.label}
                  type="button"
                  variant={variant}
                  className={className}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function BriefingsMetricsGrid({
  items,
}: {
  items: Array<{ label: string; value: string | number; helper?: string }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{item.label}</p>
          <p className="mt-2 text-3xl font-black text-white">{item.value}</p>
          {item.helper ? <p className="mt-2 text-xs text-white/45">{item.helper}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function BriefingsFiltersBar({
  clients,
  selectedClientId,
  onClientChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: {
  clients: ClientLite[];
  selectedClientId: string;
  onClientChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[260px_1fr_220px]">
      <Select value={selectedClientId} onValueChange={onClientChange}>
        <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
          <SelectValue placeholder="Selecione um cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os clientes</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {getClientDisplayName(client)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar briefing por cliente ou título"
          className="border-white/10 bg-white/[0.03] pl-9 text-white"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {Object.entries(briefingStatusMeta).map(([value, meta]) => (
            <SelectItem key={value} value={value}>
              {value === "em_preenchimento"
                ? "Parcial"
                : value === "enviado"
                  ? "Aguardando resposta"
                  : meta.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function BriefingsQueueList({
  title,
  description,
  loading,
  emptyMessage,
  items,
  activeId,
}: {
  title: string;
  description: string;
  loading?: boolean;
  emptyMessage: string;
  items: Array<{ briefing: ClientBriefingRow; to: string }>;
  activeId?: string | null;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-white/45">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[720px] pr-3">
          <div className="space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                Carregando briefings...
              </div>
            ) : null}

            {!loading && items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">
                {emptyMessage}
              </div>
            ) : null}

            {items.map(({ briefing, to }) => (
              <Link
                key={briefing.id}
                to={to}
                className={cn(
                  "block rounded-3xl border p-4 text-left transition-all",
                  briefing.id === activeId
                    ? "border-fuchsia-400/30 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.12),rgba(194,24,91,0.14))]"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white">{briefing.titulo}</p>
                    <div className="flex flex-wrap gap-3 text-[11px] text-white/45">
                      <span className="inline-flex items-center gap-1">
                        <User2 className="h-3.5 w-3.5" />
                        {getClientDisplayName(briefing.clientes)}
                      </span>
                      {getProjectTitle(briefing.projetos) ? <span>{getProjectTitle(briefing.projetos)}</span> : null}
                    </div>
                  </div>
                  <Badge className={cn("border", briefingStatusMeta[briefing.status].tone)}>
                    {getSentStatusLabel(briefing.status)}
                  </Badge>
                </div>
                <p className="mt-3 text-[11px] text-white/35">
                  Atualizado em {formatDateTime(briefing.updated_at)}
                </p>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function BriefingReadinessCard({
  title,
  clientName,
  readinessScore,
  missingCount,
  answeredFieldCount,
  pendingFieldCount,
  totalQuestions,
  statusLabel,
}: {
  title: string;
  clientName?: string;
  readinessScore: number;
  missingCount: number;
  answeredFieldCount: number;
  pendingFieldCount: number;
  totalQuestions: number;
  statusLabel: string;
}) {
  const readinessLabel = readinessScore >= 80 ? "Pronto" : readinessScore >= 50 ? "Médio" : "Baixo";
  const readinessTone =
    readinessScore >= 80
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : readinessScore >= 50
        ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
        : "border-rose-500/30 bg-rose-500/10 text-rose-200";

  return (
    <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(138,43,226,0.18),rgba(255,0,0,0.08),rgba(255,0,127,0.12))]">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Radar de prontidão</p>
            <h2 className="text-xl font-black text-white">{title || "Briefing sem título"}</h2>
            <p className="text-sm text-white/55">Cliente: {clientName || "nenhum selecionado"}</p>
          </div>
          <Badge className={cn("border", readinessTone)}>{readinessLabel}</Badge>
        </div>

        <div className="space-y-2">
          <div className="h-3 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#8A2BE2,#FF0000,#FF007F)] transition-all"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
          <div className="flex flex-wrap justify-between gap-3 text-xs text-white/55">
            <span>{readinessScore}% completo</span>
            <span>{missingCount} pendências críticas</span>
          </div>
        </div>

        <BriefingsMetricsGrid
          items={[
            { label: "Perguntas", value: totalQuestions },
            { label: "Respondidas", value: answeredFieldCount },
            { label: "Pendentes", value: pendingFieldCount },
            { label: "Status", value: statusLabel },
          ]}
        />
      </CardContent>
    </Card>
  );
}

export function BriefingEditorCard({
  mode,
  clients,
  editor,
  selectedClientId,
  selectedBriefing,
  fieldDrafts,
  saving,
  onClientChange,
  onEditorChange,
  onFieldChange,
  onMoveField,
  onRemoveField,
  onAddCustomField,
  onSaveDraft,
  onSend,
  onReopen,
  onConclude,
  onCreateProject,
}: {
  mode: "draft" | "sent";
  clients: ClientLite[];
  editor: BriefingEditorState;
  selectedClientId: string;
  selectedBriefing?: ClientBriefingRow | null;
  fieldDrafts: BriefingFieldDraft[];
  saving: boolean;
  onClientChange: (value: string) => void;
  onEditorChange: (patch: Partial<BriefingEditorState>) => void;
  onFieldChange: (fieldId: string, patch: Partial<BriefingFieldDraft>) => void;
  onMoveField: (fieldId: string, direction: -1 | 1) => void;
  onRemoveField: (fieldId: string) => void;
  onAddCustomField: () => void;
  onSaveDraft: () => void;
  onSend: () => void;
  onReopen?: () => void;
  onConclude?: () => void;
  onCreateProject?: () => void;
}) {
  const isSentContext = mode === "sent";
  const sendActionLabel =
    isSentContext || (selectedBriefing && selectedBriefing.status !== "em_construcao")
      ? "Reenviar alterações"
      : "Enviar tudo ao cliente";

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-white">
              {isSentContext ? "Briefing enviado" : "Briefing em construção"}
            </CardTitle>
            <CardDescription className="text-white/45">
              {isSentContext
                ? "Edite perguntas e instruções, mas só publique as mudanças ao cliente quando reenviar."
                : "Monte a coleta com calma antes de enviar o briefing ao cliente."}
            </CardDescription>
          </div>
          <Badge className={cn("border", briefingStatusMeta[editor.status].tone)}>
            {getSentStatusLabel(editor.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Cliente</Label>
            <Select value={editor.cliente_id || selectedClientId || ""} onValueChange={onClientChange}>
              <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {getClientDisplayName(client)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Projeto vinculado</Label>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white">
              {editor.projeto_id && getProjectTitle(selectedBriefing?.projetos)
                ? getProjectTitle(selectedBriefing?.projetos)
                : "Ainda não existe projeto criado"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Título do briefing</Label>
          <Input
            value={editor.titulo}
            onChange={(event) => onEditorChange({ titulo: event.target.value })}
            placeholder="Ex: Briefing do site institucional"
            className="border-white/10 bg-white/[0.03] text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Instruções para o cliente</Label>
          <Textarea
            value={editor.instrucoes}
            onChange={(event) => onEditorChange({ instrucoes: event.target.value })}
            className="min-h-[100px] border-white/10 bg-white/[0.03] text-white"
            placeholder="Explique como responder, o que anexar e o que não deve ser enviado."
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
            onClick={onSaveDraft}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar sem enviar
          </Button>
          <Button
            type="button"
            className="border-0 text-white"
            style={{ background: "var(--gradient-primary)" }}
            onClick={onSend}
            disabled={saving}
          >
            <Send className="mr-2 h-4 w-4" />
            {sendActionLabel}
          </Button>
          {selectedBriefing?.status === "respondido" && onReopen ? (
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              onClick={onReopen}
              disabled={saving}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reabrir briefing
            </Button>
          ) : null}
          {selectedBriefing?.status === "respondido" && !editor.projeto_id && onCreateProject ? (
            <Button
              type="button"
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
              onClick={onCreateProject}
              disabled={saving}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Criar projeto a partir do briefing
            </Button>
          ) : null}
          {selectedBriefing && selectedBriefing.status !== "concluido" && onConclude ? (
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              onClick={onConclude}
              disabled={saving}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Marcar como concluído
            </Button>
          ) : null}
          {editor.projeto_id ? (
            <Button asChild variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]">
              <Link to="/admin/projetos">
                <FolderKanban className="mr-2 h-4 w-4" />
                Abrir projetos
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-white">Perguntas selecionadas</p>
              <p className="text-xs text-white/45">
                Organize a coleta com ordem, seções e contexto claro para o cliente.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              onClick={onAddCustomField}
            >
              <Plus className="mr-2 h-4 w-4" />
              Pergunta customizada
            </Button>
          </div>

          {fieldDrafts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">
              Nenhuma pergunta adicionada ainda. Use a biblioteca pronta ou crie uma pergunta manual.
            </div>
          ) : null}

          <div className="space-y-4">
            {fieldDrafts.map((field, index) => (
              <div key={field.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
                    <FileText className="h-3.5 w-3.5" />
                    Pergunta {index + 1}
                    {field.template_id ? (
                      <span className="text-fuchsia-300">• pronta</span>
                    ) : (
                      <span className="text-amber-300">• custom</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white/60"
                      onClick={() => onMoveField(field.id, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white/60"
                      onClick={() => onMoveField(field.id, 1)}
                      disabled={index === fieldDrafts.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-300"
                      onClick={() => onRemoveField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Seção</Label>
                    <Input
                      value={field.section_name}
                      onChange={(event) => onFieldChange(field.id, { section_name: event.target.value })}
                      className="border-white/10 bg-white/[0.03] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Tipo</Label>
                    <Select
                      value={field.field_type}
                      onValueChange={(value) =>
                        onFieldChange(field.id, {
                          field_type: value as BriefingFieldDraft["field_type"],
                          options:
                            value === "single_choice" || value === "multi_choice" ? field.options : [],
                        })
                      }
                    >
                      <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {briefingFieldTypeMeta.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Pergunta</Label>
                    <Input
                      value={field.label}
                      onChange={(event) => onFieldChange(field.id, { label: event.target.value })}
                      className="border-white/10 bg-white/[0.03] text-white"
                      placeholder="Ex: Qual é o principal diferencial do seu negócio?"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Ajuda / contexto</Label>
                    <Textarea
                      value={field.help_text}
                      onChange={(event) => onFieldChange(field.id, { help_text: event.target.value })}
                      className="min-h-[72px] border-white/10 bg-white/[0.03] text-white"
                      placeholder="Explique ao cliente o tipo de resposta que você espera."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Placeholder</Label>
                    <Input
                      value={field.placeholder}
                      onChange={(event) => onFieldChange(field.id, { placeholder: event.target.value })}
                      className="border-white/10 bg-white/[0.03] text-white"
                      placeholder="Texto de apoio dentro do campo"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Obrigatória</p>
                      <p className="text-xs text-white/45">Força resposta antes do envio final.</p>
                    </div>
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => onFieldChange(field.id, { required: checked })}
                    />
                  </div>
                </div>

                {field.field_type === "single_choice" || field.field_type === "multi_choice" ? (
                  <div className="mt-4 space-y-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Opções</Label>
                    <Input
                      value={stringifyOptions(field.options)}
                      onChange={(event) =>
                        onFieldChange(field.id, { options: parseOptionsInput(event.target.value) })
                      }
                      className="border-white/10 bg-white/[0.03] text-white"
                      placeholder="Ex: Instagram, Google, Indicação"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BriefingTemplatePickerCard({
  templates,
  fieldDrafts,
  templateSelection,
  onToggleSelection,
  onAddSelected,
  templateSearch,
  onTemplateSearchChange,
  templateSection,
  onTemplateSectionChange,
}: {
  templates: BriefingTemplateRow[];
  fieldDrafts: BriefingFieldDraft[];
  templateSelection: string[];
  onToggleSelection: (templateId: string, checked: boolean) => void;
  onAddSelected: () => void;
  templateSearch: string;
  onTemplateSearchChange: (value: string) => void;
  templateSection: string;
  onTemplateSectionChange: (value: string) => void;
}) {
  const templateSections = ["todas", ...Array.from(new Set(templates.map((template) => template.section_name)))];

  const filteredTemplates = templates.filter((template) => {
    if (templateSection !== "todas" && template.section_name !== templateSection) return false;
    if (!templateSearch.trim()) return true;
    return template.label.toLowerCase().includes(templateSearch.trim().toLowerCase()) ||
      template.section_name.toLowerCase().includes(templateSearch.trim().toLowerCase()) ||
      (template.help_text || "").toLowerCase().includes(templateSearch.trim().toLowerCase());
  });

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-white">Perguntas prontas</CardTitle>
        <CardDescription className="text-white/45">
          Selecione perguntas da biblioteca ativa para acelerar a montagem.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              value={templateSearch}
              onChange={(event) => onTemplateSearchChange(event.target.value)}
              placeholder="Buscar pergunta pronta"
              className="border-white/10 bg-white/[0.03] pl-9 text-white"
            />
          </div>
          <Select value={templateSection} onValueChange={onTemplateSectionChange}>
            <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
              <SelectValue placeholder="Seção" />
            </SelectTrigger>
            <SelectContent>
              {templateSections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section === "todas" ? "Todas as seções" : section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            className="border-0 text-white"
            style={{ background: "var(--gradient-primary)" }}
            onClick={onAddSelected}
            disabled={templateSelection.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>

        <ScrollArea className="h-[360px] pr-3">
          <div className="space-y-3">
            {filteredTemplates.map((template) => {
              const alreadyAdded = fieldDrafts.some((field) => field.template_id === template.id);
              const checked = templateSelection.includes(template.id);

              return (
                <label
                  key={template.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all",
                    alreadyAdded
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
                  )}
                >
                  <Checkbox
                    checked={checked || alreadyAdded}
                    disabled={alreadyAdded}
                    onCheckedChange={(next) => onToggleSelection(template.id, Boolean(next))}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{template.label}</p>
                      <Badge className="border border-white/10 bg-white/5 text-white/60">{template.section_name}</Badge>
                      {alreadyAdded ? (
                        <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-200">
                          Já adicionada
                        </Badge>
                      ) : null}
                    </div>
                    {template.help_text ? (
                      <p className="mt-2 text-xs leading-relaxed text-white/45">{template.help_text}</p>
                    ) : null}
                    <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/35">
                      {briefingFieldTypeMeta.find((item) => item.value === template.field_type)?.label}
                    </p>
                  </div>
                </label>
              );
            })}
            {filteredTemplates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">
                Nenhuma pergunta encontrada nesse recorte.
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function BriefingSummaryCard({
  snapshotBriefing,
  snapshotReferences,
  attachments,
  selectedBriefing,
}: {
  snapshotBriefing: string;
  snapshotReferences: string;
  attachments: BriefingAttachmentRow[];
  selectedBriefing?: ClientBriefingRow | null;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-white">Resumo recebido</CardTitle>
        <CardDescription className="text-white/45">
          Snapshot consolidado, links e histórico operacional do briefing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Snapshot do briefing</p>
          <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/70">
            {snapshotBriefing || "Nenhuma resposta consolidada ainda."}
          </pre>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Links e referências</p>
          <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/70">
            {snapshotReferences || "Nenhum link consolidado ainda."}
          </pre>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-fuchsia-200" />
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Anexos do briefing</p>
          </div>
          <div className="mt-3 space-y-2">
            {attachments.length === 0 ? (
              <p className="text-xs text-white/45">Nenhum anexo recebido ainda.</p>
            ) : (
              attachments.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75"
                >
                  <span className="truncate">{file.nome}</span>
                  <span className="text-[11px] text-white/35">{formatDateTime(file.created_at)}</span>
                </a>
              ))
            )}
          </div>
        </div>

        {selectedBriefing ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Timeline operacional</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/65">
              <span>Enviado: {formatDateTime(selectedBriefing.sent_at)}</span>
              <span>Iniciado: {formatDateTime(selectedBriefing.started_at)}</span>
              <span>Respondido: {formatDateTime(selectedBriefing.submitted_at)}</span>
              <span>Concluído: {formatDateTime(selectedBriefing.completed_at)}</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function BriefingResponsePanelCard({
  responseSections,
  answerMap,
  attachments,
}: {
  responseSections: Array<{ name: string; fields: BriefingFieldDraft[] }>;
  answerMap: Record<string, string | string[]>;
  attachments: BriefingAttachmentRow[];
}) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-white">Respostas do cliente</CardTitle>
        <CardDescription className="text-white/45">
          Leitura operacional das respostas, pendências e anexos por seção.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {responseSections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">
            Nenhuma pergunta carregada para esse briefing.
          </div>
        ) : null}

        {responseSections.map((section) => (
          <div key={section.name} className="space-y-4">
            <div>
              <p className="text-sm font-black text-white">{section.name}</p>
              <p className="text-xs text-white/45">{section.fields.length} perguntas nessa seção</p>
            </div>

            <div className="space-y-3">
              {section.fields.map((field) => {
                const value = answerMap[field.id];
                const files = attachments.filter((file) => file.field_id === field.id);
                const answered =
                  field.field_type === "file_upload" ? files.length > 0 : hasAnswerValue(value);

                return (
                  <div key={field.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">{field.label}</p>
                          <Badge
                            className={cn(
                              "border",
                              answered
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                                : "border-rose-500/20 bg-rose-500/10 text-rose-200",
                            )}
                          >
                            {answered ? "Respondida" : "Pendente"}
                          </Badge>
                        </div>
                        {field.help_text ? (
                          <p className="text-xs leading-relaxed text-white/45">{field.help_text}</p>
                        ) : null}
                      </div>
                      <Badge className="border border-white/10 bg-white/5 text-white/60">
                        {briefingFieldTypeMeta.find((item) => item.value === field.field_type)?.label}
                      </Badge>
                    </div>

                    {field.field_type === "file_upload" ? (
                      <div className="mt-4 space-y-2">
                        {files.length === 0 ? (
                          <p className="text-sm text-white/45">Nenhum arquivo anexado.</p>
                        ) : (
                          files.map((file) => (
                            <a
                              key={file.id}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75"
                            >
                              <span className="truncate">{file.nome}</span>
                              <span className="text-[11px] text-white/35">{formatDateTime(file.created_at)}</span>
                            </a>
                          ))
                        )}
                      </div>
                    ) : Array.isArray(value) ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {value.length > 0 ? (
                          value.map((item) => (
                            <Badge key={item} className="border border-white/10 bg-white/[0.03] text-white/75">
                              {item}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-white/45">Resposta pendente.</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/75">
                        {typeof value === "string" && value.trim() ? value : "Resposta pendente."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function BriefingsQuickQuestionCard({
  title,
  description,
  icon,
  to,
}: {
  title: string;
  description: string;
  icon?: "draft" | "sent" | "library";
  to: string;
}) {
  const Icon = icon === "draft" ? FilePlus2 : icon === "sent" ? ClipboardList : FileText;

  return (
    <Button
      asChild
      variant="outline"
      className="h-auto justify-start rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 text-left transition-all hover:border-fuchsia-500/30 hover:bg-white/[0.06] group"
    >
      <Link to={to}>
        <div>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black/30 text-white/60 transition-colors group-hover:bg-fuchsia-500/20 group-hover:text-fuchsia-400">
            <Icon className="h-6 w-6" />
          </div>
          <p className="text-lg font-black text-white">{title}</p>
          <p className="mt-2 text-sm text-white/50">{description}</p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-200">
            Abrir
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>
    </Button>
  );
}
