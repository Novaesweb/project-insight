import { supabase } from "@/integrations/supabase/client";

export interface SupportTicketMetaEntry {
  assignedToUserId?: string | null;
  assignedToEmail?: string;
  assignedToName?: string;
  slaHours?: number;
  dueAt?: string;
  updatedAt?: string;
}

export type SupportTicketMetaMap = Record<string, SupportTicketMetaEntry>;

export const SLA_PRESETS = [4, 8, 12, 24, 48] as const;

export function getDefaultSlaHours(prioridade?: string | null) {
  const normalized = prioridade?.toLowerCase();

  if (normalized === "alta" || normalized === "urgente") return 4;
  if (normalized === "media" || normalized === "média") return 12;
  return 24;
}

export function getSlaLabel(hours: number) {
  return hours >= 24 ? `${hours / 24} dia${hours >= 48 ? "s" : ""}` : `${hours}h`;
}

export function computeDueAt(baseDate: string, slaHours: number) {
  const due = new Date(baseDate);
  due.setHours(due.getHours() + slaHours);
  return due.toISOString();
}

export async function loadSupportTicketMeta() {
  const { data, error } = await supabase
    .from("ticket_support_meta")
    .select(`
      ticket_id,
      assigned_to_user_id,
      sla_hours,
      due_at,
      updated_at,
      assigned_user:usuarios!ticket_support_meta_assigned_to_user_id_fkey (
        email,
        nome
      )
    `);

  if (error) throw error;

  return (data || []).reduce((accumulator, item) => {
    const assignedUser = Array.isArray(item.assigned_user) ? item.assigned_user[0] : item.assigned_user;

    accumulator[item.ticket_id] = {
      assignedToUserId: item.assigned_to_user_id,
      assignedToEmail: assignedUser?.email || undefined,
      assignedToName: assignedUser?.nome || undefined,
      slaHours: item.sla_hours ?? undefined,
      dueAt: item.due_at ?? undefined,
      updatedAt: item.updated_at ?? undefined,
    };

    return accumulator;
  }, {} as SupportTicketMetaMap);
}

export async function updateSupportTicketMeta(ticketId: string, patch: SupportTicketMetaEntry) {
  const payload: Record<string, string | number | null> = {
    ticket_id: ticketId,
    updated_at: new Date().toISOString(),
  };

  if ("assignedToUserId" in patch) payload.assigned_to_user_id = patch.assignedToUserId ?? null;
  if ("slaHours" in patch) payload.sla_hours = patch.slaHours ?? null;
  if ("dueAt" in patch) payload.due_at = patch.dueAt ?? null;

  const { error } = await supabase.from("ticket_support_meta").upsert(payload, { onConflict: "ticket_id" });

  if (error) throw error;

  return loadSupportTicketMeta();
}

export function resolveTicketSla(ticket: { id: string; created_at: string; prioridade?: string | null }, entry?: SupportTicketMetaEntry) {
  const slaHours = entry?.slaHours ?? getDefaultSlaHours(ticket.prioridade);
  const dueAt = entry?.dueAt ?? computeDueAt(ticket.created_at, slaHours);
  return { slaHours, dueAt };
}

export function isTicketOverdue(status: string, dueAt: string) {
  if (status === "resolvido") return false;
  return new Date(dueAt).getTime() < Date.now();
}
