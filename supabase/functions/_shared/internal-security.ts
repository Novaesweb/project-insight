import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const SITE_URL = Deno.env.get("SITE_URL") || "https://novaesweb.site";

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;

  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();

    return (
      host === "novaesweb.site" ||
      host === "www.novaesweb.site" ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

export function getCorsHeaders(origin: string | null, methods = "POST, OPTIONS") {
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin || SITE_URL : SITE_URL,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-internal-cron-secret, x-healthcheck-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": methods,
  };
}

export function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  origin: string | null,
  extraHeaders?: Record<string, string>,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export function createAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export async function requireInternalAdmin(
  req: Request,
  supabaseAdmin: ReturnType<typeof createClient>,
  origin: string | null,
) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      response: jsonResponse({ error: "Não autorizado." }, 401, origin),
      actorEmail: null,
      actorProfile: null,
    };
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const {
    data: { user: actor },
    error: actorError,
  } = await supabaseAdmin.auth.getUser(token);

  if (actorError || !actor?.email) {
    return {
      response: jsonResponse({ error: "Sessão inválida." }, 401, origin),
      actorEmail: null,
      actorProfile: null,
    };
  }

  const actorEmail = actor.email.trim().toLowerCase();
  const { data: actorProfile, error: profileError } = await supabaseAdmin
    .from("usuarios")
    .select("email, acesso, status, bloqueado")
    .ilike("email", actorEmail)
    .maybeSingle();

  if (profileError) {
    return {
      response: jsonResponse({ error: "Falha ao validar o usuário interno." }, 500, origin),
      actorEmail,
      actorProfile: null,
    };
  }

  if (!actorProfile || actorProfile.status !== "ativo" || actorProfile.bloqueado) {
    return {
      response: jsonResponse({ error: "Acesso interno não autorizado." }, 403, origin),
      actorEmail,
      actorProfile: null,
    };
  }

  return {
    response: null,
    actorEmail,
    actorProfile,
  };
}

export function hasInternalCronSecret(req: Request, envKey = "INTERNAL_CRON_SECRET") {
  const expected = Deno.env.get(envKey);
  const provided = req.headers.get("x-internal-cron-secret")?.trim();

  if (!expected || !provided) return false;
  return provided === expected;
}
