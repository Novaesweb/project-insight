import { supabase } from "@/integrations/supabase/client";

// VAPID Public Key - segura para uso no frontend
const VAPID_PUBLIC_KEY = "BF6pXzgJ2bcUFzQAUEsnkoSGoYaPsDXLuf47QJ2XgzWLVjrWO_LgbDFp4sOHe-q68kXkv3b3w7XAhDFzQKBKEuo";
const PUSH_SW_PATH = "/sw.js";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getPushRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  const registered = await registerServiceWorker();
  if (!registered) return null;

  try {
    await navigator.serviceWorker.ready;
  } catch {
    // noop
  }

  return (await navigator.serviceWorker.getRegistration("/")) ?? registered;
}

export async function isPushSupported(): Promise<boolean> {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function getPushPermission(): Promise<NotificationPermission> {
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(PUSH_SW_PATH, { scope: "/" });
    await reg.update().catch(() => undefined);
    return reg;
  } catch (e) {
    console.error("SW registration failed:", e);
    return null;
  }
}

export async function subscribeToPush(userType: string, userId: string): Promise<boolean> {
  try {
    const supported = await isPushSupported();
    if (!supported) return false;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    const reg = await getPushRegistration();
    if (!reg) return false;

    const appServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    // Force refresh subscription to avoid stale browser keys/endpoints
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      const oldEndpoint = existing.endpoint;
      await existing.unsubscribe();
      await supabase.from("push_subscriptions").delete().eq("endpoint", oldEndpoint);
    }

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey as unknown as BufferSource,
    });

    const json = subscription.toJSON();

    const { error: upsertError } = await supabase.from("push_subscriptions").upsert(
      {
        user_type: userType,
        user_id: userId,
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh!,
        auth: json.keys!.auth!,
      },
      { onConflict: "endpoint" },
    );

    if (upsertError) {
      console.error("[Push] Failed to save subscription to DB:", upsertError);
      // Even if DB save fails, the subscription is valid in the browser
    } else {
      console.log("[Push] Subscription saved to DB successfully");
    }

    return true;
  } catch (e) {
    console.error("Push subscription failed:", e);
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const reg = await getPushRegistration();
    if (!reg) return false;

    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
    }
    return true;
  } catch (e) {
    console.error("Push unsubscribe failed:", e);
    return false;
  }
}

export async function isSubscribed(): Promise<boolean> {
  try {
    const reg = await getPushRegistration();
    if (!reg) return false;

    const subscription = await reg.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

export type PushTestResult = {
  ok: boolean;
  sent: number;
  total: number;
  message?: string;
  errors?: string[];
};

export async function sendTestNotification(): Promise<PushTestResult> {
  try {
    const reg = await getPushRegistration();
    if (!reg) {
      return {
        ok: false,
        sent: 0,
        total: 0,
        message: "Service Worker de push não disponível neste navegador.",
      };
    }

    const current = await reg.pushManager.getSubscription();

    if (!current) {
      return {
        ok: false,
        sent: 0,
        total: 0,
        message: "Este navegador não está inscrito. Ative o push novamente antes de testar.",
      };
    }

    const json = current.toJSON();
    const endpoint = json.endpoint;
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return {
        ok: false,
        sent: 0,
        total: 0,
        message: "Inscrição inválida no navegador. Desative/ative o push e tente de novo.",
      };
    }

    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id || "admin";

    const { data, error } = await supabase.functions.invoke("send-push-notification", {
      body: {
        target: "admin",
        targetId: userId,
        title: "🔔 Teste de Notificação",
        body: "Se você está vendo isso, as notificações push estão funcionando!",
        url: "/admin/configuracoes",
        directSubscription: {
          endpoint,
          p256dh,
          auth,
          user_id: userId,
          user_type: "admin",
        },
      },
    });

    if (error) {
      return { ok: false, sent: 0, total: 0, message: error.message };
    }

    const sent = Number(data?.sent ?? 0);
    const total = Number(data?.total ?? 0);
    const errors = Array.isArray(data?.errors) ? data.errors.map(String) : undefined;

    return {
      ok: sent > 0,
      sent,
      total,
      message: data?.message,
      errors,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha inesperada ao enviar teste";
    return { ok: false, sent: 0, total: 0, message };
  }
}

export async function sendPushToAdmins(title: string, body: string, url?: string): Promise<void> {
  try {
    // Try to get the current browser's subscription to ensure delivery even if DB lookup fails
    let directSubscription: { endpoint: string; p256dh: string; auth: string; user_type: string; user_id: string } | undefined;
    
    if ("serviceWorker" in navigator && "PushManager" in window) {
      const reg = await navigator.serviceWorker.getRegistration("/");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          const json = sub.toJSON();
          if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
            const session = await supabase.auth.getSession();
            const userId = session.data.session?.user?.id || "admin";
            directSubscription = {
              endpoint: json.endpoint,
              p256dh: json.keys.p256dh,
              auth: json.keys.auth,
              user_type: "admin",
              user_id: userId,
            };
          }
        }
      }
    }

    await supabase.functions.invoke("send-push-notification", {
      body: { target: "admin", title, body, url: url || "/admin", directSubscription },
    });
  } catch (e) {
    console.error("[Push] sendPushToAdmins failed:", e);
  }
}

export async function sendPushToClient(clienteId: string, title: string, body: string, url?: string): Promise<void> {
  await supabase.functions.invoke("send-push-notification", {
    body: { target: "cliente", targetId: clienteId, title, body, url: url || "/cliente/dashboard" },
  });
}
