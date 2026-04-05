// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createAdminClient,
  getCorsHeaders,
  hasInternalCronSecret,
  jsonResponse,
  requireInternalAdmin,
} from "../_shared/internal-security.ts";

declare const Deno: any;

serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) });
  }

  try {
    const supabase = createAdminClient();
    const allowedBySecret = hasInternalCronSecret(req, "AUTO_ASAAS_CRON_SECRET");

    if (!allowedBySecret) {
      const auth = await requireInternalAdmin(req, supabase, origin);
      if (auth.response) {
        return auth.response;
      }
    }

    const asaasApiKey = Deno.env.get("ASAAS_API_KEY");
    const asaasEnv = Deno.env.get("ASAAS_ENVIRONMENT") || "sandbox";

    if (!asaasApiKey) {
      return jsonResponse({ error: "Integração indisponível." }, 503, origin);
    }

    const asaasBaseUrl =
      asaasEnv === "production"
        ? "https://api.asaas.com/v3"
        : "https://sandbox.asaas.com/api/v3";

    const hoje = new Date();
    const tresDias = new Date(hoje);
    tresDias.setDate(tresDias.getDate() + 3);

    const hojeStr = hoje.toISOString().split("T")[0];
    const tresDiasStr = tresDias.toISOString().split("T")[0];

    const { data: faturas, error: fatErr } = await supabase
      .from("financeiro")
      .select("*, clientes(id, nome, email, documento, telefone)")
      .eq("status", "pendente")
      .eq("tipo", "entrada")
      .lte("vencimento", tresDiasStr)
      .gte("vencimento", hojeStr);

    if (fatErr) {
      throw fatErr;
    }

    if (!faturas || faturas.length === 0) {
      return jsonResponse({ message: "Nenhuma fatura para enviar.", count: 0 }, 200, origin);
    }

    const faturaIds = faturas.map((f: any) => f.id);
    const { data: jaEnviadas } = await supabase
      .from("recurrent_billing_history")
      .select("financeiro_id, asaas_payment_id")
      .in("financeiro_id", faturaIds)
      .not("asaas_payment_id", "is", null);

    const enviadasSet = new Set((jaEnviadas || []).map((row: any) => row.financeiro_id));

    let enviadas = 0;
    let erros = 0;

    for (const fatura of faturas) {
      if (enviadasSet.has(fatura.id)) {
        continue;
      }

      const cliente = fatura.clientes;
      if (!cliente) {
        continue;
      }

      try {
        let asaasCustomerId: string | null = null;

        if (cliente.documento) {
          const searchResp = await fetch(`${asaasBaseUrl}/customers?cpfCnpj=${cliente.documento}`, {
            headers: { access_token: asaasApiKey },
          });
          const searchData = await searchResp.json();
          if (searchData.data && searchData.data.length > 0) {
            asaasCustomerId = searchData.data[0].id;
          }
        }

        if (!asaasCustomerId && cliente.email) {
          const searchResp = await fetch(`${asaasBaseUrl}/customers?email=${encodeURIComponent(cliente.email)}`, {
            headers: { access_token: asaasApiKey },
          });
          const searchData = await searchResp.json();
          if (searchData.data && searchData.data.length > 0) {
            asaasCustomerId = searchData.data[0].id;
          }
        }

        if (!asaasCustomerId) {
          const createResp = await fetch(`${asaasBaseUrl}/customers`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              access_token: asaasApiKey,
            },
            body: JSON.stringify({
              name: cliente.nome,
              email: cliente.email,
              cpfCnpj: cliente.documento || undefined,
              mobilePhone: cliente.telefone || undefined,
              externalReference: cliente.id,
            }),
          });
          const createData = await createResp.json();
          if (createData.id) {
            asaasCustomerId = createData.id;
          } else {
            erros++;
            continue;
          }
        }

        const paymentResp = await fetch(`${asaasBaseUrl}/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            access_token: asaasApiKey,
          },
          body: JSON.stringify({
            customer: asaasCustomerId,
            billingType: "UNDEFINED",
            value: Number(fatura.valor),
            dueDate: fatura.vencimento,
            description: fatura.descricao || `Cobrança - ${cliente.nome}`,
            externalReference: fatura.id,
          }),
        });
        const paymentData = await paymentResp.json();

        if (paymentData.id) {
          await supabase
            .from("recurrent_billing_history")
            .update({
              asaas_payment_id: paymentData.id,
              asaas_invoice_url: paymentData.invoiceUrl || null,
              updated_at: new Date().toISOString(),
            })
            .eq("financeiro_id", fatura.id);

          if (paymentData.invoiceUrl) {
            const novaDesc = `${fatura.descricao}\n(Asaas: ${paymentData.invoiceUrl})`;
            await supabase
              .from("financeiro")
              .update({ descricao: novaDesc })
              .eq("id", fatura.id);
          }

          enviadas++;
        } else {
          erros++;
        }
      } catch {
        erros++;
      }
    }

    return jsonResponse(
      { message: "Processamento concluído.", enviadas, erros, total: faturas.length },
      200,
      origin,
    );
  } catch (error: any) {
    return jsonResponse({ error: error.message || "Falha no envio automático ao Asaas." }, 500, origin);
  }
});
