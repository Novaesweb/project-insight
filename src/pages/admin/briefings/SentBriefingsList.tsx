import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BriefingsMetricsGrid, BriefingsPageHeader, BriefingsQueueList } from "@/features/briefings/admin/views";
import { useAdminBriefingsOverview } from "@/features/briefings/admin/hooks";
import { ADMIN_BRIEFINGS_HOME, getAdminBriefingSentDetailPath } from "@/features/briefings/admin/routes";
import { getClientDisplayName } from "@/features/briefings/admin/types";

export default function SentBriefingsList() {
  const { loading, briefings, clients, statusCounts } = useAdminBriefingsOverview();
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  const sentBriefings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return briefings.filter((item) => {
      if (item.status === "em_construcao") return false;
      if (selectedClientId !== "todos" && item.cliente_id !== selectedClientId) return false;
      if (statusFilter !== "todos" && item.status !== statusFilter) return false;
      if (!term) return true;

      const clientName = getClientDisplayName(item.clientes).toLowerCase();
      return item.titulo.toLowerCase().includes(term) || clientName.includes(term);
    });
  }, [briefings, search, selectedClientId, statusFilter]);

  return (
    <div className="space-y-6 pb-10">
      <BriefingsPageHeader
        title="Briefings enviados"
        description="Fila operacional de briefings enviados, respostas, anexos e proximos passos."
        breadcrumbs={[
          { label: "Briefings", to: ADMIN_BRIEFINGS_HOME },
          { label: "Enviados" },
        ]}
      />

      <BriefingsMetricsGrid
        items={[
          { label: "Aguardando", value: statusCounts.awaiting },
          { label: "Parciais", value: statusCounts.partial },
          { label: "Respondidos", value: statusCounts.answered },
          { label: "Concluidos", value: statusCounts.completed },
        ]}
      />

      <div className="grid gap-3 md:grid-cols-[1fr_260px_220px]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por titulo ou cliente"
          className="border-white/10 bg-white/[0.03] text-white"
        />
        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
          <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os clientes</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {getClientDisplayName(client)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="enviado">Aguardando resposta</SelectItem>
            <SelectItem value="em_preenchimento">Parcial</SelectItem>
            <SelectItem value="respondido">Respondido</SelectItem>
            <SelectItem value="concluido">Concluido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BriefingsQueueList
        title="Fila enviada"
        description="Abra um briefing para revisar respostas, anexos, timeline e acoes de conclusao."
        loading={loading}
        emptyMessage="Nenhum briefing enviado encontrado para esse filtro."
        items={sentBriefings.map((briefing) => ({
          briefing,
          to: getAdminBriefingSentDetailPath(briefing.id),
        }))}
      />
    </div>
  );
}
