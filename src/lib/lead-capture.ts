import { supabase } from "@/integrations/supabase/client";

export interface LeadCapturePayload {
  nome: string;
  email: string;
  whatsapp: string;
  nome_negocio: string;
  servicos: string[];
  orcamento?: string;
  mensagem?: string;
  source?: string;
  origin?: string;
  _fax?: string;
}

export async function submitLeadCapture(payload: LeadCapturePayload) {
  const { data, error } = await supabase.functions.invoke("capture-lead", {
    body: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data?.error) {
    throw new Error(String(data.error));
  }

  return data;
}
