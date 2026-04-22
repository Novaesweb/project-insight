import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  BriefingsMetricsGrid,
  BriefingsPageHeader,
  BriefingsQuickQuestionCard,
  BriefingsQueueList,
} from "@/features/briefings/admin/views";
import { useAdminBriefingsOverview } from "@/features/briefings/admin/hooks";
import {
  ADMIN_BRIEFINGS_DRAFT_NEW,
  ADMIN_BRIEFINGS_DRAFTS,
  ADMIN_BRIEFINGS_LIBRARY,
  ADMIN_BRIEFINGS_QUICK,
  ADMIN_BRIEFINGS_SENT,
  getAdminBriefingDraftDetailPath,
  getAdminBriefingSentDetailPath,
  resolveAdminBriefingClientPath,
} from "@/features/briefings/admin/routes";

export default function BriefingsDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientParam = searchParams.get("cliente");
  const { loading, briefings, statusCounts } = useAdminBriefingsOverview();

  useEffect(() => {
    if (loading || !clientParam) return;
    navigate(resolveAdminBriefingClientPath(briefings, clientParam), { replace: true });
  }, [briefings, clientParam, loading, navigate]);

  const draftBriefings = useMemo(
    () => briefings.filter((item) => item.status === "em_construcao").slice(0, 5),
    [briefings],
  );
  const sentBriefings = useMemo(
    () => briefings.filter((item) => item.status !== "em_construcao").slice(0, 5),
    [briefings],
  );

  return (
    <div className="space-y-6 pb-10">
      <BriefingsPageHeader
        title="Briefings"
        description="Painel do modulo para montar, enviar, acompanhar respostas e manter a biblioteca de perguntas."
        actions={[
          { label: "Novo briefing", to: ADMIN_BRIEFINGS_DRAFT_NEW, variant: "default" },
          { label: "Envio rápido", to: ADMIN_BRIEFINGS_QUICK, variant: "secondary" },
          { label: "Acompanhar respostas", to: ADMIN_BRIEFINGS_SENT },
        ]}
      />

      <BriefingsMetricsGrid
        items={[
          { label: "Em construcao", value: statusCounts.draft, helper: "Rascunhos para montar ou revisar" },
          { label: "Aguardando", value: statusCounts.awaiting, helper: "Enviados sem resposta final" },
          { label: "Parciais", value: statusCounts.partial, helper: "Clientes que ja iniciaram o briefing" },
          { label: "Respondidos", value: statusCounts.answered + statusCounts.completed, helper: "Base pronta para projeto ou fechamento" },
        ]}
      />



      <div className="grid gap-6 xl:grid-cols-2">
        <BriefingsQueueList
          title="Fila em construcao"
          description="Resumo dos briefings que ainda estao sendo montados."
          loading={loading}
          emptyMessage="Nenhum briefing em construcao neste momento."
          items={draftBriefings.map((briefing) => ({
            briefing,
            to: getAdminBriefingDraftDetailPath(briefing.id),
          }))}
        />
        <BriefingsQueueList
          title="Ultimos enviados"
          description="Resumo rapido da fila enviada e das respostas mais recentes."
          loading={loading}
          emptyMessage="Nenhum briefing enviado encontrado."
          items={sentBriefings.map((briefing) => ({
            briefing,
            to: getAdminBriefingSentDetailPath(briefing.id),
          }))}
        />
      </div>
    </div>
  );
}
