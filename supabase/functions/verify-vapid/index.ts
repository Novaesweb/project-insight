// @ts-ignore
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
    console.log("[Verify] Checking VAPID configuration...");
    
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    const VAPID_PUBLIC_KEY = "BO9uhUEJOQdzq7bANXsX-6lKXuRqgd2PFAK43GXwB2NxPW_Wgb4yANtVk1-bxOtFUWjCRvxAX2k2jbagrPl2MaE";
    const VAPID_SUBJECT = "mailto:camila.lucas2604@gmail.com";

    const config = {
      hasPrivateKey: !!VAPID_PRIVATE_KEY,
      privateKeyLength: VAPID_PRIVATE_KEY?.length || 0,
      publicKey: VAPID_PUBLIC_KEY,
      subject: VAPID_SUBJECT,
      environment: Deno.env.get("DENO_DEPLOYMENT_ID") || "unknown"
    };

    console.log("[Verify] VAPID Configuration:", config);

    return new Response(JSON.stringify({
      success: true,
      message: "VAPID configuration verified",
      config
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[Verify] Error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
