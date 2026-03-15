import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createJWT(privateKeyJwk: JsonWebKey, audience: string, subject: string): Promise<string> {
  const header = { alg: "ES256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 86400, sub: subject };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "jwk", privateKeyJwk,
    { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    key, new TextEncoder().encode(signingInput)
  );

  const sigBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;

  if (sigBytes.length === 64) {
    r = sigBytes.slice(0, 32);
    s = sigBytes.slice(32);
  } else {
    let offset = 2;
    const rLen = sigBytes[offset + 1];
    offset += 2;
    const rBytes = sigBytes.slice(offset, offset + rLen);
    r = rBytes.length > 32 ? rBytes.slice(rBytes.length - 32) : rBytes;
    offset += rLen;
    const sLen = sigBytes[offset + 1];
    offset += 2;
    const sBytes = sigBytes.slice(offset, offset + sLen);
    s = sBytes.length > 32 ? sBytes.slice(sBytes.length - 32) : sBytes;
  }

  const rawSig = new Uint8Array(64);
  rawSig.set(r.length < 32 ? new Uint8Array([...new Array(32 - r.length).fill(0), ...r]) : r, 0);
  rawSig.set(s.length < 32 ? new Uint8Array([...new Array(32 - s.length).fill(0), ...s]) : s, 32);

  return `${signingInput}.${base64UrlEncode(rawSig.buffer)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Read VAPID credentials from environment secrets (NOT from database)
    const vapidPrivateKeyRaw = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:contato@novaesweb.com.br";
    const vapidPublicKey = "BMlJpRsOWX7luyOKwJASaYSiYsaFB8wFAby052uhW-tYhfAK57RzU6Y_aJBjJqhCWoU1OztcKE_5fUUv3ghsubA";

    if (!vapidPrivateKeyRaw) {
      return new Response(JSON.stringify({ error: "VAPID_PRIVATE_KEY secret not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vapidPrivateKeyJwk: JsonWebKey = JSON.parse(vapidPrivateKeyRaw);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { target, targetId, title, body, url, tag } = await req.json();

    // Get subscriptions based on target
    let query = supabaseAdmin.from("push_subscriptions").select("*");
    if (target === "admin") {
      query = query.eq("user_type", "admin");
    } else if (target === "cliente" && targetId) {
      query = query.eq("user_type", "cliente").eq("user_id", targetId);
    }

    const { data: subscriptions } = await query;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "No subscriptions found", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({ title, body, url, tag, icon: "/pwa-192x192.png" });

    let sent = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        const endpointUrl = new URL(sub.endpoint);
        const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

        const jwt = await createJWT(vapidPrivateKeyJwk, audience, vapidSubject);

        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Authorization": `vapid t=${jwt}, k=${vapidPublicKey}`,
            "Content-Type": "application/json",
            "Content-Encoding": "aes128gcm",
            "TTL": "86400",
          },
          body: payload,
        });

        if (response.ok || response.status === 201) {
          sent++;
        } else if (response.status === 410 || response.status === 404) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          const text = await response.text();
          errors.push(`${response.status}: ${text}`);
        }
      } catch (e) {
        errors.push(e.message);
      }
    }

    return new Response(JSON.stringify({ sent, total: subscriptions.length, errors: errors.length > 0 ? errors : undefined }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
