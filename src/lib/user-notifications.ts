import { supabase } from "@/integrations/supabase/client";
import { sendPushToAdmins, sendPushToClient } from "@/lib/push-notifications";

type NotificationInput = {
  title: string;
  body: string;
  url?: string;
  push?: boolean;
};

export async function notifyAdminPanel({
  title,
  body,
  url = "/admin",
  push = false,
}: NotificationInput) {
  const jobs: Promise<unknown>[] = [
    supabase.from("notifications").insert({
      title,
      body,
      url,
      user_type: "admin",
      user_id: "admin",
    } as never),
  ];

  if (push) {
    jobs.push(sendPushToAdmins(title, body, url));
  }

  const results = await Promise.allSettled(jobs);
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("[Notifications] admin notify failed", result.reason);
    }
  });
}

export async function notifyClientPanel(
  clienteId: string | null | undefined,
  {
    title,
    body,
    url = "/cliente/dashboard",
    push = true,
  }: NotificationInput,
) {
  if (!clienteId) return;

  const jobs: Promise<unknown>[] = [
    supabase.from("notifications").insert({
      title,
      body,
      url,
      user_type: "cliente",
      user_id: clienteId,
    } as never),
  ];

  if (push) {
    jobs.push(sendPushToClient(clienteId, title, body, url));
  }

  const results = await Promise.allSettled(jobs);
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("[Notifications] client notify failed", result.reason);
    }
  });
}
