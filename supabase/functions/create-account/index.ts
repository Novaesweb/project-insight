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

    const { email, password, nome, tipo } = await req.json();
    const accountType = typeof tipo === "string" ? tipo.trim().toLowerCase() : "cliente";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedName = typeof nome === "string" ? nome.trim() : "";

    if (!normalizedEmail || !password || !normalizedName) {
      return jsonResponse({ error: "Email, senha e nome são obrigatórios" }, 400, origin);
    }

    if (String(password).length < 6) {
      return jsonResponse({ error: "A senha precisa ter pelo menos 6 caracteres." }, 400, origin);
    }

    if (accountType === "admin" && String(actorProfile.acesso || "").trim().toLowerCase() !== "admin") {
      return errorResponse("INTERNAL_USER_FORBIDDEN", "Somente administradores podem criar novos admins.", 403, origin);
    }

    let { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        nome: normalizedName,
        tipo: accountType,
        provisioned_by: actorEmail,
      },
    });

    if (
      createError?.message?.toLowerCase().includes("already") &&
      accountType === "cliente"
    ) {
      const existingAuthUser = await findAuthUserByEmail(supabaseAdmin, normalizedEmail);

      const [{ data: linkedClient }, { data: linkedAdmin }] = await Promise.all([
        supabaseAdmin
          .from("clientes")
          .select("id")
          .ilike("email", normalizedEmail)
          .limit(1)
          .maybeSingle(),
        supabaseAdmin
          .from("usuarios")
          .select("id")
          .ilike("email", normalizedEmail)
          .limit(1)
          .maybeSingle(),
      ]);

      if (existingAuthUser && !linkedClient && !linkedAdmin) {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);

        if (deleteError) {
          return jsonResponse({ error: deleteError.message }, 400, origin);
        }

        const retried = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password,
          email_confirm: true,
          user_metadata: {
            nome: normalizedName,
            tipo: accountType,
            provisioned_by: actorEmail,
          },
        });

        userData = retried.data;
        createError = retried.error;
      }
    }

    if (createError) {
      const message = createError.message?.includes("already been registered")
        ? "Já existe uma conta cadastrada com este e-mail."
        : createError.message;
      return jsonResponse({ error: message }, 400, origin);
    }

    return jsonResponse({ user: userData.user, message: "Conta criada com sucesso" }, 200, origin);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500, origin);
  }
});
