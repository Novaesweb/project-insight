import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, RefreshCcw, FileText, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBriefingEditor } from "@/features/briefings/hooks/useBriefingEditor";
import { useBriefings } from "@/features/briefings/hooks/useBriefings";
import { BriefingEditor } from "@/features/briefings/components/BriefingEditor";
import { BriefingResponseView } from "@/features/briefings/components/BriefingResponseView";
import { BriefingSnapshotCard } from "@/features/briefings/components/BriefingSnapshotCard";
import { BriefingDashboardKPIs as KPIs } from "@/features/briefings/components/BriefingDashboardKPIs";
import { briefingStatusMeta } from "@/lib/project-briefings";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SentBriefingDetailPage() {
  const { id } = useParams();
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

  const formatDateTime = (val: string) => {
    if (!val) return "Sem registro";
    return new Date(val).toLocaleString("pt-BR");
  };

  const hasAnswerValue = (value: any) => {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value?.toString().trim());
  };

  const selectedClient = clients.find(c => c.id === editor.cliente_id);

  const onPersistWrapper = async (mode: "draft" | "send" | "reopen" | "conclude") => {
    await handlePersist(mode, getClientDisplayName(selectedClient));
  };

  const answeredFieldCount = fieldDrafts.filter((field) => {
    if (field.field_type === "file_upload") {
      return attachments.some((file) => file.field_id === field.id);
    }
    const val = answerMap[field.id];
    return hasAnswerValue(val);
  }).length;

  const readinessScore = fieldDrafts.length === 0 ? 0 : Math.round((answeredFieldCount / fieldDrafts.length) * 100);
  const readinessLabel = readinessScore >= 80 ? "Pronto" : readinessScore >= 50 ? "Médio" : "Baixo";
  const readinessTone = readinessScore >= 80 
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" 
    : readinessScore >= 50 
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200" 
      : "border-rose-500/30 bg-rose-500/10 text-rose-200";

  if (loading) return <div className="p-10 text-white/40">Carregando detalhes...</div>;
  if (!existingBriefing) return <div className="p-10 text-white/40">Briefing não encontrado.</div>;

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
            <Link to="/admin/briefings/enviados">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à Lista
            </Link>
          </Button>
          <h1 className="text-2xl font-black tracking-tight text-white">Respostas e Acompanhamento</h1>
          <p className="text-sm text-white/55">Visualize respostas, anexos e gerencie o fluxo operacional.</p>
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
          <BriefingResponseView 
            fieldDrafts={fieldDrafts}
            answerMap={answerMap}
            attachments={attachments}
            formatDateTime={formatDateTime}
            hasAnswerValue={hasAnswerValue}
          />
          
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
            isSentContext={true}
          />
        </div>

        <div className="space-y-6">
          <BriefingSnapshotCard 
            snapshot={snapshot}
            editor={editor}
            attachments={attachments}
            selectedBriefing={existingBriefing}
            formatDateTime={formatDateTime}
          />

          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-fuchsia-400" />
                <CardTitle className="text-sm text-white">Histórico e Datas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-xs text-white/50">
                <div className="flex justify-between">
                  <span>Criado em</span>
                  <span className="text-white/70">{formatDateTime(existingBriefing.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enviado em</span>
                  <span className="text-white/70">{formatDateTime(existingBriefing.sent_at)}</span>
                </div>
                {existingBriefing.started_at && (
                  <div className="flex justify-between">
                    <span>Iniciado pelo cliente</span>
                    <span className="text-white/70">{formatDateTime(existingBriefing.started_at)}</span>
                  </div>
                )}
                {existingBriefing.submitted_at && (
                  <div className="flex justify-between">
                    <span>Respondido em</span>
                    <span className="text-white/70">{formatDateTime(existingBriefing.submitted_at)}</span>
                  </div>
                )}
                {existingBriefing.completed_at && (
                  <div className="flex justify-between">
                    <span>Concluído em</span>
                    <span className="text-white/70">{formatDateTime(existingBriefing.completed_at)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
