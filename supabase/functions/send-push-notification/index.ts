// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webPush from "npm:web-push@3";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VAPID_PUBLIC_KEY = "BF6pXzgJ2bcUFzQAUEsnkoSGoYaPsDXLuf47QJ2XgzWLVjrWO_LgbDFp4sOHe-q68kXkv3b3w7XAhDFzQKBKEuo";
const VAPID_SUBJECT = "mailto:camila.lucas2604@gmail.com";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("[Push] Starting request...");

    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!VAPID_PRIVATE_KEY) {
      console.error("[Push] VAPID_PRIVATE_KEY not set");
      return new Response(JSON.stringify({ error: "VAPID_PRIVATE_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Configure web-push with VAPID keys
    webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    console.log("[Push] VAPID configured successfully");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const bodyData = await req.json();
    const { target, targetId, title, body, url, tag, directSubscription } = bodyData;

    console.log("[Push] Request:", { target, targetId, title });

    let subscriptions: Array<{
      id: string;
      endpoint: string;
      p256dh: string;
      auth: string;
      user_id: string;
      user_type: string;
    }> = [];

    // Direct subscription provided (test notification)
    if (directSubscription?.endpoint && directSubscription?.p256dh && directSubscription?.auth) {
      console.log("[Push] Using direct subscription");
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
        { onConflict: "endpoint" }
      );

      subscriptions = [{
        id: "direct",
        endpoint: directSubscription.endpoint,
        p256dh: directSubscription.p256dh,
        auth: directSubscription.auth,
        user_id: directUserId,
        user_type: directUserType,
      }];
    } else {
      let query = supabaseAdmin.from("push_subscriptions").select("*");
      if (target === "admin") {
        query = query.eq("user_type", "admin");
      } else if (target === "cliente" && targetId) {
        query = query.eq("user_type", "cliente").eq("user_id", targetId);
      }

      const { data, error } = await query;
      if (error) console.error("[Push] Error fetching subscriptions:", error);
      subscriptions = (data || []) as typeof subscriptions;
      console.log("[Push] Found", subscriptions.length, "subscriptions");
    }

    // Save notification to history
    const notificationRecords: { title: string; body: string; user_id: string; user_type: string; url?: string }[] = [];
    const seenUsers = new Set<string>();
    for (const sub of subscriptions) {
      const key = `${sub.user_type}:${sub.user_id}`;
      if (!seenUsers.has(key)) {
        seenUsers.add(key);
        notificationRecords.push({ title, body, user_id: sub.user_id, user_type: sub.user_type, url });
      }
    }
    if (notificationRecords.length === 0 && target) {
      notificationRecords.push({ title, body, user_id: targetId || "system", user_type: target, url });
    }
    if (notificationRecords.length > 0) {
      await supabaseAdmin.from("notifications").insert(notificationRecords);
    }

    if (subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "No subscriptions found", sent: 0, total: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    const errors: string[] = [];

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
      tag: tag || "novaesweb",
      icon: "/push-icon-192.png",
      badge: "/push-icon-192.png",
    });

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
          {
            TTL: 86400,
            urgency: "normal",
          }
        );
        sent++;
        console.log("[Push] Sent to:", sub.endpoint.slice(0, 50));
      } catch (e: unknown) {
        const err = e as { statusCode?: number; message?: string };
        console.error("[Push] Error sending:", err.statusCode, err.message);
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired, remove it
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
          console.log("[Push] Removed expired subscription:", sub.id);
        } else {
          errors.push(`${err.statusCode}: ${err.message}`);
        }
      }
    }

    console.log("[Push] Done. Sent:", sent, "of", subscriptions.length);
    return new Response(JSON.stringify({ sent, total: subscriptions.length, errors: errors.length > 0 ? errors : undefined }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[Push] Fatal error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
