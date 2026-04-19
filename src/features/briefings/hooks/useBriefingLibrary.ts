import { useState, useCallback, useEffect, useMemo } from "react";
import { briefingService } from "../services/briefing-service";
import type { BriefingTemplateRow } from "../types";
import { useToast } from "@/hooks/use-toast";

export function useBriefingLibrary() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<BriefingTemplateRow[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await briefingService.getTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const upsertTemplate = async (payload: any) => {
    try {
      await briefingService.upsertTemplate(payload);
      toast({ title: "Template salvo com sucesso" });
      loadTemplates();
    } catch (err) {
      toast({ title: "Erro ao salvar template", variant: "destructive" });
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await briefingService.deleteTemplate(id);
      toast({ title: "Template excluído com sucesso" });
      loadTemplates();
    } catch (err) {
      toast({ title: "Erro ao excluir template", variant: "destructive" });
      throw err;
    }
  };

  const toggleTemplateActive = async (id: string, active: boolean) => {
    try {
      await briefingService.upsertTemplate({ id, active });
      loadTemplates();
    } catch (err) {
      toast({ title: "Erro ao alterar status do template", variant: "destructive" });
    }
  };

  const sections = useMemo(() => {
    return Array.from(new Set(templates.map(t => t.section_name)));
  }, [templates]);

  return {
    templates,
    loading,
    error,
    sections,
    upsertTemplate,
    deleteTemplate,
    toggleTemplateActive,
    refresh: loadTemplates,
  };
}
