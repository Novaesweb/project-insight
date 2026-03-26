import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRealtimeSubscription(tableName: string, onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`${tableName}-realtime`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: tableName },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, onUpdate]);
}


