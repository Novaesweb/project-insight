import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";
import {
  BriefingEditorCard,
  BriefingReadinessCard,
  BriefingResponsePanelCard,
  BriefingSummaryCard,
  BriefingTemplatePickerCard,
  BriefingsPageHeader,
} from "@/features/briefings/admin/views";
import { useAdminBriefingsOverview, useBriefingEditor } from "@/features/briefings/admin/hooks";
import { ADMIN_BRIEFINGS_HOME, ADMIN_BRIEFINGS_SENT } from "@/features/briefings/admin/routes";
import { getClientDisplayName, getSentStatusLabel } from "@/features/briefings/admin/types";

export default function SentBriefingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading: overviewLoading, briefings, clients, templates, reload } = useAdminBriefingsOverview();
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateSection, setTemplateSection] = useState("todas");

  const editorState = useBriefingEditor({
    mode: "sent",
    briefingId: id || null,
    clients,
    briefings,
    templates,
    reloadOverview: reload,
  });

  const filteredTemplates = useMemo(
    () => editorState.filteredTemplates(templateSearch, templateSection),
    [editorState, templateSearch, templateSection],
  );

  const runAction = async (mode: "draft" | "send" | "reopen" | "conclude") => {
    try {
      await editorState.persist(mode);
      toast({
        title:
          mode === "send"
            ? "Briefing reenviado"
            : mode === "reopen"
              ? "Briefing reaberto"
              : mode === "conclude"
                ? "Briefing concluido"
                : "Alteracoes salvas",
      });
    } catch (error) {
      toast({
        title: "Nao foi possivel atualizar o briefing",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCreateProject = async () => {
    try {
      const projectId = await editorState.createProject();
      toast({ title: "Projeto criado", description: "O briefing foi vinculado a um novo projeto." });
      navigate(`/admin/projetos/${projectId}`);
    } catch (error) {
      toast({
        title: "Nao foi possivel criar o projeto",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (overviewLoading || editorState.loading) {
    return <div className="p-10 text-sm text-white/45">Carregando detalhe do briefing...</div>;
  }

  if (!editorState.selectedBriefing) {
    return <div className="p-10 text-sm text-white/45">Briefing enviado nao encontrado.</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <BriefingsPageHeader
        title="Respostas e acompanhamento"
        description="Detalhe do briefing enviado, com respostas por pergunta, anexos, timeline e acoes operacionais."
        breadcrumbs={[
          { label: "Briefings", to: ADMIN_BRIEFINGS_HOME },
          { label: "Enviados", to: ADMIN_BRIEFINGS_SENT },
          { label: "Detalhe" },
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
        <div className="space-y-6">
          <BriefingEditorCard
            mode="sent"
            clients={clients}
            editor={editorState.editor}
            selectedClientId={editorState.editor.cliente_id}
            selectedBriefing={editorState.selectedBriefing}
            fieldDrafts={editorState.fieldDrafts}
            saving={editorState.saving}
            onClientChange={editorState.selectClient}
            onEditorChange={(patch) => editorState.setEditor((current) => ({ ...current, ...patch }))}
            onFieldChange={editorState.handleFieldChange}
            onMoveField={editorState.moveField}
            onRemoveField={editorState.removeField}
            onAddCustomField={editorState.addCustomField}
            onSaveDraft={() => void runAction("draft")}
            onSend={() => void runAction("send")}
            onReopen={() => void runAction("reopen")}
            onConclude={() => void runAction("conclude")}
            onCreateProject={() => void handleCreateProject()}
          />

          <BriefingResponsePanelCard
            responseSections={editorState.responseSections}
            answerMap={editorState.answerMap}
            attachments={editorState.attachments}
          />

          <BriefingSummaryCard
            snapshotBriefing={editorState.snapshot.briefing || editorState.editor.snapshot_briefing}
            snapshotReferences={editorState.snapshot.references || editorState.editor.snapshot_references}
            attachments={editorState.attachments}
            selectedBriefing={editorState.selectedBriefing}
          />
        </div>

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
