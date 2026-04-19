import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";
import { BriefingEditorCard, BriefingReadinessCard, BriefingTemplatePickerCard, BriefingsPageHeader } from "@/features/briefings/admin/views";
import { useAdminBriefingsOverview, useBriefingEditor } from "@/features/briefings/admin/hooks";
import {
  ADMIN_BRIEFINGS_DRAFTS,
  ADMIN_BRIEFINGS_HOME,
  getAdminBriefingDraftDetailPath,
  getAdminBriefingSentDetailPath,
} from "@/features/briefings/admin/routes";
import { getClientDisplayName, getSentStatusLabel } from "@/features/briefings/admin/types";

export default function BriefingEditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialClientId = searchParams.get("cliente");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading: overviewLoading, briefings, clients, templates, reload } = useAdminBriefingsOverview();
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateSection, setTemplateSection] = useState("todas");

  const editorState = useBriefingEditor({
    mode: "draft",
    briefingId: id || null,
    initialClientId,
    clients,
    briefings,
    templates,
    reloadOverview: reload,
  });

  const filteredTemplates = useMemo(
    () => editorState.filteredTemplates(templateSearch, templateSection),
    [editorState, templateSearch, templateSection],
  );

  const handlePersist = async (mode: "draft" | "send") => {
    try {
      const briefing = await editorState.persist(mode);
      toast({
        title: mode === "send" ? "Briefing enviado" : "Rascunho salvo",
        description:
          mode === "send"
            ? "O cliente ja pode acessar esse briefing no portal."
            : "As alteracoes do briefing foram salvas.",
      });

      if (mode === "send") {
        navigate(getAdminBriefingSentDetailPath(briefing.id), { replace: true });
        return;
      }

      if (!id) {
        navigate(getAdminBriefingDraftDetailPath(briefing.id), { replace: true });
      }
    } catch (error) {
      toast({
        title: "Nao foi possivel salvar o briefing",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (overviewLoading || editorState.loading) {
    return <div className="p-10 text-sm text-white/45">Carregando briefing...</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <BriefingsPageHeader
        title={id ? "Editar briefing" : "Novo briefing"}
        description="Monte o briefing em uma tela propria, com cliente, instrucoes, perguntas, ordenacao e envio."
        breadcrumbs={[
          { label: "Briefings", to: ADMIN_BRIEFINGS_HOME },
          { label: "Em andamento", to: ADMIN_BRIEFINGS_DRAFTS },
          { label: id ? "Detalhe" : "Novo" },
        ]}
      />

      <BriefingReadinessCard
        title={editorState.editor.titulo}
        clientName={getClientDisplayName(editorState.selectedClient)}
        readinessScore={editorState.readinessScore}
        missingCount={editorState.contentValidation.missing.length}
        answeredFieldCount={editorState.answeredFieldCount}
        pendingFieldCount={editorState.pendingFieldCount}
        totalQuestions={editorState.fieldDrafts.length}
        statusLabel={getSentStatusLabel(editorState.editor.status)}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <BriefingEditorCard
          mode="draft"
          clients={clients}
          editor={editorState.editor}
          selectedClientId={editorState.editor.cliente_id || initialClientId || ""}
          selectedBriefing={editorState.selectedBriefing}
          fieldDrafts={editorState.fieldDrafts}
          saving={editorState.saving}
          onClientChange={editorState.selectClient}
          onEditorChange={(patch) => editorState.setEditor((current) => ({ ...current, ...patch }))}
          onFieldChange={editorState.handleFieldChange}
          onMoveField={editorState.moveField}
          onRemoveField={editorState.removeField}
          onAddCustomField={editorState.addCustomField}
          onSaveDraft={() => void handlePersist("draft")}
          onSend={() => void handlePersist("send")}
        />

        <BriefingTemplatePickerCard
          templates={filteredTemplates}
          fieldDrafts={editorState.fieldDrafts}
          templateSelection={editorState.templateSelection}
          onToggleSelection={editorState.toggleTemplateSelection}
          onAddSelected={editorState.addSelectedTemplates}
          templateSearch={templateSearch}
          onTemplateSearchChange={setTemplateSearch}
          templateSection={templateSection}
          onTemplateSectionChange={setTemplateSection}
        />
      </div>
    </div>
  );
}
