import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type UseRealtimeSubscriptionOptions = {
  enabled?: boolean;
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
  filter?: string;
  pauseWhenHidden?: boolean;
};

const sanitizeChannelPart = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "_");

export function useRealtimeSubscription(
  tableName: string,
  onUpdate: () => void,
  {
    enabled = true,
    event = "*",
    filter,
    pauseWhenHidden = true,
  }: UseRealtimeSubscriptionOptions = {},
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const canRefresh = () => {
      if (typeof document === "undefined") {
        return true;
      }

      return !(pauseWhenHidden && document.hidden);
    };

    const channel = supabase
      .channel(`${sanitizeChannelPart(tableName)}-${sanitizeChannelPart(filter || "all")}-realtime`)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table: tableName,
          ...(filter ? { filter } : {}),
        },
        () => {
          if (!canRefresh()) {
            return;
          }

          onUpdate();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, event, filter, onUpdate, pauseWhenHidden, tableName]);
}



