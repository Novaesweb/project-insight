import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Sparkles, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBriefingEditor } from "@/features/briefings/hooks/useBriefingEditor";
import { useBriefings } from "@/features/briefings/hooks/useBriefings";
import { BriefingEditor } from "@/features/briefings/components/BriefingEditor";
import { BriefingDashboardKPIs as KPIs } from "@/features/briefings/components/BriefingDashboardKPIs";
import { briefingService } from "@/features/briefings/services/briefing-service";
import { briefingFieldTypeMeta, briefingStatusMeta, getTemplateSearchText, parseBriefingOptions } from "../../../lib/project-briefings";
import { cn } from "@/lib/utils";
import { useBriefingLibrary } from "@/features/briefings/hooks/useBriefingLibrary";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function BriefingEditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const clientParam = searchParams.get("cliente");
  const navigate = useNavigate();
  const { clients } = useBriefings();
  const { 
    editor, 
    setEditor, 
    fieldDrafts, 
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
    existingBriefing
  } = useBriefingEditor(id);

  const { templates, sections: templateSections } = useBriefingLibrary();
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateSectionFilter, setTemplateSectionFilter] = useState("todas");
  const [templateSelection, setTemplateSelection] = useState<string[]>([]);

  useEffect(() => {
    if (clientParam && !id && !editor.cliente_id) {
      setEditor(curr => ({ ...curr, cliente_id: clientParam }));
    }
  }, [clientParam, id, editor.cliente_id]);

  const getClientDisplayName = (client: any) => {
    if (!client) return "Cliente não encontrado";
    const val = Array.isArray(client) ? client[0] : client;
    return val?.nome_empresa?.trim() || val?.nome?.trim() || "Cliente não encontrado";
  };

  const getProjectTitle = (project: any) => {
    if (!project) return null;
    const val = Array.isArray(project) ? project[0] : project;
    return val?.titulo || null;
  };

  const selectedClient = clients.find(c => c.id === editor.cliente_id);

  const filteredTemplates = templates.filter((t) => {
    if (templateSectionFilter !== "todas" && t.section_name !== templateSectionFilter) return false;
    if (!templateSearch.trim()) return true;
    return getTemplateSearchText(t).includes(templateSearch.trim().toLowerCase());
  }).filter(t => t.active);

  const handleAddSelectedTemplates = () => {
    templateSelection.forEach(tid => {
      const template = templates.find(t => t.id === tid);
      if (template) {
        addField({
          ...template,
          options: parseBriefingOptions(template.options as any)
        });
      }
    });
    setTemplateSelection([]);
  };

  const onPersistWrapper = async (mode: "draft" | "send" | "reopen" | "conclude") => {
    const res = await handlePersist(mode, getClientDisplayName(selectedClient));
    if (res && !id) {
      navigate(`/admin/briefings/em-andamento/${res.id}`, { replace: true });
    }
  };

  const answeredFieldCount = fieldDrafts.filter((field) => {
    if (field.field_type === "file_upload") {
      return attachments.some((file) => file.field_id === field.id);
    }
    const val = answerMap[field.id];
    return Array.isArray(val) ? val.length > 0 : Boolean(val?.toString().trim());
  }).length;

  const readinessScore = fieldDrafts.length === 0 ? 0 : Math.round((answeredFieldCount / fieldDrafts.length) * 100);
  const readinessLabel = readinessScore >= 80 ? "Pronto" : readinessScore >= 50 ? "Médio" : "Baixo";
  const readinessTone = readinessScore >= 80 
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" 
    : readinessScore >= 50 
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200" 
      : "border-rose-500/30 bg-rose-500/10 text-rose-200";

  if (loading) return <div className="p-10 text-white/40">Carregando editor...</div>;

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp} className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="mb-2 -ml-2 text-white/40 hover:text-white">
            <Link to="/admin/briefings/em-andamento">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à Lista
            </Link>
          </Button>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {id ? "Editar Briefing" : "Novo Briefing"}
          </h1>
          <p className="text-sm text-white/55">Prepare a coleta de informações estratégicas.</p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => onPersistWrapper("draft")} 
            disabled={saving || !editor.cliente_id}
            variant="outline" 
            className="border-white/10 bg-white/[0.03] text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Rascunho
          </Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <KPIs 
          title={editor.titulo}
          clientName={getClientDisplayName(selectedClient)}
          readinessLabel={readinessLabel}
          readinessTone={readinessTone}
          readinessScore={readinessScore}
          missingCount={fieldDrafts.length - answeredFieldCount}
          fieldCount={fieldDrafts.length}
          answeredCount={answeredFieldCount}
          pendingCount={fieldDrafts.length - answeredFieldCount}
          statusLabel={briefingStatusMeta[editor.status].label}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <BriefingEditor 
            editor={editor}
            setEditor={setEditor}
            fieldDrafts={fieldDrafts}
            clients={clients}
            saving={saving}
            onPersist={onPersistWrapper}
            onAddField={() => addField()}
            onRemoveField={removeField}
            onMoveField={moveField}
            onUpdateField={updateField}
            getSentStatusLabel={(s) => briefingStatusMeta[s].label}
            getClientDisplayName={getClientDisplayName}
            getProjectTitle={getProjectTitle}
            selectedBriefing={existingBriefing}
          />
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-fuchsia-400" />
                <CardTitle className="text-sm text-white">Biblioteca Pronta</CardTitle>
              </div>
              <CardDescription className="text-xs text-white/45">Adicione perguntas modelo ao briefing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                value={templateSearch} 
                onChange={e => setTemplateSearch(e.target.value)} 
                placeholder="Buscar..." 
                className="h-8 border-white/10 bg-white/[0.03] text-xs text-white" 
              />
              <Select value={templateSectionFilter} onValueChange={setTemplateSectionFilter}>
                <SelectTrigger className="h-8 border-white/10 bg-white/[0.03] text-xs text-white">
                  <SelectValue placeholder="Seção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {templateSections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>

              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {filteredTemplates.map(t => {
                    const alreadyIn = fieldDrafts.some(f => f.template_id === t.id);
                    return (
                      <label key={t.id} className={cn(
                        "flex cursor-pointer items-start gap-2 rounded-xl border p-3 transition-all",
                        alreadyIn ? "border-emerald-500/20 bg-emerald-500/5 opacity-60" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                      )}>
                        <Checkbox 
                          checked={templateSelection.includes(t.id) || alreadyIn} 
                          disabled={alreadyIn}
                          onCheckedChange={checked => {
                            if (checked) setTemplateSelection(curr => [...curr, t.id]);
                            else setTemplateSelection(curr => curr.filter(id => id !== t.id));
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium leading-tight text-white">{t.label}</p>
                          <p className="mt-1 text-[10px] text-white/30">{t.section_name}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </ScrollArea>
              
              <Button 
                onClick={handleAddSelectedTemplates} 
                disabled={templateSelection.length === 0}
                className="w-full border-0 text-white" 
                style={{ background: "var(--gradient-primary)" }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Selecionadas
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
