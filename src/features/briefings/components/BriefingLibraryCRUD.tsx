import { useState } from "react";
import { Plus, Search, Trash2, Edit2, Check, X, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { briefingFieldTypeMeta } from "@/lib/project-briefings";
import { cn } from "@/lib/utils";

interface BriefingLibraryCRUDProps {
  templates: any[];
  sections: string[];
  onUpsert: (payload: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
}

export function BriefingLibraryCRUD({
  templates,
  sections,
  onUpsert,
  onDelete,
  onToggleActive,
}: BriefingLibraryCRUDProps) {
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("todas");
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.section_name.toLowerCase().includes(search.toLowerCase());
    const matchesSection = sectionFilter === "todas" || t.section_name === sectionFilter;
    return matchesSearch && matchesSection;
  });

  const handleEdit = (template: any) => {
    setEditingTemplate(template || {
      label: "",
      section_name: "Geral",
      field_type: "short_text",
      help_text: "",
      placeholder: "",
      required_default: false,
      active: true,
      sort_order: templates.length,
      slug: "",
    });
  };

  const handleSave = async () => {
    if (!editingTemplate.label || !editingTemplate.section_name) return;
    
    // Auto-generate slug if not present
    const payload = { ...editingTemplate };
    if (!payload.slug) {
      payload.slug = payload.label.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }

    await onUpsert(payload);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar na biblioteca..."
            className="border-white/10 bg-white/[0.03] pl-9 text-white"
          />
        </div>
        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
            <SelectValue placeholder="Seção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as seções</SelectItem>
            {sections.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => handleEdit(null)}
          className="border-0 text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-white">Perguntas da Biblioteca</CardTitle>
            <CardDescription className="text-white/45">
              Gerencie os modelos de perguntas disponíveis para montagem de briefings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-3">
              <div className="space-y-3">
                {filteredTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{t.label}</p>
                        <Badge className="border border-white/10 bg-white/5 text-white/60">
                          {t.section_name}
                        </Badge>
                        {!t.active && (
                          <Badge variant="outline" className="text-white/30">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-white/45">{t.help_text || "Sem descrição"}</p>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <Switch
                        checked={t.active}
                        onCheckedChange={(val) => onToggleActive(t.id, val)}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white/60"
                        onClick={() => handleEdit(t)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400/60 hover:text-red-400"
                        onClick={() => onDelete(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredTemplates.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">
                    Nenhum template encontrado.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {editingTemplate ? (
            <Card className="border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingTemplate.id ? "Editar Template" : "Novo Template"}
                </CardTitle>
                <CardDescription className="text-white/45">
                  Configure os detalhes da pergunta modelo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Título</Label>
                  <Input
                    value={editingTemplate.label}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, label: e.target.value })}
                    className="border-white/10 bg-white/[0.03] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Seção</Label>
                  <Input
                    value={editingTemplate.section_name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, section_name: e.target.value })}
                    className="border-white/10 bg-white/[0.03] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Tipo de Campo</Label>
                  <Select
                    value={editingTemplate.field_type}
                    onValueChange={(val) => setEditingTemplate({ ...editingTemplate, field_type: val })}
                  >
                    <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {briefingFieldTypeMeta.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-white/45">Ajuda / Contexto</Label>
                  <Textarea
                    value={editingTemplate.help_text}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, help_text: e.target.value })}
                    className="min-h-[80px] border-white/10 bg-white/[0.03] text-white"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingTemplate.required_default}
                      onCheckedChange={(val) => setEditingTemplate({ ...editingTemplate, required_default: val })}
                    />
                    <Label className="text-xs text-white/60">Obrigatório por padrão</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingTemplate.active}
                      onCheckedChange={(val) => setEditingTemplate({ ...editingTemplate, active: val })}
                    />
                    <Label className="text-xs text-white/60">Ativo</Label>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} className="flex-1 border-0 text-white" style={{ background: "var(--gradient-primary)" }}>
                    <Check className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTemplate(null)} className="border-white/10 bg-white/[0.03] text-white">
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/10 bg-white/[0.03]">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-white/40">
                <FileText className="mb-4 h-12 w-12 opacity-20" />
                <p className="text-sm">Selecione um template para editar ou crie um novo.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
