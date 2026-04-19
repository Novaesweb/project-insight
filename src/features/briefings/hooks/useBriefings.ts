import { useState, useCallback, useEffect, useMemo } from "react";
import { briefingService } from "../services/briefing-service";
import type { ClientBriefingRow, ClientLite } from "../types";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

export function useBriefings() {
  const [loading, setLoading] = useState(true);
  const [briefings, setBriefings] = useState<ClientBriefingRow[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const loadListData = useCallback(async () => {
    try {
      setLoading(true);
      const [briefingsData, clientsData] = await Promise.all([
        briefingService.getBriefings(),
        briefingService.getClients(),
      ]);
      setBriefings(briefingsData);
      setClients(clientsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListData();
  }, [loadListData]);

  useRealtimeRefresh(
    [
      { table: "client_briefings" },
      { table: "clientes" },
    ],
    loadListData,
    { channelPrefix: "briefings-list", debounceMs: 350 },
  );

  const draftBriefings = useMemo(
    () => briefings.filter((item) => item.status === "em_construcao"),
    [briefings],
  );

  const sentBriefings = useMemo(
    () =>
      briefings.filter((item) =>
        ["enviado", "em_preenchimento", "respondido", "concluido"].includes(item.status),
      ),
    [briefings],
  );

  const kpis = useMemo(() => {
    return {
      total: briefings.length,
      drafts: draftBriefings.length,
      sent: sentBriefings.length,
      awaitingResponse: briefings.filter((item) => item.status === "enviado").length,
      partial: briefings.filter((item) => item.status === "em_preenchimento").length,
      answered: briefings.filter((item) => item.status === "respondido").length,
      completed: briefings.filter((item) => item.status === "concluido").length,
    };
  }, [briefings, draftBriefings.length, sentBriefings.length]);

  return {
    briefings,
    clients,
    loading,
    error,
    kpis,
    draftBriefings,
    sentBriefings,
    refresh: loadListData,
  };
}
