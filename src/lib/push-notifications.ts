import { supabase } from "@/integrations/supabase/client";

// VAPID Public Key - segura para uso no frontend
const VAPID_PUBLIC_KEY = "BMlJpRsOWX7luyOKwJASaYSiYsaFB8wFAby052uhW-tYhfAK57RzU6Y_aJBjJqhCWoU1OztcKE_5fUUv3ghsubA";

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

export async function isPushSupported(): Promise<boolean> {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function getPushPermission(): Promise<NotificationPermission> {
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
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

    const reg = await registerServiceWorker();
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

    await supabase.from("push_subscriptions").upsert({
      user_type: userType,
      user_id: userId,
      endpoint: json.endpoint!,
      p256dh: json.keys!.p256dh!,
      auth: json.keys!.auth!,
    }, { onConflict: "endpoint" });

    return true;
  } catch (e) {
    console.error("Push subscription failed:", e);
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
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
    if (!("serviceWorker" in navigator)) return false;
    const reg = await navigator.serviceWorker.ready;
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
  const { data, error } = await supabase.functions.invoke("send-push-notification", {
    body: {
      target: "admin",
      title: "🔔 Teste de Notificação",
      body: "Se você está vendo isso, as notificações push estão funcionando!",
      url: "/admin/configuracoes",
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
}

export async function sendPushToAdmins(title: string, body: string, url?: string): Promise<void> {
  await supabase.functions.invoke("send-push-notification", {
    body: { target: "admin", title, body, url: url || "/admin" },
  });
}

export async function sendPushToClient(clienteId: string, title: string, body: string, url?: string): Promise<void> {
  await supabase.functions.invoke("send-push-notification", {
    body: { target: "cliente", targetId: clienteId, title, body, url: url || "/cliente/dashboard" },
  });
}
