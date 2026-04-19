import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BriefingsPageHeader, BriefingsQueueList } from "@/features/briefings/admin/views";
import { useAdminBriefingsOverview } from "@/features/briefings/admin/hooks";
import {
  ADMIN_BRIEFINGS_DRAFT_NEW,
  ADMIN_BRIEFINGS_DRAFTS,
  ADMIN_BRIEFINGS_HOME,
  getAdminBriefingDraftDetailPath,
} from "@/features/briefings/admin/routes";
import { getClientDisplayName } from "@/features/briefings/admin/types";

export default function InProgressList() {
  const { loading, briefings, clients } = useAdminBriefingsOverview();
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("todos");

  const draftBriefings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return briefings.filter((item) => {
      if (item.status !== "em_construcao") return false;
      if (selectedClientId !== "todos" && item.cliente_id !== selectedClientId) return false;
      if (!term) return true;

      const clientName = getClientDisplayName(item.clientes).toLowerCase();
      return item.titulo.toLowerCase().includes(term) || clientName.includes(term);
    });
  }, [briefings, search, selectedClientId]);

  return (
    <div className="space-y-6 pb-10">
      <BriefingsPageHeader
        title="Briefings em andamento"
        description="Fila exclusiva de briefings em construcao, com busca e filtro por cliente."
        breadcrumbs={[
          { label: "Briefings", to: ADMIN_BRIEFINGS_HOME },
          { label: "Em andamento" },
        ]}
        actions={[{ label: "Novo briefing", to: ADMIN_BRIEFINGS_DRAFT_NEW, variant: "default" }]}
      />

      <div className="grid gap-3 md:grid-cols-[1fr_280px]">
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
      </div>

      {draftBriefings.length === 0 && !loading ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="text-lg font-black text-white">Nenhum briefing em construcao nesse recorte.</p>
          <p className="mt-2 text-sm text-white/50">
            Comece um novo briefing ou ajuste a busca para encontrar um rascunho existente.
          </p>
          <Button asChild className="mt-6 border-0 text-white" style={{ background: "var(--gradient-primary)" }}>
            <Link to={ADMIN_BRIEFINGS_DRAFT_NEW}>Criar novo briefing</Link>
          </Button>
        </div>
      ) : null}

      <BriefingsQueueList
        title="Fila de montagem"
        description="Abra um briefing para editar titulo, instrucoes, perguntas e envio."
        loading={loading}
        emptyMessage="Nenhum briefing em construcao encontrado."
        items={draftBriefings.map((briefing) => ({
          briefing,
          to: getAdminBriefingDraftDetailPath(briefing.id),
        }))}
      />
    </div>
  );
}
