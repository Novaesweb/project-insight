import { Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { briefingFieldTypeMeta, type BriefingFieldDraft } from "@/lib/project-briefings";
import { cn } from "@/lib/utils";
import type { BriefingTemplateRow } from "../types";

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
                    onCheckedChange={(next) => onToggleSelection(template.id, Boolean(next))}
                    disabled={alreadyAdded}
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
