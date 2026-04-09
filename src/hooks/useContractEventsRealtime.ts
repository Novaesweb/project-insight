import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ContractEvent = Tables<"contrato_eventos">;

type UseContractEventsRealtimeOptions = {
  contractId?: string | null;
  enabled?: boolean;
  onInsert?: (event: ContractEvent) => void;
};

export function useContractEventsRealtime({
  contractId,
  enabled = true,
  onInsert,
}: UseContractEventsRealtimeOptions) {
  useEffect(() => {
    if (!enabled || !contractId) return;

    const channel = supabase
      .channel(`contract-events-${contractId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contrato_eventos",
          filter: `contrato_id=eq.${contractId}`,
        },
        (payload) => {
          const nextEvent = payload.new as ContractEvent;
          if (nextEvent?.id) {
            onInsert?.(nextEvent);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [contractId, enabled, onInsert]);
}
