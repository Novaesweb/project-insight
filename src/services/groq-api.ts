import { invokeAdminFunction } from "@/lib/admin-function-client";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const CLIENT_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const REQUEST_TIMEOUT_MS = 25_000;
const DEFAULT_AI_ERROR_MESSAGE = "Nao foi possivel gerar a sugestao da IA agora.";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  messages: GroqMessage[];
}

type ContractAiSuggestionResponse = {
  suggestion?: string;
};

function buildAbortSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => window.clearTimeout(timeout),
  };
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      return payload?.error?.message || payload?.message || "Falha na comunicacao com a IA.";
    }

    const text = await response.text();
    return text.trim() || "Falha na comunicacao com a IA.";
  } catch {
    return "Falha na comunicacao com a IA.";
  }
}

function hasClientApiKey() {
  const key = CLIENT_API_KEY.trim();
  const isValid = key.length > 10 && key.startsWith("gsk_");
  
  if (!isValid) {
    console.warn(
      "[Groq-Config] Chave VITE_GROQ_API_KEY nao encontrada ou invalida no frontend. " +
      "Certifique-se de que o arquivo .env existe, a chave comeca com 'gsk_' e voce REINICIOU o servidor (npm run dev)."
    );
  }
  return isValid;
}

function normalizeError(error: unknown, fallbackMessage = DEFAULT_AI_ERROR_MESSAGE) {
  console.error("[Groq-Error] Detalhes do erro:", error);
  
  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch")) return new Error("Erro de rede: Verifique sua conexao ou se o dominio da Groq esta bloqueado.");
    if (error.message.includes("401")) return new Error("Chave da IA invalida ou expirada.");
    if (error.message.includes("429")) return new Error("Limite de requisicoes da IA atingido. Aguarde um momento.");
    return error;
  }

  return new Error(fallbackMessage);
}

async function getDirectChatCompletion({
  model = "llama-3.3-70b-versatile",
  temperature = 0.7,
  max_tokens = 1024,
  messages,
}: GroqCompletionOptions) {
  if (!hasClientApiKey()) {
    throw new Error("Chave VITE_GROQ_API_KEY ausente no frontend.");
  }

  const { signal, cleanup } = buildAbortSignal(REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLIENT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
      signal,
    });

    if (!response.ok) {
      const errorMsg = await readErrorMessage(response);
      throw new Error(`Erro API Groq (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    const suggestion = data?.choices?.[0]?.message?.content?.trim();

    if (!suggestion) {
      throw new Error("A IA respondeu, mas nao retornou texto.");
    }

    return suggestion;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("A IA demorou demais para responder (Timeout).");
    }
    throw error;
  } finally {
    cleanup();
  }
}

async function getServerContractSuggestion(context: string, instruction: string, currentText: string) {
  try {
    const response = await invokeAdminFunction<ContractAiSuggestionResponse>("contract-ai-assistant", {
      body: { context, instruction, currentText },
      returnTo: "/admin/contratos",
      source: "contracts-ai-assistant",
      fallbackMessage: "Falha na comunicacao com a Edge Function do Supabase.",
    });

    return response?.suggestion?.trim() || null;
  } catch (error: any) {
    throw new Error(`Erro na Edge Function: ${error.message || "Servidor indisponivel"}`);
  }
}

export const groqService = {
  async getChatCompletion(options: GroqCompletionOptions) {
    return getDirectChatCompletion(options);
  },

  async helpWithContractField(context: string, instruction: string, currentText: string = "") {
    const systemPrompt = `Voce e um assistente juridico especializado em contratos da NovaesWeb.
Ajude a redigir o campo: ${context}.
Texto atual: ${currentText || "(vazio)"}`;

    const messages: GroqMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: instruction },
    ];

    // Fluxo de execucao prioritario
    if (hasClientApiKey()) {
      try {
        console.log("[Groq] Tentando chamada direta...");
        return await getDirectChatCompletion({ messages });
      } catch (clientError) {
        console.warn("[Groq] Chamada direta falhou, tentando servidor...", clientError);
      }
    }

    try {
      const serverSuggestion = await getServerContractSuggestion(context, instruction, currentText);
      if (serverSuggestion) return serverSuggestion;
      throw new Error("Servidor retornou resposta vazia.");
    } catch (serverError) {
      throw normalizeError(serverError);
    }
  },
};
