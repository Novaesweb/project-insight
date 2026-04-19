import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createTemplateFormState,
  deleteBriefingTemplate,
  saveBriefingTemplate,
} from "@/features/briefings/admin/api";
import { useAdminBriefingsOverview } from "@/features/briefings/admin/hooks";
import { ADMIN_BRIEFINGS_HOME } from "@/features/briefings/admin/routes";
import type { BriefingTemplateRow } from "@/features/briefings/admin/types";
import { BriefingsPageHeader } from "@/features/briefings/admin/views";
import { briefingFieldTypeMeta } from "@/lib/project-briefings";

export default function BriefingLibraryPage() {
  const { toast } = useToast();
  const { loading, templates, reload } = useAdminBriefingsOverview({ includeInactiveTemplates: true });
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("todas");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BriefingTemplateRow | null>(null);
  const [form, setForm] = useState(createTemplateFormState());

  const sections = useMemo(
    () => Array.from(new Set(templates.map((item) => item.section_name))).sort((left, right) => left.localeCompare(right)),
    [templates],
  );

  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();

    return templates.filter((template) => {
      if (sectionFilter !== "todas" && template.section_name !== sectionFilter) return false;
      if (typeFilter !== "todos" && template.field_type !== typeFilter) return false;
      if (statusFilter === "ativas" && !template.active) return false;
      if (statusFilter === "inativas" && template.active) return false;
      if (!term) return true;

      return (
        template.label.toLowerCase().includes(term) ||
        template.section_name.toLowerCase().includes(term) ||
        (template.help_text || "").toLowerCase().includes(term)
      );
    });
  }, [search, sectionFilter, statusFilter, templates, typeFilter]);

  const openCreate = () => {
    setEditingTemplate(null);
    setForm(createTemplateFormState());
    setOpen(true);
  };

  const openEdit = (template: BriefingTemplateRow) => {
    setEditingTemplate(template);
    setForm(createTemplateFormState(template));
    setOpen(true);
  };

  const submitForm = async () => {
    setSubmitting(true);
    try {
      await saveBriefingTemplate(form, templates.length);
      await reload();
      setOpen(false);
      setEditingTemplate(null);
      setForm(createTemplateFormState());
      toast({
        title: editingTemplate ? "Pergunta atualizada" : "Pergunta criada",
        description: "A biblioteca foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Nao foi possivel salvar a pergunta",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (template: BriefingTemplateRow, active: boolean) => {
    try {
      await saveBriefingTemplate(
        {
          ...createTemplateFormState(template),
          active,
        },
        template.sort_order,
      );
      await reload();
      toast({ title: active ? "Pergunta ativada" : "Pergunta desativada" });
    } catch (error) {
      toast({
        title: "Nao foi possivel atualizar o status",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (template: BriefingTemplateRow) => {
    if (!window.confirm(`Excluir a pergunta "${template.label}" da biblioteca?`)) return;

    try {
      await deleteBriefingTemplate(template.id);
      await reload();
      toast({ title: "Pergunta excluida" });
    } catch (error) {
      toast({
        title: "Nao foi possivel excluir a pergunta",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <BriefingsPageHeader
        title="Biblioteca de perguntas"
        description="CRUD completo da biblioteca, separado da montagem do briefing."
        breadcrumbs={[
          { label: "Briefings", to: ADMIN_BRIEFINGS_HOME },
          { label: "Biblioteca" },
        ]}
        actions={[{ label: "Nova pergunta", onClick: openCreate, variant: "default" }]}
      />

      <div className="grid gap-3 md:grid-cols-[1fr_220px_220px_180px]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por pergunta, secao ou ajuda"
          className="border-white/10 bg-white/[0.03] text-white"
        />
        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
            <SelectValue placeholder="Secao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as secoes</SelectItem>
            {sections.map((section) => (
              <SelectItem key={section} value={section}>
                {section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {briefingFieldTypeMeta.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="ativas">Ativas</SelectItem>
            <SelectItem value="inativas">Inativas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-white">Acervo da biblioteca</CardTitle>
          <CardDescription className="text-white/45">
            Filtre, edite, ative ou exclua perguntas modelo sem misturar isso com a tela de briefing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <div className="text-sm text-white/45">Carregando biblioteca...</div> : null}

          {!loading && filteredTemplates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/45">
              Nenhuma pergunta encontrada para esse filtro.
            </div>
          ) : null}

          {filteredTemplates.map((template) => (
            <div key={template.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-black text-white">{template.label}</p>
                    <Badge className="border border-white/10 bg-white/5 text-white/70">{template.section_name}</Badge>
                    <Badge className="border border-white/10 bg-white/5 text-white/70">
                      {briefingFieldTypeMeta.find((item) => item.value === template.field_type)?.label || template.field_type}
                    </Badge>
                    <Badge
                      className={
                        template.active
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                          : "border border-white/10 bg-white/[0.03] text-white/60"
                      }
                    >
                      {template.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  {template.help_text ? <p className="text-sm text-white/50">{template.help_text}</p> : null}
                  <div className="flex flex-wrap gap-4 text-xs text-white/35">
                    <span>Slug: {template.slug}</span>
                    <span>Ordem: {template.sort_order}</span>
                    <span>{template.required_default ? "Obrigatoria por padrao" : "Opcional por padrao"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <span className="text-xs text-white/55">Ativa</span>
                    <Switch
                      checked={template.active}
                      onCheckedChange={(checked) => void toggleActive(template, checked)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                    onClick={() => openEdit(template)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15"
                    onClick={() => void handleDelete(template)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto border-white/10 bg-[#120d18] text-white">
          <SheetHeader>
            <SheetTitle>{editingTemplate ? "Editar pergunta" : "Nova pergunta"}</SheetTitle>
            <SheetDescription>
              Ajuste secao, tipo, texto de ajuda, opcoes e status da pergunta da biblioteca.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label>Secao</Label>
              <Input
                value={form.section_name}
                onChange={(event) => setForm((current) => ({ ...current, section_name: event.target.value }))}
                className="border-white/10 bg-white/[0.03] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Pergunta</Label>
              <Input
                value={form.label}
                onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                className="border-white/10 bg-white/[0.03] text-white"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.field_type}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      field_type: value as typeof current.field_type,
                    }))
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

              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  value={form.sort_order}
                  onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                  className="border-white/10 bg-white/[0.03] text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                className="border-white/10 bg-white/[0.03] text-white"
                placeholder="Opcional, gerado automaticamente se ficar vazio"
              />
            </div>

            <div className="space-y-2">
              <Label>Ajuda / contexto</Label>
              <Textarea
                value={form.help_text}
                onChange={(event) => setForm((current) => ({ ...current, help_text: event.target.value }))}
                className="min-h-[100px] border-white/10 bg-white/[0.03] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={form.placeholder}
                onChange={(event) => setForm((current) => ({ ...current, placeholder: event.target.value }))}
                className="border-white/10 bg-white/[0.03] text-white"
              />
            </div>

            {form.field_type === "single_choice" || form.field_type === "multi_choice" ? (
              <div className="space-y-2">
                <Label>Opcoes separadas por virgula</Label>
                <Textarea
                  value={form.optionsText}
                  onChange={(event) => setForm((current) => ({ ...current, optionsText: event.target.value }))}
                  className="min-h-[90px] border-white/10 bg-white/[0.03] text-white"
                  placeholder="Instagram, Google, Indicacao"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.required_default}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, required_default: checked }))}
                />
                <span className="text-sm text-white">Obrigatoria por padrao</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.active}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, active: checked }))}
                />
                <span className="text-sm text-white">Pergunta ativa</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="border-0 text-white"
                style={{ background: "var(--gradient-primary)" }}
                onClick={() => void submitForm()}
                disabled={submitting}
              >
                {editingTemplate ? "Salvar alteracoes" : "Criar pergunta"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
