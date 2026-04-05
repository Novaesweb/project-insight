// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/internal-security.ts";

declare const Deno: any;

function jsonResponse(body: Record<string, unknown>, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
  });
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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Não autorizado" }, 401, origin);
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const {
      data: { user: actor },
      error: actorError,
    } = await supabaseAdmin.auth.getUser(token);

    if (actorError || !actor?.email) {
      return jsonResponse({ error: "Sessão inválida" }, 401, origin);
    }

    const actorEmail = actor.email.trim().toLowerCase();
    const { data: actorProfile, error: actorProfileError } = await supabaseAdmin
      .from("usuarios")
      .select("email, acesso, status, bloqueado")
      .ilike("email", actorEmail)
      .maybeSingle();

    if (actorProfileError) {
      return jsonResponse({ error: actorProfileError.message }, 500, origin);
    }

    if (!actorProfile || actorProfile.status !== "ativo" || actorProfile.bloqueado) {
      return jsonResponse({ error: "Somente usuários internos ativos podem excluir clientes." }, 403, origin);
    }

    const { clientId } = await req.json();
    const normalizedClientId = typeof clientId === "string" ? clientId.trim() : "";

    if (!normalizedClientId) {
      return jsonResponse({ error: "clientId é obrigatório." }, 400, origin);
    }

    const { data: clientRecord, error: clientError } = await supabaseAdmin
      .from("clientes")
      .select("id, email, auth_user_id")
      .eq("id", normalizedClientId)
      .maybeSingle();

    if (clientError) {
      return jsonResponse({ error: clientError.message }, 500, origin);
    }

    if (!clientRecord) {
      return jsonResponse({ error: "Cliente não encontrado." }, 404, origin);
    }

    const normalizedEmail = clientRecord.email?.trim().toLowerCase() || "";
    let authUserId = clientRecord.auth_user_id;

    if (!authUserId && normalizedEmail) {
      const authUser = await findAuthUserByEmail(supabaseAdmin, normalizedEmail);
      authUserId = authUser?.id || null;
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

    return jsonResponse({ success: true, message: "Cliente e acesso removidos com sucesso." }, 200, origin);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500, origin);
  }
});
