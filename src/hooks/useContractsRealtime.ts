import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ContractRow = Tables<"contratos">;

type UseContractsRealtimeOptions = {
  channelName: string;
  filter?: string;
  enabled?: boolean;
  onUpsert?: (contract: ContractRow) => void;
  onDelete?: (id: string) => void;
};

export function useContractsRealtime({
  channelName,
  filter,
  enabled = true,
  onUpsert,
  onDelete,
}: UseContractsRealtimeOptions) {
  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel(channelName);
    const config: {
      event: "*";
      schema: "public";
      table: "contratos";
      filter?: string;
    } = {
      event: "*",
      schema: "public",
      table: "contratos",
    };

    if (filter) {
      config.filter = filter;
    }

    channel
      .on("postgres_changes", config, (payload) => {
        if (payload.eventType === "DELETE") {
          const deletedId = String((payload.old as { id?: string } | null)?.id || "");
          if (deletedId) {
            onDelete?.(deletedId);
          }
          return;
        }

        const nextContract = payload.new as ContractRow;
        if (nextContract?.id) {
          onUpsert?.(nextContract);
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelName, enabled, filter, onDelete, onUpsert]);
}
