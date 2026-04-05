// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createAdminClient,
  getCorsHeaders,
  jsonResponse,
  requireInternalAdmin,
} from "../_shared/internal-security.ts";

declare const Deno: any;

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "DELETE"]);

function normalizePath(value: unknown) {
  const raw = String(value || "").trim().replace(/^\/+/, "");
  if (!raw || raw.includes("://") || raw.includes("..")) return null;
  return raw;
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const auth = await requireInternalAdmin(req, supabaseAdmin, origin);
    if (auth.response) {
      return auth.response;
    }

    const { path, method, body } = await req.json();
    const normalizedPath = normalizePath(path);
    const normalizedMethod = String(method || "GET").toUpperCase();

    if (!normalizedPath || !ALLOWED_METHODS.has(normalizedMethod)) {
      return jsonResponse({ error: "Requisição inválida." }, 400, origin);
    }

    const apiKey = Deno.env.get("ASAAS_API_KEY");
    const environment = Deno.env.get("ASAAS_ENVIRONMENT") || "sandbox";

    if (!apiKey) {
      return jsonResponse({ error: "Integração indisponível." }, 503, origin);
    }

    const baseUrl =
      environment === "production"
        ? "https://api.asaas.com/v3"
        : "https://sandbox.asaas.com/api/v3";

    const response = await fetch(`${baseUrl}/${normalizedPath}`, {
      method: normalizedMethod,
      headers: {
        "Content-Type": "application/json",
        access_token: apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return jsonResponse(
        {
          error: `Falha ao comunicar com o Asaas (${response.status}).`,
          details: errorText || undefined,
        },
        response.status,
        origin,
      );
    }

    const data = await response.json();
    return jsonResponse(data, 200, origin);
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Falha inesperada na ponte do Asaas." },
      500,
      origin,
    );
  }
});
