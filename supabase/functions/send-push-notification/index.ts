// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webPush from "https://esm.sh/web-push@3.6.7";
import {
  createAdminClient,
  getCorsHeaders,
  jsonResponse,
  requireInternalAdmin,
} from "../_shared/internal-security.ts";

declare const Deno: any;

const VAPID_PUBLIC_KEY = "BO9uhUEJOQdzq7bANXsX-6lKXuRqgd2PFAK43GXwB2NxPW_Wgb4yANtVk1-bxOtFUWjCRvxAX2k2jbagrPl2MaE";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:contato@novaesweb.site";

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string;
  user_type: string;
};

serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) });
  }

  try {
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!VAPID_PRIVATE_KEY) {
      return jsonResponse({ error: "Push indisponível." }, 503, origin);
    }

    const supabaseAdmin = createAdminClient();
    const auth = await requireInternalAdmin(req, supabaseAdmin, origin);
    if (auth.response) {
      return auth.response;
    }

    webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const bodyData = await req.json();
    const { target, targetId, title, body, url, tag, directSubscription } = bodyData;

    let subscriptions: PushSubscriptionRow[] = [];

    if (directSubscription?.endpoint && directSubscription?.p256dh && directSubscription?.auth) {
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

      const { data, error } = await query;
      if (error) {
        return jsonResponse({ error: "Falha ao localizar inscrições de push." }, 500, origin);
      }

      subscriptions = (data || []) as PushSubscriptionRow[];
    }

    const notificationRecords: {
      title: string;
      body: string;
      user_id: string;
      user_type: string;
      url?: string;
    }[] = [];
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
      return jsonResponse({ message: "Nenhuma inscrição encontrada.", sent: 0, total: 0 }, 200, origin);
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
          },
        );
        sent++;
      } catch (error) {
        const err = error as { statusCode?: number; message?: string };

        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        } else if (err.message) {
          errors.push(err.message);
        }
      }
    }

    return jsonResponse(
      { sent, total: subscriptions.length, errors: errors.length > 0 ? errors : undefined },
      200,
      origin,
    );
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Falha inesperada no envio de push." },
      500,
      origin,
    );
  }
});
