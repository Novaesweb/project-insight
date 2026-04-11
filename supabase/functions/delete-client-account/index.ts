// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createAdminClient,
  getCorsHeaders,
  jsonResponse,
  requireInternalAdmin,
} from "../_shared/internal-security.ts";

declare const Deno: any;

function extractStoragePathFromUrl(url: string | null | undefined) {
  if (!url) return null;
  const [, path] = url.split("projeto-arquivos/");
  if (!path) return null;
  return path.split("?")[0] || null;
}

async function removeStoragePaths(supabaseAdmin: any, paths: string[]) {
  const uniquePaths = [...new Set(paths.filter(Boolean))];

  for (let index = 0; index < uniquePaths.length; index += 100) {
    const chunk = uniquePaths.slice(index, index + 100);
    const { error } = await supabaseAdmin.storage.from("projeto-arquivos").remove(chunk);

    if (error) {
      throw error;
    }
  }
}

async function deleteWhereIn(supabaseAdmin: any, table: string, column: string, ids: string[]) {
  if (!ids.length) return;

  const { error } = await supabaseAdmin.from(table).delete().in(column, ids);

  if (error) {
    throw error;
  }
}

async function deleteWhereEq(supabaseAdmin: any, table: string, column: string, value: string) {
  const { error } = await supabaseAdmin.from(table).delete().eq(column, value);

  if (error) {
    throw error;
  }
}

