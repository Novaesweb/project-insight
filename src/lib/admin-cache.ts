import { Tables } from "@/integrations/supabase/types";

interface AdminCache {
  user: Tables<"usuarios"> | null;
  timestamp: number;
  email: string | null;
}

let cache: AdminCache | null = null;
const CACHE_DURATION_MS = 60_000; // 1 minute cache

export function getCachedAdminUser(email: string) {
  const now = Date.now();
  if (cache && cache.email === email.toLowerCase() && now - cache.timestamp < CACHE_DURATION_MS) {
    return cache.user;
  }
  return undefined; // Not in cache or expired
}

export function setCachedAdminUser(email: string, user: Tables<"usuarios"> | null) {
  cache = {
    user,
    email: email.toLowerCase(),
    timestamp: Date.now(),
  };
}

export function clearAdminCache() {
  cache = null;
}
