import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAdminBriefingsOverview } from "./useAdminBriefingsOverview";
import { useBriefingEditor } from "./useBriefingEditor";
import { buildTemplateFieldDraft, saveAdminBriefing } from "../api";
import { getAdminBriefingSentDetailPath } from "../routes";
import { getClientDisplayName } from "../types";

export function useQuickBriefing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, clients, templates, reload } = useAdminBriefingsOverview();
  
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const editorState = useBriefingEditor({
    mode: "draft",
    clients,
    briefings: [],
    templates,
    reloadOverview: reload,
  });

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  const toggleTemplate = (id: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllTemplates = () => {
    if (selectedTemplateIds.length === templates.length) {
      setSelectedTemplateIds([]);
    } else {
      setSelectedTemplateIds(templates.map((t) => t.id));
    }
  };

  const handleSend = async () => {
    if (!selectedClientId || selectedTemplateIds.length === 0) {
      toast({ 
        title: "Campos obrigatórios", 
        description: "Selecione um cliente e ao menos uma diretriz.",
        variant: "destructive" 
      });
      return;
    }

    setIsSending(true);
    try {
      const nextFields = selectedTemplateIds.map((id, index) => {
        const template = templates.find((t) => t.id === id)!;
        return buildTemplateFieldDraft(template, index);
      });

      const result = await saveAdminBriefing({
        mode: "send",
        editor: {
          ...editorState.editor,
          cliente_id: selectedClientId,
          titulo: `Briefing - ${getClientDisplayName(selectedClient)}`,
        },
        fieldDrafts: nextFields,
        persistedFieldIds: [],
        selectedClientId,
        client: selectedClient,
        snapshot: { briefing: "", references: "" },
      });

      toast({
        title: "Protocolo Disparado!",
        description: `Briefing enviado com sucesso para ${getClientDisplayName(selectedClient)}`,
      });
      
      navigate(getAdminBriefingSentDetailPath(result.briefing.id));
    } catch (error) {
      toast({
        title: "Falha no Envio",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return {
    loading,
    clients,
    templates,
    selectedClientId,
    setSelectedClientId,
    selectedTemplateIds,
    toggleTemplate,
    selectAllTemplates,
    selectedClient,
    isSending,
    handleSend
  };
}