async function findAuthUserByEmail(supabaseAdmin: any, email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  const users = data?.users || [];
  return users.find((user: any) => user.email?.trim().toLowerCase() === email) || null;
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(origin) });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const auth = await requireInternalAdmin(req, supabaseAdmin, origin);
    if (auth.response) {
      return auth.response;
    }

    const { clientId } = await req.json();
    const normalizedClientId = typeof clientId === "string" ? clientId.trim() : "";

    if (!normalizedClientId) {
      return jsonResponse({ error: "clientId é obrigatório." }, 400, origin);
    }

    const { data: clientRecord, error: clientError } = await supabaseAdmin
      .from("clientes")
      .select("id, nome, nome_empresa, email, auth_user_id")
      .eq("id", normalizedClientId)
      .maybeSingle();

    if (clientError) {
      return jsonResponse({ error: clientError.message }, 500, origin);
    }

    if (!clientRecord) {
      return jsonResponse({ error: "Cliente não encontrado." }, 404, origin);
    }

    const normalizedEmail = clientRecord.email?.trim().toLowerCase() || "";
    const clientDisplayName = clientRecord.nome_empresa?.trim() || clientRecord.nome?.trim() || normalizedEmail || "cliente removido";
    let authUserId = clientRecord.auth_user_id;

    if (!authUserId && normalizedEmail) {
      const authUser = await findAuthUserByEmail(supabaseAdmin, normalizedEmail);
      authUserId = authUser?.id || null;
    }

    const { data: projetosData, error: projetosError } = await supabaseAdmin
      .from("projetos")
      .select("id")
      .eq("cliente_id", normalizedClientId);

    if (projetosError) {
      return jsonResponse({ error: projetosError.message }, 500, origin);
    }

    const projetoIds = (projetosData || []).map((projeto: any) => projeto.id);

    const { data: pedidosData, error: pedidosError } = await supabaseAdmin
      .from("pedidos")
      .select("id")
      .eq("cliente_id", normalizedClientId);

    if (pedidosError) {
      return jsonResponse({ error: pedidosError.message }, 500, origin);
    }

    const pedidoIds = (pedidosData || []).map((pedido: any) => pedido.id);

    const { data: ticketsData, error: ticketsError } = await supabaseAdmin
      .from("tickets")
      .select("id")
      .eq("cliente_id", normalizedClientId);

    if (ticketsError) {
      return jsonResponse({ error: ticketsError.message }, 500, origin);
    }

    const ticketIds = (ticketsData || []).map((ticket: any) => ticket.id);

    const { data: arquivosData, error: arquivosError } = await (supabaseAdmin
      .from("projeto_arquivos" as any) as any)
      .select("url")
      .in("projeto_id", projetoIds.length ? projetoIds : ["00000000-0000-0000-0000-000000000000"]);

    if (arquivosError) {
      return jsonResponse({ error: arquivosError.message }, 500, origin);
    }

    const storagePaths = (arquivosData || [])
      .map((arquivo: any) => extractStoragePathFromUrl(arquivo.url))
      .filter(Boolean) as string[];

    const { data: briefingAttachmentsData, error: briefingAttachmentsError } = await (supabaseAdmin
      .from("briefing_attachments" as any) as any)
      .select("storage_path")
      .eq("cliente_id", normalizedClientId);

    if (briefingAttachmentsError) {
      return jsonResponse({ error: briefingAttachmentsError.message }, 500, origin);
    }

    storagePaths.push(
      ...((briefingAttachmentsData || [])
        .map((attachment: any) => attachment.storage_path)
        .filter(Boolean) as string[]),
    );

    const { data: brandProfileData, error: brandProfileError } = await (supabaseAdmin
      .from("client_brand_profiles" as any) as any)
      .select("logo_storage_path")
      .eq("cliente_id", normalizedClientId)
      .maybeSingle();

    if (brandProfileError) {
      return jsonResponse({ error: brandProfileError.message }, 500, origin);
    }

    if (brandProfileData?.logo_storage_path) {
      storagePaths.push(brandProfileData.logo_storage_path);
    }

    const { data: financeRows, error: financeError } = await supabaseAdmin
      .from("financeiro")
      .select("id, descricao, status")
      .eq("cliente_id", normalizedClientId);

    if (financeError) {
      return jsonResponse({ error: financeError.message }, 500, origin);
    }

    const financialDebts = (financeRows || []).filter((item: any) => ["pendente", "em_atraso"].includes(item.status));

    for (const row of financialDebts) {
      const prefix = `[Cliente removido: ${clientDisplayName}]`;
      const nextDescription = row.descricao?.startsWith(prefix)
        ? row.descricao
        : `${prefix} ${row.descricao}`;

      const { error: preserveFinanceError } = await supabaseAdmin
        .from("financeiro")
        .update({
          cliente_id: null,
          descricao: nextDescription,
        })
        .eq("id", row.id);

      if (preserveFinanceError) {
        return jsonResponse({ error: preserveFinanceError.message }, 500, origin);
      }
    }

    await deleteWhereEq(supabaseAdmin, "recurrent_billing_history", "cliente_id", normalizedClientId);
    await deleteWhereEq(supabaseAdmin, "faturas", "cliente_id", normalizedClientId);
    await deleteWhereEq(supabaseAdmin, "financeiro", "cliente_id", normalizedClientId);
    await deleteWhereEq(supabaseAdmin, "notificacoes", "cliente_id", normalizedClientId);
    await deleteWhereEq(supabaseAdmin, "reunioes", "cliente_id", normalizedClientId);
    await deleteWhereEq(supabaseAdmin, "contratos", "cliente_id", normalizedClientId);
    await deleteWhereEq(supabaseAdmin, "extras_clientes", "cliente_id", normalizedClientId);
    await deleteWhereEq(supabaseAdmin, "cliente_checklist_items", "cliente_id", normalizedClientId);
    await deleteWhereEq(supabaseAdmin, "briefing_attachments", "cliente_id", normalizedClientId);
    await deleteWhereEq(supabaseAdmin, "client_briefings", "cliente_id", normalizedClientId);
    await deleteWhereEq(supabaseAdmin, "client_brand_profiles", "cliente_id", normalizedClientId);

    const { error: pushSubscriptionError } = await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("user_type", "cliente")
      .eq("user_id", normalizedClientId);

    if (pushSubscriptionError) {
      return jsonResponse({ error: pushSubscriptionError.message }, 500, origin);
    }

    if (pedidoIds.length) {
      const { error: comissoesByPedidoError } = await supabaseAdmin
        .from("comissoes")
        .delete()
        .in("pedido_id", pedidoIds);

      if (comissoesByPedidoError) {
        return jsonResponse({ error: comissoesByPedidoError.message }, 500, origin);
      }
    }

    await deleteWhereEq(supabaseAdmin, "comissoes", "cliente_id", normalizedClientId);

    const { error: clientNotesError } = await supabaseAdmin
      .from("internal_notes")
      .delete()
      .eq("entity_type", "cliente")
      .eq("entity_id", normalizedClientId);

    if (clientNotesError) {
      return jsonResponse({ error: clientNotesError.message }, 500, origin);
    }

    if (ticketIds.length) {
      const { error: ticketNotesError } = await supabaseAdmin
        .from("internal_notes")
        .delete()
        .eq("entity_type", "ticket")
        .in("entity_id", ticketIds);

      if (ticketNotesError) {
        return jsonResponse({ error: ticketNotesError.message }, 500, origin);
      }

      await deleteWhereIn(supabaseAdmin, "ticket_support_meta", "ticket_id", ticketIds);
      await deleteWhereIn(supabaseAdmin, "ticket_mensagens", "ticket_id", ticketIds);
      await deleteWhereIn(supabaseAdmin, "tickets", "id", ticketIds);
    }

    await deleteWhereEq(supabaseAdmin, "pedidos", "cliente_id", normalizedClientId);

    if (storagePaths.length) {
      await removeStoragePaths(supabaseAdmin, storagePaths);
    }

    if (projetoIds.length) {
      await deleteWhereIn(supabaseAdmin, "projeto_arquivos", "projeto_id", projetoIds);
      await deleteWhereIn(supabaseAdmin, "projeto_atualizacoes", "projeto_id", projetoIds);
      await deleteWhereIn(supabaseAdmin, "projetos", "id", projetoIds);
    }

    if (authUserId) {
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

      if (deleteUserError && !deleteUserError.message?.toLowerCase().includes("user not found")) {
        return jsonResponse({ error: deleteUserError.message }, 500, origin);
      }
    }

    const { error: deleteClientError } = await supabaseAdmin
      .from("clientes")
      .delete()
      .eq("id", normalizedClientId);

    if (deleteClientError) {
      return jsonResponse({ error: deleteClientError.message }, 500, origin);
    }

    return jsonResponse({
      success: true,
      preservedFinancialDebts: financialDebts.length,
      message:
        financialDebts.length > 0
          ? `Cliente removido. ${financialDebts.length} lançamento(s) em aberto foram preservados no financeiro.`
          : "Cliente e todos os dados relacionados foram removidos com sucesso.",
    }, 200, origin);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500, origin);
  }
});
