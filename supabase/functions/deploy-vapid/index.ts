// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  return new Response(
    JSON.stringify({
      error: "Função desativada por segurança. Use secrets do Supabase para gerenciar VAPID.",
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json" },
    },
  );
});
