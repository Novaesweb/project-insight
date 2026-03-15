import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// This function is now deprecated - VAPID keys are managed via secrets
// Kept only for backwards compatibility
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(JSON.stringify({ 
    message: "VAPID keys are now managed via environment secrets. No action needed.",
    publicKey: "BMlJpRsOWX7luyOKwJASaYSiYsaFB8wFAby052uhW-tYhfAK57RzU6Y_aJBjJqhCWoU1OztcKE_5fUUv3ghsubA"
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
