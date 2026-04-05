// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
      return jsonResponse({ error: "Somente usuários internos ativos podem provisionar contas." }, 403);
    }

    const { email, password, nome, tipo } = await req.json();
    const accountType = typeof tipo === "string" ? tipo.trim().toLowerCase() : "cliente";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedName = typeof nome === "string" ? nome.trim() : "";

    if (!normalizedEmail || !password || !normalizedName) {
      return jsonResponse({ error: "Email, senha e nome são obrigatórios" }, 400);
    }

    if (String(password).length < 6) {
      return jsonResponse({ error: "A senha precisa ter pelo menos 6 caracteres." }, 400);
    }

    if (accountType === "admin" && String(actorProfile.acesso || "").trim().toLowerCase() !== "admin") {
      return jsonResponse({ error: "Somente administradores podem criar novos admins." }, 403);
    }

    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        nome: normalizedName,
        tipo: accountType,
        provisioned_by: actorEmail,
      },
    });

    if (createError) {
      const message = createError.message?.includes("already been registered")
        ? "Já existe uma conta cadastrada com este e-mail."
        : createError.message;
      return jsonResponse({ error: message }, 400);
    }

    return jsonResponse({ user: userData.user, message: "Conta criada com sucesso" });
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
});
