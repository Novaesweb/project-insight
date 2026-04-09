import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ContractEventRow = Tables<"contrato_eventos">;

export const CONTRACT_EVENT_LABELS: Record<string, string> = {
  rascunho_salvo: "Rascunho salvo",
  cofre_salvo: "Contrato salvo no cofre",
  enviado: "Contrato enviado ao cliente",
  visualizado: "Contrato visualizado",
  assinado: "Contrato aprovado",
  ajuste_solicitado: "Ajuste solicitado",
  arquivado: "Contrato arquivado",
  desarquivado: "Contrato desarquivado",
  duplicado: "Proposta duplicada",
};

export function getContractEventLabel(type: string) {
  return CONTRACT_EVENT_LABELS[type] || type;
}

export function formatContractEventRelative(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
}

export async function createContractEvent(input: {
  contratoId: string;
  tipo: string;
  titulo: string;
  descricao?: string | null;
  actorType?: string;
  actorId?: string | null;
  meta?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("contrato_eventos").insert({
    contrato_id: input.contratoId,
    tipo: input.tipo,
    titulo: input.titulo,
    descricao: input.descricao ?? null,
    actor_type: input.actorType ?? "admin",
    actor_id: input.actorId ?? null,
    meta: input.meta ?? {},
  } as never);

  if (error) throw error;
}

export async function createAdminNotification(title: string, body: string, url = "/admin/contratos") {
  const { error } = await supabase.from("notifications").insert({
    title,
    body,
    url,
    user_type: "admin",
    user_id: "admin",
  } as never);

  if (error) throw error;
}

export async function createClientNotification(clienteId: string, title: string, body: string, url = "/cliente/contratos") {
  const { error } = await supabase.from("notifications").insert({
    title,
    body,
    url,
    user_type: "cliente",
    user_id: clienteId,
  } as never);

  if (error) throw error;
}
