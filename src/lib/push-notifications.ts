import { supabase } from "@/integrations/supabase/client";

let vapidPublicKey: string | null = null;

async function getVapidPublicKey(): Promise<string | null> {
  if (vapidPublicKey) return vapidPublicKey;
  
  const { data } = await supabase.from("app_config").select("value").eq("key", "vapid_public_key").maybeSingle();
  if (data?.value) {
    vapidPublicKey = data.value;
    return vapidPublicKey;
  }
  
  // Generate keys via edge function
  const { data: result, error } = await supabase.functions.invoke("setup-vapid");
  if (!error && result?.publicKey) {
    vapidPublicKey = result.publicKey;
    return vapidPublicKey;
  }
  
  return null;
}

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

    const publicKey = await getVapidPublicKey();
    if (!publicKey) return false;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
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

export async function sendTestNotification(): Promise<boolean> {
  const { error } = await supabase.functions.invoke("send-push-notification", {
    body: {
      target: "admin",
      title: "🔔 Teste de Notificação",
      body: "Se você está vendo isso, as notificações push estão funcionando!",
      url: "/admin/configuracoes",
    },
  });
  return !error;
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
