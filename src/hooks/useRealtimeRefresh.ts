import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";

type RealtimeEvent = "*" | "INSERT" | "UPDATE" | "DELETE";

export type RealtimeRefreshSource = {
  table: string;
  filter?: string;
  event?: RealtimeEvent;
  schema?: "public";
};

type UseRealtimeRefreshOptions = {
  enabled?: boolean;
  debounceMs?: number;
  channelPrefix?: string;
  mode?: "conservative" | "critical";
  pauseWhenHidden?: boolean;
};

export function useRealtimeRefresh(
  sources: RealtimeRefreshSource[],
  onRefresh: () => void | Promise<void>,
  {
    enabled = true,
    debounceMs = 250,
    channelPrefix = "realtime-refresh",
    mode = "conservative",
    pauseWhenHidden = mode !== "critical",
  }: UseRealtimeRefreshOptions = {},
) {
  const normalizedSources = sources
    .filter((source) => Boolean(source?.table))
    .map((source) => ({
      event: source.event || "*",
      schema: source.schema || "public",
      table: source.table,
      ...(source.filter ? { filter: source.filter } : {}),
    }));

  const sourcesSignature = JSON.stringify(normalizedSources);

  useEffect(() => {
    const parsedSources = JSON.parse(sourcesSignature) as Array<{
      event: RealtimeEvent;
      schema: "public";
      table: string;
      filter?: string;
    }>;

    if (!enabled || parsedSources.length === 0) {
      return;
    }

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const effectiveDebounceMs = mode === "critical" ? debounceMs : Math.max(debounceMs, 600);

    const canRefresh = () => {
      if (typeof document === "undefined") {
        return true;
      }

      return !(pauseWhenHidden && document.hidden);
    };

    const scheduleRefresh = () => {
      if (!canRefresh()) {
        return;
      }

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        if (!canRefresh()) {
          return;
        }

        void onRefresh();
      }, effectiveDebounceMs);
    };

    const channels = parsedSources.map((source, index) =>
      supabase
        .channel(`${channelPrefix}-${source.table}-${index}`)
        .on("postgres_changes", source, scheduleRefresh)
        .subscribe(),
    );

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      channels.forEach((channel) => {
        void supabase.removeChannel(channel);
      });
    };
  }, [channelPrefix, debounceMs, enabled, mode, onRefresh, pauseWhenHidden, sourcesSignature]);
}
