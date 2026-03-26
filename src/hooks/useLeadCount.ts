import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useLeadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { count: c } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "novo").eq("visualizado", false);
      setCount(c || 0);
    };
    fetch();

    const channel = supabase.channel("lead-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return count;
}



