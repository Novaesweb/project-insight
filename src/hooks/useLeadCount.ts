import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useLeadCount() {
  const [count, setCount] = useState(0);
  const lastFetchRef = useRef(0);
  const fetchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const now = Date.now();
      // Throttle: don't fetch more than once every 5 seconds from realtime events
      if (now - lastFetchRef.current < 5000) return;
      
      const { count: c } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "novo")
        .eq("visualizado", false);
      
      setCount(c || 0);
      lastFetchRef.current = Date.now();
    };

    // Initial fetch
    fetch();

    const channel = supabase.channel("lead-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        // Debounce realtime events
        if (fetchTimeoutRef.current) window.clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = window.setTimeout(fetch, 1000) as unknown as number;
      })
      .subscribe();

    return () => { 
      if (fetchTimeoutRef.current) window.clearTimeout(fetchTimeoutRef.current);
      supabase.removeChannel(channel); 
    };
  }, []);

  return count;
}



