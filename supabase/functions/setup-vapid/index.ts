import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function generateVAPIDKeys() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  
  const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyRaw)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  
  return {
    publicKey: publicKeyBase64,
    privateKeyJwk: JSON.stringify(privateKeyJwk),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if keys already exist
    const { data: existing } = await supabaseAdmin
      .from("app_config")
      .select("key, value")
      .in("key", ["vapid_public_key", "vapid_private_key"]);

    if (existing && existing.length === 2) {
      const pub = existing.find((e: any) => e.key === "vapid_public_key");
      return new Response(JSON.stringify({ publicKey: pub?.value, message: "VAPID keys already configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate new keys
    const keys = await generateVAPIDKeys();

    await supabaseAdmin.from("app_config").upsert([
      { key: "vapid_public_key", value: keys.publicKey },
      { key: "vapid_private_key", value: keys.privateKeyJwk },
    ]);

    return new Response(JSON.stringify({ publicKey: keys.publicKey, message: "VAPID keys generated successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
