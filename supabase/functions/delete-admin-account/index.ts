// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createAdminClient,
  errorResponse,
  getCorsHeaders,
  jsonResponse,
  requireInternalAdmin,
} from "../_shared/internal-security.ts";

declare const Deno: any;

const OWNER_EMAIL = "novaesweb@gmail.com";

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

    const actorEmail = auth.actorEmail!;
    const actorProfile = auth.actorProfile!;

    if (String(actorProfile.acesso || "").trim().toLowerCase() !== "admin") {
      return errorResponse("INTERNAL_USER_FORBIDDEN", "Somente administradores podem excluir usuários internos.", 403, origin);
    }

    const { userId } = await req.json();
    const normalizedUserId = typeof userId === "string" ? userId.trim() : "";

    if (!normalizedUserId) {
      return jsonResponse({ error: "userId é obrigatório." }, 400, origin);
    }

    const { data: userRecord, error: userError } = await supabaseAdmin
      .from("usuarios")
      .select("id, nome, email, acesso")
      .eq("id", normalizedUserId)
      .maybeSingle();

    if (userError) {
      return jsonResponse({ error: userError.message }, 500, origin);
    }

    if (!userRecord) {
      return jsonResponse({ error: "Usuário não encontrado." }, 404, origin);
    }

    const normalizedEmail = userRecord.email?.trim().toLowerCase() || "";
    const normalizedRole = String(userRecord.acesso || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return jsonResponse({ error: "O usuário não possui e-mail válido para exclusão." }, 400, origin);
    }

    if (normalizedEmail === actorEmail) {
      return errorResponse("ADMIN_SELF_DELETE_FORBIDDEN", "Você não pode excluir o próprio acesso por aqui.", 403, origin);
    }

    if (normalizedEmail === OWNER_EMAIL) {
      return errorResponse("ADMIN_OWNER_DELETE_FORBIDDEN", "O administrador principal da NovaesWeb não pode ser excluído por esta ação.", 403, origin);
    }

    if (normalizedRole === "admin") {
      const { count, error: countError } = await supabaseAdmin
        .from("usuarios")
        .select("id", { count: "exact", head: true })
        .ilike("acesso", "admin");

      if (countError) {
        return jsonResponse({ error: countError.message }, 500, origin);
      }

      if ((count || 0) <= 1) {
        return errorResponse("LAST_ADMIN_DELETE_FORBIDDEN", "Não é possível excluir o último administrador da base.", 403, origin);
      }
    }

    const authUser = await findAuthUserByEmail(supabaseAdmin, normalizedEmail);
    const authUserId = authUser?.id || null;

    if (authUserId) {
      const { error: pushSubscriptionError } = await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .eq("user_type", "admin")
        .eq("user_id", authUserId);

      if (pushSubscriptionError) {
        return jsonResponse({ error: pushSubscriptionError.message }, 500, origin);
      }

      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

      if (deleteUserError && !deleteUserError.message?.toLowerCase().includes("user not found")) {
        return jsonResponse({ error: deleteUserError.message }, 500, origin);
      }
    }

    const { error: deleteUserRowError } = await supabaseAdmin
      .from("usuarios")
      .delete()
      .eq("id", normalizedUserId);

    if (deleteUserRowError) {
      return jsonResponse({ error: deleteUserRowError.message }, 500, origin);
    }

    return jsonResponse(
      {
        success: true,
        message: `Usuário ${userRecord.nome || normalizedEmail} removido com sucesso.`,
      },
      200,
      origin,
    );
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500, origin);
  }
});
