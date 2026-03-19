import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildPushHTTPRequest } from "npm:@pushforge/builder@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const vapidPrivateKeyRaw = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:contato@novaesweb.com.br";
    const vapidPublicKey = "BJnUoxTYpeAuhr2EhCR2KxQNW_qCA-IXt6yQKMpyZBT6odx_6jwRdiG0tZICJW50LQS-ujmwMgWeoMy28eya64I";

    if (!vapidPrivateKeyRaw) {
      return new Response(JSON.stringify({ error: "VAPID_PRIVATE_KEY secret not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build JWK from raw base64url private key or parse existing JWK
    let privateJWK: JsonWebKey;
    if (vapidPrivateKeyRaw.startsWith("{")) {
      privateJWK = JSON.parse(vapidPrivateKeyRaw);
    } else {
      // Raw base64url private key - build JWK
      // Decode public key to get x and y coordinates
      const pubBase64 = vapidPublicKey.replace(/-/g, "+").replace(/_/g, "/");
      const pubPadded = pubBase64 + "=".repeat((4 - (pubBase64.length % 4)) % 4);
      const pubKeyBytes = Uint8Array.from(atob(pubPadded), c => c.charCodeAt(0));
      // Skip first byte (0x04 uncompressed point indicator)
      const xBytes = pubKeyBytes.slice(1, 33);
      const yBytes = pubKeyBytes.slice(33, 65);
      const toBase64Url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      
      privateJWK = {
        kty: "EC",
        crv: "P-256",
        d: vapidPrivateKeyRaw,
        x: toBase64Url(xBytes),
        y: toBase64Url(yBytes),
      };
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const bodyData = await req.json();
    const { target, targetId, title, body, url, tag, directSubscription } = bodyData;

    let subscriptions: Array<{
      id: string;
      endpoint: string;
      p256dh: string;
      auth: string;
      user_id: string;
      user_type: string;
    }> = [];

    if (
      directSubscription?.endpoint &&
      directSubscription?.p256dh &&
      directSubscription?.auth
    ) {
      const directUserId = directSubscription.user_id || targetId || "admin";
      const directUserType = directSubscription.user_type || target || "admin";

      await supabaseAdmin.from("push_subscriptions").upsert(
        {
          endpoint: directSubscription.endpoint,
          p256dh: directSubscription.p256dh,
          auth: directSubscription.auth,
          user_id: directUserId,
          user_type: directUserType,
        },
        { onConflict: "endpoint" },
      );

      subscriptions = [
        {
          id: "direct",
          endpoint: directSubscription.endpoint,
          p256dh: directSubscription.p256dh,
          auth: directSubscription.auth,
          user_id: directUserId,
          user_type: directUserType,
        },
      ];
    } else {
      let query = supabaseAdmin.from("push_subscriptions").select("*");
      if (target === "admin") {
        query = query.eq("user_type", "admin");
      } else if (target === "cliente" && targetId) {
        query = query.eq("user_type", "cliente").eq("user_id", targetId);
      }

      const { data } = await query;
      subscriptions = (data || []) as typeof subscriptions;
    }

    // Save notification history
    const notificationRecords: { title: string; body: string; user_id: string; user_type: string; url?: string }[] = [];
    const seenUsers = new Set<string>();
    if (subscriptions) {
      for (const sub of subscriptions) {
        const key = `${sub.user_type}:${sub.user_id}`;
        if (!seenUsers.has(key)) {
          seenUsers.add(key);
          notificationRecords.push({ title, body, user_id: sub.user_id, user_type: sub.user_type, url });
        }
      }
    }
    if (notificationRecords.length === 0 && target) {
      notificationRecords.push({ title, body, user_id: targetId || "system", user_type: target, url });
    }
    if (notificationRecords.length > 0) {
      await supabaseAdmin.from("notifications").insert(notificationRecords);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "No subscriptions found, notification saved to history", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        // Use PushForge with correct payload/adminContact/options structure
        const { endpoint, headers, body: encryptedBody } = await buildPushHTTPRequest({
          privateJWK,
          subscription: {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          message: {
            payload: {
              title,
              body,
              url,
              tag,
              icon: "/push-logo.png",
            },
            adminContact: vapidSubject,
            options: {
              urgency: "normal",
              ttl: 86400,
            },
          },
        });

        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: encryptedBody,
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
