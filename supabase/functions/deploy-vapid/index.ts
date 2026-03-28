// @ts-expect-error - APIs do Deno não reconhecidas localmente
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("[Deploy] Forcing VAPID deployment check...");
    
    // Verificar se as keys estão configuradas
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    const hasPrivateKey = !!VAPID_PRIVATE_KEY;
    
    const response = {
      success: true,
      message: "VAPID deployment check",
      timestamp: new Date().toISOString(),
      hasPrivateKey,
      privateKeyLength: VAPID_PRIVATE_KEY?.length || 0,
      instructions: {
        step1: "Configure VAPID_PRIVATE_KEY no Supabase Dashboard",
        step2: "Settings → Edge Functions → Secrets",
        step3: "Name: VAPID_PRIVATE_KEY",
        step4: "Value: _3WQ52LJ9q_l5E7_WibbuHPRV6-RNCbtj3ufBWfpzbk",
        step5: "Wait 2-3 minutes for deployment"
      }
    };

    console.log("[Deploy] Response:", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[Deploy] Error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
