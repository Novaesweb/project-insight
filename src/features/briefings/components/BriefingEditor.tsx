import { Link } from "react-router-dom";
import { 
  ArrowDown, 
  ArrowUp, 
  CheckCircle2, 
  ClipboardList, 
  FileText, 
  Plus, 
  RefreshCcw, 
  Save, 
  Send, 
  Trash2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { briefingFieldTypeMeta, briefingStatusMeta } from "@/lib/project-briefings";
import type { BriefingEditorState, ClientLite } from "../types";
import type { BriefingFieldDraft } from "@/lib/project-briefings";

interface BriefingEditorProps {
  editor: BriefingEditorState;
  setEditor: React.Dispatch<React.SetStateAction<BriefingEditorState>>;
  fieldDrafts: BriefingFieldDraft[];
  clients: ClientLite[];
  saving: boolean;
  onPersist: (mode: "draft" | "send" | "reopen" | "conclude") => void;
  onAddField: () => void;
  onRemoveField: (id: string) => void;
  onMoveField: (id: string, dir: number) => void;
  onUpdateField: (id: string, patch: Partial<BriefingFieldDraft>) => void;
  onCreateProject?: () => void;
  getSentStatusLabel: (status: any) => string;
  getClientDisplayName: (client: any) => string;
  getProjectTitle: (project: any) => string | null;
  selectedBriefing: any;
  isSentContext?: boolean;
}

export function BriefingEditor({
  editor,
  setEditor,
  fieldDrafts,
  clients,
  saving,
  onPersist,
  onAddField,
  onRemoveField,
  onMoveField,
  onUpdateField,
  onCreateProject,
  getSentStatusLabel,
  getClientDisplayName,
  getProjectTitle,
  selectedBriefing,
  isSentContext = false,
}: BriefingEditorProps) {
  const editorStatusLabel = isSentContext ? "Briefing enviado" : "Briefing em construção";
  const editorStatusDescription = isSentContext
    ? "Edite perguntas e instruções, mas só publique as mudanças ao cliente quando reenviar."
    : "Monte a coleta com calma, acumulando perguntas prontas e customizadas antes do envio final.";
  const sendActionLabel =
    isSentContext || (selectedBriefing && selectedBriefing.status !== "em_construcao")
      ? "Reenviar alterações"
      : "Enviar tudo ao cliente";

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-white">{editorStatusLabel}</CardTitle>
            <CardDescription className="text-white/45">{editorStatusDescription}</CardDescription>
          </div>
          <Badge className={cn("border", briefingStatusMeta[editor.status].tone)}>{getSentStatusLabel(editor.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Cliente</Label>
            <Select 
              value={editor.cliente_id || ""} 
              onValueChange={(val) => setEditor(curr => ({ ...curr, cliente_id: val }))}
              disabled={Boolean(editor.id)} // Prevent changing client on existing briefing for now
            >
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

        <div className="flex flex-wrap gap-2">
          <Button 
            type="button" 
            className="border-0 text-white" 
            style={{ background: "var(--gradient-primary)" }} 
            onClick={() => onPersist("send")} 
            disabled={saving || !editor.cliente_id}
          >
            <Send className="mr-2 h-4 w-4" />
            {sendActionLabel}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]" 
            onClick={() => onPersist("draft")} 
            disabled={saving || !editor.cliente_id}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar rascunho
          </Button>

          {selectedBriefing && selectedBriefing.status === "respondido" && (
            <Button 
              type="button" 
              variant="outline" 
              className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]" 
              onClick={() => onPersist("reopen")} 
              disabled={saving}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reabrir briefing
            </Button>
          )}

          {selectedBriefing && selectedBriefing.status === "respondido" && !editor.projeto_id && onCreateProject && (
            <Button 
              type="button" 
              variant="outline" 
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15" 
              onClick={onCreateProject} 
              disabled={saving}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Criar projeto
            </Button>
          )}

          {selectedBriefing && selectedBriefing.status !== "concluido" && (
            <Button 
              type="button" 
              variant="outline" 
              className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]" 
              onClick={() => onPersist("conclude")} 
              disabled={saving}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Concluir
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-white">Perguntas selecionadas</p>
              <p className="text-xs text-white/45">Acumule, reorganize e ajuste as perguntas antes de reenviar ou publicar.</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]" 
              onClick={onAddField}
            >
              <Plus className="mr-2 h-4 w-4" />
              Pergunta customizada
            </Button>
          </div>

          {fieldDrafts.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">
              Nenhuma pergunta adicionada ainda.
            </div>
          )}

          <div className="space-y-4">
            {fieldDrafts.map((field, index) => (
              <div key={field.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
                    <FileText className="h-3.5 w-3.5" />
                    Pergunta {index + 1}
                    {field.template_id ? <span className="text-fuchsia-300">• pronta</span> : <span className="text-amber-300">• custom</span>}
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
                      onChange={(event) => onUpdateField(field.id, { section_name: event.target.value })} 
                      className="border-white/10 bg-white/[0.03] text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Tipo</Label>
                    <Select 
                      value={field.field_type} 
                      onValueChange={(value) => onUpdateField(field.id, { 
                        field_type: value as any, 
                        options: value === "single_choice" || value === "multi_choice" ? field.options : [] 
                      })}
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

                <div className="mt-4 space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Pergunta</Label>
                  <Input 
                    value={field.label} 
                    onChange={(event) => onUpdateField(field.id, { label: event.target.value })} 
                    className="border-white/10 bg-white/[0.03] text-white" 
                    placeholder="Ex: Qual é o principal diferencial do seu negócio?" 
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Ajuda / contexto</Label>
                  <Textarea 
                    value={field.help_text} 
                    onChange={(event) => onUpdateField(field.id, { help_text: event.target.value })} 
                    className="min-h-[72px] border-white/10 bg-white/[0.03] text-white" 
                    placeholder="Explique ao cliente o tipo de resposta que você espera." 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
