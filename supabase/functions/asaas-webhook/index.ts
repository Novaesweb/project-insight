import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { createAdminClient, getCorsHeaders } from "../_shared/internal-security.ts";

type AsaasPayment = {
  id?: string | null;
  externalReference?: string | null;
  invoiceUrl?: string | null;
  clientPaymentDate?: string | null;
  paymentDate?: string | null;
  billingType?: string | null;
};

type AsaasWebhookEvent = {
  event?: string | null;
  payment?: AsaasPayment | null;
};

type FinanceiroRow = {
  id: string;
  cliente_id: string | null;
  status: string;
};

const PAID_EVENTS = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);
const OVERDUE_EVENTS = new Set(["PAYMENT_OVERDUE"]);
const RESET_TO_PENDING_EVENTS = new Set(["PAYMENT_DELETED", "PAYMENT_REFUNDED", "PAYMENT_RESTORED"]);

function normalizeString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

async function fetchFinanceiroById(supabaseAdmin: ReturnType<typeof createAdminClient>, financeiroId: string) {
  const { data, error } = await supabaseAdmin
    .from("financeiro")
    .select("id, cliente_id, status")
    .eq("id", financeiroId)
    .maybeSingle();

  if (error) throw error;
  return (data as FinanceiroRow | null) ?? null;
}

async function resolveFinanceiroRecord(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  payment: AsaasPayment,
) {
  const externalReference = normalizeString(payment.externalReference);
  if (externalReference) {
    const byExternalReference = await fetchFinanceiroById(supabaseAdmin, externalReference);
    if (byExternalReference) {
      return byExternalReference;
    }
  }

  const paymentId = normalizeString(payment.id);
  if (paymentId) {
    const { data: byHistoryId, error: historyIdError } = await supabaseAdmin
      .from("recurrent_billing_history")
      .select("financeiro_id")
      .eq("asaas_payment_id", paymentId)
      .limit(1)
      .maybeSingle();

    if (historyIdError) throw historyIdError;
    if (byHistoryId?.financeiro_id) {
      const financeiro = await fetchFinanceiroById(supabaseAdmin, byHistoryId.financeiro_id);
      if (financeiro) {
        return financeiro;
      }
    }
  }

  const invoiceUrl = normalizeString(payment.invoiceUrl);
  if (invoiceUrl) {
    const { data: byHistoryUrl, error: historyUrlError } = await supabaseAdmin
      .from("recurrent_billing_history")
      .select("financeiro_id")
      .eq("asaas_invoice_url", invoiceUrl)
      .limit(1)
      .maybeSingle();

    if (historyUrlError) throw historyUrlError;
    if (byHistoryUrl?.financeiro_id) {
      const financeiro = await fetchFinanceiroById(supabaseAdmin, byHistoryUrl.financeiro_id);
      if (financeiro) {
        return financeiro;
      }
    }
  }

  if (invoiceUrl) {
    const { data: byDescricaoUrl, error: descUrlError } = await supabaseAdmin
      .from("financeiro")
      .select("id, cliente_id, status")
      .ilike("descricao", `%${invoiceUrl}%`)
      .limit(1)
      .maybeSingle();

    if (descUrlError) throw descUrlError;
    if (byDescricaoUrl) {
      return byDescricaoUrl as FinanceiroRow;
    }
  }

  if (paymentId) {
    const { data: byDescricaoPaymentId, error: descPaymentError } = await supabaseAdmin
      .from("financeiro")
      .select("id, cliente_id, status")
      .ilike("descricao", `%${paymentId}%`)
      .limit(1)
      .maybeSingle();

    if (descPaymentError) throw descPaymentError;
    if (byDescricaoPaymentId) {
      return byDescricaoPaymentId as FinanceiroRow;
    }
  }

  return null;
}

function mapFinanceiroStatus(eventName: string) {
  if (PAID_EVENTS.has(eventName)) return "pago";
  if (OVERDUE_EVENTS.has(eventName)) return "em_atraso";
  if (RESET_TO_PENDING_EVENTS.has(eventName)) return "pendente";
  return null;
}

function mapRecurringStatus(eventName: string) {
  if (PAID_EVENTS.has(eventName)) return "pago_asaas";
  if (OVERDUE_EVENTS.has(eventName)) return "em_atraso";
  if (RESET_TO_PENDING_EVENTS.has(eventName)) return "pendente";
  return null;
}

serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) });
  }

  try {
    const signature = req.headers.get("asaas_signature") || req.headers.get("asaas-signature");
    if (!signature) {
      throw new Error("Missing Asaas signature");
    }

    const body = await req.text();
    const event = JSON.parse(body) as AsaasWebhookEvent;
    const eventName = normalizeString(event.event);
    const payment = event.payment ?? null;

    if (!eventName || !payment) {
      throw new Error("Invalid Asaas payload");
    }

    const financeiroStatus = mapFinanceiroStatus(eventName);
    const recurringStatus = mapRecurringStatus(eventName);

    if (!financeiroStatus && !recurringStatus) {
      return new Response("OK", { headers: getCorsHeaders(origin) });
    }

    const supabaseAdmin = createAdminClient();
    const financeiro = await resolveFinanceiroRecord(supabaseAdmin, payment);

    if (!financeiro) {
      console.warn("[asaas-webhook] no financeiro match", {
        event: eventName,
        paymentId: payment.id ?? null,
        externalReference: payment.externalReference ?? null,
        invoiceUrl: payment.invoiceUrl ?? null,
      });

      return new Response("OK", { headers: getCorsHeaders(origin) });
    }

    if (financeiroStatus && financeiro.status !== financeiroStatus) {
      const { error: financeiroError } = await supabaseAdmin
        .from("financeiro")
        .update({ status: financeiroStatus })
        .eq("id", financeiro.id);

      if (financeiroError) {
        throw financeiroError;
      }
    }

    const historyPatch: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    };

    const paymentId = normalizeString(payment.id);
    const invoiceUrl = normalizeString(payment.invoiceUrl);
    const paidAt = normalizeString(payment.clientPaymentDate) || normalizeString(payment.paymentDate);

    if (paymentId) historyPatch.asaas_payment_id = paymentId;
    if (invoiceUrl) historyPatch.asaas_invoice_url = invoiceUrl;
    if (recurringStatus) historyPatch.status = recurringStatus;
    if (paidAt && recurringStatus === "pago_asaas") historyPatch.data_pagamento = paidAt;
    if (normalizeString(payment.billingType)) historyPatch.forma_pagamento = normalizeString(payment.billingType);

    const { error: historyError } = await supabaseAdmin
      .from("recurrent_billing_history")
      .update(historyPatch)
      .eq("financeiro_id", financeiro.id);

    if (historyError) {
      throw historyError;
    }

    return new Response("OK", { headers: getCorsHeaders(origin) });
  } catch (error) {
    console.error("[asaas-webhook] error", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 400,
        headers: {
          ...getCorsHeaders(origin),
          "Content-Type": "application/json",
        },
      },
    );
  }
});
