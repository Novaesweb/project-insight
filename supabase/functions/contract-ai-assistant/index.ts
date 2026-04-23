// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import {
  createAdminClient,
  getCorsHeaders,
  jsonResponse,
  requireInternalAdmin,
} from "../_shared/internal-security.ts";

declare const Deno: any;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

function sanitizeText(value: unknown, maxLength = 4000) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
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

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return jsonResponse(
        {
          code: "GROQ_API_KEY_MISSING",
          message: "A chave da IA nao esta configurada no backend.",
        },
        500,
        origin,
      );
    }

    const body = await req.json();
    const context = sanitizeText(body?.context, 200);
    const instruction = sanitizeText(body?.instruction, 2000);
    const currentText = sanitizeText(body?.currentText, 6000);

    if (!context || !instruction) {
      return jsonResponse(
        {
          code: "INVALID_AI_INPUT",
          message: "Contexto e instrucao sao obrigatorios para gerar a sugestao.",
        },
        400,
        origin,
      );
    }

    const systemPrompt = `Voce e um assistente juridico especializado em contratos de servicos digitais da NovaesWeb.
Sua tarefa e ajudar a redigir ou ajustar partes de um contrato (clausulas, escopo, observacoes).
Seja profissional, direto e utilize uma linguagem juridica moderna e clara.
Contexto do campo: ${context}
Texto atual (se houver): ${currentText}`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.4,
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: instruction },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return jsonResponse(
        {
          code: "GROQ_REQUEST_FAILED",
          message: errorText || "Falha ao consultar a IA.",
        },
        response.status,
        origin,
      );
    }

    const payload = await response.json();
    const suggestion = sanitizeText(payload?.choices?.[0]?.message?.content, 12000);

    if (!suggestion) {
      return jsonResponse(
        {
          code: "EMPTY_AI_SUGGESTION",
          message: "A IA nao retornou nenhuma sugestao para este campo.",
        },
        502,
        origin,
      );
    }

    return jsonResponse({ suggestion }, 200, origin);
  } catch (error: any) {
    return jsonResponse(
      {
        code: "CONTRACT_AI_ASSISTANT_FAILED",
        message: error?.message || "Falha inesperada ao gerar a sugestao.",
      },
      500,
      origin,
    );
  }
});
