// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Não autorizado" }, 401);
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const {
      data: { user: actor },
      error: actorError,
    } = await supabaseAdmin.auth.getUser(token);

    if (actorError || !actor?.email) {
      return jsonResponse({ error: "Sessão inválida" }, 401);
    }

    const actorEmail = actor.email.trim().toLowerCase();
    const { data: actorProfile, error: actorProfileError } = await supabaseAdmin
      .from("usuarios")
      .select("email, acesso, status, bloqueado")
      .ilike("email", actorEmail)
      .maybeSingle();

    if (actorProfileError) {
      return jsonResponse({ error: actorProfileError.message }, 500);
    }

    if (!actorProfile || actorProfile.status !== "ativo" || actorProfile.bloqueado) {
      return jsonResponse({ error: "Somente usuários internos ativos podem excluir clientes." }, 403);
    }

    const { clientId } = await req.json();
    const normalizedClientId = typeof clientId === "string" ? clientId.trim() : "";

    if (!normalizedClientId) {
      return jsonResponse({ error: "clientId é obrigatório." }, 400);
    }

    const { data: clientRecord, error: clientError } = await supabaseAdmin
      .from("clientes")
      .select("id, email, auth_user_id")
      .eq("id", normalizedClientId)
      .maybeSingle();

    if (clientError) {
      return jsonResponse({ error: clientError.message }, 500);
    }

    if (!clientRecord) {
      return jsonResponse({ error: "Cliente não encontrado." }, 404);
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
        return jsonResponse({ error: deleteUserError.message }, 500);
      }
    }

    const { error: deleteClientError } = await supabaseAdmin
      .from("clientes")
      .delete()
      .eq("id", normalizedClientId);

    if (deleteClientError) {
      return jsonResponse({ error: deleteClientError.message }, 500);
    }

    return jsonResponse({ success: true, message: "Cliente e acesso removidos com sucesso." });
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
});
